const repository = require("./ivf.repository");
const ApiError = require("../../utils/ApiError");

async function createCycle(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.cycle_number) {
    data.cycle_number = `IVF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createCycle(data);
}

async function getCycles(filters) {
  return repository.getCycles(filters);
}

async function getCycleById(id) {
  const cycle = await repository.getCycleById(id);
  if (!cycle) throw ApiError.notFound("IVF cycle not found");
  return cycle;
}

// 10.1 OPU
async function recordOpu(cycleId, data) {
  const cycle = await repository.getCycleById(cycleId);
  if (!cycle) throw ApiError.notFound("IVF cycle not found");
  return repository.recordOpu({ cycle_id: cycleId, ...data });
}

async function getOpuByCycle(cycleId) {
  return repository.getOpuByCycle(cycleId);
}

// 10.2 Fertilization
async function recordFertilization(cycleId, data) {
  if (!data.fertilization_method) throw ApiError.badRequest("fertilization_method is required (e.g. ICSI, Conventional_IVF)");
  const cycle = await repository.getCycleById(cycleId);
  if (!cycle) throw ApiError.notFound("IVF cycle not found");
  return repository.recordFertilization({ cycle_id: cycleId, ...data });
}

async function getFertilizationByCycle(cycleId) {
  return repository.getFertilizationByCycle(cycleId);
}

// 10.3 Embryos
async function createEmbryo(cycleId, data) {
  if (!data.embryo_code) throw ApiError.badRequest("embryo_code is required");
  const cycle = await repository.getCycleById(cycleId);
  if (!cycle) throw ApiError.notFound("IVF cycle not found");
  return repository.createEmbryo({ cycle_id: cycleId, ...data });
}

async function getEmbryosByCycle(cycleId) {
  return repository.getEmbryosByCycle(cycleId);
}

async function updateEmbryo(id, data) {
  const embryo = await repository.updateEmbryo(id, data);
  if (!embryo) throw ApiError.notFound("Embryo not found");
  return embryo;
}

// 10.4 Embryo Transfer
async function recordTransfer(cycleId, data) {
  const cycle = await repository.getCycleById(cycleId);
  if (!cycle) throw ApiError.notFound("IVF cycle not found");
  return repository.recordTransfer({ cycle_id: cycleId, ...data });
}

async function getTransfersByCycle(cycleId) {
  return repository.getTransfersByCycle(cycleId);
}

// 10.5 Cryostorage
async function storeEmbryo(embryoId, data) {
  if (!data.tank_id || !data.canister_id || !data.straw_number) {
    throw ApiError.badRequest("tank_id, canister_id, and straw_number are required for cryostorage");
  }
  return repository.storeEmbryo({ embryo_id: embryoId, ...data });
}

async function getCryostorage(filters) {
  return repository.getCryostorage(filters);
}

async function updateCryostorageDisposition(id, data) {
  const valid = ["stored", "thawed", "discarded", "donated"];
  if (data.disposition && !valid.includes(data.disposition)) {
    throw ApiError.badRequest(`Invalid disposition: ${data.disposition}`);
  }
  const item = await repository.updateCryostorageDisposition(id, data);
  if (!item) throw ApiError.notFound("Cryostorage entry not found");
  return item;
}

module.exports = {
  createCycle,
  getCycles,
  getCycleById,
  recordOpu,
  getOpuByCycle,
  recordFertilization,
  getFertilizationByCycle,
  createEmbryo,
  getEmbryosByCycle,
  updateEmbryo,
  recordTransfer,
  getTransfersByCycle,
  storeEmbryo,
  getCryostorage,
  updateCryostorageDisposition,
};
