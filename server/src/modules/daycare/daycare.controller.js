const service = require("./daycare.service");

async function createAdmission(req, res, next) {
  try {
    const data = await service.createAdmission(req.body);
    res.status(201).json({ success: true, message: "Day care admission created", data });
  } catch (err) {
    next(err);
  }
}

async function getAdmissions(req, res, next) {
  try {
    const data = await service.getAdmissions(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getAdmissionById(req, res, next) {
  try {
    const data = await service.getAdmissionById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateAdmissionStatus(req, res, next) {
  try {
    const data = await service.updateAdmissionStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Status updated", data });
  } catch (err) {
    next(err);
  }
}

async function createChair(req, res, next) {
  try {
    const data = await service.createChair(req.body);
    res.status(201).json({ success: true, message: "Day care chair/bed registered", data });
  } catch (err) {
    next(err);
  }
}

async function getChairs(req, res, next) {
  try {
    const data = await service.getChairs(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateChairStatus(req, res, next) {
  try {
    const data = await service.updateChairStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Chair status updated", data });
  } catch (err) {
    next(err);
  }
}

async function allocateChair(req, res, next) {
  try {
    const data = await service.allocateChair(req.params.id, req.body.chair_id);
    res.status(200).json({ success: true, message: "Chair allocated successfully", data });
  } catch (err) {
    next(err);
  }
}

async function releaseChair(req, res, next) {
  try {
    const data = await service.releaseChair(req.params.id);
    res.status(200).json({ success: true, message: "Chair released successfully", data });
  } catch (err) {
    next(err);
  }
}

async function addProcedureMonitoring(req, res, next) {
  try {
    const data = await service.addProcedureMonitoring(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Procedure monitor log recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getProcedureMonitors(req, res, next) {
  try {
    const data = await service.getProcedureMonitors(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createDischargeSummary(req, res, next) {
  try {
    const data = await service.createDischargeSummary(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Same-day discharge summary created", data });
  } catch (err) {
    next(err);
  }
}

async function getDischargeSummary(req, res, next) {
  try {
    const data = await service.getDischargeSummary(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
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
