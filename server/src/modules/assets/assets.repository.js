const pool = require("../../config/db");

// 14.1 Asset Master & Barcode Tagging
async function createAsset(data) {
  const {
    asset_tag,
    serial_number,
    asset_name,
    category,
    department_id,
    location_room,
    manufacturer,
    model_number,
    purchase_date,
    purchase_cost,
    warranty_expiry_date,
    status = "in_service",
    barcode_data,
  } = data;

  const result = await pool.query(
    `INSERT INTO asset_masters (
      asset_tag,
      serial_number,
      asset_name,
      category,
      department_id,
      location_room,
      manufacturer,
      model_number,
      purchase_date,
      purchase_cost,
      warranty_expiry_date,
      status,
      barcode_data
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      asset_tag,
      serial_number,
      asset_name,
      category,
      department_id || null,
      location_room || null,
      manufacturer || null,
      model_number || null,
      purchase_date || new Date(),
      purchase_cost,
      warranty_expiry_date || null,
      status,
      barcode_data || asset_tag,
    ]
  );
  return result.rows[0];
}

async function getAssets(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.category) {
    values.push(filters.category);
    conditions.push(`am.category = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`am.status = $${values.length}`);
  }
  if (filters.department_id) {
    values.push(filters.department_id);
    conditions.push(`am.department_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT am.*, dep.name AS department_name
    FROM asset_masters am
    LEFT JOIN departments dep ON dep.id = am.department_id
    ${whereClause}
    ORDER BY am.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getAssetById(id) {
  const query = `
    SELECT am.*, dep.name AS department_name
    FROM asset_masters am
    LEFT JOIN departments dep ON dep.id = am.department_id
    WHERE am.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateAssetStatus(id, status) {
  const result = await pool.query(
    `UPDATE asset_masters SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] || null;
}

// 14.2 AMC / CMC Service Contracts & Warranties
async function createContract(data) {
  const {
    asset_id,
    contract_type,
    vendor_name,
    vendor_contact,
    start_date,
    end_date,
    contract_value,
    coverage_details,
    renewal_alert_days = 30,
  } = data;

  const result = await pool.query(
    `INSERT INTO asset_service_contracts (
      asset_id,
      contract_type,
      vendor_name,
      vendor_contact,
      start_date,
      end_date,
      contract_value,
      coverage_details,
      renewal_alert_days
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      asset_id,
      contract_type,
      vendor_name,
      vendor_contact || null,
      start_date,
      end_date,
      contract_value,
      coverage_details || null,
      renewal_alert_days,
    ]
  );
  return result.rows[0];
}

async function getContractsByAsset(assetId) {
  const result = await pool.query(
    `SELECT * FROM asset_service_contracts WHERE asset_id = $1 ORDER BY end_date DESC`,
    [assetId]
  );
  return result.rows;
}

// 14.3 Preventive Maintenance Scheduling
async function createPmSchedule(data) {
  const {
    asset_id,
    task_title,
    frequency = "quarterly",
    next_due_date,
    checklist_criteria = [],
    assigned_engineer,
  } = data;

  const result = await pool.query(
    `INSERT INTO asset_preventive_maintenances (
      asset_id,
      task_title,
      frequency,
      next_due_date,
      checklist_criteria,
      assigned_engineer
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      asset_id,
      task_title,
      frequency,
      next_due_date,
      JSON.stringify(checklist_criteria),
      assigned_engineer || null,
    ]
  );
  return result.rows[0];
}

async function getPmSchedules(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`apm.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT apm.*, am.asset_tag, am.asset_name, am.location_room
    FROM asset_preventive_maintenances apm
    JOIN asset_masters am ON am.id = apm.asset_id
    ${whereClause}
    ORDER BY apm.next_due_date ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updatePmSchedule(id, data) {
  const { status, completion_notes, next_due_date } = data;
  const result = await pool.query(
    `UPDATE asset_preventive_maintenances
     SET 
       status = COALESCE($2, status),
       completion_notes = COALESCE($3, completion_notes),
       last_completed_date = CASE WHEN $2 = 'completed' THEN CURRENT_DATE ELSE last_completed_date END,
       next_due_date = COALESCE($4, next_due_date)
     WHERE id = $1
     RETURNING *`,
    [id, status, completion_notes || null, next_due_date || null]
  );
  return result.rows[0] || null;
}

// 14.4 Breakdown Reporting & Work Ticket
async function createBreakdownTicket(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      ticket_number,
      asset_id,
      reported_by,
      priority = "medium",
      issue_description,
    } = data;

    const ticketRes = await client.query(
      `INSERT INTO asset_breakdown_tickets (
        ticket_number,
        asset_id,
        reported_by,
        priority,
        issue_description,
        downtime_start,
        status
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), 'open')
      RETURNING *`,
      [ticket_number, asset_id, reported_by, priority, issue_description]
    );

    // Update asset master status to breakdown
    await client.query(`UPDATE asset_masters SET status = 'breakdown' WHERE id = $1`, [asset_id]);

    await client.query("COMMIT");
    return ticketRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getBreakdownTickets(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`abt.status = $${values.length}`);
  }
  if (filters.priority) {
    values.push(filters.priority);
    conditions.push(`abt.priority = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT abt.*, am.asset_tag, am.asset_name, am.location_room
    FROM asset_breakdown_tickets abt
    JOIN asset_masters am ON am.id = abt.asset_id
    ${whereClause}
    ORDER BY abt.reported_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateBreakdownTicket(id, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { status, root_cause, action_taken, repair_cost } = data;

    const ticketRes = await client.query(
      `UPDATE asset_breakdown_tickets
       SET 
         status = COALESCE($2, status),
         root_cause = COALESCE($3, root_cause),
         action_taken = COALESCE($4, action_taken),
         repair_cost = COALESCE($5, repair_cost),
         downtime_end = CASE WHEN $2 IN ('resolved', 'closed') THEN NOW() ELSE downtime_end END,
         closed_at = CASE WHEN $2 = 'closed' THEN NOW() ELSE closed_at END
       WHERE id = $1
       RETURNING *`,
      [id, status, root_cause || null, action_taken || null, repair_cost || null]
    );

    const ticket = ticketRes.rows[0];
    if (ticket && (status === "resolved" || status === "closed")) {
      await client.query(
        `UPDATE asset_masters SET status = 'in_service' WHERE id = $1`,
        [ticket.asset_id]
      );
    }

    await client.query("COMMIT");
    return ticket;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// 14.5 Asset Depreciation Calculation
async function createDepreciationRecord(data) {
  const {
    asset_id,
    method = "SLM",
    useful_life_years = 7,
    salvage_value = 0,
    annual_depreciation_rate,
    current_book_value,
    accumulated_depreciation,
  } = data;

  const result = await pool.query(
    `INSERT INTO asset_depreciations (
      asset_id,
      method,
      useful_life_years,
      salvage_value,
      annual_depreciation_rate,
      current_book_value,
      accumulated_depreciation
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      asset_id,
      method,
      useful_life_years,
      salvage_value,
      annual_depreciation_rate || null,
      current_book_value,
      accumulated_depreciation,
    ]
  );
  return result.rows[0];
}

async function getDepreciationByAsset(assetId) {
  const result = await pool.query(
    `SELECT * FROM asset_depreciations WHERE asset_id = $1 ORDER BY calculation_date DESC`,
    [assetId]
  );
  return result.rows;
}

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAssetStatus,
  createContract,
  getContractsByAsset,
  createPmSchedule,
  getPmSchedules,
  updatePmSchedule,
  createBreakdownTicket,
  getBreakdownTickets,
  updateBreakdownTicket,
  createDepreciationRecord,
  getDepreciationByAsset,
};
