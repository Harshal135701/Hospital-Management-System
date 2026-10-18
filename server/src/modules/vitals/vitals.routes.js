const express = require('express');
const router = express.Router();
const controller = require('./vitals.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// Record vitals: Doctors, Nurses, and Super Admin
router.post(
  '/',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.createVitals
);

// View vitals for an encounter
router.get(
  '/:encounterId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getVitalsByEncounterId
);

module.exports = router;
