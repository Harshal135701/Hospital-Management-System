const express = require('express');
const router = express.Router();
const controller = require('./consultation.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// 1. Start consultation encounter: clinicians, staff nurses or admin
router.post(
  '/',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.createEncounter
);

// 2. Lookup encounter by appointment UUID (for frontend hydration)
router.get(
  '/appointment/:appointmentId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin', 'receptionist'),
  controller.getEncounterByAppointmentId
);

// 3. List encounters: scoped by doctor, nurses see active care
router.get(
  '/',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin', 'receptionist'),
  controller.getEncounters
);

// 4. Longitudinal patient clinical summary
router.get(
  '/patient/:patientId/clinical-summary',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getPatientClinicalSummary
);

// 5. Get single encounter by ID (with full aggregate data)
router.get(
  '/:id',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getEncounterById
);

// 6. Update consultation draft observations
router.patch(
  '/:id',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.updateEncounter
);

// 7. Complete encounter: attending clinician or admin
router.patch(
  '/:id/complete',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.completeEncounter
);

module.exports = router;
