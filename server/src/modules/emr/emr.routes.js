const express = require("express");
const router = express.Router();
const controller = require("./emr.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 12.1 Longitudinal Patient Lifetime Timeline
router.get("/timeline/:patient_id", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getPatientTimeline);

// 12.2 E-Prescription (Rx) Studio
router.post("/prescriptions", requireRoles("clinician_doctor", "super_admin"), controller.createPrescription);
router.get("/prescriptions", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getPrescriptions);
router.get("/prescriptions/:id", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getPrescriptionById);
router.patch("/prescriptions/:id/dispense", requireRoles("staff_nurse", "super_admin"), controller.markPrescriptionDispensed);

// 12.3 ICD-10 & SNOMED Diagnosis Coding
router.post("/diagnoses", requireRoles("clinician_doctor", "super_admin"), controller.createDiagnosis);
router.get("/diagnoses", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getDiagnoses);
router.patch("/diagnoses/:id/status", requireRoles("clinician_doctor", "super_admin"), controller.updateDiagnosisStatus);

// 12.4 Previous Encounters Browser
router.get("/encounters/:patient_id", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getPreviousEncounters);

// 12.5 Clinical Document Attachments
router.post("/documents", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.createDocument);
router.get("/documents", requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"), controller.getDocuments);
router.delete("/documents/:id", requireRoles("super_admin", "clinician_doctor"), controller.deleteDocument);

module.exports = router;
