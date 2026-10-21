const repository = require('./consultation.repository');
const ApiError = require('../../utils/ApiError');

async function createEncounter(data, currentUser = {}) {
  const appointmentId = data.appointment_id || data.appointmentId;
  const patientId = data.patient_id || data.patientId;
  const summary = data.summary;
  const examination = data.examination;
  const impression = data.impression;
  const chiefComplaint = data.chief_complaint || data.chiefComplaint;

  if (!appointmentId || !patientId) {
    throw ApiError.badRequest('Both appointment_id and patient_id are required');
  }

  // 1. Role-based privilege validation
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinical staff and administrators may initiate a consultation encounter');
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

  // 4. Record-level doctor assignment
  let doctorId;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden('Clinician account is not linked to an active doctor profile');
    }
    if (appointment.doctor_id && String(appointment.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to start a consultation for another doctor\'s appointment');
    }
    doctorId = currentUser.doctor_id;
  } else {
    doctorId = appointment.doctor_id;
  }

  // 5. Appointment status validation
  if (['cancelled', 'no_show'].includes(appointment.status)) {
    throw ApiError.badRequest(`Cannot start consultation for a ${appointment.status} appointment`);
  }

  // 6. Check if an encounter already exists for this appointment
  const existing = await repository.findEncounterByAppointmentId(appointmentId);
  if (existing) {
    return repository.getEncounterClinicalAggregate(existing.id);
  }

  // 7. Atomic creation of encounter and sync appointment status to 'in_consultation'
  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const encounter = await repository.createEncounter(
      {
        appointmentId,
        patientId,
        doctorId,
        summary,
        examination,
        impression,
        chiefComplaint,
      },
      client
    );

    if (appointment.status !== 'in_consultation' && appointment.status !== 'completed') {
      await client.query(
        `UPDATE appointments
         SET status = 'in_consultation', updated_at = NOW()
         WHERE id = $1 AND status IN ('booked', 'arrived', 'waiting')`,
        [appointmentId]
      );
    }

    // If chief complaint was provided, seed or upsert clinical_histories record
    if (chiefComplaint && chiefComplaint.trim()) {
      await client.query(
        `INSERT INTO clinical_histories (
           encounter_id, chief_complaints, history_of_present_illness, recorded_at, updated_at
         )
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (encounter_id) DO UPDATE SET
           chief_complaints = EXCLUDED.chief_complaints,
           history_of_present_illness = COALESCE(EXCLUDED.history_of_present_illness, clinical_histories.history_of_present_illness),
           updated_at = NOW()`,
        [encounter.id, chiefComplaint.trim(), summary || null]
      );
    }

    await client.query('COMMIT');
    return repository.getEncounterClinicalAggregate(encounter.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getEncounterById(id, currentUser = {}) {
  const encounter = await repository.getEncounterClinicalAggregate(id);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical consultation encounters');
  }

  return encounter;
}

async function getEncounterByAppointmentId(appointmentId, currentUser = {}) {
  const encounter = await repository.findEncounterByAppointmentId(appointmentId);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter for appointment not found');
  }

  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view clinical consultation encounters');
  }

  return repository.getEncounterClinicalAggregate(encounter.id);
}

