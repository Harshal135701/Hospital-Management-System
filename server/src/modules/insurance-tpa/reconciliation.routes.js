const express = require("express");
const controller = require("./reconciliation.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.createReconciliation);
router.get("/", requireRoles("receptionist", "super_admin"), controller.getReconciliations);
router.get("/:id", requireRoles("receptionist", "super_admin"), controller.getReconciliationById);
router.post("/:id/payments", requireRoles("receptionist", "super_admin"), controller.postPayment);

module.exports = router;