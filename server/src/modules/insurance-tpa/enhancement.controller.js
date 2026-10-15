const service = require("./enhancement.service");

async function createEnhancementRequest(req, res, next) {
  try {
    const data = await service.createEnhancementRequest(req.body);

    res.status(201).json({
      success: true,
      message: "Enhancement request created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getEnhancementRequests(req, res, next) {
  try {
    const data = await service.getEnhancementRequests({
      preauthorization_id: req.query.preauthorization_id,
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

async function getEnhancementRequestById(req, res, next) {
  try {
    const data = await service.getEnhancementRequestById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function submitEnhancementRequest(req, res, next) {
  try {
    const data = await service.submitEnhancementRequest(req.params.id);

    res.status(200).json({
      success: true,
      message: "Enhancement request submitted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function recordEnhancementDecision(req, res, next) {
  try {
    const data = await service.recordEnhancementDecision(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Enhancement decision recorded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEnhancementRequest,
  getEnhancementRequests,
  getEnhancementRequestById,
  submitEnhancementRequest,
  recordEnhancementDecision,
};