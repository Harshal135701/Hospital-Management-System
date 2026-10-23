const fs = require('fs');

// 1. Update appointment.repository.js
let apptRepo = fs.readFileSync('server/src/modules/appointments/appointment.repository.js', 'utf8');

if (!apptRepo.includes('isPatientDoubleBooked')) {
  const doubleBookFunc = `
const isPatientDoubleBooked = async (
  patientId,
  doctorId,
  date,
  startTime,
  excludeId = null,
  client = pool
) => {
  const r = await client.query(
    \`SELECT id
     FROM appointments
     WHERE patient_id = $1
       AND doctor_id = $2
       AND appointment_date = $3
       AND start_time = $4
       AND status NOT IN ('cancelled')
       AND ($5::uuid IS NULL OR id <> $5::uuid)
     LIMIT 1\`,
    [patientId, doctorId, date, startTime, excludeId]
  );

  return r.rows.length > 0;
};
`;

  apptRepo = apptRepo.replace('const isSlotBooked = async (', doubleBookFunc + '\r\nconst isSlotBooked = async (');
  
  // update createAppointmentWithClient to insert consultation_fee
  apptRepo = apptRepo.replace(
    `       status,\r\n       notes,\r\n       is_priority\r\n     )\r\n     VALUES (\r\n       $1, $2, $3, $4, $5, $6, $7,\r\n       $8, $9, $10, $11, 'booked', $12, $13\r\n     )`,
    `       status,\r\n       notes,\r\n       is_priority,\r\n       consultation_fee\r\n     )\r\n     VALUES (\r\n       $1, $2, $3, $4, $5, $6, $7,\r\n       $8, $9, $10, $11, 'booked', $12, $13, $14\r\n     )`
  );
  
  apptRepo = apptRepo.replace(
    `      data.notes || null,\r\n      data.isPriority || false,\r\n    ]\r\n  );`,
    `      data.notes || null,\r\n      data.isPriority || false,\r\n      data.consultationFee !== undefined && data.consultationFee !== null ? Number(data.consultationFee) : 500.00,\r\n    ]\r\n  );`
  );

  apptRepo = apptRepo.replace('  isSlotBooked,', '  isSlotBooked,\r\n  isPatientDoubleBooked,');
  fs.writeFileSync('server/src/modules/appointments/appointment.repository.js', apptRepo, 'utf8');
  console.log('Updated appointment.repository.js');
}

// 2. Update appointment.service.js
let apptService = fs.readFileSync('server/src/modules/appointments/appointment.service.js', 'utf8');

// Check double booked in createAppointment
if (!apptService.includes('isPatientDoubleBooked')) {
  apptService = apptService.replace(
    `    const slotTaken = await repo.isSlotBooked(`,
    `    const patientDoubleBooked = await repo.isPatientDoubleBooked(
      data.patientId,
      data.doctorId,
      data.appointmentDate,
      data.startTime,
      null,
      client
    );

    if (patientDoubleBooked) {
      throw ApiError.conflict(
        "Patient already has an active appointment with this doctor on this date and time slot"
      );
    }

    const slotTaken = await repo.isSlotBooked(`
  );

  // Set consultation fee snapshot
  apptService = apptService.replace(
    `        rosterId,\r\n        roomId,\r\n      },`,
    `        rosterId,\r\n        roomId,\r\n        consultationFee: data.consultationFee !== undefined && data.consultationFee !== null ? Number(data.consultationFee) : (doctor.consultation_fee !== null && doctor.consultation_fee !== undefined ? Number(doctor.consultation_fee) : 500.00),\r\n      },`
  );

  // Update APPOINTMENT_TRANSITIONS.no_show
  apptService = apptService.replace(
    `  no_show: [],`,
    `  no_show: ["arrived", "waiting", "cancelled"],`
  );

  fs.writeFileSync('server/src/modules/appointments/appointment.service.js', apptService, 'utf8');
  console.log('Updated appointment.service.js');
}

// 3. Update notification.repository.js
let notifRepo = fs.readFileSync('server/src/modules/notifications/notification.repository.js', 'utf8');
if (!notifRepo.includes('getAppointmentsForDate')) {
  const getApptsForDateFunc = `
const getAppointmentsForDate = async (dateStr) => {
  const result = await pool.query(
    \`SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date,
            a.start_time, a.status AS appointment_status,
            p.full_name AS patient_name, p.mobile,
            d.full_name AS doctor_name, dep.name AS department_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN departments dep ON dep.id = a.department_id
     WHERE a.appointment_date = $1::date
       AND a.status = 'booked'
     ORDER BY a.start_time ASC\`,
    [dateStr]
  );
  return result.rows;
};
`;

  notifRepo = notifRepo.replace('module.exports = {', getApptsForDateFunc + '\r\nmodule.exports = {\r\n  getAppointmentsForDate,');
  fs.writeFileSync('server/src/modules/notifications/notification.repository.js', notifRepo, 'utf8');
  console.log('Updated notification.repository.js');
}

// 4. Update notification.service.js
let notifService = fs.readFileSync('server/src/modules/notifications/notification.service.js', 'utf8');
if (!notifService.includes('sendRemindersForDate')) {
  const sendRemindersForDateFunc = `
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
`;

  notifService = notifService.replace('module.exports = {', sendRemindersForDateFunc + '\r\nmodule.exports = {\r\n  sendRemindersForDate,');
  fs.writeFileSync('server/src/modules/notifications/notification.service.js', notifService, 'utf8');
  console.log('Updated notification.service.js');
}

// 5. Update notification.controller.js
let notifCtrl = fs.readFileSync('server/src/modules/notifications/notification.controller.js', 'utf8');
if (!notifCtrl.includes('sendRemindersForDate')) {
  const controllerMethods = `
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
    res.json({ success: true, message: \`Batch reminders processed for \${date}\`, data });
  } catch (error) {
    handleError(res, error);
  }
};
`;

  notifCtrl = notifCtrl.replace('module.exports = {', controllerMethods + '\r\nmodule.exports = {\r\n  getAppointmentsForDate,\r\n  sendRemindersForDate,');
  fs.writeFileSync('server/src/modules/notifications/notification.controller.js', notifCtrl, 'utf8');
  console.log('Updated notification.controller.js');
}

// 6. Update notification.routes.js
let notifRoutes = `
const express = require("express");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");
const controller = require("./notification.controller");

const router = express.Router();

router.use(authenticateToken);

router.get("/", requireRoles("receptionist", "clinician_doctor", "super_admin"), controller.list);
router.get("/appointments-by-date", requireRoles("receptionist", "super_admin"), controller.getAppointmentsForDate);
router.post("/batch-reminders", requireRoles("receptionist", "super_admin"), controller.sendRemindersForDate);
router.post("/appointments/:appointmentId/events", requireRoles("receptionist", "super_admin"), controller.scheduleEvent);
router.post("/appointments/:appointmentId/reminders", requireRoles("receptionist", "super_admin"), controller.scheduleReminders);
router.patch("/appointments/:appointmentId/cancel-pending", requireRoles("receptionist", "super_admin"), controller.cancelPending);
router.post("/:id/send", requireRoles("super_admin", "receptionist"), controller.sendNow);

module.exports = router;
`;
fs.writeFileSync('server/src/modules/notifications/notification.routes.js', notifRoutes.trim(), 'utf8');
console.log('Updated notification.routes.js');
