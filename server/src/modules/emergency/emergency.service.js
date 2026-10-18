const repository = require("./emergency.repository");
const ApiError = require("../../utils/ApiError");

async function createTriage(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.triage_level) throw ApiError.badRequest("triage_level is required (1 to 4)");
  if (!data.chief_complaint) throw ApiError.badRequest("chief_complaint is required");

  if (!data.triage_number) {
    data.triage_number = `ED-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createTriage(data);
}

async function getTriageList(filters) {
  return repository.getTriageList(filters);
}

async function getTriageById(id) {
  const triage = await repository.getTriageById(id);
  if (!triage) throw ApiError.notFound("Triage record not found");
  return triage;
}

async function createMlc(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.police_station) throw ApiError.badRequest("police_station is required");
  if (!data.case_type) throw ApiError.badRequest("case_type is required (e.g. RTA, assault, poisoning)");
  if (!data.injury_details) throw ApiError.badRequest("injury_details is required");

  if (!data.mlc_number) {
    data.mlc_number = `MLC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return repository.createMlc(data);
}

async function getMlcList(filters) {
  return repository.getMlcList(filters);
}

async function createBay(data) {
  if (!data.code || !data.zone || !data.bay_number) {
    throw ApiError.badRequest("code, zone, and bay_number are required");
  }
  return repository.createBay(data);
}

async function getBays(filters) {
  return repository.getBays(filters);
}

async function allocateBay(triageId, bayId, allocatedBy) {
  const triage = await repository.getTriageById(triageId);
  if (!triage) throw ApiError.notFound("Triage record not found");
  return repository.allocateBay(triageId, bayId, allocatedBy);
}

async function vacateBay(triageId) {
  const triage = await repository.getTriageById(triageId);
  if (!triage) throw ApiError.notFound("Triage record not found");
  return repository.vacateBay(triageId);
}

async function createTraumaChart(triageId, data) {
  if (!data.airway_status || !data.breathing_status || !data.circulation_status || !data.disability_neuro) {
    throw ApiError.badRequest("ABCDE parameters (airway, breathing, circulation, disability) are required");
  }
  const triage = await repository.getTriageById(triageId);
  if (!triage) throw ApiError.notFound("Triage record not found");
  return repository.createTraumaChart({ triage_id: triageId, ...data });
}

async function getTraumaChartByTriage(triageId) {
  return repository.getTraumaChartByTriage(triageId);
}

async function createDisposition(triageId, data) {
  if (!data.disposition_type) throw ApiError.badRequest("disposition_type is required (e.g. ICU, OT, Inpatient_Ward, Transfer_Out, Discharged)");
  if (!data.handover_summary) throw ApiError.badRequest("handover_summary is required");

  const triage = await repository.getTriageById(triageId);
  if (!triage) throw ApiError.notFound("Triage record not found");
  return repository.createDisposition({ triage_id: triageId, ...data });
}

async function getDispositionByTriage(triageId) {
  const disposition = await repository.getDispositionByTriage(triageId);
  if (!disposition) throw ApiError.notFound("Disposition record not found for this triage");
  return disposition;
}

module.exports = {
  createTriage,
  getTriageList,
  getTriageById,
  createMlc,
  getMlcList,
  createBay,
  getBays,
  allocateBay,
  vacateBay,
  createTraumaChart,
  getTraumaChartByTriage,
  createDisposition,
  getDispositionByTriage,
};
