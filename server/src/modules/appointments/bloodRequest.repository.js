const pool = require("../../config/db");

async function findPatientById(id, client = pool) {
  const res = await client.query("SELECT * FROM patients WHERE id = $1", [id]);
  return res.rows[0] || null;
}

async function findAppointmentById(id, client = pool) {
  const res = await client.query(
    `SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name, dep.name AS department_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN departments dep ON dep.id = a.department_id
     WHERE a.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function findDoctorById(id, client = pool) {
  const res = await client.query(
    "SELECT * FROM doctors WHERE id = $1 AND is_active = true",
    [id]
  );
  return res.rows[0] || null;
}

async function generateRequisitionNumber(client = pool) {
  const year = new Date().getFullYear();
  const res = await client.query(
    `SELECT COUNT(*) AS total FROM blood_requisitions WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  const seq = String(parseInt(res.rows[0].total, 10) + 1).padStart(4, "0");
  return `REQ-${year}-${seq}`;
}

async function createBloodRequisitionWithClient(data, client) {
  const reqNumber = await generateRequisitionNumber(client);
  const query = `
    INSERT INTO blood_requisitions (
      requisition_number,
      patient_id,
      department_id,
      doctor_id,
      requester_name,
      urgency,
      requested_component,
      units_requested,
      patient_blood_group,
      patient_rh_factor,
      clinical_indication,
      required_by,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
    RETURNING *;
  `;
  const values = [
    reqNumber,
    data.patientId,
    data.departmentId || null,
    data.doctorId || null,
    data.requesterName || "Attending Clinician",
    data.urgency,
    data.requestedComponent,
    data.unitsRequested,
    data.patientBloodGroup,
    data.patientRhFactor,
    data.clinicalIndication,
    data.requiredBy || null,
  ];
  const res = await client.query(query, values);
  return res.rows[0];
}

async function createBloodRequestWithClient(data, client) {
  const query = `
    INSERT INTO appointment_blood_requests (
      patient_id,
      appointment_id,
      requested_by_doctor_id,
      blood_requisition_id,
      blood_group,
      component_type,
      units_requested,
      urgency,
      clinical_indication,
      required_by,
      notes,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
    RETURNING *;
  `;

  const values = [
    data.patientId,
    data.appointmentId || null,
    data.requestedByDoctorId || null,
    data.bloodRequisitionId || null,
    data.bloodGroup,
    data.componentType,
    data.unitsRequested,
    data.urgency,
    data.clinicalIndication,
    data.requiredBy || null,
    data.notes || null,
  ];

  const res = await client.query(query, values);
  return res.rows[0];
}

async function getBloodRequests({ patient_id, appointment_id, status } = {}, client = pool) {
  const conditions = [];
  const values = [];

  if (patient_id) {
    values.push(patient_id);
    conditions.push(`abr.patient_id = $${values.length}`);
  }

  if (appointment_id) {
    values.push(appointment_id);
    conditions.push(`abr.appointment_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`abr.status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT abr.*,
           p.full_name AS patient_name,
           p.uhid AS patient_uhid,
           d.full_name AS doctor_name,
           d.employee_code AS doctor_code,
           br.requisition_number,
           br.status AS blood_bank_status,
           a.appointment_number,
           a.appointment_date
    FROM appointment_blood_requests abr
    JOIN patients p ON p.id = abr.patient_id
    LEFT JOIN doctors d ON d.id = abr.requested_by_doctor_id
    LEFT JOIN blood_requisitions br ON br.id = abr.blood_requisition_id
    LEFT JOIN appointments a ON a.id = abr.appointment_id
    ${where}
    ORDER BY abr.created_at DESC
  `;

  const res = await client.query(query, values);
  return res.rows;
}

async function getBloodRequestById(id, client = pool) {
  const query = `
    SELECT abr.*,
           p.full_name AS patient_name,
           p.uhid AS patient_uhid,
           d.full_name AS doctor_name,
           d.employee_code AS doctor_code,
           br.requisition_number,
           br.status AS blood_bank_status,
           a.appointment_number,
           a.appointment_date
    FROM appointment_blood_requests abr
    JOIN patients p ON p.id = abr.patient_id
    LEFT JOIN doctors d ON d.id = abr.requested_by_doctor_id
    LEFT JOIN blood_requisitions br ON br.id = abr.blood_requisition_id
    LEFT JOIN appointments a ON a.id = abr.appointment_id
    WHERE abr.id = $1
  `;
  const res = await client.query(query, [id]);
  return res.rows[0] || null;
}

async function updateBloodRequestStatus(id, status, notes, client = pool) {
  const query = `
    UPDATE appointment_blood_requests
    SET status = $2,
        notes = COALESCE($3, notes),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  const res = await client.query(query, [id, status, notes ?? null]);
  return res.rows[0] || null;
}

module.exports = {
  pool,
  findPatientById,
  findAppointmentById,
  findDoctorById,
  createBloodRequisitionWithClient,
  createBloodRequestWithClient,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};
