const service = require("./dietary.service");

async function createAssessment(req, res, next) {
  try {
    const data = await service.createAssessment(req.body);
    res.status(201).json({ success: true, message: "Dietitian assessment recorded", data });
  } catch (err) {
    next(err);
  }
}

async function getAssessments(req, res, next) {
  try {
    const data = await service.getAssessments(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const data = await service.createOrder(req.body);
    res.status(201).json({ success: true, message: "Patient diet order placed", data });
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const data = await service.getOrders(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const data = await service.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Order status updated", data });
  } catch (err) {
    next(err);
  }
}

async function createBatch(req, res, next) {
  try {
    const data = await service.createBatch(req.body);
    res.status(201).json({ success: true, message: "Kitchen batch production created", data });
  } catch (err) {
    next(err);
  }
}

async function getBatches(req, res, next) {
  try {
    const data = await service.getBatches(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateBatchStatus(req, res, next) {
  try {
    const data = await service.updateBatchStatus(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Batch status updated", data });
  } catch (err) {
    next(err);
  }
}

async function createDelivery(req, res, next) {
  try {
    const data = await service.createDelivery(req.body);
    res.status(201).json({ success: true, message: "Meal delivery dispatched", data });
  } catch (err) {
    next(err);
  }
}

async function getDeliveries(req, res, next) {
  try {
    const data = await service.getDeliveries(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateDelivery(req, res, next) {
  try {
    const data = await service.updateDelivery(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Delivery tracking updated", data });
  } catch (err) {
    next(err);
  }
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
