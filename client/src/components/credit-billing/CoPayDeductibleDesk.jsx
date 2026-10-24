import React, { useState } from 'react';
import {
  IndianRupee,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  QrCode,
  Printer,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { RESPONSIBILITY_STATUS_CONFIG } from './creditBillingConstants';

export function CoPayDeductibleDesk({
  responsibilities = [],
  onCreateResponsibility,
  onCollectPayment
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);

  // Collect Payment Form State
  const [collectForm, setCollectForm] = useState({
    amount_paid: '',
    payment_mode: 'Credit Card (HDFC Visa)',
    payment_reference: '',
    cashier_notes: 'Paid at Credit Billing Desk 2'
  });

  // New Responsibility Form
  const [newForm, setNewForm] = useState({
    patient_name: 'Anita Deshmukh',
    uhid: 'UHID-2026-0158',
    admission_id: 'adm-904',
    bill_id: 'bill-interim-904',
    insurance_provider: 'Vidal Health Insurance TPA Pvt Ltd',
    policy_number: 'UIIC-MED-9920188',
    total_bill: 130000,
    tpa_approved: 100000,
    copay_rate_percent: 10,
    copay_amount: 10000,
    non_payable_consumables: 12000,
    deductible_amount: 0,
    room_tariff_excess: 8000,
    advance_collected: 15000,
    notes: '10% co-payment on medical management + non-payable PPE/gloves + room difference.'
  });

  // Calculate net payable on new form
  const newGrossResponsibility =
    Number(newForm.copay_amount || 0) +
    Number(newForm.non_payable_consumables || 0) +
    Number(newForm.deductible_amount || 0) +
    Number(newForm.room_tariff_excess || 0);

  const newNetPayable = Math.max(0, newGrossResponsibility - Number(newForm.advance_collected || 0));

  // Filtered List
  const filteredList = responsibilities.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.insurance_provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.policy_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalDue = responsibilities.reduce((acc, curr) => acc + Number(curr.net_patient_payable || 0), 0);
  const totalCollected = responsibilities.reduce((acc, curr) => acc + Number(curr.amount_collected || 0), 0);
  const pendingGatepasses = responsibilities.filter(r => r.gatepass_status === 'blocked').length;
  const clearedGatepasses = responsibilities.filter(r => r.gatepass_status === 'cleared').length;

  const handleCollectSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const payAmt = Number(collectForm.amount_paid);
    if (!payAmt || payAmt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const receiptNo = `RCP-COPAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceiptObj = {
      receipt_no: receiptNo,
      amount: payAmt,
      payment_mode: collectForm.payment_mode,
      reference_no: collectForm.payment_reference || `TXN-${Date.now().toString().slice(-6)}`,
      payment_date: new Date().toISOString(),
      cashier: 'Pooja Verma (Billing Desk 1)',
      patient_name: selectedItem.patient_name,
      uhid: selectedItem.uhid,
      insurance_provider: selectedItem.insurance_provider
    };

    onCollectPayment(selectedItem.id, {
      amount_paid: payAmt,
      payment_method: collectForm.payment_mode,
      payment_reference: collectForm.payment_reference,
      receipt: newReceiptObj
    });

    setLastReceipt(newReceiptObj);
    setIsCollectModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    const createdRecord = {
      ...newForm,
      id: `resp-${Date.now().toString().slice(-4)}`,
      gross_responsibility: newGrossResponsibility,
      net_patient_payable: newNetPayable,
      amount_collected: 0,
      balance_due: newNetPayable,
      status: 'pending',
      gatepass_status: newNetPayable > 0 ? 'blocked' : 'cleared',
      receipts: []
    };

    onCreateResponsibility(createdRecord);
    setIsNewModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Total Patient Share</span>
            <IndianRupee size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            ₹{totalDue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Co-pay, consumables & deductibles
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Collected at Desk</span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Card, UPI & Cash receipts cleared
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Pending Discharge Clearance</span>
            <AlertTriangle size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {pendingGatepasses}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Gate-pass blocked pending co-pay
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Gate Pass Cleared</span>
            <UserCheck size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '6px' }}>
            {clearedGatepasses}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Eligible for physical discharge
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '300px' }}>
              <Input
                placeholder="Search Patient, UHID, Policy, Bill..."
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
                  { value: 'pending', label: 'Pending Collection' },
                  { value: 'partially_collected', label: 'Partially Collected' },
                  { value: 'collected', label: 'Fully Paid & Cleared' },
                  { value: 'waived', label: 'Hospital Discount' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsNewModalOpen(true)}
          >
            Calculate Patient Responsibility
          </Button>
        </div>
      </Card>

      {/* Main Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Inpatient Details</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Total Bill / TPA</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Patient Share Breakdown</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Net Payable</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Paid / Balance</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Gate Pass Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No patient co-pay or responsibility records found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = RESPONSIBILITY_STATUS_CONFIG[item.status] || RESPONSIBILITY_STATUS_CONFIG.pending;
                  const isGatepassCleared = item.gatepass_status === 'cleared';
                  const balanceDue = Number(item.balance_due || (item.net_patient_payable - item.amount_collected));

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: balanceDue > 0 ? '#FFFDF5' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.uhid} • Admission: {item.admission_id}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', marginTop: '2px', fontWeight: '500' }}>
                          {item.insurance_provider}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          ₹{Number(item.total_bill || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', marginTop: '2px', fontWeight: '600' }}>
                          TPA: ₹{Number(item.tpa_approved || 0).toLocaleString('en-IN')}
                        </div>
                        {item.advance_collected > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            Adv: -₹{Number(item.advance_collected).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '0.76rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {item.copay_amount > 0 && (
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)' }}>Co-Pay ({item.copay_rate_percent}%):</span>{' '}
                              <strong>₹{Number(item.copay_amount).toLocaleString('en-IN')}</strong>
                            </div>
                          )}
                          {item.non_payable_consumables > 0 && (
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)' }}>Non-Payable Consumables:</span>{' '}
                              <strong>₹{Number(item.non_payable_consumables).toLocaleString('en-IN')}</strong>
                            </div>
                          )}
                          {item.room_tariff_excess > 0 && (
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)' }}>Room Tariff Excess:</span>{' '}
                              <strong>₹{Number(item.room_tariff_excess).toLocaleString('en-IN')}</strong>
                            </div>
                          )}
                          {item.deductible_amount > 0 && (
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)' }}>Deductible:</span>{' '}
                              <strong>₹{Number(item.deductible_amount).toLocaleString('en-IN')}</strong>
                            </div>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>
                          ₹{Number(item.net_patient_payable || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Gross: ₹{Number(item.gross_responsibility || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                          Paid: ₹{Number(item.amount_collected || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontWeight: '700', color: balanceDue > 0 ? 'var(--color-error)' : 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                          Due: ₹{balanceDue.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={isGatepassCleared ? 'success' : 'danger'} size="sm">
                          {isGatepassCleared ? 'Gate Pass Cleared' : 'Blocked (Co-Pay Due)'}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {balanceDue > 0 && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={CreditCard}
                              onClick={() => {
                                setSelectedItem(item);
                                setCollectForm({
                                  amount_paid: balanceDue,
                                  payment_mode: 'Credit Card (HDFC Visa)',
                                  payment_reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                                  cashier_notes: 'Settled at Credit Billing Desk'
                                });
                                setIsCollectModalOpen(true);
                              }}
                            >
                              Collect
                            </Button>
                          )}

                          {item.receipts && item.receipts.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Printer}
                              title="Print Receipt"
                              onClick={() => {
                                setLastReceipt(item.receipts[item.receipts.length - 1]);
                                setIsReceiptModalOpen(true);
                              }}
                            >
                              Receipt
                            </Button>
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
      </Card>

      {/* MODAL 1: COLLECT PAYMENT */}
      {selectedItem && (
        <Modal
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
          title="Collect Patient Share / Co-Payment"
          subtitle={`Collecting non-covered expenses for ${selectedItem.patient_name} (${selectedItem.uhid}).`}
          maxWidth="520px"
        >
          <form onSubmit={handleCollectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Net Patient Liability:</span>
                <strong>₹{Number(selectedItem.net_patient_payable).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Already Collected:</span>
                <span style={{ color: 'var(--color-success)' }}>-₹{Number(selectedItem.amount_collected || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-error)' }}>
                <span>Balance Due Now:</span>
                <span>₹{(selectedItem.net_patient_payable - selectedItem.amount_collected).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Input
              label="Collection Amount (₹) *"
              required
              type="number"
              value={collectForm.amount_paid}
              onChange={(e) => setCollectForm({ ...collectForm, amount_paid: e.target.value })}
            />

            <Select
              label="Payment Mode"
              value={collectForm.payment_mode}
              onChange={(e) => setCollectForm({ ...collectForm, payment_mode: e.target.value })}
              options={[
                { value: 'Credit Card (HDFC Visa)', label: 'Credit Card (POS Terminal)' },
                { value: 'Debit Card (Rupay / MasterCard)', label: 'Debit Card (POS Terminal)' },
                { value: 'UPI (PhonePe / GooglePay QR)', label: 'UPI (PhonePe / GooglePay QR)' },
                { value: 'Cash Counter Payment', label: 'Cash Counter Payment' },
                { value: 'Net Banking NEFT/RTGS', label: 'Net Banking NEFT/RTGS' },
                { value: 'Demand Draft / Cheque', label: 'Demand Draft / Pay Order' }
              ]}
            />

            <Input
              label="Card Auth / UTR / Reference Number"
              required
              value={collectForm.payment_reference}
              onChange={(e) => setCollectForm({ ...collectForm, payment_reference: e.target.value })}
              placeholder="e.g. AUTH-VISA-882910 or UPI/29104812"
            />

            <Input
              label="Cashier Remarks / Counter Notes"
              value={collectForm.cashier_notes}
              onChange={(e) => setCollectForm({ ...collectForm, cashier_notes: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsCollectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Collect & Issue Clearance Gate Pass
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: CALCULATE NEW RESPONSIBILITY */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Calculate Inpatient Patient Responsibility"
        subtitle="Compute co-payment %, non-payable consumables & room differences for cashless admission."
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Patient Name"
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
              label="Total Hospital Bill (₹)"
              type="number"
              required
              value={newForm.total_bill}
              onChange={(e) => setNewForm({ ...newForm, total_bill: e.target.value })}
            />
            <Input
              label="TPA Cashless Approved (₹)"
              type="number"
              required
              value={newForm.tpa_approved}
              onChange={(e) => setNewForm({ ...newForm, tpa_approved: e.target.value })}
            />
          </div>

          {/* Breakdown Heads */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
              Itemized Patient Liability Heads
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <Input
                label="Co-Pay (₹)"
                type="number"
                value={newForm.copay_amount}
                onChange={(e) => setNewForm({ ...newForm, copay_amount: e.target.value })}
              />
              <Input
                label="Non-Payables (₹)"
                type="number"
                value={newForm.non_payable_consumables}
                onChange={(e) => setNewForm({ ...newForm, non_payable_consumables: e.target.value })}
              />
              <Input
                label="Room Excess (₹)"
                type="number"
                value={newForm.room_tariff_excess}
                onChange={(e) => setNewForm({ ...newForm, room_tariff_excess: e.target.value })}
              />
              <Input
                label="Deductible (₹)"
                type="number"
                value={newForm.deductible_amount}
                onChange={(e) => setNewForm({ ...newForm, deductible_amount: e.target.value })}
              />
              <Input
                label="Less Advance (₹)"
                type="number"
                value={newForm.advance_collected}
                onChange={(e) => setNewForm({ ...newForm, advance_collected: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>Calculated Net Payable by Patient:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                ₹{newNetPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <Input
            label="Liability Notes / Policy Clause Explanation"
            value={newForm.notes}
            onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus}>
              Save Liability Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CO-PAY RECEIPT PRINT VIEW */}
      {lastReceipt && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Patient Share / Co-Payment Receipt"
          subtitle="Official hospital cash & digital receipt for non-covered cashless insurance expenses."
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px dashed #94A3B8',
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: '#1E293B'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#0F172A' }}>
                  MEDICS PRIME MULTISPECIALTY HOSPITAL
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Cashless Insurance Desk • Patient Responsibility Receipt
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div><strong>Receipt No:</strong> {lastReceipt.receipt_no}</div>
                <div><strong>Date:</strong> {new Date(lastReceipt.payment_date).toLocaleString('en-IN')}</div>
                <div><strong>Patient:</strong> {lastReceipt.patient_name || selectedItem?.patient_name}</div>
                <div><strong>UHID:</strong> {lastReceipt.uhid || selectedItem?.uhid}</div>
                <div><strong>Insurer:</strong> {lastReceipt.insurance_provider || selectedItem?.insurance_provider}</div>
                <div><strong>Mode:</strong> {lastReceipt.payment_mode}</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '4px', textAlign: 'center', margin: '14px 0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>AMOUNT RECEIVED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0D9488' }}>
                  ₹{Number(lastReceipt.amount).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                  Txn Ref: {lastReceipt.reference_no}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '0.74rem', color: '#64748B' }}>
                <div>Cashier: {lastReceipt.cashier || 'Billing Counter'}</div>
                <div>Status: Gate Pass Cleared</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Co-Pay Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
