const service = require("./provider-orders.service");

async function createOrder(req, res, next) {
  try {
    const order = await service.createOrder(req.body);

    res.status(201).json({
      success: true,
      message: "Provider order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrdersByEncounterId(req, res, next) {
  try {
    const orders = await service.getOrdersByEncounterId(
      req.params.encounterId
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await service.getOrderById(req.params.id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order = await service.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Provider order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};