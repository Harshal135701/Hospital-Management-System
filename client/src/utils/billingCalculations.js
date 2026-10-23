/**
 * MedicsPrime Financial Integrity & Reconciliation Utility
 * 
 * Enforces accounting principles across:
 * - OPD & IPD Bills
 * - Historical & New Payments
 * - Advance Deposits held in trust
 * - Refund Eligibility Ceilings & Audit Reversals
 */

/**
 * Calculates net payable and remaining balance for a bill accounting for
 * applied advances, deposit credits, valid historical payments, and approved refunds.
 * 
 * Formula:
 * Net Amount Due = max(0, Total Invoice Amount - Applied Credits)
 * Remaining Balance = max(0, Net Amount Due - Total Payments Collected + Total Refunds Processed)
 */
export function calculateBillFinancials(bill, allPayments = [], allDeposits = [], allRefunds = []) {
  if (!bill) {
    return {
      grossAmount: 0,
      discountsTotal: 0,
      taxesTotal: 0,
      totalInvoiceAmount: 0,
      appliedAdvanceCredit: 0,
      appliedDepositCredit: 0,
      totalAppliedCredits: 0,
      netAmountDue: 0,
      totalPaymentsCollected: 0,
      totalRefundsProcessed: 0,
      remainingBalance: 0,
      isFullyPaid: false,
      status: 'unpaid'
    };
  }

  // 1. Gross and Tax Calculations
  let gross = Number(bill.gross_amount ?? bill.total_amount ?? 0);
  if (Array.isArray(bill.items) && bill.items.length > 0) {
    gross = bill.items.reduce((sum, it) => sum + (Number(it.price || it.unit_price || 0) * Number(it.qty || it.quantity || 1)), 0);
  }
  const discounts = Number(bill.discounts_total || bill.discount_amount || 0);
  const taxes = Number(bill.taxes_total || bill.tax_amount || 0);
  const totalInvoiceAmount = Math.max(0, gross - discounts + taxes);

  // 2. Credits (Advance collected at appointment booking + allocated deposit)
  const appliedAdvanceCredit = Number(bill.applied_advance_credit || 0);
  const appliedDepositCredit = Number(bill.applied_deposit_credit || 0);
  const totalAppliedCredits = Math.min(totalInvoiceAmount, appliedAdvanceCredit + appliedDepositCredit);

  // 3. Net Amount Due
  const netAmountDue = Math.max(0, totalInvoiceAmount - totalAppliedCredits);

  // 4. Payments associated with this bill
  const billId = bill.id || bill.bill_number;
  const matchingPayments = (allPayments || []).filter(p => {
    return (p.bill_id === billId || p.bill_number === bill.bill_number) && p.status !== 'void';
  });

  const paymentsSum = matchingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  // Also consider legacy bill.paid_amount or payments_collected if no matching payments found in array
  const totalPaymentsCollected = matchingPayments.length > 0
    ? paymentsSum
    : Number(bill.payments_collected ?? bill.paid_amount ?? 0);

  // 5. Refunds associated with this bill or its payments
  const matchingRefunds = (allRefunds || []).filter(r => {
    const isMatchingBill = r.bill_id === billId || r.bill_number === bill.bill_number;
    const isMatchingPayment = matchingPayments.some(p => p.id === r.payment_id || p.receipt_number === r.receipt_number);
    const isEffective = ['approved', 'processed', 'completed'].includes(r.status);
    return (isMatchingBill || isMatchingPayment) && isEffective;
  });

  const totalRefundsProcessed = matchingRefunds.reduce((sum, r) => sum + (Number(r.refund_amount ?? r.amount) || 0), 0);

  // 6. Remaining Balance Due
  const remainingBalance = Math.max(0, netAmountDue - totalPaymentsCollected + totalRefundsProcessed);
  const isFullyPaid = remainingBalance <= 0 && netAmountDue > 0;
  const status = remainingBalance <= 0
    ? 'paid'
    : totalPaymentsCollected > 0
    ? 'partially_paid'
    : 'issued';

  return {
    grossAmount: gross,
    discountsTotal: discounts,
    taxesTotal: taxes,
    totalInvoiceAmount,
    appliedAdvanceCredit,
    appliedDepositCredit,
    totalAppliedCredits,
    netAmountDue,
    totalPaymentsCollected,
    totalRefundsProcessed,
    remainingBalance,
    isFullyPaid,
    status
  };
}

