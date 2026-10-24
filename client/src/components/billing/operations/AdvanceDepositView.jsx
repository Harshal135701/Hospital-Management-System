import React, { useState, useEffect, useMemo } from 'react';
import {
  IndianRupee,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { BillingOpsService } from '../../../services/api';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../../utils/formatters';
import { calculateDepositAvailableBalance, isDuplicateTransaction } from '../../../utils/billingCalculations';
import { useHospitalState } from '../../../context/HospitalStateContext';

const DEFAULT_DEPOSITS = [
  {
    id: 'dep-01',
    receipt_number: 'DEP-2026-0210',
    patient_name: 'Vikramaditya Bose',
    patient_uhid: 'UHID-2026-1180',
    admission_number: 'ADM-2026-0048',
    amount: 25000,
    allocated_amount: 25000,
    deposit_type: 'Planned Surgery Advance',
    payment_mode: 'Credit Card',
    txn_ref: 'CC-TXN-9014',
    received_by: 'Cashier S. Roy',
    date: '2026-10-22T09:40:00Z',
    status: 'allocated',
    notes: 'Advance collected for planned knee arthroplasty surgery'
  },
  {
    id: 'dep-02',
    receipt_number: 'DEP-2026-0211',
    patient_name: 'Kalyani Das',
    patient_uhid: 'UHID-2026-0902',
    admission_number: 'ADM-2026-0049',
    amount: 50000,
    allocated_amount: 50000,
    deposit_type: 'ICU High-Dependency Reserve',
    payment_mode: 'NEFT Bank Transfer',
    txn_ref: 'NEFT-AXIS-8812',
    received_by: 'Cashier M. Gupta',
    date: '2026-10-21T14:20:00Z',
    status: 'allocated',
    notes: 'Direct hospital bank wire deposit'
  },
  {
    id: 'dep-03',
    receipt_number: 'DEP-2026-0212',
    patient_name: 'Devika Sengupta',
    patient_uhid: 'UHID-2026-0814',
    admission_number: 'ADM-2026-0052',
    amount: 30000,
    allocated_amount: 0,
    deposit_type: 'IVF Cycle OPU/ICSI Advance',
    payment_mode: 'UPI QR',
    txn_ref: 'UPI-HDFC-9912',
    received_by: 'Cashier S. Roy',
    date: '2026-10-22T11:10:00Z',
    status: 'unutilized',
    notes: 'Advance for oocyte pickup and laboratory fertilization cycle'
  }
];

export function AdvanceDepositView({ onOpenReceiptModal }) {
  const [deposits, setDeposits] = useState(DEFAULT_DEPOSITS);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const hospitalState = useHospitalState();
  const inpatientAdmissions = hospitalState?.inpatientAdmissions || [];

  // Deposit Form State (Clean empty defaults with guided placeholders)
  const [form, setForm] = useState({
    patientName: '',
    patientUhid: '',
    admissionRef: '',
    amount: '',
    depositType: 'Surgery / Procedure Advance',
    paymentMode: 'upi',
    txnRef: '',
    remarks: ''
  });

  const filteredDeposits = useMemo(() => {
    return deposits.filter(d => {
      const q = searchFilter.toLowerCase();
      return (
        d.receipt_number.toLowerCase().includes(q) ||
        d.patient_name.toLowerCase().includes(q) ||
        d.patient_uhid.toLowerCase().includes(q) ||
        d.admission_number.toLowerCase().includes(q)
      );
    });
  }, [deposits, searchFilter]);

  // Overall Statistics & Dynamic Trust Balance
  const totalDepositsCollected = useMemo(() => {
    return deposits.reduce((acc, d) => acc + (d.amount || 0), 0);
  }, [deposits]);

  const totalAllocated = useMemo(() => {
    return deposits.reduce((acc, d) => acc + (d.allocated_amount || 0), 0);
  }, [deposits]);

  const totalAvailableBalance = useMemo(() => {
    return deposits.reduce((acc, d) => acc + calculateDepositAvailableBalance(d), 0);
  }, [deposits]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) return;

    // Check for duplicate transaction reference
    if (form.txnRef && isDuplicateTransaction(deposits, { txn_ref: form.txnRef })) {
      setFormError(`Transaction reference "${form.txnRef}" has already been recorded in this ledger.`);
      return;
    }

    setIsSubmitting(true);
    const newDep = {
      id: `dep-${Date.now()}`,
      receipt_number: `DEP-2026-0${Math.floor(Math.random() * 900) + 100}`,
      patient_name: form.patientName,
      patient_uhid: form.patientUhid,
      admission_number: form.admissionRef,
      amount: amt,
      allocated_amount: 0,
      deposit_type: form.depositType,
      payment_mode: form.paymentMode.toUpperCase(),
      txn_ref: form.txnRef,
      received_by: 'Cashier Terminal (S. Roy)',
      date: new Date().toISOString(),
      status: 'allocated',
      notes: form.remarks
    };

    try {
      await BillingOpsService.createDeposit({
        patientName: form.patientName,
        patientUhid: form.patientUhid,
        admissionRef: form.admissionRef,
        amount: amt,
        depositType: form.depositType,
        paymentMode: form.paymentMode,
        notes: form.remarks
      });
    } catch {
      //
    }

    setDeposits(prev => [newDep, ...prev]);
    setIsDepositModalOpen(false);
    setSuccessBanner(`Advance deposit of ${formatINR(amt)} collected for ${form.patientName}.`);
    setIsSubmitting(false);

    if (onOpenReceiptModal) {
      onOpenReceiptModal(newDep);
    }
  };

  const handleOpenReceipt = (dep) => {
    if (onOpenReceiptModal) {
      onOpenReceiptModal(dep);
    } else {
      setSelectedReceipt(dep);
      setIsReceiptModalOpen(true);
    }
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
            <Badge variant="teal" size="sm">Submodule 4.4</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Advance Deposit Collection & Inpatient Ledger
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Collect pre-admission advances, surgical security reserves, and generate stamped money receipts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => { setFormError(null); setIsDepositModalOpen(true); }}
        >
          Collect Advance Deposit
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

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Total Deposits Collected
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {formatINR(totalDepositsCollected)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Across {deposits.length} Transaction Receipts
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Allocated to Inpatient Bills
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
            {formatINR(totalAllocated)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Offsets against running bed tariffs
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Unutilized Advance Credit
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369A1', marginTop: '4px' }}>
            {formatINR(totalAvailableBalance)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Available for discharge adjustments
          </div>
        </div>
      </div>

      {/* Advance Deposit Ledger Table */}
      <Card
        title="Advance Deposit Collection Ledger"
        subtitle="Searchable record of collected advances, payment channels, and receipt reprints"
        action={
          <div style={{ width: '260px' }}>
            <Input
              placeholder="Search UHID, receipt, patient..."
              icon={Search}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Receipt No.</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Patient / Subject</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Admission Ref</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Category / Notes</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Payment Mode</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Deposit Amount</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                    No advance deposit records found matching "{searchFilter}".
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                <tr key={dep.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                    {dep.receipt_number}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{dep.patient_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{dep.patient_uhid}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontWeight: '600' }}>{dep.admission_number}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div>{dep.deposit_type}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{dep.notes}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="teal" size="sm">{dep.payment_mode}</Badge>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    {formatINR(dep.amount)}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div>{formatDateIN(dep.date)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{dep.received_by}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      onClick={() => handleOpenReceipt(dep)}
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Collect Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Collect Patient Advance Deposit"
        size="md"
      >
        <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && (
            <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} />
              <span>{formError}</span>
            </div>
          )}
          {inpatientAdmissions.length > 0 && (
            <Select
              label="Quick-Select Active Admission (Autofills Patient)"
              value={form.admissionRef}
              onChange={(e) => {
                const adm = inpatientAdmissions.find(a => a.admission_number === e.target.value);
                if (adm) {
                  setForm(prev => ({
                    ...prev,
                    admissionRef: adm.admission_number,
                    patientName: adm.patient_name,
                    patientUhid: adm.patient_uhid
                  }));
                }
              }}
              options={[
                { value: '', label: '-- Select Inpatient Admission or Enter Below --' },
                ...inpatientAdmissions.map(a => ({
                  value: a.admission_number,
                  label: `${a.admission_number} — ${a.patient_name} (${a.patient_uhid})`
                }))
              ]}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Patient Name"
              placeholder="e.g. Devika Sengupta"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
            />
            <Input
              label="Patient UHID"
              placeholder="e.g. UHID-2026-0814"
              value={form.patientUhid}
              onChange={(e) => setForm({ ...form, patientUhid: e.target.value })}
              required
            />
            <Input
              label="Admission Reference #"
              placeholder="e.g. ADM-2026-0052"
              value={form.admissionRef}
              onChange={(e) => setForm({ ...form, admissionRef: e.target.value })}
              required
            />
            <Input
              label="Advance Amount (₹)"
              type="number"
              min="100"
              placeholder="e.g. 25000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <Select
              label="Payment Method"
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              options={[
                { value: 'upi', label: 'UPI Dynamic QR' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash Counter' },
                { value: 'neft', label: 'NEFT / RTGS Wire' }
              ]}
            />
            <Input
              label="Transaction / Bank Reference ID"
              placeholder="e.g. UPI-TXN-2026-8812"
              value={form.txnRef}
              onChange={(e) => setForm({ ...form, txnRef: e.target.value })}
              required
            />
          </div>

          <Input
            label="Deposit Remarks / Purpose"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Issue Money Receipt for {formatINR(parseFloat(form.amount) || 0)}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Printable Advance Money Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Advance Deposit Money Receipt"
        size="md"
      >
        {selectedReceipt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                lineHeight: 1.5
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal, #0A4174)', paddingBottom: '10px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-primary-teal, #0A4174)', fontWeight: '800', fontSize: '1.1rem' }}>SARJI GROUP OF HOSPITALS</h3>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Advance Cashier & Trust Collections Desk</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-primary-teal, #0A4174)' }}>{selectedReceipt.receipt_number}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Date: {formatDateTimeIN(selectedReceipt.date)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', backgroundColor: '#F9FAFB', padding: '10px', borderRadius: '4px' }}>
                <div><strong>Patient Name:</strong> {selectedReceipt.patient_name}</div>
                <div><strong>UHID:</strong> {selectedReceipt.patient_uhid}</div>
                <div><strong>Admission Ref:</strong> {selectedReceipt.admission_number}</div>
                <div><strong>Payment Mode:</strong> {selectedReceipt.payment_mode}</div>
                {selectedReceipt.txn_ref && <div><strong>Txn Ref:</strong> {selectedReceipt.txn_ref}</div>}
                <div><strong>Received By:</strong> {selectedReceipt.received_by}</div>
              </div>

              <div style={{ borderTop: '1px dashed #D1D5DB', borderBottom: '1.5px solid #111827', padding: '10px 0', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700' }}>DEPOSIT AMOUNT RECEIVED:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-teal, #0A4174)' }}>{formatINR(selectedReceipt.amount)}</span>
              </div>

              {selectedReceipt.notes && (
                <div style={{ fontSize: '0.75rem', color: '#4B5563', fontStyle: 'italic', marginTop: '6px' }}>
                  Notes: {selectedReceipt.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Money Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}