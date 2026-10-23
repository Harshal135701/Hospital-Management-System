const fs = require('fs');
const path = require('path');

const normalize = str => str.replace(/\r\n/g, '\n');

// ============================================================================
// 1. AdvanceDepositView.jsx
// ============================================================================
const advFile = path.resolve('client/src/components/billing/operations/AdvanceDepositView.jsx');
let advContent = normalize(fs.readFileSync(advFile, 'utf8'));

// Import useHospitalState
if (!advContent.includes('useHospitalState')) {
  advContent = advContent.replace(
    "import { calculateDepositAvailableBalance, isDuplicateTransaction } from '../../../utils/billingCalculations';",
    "import { calculateDepositAvailableBalance, isDuplicateTransaction } from '../../../utils/billingCalculations';\nimport { useHospitalState } from '../../../context/HospitalStateContext';"
  );
}

// Update form default state
const oldAdvForm = `  // Deposit Form State
  const [form, setForm] = useState({
    patientName: 'Devika Sengupta',
    patientUhid: 'UHID-2026-0814',
    admissionRef: 'ADM-2026-0052',
    amount: '20000',
    depositType: 'Surgery / Procedure Advance',
    paymentMode: 'upi',
    txnRef: 'UPI-TXN-2026-8812',
    remarks: 'Advance deposit towards inpatient clinical bed allocation'
  });`;

const newAdvForm = `  const hospitalState = useHospitalState();
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
  });`;

advContent = advContent.replace(oldAdvForm, newAdvForm);

// Add empty table state in AdvanceDepositView
const oldAdvTbody = `            <tbody>
              {filteredDeposits.map((dep) => (`;

const newAdvTbody = `            <tbody>
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                    No advance deposit records found matching "{searchFilter}".
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (`;

advContent = advContent.replace(oldAdvTbody, newAdvTbody);
// Add closing parenthesis to map
advContent = advContent.replace(
  `                  </td>
                </tr>
              ))}
            </tbody>`,
  `                  </td>
                </tr>
              )))}
            </tbody>`
);

// Add quick admission selector & replace raw select in deposit modal
const oldAdvModalForm = `          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Patient Name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
            />
            <Input
              label="Patient UHID"
              value={form.patientUhid}
              onChange={(e) => setForm({ ...form, patientUhid: e.target.value })}
              required
            />
            <Input
              label="Admission Reference #"
              value={form.admissionRef}
              onChange={(e) => setForm({ ...form, admissionRef: e.target.value })}
              required
            />
            <Input
              label="Advance Amount (₹)"
              type="number"
              min="100"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Payment Method
              </label>
              <select
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
              >
                <option value="upi">UPI Dynamic QR</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Counter</option>
                <option value="neft">NEFT / RTGS Wire</option>
              </select>
            </div>
            <Input
              label="Transaction / Bank Reference ID"
              value={form.txnRef}
              onChange={(e) => setForm({ ...form, txnRef: e.target.value })}
              required
            />
          </div>`;

const newAdvModalForm = `          {inpatientAdmissions.length > 0 && (
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
                  label: \`\${a.admission_number} — \${a.patient_name} (\${a.patient_uhid})\`
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
          </div>`;

advContent = advContent.replace(oldAdvModalForm, newAdvModalForm);
fs.writeFileSync(advFile, advContent, 'utf8');
console.log('AdvanceDepositView.jsx updated successfully');

// ============================================================================
// 2. IpdRunningBillView.jsx
// ============================================================================
const ipdFile = path.resolve('client/src/components/billing/operations/IpdRunningBillView.jsx');
let ipdContent = normalize(fs.readFileSync(ipdFile, 'utf8'));

