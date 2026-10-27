const express = require('express');
const router = express.Router();
const controller = require('./radiology.controller');
const {
  authenticateToken,
  requireRoles
} = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// 27.1 Modality Scheduling & MWL
router.get('/modalities', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.getModalities);
router.get('/studies', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.getStudies);
router.get('/studies/:id', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.getStudyById);
router.post('/studies', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.scheduleStudy);
router.patch('/studies/:id/status', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse'), controller.updateStudyStatus);

// 27.2 & 27.3 DICOM PACS Acquisition & Viewer telemetry
router.get('/pacs/status', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.getPacsStatus);

// 27.4 & 27.5 Structured Reporting, Verification & Distribution
router.get('/reports/:studyId', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse', 'receptionist'), controller.getReport);
router.post('/reports', requireRoles('super_admin', 'clinician_doctor', 'staff_nurse'), controller.saveReport);
router.patch('/reports/:id/verify', requireRoles('super_admin', 'clinician_doctor'), controller.verifyReport);
router.post('/reports/:id/distribute', requireRoles('super_admin', 'clinician_doctor'), controller.distributeReport);

module.exports = router;
