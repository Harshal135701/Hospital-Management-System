import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Plus,
  IndianRupee,
  Receipt
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../../utils/formatters';
import { useHospitalState } from '../../../context/HospitalStateContext';
import { calculateIpdRoomStayBilling } from '../../../utils/ipdRoomBilling';
import { calculateBillFinancials, isDuplicateTransaction } from '../../../utils/billingCalculations';

const DEFAULT_IPD_RUNNING = [
  {
    id: 'ipd-01',
    bill_number: 'IPD-RUN-0021',
    patient_name: 'Aniruddha Sen',
    patient_uhid: 'UHID-2026-0640',
    admission_number: 'ADM-2026-0048',
    admission_date: '2026-10-15',
    ward_bed: 'General Ward Bed 08',
    ward_type: 'General Ward (Transferred from ICU Bed 02)',
    days_stay: 8,
    attending_doc: 'Dr. Arindam Mitra (Cardiothoracic)',
    room_charges: 25000,
    pharmacy_charges: 18400,
    procedure_charges: 35000,
    lab_charges: 12500,
    nursing_charges: 6000,
    advance_paid: 50000,
    interim_payments: 15000,
    status: 'active',
    stays: [
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
    ]
  },
  {
    id: 'ipd-02',
    bill_number: 'IPD-RUN-0022',
    patient_name: 'Meera Mukherjee',
    patient_uhid: 'UHID-2026-0772',
    admission_number: 'ADM-2026-0049',
    admission_date: '2026-10-20',
    ward_bed: 'CT Post-Op 201',
    ward_type: 'Private Deluxe Ward',
    days_stay: 2,
    attending_doc: 'Dr. Ananya Sharma (General Surgery)',
    room_charges: 9000,
    pharmacy_charges: 8200,
    procedure_charges: 65000,
    lab_charges: 4500,
    nursing_charges: 3000,
    advance_paid: 75000,
    interim_payments: 0,
    status: 'active',
    stays: [
      {
        id: 'stay-02-01',
        ward_code: 'DLX',
        ward_name: 'Private Deluxe Ward (CT Post-Op 201)',
        daily_rate: 4500,
        start_time: '2026-10-20T11:00:00',
        end_time: '2026-10-22T23:59:59'
      }
    ]
  },
  {
    id: 'ipd-03',
    bill_number: 'IPD-RUN-0023',
    patient_name: 'Vikramaditya Bose',
    patient_uhid: 'UHID-2026-1180',
    admission_number: 'ADM-2026-0051',
    admission_date: '2026-10-21',
    ward_bed: 'Orthopedic Ward Bed 08',
    ward_type: 'Semi-Private Sharing',
    days_stay: 1,
    attending_doc: 'Dr. Pradeep K. Sharma (Orthopedics)',
    room_charges: 3500,
    pharmacy_charges: 2400,
    procedure_charges: 18000,
    lab_charges: 3200,
    nursing_charges: 1500,
    advance_paid: 25000,
    interim_payments: 0,
    status: 'active',
    stays: [
      {
        id: 'stay-03-01',
        ward_code: 'SEMI',
        ward_name: 'Semi-Private Sharing (Orthopedic Bed 08)',
        daily_rate: 3500,
        start_time: '2026-10-21T09:30:00',
        end_time: '2026-10-22T23:59:59'
      }
    ]
  }
];

