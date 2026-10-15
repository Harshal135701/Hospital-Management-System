const express = require("express");
const router = express.Router();

const controller = require("./clinical-notes.controller");

router.post("/", controller.createClinicalNote);
router.get("/encounter/:encounterId", controller.getNotesByEncounterId);
router.get("/:id", controller.getClinicalNoteById);
router.patch("/:id", controller.updateClinicalNote);

module.exports = router;