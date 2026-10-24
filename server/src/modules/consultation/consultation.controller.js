
const service = require("./consultation.service");

async function createEncounter(req, res, next) {
  try {
    const encounter = await service.createEncounter(req.body);

    res.status(201).json({
      success: true,
      message: "Consultation started successfully",
      data: encounter,
    });
  } catch (error) {
    next(error);
  }
}

async function getEncounters(req, res, next) {
  try {
    const encounters = await service.getEncounters({
      patient_id: req.query.patient_id,
      doctor_id: req.query.doctor_id,
      status: req.query.status,
    });

    res.status(200).json({
      success: true,
      count: encounters.length,
      data: encounters,
    });
  } catch (error) {
    next(error);
  }
}

async function getEncounterById(req, res, next) {
  try {
    const encounter = await service.getEncounterById(req.params.id);

    res.status(200).json({
      success: true,
      data: encounter,
    });
  } catch (error) {
    next(error);
  }
}

async function completeEncounter(req, res, next) {
  try {
    const encounter = await service.completeEncounter(req.params.id);

    res.status(200).json({
      success: true,
      message: "Consultation completed successfully",
      data: encounter,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEncounter,
  getEncounters,
  getEncounterById,
  completeEncounter,
};
