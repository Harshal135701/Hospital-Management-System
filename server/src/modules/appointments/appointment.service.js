const repo = require("./appointment.repository");
const ApiError = require("../../utils/ApiError");

const calculateEndTime = (startTime, durationMinutes = 15) => {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  if (total > 1440) {
    throw ApiError.badRequest("Appointment time exceeds 24:00 boundary");
  }
  const endH = String(Math.floor(total / 60)).padStart(2, "0");
  const endM = String(total % 60).padStart(2, "0");
  return `${endH}:${endM}`;
};

const getTodayDateStr = () => {
  return new Date().toISOString().slice(0, 10);
};

const createAppointment = async (data) => {
  const today = getTodayDateStr();
  if (data.appointmentDate < today) {
    throw ApiError.badRequest("Appointment date cannot be in the past");
  }

  // 1. Verify Patient
  const patient = await repo.findPatientById(data.patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  // 2. Verify Doctor
  const doctor = await repo.findDoctorById(data.doctorId);
  if (!doctor) {
    throw ApiError.notFound("Doctor not found or currently inactive");
  }

  // 3. Verify Department
  const department = await repo.findDepartmentById(data.departmentId);
  if (!department) {
    throw ApiError.notFound("Department not found or currently inactive");
  }

  if (doctor.department_id !== data.departmentId) {
    throw ApiError.badRequest("Doctor does not belong to the selected department");
  }

  // 4. Check Doctor Approved Leave
  const leave = await repo.isDoctorOnLeave(data.doctorId, data.appointmentDate);
  if (leave) {
    const sDate = typeof leave.start_date === "string" ? leave.start_date : leave.start_date.toISOString().slice(0, 10);
    const eDate = typeof leave.end_date === "string" ? leave.end_date : leave.end_date.toISOString().slice(0, 10);
    throw ApiError.badRequest(
      `Doctor is on approved leave from ${sDate} to ${eDate}. Reason: ${leave.reason || "Personal"}`
    );
  }

  // 5. Calculate slot end time
  const endTime = calculateEndTime(data.startTime, 15);

  // 6. Check Published Roster or Fallback Schedule for shift match & room
  const publishedRosters = await repo.getPublishedRoster(data.doctorId, data.appointmentDate);
  let matchedRosterId = null;
  let assignedRoomId = data.roomId || doctor.room_id || null;

  if (publishedRosters.length > 0) {
    const shift = publishedRosters.find(
      (r) => data.startTime >= r.start_time.slice(0, 5) && endTime <= r.end_time.slice(0, 5)
    );
    if (shift) {
      matchedRosterId = shift.id;
      if (!assignedRoomId && shift.room_id) {
        assignedRoomId = shift.room_id;
      }
    }
  }

  // 7. Verify Room if provided
  if (assignedRoomId) {
    const room = await repo.findRoomById(assignedRoomId);
    if (!room) {
      assignedRoomId = null;
    }
  }

  // 8. Execute booking atomically in a transaction to prevent race conditions
  const client = await repo.pool.connect();
  try {
    await client.query("BEGIN");

    // Check slot collision inside transaction
    const slotTaken = await repo.isSlotBooked(
      data.doctorId,
      data.appointmentDate,
      data.startTime,
      endTime,
      null,
      client
    );
    if (slotTaken) {
      throw ApiError.conflict("The requested appointment slot is already booked");
    }

    // Get sequential token number safely
    const tokenNumber = await repo.getNextTokenNumber(
      data.doctorId,
      data.appointmentDate,
      client
    );

    const created = await repo.createAppointmentWithClient(
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

    // Return detailed representation
    return await repo.findAppointmentById(created.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

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
    throw ApiError.badRequest("New appointment date cannot be in the past");
  }

  // Check Doctor Leave on new date
  const leave = await repo.isDoctorOnLeave(existing.doctor_id, data.appointmentDate);
  if (leave) {
    throw ApiError.badRequest(
      `Doctor is on approved leave on ${data.appointmentDate}. Reason: ${leave.reason || "Personal"}`
    );
  }

  const endTime = calculateEndTime(data.startTime, 15);

  // Check published roster for new date
  const publishedRosters = await repo.getPublishedRoster(existing.doctor_id, data.appointmentDate);
  let matchedRosterId = null;
  let assignedRoomId = data.roomId || existing.room_id || null;

  if (publishedRosters.length > 0) {
    const shift = publishedRosters.find(
      (r) => data.startTime >= r.start_time.slice(0, 5) && endTime <= r.end_time.slice(0, 5)
    );
    if (shift) {
      matchedRosterId = shift.id;
      if (!assignedRoomId && shift.room_id) {
        assignedRoomId = shift.room_id;
      }
    }
  }

  const client = await repo.pool.connect();
  try {
    await client.query("BEGIN");

    const slotTaken = await repo.isSlotBooked(
      existing.doctor_id,
      data.appointmentDate,
      data.startTime,
      endTime,
      id,
      client
    );
    if (slotTaken) {
      throw ApiError.conflict("Requested new appointment slot is already booked");
    }

    const tokenNumber = await repo.getNextTokenNumber(
      existing.doctor_id,
      data.appointmentDate,
      client
    );

    const updated = await repo.rescheduleAppointmentWithClient(
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

    await client.query("COMMIT");

    return await repo.findAppointmentById(updated.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

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
  return await repo.findAppointmentById(cancelled.id);
};

const getAvailableSlots = async (doctorId, date, duration = 15) => {
  const doctor = await repo.findDoctorById(doctorId);
  if (!doctor) {
    throw ApiError.notFound("Doctor not found or currently inactive");
  }

  // 1. Check leave
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

  // 2. Published Rosters or Fallback Recurring Schedule
  let workingWindows = [];
  const publishedRosters = await repo.getPublishedRoster(doctorId, date);

  if (publishedRosters.length > 0) {
    workingWindows = publishedRosters.map((r) => ({
      shiftType: r.shift_type,
      startTime: r.start_time.slice(0, 5),
      endTime: r.end_time.slice(0, 5),
      roomId: r.room_id,
    }));
  } else {
    // Check master schedule for day of week (0=Sunday ... 6=Saturday)
    const dayOfWeek = new Date(date).getUTCDay();
    const schedules = await repo.getRecurringSchedule(doctorId, dayOfWeek);
    if (schedules.length > 0) {
      workingWindows = schedules.map((s) => ({
        shiftType: s.shift_type,
        startTime: s.start_time.slice(0, 5),
        endTime: s.end_time.slice(0, 5),
        roomId: s.room_id,
      }));
    } else {
      // Standard default OPD shift fallback: 09:00 - 13:00, 14:00 - 17:00
      workingWindows = [
        { shiftType: "morning", startTime: "09:00", endTime: "13:00" },
        { shiftType: "evening", startTime: "14:00", endTime: "17:00" },
      ];
    }
  }

  // 3. Existing Bookings
  const existingBookings = await repo.getAppointmentsForDoctor(doctorId, date);

  // 4. Generate Slots
  const slots = [];
  let availableCount = 0;

  for (const window of workingWindows) {
    const [sh, sm] = window.startTime.split(":").map(Number);
    const [eh, em] = window.endTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    for (let t = startMins; t + duration <= endMins; t += duration) {
      const sH = String(Math.floor(t / 60)).padStart(2, "0");
      const sM = String(t % 60).padStart(2, "0");
      const slotStart = `${sH}:${sM}`;
      const slotEnd = calculateEndTime(slotStart, duration);

      const conflict = existingBookings.some((b) => {
        const bStart = String(b.start_time).slice(0, 5);
        const bEnd = String(b.end_time).slice(0, 5);
        return slotStart < bEnd && slotEnd > bStart;
      });

      const isAvailable = !conflict;
      if (isAvailable) availableCount++;

      slots.push({
        shiftType: window.shiftType,
        startTime: slotStart,
        endTime: slotEnd,
        available: isAvailable,
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

const getAppointmentById = async (id) => {
  const appointment = await repo.findAppointmentById(id);
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }
  return appointment;
};

const listAppointments = async (filters) => {
  return await repo.listAppointments(filters);
};

const getPatientHistory = async (patientId) => {
  const patient = await repo.findPatientById(patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }
  return await repo.getPatientHistory(patientId);
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