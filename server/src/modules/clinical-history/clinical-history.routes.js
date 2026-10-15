const express = require("express");
const router = express.Router();

const controller = require("./clinical-history.controller");

router.post("/", controller.createClinicalHistory);
router.get("/:encounterId", controller.getClinicalHistoryByEncounterId);
router.patch("/:encounterId", controller.updateClinicalHistory);

module.exports = router;