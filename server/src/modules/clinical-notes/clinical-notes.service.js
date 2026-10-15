const pool = require("../../config/db");
const repository = require("./clinical-notes.repository");

const NOTE_TYPES = ["initial", "progress", "follow_up"];

async function validateEncounter(encounter_id, requireActive = true) {
  if (!encounter_id) {
    throw Object.assign(new Error("Encounter ID is required"), {
      statusCode: 400,
    });
  }

  const result = await pool.query(
    `SELECT id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounter_id]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw Object.assign(
      new Error("Clinical notes can only be modified during an active consultation"),
      { statusCode: 400 }
    );
  }

  return encounter;
}

function validateNote(data, isUpdate = false) {
  if (
    data.note_type !== undefined &&
    !NOTE_TYPES.includes(data.note_type)
  ) {
    throw Object.assign(
      new Error(`Note type must be one of: ${NOTE_TYPES.join(", ")}`),
      { statusCode: 400 }
    );
  }

  for (const field of ["subjective", "objective", "assessment", "plan", "follow_up_instructions"]) {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      typeof data[field] !== "string"
    ) {
      throw Object.assign(new Error(`${field} must be text`), {
        statusCode: 400,
      });
    }
  }

  if (
    (!isUpdate || data.assessment !== undefined) &&
    (typeof data.assessment !== "string" || !data.assessment.trim())
  ) {
    throw Object.assign(new Error("Assessment is required"), {
      statusCode: 400,
    });
  }

  if (
    (!isUpdate || data.plan !== undefined) &&
    (typeof data.plan !== "string" || !data.plan.trim())
  ) {
    throw Object.assign(new Error("Plan is required"), {
      statusCode: 400,
    });
  }

  if (
    isUpdate &&
    ![
      "note_type",
      "subjective",
      "objective",
      "assessment",
      "plan",
      "follow_up_instructions",
    ].some((field) => data[field] !== undefined)
  ) {
    throw Object.assign(new Error("Provide at least one field to update"), {
      statusCode: 400,
    });
  }
}

async function validateDoctor(author_doctor_id) {
  if (!author_doctor_id) {
    throw Object.assign(new Error("Author doctor ID is required"), {
      statusCode: 400,
    });
  }

  const result = await pool.query(
    `SELECT id FROM doctors WHERE id = $1`,
    [author_doctor_id]
  );

  if (!result.rows[0]) {
    throw Object.assign(new Error("Author doctor not found"), {
      statusCode: 404,
    });
  }
}

async function createClinicalNote(data) {
  await validateEncounter(data.encounter_id);
  validateNote(data);
  await validateDoctor(data.author_doctor_id);

  return repository.createClinicalNote(data);
}

async function getNotesByEncounterId(encounter_id) {
  await validateEncounter(encounter_id, false);

  return repository.getNotesByEncounterId(encounter_id);
}

async function getClinicalNoteById(id) {
  if (!id) {
    throw Object.assign(new Error("Clinical note ID is required"), {
      statusCode: 400,
    });
  }

  const note = await repository.getClinicalNoteById(id);

  if (!note) {
    throw Object.assign(new Error("Clinical note not found"), {
      statusCode: 404,
    });
  }

  return note;
}

async function updateClinicalNote(id, data) {
  const existingNote = await getClinicalNoteById(id);

  await validateEncounter(existingNote.encounter_id);
  validateNote(data, true);

  const updatedData = {
    note_type: data.note_type ?? existingNote.note_type,
    subjective: data.subjective ?? existingNote.subjective,
    objective: data.objective ?? existingNote.objective,
    assessment: data.assessment ?? existingNote.assessment,
    plan: data.plan ?? existingNote.plan,
    follow_up_instructions:
      data.follow_up_instructions ?? existingNote.follow_up_instructions,
  };

  return repository.updateClinicalNote(id, updatedData);
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};