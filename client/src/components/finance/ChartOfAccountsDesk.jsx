import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { formatINR, formatDateIN } from '../../utils/formatters';
import { ACCOUNT_CATEGORIES } from './financeConstants';

export function ChartOfAccountsDesk({
  accounts,
  journalEntries,
  onAddAccount,
  onPostJournalEntry
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    category: 'asset',
    subType: 'Current Asset',
    balance: '',
    normalBalance: 'debit',
    description: ''
  });
  const [accountFormError, setAccountFormError] = useState('');

  const [journalForm, setJournalForm] = useState(() => ({
    date: new Date().toISOString().slice(0, 10),
    voucherNo: `JV-2026-${String(Math.floor(100 + Math.random() * 900))}`,
    debitAccountCode: '',
    creditAccountCode: '',
    amount: '',
    narration: ''
  }));
  const [journalFormError, setJournalFormError] = useState('');

  // Category Summaries
  const summaries = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpense = 0;

    accounts.forEach(acc => {
      if (acc.category === 'asset') totalAssets += acc.balance;
      else if (acc.category === 'liability') totalLiabilities += acc.balance;
      else if (acc.category === 'equity') totalEquity += acc.balance;
      else if (acc.category === 'revenue') totalRevenue += acc.balance;
      else if (acc.category === 'expense') totalExpense += acc.balance;
    });

    return { totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpense };
  }, [accounts]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchesSearch =
        acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.description && acc.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || acc.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [accounts, searchQuery, selectedCategory]);

  // Handle Add Account Submit
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setAccountFormError('');

    if (!accountForm.code.trim()) {
      setAccountFormError('Account Code is required.');
      return;
    }
    if (accounts.some(a => a.code.trim() === accountForm.code.trim())) {
      setAccountFormError(`Account Code ${accountForm.code} already exists.`);
      return;
    }
    if (!accountForm.name.trim()) {
      setAccountFormError('Account Name is required.');
      return;
    }

    const newAcc = {
      code: accountForm.code.trim(),
      name: accountForm.name.trim(),
      category: accountForm.category,
      subType: accountForm.subType,
      balance: parseFloat(accountForm.balance) || 0,
      normalBalance: accountForm.category === 'asset' || accountForm.category === 'expense' ? 'debit' : 'credit',
      description: accountForm.description.trim() || 'Custom hospital account head',
      isSystem: false
    };

    onAddAccount(newAcc);
    setIsAddAccountModalOpen(false);
    setAccountForm({
      code: '',
      name: '',
      category: 'asset',
      subType: 'Current Asset',
      balance: '',
      normalBalance: 'debit',
      description: ''
    });
  };

  // Handle Post Journal Entry Submit
  const handleJournalSubmit = (e) => {
    e.preventDefault();
    setJournalFormError('');

    if (!journalForm.debitAccountCode) {
      setJournalFormError('Please select a Debit Account Head.');
      return;
    }
    if (!journalForm.creditAccountCode) {
      setJournalFormError('Please select a Credit Account Head.');
      return;
    }
    if (journalForm.debitAccountCode === journalForm.creditAccountCode) {
      setJournalFormError('Debit and Credit Account cannot be the same.');
      return;
    }
    const amt = parseFloat(journalForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setJournalFormError('Please enter a valid positive Amount (₹).');
      return;
    }
    if (!journalForm.narration.trim()) {
      setJournalFormError('Clinical / Financial Narration is required for audit trail.');
      return;
    }

    const debitAcc = accounts.find(a => a.code === journalForm.debitAccountCode);
    const creditAcc = accounts.find(a => a.code === journalForm.creditAccountCode);

    onPostJournalEntry({
      date: journalForm.date,
      voucherNo: journalForm.voucherNo,
      debitAcc,
      creditAcc,
      amount: amt,
      narration: journalForm.narration.trim()
    });

    setIsJournalModalOpen(false);
    setJournalForm({
      date: new Date().toISOString().slice(0, 10),
      voucherNo: `JV-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      debitAccountCode: '',
      creditAccountCode: '',
      amount: '',
      narration: ''
    });
  };

  // Ledger entries for the modal
  const activeLedgerEntries = useMemo(() => {
    if (!selectedAccountForLedger) return [];
    return journalEntries.filter(
      entry => entry.accountCode === selectedAccountForLedger.code
    );
  }, [selectedAccountForLedger, journalEntries]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Category Financial Overview Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Assets */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Total Assets (1000s)
            </span>
            <Badge variant="teal">Asset Heads</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(summaries.totalAssets)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Fixed Scanners, Infrastructure & Bank Balances
          </span>
        </div>

        {/* Liabilities */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#D97706', textTransform: 'uppercase' }}>
              Total Liabilities (2000s)
            </span>
            <Badge variant="warning">Payables & Loans</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(summaries.totalLiabilities)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Pharma Payables, TDS Due & Bank Term Loans
          </span>
        </div>

        {/* Operating Revenue */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Hospital Revenue (4000s)
            </span>
            <Badge variant="success">Income</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {formatINR(summaries.totalRevenue)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            IPD, OT, OPD, Labs, Imaging & Pharmacy
          </span>
        </div>

        {/* Operating Expenses */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-error)', textTransform: 'uppercase' }}>
              Operating Expenses (5000s)
            </span>
            <Badge variant="danger">Expenses</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(summaries.totalExpense)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Doctor Payouts, Payroll, Power & O2 Gases
          </span>
        </div>

        {/* Net Hospital Surplus */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-pale-aqua)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1.5px solid rgba(8, 127, 140, 0.3)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Operating Surplus
            </span>
            <Badge variant="teal">Net Margin</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {formatINR(summaries.totalRevenue - summaries.totalExpense)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            {summaries.totalRevenue > 0
              ? `${(((summaries.totalRevenue - summaries.totalExpense) / summaries.totalRevenue) * 100).toFixed(1)}% Operational Margin`
              : 'Break-even'}
          </span>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Actions */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Search Input */}
            <div style={{ flex: '1 1 260px', maxWidth: '380px' }}>
              <Input
                placeholder="Search account code, name, description..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ACCOUNT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: `1.5px solid ${isActive ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                      backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={FileSpreadsheet}
                onClick={() => setIsJournalModalOpen(true)}
              >
                Post Journal Entry (JV)
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddAccountModalOpen(true)}
              >
                Add Account Head
              </Button>
            </div>
          </div>

          {/* Accounts Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Code</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Account Head Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Classification</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Sub-Type</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)', textAlign: 'right' }}>Current Balance</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)', textAlign: 'center' }}>Nature</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-primary)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No hospital accounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => {
                    const categoryBadgeVariant = {
                      asset: 'teal',
                      liability: 'warning',
                      equity: 'info',
                      revenue: 'success',
                      expense: 'danger'
                    }[acc.category] || 'default';

                    return (
                      <tr
                        key={acc.code}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                          #{acc.code}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{acc.name}</div>
                          {acc.description && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              {acc.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <Badge variant={categoryBadgeVariant} size="sm">
                            {acc.category.toUpperCase()}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                          {acc.subType}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: acc.balance < 0 ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                          {formatINR(acc.balance, false)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: acc.normalBalance === 'debit' ? '#EEF2FF' : '#FEF3C7',
                              color: acc.normalBalance === 'debit' ? '#4338CA' : '#B45309'
                            }}
                          >
                            {acc.normalBalance.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedAccountForLedger(acc)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              color: 'var(--color-primary-teal)',
                              fontSize: '0.76rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Eye size={13} />
                            <span>View Ledger</span>
                          </button>
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

      {/* Modal 1: Add Account Head */}
      <Modal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        title="Add Hospital Account Head"
        subtitle="Create a new classification in the hospital chart of accounts hierarchy"
        maxWidth="540px"
      >
        <form onSubmit={handleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {accountFormError && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error-border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{accountFormError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Account Code"
              placeholder="e.g. 1070"
              required
              value={accountForm.code}
              onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
            />
            <Input
              label="Account Title"
              placeholder="e.g. Dialysis Consumables Inventory"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Account Category"
              required
              value={accountForm.category}
              onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
              options={[
                { value: 'asset', label: 'Asset (1000s)' },
                { value: 'liability', label: 'Liability (2000s)' },
                { value: 'equity', label: 'Equity & Capital (3000s)' },
                { value: 'revenue', label: 'Operating Revenue (4000s)' },
                { value: 'expense', label: 'Operating Expense (5000s)' }
              ]}
            />
            <Input
              label="Sub-Classification"
              placeholder="e.g. Current Asset / Direct Expense"
              value={accountForm.subType}
              onChange={(e) => setAccountForm({ ...accountForm, subType: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Opening Balance (₹)"
              type="number"
              placeholder="0.00"
              value={accountForm.balance}
              onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
            />
            <Select
              label="Normal Book Balance"
              value={accountForm.normalBalance}
              onChange={(e) => setAccountForm({ ...accountForm, normalBalance: e.target.value })}
              options={[
                { value: 'debit', label: 'Debit Balance (Dr)' },
                { value: 'credit', label: 'Credit Balance (Cr)' }
              ]}
            />
          </div>

          <Input
            label="Department / Scope Description"
            placeholder="e.g. Dedicated ledger for hemodialysis dialyzers and heparin consumables."
            value={accountForm.description}
            onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="ghost" onClick={() => setIsAddAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Account Head
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Post Journal Entry (JV) */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Post Manual Journal Entry (JV)"
        subtitle="Double-entry hospital accounting journal voucher with balanced debit and credit"
        maxWidth="600px"
      >
        <form onSubmit={handleJournalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {journalFormError && (
            <div
              style={{
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error-border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{journalFormError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Journal Voucher No."
              required
              value={journalForm.voucherNo}
              onChange={(e) => setJournalForm({ ...journalForm, voucherNo: e.target.value })}
            />
            <Input
              label="Transaction Date"
              type="date"
              required
              value={journalForm.date}
              onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })}
            />
          </div>

          {/* Debit Row */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>
              Debit Leg (Dr)
            </div>
            <Select
              label="Select Debit Account"
              required
              value={journalForm.debitAccountCode}
              onChange={(e) => setJournalForm({ ...journalForm, debitAccountCode: e.target.value })}
              options={[
                { value: '', label: '-- Select Debit Account Head --' },
                ...accounts.map(a => ({ value: a.code, label: `${a.code} - ${a.name} (${a.category.toUpperCase()})` }))
              ]}
            />
          </div>

          {/* Credit Row */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>
              Credit Leg (Cr)
            </div>
            <Select
              label="Select Credit Account"
              required
              value={journalForm.creditAccountCode}
              onChange={(e) => setJournalForm({ ...journalForm, creditAccountCode: e.target.value })}
              options={[
                { value: '', label: '-- Select Credit Account Head --' },
                ...accounts.map(a => ({ value: a.code, label: `${a.code} - ${a.name} (${a.category.toUpperCase()})` }))
              ]}
            />
          </div>

          <Input
            label="Transaction Amount (₹)"
            type="number"
            placeholder="0.00"
            required
            value={journalForm.amount}
            onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })}
          />

          <Input
            label="Narration / Clinical Audit Justification"
            placeholder="e.g. Monthly provision for biomedical maintenance and AMC charges"
            required
            value={journalForm.narration}
            onChange={(e) => setJournalForm({ ...journalForm, narration: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="ghost" onClick={() => setIsJournalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post to General Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: View General Ledger Detail Drawer */}
      <Modal
        isOpen={Boolean(selectedAccountForLedger)}
        onClose={() => setSelectedAccountForLedger(null)}
        title={selectedAccountForLedger ? `General Ledger: #${selectedAccountForLedger.code}` : 'General Ledger'}
        subtitle={selectedAccountForLedger?.name}
        maxWidth="750px"
      >
        {selectedAccountForLedger && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.2)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Account Classification</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'capitalize' }}>
                  {selectedAccountForLedger.category} ({selectedAccountForLedger.subType})
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Normal Balance Nature</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                  {selectedAccountForLedger.normalBalance} (Dr/Cr)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Current Ledger Balance</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {formatINR(selectedAccountForLedger.balance)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Recent Journal Audit Trail for this Account:
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                    <th style={{ padding: '8px 12px' }}>Voucher Ref</th>
                    <th style={{ padding: '8px 12px' }}>Narration</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No specific posted journal entries in current period. Opening balance is {formatINR(selectedAccountForLedger.balance)}.
                      </td>
                    </tr>
                  ) : (
                    activeLedgerEntries.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{formatDateIN(e.date)}</td>
                        <td style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>{e.voucherNo}</td>
                        <td style={{ padding: '8px 12px' }}>{e.narration}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: e.debit > 0 ? '700' : 'normal', color: e.debit > 0 ? '#1E293B' : 'var(--color-text-muted)' }}>
                          {e.debit > 0 ? formatINR(e.debit) : '-'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: e.credit > 0 ? '700' : 'normal', color: e.credit > 0 ? '#1E293B' : 'var(--color-text-muted)' }}>
                          {e.credit > 0 ? formatINR(e.credit) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedAccountForLedger(null)}>
                Close Ledger
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
