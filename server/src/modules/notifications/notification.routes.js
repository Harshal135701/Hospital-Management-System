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