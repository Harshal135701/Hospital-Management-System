
const pool = require("../../config/db");
const repository = require("./vitals.repository");

async function createVitals(data) {
  const { encounter_id } = data;

  if (!encounter_id) {
    throw Object.assign(new Error("Encounter ID is required"), {
      statusCode: 400,
    });
  }

  const encounterResult = await pool.query(
    `SELECT id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounter_id]
  );

  const encounter = encounterResult.rows[0];

  if (!encounter) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  if (encounter.status !== "in_progress") {
    throw Object.assign(
      new Error("Vitals can only be recorded during an active consultation"),
      { statusCode: 400 }
    );
  }

  const positiveFields = [
    "systolic_bp",
    "diastolic_bp",
    "pulse_rate",
    "temperature_c",
    "respiratory_rate",
    "height_cm",
    "weight_kg",
  ];

  for (const field of positiveFields) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      (!Number.isFinite(Number(data[field])) || Number(data[field]) <= 0)
    ) {
      throw Object.assign(
        new Error(`${field} must be a positive number`),
        { statusCode: 400 }
      );
    }
  }

  if (
    data.oxygen_saturation !== undefined &&
    data.oxygen_saturation !== null &&
    (!Number.isFinite(Number(data.oxygen_saturation)) ||
      Number(data.oxygen_saturation) < 0 ||
      Number(data.oxygen_saturation) > 100)
  ) {
    throw Object.assign(
      new Error("Oxygen saturation must be between 0 and 100"),
      { statusCode: 400 }
    );
  }

  if (
    data.systolic_bp != null &&
    data.diastolic_bp != null &&
    Number(data.systolic_bp) <= Number(data.diastolic_bp)
  ) {
    throw Object.assign(
      new Error("Systolic BP must be greater than diastolic BP"),
      { statusCode: 400 }
    );
  }

  return repository.createVitals(data);
}

async function getVitalsByEncounterId(encounter_id) {
  if (!encounter_id) {
    throw Object.assign(new Error("Encounter ID is required"), {
      statusCode: 400,
    });
  }

  const encounterResult = await pool.query(
    `SELECT id FROM consultation_encounters WHERE id = $1`,
    [encounter_id]
  );

  if (!encounterResult.rows[0]) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  return repository.getVitalsByEncounterId(encounter_id);
}

module.exports = {
  createVitals,
  getVitalsByEncounterId,
};
