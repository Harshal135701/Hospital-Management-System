const repository = require('./provider-orders.repository');
const ApiError = require('../../utils/ApiError');

async function validateEncounter(encounterId) {
  const result = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status FROM consultation_encounters WHERE id = $1`,
    [encounterId]
  );
  const encounter = result.rows[0];

  if (!encounter) {
    throw ApiError.notFound('Consultation encounter not found');
  }

  return encounter;
}

async function createOrder(data, currentUser = {}) {
  const encounterId = data.encounter_id || data.encounterId;

  // 1. Role verification: Only licensed doctors or super_admin may issue orders
  if (!['clinician_doctor', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Only licensed clinician doctors and administrators may issue provider orders');
  }

  const encounter = await validateEncounter(encounterId);

  // 2. Active status check
  if (encounter.status !== 'in_progress') {
    throw ApiError.badRequest(`Cannot place provider orders for encounter in '${encounter.status}' status. Consultation must be active.`);
  }

  // 3. Attending doctor ownership verification
  let orderedBy;
  if (currentUser.role === 'clinician_doctor') {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden('Authenticated user does not have an associated doctor record');
    }
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to place orders for another doctor\'s encounter');
    }
    orderedBy = currentUser.doctor_id;
  } else {
    // super_admin: ordered_by is encounter's doctor
    orderedBy = encounter.doctor_id;
  }

  return repository.createOrder({
    encounterId,
    orderType: data.order_type,
    orderName: data.order_name,
    instructions: data.instructions,
    priority: data.priority || 'routine',
    status: data.status || 'placed',
    orderDetails: data.order_details,
    orderedBy,
  });
}

async function getOrdersByEncounterId(encounterId, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view provider orders');
  }

  const encounter = await validateEncounter(encounterId);

  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to view orders for another doctor\'s encounter');
    }
  }

  return repository.getOrdersByEncounterId(encounterId);
}

async function getOrderById(id, currentUser = {}) {
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to view provider orders');
  }

  const order = await repository.getOrderById(id);
  if (!order) {
    throw ApiError.notFound('Provider order not found');
  }

  const encounter = await validateEncounter(order.encounter_id);
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to view this order');
    }
  }

  return order;
}

async function updateOrderStatus(id, data, currentUser = {}) {
  // Doctors, Nurses, and Super Admin can update order status
  if (!['clinician_doctor', 'staff_nurse', 'super_admin'].includes(currentUser.role)) {
    throw ApiError.forbidden('Insufficient permissions to update order status');
  }

  const order = await repository.getOrderById(id);
  if (!order) {
    throw ApiError.notFound('Provider order not found');
  }

  const encounter = await validateEncounter(order.encounter_id);
  if (currentUser.role === 'clinician_doctor') {
    if (String(encounter.doctor_id) !== String(currentUser.doctor_id)) {
      throw ApiError.forbidden('You are not authorized to modify another doctor\'s order');
    }
  }

  return repository.updateOrderStatus(id, {
    status: data.status,
    instructions: data.instructions,
  });
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};
