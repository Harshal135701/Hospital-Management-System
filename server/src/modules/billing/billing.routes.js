const express = require("express");
const router = express.Router();

const {
  createOpdBill,
  getOpdBill,
  getOpdBills,
} = require("./billing.controller");

// Create an OPD bill
router.post("/opd", createOpdBill);

// List OPD bills with optional filters
router.get("/opd", getOpdBills);

// Get a single OPD bill
router.get("/opd/:id", getOpdBill);

module.exports = router;