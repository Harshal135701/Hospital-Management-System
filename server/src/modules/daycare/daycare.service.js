const repository = require("./daycare.repository");
const ApiError = require("../../utils/ApiError");

async function createAdmission(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.procedure_name) throw ApiError.badRequest("procedure_name is required");

  if (!data.admission_number) {
    data.admission_number = `DC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const admission = await repository.createAdmission(data);
  if (data.chair_id) {
    await repository.updateChairStatus(data.chair_id, "occupied");
  }
  return admission;
}

async function getAdmissions(filters) {
  return repository.getAdmissions(filters);
}

async function getAdmissionById(id) {
  const admission = await repository.getAdmissionById(id);
  if (!admission) throw ApiError.notFound("Day care admission not found");
  return admission;
}

async function updateAdmissionStatus(id, status) {
  const valid = ["booked", "admitted", "in_procedure", "post_op", "discharged", "cancelled"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${valid.join(", ")}`);
  }
  const updated = await repository.updateAdmissionStatus(id, status);
  if (!updated) throw ApiError.notFound("Day care admission not found");
  return updated;
}

async function createChair(data) {
  if (!data.code || !data.name) {
    throw ApiError.badRequest("Chair code and name are required");
  }
  return repository.createChair(data);
}

async function getChairs(filters) {
  return repository.getChairs(filters);
}

async function updateChairStatus(id, status) {
  const valid = ["available", "occupied", "maintenance", "reserved"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid chair status: ${status}`);
  }
  const chair = await repository.updateChairStatus(id, status);
  if (!chair) throw ApiError.notFound("Day care chair not found");
  return chair;
}

async function allocateChair(admissionId, chairId) {
  if (!chairId) throw ApiError.badRequest("chairId is required");
  const admission = await repository.getAdmissionById(admissionId);
  if (!admission) throw ApiError.notFound("Day care admission not found");
  return repository.allocateChairToAdmission(admissionId, chairId);
}

async function releaseChair(admissionId) {
  const admission = await repository.getAdmissionById(admissionId);
  if (!admission) throw ApiError.notFound("Day care admission not found");
  return repository.releaseChairFromAdmission(admissionId);
}

async function addProcedureMonitoring(admissionId, data) {
  const admission = await repository.getAdmissionById(admissionId);
  if (!admission) throw ApiError.notFound("Day care admission not found");
  return repository.addProcedureMonitoring({
    daycare_admission_id: admissionId,
    ...data,
  });
}

async function getProcedureMonitors(admissionId) {
  return repository.getProcedureMonitors(admissionId);
}

async function createDischargeSummary(admissionId, data) {
  const admission = await repository.getAdmissionById(admissionId);
  if (!admission) throw ApiError.notFound("Day care admission not found");
  return repository.createDischargeSummary({
    daycare_admission_id: admissionId,
    ...data,
  });
}

async function getDischargeSummary(admissionId) {
  const summary = await repository.getDischargeSummary(admissionId);
  if (!summary) throw ApiError.notFound("Discharge summary not found for this admission");
  return summary;
}

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  createChair,
  getChairs,
  updateChairStatus,
  allocateChair,
  releaseChair,
  addProcedureMonitoring,
  getProcedureMonitors,
  createDischargeSummary,
  getDischargeSummary,
};
