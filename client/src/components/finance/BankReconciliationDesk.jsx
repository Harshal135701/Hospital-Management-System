import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Plus,
  Printer
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { formatINR, formatDateIN } from '../../utils/formatters';
import { HOSPITAL_BANK_ACCOUNTS } from './financeConstants';

export function BankReconciliationDesk({
  bankReconciliations,
  onToggleReconciledItem,
  onAutoMatchBank,
  onAddBankAdjustment
}) {
  const [selectedAccountId, setSelectedAccountId] = useState('hdfc_oper');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'matched'

  // Modals state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isBrsCertificateOpen, setIsBrsCertificateOpen] = useState(false);

  // Adjustment Form
  const [adjForm, setAdjForm] = useState(() => ({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    type: 'debit', // debit = charge, credit = inward credit
    amount: '',
    ref: ''
  }));
  const [adjError, setAdjError] = useState('');

  // Active Account Bank Data
  const activeBankData = useMemo(() => {
    return bankReconciliations[selectedAccountId] || bankReconciliations.hdfc_oper;
  }, [bankReconciliations, selectedAccountId]);

  const activeAccountMeta = useMemo(() => {
    return HOSPITAL_BANK_ACCOUNTS.find(a => a.id === selectedAccountId) || HOSPITAL_BANK_ACCOUNTS[0];
  }, [selectedAccountId]);

  // BRS Mathematical Summary Calculation
  const brsSummary = useMemo(() => {
    const bookBal = activeBankData.bookBalance || 0;
    const stmtBal = activeBankData.statementBalance || 0;

    let unpresentedCheques = 0;
    let directCredits = 0;
    let bankCharges = 0;

    (activeBankData.transactions || []).forEach(tx => {
      if (tx.status === 'unpresented_cheque' && !tx.bookMatched) {
        unpresentedCheques += tx.amount;
      } else if (tx.status === 'direct_bank_credit' && !tx.bookMatched) {
        directCredits += tx.amount;
      } else if (tx.status === 'bank_charges' && !tx.bookMatched) {
        bankCharges += tx.amount;
      }
    });

    const calculatedTarget = bookBal + directCredits - unpresentedCheques - bankCharges;
    const variance = Math.abs(stmtBal - calculatedTarget);
    const isReconciled = variance === 0;

    return {
      bookBal,
      stmtBal,
      unpresentedCheques,
      directCredits,
      bankCharges,
      calculatedTarget,
      variance,
      isReconciled
    };
  }, [activeBankData]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return (activeBankData.transactions || []).filter(tx => {
      if (filterMode === 'pending') return !tx.bookMatched;
      if (filterMode === 'matched') return tx.bookMatched;
      return true;
    });
  }, [activeBankData, filterMode]);

  // Submit Adjustment
  const handleAdjSubmit = (e) => {
    e.preventDefault();
    setAdjError('');

    const amt = parseFloat(adjForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setAdjError('Please enter a valid adjustment amount.');
      return;
    }
    if (!adjForm.description.trim()) {
      setAdjError('Adjustment description is required.');
      return;
    }

    onAddBankAdjustment(selectedAccountId, {
      date: adjForm.date,
      description: adjForm.description.trim(),
      type: adjForm.type,
      amount: amt,
      ref: adjForm.ref.trim() || `ADJ/${Date.now().toString().slice(-6)}`,
      status: 'matched',
      bookMatched: true
    });

    setIsAdjustmentModalOpen(false);
    setAdjForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      type: 'debit',
      amount: '',
      ref: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Bank Account Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {HOSPITAL_BANK_ACCOUNTS.map((acc) => {
          const isSelected = selectedAccountId === acc.id;
          const bankData = bankReconciliations[acc.id];
          const hasPending = (bankData?.transactions || []).some(t => !t.bookMatched);

          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => setSelectedAccountId(acc.id)}
              style={{
                flex: '1 1 240px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                border: `2px solid ${isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                boxShadow: isSelected ? '0 3px 10px rgba(8, 127, 140, 0.12)' : 'var(--shadow-subtle)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '800', color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                  {acc.bankName}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>
                  A/c {acc.accountNumber}
                </div>
                <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {acc.accountType}
                </div>
              </div>
              <div>
                {hasPending ? (
                  <Badge variant="warning" size="sm">Variance</Badge>
                ) : (
                  <Badge variant="success" size="sm">Balanced</Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 5 BRS Formula Status Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Balance as per Hospital Books */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Balance per Books (GL)
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>GL #{activeAccountMeta.glCode}</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(brsSummary.bookBal)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Hospital General Ledger cashbook balance
          </span>
        </div>

        {/* Unpresented Cheques */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase' }}>
              Unpresented Cheques
            </span>
            <Badge variant="warning">Less</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#D97706' }}>
            {formatINR(brsSummary.unpresentedCheques)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Cheques issued to vendors not yet presented
          </span>
        </div>

        {/* Direct Bank Credits */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Direct Bank Credits
            </span>
            <Badge variant="success">Add</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {formatINR(brsSummary.directCredits)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            TPA electronic claim settlements in bank passbook
          </span>
        </div>

        {/* Balance as per Bank Statement */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>
              Bank Statement Balance
            </span>
            <Badge variant="teal">Passbook</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(brsSummary.stmtBal)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Confirmed closing balance per bank feed
          </span>
        </div>

        {/* Reconciliation Status / Variance */}
        <div
          style={{
            backgroundColor: brsSummary.isReconciled ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1.5px solid ${brsSummary.isReconciled ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: brsSummary.isReconciled ? 'var(--color-success)' : '#D97706', textTransform: 'uppercase' }}>
              Reconciliation Variance
            </span>
            <Badge variant={brsSummary.isReconciled ? 'success' : 'warning'}>
              {brsSummary.isReconciled ? 'Reconciled' : 'Discrepancy'}
            </Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: brsSummary.isReconciled ? 'var(--color-success)' : '#D97706' }}>
            {formatINR(brsSummary.variance)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            {brsSummary.isReconciled ? '✓ Bank & Hospital Books 100% Balanced' : 'Action Required: Match or Post Entry'}
          </span>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Bank Statement vs. Hospital Cashbook Transactions
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                {activeAccountMeta.bankName} • Account #{activeAccountMeta.accountNumber} ({activeAccountMeta.branch})
              </p>
            </div>

            {/* Filter & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: filterMode === 'all' ? 'var(--color-primary-teal)' : '#FFFFFF',
                    color: filterMode === 'all' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('pending')}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: filterMode === 'pending' ? 'var(--color-primary-teal)' : '#FFFFFF',
                    color: filterMode === 'pending' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Unmatched Only
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('matched')}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: filterMode === 'matched' ? 'var(--color-primary-teal)' : '#FFFFFF',
                    color: filterMode === 'matched' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Matched
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => onAutoMatchBank(selectedAccountId)}
                title="Automatically match transactions with identical UTRs & amounts"
              >
                Auto-Match UTRs
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsAdjustmentModalOpen(true)}
              >
                Add Bank Adjustment
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => setIsBrsCertificateOpen(true)}
              >
                BRS Certificate
              </Button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center', width: '60px' }}>Match</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Transaction Ref / UTR</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Particulars / Bank Description</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Classification</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Debit (Dr)</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Credit (Cr)</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center' }}>Reconciliation</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No bank reconciliation transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'credit';
                    const isMatched = tx.bookMatched;

                    return (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                          backgroundColor: isMatched ? 'transparent' : '#FFFDF5',
                          transition: 'background-color 0.1s'
                        }}
                      >
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isMatched}
                            onChange={() => onToggleReconciledItem(selectedAccountId, tx.id)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary-teal)', cursor: 'pointer' }}
                            title="Click to toggle matched status in BRS"
                          />
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                          {formatDateIN(tx.date)}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                          {tx.ref}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{tx.description}</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              backgroundColor: tx.status === 'unpresented_cheque' ? '#FEF3C7' : tx.status === 'direct_bank_credit' ? '#ECFDF5' : '#EEF2FF',
                              color: tx.status === 'unpresented_cheque' ? '#B45309' : tx.status === 'direct_bank_credit' ? '#047857' : '#4338CA'
                            }}
                          >
                            {tx.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: !isCredit ? '700' : 'normal', color: !isCredit ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                          {!isCredit ? formatINR(tx.amount) : '-'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: isCredit ? '700' : 'normal', color: isCredit ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          {isCredit ? formatINR(tx.amount) : '-'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <Badge variant={isMatched ? 'success' : 'warning'} size="sm">
                            {isMatched ? 'Matched' : 'Unmatched'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal 1: Add Bank Adjustment Entry */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Add Bank Adjustment / Direct Entry"
        subtitle={`Post direct passbook charges or interest for ${activeAccountMeta.bankName}`}
        maxWidth="540px"
      >
        <form onSubmit={handleAdjSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {adjError && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error-border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem'
              }}
            >
              {adjError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Adjustment Nature"
              required
              value={adjForm.type}
              onChange={(e) => setAdjForm({ ...adjForm, type: e.target.value })}
              options={[
                { value: 'debit', label: 'Debit (Bank Charge / POS Fee / Tax)' },
                { value: 'credit', label: 'Credit (Direct Deposit / Interest)' }
              ]}
            />
            <Input
              label="Transaction Date"
              type="date"
              required
              value={adjForm.date}
              onChange={(e) => setAdjForm({ ...adjForm, date: e.target.value })}
            />
          </div>

          <Input
            label="Transaction Description"
            placeholder="e.g. Monthly POS Merchant Gateway terminal charges"
            required
            value={adjForm.description}
            onChange={(e) => setAdjForm({ ...adjForm, description: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="0.00"
              required
              value={adjForm.amount}
              onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
            />
            <Input
              label="Bank Reference / Advice No."
              placeholder="e.g. CHRG/OCT-2026"
              value={adjForm.ref}
              onChange={(e) => setAdjForm({ ...adjForm, ref: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" onClick={() => setIsAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post to Statement Feed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: BRS Certificate Print Modal */}
      <Modal
        isOpen={isBrsCertificateOpen}
        onClose={() => setIsBrsCertificateOpen(false)}
        title="Official Bank Reconciliation Statement (BRS)"
        subtitle="Internal Audit & Statutory Accounting Verification Statement"
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: '#FFFFFF'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  MEDICSPRIME MULTI-SPECIALTY HOSPITAL
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Bank Reconciliation Statement (BRS) as on {formatDateIN(activeBankData.statementDate)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge variant={brsSummary.isReconciled ? 'success' : 'warning'}>
                  {brsSummary.isReconciled ? 'RECONCILED & BALANCED' : 'RECONCILIATION IN PROGRESS'}
                </Badge>
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.84rem', marginBottom: '16px' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Bank Name: </span>
                <strong>{activeAccountMeta.bankName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Account Number: </span>
                <strong style={{ fontFamily: 'monospace' }}>{activeAccountMeta.accountNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>Branch & IFSC: </span>
                <strong>{activeAccountMeta.branch} ({activeAccountMeta.ifsc})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>GL Account Code: </span>
                <strong>#{activeAccountMeta.glCode} - Bank Asset</strong>
              </div>
            </div>

            {/* Structured BRS Computation Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #E2E8F0',
                fontSize: '0.86rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0', fontWeight: '700' }}>
                <span>Balance as per Hospital Books (Cashbook):</span>
                <span>{formatINR(brsSummary.bookBal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #E2E8F0', color: 'var(--color-success)' }}>
                <span>Add: Direct Credits in Bank Statement (Not in Books):</span>
                <span>+ {formatINR(brsSummary.directCredits)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #E2E8F0', color: '#D97706' }}>
                <span>Less: Cheques Issued but Not Yet Presented for Payment:</span>
                <span>- {formatINR(brsSummary.unpresentedCheques)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #E2E8F0', color: 'var(--color-error)' }}>
                <span>Less: Bank / POS Gateway Charges Not Booked:</span>
                <span>- {formatINR(brsSummary.bankCharges)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                <span>Balance as per Bank Statement (Passbook):</span>
                <span>{formatINR(brsSummary.stmtBal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', fontSize: '0.9rem', fontWeight: '700', color: brsSummary.isReconciled ? 'var(--color-success)' : '#D97706' }}>
                <span>Net Unreconciled Variance:</span>
                <span>{formatINR(brsSummary.variance)}</span>
              </div>
            </div>

            {/* Certification Statement */}
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              I hereby certify that the bank balances and general ledger accounts of MedicsPrime Hospital have been verified against external banking data feeds, and all reconciling items have been identified and posted in accordance with statutory accounting standards.
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
              <div>
                <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Finance Manager / Cashier
                </div>
              </div>
              <div>
                <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                  Chief Financial Officer / Statutory Auditor
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsBrsCertificateOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                window.print();
              }}
            >
              Print BRS Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
