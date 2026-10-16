const pool = require('../../config/db');

async function createClinicalHistory(data, client = pool) {
  const {
    encounterId,
    chiefComplaints,
    historyOfPresentIllness,
    pastMedicalHistory,
    medicationHistory,
    allergyHistory,
    familyHistory,
    socialHistory,
    reviewOfSystems,
  } = data;

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
      historyOfPresentIllness ?? null,
      pastMedicalHistory ?? null,
      medicationHistory ?? null,
      allergyHistory ?? null,
      familyHistory ?? null,
      socialHistory ?? null,
      reviewOfSystems ?? null,
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
  const fields = [];
  const params = [encounterId];
  let idx = 2;

  const mapping = {
    chiefComplaints: 'chief_complaints',
    historyOfPresentIllness: 'history_of_present_illness',
    pastMedicalHistory: 'past_medical_history',
    medicationHistory: 'medication_history',
    allergyHistory: 'allergy_history',
    familyHistory: 'family_history',
    socialHistory: 'social_history',
    reviewOfSystems: 'review_of_systems',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(data[key]);
    }
  }

  fields.push('updated_at = NOW()');

  const query = `
    UPDATE clinical_histories
    SET ${fields.join(', ')}
    WHERE encounter_id = $1
    RETURNING *
  `;

  const result = await client.query(query, params);
  return result.rows[0] || null;
}

module.exports = {
  pool,
  createClinicalHistory,
  getClinicalHistoryByEncounterId,
  updateClinicalHistory,
};
