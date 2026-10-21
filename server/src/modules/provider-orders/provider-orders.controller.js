const service = require("./provider-orders.service");
const {
  createOrderSchema,
  createOrderBatchSchema,
  updateOrderStatusSchema,
} = require("./provider-orders.validation");

async function createOrder(req, res, next) {
  try {
    const validated = createOrderSchema.parse(req.body);
    const order = await service.createOrder(validated, req.user);

    res.status(201).json({
      success: true,
      message: "Provider order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function createOrdersBatch(req, res, next) {
  try {
    const validated = createOrderBatchSchema.parse(req.body);
    const orders = await service.createOrdersBatch(validated, req.user);

    res.status(201).json({
      success: true,
      message: `${orders.length} provider orders placed successfully`,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrdersByEncounterId(req, res, next) {
  try {
    const orders = await service.getOrdersByEncounterId(
      req.params.encounterId,
      req.user
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
    const order = await service.getOrderById(
      req.params.id,
      req.user
    );

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
    const validated = updateOrderStatusSchema.parse(req.body);
    const order = await service.updateOrderStatus(
      req.params.id,
      validated,
      req.user
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

async function cancelOrder(req, res, next) {
  try {
    const order = await service.cancelOrder(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: "Provider order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getCatalog(req, res, next) {
  try {
    const catalog = await service.getCatalog();
    res.status(200).json({
      success: true,
      count: catalog.length,
      data: catalog,
    });
  } catch (error) {
    next(error);
  }
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
