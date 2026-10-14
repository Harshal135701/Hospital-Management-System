
const repo = require("./appointment.repository");
const ApiError = require("../../utils/ApiError");
const notificationService = require("../notifications/notification.service");

const calculateEndTime = (startTime, durationMinutes = 15) => {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;

  if (total >= 1440) {
    throw ApiError.badRequest("Appointment time exceeds 24:00 boundary");
  }

  const endH = String(Math.floor(total / 60)).padStart(2, "0");
  const endM = String(total % 60).padStart(2, "0");

  return `${endH}:${endM}`;
};

const getTodayDateStr = () => {
  return new Date().toISOString().slice(0, 10);
};

// Notification errors must never undo a successfully saved appointment.
const scheduleNotificationsSafely = async (callback) => {
  try {
    await callback();
  } catch (error) {
    console.error(
      "Appointment saved, but notification scheduling failed:",
      error.message
    );
  }
};

// ======================================================
// 1. CREATE APPOINTMENT
// ======================================================

const createAppointment = async (data) => {
  const today = getTodayDateStr();

  if (data.appointmentDate < today) {
    throw ApiError.badRequest("Appointment date cannot be in the past");
  }

  // Verify patient.
  const patient = await repo.findPatientById(data.patientId);

  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  // Verify doctor.
  const doctor = await repo.findDoctorById(data.doctorId);

  if (!doctor) {
    throw ApiError.notFound("Doctor not found or currently inactive");
  }

  // Verify department.
  const department = await repo.findDepartmentById(data.departmentId);

  if (!department) {
    throw ApiError.notFound("Department not found or currently inactive");
  }

  if (String(doctor.department_id) !== String(data.departmentId)) {
    throw ApiError.badRequest(
      "Doctor does not belong to the selected department"
    );
  }

  // Check approved doctor leave.
  const leave = await repo.isDoctorOnLeave(
    data.doctorId,
    data.appointmentDate
  );

  if (leave) {
    const startDate =
      typeof leave.start_date === "string"
        ? leave.start_date
        : leave.start_date.toISOString().slice(0, 10);

    const endDate =
      typeof leave.end_date === "string"
        ? leave.end_date
        : leave.end_date.toISOString().slice(0, 10);

    throw ApiError.badRequest(
      `Doctor is on approved leave from ${startDate} to ${endDate}. Reason: ${
        leave.reason || "Personal"
      }`
    );
  }

  const endTime = calculateEndTime(data.startTime, 15);

  // Find a matching published roster and room.
  const publishedRosters = await repo.getPublishedRoster(
    data.doctorId,
    data.appointmentDate
  );

  let matchedRosterId = null;
  let assignedRoomId = data.roomId || doctor.room_id || null;

  if (publishedRosters.length > 0) {
    const shift = publishedRosters.find(
      (roster) =>
        data.startTime >= String(roster.start_time).slice(0, 5) &&
        endTime <= String(roster.end_time).slice(0, 5)
    );

    if (shift) {
      matchedRosterId = shift.id;

      if (!assignedRoomId && shift.room_id) {
        assignedRoomId = shift.room_id;
      }
    } else {
      throw ApiError.badRequest(
        "Requested time is outside the doctor's published roster"
      );
    }
  }

  // Verify the room if one has been assigned.
  if (assignedRoomId) {
    const room = await repo.findRoomById(assignedRoomId);

    if (!room) {
      assignedRoomId = null;
    }
  }

  // Save the appointment within a transaction.
  const client = await repo.pool.connect();

  let transactionStarted = false;
  let created;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const slotTaken = await repo.isSlotBooked(
      data.doctorId,
      data.appointmentDate,
      data.startTime,
      endTime,
      null,
      client
    );

    if (slotTaken) {
      throw ApiError.conflict(
        "The requested appointment slot is already booked"
      );
    }

    const tokenNumber = await repo.getNextTokenNumber(
      data.doctorId,
      data.appointmentDate,
      client
    );

    created = await repo.createAppointmentWithClient(
      {
        ...data,
        endTime,
        tokenNumber,
        rosterId: matchedRosterId,
        roomId: assignedRoomId,
      },
      client
    );

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Appointment transaction rollback failed:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    client.release();
  }

  // Schedule notifications only after the appointment is committed.
  await scheduleNotificationsSafely(async () => {
    await notificationService.scheduleEvent(
      created.id,
      "booking_confirmation",
      ["sms"]
    );

    await notificationService.scheduleAppointmentReminders(created.id);
  });

  return created;
};

