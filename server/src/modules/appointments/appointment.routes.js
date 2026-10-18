
const express = require("express");
const router = express.Router();

const controller = require("./appointment.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

// All appointment operations require authentication.
router.use(authenticateToken);

// 3.1 Book / Reschedule Appointment Endpoints

router.post(
  "/",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.createAppointment
);

router.get(
  "/",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "blood_bank_officer",
    "super_admin"
  ),
  controller.getAppointments
);

router.get(
  "/available-slots",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.getAvailableSlots
);

router.get(
  "/patient/:patientId",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.getPatientHistory
);

router.get(
  "/:id",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.getAppointmentById
);

router.patch(
  "/:id/reschedule",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.rescheduleAppointment
);

router.patch(
  "/:id/cancel",
  requireRoles(
    "receptionist",
    "clinician_doctor",
    "staff_nurse",
    "super_admin"
  ),
  controller.cancelAppointment
);

router.patch(
  "/:id/status",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "super_admin"),
  controller.updateAppointmentStatus
);

module.exports = router;