/**
 * Validates refund eligibility and prevents over-refunds.
 * 
 * Formula:
 * Max Eligible Refund = Total Payments Paid - Total Approved/Processed Refunds
 */
export function validateRefundEligibility(billOrPayment, requestedAmount, existingRefunds = []) {
  const reqAmt = Number(requestedAmount) || 0;
  if (reqAmt <= 0) {
    return {
      isValid: false,
      maxEligible: 0,
      reason: 'Refund amount must be greater than zero'
    };
  }

  const originalPaid = Number(
    billOrPayment?.amount ??
    billOrPayment?.paid_amount ??
    billOrPayment?.payments_collected ??
    billOrPayment?.original_amount ??
    0
  );

  if (originalPaid <= 0) {
    return {
      isValid: false,
      maxEligible: 0,
      reason: 'No payments have been recorded for this invoice/receipt to refund'
    };
  }

  const billId = billOrPayment.id || billOrPayment.bill_number;
  const receiptNo = billOrPayment.receipt_number;

  // Sum existing non-rejected refunds
  const priorRefunds = (existingRefunds || []).filter(r => {
    const isMatch = (r.bill_id === billId || r.bill_number === billOrPayment.bill_number || (receiptNo && r.receipt_number === receiptNo));
    return isMatch && r.status !== 'rejected';
  });

  const alreadyRefunded = priorRefunds.reduce((sum, r) => sum + (Number(r.refund_amount ?? r.amount) || 0), 0);
  const maxEligible = Math.max(0, originalPaid - alreadyRefunded);

  if (reqAmt > maxEligible) {
    return {
      isValid: false,
      maxEligible,
      alreadyRefunded,
      originalPaid,
      reason: `Requested refund of ₹${reqAmt.toLocaleString('en-IN')} exceeds maximum eligible balance of ₹${maxEligible.toLocaleString('en-IN')}`
    };
  }

  return {
    isValid: true,
    maxEligible,
    alreadyRefunded,
    originalPaid
  };
}

/**
 * Computes available advance deposit balance held in trust.
 * 
 * Formula:
 * Available Balance = Original Deposit - Allocated to Bills - Processed Refunds
 */
export function calculateDepositAvailableBalance(deposit, existingRefunds = []) {
  if (!deposit) return 0;
  const orig = Number(deposit.original_amount ?? deposit.amount ?? 0);
  const allocated = Number(deposit.allocated_amount || 0);

  const depId = deposit.id || deposit.receipt_number;
  const relatedRefunds = (existingRefunds || []).filter(r => {
    return (r.deposit_id === depId || r.bill_number === deposit.receipt_number) && r.status !== 'rejected';
  });
  const refunded = relatedRefunds.reduce((sum, r) => sum + (Number(r.refund_amount ?? r.amount) || 0), 0);

  return Math.max(0, orig - allocated - refunded);
}

/**
 * Checks for duplicate transaction references to prevent duplicate payments.
 */
export function isDuplicateTransaction(existingTransactions, newTxn, identifierKeys = ['txn_ref', 'receipt_number']) {
  if (!Array.isArray(existingTransactions) || !newTxn) return false;
  return existingTransactions.some(t => {
    return identifierKeys.some(key => {
      const existingVal = t[key];
      const newVal = newTxn[key];
      return existingVal && newVal && String(existingVal).trim().toLowerCase() === String(newVal).trim().toLowerCase();
    });
  });
}
