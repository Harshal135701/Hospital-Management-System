
const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const {
  createDischargeBill,
  getDischargeBill,
} = require("./discharge-billing.controller");

router.use(authenticateToken);

router.post("/final", requireRoles("receptionist", "super_admin"), createDischargeBill);
router.get("/final/:id", requireRoles("receptionist", "clinician_doctor", "super_admin"), getDischargeBill);

module.exports = router;
