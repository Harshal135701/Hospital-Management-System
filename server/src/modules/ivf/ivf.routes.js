const express = require("express");
const router = express.Router();
const controller = require("./ivf.controller");

// Cycles
router.post("/cycles", controller.createCycle);
router.get("/cycles", controller.getCycles);
router.get("/cycles/:id", controller.getCycleById);

// 10.1 Oocyte Retrieval (OPU)
router.post("/cycles/:id/opu", controller.recordOpu);
router.get("/cycles/:id/opu", controller.getOpuByCycle);

// 10.2 Fertilization
router.post("/cycles/:id/fertilization", controller.recordFertilization);
router.get("/cycles/:id/fertilization", controller.getFertilizationByCycle);

// 10.3 Embryo Morphological Grading
router.post("/cycles/:id/embryos", controller.createEmbryo);
router.get("/cycles/:id/embryos", controller.getEmbryosByCycle);
router.patch("/embryos/:id", controller.updateEmbryo);

// 10.4 Embryo Transfer Protocol
router.post("/cycles/:id/transfer", controller.recordTransfer);
router.get("/cycles/:id/transfer", controller.getTransfersByCycle);

// 10.5 Embryo Cryostorage Management
router.post("/embryos/:embryoId/cryostore", controller.storeEmbryo);
router.get("/cryostorage", controller.getCryostorage);
router.patch("/cryostorage/:id/disposition", controller.updateCryostorageDisposition);

module.exports = router;
