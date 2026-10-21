const express = require("express");
const router = express.Router();

const controller = require("./clinical-notes.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Create notes (draft or finalized): doctors and super admins
router.post(
  "/",
  requireRoles("clinician_doctor", "super_admin"),
  controller.createClinicalNote
);

// View notes across encounters for a patient
router.get(
  "/patient/:patientId",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getNotesByPatientId
);

// View notes for an encounter
router.get(
  "/encounter/:encounterId",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getNotesByEncounterId
);

// Finalize / sign note
router.patch(
  "/:id/finalize",
  requireRoles("clinician_doctor", "super_admin"),
  controller.finalizeClinicalNote
);

// View a single note
router.get(
  "/:id",
  requireRoles("clinician_doctor", "staff_nurse", "super_admin"),
  controller.getClinicalNoteById
);

// Update notes (drafts or amendments): doctors and super admins
router.patch(
  "/:id",
  requireRoles("clinician_doctor", "super_admin"),
  controller.updateClinicalNote
);

module.exports = router;
