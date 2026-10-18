
const express = require("express");
const router = express.Router();

const controller = require("./clinical-notes.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Create notes: doctors and super admins
router.post(
  "/",
  requireRoles("clinician_doctor", "super_admin"),
  controller.createClinicalNote
);

// View notes for an encounter
router.get(
  "/encounter/:encounterId",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getNotesByEncounterId
);

// View a single note
router.get(
  "/:id",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getClinicalNoteById
);

// Update notes: doctors and super admins
router.patch(
  "/:id",
  requireRoles("clinician_doctor", "super_admin"),
  controller.updateClinicalNote
);

module.exports = router;
