const repository = require('./clinical-notes.repository');
const ApiError = require('../../utils/ApiError');

async function validateEncounter(encounterId) {
  const result = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM consultation_encounters WHERE id = $1`,
    [encounterId]
  );
  const encounter = result.rows[0];

  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  return encounter;
}

async function createClinicalNote(data, currentUser = {}) {
  const encounterId = data.encounter_id || data.encounterId;

  // 1. Role verification: Only licensed doctors or super_admin may author progress notes
  if (!['clinician_doctor', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinician doctors and administrators may author clinical progress notes');
  }

  const encounter = await validateEncounter(encounterId);

  // 2. Active status check
  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot author clinical progress notes for encounter in '${encounter.status}' status. Consultation must be active.`);
  }

  // 3. Attending doctor ownership verification
  let authorDoctorId;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden('Authenticated user does not have an associated doctor record');
    }
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to author notes for another doctor\'s encounter');
    }
    authorDoctorId = currentUser.doctor_id;
  } else {
    authorDoctorId = encounter.doctor_id;
  }

  return repository.createClinicalNote({
    encounterId,
    noteType: data.note_type || 'progress',
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
    authorDoctorId,
  });
}

async function getNotesByEncounterId(encounterId, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical progress notes');
  }

  const encounter = await validateEncounter(encounterId);

  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to view notes for another doctor\'s encounter');
    }
  }

  return repository.getNotesByEncounterId(encounterId);
}

async function getClinicalNoteById(id, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical progress notes');
  }

  const note = await repository.getClinicalNoteById(id);
  if (!note) {
    throw ApiError.notFound('Clinical progress note not found');
  }

  const encounter = await validateEncounter(note.encounter_id);
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to view this note');
    }
  }

  return note;
}

async function updateClinicalNote(id, data, currentUser = {}) {
  if (!['clinician_doctor', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinician doctors and administrators may update clinical progress notes');
  }

  const note = await repository.getClinicalNoteById(id);
  if (!note) {
    throw ApiError.notFound('Clinical progress note not found');
  }

  const encounter = await validateEncounter(note.encounter_id);
  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot modify notes for encounter in '${encounter.status}' status`);
  }

  if (currentUser.role === 'clinician_doctor') {
    if (String(note.author_doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to modify another doctor\'s progress note');
    }
  }

  return repository.updateClinicalNote(id, {
    noteType: data.note_type,
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan,
    followUpInstructions: data.follow_up_instructions,
  });
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};
