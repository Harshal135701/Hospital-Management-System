import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Filter,
  Eye,
  Check,
  XCircle,
  FileText,
  Building2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { BillingOpsService } from '../../../services/api';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../../utils/formatters';

const DEFAULT_REFUNDS = [
  {
    id: 'ref-01',
    refund_number: 'REF-2026-0012',
    bill_number: 'OPD-2026-0891',
    patient_name: 'Rajesh Narayan Verma',
    patient_uhid: 'UHID-2026-0922',
    original_amount: 800,
    amount: 800,
    payment_mode: 'UPI Refund',
    reason: 'Duplicate consultation charge paid online during portal timeout',
    requested_by: 'Cashier S. Roy',
    approved_by: 'Chief Finance Officer (Approved)',
    created_at: '2026-10-21T14:15:00Z',
    status: 'approved',
    notes: 'Approved for direct bank reversal via Razorpay webhook'
  },
  {
    id: 'ref-02',
    refund_number: 'REF-2026-0013',
    bill_number: 'IPD-DEP-0199',
    patient_name: 'Tanima Ghosh',
    patient_uhid: 'UHID-2026-0610',
    original_amount: 50000,
    amount: 4500,
    payment_mode: 'Direct Bank Remittance',
    reason: 'Excess advance deposit credit balance post discharge final settlement',
    requested_by: 'Billing Lead R. Dey',
    approved_by: 'Pending Finance Supervisor',
    created_at: '2026-10-22T09:30:00Z',
    status: 'pending',
    notes: 'Awaiting patient NEFT bank passbook verification'
  },
  {
    id: 'ref-03',
    refund_number: 'REF-2026-0014',
    bill_number: 'OPD-2026-0840',
    patient_name: 'Amitabh Sengupta',
    patient_uhid: 'UHID-2026-0305',
    original_amount: 1200,
    amount: 1200,
    payment_mode: 'Cash Handover',
    reason: 'Consultant emergency cancellation due to urgent OT surgery',
    requested_by: 'Reception Desk',
    approved_by: 'Billing Manager (Processed)',
    created_at: '2026-10-20T16:00:00Z',
    status: 'processed',
    notes: 'Cash refund voucher #CV-891 signed by patient relative'
  }
];

