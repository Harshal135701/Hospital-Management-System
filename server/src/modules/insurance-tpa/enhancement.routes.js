const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const controller = require("./enhancement.controller");

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.createEnhancementRequest);
router.get("/", requireRoles("receptionist", "clinician_doctor", "super_admin"), controller.getEnhancementRequests);
router.get("/:id", requireRoles("receptionist", "clinician_doctor", "super_admin"), controller.getEnhancementRequestById);
router.patch("/:id/submit", requireRoles("receptionist", "super_admin"), controller.submitEnhancementRequest);
router.patch("/:id/decision", requireRoles("receptionist", "super_admin"), controller.recordEnhancementDecision);

module.exports = router;