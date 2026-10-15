const pool = require("../../config/db");
const repository = require("./clinical-history.repository");

async function validateEncounter(encounter_id, requireActive = true) {
  if (!encounter_id) {
    throw Object.assign(new Error("Encounter ID is required"), {
      statusCode: 400,
    });
  }

  const result = await pool.query(
    `SELECT id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounter_id]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw Object.assign(
      new Error("Clinical history can only be modified during an active consultation"),
      { statusCode: 400 }
    );
  }

  return encounter;
}

function validateHistory(data, isUpdate = false) {
  if (
    (!isUpdate || data.chief_complaints !== undefined) &&
    (typeof data.chief_complaints !== "string" ||
      !data.chief_complaints.trim())
  ) {
    throw Object.assign(new Error("Chief complaints are required"), {
      statusCode: 400,
    });
  }

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

  for (const field of textFields) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      typeof data[field] !== "string"
    ) {
      throw Object.assign(new Error(`${field} must be text`), {
        statusCode: 400,
      });
    }
  }

  if (
    isUpdate &&
    !textFields.some((field) => data[field] !== undefined)
  ) {
    throw Object.assign(new Error("Provide at least one field to update"), {
      statusCode: 400,
    });
  }
}

async function createClinicalHistory(data) {
  const { encounter_id } = data;

  await validateEncounter(encounter_id);
  validateHistory(data);

  const existingHistory =
    await repository.getClinicalHistoryByEncounterId(encounter_id);

  if (existingHistory) {
    throw Object.assign(
      new Error("Clinical history already exists for this encounter"),
      { statusCode: 409 }
    );
  }

  return repository.createClinicalHistory(data);
}

async function getClinicalHistoryByEncounterId(encounter_id) {
  await validateEncounter(encounter_id, false);

  return repository.getClinicalHistoryByEncounterId(encounter_id);
}

async function updateClinicalHistory(encounter_id, data) {
  await validateEncounter(encounter_id);
  validateHistory(data, true);

  const existingHistory =
    await repository.getClinicalHistoryByEncounterId(encounter_id);

  if (!existingHistory) {
    throw Object.assign(new Error("Clinical history not found"), {
      statusCode: 404,
    });
  }

  const updatedData = {
    chief_complaints:
      data.chief_complaints ?? existingHistory.chief_complaints,
    history_of_present_illness:
      data.history_of_present_illness ??
      existingHistory.history_of_present_illness,
    past_medical_history:
      data.past_medical_history ?? existingHistory.past_medical_history,
    medication_history:
      data.medication_history ?? existingHistory.medication_history,
    allergy_history:
      data.allergy_history ?? existingHistory.allergy_history,
    family_history:
      data.family_history ?? existingHistory.family_history,
    social_history:
      data.social_history ?? existingHistory.social_history,
    review_of_systems:
      data.review_of_systems ?? existingHistory.review_of_systems,
  };

  return repository.updateClinicalHistory(encounter_id, updatedData);
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};