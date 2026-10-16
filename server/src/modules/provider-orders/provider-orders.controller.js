const service = require('./provider-orders.service');
const { createOrderSchema, updateOrderStatusSchema } = require('./provider-orders.validation');

async function createOrder(req, res, next) {
  try {
    const validated = createOrderSchema.parse(req.body);
    const order = await service.createOrder(validated, req.user);

    res.status(201).json({
      success: true,
      message: 'Provider order placed successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrdersByEncounterId(req, res, next) {
  try {
    const orders = await service.getOrdersByEncounterId(req.params.encounterId, req.user);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await service.getOrderById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const validated = updateOrderStatusSchema.parse(req.body);
    const order = await service.updateOrderStatus(req.params.id, validated, req.user);
    res.status(200).json({
      success: true,
      message: 'Provider order status updated successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrdersByEncounterId,
  getOrderById,
  updateOrderStatus,
};
