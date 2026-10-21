const repository = require("./clinical-notes.repository");
const ApiError = require("../../utils/ApiError");

const NOTE_TYPES = ["initial", "progress", "follow_up"];
const NOTE_STATUSES = ["draft", "finalized", "amended"];

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

function requireRole(currentUser, allowedRoles, message) {
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    throw ApiError.forbidden(message);
  }
}

async function createClinicalNote(data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may author clinical progress notes"
  );

  const encounterId = data.encounter_id || data.encounterId;
  const encounter = await validateEncounter(encounterId);

  const authorDoctorId =
    currentUser.role === "clinician_doctor"
      ? (currentUser.doctor_id || encounter.doctor_id)
      : encounter.doctor_id;

  const noteStatus = data.status || "finalized";
  if (!NOTE_STATUSES.includes(noteStatus)) {
    throw ApiError.badRequest(`status must be one of: ${NOTE_STATUSES.join(", ")}`);
  }

  if (noteStatus === "finalized") {
    if (!data.assessment || !data.assessment.trim()) {
      throw ApiError.badRequest("Assessment is required before finalizing a progress note");
    }
    if (!data.plan || !data.plan.trim()) {
      throw ApiError.badRequest("Plan is required before finalizing a progress note");
    }
  }

  return repository.createClinicalNote({
    encounterId,
    noteType: data.note_type || "progress",
    status: noteStatus,
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
    authorDoctorId,
    amendedFromNoteId: data.amended_from_note_id || null,
    amendmentReason: data.amendment_reason || null,
  });
}

async function getNotesByEncounterId(encounterId, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view clinical progress notes"
  );

  await validateEncounter(encounterId, false);
  return repository.getNotesByEncounterId(encounterId);
}

async function getNotesByPatientId(patientId, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view clinical progress notes history"
  );

  return repository.getNotesByPatientId(patientId);
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

  return note;
}

async function updateClinicalNote(id, data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may update clinical progress notes"
  );

  const note = await repository.getClinicalNoteById(id);

  if (!note) {
    throw ApiError.notFound("Clinical progress note not found");
  }

  if (currentUser.role === 'clinician_doctor') {
    if (String(note.author_doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden("You are not authorized to modify another doctor's progress note");
    }
  }

  if (note.status === "finalized" && data.status !== "amended") {
    throw ApiError.conflict(
      "Finalized clinical notes are legally signed and cannot be modified without amendment"
    );
  }

  await validateEncounter(note.encounter_id);

  const updatedData = {
    noteType: data.note_type,
    status: data.status,
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
    amendmentReason: data.amendment_reason,
  };

  return repository.updateClinicalNote(id, updatedData);
}

async function finalizeClinicalNote(id, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may sign clinical progress notes"
  );

  const note = await repository.getClinicalNoteById(id);
  if (!note) {
    throw ApiError.notFound("Clinical progress note not found");
  }

  if (currentUser.role === 'clinician_doctor') {
    if (String(note.author_doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden("You are not authorized to sign another doctor's progress note");
    }
  }

  if (note.status === "finalized") {
    throw ApiError.conflict("Clinical note is already finalized and signed");
  }

  if (!note.assessment || !note.assessment.trim()) {
    throw ApiError.badRequest("Assessment is required before finalizing a progress note");
  }
  if (!note.plan || !note.plan.trim()) {
    throw ApiError.badRequest("Plan is required before finalizing a progress note");
  }

  return repository.updateClinicalNote(id, { status: "finalized" });
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getNotesByPatientId,
  getClinicalNoteById,
  updateClinicalNote,
  finalizeClinicalNote,
};