export function MyRefundsView() {
  const [refunds, setRefunds] = useState(DEFAULT_REFUNDS);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewRefundModalOpen, setIsNewRefundModalOpen] = useState(false);
  const [selectedRefundDetail, setSelectedRefundDetail] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Refund Form
  const [refundForm, setRefundForm] = useState({
    billNumber: 'OPD-2026-0915',
    patientName: 'Rajesh Narayan Verma',
    patientUhid: 'UHID-2026-0922',
    originalAmount: '800',
    amount: '800',
    reason: 'Duplicate consultation charge paid online',
    paymentMode: 'upi',
    notes: 'Patient requested refund to original UPI VPA'
  });

  // Load from API if available
  useEffect(() => {
    async function loadRefunds() {
      try {
        const live = await BillingOpsService.getRefunds();
        if (Array.isArray(live) && live.length > 0) {
          setRefunds(live);
        }
      } catch {
        // fallback
      }
    }
    loadRefunds();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = refunds.length;
    const pending = refunds.filter(r => r.status === 'pending').length;
    const approved = refunds.filter(r => r.status === 'approved').length;
    const processed = refunds.filter(r => r.status === 'processed').length;
    const rejected = refunds.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, processed, rejected };
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => {
      const q = searchFilter.toLowerCase();
      const matchSearch =
        r.refund_number.toLowerCase().includes(q) ||
        r.bill_number.toLowerCase().includes(q) ||
        r.patient_name.toLowerCase().includes(q) ||
        r.patient_uhid.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [refunds, searchFilter, statusFilter]);

  const handleCreateRefundSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(refundForm.amount) || 0;
    if (amt <= 0) return;

    setIsSubmitting(true);
    const newRef = {
      id: `ref-${Date.now()}`,
      refund_number: `REF-2026-0${Math.floor(Math.random() * 900) + 100}`,
      bill_number: refundForm.billNumber,
      patient_name: refundForm.patientName,
      patient_uhid: refundForm.patientUhid,
      original_amount: parseFloat(refundForm.originalAmount) || amt,
      amount: amt,
      payment_mode: refundForm.paymentMode.toUpperCase(),
      reason: refundForm.reason,
      requested_by: 'Cashier Desk (Logged-in Staff)',
      approved_by: 'Pending Finance Supervisor',
      created_at: new Date().toISOString(),
      status: 'pending',
      notes: refundForm.notes
    };

    try {
      await BillingOpsService.createRefund(refundForm);
    } catch {
      //
    }

    setRefunds(prev => [newRef, ...prev]);
    setIsNewRefundModalOpen(false);
    setSuccessBanner(`Refund request for ${formatINR(amt)} submitted for supervisor approval.`);
    setIsSubmitting(false);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await BillingOpsService.updateRefundStatus(id, newStatus, 'Status updated via staff desk');
    } catch {
      //
    }

    setRefunds(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              approved_by: newStatus === 'approved' ? 'Chief Finance Officer (Approved)' : r.approved_by
            }
          : r
      )
    );

    if (selectedRefundDetail && selectedRefundDetail.id === id) {
      setSelectedRefundDetail(prev => ({
        ...prev,
        status: newStatus,
        approved_by: newStatus === 'approved' ? 'Chief Finance Officer (Approved)' : prev.approved_by
      }));
    }

    setSuccessBanner(`Refund status updated to "${newStatus}".`);
    setTimeout(() => setSuccessBanner(null), 3500);
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
            <Badge variant="teal" size="sm">Submodule 4.5</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              My Refunds & Payment Reversals Ledger
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Staff refund request logging, dual authorization workflows, duplicate charge reversal, and audit tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsNewRefundModalOpen(true)}
        >
          Raise Refund Request
        </Button>
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

      {/* Refund KPI Metric Cards (Screenshot 1 Layout Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Total Requests
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {metrics.total}
          </div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-warning)', marginTop: '4px' }}>
            {metrics.pending}
          </div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Approved
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0369A1', marginTop: '4px' }}>
            {metrics.approved}
          </div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Processed
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
            {metrics.processed}
          </div>
        </div>

        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Rejected
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '4px' }}>
            {metrics.rejected}
          </div>
        </div>
      </div>

      {/* Filter Bar & Table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'processed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === st ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: statusFilter === st ? 'var(--color-primary-teal)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search refund #, UHID, patient..."
            icon={Search}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Refunds Table */}
      <Card title="Refund Requests & Processing Ledger">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Refund Ref / Bill</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Patient / UHID</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Original Paid</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Refund Amount</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Reason & Mode</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Requested Date</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((r) => {
                const badgeVar =
                  r.status === 'processed' ? 'success' :
                  r.status === 'approved' ? 'teal' :
                  r.status === 'pending' ? 'warning' : 'danger';

                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{r.refund_number}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Bill: {r.bill_number}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600' }}>{r.patient_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{r.patient_uhid}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#6B7280' }}>
                      {formatINR(r.original_amount || r.amount)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: 'var(--color-error)' }}>
                      -{formatINR(r.amount)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div>{r.reason}</div>
                      <div style={{ fontSize: '0.7rem', color: '#0369A1' }}>{r.payment_mode}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <Badge variant={badgeVar} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div>{formatDateIN(r.created_at)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>By {r.requested_by}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedRefundDetail(r)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Raise Refund Modal */}
      <Modal
        isOpen={isNewRefundModalOpen}
        onClose={() => setIsNewRefundModalOpen(false)}
        title="Raise Refund / Reversal Request"
        size="md"
      >
        <form onSubmit={handleCreateRefundSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Original Invoice / Bill #"
              value={refundForm.billNumber}
              onChange={(e) => setRefundForm({ ...refundForm, billNumber: e.target.value })}
              required
            />
            <Input
              label="Patient Name"
              value={refundForm.patientName}
              onChange={(e) => setRefundForm({ ...refundForm, patientName: e.target.value })}
              required
            />
            <Input
              label="Patient UHID"
              value={refundForm.patientUhid}
              onChange={(e) => setRefundForm({ ...refundForm, patientUhid: e.target.value })}
              required
            />
            <Input
              label="Original Paid (₹)"
              type="number"
              value={refundForm.originalAmount}
              onChange={(e) => setRefundForm({ ...refundForm, originalAmount: e.target.value })}
              required
            />
            <Input
              label="Requested Refund Amount (₹)"
              type="number"
              max={refundForm.originalAmount}
              value={refundForm.amount}
              onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
              required
            />
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Requested Refund Method
              </label>
              <select
                value={refundForm.paymentMode}
                onChange={(e) => setRefundForm({ ...refundForm, paymentMode: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
              >
                <option value="upi">UPI Reversal (Instant)</option>
                <option value="cash">Cash Voucher Handover</option>
                <option value="bank">Direct Bank Account NEFT</option>
              </select>
            </div>
          </div>

          <Input
            label="Justification Reason for Refund"
            value={refundForm.reason}
            onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsNewRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Submit Refund for Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Refund Detail Modal */}
      <Modal
        isOpen={Boolean(selectedRefundDetail)}
        onClose={() => setSelectedRefundDetail(null)}
        title="Refund Request Dossier & Authorization"
        size="md"
      >
        {selectedRefundDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#F0FDFA', borderRadius: '4px', border: '1px solid #CCFBF1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                    {selectedRefundDetail.refund_number}
                  </div>
                  <div style={{ color: '#4B5563', fontSize: '0.75rem' }}>
                    Bill: {selectedRefundDetail.bill_number} • Patient: {selectedRefundDetail.patient_name} ({selectedRefundDetail.patient_uhid})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-error)' }}>
                    -{formatINR(selectedRefundDetail.amount)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div><strong>Original Paid:</strong> {formatINR(selectedRefundDetail.original_amount || selectedRefundDetail.amount)}</div>
              <div><strong>Refund Mode:</strong> {selectedRefundDetail.payment_mode}</div>
              <div><strong>Requested By:</strong> {selectedRefundDetail.requested_by}</div>
              <div><strong>Approver:</strong> {selectedRefundDetail.approved_by}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Reason:</strong> {selectedRefundDetail.reason}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Audit Notes:</strong> {selectedRefundDetail.notes}</div>
            </div>

            {/* Workflow Actions */}
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedRefundDetail.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={() => handleUpdateStatus(selectedRefundDetail.id, 'approved')}
                    >
                      Authorize & Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedRefundDetail.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedRefundDetail.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleUpdateStatus(selectedRefundDetail.id, 'processed')}
                  >
                    Mark as Disbursed / Processed
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedRefundDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
