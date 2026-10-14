
const express = require("express");
const controller = require("./deposit.controller");

const router = express.Router();

router.post("/", controller.collectDeposit);
router.get("/admission/:admissionId", controller.getDepositsByAdmission);
router.get("/:depositId", controller.getDepositById);

module.exports = router;
