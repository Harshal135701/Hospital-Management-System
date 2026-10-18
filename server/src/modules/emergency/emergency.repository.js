const pool = require("../../config/db");

// 11.1 Triage Assessment
async function createTriage(data) {
  const {
    triage_number,
    patient_id,
    triage_level,
    chief_complaint,
    arrival_mode = "walk_in",
    gcs_score,
    pulse_rate,
    systolic_bp,
    diastolic_bp,
    respiratory_rate,
    oxygen_saturation,
    temperature_c,
    pain_score,
    triaged_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO emergency_triage (
      triage_number,
      patient_id,
      triage_level,
      chief_complaint,
      arrival_mode,
      gcs_score,
      pulse_rate,
      systolic_bp,
      diastolic_bp,
      respiratory_rate,
      oxygen_saturation,
      temperature_c,
      pain_score,
      triaged_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      triage_number,
      patient_id,
      triage_level,
      chief_complaint,
      arrival_mode,
      gcs_score || null,
      pulse_rate || null,
      systolic_bp || null,
      diastolic_bp || null,
      respiratory_rate || null,
      oxygen_saturation || null,
      temperature_c || null,
      pain_score || null,
      triaged_by || null,
    ]
  );
  return result.rows[0];
}

async function getTriageList(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`et.patient_id = $${values.length}`);
  }
  if (filters.triage_level) {
    values.push(filters.triage_level);
    conditions.push(`et.triage_level = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT 
      et.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      p.gender AS patient_gender,
      p.date_of_birth AS patient_dob,
      eba.bay_id,
      eb.bay_number,
      eb.zone AS bay_zone,
      ed.disposition_type
    FROM emergency_triage et
    JOIN patients p ON p.id = et.patient_id
    LEFT JOIN emergency_bay_allocations eba ON eba.triage_id = et.id AND eba.vacated_at IS NULL
    LEFT JOIN emergency_bays eb ON eb.id = eba.bay_id
    LEFT JOIN emergency_dispositions ed ON ed.triage_id = et.id
    ${whereClause}
    ORDER BY et.triage_level ASC, et.triaged_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getTriageById(id) {
  const query = `
    SELECT 
      et.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      p.gender AS patient_gender,
      p.date_of_birth AS patient_dob,
      eba.bay_id,
      eb.bay_number,
      eb.zone AS bay_zone
    FROM emergency_triage et
    JOIN patients p ON p.id = et.patient_id
    LEFT JOIN emergency_bay_allocations eba ON eba.triage_id = et.id AND eba.vacated_at IS NULL
    LEFT JOIN emergency_bays eb ON eb.id = eba.bay_id
    WHERE et.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// 11.2 MLC Registry
async function createMlc(data) {
  const {
    mlc_number,
    patient_id,
    police_station,
    officer_name,
    officer_badge_no,
    case_type,
    incident_date_time,
    injury_details,
    alcohol_suspected = false,
    fit_for_statement = true,
    certificate_issued = false,
    registered_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO emergency_mlc_registry (
      mlc_number,
      patient_id,
      police_station,
      officer_name,
      officer_badge_no,
      case_type,
      incident_date_time,
      injury_details,
      alcohol_suspected,
      fit_for_statement,
      certificate_issued,
      registered_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      mlc_number,
      patient_id,
      police_station,
      officer_name || null,
      officer_badge_no || null,
      case_type,
      incident_date_time || new Date(),
      injury_details,
      alcohol_suspected,
      fit_for_statement,
      certificate_issued,
      registered_by || null,
    ]
  );
  return result.rows[0];
}

async function getMlcList(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`emr.patient_id = $${values.length}`);
  }
  if (filters.case_type) {
    values.push(filters.case_type);
    conditions.push(`emr.case_type = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT emr.*, p.full_name AS patient_name, p.uhid AS patient_uhid
    FROM emergency_mlc_registry emr
    JOIN patients p ON p.id = emr.patient_id
    ${whereClause}
    ORDER BY emr.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

// 11.3 Emergency Bays & Bed Allocation
async function createBay(data) {
  const { code, zone, bay_number, status = "available" } = data;
  const result = await pool.query(
    `INSERT INTO emergency_bays (code, zone, bay_number, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [code, zone, bay_number, status]
  );
  return result.rows[0];
}

async function getBays(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.zone) {
    values.push(filters.zone);
    conditions.push(`zone = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT * FROM emergency_bays ${whereClause} ORDER BY zone, bay_number`,
    values
  );
  return result.rows;
}

async function allocateBay(triageId, bayId, allocatedBy) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Vacate any current allocation for this triage
    await client.query(
      `UPDATE emergency_bay_allocations SET vacated_at = NOW() WHERE triage_id = $1 AND vacated_at IS NULL`,
      [triageId]
    );

    const allocRes = await client.query(
      `INSERT INTO emergency_bay_allocations (triage_id, bay_id, allocated_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [triageId, bayId, allocatedBy || null]
    );

    await client.query(
      `UPDATE emergency_bays SET status = 'occupied' WHERE id = $1`,
      [bayId]
    );

    await client.query("COMMIT");
    return allocRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function vacateBay(triageId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const getRes = await client.query(
      `UPDATE emergency_bay_allocations
       SET vacated_at = NOW()
       WHERE triage_id = $1 AND vacated_at IS NULL
       RETURNING bay_id`,
      [triageId]
    );

    const bayId = getRes.rows[0]?.bay_id;
    if (bayId) {
      await client.query(
        `UPDATE emergency_bays SET status = 'available' WHERE id = $1`,
        [bayId]
      );
    }

    await client.query("COMMIT");
    return { triage_id: triageId, bay_id: bayId, status: "vacated" };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// 11.4 Trauma Charting
async function createTraumaChart(data) {
  const {
    triage_id,
    airway_status,
    breathing_status,
    circulation_status,
    disability_neuro,
    exposure_findings,
    fast_scan_findings,
    revised_trauma_score,
    attending_doctor_id,
    notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO emergency_trauma_charts (
      triage_id,
      airway_status,
      breathing_status,
      circulation_status,
      disability_neuro,
      exposure_findings,
      fast_scan_findings,
      revised_trauma_score,
      attending_doctor_id,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      triage_id,
      airway_status,
      breathing_status,
      circulation_status,
      disability_neuro,
      exposure_findings || null,
      fast_scan_findings || null,
      revised_trauma_score || null,
      attending_doctor_id || null,
      notes || null,
    ]
  );
  return result.rows[0];
}

async function getTraumaChartByTriage(triageId) {
  const result = await pool.query(
    `SELECT etc.*, d.full_name AS attending_doctor_name
     FROM emergency_trauma_charts etc
     LEFT JOIN doctors d ON d.id = etc.attending_doctor_id
     WHERE etc.triage_id = $1
     ORDER BY etc.recorded_at DESC`,
    [triageId]
  );
  return result.rows;
}

// 11.5 Rapid Disposition
async function createDisposition(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      triage_id,
      disposition_type,
      target_unit,
      clinician_id,
      handover_summary,
      follow_up_instructions,
    } = data;

    const dispRes = await client.query(
      `INSERT INTO emergency_dispositions (
        triage_id,
        disposition_type,
        target_unit,
        clinician_id,
        handover_summary,
        follow_up_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        triage_id,
        disposition_type,
        target_unit || null,
        clinician_id || null,
        handover_summary,
        follow_up_instructions || null,
      ]
    );

    // Also vacate bay
    const bayAlloc = await client.query(
      `UPDATE emergency_bay_allocations
       SET vacated_at = NOW()
       WHERE triage_id = $1 AND vacated_at IS NULL
       RETURNING bay_id`,
      [triage_id]
    );
    if (bayAlloc.rows[0]?.bay_id) {
      await client.query(
        `UPDATE emergency_bays SET status = 'available' WHERE id = $1`,
        [bayAlloc.rows[0].bay_id]
      );
    }

    await client.query("COMMIT");
    return dispRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getDispositionByTriage(triageId) {
  const result = await pool.query(
    `SELECT ed.*, d.full_name AS clinician_name
     FROM emergency_dispositions ed
     LEFT JOIN doctors d ON d.id = ed.clinician_id
     WHERE ed.triage_id = $1`,
    [triageId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createTriage,
  getTriageList,
  getTriageById,
  createMlc,
  getMlcList,
  createBay,
  getBays,
  allocateBay,
  vacateBay,
  createTraumaChart,
  getTraumaChartByTriage,
  createDisposition,
  getDispositionByTriage,
};
