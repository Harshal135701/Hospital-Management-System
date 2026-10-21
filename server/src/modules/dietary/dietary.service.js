const repository = require("./dietary.repository");
const ApiError = require("../../utils/ApiError");

async function createAssessment(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  return repository.createAssessment(data);
}

async function getAssessments(filters) {
  return repository.getAssessments(filters);
}

async function createOrder(data) {
  if (!data.patient_id) throw ApiError.badRequest("patient_id is required");
  if (!data.meal_type) throw ApiError.badRequest("meal_type is required");

  if (!data.order_number) {
    data.order_number = `DIET-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createOrder(data);
}

async function getOrders(filters) {
  return repository.getOrders(filters);
}

async function updateOrderStatus(id, status) {
  const valid = ["ordered", "preparing", "prepared", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid order status. Allowed: ${valid.join(", ")}`);
  }
  const order = await repository.updateOrderStatus(id, status);
  if (!order) throw ApiError.notFound("Diet order not found");
  return order;
}

async function createBatch(data) {
  if (!data.meal_type) throw ApiError.badRequest("meal_type is required");
  if (!data.batch_number) {
    data.batch_number = `KB-${Date.now().toString(36).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
  }
  return repository.createBatch(data);
}

async function getBatches(filters) {
  return repository.getBatches(filters);
}

async function updateBatchStatus(id, data) {
  const { status, quality_notes } = data;
  const valid = ["planned", "in_prep", "ready", "quality_inspected", "cancelled"];
  if (status && !valid.includes(status)) {
    throw ApiError.badRequest(`Invalid batch status. Allowed: ${valid.join(", ")}`);
  }
  const batch = await repository.updateBatchStatus(id, status, quality_notes);
  if (!batch) throw ApiError.notFound("Kitchen batch not found");
  return batch;
}

async function createDelivery(data) {
  if (!data.order_id) throw ApiError.badRequest("order_id is required");
  return repository.createDelivery(data);
}

async function getDeliveries(filters) {
  return repository.getDeliveries(filters);
}

async function updateDelivery(id, data) {
  const delivery = await repository.updateDelivery(id, data);
  if (!delivery) throw ApiError.notFound("Delivery record not found");
  return delivery;
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
