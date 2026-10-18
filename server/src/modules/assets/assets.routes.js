const express = require("express");
const router = express.Router();
const controller = require("./assets.controller");

// 14.1 Asset Master & Barcode Tagging
router.post("/", controller.createAsset);
router.get("/", controller.getAssets);
router.get("/:id", controller.getAssetById);
router.patch("/:id/status", controller.updateAssetStatus);

// 14.2 AMC / CMC Service Contracts & Warranties
router.post("/:id/contracts", controller.createContract);
router.get("/:id/contracts", controller.getContractsByAsset);

// 14.3 Preventive Maintenance Scheduling
router.post("/:id/pm-schedules", controller.createPmSchedule);
router.get("/pm-schedules/all", controller.getPmSchedules);
router.patch("/pm-schedules/:scheduleId", controller.updatePmSchedule);

// 14.4 Breakdown Reporting & Work Ticket
router.post("/:id/breakdown-tickets", controller.createBreakdownTicket);
router.get("/breakdown-tickets/all", controller.getBreakdownTickets);
router.patch("/breakdown-tickets/:ticketId", controller.updateBreakdownTicket);

// 14.5 Asset Depreciation Calculation
router.post("/:id/depreciation/calculate", controller.calculateDepreciation);
router.get("/:id/depreciation", controller.getDepreciationByAsset);

module.exports = router;
