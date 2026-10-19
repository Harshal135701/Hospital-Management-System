const pool = require("../../config/db");

async function createClinicalNote(data, client = pool) {
  const {
    encounterId,
    noteType,
    status,
    subjective,
    objective,
    assessment,
    plan,
    followUpInstructions,
    authorDoctorId,
    amendedFromNoteId,
    amendmentReason,
  } = data;

  const noteStatus = status ?? "finalized";
  const signedAt = noteStatus === "finalized" ? "NOW()" : "NULL";

  const result = await client.query(
    `INSERT INTO clinical_progress_notes (
      encounter_id,
      note_type,
      status,
      subjective,
      objective,
      assessment,
      plan,
      follow_up_instructions,
      author_doctor_id,
      signed_at,
      amended_from_note_id,
      amendment_reason,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${signedAt}, $10, $11, NOW(), NOW())
    RETURNING *`,
    [
      encounterId,
      noteType ?? "progress",
      noteStatus,
      subjective ?? null,
      objective ?? null,
      assessment ?? null,
      plan ?? null,
      followUpInstructions ?? null,
      authorDoctorId,
      amendedFromNoteId ?? null,
      amendmentReason ?? null,
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

async function getNotesByPatientId(patientId, client = pool) {
  const result = await client.query(
    `SELECT n.*, d.full_name AS author_doctor_name,
            d.employee_code AS doctor_code,
            e.started_at AS encounter_date,
            a.appointment_number
     FROM clinical_progress_notes n
     JOIN consultation_encounters e ON e.id = n.encounter_id
     JOIN appointments a ON a.id = e.appointment_id
     JOIN doctors d ON d.id = n.author_doctor_id
     WHERE e.patient_id = $1
     ORDER BY n.created_at DESC`,
    [patientId]
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
    status: "status",
    subjective: "subjective",
    objective: "objective",
    assessment: "assessment",
    plan: "plan",
    followUpInstructions: "follow_up_instructions",
    amendmentReason: "amendment_reason",
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

  if (data.status === 'finalized') {
    assignments.push("signed_at = NOW()");
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
  getNotesByPatientId,
  getClinicalNoteById,
  updateClinicalNote,
};
