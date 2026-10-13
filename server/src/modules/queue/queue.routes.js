const express = require("express");
const router = express.Router();
const controller = require("./queue.controller");

// 3.3 Token Queue / Waiting Room Display Endpoints

// Public Waiting Room Display (TV monitors / screens in hospital waiting lobby)
router.get("/display", controller.getWaitingRoomDisplay);

// Queue Desk & Token Management
router.post("/check-in", controller.checkIn);
router.post("/call-next", controller.callNext);
router.patch("/:appointmentId/start", controller.startConsultation);
router.patch("/:appointmentId/complete", controller.completeConsultation);
router.patch("/:appointmentId/no-show", controller.markNoShow);
router.patch("/:appointmentId/recall", controller.recallToken);
router.patch("/:appointmentId/priority", controller.setPriority);

// Doctor Desk Queue Board
router.get("/doctor/:doctorId", controller.getDoctorQueue);

module.exports = router;
