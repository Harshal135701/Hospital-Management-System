const pool = require("../../config/db");

async function createClinicalHistory(data, client = pool) {
  const encounterId = data.encounterId ?? data.encounter_id;
  const chiefComplaints = data.chiefComplaints ?? data.chief_complaints;

  const result = await client.query(
    `INSERT INTO clinical_histories (
      encounter_id,
      chief_complaints,
      history_of_present_illness,
      past_medical_history,
      medication_history,
      allergy_history,
      family_history,
      social_history,
      review_of_systems,
      recorded_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      encounterId,
      chiefComplaints,
      data.historyOfPresentIllness ?? data.history_of_present_illness ?? null,
      data.pastMedicalHistory ?? data.past_medical_history ?? null,
      data.medicationHistory ?? data.medication_history ?? null,
      data.allergyHistory ?? data.allergy_history ?? null,
      data.familyHistory ?? data.family_history ?? null,
      data.socialHistory ?? data.social_history ?? null,
      data.reviewOfSystems ?? data.review_of_systems ?? null,
    ]
  );

  return result.rows[0];
}

async function getClinicalHistoryByEncounterId(encounterId, client = pool) {
  const result = await client.query(
    `SELECT *
     FROM clinical_histories
     WHERE encounter_id = $1`,
    [encounterId]
  );

  return result.rows[0] || null;
}

async function updateClinicalHistory(encounterId, data, client = pool) {
  const mapping = {
    chiefComplaints: "chief_complaints",
    chief_complaints: "chief_complaints",
    historyOfPresentIllness: "history_of_present_illness",
    history_of_present_illness: "history_of_present_illness",
    pastMedicalHistory: "past_medical_history",
    past_medical_history: "past_medical_history",
    medicationHistory: "medication_history",
    medication_history: "medication_history",
    allergyHistory: "allergy_history",
    allergy_history: "allergy_history",
    familyHistory: "family_history",
    family_history: "family_history",
    socialHistory: "social_history",
    social_history: "social_history",
    reviewOfSystems: "review_of_systems",
    review_of_systems: "review_of_systems",
  };

  const updates = new Map();

  for (const [key, column] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      updates.set(column, data[key]);
    }
  }

  if (updates.size === 0) {
    throw Object.assign(new Error("Provide at least one field to update"), {
      statusCode: 400,
    });
  }

  const params = [encounterId];
  const assignments = [];
  let index = 2;

  for (const [column, value] of updates.entries()) {
    assignments.push(`${column} = $${index++}`);
    params.push(value ?? null);
  }

  assignments.push("updated_at = NOW()");

  const result = await client.query(
    `UPDATE clinical_histories
     SET ${assignments.join(", ")}
     WHERE encounter_id = $1
     RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

module.exports = {
  pool,
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};