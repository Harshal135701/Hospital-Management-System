
const express = require("express");
const router = express.Router();
const controller = require("./vitals.controller");

router.post("/", controller.createVitals);
router.get("/:encounterId", controller.getVitalsByEncounterId);

module.exports = router;
