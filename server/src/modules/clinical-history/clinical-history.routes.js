const express = require('express');
const router = express.Router();
const controller = require('./clinical-history.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// Create clinical history: Doctors and Admin only (Nurses denied)
router.post(
  '/',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.createClinicalHistory
);

// View clinical history: Doctors, Nurses, and Admin
router.get(
  '/:encounterId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getClinicalHistoryByEncounterId
);

// Update clinical history: Attending doctor and Admin only
router.patch(
  '/:encounterId',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.updateClinicalHistory
);

module.exports = router;
