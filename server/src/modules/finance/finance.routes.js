const express = require("express");
const router = express.Router();
const controller = require("./finance.controller");

// 13.1 Chart of Accounts & General Ledger
router.post("/accounts", controller.createAccount);
router.get("/accounts", controller.getAccounts);
router.post("/journal-entries", controller.createJournalEntry);
router.get("/journal-entries", controller.getJournalEntries);

// 13.2 Debit / Credit Payment Vouchers
router.post("/vouchers", controller.createVoucher);
router.get("/vouchers", controller.getVouchers);
router.patch("/vouchers/:id/status", controller.updateVoucherStatus);

// 13.3 Doctor Payout & Revenue Share Calculation
router.post("/doctor-payouts/calculate", controller.calculateDoctorPayout);
router.get("/doctor-payouts", controller.getDoctorPayouts);
router.patch("/doctor-payouts/:id/pay", controller.markDoctorPayoutPaid);

// 13.4 Bank Reconciliation
router.post("/bank-reconciliations", controller.createBankReconciliation);
router.get("/bank-reconciliations", controller.getBankReconciliations);
router.patch("/bank-reconciliations/:id/status", controller.updateBankReconciliationStatus);

// 13.5 Profit & Loss / Balance Sheet Reporting
router.get("/reports/profit-and-loss", controller.getProfitAndLoss);
router.get("/reports/balance-sheet", controller.getBalanceSheet);

module.exports = router;
