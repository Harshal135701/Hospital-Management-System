const express = require("express");
const controller = require("./donor-compensation.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.get(
  "/",
  requireRoles("receptionist", "clinician_doctor", "super_admin"),
  controller.getCompensations
);

router.post(
  "/",
  requireRoles("receptionist", "super_admin"),
  controller.createCompensation
);

module.exports = router;
