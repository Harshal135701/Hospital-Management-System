
const express = require("express");
const settlementController = require("./settlement.controller");

const router = express.Router();

router.get("/day-end", settlementController.getDayEndSummary);
router.post("/close", settlementController.closeSettlement);

module.exports = router;