async function listEncounters(filters = {}, currentUser = {}) {
  const queryFilters = { ...filters };

  if (!['clinician_doctor', 'staff_nurse', 'super_admin', 'receptionist'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to list clinical consultation encounters');
  }

  return repository.getEncounters(queryFilters);
}

async function updateEncounter(id, data = {}, currentUser = {}) {
  if (!['clinician_doctor', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only clinician doctors and administrators may update consultation details');
  }

  const encounter = await repository.findEncounterById(id);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id || String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to update another clinician\'s consultation encounter');
    }
  }

  if (encounter.status === 'completed' && data.status !== 'completed') {
    throw ApiError.conflict('Completed consultations cannot be modified directly');
  }

  const chiefComplaint = data.chief_complaint || data.chiefComplaint;
  const updatePayload = {
    summary: data.summary,
    examination: data.examination,
    impression: data.impression,
    chief_complaint: chiefComplaint,
    status: data.status,
  };

  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const updated = await repository.updateEncounter(id, updatePayload, client);

    // Sync chief complaint to clinical_histories if provided
    if (chiefComplaint && chiefComplaint.trim()) {
      await client.query(
        `INSERT INTO clinical_histories (
           encounter_id, chief_complaints, history_of_present_illness, recorded_at, updated_at
         )
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (encounter_id) DO UPDATE SET
           chief_complaints = EXCLUDED.chief_complaints,
           history_of_present_illness = COALESCE(EXCLUDED.history_of_present_illness, clinical_histories.history_of_present_illness),
           updated_at = NOW()`,
        [id, chiefComplaint.trim(), data.summary || null]
      );
    }

    await client.query('COMMIT');
    return repository.getEncounterClinicalAggregate(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function completeEncounter(id, data = {}, currentUser = {}) {
  const encounter = await repository.findEncounterById(id);
  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  let authorizedDoctorId = null;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id || String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to complete another clinician\'s consultation encounter');
    }
    authorizedDoctorId = currentUser.doctor_id;
  } else if (currentUser.role !== 'super_admin') {
    throw ApiError.forbidden('Only attending clinicians or administrators may complete a consultation');
  }

  if (encounter.status === 'completed') {
    throw ApiError.conflict('Consultation encounter is already marked as completed');
  }

  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot complete consultation encounter in '${encounter.status}' state`);
  }

  const chiefComplaint = data.chief_complaint || data.chiefComplaint;
  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const updated = await repository.completeEncounterAtomic(
      id,
      authorizedDoctorId,
      {
        summary: data.summary,
        examination: data.examination,
        impression: data.impression,
        chiefComplaint,
      },
      client
    );

    if (!updated) {
      throw ApiError.conflict('Encounter state was modified concurrently by another process');
    }

    // Sync linked appointment to completed
    await client.query(
      `UPDATE appointments
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status IN ('in_consultation', 'arrived', 'waiting')`,
      [encounter.appointment_id]
    );

    // Sync chief complaint to clinical_histories if provided
    if (chiefComplaint && chiefComplaint.trim()) {
      await client.query(
        `INSERT INTO clinical_histories (
           encounter_id, chief_complaints, history_of_present_illness, recorded_at, updated_at
         )
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (encounter_id) DO UPDATE SET
           chief_complaints = EXCLUDED.chief_complaints,
           history_of_present_illness = COALESCE(EXCLUDED.history_of_present_illness, clinical_histories.history_of_present_illness),
           updated_at = NOW()`,
        [id, chiefComplaint.trim(), data.summary || null]
      );
    }

    await client.query('COMMIT');
    return repository.getEncounterClinicalAggregate(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getPatientClinicalSummary(patientId, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view patient clinical records');
  }

  const [patientRes, encountersRes, vitalsRes, historiesRes, ordersRes, notesRes] = await Promise.all([
    repository.pool.query(
      `SELECT id, uhid, full_name, date_of_birth, gender, blood_group, mobile
       FROM patients WHERE id = $1`,
      [patientId]
    ),
    repository.pool.query(
      `SELECT e.*, d.full_name AS doctor_name, a.appointment_number, a.appointment_date
       FROM consultation_encounters e
       JOIN doctors d ON d.id = e.doctor_id
       JOIN appointments a ON a.id = e.appointment_id
       WHERE e.patient_id = $1
       ORDER BY e.started_at DESC`,
      [patientId]
    ),
    repository.pool.query(
      `SELECT v.*, d.full_name as recorded_by_name
       FROM vitals_records v
       JOIN consultation_encounters e ON e.id = v.encounter_id
       LEFT JOIN doctors d ON d.id = v.recorded_by
       WHERE e.patient_id = $1
       ORDER BY v.recorded_at DESC`,
      [patientId]
    ),
    repository.pool.query(
      `SELECT h.*
       FROM clinical_histories h
       JOIN consultation_encounters e ON e.id = h.encounter_id
       WHERE e.patient_id = $1
       ORDER BY h.recorded_at DESC`,
      [patientId]
    ),
    repository.pool.query(
      `SELECT o.*, d.full_name AS ordered_by_name
       FROM provider_orders o
       JOIN consultation_encounters e ON e.id = o.encounter_id
       JOIN doctors d ON d.id = o.ordered_by
       WHERE e.patient_id = $1
       ORDER BY o.created_at DESC`,
      [patientId]
    ),
    repository.pool.query(
      `SELECT n.*, d.full_name AS author_doctor_name
       FROM clinical_progress_notes n
       JOIN consultation_encounters e ON e.id = n.encounter_id
       JOIN doctors d ON d.id = n.author_doctor_id
       WHERE e.patient_id = $1
       ORDER BY n.created_at DESC`,
      [patientId]
    ),
  ]);

  if (!patientRes.rows[0]) {
    throw ApiError.notFound('Patient record not found');
  }

  return {
    patient: patientRes.rows[0],
    encounters: encountersRes.rows,
    vitals_history: vitalsRes.rows,
    clinical_history: historiesRes.rows,
    orders: ordersRes.rows,
    progress_notes: notesRes.rows,
  };
}

module.exports = {
  createEncounter,
  getEncounterById,
  getEncounterByAppointmentId,
  listEncounters,
  updateEncounter,
  completeEncounter,
  getPatientClinicalSummary,
};
