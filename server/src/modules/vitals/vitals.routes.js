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

// View historical vitals across encounters for a patient
router.get(
  '/patient/:patientId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getVitalsByPatientId
);

module.exports = router;
