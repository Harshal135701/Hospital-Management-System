const repository = require("./emr.repository");
const ApiError = require("../../utils/ApiError");

async function createPrescription(data, currentUser = {}) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw ApiError.badRequest("At least one prescription medication item is required");
  }

  let doctorId;
  if (currentUser.role === "clinician_doctor") {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden("Clinician account is not linked to an active doctor profile");
    }
    if (data.doctor_id && String(data.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden("Clinician doctors may only issue prescriptions under their own doctor identity");
    }
    if (data.prescribed_by && String(data.prescribed_by) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden("Clinician doctors may only issue prescriptions under their own doctor identity");
    }
    doctorId = currentUser.doctor_id;
  } else if (currentUser.role === "super_admin") {
    doctorId = data.doctor_id || data.prescribed_by || currentUser.doctor_id || null;
  } else {
    throw ApiError.forbidden("Only clinician doctors and administrators may issue prescriptions");
  }

  data.doctor_id = doctorId;
  data.prescribed_by = doctorId;

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
