const pool = require("../../config/db");

// 8.1 & 8.2 Admissions & Chair Allocation
async function createAdmission(data) {
  const {
    admission_number,
    patient_id,
    doctor_id,
    chair_id,
    procedure_name,
    procedure_date,
    planned_duration_minutes,
    pre_op_instructions,
    status = "booked",
  } = data;

  const admittedAt = status === "admitted" ? new Date() : null;

  const result = await pool.query(
    `INSERT INTO daycare_admissions (
      admission_number,
      patient_id,
      doctor_id,
      chair_id,
      procedure_name,
      procedure_date,
      planned_duration_minutes,
      pre_op_instructions,
      status,
      admitted_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      admission_number,
      patient_id,
      doctor_id || null,
      chair_id || null,
      procedure_name,
      procedure_date || new Date(),
      planned_duration_minutes || 120,
      pre_op_instructions || null,
      status,
      admittedAt,
    ]
  );
  return result.rows[0];
}

async function getAdmissions(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`da.patient_id = $${values.length}`);
  }
  if (filters.doctor_id) {
    values.push(filters.doctor_id);
    conditions.push(`da.doctor_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`da.status = $${values.length}`);
  }
  if (filters.procedure_date) {
    values.push(filters.procedure_date);
    conditions.push(`da.procedure_date = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      da.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      d.full_name AS doctor_name,
      dc.name AS chair_name,
      dc.code AS chair_code,
      dc.zone AS chair_zone
    FROM daycare_admissions da
    JOIN patients p ON p.id = da.patient_id
    LEFT JOIN doctors d ON d.id = da.doctor_id
    LEFT JOIN daycare_chairs dc ON dc.id = da.chair_id
    ${whereClause}
    ORDER BY da.created_at DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getAdmissionById(id) {
  const query = `
    SELECT
      da.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      p.gender AS patient_gender,
      p.date_of_birth AS patient_dob,
      d.full_name AS doctor_name,
      dc.name AS chair_name,
      dc.code AS chair_code,
      dc.zone AS chair_zone
    FROM daycare_admissions da
    JOIN patients p ON p.id = da.patient_id
    LEFT JOIN doctors d ON d.id = da.doctor_id
    LEFT JOIN daycare_chairs dc ON dc.id = da.chair_id
    WHERE da.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateAdmissionStatus(id, status) {
  const query = `
    UPDATE daycare_admissions
    SET
      status = $2,
      admitted_at = CASE WHEN $2 = 'admitted' AND admitted_at IS NULL THEN NOW() ELSE admitted_at END,
      discharged_at = CASE WHEN $2 = 'discharged' THEN NOW() ELSE discharged_at END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id, status]);
  return result.rows[0] || null;
}

// 8.2 Chairs
async function createChair(data) {
  const { code, name, type = "bed", zone = "Main Bay", status = "available" } = data;
  const result = await pool.query(
    `INSERT INTO daycare_chairs (code, name, type, zone, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [code, name, type, zone, status]
  );
  return result.rows[0];
}

async function getChairs(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.zone) {
    values.push(filters.zone);
    conditions.push(`zone = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM daycare_chairs ${whereClause} ORDER BY zone, name`,
    values
  );
  return result.rows;
}

async function updateChairStatus(id, status) {
  const result = await pool.query(
    `UPDATE daycare_chairs SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] || null;
}

async function allocateChairToAdmission(admissionId, chairId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const admissionRes = await client.query(
      `UPDATE daycare_admissions SET chair_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [admissionId, chairId]
    );
    await client.query(
      `UPDATE daycare_chairs SET status = 'occupied' WHERE id = $1`,
      [chairId]
    );
    await client.query("COMMIT");
    return admissionRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function releaseChairFromAdmission(admissionId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const getRes = await client.query(
      `SELECT chair_id FROM daycare_admissions WHERE id = $1`,
      [admissionId]
    );
    const chairId = getRes.rows[0]?.chair_id;

    const admissionRes = await client.query(
      `UPDATE daycare_admissions SET chair_id = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [admissionId]
    );

    if (chairId) {
      await client.query(
        `UPDATE daycare_chairs SET status = 'available' WHERE id = $1`,
        [chairId]
      );
    }
    await client.query("COMMIT");
    return admissionRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// 8.3 Clinical Procedure Monitoring
async function addProcedureMonitoring(data) {
  const {
    daycare_admission_id,
    pulse_rate,
    systolic_bp,
    diastolic_bp,
    oxygen_saturation,
    respiratory_rate,
    anesthesia_type,
    sedation_score,
    adverse_events,
    surgical_checklist_signed = false,
    notes,
    recorded_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO daycare_procedure_monitors (
      daycare_admission_id,
      pulse_rate,
      systolic_bp,
      diastolic_bp,
      oxygen_saturation,
      respiratory_rate,
      anesthesia_type,
      sedation_score,
      adverse_events,
      surgical_checklist_signed,
      notes,
      recorded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      daycare_admission_id,
      pulse_rate || null,
      systolic_bp || null,
      diastolic_bp || null,
      oxygen_saturation || null,
      respiratory_rate || null,
      anesthesia_type || null,
      sedation_score || null,
      adverse_events || null,
      surgical_checklist_signed,
      notes || null,
      recorded_by || null,
    ]
  );
  return result.rows[0];
}

async function getProcedureMonitors(admissionId) {
  const result = await pool.query(
    `SELECT dpm.*, d.full_name AS doctor_name
     FROM daycare_procedure_monitors dpm
     LEFT JOIN doctors d ON d.id = dpm.recorded_by
     WHERE dpm.daycare_admission_id = $1
     ORDER BY dpm.monitored_at ASC`,
    [admissionId]
  );
  return result.rows;
}

// 8.4 Same-Day Discharge Summary
async function createDischargeSummary(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      daycare_admission_id,
      aldrete_score,
      padss_score,
      vitals_stable = true,
      post_op_instructions,
      medications_prescribed = [],
      follow_up_date,
      emergency_contact_advice,
      authorized_by,
    } = data;

    const summaryRes = await client.query(
      `INSERT INTO daycare_discharge_summaries (
        daycare_admission_id,
        aldrete_score,
        padss_score,
        vitals_stable,
        post_op_instructions,
        medications_prescribed,
        follow_up_date,
        emergency_contact_advice,
        authorized_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        daycare_admission_id,
        aldrete_score || null,
        padss_score || null,
        vitals_stable,
        post_op_instructions || null,
        JSON.stringify(medications_prescribed),
        follow_up_date || null,
        emergency_contact_advice || null,
        authorized_by || null,
      ]
    );

    // Update admission to discharged
    const admRes = await client.query(
      `UPDATE daycare_admissions
       SET status = 'discharged', discharged_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING chair_id`,
      [daycare_admission_id]
    );

    // Release chair if occupied
    const chairId = admRes.rows[0]?.chair_id;
    if (chairId) {
      await client.query(
        `UPDATE daycare_chairs SET status = 'available' WHERE id = $1`,
        [chairId]
      );
    }

    await client.query("COMMIT");
    return summaryRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getDischargeSummary(admissionId) {
  const result = await pool.query(
    `SELECT dds.*, d.full_name AS authorized_doctor_name
     FROM daycare_discharge_summaries dds
     LEFT JOIN doctors d ON d.id = dds.authorized_by
     WHERE dds.daycare_admission_id = $1`,
    [admissionId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  createChair,
  getChairs,
  updateChairStatus,
  allocateChairToAdmission,
  releaseChairFromAdmission,
  addProcedureMonitoring,
  getProcedureMonitors,
  createDischargeSummary,
  getDischargeSummary,
};
