const express = require("express");
const router = express.Router();
const controller = require("./daycare.controller");

// 8.1 Day Care Admission & Procedure Booking
router.post("/admissions", controller.createAdmission);
router.get("/admissions", controller.getAdmissions);
router.get("/admissions/:id", controller.getAdmissionById);
router.patch("/admissions/:id/status", controller.updateAdmissionStatus);

// 8.2 Chair / Bed Allocation
router.post("/chairs", controller.createChair);
router.get("/chairs", controller.getChairs);
router.patch("/chairs/:id/status", controller.updateChairStatus);
router.post("/admissions/:id/allocate-chair", controller.allocateChair);
router.post("/admissions/:id/release-chair", controller.releaseChair);

// 8.3 Clinical Procedure Monitoring
router.post("/admissions/:id/monitoring", controller.addProcedureMonitoring);
router.get("/admissions/:id/monitoring", controller.getProcedureMonitors);

// 8.4 Same-Day Discharge Summary
router.post("/admissions/:id/discharge", controller.createDischargeSummary);
router.get("/admissions/:id/discharge", controller.getDischargeSummary);

module.exports = router;
