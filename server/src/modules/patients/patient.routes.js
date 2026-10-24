const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

// Protected Patient Routes with RBAC
router.get(
  '/',
  authenticateToken,
  requireRoles('receptionist', 'clinician_doctor', 'staff_nurse', 'blood_bank_officer', 'super_admin'),
  (req, res, next) => patientController.getPatients(req, res, next)
);

router.post(
  '/check-duplicates',
  authenticateToken,
  requireRoles('receptionist', 'super_admin'),
  (req, res, next) => patientController.checkDuplicates(req, res, next)
);

router.get(
  '/id/:id',
  authenticateToken,
  requireRoles('receptionist', 'clinician_doctor', 'staff_nurse', 'blood_bank_officer', 'lab_technician', 'super_admin'),
  (req, res, next) => patientController.getPatientById(req, res, next)
);

router.get(
  '/:uhid',
  authenticateToken,
  requireRoles('receptionist', 'clinician_doctor', 'staff_nurse', 'blood_bank_officer', 'lab_technician', 'super_admin'),
  (req, res, next) => patientController.getPatientByUhid(req, res, next)
);

router.post(
  '/',
  authenticateToken,
  requireRoles('receptionist', 'super_admin'),
  (req, res, next) => patientController.createPatient(req, res, next)
);

router.put(
  '/:id',
  authenticateToken,
  requireRoles('receptionist', 'super_admin'),
  (req, res, next) => patientController.updatePatient(req, res, next)
);

module.exports = router;
