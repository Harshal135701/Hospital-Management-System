const repo = require("./roster.repository");
const aptRepo = require("../appointments/appointment.repository");
const ApiError = require("../../utils/ApiError");

// ==================== DOCTOR SCHEDULES ====================

const createSchedule = async (data) => {
  const doctor = await aptRepo.findDoctorById(data.doctorId);
  if (!doctor) throw ApiError.notFound("Doctor not found or inactive");

  if (data.roomId) {
    const room = await aptRepo.findRoomById(data.roomId);
    if (!room) throw ApiError.notFound("Room not found or inactive");
  }

  // Check overlap with existing schedule on same day of week
  const existing = await repo.getSchedules({
    doctorId: data.doctorId,
    dayOfWeek: data.dayOfWeek,
    isActive: true,
  });

  const conflict = existing.some(
    (s) => data.startTime < s.end_time.slice(0, 5) && data.endTime > s.start_time.slice(0, 5)
  );
  if (conflict) {
    throw ApiError.conflict(
      `Recurring schedule conflicts with an existing shift (${existing[0].shift_type}: ${existing[0].start_time}-${existing[0].end_time}) on this day`
    );
  }

  return await repo.createSchedule(data);
};

const getSchedules = async (filters) => {
  return await repo.getSchedules(filters);
};

const updateSchedule = async (id, data) => {
  const existing = await repo.findScheduleById(id);
  if (!existing) throw ApiError.notFound("Schedule not found");

  if (data.roomId) {
    const room = await aptRepo.findRoomById(data.roomId);
    if (!room) throw ApiError.notFound("Room not found or inactive");
  }

  return await repo.updateSchedule(id, data);
};

const deleteSchedule = async (id) => {
  const existing = await repo.findScheduleById(id);
  if (!existing) throw ApiError.notFound("Schedule not found");
  return await repo.deleteSchedule(id);
};

// ==================== DOCTOR LEAVES ====================

