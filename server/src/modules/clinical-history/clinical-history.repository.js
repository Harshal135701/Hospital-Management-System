const pool = require("../../config/db");

async function createClinicalHistory(data, client = pool) {
  const encounterId = data.encounterId ?? data.encounter_id;
  const chiefComplaints = data.chiefComplaints ?? data.chief_complaints ?? "Reason for visit";

  const result = await client.query(
    `INSERT INTO clinical_histories (
      encounter_id,
      chief_complaints,
      history_of_present_illness,
      onset_duration,
      severity,
      aggravating_factors,
      relieving_factors,
      past_medical_history,
      past_surgical_history,
      medication_history,
      allergy_history,
      family_history,
      social_history,
      review_of_systems,
      recorded_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *`,
    [
      encounterId,
      chiefComplaints,
      data.historyOfPresentIllness ?? data.history_of_present_illness ?? null,
      data.onsetDuration ?? data.onset_duration ?? null,
      data.severity ?? null,
      data.aggravatingFactors ?? data.aggravating_factors ?? null,
      data.relievingFactors ?? data.relieving_factors ?? null,
      data.pastMedicalHistory ?? data.past_medical_history ?? null,
      data.pastSurgicalHistory ?? data.past_surgical_history ?? null,
      data.medicationHistory ?? data.medication_history ?? null,
      data.allergyHistory ?? data.allergy_history ?? null,
      data.familyHistory ?? data.family_history ?? null,
      data.socialHistory ?? data.social_history ?? null,
      data.reviewOfSystems ?? data.review_of_systems ?? null,
    ]
  );

  return result.rows[0];
}

async function upsertClinicalHistory(data, client = pool) {
  const encounterId = data.encounterId ?? data.encounter_id;
  const chiefComplaints = data.chiefComplaints ?? data.chief_complaints ?? "Reason for visit";

  const result = await client.query(
    `INSERT INTO clinical_histories (
      encounter_id,
      chief_complaints,
      history_of_present_illness,
      onset_duration,
      severity,
      aggravating_factors,
      relieving_factors,
      past_medical_history,
      past_surgical_history,
      medication_history,
      allergy_history,
      family_history,
      social_history,
      review_of_systems,
      recorded_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    ON CONFLICT (encounter_id) DO UPDATE SET
      chief_complaints = EXCLUDED.chief_complaints,
      history_of_present_illness = COALESCE(EXCLUDED.history_of_present_illness, clinical_histories.history_of_present_illness),
      onset_duration = COALESCE(EXCLUDED.onset_duration, clinical_histories.onset_duration),
      severity = COALESCE(EXCLUDED.severity, clinical_histories.severity),
      aggravating_factors = COALESCE(EXCLUDED.aggravating_factors, clinical_histories.aggravating_factors),
      relieving_factors = COALESCE(EXCLUDED.relieving_factors, clinical_histories.relieving_factors),
      past_medical_history = COALESCE(EXCLUDED.past_medical_history, clinical_histories.past_medical_history),
      past_surgical_history = COALESCE(EXCLUDED.past_surgical_history, clinical_histories.past_surgical_history),
      medication_history = COALESCE(EXCLUDED.medication_history, clinical_histories.medication_history),
      allergy_history = COALESCE(EXCLUDED.allergy_history, clinical_histories.allergy_history),
      family_history = COALESCE(EXCLUDED.family_history, clinical_histories.family_history),
      social_history = COALESCE(EXCLUDED.social_history, clinical_histories.social_history),
      review_of_systems = COALESCE(EXCLUDED.review_of_systems, clinical_histories.review_of_systems),
      updated_at = NOW()
    RETURNING *`,
    [
      encounterId,
      chiefComplaints,
      data.historyOfPresentIllness ?? data.history_of_present_illness ?? null,
      data.onsetDuration ?? data.onset_duration ?? null,
      data.severity ?? null,
      data.aggravatingFactors ?? data.aggravating_factors ?? null,
      data.relievingFactors ?? data.relieving_factors ?? null,
      data.pastMedicalHistory ?? data.past_medical_history ?? null,
      data.pastSurgicalHistory ?? data.past_surgical_history ?? null,
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

async function getClinicalHistoryByPatientId(patientId, client = pool) {
  const result = await client.query(
    `SELECT h.*, e.started_at AS encounter_date, a.appointment_number, d.full_name AS doctor_name
     FROM clinical_histories h
     JOIN consultation_encounters e ON e.id = h.encounter_id
     JOIN appointments a ON a.id = e.appointment_id
     JOIN doctors d ON d.id = e.doctor_id
     WHERE e.patient_id = $1
     ORDER BY h.recorded_at DESC`,
    [patientId]
  );

  return result.rows;
}

async function updateClinicalHistory(encounterId, data, client = pool) {
  const mapping = {
    chiefComplaints: "chief_complaints",
    chief_complaints: "chief_complaints",
    presentingComplaint: "chief_complaints",
    historyOfPresentIllness: "history_of_present_illness",
    history_of_present_illness: "history_of_present_illness",
    onsetDuration: "onset_duration",
    onset_duration: "onset_duration",
    severity: "severity",
    aggravatingFactors: "aggravating_factors",
    aggravating_factors: "aggravating_factors",
    relievingFactors: "relieving_factors",
    relieving_factors: "relieving_factors",
    pastMedicalHistory: "past_medical_history",
    past_medical_history: "past_medical_history",
    medicalHistory: "past_medical_history",
    pastSurgicalHistory: "past_surgical_history",
    past_surgical_history: "past_surgical_history",
    surgicalHistory: "past_surgical_history",
    medicationHistory: "medication_history",
    medication_history: "medication_history",
    currentMedications: "medication_history",
    allergyHistory: "allergy_history",
    allergy_history: "allergy_history",
    allergies: "allergy_history",
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
  upsertClinicalHistory,
  getClinicalHistoryByEncounterId,
  getClinicalHistoryByPatientId,
  updateClinicalHistory,
};