const radiologyService = require('./radiology.service');

async function getModalities(req, res, next) {
  try {
    const data = await radiologyService.getModalities();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getStudies(req, res, next) {
  try {
    const filters = {
      patient_id: req.query.patient_id,
      modality_id: req.query.modality_id,
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search
    };
    const data = await radiologyService.getStudies(filters);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getStudyById(req, res, next) {
  try {
    const data = await radiologyService.getStudyById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function scheduleStudy(req, res, next) {
  try {
    const data = await radiologyService.scheduleStudy(req.body, req.user);
    res.status(201).json({ success: true, message: 'Radiology study scheduled successfully', data });
  } catch (err) {
    next(err);
  }
}

async function updateStudyStatus(req, res, next) {
  try {
    const data = await radiologyService.updateStudyStatus(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Study status updated', data });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const data = await radiologyService.getReport(req.params.studyId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveReport(req, res, next) {
  try {
    const data = await radiologyService.saveReportDraft(req.body, req.user);
    res.status(200).json({ success: true, message: 'Report saved successfully', data });
  } catch (err) {
    next(err);
  }
}

async function verifyReport(req, res, next) {
  try {
    const data = await radiologyService.verifyReport(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Radiology report verified and signed', data });
  } catch (err) {
    next(err);
  }
}

async function distributeReport(req, res, next) {
  try {
    const data = await radiologyService.distributeReport(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Report distributed to patient EMR and ordering clinician', data });
  } catch (err) {
    next(err);
  }
}

async function getPacsStatus(req, res, next) {
  try {
    const data = await radiologyService.getPacsStatus();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getModalities,
  getStudies,
  getStudyById,
  scheduleStudy,
  updateStudyStatus,
  getReport,
  saveReport,
  verifyReport,
  distributeReport,
  getPacsStatus
};
