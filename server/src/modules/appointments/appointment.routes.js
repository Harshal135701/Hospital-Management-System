const express = require("express");
const router = express.Router();
const controller = require("./appointment.controller");

// 3.1 Book / Reschedule Appointment Endpoints
router.post("/", controller.createAppointment);
router.get("/", controller.getAppointments);
router.get("/available-slots", controller.getAvailableSlots);
router.get("/patient/:patientId", controller.getPatientHistory);
router.get("/:id", controller.getAppointmentById);
router.patch("/:id/reschedule", controller.rescheduleAppointment);
router.patch("/:id/cancel", controller.cancelAppointment);

module.exports = router;