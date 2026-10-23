const express = require("express");
const router = express.Router();
const controller = require("./doctor.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

router.use(authenticateToken);

router.get(
  "/",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getDoctors
);

router.get(
  "/:id",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getDoctorById
);

router.post(
  "/",
  requireRoles("super_admin", "receptionist"),
  controller.createDoctor
);

router.put(
  "/:id",
  requireRoles("super_admin", "receptionist"),
  controller.updateDoctor
);

module.exports = router;
