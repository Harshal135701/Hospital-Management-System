
const express = require("express");
const controller = require("./refund.controller");

const router = express.Router();

router.post("/", controller.requestRefund);
router.get("/", controller.listRefunds);
router.get("/:refundId", controller.getRefundById);
router.patch("/:refundId/status", controller.updateRefundStatus);

module.exports = router;
