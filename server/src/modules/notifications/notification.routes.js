
const express = require("express");
const controller = require("./notification.controller");

const router = express.Router();

router.get("/", controller.list);
router.post("/appointments/:appointmentId/events", controller.scheduleEvent);
router.post("/appointments/:appointmentId/reminders", controller.scheduleReminders);
router.patch("/appointments/:appointmentId/cancel-pending", controller.cancelPending);
router.post("/:id/send", controller.sendNow);

module.exports = router;
