const express = require("express");
const router = express.Router();
const controller = require("./roster.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

// All roster operations require authentication
router.use(authenticateToken);

// 3.2 Doctor Roster & Shift Planning Endpoints

// Schedules (Weekly master recurring templates)
router.post("/schedules", requireRoles("super_admin"), controller.createSchedule);
router.get("/schedules", requireRoles("super_admin", "clinician_doctor", "receptionist", "staff_nurse"), controller.getSchedules);
router.put("/schedules/:id", requireRoles("super_admin"), controller.updateSchedule);
router.delete("/schedules/:id", requireRoles("super_admin"), controller.deleteSchedule);

// Leaves
router.post("/leaves", requireRoles("clinician_doctor", "super_admin"), controller.applyLeave);
router.get("/leaves", requireRoles("super_admin", "clinician_doctor", "receptionist"), controller.getLeaves);
router.patch("/leaves/:id/status", requireRoles("super_admin"), controller.reviewLeave);
router.delete("/leaves/:id", requireRoles("clinician_doctor", "super_admin"), controller.deleteLeave);

// Daily Rosters
router.post("/generate", requireRoles("super_admin"), controller.generateRoster);
router.post("/bulk-publish", requireRoles("super_admin"), controller.bulkPublish);
router.post("/", requireRoles("super_admin"), controller.createRoster);
router.get("/", requireRoles("super_admin", "clinician_doctor", "receptionist", "staff_nurse"), controller.getRosters);
router.get("/:id", requireRoles("super_admin", "clinician_doctor", "receptionist", "staff_nurse"), controller.getRosterById);
router.put("/:id", requireRoles("super_admin"), controller.updateRoster);
router.patch("/:id/publish", requireRoles("super_admin"), controller.publishRoster);
router.delete("/:id", requireRoles("super_admin"), controller.deleteRoster);

module.exports = router;
