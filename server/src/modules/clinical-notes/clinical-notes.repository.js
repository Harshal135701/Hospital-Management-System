const pool = require('../../config/db');

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
      noteType ?? 'progress',
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
    `SELECT n.*, d.full_name AS author_doctor_name, d.employee_code AS doctor_code
     FROM clinical_progress_notes n
     JOIN doctors d ON d.id = n.author_doctor_id
     WHERE n.encounter_id = $1
     ORDER BY n.created_at ASC`,
    [encounterId]
  );
  return result.rows;
}

async function getClinicalNoteById(id, client = pool) {
  const result = await client.query(
    `SELECT n.*, d.full_name AS author_doctor_name, d.employee_code AS doctor_code
     FROM clinical_progress_notes n
     JOIN doctors d ON d.id = n.author_doctor_id
     WHERE n.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateClinicalNote(id, data, client = pool) {
  const fields = [];
  const params = [id];
  let idx = 2;

  const mapping = {
    noteType: 'note_type',
    subjective: 'subjective',
    objective: 'objective',
    assessment: 'assessment',
    plan: 'plan',
    followUpInstructions: 'follow_up_instructions',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(data[key]);
    }
  }

  fields.push('updated_at = NOW()');

  const query = `
    UPDATE clinical_progress_notes
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, params);
  return result.rows[0] || null;
}

module.exports = {
  pool,
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};
