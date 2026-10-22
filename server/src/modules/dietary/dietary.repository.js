const pool = require("../../config/db");

// 9.1 Dietitian Nutritional Assessment
async function createAssessment(data) {
  const {
    patient_id,
    bmi,
    height_cm,
    weight_kg,
    dietary_restrictions,
    food_allergies,
    calorie_target_kcal,
    diet_type = "regular",
    clinical_notes,
    assessed_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO dietary_assessments (
      patient_id,
      bmi,
      height_cm,
      weight_kg,
      dietary_restrictions,
      food_allergies,
      calorie_target_kcal,
      diet_type,
      clinical_notes,
      assessed_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      patient_id,
      bmi || null,
      height_cm || null,
      weight_kg || null,
      dietary_restrictions || null,
      food_allergies || null,
      calorie_target_kcal || null,
      diet_type,
      clinical_notes || null,
      assessed_by || null,
    ]
  );
  return result.rows[0];
}

async function getAssessments(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`da.patient_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT da.*, p.full_name AS patient_name, p.uhid AS patient_uhid
    FROM dietary_assessments da
    JOIN patients p ON p.id = da.patient_id
    ${whereClause}
    ORDER BY da.assessment_date DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

// 9.2 Patient Diet Ordering
async function createOrder(data) {
  const {
    order_number,
    patient_id,
    ward_bed,
    meal_type,
    meal_date,
    diet_category = "regular",
    special_instructions,
    status = "ordered",
  } = data;

  const result = await pool.query(
    `INSERT INTO dietary_meal_orders (
      order_number,
      patient_id,
      ward_bed,
      meal_type,
      meal_date,
      diet_category,
      special_instructions,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      order_number,
      patient_id,
      ward_bed || null,
      meal_type,
      meal_date || new Date(),
      diet_category,
      special_instructions || null,
      status,
    ]
  );
  return result.rows[0];
}

async function getOrders(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`dmo.patient_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`dmo.status = $${values.length}`);
  }
  if (filters.meal_date) {
    values.push(filters.meal_date);
    conditions.push(`dmo.meal_date = $${values.length}`);
  }
  if (filters.meal_type) {
    values.push(filters.meal_type);
    conditions.push(`dmo.meal_type = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT dmo.*, p.full_name AS patient_name, p.uhid AS patient_uhid
    FROM dietary_meal_orders dmo
    JOIN patients p ON p.id = dmo.patient_id
    ${whereClause}
    ORDER BY dmo.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateOrderStatus(id, status) {
  const result = await pool.query(
    `UPDATE dietary_meal_orders SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] || null;
}

// 9.3 Kitchen Meal Batch Production
async function createBatch(data) {
  const {
    batch_number,
    production_date,
    meal_type,
    total_portions = 1,
    diet_categories = [],
    kitchen_shift = "morning",
    status = "planned",
    quality_notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO dietary_batch_productions (
      batch_number,
      production_date,
      meal_type,
      total_portions,
      diet_categories,
      kitchen_shift,
      status,
      quality_notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      batch_number,
      production_date || new Date(),
      meal_type,
      total_portions,
      JSON.stringify(diet_categories),
      kitchen_shift,
      status,
      quality_notes || null,
    ]
  );
  return result.rows[0];
}

async function getBatches(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.production_date) {
    values.push(filters.production_date);
    conditions.push(`production_date = $${values.length}`);
  }
  if (filters.kitchen_shift) {
    values.push(filters.kitchen_shift);
    conditions.push(`kitchen_shift = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM dietary_batch_productions ${whereClause} ORDER BY created_at DESC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateBatchStatus(id, status, quality_notes) {
  const result = await pool.query(
    `UPDATE dietary_batch_productions
     SET status = $2, quality_notes = COALESCE($3, quality_notes)
     WHERE id = $1
     RETURNING *`,
    [id, status, quality_notes || null]
  );
  return result.rows[0] || null;
}

// 9.4 Ward Meal Delivery Tracking
async function createDelivery(data) {
  const {
    order_id,
    batch_id,
    delivered_by,
    received_by,
    meal_temperature_c,
    delivery_status = "dispatched",
    remarks,
  } = data;

  const deliveredAt = delivery_status === "delivered" ? new Date() : null;

  const result = await pool.query(
    `INSERT INTO dietary_meal_deliveries (
      order_id,
      batch_id,
      dispatched_at,
      delivered_at,
      delivered_by,
      received_by,
      meal_temperature_c,
      delivery_status,
      remarks
    )
    VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      order_id,
      batch_id || null,
      deliveredAt,
      delivered_by || null,
      received_by || null,
      meal_temperature_c || null,
      delivery_status,
      remarks || null,
    ]
  );
  return result.rows[0];
}

async function getDeliveries(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.delivery_status) {
    values.push(filters.delivery_status);
    conditions.push(`dmd.delivery_status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT
      dmd.*,
      dmo.order_number,
      dmo.meal_type,
      dmo.ward_bed,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid
    FROM dietary_meal_deliveries dmd
    JOIN dietary_meal_orders dmo ON dmo.id = dmd.order_id
    JOIN patients p ON p.id = dmo.patient_id
    ${whereClause}
    ORDER BY dmd.dispatched_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateDelivery(id, data) {
  const { delivery_status, received_by, remarks, meal_temperature_c } = data;
  const result = await pool.query(
    `UPDATE dietary_meal_deliveries
     SET
       delivery_status = COALESCE($2, delivery_status),
       received_by = COALESCE($3, received_by),
       remarks = COALESCE($4, remarks),
       meal_temperature_c = COALESCE($5, meal_temperature_c),
       delivered_at = CASE WHEN $2 = 'delivered' THEN NOW() ELSE delivered_at END
     WHERE id = $1
     RETURNING *`,
    [id, delivery_status, received_by, remarks, meal_temperature_c]
  );
  return result.rows[0] || null;
}

module.exports = {
  createAssessment,
  getAssessments,
  createOrder,
  getOrders,
  updateOrderStatus,
  createBatch,
  getBatches,
  updateBatchStatus,
  createDelivery,
  getDeliveries,
  updateDelivery,
};
