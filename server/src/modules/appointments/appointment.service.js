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
    throw ApiError.notFound("Doctor not found or inactive");
  }

  // 3. Verify Department
  const department = await repo.findDepartmentById(data.departmentId);
  if (!department) {
    throw ApiError.notFound("Department not found or inactive");
  }

  // 4. Verify Doctor is not on leave
  const leave = await repo.isDoctorOnLeave(data.doctorId, data.appointmentDate);
  if (leave) {
    throw ApiError.badRequest(
      `Doctor is on approved leave on ${data.appointmentDate}: ${leave.reason || "On Leave"}`
    );
  }

  const endTime = calculateEndTime(data.startTime, 15);

  // 5. Transaction: Check slot availability & assign token
  const client = await repo.pool.connect();
  let transactionStarted = false;
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
      throw ApiError.conflict("Requested appointment slot is already booked");
    }

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
      },
      client
    );

    await client.query("COMMIT");
    transactionStarted = false;
    return created;
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }
};

const rescheduleAppointment = async (id, data) => {
  const today = getTodayDateStr();
  if (data.appointmentDate < today) {
    throw ApiError.badRequest("New appointment date cannot be in the past");
  }

  const existing = await repo.findAppointmentById(id);
  if (!existing) {
    throw ApiError.notFound("Appointment not found");
  }
  if (["completed", "cancelled", "no_show"].includes(existing.status)) {
    throw ApiError.badRequest(
      `Cannot reschedule appointment that is already '${existing.status}'`
    );
  }

  const leave = await repo.isDoctorOnLeave(existing.doctor_id, data.appointmentDate);
  if (leave) {
    throw ApiError.badRequest(
      `Doctor is on leave on ${data.appointmentDate}: ${leave.reason || "On Leave"}`
    );
  }

  const endTime = calculateEndTime(data.startTime, 15);

  const client = await repo.pool.connect();
  let transactionStarted = false;
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
      },
      client
    );

    await client.query("COMMIT");
    transactionStarted = false;
    return updated;
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
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
  if (!cancelled) {
    throw ApiError.badRequest("Appointment could not be cancelled");
  }
  return cancelled;
};

const getAvailableSlots = async (doctorId, date, duration = 15) => {
  if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) {
    throw ApiError.badRequest("Duration must be a positive integer in minutes");
  }

  const doctor = await repo.findDoctorById(doctorId);
  if (!doctor) {
    throw ApiError.notFound("Doctor not found or inactive");
  }

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
    const schedules = await repo.getRecurringSchedule(doctorId, dayOfWeek);
    if (schedules.length > 0) {
      workingWindows = schedules.map((schedule) => ({
        shiftType: schedule.shift_type,
        startTime: String(schedule.start_time).slice(0, 5),
        endTime: String(schedule.end_time).slice(0, 5),
        roomId: schedule.room_id,
      }));
    } else {
      workingWindows = [
        { shiftType: "morning", startTime: "09:00", endTime: "13:00" },
        { shiftType: "evening", startTime: "14:00", endTime: "17:00" },
      ];
    }
  }

  const existingBookings = await repo.getAppointmentsForDoctor(doctorId, date);
  const slots = [];
  let availableCount = 0;

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
      if (available) availableCount++;

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

const getAppointmentById = async (id) => {
  const appointment = await repo.findAppointmentById(id);
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }
  return appointment;
};

const listAppointments = async (filters) => {
  return repo.listAppointments(filters);
};

const getPatientHistory = async (patientId) => {
  const patient = await repo.findPatientById(patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }
  return repo.getPatientHistory(patientId);
};

const APPOINTMENT_TRANSITIONS = {
  booked: ["arrived", "cancelled", "no_show"],
  arrived: ["waiting", "in_consultation", "cancelled", "no_show"],
  waiting: ["in_consultation", "cancelled", "no_show"],
  in_consultation: ["completed", "waiting"],
  completed: [],
  cancelled: [],
  no_show: [],
};

const ROLE_ALLOWED_TARGET_STATUSES = {
  receptionist: ["arrived", "waiting", "cancelled", "no_show"],
  staff_nurse: ["arrived", "waiting", "cancelled", "no_show"],
  clinician_doctor: ["arrived", "waiting", "in_consultation", "completed", "cancelled", "no_show"],
  super_admin: ["arrived", "waiting", "in_consultation", "completed", "cancelled", "no_show"],
};

const updateAppointmentStatus = async (id, newStatus, options = {}, currentUser = {}) => {
  // 1. Verify appointment exists
  const existing = await repo.findAppointmentById(id);
  if (!existing) {
    throw ApiError.notFound("Appointment not found");
  }

  // 2. Role permission check (must happen before checking idempotency)
  const allowedStatuses = ROLE_ALLOWED_TARGET_STATUSES[currentUser.role];
  if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    throw ApiError.forbidden(
      `Role '${currentUser.role || "unknown"}' is not authorized to set appointment status to '${newStatus}'`
    );
  }

  // 3. Clinician doctor ownership check (must happen before checking idempotency)
  if (currentUser.role === "clinician_doctor") {
    if (!currentUser.doctor_id || currentUser.doctor_id !== existing.doctor_id) {
      throw ApiError.forbidden("Clinician doctors may only update status for their own assigned appointments");
    }
  }

  // 4. Idempotency: if already in target status, return existing record
  if (existing.status === newStatus) {
    return existing;
  }

  // 5. State machine transition check
  const allowedTransitions = APPOINTMENT_TRANSITIONS[existing.status] || [];
  if (!allowedTransitions.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition appointment from '${existing.status}' to '${newStatus}'. Allowed transitions from '${existing.status}': [${allowedTransitions.join(", ")}]`
    );
  }

  // 6. Handle default cancellation reason if cancelled
  const cancellationReason =
    options.cancellation_reason || (newStatus === "cancelled" ? "Cancelled by user" : null);

  // 7. Atomic conditional update enforcing concurrency control
  const updated = await repo.updateStatusAtomic(
    id,
    newStatus,
    existing.status,
    {
      cancellation_reason: cancellationReason,
      notes: options.notes,
    }
  );

  // 8. Concurrency detection: if 0 rows updated, verify what changed concurrently
  if (!updated) {
    const fresh = await repo.findAppointmentById(id);
    if (!fresh) {
      throw ApiError.notFound("Appointment not found");
    }
    if (fresh.status === newStatus) {
      return fresh;
    }
    throw ApiError.conflict(
      `Appointment status was concurrently modified from '${existing.status}' to '${fresh.status}'. Please refresh and try again.`
    );
  }

  // Return fresh populated appointment record with joined details
  return repo.findAppointmentById(id);
};

module.exports = {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getAvailableSlots,
  getAppointmentById,
  listAppointments,
  getPatientHistory,
  APPOINTMENT_TRANSITIONS,
  ROLE_ALLOWED_TARGET_STATUSES,
};
