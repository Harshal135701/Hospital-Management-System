
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const {
  createInterimBill,
  getInterimBill,
} = require("./ipd-billing.controller");

router.use(authenticateToken);

router.post("/interim", requireRoles("receptionist", "super_admin"), createInterimBill);
router.get("/interim/:id", requireRoles("receptionist", "clinician_doctor", "staff_nurse", "super_admin"), getInterimBill);

module.exports = router;
