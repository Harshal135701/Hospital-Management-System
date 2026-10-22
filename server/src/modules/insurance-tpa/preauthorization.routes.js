const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const controller = require("./preauthorization.controller");

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.createPreauthorization);
router.get("/", requireRoles("receptionist", "clinician_doctor", "super_admin"), controller.getPreauthorizations);
router.get("/:id", requireRoles("receptionist", "clinician_doctor", "super_admin"), controller.getPreauthorizationById);
router.patch("/:id/submit", requireRoles("receptionist", "super_admin"), controller.submitPreauthorization);
router.patch("/:id/decision", requireRoles("receptionist", "super_admin"), controller.recordDecision);

module.exports = router;