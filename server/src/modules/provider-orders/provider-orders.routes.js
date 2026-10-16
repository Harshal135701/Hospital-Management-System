const express = require('express');
const router = express.Router();
const controller = require('./provider-orders.controller');
const { authenticateToken, requireRoles } = require('../../middleware/auth.middleware');

router.use(authenticateToken);

// Create CPOE order: Clinician doctors and admin only (Nurses denied)
router.post(
  '/',
  requireRoles('clinician_doctor', 'super_admin'),
  controller.createOrder
);

// View orders for encounter: Doctors, Nurses, and Admin
router.get(
  '/encounter/:encounterId',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getOrdersByEncounterId
);

// View single order
router.get(
  '/:id',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.getOrderById
);

// Update order status: Doctors, Nurses, and Admin
router.patch(
  '/:id/status',
  requireRoles('clinician_doctor', 'staff_nurse', 'super_admin'),
  controller.updateOrderStatus
);

module.exports = router;
