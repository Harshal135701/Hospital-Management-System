const pool = require("../../config/db");

async function createClinicalNote(data) {
  const {
    encounter_id,
    note_type,
    subjective,
    objective,
    assessment,
    plan,
    follow_up_instructions,
    author_doctor_id,
  } = data;

  const result = await pool.query(
    `INSERT INTO clinical_progress_notes (
      encounter_id,
      note_type,
      subjective,
      objective,
      assessment,
      plan,
      follow_up_instructions,
      author_doctor_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      encounter_id,
      note_type ?? "progress",
      subjective ?? null,
      objective ?? null,
      assessment,
      plan,
      follow_up_instructions ?? null,
      author_doctor_id,
    ]
  );

  return result.rows[0];
}

async function getNotesByEncounterId(encounter_id) {
  const result = await pool.query(
    `SELECT *
     FROM clinical_progress_notes
     WHERE encounter_id = $1
     ORDER BY created_at DESC`,
    [encounter_id]
  );

  return result.rows;
}

async function getClinicalNoteById(id) {
  const result = await pool.query(
    `SELECT *
     FROM clinical_progress_notes
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateClinicalNote(id, data) {
  const {
    note_type,
    subjective,
    objective,
    assessment,
    plan,
    follow_up_instructions,
  } = data;

  const result = await pool.query(
    `UPDATE clinical_progress_notes
     SET note_type = $2,
         subjective = $3,
         objective = $4,
         assessment = $5,
         plan = $6,
         follow_up_instructions = $7,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      note_type,
      subjective ?? null,
      objective ?? null,
      assessment,
      plan,
      follow_up_instructions ?? null,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};