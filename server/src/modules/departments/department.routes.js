const express = require("express");
const router = express.Router();
const controller = require("./department.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

router.use(authenticateToken);

router.get(
  "/",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getDepartments
);

router.get(
  "/:id",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getDepartmentById
);

router.post(
  "/",
  requireRoles("super_admin", "receptionist"),
  controller.createDepartment
);

router.put(
  "/:id",
  requireRoles("super_admin", "receptionist"),
  controller.updateDepartment
);

router.patch(
  "/:id/status",
  requireRoles("super_admin", "receptionist"),
  controller.toggleDepartmentStatus
);

module.exports = router;
