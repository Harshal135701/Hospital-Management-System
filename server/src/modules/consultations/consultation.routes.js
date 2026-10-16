const express = require('express');
const router = express.Router();
const controller = require('./consultation.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// 1. Start consultation encounter: clinicians or admin
router.post(
  '/',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.createEncounter
);

// 2. Lookup encounter by appointment UUID (for frontend hydration)
router.get(
  '/appointment/:appointmentId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getEncounterByAppointmentId
);

// 3. List encounters: scoped by doctor, nurses see active care
router.get(
  '/',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getEncounters
);

// 4. Get single encounter by ID
router.get(
  '/:id',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getEncounterById
);

// 5. Complete encounter: attending clinician or admin
router.patch(
  '/:id/complete',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.completeEncounter
);

module.exports = router;
