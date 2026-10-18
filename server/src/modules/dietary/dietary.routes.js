const express = require("express");
const router = express.Router();
const controller = require("./dietary.controller");

// 9.1 Dietitian Nutritional Assessment
router.post("/assessments", controller.createAssessment);
router.get("/assessments", controller.getAssessments);

// 9.2 Patient Diet Ordering
router.post("/orders", controller.createOrder);
router.get("/orders", controller.getOrders);
router.patch("/orders/:id/status", controller.updateOrderStatus);

// 9.3 Kitchen Meal Batch Production
router.post("/batches", controller.createBatch);
router.get("/batches", controller.getBatches);
router.patch("/batches/:id/status", controller.updateBatchStatus);

// 9.4 Ward Meal Delivery Tracking
router.post("/deliveries", controller.createDelivery);
router.get("/deliveries", controller.getDeliveries);
router.patch("/deliveries/:id", controller.updateDelivery);

module.exports = router;
