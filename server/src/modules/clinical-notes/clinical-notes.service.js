
const repository = require("./clinical-notes.repository");
const ApiError = require("../../utils/ApiError");

const NOTE_TYPES = ["initial", "progress", "follow_up"];

const textFields = [
  "subjective",
  "objective",
  "assessment",
  "plan",
  "follow_up_instructions",
];

async function validateEncounter(encounterId, requireActive = true) {
  if (!encounterId) {
    throw ApiError.badRequest("Encounter ID is required");
  }

  const result = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounterId]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw ApiError.notFound("Consultation encounter not found");
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw ApiError.badRequest(
      "Clinical notes can only be modified during an active consultation"
    );
  }

  return encounter;
}

function validateNote(data, isUpdate = false) {
  if (
    data.note_type !== undefined &&
    !NOTE_TYPES.includes(data.note_type)
  ) {
    throw ApiError.badRequest(
      `Note type must be one of: ${NOTE_TYPES.join(", ")}`
    );
  }

  for (const field of textFields) {
    const value = data[field];

    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "string"
    ) {
      throw ApiError.badRequest(`${field} must be text`);
    }
  }

  for (const field of ["assessment", "plan"]) {
    if (
      (!isUpdate || data[field] !== undefined) &&
      (typeof data[field] !== "string" || !data[field].trim())
    ) {
      throw ApiError.badRequest(`${field} is required`);
    }
  }

  if (
    isUpdate &&
    !["note_type", ...textFields].some(
      (field) => data[field] !== undefined
    )
  ) {
    throw ApiError.badRequest("Provide at least one field to update");
  }
}

function requireRole(currentUser, allowedRoles, message) {
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    throw ApiError.forbidden(message);
  }
}

function verifyDoctorOwnership(encounter, currentUser) {
  if (
    currentUser.role === "clinician_doctor" &&
    (
      !currentUser.doctor_id ||
      String(encounter.doctor_id) !== String(currentUser.doctor_id)
    )
  ) {
    throw ApiError.forbidden(
      "You are not authorized to access another doctor's consultation"
    );
  }
}

async function createClinicalNote(data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may author clinical progress notes"
  );

  validateNote(data);

  const encounterId = data.encounter_id || data.encounterId;
  const encounter = await validateEncounter(encounterId);

  verifyDoctorOwnership(encounter, currentUser);

  const authorDoctorId =
    currentUser.role === "clinician_doctor"
      ? currentUser.doctor_id
      : encounter.doctor_id;

  return repository.createClinicalNote({
    encounterId,
    noteType: data.note_type || "progress",
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
    authorDoctorId,
  });
}

async function getNotesByEncounterId(encounterId, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view clinical progress notes"
  );

  const encounter = await validateEncounter(encounterId, false);
  verifyDoctorOwnership(encounter, currentUser);

  return repository.getNotesByEncounterId(encounterId);
}

async function getClinicalNoteById(id, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view clinical progress notes"
  );

  if (!id) {
    throw ApiError.badRequest("Clinical note ID is required");
  }

  const note = await repository.getClinicalNoteById(id);

  if (!note) {
    throw ApiError.notFound("Clinical progress note not found");
  }

  const encounter = await validateEncounter(note.encounter_id, false);
  verifyDoctorOwnership(encounter, currentUser);

  return note;
}

async function updateClinicalNote(id, data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may update clinical progress notes"
  );

  validateNote(data, true);

  const note = await repository.getClinicalNoteById(id);

  if (!note) {
    throw ApiError.notFound("Clinical progress note not found");
  }

  const encounter = await validateEncounter(note.encounter_id);
  verifyDoctorOwnership(encounter, currentUser);

  if (
    currentUser.role === "clinician_doctor" &&
    String(note.author_doctor_id) !== String(currentUser.doctor_id)
  ) {
    throw ApiError.forbidden(
      "You are not authorized to modify another doctor's progress note"
    );
  }

  const updatedData = {
    noteType: data.note_type,
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
  };

  return repository.updateClinicalNote(id, updatedData);
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};
