const service = require('./consultation.service');
const {
  createEncounterSchema,
  updateEncounterSchema,
  completeEncounterSchema,
} = require('./consultation.validation');

async function createEncounter(req, res, next) {
  try {
    const validated = createEncounterSchema.parse(req.body);
    const encounter = await service.createEncounter(validated, req.user);

    res.status(201).json({
      success: true,
      message: 'Consultation encounter started successfully',
      data: encounter,
    });
  } catch (err) {
    next(err);
  }
}

async function getEncounterById(req, res, next) {
  try {
    const encounter = await service.getEncounterById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: encounter,
    });
  } catch (err) {
    next(err);
  }
}

async function getEncounterByAppointmentId(req, res, next) {
  try {
    const encounter = await service.getEncounterByAppointmentId(req.params.appointmentId, req.user);
    res.status(200).json({
      success: true,
      data: encounter,
    });
  } catch (err) {
    next(err);
  }
}

async function getEncounters(req, res, next) {
  try {
    const filters = {
      patientId: req.query.patient_id || req.query.patientId,
      doctorId: req.query.doctor_id || req.query.doctorId,
      status: req.query.status,
      search: req.query.search,
      date: req.query.date,
    };
    const encounters = await service.listEncounters(filters, req.user);
    res.status(200).json({
      success: true,
      count: encounters.length,
      data: encounters,
    });
  } catch (err) {
    next(err);
  }
}

async function updateEncounter(req, res, next) {
  try {
    const validated = updateEncounterSchema.parse(req.body);
    const encounter = await service.updateEncounter(req.params.id, validated, req.user);
    res.status(200).json({
      success: true,
      message: 'Consultation draft saved successfully',
      data: encounter,
    });
  } catch (err) {
    next(err);
  }
}

async function completeEncounter(req, res, next) {
  try {
    const validated = completeEncounterSchema.parse(req.body || {});
    const encounter = await service.completeEncounter(req.params.id, validated, req.user);
    res.status(200).json({
      success: true,
      message: 'Consultation encounter completed successfully',
      data: encounter,
    });
  } catch (err) {
    next(err);
  }
}

async function getPatientClinicalSummary(req, res, next) {
  try {
    const summary = await service.getPatientClinicalSummary(req.params.patientId, req.user);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEncounter,
  getEncounterById,
  getEncounterByAppointmentId,
  getEncounters,
  updateEncounter,
  completeEncounter,
  getPatientClinicalSummary,
};
