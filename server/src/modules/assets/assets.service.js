const repository = require("./assets.repository");
const ApiError = require("../../utils/ApiError");

async function createAsset(data) {
  if (!data.asset_name || !data.category || !data.purchase_cost) {
    throw ApiError.badRequest("asset_name, category, and purchase_cost are required");
  }

  if (!data.asset_tag) {
    data.asset_tag = `AST-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  if (!data.serial_number) {
    data.serial_number = `SN-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  return repository.createAsset(data);
}

async function getAssets(filters) {
  return repository.getAssets(filters);
}

async function getAssetById(id) {
  const asset = await repository.getAssetById(id);
  if (!asset) throw ApiError.notFound("Asset not found");
  return asset;
}

async function updateAssetStatus(id, status) {
  const valid = ["in_service", "under_maintenance", "breakdown", "decommissioned", "disposed"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid asset status: ${status}`);
  }
  const asset = await repository.updateAssetStatus(id, status);
  if (!asset) throw ApiError.notFound("Asset not found");
  return asset;
}

async function createContract(assetId, data) {
  if (!data.contract_type || !data.vendor_name || !data.start_date || !data.end_date || !data.contract_value) {
    throw ApiError.badRequest("contract_type, vendor_name, start_date, end_date, and contract_value are required");
  }
  const asset = await repository.getAssetById(assetId);
  if (!asset) throw ApiError.notFound("Asset not found");
  return repository.createContract({ asset_id: assetId, ...data });
}

async function getContractsByAsset(assetId) {
  return repository.getContractsByAsset(assetId);
}

async function createPmSchedule(assetId, data) {
  if (!data.task_title || !data.next_due_date) {
    throw ApiError.badRequest("task_title and next_due_date are required");
  }
  const asset = await repository.getAssetById(assetId);
  if (!asset) throw ApiError.notFound("Asset not found");
  return repository.createPmSchedule({ asset_id: assetId, ...data });
}

async function getPmSchedules(filters) {
  return repository.getPmSchedules(filters);
}

async function updatePmSchedule(id, data) {
  const schedule = await repository.updatePmSchedule(id, data);
  if (!schedule) throw ApiError.notFound("PM schedule not found");
  return schedule;
}

async function createBreakdownTicket(assetId, data) {
  if (!data.reported_by || !data.issue_description) {
    throw ApiError.badRequest("reported_by and issue_description are required");
  }
  const asset = await repository.getAssetById(assetId);
  if (!asset) throw ApiError.notFound("Asset not found");

  if (!data.ticket_number) {
    data.ticket_number = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createBreakdownTicket({ asset_id: assetId, ...data });
}

async function getBreakdownTickets(filters) {
  return repository.getBreakdownTickets(filters);
}

async function updateBreakdownTicket(id, data) {
  const ticket = await repository.updateBreakdownTicket(id, data);
  if (!ticket) throw ApiError.notFound("Breakdown ticket not found");
  return ticket;
}

// 14.5 Asset Depreciation Calculation
async function calculateDepreciation(assetId, data) {
  const asset = await repository.getAssetById(assetId);
  if (!asset) throw ApiError.notFound("Asset not found");

  const purchaseCost = Number(asset.purchase_cost);
  const salvageValue = Number(data.salvage_value || 0);
  const usefulLifeYears = Number(data.useful_life_years || 7);
  const method = data.method || "SLM";

  // Calculate elapsed years since purchase
  const purchaseDate = new Date(asset.purchase_date);
  const now = new Date();
  const elapsedYears = Math.max(0.5, (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25));

  let annualDepRate = 0;
  let accumulatedDep = 0;
  let currentBookValue = purchaseCost;

  if (method === "SLM") {
    const annualDep = (purchaseCost - salvageValue) / usefulLifeYears;
    annualDepRate = (annualDep / purchaseCost) * 100;
    accumulatedDep = Math.min(purchaseCost - salvageValue, annualDep * elapsedYears);
    currentBookValue = Math.max(salvageValue, purchaseCost - accumulatedDep);
  } else {
    // Written Down Value (WDV)
    annualDepRate = (1 - Math.pow(salvageValue / purchaseCost, 1 / usefulLifeYears)) * 100;
    if (isNaN(annualDepRate) || annualDepRate <= 0) annualDepRate = 15;
    currentBookValue = purchaseCost * Math.pow(1 - annualDepRate / 100, elapsedYears);
    currentBookValue = Math.max(salvageValue, currentBookValue);
    accumulatedDep = purchaseCost - currentBookValue;
  }

  const record = {
    asset_id: assetId,
    method,
    useful_life_years: usefulLifeYears,
    salvage_value: salvageValue,
    annual_depreciation_rate: annualDepRate.toFixed(2),
    current_book_value: currentBookValue.toFixed(2),
    accumulated_depreciation: accumulatedDep.toFixed(2),
  };

  return repository.createDepreciationRecord(record);
}

async function getDepreciationByAsset(assetId) {
  return repository.getDepreciationByAsset(assetId);
}

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAssetStatus,
  createContract,
  getContractsByAsset,
  createPmSchedule,
  getPmSchedules,
  updatePmSchedule,
  createBreakdownTicket,
  getBreakdownTickets,
  updateBreakdownTicket,
  calculateDepreciation,
  getDepreciationByAsset,
};