// ======================================================
// 2. RESCHEDULE APPOINTMENT
// ======================================================

const rescheduleAppointment = async (id, data) => {
  const existing = await repo.findAppointmentById(id);

  if (!existing) {
    throw ApiError.notFound("Appointment not found");
  }

  if (existing.status !== "booked") {
    throw ApiError.badRequest(
      `Cannot reschedule appointment with status '${existing.status}'. Only 'booked' appointments can be rescheduled.`
    );
  }

  const today = getTodayDateStr();

  if (data.appointmentDate < today) {
    throw ApiError.badRequest(
      "New appointment date cannot be in the past"
    );
  }

  // Check approved leave on the new date.
  const leave = await repo.isDoctorOnLeave(
    existing.doctor_id,
    data.appointmentDate
  );

  if (leave) {
    throw ApiError.badRequest(
      `Doctor is on approved leave on ${data.appointmentDate}. Reason: ${
        leave.reason || "Personal"
      }`
    );
  }

  const endTime = calculateEndTime(data.startTime, 15);

  // Find a matching roster and room for the new date.
  const publishedRosters = await repo.getPublishedRoster(
    existing.doctor_id,
    data.appointmentDate
  );

  let matchedRosterId = null;
  let assignedRoomId = data.roomId || existing.room_id || null;

  if (publishedRosters.length > 0) {
    const shift = publishedRosters.find(
      (roster) =>
        data.startTime >= String(roster.start_time).slice(0, 5) &&
        endTime <= String(roster.end_time).slice(0, 5)
    );

    if (shift) {
      matchedRosterId = shift.id;

      if (!assignedRoomId && shift.room_id) {
        assignedRoomId = shift.room_id;
      }
    } else {
      throw ApiError.badRequest(
        "Requested time is outside the doctor's published roster"
      );
    }
  }

  if (assignedRoomId) {
    const room = await repo.findRoomById(assignedRoomId);

    if (!room) {
      assignedRoomId = null;
    }
  }

  const client = await repo.pool.connect();

  let transactionStarted = false;
  let updated;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const slotTaken = await repo.isSlotBooked(
      existing.doctor_id,
      data.appointmentDate,
      data.startTime,
      endTime,
      id,
      client
    );

    if (slotTaken) {
      throw ApiError.conflict(
        "Requested new appointment slot is already booked"
      );
    }

    const tokenNumber = await repo.getNextTokenNumber(
      existing.doctor_id,
      data.appointmentDate,
      client
    );

    updated = await repo.rescheduleAppointmentWithClient(
      id,
      {
        ...data,
        endTime,
        tokenNumber,
        roomId: assignedRoomId,
        rosterId: matchedRosterId,
      },
      client
    );

    if (!updated) {
      throw ApiError.notFound(
        "Appointment could not be rescheduled"
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Reschedule transaction rollback failed:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    client.release();
  }

  // Cancel old reminders and create notifications for the new schedule.
  await scheduleNotificationsSafely(async () => {
    await notificationService.cancelPendingForAppointment(id);

    await notificationService.scheduleEvent(
      id,
      "rescheduled",
      ["sms"]
    );

    await notificationService.scheduleAppointmentReminders(id);
  });

  return updated;
};

// ======================================================
// 3. CANCEL APPOINTMENT
// ======================================================

const cancelAppointment = async (id, reason) => {
  const existing = await repo.findAppointmentById(id);

  if (!existing) {
    throw ApiError.notFound("Appointment not found");
  }

  if (["completed", "cancelled", "no_show"].includes(existing.status)) {
    throw ApiError.badRequest(
      `Cannot cancel appointment that is already '${existing.status}'`
    );
  }

  const cancelled = await repo.cancelAppointment(id, reason);

  if (!cancelled) {
    throw ApiError.badRequest(
      "Appointment could not be cancelled"
    );
  }

  await scheduleNotificationsSafely(async () => {
    await notificationService.cancelPendingForAppointment(id);

    await notificationService.scheduleEvent(
      id,
      "cancellation",
      ["sms"]
    );
  });

  return cancelled;
};

// ======================================================
// 4. GET AVAILABLE SLOTS
// ======================================================

const getAvailableSlots = async (doctorId, date, duration = 15) => {
  if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) {
    throw ApiError.badRequest("Duration must be a positive number of minutes");
  }

  const doctor = await repo.findDoctorById(doctorId);

  if (!doctor) {
    throw ApiError.notFound("Doctor not found or currently inactive");
  }

  // Check doctor leave.
  const leave = await repo.isDoctorOnLeave(doctorId, date);

  if (leave) {
    return {
      doctorId,
      doctorName: doctor.full_name,
      date,
      onLeave: true,
      leaveReason: leave.reason || "On Leave",
      totalSlots: 0,
      availableSlots: 0,
      slots: [],
    };
  }

  // Use published rosters or fall back to recurring schedules.
  let workingWindows = [];

  const publishedRosters = await repo.getPublishedRoster(doctorId, date);

  if (publishedRosters.length > 0) {
    workingWindows = publishedRosters.map((roster) => ({
      shiftType: roster.shift_type,
      startTime: String(roster.start_time).slice(0, 5),
      endTime: String(roster.end_time).slice(0, 5),
      roomId: roster.room_id,
    }));
  } else {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
    const schedules = await repo.getRecurringSchedule(
      doctorId,
      dayOfWeek
    );

    if (schedules.length > 0) {
      workingWindows = schedules.map((schedule) => ({
        shiftType: schedule.shift_type,
        startTime: String(schedule.start_time).slice(0, 5),
        endTime: String(schedule.end_time).slice(0, 5),
        roomId: schedule.room_id,
      }));
    } else {
      workingWindows = [
        {
          shiftType: "morning",
          startTime: "09:00",
          endTime: "13:00",
        },
        {
          shiftType: "evening",
          startTime: "14:00",
          endTime: "17:00",
        },
      ];
    }
  }

  // Retrieve existing bookings.
  const existingBookings = await repo.getAppointmentsForDoctor(
    doctorId,
    date
  );

  const slots = [];
  let availableCount = 0;

  // Generate slots and mark conflicts.
  for (const window of workingWindows) {
    const [startHour, startMinute] = window.startTime.split(":").map(Number);
    const [endHour, endMinute] = window.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (
      let minutes = startMinutes;
      minutes + duration <= endMinutes;
      minutes += duration
    ) {
      const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
      const minute = String(minutes % 60).padStart(2, "0");
      const slotStart = `${hour}:${minute}`;
      const slotEnd = calculateEndTime(slotStart, duration);

      const conflict = existingBookings.some((booking) => {
        const bookingStart = String(booking.start_time).slice(0, 5);
        const bookingEnd = String(booking.end_time).slice(0, 5);

        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      const available = !conflict;

      if (available) {
        availableCount++;
      }

      slots.push({
        shiftType: window.shiftType,
        startTime: slotStart,
        endTime: slotEnd,
        available,
      });
    }
  }

  return {
    doctorId,
    doctorName: doctor.full_name,
    date,
    onLeave: false,
    totalSlots: slots.length,
    availableSlots: availableCount,
    bookedSlots: slots.length - availableCount,
    slots,
  };
};

// ======================================================
// 5. GET APPOINTMENT BY ID
// ======================================================

const getAppointmentById = async (id) => {
  const appointment = await repo.findAppointmentById(id);

  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }

  return appointment;
};

// ======================================================
// 6. LIST APPOINTMENTS
// ======================================================

const listAppointments = async (filters) => {
  return repo.listAppointments(filters);
};

// ======================================================
// 7. GET PATIENT APPOINTMENT HISTORY
// ======================================================

const getPatientHistory = async (patientId) => {
  const patient = await repo.findPatientById(patientId);

  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  return repo.getPatientHistory(patientId);
};

module.exports = {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentById,
  listAppointments,
  getPatientHistory,
};
