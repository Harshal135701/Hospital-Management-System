const service = require("./enterprise.service");

// 15.1 Hospital & Branch Master
async function createHospital(req, res, next) {
  try {
    const data = await service.createHospital(req.body);
    res.status(201).json({ success: true, message: "Hospital created", data });
  } catch (err) {
    next(err);
  }
}

async function getHospitals(req, res, next) {
  try {
    const data = await service.getHospitals();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createBranch(req, res, next) {
  try {
    const data = await service.createBranch(req.params.hospitalId, req.body);
    res.status(201).json({ success: true, message: "Branch added to hospital", data });
  } catch (err) {
    next(err);
  }
}

async function getBranches(req, res, next) {
  try {
    const data = await service.getBranches(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// 15.2 Department & Clinic Hierarchy
async function createClinic(req, res, next) {
  try {
    const data = await service.createClinic(req.body);
    res.status(201).json({ success: true, message: "Clinic created", data });
  } catch (err) {
    next(err);
  }
}

async function getClinics(req, res, next) {
  try {
    const data = await service.getClinics(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getFullHierarchy(req, res, next) {
  try {
    const data = await service.getFullHierarchy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 15.3 Doctor & Consultant Master
async function createDoctor(req, res, next) {
  try {
    const data = await service.createDoctor(req.body);
    res.status(201).json({ success: true, message: "Doctor profile created", data });
  } catch (err) {
    next(err);
  }
}

async function getDoctors(req, res, next) {
  try {
    const data = await service.getDoctors(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function getDoctorById(req, res, next) {
  try {
    const data = await service.getDoctorById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateDoctor(req, res, next) {
  try {
    const data = await service.updateDoctor(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Doctor profile updated", data });
  } catch (err) {
    next(err);
  }
}

// 15.4 Service Catalog & Tariff Master
async function createService(req, res, next) {
  try {
    const data = await service.createService(req.body);
    res.status(201).json({ success: true, message: "Service catalog item created", data });
  } catch (err) {
    next(err);
  }
}

async function getServices(req, res, next) {
  try {
    const data = await service.getServices(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const data = await service.updateService(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Service item updated", data });
  } catch (err) {
    next(err);
  }
}

// 15.5 Corporate Tariff Rate Contracts
async function createCorporateTariff(req, res, next) {
  try {
    const data = await service.createCorporateTariff(req.body);
    res.status(201).json({ success: true, message: "Corporate tariff contract established", data });
  } catch (err) {
    next(err);
  }
}

async function getCorporateTariffs(req, res, next) {
  try {
    const data = await service.getCorporateTariffs(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateCorporateTariff(req, res, next) {
  try {
    const data = await service.updateCorporateTariff(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Corporate tariff contract updated", data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createHospital,
  getHospitals,
  createBranch,
  getBranches,
  createClinic,
  getClinics,
  getFullHierarchy,
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  createService,
  getServices,
  updateService,
  createCorporateTariff,
  getCorporateTariffs,
  updateCorporateTariff,
};
