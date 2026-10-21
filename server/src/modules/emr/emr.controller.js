const service = require("./emr.service");

// 12.1 Longitudinal Patient Lifetime Timeline
async function getPatientTimeline(req, res, next) {
  try {
    const data = await service.getPatientTimeline(req.params.patient_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// 12.2 E-Prescription (Rx) Studio
async function createPrescription(req, res, next) {
  try {
    const data = await service.createPrescription(req.body, req.user);
    res.status(201).json({ success: true, message: "E-prescription generated successfully", data });
  } catch (err) {
    next(err);
  }
}

async function getPrescriptions(req, res, next) {
  try {
    const data = await service.getPrescriptions(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getPrescriptionById(req, res, next) {
  try {
    const data = await service.getPrescriptionById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markPrescriptionDispensed(req, res, next) {
  try {
    const data = await service.markPrescriptionDispensed(req.params.id);
    res.status(200).json({ success: true, message: "Prescription marked as dispensed", data });
  } catch (err) {
    next(err);
  }
}

// 12.3 ICD-10 & SNOMED Diagnosis Coding
async function createDiagnosis(req, res, next) {
  try {
    const data = await service.createDiagnosis(req.body);
    res.status(201).json({ success: true, message: "Diagnosis coded and saved", data });
  } catch (err) {
    next(err);
  }
}

async function getDiagnoses(req, res, next) {
  try {
    const data = await service.getDiagnoses(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateDiagnosisStatus(req, res, next) {
  try {
    const data = await service.updateDiagnosisStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Diagnosis status updated", data });
  } catch (err) {
    next(err);
  }
}

// 12.4 Previous Encounters Browser
async function getPreviousEncounters(req, res, next) {
  try {
    const data = await service.getPreviousEncounters(req.params.patient_id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// 12.5 Clinical Document Attachments
async function createDocument(req, res, next) {
  try {
    const data = await service.createDocument(req.body);
    res.status(201).json({ success: true, message: "Document attached successfully", data });
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const data = await service.getDocuments(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const data = await service.deleteDocument(req.params.id);
    res.status(200).json({ success: true, message: "Document deleted", data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPatientTimeline,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  markPrescriptionDispensed,
  createDiagnosis,
  getDiagnoses,
  updateDiagnosisStatus,
  getPreviousEncounters,
  createDocument,
  getDocuments,
  deleteDocument,
};
