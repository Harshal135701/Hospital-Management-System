const pool = require("../../config/db");
const repository = require("./provider-orders.repository");

const ORDER_TYPES = ["medication", "laboratory", "imaging", "procedure"];
const PRIORITIES = ["routine", "urgent", "stat"];
const ORDER_STATUSES = [
  "draft",
  "placed",
  "in_progress",
  "completed",
  "cancelled",
];

async function validateEncounter(encounter_id, requireActive = true) {
  if (!encounter_id) {
    throw Object.assign(new Error("Encounter ID is required"), {
      statusCode: 400,
    });
  }

  const result = await pool.query(
    `SELECT id, status
     FROM consultation_encounters
     WHERE id = $1`,
    [encounter_id]
  );

  const encounter = result.rows[0];

  if (!encounter) {
    throw Object.assign(new Error("Consultation encounter not found"), {
      statusCode: 404,
    });
  }

  if (requireActive && encounter.status !== "in_progress") {
    throw Object.assign(
      new Error("Orders can only be modified during an active consultation"),
      { statusCode: 400 }
    );
  }

  return encounter;
}

async function createOrder(data) {
  const {
    encounter_id,
    order_type,
    order_name,
    priority,
    ordered_by,
    order_details,
  } = data;

  await validateEncounter(encounter_id);

  if (!ORDER_TYPES.includes(order_type)) {
    throw Object.assign(
      new Error(`Order type must be one of: ${ORDER_TYPES.join(", ")}`),
      { statusCode: 400 }
    );
  }

  if (typeof order_name !== "string" || !order_name.trim()) {
    throw Object.assign(new Error("Order name is required"), {
      statusCode: 400,
    });
  }

  if (order_name.trim().length > 200) {
    throw Object.assign(new Error("Order name cannot exceed 200 characters"), {
      statusCode: 400,
    });
  }

  if (!ordered_by) {
    throw Object.assign(new Error("Ordering doctor ID is required"), {
      statusCode: 400,
    });
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    throw Object.assign(
      new Error(`Priority must be one of: ${PRIORITIES.join(", ")}`),
      { statusCode: 400 }
    );
  }

  if (
    order_details !== undefined &&
    order_details !== null &&
    (typeof order_details !== "object" || Array.isArray(order_details))
  ) {
    throw Object.assign(new Error("Order details must be a JSON object"), {
      statusCode: 400,
    });
  }

  const doctorResult = await pool.query(
    `SELECT id FROM doctors WHERE id = $1`,
    [ordered_by]
  );

  if (!doctorResult.rows[0]) {
    throw Object.assign(new Error("Ordering doctor not found"), {
      statusCode: 404,
    });
  }

  return repository.createOrder({
    ...data,
    order_name: order_name.trim(),
  });
}

async function getOrdersByEncounterId(encounter_id) {
  await validateEncounter(encounter_id, false);
  return repository.getOrdersByEncounterId(encounter_id);
}

async function getOrderById(id) {
  if (!id) {
    throw Object.assign(new Error("Order ID is required"), {
      statusCode: 400,
    });
  }

  const order = await repository.getOrderById(id);

  if (!order) {
    throw Object.assign(new Error("Provider order not found"), {
      statusCode: 404,
    });
  }

  return order;
}

async function updateOrderStatus(id, status) {
  const order = await getOrderById(id);

  await validateEncounter(order.encounter_id);

  if (!ORDER_STATUSES.includes(status)) {
    throw Object.assign(
      new Error(`Status must be one of: ${ORDER_STATUSES.join(", ")}`),
      { statusCode: 400 }
    );
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw Object.assign(
      new Error("Completed or cancelled orders cannot be modified"),
      { statusCode: 400 }
    );
  }

  if (order.status === status) {
    throw Object.assign(new Error(`Order is already ${status}`), {
      statusCode: 400,
    });
  }

  const allowedTransitions = {
    draft: ["placed", "cancelled"],
    placed: ["in_progress", "completed", "cancelled"],
    in_progress: ["completed", "cancelled"],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw Object.assign(
      new Error(`Cannot change order status from ${order.status} to ${status}`),
      { statusCode: 400 }
    );
  }

  return repository.updateOrderStatus(id, status);
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};