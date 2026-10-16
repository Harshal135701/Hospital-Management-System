const service = require('./clinical-history.service');
const { createHistorySchema, updateHistorySchema } = require('./clinical-history.validation');

async function createClinicalHistory(req, res, next) {
  try {
    const validated = createHistorySchema.parse(req.body);
    const history = await service.createClinicalHistory(validated, req.user);

    res.status(201).json({
      success: true,
      message: 'Clinical history recorded successfully',
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

async function getClinicalHistoryByEncounterId(req, res, next) {
  try {
    const history = await service.getClinicalHistoryByEncounterId(req.params.encounterId, req.user);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

async function updateClinicalHistory(req, res, next) {
  try {
    const validated = updateHistorySchema.parse(req.body);
    const history = await service.updateClinicalHistory(req.params.encounterId, validated, req.user);
    res.status(200).json({
      success: true,
      message: 'Clinical history updated successfully',
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};
