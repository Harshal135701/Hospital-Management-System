const validation = require("./queue.validation");
const service = require("./queue.service");

const checkIn = async (req, res, next) => {
  try {
    const val = validation.checkInSchema.parse(req.body);
    const data = await service.checkIn(val.appointmentId);
    res.status(200).json({ success: true, ...data });
  } catch (e) { next(e); }
};

const callNext = async (req, res, next) => {
  try {
    const val = validation.callNextSchema.parse(req.body);
    const data = await service.callNext(val.doctorId, val.roomId, val.date);
    res.status(200).json({ success: true, ...data });
  } catch (e) { next(e); }
};

const startConsultation = async (req, res, next) => {
  try {
    const data = await service.startConsultation(req.params.appointmentId);
    res.status(200).json({
      success: true,
      message: "Consultation started",
      data,
    });
  } catch (e) { next(e); }
};

const completeConsultation = async (req, res, next) => {
  try {
    const val = validation.completeConsultationSchema.parse(req.body || {});
    const data = await service.completeConsultation(req.params.appointmentId, val.notes);
    res.status(200).json({ success: true, ...data });
  } catch (e) { next(e); }
};

const markNoShow = async (req, res, next) => {
  try {
    const data = await service.markNoShow(req.params.appointmentId);
    res.status(200).json({
      success: true,
      message: "Patient marked as no-show",
      data,
    });
  } catch (e) { next(e); }
};

const recallToken = async (req, res, next) => {
  try {
    const data = await service.recallToken(req.params.appointmentId);
    res.status(200).json({ success: true, ...data });
  } catch (e) { next(e); }
};

const setPriority = async (req, res, next) => {
  try {
    const val = validation.setPrioritySchema.parse(req.body);
    const data = await service.setPriority(req.params.appointmentId, val.isPriority, val.notes);
    res.status(200).json({
      success: true,
      message: `Priority updated to ${val.isPriority}`,
      data,
    });
  } catch (e) { next(e); }
};

const getDoctorQueue = async (req, res, next) => {
  try {
    const date = req.query.date;
    const data = await service.getDoctorQueue(req.params.doctorId, date);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
};

const getWaitingRoomDisplay = async (req, res, next) => {
  try {
    const val = validation.queueQuerySchema.parse(req.query);
    const data = await service.getWaitingRoomDisplay(val.date, val.departmentId);
    res.status(200).json({ success: true, data });
  } catch (e) { next(e); }
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
