const service = require("./finance.service");

// 13.1 Chart of Accounts & General Ledger
async function createAccount(req, res, next) {
  try {
    const data = await service.createAccount(req.body);
    res.status(201).json({ success: true, message: "Account created", data });
  } catch (err) {
    next(err);
  }
}

async function getAccounts(req, res, next) {
  try {
    const data = await service.getAccounts(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function createJournalEntry(req, res, next) {
  try {
    const data = await service.createJournalEntry(req.body);
    res.status(201).json({ success: true, message: "Journal entry posted", data });
  } catch (err) {
    next(err);
  }
}

async function getJournalEntries(req, res, next) {
  try {
    const data = await service.getJournalEntries(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// 13.2 Debit / Credit Payment Vouchers
async function createVoucher(req, res, next) {
  try {
    const data = await service.createVoucher(req.body);
    res.status(201).json({ success: true, message: "Payment voucher generated", data });
  } catch (err) {
    next(err);
  }
}

async function getVouchers(req, res, next) {
  try {
    const data = await service.getVouchers(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateVoucherStatus(req, res, next) {
  try {
    const data = await service.updateVoucherStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: "Voucher status updated", data });
  } catch (err) {
    next(err);
  }
}

// 13.3 Doctor Payout & Revenue Share Calculation
async function calculateDoctorPayout(req, res, next) {
  try {
    const data = await service.calculateDoctorPayout(req.body);
    res.status(201).json({ success: true, message: "Doctor payout calculated", data });
  } catch (err) {
    next(err);
  }
}

async function getDoctorPayouts(req, res, next) {
  try {
    const data = await service.getDoctorPayouts(req.query);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function markDoctorPayoutPaid(req, res, next) {
  try {
    const data = await service.markDoctorPayoutPaid(req.params.id);
    res.status(200).json({ success: true, message: "Payout marked as paid", data });
  } catch (err) {
    next(err);
  }
}

// 13.4 Bank Reconciliation
async function createBankReconciliation(req, res, next) {
  try {
    const data = await service.createBankReconciliation(req.body);
    res.status(201).json({ success: true, message: "Bank reconciliation initiated", data });
  } catch (err) {
    next(err);
  }
}

async function getBankReconciliations(req, res, next) {
  try {
    const data = await service.getBankReconciliations();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

async function updateBankReconciliationStatus(req, res, next) {
  try {
    const data = await service.updateBankReconciliationStatus(req.params.id, req.body.status, req.body.reconciled_by);
    res.status(200).json({ success: true, message: "Reconciliation updated", data });
  } catch (err) {
    next(err);
  }
}

// 13.5 Profit & Loss / Balance Sheet Reporting
async function getProfitAndLoss(req, res, next) {
  try {
    const data = await service.getProfitAndLoss(req.query.start_date, req.query.end_date);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getBalanceSheet(req, res, next) {
  try {
    const data = await service.getBalanceSheet();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAccount,
  getAccounts,
  createJournalEntry,
  getJournalEntries,
  createVoucher,
  getVouchers,
  updateVoucherStatus,
  calculateDoctorPayout,
  getDoctorPayouts,
  markDoctorPayoutPaid,
  createBankReconciliation,
  getBankReconciliations,
  updateBankReconciliationStatus,
  getProfitAndLoss,
  getBalanceSheet,
};
