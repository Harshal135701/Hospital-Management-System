const service = require("./assets.service");

// 14.1 Asset Master & Barcode Tagging
async function createAsset(req, res, next) {
  try {
    const data = await service.createAsset(req.body);
    res.status(201).json({ success: true, message: "Hospital asset registered", data });
  } catch (err) {
    next(err);
  }
}

async function getAssets(req, res, next) {
  try {
    const data = await service.getAssets(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getAssetById(req, res, next) {
  try {
    const data = await service.getAssetById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateAssetStatus(req, res, next) {
  try {
    const data = await service.updateAssetStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Asset status updated", data });
  } catch (err) {
    next(err);
  }
}

// 14.2 AMC / CMC Service Contracts & Warranties
async function createContract(req, res, next) {
  try {
    const data = await service.createContract(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Service contract registered", data });
  } catch (err) {
    next(err);
  }
}

async function getContractsByAsset(req, res, next) {
  try {
    const data = await service.getContractsByAsset(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// 14.3 Preventive Maintenance Scheduling
async function createPmSchedule(req, res, next) {
  try {
    const data = await service.createPmSchedule(req.params.id, req.body);
    res.status(201).json({ success: true, message: "PM schedule created", data });
  } catch (err) {
    next(err);
  }
}

async function getPmSchedules(req, res, next) {
  try {
    const data = await service.getPmSchedules(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updatePmSchedule(req, res, next) {
  try {
    const data = await service.updatePmSchedule(req.params.scheduleId, req.body);
    res.status(200).json({ success: true, message: "PM schedule updated", data });
  } catch (err) {
    next(err);
  }
}

// 14.4 Breakdown Reporting & Work Ticket
async function createBreakdownTicket(req, res, next) {
  try {
    const data = await service.createBreakdownTicket(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Breakdown work ticket filed", data });
  } catch (err) {
    next(err);
  }
}

async function getBreakdownTickets(req, res, next) {
  try {
    const data = await service.getBreakdownTickets(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateBreakdownTicket(req, res, next) {
  try {
    const data = await service.updateBreakdownTicket(req.params.ticketId, req.body);
    res.status(200).json({ success: true, message: "Work ticket updated", data });
  } catch (err) {
    next(err);
  }
}

// 14.5 Asset Depreciation Calculation
async function calculateDepreciation(req, res, next) {
  try {
    const data = await service.calculateDepreciation(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Depreciation calculated", data });
  } catch (err) {
    next(err);
  }
}

async function getDepreciationByAsset(req, res, next) {
  try {
    const data = await service.getDepreciationByAsset(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
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
