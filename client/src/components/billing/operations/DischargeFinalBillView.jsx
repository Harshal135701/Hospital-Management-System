import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Check,
  Tag,
  Receipt
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../../utils/formatters';

const DEFAULT_DISCHARGE_PATIENTS = [
  {
    id: 'dis-01',
    bill_number: 'DIS-2026-0104',
    patient_name: 'Suresh Chandra Pal',
    patient_uhid: 'UHID-2026-0511',
    admission_number: 'ADM-2026-0044',
    admission_date: '2026-10-15',
    discharge_date: '2026-10-22',
    ward_bed: 'Surgical Step-Down 104',
    attending_doc: 'Dr. Ananya Sharma (General Surgery)',
    diagnosis: 'Acute Calculous Cholecystitis s/p Laparoscopic Cholecystectomy',
    tpa_name: 'Star Health & Allied Insurance',
    tpa_policy_no: 'SH-POL-2026-89102',
    gross_amount: 145000,
    tpa_approved: 120000,
    co_payment: 15000,
    non_medical: 10000,
    deposits_paid: 25000,
    final_payable: 0,
    refundable_surplus: 0,
    status: 'settled',
    clearances: {
      pharmacy: true,
      bloodbank: true,
      nursing: true,
      counselor: true
    }
  },
  {
    id: 'dis-02',
    bill_number: 'DIS-2026-0105',
    patient_name: 'Rita Banerjee',
    patient_uhid: 'UHID-2026-0480',
    admission_number: 'ADM-2026-0046',
    admission_date: '2026-10-17',
    discharge_date: '2026-10-22',
    ward_bed: 'Gynae Post-Op 302',
    attending_doc: 'Dr. Arindam Mitra (Reproductive & Gynae)',
    diagnosis: 'Total Laparoscopic Hysterectomy with Bilateral Salpingo-Oophorectomy',
    tpa_name: 'Cash / Non-Insurance Self Pay',
    tpa_policy_no: 'N/A',
    gross_amount: 88000,
    tpa_approved: 0,
    co_payment: 0,
    non_medical: 0,
    deposits_paid: 75000,
    final_payable: 13000,
    refundable_surplus: 0,
    status: 'pending_settlement',
    clearances: {
      pharmacy: true,
      bloodbank: true,
      nursing: true,
      counselor: true
    }
  }
];

