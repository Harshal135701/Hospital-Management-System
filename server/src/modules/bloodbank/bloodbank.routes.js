const express = require('express');
const router = express.Router();
const bloodBankController = require('./bloodbank.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

// 5.1 Donors & Screenings
router.get(
  '/donors',
  authenticateToken,
  requireRoles('phlebotomist', 'blood_bank_officer', 'super_admin'),
  (req, res, next) => bloodBankController.getDonors(req, res, next)
);

router.get(
  '/donors/:id',
  authenticateToken,
  requireRoles('phlebotomist', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.getDonorById(req, res, next)
);

router.post(
  '/donors',
  authenticateToken,
  requireRoles('phlebotomist', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.createDonor(req, res, next)
);

router.post(
  '/screenings',
  authenticateToken,
  requireRoles('phlebotomist', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.createScreening(req, res, next)
);

// 5.2 Bag Collection & Phlebotomy
router.get(
  '/donations',
  authenticateToken,
  requireRoles('phlebotomist', 'lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.getDonations(req, res, next)
);

router.post(
  '/donations',
  authenticateToken,
  requireRoles('phlebotomist', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.createDonation(req, res, next)
);

// 5.3 Component Inventory
router.get(
  '/components',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer', 'clinician_doctor', 'super_admin'),
  (req, res, next) => bloodBankController.getComponents(req, res, next)
);

router.post(
  '/components',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.createComponents(req, res, next)
);

// 5.4 Serology & Safe Release
router.get(
  '/serology-workbench',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.getSerologyWorkbench(req, res, next)
);

router.post(
  '/grouping-verifications',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.recordGroupingVerification(req, res, next)
);

router.post(
  '/serology-tests',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.recordSerologyTest(req, res, next)
);

// Exclusive Safe-Release Gate: ONLY blood_bank_officer is authorized
router.post(
  '/release-authorizations',
  authenticateToken,
  requireRoles('blood_bank_officer'),
  (req, res, next) => bloodBankController.authorizeSafeRelease(req, res, next)
);

// 5.5 Requisitions & Crossmatching
router.get(
  '/requisitions',
  authenticateToken,
  requireRoles('clinician_doctor', 'staff_nurse', 'lab_technician', 'blood_bank_officer', 'super_admin'),
  (req, res, next) => bloodBankController.getRequisitions(req, res, next)
);

router.post(
  '/requisitions',
  authenticateToken,
  requireRoles('clinician_doctor', 'staff_nurse', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.createRequisition(req, res, next)
);

router.post(
  '/crossmatches',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.recordCrossmatch(req, res, next)
);

// Reservations
router.post(
  '/reservations',
  authenticateToken,
  requireRoles('clinician_doctor', 'staff_nurse', 'lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.reserveComponent(req, res, next)
);

router.post(
  '/reservations/cancel',
  authenticateToken,
  requireRoles('clinician_doctor', 'staff_nurse', 'lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.cancelReservation(req, res, next)
);

// 5.6 Issues & Handover
router.get(
  '/issues',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer', 'staff_nurse', 'clinician_doctor'),
  (req, res, next) => bloodBankController.getIssues(req, res, next)
);

router.post(
  '/issues',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.issueBloodUnit(req, res, next)
);

// Audit Logs
router.get(
  '/audit-logs',
  authenticateToken,
  requireRoles('blood_bank_officer', 'super_admin'),
  (req, res, next) => bloodBankController.getAuditLogs(req, res, next)
);

// Storage Temperature Logs
router.get(
  '/storage-temperature-logs',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer', 'super_admin'),
  (req, res, next) => bloodBankController.getStorageTemperatureLogs(req, res, next)
);

router.post(
  '/storage-temperature-logs',
  authenticateToken,
  requireRoles('lab_technician', 'blood_bank_officer'),
  (req, res, next) => bloodBankController.recordStorageTemperatureLog(req, res, next)
);

module.exports = router;
