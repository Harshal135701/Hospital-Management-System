import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Printer,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { formatINR, formatDateIN } from '../../utils/formatters';
import { VOUCHER_TYPES, VOUCHER_STATUSES, PAYMENT_MODES } from './financeConstants';

export function VouchersDesk({
  vouchers,
  accounts,
  onCreateVoucher,
  onUpdateVoucherStatus
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

  // New Voucher Form
  const [form, setForm] = useState(() => ({
    type: 'payment',
    date: new Date().toISOString().slice(0, 10),
    entityName: '',
    department: 'Pharmacy & Surgical Stores',
    accountCode: '2010',
    amount: '',
    tdsRate: '0',
    paymentMode: 'neft_rtgs',
    referenceNo: '',
    authorizedBy: 'Medical Director / CFO',
    narration: ''
  }));
  const [formError, setFormError] = useState('');

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    let totalDebitDisbursed = 0;
    let totalCreditReceived = 0;
    let pendingApprovalCount = 0;
    let pendingApprovalValue = 0;
    let counterCash = 0;

    vouchers.forEach(v => {
      if (v.status === 'cancelled') return;

      if (v.type === 'payment' && (v.status === 'paid' || v.status === 'approved')) {
        totalDebitDisbursed += v.netAmount || v.amount;
      }
      if (v.type === 'receipt' && (v.status === 'paid' || v.status === 'approved')) {
        totalCreditReceived += v.netAmount || v.amount;
      }
      if (v.status === 'pending') {
        pendingApprovalCount++;
        pendingApprovalValue += v.netAmount || v.amount;
      }
      if (v.type === 'contra' || v.paymentMode === 'cash') {
        counterCash += v.amount;
      }
    });

    return {
      totalDebitDisbursed,
      totalCreditReceived,
      pendingApprovalCount,
      pendingApprovalValue,
      counterCash
    };
  }, [vouchers]);

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesSearch =
        v.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.referenceNo && v.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.narration && v.narration.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'all' || v.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vouchers, searchQuery, selectedType, selectedStatus]);

  // Dynamic TDS and Net Amount in Form
  const calculatedTds = useMemo(() => {
    const gross = parseFloat(form.amount) || 0;
    const rate = parseFloat(form.tdsRate) || 0;
    return (gross * rate) / 100;
  }, [form.amount, form.tdsRate]);

  const calculatedNet = useMemo(() => {
    const gross = parseFloat(form.amount) || 0;
    return gross - calculatedTds;
  }, [form.amount, calculatedTds]);

  // Form Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.entityName.trim()) {
      setFormError('Payee / Beneficiary / Payer Name is required.');
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid positive voucher amount.');
      return;
    }
    if (!form.narration.trim()) {
      setFormError('Clinical/Operational Narration is required for voucher audit.');
      return;
    }

    const matchedAccount = accounts.find(a => a.code === form.accountCode);
    const prefix = form.type === 'payment' ? 'PV' : form.type === 'receipt' ? 'RV' : 'CV';
    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const newVoucherNo = `${prefix}-2026-${randNum}`;

    const newVoucher = {
      id: `vch-${Date.now()}`,
      voucherNo: newVoucherNo,
      type: form.type,
      date: form.date,
      entityName: form.entityName.trim(),
      department: form.department,
      accountCode: form.accountCode,
      accountName: matchedAccount ? matchedAccount.name : 'General Hospital Account',
      amount: amt,
      tdsAmount: calculatedTds,
      netAmount: calculatedNet,
      paymentMode: form.paymentMode,
      referenceNo: form.referenceNo.trim() || `${form.paymentMode.toUpperCase()}/TXN-${randNum}`,
      status: 'approved',
      authorizedBy: form.authorizedBy,
      narration: form.narration.trim()
    };

    onCreateVoucher(newVoucher);
    setIsCreateModalOpen(false);
    setForm({
      type: 'payment',
      date: new Date().toISOString().slice(0, 10),
      entityName: '',
      department: 'Pharmacy & Surgical Stores',
      accountCode: '2010',
      amount: '',
      tdsRate: '0',
      paymentMode: 'neft_rtgs',
      referenceNo: '',
      authorizedBy: 'Medical Director / CFO',
      narration: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Financial Voucher Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Debit Disbursed */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-error)', textTransform: 'uppercase' }}>
              Total Disbursed (Debit)
            </span>
            <span style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Payments
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(stats.totalDebitDisbursed)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Vendor bills, doctor fees, O2 gases & staff payments
          </span>
        </div>

        {/* Credit Receipts */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Total Receipts (Credit)
            </span>
            <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Receipts
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {formatINR(stats.totalCreditReceived)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            TPA electronic settlements & institutional advances
          </span>
        </div>

        {/* Pending Verification */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase' }}>
              Pending Verification
            </span>
            <Badge variant="warning">{stats.pendingApprovalCount} Vouchers</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(stats.pendingApprovalValue)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Awaiting Medical Superintendent / CFO sign-off
          </span>
        </div>

        {/* Cash Office Imprest */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Counter Cash Flow
            </span>
            <Badge variant="teal">Cash Desks</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {formatINR(stats.counterCash)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Cashier collection remittances & petty cash imprest
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Search */}
            <div style={{ flex: '1 1 240px', maxWidth: '340px' }}>
              <Input
                placeholder="Search voucher #, payee, UTR, dept..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)'
                }}
              >
                {VOUCHER_TYPES.map(vt => (
                  <option key={vt.id} value={vt.id}>{vt.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid / Cleared</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Verification</option>
                <option value="cancelled">Cancelled / Void</option>
              </select>
            </div>

            {/* New Voucher Button */}
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Payment Voucher
            </Button>
          </div>

          {/* Vouchers Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Voucher Ref</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Type</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Beneficiary / Payee</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Net Amount</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Payment Mode</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No payment or receipt vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((vch) => {
                    const statusObj = VOUCHER_STATUSES[vch.status] || VOUCHER_STATUSES.pending;
                    const isDebit = vch.type === 'payment';

                    return (
                      <tr
                        key={vch.id}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                          {vch.voucherNo}
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                          {formatDateIN(vch.date)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              backgroundColor: isDebit ? 'var(--color-error-bg)' : vch.type === 'receipt' ? 'var(--color-success-bg)' : 'var(--color-bg-pale-aqua)',
                              color: isDebit ? 'var(--color-error)' : vch.type === 'receipt' ? 'var(--color-success)' : 'var(--color-primary-teal)'
                            }}
                          >
                            {isDebit ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                            {vch.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{vch.entityName}</div>
                          {vch.narration && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {vch.narration}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {vch.department}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: isDebit ? 'var(--color-text-primary)' : 'var(--color-success)' }}>
                          {formatINR(vch.netAmount || vch.amount)}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{vch.paymentMode.replace('_', ' ').toUpperCase()}</div>
                          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{vch.referenceNo}</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <Badge variant={statusObj.variant} size="sm">
                            {statusObj.label}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {vch.status === 'pending' && (
                              <button
                                type="button"
                                title="Approve & Clear Voucher"
                                onClick={() => onUpdateVoucherStatus(vch.id, 'paid')}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-success-bg)',
                                  color: 'var(--color-success)',
                                  border: '1px solid var(--color-success-border)',
                                  fontSize: '0.74rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              type="button"
                              title="Print Official Voucher Slip"
                              onClick={() => setSelectedVoucherForPrint(vch)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#FFFFFF',
                                color: 'var(--color-primary-teal)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.74rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Printer size={12} />
                              <span>Slip</span>
                            </button>
                            {vch.status !== 'cancelled' && (
                              <button
                                type="button"
                                title="Cancel Voucher"
                                onClick={() => onUpdateVoucherStatus(vch.id, 'cancelled')}
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-text-muted)',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
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

      {/* Modal: Create Voucher */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Debit / Credit Payment Voucher"
        subtitle="Official hospital cash, bank, or vendor disbursement voucher entry"
        maxWidth="620px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && (
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
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Voucher Classification"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'payment', label: 'Payment Voucher (Debit / Outward)' },
                { value: 'receipt', label: 'Receipt Voucher (Credit / Inward)' },
                { value: 'contra', label: 'Contra Voucher (Cash to Bank / Transfer)' }
              ]}
            />
            <Input
              label="Voucher Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
            <Input
              label={form.type === 'payment' ? 'Payee / Vendor / Doctor Name' : 'Payer / Insurer / Patient Name'}
              placeholder="e.g. Cipla Pharma Ltd. or Star Health TPA"
              required
              value={form.entityName}
              onChange={(e) => setForm({ ...form, entityName: e.target.value })}
            />
            <Select
              label="Hospital Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              options={[
                { value: 'Pharmacy & Surgical Stores', label: 'Pharmacy & Stores' },
                { value: 'Operation Theatre', label: 'Operation Theatre (OT)' },
                { value: 'Reproductive Medicine / IVF', label: 'IVF & Embryology' },
                { value: 'Emergency & Trauma Care', label: 'Emergency Casualty' },
                { value: 'Radiology & Imaging', label: 'Radiology & Imaging' },
                { value: 'Corporate TPA Billing', label: 'Corporate & TPA' },
                { value: 'Engineering & Maintenance', label: 'Facilities & O2 Gases' },
                { value: 'Administration & Accounts', label: 'Administration' }
              ]}
            />
          </div>

          <Select
            label="General Ledger Account Head"
            required
            value={form.accountCode}
            onChange={(e) => setForm({ ...form, accountCode: e.target.value })}
            options={accounts.map(a => ({
              value: a.code,
              label: `${a.code} - ${a.name} (${a.category.toUpperCase()})`
            }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Gross Amount (₹)"
              type="number"
              placeholder="0.00"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Select
              label="TDS Withholding"
              value={form.tdsRate}
              onChange={(e) => setForm({ ...form, tdsRate: e.target.value })}
              options={[
                { value: '0', label: '0% (Nil TDS)' },
                { value: '1', label: '1% (Sec 194C Indiv)' },
                { value: '2', label: '2% (Sec 194C Corp)' },
                { value: '10', label: '10% (Sec 194J Doctor)' }
              ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                Net Payable (₹)
              </label>
              <div
                style={{
                  padding: '9px 12px',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  color: 'var(--color-primary-teal)',
                  border: '1.5px solid rgba(8, 127, 140, 0.2)'
                }}
              >
                {formatINR(calculatedNet)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Payment / Settlement Mode"
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              options={PAYMENT_MODES}
            />
            <Input
              label="Cheque / UTR / Reference No."
              placeholder="e.g. UTR #HDFCR520261023910"
              value={form.referenceNo}
              onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
            />
          </div>

          <Input
            label="Detailed Audit Narration"
            placeholder="e.g. Cleared payment against purchase invoice #INV-4912 for laparoscopic trocars"
            required
            value={form.narration}
            onChange={(e) => setForm({ ...form, narration: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate & Post Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Official Voucher Slip / Print Remittance */}
      <Modal
        isOpen={Boolean(selectedVoucherForPrint)}
        onClose={() => setSelectedVoucherForPrint(null)}
        title="Official Hospital Financial Voucher"
        subtitle="MedicsPrime Healthcare Systems - Internal Financial Record"
        maxWidth="680px"
      >
        {selectedVoucherForPrint && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Hospital Header Slip */}
            <div
              style={{
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-teal)', letterSpacing: '-0.02em' }}>
                    MEDICSPRIME MULTI-SPECIALTY HOSPITAL
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Plot 14, Health City Enclave, Mumbai - 400001 | GSTIN: 27AABCM9102K1Z9
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    {selectedVoucherForPrint.voucherNo}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                    Date: {formatDateIN(selectedVoucherForPrint.date)}
                  </div>
                </div>
              </div>

              {/* Voucher Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.84rem', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Voucher Classification: </span>
                  <strong style={{ textTransform: 'uppercase', color: 'var(--color-primary-teal)' }}>
                    {selectedVoucherForPrint.type} VOUCHER
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Department: </span>
                  <strong>{selectedVoucherForPrint.department}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Payee / Beneficiary: </span>
                  <strong style={{ fontSize: '0.92rem' }}>{selectedVoucherForPrint.entityName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Debit / Credit Account Head: </span>
                  <strong>{selectedVoucherForPrint.accountName} (#{selectedVoucherForPrint.accountCode})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Payment Mode: </span>
                  <strong style={{ textTransform: 'uppercase' }}>{selectedVoucherForPrint.paymentMode.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Transaction Ref / UTR: </span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedVoucherForPrint.referenceNo}</strong>
                </div>
              </div>

              {/* Amount Breakdown Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid rgba(8, 127, 140, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--color-border)' }}>
                  <span>Gross Voucher Amount:</span>
                  <strong>{formatINR(selectedVoucherForPrint.amount)}</strong>
                </div>
                {selectedVoucherForPrint.tdsAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border)', color: 'var(--color-error)' }}>
                    <span>Less: Statutory TDS Withholding:</span>
                    <strong>- {formatINR(selectedVoucherForPrint.tdsAmount)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '1.15rem', color: 'var(--color-primary-teal)' }}>
                  <strong>Net Disbursed / Received:</strong>
                  <strong>{formatINR(selectedVoucherForPrint.netAmount || selectedVoucherForPrint.amount)}</strong>
                </div>
              </div>

              {/* Narration */}
              <div style={{ fontSize: '0.82rem', marginBottom: '24px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Purpose / Narration: </span>
                <span style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
                  "{selectedVoucherForPrint.narration}"
                </span>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '28px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                <div>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Prepared By (Cashier)
                  </div>
                </div>
                <div>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Verified By (Senior Accountant)
                  </div>
                </div>
                <div>
                  <div style={{ height: '30px' }}></div>
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                    Authorized Signatory (CFO / MD)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setSelectedVoucherForPrint(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Voucher Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
