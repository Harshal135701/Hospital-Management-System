const express = require('express');
const router = express.Router();
const bloodBankController = require('./bloodbank.controller');

// 5.1 Donors & Screenings
router.get('/donors', (req, res, next) => bloodBankController.getDonors(req, res, next));
router.get('/donors/:id', (req, res, next) => bloodBankController.getDonorById(req, res, next));
router.post('/donors', (req, res, next) => bloodBankController.createDonor(req, res, next));
router.post('/screenings', (req, res, next) => bloodBankController.createScreening(req, res, next));

// 5.2 Bag Collection & Phlebotomy
router.get('/donations', (req, res, next) => bloodBankController.getDonations(req, res, next));
router.post('/donations', (req, res, next) => bloodBankController.createDonation(req, res, next));

// 5.3 Component Inventory
router.get('/components', (req, res, next) => bloodBankController.getComponents(req, res, next));
router.post('/components', (req, res, next) => bloodBankController.createComponents(req, res, next));

// 5.4 Serology & Safe Release
router.get('/serology-workbench', (req, res, next) => bloodBankController.getSerologyWorkbench(req, res, next));
router.post('/grouping-verifications', (req, res, next) => bloodBankController.recordGroupingVerification(req, res, next));
router.post('/serology-tests', (req, res, next) => bloodBankController.recordSerologyTest(req, res, next));
router.post('/release-authorizations', (req, res, next) => bloodBankController.authorizeSafeRelease(req, res, next));

// 5.5 Requisitions & Crossmatching
router.get('/requisitions', (req, res, next) => bloodBankController.getRequisitions(req, res, next));
router.post('/requisitions', (req, res, next) => bloodBankController.createRequisition(req, res, next));
router.post('/crossmatches', (req, res, next) => bloodBankController.recordCrossmatch(req, res, next));

// Reservations
router.post('/reservations', (req, res, next) => bloodBankController.reserveComponent(req, res, next));
router.post('/reservations/cancel', (req, res, next) => bloodBankController.cancelReservation(req, res, next));

// 5.6 Issues & Handover
router.get('/issues', (req, res, next) => bloodBankController.getIssues(req, res, next));
router.post('/issues', (req, res, next) => bloodBankController.issueBloodUnit(req, res, next));

// Audit Logs
router.get('/audit-logs', (req, res, next) => bloodBankController.getAuditLogs(req, res, next));

module.exports = router;
