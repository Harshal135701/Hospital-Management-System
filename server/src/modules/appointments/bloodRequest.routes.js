
const express = require("express");
const router = express.Router();
const controller = require("./bloodRequest.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

router.post(
  "/",
  requireRoles("clinician_doctor", "blood_bank_officer", "super_admin"),
  controller.createBloodRequest
);

router.get(
  "/",
  requireRoles(
    "clinician_doctor",
    "blood_bank_officer",
    "lab_technician",
    "staff_nurse",
    "super_admin"
  ),
  controller.getBloodRequests
);

router.get(
  "/:id",
  requireRoles(
    "clinician_doctor",
    "blood_bank_officer",
    "lab_technician",
    "staff_nurse",
    "super_admin"
  ),
  controller.getBloodRequestById
);

router.patch(
  "/:id/status",
  requireRoles("blood_bank_officer", "clinician_doctor", "super_admin"),
  controller.updateBloodRequestStatus
);

module.exports = router;