// Fix calculateTotalCharges so all patients show dynamically calculated room charges
const oldCalcTotal = `  const calculateTotalCharges = (item) => {
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

const newCalcTotal = `  const calculateTotalCharges = (item) => {
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
  };`;

ipdContent = ipdContent.replace(oldCalcTotal, newCalcTotal);

// Replace raw select with <Select> & add overpayment warning in payment modal
const oldIpdPaymentSelect = `          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Payment Channel
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
          </div>`;

const newIpdPaymentSelect = `          <Select
            label="Payment Channel"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            options={[
              { value: 'card', label: 'Credit / Debit Card' },
              { value: 'upi', label: 'UPI / Dynamic QR' },
              { value: 'cash', label: 'Cash Counter' },
              { value: 'neft', label: 'NEFT / RTGS Remittance' }
            ]}
          />

          {parseFloat(paymentAmount) > calculateNetPayable(selectedPatient) && (
            <div style={{ padding: '8px 12px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', color: '#92400E', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>Payment of {formatINR(parseFloat(paymentAmount) || 0)} exceeds net outstanding ({formatINR(calculateNetPayable(selectedPatient))}). Excess will accrue as credit.</span>
            </div>
          )}`;

ipdContent = ipdContent.replace(oldIpdPaymentSelect, newIpdPaymentSelect);
fs.writeFileSync(ipdFile, ipdContent, 'utf8');
console.log('IpdRunningBillView.jsx updated successfully');

// ============================================================================
// 3. MyRefundsView.jsx
// ============================================================================
const refFile = path.resolve('client/src/components/billing/operations/MyRefundsView.jsx');
let refContent = normalize(fs.readFileSync(refFile, 'utf8'));

// Import useHospitalState
if (!refContent.includes('useHospitalState')) {
  refContent = refContent.replace(
    "import { BillingOpsService } from '../../../services/api';",
    "import { BillingOpsService } from '../../../services/api';\nimport { useHospitalState } from '../../../context/HospitalStateContext';"
  );
}

// Update filter tabs to include 'rejected'
refContent = refContent.replace(
  "{['all', 'pending', 'approved', 'processed'].map((st) => (",
  "{['all', 'pending', 'approved', 'processed', 'rejected'].map((st) => ("
);

// Reset form defaults
const oldRefForm = `  // New Refund Form
  const [refundForm, setRefundForm] = useState({
    billNumber: 'OPD-2026-0915',
    patientName: 'Rajesh Narayan Verma',
    patientUhid: 'UHID-2026-0922',
    originalAmount: '800',
    amount: '800',
    reason: 'Duplicate consultation charge paid online',
    paymentMode: 'upi',
    notes: 'Patient requested refund to original UPI VPA'
  });`;

const newRefForm = `  const hospitalState = useHospitalState();
  const contextBills = hospitalState?.bills || [];

  // New Refund Form (Clean empty defaults with guided placeholders)
  const [refundForm, setRefundForm] = useState({
    billNumber: '',
    patientName: '',
    patientUhid: '',
    originalAmount: '',
    amount: '',
    reason: '',
    paymentMode: 'upi',
    notes: ''
  });`;

refContent = refContent.replace(oldRefForm, newRefForm);

// Add empty table state in MyRefundsView
const oldRefTbody = `            <tbody>
              {filteredRefunds.map((ref) => (`;

const newRefTbody = `            <tbody>
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                    No refund dossiers found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref) => (`;

refContent = refContent.replace(oldRefTbody, newRefTbody);
refContent = refContent.replace(
  `                  </td>
                </tr>
              ))}
            </tbody>`,
  `                  </td>
                </tr>
              )))}
            </tbody>`
);

// Replace modal form with bill selector & <Select> primitive
const oldRefModalForm = `          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
              label="Original Settled Amount (₹)"
              type="number"
              value={refundForm.originalAmount}
              onChange={(e) => setRefundForm({ ...refundForm, originalAmount: e.target.value })}
              required
            />
            <div>
              <Input
                label="Requested Refund Amount (₹)"
                type="number"
                value={refundForm.amount}
                onChange={(e) => {
                  setFormError(null);
                  setRefundForm({ ...refundForm, amount: e.target.value });
                }}
                required
              />
              <div style={{ fontSize: '0.73rem', marginTop: '4px', color: currentEligibility.isValid ? '#059669' : '#DC2626' }}>
                {currentEligibility.isValid
                  ? \`Eligible ceiling: \${formatINR(currentEligibility.maxEligible)} (Prior: \${formatINR(currentEligibility.alreadyRefunded)})\`
                  : currentEligibility.reason}
              </div>
            </div>
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
          </div>`;

const newRefModalForm = `          {contextBills.length > 0 && (
            <Select
              label="Quick-Select Settled Bill (Autofills Patient & Amount)"
              value={refundForm.billNumber}
              onChange={(e) => {
                const b = contextBills.find(item => item.bill_number === e.target.value);
                if (b) {
                  setRefundForm(prev => ({
                    ...prev,
                    billNumber: b.bill_number,
                    patientName: b.patient_name || '',
                    patientUhid: b.patient_uhid || '',
                    originalAmount: String(b.gross_total || b.total_amount || b.net_payable || 0),
                    amount: String(b.gross_total || b.total_amount || b.net_payable || 0)
                  }));
                }
              }}
              options={[
                { value: '', label: '-- Select Settled Bill or Enter Manually --' },
                ...contextBills.map(b => ({
                  value: b.bill_number,
                  label: \`\${b.bill_number} — \${b.patient_name} (\${formatINR(b.gross_total || b.total_amount || 0)})\`
                }))
              ]}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Original Invoice / Bill #"
              placeholder="e.g. OPD-2026-0915"
              value={refundForm.billNumber}
              onChange={(e) => setRefundForm({ ...refundForm, billNumber: e.target.value })}
              required
            />
            <Input
              label="Patient Name"
              placeholder="e.g. Rajesh Narayan Verma"
              value={refundForm.patientName}
              onChange={(e) => setRefundForm({ ...refundForm, patientName: e.target.value })}
              required
            />
            <Input
              label="Patient UHID"
              placeholder="e.g. UHID-2026-0922"
              value={refundForm.patientUhid}
              onChange={(e) => setRefundForm({ ...refundForm, patientUhid: e.target.value })}
              required
            />
            <Input
              label="Original Settled Amount (₹)"
              type="number"
              placeholder="e.g. 1500"
              value={refundForm.originalAmount}
              onChange={(e) => setRefundForm({ ...refundForm, originalAmount: e.target.value })}
              required
            />
            <div>
              <Input
                label="Requested Refund Amount (₹)"
                type="number"
                placeholder="e.g. 800"
                value={refundForm.amount}
                onChange={(e) => {
                  setFormError(null);
                  setRefundForm({ ...refundForm, amount: e.target.value });
                }}
                required
              />
              <div style={{ fontSize: '0.73rem', marginTop: '4px', color: currentEligibility.isValid ? '#059669' : '#DC2626' }}>
                {currentEligibility.isValid
                  ? \`Eligible ceiling: \${formatINR(currentEligibility.maxEligible)} (Prior: \${formatINR(currentEligibility.alreadyRefunded)})\`
                  : currentEligibility.reason}
              </div>
            </div>
            <Select
              label="Requested Refund Method"
              value={refundForm.paymentMode}
              onChange={(e) => setRefundForm({ ...refundForm, paymentMode: e.target.value })}
              options={[
                { value: 'upi', label: 'UPI Reversal (Instant)' },
                { value: 'cash', label: 'Cash Voucher Handover' },
                { value: 'bank', label: 'Direct Bank Account NEFT' }
              ]}
            />
          </div>`;

refContent = refContent.replace(oldRefModalForm, newRefModalForm);
fs.writeFileSync(refFile, refContent, 'utf8');
console.log('MyRefundsView.jsx updated successfully');
