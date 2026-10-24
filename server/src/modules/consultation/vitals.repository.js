
const pool = require("../../config/db");

async function createVitals(data) {
  const {
    encounter_id,
    systolic_bp,
    diastolic_bp,
    pulse_rate,
    temperature_c,
    respiratory_rate,
    oxygen_saturation,
    height_cm,
    weight_kg,
    examination_findings,
    recorded_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO vitals_records (
      encounter_id,
      systolic_bp,
      diastolic_bp,
      pulse_rate,
      temperature_c,
      respiratory_rate,
      oxygen_saturation,
      height_cm,
      weight_kg,
      examination_findings,
      recorded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      encounter_id,
      systolic_bp ?? null,
      diastolic_bp ?? null,
      pulse_rate ?? null,
      temperature_c ?? null,
      respiratory_rate ?? null,
      oxygen_saturation ?? null,
      height_cm ?? null,
      weight_kg ?? null,
      examination_findings ?? null,
      recorded_by ?? null,
    ]
  );

  return result.rows[0];
}

async function getVitalsByEncounterId(encounter_id) {
  const result = await pool.query(
    `SELECT *
     FROM vitals_records
     WHERE encounter_id = $1
     ORDER BY recorded_at DESC`,
    [encounter_id]
  );

  return result.rows;
}

module.exports = {
  createVitals,
  getVitalsByEncounterId,
};
