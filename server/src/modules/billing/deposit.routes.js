
const express = require("express");
const controller = require("./deposit.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.collectDeposit);
router.get("/admission/:admissionId", requireRoles("receptionist", "staff_nurse", "super_admin"), controller.getDepositsByAdmission);
router.get("/:depositId", requireRoles("receptionist", "staff_nurse", "super_admin"), controller.getDepositById);

module.exports = router;
