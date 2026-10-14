
const express = require("express");
const router = express.Router();

const {
  createInterimBill,
  getInterimBill,
} = require("./ipd-billing.controller");

router.post("/interim", createInterimBill);
router.get("/interim/:id", getInterimBill);

module.exports = router;
