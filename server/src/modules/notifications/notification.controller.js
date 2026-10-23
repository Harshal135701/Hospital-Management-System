
const service = require("./notification.service");

const handleError = (res, error) => {
  const clientError = /not found|invalid|missing|only pending|only booked|must contain/i
    .test(error.message);

  return res.status(clientError ? 400 : 500).json({
    success: false,
    message: error.message,
  });
};

const list = async (req, res) => {
  try {
    const data = await service.getNotifications({
      status: req.query.status,
      appointmentId: req.query.appointmentId,
    });

    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

const scheduleEvent = async (req, res) => {
  try {
    const { eventType, channels, scheduledAt } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: "eventType is required",
      });
    }

    const date = scheduledAt ? new Date(scheduledAt) : new Date();

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt must be a valid date/time",
      });
    }

    const data = await service.scheduleEvent(
      req.params.appointmentId,
      eventType,
      channels || ["sms"],
      date
    );

    res.status(201).json({
      success: true,
      message: data.length
        ? "Notification scheduled"
        : "Matching notification already exists",
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const scheduleReminders = async (req, res) => {
  try {
    const data = await service.scheduleAppointmentReminders(
      req.params.appointmentId
    );

    res.status(201).json({
      success: true,
      message: "Appointment reminders processed",
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const sendNow = async (req, res) => {
  try {
    const data = await service.sendNow(req.params.id);
    res.json({ success: true, message: "Notification processed", data });
  } catch (error) {
    handleError(res, error);
  }
};

const cancelPending = async (req, res) => {
  try {
    const data = await service.cancelPendingForAppointment(
      req.params.appointmentId
    );

    res.json({
      success: true,
      message: "Pending notifications cancelled",
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};


const getAppointmentsForDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "date query param is required" });
    }
    const repo = require("./notification.repository");
    const appointments = await repo.getAppointmentsForDate(date);
    res.json({ success: true, data: appointments });
  } catch (error) {
    handleError(res, error);
  }
};

const sendRemindersForDate = async (req, res) => {
  try {
    const { date, appointmentIds } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }
    const data = await service.sendRemindersForDate(date, appointmentIds);
    res.json({ success: true, message: `Batch reminders processed for ${date}`, data });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAppointmentsForDate,
  sendRemindersForDate,
  list,
  scheduleEvent,
  scheduleReminders,
  sendNow,
  cancelPending,
};