const applyLeave = async (data) => {
  const doctor = await aptRepo.findDoctorById(data.doctorId);
  if (!doctor) throw ApiError.notFound("Doctor not found or inactive");

  const today = new Date().toISOString().slice(0, 10);
  if (data.startDate < today) {
    throw ApiError.badRequest("Leave start date cannot be in the past");
  }

  // Check if leave already exists
  const existingLeaves = await repo.getLeaves({
    doctorId: data.doctorId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  const activeExisting = existingLeaves.find((l) => l.status !== "rejected");
  if (activeExisting) {
    throw ApiError.conflict(
      `Leave request already exists for this period with status '${activeExisting.status}'`
    );
  }

  return await repo.createLeave(data);
};

const reviewLeave = async (id, status, reviewedBy) => {
  const leave = await repo.findLeaveById(id);
  if (!leave) throw ApiError.notFound("Leave request not found");

  if (leave.status !== "pending") {
    throw ApiError.badRequest(`Leave request is already '${leave.status}'`);
  }

  if (reviewedBy) {
    const reviewer = await aptRepo.findDoctorById(reviewedBy);
    if (!reviewer) throw ApiError.notFound("Reviewer doctor not found");
  }

  const updated = await repo.updateLeaveStatus(id, status, reviewedBy);

  // If approved, check for affected appointments
  let affectedAppointments = [];
  if (status === "approved") {
    const sDate = typeof leave.start_date === "string" ? leave.start_date : leave.start_date.toISOString().slice(0, 10);
    const eDate = typeof leave.end_date === "string" ? leave.end_date : leave.end_date.toISOString().slice(0, 10);
    affectedAppointments = await repo.getAppointmentsInLeaveRange(
      leave.doctor_id,
      sDate,
      eDate
    );
  }

  return {
    leave: updated,
    warning:
      affectedAppointments.length > 0
        ? `Warning: ${affectedAppointments.length} existing appointment(s) coincide with approved leave dates and require rescheduling/cancellation.`
        : null,
    affectedAppointmentsCount: affectedAppointments.length,
    affectedAppointments,
  };
};

const getLeaves = async (filters) => {
  return await repo.getLeaves(filters);
};

const deleteLeave = async (id) => {
  const leave = await repo.findLeaveById(id);
  if (!leave) throw ApiError.notFound("Leave not found");
  if (leave.status !== "pending") {
    throw ApiError.badRequest("Only 'pending' leave requests can be deleted");
  }
  return await repo.deleteLeave(id);
};

// ==================== DOCTOR ROSTERS ====================

const createRoster = async (data) => {
  const doctor = await aptRepo.findDoctorById(data.doctorId);
  if (!doctor) throw ApiError.notFound("Doctor not found or inactive");

  const today = new Date().toISOString().slice(0, 10);
  if (data.rosterDate < today) {
    throw ApiError.badRequest("Roster date cannot be in the past");
  }

  // Check if doctor is on approved leave
  const leave = await aptRepo.isDoctorOnLeave(data.doctorId, data.rosterDate);
  if (leave) {
    throw ApiError.badRequest(
      `Doctor is on approved leave on ${data.rosterDate}. Leave reason: ${leave.reason || "Personal"}`
    );
  }

  // Check conflict
  const conflict = await repo.checkRosterConflict(
    data.doctorId,
    data.rosterDate,
    data.startTime,
    data.endTime
  );
  if (conflict) {
    throw ApiError.conflict("Doctor already has an overlapping shift on this date");
  }

  if (data.roomId) {
    const room = await aptRepo.findRoomById(data.roomId);
    if (!room) throw ApiError.notFound("Room not found or inactive");
  }

  const created = await repo.createRoster(data);
  return await repo.findRosterById(created.id);
};

const getRosters = async (filters) => {
  return await repo.getRosters(filters);
};

const getRosterById = async (id) => {
  const roster = await repo.findRosterById(id);
  if (!roster) throw ApiError.notFound("Roster entry not found");
  return roster;
};

const updateRoster = async (id, data) => {
  const roster = await repo.findRosterById(id);
  if (!roster) throw ApiError.notFound("Roster not found");

  if (data.startTime && data.endTime) {
    const conflict = await repo.checkRosterConflict(
      roster.doctor_id,
      roster.roster_date,
      data.startTime,
      data.endTime,
      id
    );
    if (conflict) {
      throw ApiError.conflict("Updated times conflict with another shift for this doctor");
    }
  }

  if (data.roomId) {
    const room = await aptRepo.findRoomById(data.roomId);
    if (!room) throw ApiError.notFound("Room not found or inactive");
  }

  await repo.updateRoster(id, data);
  return await repo.findRosterById(id);
};

const publishRoster = async (id) => {
  const roster = await repo.findRosterById(id);
  if (!roster) throw ApiError.notFound("Roster not found");
  if (roster.status === "published") {
    throw ApiError.badRequest("Roster is already published");
  }
  await repo.publishRoster(id);
  return await repo.findRosterById(id);
};

const bulkPublishRosters = async (options) => {
  const published = await repo.bulkPublishRosters(options);
  return {
    publishedCount: published.length,
    startDate: options.startDate,
    endDate: options.endDate,
  };
};

const deleteRoster = async (id) => {
  const roster = await repo.findRosterById(id);
  if (!roster) throw ApiError.notFound("Roster not found");
  if (roster.status === "published") {
    throw ApiError.badRequest("Cannot delete a published roster directly");
  }
  const deleted = await repo.deleteRoster(id);
  if (!deleted) {
    throw ApiError.badRequest("Roster cannot be deleted (may have associated appointments)");
  }
  return { success: true, message: "Roster deleted successfully" };
};

/**
 * Bulk generate daily doctor rosters from master weekly schedules.
 */
const generateRoster = async ({ startDate, endDate, doctorId, departmentId, autoPublish = false }) => {
  const doctors = await repo.getActiveDoctors(doctorId, departmentId);
  if (doctors.length === 0) {
    throw ApiError.notFound("No active doctors found matching criteria");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  let generatedCount = 0;
  let skippedLeaveCount = 0;
  let skippedExistingCount = 0;
  const createdRosters = [];

  // Iterate day by day
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getUTCDay();

    for (const doc of doctors) {
      // 1. Check doctor leave
      const leave = await aptRepo.isDoctorOnLeave(doc.id, dateStr);
      if (leave) {
        skippedLeaveCount++;
        continue;
      }

      // 2. Fetch master schedules for this dayOfWeek
      const schedules = await aptRepo.getRecurringSchedule(doc.id, dayOfWeek);
      for (const sched of schedules) {
        // 3. Check if roster already exists
        const conflict = await repo.checkRosterConflict(
          doc.id,
          dateStr,
          sched.start_time.slice(0, 5),
          sched.end_time.slice(0, 5)
        );
        if (conflict) {
          skippedExistingCount++;
          continue;
        }

        // 4. Create daily roster
        const created = await repo.createRoster({
          doctorId: doc.id,
          rosterDate: dateStr,
          shiftType: sched.shift_type,
          startTime: sched.start_time.slice(0, 5),
          endTime: sched.end_time.slice(0, 5),
          roomId: sched.room_id || doc.room_id || null,
          maxPatients: sched.max_patients || 30,
          status: autoPublish ? "published" : "draft",
        });

        generatedCount++;
        createdRosters.push(created);
      }
    }
  }

  return {
    summary: {
      startDate,
      endDate,
      doctorsEvaluated: doctors.length,
      generatedCount,
      skippedLeaveCount,
      skippedExistingCount,
      autoPublished: autoPublish,
    },
    createdRosters,
  };
};

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  applyLeave,
  reviewLeave,
  getLeaves,
  deleteLeave,
  createRoster,
  getRosters,
  getRosterById,
  updateRoster,
  publishRoster,
  bulkPublishRosters,
  deleteRoster,
  generateRoster,
};
