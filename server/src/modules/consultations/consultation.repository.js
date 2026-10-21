const pool = require('../../config/db');

async function findEncounterById(id, client = pool) {
  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.gender AS patient_gender,
            p.date_of_birth AS patient_dob,
            p.blood_group AS patient_blood_group,
            d.full_name AS doctor_name,
            d.employee_code AS doctor_code,
            dep.name AS department_name,
            a.appointment_number,
            a.appointment_date,
            a.start_time,
            a.status AS appointment_status,
            a.notes AS appointment_notes
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     LEFT JOIN departments dep ON dep.id = d.department_id
     JOIN appointments a ON a.id = e.appointment_id
     WHERE e.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findEncounterByAppointmentId(appointmentId, client = pool) {
  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.gender AS patient_gender,
            p.date_of_birth AS patient_dob,
            p.blood_group AS patient_blood_group,
            d.full_name AS doctor_name,
            d.employee_code AS doctor_code,
            dep.name AS department_name,
            a.appointment_number,
            a.appointment_date,
            a.start_time,
            a.status AS appointment_status,
            a.notes AS appointment_notes
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     LEFT JOIN departments dep ON dep.id = d.department_id
     JOIN appointments a ON a.id = e.appointment_id
     WHERE e.appointment_id = $1`,
    [appointmentId]
  );
  return result.rows[0] || null;
}

async function createEncounter({ appointmentId, patientId, doctorId, summary, examination, impression, chiefComplaint }, client = pool) {
  const result = await client.query(
    `INSERT INTO consultation_encounters (
      appointment_id,
      patient_id,
      doctor_id,
      status,
      summary,
      examination,
      impression,
      chief_complaint,
      started_at
    )
    VALUES ($1, $2, $3, 'in_progress', $4, $5, $6, $7, NOW())
    RETURNING *`,
    [
      appointmentId,
      patientId,
      doctorId,
      summary || null,
      examination || null,
      impression || null,
      chiefComplaint || null,
    ]
  );
  return result.rows[0];
}

async function updateEncounter(id, fields = {}, client = pool) {
  const mapping = {
    summary: 'summary',
    examination: 'examination',
    impression: 'impression',
    chief_complaint: 'chief_complaint',
    status: 'status',
  };

  const setClauses = [];
  const params = [id];
  let idx = 2;

  for (const [key, col] of Object.entries(mapping)) {
    if (fields[key] !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      params.push(fields[key]);
    }
  }

  if (setClauses.length === 0) {
    return findEncounterById(id, client);
  }

  setClauses.push('updated_at = NOW()');

  const query = `
    UPDATE consultation_encounters
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, params);
  return result.rows[0] || null;
}

async function getEncounters({ patientId, doctorId, status, search, date }, client = pool) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (patientId) {
    conditions.push(`e.patient_id = $${idx++}`);
    params.push(patientId);
  }
  if (doctorId) {
    conditions.push(`e.doctor_id = $${idx++}`);
    params.push(doctorId);
  }
  if (status) {
    conditions.push(`e.status = $${idx++}`);
    params.push(status);
  }
  if (date) {
    conditions.push(`a.appointment_date = $${idx++}`);
    params.push(date);
  }
  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(p.full_name) LIKE $${idx} OR
      LOWER(p.uhid) LIKE $${idx} OR
      LOWER(a.appointment_number) LIKE $${idx} OR
      LOWER(d.full_name) LIKE $${idx}
    )`);
    params.push(q);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.gender AS patient_gender,
            p.date_of_birth AS patient_dob,
            d.full_name AS doctor_name,
            dep.name AS department_name,
            a.appointment_number,
            a.appointment_date,
            a.start_time,
            a.status AS appointment_status
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     LEFT JOIN departments dep ON dep.id = d.department_id
     JOIN appointments a ON a.id = e.appointment_id
     ${whereClause}
     ORDER BY e.started_at DESC`,
    params
  );
  return result.rows;
}

async function completeEncounterAtomic(id, doctorId, { summary, examination, impression, chiefComplaint } = {}, client = pool) {
  const assignments = [
    "status = 'completed'",
    'completed_at = NOW()',
    'updated_at = NOW()',
  ];
  const params = [id];
  let idx = 2;

  if (doctorId) {
    // doctor check parameter
    params.push(doctorId);
    idx++;
  }

  if (summary !== undefined) {
    assignments.push(`summary = $${idx++}`);
    params.push(summary);
  }
  if (examination !== undefined) {
    assignments.push(`examination = $${idx++}`);
    params.push(examination);
  }
  if (impression !== undefined) {
    assignments.push(`impression = $${idx++}`);
    params.push(impression);
  }
  if (chiefComplaint !== undefined) {
    assignments.push(`chief_complaint = $${idx++}`);
    params.push(chiefComplaint);
  }

  const whereDoctor = doctorId ? 'AND doctor_id = $2' : '';
  const query = `
    UPDATE consultation_encounters
    SET ${assignments.join(', ')}
    WHERE id = $1 ${whereDoctor} AND status = 'in_progress'
    RETURNING *
  `;

  const result = await client.query(query, params);
  return result.rows[0] || null;
}

async function getEncounterClinicalAggregate(encounterId, client = pool) {
  const [encounter, vitalsRes, historyRes, ordersRes, notesRes] = await Promise.all([
    findEncounterById(encounterId, client),
    client.query(
      `SELECT * FROM vitals_records WHERE encounter_id = $1 ORDER BY recorded_at DESC`,
      [encounterId]
    ),
    client.query(
      `SELECT * FROM clinical_histories WHERE encounter_id = $1 LIMIT 1`,
      [encounterId]
    ),
    client.query(
      `SELECT o.*, d.full_name AS ordered_by_name
       FROM provider_orders o
       JOIN doctors d ON d.id = o.ordered_by
       WHERE o.encounter_id = $1
       ORDER BY o.created_at ASC`,
      [encounterId]
    ),
    client.query(
      `SELECT n.*, d.full_name AS author_doctor_name, d.employee_code AS doctor_code
       FROM clinical_progress_notes n
       JOIN doctors d ON d.id = n.author_doctor_id
       WHERE n.encounter_id = $1
       ORDER BY n.created_at DESC`,
      [encounterId]
    ),
  ]);

  if (!encounter) return null;

  return {
    ...encounter,
    vitals: vitalsRes.rows,
    latest_vitals: vitalsRes.rows[0] || null,
    clinical_history: historyRes.rows[0] || null,
    orders: ordersRes.rows,
    progress_notes: notesRes.rows,
  };
}

module.exports = {
  pool,
  findEncounterById,
  findEncounterByAppointmentId,
  createEncounter,
  updateEncounter,
  getEncounters,
  completeEncounterAtomic,
  getEncounterClinicalAggregate,
};
