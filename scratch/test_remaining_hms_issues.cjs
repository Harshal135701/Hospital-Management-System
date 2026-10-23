const assert = require('assert');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('--- STARTING REMAINING HMS ISSUES VERIFICATION SUITE ---\n');

  // Load modules
  const ipdModulePath = path.resolve(__dirname, '../client/src/utils/ipdRoomBilling.js');
  const billingModulePath = path.resolve(__dirname, '../client/src/utils/billingCalculations.js');
  
  const { calculateIpdRoomStayBilling } = await import('file:///' + ipdModulePath.replace(/\\/g, '/'));
  const { 
    calculateBillFinancials, 
    validateRefundEligibility, 
    calculateDepositAvailableBalance, 
    isDuplicateTransaction 
  } = await import('file:///' + billingModulePath.replace(/\\/g, '/'));

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // ISSUE 1: IPD Transfer-Day Billing
  console.log('Group 1: IPD Transfer-Day Tariff Accrual & Deduplication');

  const testStays = [
    {
      id: 'stay-01',
      ward_code: 'ICU',
      ward_name: 'Intensive Care Unit (ICU Bed 02)',
      daily_rate: 5000,
      start_time: '2026-10-15T10:15:00',
      end_time: '2026-10-18T14:30:00'
    },
    {
      id: 'stay-02',
      ward_code: 'GEN',
      ward_name: 'General Ward Bed 08',
      daily_rate: 2000,
      start_time: '2026-10-18T14:30:00',
      end_time: '2026-10-22T23:59:59'
    }
  ];

  await test('MIDNIGHT_LOCATION rule bills transfer date (Oct 18) once at destination midnight tariff', () => {
    const result = calculateIpdRoomStayBilling(testStays, { transfer_day_rule: 'MIDNIGHT_LOCATION' }, '2026-10-22T23:59:59');
    assert.strictEqual(result.totalDays, 8, 'Should accrue exactly 8 calendar days (Oct 15 to 22)');
    assert.strictEqual(result.totalRoomCharges, 25000, 'Charge must be 3 days ICU @ 5000 + 5 days Gen @ 2000 = 25000');
    assert.strictEqual(result.dailyAuditTrail.length, 8, 'Audit trail must contain 8 daily line items');
    
    // Check Oct 18 in audit trail
    const oct18 = result.dailyAuditTrail.find(d => d.date === '2026-10-18');
    assert.ok(oct18, 'Oct 18 must be in audit trail');
    assert.strictEqual(oct18.isTransferDay, true, 'Oct 18 must be flagged as transfer day');
    assert.strictEqual(oct18.wardCode, 'GEN', 'Oct 18 midnight census location must be GEN');
    assert.strictEqual(oct18.dailyRate, 2000, 'Oct 18 tariff must be 2000');
  });

  await test('HIGHER_TARIFF rule bills transfer date once at higher tariff (ICU @ 5000)', () => {
    const result = calculateIpdRoomStayBilling(testStays, { transfer_day_rule: 'HIGHER_TARIFF' }, '2026-10-22T23:59:59');
    assert.strictEqual(result.totalDays, 8);
    assert.strictEqual(result.totalRoomCharges, 28000, 'Charge must be 4 days ICU @ 5000 + 4 days Gen @ 2000 = 28000');
    
    const oct18 = result.dailyAuditTrail.find(d => d.date === '2026-10-18');
    assert.strictEqual(oct18.wardCode, 'ICU');
    assert.strictEqual(oct18.dailyRate, 5000);
  });

  await test('Single-stay admission bills continuous calendar days correctly', () => {
    const singleStay = [{
      id: 'stay-single',
      ward_code: 'DLX',
      ward_name: 'Deluxe Room',
      daily_rate: 4500,
      start_time: '2026-10-20T11:00:00',
      end_time: '2026-10-22T23:59:59'
    }];
    const result = calculateIpdRoomStayBilling(singleStay, {}, '2026-10-22T23:59:59');
    assert.strictEqual(result.totalDays, 3, 'Oct 20, 21, 22 = 3 days');
    assert.strictEqual(result.totalRoomCharges, 13500, '3 * 4500 = 13500');
  });

  // ISSUE 2: Historical Payments vs New Payments & Balances
  console.log('\nGroup 2: Financial Integrity, Payments Ledger & Balance Calculation');

  const sampleBill = {
    id: 'bill-01',
    bill_number: 'IPD-RUN-0021',
    gross_amount: 96900,
    discounts_total: 0,
    taxes_total: 0,
    applied_advance_credit: 50000
  };

  const samplePayments = [
    {
      id: 'pay-01',
      bill_number: 'IPD-RUN-0021',
      receipt_number: 'RCP-IPD-000101',
      amount: 15000,
      status: 'valid'
    }
  ];

  await test('calculateBillFinancials correctly reconciles advance credits, historical payments, and remaining balance', () => {
    const fin = calculateBillFinancials(sampleBill, samplePayments, [], []);
    assert.strictEqual(fin.totalInvoiceAmount, 96900);
    assert.strictEqual(fin.appliedAdvanceCredit, 50000);
    assert.strictEqual(fin.netAmountDue, 46900, 'Net due: 96900 - 50000 = 46900');
    assert.strictEqual(fin.totalPaymentsCollected, 15000);
    assert.strictEqual(fin.remainingBalance, 31900, 'Balance: 46900 - 15000 = 31900');
    assert.strictEqual(fin.isFullyPaid, false);
    assert.strictEqual(fin.status, 'partially_paid');
  });

  await test('calculateBillFinancials updates when new payment receipt is added without mutating history', () => {
    const updatedPayments = [
      ...samplePayments,
      {
        id: 'pay-02',
        bill_number: 'IPD-RUN-0021',
        receipt_number: 'RCP-IPD-000102',
        amount: 31900,
        status: 'valid'
      }
    ];
    const fin = calculateBillFinancials(sampleBill, updatedPayments, [], []);
    assert.strictEqual(fin.totalPaymentsCollected, 46900);
    assert.strictEqual(fin.remainingBalance, 0);
    assert.strictEqual(fin.isFullyPaid, true);
    assert.strictEqual(fin.status, 'paid');
    assert.strictEqual(samplePayments.length, 1, 'Historical payments array is immutable');
  });

  await test('isDuplicateTransaction detects duplicate receipt numbers or transaction references', () => {
    const isDup1 = isDuplicateTransaction(samplePayments, { receipt_number: 'RCP-IPD-000101' });
    assert.strictEqual(isDup1, true);

    const isDup2 = isDuplicateTransaction(samplePayments, { receipt_number: 'RCP-IPD-999999' });
    assert.strictEqual(isDup2, false);

    const deposits = [{ id: 'd1', txn_ref: 'UPI-HDFC-9912' }];
    const isDupTxn = isDuplicateTransaction(deposits, { txn_ref: 'upi-hdfc-9912' });
    assert.strictEqual(isDupTxn, true, 'Case-insensitive txn_ref duplication check');
  });

  // ISSUE 3: Advance Deposits & Refund Eligibility
  console.log('\nGroup 3: Advance Deposits & Refund Ceilings');

  const testBillForRefund = {
    id: 'opd-bill-01',
    bill_number: 'OPD-2026-0915',
    amount: 800,
    paid_amount: 800
  };

  await test('validateRefundEligibility permits valid partial or full refund within ceiling', () => {
    const check1 = validateRefundEligibility(testBillForRefund, 400, []);
    assert.strictEqual(check1.isValid, true);
    assert.strictEqual(check1.maxEligible, 800);
    assert.strictEqual(check1.alreadyRefunded, 0);

    const check2 = validateRefundEligibility(testBillForRefund, 800, []);
    assert.strictEqual(check2.isValid, true);
  });

  await test('validateRefundEligibility blocks over-refund exceeding original payment', () => {
    const check = validateRefundEligibility(testBillForRefund, 1200, []);
    assert.strictEqual(check.isValid, false);
    assert.strictEqual(check.maxEligible, 800);
    assert.ok(check.reason.includes('exceeds maximum eligible balance'));
  });

  await test('validateRefundEligibility accounts for prior approved/pending refunds', () => {
    const priorRefunds = [
      {
        id: 'ref-01',
        bill_number: 'OPD-2026-0915',
        amount: 500,
        status: 'approved'
      }
    ];
    // Remaining ceiling should be 800 - 500 = 300
    const validRemaining = validateRefundEligibility(testBillForRefund, 300, priorRefunds);
    assert.strictEqual(validRemaining.isValid, true);
    assert.strictEqual(validRemaining.maxEligible, 300);
    assert.strictEqual(validRemaining.alreadyRefunded, 500);

    const invalidExcess = validateRefundEligibility(testBillForRefund, 301, priorRefunds);
    assert.strictEqual(invalidExcess.isValid, false);
    assert.strictEqual(invalidExcess.maxEligible, 300);
  });

  await test('calculateDepositAvailableBalance calculates unutilized trust balance', () => {
    const deposit1 = {
      id: 'dep-01',
      receipt_number: 'DEP-2026-0210',
      amount: 25000,
      allocated_amount: 25000
    };
    assert.strictEqual(calculateDepositAvailableBalance(deposit1, []), 0);

    const deposit3 = {
      id: 'dep-03',
      receipt_number: 'DEP-2026-0212',
      amount: 30000,
      allocated_amount: 0
    };
    assert.strictEqual(calculateDepositAvailableBalance(deposit3, []), 30000);

    // If refund was disbursed against deposit3
    const depositRefund = [{ deposit_id: 'dep-03', amount: 5000, status: 'processed' }];
    assert.strictEqual(calculateDepositAvailableBalance(deposit3, depositRefund), 25000);
  });

  // ISSUE 4: Configurable Semen Analysis Limits
  console.log('\nGroup 4: Semen Analysis Limits & WHO 6th Edition Compliance');

  await test('HospitalStateContext exports DEFAULT_SEMEN_ANALYSIS_LIMITS matching WHO 6th edition', () => {
    const contextPath = path.resolve(__dirname, '../client/src/context/HospitalStateContext.jsx');
    const content = fs.readFileSync(contextPath, 'utf8');

    assert.ok(content.includes('DEFAULT_SEMEN_ANALYSIS_LIMITS'), 'DEFAULT_SEMEN_ANALYSIS_LIMITS must be defined');
    assert.ok(content.includes('volume_ml_min: 1.4'), 'WHO 6th edition volume threshold: 1.4 mL');
    assert.ok(content.includes('concentration_m_per_ml_min: 16.0'), 'WHO 6th edition concentration: 16.0 M/mL');
    assert.ok(content.includes('total_motility_pct_min: 42'), 'WHO 6th edition total motility: 42%');
    assert.ok(content.includes('progressive_motility_pct_min: 30'), 'WHO 6th edition progressive motility: 30%');
    assert.ok(content.includes('normal_morphology_pct_min: 4.0'), 'WHO 6th edition normal morphology: 4.0%');
    assert.ok(content.includes('updateSemenAnalysisLimits'), 'Context must expose updateSemenAnalysisLimits()');
  });

  // SUMMARY
  console.log(`\n========================================`);
  console.log(`HMS Issues Verification Results: ${passedTests}/${totalTests} Passed`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
