
const service = require("./vitals.service");

async function createVitals(req, res, next) {
  try {
    const vitals = await service.createVitals(req.body);

    res.status(201).json({
      success: true,
      message: "Vitals recorded successfully",
      data: vitals,
    });
  } catch (error) {
    next(error);
  }
}

async function getVitalsByEncounterId(req, res, next) {
  try {
    const vitals = await service.getVitalsByEncounterId(
      req.params.encounterId
    );

    res.status(200).json({
      success: true,
      count: vitals.length,
      data: vitals,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVitals,
  getVitalsByEncounterId,
};
