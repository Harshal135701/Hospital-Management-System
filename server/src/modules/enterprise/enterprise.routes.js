const express = require("express");
const router = express.Router();
const controller = require("./enterprise.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 15.1 Hospital & Branch Master
router.post("/hospitals", requireRoles("super_admin"), controller.createHospital);
router.get("/hospitals", requireRoles("super_admin", "receptionist", "clinician_doctor"), controller.getHospitals);
router.post("/hospitals/:hospitalId/branches", requireRoles("super_admin"), controller.createBranch);
router.get("/branches", requireRoles("super_admin", "receptionist", "clinician_doctor"), controller.getBranches);

// 15.2 Department & Clinic Hierarchy
router.post("/clinics", requireRoles("super_admin"), controller.createClinic);
router.get("/clinics", requireRoles("super_admin", "receptionist", "clinician_doctor"), controller.getClinics);
router.get("/hierarchy", requireRoles("super_admin", "receptionist", "clinician_doctor"), controller.getFullHierarchy);

// 15.3 Doctor & Consultant Master
router.post("/doctors", requireRoles("super_admin"), controller.createDoctor);
router.get("/doctors", requireRoles("super_admin", "receptionist", "clinician_doctor", "staff_nurse"), controller.getDoctors);
router.get("/doctors/:id", requireRoles("super_admin", "receptionist", "clinician_doctor", "staff_nurse"), controller.getDoctorById);
router.patch("/doctors/:id", requireRoles("super_admin"), controller.updateDoctor);

// 15.4 Service Catalog & Tariff Master
router.post("/services", requireRoles("super_admin"), controller.createService);
router.get("/services", requireRoles("super_admin", "receptionist", "clinician_doctor"), controller.getServices);
router.patch("/services/:id", requireRoles("super_admin"), controller.updateService);

// 15.5 Corporate Tariff Rate Contracts
router.post("/corporate-tariffs", requireRoles("super_admin"), controller.createCorporateTariff);
router.get("/corporate-tariffs", requireRoles("super_admin", "receptionist"), controller.getCorporateTariffs);
router.patch("/corporate-tariffs/:id", requireRoles("super_admin"), controller.updateCorporateTariff);

module.exports = router;
