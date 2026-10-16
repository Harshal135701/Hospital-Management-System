const repository = require('./clinical-history.repository');
const ApiError = require('../../utils/ApiError');

async function validateEncounterAccess(encounterId, currentUser, requireActive = true) {
  const encResult = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM consultation_encounters WHERE id = $1`,
    [encounterId]
  );
  const encounter = encResult.rows[0];

  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  // Doctor ownership verification
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to access another clinician\'s consultation history');
    }
  } else if (!['staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to access clinical history');
  }

  // For write operations, consultation must be active
  if (requireActive && encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot modify clinical history for an encounter in '${encounter.status}' status`);
  }

  return encounter;
}

async function createClinicalHistory(data, currentUser = {}) {
  const encounterId = data.encounter_id || data.encounterId;

  // Nurse restriction: Nurses cannot author clinical history
  if (currentUser.role === 'staff_nurse') {
    throw ApiError.forbidden('Staff nurses may view history, but are not authorized to create clinical history');
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const existing = await repository.getClinicalHistoryByEncounterId(encounterId);
  if (existing) {
    throw ApiError.conflict('Clinical history already exists for this encounter. Use update instead.');
  }

  return repository.createClinicalHistory({
    encounterId,
    chiefComplaints: data.chief_complaints,
    historyOfPresentIllness: data.history_of_present_illness,
    pastMedicalHistory: data.past_medical_history,
    medicationHistory: data.medication_history,
    allergyHistory: data.allergy_history,
    familyHistory: data.family_history,
    socialHistory: data.social_history,
    reviewOfSystems: data.review_of_systems,
  });
}

async function getClinicalHistoryByEncounterId(encounterId, currentUser = {}) {
  await validateEncounterAccess(encounterId, currentUser, false);
  const history = await repository.getClinicalHistoryByEncounterId(encounterId);
  if (!history) {
    throw ApiError.notFound('Clinical history for this encounter has not been recorded yet');
  }
  return history;
}

async function updateClinicalHistory(encounterId, data, currentUser = {}) {
  if (currentUser.role === 'staff_nurse') {
    throw ApiError.forbidden('Staff nurses may view history, but are not authorized to update clinical history');
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const existing = await repository.getClinicalHistoryByEncounterId(encounterId);
  if (!existing) {
    throw ApiError.notFound('Clinical history not found for this encounter');
  }

  return repository.updateClinicalHistory(encounterId, {
    chiefComplaints: data.chief_complaints,
    historyOfPresentIllness: data.history_of_present_illness,
    pastMedicalHistory: data.past_medical_history,
    medicationHistory: data.medication_history,
    allergyHistory: data.allergy_history,
    familyHistory: data.family_history,
    socialHistory: data.social_history,
    reviewOfSystems: data.review_of_systems,
  });
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};
