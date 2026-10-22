const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const {
  createOpdBill,
  getOpdBill,
  getOpdBills,
} = require("./billing.controller");

router.use(authenticateToken);

// Create an OPD bill
router.post(
  "/opd",
  requireRoles("receptionist", "super_admin"),
  createOpdBill
);

// List OPD bills with optional filters
router.get(
  "/opd",
  requireRoles("receptionist", "clinician_doctor", "super_admin"),
  getOpdBills
);

// Get a single OPD bill
router.get(
  "/opd/:id",
  requireRoles("receptionist", "clinician_doctor", "super_admin"),
  getOpdBill
);

module.exports = router;