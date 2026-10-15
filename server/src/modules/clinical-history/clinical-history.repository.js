const pool = require("../../config/db");

async function createClinicalHistory(data) {
  const {
    encounter_id,
    chief_complaints,
    history_of_present_illness,
    past_medical_history,
    medication_history,
    allergy_history,
    family_history,
    social_history,
    review_of_systems,
  } = data;

  const result = await pool.query(
    `INSERT INTO clinical_histories (
      encounter_id,
      chief_complaints,
      history_of_present_illness,
      past_medical_history,
      medication_history,
      allergy_history,
      family_history,
      social_history,
      review_of_systems
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      encounter_id,
      chief_complaints,
      history_of_present_illness ?? null,
      past_medical_history ?? null,
      medication_history ?? null,
      allergy_history ?? null,
      family_history ?? null,
      social_history ?? null,
      review_of_systems ?? null,
    ]
  );

  return result.rows[0];
}

async function getClinicalHistoryByEncounterId(encounter_id) {
  const result = await pool.query(
    `SELECT *
     FROM clinical_histories
     WHERE encounter_id = $1`,
    [encounter_id]
  );

  return result.rows[0] || null;
}

async function updateClinicalHistory(encounter_id, data) {
  const {
    chief_complaints,
    history_of_present_illness,
    past_medical_history,
    medication_history,
    allergy_history,
    family_history,
    social_history,
    review_of_systems,
  } = data;

  const result = await pool.query(
    `UPDATE clinical_histories
     SET chief_complaints = $2,
         history_of_present_illness = $3,
         past_medical_history = $4,
         medication_history = $5,
         allergy_history = $6,
         family_history = $7,
         social_history = $8,
         review_of_systems = $9,
         updated_at = NOW()
     WHERE encounter_id = $1
     RETURNING *`,
    [
      encounter_id,
      chief_complaints,
      history_of_present_illness ?? null,
      past_medical_history ?? null,
      medication_history ?? null,
      allergy_history ?? null,
      family_history ?? null,
      social_history ?? null,
      review_of_systems ?? null,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};