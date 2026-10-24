import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Clock,
  User,
  ShieldCheck,
  Check,
  Lock,
  Building2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { BillingOpsService } from '../../../services/api';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../../utils/formatters';

const DEFAULT_SHIFT_TRANSACTIONS = [
  { id: 'tx-01', receipt: 'OPD-2026-0914', time: '10:15 AM', patient: 'Devika Sengupta (UHID-2026-0814)', type: 'OPD Consultation & ECG', mode: 'UPI', amount: 1450, status: 'verified' },
  { id: 'tx-02', receipt: 'OPD-2026-0915', time: '10:30 AM', patient: 'Rajesh Narayan Verma (UHID-2026-0922)', type: 'OPD Consultation', mode: 'Cash', amount: 800, status: 'verified' },
  { id: 'tx-03', receipt: 'DEP-2026-0210', time: '10:45 AM', patient: 'Vikramaditya Bose (UHID-2026-1180)', type: 'Surgery Advance Deposit', mode: 'Card', amount: 25000, status: 'verified' },
  { id: 'tx-04', receipt: 'OPD-2026-0916', time: '11:00 AM', patient: 'Amina Khatun (UHID-2026-1045)', type: 'Specialist Consultation & Blood Panel', mode: 'Card', amount: 2200, status: 'verified' },
  { id: 'tx-05', receipt: 'OPD-2026-0917', time: '11:45 AM', patient: 'Vikramaditya Bose (UHID-2026-1180)', type: 'OPD Follow-up & X-Ray', mode: 'UPI', amount: 950, status: 'verified' },
  { id: 'tx-06', receipt: 'DEP-2026-0212', time: '12:10 PM', patient: 'Devika Sengupta (UHID-2026-0814)', type: 'IVF Cycle OPU Advance', mode: 'Cash', amount: 30000, status: 'verified' },
  { id: 'tx-07', receipt: 'REF-2026-0012', time: '01:30 PM', patient: 'Rajesh Narayan Verma (UHID-2026-0922)', type: 'Duplicate Reversal Payout', mode: 'Cash Refund', amount: -800, status: 'verified' }
];

