const repository = require("./clinical-history.repository");
const ApiError = require("../../utils/ApiError");

const textFields = [
  "chief_complaints",
  "history_of_present_illness",
  "past_medical_history",
  "medication_history",
  "allergy_history",
  "family_history",
  "social_history",
  "review_of_systems",
];

function validateHistory(data, isUpdate = false) {
  if (
    !isUpdate &&
    (typeof data.chief_complaints !== "string" ||
      !data.chief_complaints.trim())
  ) {
    throw ApiError.badRequest("Chief complaints are required");
  }

  for (const field of textFields) {
    const value = data[field];

    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "string"
    ) {
      throw ApiError.badRequest(`${field} must be text`);
    }
  }

  if (
    isUpdate &&
    !textFields.some(
      (field) => data[field] !== undefined
    )
  ) {
    throw ApiError.badRequest(
      "Provide at least one field to update"
    );
  }
}

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

  if (currentUser.role === "clinician_doctor") {
    if (
      !currentUser.doctor_id ||
      String(encounter.doctor_id) !== String(currentUser.doctor_id)
    ) {
      throw ApiError.forbidden(
        "You are not authorized to access another clinician's consultation history"
      );
    }
  } else if (
    !["staff_nurse", "super_admin"].includes(currentUser.role)
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

  return encounter;
}

async function createClinicalHistory(data, currentUser) {
  const encounterId = data.encounter_id || data.encounterId;

  validateHistory(data);

  if (currentUser?.role === "staff_nurse") {
    throw ApiError.forbidden(
      "Staff nurses may view history but cannot create clinical history"
    );
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const existing =
    await repository.getClinicalHistoryByEncounterId(encounterId);

  if (existing) {
    throw ApiError.conflict(
      "Clinical history already exists for this encounter"
    );
  }

  return repository.createClinicalHistory({
    encounter_id: encounterId,
    chief_complaints: data.chief_complaints,
    history_of_present_illness: data.history_of_present_illness,
    past_medical_history: data.past_medical_history,
    medication_history: data.medication_history,
    allergy_history: data.allergy_history,
    family_history: data.family_history,
    social_history: data.social_history,
    review_of_systems: data.review_of_systems,
  });
}

async function getClinicalHistoryByEncounterId(
  encounterId,
  currentUser
) {
  await validateEncounterAccess(encounterId, currentUser, false);

  const history =
    await repository.getClinicalHistoryByEncounterId(encounterId);

  if (!history) {
    throw ApiError.notFound(
      "Clinical history for this encounter has not been recorded yet"
    );
  }

  return history;
}

async function updateClinicalHistory(
  encounterId,
  data,
  currentUser
) {
  validateHistory(data, true);

  if (currentUser?.role === "staff_nurse") {
    throw ApiError.forbidden(
      "Staff nurses may view history but cannot update clinical history"
    );
  }

  await validateEncounterAccess(encounterId, currentUser, true);

  const existing =
    await repository.getClinicalHistoryByEncounterId(encounterId);

  if (!existing) {
    throw ApiError.notFound("Clinical history not found");
  }

  const updatedData = {};

  for (const field of textFields) {
    if (data[field] !== undefined) {
      updatedData[field] = data[field];
    }
  }

  return repository.updateClinicalHistory(encounterId, updatedData);
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};