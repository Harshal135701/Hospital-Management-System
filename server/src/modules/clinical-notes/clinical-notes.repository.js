
const pool = require("../../config/db");

async function createClinicalNote(data, client = pool) {
  const {
    encounterId,
    noteType,
    subjective,
    objective,
    assessment,
    plan,
    followUpInstructions,
    authorDoctorId,
  } = data;

  const result = await client.query(
    `INSERT INTO clinical_progress_notes (
      encounter_id,
      note_type,
      subjective,
      objective,
      assessment,
      plan,
      follow_up_instructions,
      author_doctor_id,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *`,
    [
      encounterId,
      noteType ?? "progress",
      subjective ?? null,
      objective ?? null,
      assessment,
      plan,
      followUpInstructions ?? null,
      authorDoctorId,
    ]
  );

  return result.rows[0];
}

async function getNotesByEncounterId(encounterId, client = pool) {
  const result = await client.query(
    `SELECT n.*, d.full_name AS author_doctor_name,
            d.employee_code AS doctor_code
     FROM clinical_progress_notes n
     JOIN doctors d ON d.id = n.author_doctor_id
     WHERE n.encounter_id = $1
     ORDER BY n.created_at DESC`,
    [encounterId]
  );

  return result.rows;
}

async function getClinicalNoteById(id, client = pool) {
  const result = await client.query(
    `SELECT n.*, d.full_name AS author_doctor_name,
            d.employee_code AS doctor_code
     FROM clinical_progress_notes n
     JOIN doctors d ON d.id = n.author_doctor_id
     WHERE n.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateClinicalNote(id, data, client = pool) {
  const mapping = {
    noteType: "note_type",
    subjective: "subjective",
    objective: "objective",
    assessment: "assessment",
    plan: "plan",
    followUpInstructions: "follow_up_instructions",
  };

  const assignments = [];
  const params = [id];
  let index = 2;

  for (const [key, column] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      assignments.push(`${column} = $${index++}`);
      params.push(data[key] ?? null);
    }
  }

  if (assignments.length === 0) {
    throw Object.assign(new Error("Provide at least one field to update"), {
      statusCode: 400,
    });
  }

  assignments.push("updated_at = NOW()");

  const result = await client.query(
    `UPDATE clinical_progress_notes
     SET ${assignments.join(", ")}
     WHERE id = $1
     RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

module.exports = {
  pool,
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};
