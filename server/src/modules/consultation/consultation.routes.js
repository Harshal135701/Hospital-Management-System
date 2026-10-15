
const express = require("express");
const router = express.Router();
const controller = require("./consultation.controller");

router.post("/", controller.createEncounter);
router.get("/", controller.getEncounters);
router.get("/:id", controller.getEncounterById);
router.patch("/:id/complete", controller.completeEncounter);

module.exports = router;
