const service = require('./vitals.service');
const { createVitalsSchema } = require('./vitals.validation');

async function createVitals(req, res, next) {
  try {
    const validated = createVitalsSchema.parse(req.body);
    const vitals = await service.createVitals(validated, req.user);

    res.status(201).json({
      success: true,
      message: 'Vitals and physical examination recorded successfully',
      data: vitals,
    });
  } catch (err) {
    next(err);
  }
}

async function getVitalsByEncounterId(req, res, next) {
  try {
    const vitals = await service.getVitalsByEncounterId(req.params.encounterId, req.user);
    res.status(200).json({
      success: true,
      count: vitals.length,
      data: vitals,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVitals,
  getVitalsByEncounterId,
};
