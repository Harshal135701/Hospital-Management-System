const express = require("express");
const router = express.Router();
const controller = require("./opd.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

// Public / kiosk accessible dashboard & queues
router.get("/dashboard", controller.getDashboard);
router.get("/cabins", controller.getCabins);
router.get("/queue", controller.getQueue);
router.get("/visit-slip/:id", controller.getVisitSlip);

// Authenticated or staff clinical operations
router.post("/cabins/session", controller.activateSession);
router.post("/check-in", controller.checkIn);
router.post("/queue/call-next", controller.callNext);
router.patch("/queue/:id/priority", controller.setPriority);

// 22.5 Follow-up tracking and multi-channel recalls
router.get("/follow-ups", controller.getFollowUps);
router.post("/follow-ups", controller.scheduleFollowUp);
router.post("/follow-ups/:id/remind", controller.sendReminder);
router.post("/follow-ups/broadcast", controller.broadcastReminders);

module.exports = router;
