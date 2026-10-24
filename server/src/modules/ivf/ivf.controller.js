const service = require("./ivf.service");

async function createCycle(req, res, next) {
  try {
    const data = await service.createCycle(req.body);
    res.status(201).json({ success: true, message: "IVF cycle created", data });
  } catch (err) {
    next(err);
  }
}

async function getCycles(req, res, next) {
  try {
    const data = await service.getCycles(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getCycleById(req, res, next) {
  try {
    const data = await service.getCycleById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function recordOpu(req, res, next) {
  try {
    const data = await service.recordOpu(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Oocyte retrieval recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getOpuByCycle(req, res, next) {
  try {
    const data = await service.getOpuByCycle(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function recordFertilization(req, res, next) {
  try {
    const data = await service.recordFertilization(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Fertilization recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getFertilizationByCycle(req, res, next) {
  try {
    const data = await service.getFertilizationByCycle(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createEmbryo(req, res, next) {
  try {
    const data = await service.createEmbryo(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Embryo recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getEmbryosByCycle(req, res, next) {
  try {
    const data = await service.getEmbryosByCycle(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateEmbryo(req, res, next) {
  try {
    const data = await service.updateEmbryo(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Embryo updated", data });
  } catch (err) {
    next(err);
  }
}

async function recordTransfer(req, res, next) {
  try {
    const data = await service.recordTransfer(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Embryo transfer protocol recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getTransfersByCycle(req, res, next) {
  try {
    const data = await service.getTransfersByCycle(req.params.id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function storeEmbryo(req, res, next) {
  try {
    const data = await service.storeEmbryo(req.params.embryoId, req.body);
    res.status(201).json({ success: true, message: "Embryo cryostored successfully", data });
  } catch (err) {
    next(err);
  }
}

async function getCryostorage(req, res, next) {
  try {
    const data = await service.getCryostorage(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateCryostorageDisposition(req, res, next) {
  try {
    const data = await service.updateCryostorageDisposition(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Cryostorage disposition updated", data });
  } catch (err) {
    next(err);
  }
}

async function getAllOpus(req, res, next) {
  try {
    const data = await service.getAllOpus(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getAllFertilizations(req, res, next) {
  try {
    const data = await service.getAllFertilizations(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getAllEmbryos(req, res, next) {
  try {
    const data = await service.getAllEmbryos(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getAllTransfers(req, res, next) {
  try {
    const data = await service.getAllTransfers(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllOpus,
  getAllFertilizations,
  getAllEmbryos,
  getAllTransfers,
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
