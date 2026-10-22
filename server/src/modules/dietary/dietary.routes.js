const express = require("express");
const router = express.Router();
const controller = require("./dietary.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 9.1 Dietitian Nutritional Assessment
router.post("/assessments", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.createAssessment);
router.get("/assessments", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getAssessments);

// 9.2 Patient Diet Ordering
router.post("/orders", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.createOrder);
router.get("/orders", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getOrders);
router.patch("/orders/:id/status", requireRoles("staff_nurse", "super_admin"), controller.updateOrderStatus);

// 9.3 Kitchen Meal Batch Production
router.post("/batches", requireRoles("super_admin"), controller.createBatch);
router.get("/batches", requireRoles("staff_nurse", "super_admin"), controller.getBatches);
router.patch("/batches/:id/status", requireRoles("super_admin"), controller.updateBatchStatus);

// 9.4 Ward Meal Delivery Tracking
router.post("/deliveries", requireRoles("staff_nurse", "super_admin"), controller.createDelivery);
router.get("/deliveries", requireRoles("staff_nurse", "super_admin"), controller.getDeliveries);
router.patch("/deliveries/:id", requireRoles("staff_nurse", "super_admin"), controller.updateDelivery);

module.exports = router;
