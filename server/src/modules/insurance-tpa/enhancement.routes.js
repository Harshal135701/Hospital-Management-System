const express = require("express");
const router = express.Router();

const controller = require("./enhancement.controller");

router.post("/", controller.createEnhancementRequest);
router.get("/", controller.getEnhancementRequests);
router.get("/:id", controller.getEnhancementRequestById);
router.patch("/:id/submit", controller.submitEnhancementRequest);
router.patch("/:id/decision", controller.recordEnhancementDecision);

module.exports = router;