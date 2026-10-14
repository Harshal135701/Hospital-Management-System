
const express = require("express");
const router = express.Router();

const {
  createDischargeBill,
  getDischargeBill,
} = require("./discharge-billing.controller");

router.post("/final", createDischargeBill);
router.get("/final/:id", getDischargeBill);

module.exports = router;
