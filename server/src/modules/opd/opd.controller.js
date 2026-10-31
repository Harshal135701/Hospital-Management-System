const validation = require("./opd.validation");
const service = require("./opd.service");

const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCabins = async (req, res, next) => {
  try {
    const data = await service.getCabins();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const activateSession = async (req, res, next) => {
  try {
    const valid = validation.createSessionSchema.parse(req.body);
    const data = await service.activateSession(valid);
    res.status(201).json({ success: true, message: "Specialty clinic session activated", data });
  } catch (err) {
    next(err);
  }
};

const getQueue = async (req, res, next) => {
  try {
    const data = await service.getQueue(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const valid = validation.checkInSchema.parse(req.body);
    const data = await service.checkIn(valid);
    res.status(201).json({ success: true, message: "Patient checked in to lobby queue", data });
  } catch (err) {
    next(err);
  }
};

const callNext = async (req, res, next) => {
  try {
    const data = await service.callNext(req.body.cabin);
    res.status(200).json({ success: true, message: "Next patient summoned to cabin", data });
  } catch (err) {
    next(err);
  }
};

const setPriority = async (req, res, next) => {
  try {
    const valid = validation.prioritySchema.parse(req.body);
    const data = await service.setPriority(req.params.id, valid.isPriority, valid.category, valid.notes);
    res.status(200).json({ success: true, message: "Queue priority updated", data });
  } catch (err) {
    next(err);
  }
};

const getVisitSlip = async (req, res, next) => {
  try {
    const data = await service.getVisitSlip(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getFollowUps = async (req, res, next) => {
  try {
    const data = await service.getFollowUps();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const scheduleFollowUp = async (req, res, next) => {
  try {
    const valid = validation.followUpSchema.parse(req.body);
    const data = await service.scheduleFollowUp(valid);
    res.status(201).json({ success: true, message: "Follow-up review scheduled", data });
  } catch (err) {
    next(err);
  }
};

const sendReminder = async (req, res, next) => {
  try {
    const data = await service.sendReminder(req.params.id);
    res.status(200).json({ success: true, message: "Automated recall notification dispatched", data });
  } catch (err) {
    next(err);
  }
};

const broadcastReminders = async (req, res, next) => {
  try {
    const data = await service.broadcastReminders();
    res.status(200).json({ success: true, message: "Batch recall reminders broadcasted", data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getCabins,
  activateSession,
  getQueue,
  checkIn,
  callNext,
  setPriority,
  getVisitSlip,
  getFollowUps,
  scheduleFollowUp,
  sendReminder,
  broadcastReminders,
};
