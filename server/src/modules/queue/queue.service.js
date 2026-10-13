const repo = require("./queue.repository");
const aptRepo = require("../appointments/appointment.repository");
const ApiError = require("../../utils/ApiError");

const maskPatientName = (name) => {
  if (!name) return "Anonymous";
  const parts = name.trim().split(" ");
  return parts
    .map((p) => (p.length <= 2 ? p : `${p[0]}***${p[p.length - 1]}`))
    .join(" ");
};

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

const checkIn = async (appointmentId) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  if (existing.status !== "booked") {
    throw ApiError.badRequest(
      `Cannot check in appointment with status '${existing.status}'. Expected 'booked'.`
    );
  }

  const updated = await repo.checkIn(appointmentId);
  const detailed = await aptRepo.findAppointmentById(updated.id);

  return {
    appointment: detailed,
    tokenNumber: detailed.token_number,
    status: detailed.status,
    arrivedAt: detailed.arrived_at,
    roomNumber: detailed.room_number || "OPD Waiting Area",
    message: `Patient checked in successfully. Assigned Token #${detailed.token_number}`,
  };
};

const callNext = async (doctorId, roomId = null, date = null) => {
  const doctor = await aptRepo.findDoctorById(doctorId);
  if (!doctor) throw ApiError.notFound("Doctor not found or inactive");

  const targetDate = date || getTodayDateStr();
  const assignedRoomId = roomId || doctor.room_id || null;

  const called = await repo.callNextPatient(doctorId, targetDate, assignedRoomId);
  if (!called) {
    return {
      hasWaiting: false,
      message: `No patients currently waiting in queue for this doctor on ${targetDate}.`,
      doctorName: doctor.full_name,
    };
  }

  const detailed = await aptRepo.findAppointmentById(called.id);
  return {
    hasWaiting: true,
    message: `Calling Token #${detailed.token_number}`,
    appointment: detailed,
    announcement: {
      tokenNumber: detailed.token_number,
      patientName: detailed.patient_name,
      doctorName: detailed.doctor_name,
      roomNumber: detailed.room_number || "Consultation Room",
      calledAt: detailed.called_at,
    },
  };
};

const startConsultation = async (appointmentId) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  if (!["arrived", "waiting", "in_consultation"].includes(existing.status)) {
    throw ApiError.badRequest(
      `Cannot start consultation for appointment with status '${existing.status}'`
    );
  }

  const updated = await repo.startConsultation(appointmentId);
  return await aptRepo.findAppointmentById(updated.id);
};

const completeConsultation = async (appointmentId, notes = null) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  if (existing.status !== "in_consultation") {
    throw ApiError.badRequest(
      `Cannot complete consultation. Current status is '${existing.status}', expected 'in_consultation'`
    );
  }

  const updated = await repo.completeConsultation(appointmentId, notes);
  const detailed = await aptRepo.findAppointmentById(updated.id);

  let durationMinutes = null;
  if (detailed.consultation_started_at && detailed.consultation_ended_at) {
    const startMs = new Date(detailed.consultation_started_at).getTime();
    const endMs = new Date(detailed.consultation_ended_at).getTime();
    durationMinutes = Math.round((endMs - startMs) / 60000);
  }

  return {
    appointment: detailed,
    durationMinutes,
    message: "Consultation marked as completed successfully.",
  };
};

const markNoShow = async (appointmentId) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  if (["completed", "cancelled"].includes(existing.status)) {
    throw ApiError.badRequest(
      `Cannot mark as no-show. Appointment is already '${existing.status}'`
    );
  }

  const updated = await repo.markNoShow(appointmentId);
  return await aptRepo.findAppointmentById(updated.id);
};

const recallToken = async (appointmentId) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  const updated = await repo.recallToken(appointmentId);
  const detailed = await aptRepo.findAppointmentById(updated.id);

  return {
    message: `Re-announcing Token #${detailed.token_number}`,
    announcement: {
      tokenNumber: detailed.token_number,
      patientName: detailed.patient_name,
      doctorName: detailed.doctor_name,
      roomNumber: detailed.room_number || "Consultation Room",
      recalledAt: detailed.called_at,
    },
  };
};

const setPriority = async (appointmentId, isPriority, notes = null) => {
  const existing = await aptRepo.findAppointmentById(appointmentId);
  if (!existing) throw ApiError.notFound("Appointment not found");

  const updated = await repo.setPriority(appointmentId, isPriority, notes);
  return await aptRepo.findAppointmentById(updated.id);
};

