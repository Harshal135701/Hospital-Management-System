const repository = require("./provider-orders.repository");
const ApiError = require("../../utils/ApiError");

const ORDER_TYPES = ["medication", "laboratory", "imaging", "procedure"];
const PRIORITIES = ["routine", "urgent", "stat"];
const ORDER_STATUSES = [
  "draft",
  "placed",
  "submitted",
  "in_progress",
  "completed",
  "cancelled",
];

function mapCategoryToOrderType(category) {
  if (!category) return 'laboratory';
  const c = category.toLowerCase();
  if (['radiology', 'imaging'].includes(c)) return 'imaging';
  if (['cardiology', 'procedure', 'surgery'].includes(c)) return 'procedure';
  if (['medication', 'pharmacy', 'rx'].includes(c)) return 'medication';
  return 'laboratory';
}

function normalizePriority(pri) {
  if (!pri) return 'routine';
  const p = pri.toLowerCase().trim();
  if (PRIORITIES.includes(p)) return p;
  return 'routine';
}

function normalizeStatus(st) {
  if (!st) return 'submitted';
  const s = st.toLowerCase().trim();
  if (s === 'placed' || s === 'submitted') return 'submitted';
  if (ORDER_STATUSES.includes(s)) return s;
  return 'submitted';
}

async function validateEncounter(encounterId, requireActive = true) {
  if (!encounterId) {
    throw ApiError.badRequest("Encounter ID is required");
  }

  const result = await repository.pool.query(
    `SELECT id, patient_id, doctor_id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounterId]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw ApiError.notFound("Consultation encounter not found");
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw ApiError.badRequest(
      "Orders can only be modified during an active consultation"
    );
  }

  return encounter;
}

function requireRole(currentUser, roles, message) {
  if (!currentUser || !roles.includes(currentUser.role)) {
    throw ApiError.forbidden(message);
  }
}

async function createOrder(data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may issue provider orders"
  );

  const encounterId = data.encounter_id || data.encounterId;
  const encounter = await validateEncounter(encounterId);

  const orderedBy =
    currentUser.role === "clinician_doctor"
      ? (currentUser.doctor_id || encounter.doctor_id)
      : encounter.doctor_id;

  const orderType = data.order_type && ORDER_TYPES.includes(data.order_type)
    ? data.order_type
    : mapCategoryToOrderType(data.order_details?.category || data.category);

  const orderName = (data.order_name || data.testName || '').trim();
  if (!orderName) {
    throw ApiError.badRequest("Order name is required");
  }

  return repository.createOrder({
    encounterId,
    orderType,
    orderName,
    instructions: data.instructions || data.indication || null,
    priority: normalizePriority(data.priority),
    status: normalizeStatus(data.status),
    orderDetails: data.order_details || {
      category: data.category,
      testCode: data.testCode,
      specimen: data.specimen,
      turnaroundTime: data.turnaroundTime,
      indication: data.indication,
    },
    orderedBy,
  });
}

async function createOrdersBatch(data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may issue provider orders"
  );

  const encounterId = data.encounter_id || data.encounterId;
  const encounter = await validateEncounter(encounterId);

  const orderedBy =
    currentUser.role === "clinician_doctor"
      ? (currentUser.doctor_id || encounter.doctor_id)
      : encounter.doctor_id;

  const batchPriority = normalizePriority(data.priority);
  const commonInstructions = [data.indication, data.instructions].filter(Boolean).join('; ');

  const items = data.orders || [];
  if (items.length === 0) {
    throw ApiError.badRequest("At least one test order is required");
  }

  const client = await repository.pool.connect();
  try {
    await client.query('BEGIN');

    const createdList = [];
    for (const item of items) {
      const orderType = mapCategoryToOrderType(item.category || item.order_type);
      const priority = normalizePriority(item.priority || batchPriority);
      const instructions = item.instructions || item.indication || commonInstructions || null;

      const orderDetails = {
        testId: item.testId,
        testCode: item.testCode,
        category: item.category,
        department: item.department,
        specimen: item.specimen,
        turnaroundTime: item.turnaroundTime,
        indication: item.indication || data.indication || null,
        instructions: item.instructions || data.instructions || null,
      };

      const res = await repository.createOrder(
        {
          encounterId,
          orderType,
          orderName: item.testName || item.order_name,
          instructions,
          priority,
          status: 'submitted',
          orderDetails,
          orderedBy,
        },
        client
      );
      createdList.push(res);
    }

    await client.query('COMMIT');
    return createdList;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOrdersByEncounterId(encounterId, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view provider orders"
  );

  const encounter = await validateEncounter(encounterId, false);
  return repository.getOrdersByEncounterId(encounterId);
}

async function getOrderById(id, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view provider orders"
  );

  const order = await repository.getOrderById(id);
  if (!order) {
    throw ApiError.notFound("Provider order not found");
  }

  return order;
}

async function updateOrderStatus(id, data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to update provider orders"
  );

  const existing = await repository.getOrderById(id);
  if (!existing) {
    throw ApiError.notFound("Provider order not found");
  }

  return repository.updateOrderStatus(id, {
    status: normalizeStatus(data.status),
    instructions: data.instructions,
  });
}

async function cancelOrder(id, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may cancel provider orders"
  );

  const existing = await repository.getOrderById(id);
  if (!existing) {
    throw ApiError.notFound("Provider order not found");
  }

  if (existing.status === 'completed') {
    throw ApiError.badRequest("Completed orders cannot be cancelled");
  }

  return repository.updateOrderStatus(id, { status: 'cancelled' });
}

async function getCatalog() {
  return repository.getCatalog();
}

module.exports = {
  createOrder,
  createOrdersBatch,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getCatalog,
};
