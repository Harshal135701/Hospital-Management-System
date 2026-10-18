const express = require("express");
const router = express.Router();
const controller = require("./emergency.controller");

// 11.1 Triage Assessment
router.post("/triage", controller.createTriage);
router.get("/triage", controller.getTriageList);
router.get("/triage/:id", controller.getTriageById);

// 11.2 Medico-Legal Case (MLC) Registry
router.post("/mlc", controller.createMlc);
router.get("/mlc", controller.getMlcList);

// 11.3 Emergency Bay & Bed Allocation
router.post("/bays", controller.createBay);
router.get("/bays", controller.getBays);
router.post("/triage/:id/allocate-bay", controller.allocateBay);
router.post("/triage/:id/vacate-bay", controller.vacateBay);

// 11.4 Trauma Clinical Charting
router.post("/triage/:id/trauma-chart", controller.createTraumaChart);
router.get("/triage/:id/trauma-chart", controller.getTraumaChartByTriage);

// 11.5 Rapid Disposition (ICU/OT/Ward/Discharge)
router.post("/triage/:id/disposition", controller.createDisposition);
router.get("/triage/:id/disposition", controller.getDispositionByTriage);

module.exports = router;
