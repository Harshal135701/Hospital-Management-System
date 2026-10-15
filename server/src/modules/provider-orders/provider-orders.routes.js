const express = require("express");
const router = express.Router();

const controller = require("./provider-orders.controller");

router.post("/", controller.createOrder);
router.get("/encounter/:encounterId", controller.getOrdersByEncounterId);
router.get("/:id", controller.getOrderById);
router.patch("/:id/status", controller.updateOrderStatus);

module.exports = router;