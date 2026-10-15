const pool = require("../../config/db");

async function createOrder(data) {
  const {
    encounter_id,
    order_type,
    order_name,
    instructions,
    priority,
    order_details,
    ordered_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO provider_orders (
      encounter_id,
      order_type,
      order_name,
      instructions,
      priority,
      order_details,
      ordered_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      encounter_id,
      order_type,
      order_name,
      instructions ?? null,
      priority ?? "routine",
      order_details ?? null,
      ordered_by,
    ]
  );

  return result.rows[0];
}

async function getOrdersByEncounterId(encounter_id) {
  const result = await pool.query(
    `SELECT *
     FROM provider_orders
     WHERE encounter_id = $1
     ORDER BY created_at DESC`,
    [encounter_id]
  );

  return result.rows;
}

async function getOrderById(id) {
  const result = await pool.query(
    `SELECT *
     FROM provider_orders
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateOrderStatus(id, status) {
  const result = await pool.query(
    `UPDATE provider_orders
     SET status = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );

  return result.rows[0] || null;
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};