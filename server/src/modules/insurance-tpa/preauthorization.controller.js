const service = require("./preauthorization.service");

async function createPreauthorization(req, res, next) {
  try {
    const data = await service.createPreauthorization(req.body);

    res.status(201).json({
      success: true,
      message: "Pre-authorization request created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getPreauthorizations(req, res, next) {
  try {
    const data = await service.getPreauthorizations({
      patient_id: req.query.patient_id,
      status: req.query.status,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getPreauthorizationById(req, res, next) {
  try {
    const data = await service.getPreauthorizationById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function submitPreauthorization(req, res, next) {
  try {
    const data = await service.submitPreauthorization(req.params.id);

    res.status(200).json({
      success: true,
      message: "Pre-authorization request submitted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function recordDecision(req, res, next) {
  try {
    const data = await service.recordDecision(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Pre-authorization decision recorded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPreauthorization,
  getPreauthorizations,
  getPreauthorizationById,
  submitPreauthorization,
  recordDecision,
};