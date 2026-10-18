const express = require("express");
const router = express.Router();
const controller = require("./emr.controller");

// 12.1 Longitudinal Patient Lifetime Timeline
router.get("/timeline/:patient_id", controller.getPatientTimeline);

// 12.2 E-Prescription (Rx) Studio
router.post("/prescriptions", controller.createPrescription);
router.get("/prescriptions", controller.getPrescriptions);
router.get("/prescriptions/:id", controller.getPrescriptionById);
router.patch("/prescriptions/:id/dispense", controller.markPrescriptionDispensed);

// 12.3 ICD-10 & SNOMED Diagnosis Coding
router.post("/diagnoses", controller.createDiagnosis);
router.get("/diagnoses", controller.getDiagnoses);
router.patch("/diagnoses/:id/status", controller.updateDiagnosisStatus);

// 12.4 Previous Encounters Browser
router.get("/encounters/:patient_id", controller.getPreviousEncounters);

// 12.5 Clinical Document Attachments
router.post("/documents", controller.createDocument);
router.get("/documents", controller.getDocuments);
router.delete("/documents/:id", controller.deleteDocument);

module.exports = router;
