const pool = require('../../config/db');
const radiologyRepo = require('./radiology.repository');
const providerOrdersRepo = require('../provider-orders/provider-orders.repository');

async function getModalities() {
  return await radiologyRepo.getModalities();
}

async function getStudies(filters) {
  return await radiologyRepo.getStudies(filters);
}

async function getStudyById(id) {
  const study = await radiologyRepo.getStudyById(id);
  if (!study) {
    const error = new Error(`Radiology study with id '${id}' not found`);
    error.status = 404;
    throw error;
  }
  const report = await radiologyRepo.getReportByStudyId(id);
  return { ...study, report };
}

async function scheduleStudy(data, user) {
  // Generate accession number if not passed
  let accessionNumber = data.accession_number;
  if (!accessionNumber) {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    accessionNumber = `ACC-${year}-${data.modality_id || 'RAD'}-${randomSuffix}`;
  }

  // Set ordering clinician safely verifying existence in doctors table
  let orderingDoctorId = data.ordering_doctor_id || user?.doctorId || null;
  if (orderingDoctorId) {
    const docCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [orderingDoctorId]);
    if (docCheck.rows.length === 0) {
      orderingDoctorId = null;
    }
  }

  const study = await radiologyRepo.createStudy({
    ...data,
    accession_number: accessionNumber,
    ordering_doctor_id: orderingDoctorId
  });

  // If linked to a provider order, update its status
  if (data.order_id) {
    try {
      await providerOrdersRepo.updateOrderStatus(data.order_id, {
        status: 'in_progress'
      });
    } catch (err) {
      console.warn('[RadiologyService] Linked order status update non-fatal:', err.message);
    }
  }

  return study;
}

async function updateStudyStatus(id, updateData) {
  const study = await radiologyRepo.getStudyById(id);
  if (!study) {
    const error = new Error(`Radiology study with id '${id}' not found`);
    error.status = 404;
    throw error;
  }

  const updated = await radiologyRepo.updateStudyStatus(id, updateData);

  // If marked completed and linked to an order, update order status
  if (updateData.status === 'completed' && study.order_id) {
    try {
      await providerOrdersRepo.updateOrderStatus(study.order_id, {
        status: 'completed'
      });
    } catch (err) {
      console.warn('[RadiologyService] Linked order completion non-fatal:', err.message);
    }
  }

  return updated;
}

async function getReport(studyId) {
  return await radiologyRepo.getReportByStudyId(studyId);
}

async function saveReportDraft(data, user) {
  const study = await radiologyRepo.getStudyById(data.study_id);
  if (!study) {
    const error = new Error(`Radiology study with id '${data.study_id}' not found`);
    error.status = 404;
    throw error;
  }

  let radiologistId = data.radiologist_id || user?.doctorId || null;
  if (radiologistId) {
    const docCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [radiologistId]);
    if (docCheck.rows.length === 0) {
      radiologistId = null;
    }
  }

  return await radiologyRepo.upsertReport({
    ...data,
    radiologist_id: radiologistId,
    status: data.status || 'draft'
  });
}

async function verifyReport(reportId, user) {
  // Authorization check: Only clinician_doctor or super_admin can verify
  const isAuthorized = user && (user.role === 'clinician_doctor' || user.role === 'super_admin');
  if (!isAuthorized) {
    const error = new Error('Unauthorized: Only licensed radiologist doctors or super administrators may verify and authorize radiology reports.');
    error.status = 403;
    throw error;
  }

  let verifiedBy = user?.doctorId || null;
  if (verifiedBy) {
    const docCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [verifiedBy]);
    if (docCheck.rows.length === 0) {
      verifiedBy = null;
    }
  }

  const verified = await radiologyRepo.verifyReport(reportId, {
    verified_by: verifiedBy,
    verified_at: new Date()
  });

  if (!verified) {
    const error = new Error(`Report with id '${reportId}' not found`);
    error.status = 404;
    throw error;
  }

  // Also ensure study status is set to 'completed'
  await radiologyRepo.updateStudyStatus(verified.study_id, {
    status: 'completed'
  });

  return verified;
}

async function distributeReport(reportId, user) {
  // Only verified reports can be distributed
  const distributed = await radiologyRepo.distributeReport(reportId);
  if (!distributed) {
    const error = new Error(`Report with id '${reportId}' not found`);
    error.status = 404;
    throw error;
  }
  return distributed;
}

async function getPacsStatus() {
  const nodes = await radiologyRepo.getPacsNodes();
  return {
    isConfigured: false,
    status: 'disconnected',
    localAeTitle: 'HMS_RADIOLOGY_SCU',
    localPort: 11112,
    message: 'No live external DICOM PACS Server connection is active. Modality Worklist (MWL) and image caching run in internal simulation mode.',
    nodes
  };
}

module.exports = {
  getModalities,
  getStudies,
  getStudyById,
  scheduleStudy,
  updateStudyStatus,
  getReport,
  saveReportDraft,
  verifyReport,
  distributeReport,
  getPacsStatus
};
