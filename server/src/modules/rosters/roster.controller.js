const validation = require("./roster.validation");
const service = require("./roster.service");

// Master Recurring Schedules
const createSchedule = async (req, res, next) => {
  try {
    const val = validation.createScheduleSchema.parse(req.body);
    const data = await service.createSchedule(val);
    res.status(201).json({ success: true, message: "Doctor schedule created", data });
  } catch (e) { next(e); }
};

const getSchedules = async (req, res, next) => {
  try {
    const filters = {
      doctorId: req.query.doctorId,
      dayOfWeek: req.query.dayOfWeek !== undefined ? Number(req.query.dayOfWeek) : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
    };
    const data = await service.getSchedules(filters);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const updateSchedule = async (req, res, next) => {
  try {
    const val = validation.updateScheduleSchema.parse(req.body);
    const data = await service.updateSchedule(req.params.id, val);
    res.status(200).json({ success: true, message: "Doctor schedule updated", data });
  } catch (e) { next(e); }
};

const deleteSchedule = async (req, res, next) => {
  try {
    await service.deleteSchedule(req.params.id);
    res.status(200).json({ success: true, message: "Doctor schedule deleted" });
  } catch (e) { next(e); }
};

// Leaves
const applyLeave = async (req, res, next) => {
  try {
    const val = validation.applyLeaveSchema.parse(req.body);
    const data = await service.applyLeave(val);
    res.status(201).json({ success: true, message: "Leave request submitted", data });
  } catch (e) { next(e); }
};

const getLeaves = async (req, res, next) => {
  try {
    const filters = {
      doctorId: req.query.doctorId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const data = await service.getLeaves(filters);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const reviewLeave = async (req, res, next) => {
  try {
    const val = validation.reviewLeaveSchema.parse(req.body);
    const data = await service.reviewLeave(req.params.id, val.status, val.reviewedBy);
    res.status(200).json({
      success: true,
      message: `Leave request ${val.status}`,
      data,
    });
  } catch (e) { next(e); }
};

const deleteLeave = async (req, res, next) => {
  try {
    await service.deleteLeave(req.params.id);
    res.status(200).json({ success: true, message: "Leave request cancelled/deleted" });
  } catch (e) { next(e); }
};

// Daily Rosters
const createRoster = async (req, res, next) => {
  try {
    const val = validation.createRosterSchema.parse(req.body);
    const data = await service.createRoster(val);
    res.status(201).json({ success: true, message: "Doctor roster shift created", data });
  } catch (e) { next(e); }
};

const getRosters = async (req, res, next) => {
  try {
    const filters = {
      rosterDate: req.query.rosterDate || req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      doctorId: req.query.doctorId,
      departmentId: req.query.departmentId,
      status: req.query.status,
      shiftType: req.query.shiftType,
    };
    const data = await service.getRosters(filters);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const getRosterById = async (req, res, next) => {
  try {
    const data = await service.getRosterById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const updateRoster = async (req, res, next) => {
  try {
    const val = validation.updateRosterSchema.parse(req.body);
    const data = await service.updateRoster(req.params.id, val);
    res.status(200).json({ success: true, message: "Roster updated", data });
  } catch (e) { next(e); }
};

const publishRoster = async (req, res, next) => {
  try {
    const data = await service.publishRoster(req.params.id);
    res.status(200).json({ success: true, message: "Roster published", data });
  } catch (e) { next(e); }
};

const bulkPublish = async (req, res, next) => {
  try {
    const val = validation.bulkPublishSchema.parse(req.body);
    const data = await service.bulkPublishRosters(val);
    res.status(200).json({ success: true, message: "Rosters published in bulk", data });
  } catch (e) { next(e); }
};

const deleteRoster = async (req, res, next) => {
  try {
    const data = await service.deleteRoster(req.params.id);
    res.status(200).json(data);
  } catch (e) { next(e); }
};

const generateRoster = async (req, res, next) => {
  try {
    const val = validation.generateRosterSchema.parse(req.body);
    const data = await service.generateRoster(val);
    res.status(201).json({
      success: true,
      message: `Shift planning complete: ${data.summary.generatedCount} shift rosters generated.`,
      data,
    });
  } catch (e) { next(e); }
};

module.exports = {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  applyLeave,
  getLeaves,
  reviewLeave,
  deleteLeave,
  createRoster,
  getRosters,
  getRosterById,
  updateRoster,
  publishRoster,
  bulkPublish,
  deleteRoster,
  generateRoster,
};
