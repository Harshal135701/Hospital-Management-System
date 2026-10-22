
const express = require("express");
const settlementController = require("./settlement.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/day-end", requireRoles("receptionist", "super_admin"), settlementController.getDayEndSummary);
router.post("/close", requireRoles("receptionist", "super_admin"), settlementController.closeSettlement);

module.exports = router;
