import React, { useState } from 'react';
import {
  Landmark,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  IndianRupee,
  Calendar,
  Percent,
  Download,
  Printer,
  ChevronRight,
  TrendingDown,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { DISALLOWANCE_CATEGORIES } from './creditBillingConstants';

export function TpaReconciliationDesk({
  reconciliations = [],
  onCreateReconciliation,
  onPostPayment
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agingFilter, setAgingFilter] = useState('all');

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Payment Post Form
  const [postForm, setPostForm] = useState({
    settled_amount: '',
    tds_deducted: '',
    disallowed_amount: 0,
    disallowance_category: 'mou_discount',
    disallowance_notes: '',
    action_taken: 'Accepted as MoU Tariff Discount',
    utr_number: '',
    settlement_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // New Reconciliation Form
  const [newForm, setNewForm] = useState({
    patient_name: 'Devendra Patil',
    uhid: 'UHID-2025-0992',
    dossier_number: 'DOS-2026-0055',
    bill_id: 'bill-final-910',
    tpa_name: 'Family Health Plan TPA (FHPL)',
    claim_amount: 95000,
    expected_amount: 95000,
    notes: 'Submitted for reconciliation post-discharge'
  });

  // Filtered List
  const filteredList = reconciliations.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tpa_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dossier_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.utr_number && item.utr_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    let matchesAging = true;
    if (agingFilter === '0-30') matchesAging = (item.aging_days || 0) <= 30;
    else if (agingFilter === '31-60') matchesAging = (item.aging_days || 0) > 30 && (item.aging_days || 0) <= 60;
    else if (agingFilter === '61-90') matchesAging = (item.aging_days || 0) > 60 && (item.aging_days || 0) <= 90;
    else if (agingFilter === '90+') matchesAging = (item.aging_days || 0) > 90;

    return matchesSearch && matchesStatus && matchesAging;
  });

  // KPI Metrics & Aging
  const totalReceivables = reconciliations.reduce((acc, curr) => acc + Number(curr.claim_amount || 0), 0);
  const totalSettled = reconciliations.reduce((acc, curr) => acc + Number(curr.settled_amount || 0), 0);
  const totalDisallowed = reconciliations.reduce((acc, curr) => acc + Number(curr.disallowed_amount || 0), 0);
  const totalTds = reconciliations.reduce((acc, curr) => acc + Number(curr.tds_deducted || 0), 0);

  // Aging Buckets
  const bucket0_30 = reconciliations.filter(r => (r.aging_days || 0) <= 30).reduce((a, c) => a + Number(c.claim_amount || 0), 0);
  const bucket31_60 = reconciliations.filter(r => (r.aging_days || 0) > 30 && (r.aging_days || 0) <= 60).reduce((a, c) => a + Number(c.claim_amount || 0), 0);
  const bucket61_90 = reconciliations.filter(r => (r.aging_days || 0) > 60 && (r.aging_days || 0) <= 90).reduce((a, c) => a + Number(c.claim_amount || 0), 0);
  const bucket90Plus = reconciliations.filter(r => (r.aging_days || 0) > 90).reduce((a, c) => a + Number(c.claim_amount || 0), 0);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const settled = Number(postForm.settled_amount);
    const tds = Number(postForm.tds_deducted || Math.round(settled * 0.1));
    const netCredit = settled - tds;

    onPostPayment(selectedItem.id, {
      ...postForm,
      settled_amount: settled,
      tds_deducted: tds,
      net_bank_credit: netCredit,
      disallowed_amount: Number(postForm.disallowed_amount || 0),
      status: 'settled'
    });

    setIsPostModalOpen(false);
    setSelectedItem(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    const createdRecord = {
      ...newForm,
      id: `rec-${Date.now().toString().slice(-4)}`,
      claim_dossier_id: `dos-${Date.now().toString().slice(-4)}`,
      settled_amount: 0,
      tds_deducted: 0,
      net_bank_credit: 0,
      disallowed_amount: 0,
      disallowance_category: '',
      disallowance_notes: '',
      action_taken: 'Awaiting Remittance',
      status: 'pending',
      utr_number: '',
      settlement_date: null,
      aging_days: 1,
      created_at: new Date().toISOString()
    };

    onCreateReconciliation(createdRecord);
    setIsNewModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Cashless Receivables</span>
            <Landmark size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Across all active TPA claims
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Remittances Settled</span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ₹{totalTds.toLocaleString('en-IN')} TDS (Sec 194J) withheld
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Total Disallowances</span>
            <TrendingDown size={18} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-error)', marginTop: '6px' }}>
            ₹{totalDisallowed.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            MoU discounts & medical audit cuts
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Critical Aging (&gt;60 Days)</span>
            <AlertTriangle size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            ₹{(bucket61_90 + bucket90Plus).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Escalation / legal review required
          </div>
        </Card>
      </div>

      {/* TPA Aging Buckets Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
              TPA Outstanding Aging Summary
            </h4>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
              Aging analysis based on date of claim submission to third party administrator
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', '0-30', '31-60', '61-90', '90+'].map((bucket) => (
              <Button
                key={bucket}
                size="sm"
                variant={agingFilter === bucket ? 'primary' : 'outline'}
                onClick={() => setAgingFilter(bucket)}
              >
                {bucket === 'all' ? 'All Buckets' : `${bucket} Days`}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: '600' }}>0 - 30 DAYS (CURRENT)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#15803D', marginTop: '2px' }}>
              ₹{bucket0_30.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '2px' }}>Standard TAT cycle</div>
          </div>

          <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '600' }}>31 - 60 DAYS (FOLLOW-UP)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#B45309', marginTop: '2px' }}>
              ₹{bucket31_60.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#92400E', marginTop: '2px' }}>Routine reminder sent</div>
          </div>

          <div style={{ backgroundColor: '#FFF7ED', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #FED7AA' }}>
            <div style={{ fontSize: '0.74rem', color: '#9A3412', fontWeight: '600' }}>61 - 90 DAYS (OVERDUE)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#C2410C', marginTop: '2px' }}>
              ₹{bucket61_90.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9A3412', marginTop: '2px' }}>Escalated to Zonal Mgr</div>
          </div>

          <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: '600' }}>90+ DAYS (CRITICAL / AUDIT)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>
              ₹{bucket90Plus.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#991B1B', marginTop: '2px' }}>Grievance / Write-off review</div>
          </div>
        </div>
      </Card>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '300px' }}>
              <Input
                placeholder="Search UTR, Patient, Dossier, TPA..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '200px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'settled', label: 'Settled' },
                  { value: 'pending', label: 'Awaiting Remittance' },
                  { value: 'disputed', label: 'Disputed' },
                  { value: 'rejected', label: 'Repudiated / Bad Debt' }
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
            >
              Export Aging Sheet
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsNewModalOpen(true)}
            >
              New Reconciliation Entry
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Claim Dossier & Patient</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>TPA & Insurer</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Claim vs Settled</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Deductions & TDS</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Bank Remittance / UTR</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Aging & Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No reconciliation records match the criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isSettled = item.status === 'settled';
                  const isDisputed = item.status === 'disputed';
                  const isRejected = item.status === 'rejected';

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {item.dossier_number}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#1E293B', marginTop: '2px', fontWeight: '600' }}>
                          {item.patient_name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                          {item.uhid}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.tpa_name}</div>
                        {item.disallowance_notes && (
                          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '3px', lineHeight: '1.3' }}>
                            {item.disallowance_notes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          Claim: ₹{Number(item.claim_amount || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.88rem', color: isSettled ? 'var(--color-success)' : 'var(--color-text-muted)', marginTop: '2px', fontWeight: '700' }}>
                          Settled: ₹{Number(item.settled_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right', fontSize: '0.76rem' }}>
                        {item.disallowed_amount > 0 && (
                          <div style={{ color: 'var(--color-error)' }}>
                            Disallowed: -₹{Number(item.disallowed_amount).toLocaleString('en-IN')}
                          </div>
                        )}
                        {item.tds_deducted > 0 && (
                          <div style={{ color: '#64748B', marginTop: '2px' }}>
                            TDS 10%: -₹{Number(item.tds_deducted).toLocaleString('en-IN')}
                          </div>
                        )}
                        {item.net_bank_credit > 0 && (
                          <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '3px' }}>
                            Net Credit: ₹{Number(item.net_bank_credit).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        {item.utr_number ? (
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                              {item.utr_number}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              Date: {item.settlement_date}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Awaiting Remittance
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <Badge
                            variant={isSettled ? 'success' : isDisputed ? 'warning' : isRejected ? 'danger' : 'gray'}
                            size="sm"
                          >
                            {isSettled ? 'Settled' : isDisputed ? 'Disputed' : isRejected ? 'Write-Off' : 'Pending'}
                          </Badge>
                          <span style={{ fontSize: '0.7rem', color: item.aging_days > 60 ? 'var(--color-error)' : '#64748B', fontWeight: '500' }}>
                            {item.aging_days || 5} Days Aging
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {item.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setSelectedItem(item);
                                const defaultSettled = item.claim_amount * 0.9;
                                setPostForm({
                                  settled_amount: defaultSettled,
                                  tds_deducted: Math.round(defaultSettled * 0.1),
                                  disallowed_amount: Math.round(item.claim_amount * 0.1),
                                  disallowance_category: 'mou_discount',
                                  disallowance_notes: '10% hospital tariff discount as per annual MoU',
                                  action_taken: 'Accepted as MoU Tariff Discount',
                                  utr_number: `HDFC-NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`,
                                  settlement_date: new Date().toISOString().split('T')[0],
                                  notes: 'Bank remittance credited into hospital account'
                                });
                                setIsPostModalOpen(true);
                              }}
                            >
                              Post Payment
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Printer}
                            title="Print Settlement Advice"
                            onClick={() => window.print()}
                          >
                            Advice
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: POST PAYMENT / SETTLEMENT ADVICE */}
      {selectedItem && (
        <Modal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          title={`Post TPA Remittance Advice: ${selectedItem.dossier_number}`}
          subtitle={`Recording bank settlement credit for ${selectedItem.patient_name} (${selectedItem.tpa_name}).`}
          maxWidth="640px"
        >
          <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFB', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <div><strong>Claim Amount:</strong> ₹{Number(selectedItem.claim_amount).toLocaleString('en-IN')}</div>
              <div><strong>TPA Name:</strong> {selectedItem.tpa_name}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Settled Remittance Amount (₹) *"
                required
                type="number"
                value={postForm.settled_amount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const dis = Math.max(0, Number(selectedItem.claim_amount) - val);
                  setPostForm({
                    ...postForm,
                    settled_amount: e.target.value,
                    disallowed_amount: dis,
                    tds_deducted: Math.round(val * 0.1)
                  });
                }}
              />

              <Input
                label="TDS Withheld (10% Sec 194J) (₹)"
                type="number"
                value={postForm.tds_deducted}
                onChange={(e) => setPostForm({ ...postForm, tds_deducted: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Bank UTR / NEFT Reference Number *"
                required
                value={postForm.utr_number}
                onChange={(e) => setPostForm({ ...postForm, utr_number: e.target.value })}
                placeholder="e.g. HDFC-NEFT-99401829"
              />

              <Input
                label="Remittance Credit Date *"
                type="date"
                required
                value={postForm.settlement_date}
                onChange={(e) => setPostForm({ ...postForm, settlement_date: e.target.value })}
              />
            </div>

            {/* Disallowance Breakdown */}
            <div style={{ backgroundColor: '#FFFDF5', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#92400E' }}>Disallowance / Deduction Amount:</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-error)' }}>
                  ₹{Number(postForm.disallowed_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Select
                  label="Disallowance Reason"
                  value={postForm.disallowance_category}
                  onChange={(e) => setPostForm({ ...postForm, disallowance_category: e.target.value })}
                  options={DISALLOWANCE_CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
                />

                <Select
                  label="Hospital Disposition Action"
                  value={postForm.action_taken}
                  onChange={(e) => setPostForm({ ...postForm, action_taken: e.target.value })}
                  options={[
                    { value: 'Accepted as MoU Tariff Discount', label: 'Accept as MoU Tariff Discount' },
                    { value: 'Escalate to TPA Grievance / Appeal', label: 'Escalate to TPA Grievance / Appeal' },
                    { value: 'Recommend Bad-Debt Write-Off', label: 'Recommend Bad-Debt Write-Off' },
                    { value: 'Transfer Balance to Patient Account', label: 'Transfer Balance to Patient Account' }
                  ]}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <Input
                  label="Disallowance Clarification Notes"
                  value={postForm.disallowance_notes}
                  onChange={(e) => setPostForm({ ...postForm, disallowance_notes: e.target.value })}
                  placeholder="e.g. 10% MoU capping applied on surgeon fees as per annexure 2"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Post Settlement to Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: NEW RECONCILIATION ENTRY */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="New TPA Reconciliation Claim Entry"
        subtitle="Register an outstanding cashless claim for bank remittance tracking."
        maxWidth="600px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Patient Full Name"
              required
              value={newForm.patient_name}
              onChange={(e) => setNewForm({ ...newForm, patient_name: e.target.value })}
            />
            <Input
              label="Patient UHID"
              required
              value={newForm.uhid}
              onChange={(e) => setNewForm({ ...newForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Dossier Reference Number"
              required
              value={newForm.dossier_number}
              onChange={(e) => setNewForm({ ...newForm, dossier_number: e.target.value })}
            />
            <Input
              label="TPA / Insurer Name"
              required
              value={newForm.tpa_name}
              onChange={(e) => setNewForm({ ...newForm, tpa_name: e.target.value })}
            />
          </div>

          <Input
            label="Claim Amount Expected (₹) *"
            required
            type="number"
            value={newForm.claim_amount}
            onChange={(e) => setNewForm({ ...newForm, claim_amount: e.target.value })}
          />

          <Input
            label="Audit / Desk Remarks"
            value={newForm.notes}
            onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus}>
              Create Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
