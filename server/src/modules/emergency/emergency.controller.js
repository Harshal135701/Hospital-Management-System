const service = require("./emergency.service");

async function createTriage(req, res, next) {
  try {
    const data = await service.createTriage(req.body);
    res.status(201).json({ success: true, message: "Emergency triage recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getTriageList(req, res, next) {
  try {
    const data = await service.getTriageList(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getTriageById(req, res, next) {
  try {
    const data = await service.getTriageById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createMlc(req, res, next) {
  try {
    const data = await service.createMlc(req.body);
    res.status(201).json({ success: true, message: "MLC registered successfully", data });
  } catch (err) {
    next(err);
  }
}

async function getMlcList(req, res, next) {
  try {
    const data = await service.getMlcList(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createBay(req, res, next) {
  try {
    const data = await service.createBay(req.body);
    res.status(201).json({ success: true, message: "Emergency bay created", data });
  } catch (err) {
    next(err);
  }
}

async function getBays(req, res, next) {
  try {
    const data = await service.getBays(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function allocateBay(req, res, next) {
  try {
    const data = await service.allocateBay(req.params.id, req.body.bay_id, req.body.allocated_by);
    res.status(200).json({ success: true, message: "Bay allocated to triage", data });
  } catch (err) {
    next(err);
  }
}

async function vacateBay(req, res, next) {
  try {
    const data = await service.vacateBay(req.params.id);
    res.status(200).json({ success: true, message: "Bay vacated", data });
  } catch (err) {
    next(err);
  }
}

async function createTraumaChart(req, res, next) {
  try {
    const data = await service.createTraumaChart(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Trauma charting recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getTraumaChartByTriage(req, res, next) {
  try {
    const data = await service.getTraumaChartByTriage(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createDisposition(req, res, next) {
  try {
    const data = await service.createDisposition(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Rapid disposition recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getDispositionByTriage(req, res, next) {
  try {
    const data = await service.getDispositionByTriage(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
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
