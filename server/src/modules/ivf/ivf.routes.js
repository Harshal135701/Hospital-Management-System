const express = require("express");
const router = express.Router();
const controller = require("./ivf.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Cycles
router.post("/cycles", requireRoles("clinician_doctor", "super_admin"), controller.createCycle);
router.get("/cycles", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getCycles);
router.get("/cycles/:id", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getCycleById);

// 10.1 Oocyte Retrieval (OPU)
router.post("/cycles/:id/opu", requireRoles("clinician_doctor", "super_admin"), controller.recordOpu);
router.get("/cycles/:id/opu", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getOpuByCycle);

// 10.2 Fertilization
router.post("/cycles/:id/fertilization", requireRoles("lab_technician", "clinician_doctor", "super_admin"), controller.recordFertilization);
router.get("/cycles/:id/fertilization", requireRoles("lab_technician", "clinician_doctor", "staff_nurse", "super_admin"), controller.getFertilizationByCycle);

// 10.3 Embryo Morphological Grading
router.post("/cycles/:id/embryos", requireRoles("lab_technician", "clinician_doctor", "super_admin"), controller.createEmbryo);
router.get("/cycles/:id/embryos", requireRoles("lab_technician", "clinician_doctor", "staff_nurse", "super_admin"), controller.getEmbryosByCycle);
router.patch("/embryos/:id", requireRoles("lab_technician", "clinician_doctor", "super_admin"), controller.updateEmbryo);

// 10.4 Embryo Transfer Protocol
router.post("/cycles/:id/transfer", requireRoles("clinician_doctor", "super_admin"), controller.recordTransfer);
router.get("/cycles/:id/transfer", requireRoles("clinician_doctor", "staff_nurse", "super_admin"), controller.getTransfersByCycle);

// 10.5 Embryo Cryostorage Management
router.post("/embryos/:embryoId/cryostore", requireRoles("lab_technician", "super_admin"), controller.storeEmbryo);
router.get("/cryostorage", requireRoles("lab_technician", "clinician_doctor", "super_admin"), controller.getCryostorage);
router.patch("/cryostorage/:id/disposition", requireRoles("clinician_doctor", "super_admin"), controller.updateCryostorageDisposition);

module.exports = router;
