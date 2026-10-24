const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../client/src/components/billing/operations/IpdRunningBillView.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize CRLF to LF for reliable multi-line replacements
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add stays to DEFAULT_IPD_RUNNING[0]
const oldPatient1 = `  {
    id: 'ipd-01',
    bill_number: 'IPD-RUN-0021',
    patient_name: 'Aniruddha Sen',
    patient_uhid: 'UHID-2026-0640',
    admission_number: 'ADM-2026-0048',
    admission_date: '2026-10-18',
    ward_bed: 'ICU Bed 02',
    ward_type: 'Intensive Care Unit (ICU)',
    days_stay: 4,
    attending_doc: 'Dr. Arindam Mitra (Cardiothoracic)',
    room_charges: 24000,
    pharmacy_charges: 18400,
    procedure_charges: 35000,
    lab_charges: 12500,
    nursing_charges: 6000,
    advance_paid: 50000,
    interim_payments: 15000,
    status: 'active'
  },`;

const newPatient1 = `  {
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
  },`;

if (!content.includes(oldPatient1)) {
  console.error('ERROR: oldPatient1 not found');
  process.exit(1);
}
content = content.replace(oldPatient1, newPatient1);

// 2. Add stays to patient 2 and patient 3
const oldPatient2 = `    interim_payments: 0,
    status: 'active'
  },
  {
    id: 'ipd-03',`;

const newPatient2 = `    interim_payments: 0,
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
    id: 'ipd-03',`;

content = content.replace(oldPatient2, newPatient2);

const oldPatient3 = `    interim_payments: 0,
    status: 'active'
  }
];`;

const newPatient3 = `    interim_payments: 0,
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
];`;

content = content.replace(oldPatient3, newPatient3);

// 3. Update component hook calls and calculations
const oldHookStart = `export function IpdRunningBillView({ onOpenReceiptModal }) {
  const [inpatientBills, setInpatientBills] = useState(DEFAULT_IPD_RUNNING);
  const [selectedPatient, setSelectedPatient] = useState(DEFAULT_IPD_RUNNING[0]);`;

const newHookStart = `export function IpdRunningBillView({ onOpenReceiptModal }) {
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
  }, [selectedPatient, roomBillingPolicy]);`;

if (!content.includes(oldHookStart)) {
  console.error('ERROR: oldHookStart not found');
  process.exit(1);
}
content = content.replace(oldHookStart, newHookStart);

// 4. Update calculateTotalCharges to use dynamic room charges for selected patient
const oldCalcTotal = `  const calculateTotalCharges = (item) => {
    return (
      (item.room_charges || 0) +
      (item.pharmacy_charges || 0) +
      (item.procedure_charges || 0) +
      (item.lab_charges || 0) +
      (item.nursing_charges || 0)
    );
  };`;

const newCalcTotal = `  const calculateTotalCharges = (item) => {
    const roomCost = (item.id === selectedPatient?.id && roomCalculation.totalRoomCharges > 0)
      ? roomCalculation.totalRoomCharges
      : (item.room_charges || 0);
    return (
      roomCost +
      (item.pharmacy_charges || 0) +
      (item.procedure_charges || 0) +
      (item.lab_charges || 0) +
      (item.nursing_charges || 0)
    );
  };`;

content = content.replace(oldCalcTotal, newCalcTotal);

// 5. Update handleRecordPayment to create explicit payment receipt and append to context
const oldHandlePayment = `  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

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
    setSuccessBanner(\`Interim payment of \${formatINR(amt)} credited to \${selectedPatient.patient_name}.\`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };`;

const newHandlePayment = `  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    const receiptNo = \`RCP-IPD-\${Date.now().toString().slice(-6)}\`;
    const newPaymentRecord = {
      id: \`pay-\${Date.now()}\`,
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
    setSuccessBanner(\`Interim payment receipt \${receiptNo} for \${formatINR(amt)} issued to \${selectedPatient.patient_name}.\`);
    setTimeout(() => setSuccessBanner(null), 4000);

    if (onOpenReceiptModal) {
      onOpenReceiptModal({
        ...newPaymentRecord,
        title: 'Inpatient Interim Payment Receipt',
        total_amount: amt,
        paid_amount: amt
      });
    }
  };`;

content = content.replace(oldHandlePayment, newHandlePayment);

// 6. Update itemized breakdown card room display
const oldRoomDisplay = `              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Room & Bed Charges ({selectedPatient.days_stay} Days):</span>
                <span style={{ fontWeight: '600' }}>{formatINR(selectedPatient.room_charges)}</span>
              </div>`;

const newRoomDisplay = `              <div style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
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
              </div>`;

content = content.replace(oldRoomDisplay, newRoomDisplay);

// 7. Update printable statement table
const oldStatementRoom = `                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Room & Nursing Bed Tariff ({selectedPatient.days_stay} Days)</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatINR(selectedPatient.room_charges)}</td>
                </tr>`;

const newStatementRoom = `                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>
                    <div>Room & Nursing Bed Tariff ({roomCalculation.totalDays} Days)</div>
                    {roomCalculation.staysBreakdown.length > 1 && (
                      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '2px' }}>
                        {roomCalculation.staysBreakdown.map(s => \`\${s.wardName}: \${s.daysCharged} days @ \${formatINR(s.dailyRate)}\`).join(' | ')}
                        <br/>
                        <em>Transfer date (18 Oct 2026): Charged once at midnight census location tariff without duplicate charge</em>
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: '6px', fontWeight: '600' }}>{formatINR(roomCalculation.totalRoomCharges)}</td>
                </tr>`;

content = content.replace(oldStatementRoom, newStatementRoom);

// Restore original line endings if CRLF
if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated IpdRunningBillView.jsx!');
