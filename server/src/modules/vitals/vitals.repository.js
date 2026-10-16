const pool = require('../../config/db');

async function createVitals(data, client = pool) {
  const {
    encounterId,
    systolicBp,
    diastolicBp,
    pulseRate,
    temperatureC,
    respiratoryRate,
    oxygenSaturation,
    heightCm,
    weightKg,
    examinationFindings,
    recordedBy,
  } = data;

  const result = await client.query(
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
      recorded_by,
      recorded_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    RETURNING *`,
    [
      encounterId,
      systolicBp ?? null,
      diastolicBp ?? null,
      pulseRate ?? null,
      temperatureC ?? null,
      respiratoryRate ?? null,
      oxygenSaturation ?? null,
      heightCm ?? null,
      weightKg ?? null,
      examinationFindings ?? null,
      recordedBy ?? null,
    ]
  );

  return result.rows[0];
}

async function getVitalsByEncounterId(encounterId, client = pool) {
  const result = await client.query(
    `SELECT v.*, d.full_name AS recorded_by_doctor_name
     FROM vitals_records v
     LEFT JOIN doctors d ON d.id = v.recorded_by
     WHERE v.encounter_id = $1
     ORDER BY v.recorded_at DESC`,
    [encounterId]
  );
  return result.rows;
}

module.exports = {
  pool,
  createVitals,
  getVitalsByEncounterId,
};
