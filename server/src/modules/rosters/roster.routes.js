const express = require("express");
const router = express.Router();
const controller = require("./roster.controller");

// 3.2 Doctor Roster & Shift Planning Endpoints

// Schedules (Weekly master recurring templates)
router.post("/schedules", controller.createSchedule);
router.get("/schedules", controller.getSchedules);
router.put("/schedules/:id", controller.updateSchedule);
router.delete("/schedules/:id", controller.deleteSchedule);

// Leaves
router.post("/leaves", controller.applyLeave);
router.get("/leaves", controller.getLeaves);
router.patch("/leaves/:id/status", controller.reviewLeave);
router.delete("/leaves/:id", controller.deleteLeave);

// Daily Rosters
router.post("/generate", controller.generateRoster);
router.post("/bulk-publish", controller.bulkPublish);
router.post("/", controller.createRoster);
router.get("/", controller.getRosters);
router.get("/:id", controller.getRosterById);
router.put("/:id", controller.updateRoster);
router.patch("/:id/publish", controller.publishRoster);
router.delete("/:id", controller.deleteRoster);

module.exports = router;
