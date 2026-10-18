const repository = require("./finance.repository");
const ApiError = require("../../utils/ApiError");

async function createAccount(data) {
  if (!data.account_code || !data.account_name || !data.account_type) {
    throw ApiError.badRequest("account_code, account_name, and account_type are required");
  }
  const valid = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
  if (!valid.includes(data.account_type)) {
    throw ApiError.badRequest(`Invalid account_type. Allowed: ${valid.join(", ")}`);
  }
  return repository.createAccount(data);
}

async function getAccounts(filters) {
  return repository.getAccounts(filters);
}

async function createJournalEntry(data) {
  if (!data.total_amount || !data.lines || data.lines.length < 2) {
    throw ApiError.badRequest("Journal entry requires total_amount and at least two balanced journal lines (debit & credit)");
  }

  const totalDebit = data.lines.reduce((acc, l) => acc + Number(l.debit || 0), 0);
  const totalCredit = data.lines.reduce((acc, l) => acc + Number(l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw ApiError.badRequest(`Unbalanced journal entry! Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit})`);
  }

  if (!data.entry_number) {
    data.entry_number = `JE-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createJournalEntry(data);
}

async function getJournalEntries(filters) {
  return repository.getJournalEntries(filters);
}

async function createVoucher(data) {
  if (!data.voucher_type || !data.payee_name || !data.amount) {
    throw ApiError.badRequest("voucher_type, payee_name, and amount are required");
  }

  if (!data.voucher_number) {
    data.voucher_number = `VOUCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createVoucher(data);
}

async function getVouchers(filters) {
  return repository.getVouchers(filters);
}

async function updateVoucherStatus(id, status) {
  const valid = ["draft", "approved", "cancelled", "posted"];
  if (!valid.includes(status)) {
    throw ApiError.badRequest(`Invalid voucher status: ${status}`);
  }
  const v = await repository.updateVoucherStatus(id, status);
  if (!v) throw ApiError.notFound("Voucher not found");
  return v;
}

// 13.3 Doctor Payout & Revenue Share Calculation
async function calculateDoctorPayout(data) {
  if (!data.doctor_id || !data.period_start || !data.period_end) {
    throw ApiError.badRequest("doctor_id, period_start, and period_end are required");
  }

  const opdRev = Number(data.opd_consultation_revenue || 0);
  const opdShare = Number(data.opd_share_percent || 70);
  const ipdRev = Number(data.ipd_surgery_revenue || 0);
  const ipdShare = Number(data.ipd_share_percent || 60);
  const diagRev = Number(data.diagnostic_revenue || 0);
  const diagShare = Number(data.diagnostic_share_percent || 10);

  const opdPayout = (opdRev * opdShare) / 100;
  const ipdPayout = (ipdRev * ipdShare) / 100;
  const diagPayout = (diagRev * diagShare) / 100;
  const grossPayable = opdPayout + ipdPayout + diagPayout;

  const tds = data.tds_deduction !== undefined ? Number(data.tds_deduction) : (grossPayable * 10) / 100; // default 10% TDS
  const otherDeductions = Number(data.other_deductions || 0);
  const netPayout = Math.max(0, grossPayable - tds - otherDeductions);

  const payoutData = {
    payout_batch_number: `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    doctor_id: data.doctor_id,
    period_start: data.period_start,
    period_end: data.period_end,
    opd_consultation_revenue: opdRev,
    opd_share_percent: opdShare,
    ipd_surgery_revenue: ipdRev,
    ipd_share_percent: ipdShare,
    diagnostic_revenue: diagRev,
    diagnostic_share_percent: diagShare,
    gross_payable: grossPayable,
    tds_deduction: tds,
    other_deductions: otherDeductions,
    net_payout: netPayout,
    status: "calculated",
  };

  return repository.createDoctorPayout(payoutData);
}

async function getDoctorPayouts(filters) {
  return repository.getDoctorPayouts(filters);
}

async function markDoctorPayoutPaid(id) {
  const payout = await repository.markDoctorPayoutPaid(id);
  if (!payout) throw ApiError.notFound("Doctor payout record not found");
  return payout;
}

// 13.4 Bank Reconciliation
async function createBankReconciliation(data) {
  if (!data.bank_account_id || !data.statement_date || data.statement_balance === undefined || data.ledger_balance === undefined) {
    throw ApiError.badRequest("bank_account_id, statement_date, statement_balance, and ledger_balance are required");
  }

  const diff = Number(data.statement_balance) - Number(data.ledger_balance);
  data.difference_amount = diff;
  data.status = diff === 0 ? "reconciled" : "unreconciled";

  if (!data.reconciliation_number) {
    data.reconciliation_number = `BR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  return repository.createBankReconciliation(data);
}

async function getBankReconciliations() {
  return repository.getBankReconciliations();
}

async function updateBankReconciliationStatus(id, status, reconciled_by) {
  const recon = await repository.updateBankReconciliationStatus(id, status, reconciled_by);
  if (!recon) throw ApiError.notFound("Bank reconciliation not found");
  return recon;
}

// 13.5 Profit & Loss / Balance Sheet Reporting
async function getProfitAndLoss(startDate, endDate) {
  return repository.getProfitAndLoss(startDate, endDate);
}

async function getBalanceSheet() {
  return repository.getBalanceSheet();
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
