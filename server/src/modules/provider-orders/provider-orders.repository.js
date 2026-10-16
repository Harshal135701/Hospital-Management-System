const pool = require('../../config/db');

async function createOrder(data, client = pool) {
  const {
    encounterId,
    orderType,
    orderName,
    instructions,
    priority,
    status,
    orderDetails,
    orderedBy,
  } = data;

  const result = await client.query(
    `INSERT INTO provider_orders (
      encounter_id,
      order_type,
      order_name,
      instructions,
      priority,
      status,
      order_details,
      ordered_by,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *`,
    [
      encounterId,
      orderType,
      orderName,
      instructions ?? null,
      priority ?? 'routine',
      status ?? 'placed',
      orderDetails ? JSON.stringify(orderDetails) : null,
      orderedBy,
    ]
  );

  return result.rows[0];
}

async function getOrdersByEncounterId(encounterId, client = pool) {
  const result = await client.query(
    `SELECT o.*, d.full_name AS doctor_name, d.employee_code AS doctor_code
     FROM provider_orders o
     JOIN doctors d ON d.id = o.ordered_by
     WHERE o.encounter_id = $1
     ORDER BY o.created_at ASC`,
    [encounterId]
  );
  return result.rows;
}

async function getOrderById(id, client = pool) {
  const result = await client.query(
    `SELECT o.*, d.full_name AS doctor_name, d.employee_code AS doctor_code
     FROM provider_orders o
     JOIN doctors d ON d.id = o.ordered_by
     WHERE o.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateOrderStatus(id, { status, instructions }, client = pool) {
  const fields = ['status = $2', 'updated_at = NOW()'];
  const params = [id, status];

  if (instructions !== undefined) {
    fields.push('instructions = $3');
    params.push(instructions);
  }

  const query = `
    UPDATE provider_orders
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query(query, params);
  return result.rows[0] || null;
}

module.exports = {
  pool,
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};
