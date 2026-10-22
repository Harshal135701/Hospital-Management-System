const express = require("express");
const router = express.Router();
const controller = require("./assets.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 14.1 Asset Master & Barcode Tagging
router.post("/", requireRoles("super_admin"), controller.createAsset);
router.get("/", requireRoles("super_admin", "staff_nurse", "clinician_doctor"), controller.getAssets);
router.get("/:id", requireRoles("super_admin", "staff_nurse", "clinician_doctor"), controller.getAssetById);
router.patch("/:id/status", requireRoles("super_admin"), controller.updateAssetStatus);

// 14.2 AMC / CMC Service Contracts & Warranties
router.post("/:id/contracts", requireRoles("super_admin"), controller.createContract);
router.get("/:id/contracts", requireRoles("super_admin"), controller.getContractsByAsset);

// 14.3 Preventive Maintenance Scheduling
router.post("/:id/pm-schedules", requireRoles("super_admin"), controller.createPmSchedule);
router.get("/pm-schedules/all", requireRoles("super_admin"), controller.getPmSchedules);
router.patch("/pm-schedules/:scheduleId", requireRoles("super_admin"), controller.updatePmSchedule);

// 14.4 Breakdown Reporting & Work Ticket
router.post("/:id/breakdown-tickets", requireRoles("staff_nurse", "clinician_doctor", "super_admin"), controller.createBreakdownTicket);
router.get("/breakdown-tickets/all", requireRoles("super_admin", "staff_nurse", "clinician_doctor"), controller.getBreakdownTickets);
router.patch("/breakdown-tickets/:ticketId", requireRoles("super_admin"), controller.updateBreakdownTicket);

// 14.5 Asset Depreciation Calculation
router.post("/:id/depreciation/calculate", requireRoles("super_admin"), controller.calculateDepreciation);
router.get("/:id/depreciation", requireRoles("super_admin"), controller.getDepreciationByAsset);

module.exports = router;
