const repository = require("./emr.repository");
const ApiError = require("../../utils/ApiError");

async function createPrescription(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw ApiError.badRequest("At least one prescription medication item is required");
  }

  if (!data.rx_number) {
    data.rx_number = `RX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createPrescription(data);
}

async function getPrescriptions(filters) {
  return repository.getPrescriptions(filters);
}

async function getPrescriptionById(id) {
  const rx = await repository.getPrescriptionById(id);
  if (!rx) throw ApiError.notFound("Prescription not found");
  return rx;
}

async function markPrescriptionDispensed(id) {
  const rx = await repository.markPrescriptionDispensed(id);
  if (!rx) throw ApiError.notFound("Prescription not found");
  return rx;
}

async function createDiagnosis(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.icd10_code || !data.icd10_description) {
    throw ApiError.badRequest("icd10_code and icd10_description are required");
  }
  return repository.createDiagnosis(data);
}

async function getDiagnoses(filters) {
  return repository.getDiagnoses(filters);
}

async function updateDiagnosisStatus(id, status) {
  const valid = ["active", "resolved", "chronic", "in_remission", "inactive"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid diagnosis status. Allowed: ${valid.join(", ")}`);
  }
  const diag = await repository.updateDiagnosisStatus(id, status);
  if (!diag) throw ApiError.notFound("Diagnosis not found");
  return diag;
}

async function createDocument(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.document_title || !data.file_url || !data.file_name) {
    throw ApiError.badRequest("document_title, file_name, and file_url are required");
  }
  if (!data.document_category) data.document_category = "General_Report";
  return repository.createDocument(data);
}

async function getDocuments(filters) {
  return repository.getDocuments(filters);
}

async function deleteDocument(id) {
  const doc = await repository.deleteDocument(id);
  if (!doc) throw ApiError.notFound("Document not found");
  return doc;
}

async function getPreviousEncounters(patientId) {
  return repository.getPreviousEncounters(patientId);
}

async function getPatientTimeline(patientId) {
  return repository.getPatientTimeline(patientId);
}

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  markPrescriptionDispensed,
  createDiagnosis,
  getDiagnoses,
  updateDiagnosisStatus,
  createDocument,
  getDocuments,
  deleteDocument,
  getPreviousEncounters,
  getPatientTimeline,
};
