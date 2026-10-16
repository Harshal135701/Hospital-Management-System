const express = require('express');
const router = express.Router();
const controller = require('./clinical-notes.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// Create clinical progress note: Clinician doctors and admin only (Nurses denied)
router.post(
  '/',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.createClinicalNote
);

// View notes for encounter: Doctors, Nurses, and Admin
router.get(
  '/encounter/:encounterId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getNotesByEncounterId
);

// View single note
router.get(
  '/:id',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getClinicalNoteById
);

// Update note: Authoring doctor and Admin only
router.patch(
  '/:id',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.updateClinicalNote
);

module.exports = router;
