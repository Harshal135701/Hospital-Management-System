const express = require("express");
const router = express.Router();
const controller = require("./queue.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

// 3.3 Token Queue / Waiting Room Display Endpoints

// Public Waiting Room Display (TV monitors / screens in hospital waiting lobby - returns masked data)
router.get("/display", controller.getWaitingRoomDisplay);

// All subsequent Queue Desk & Token Management endpoints require authentication
router.use(authenticateToken);

router.post("/check-in", requireRoles("receptionist", "staff_nurse", "super_admin"), controller.checkIn);
router.post("/call-next", requireRoles("clinician_doctor", "super_admin"), controller.callNext);
router.patch("/:appointmentId/start", requireRoles("clinician_doctor", "super_admin"), controller.startConsultation);
router.patch("/:appointmentId/complete", requireRoles("clinician_doctor", "super_admin"), controller.completeConsultation);
router.patch("/:appointmentId/no-show", requireRoles("receptionist", "staff_nurse", "clinician_doctor", "super_admin"), controller.markNoShow);
router.patch("/:appointmentId/recall", requireRoles("clinician_doctor", "super_admin"), controller.recallToken);
router.patch("/:appointmentId/priority", requireRoles("receptionist", "staff_nurse", "super_admin"), controller.setPriority);

// Doctor Desk Queue Board
router.get("/doctor/:doctorId", requireRoles("clinician_doctor", "staff_nurse", "receptionist", "super_admin"), controller.getDoctorQueue);

module.exports = router;
