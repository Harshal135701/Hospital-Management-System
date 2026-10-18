const express = require("express");
const router = express.Router();

const controller = require("./clinical-history.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Create: doctors and super admins only
router.post(
  "/",
  requireRoles("clinician_doctor", "super_admin"),
  controller.createClinicalHistory
);

// Read: doctors, nurses, and super admins
router.get(
  "/:encounterId",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getClinicalHistoryByEncounterId
);

// Update: doctors and super admins only
router.patch(
  "/:encounterId",
  requireRoles("clinician_doctor", "super_admin"),
  controller.updateClinicalHistory
);

module.exports = router;