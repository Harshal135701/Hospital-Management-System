const express = require("express");
const controller = require("./reconciliation.controller");

const router = express.Router();

router.post("/", controller.createReconciliation);
router.get("/", controller.getReconciliations);
router.get("/:id", controller.getReconciliationById);
router.post("/:id/payments", controller.postPayment);

module.exports = router;