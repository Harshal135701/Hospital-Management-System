const express = require("express");
const router = express.Router();

const controller = require("./claim-dossier.controller");

router.post("/", controller.createClaimDossier);
router.get("/", controller.getClaimDossiers);
router.get("/:id", controller.getClaimDossierById);
router.patch("/:id/compile", controller.compileClaimDossier);
router.patch("/:id/submit", controller.submitClaimDossier);
router.patch("/:id/decision", controller.recordClaimDecision);

module.exports = router;