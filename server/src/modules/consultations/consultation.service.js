const repository = require('./consultation.repository');
const ApiError = require('../../utils/ApiError');

async function createEncounter(data, currentUser = {}) {
  const appointmentId = data.appointment_id || data.appointmentId;
  const patientId = data.patient_id || data.patientId;

  if (!appointmentId || !patientId) {
    throw ApiError.badRequest('Both appointment_id and patient_id are required');
  }

  // 1. Role-based privilege validation
  if (!['clinician_doctor', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinician doctors and administrators may initiate a consultation encounter');
  }

  // 2. Fetch linked appointment
  const aptResult = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = $1`,
    [appointmentId]
  );
  const appointment = aptResult.rows[0];

  if (!appointment) {
    throw ApiError.notFound('Referenced appointment not found');
  }

  // 3. Relational integrity: Ensure appointment belongs to the specified patient
  if (String(appointment.patient_id) !== String(patientId)) {
    throw ApiError.badRequest('Encounter patient mismatch: appointment does not belong to specified patient');
  }

  // 4. Record-level doctor ownership check: doctor must own this appointment
  let doctorId;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden('Authenticated user does not have an associated doctor record');
    }
    if (String(appointment.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to start a consultation for another doctor\'s appointment');
    }
    doctorId = currentUser.doctor_id;
  } else {
    // super_admin: doctorId assigned to appointment
    doctorId = appointment.doctor_id;
  }

  // 5. Appointment status validation: cannot start encounter on cancelled or no_show appointment
  if (['cancelled', 'no_show'].includes(appointment.status)) {
    throw ApiError.badRequest(`Cannot start consultation for a ${appointment.status} appointment`);
  }

  // 6. Check if an encounter already exists for this appointment
  const existing = await repository.findEncounterByAppointmentId(appointmentId);
  if (existing) {
    return existing;
  }

  // 7. Atomic creation of encounter and sync appointment status to 'in_consultation'
  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const encounter = await repository.createEncounter(
      { appointmentId, patientId, doctorId },
      client
    );

    if (appointment.status !== 'in_consultation') {
      await client.query(
        `UPDATE appointments
         SET status = 'in_consultation', updated_at = NOW()
         WHERE id = $1 AND status IN ('booked', 'arrived', 'waiting')`,
        [appointmentId]
      );
    }

    await client.query('COMMIT');
    return encounter;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getEncounterById(id, currentUser = {}) {
  const encounter = await repository.findEncounterById(id);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  // Record-level read access rules
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to access another clinician\'s consultation encounter');
    }
  } else if (!['staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical consultation encounters');
  }

  return encounter;
}

async function getEncounterByAppointmentId(appointmentId, currentUser = {}) {
  const encounter = await repository.findEncounterByAppointmentId(appointmentId);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter for appointment not found');
  }

  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to access another clinician\'s consultation encounter');
    }
  } else if (!['staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical consultation encounters');
  }

  return encounter;
}

async function listEncounters(filters = {}, currentUser = {}) {
  const queryFilters = { ...filters };

  if (currentUser.role === 'clinician_doctor') {
    queryFilters.doctorId = currentUser.doctor_id;
  } else if (!['staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to list clinical consultation encounters');
  }

  return repository.getEncounters(queryFilters);
}

async function completeEncounter(id, data = {}, currentUser = {}) {
  const encounter = await repository.findEncounterById(id);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  // Doctor ownership check
  let authorizedDoctorId = null;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id || String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to complete another clinician\'s consultation encounter');
    }
    authorizedDoctorId = currentUser.doctor_id;
  } else if (currentUser.role !== 'super_admin') {
    throw ApiError.forbidden('Only the attending clinician or super_admin may complete a consultation');
  }

  if (encounter.status === 'completed') {
    throw ApiError.conflict('Consultation encounter is already marked as completed');
  }

  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot complete consultation encounter in '${encounter.status}' state`);
  }

  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const updated = await repository.completeEncounterAtomic(id, authorizedDoctorId, client);
    if (!updated) {
      throw ApiError.conflict('Encounter state was modified concurrently by another process');
    }

    // Sync linked appointment to completed
    await client.query(
      `UPDATE appointments
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'in_consultation'`,
      [encounter.appointment_id]
    );

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createEncounter,
  getEncounterById,
  getEncounterByAppointmentId,
  listEncounters,
  completeEncounter,
};
