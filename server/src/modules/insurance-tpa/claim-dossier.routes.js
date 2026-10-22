const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

const controller = require("./claim-dossier.controller");

router.use(authenticateToken);

router.post("/", requireRoles("receptionist", "super_admin"), controller.createClaimDossier);
router.get("/", requireRoles("receptionist", "super_admin"), controller.getClaimDossiers);
router.get("/:id", requireRoles("receptionist", "super_admin"), controller.getClaimDossierById);
router.patch("/:id/compile", requireRoles("receptionist", "super_admin"), controller.compileClaimDossier);
router.patch("/:id/submit", requireRoles("receptionist", "super_admin"), controller.submitClaimDossier);
router.patch("/:id/decision", requireRoles("receptionist", "super_admin"), controller.recordClaimDecision);

module.exports = router;