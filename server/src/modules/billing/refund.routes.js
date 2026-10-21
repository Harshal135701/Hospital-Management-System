
const express = require("express");
const controller = require("./refund.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.requestRefund);
router.get("/", requireRoles("receptionist", "super_admin"), controller.listRefunds);
router.get("/:refundId", requireRoles("receptionist", "super_admin"), controller.getRefundById);
router.patch("/:refundId/status", requireRoles("super_admin"), controller.updateRefundStatus);

module.exports = router;
