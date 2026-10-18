const express = require("express");
const router = express.Router();
const controller = require("./enterprise.controller");

// 15.1 Hospital & Branch Master
router.post("/hospitals", controller.createHospital);
router.get("/hospitals", controller.getHospitals);
router.post("/hospitals/:hospitalId/branches", controller.createBranch);
router.get("/branches", controller.getBranches);

// 15.2 Department & Clinic Hierarchy
router.post("/clinics", controller.createClinic);
router.get("/clinics", controller.getClinics);
router.get("/hierarchy", controller.getFullHierarchy);

// 15.3 Doctor & Consultant Master
router.post("/doctors", controller.createDoctor);
router.get("/doctors", controller.getDoctors);
router.get("/doctors/:id", controller.getDoctorById);
router.patch("/doctors/:id", controller.updateDoctor);

// 15.4 Service Catalog & Tariff Master
router.post("/services", controller.createService);
router.get("/services", controller.getServices);
router.patch("/services/:id", controller.updateService);

// 15.5 Corporate Tariff Rate Contracts
router.post("/corporate-tariffs", controller.createCorporateTariff);
router.get("/corporate-tariffs", controller.getCorporateTariffs);
router.patch("/corporate-tariffs/:id", controller.updateCorporateTariff);

module.exports = router;
