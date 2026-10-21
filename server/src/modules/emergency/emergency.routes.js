const express = require("express");
const router = express.Router();
const controller = require("./emergency.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 11.1 Triage Assessment
router.post("/triage", requireRoles("staff_nurse", "clinician_doctor", "super_admin"), controller.createTriage);
router.get("/triage", requireRoles("staff_nurse", "clinician_doctor", "receptionist", "super_admin"), controller.getTriageList);
router.get("/triage/:id", requireRoles("staff_nurse", "clinician_doctor", "receptionist", "super_admin"), controller.getTriageById);

// 11.2 Medico-Legal Case (MLC) Registry
router.post("/mlc", requireRoles("clinician_doctor", "super_admin"), controller.createMlc);
router.get("/mlc", requireRoles("clinician_doctor", "super_admin", "receptionist"), controller.getMlcList);

// 11.3 Emergency Bay & Bed Allocation
router.post("/bays", requireRoles("super_admin"), controller.createBay);
router.get("/bays", requireRoles("staff_nurse", "clinician_doctor", "receptionist", "super_admin"), controller.getBays);
router.post("/triage/:id/allocate-bay", requireRoles("staff_nurse", "super_admin"), controller.allocateBay);
router.post("/triage/:id/vacate-bay", requireRoles("staff_nurse", "super_admin"), controller.vacateBay);

// 11.4 Trauma Clinical Charting
router.post("/triage/:id/trauma-chart", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.createTraumaChart);
router.get("/triage/:id/trauma-chart", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getTraumaChartByTriage);

// 11.5 Rapid Disposition (ICU/OT/Ward/Discharge)
router.post("/triage/:id/disposition", requireRoles("clinician_doctor", "super_admin"), controller.createDisposition);
router.get("/triage/:id/disposition", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getDispositionByTriage);

module.exports = router;
