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
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';

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

  const [files, setFiles] = useState([
    {
      caseNo: 'MRD-2026-1049',
      uhid: 'UHID-2026-0188',
      patientName: 'Ramesh Patel',
      admissionDate: '14 Oct 2026',
      dischargeDate: '19 Oct 2026',
      department: 'Cardiology (CABG x3)',
      rackCoordinate: 'Rack-04 • Shelf-B • Box-118',
      icd10: 'I25.10 (CAD) + Z95.1',
      cpt: '33533 (Single Arterial CABG)',
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
      cpt: '59510 (Cesarean Delivery)',
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
      cpt: 'Pending Review',
      completeness: '92% (Doctor Signature Pending)',
      status: '48h Inward Transfer Review'
    }
  ]);

  const [loans, setLoans] = useState([
    { file: 'MRD-2026-0922', borrower: 'TPA Desk (Mr. Saurav)', purpose: 'Insurance Query Dossier Audit', date: '21 Oct 2026', due: '24 Oct 2026 (Today)', status: 'Active Loan' },
    { file: 'MRD-2025-8810', borrower: 'Legal Cell (Adv. Banerjee)', purpose: 'Court Subpoena Representation', date: '12 Oct 2026', due: '19 Oct 2026', status: 'OVERDUE (3 Days)' }
  ]);

  const [birthRecords, setBirthRecords] = useState([
    { babyName: 'Baby of Shalini Verma', gender: 'Female', weight: '3.2 kg', time: '20 Oct 2026 at 04:22 AM', regNo: 'MUNI-KOL-2026-B-08912', motherUhid: 'UHID-2026-0304' }
  ]);

  const [deathRecords, setDeathRecords] = useState([
    { deceasedName: 'Hari Prasad Roy', uhid: 'UHID-2026-0112', time: '18 Oct 2026 at 11:45 PM', cause: 'Refractory Septic Shock / MOF', certNo: 'MCCD-FORM4-2026-041' }
  ]);

  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // Forms
  const [inwardForm, setInwardForm] = useState({
    patientName: '',
    uhid: '',
    department: 'Cardiology',
    dischargeDate: '23 Oct 2026',
    rack: 'Rack-04',
    shelf: 'Shelf-C',
    box: 'Box-122',
    dischargeSummarySigned: true,
    otNotesAttached: true,
    consentsVerified: true,
    labReportsBundled: true,
    officer: 'Mr. Pradeep Ghosh (MRD Custodian)'
  });

  const [codingForm, setCodingForm] = useState({
    targetCase: 'MRD-2026-1049',
    principalIcd: 'I25.10 — Atherosclerotic heart disease of native coronary artery',
    secondaryIcd: 'E11.9 (Type 2 Diabetes), I10 (Essential Hypertension)',
    cptCode: '33533 — Coronary artery bypass, single arterial graft',
    coderId: 'CPC-KOL-8841 (Debashis Pal, Lead Coder)',
    drgWeight: '2.418 (High Complexity Severity 3)'
  });

  const [birthForm, setBirthForm] = useState({
    motherName: '',
    motherUhid: '',
    fatherName: '',
    gender: 'Female',
    birthWeight: '3.1',
    deliveryTime: '24 Oct 2026 06:15 AM',
    deliveryMode: 'Normal Vaginal Delivery',
    doctor: 'Dr. Meenakshi S. (Obstetrics)',
    pediatrician: 'Dr. K. N. Sen (Pediatrics)'
  });

  const [deathForm, setDeathForm] = useState({
    patientName: '',
    uhid: '',
    demiseTime: '23 Oct 2026 10:30 PM',
    immediateCause: 'Acute Cardiopulmonary Arrest',
    antecedentCause: 'Severe Aspiration Pneumonia',
    underlyingCause: 'End-Stage Renal Disease (ESRD) on Maintenance Hemodialysis',
    mannerOfDeath: 'Natural Disease Progression',
    doctor: 'Dr. Jayant Mukherjee (Reg #KMC-41908)'
  });

  const [loanForm, setLoanForm] = useState({
    caseNo: 'MRD-2026-1049',
    borrower: 'TPA & Cashless Insurance Desk',
    borrowerPerson: 'Mr. Saurav Mitra',
    purpose: 'IRDAI Statutory Query & Discharge Dossier Audit',
    returnDue: '27 Oct 2026 (72h Policy)',
    officer: 'Mr. Pradeep Ghosh'
  });

  const handleSaveInward = (e) => {
    e.preventDefault();
    if (!inwardForm.patientName) {
      alert('Please enter patient name.');
      return;
    }
    const newCaseNo = `MRD-2026-10${files.length + 52}`;
    const newFile = {
      caseNo: newCaseNo,
      uhid: inwardForm.uhid || `UHID-2026-0${files.length + 800}`,
      patientName: inwardForm.patientName,
      admissionDate: '18 Oct 2026',
      dischargeDate: inwardForm.dischargeDate,
      department: inwardForm.department,
      rackCoordinate: `${inwardForm.rack} • ${inwardForm.shelf} • ${inwardForm.box}`,
      icd10: 'Pending Coding Review',
      cpt: 'Pending Review',
      completeness: '100% Verified (6-Point Audit OK)',
      status: 'Archived Permanent'
    };
    setFiles([newFile, ...files]);
    setIsInwardModalOpen(false);
    triggerToast(`Inpatient File Inward Received & Racked at ${newFile.rackCoordinate}: ${newCaseNo} (${newFile.patientName})`);
  };

  const handleSaveCoding = (e) => {
    e.preventDefault();
    setFiles(files.map(f => {
      if (f.caseNo === codingForm.targetCase) {
        return {
          ...f,
          icd10: codingForm.principalIcd,
          cpt: codingForm.cptCode,
          status: 'Archived Permanent (ICD Coded)'
        };
      }
      return f;
    }));
    setIsCodingModalOpen(false);
    triggerToast(`ICD-10 & CPT Clinical Codes finalized for ${codingForm.targetCase}: ${codingForm.principalIcd}`);
  };

  const handleSaveBirth = (e) => {
    e.preventDefault();
    if (!birthForm.motherName) {
      alert('Please enter mothers name.');
      return;
    }
    const regNo = `MUNI-KOL-2026-B-089${birthRecords.length + 13}`;
    const newBirth = {
      babyName: `Baby of ${birthForm.motherName}`,
      gender: birthForm.gender,
      weight: `${birthForm.birthWeight} kg`,
      time: birthForm.deliveryTime,
      regNo,
      motherUhid: birthForm.motherUhid || 'UHID-2026-0305'
    };
    setBirthRecords([newBirth, ...birthRecords]);
    setIsBirthModalOpen(false);
    triggerToast(`Civil Birth Intimation Form 1 generated: ${newBirth.babyName} (${regNo})`);
  };

  const handleSaveDeath = (e) => {
    e.preventDefault();
    if (!deathForm.patientName) {
      alert('Please enter patient name.');
      return;
    }
    const certNo = `MCCD-FORM4-2026-04${deathRecords.length + 2}`;
    const newDeath = {
      deceasedName: deathForm.patientName,
      uhid: deathForm.uhid || 'UHID-2026-0912',
      time: deathForm.demiseTime,
      cause: deathForm.immediateCause,
      certNo
    };
    setDeathRecords([newDeath, ...deathRecords]);
    setIsDeathModalOpen(false);
    triggerToast(`Medical Cause of Death Form 4/4A committed: ${newDeath.deceasedName} (${certNo})`);
  };

  const handleSaveLoan = (e) => {
    e.preventDefault();
    const newLoan = {
      file: loanForm.caseNo,
      borrower: `${loanForm.borrower} (${loanForm.borrowerPerson})`,
      purpose: loanForm.purpose,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      due: loanForm.returnDue,
      status: 'Active Loan'
    };
    setLoans([newLoan, ...loans]);
    setIsLoanModalOpen(false);
    triggerToast(`File Loan Checked Out: ${loanForm.caseNo} loaned to ${loanForm.borrowerPerson}. Due: ${loanForm.returnDue}`);
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
        <Card
          title="20.1 Inpatient Case Sheet Archival & Compactor Coordinates"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsInwardModalOpen(true)}>
              Receive Discharged File
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsInwardModalOpen(true)}>
                  Receive Discharged File (Ward Inward)
                </Button>
                <Button size="sm" variant="outline" icon={Printer} onClick={() => triggerToast('Printed compactor barcode labels for selected files')}>
                  Print Compactor Box Barcode
                </Button>
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
        <Card
          title="20.2 ICD-10-CM & CPT Morbidity Coding Console"
          action={
            <Button size="sm" variant="primary" icon={FileText} onClick={() => setIsCodingModalOpen(true)}>
              Assign / Edit Clinical Codes
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                Active Case: {codingForm.targetCase} ({files.find(f => f.caseNo === codingForm.targetCase)?.patientName || 'Ramesh Patel'})
              </h4>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Principal Diagnosis (ICD-10-CM)</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>{codingForm.principalIcd}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Surgical CPT Procedure</span>
                  <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>{codingForm.cptCode}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Secondary Comorbidities</span>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>{codingForm.secondaryIcd}</div>
                </div>
                <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  Coder of Record: <strong>{codingForm.coderId}</strong> • DRG Weight: <strong>{codingForm.drgWeight}</strong>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-primary-teal)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
              <h4 style={{ margin: '0 0 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>WHO & National Health Authority Morbidity Index</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Coding validation enforces dual-coder verification. Once certified, codes link to insurance dossier submission and hospital epidemiological disease indexing.
              </p>
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => setIsCodingModalOpen(true)}>
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
                {birthRecords.map((b, i) => (
                  <div key={i} style={{ padding: '8px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)', marginBottom: '4px' }}>
                    <div><strong>{b.babyName}</strong> ({b.gender} • {b.weight})</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Delivered: {b.time} • Mother: {b.motherUhid}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>Municipal Reg #: {b.regNo}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <Button size="xs" variant="primary" icon={Plus} onClick={() => setIsBirthModalOpen(true)}>
                  Register New Birth
                </Button>
                <Button size="xs" variant="outline" icon={Printer} onClick={() => triggerToast(`Printed official Form 1 Birth Intimation for ${birthRecords[0]?.babyName}`)}>
                  Print Form 1
                </Button>
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-primary)' }}>Medical Certificate of Cause of Death</h4>
                <Badge variant="danger">Form 4 / 4A</Badge>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {deathRecords.map((d, i) => (
                  <div key={i} style={{ padding: '8px', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-sm)', marginBottom: '4px' }}>
                    <div>Deceased: <strong>{d.deceasedName}</strong> ({d.uhid})</div>
                    <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Immediate Cause: {d.cause}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Demise: {d.time} • Cert #: {d.certNo}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <Button size="xs" variant="danger" icon={FileText} onClick={() => setIsDeathModalOpen(true)}>
                  Generate Form 4A Certificate
                </Button>
                <Button size="xs" variant="outline" icon={Printer} onClick={() => triggerToast(`Printed MCCD Form 4A for ${deathRecords[0]?.deceasedName}`)}>
                  Print Form 4A
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '20.4' && (
        <Card
          title="20.4 Physical File Loan Checkout & Lending Audit Log"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsLoanModalOpen(true)}>
              New File Checkout
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsLoanModalOpen(true)}>
                  Record New File Checkout
                </Button>
                <Button size="sm" variant="outline" icon={AlertTriangle} onClick={() => triggerToast('Overdue Recall Notice sent to Legal Cell for MRD-2025-8810')}>
                  Send Overdue Reminders
                </Button>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Active Checked Out Files: <strong>{loans.length} Files Currently on Loan</strong>
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
                {loans.map((l, idx) => (
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

      {/* MODAL 1: Receive Discharged File & Assign Physical Coordinates */}
      <Modal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        title="Inpatient File Inward & Physical Coordinate Handover"
        subtitle="Mandatory 48-hour post-discharge physical custody transfer"
      >
        <form onSubmit={handleSaveInward} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Full Name"
              required
              placeholder="e.g. Subhashree Das"
              value={inwardForm.patientName}
              onChange={(e) => setInwardForm({ ...inwardForm, patientName: e.target.value })}
            />
            <Input
              label="Patient UHID (Optional)"
              placeholder="UHID-2026-..."
              value={inwardForm.uhid}
              onChange={(e) => setInwardForm({ ...inwardForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Originating Ward / Department"
              value={inwardForm.department}
              onChange={(e) => setInwardForm({ ...inwardForm, department: e.target.value })}
              options={[
                'Cardiology',
                'Neurology',
                'Obstetrics & Gynecology',
                'General Surgery',
                'Orthopedics',
                'Critical Care Unit (CCU)'
              ]}
            />
            <Input
              label="Discharge Date"
              required
              value={inwardForm.dischargeDate}
              onChange={(e) => setInwardForm({ ...inwardForm, dischargeDate: e.target.value })}
            />
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#FAFCFC' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              6-Point File Completeness Verification Checklist
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={inwardForm.dischargeSummarySigned}
                  onChange={(e) => setInwardForm({ ...inwardForm, dischargeSummarySigned: e.target.checked })}
                />
                <span>Discharge Summary Doctor Signed</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={inwardForm.otNotesAttached}
                  onChange={(e) => setInwardForm({ ...inwardForm, otNotesAttached: e.target.checked })}
                />
                <span>Operative & Anesthesia Notes Attached</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={inwardForm.consentsVerified}
                  onChange={(e) => setInwardForm({ ...inwardForm, consentsVerified: e.target.checked })}
                />
                <span>High-Risk Informed Consents Present</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={inwardForm.labReportsBundled}
                  onChange={(e) => setInwardForm({ ...inwardForm, labReportsBundled: e.target.checked })}
                />
                <span>Diagnostic Pathology Reports Bundled</span>
              </label>
            </div>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Compactor Physical Archival Coordinates
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <Select
                label="Rack Number"
                value={inwardForm.rack}
                onChange={(e) => setInwardForm({ ...inwardForm, rack: e.target.value })}
                options={['Rack-01', 'Rack-02', 'Rack-03', 'Rack-04', 'Rack-05', 'Rack-06', 'Rack-07', 'Rack-08']}
              />
              <Select
                label="Shelf Level"
                value={inwardForm.shelf}
                onChange={(e) => setInwardForm({ ...inwardForm, shelf: e.target.value })}
                options={['Shelf-A', 'Shelf-B', 'Shelf-C', 'Shelf-D', 'Shelf-E', 'Shelf-F']}
              />
              <Input
                label="Box / Bin ID"
                required
                value={inwardForm.box}
                onChange={(e) => setInwardForm({ ...inwardForm, box: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Receiving Archival Officer"
            required
            value={inwardForm.officer}
            onChange={(e) => setInwardForm({ ...inwardForm, officer: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsInwardModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Inward & Assign Coordinate
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Assign / Edit ICD-10-CM & CPT Coding */}
      <Modal
        isOpen={isCodingModalOpen}
        onClose={() => setIsCodingModalOpen(false)}
        title="ICD-10-CM & CPT Morbidity Coding Console"
        subtitle="Certified clinical classification for insurance & national health reporting"
      >
        <form onSubmit={handleSaveCoding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Target MRD File"
            value={codingForm.targetCase}
            onChange={(e) => setCodingForm({ ...codingForm, targetCase: e.target.value })}
            options={files.map(f => ({ value: f.caseNo, label: `${f.caseNo} — ${f.patientName} (${f.department})` }))}
          />

          <Input
            label="Principal Diagnosis (ICD-10-CM Code & Title)"
            required
            value={codingForm.principalIcd}
            onChange={(e) => setCodingForm({ ...codingForm, principalIcd: e.target.value })}
          />

          <Input
            label="Surgical / Interventional Procedure (CPT / PCS Code)"
            required
            value={codingForm.cptCode}
            onChange={(e) => setCodingForm({ ...codingForm, cptCode: e.target.value })}
          />

          <Input
            label="Secondary Diagnoses & Comorbidities (Comma Separated)"
            value={codingForm.secondaryIcd}
            onChange={(e) => setCodingForm({ ...codingForm, secondaryIcd: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <Input
              label="Certified Medical Coder (CPC) Stamp"
              required
              value={codingForm.coderId}
              onChange={(e) => setCodingForm({ ...codingForm, coderId: e.target.value })}
            />
            <Input
              label="DRG Severity Weight"
              value={codingForm.drgWeight}
              onChange={(e) => setCodingForm({ ...codingForm, drgWeight: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCodingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Commit & Certify Clinical Codes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Statutory Birth Registration (Form 1) */}
      <Modal
        isOpen={isBirthModalOpen}
        onClose={() => setIsBirthModalOpen(false)}
        title="Statutory Birth Intimation (Form 1 Municipal)"
        subtitle="Registration of Births and Deaths Act compliance"
      >
        <form onSubmit={handleSaveBirth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Input
              label="Mother Full Name"
              required
              placeholder="e.g. Shalini Verma"
              value={birthForm.motherName}
              onChange={(e) => setBirthForm({ ...birthForm, motherName: e.target.value })}
            />
            <Input
              label="Mother UHID"
              placeholder="UHID-2026-..."
              value={birthForm.motherUhid}
              onChange={(e) => setBirthForm({ ...birthForm, motherUhid: e.target.value })}
            />
          </div>

          <Input
            label="Father / Legal Guardian Name"
            placeholder="e.g. Vikas Verma"
            value={birthForm.fatherName}
            onChange={(e) => setBirthForm({ ...birthForm, fatherName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Select
              label="Child Gender"
              value={birthForm.gender}
              onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
              options={['Female', 'Male', 'Other']}
            />
            <Input
              label="Birth Weight (kg)"
              required
              type="number"
              step="0.05"
              value={birthForm.birthWeight}
              onChange={(e) => setBirthForm({ ...birthForm, birthWeight: e.target.value })}
            />
            <Select
              label="Delivery Mode"
              value={birthForm.deliveryMode}
              onChange={(e) => setBirthForm({ ...birthForm, deliveryMode: e.target.value })}
              options={['Normal Vaginal Delivery', 'Elective LSCS Delivery', 'Emergency LSCS Delivery', 'Instrumental / Forceps']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Exact Date & Time of Birth"
              required
              value={birthForm.deliveryTime}
              onChange={(e) => setBirthForm({ ...birthForm, deliveryTime: e.target.value })}
            />
            <Input
              label="Attending Obstetrician"
              required
              value={birthForm.doctor}
              onChange={(e) => setBirthForm({ ...birthForm, doctor: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsBirthModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate & Record Form 1
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Medical Certificate of Cause of Death (Form 4/4A) */}
      <Modal
        isOpen={isDeathModalOpen}
        onClose={() => setIsDeathModalOpen(false)}
        title="Medical Certificate of Cause of Death (Form 4 / 4A)"
        subtitle="Confidential medical cause statement under section 10(3) of RBD Act"
      >
        <form onSubmit={handleSaveDeath} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Input
              label="Deceased Patient Full Name"
              required
              placeholder="e.g. Hari Prasad Roy"
              value={deathForm.patientName}
              onChange={(e) => setDeathForm({ ...deathForm, patientName: e.target.value })}
            />
            <Input
              label="Deceased UHID"
              placeholder="UHID-2026-..."
              value={deathForm.uhid}
              onChange={(e) => setDeathForm({ ...deathForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Exact Date & Time of Demise"
              required
              value={deathForm.demiseTime}
              onChange={(e) => setDeathForm({ ...deathForm, demiseTime: e.target.value })}
            />
            <Select
              label="Manner of Death"
              value={deathForm.mannerOfDeath}
              onChange={(e) => setDeathForm({ ...deathForm, mannerOfDeath: e.target.value })}
              options={['Natural Disease Progression', 'Accidental / Trauma', 'Suicidal', 'Homicidal', 'Pending Autopsy']}
            />
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#FAFCFC' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Medical Cause Sequence (Part I & II)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Input
                label="Part I-a: Immediate Cause (Direct disease causing death)"
                required
                value={deathForm.immediateCause}
                onChange={(e) => setDeathForm({ ...deathForm, immediateCause: e.target.value })}
              />
              <Input
                label="Part I-b: Antecedent Cause (Morbid condition giving rise to immediate cause)"
                value={deathForm.antecedentCause}
                onChange={(e) => setDeathForm({ ...deathForm, antecedentCause: e.target.value })}
              />
              <Input
                label="Part I-c: Underlying Cause (Disease initiating train of morbid events)"
                value={deathForm.underlyingCause}
                onChange={(e) => setDeathForm({ ...deathForm, underlyingCause: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Attending Registered Physician & Council Reg No"
            required
            value={deathForm.doctor}
            onChange={(e) => setDeathForm({ ...deathForm, doctor: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsDeathModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Sign & Commit Form 4A
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: File Loan Checkout & Lending */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="Physical File Loan Checkout & Lending Authorization"
        subtitle="Strict physical custody audit log with mandatory return deadline"
      >
        <form onSubmit={handleSaveLoan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Target MRD File to Checkout"
            value={loanForm.caseNo}
            onChange={(e) => setLoanForm({ ...loanForm, caseNo: e.target.value })}
            options={files.map(f => ({ value: f.caseNo, label: `${f.caseNo} — ${f.patientName} (${f.rackCoordinate})` }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Borrowing Department / Organization"
              value={loanForm.borrower}
              onChange={(e) => setLoanForm({ ...loanForm, borrower: e.target.value })}
              options={[
                'TPA & Cashless Insurance Desk',
                'Legal & Medicolegal Cell',
                'Hospital Audit & NABH Committee',
                'Treating Consultant Office',
                'Academic Research Department'
              ]}
            />
            <Input
              label="Requisitioning Person"
              required
              value={loanForm.borrowerPerson}
              onChange={(e) => setLoanForm({ ...loanForm, borrowerPerson: e.target.value })}
            />
          </div>

          <Input
            label="Purpose of File Lending / Court Subpoena / Audit Ref"
            required
            value={loanForm.purpose}
            onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Mandatory Return Due Date"
              required
              value={loanForm.returnDue}
              onChange={(e) => setLoanForm({ ...loanForm, returnDue: e.target.value })}
            />
            <Input
              label="Authorizing MRD Superintendent"
              required
              value={loanForm.officer}
              onChange={(e) => setLoanForm({ ...loanForm, officer: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsLoanModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Authorize & Checkout File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default MrdView;
