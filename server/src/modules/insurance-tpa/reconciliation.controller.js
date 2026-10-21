const service = require("./reconciliation.service");

async function createReconciliation(req, res, next) {
  try {
    const result = await service.createReconciliation(req.body);
    res.status(201).json({
      success: true,
      message: "Insurance reconciliation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getReconciliations(req, res, next) {
  try {
    const data = await service.getReconciliations(req.query);
    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getReconciliationById(req, res, next) {
  try {
    const data = await service.getReconciliationById(req.params.id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function postPayment(req, res, next) {
  try {
    const data = await service.postPayment(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: "Insurer payment posted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReconciliation,
  getReconciliations,
  getReconciliationById,
  postPayment,
};