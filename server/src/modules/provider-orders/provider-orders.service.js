
const repository = require("./provider-orders.repository");
const ApiError = require("../../utils/ApiError");

const ORDER_TYPES = ["medication", "laboratory", "imaging", "procedure"];
const PRIORITIES = ["routine", "urgent", "stat"];
const ORDER_STATUSES = [
  "draft",
  "placed",
  "in_progress",
  "completed",
  "cancelled",
];

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

function verifyDoctorOwnership(encounter, currentUser) {
  if (
    currentUser.role === "clinician_doctor" &&
    (
      !currentUser.doctor_id ||
      String(encounter.doctor_id) !== String(currentUser.doctor_id)
    )
  ) {
    throw ApiError.forbidden(
      "You are not authorized to access another doctor's encounter"
    );
  }
}

function validateOrderData(data) {
  if (!ORDER_TYPES.includes(data.order_type)) {
    throw ApiError.badRequest(
      `Order type must be one of: ${ORDER_TYPES.join(", ")}`
    );
  }

  if (
    typeof data.order_name !== "string" ||
    !data.order_name.trim()
  ) {
    throw ApiError.badRequest("Order name is required");
  }

  if (data.order_name.trim().length > 200) {
    throw ApiError.badRequest("Order name cannot exceed 200 characters");
  }

  if (
    data.priority !== undefined &&
    !PRIORITIES.includes(data.priority)
  ) {
    throw ApiError.badRequest(
      `Priority must be one of: ${PRIORITIES.join(", ")}`
    );
  }

  if (
    data.order_details !== undefined &&
    data.order_details !== null &&
    (
      typeof data.order_details !== "object" ||
      Array.isArray(data.order_details)
    )
  ) {
    throw ApiError.badRequest("Order details must be a JSON object");
  }
}

async function createOrder(data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "super_admin"],
    "Only clinician doctors and administrators may issue provider orders"
  );

  validateOrderData(data);

  const encounterId = data.encounter_id || data.encounterId;
  const encounter = await validateEncounter(encounterId);

  verifyDoctorOwnership(encounter, currentUser);

  const orderedBy =
    currentUser.role === "clinician_doctor"
      ? currentUser.doctor_id
      : encounter.doctor_id;

  return repository.createOrder({
    encounterId,
    orderType: data.order_type,
    orderName: data.order_name.trim(),
    instructions: data.instructions,
    priority: data.priority || "routine",
    status: data.status || "placed",
    orderDetails: data.order_details,
    orderedBy,
  });
}

async function getOrdersByEncounterId(encounterId, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view provider orders"
  );

  const encounter = await validateEncounter(encounterId, false);
  verifyDoctorOwnership(encounter, currentUser);

  return repository.getOrdersByEncounterId(encounterId);
}

async function getOrderById(id, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to view provider orders"
  );

  if (!id) {
    throw ApiError.badRequest("Order ID is required");
  }

  const order = await repository.getOrderById(id);

  if (!order) {
    throw ApiError.notFound("Provider order not found");
  }

  const encounter = await validateEncounter(order.encounter_id, false);
  verifyDoctorOwnership(encounter, currentUser);

  return order;
}

async function updateOrderStatus(id, data, currentUser = {}) {
  requireRole(
    currentUser,
    ["clinician_doctor", "staff_nurse", "super_admin"],
    "Insufficient permissions to update provider order status"
  );

  const order = await repository.getOrderById(id);

  if (!order) {
    throw ApiError.notFound("Provider order not found");
  }

  const encounter = await validateEncounter(order.encounter_id);
  verifyDoctorOwnership(encounter, currentUser);

  const status = data.status;

  if (!ORDER_STATUSES.includes(status)) {
    throw ApiError.badRequest(
      `Status must be one of: ${ORDER_STATUSES.join(", ")}`
    );
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw ApiError.badRequest(
      "Completed or cancelled orders cannot be modified"
    );
  }

  if (order.status === status) {
    throw ApiError.badRequest(`Order is already ${status}`);
  }

  const allowedTransitions = {
    draft: ["placed", "cancelled"],
    placed: ["in_progress", "completed", "cancelled"],
    in_progress: ["completed", "cancelled"],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Cannot change order status from ${order.status} to ${status}`
    );
  }

  return repository.updateOrderStatus(id, {
    status,
    instructions: data.instructions,
  });
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};
