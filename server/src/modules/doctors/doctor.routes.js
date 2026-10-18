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

module.exports = router;
