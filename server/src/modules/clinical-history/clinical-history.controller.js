const service = require("./clinical-history.service");

async function createClinicalHistory(req, res, next) {
  try {
    const history = await service.createClinicalHistory(req.body);

    res.status(201).json({
      success: true,
      message: "Clinical history recorded successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

async function getClinicalHistoryByEncounterId(req, res, next) {
  try {
    const history = await service.getClinicalHistoryByEncounterId(
      req.params.encounterId
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

async function updateClinicalHistory(req, res, next) {
  try {
    const history = await service.updateClinicalHistory(
      req.params.encounterId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Clinical history updated successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};