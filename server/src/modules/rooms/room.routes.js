const express = require("express");
const router = express.Router();
const controller = require("./room.controller");
const { authenticateToken, requireRoles } = require("../../middleware/auth.middleware");

router.use(authenticateToken);

router.get(
  "/",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getRooms
);

router.get(
  "/:id",
  requireRoles("receptionist", "clinician_doctor", "staff_nurse", "blood_bank_officer", "super_admin"),
  controller.getRoomById
);

router.post(
  "/",
  requireRoles("super_admin", "receptionist"),
  controller.createRoom
);

router.put(
  "/:id",
  requireRoles("super_admin", "receptionist"),
  controller.updateRoom
);

module.exports = router;
