const express = require("express");
const router = express.Router();
const controller = require("./bloodRequest.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

// Require authentication for all blood-request operations
router.use(authenticateToken);

// Creation restricted to prescribers (clinicians) and blood bank officers
router.post(
  "/",
  requireRoles("clinician_doctor", "blood_bank_officer", "super_admin"),
  controller.createBloodRequest
);

// Read access for clinical staff, nursing, and transfusion medicine
router.get(
  "/",
  requireRoles("clinician_doctor", "blood_bank_officer", "lab_technician", "staff_nurse", "super_admin"),
  controller.getBloodRequests
);

router.get(
  "/:id",
  requireRoles("clinician_doctor", "blood_bank_officer", "lab_technician", "staff_nurse", "super_admin"),
  controller.getBloodRequestById
);

// Status updates restricted to blood bank officers, ordering clinicians, and super admins
router.patch(
  "/:id/status",
  requireRoles("blood_bank_officer", "clinician_doctor", "super_admin"),
  controller.updateBloodRequestStatus
);

module.exports = router;
