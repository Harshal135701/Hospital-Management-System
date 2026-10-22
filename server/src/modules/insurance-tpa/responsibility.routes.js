const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const controller = require("./responsibility.controller");

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.createResponsibility);
router.get("/", requireRoles("receptionist", "super_admin"), controller.getResponsibilities);
router.get("/:id", requireRoles("receptionist", "super_admin"), controller.getResponsibilityById);
router.patch("/:id/collect", requireRoles("receptionist", "super_admin"), controller.collectPayment);

module.exports = router;