const pool = require("../../config/db");

// Cycles
async function createCycle(data) {
  const {
    cycle_number,
    patient_id,
    partner_name,
    cycle_type = "self",
    start_date,
    status = "in_progress",
  } = data;

  const result = await pool.query(
    `INSERT INTO ivf_cycles (cycle_number, patient_id, partner_name, cycle_type, start_date, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [cycle_number, patient_id, partner_name || null, cycle_type, start_date || new Date(), status]
  );
  return result.rows[0];
}

async function getCycles(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`ic.patient_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`ic.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT ic.*, p.full_name AS patient_name, p.uhid AS patient_uhid
    FROM ivf_cycles ic
    JOIN patients p ON p.id = ic.patient_id
    ${whereClause}
    ORDER BY ic.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getCycleById(id) {
  const query = `
    SELECT ic.*, p.full_name AS patient_name, p.uhid AS patient_uhid
    FROM ivf_cycles ic
    JOIN patients p ON p.id = ic.patient_id
    WHERE ic.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// 10.1 Oocyte Retrieval (OPU)
async function recordOpu(data) {
  const {
    cycle_id,
    retrieval_date,
    follicles_aspirated = 0,
    oocytes_retrieved = 0,
    mii_count = 0,
    mi_count = 0,
    gv_count = 0,
    degenerated_count = 0,
    physician_id,
    embryologist_name,
    notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO ivf_oocyte_retrievals (
      cycle_id,
      retrieval_date,
      follicles_aspirated,
      oocytes_retrieved,
      mii_count,
      mi_count,
      gv_count,
      degenerated_count,
      physician_id,
      embryologist_name,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      cycle_id,
      retrieval_date || new Date(),
      follicles_aspirated,
      oocytes_retrieved,
      mii_count,
      mi_count,
      gv_count,
      degenerated_count,
      physician_id || null,
      embryologist_name || null,
      notes || null,
    ]
  );
  return result.rows[0];
}

async function getOpuByCycle(cycleId) {
  const result = await pool.query(
    `SELECT ior.*, d.full_name AS physician_name
     FROM ivf_oocyte_retrievals ior
     LEFT JOIN doctors d ON d.id = ior.physician_id
     WHERE ior.cycle_id = $1
     ORDER BY ior.retrieval_date DESC`,
    [cycleId]
  );
  return result.rows;
}

// 10.2 Fertilization Records
async function recordFertilization(data) {
  const {
    cycle_id,
    fertilization_method,
    sperm_sample_id,
    insemination_time,
    oocytes_inseminated = 0,
    normal_2pn_count = 0,
    abnormal_1pn_count = 0,
    abnormal_multipn_count = 0,
    unfertilized_count = 0,
    embryologist_name,
    remarks,
  } = data;

  const result = await pool.query(
    `INSERT INTO ivf_fertilization_records (
      cycle_id,
      fertilization_method,
      sperm_sample_id,
      insemination_time,
      oocytes_inseminated,
      normal_2pn_count,
      abnormal_1pn_count,
      abnormal_multipn_count,
      unfertilized_count,
      embryologist_name,
      remarks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      cycle_id,
      fertilization_method,
      sperm_sample_id || null,
      insemination_time || new Date(),
      oocytes_inseminated,
      normal_2pn_count,
      abnormal_1pn_count,
      abnormal_multipn_count,
      unfertilized_count,
      embryologist_name || null,
      remarks || null,
    ]
  );
  return result.rows[0];
}

async function getFertilizationByCycle(cycleId) {
  const result = await pool.query(
    `SELECT * FROM ivf_fertilization_records WHERE cycle_id = $1 ORDER BY insemination_time DESC`,
    [cycleId]
  );
  return result.rows;
}

// 10.3 Embryo Morphological Grading
async function createEmbryo(data) {
  const {
    cycle_id,
    embryo_code,
    day_number = 3,
    cell_count,
    fragmentation_percent,
    gardner_grade,
    status = "viable",
    biopsy_taken = false,
    notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO ivf_embryos (
      cycle_id,
      embryo_code,
      day_number,
      cell_count,
      fragmentation_percent,
      gardner_grade,
      status,
      biopsy_taken,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      cycle_id,
      embryo_code,
      day_number,
      cell_count || null,
      fragmentation_percent || null,
      gardner_grade || null,
      status,
      biopsy_taken,
      notes || null,
    ]
  );
  return result.rows[0];
}

async function getEmbryosByCycle(cycleId) {
  const result = await pool.query(
    `SELECT * FROM ivf_embryos WHERE cycle_id = $1 ORDER BY embryo_code ASC`,
    [cycleId]
  );
  return result.rows;
}

async function updateEmbryo(id, data) {
  const { status, gardner_grade, notes, biopsy_taken } = data;
  const result = await pool.query(
    `UPDATE ivf_embryos
     SET
       status = COALESCE($2, status),
       gardner_grade = COALESCE($3, gardner_grade),
       notes = COALESCE($4, notes),
       biopsy_taken = COALESCE($5, biopsy_taken)
     WHERE id = $1
     RETURNING *`,
    [id, status, gardner_grade, notes, biopsy_taken]
  );
  return result.rows[0] || null;
}

// 10.4 Embryo Transfer (ET) Protocol
async function recordTransfer(data) {
  const {
    cycle_id,
    transfer_date,
    transfer_type = "fresh",
    embryos_transferred_count = 1,
    catheter_type,
    ultrasound_guided = true,
    endometrium_thickness_mm,
    physician_id,
    embryologist_name,
    luteal_phase_regimen,
    pregnancy_test_date,
    notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO ivf_embryo_transfers (
      cycle_id,
      transfer_date,
      transfer_type,
      embryos_transferred_count,
      catheter_type,
      ultrasound_guided,
      endometrium_thickness_mm,
      physician_id,
      embryologist_name,
      luteal_phase_regimen,
      pregnancy_test_date,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      cycle_id,
      transfer_date || new Date(),
      transfer_type,
      embryos_transferred_count,
      catheter_type || null,
      ultrasound_guided,
      endometrium_thickness_mm || null,
      physician_id || null,
      embryologist_name || null,
      luteal_phase_regimen || null,
      pregnancy_test_date || null,
      notes || null,
    ]
  );
  return result.rows[0];
}

async function getTransfersByCycle(cycleId) {
  const result = await pool.query(
    `SELECT iet.*, d.full_name AS physician_name
     FROM ivf_embryo_transfers iet
     LEFT JOIN doctors d ON d.id = iet.physician_id
     WHERE iet.cycle_id = $1
     ORDER BY iet.transfer_date DESC`,
    [cycleId]
  );
  return result.rows;
}

// 10.5 Embryo Cryostorage Management
async function storeEmbryo(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      embryo_id,
      tank_id,
      canister_id,
      goblet_color,
      cane_number,
      straw_number,
      media_used,
      freeze_date,
      consent_expiry_date,
      notes,
    } = data;

    const cryoRes = await client.query(
      `INSERT INTO ivf_cryostorages (
        embryo_id,
        tank_id,
        canister_id,
        goblet_color,
        cane_number,
        straw_number,
        media_used,
        freeze_date,
        consent_expiry_date,
        disposition,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'stored', $10)
      RETURNING *`,
      [
        embryo_id,
        tank_id,
        canister_id,
        goblet_color || null,
        cane_number || null,
        straw_number,
        media_used || null,
        freeze_date || new Date(),
        consent_expiry_date || null,
        notes || null,
      ]
    );

    // Update embryo status to frozen
    await client.query(`UPDATE ivf_embryos SET status = 'frozen' WHERE id = $1`, [embryo_id]);

    await client.query("COMMIT");
    return cryoRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getCryostorage(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.tank_id) {
    values.push(filters.tank_id);
    conditions.push(`ic.tank_id = $${values.length}`);
  }
  if (filters.disposition) {
    values.push(filters.disposition);
    conditions.push(`ic.disposition = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT
      ic.*,
      ie.embryo_code,
      ie.gardner_grade,
      icy.cycle_number,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid
    FROM ivf_cryostorages ic
    JOIN ivf_embryos ie ON ie.id = ic.embryo_id
    JOIN ivf_cycles icy ON icy.id = ie.cycle_id
    JOIN patients p ON p.id = icy.patient_id
    ${whereClause}
    ORDER BY ic.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateCryostorageDisposition(id, data) {
  const { disposition, thaw_date, notes } = data;
  const result = await pool.query(
    `UPDATE ivf_cryostorages
     SET
       disposition = $2,
       thaw_date = CASE WHEN $2 = 'thawed' THEN COALESCE($3, CURRENT_DATE) ELSE thaw_date END,
       notes = COALESCE($4, notes)
     WHERE id = $1
     RETURNING *`,
    [id, disposition, thaw_date || null, notes || null]
  );
  return result.rows[0] || null;
}

module.exports = {
  createCycle,
  getCycles,
  getCycleById,
  recordOpu,
  getOpuByCycle,
  recordFertilization,
  getFertilizationByCycle,
  createEmbryo,
  getEmbryosByCycle,
  updateEmbryo,
  recordTransfer,
  getTransfersByCycle,
  storeEmbryo,
  getCryostorage,
  updateCryostorageDisposition,
};
