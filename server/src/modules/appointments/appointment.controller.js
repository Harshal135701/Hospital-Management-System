const validation = require("./appointment.validation");
const service = require("./appointment.service");

const createAppointment = async (req, res, next) => {
  try {
    const validated = validation.createAppointmentSchema.parse(req.body);
    const data = await service.createAppointment(validated);
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const filters = validation.listAppointmentsQuerySchema.parse(req.query);
    const result = await service.listAppointments(filters);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const data = await service.getAppointmentById(req.params.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const query = validation.getSlotsQuerySchema.parse(req.query);
    const data = await service.getAvailableSlots(
      query.doctorId,
      query.date,
      query.duration
    );
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const rescheduleAppointment = async (req, res, next) => {
  try {
    const validated = validation.rescheduleSchema.parse(req.body);
    const data = await service.rescheduleAppointment(req.params.id, validated);
    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const validated = validation.cancelSchema.parse(req.body || {});
    const data = await service.cancelAppointment(req.params.id, validated.reason);
    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getPatientHistory = async (req, res, next) => {
  try {
    const data = await service.getPatientHistory(req.params.patientId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const validated = validation.updateAppointmentStatusSchema.parse(req.body);
    const data = await service.updateAppointmentStatus(
      req.params.id,
      validated.status,
      validated,
      req.user
    );
    res.status(200).json({
      success: true,
      message: `Appointment status updated to '${validated.status}' successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  getAvailableSlots,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  getPatientHistory,
};