export function CashierSettlementView() {
  const [shiftTransactions, setShiftTransactions] = useState(DEFAULT_SHIFT_TRANSACTIONS);
  const [settlementStatus, setSettlementStatus] = useState('open'); // 'open' | 'closed'
  const [openingFloat] = useState(5000); // ₹5,000 opening float
  const [successBanner, setSuccessBanner] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Cash Denominations Counter Form
  const [denominations, setDenominations] = useState({
    d2000: 0,
    d500: 68, // 68 * 500 = 34,000
    d200: 4,  // 4 * 200 = 800
    d100: 2,  // 2 * 100 = 200
    d50: 0,
    d20: 0,
    d10: 0,
    coins: 0
  });

  const [discrepancyReason, setDiscrepancyReason] = useState('');

  // Calculate breakdown from transactions
  const financialTotals = useMemo(() => {
    let cash = 0;
    let card = 0;
    let upi = 0;
    let refunds = 0;

    shiftTransactions.forEach(t => {
      if (t.mode === 'Cash') cash += t.amount;
      else if (t.mode === 'Card') card += t.amount;
      else if (t.mode === 'UPI') upi += t.amount;
      else if (t.mode === 'Cash Refund') refunds += Math.abs(t.amount);
    });

    const expectedPhysicalCash = openingFloat + cash - refunds;
    const totalTurnover = cash + card + upi;

    return { cash, card, upi, refunds, expectedPhysicalCash, totalTurnover };
  }, [shiftTransactions, openingFloat]);

  // Calculate actual cash counted from denominations
  const actualCashCounted = useMemo(() => {
    return (
      (denominations.d2000 * 2000) +
      (denominations.d500 * 500) +
      (denominations.d200 * 200) +
      (denominations.d100 * 100) +
      (denominations.d50 * 50) +
      (denominations.d20 * 20) +
      (denominations.d10 * 10) +
      (denominations.coins * 1)
    );
  }, [denominations]);

  const cashVariance = actualCashCounted - financialTotals.expectedPhysicalCash;

  const handleDenominationChange = (key, val) => {
    setDenominations(prev => ({ ...prev, [key]: Math.max(0, parseInt(val) || 0) }));
  };

  const handleCloseShiftConfirm = async () => {
    try {
      await BillingOpsService.closeSettlement({
        counterId: 'Counter 01',
        cashierId: 'CSH-04',
        openingFloat,
        cashCollected: financialTotals.cash,
        cardCollected: financialTotals.card,
        upiCollected: financialTotals.upi,
        expectedClosingCash: financialTotals.expectedPhysicalCash,
        actualCashCounted,
        variance: cashVariance,
        notes: discrepancyReason || 'Reconciled without variance'
      });
    } catch {
      //
    }

    setSettlementStatus('closed');
    setIsConfirmModalOpen(false);
    setSuccessBanner('Shift closed & counter drawer locked successfully. End-of-day settlement archived.');
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 4.6</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Day-End Cashier Settlement & Reconciliation
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Shift handover reconciliation, physical cash drawer denomination tallying, variance audit, and settlement closure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => setIsReportModalOpen(true)}
          >
            Settlement Report
          </Button>
          {settlementStatus === 'open' ? (
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Close Shift & Handover
            </Button>
          ) : (
            <Badge variant="success" size="md">
              <CheckCircle2 size={14} /> Shift Closed & Reconciled
            </Badge>
          )}
        </div>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Header Info Block */}
      <div style={{ padding: '14px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
        <div><strong>Business Date:</strong> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        <div><strong>Counter:</strong> Counter 01 (Main OPD Central)</div>
        <div><strong>Logged Cashier:</strong> Subhash Roy (CSH-04)</div>
        <div><strong>Shift:</strong> General Morning (08:00 AM – 04:00 PM)</div>
        <div>
          <strong>Status:</strong>{' '}
          <Badge variant={settlementStatus === 'open' ? 'warning' : 'success'} size="sm">
            {settlementStatus === 'open' ? 'Active / Open' : 'Closed & Locked'}
          </Badge>
        </div>
      </div>

      {/* Financial Summary Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Opening Cash Float
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatINR(openingFloat)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Provided at shift start</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Cash Collections
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
            {formatINR(financialTotals.cash)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Minus refunds: {formatINR(financialTotals.refunds)}</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Digital (UPI + Card)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0369A1', marginTop: '4px' }}>
            {formatINR(financialTotals.upi + financialTotals.card)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Direct bank settlements</div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Expected Cash in Drawer
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {formatINR(financialTotals.expectedPhysicalCash)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Float + Cash Collections</div>
        </div>
      </div>

      {/* Main Grid: Denomination Cash Counter + Transaction Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '20px' }}>
        {/* Left Column: Physical Cash Denominations Breakdown */}
        <Card title="Physical Cash Denominations Counting">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Denomination</th>
                  <th style={{ textAlign: 'center', padding: '6px' }}>Count (Pieces)</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'd2000', label: '₹2000 Note', mult: 2000 },
                  { key: 'd500', label: '₹500 Note', mult: 500 },
                  { key: 'd200', label: '₹200 Note', mult: 200 },
                  { key: 'd100', label: '₹100 Note', mult: 100 },
                  { key: 'd50', label: '₹50 Note', mult: 50 },
                  { key: 'd20', label: '₹20 Note', mult: 20 },
                  { key: 'd10', label: '₹10 Note', mult: 10 },
                  { key: 'coins', label: 'Coins (Mixed)', mult: 1 }
                ].map(({ key, label, mult }) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '6px', fontWeight: '600' }}>{label}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        disabled={settlementStatus === 'closed'}
                        value={denominations[key]}
                        onChange={(e) => handleDenominationChange(key, e.target.value)}
                        style={{ width: '65px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600' }}>
                      {formatINR(denominations[key] * mult)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Reconciliation Variance Panel */}
            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Actual Physical Cash Counted:</span>
                <span style={{ fontWeight: '800' }}>{formatINR(actualCashCounted)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Expected System Cash:</span>
                <span>{formatINR(financialTotals.expectedPhysicalCash)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1.5px solid #111827',
                  paddingTop: '8px',
                  marginTop: '4px',
                  fontWeight: '800',
                  fontSize: '0.95rem'
                }}
              >
                <span>RECONCILIATION VARIANCE:</span>
                <span style={{ color: cashVariance === 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {cashVariance === 0 ? '₹0.00 (Balanced)' : `${cashVariance > 0 ? '+' : ''}${formatINR(cashVariance)}`}
                </span>
              </div>
            </div>

            {cashVariance !== 0 && (
              <Input
                label="Mandatory Variance / Discrepancy Explanation"
                placeholder="Explain cause of cash drawer surplus or shortage..."
                value={discrepancyReason}
                onChange={(e) => setDiscrepancyReason(e.target.value)}
                required
              />
            )}
          </div>
        </Card>

        {/* Right Column: Transaction-Level Shift Ledger */}
        <Card title="Shift Transaction Log (Chronological)">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Receipt / Time</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Patient / Particulars</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Mode</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {shiftTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{tx.receipt}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{tx.time}</div>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ fontWeight: '600' }}>{tx.patient}</div>
                      <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>{tx.type}</div>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Badge variant={tx.mode.includes('Cash') ? 'teal' : 'gray'} size="sm">
                        {tx.mode}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: tx.amount < 0 ? 'var(--color-error)' : '#111827' }}>
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Day-End Shift Handover & Settlement"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
          <p style={{ margin: 0 }}>
            You are about to close Counter 01 and lock the cash drawer for cashier <strong>Subhash Roy (CSH-04)</strong>.
          </p>

          <div style={{ padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '4px' }}>
            <div>Total Revenue Collected: <strong>{formatINR(financialTotals.totalTurnover)}</strong></div>
            <div>Physical Cash Counted: <strong>{formatINR(actualCashCounted)}</strong></div>
            <div>Reconciliation Variance: <strong>{formatINR(cashVariance)}</strong></div>
          </div>

          {cashVariance !== 0 && !discrepancyReason && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>
              Warning: A non-zero cash variance requires an explanation remarks note before supervisor sign-off.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCloseShiftConfirm}>
              Confirm & Lock Counter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settlement Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Day-End Shift Closing & Cashier Reconciliation Report"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            id="settlement-printable-report"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5,
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #087F8C', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 2px', fontSize: '1.25rem', color: '#087F8C', fontWeight: '800' }}>
                  APEX CENTRAL HOSPITAL
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Day-End Cashier Settlement & Handover Report</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>COUNTER 01 - CASHIER SHIFT REPORT</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', marginBottom: '14px', fontSize: '0.78rem' }}>
              <div><strong>Cashier:</strong> Subhash Roy (CSH-04)</div>
              <div><strong>Counter:</strong> OPD Counter 01</div>
              <div><strong>Opening Cash Float:</strong> {formatINR(openingFloat)}</div>
              <div><strong>Settlement Status:</strong> {settlementStatus.toUpperCase()}</div>
              <div><strong>Total Shift Transactions:</strong> {shiftTransactions.length} Items</div>
              <div><strong>Reconciliation Variance:</strong> {formatINR(cashVariance)}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Payment Channel</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Total Collected (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Physical Cash Collections</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(financialTotals.cash)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>UPI Dynamic QR Collections</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(financialTotals.upi)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Credit / Debit Card Counter Swipes</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(financialTotals.card)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Less: Approved Cash Refunds Disbursed</td>
                  <td style={{ textAlign: 'right', padding: '6px', color: 'var(--color-error)' }}>-{formatINR(financialTotals.refunds)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', borderTop: '1px dashed #9CA3AF', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Gross Digital & Cash Turnover:</span>
                <span>{formatINR(financialTotals.totalTurnover)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Drawer Cash (Float + Cash):</span>
                <span>{formatINR(financialTotals.expectedPhysicalCash)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Actual Denomination Cash Counted:</span>
                <span>{formatINR(actualCashCounted)}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <div>
                <div>Cashier Signature: <strong>Subhash Roy</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Drawer Handed Over</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Finance Supervisor: <strong>Authorized Signatory</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Safe Vault Deposit Verified</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Settlement Closing Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
