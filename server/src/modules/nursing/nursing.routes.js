const express = require("express");
const router = express.Router();
const controller = require("./nursing.controller");

// 21.1 Ward Nursing Workstation
router.get("/dashboard", controller.getDashboard);
router.get("/patients", controller.getPatients);
router.get("/patients/:id", controller.getPatientById);

// 21.2 Vitals & Intake-Output Charting
router.get("/vitals", controller.getVitals);
router.get("/vitals/:patientId", controller.getVitals);
router.post("/vitals", controller.recordVitals);

router.get("/intake-output", controller.getIntakeOutput);
router.get("/intake-output/:patientId", controller.getIntakeOutput);
router.post("/intake-output", controller.recordIntakeOutput);

// 21.3 Medication Administration Record (MAR)
router.get("/mar", controller.getMar);
router.get("/mar/:patientId", controller.getMar);
router.post("/mar/administer", controller.administerMedication);
router.post("/mar/withhold", controller.withholdMedication);

// 21.4 Doctor Order Execution
router.get("/doctor-orders", controller.getDoctorOrders);
router.get("/doctor-orders/:patientId", controller.getDoctorOrders);
router.post("/doctor-orders/execute", controller.executeDoctorOrder);

// 21.5 Shift Handover Notes
router.get("/handovers", controller.getHandovers);
router.post("/handovers", controller.createHandover);
router.post("/handovers/:id/accept", controller.acceptHandover);

module.exports = router;