export function DischargeFinalBillView({ onOpenReceiptModal }) {
  const [dischargeCases, setDischargeCases] = useState(DEFAULT_DISCHARGE_PATIENTS);
  const [selectedCase, setSelectedCase] = useState(DEFAULT_DISCHARGE_PATIENTS[1]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  const handleConfirmFinalSettlement = () => {
    setDischargeCases(prev =>
      prev.map(c =>
        c.id === selectedCase.id
          ? { ...c, status: 'settled', final_payable: 0 }
          : c
      )
    );
    setSelectedCase(prev => ({ ...prev, status: 'settled', final_payable: 0 }));
    setIsFinalizeModalOpen(false);
    setSuccessBanner(`Discharge Bill for ${selectedCase.patient_name} finalized & Gate Pass generated.`);
    setTimeout(() => setSuccessBanner(null), 4500);
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
            <Badge variant="teal" size="sm">Submodule 4.3</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Inpatient Discharge Final Billing & Clearance
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Comprehensive discharge bill compilation, TPA cashless deduction, departmental NOC checklist, and gate pass generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            Final Tax Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => setIsGatePassModalOpen(true)}
          >
            Discharge Gate Pass
          </Button>
        </div>
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

      {/* Main Grid: Discharge Queue + Final Settlement Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '20px' }}>
        {/* Left Column: Discharge Queue List */}
        <Card
          title="Discharge-Ready Patients List"
          subtitle="Patients marked medically ready for discharge by attending consultants"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dischargeCases.map((c) => {
              const isSelected = selectedCase.id === c.id;
              const isSettled = c.status === 'settled';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
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
                      {c.patient_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {c.patient_uhid} • Bill #{c.bill_number}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '3px' }}>
                      {c.ward_bed} • Disch: {formatDateIN(c.discharge_date)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <Badge variant={isSettled ? 'success' : 'warning'} size="sm">
                      {isSettled ? 'Fully Settled' : 'Pending Payment'}
                    </Badge>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: c.final_payable > 0 ? 'var(--color-error)' : '#111827', marginTop: '4px' }}>
                      {c.final_payable > 0 ? `Payable: ${formatINR(c.final_payable)}` : 'Cleared (₹0)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Final Account Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title={`Discharge Financial Ledger: ${selectedCase.patient_name}`}>
            {/* Clearance Checklist */}
            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', marginBottom: '14px', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: '700', color: '#166534', marginBottom: '6px' }}>Mandatory Departmental Clearance (NOC):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D' }}>
                  <CheckCircle2 size={14} /> Pharmacy Returns Accepted
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D' }}>
                  <CheckCircle2 size={14} /> Blood Bank Crossmatch Return Done
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D' }}>
                  <CheckCircle2 size={14} /> Ward Nursing Clearance Cleared
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D' }}>
                  <CheckCircle2 size={14} /> Consultant Medical Summary Signed
                </div>
              </div>
            </div>

            {/* Financial Ledger Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span>Gross Hospital Itemized Charges:</span>
                <span style={{ fontWeight: '700' }}>{formatINR(selectedCase.gross_amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#0369A1' }}>
                <span>Less: TPA Insurance Approved Cashless ({selectedCase.tpa_name}):</span>
                <span>-{formatINR(selectedCase.tpa_approved)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#059669' }}>
                <span>Less: Total Advance Deposits Credited:</span>
                <span>-{formatINR(selectedCase.deposits_paid)}</span>
              </div>

              {selectedCase.co_payment > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#B45309' }}>
                  <span>Patient Co-Payment / Deductible:</span>
                  <span>+{formatINR(selectedCase.co_payment)}</span>
                </div>
              )}
              {selectedCase.non_medical > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#B45309' }}>
                  <span>Non-Medical Excluded Expenses:</span>
                  <span>+{formatINR(selectedCase.non_medical)}</span>
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
                  fontSize: '1.1rem'
                }}
              >
                <span>FINAL PATIENT PAYABLE:</span>
                <span style={{ color: selectedCase.final_payable > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                  {formatINR(selectedCase.final_payable)}
                </span>
              </div>
            </div>

            {/* Finalize Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              {selectedCase.status !== 'settled' ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  style={{ width: '100%' }}
                  onClick={() => setIsFinalizeModalOpen(true)}
                >
                  Collect {formatINR(selectedCase.final_payable)} & Settle Discharge
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  icon={Printer}
                  style={{ width: '100%' }}
                  onClick={() => setIsGatePassModalOpen(true)}
                >
                  Print Discharge Security Gate Pass
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        title="Confirm Consequential Discharge Finalization"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
          <p style={{ margin: 0 }}>
            Are you sure you want to finalize the discharge billing for <strong>{selectedCase.patient_name}</strong> (UHID: {selectedCase.patient_uhid})?
          </p>
          <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '4px', border: '1px solid #FDE68A', color: '#92400E' }}>
            This action will lock all inpatient charges, mark bed <strong>{selectedCase.ward_bed}</strong> as pending turnover sanitation, and issue the permanent electronic Gate Pass.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsFinalizeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmFinalSettlement}>
              Confirm Settlement & Issue Gate Pass
            </Button>
          </div>
        </div>
      </Modal>

      {/* Gate Pass Modal */}
      <Modal
        isOpen={isGatePassModalOpen}
        onClose={() => setIsGatePassModalOpen(false)}
        title="Discharge Security Gate Pass"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            id="gatepass-printable"
            style={{
              padding: '20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #111827',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.45
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '8px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '900', fontSize: '1rem' }}>SARJI GROUP OF HOSPITALS</div>
              <div style={{ fontSize: '0.7rem' }}>HOSPITAL SECURITY & PATIENT DISCHARGE CLEARANCE GATE PASS</div>
              <div style={{ fontWeight: '800', color: '#059669', marginTop: '4px' }}>[ ALL CHARGES SETTLED - AUTHORIZED TO LEAVE ]</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '12px' }}>
              <div><strong>Patient Name:</strong> {selectedCase.patient_name}</div>
              <div><strong>UHID:</strong> {selectedCase.patient_uhid}</div>
              <div><strong>Admission No:</strong> {selectedCase.admission_number}</div>
              <div><strong>Discharged From:</strong> {selectedCase.ward_bed}</div>
              <div><strong>Admission Date:</strong> {formatDateIN(selectedCase.admission_date)}</div>
              <div><strong>Discharge Date:</strong> {formatDateIN(selectedCase.discharge_date)}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Attending Consultant:</strong> {selectedCase.attending_doc}</div>
            </div>

            <div style={{ borderTop: '1px dashed #9CA3AF', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '16px' }}>
              <div>
                <div>Cashier Signature: <strong>S. Roy (CSH-04)</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Financial Clearances OK</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Nursing Supervisor: <strong>Sister In-Charge</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Cannula & Meds Handover OK</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsGatePassModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Gate Pass
            </Button>
          </div>
        </div>
      </Modal>

      {/* Final Detailed Tax Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Comprehensive Discharge Tax Invoice"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            id="final-printable-invoice"
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
                <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Main Clinical Campus, Plot 14, Sector 5, Kolkata 700091</div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>GSTIN: 19AAACA8912E1Z8 | Clinical Est. Reg: WB/KOL/2021/041</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>FINAL INPATIENT DISCHARGE INVOICE</div>
                <div style={{ fontSize: '0.75rem', color: '#111827' }}>Bill #: {selectedCase.bill_number}</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Date: {formatDateIN(selectedCase.discharge_date)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', marginBottom: '14px', fontSize: '0.78rem' }}>
              <div><strong>Patient Name:</strong> {selectedCase.patient_name}</div>
              <div><strong>UHID:</strong> {selectedCase.patient_uhid}</div>
              <div><strong>Admission Reference:</strong> {selectedCase.admission_number}</div>
              <div><strong>Ward / Room:</strong> {selectedCase.ward_bed}</div>
              <div><strong>Primary Diagnosis:</strong> {selectedCase.diagnosis}</div>
              <div><strong>TPA / Sponsor:</strong> {selectedCase.tpa_name}</div>
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
                  <td style={{ padding: '6px' }}>Accommodation, Nursing Care & Routine Bed Tariffs</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>₹32,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Professional Surgeon, Anesthetist & Daily Consultant Fees</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>₹48,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Operation Theatre, Resuscitation & Equipment Charges</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>₹25,000.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Pathology Investigations, Serology & Diagnostic Radiology</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>₹16,500.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Inpatient Pharmacy Drugs & Surgical Consumables</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>₹23,500.00</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', borderTop: '1px dashed #9CA3AF', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Hospital Total:</span>
                <span style={{ fontWeight: '700' }}>{formatINR(selectedCase.gross_amount)}</span>
              </div>
              {selectedCase.tpa_approved > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0369A1' }}>
                  <span>TPA Cashless Pre-Auth Settlement ({selectedCase.tpa_name}):</span>
                  <span>-{formatINR(selectedCase.tpa_approved)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Total Advance Deposits Applied:</span>
                <span>-{formatINR(selectedCase.deposits_paid)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.95rem', borderTop: '1.5px solid #111827', paddingTop: '6px', marginTop: '4px' }}>
                <span>FINAL BALANCE PAYABLE:</span>
                <span>{formatINR(selectedCase.final_payable)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsInvoiceModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Tax Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
