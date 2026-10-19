const express = require("express");
const router = express.Router();

const controller = require("./provider-orders.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Get diagnostic test catalog
router.get(
  "/catalog",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin", "receptionist"),
  controller.getCatalog
);

// Create single order: doctors and super admins
router.post(
  "/",
  requireRoles("clinician_doctor", "super_admin"),
  controller.createOrder
);

// Create batch orders: doctors and super admins
router.post(
  "/batch",
  requireRoles("clinician_doctor", "super_admin"),
  controller.createOrdersBatch
);

// View orders for an encounter
router.get(
  "/encounter/:encounterId",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getOrdersByEncounterId
);

// Cancel order
router.patch(
  "/:id/cancel",
  requireRoles("clinician_doctor", "super_admin"),
  controller.cancelOrder
);

// View a single order
router.get(
  "/:id",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getOrderById
);

// Update order status
router.patch(
  "/:id/status",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.updateOrderStatus
);

module.exports = router;
