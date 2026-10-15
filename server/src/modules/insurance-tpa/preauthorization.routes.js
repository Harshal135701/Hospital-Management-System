const express = require("express");
const router = express.Router();

const controller = require("./preauthorization.controller");

router.post("/", controller.createPreauthorization);
router.get("/", controller.getPreauthorizations);
router.get("/:id", controller.getPreauthorizationById);
router.patch("/:id/submit", controller.submitPreauthorization);
router.patch("/:id/decision", controller.recordDecision);

module.exports = router;