const express = require("express");
const router = express.Router();
const controller = require("./finance.controller");
const {
  authenticateToken,
  requireRoles,
} = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// 13.1 Chart of Accounts & General Ledger
router.post("/accounts", requireRoles("super_admin"), controller.createAccount);
router.get("/accounts", requireRoles("super_admin", "receptionist"), controller.getAccounts);
router.post("/journal-entries", requireRoles("super_admin"), controller.createJournalEntry);
router.get("/journal-entries", requireRoles("super_admin"), controller.getJournalEntries);

// 13.2 Debit / Credit Payment Vouchers
router.post("/vouchers", requireRoles("super_admin"), controller.createVoucher);
router.get("/vouchers", requireRoles("super_admin", "receptionist"), controller.getVouchers);
router.patch("/vouchers/:id/status", requireRoles("super_admin"), controller.updateVoucherStatus);

// 13.3 Doctor Payout & Revenue Share Calculation
router.post("/doctor-payouts/calculate", requireRoles("super_admin"), controller.calculateDoctorPayout);
router.get("/doctor-payouts", requireRoles("super_admin", "clinician_doctor"), controller.getDoctorPayouts);
router.patch("/doctor-payouts/:id/pay", requireRoles("super_admin"), controller.markDoctorPayoutPaid);

// 13.4 Bank Reconciliation
router.post("/bank-reconciliations", requireRoles("super_admin"), controller.createBankReconciliation);
router.get("/bank-reconciliations", requireRoles("super_admin"), controller.getBankReconciliations);
router.patch("/bank-reconciliations/:id/status", requireRoles("super_admin"), controller.updateBankReconciliationStatus);

// 13.5 Profit & Loss / Balance Sheet Reporting
router.get("/reports/profit-and-loss", requireRoles("super_admin"), controller.getProfitAndLoss);
router.get("/reports/balance-sheet", requireRoles("super_admin"), controller.getBalanceSheet);

module.exports = router;
