
const repo = require("./notification.repository");
const provider = require("./notification.provider");

const buildMessage = (eventType, appointment) => {
  const date = String(appointment.appointment_date).slice(0, 10);
  const time = String(appointment.start_time).slice(0, 5);

  const messages = {
    booking_confirmation:
      `Hello ${appointment.patient_name}, your appointment with Dr. ${appointment.doctor_name} is booked for ${date} at ${time}.`,
    rescheduled:
      `Hello ${appointment.patient_name}, your appointment with Dr. ${appointment.doctor_name} is rescheduled to ${date} at ${time}.`,
    cancellation:
      `Hello ${appointment.patient_name}, your appointment with Dr. ${appointment.doctor_name} on ${date} at ${time} has been cancelled.`,
    reminder_24h:
      `Reminder: Hello ${appointment.patient_name}, your appointment with Dr. ${appointment.doctor_name} is tomorrow at ${time}.`,
    reminder_2h:
      `Reminder: Hello ${appointment.patient_name}, your appointment with Dr. ${appointment.doctor_name} is in approximately 2 hours.`,
    token_alert:
      `Hello ${appointment.patient_name}, please check with the hospital reception for your appointment queue update.`,
  };

  return messages[eventType];
};

const scheduleEvent = async (
  appointmentId,
  eventType,
  channels = ["sms"],
  scheduledAt = new Date()
) => {
  const appointment = await repo.getAppointmentDetails(appointmentId);

  if (!appointment) throw new Error("Appointment not found");
  if (!appointment.mobile) throw new Error("Patient mobile number is missing");

  const allowedEvents = [
    "booking_confirmation",
    "rescheduled",
    "cancellation",
    "reminder_24h",
    "reminder_2h",
    "token_alert",
  ];

  if (!allowedEvents.includes(eventType)) {
    throw new Error("Invalid notification event");
  }

  if (!Array.isArray(channels) || channels.length === 0 ||
      channels.some((c) => !["sms", "whatsapp"].includes(c))) {
    throw new Error("Channels must contain sms and/or whatsapp");
  }

  const message = buildMessage(eventType, appointment);
  const results = [];

  for (const channel of [...new Set(channels)]) {
    const notification = await repo.createNotification({
      appointmentId,
      patientId: appointment.patient_id,
      channel,
      eventType,
      recipient: appointment.mobile,
      message,
      scheduledAt,
    });

    if (notification) results.push(notification);
  }

  return results;
};

const scheduleAppointmentReminders = async (appointmentId) => {
  const appointment = await repo.getAppointmentDetails(appointmentId);

  if (!appointment) throw new Error("Appointment not found");
  if (appointment.appointment_status !== "booked") {
    throw new Error("Only booked appointments can receive reminders");
  }

  const date = String(appointment.appointment_date).slice(0, 10);
  const time = String(appointment.start_time).slice(0, 5);
  const appointmentTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  const results = [];

  for (const [eventType, offset] of [
    ["reminder_24h", 24 * 60 * 60 * 1000],
    ["reminder_2h", 2 * 60 * 60 * 1000],
  ]) {
    const scheduledAt = new Date(appointmentTime.getTime() - offset);

    if (scheduledAt <= now) continue;

    const notifications = await scheduleEvent(
      appointmentId,
      eventType,
      ["sms"],
      scheduledAt
    );

    results.push(...notifications);
  }

  return results;
};

const processDueNotifications = async () => {
  const due = await repo.getDueNotifications();
  const results = [];

  for (const notification of due) {
    try {
      const response = await provider.sendMessage({
        channel: notification.channel,
        recipient: notification.recipient,
        message: notification.message,
      });

      const updated = await repo.updateNotification(notification.id, {
        status: "sent",
        providerMessageId: response.providerMessageId,
      });

      results.push(updated);
    } catch (error) {
      const updated = await repo.updateNotification(notification.id, {
        status: "failed",
        errorMessage: error.message,
      });

      results.push(updated);
    }
  }

  return results;
};

const getNotifications = (filters) => repo.getNotifications(filters);

const sendNow = async (id) => {
  const notification = await repo.getNotificationById(id);

  if (!notification) throw new Error("Notification not found");
  if (notification.status !== "pending") {
    throw new Error("Only pending notifications can be sent");
  }

  try {
    const response = await provider.sendMessage({
      channel: notification.channel,
      recipient: notification.recipient,
      message: notification.message,
    });

    return repo.updateNotification(id, {
      status: "sent",
      providerMessageId: response.providerMessageId,
    });
  } catch (error) {
    await repo.updateNotification(id, {
      status: "failed",
      errorMessage: error.message,
    });
    throw error;
  }
};

const cancelPendingForAppointment = (id) =>
  repo.cancelPendingForAppointment(id);


const sendRemindersForDate = async (dateStr, appointmentIds = null) => {
  if (!dateStr) {
    throw new Error("Date is required");
  }
  const appointments = await repo.getAppointmentsForDate(dateStr);
  const eligible = appointmentIds && Array.isArray(appointmentIds) && appointmentIds.length > 0
    ? appointments.filter(a => appointmentIds.includes(a.id))
    : appointments;

  const results = [];
  for (const appt of eligible) {
    if (!appt.mobile) continue;
    try {
      const scheduled = await scheduleEvent(
        appt.id,
        "reminder_24h",
        ["sms"],
        new Date()
      );
      for (const n of scheduled) {
        try {
          const sent = await sendNow(n.id);
          results.push({ appointmentId: appt.id, status: "sent", notification: sent });
        } catch (sendErr) {
          results.push({ appointmentId: appt.id, status: "failed", error: sendErr.message });
        }
      }
    } catch (err) {
      results.push({ appointmentId: appt.id, status: "error", error: err.message });
    }
  }
  return { date: dateStr, totalProcessed: eligible.length, results };
};

module.exports = {
  sendRemindersForDate,
  scheduleEvent,
  scheduleAppointmentReminders,
  processDueNotifications,
  getNotifications,
  sendNow,
  cancelPendingForAppointment,
};
