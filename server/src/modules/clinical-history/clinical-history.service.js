const repository = require("./clinical-history.repository");
const ApiError = require("../../utils/ApiError");

async function validateEncounterAccess(
  encounterId,
  currentUser,
  requireActive = true
) {
  if (!encounterId) {
    throw ApiError.badRequest("Encounter ID is required");
  }

  if (!currentUser || !currentUser.role) {
    throw ApiError.forbidden("Authentication is required");
  }

  const result = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounterId]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw ApiError.notFound("Consultation encounter not found");
  }

  if (
    !["clinician_doctor", "staff_nurse", "super_admin"].includes(currentUser.role)
  ) {
    throw ApiError.forbidden(
      "Insufficient permissions to access clinical history"
    );
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw ApiError.badRequest(
      `Clinical history can only be modified during an active consultation`
    );
  }

  if (requireActive && currentUser.role === "clinician_doctor") {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden(
        "You are not authorized to modify another clinician's consultation history"
      );
    }
  }

  return encounter;
}

async function createClinicalHistory(data, currentUser) {
  const encounterId = data.encounter_id || data.encounterId;

  if (currentUser?.role === "staff_nurse") {
    throw ApiError.forbidden(
      "Staff nurses may view history but cannot create clinical history"
    );
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const chiefComplaints =
    data.chief_complaints ||
    data.chiefComplaints ||
    data.presentingComplaint ||
    "Outpatient presentation";

  const historyRecord = await repository.upsertClinicalHistory({
    encounter_id: encounterId,
    chief_complaints: chiefComplaints,
    history_of_present_illness: data.history_of_present_illness || data.historyOfPresentIllness || null,
    onset_duration: data.onset_duration || data.onsetDuration || null,
    severity: data.severity || null,
    aggravating_factors: data.aggravating_factors || data.aggravatingFactors || null,
    relieving_factors: data.relieving_factors || data.relievingFactors || null,
    past_medical_history: data.past_medical_history || data.pastMedicalHistory || data.medicalHistory || null,
    past_surgical_history: data.past_surgical_history || data.pastSurgicalHistory || data.surgicalHistory || null,
    medication_history: data.medication_history || data.medicationHistory || data.currentMedications || null,
    allergy_history: data.allergy_history || data.allergyHistory || data.allergies || null,
    family_history: data.family_history || data.familyHistory || null,
    social_history: data.social_history || data.socialHistory || null,
    review_of_systems: data.review_of_systems || data.reviewOfSystems || null,
  });

  // Sync chief complaint to encounter
  await repository.pool.query(
    `UPDATE consultation_encounters
     SET chief_complaint = $2, updated_at = NOW()
     WHERE id = $1`,
    [encounterId, chiefComplaints]
  );

  return historyRecord;
}

async function getClinicalHistoryByEncounterId(
  encounterId,
  currentUser
) {
  await validateEncounterAccess(encounterId, currentUser, false);

  const history =
    await repository.getClinicalHistoryByEncounterId(encounterId);

  // Return empty history object with default structure if not recorded yet
  return history || {
    encounter_id: encounterId,
    chief_complaints: '',
    history_of_present_illness: '',
    onset_duration: '',
    severity: 'Moderate',
    aggravating_factors: '',
    relieving_factors: '',
    past_medical_history: '',
    past_surgical_history: '',
    medication_history: '',
    allergy_history: '',
    family_history: '',
    social_history: '',
    review_of_systems: '',
  };
}

async function updateClinicalHistory(
  encounterId,
  data,
  currentUser
) {
  if (currentUser?.role === "staff_nurse") {
    throw ApiError.forbidden(
      "Staff nurses may view history but cannot update clinical history"
    );
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const existing =
    await repository.getClinicalHistoryByEncounterId(encounterId);

  if (!existing) {
    return createClinicalHistory({ ...data, encounter_id: encounterId }, currentUser);
  }

  const updated = await repository.updateClinicalHistory(encounterId, data);

  const chief = data.chief_complaints || data.chiefComplaints || data.presentingComplaint;
  if (chief) {
    await repository.pool.query(
      `UPDATE consultation_encounters
       SET chief_complaint = $2, updated_at = NOW()
       WHERE id = $1`,
      [encounterId, chief]
    );
  }

  return updated;
}

async function getClinicalHistoryByPatientId(patientId, currentUser) {
  if (
    !["clinician_doctor", "staff_nurse", "super_admin"].includes(currentUser?.role)
  ) {
    throw ApiError.forbidden(
      "Insufficient permissions to access patient clinical history"
    );
  }

  return repository.getClinicalHistoryByPatientId(patientId);
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
  getClinicalHistoryByPatientId,
};