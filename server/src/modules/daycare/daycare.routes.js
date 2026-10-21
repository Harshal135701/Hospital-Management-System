const express = require("express");
const router = express.Router();
const controller = require("./daycare.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 8.1 Day Care Admission & Procedure Booking
router.post("/admissions", requireRoles("receptionist", "staff_nurse", "clinician_doctor", "super_admin"), controller.createAdmission);
router.get("/admissions", requireRoles("receptionist", "staff_nurse", "clinician_doctor", "super_admin"), controller.getAdmissions);
router.get("/admissions/:id", requireRoles("receptionist", "staff_nurse", "clinician_doctor", "super_admin"), controller.getAdmissionById);
router.patch("/admissions/:id/status", requireRoles("staff_nurse", "clinician_doctor", "super_admin"), controller.updateAdmissionStatus);

// 8.2 Chair / Bed Allocation
router.post("/chairs", requireRoles("super_admin"), controller.createChair);
router.get("/chairs", requireRoles("receptionist", "staff_nurse", "clinician_doctor", "super_admin"), controller.getChairs);
router.patch("/chairs/:id/status", requireRoles("staff_nurse", "super_admin"), controller.updateChairStatus);
router.post("/admissions/:id/allocate-chair", requireRoles("staff_nurse", "receptionist", "super_admin"), controller.allocateChair);
router.post("/admissions/:id/release-chair", requireRoles("staff_nurse", "super_admin"), controller.releaseChair);

// 8.3 Clinical Procedure Monitoring
router.post("/admissions/:id/monitoring", requireRoles("staff_nurse", "clinician_doctor", "super_admin"), controller.addProcedureMonitoring);
router.get("/admissions/:id/monitoring", requireRoles("staff_nurse", "clinician_doctor", "super_admin"), controller.getProcedureMonitors);

// 8.4 Same-Day Discharge Summary
router.post("/admissions/:id/discharge", requireRoles("clinician_doctor", "super_admin"), controller.createDischargeSummary);
router.get("/admissions/:id/discharge", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getDischargeSummary);

module.exports = router;
