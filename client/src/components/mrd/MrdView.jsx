import React, { useState, useEffect } from 'react';
import {
  Archive,
  FileText,
  Award,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';

const MRD_SUBMODULES = [
  {
    id: '20.1',
    label: 'Physical File Archival & Rack Tracking',
    icon: Archive,
    subsubmodules: [
      { id: '20.1.1', label: '48-Hour Inpatient File Inward Transfer' },
      { id: '20.1.2', label: 'File Completeness Inspection' },
      { id: '20.1.3', label: 'Physical Coordinate Assignment' },
      { id: '20.1.4', label: 'Permanent Record Room Archival Status' }
    ]
  },
  {
    id: '20.2',
    label: 'ICD-10 & CPT Clinical Coding',
    icon: FileText,
    subsubmodules: [
      { id: '20.2.1', label: 'Operative & Discharge Summary Review' },
      { id: '20.2.2', label: 'Primary Cause ICD-10-CM Mapping' },
      { id: '20.2.3', label: 'Surgical Procedure CPT / PCS Mapping' },
      { id: '20.2.4', label: 'Morbidity Statistics & Disease Indexing' }
    ]
  },
  {
    id: '20.3',
    label: 'Birth & Death Registration',
    icon: Award,
    subsubmodules: [
      { id: '20.3.1', label: 'Obstetric Birth Intimation & Baby ID' },
      { id: '20.3.2', label: 'Form 4 / 4A Medical Cause of Death' }
    ]
  },
  {
    id: '20.4',
    label: 'File Checkout & Audit Lending',
    icon: BookOpen,
    subsubmodules: [
      { id: '20.4.1', label: 'Authorized Requisition & Subpoena Intake' },
      { id: '20.4.2', label: 'Checkout Logging & Return Deadlines' },
      { id: '20.4.3', label: 'Overdue Loan Tracking & Reminder Alerts' }
    ]
  }
];

export function MrdView({ initialSubtab = '20.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('20.')) return initialSubtab;
    return '20.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = MRD_SUBMODULES.find(s => s.id === (initialSubtab || '20.1'));
    return parent?.subsubmodules[0]?.id || '20.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('mrd:', '');
      if (MRD_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || MRD_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`mrd:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`mrd:${activeSubtab}:${subsubId}`);
    }
  };

  const [files] = useState([
    {
      caseNo: 'MRD-2026-1049',
      uhid: 'UHID-2026-0188',
      patientName: 'Ramesh Patel',
      admissionDate: '14 Oct 2026',
      dischargeDate: '19 Oct 2026',
      department: 'Cardiology (CABG x3)',
      rackCoordinate: 'Rack-04 • Shelf-B • Box-118',
      icd10: 'I25.10 (CAD) + Z95.1',
      completeness: '100% Verified',
      status: 'Archived Permanent'
    },
    {
      caseNo: 'MRD-2026-1050',
      uhid: 'UHID-2026-0304',
      patientName: 'Shalini Verma',
      admissionDate: '17 Oct 2026',
      dischargeDate: '21 Oct 2026',
      department: 'Obstetrics (LSCS Delivery)',
      rackCoordinate: 'Rack-02 • Shelf-E • Box-044',
      icd10: 'O82.0 (Cesarean Section) + Z37.0',
      completeness: 'Birth Form Attached',
      status: 'Archived Permanent'
    },
    {
      caseNo: 'MRD-2026-1051',
      uhid: 'UHID-2026-0792',
      patientName: 'Anand Kumar',
      admissionDate: '20 Oct 2026',
      dischargeDate: '22 Oct 2026',
      department: 'Neurology (Ischemic Stroke)',
      rackCoordinate: 'Transit Holding Bin #3',
      icd10: 'Pending Audit Review',
      completeness: '92% (Doctor Signature Pending)',
      status: '48h Inward Transfer Review'
    }
  ]);

  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Enterprise Header Banner */}
      <div
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(8, 127, 140, 0.15)'
              }}
            >
              <Archive size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Medical Records Department (MRD) & Physical Archival
                </h1>
                <Badge variant="teal">NABH / ISO 15489 Standard</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                Inpatient case sheet custody management: 48-hour discharge file inward transfers, physical rack coordinates, ICD-10 clinical coding, statutory birth/death certifications, and audit checkout logs.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.25)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: '600',
              color: 'var(--color-primary-teal)'
            }}
          >
            <ShieldCheck size={16} color="var(--color-success)" />
            Compactor File Custody Active
          </div>
        </div>

        {/* Level 2 Submodule Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--color-border)',
            overflowX: 'auto',
            paddingBottom: '2px',
            marginTop: '8px'
          }}
        >
          {MRD_SUBMODULES.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSubtab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                  borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginBottom: '-1.5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level 3 Subsubmodule Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflows:
          </span>
          {MRD_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
            const isSubsubActive = activeSubsubtab === subsub.id;
            return (
              <button
                key={subsub.id}
                type="button"
                onClick={() => handleSelectSubsubtab(subsub.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSubsubActive ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSubsubActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSubsubActive ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'
                  }}
                />
                {subsub.label}
              </button>
            );
          })}
        </div>
      </div>

      {toastMessage && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid var(--color-primary-teal)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-teal)', fontWeight: '600', fontSize: '0.88rem' }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Submodule Views */}
      {activeSubtab === '20.1' && (
        <Card title="20.1 Inpatient Case Sheet Archival & Compactor Coordinates">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="primary" icon={Plus}>Receive Discharged File (Ward Inward)</Button>
                <Button size="sm" variant="outline" icon={Printer}>Print Compactor Box Barcode</Button>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Permanent Archival Compliance Rate: <strong>98.4% within 48 Hours</strong>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F6F6', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px' }}>MRD Case No.</th>
                  <th style={{ padding: '8px 12px' }}>Patient Details</th>
                  <th style={{ padding: '8px 12px' }}>Discharge Date</th>
                  <th style={{ padding: '8px 12px' }}>Compactor Coordinate</th>
                  <th style={{ padding: '8px 12px' }}>Completeness Audit</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{f.caseNo}</td>
                    <td style={{ padding: '10px 12px' }}>{f.patientName} ({f.uhid})</td>
                    <td style={{ padding: '10px 12px' }}>{f.dischargeDate}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{f.rackCoordinate}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={f.completeness.includes('100%') ? 'teal' : 'warning'}>{f.completeness}</Badge>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={f.status.includes('Permanent') ? 'teal' : 'info'}>{f.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubtab === '20.2' && (
        <Card title="20.2 ICD-10-CM & CPT Morbidity Coding Console">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>Coding Review Case: Ramesh Patel (UHID-2026-0188)</h4>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Principal Diagnosis</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>I25.10 — Atherosclerotic heart disease of native coronary artery</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Surgical CPT Procedure</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>33533 — Coronary artery bypass, using arterial graft(s); single arterial graft</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Secondary Comorbidities</span>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>E11.9 (Type 2 Diabetes) • I10 (Essential Hypertension)</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-primary-teal)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
              <h4 style={{ margin: '0 0 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>WHO & National Health Authority Morbidity Index</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Coding validation enforces dual-coder verification. Once certified, codes link to insurance dossier submission and hospital epidemiological disease indexing.
              </p>
              <div style={{ marginTop: '14px' }}>
                <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => triggerToast('ICD-10 & CPT Clinical Codes Certified and Pushed to National Morbidity Registry')}>
                  Certify & Finalize Coding
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '20.3' && (
        <Card title="20.3 Civil Registration System: Birth & Death Intimations">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-primary-teal)' }}>Statutory Birth Registration</h4>
                <Badge variant="teal">Form 1 Municipal</Badge>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Latest Birth: <strong>Baby of Shalini Verma (Female • 3.2 kg)</strong></div>
                <div>Time of Birth: <strong>20 Oct 2026 at 04:22 AM</strong></div>
                <div>Municipal Intimation No: <strong>MUNI-KOL-2026-B-08912</strong></div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Button size="xs" variant="primary" icon={Printer}>Print Official Birth Intimation</Button>
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-primary)' }}>Medical Certificate of Cause of Death</h4>
                <Badge variant="danger">Form 4 / 4A</Badge>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Attending Doctor Sign-off: <strong>Mandatory Clinician Digital Signature</strong></div>
                <div>Underlying & Immediate Causes: <strong>Pre-filled from EMR Death Note</strong></div>
                <div>Statutory Timeline: <strong>Submission within 21 Days to Registrar</strong></div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Button size="xs" variant="outline" icon={FileText}>Generate Form 4A Certificate</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '20.4' && (
        <Card title="20.4 Physical File Loan Checkout & Lending Audit Log">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="primary" icon={Plus}>Record New File Checkout</Button>
                <Button size="sm" variant="outline" icon={AlertTriangle}>View Overdue Alerts (2 Overdue)</Button>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Active Checked Out Files: <strong>8 Files Currently on Loan</strong>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F6F6', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px' }}>File No.</th>
                  <th style={{ padding: '8px 12px' }}>Borrower / Department</th>
                  <th style={{ padding: '8px 12px' }}>Purpose of Loan</th>
                  <th style={{ padding: '8px 12px' }}>Checkout Date</th>
                  <th style={{ padding: '8px 12px' }}>Return Deadline</th>
                  <th style={{ padding: '8px 12px' }}>Loan Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { file: 'MRD-2026-0922', borrower: 'TPA Desk (Mr. Saurav)', purpose: 'Insurance Query Dossier Audit', date: '21 Oct 2026', due: '24 Oct 2026 (Today)', status: 'Active Loan' },
                  { file: 'MRD-2025-8810', borrower: 'Legal Cell (Adv. Banerjee)', purpose: 'Court Subpoena Representation', date: '12 Oct 2026', due: '19 Oct 2026', status: 'OVERDUE (3 Days)' }
                ].map((l, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: l.status.includes('OVERDUE') ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{l.file}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{l.borrower}</td>
                    <td style={{ padding: '10px 12px' }}>{l.purpose}</td>
                    <td style={{ padding: '10px 12px' }}>{l.date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: l.status.includes('OVERDUE') ? '#DC2626' : 'var(--color-text-primary)' }}>{l.due}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={l.status.includes('OVERDUE') ? 'danger' : 'teal'}>{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