export function IpdRunningBillView({ onOpenReceiptModal }) {
  const hospitalState = useHospitalState();
  const roomBillingPolicy = hospitalState?.roomBillingPolicy || { transfer_day_rule: 'MIDNIGHT_LOCATION' };
  const payments = hospitalState?.payments || [];
  const updatePayments = hospitalState?.updatePayments;

  const [inpatientBills, setInpatientBills] = useState(DEFAULT_IPD_RUNNING);
  const [selectedPatient, setSelectedPatient] = useState(DEFAULT_IPD_RUNNING[0]);

  // Dynamic Room Stay Calculation with Transfer-Day Deduplication
  const roomCalculation = useMemo(() => {
    if (!selectedPatient?.stays || selectedPatient.stays.length === 0) {
      return { totalDays: selectedPatient?.days_stay || 1, totalRoomCharges: selectedPatient?.room_charges || 0, staysBreakdown: [], dailyAuditTrail: [] };
    }
    return calculateIpdRoomStayBilling(selectedPatient.stays, roomBillingPolicy, '2026-10-22T23:59:59');
  }, [selectedPatient, roomBillingPolicy]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Add Special Service State
  const [isSpecialServiceModalOpen, setIsSpecialServiceModalOpen] = useState(false);
  const [specialServiceForm, setSpecialServiceForm] = useState({
    name: 'ABCD - Bedside Special Clinical Care',
    rate: 400,
    qty: 1,
    notes: 'Prescribed attending specialist monitoring'
  });
  const [paymentAmount, setPaymentAmount] = useState('10000');
  const [paymentMode, setPaymentMode] = useState('card');
  const [successBanner, setSuccessBanner] = useState(null);

  const calculateTotalCharges = (item) => {
    let roomCost = item.room_charges || 0;
    if (item.stays && item.stays.length > 0) {
      const calc = calculateIpdRoomStayBilling(item.stays, roomBillingPolicy, '2026-10-22T23:59:59');
      if (calc.totalRoomCharges > 0) roomCost = calc.totalRoomCharges;
    }
    return (
      roomCost +
      (item.pharmacy_charges || 0) +
      (item.procedure_charges || 0) +
      (item.lab_charges || 0) +
      (item.nursing_charges || 0)
    );
  };

  const calculateNetPayable = (item) => {
    const total = calculateTotalCharges(item);
    const credits = (item.advance_paid || 0) + (item.interim_payments || 0);
    return Math.max(0, total - credits);
  };

  const filteredList = useMemo(() => {
    return inpatientBills.filter(b => {
      const q = searchFilter.toLowerCase();
      return (
        b.patient_name.toLowerCase().includes(q) ||
        b.patient_uhid.toLowerCase().includes(q) ||
        b.admission_number.toLowerCase().includes(q) ||
        b.ward_bed.toLowerCase().includes(q)
      );
    });
  }, [inpatientBills, searchFilter]);

  const handleAddSpecialService = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const rate = parseFloat(specialServiceForm.rate) || 0;
    const qty = parseInt(specialServiceForm.qty) || 1;
    const totalAdded = rate * qty;
    if (totalAdded <= 0) return;

    setInpatientBills(prev =>
      prev.map(p =>
        p.id === selectedPatient.id
          ? {
              ...p,
              procedure_charges: (p.procedure_charges || 0) + totalAdded,
              special_services: [
                ...(p.special_services || []),
                { name: specialServiceForm.name, rate, qty, total: totalAdded, date: new Date().toISOString() }
              ]
            }
          : p
      )
    );

    setSelectedPatient(prev => ({
      ...prev,
      procedure_charges: (prev.procedure_charges || 0) + totalAdded,
      special_services: [
        ...(prev.special_services || []),
        { name: specialServiceForm.name, rate, qty, total: totalAdded, date: new Date().toISOString() }
      ]
    }));

    setIsSpecialServiceModalOpen(false);
    setSuccessBanner(`Special service '${specialServiceForm.name}' of ${formatINR(totalAdded)} billed to ${selectedPatient.patient_name}.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    const receiptNo = `RCP-IPD-${Date.now().toString().slice(-6)}`;
    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      receipt_number: receiptNo,
      bill_number: selectedPatient.bill_number,
      admission_number: selectedPatient.admission_number,
      patient_id: selectedPatient.patient_uhid,
      patient_name: selectedPatient.patient_name,
      patient_uhid: selectedPatient.patient_uhid,
      amount: amt,
      payment_mode: paymentMode.toUpperCase(),
      timestamp: new Date().toISOString(),
      cashier_id: 'CSH-01',
      status: 'valid'
    };

    // Save to shared context payments ledger without overwriting history
    if (typeof updatePayments === 'function') {
      updatePayments(prev => [newPaymentRecord, ...(prev || [])]);
    }

    setInpatientBills(prev =>
      prev.map(p =>
        p.id === selectedPatient.id
          ? { ...p, interim_payments: (p.interim_payments || 0) + amt }
          : p
      )
    );

    setSelectedPatient(prev => ({
      ...prev,
      interim_payments: (prev.interim_payments || 0) + amt
    }));

    setIsPaymentModalOpen(false);
    setSuccessBanner(`Interim payment receipt ${receiptNo} for ${formatINR(amt)} issued to ${selectedPatient.patient_name}.`);
    setTimeout(() => setSuccessBanner(null), 4000);

    if (onOpenReceiptModal) {
      onOpenReceiptModal({
        ...newPaymentRecord,
        title: 'Inpatient Interim Payment Receipt',
        total_amount: amt,
        paid_amount: amt
      });
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
            <Badge variant="teal" size="sm">Submodule 4.2</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              IPD Running & Interim Bill Workbench
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Real-time tracking of active inpatient accrued tariffs, doctor rounds, ward nursing, pharmacy indents, and advance deposit credit offsets.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Printer}
          onClick={() => setIsStatementModalOpen(true)}
        >
          Print Interim Statement
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

      {/* Main Grid: Active Inpatient Census + Itemized Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        {/* Left Column: Inpatient Census Table */}
        <Card
          title="Active Inpatient Census"
          subtitle="Click on any admitted patient to review live accumulated charges and credits"
          action={
            <div style={{ width: '240px' }}>
              <Input
                placeholder="Search UHID, bed, patient..."
                icon={Search}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredList.map((item) => {
              const totalCharges = calculateTotalCharges(item);
              const netPayable = calculateNetPayable(item);
              const isSelected = selectedPatient.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPatient(item)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                      {item.patient_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {item.patient_uhid} • Adm #{item.admission_number}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '3px' }}>
                      {item.ward_bed} ({item.ward_type}) • Length of stay: {item.days_stay} Days
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Running Total: {formatINR(totalCharges)}</div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: netPayable > 0 ? 'var(--color-error)' : 'var(--color-success)', marginTop: '2px' }}>
                      {netPayable > 0 ? `Due: ${formatINR(netPayable)}` : 'Surplus Credit'}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '2px' }}>
                      Advances: {formatINR(item.advance_paid + (item.interim_payments || 0))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Itemized Charge Breakdown of Selected Inpatient */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title={`Itemized Breakdown: ${selectedPatient.patient_name}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Room & Bed Tariff ({roomCalculation.totalDays} Days Accrued):</span>
                  <span style={{ fontWeight: '700' }}>{formatINR(roomCalculation.totalRoomCharges)}</span>
                </div>
                {roomCalculation.staysBreakdown.length > 1 && (
                  <div style={{ marginTop: '6px', padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '4px', fontSize: '0.74rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      Ward Transfer Stay Segments:
                    </div>
                    {roomCalculation.staysBreakdown.map(s => (
                      <div key={s.wardCode} style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563', padding: '2px 0' }}>
                        <span>• {s.wardName} ({s.daysCharged}d @ {formatINR(s.dailyRate)}):</span>
                        <span>{formatINR(s.totalCharge)}</span>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '4px', fontStyle: 'italic' }}>
                      Transfer Day (18 Oct 2026): Billed once at midnight census location ({roomCalculation.staysBreakdown[1]?.wardName || 'General Ward'})
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Physician & Specialist Rounds:</span>
                <span style={{ fontWeight: '600' }}>{formatINR(selectedPatient.nursing_charges)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Surgical / Procedures & OT:</span>
                <span style={{ fontWeight: '600' }}>{formatINR(selectedPatient.procedure_charges)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Pathology & Imaging (Lab/USG):</span>
                <span style={{ fontWeight: '600' }}>{formatINR(selectedPatient.lab_charges)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Inpatient Pharmacy & Consumables:</span>
                <span style={{ fontWeight: '600' }}>{formatINR(selectedPatient.pharmacy_charges)}</span>
              </div>

              {/* Credits */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#059669' }}>
                <span>Less: Initial Pre-Admission Advance:</span>
                <span>-{formatINR(selectedPatient.advance_paid)}</span>
              </div>
              {selectedPatient.interim_payments > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#059669' }}>
                  <span>Less: Interim Payments Collected:</span>
                  <span>-{formatINR(selectedPatient.interim_payments)}</span>
                </div>
              )}

              {/* Net Payable */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #111827',
                  paddingTop: '10px',
                  marginTop: '6px',
                  fontWeight: '800',
                  fontSize: '1.05rem'
                }}
              >
                <span>CURRENT OUTSTANDING:</span>
                <span style={{ color: calculateNetPayable(selectedPatient) > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                  {formatINR(calculateNetPayable(selectedPatient))}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px', marginTop: '16px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => setIsStatementModalOpen(true)}
              >
                Statement
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsSpecialServiceModalOpen(true)}
              >
                + Special Service
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Record Interim Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Interim Inpatient Payment"
        size="md"
      >
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '4px', fontSize: '0.8rem' }}>
            <div>Patient: <strong>{selectedPatient.patient_name}</strong> ({selectedPatient.patient_uhid})</div>
            <div>Admission No: {selectedPatient.admission_number} • Bed: {selectedPatient.ward_bed}</div>
          </div>

          <Input
            label="Payment Amount (₹)"
            type="number"
            min="100"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
          />

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
            >
              <option value="card">Credit / Debit Card</option>
              <option value="upi">UPI / Dynamic QR</option>
              <option value="cash">Cash Counter</option>
              <option value="neft">NEFT / RTGS Remittance</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Credit {formatINR(parseFloat(paymentAmount) || 0)} & Issue Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Statement Modal */}
      <Modal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        title="Inpatient Running Interim Account Statement"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            id="ipd-printable-statement"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5,
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal, #0A4174)', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 2px', fontSize: '1.25rem', color: 'var(--color-primary-teal, #0A4174)', fontWeight: '800' }}>
                  SARJI GROUP OF HOSPITALS
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Inpatient Services & Critical Care Billing Department</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>INTERIM ACCOUNT STATEMENT</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', marginBottom: '14px', fontSize: '0.78rem' }}>
              <div><strong>Patient Name:</strong> {selectedPatient.patient_name}</div>
              <div><strong>UHID:</strong> {selectedPatient.patient_uhid}</div>
              <div><strong>Admission No:</strong> {selectedPatient.admission_number}</div>
              <div><strong>Ward / Bed:</strong> {selectedPatient.ward_bed} ({selectedPatient.ward_type})</div>
              <div><strong>Admission Date:</strong> {formatDateIN(selectedPatient.admission_date)}</div>
              <div><strong>Attending Consultant:</strong> {selectedPatient.attending_doc}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Service Head / Charge Category</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>
                    <div>Room & Nursing Bed Tariff ({roomCalculation.totalDays} Days)</div>
                    {roomCalculation.staysBreakdown.length > 1 && (
                      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '2px' }}>
                        {roomCalculation.staysBreakdown.map(s => `${s.wardName}: ${s.daysCharged} days @ ${formatINR(s.dailyRate)}`).join(' | ')}
                        <br/>
                        <em>Transfer date (18 Oct 2026): Charged once at midnight census location tariff without duplicate charge</em>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: '6px', fontWeight: '600' }}>{formatINR(roomCalculation.totalRoomCharges)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Consultant & Medical Officer Daily Visits</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(selectedPatient.nursing_charges)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Procedures, Surgical Intervention & Anesthesia</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(selectedPatient.procedure_charges)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Pathology Laboratory & Radiology Scans</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(selectedPatient.lab_charges)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Inpatient Pharmacy & Consumables Issues</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(selectedPatient.pharmacy_charges)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', borderTop: '1px dashed #9CA3AF', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Running Bill:</span>
                <span style={{ fontWeight: '700' }}>{formatINR(calculateTotalCharges(selectedPatient))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Total Advances & Credits Deposited:</span>
                <span>-{formatINR(selectedPatient.advance_paid + (selectedPatient.interim_payments || 0))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.95rem', borderTop: '1.5px solid #111827', paddingTop: '6px', marginTop: '4px' }}>
                <span>NET CURRENT OUTSTANDING:</span>
                <span style={{ color: calculateNetPayable(selectedPatient) > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                  {formatINR(calculateNetPayable(selectedPatient))}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsStatementModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Special Service Modal */}
      {isSpecialServiceModalOpen && (
        <Modal
          isOpen={isSpecialServiceModalOpen}
          onClose={() => setIsSpecialServiceModalOpen(false)}
          title="Add Special Clinical Service to Running Bill"
          subtitle={`Billing service to ${selectedPatient.patient_name} (${selectedPatient.ward_bed})`}
          maxWidth="500px"
        >
          <form onSubmit={handleAddSpecialService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Service Description"
              required
              value={specialServiceForm.name}
              onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, name: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Tariff / Unit Rate (₹)"
                type="number"
                min="1"
                required
                value={specialServiceForm.rate}
                onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, rate: e.target.value })}
              />

              <Input
                label="Quantity / Units"
                type="number"
                min="1"
                required
                value={specialServiceForm.qty}
                onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, qty: e.target.value })}
              />
            </div>

            <Input
              label="Clinical Remarks / Prescribing Doctor"
              value={specialServiceForm.notes}
              onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, notes: e.target.value })}
            />

            <div style={{ padding: '10px 14px', backgroundColor: '#F8FBFB', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Net Accrued Charge:</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                {formatINR((parseFloat(specialServiceForm.rate) || 0) * (parseInt(specialServiceForm.qty) || 1))}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsSpecialServiceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Add to Running Bill
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