const getDoctorQueue = async (doctorId, date = getTodayDateStr()) => {
  const doctor = await aptRepo.findDoctorById(doctorId);
  if (!doctor) throw ApiError.notFound("Doctor not found or inactive");

  const appointments = await repo.getDoctorQueue(doctorId, date);

  const currentInConsultation = appointments.find((a) => a.status === "in_consultation") || null;
  const waitingQueue = appointments.filter((a) => ["arrived", "waiting"].includes(a.status));
  const upcomingBooked = appointments.filter((a) => a.status === "booked");
  const completed = appointments.filter((a) => a.status === "completed");
  const noShow = appointments.filter((a) => a.status === "no_show");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return {
    doctor: {
      id: doctor.id,
      name: doctor.full_name,
      code: doctor.employee_code,
    },
    date,
    metrics: {
      totalAppointments: appointments.length,
      currentServingToken: currentInConsultation ? currentInConsultation.token_number : null,
      waitingCount: waitingQueue.length,
      bookedNotArrivedCount: upcomingBooked.length,
      completedCount: completed.length,
      noShowCount: noShow.length,
      cancelledCount: cancelled.length,
    },
    currentInConsultation,
    waitingQueue,
    upcomingBooked,
    completed,
  };
};

const getWaitingRoomDisplay = async (date = getTodayDateStr(), departmentId = null) => {
  const rows = await repo.getDisplayData(date, departmentId);

  // Group by doctor
  const doctorMap = new Map();
  let totalWaitTimeMinutes = 0;
  let waitTimeSamples = 0;

  for (const row of rows) {
    if (!doctorMap.has(row.doc_id)) {
      doctorMap.set(row.doc_id, {
        doctorId: row.doc_id,
        doctorName: row.doctor_name,
        doctorCode: row.doctor_code,
        departmentName: row.department_name,
        roomNumber: row.active_room_number,
        floor: row.active_room_floor,
        nowServing: null,
        nextTokens: [],
        waitingCount: 0,
        completedCount: 0,
        status: "IDLE",
      });
    }

    const docEntry = doctorMap.get(row.doc_id);

    if (row.status === "in_consultation") {
      docEntry.nowServing = {
        appointmentId: row.id,
        tokenNumber: row.token_number,
        maskedPatient: maskPatientName(row.patient_name),
        patientUhid: row.patient_uhid,
        calledAt: row.called_at,
        visitType: row.visit_type,
      };
      docEntry.status = "SERVING";
    } else if (["arrived", "waiting"].includes(row.status)) {
      docEntry.waitingCount++;
      if (docEntry.nextTokens.length < 4) {
        docEntry.nextTokens.push({
          tokenNumber: row.token_number,
          isPriority: row.is_priority,
          status: row.status,
        });
      }
      if (docEntry.status !== "SERVING") {
        docEntry.status = "WAITING";
      }
    } else if (row.status === "completed") {
      docEntry.completedCount++;
    }

    // Wait time calculation: from arrived_at to consultation_started_at
    if (row.arrived_at && row.consultation_started_at) {
      const waitMs =
        new Date(row.consultation_started_at).getTime() - new Date(row.arrived_at).getTime();
      if (waitMs > 0) {
        totalWaitTimeMinutes += waitMs / 60000;
        waitTimeSamples++;
      }
    }
  }

  const rooms = Array.from(doctorMap.values());
  const avgWaitTime =
    waitTimeSamples > 0 ? Math.round(totalWaitTimeMinutes / waitTimeSamples) : 12;

  const totalServing = rooms.filter((r) => r.nowServing !== null).length;
  const totalWaiting = rooms.reduce((sum, r) => sum + r.waitingCount, 0);
  const totalCompleted = rooms.reduce((sum, r) => sum + r.completedCount, 0);

  return {
    displayDate: date,
    generatedAt: new Date().toISOString(),
    hospitalStats: {
      activeConsultationRooms: rooms.length,
      nowServingCount: totalServing,
      totalWaitingCount: totalWaiting,
      totalCompletedCount: totalCompleted,
      averageWaitTimeMinutes: avgWaitTime,
    },
    rooms,
  };
};

module.exports = {
  checkIn,
  callNext,
  startConsultation,
  completeConsultation,
  markNoShow,
  recallToken,
  setPriority,
  getDoctorQueue,
  getWaitingRoomDisplay,
};
