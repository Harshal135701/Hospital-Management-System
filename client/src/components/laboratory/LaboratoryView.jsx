import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Activity,
  Tag,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Eye,
  RefreshCw,
  Phone
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';

const LAB_SUBMODULES = [
  {
    id: '19.1',
    label: 'Test Requisition & Billing',
    icon: Activity,
    subsubmodules: [
      { id: '19.1.1', label: 'Order Intake & Direct Walk-in' },
      { id: '19.1.2', label: 'Billing & Ledger Routing' },
      { id: '19.1.3', label: 'LIS Accession Worklist Transfer' }
    ]
  },
  {
    id: '19.2',
    label: 'Phlebotomy & Sample Barcode Labeling',
    icon: Tag,
    subsubmodules: [
      { id: '19.2.1', label: 'Phlebotomy Queue & Collection Chair' },
      { id: '19.2.2', label: 'Color-Coded Tube Barcode Generation' },
      { id: '19.2.3', label: 'Specimen Draw & Container Allocation' },
      { id: '19.2.4', label: 'Collection Status & Timestamp Verification' }
    ]
  },
  {
    id: '19.3',
    label: 'Instrument Worklist Interfacing',
    icon: Sliders,
    subsubmodules: [
      { id: '19.3.1', label: 'Specimen Bench Check-in & Scanning' },
      { id: '19.3.2', label: 'ASTM / HL7 Profile Querying' },
      { id: '19.3.3', label: 'Automated Analytical Run & Raw Data' }
    ]
  },
  {
    id: '19.4',
    label: 'Result Entry & Panic Value Alerts',
    icon: AlertCircle,
    subsubmodules: [
      { id: '19.4.1', label: 'Automated & Manual Result Entry' },
      { id: '19.4.2', label: 'Biological Reference Interval Validation' },
      { id: '19.4.3', label: 'Abnormal High / Low Flags' },
      { id: '19.4.4', label: 'Life-Threatening Panic Alerts & SMS' }
    ]
  },
  {
    id: '19.5',
    label: 'Pathologist Verification & Authorization',
    icon: CheckCircle2,
    subsubmodules: [
      { id: '19.5.1', label: 'Historical Trend & Flag Review' },
      { id: '19.5.2', label: 'Clinical Interpretation Remarks' },
      { id: '19.5.3', label: 'Digital Signature & Authorization' },
      { id: '19.5.4', label: 'EMR & Portal Multi-Channel Publishing' }
    ]
  }
];

export function LaboratoryView({ initialSubtab = '19.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('19.')) return initialSubtab;
    return '19.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = LAB_SUBMODULES.find(s => s.id === (initialSubtab || '19.1'));
    return parent?.subsubmodules[0]?.id || '19.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('laboratory:', '').replace('lab:', '');
      if (LAB_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || LAB_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`laboratory:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`laboratory:${activeSubtab}:${subsubId}`);
    }
  };

  // Mock Lab Accession Samples
  // Mock Lab Accession Samples
  const [samples, setSamples] = useState([
    {
      barcode: 'LAB-2026-90412',
      patientName: 'Arjun Rampal',
      uhid: 'UHID-2026-0419',
      ageGender: '48y / M',
      testPanel: 'Comprehensive Metabolic Panel (CMP) + CBC',
      tubeType: 'Gold Gel (SST) + Lavender EDTA',
      status: 'Collected',
      phlebotomist: 'Sr. Suresh P. (08:40 AM)',
      analyzer: 'Roche Cobas 6000 (ASTM Interfaced)',
      hasPanic: false
    },
    {
      barcode: 'LAB-2026-90413',
      patientName: 'Kalyani Sen',
      uhid: 'UHID-2026-0522',
      ageGender: '62y / F',
      testPanel: 'Serum Electrolytes + Cardiac Troponin-I',
      tubeType: 'Gold Gel (SST) + Green Heparin',
      status: 'Result Entered (Panic Alert)',
      phlebotomist: 'Sr. Deepa K. (08:50 AM)',
      analyzer: 'Abbott Architect i2000SR',
      hasPanic: true,
      panicParam: 'Potassium: 6.8 mEq/L (Critical High > 6.0)'
    },
    {
      barcode: 'LAB-2026-90414',
      patientName: 'Vikram Joshi',
      uhid: 'UHID-2026-0811',
      ageGender: '35y / M',
      testPanel: 'Lipid Profile + HbA1c Glycated Hemoglobin',
      tubeType: 'Lavender EDTA + Grey Fluoride',
      status: 'Verified & Authorized',
      phlebotomist: 'Sr. Suresh P. (09:10 AM)',
      analyzer: 'Bio-Rad D-10 HPLC',
      hasPanic: false
    }
  ]);

  const [selectedSample, setSelectedSample] = useState(samples[1]);
  const [toastMessage, setToastMessage] = useState('');

  const [resultsList, setResultsList] = useState([
    { param: 'Serum Potassium (K+)', val: '6.8 mEq/L', range: '3.5 - 5.1 mEq/L', flag: 'H (Critical High)', panic: true },
    { param: 'Serum Sodium (Na+)', val: '138 mEq/L', range: '135 - 145 mEq/L', flag: 'Normal', panic: false },
    { param: 'Serum Creatinine', val: '2.1 mg/dL', range: '0.7 - 1.3 mg/dL', flag: 'H (Elevated)', panic: false },
    { param: 'Blood Urea Nitrogen (BUN)', val: '42 mg/dL', range: '7 - 20 mg/dL', flag: 'H (High)', panic: false }
  ]);

  // Modals
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [isPhlebotomyModalOpen, setIsPhlebotomyModalOpen] = useState(false);
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPathologistModalOpen, setIsPathologistModalOpen] = useState(false);

  // Forms
  const [requisitionForm, setRequisitionForm] = useState({
    patientName: '',
    uhid: '',
    ageGender: '45y / F',
    doctor: 'Dr. V. Singhal (Cardiology)',
    testPanel: 'Comprehensive Metabolic Panel (CMP) + CBC',
    specimen: 'Gold Gel (SST) + Lavender EDTA',
    billingMode: 'OPD Walk-in Paid (UPI)',
    urgency: 'Routine (Standard TAT)'
  });

  const [phlebotomyForm, setPhlebotomyForm] = useState({
    chairNo: 'Chair #2 (Main Phlebotomy Suite)',
    tubeTypes: 'Gold Gel (SST Tube) + Lavender EDTA',
    volumeDrawn: '5 mL',
    fastingStatus: 'Fasting >= 8 Hours Confirmed',
    operator: 'Sr. Suresh P. (Phlebotomy Tech #4)'
  });

  const [instrumentForm, setInstrumentForm] = useState({
    analyzer: 'Roche Cobas 6000 (ASTM Interfaced)',
    rackCupPosition: 'Rack #04 • Cup #12',
    testProfile: 'Biochemistry / Electrolytes Dual Run',
    priority: 'Normal Batch'
  });

  const [resultForm, setResultForm] = useState({
    param: 'Serum Potassium (K+)',
    val: '6.8',
    unit: 'mEq/L',
    range: '3.5 - 5.1 mEq/L',
    flag: 'H (Critical High)',
    isPanic: true,
    escalationNote: 'Repeat sample verified on secondary channel. Hemolysis absent.'
  });

  const [pathologistForm, setPathologistForm] = useState({
    remark: 'Marked hyperkalemia (K+ 6.8 mEq/L) co-existing with azotemia. Delta check confirmed. Critical panic communicated verbally to attending physician.',
    deltaCheckPassed: true,
    verbalPanicCommunicated: true,
    doctorNotified: 'Dr. Ananya Sen (Nephrology)',
    digitalPin: '****'
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleSaveRequisition = (e) => {
    e.preventDefault();
    if (!requisitionForm.patientName) {
      alert('Please enter patient name.');
      return;
    }
    const newBarcode = `LAB-2026-90${samples.length + 415}`;
    const newSample = {
      barcode: newBarcode,
      patientName: requisitionForm.patientName,
      uhid: requisitionForm.uhid || `UHID-2026-0${samples.length + 820}`,
      ageGender: requisitionForm.ageGender,
      testPanel: requisitionForm.testPanel,
      tubeType: requisitionForm.specimen,
      status: 'Intake Registered (Pending Draw)',
      phlebotomist: 'Queue Assigned',
      analyzer: 'Roche Cobas 6000 (ASTM Interfaced)',
      hasPanic: false
    };
    setSamples([newSample, ...samples]);
    setSelectedSample(newSample);
    setIsRequisitionModalOpen(false);
    triggerToast(`Test Requisition Created: ${newSample.barcode} for ${newSample.patientName}`);
  };

  const handleSavePhlebotomy = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedSample,
      status: 'Collected',
      phlebotomist: `${phlebotomyForm.operator} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      tubeType: phlebotomyForm.tubeTypes
    };
    setSamples(samples.map(s => s.barcode === selectedSample.barcode ? updated : s));
    setSelectedSample(updated);
    setIsPhlebotomyModalOpen(false);
    triggerToast(`Phlebotomy draw confirmed for ${selectedSample.barcode}: ${phlebotomyForm.tubeTypes} (${phlebotomyForm.fastingStatus})`);
  };

  const handleSaveInstrument = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedSample,
      status: 'Analytical Run Active (ASTM)',
      analyzer: instrumentForm.analyzer
    };
    setSamples(samples.map(s => s.barcode === selectedSample.barcode ? updated : s));
    setSelectedSample(updated);
    setIsInstrumentModalOpen(false);
    triggerToast(`Dispatched ${selectedSample.barcode} to ${instrumentForm.analyzer} at ${instrumentForm.rackCupPosition}`);
  };

  const handleSaveResult = (e) => {
    e.preventDefault();
    const newRow = {
      param: resultForm.param,
      val: `${resultForm.val} ${resultForm.unit}`,
      range: resultForm.range,
      flag: resultForm.flag,
      panic: resultForm.isPanic
    };
    const updatedList = [newRow, ...resultsList.filter(r => r.param !== resultForm.param)];
    setResultsList(updatedList);

    const hasAnyPanic = updatedList.some(r => r.panic);
    const updatedSample = {
      ...selectedSample,
      status: hasAnyPanic ? 'Result Entered (Panic Alert)' : 'Result Entered (Normal)',
      hasPanic: hasAnyPanic,
      panicParam: hasAnyPanic ? `${resultForm.param}: ${resultForm.val} ${resultForm.unit} (${resultForm.flag})` : undefined
    };
    setSamples(samples.map(s => s.barcode === selectedSample.barcode ? updatedSample : s));
    setSelectedSample(updatedSample);
    setIsResultModalOpen(false);
    triggerToast(`Quantitative result saved for ${resultForm.param}: ${resultForm.val} ${resultForm.unit} [Flag: ${resultForm.flag}]`);
  };

  const handleSavePathologist = (e) => {
    e.preventDefault();
    const updatedSample = {
      ...selectedSample,
      status: 'Verified & Digitally Authorized'
    };
    setSamples(samples.map(s => s.barcode === selectedSample.barcode ? updatedSample : s));
    setSelectedSample(updatedSample);
    setIsPathologistModalOpen(false);
    triggerToast(`Report authorized by Dr. Jayant Mukherjee (Reg #KMC-41908). Pushed to EMR & Patient Portal.`);
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
              <FlaskConical size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Laboratory Information System (LIS) & Pathology
                </h1>
                <Badge variant="teal">NABL / CAP Certified Lab</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                Automated clinical laboratory workflow: barcode tube accessioning, bidirectional analyzer ASTM/HL7 worklists, automated biological reference intervals, panic alert dispatch, and digital pathologist authorization.
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
            ASTM / HL7 Analyzer Online
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
          {LAB_SUBMODULES.map(tab => {
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
          {LAB_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
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

      {/* Critical Panic Alert Banner */}
      {selectedSample.hasPanic && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF2F2',
            border: '2px solid #EF4444',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#B91C1C', fontSize: '0.98rem' }}>
                CRITICAL LIFE-THREATENING PANIC VALUE ALERT
              </div>
              <div style={{ fontSize: '0.84rem', color: '#7F1D1D', marginTop: '2px' }}>
                Sample <strong>{selectedSample.barcode}</strong> ({selectedSample.patientName}): <strong>{selectedSample.panicParam}</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              size="sm"
              variant="danger"
              icon={Phone}
              onClick={() => triggerToast('Emergency Doctor SMS & Push Call dispatched to Dr. Ananya Sen (+91 98200 44122)')}
            >
              Dispatch Immediate Doctor Call
            </Button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{ padding: '12px 18px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid var(--color-primary-teal)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-teal)', fontWeight: '600', fontSize: '0.88rem' }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Dynamic Submodule Views */}
      {activeSubtab === '19.1' && (
        <Card
          title="19.1 Test Requisition & Billing Intake"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsRequisitionModalOpen(true)}>
              New Walk-in Order
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>
                Order Intake Channels & Active Requisitions
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                Electronic provider orders route instantly from Outpatient Consultation Desk or Inpatient EMR. Direct walk-in requisitions generate immediate cashier invoices.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="xs" variant="primary" icon={Plus} onClick={() => setIsRequisitionModalOpen(true)}>New Walk-in Order</Button>
                <Button size="xs" variant="outline" icon={RefreshCw} onClick={() => triggerToast('Synced 14 pending CPOE inpatient orders')}>Sync CPOE Orders (14 Pending)</Button>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>
                Billing & Ledger Allocation
              </h4>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>OPD Walk-in Paid:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>Rs. 1,850 (UPI Settled)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IPD Bed Ledger:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>Charged to Bed #302 (Running)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TPA Authorization:</span>
                  <span style={{ fontWeight: '700' }}>Pre-Approved (Cashless Gate)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '19.2' && (
        <Card
          title="19.2 Phlebotomy & Color-Coded Tube Barcoding"
          action={
            <Button size="sm" variant="primary" icon={Tag} onClick={() => setIsPhlebotomyModalOpen(true)}>
              Record Phlebotomy Draw
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid #8B5CF6', backgroundColor: '#FAF5FF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', color: '#6D28D9' }}>Lavender (K2 EDTA)</span>
                  <Badge variant="teal">CBC / HbA1c</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4C1D95', marginTop: '6px' }}>Whole Blood • Invert 8-10x • Barcode: EDTA-90412</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid #F59E0B', backgroundColor: '#FFFBEB' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', color: '#B45309' }}>Gold Gel (SST Tube)</span>
                  <Badge variant="info">Biochemistry</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '6px' }}>Serum Clot Activator • Centrifuge 10 min 3000 RPM</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid #64748B', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', color: '#334155' }}>Grey (Sodium Fluoride)</span>
                  <Badge variant="teal">Glucose Fasting</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1E293B', marginTop: '6px' }}>Glycolytic Inhibitor • Specimen Verified</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button size="sm" variant="outline" icon={Printer} onClick={() => triggerToast(`Thermal barcodes printed for ${selectedSample.barcode}`)}>
                Print Thermal Tube Barcodes
              </Button>
              <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => setIsPhlebotomyModalOpen(true)}>
                Record Phlebotomy Draw
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '19.3' && (
        <Card
          title="19.3 Automated Instrument Worklist & ASTM/HL7 Gateway"
          action={
            <Button size="sm" variant="primary" icon={Sliders} onClick={() => setIsInstrumentModalOpen(true)}>
              Dispatch Instrument Run
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="var(--color-primary-teal)" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>Roche Cobas 6000 & Sysmex XN-1000 Interfacing</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Protocol: ASTM E1394-97 / HL7 2.5 • Status: Receiving Telemetry Stream</div>
                </div>
              </div>
              <Badge variant="teal">Connected • 1,240 pkts/min</Badge>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F6F6', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px' }}>Accession ID</th>
                  <th style={{ padding: '8px 12px' }}>Patient</th>
                  <th style={{ padding: '8px 12px' }}>Assigned Analyzer</th>
                  <th style={{ padding: '8px 12px' }}>Query Status</th>
                  <th style={{ padding: '8px 12px' }}>Analytical Run</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: selectedSample.barcode === s.barcode ? 'var(--color-bg-pale-aqua)' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.barcode}</td>
                    <td style={{ padding: '8px 12px' }}>{s.patientName} ({s.uhid})</td>
                    <td style={{ padding: '8px 12px' }}>{s.analyzer}</td>
                    <td style={{ padding: '8px 12px' }}><Badge variant="teal">ASTM Query Handshake OK</Badge></td>
                    <td style={{ padding: '8px 12px', fontWeight: '600' }}>{s.status}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <Button size="xs" variant={selectedSample.barcode === s.barcode ? 'primary' : 'outline'} onClick={() => setSelectedSample(s)}>
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubtab === '19.4' && (
        <Card
          title="19.4 Quantitative Result Entry & Panic Telemetry Grid"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsResultModalOpen(true)}>
              Enter Test Result
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Currently Inspecting:</span>
                <span style={{ fontWeight: '800', marginLeft: '6px', color: 'var(--color-text-primary)' }}>{selectedSample.patientName} ({selectedSample.barcode})</span>
              </div>
              <Badge variant={selectedSample.hasPanic ? 'danger' : 'teal'}>
                {selectedSample.hasPanic ? 'Panic Value Detected' : 'All Values Within Limits'}
              </Badge>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F6F6', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '10px 12px' }}>Analyte / Test Parameter</th>
                  <th style={{ padding: '10px 12px' }}>Machine Result</th>
                  <th style={{ padding: '10px 12px' }}>Biological Reference Range</th>
                  <th style={{ padding: '10px 12px' }}>Flag</th>
                  <th style={{ padding: '10px 12px' }}>Panic Gate</th>
                </tr>
              </thead>
              <tbody>
                {resultsList.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: row.panic ? '#FEF2F2' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700' }}>{row.param}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: row.panic ? '#DC2626' : 'var(--color-text-primary)' }}>{row.val}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>{row.range}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={row.panic ? 'danger' : row.flag === 'Normal' ? 'teal' : 'warning'}>{row.flag}</Badge>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {row.panic ? (
                        <span style={{ color: '#DC2626', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> Panic Alert Fired
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-success)', fontSize: '0.78rem' }}>Normal Gate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubtab === '19.5' && (
        <Card
          title="19.5 Pathologist Electronic Verification & Authorization Gate"
          action={
            <Button size="sm" variant="primary" icon={ShieldCheck} onClick={() => setIsPathologistModalOpen(true)}>
              Authorize & Sign Report
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>
                Consultant Pathologist Diagnostic Remark
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {pathologistForm.remark}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Digital Signing Certificate: <strong>Dr. Jayant Mukherjee (MD Pathology, Reg #KMC-41908)</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="outline" icon={Eye} onClick={() => triggerToast(`Report preview generated for ${selectedSample.barcode}`)}>
                  Preview Report PDF
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={ShieldCheck}
                  onClick={() => setIsPathologistModalOpen(true)}
                >
                  Authorize & Sign Report
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL 1: Diagnostic Test Requisition & Billing Intake */}
      <Modal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
        title="Diagnostic Test Requisition & Billing Intake"
        subtitle="Order intake for Outpatient Walk-in & Inpatient CPOE routing"
      >
        <form onSubmit={handleSaveRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Full Name"
              required
              placeholder="e.g. Anand Mahindra"
              value={requisitionForm.patientName}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, patientName: e.target.value })}
            />
            <Input
              label="Patient UHID (Optional)"
              placeholder="UHID-2026-..."
              value={requisitionForm.uhid}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Age / Gender"
              required
              placeholder="e.g. 52y / M"
              value={requisitionForm.ageGender}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, ageGender: e.target.value })}
            />
            <Select
              label="Ordering Physician"
              value={requisitionForm.doctor}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, doctor: e.target.value })}
              options={[
                'Dr. V. Singhal (Cardiology)',
                'Dr. N. Joshi (Internal Medicine)',
                'Dr. Ananya Sen (Nephrology)',
                'Dr. S. K. Roy (Gastroenterology)',
                'OPD Direct Walk-in (Self)'
              ]}
            />
          </div>

          <Select
            label="Diagnostic Test Panel"
            required
            value={requisitionForm.testPanel}
            onChange={(e) => setRequisitionForm({ ...requisitionForm, testPanel: e.target.value })}
            options={[
              'Comprehensive Metabolic Panel (CMP) + CBC',
              'Serum Electrolytes + Cardiac Troponin-I',
              'Lipid Profile + HbA1c Glycated Hemoglobin',
              'Liver Function Tests (LFT Complete)',
              'Kidney Function Tests (KFT / RFT)',
              'Thyroid Panel (FT3, FT4, TSH Ultra)',
              'Coagulation Screen (PT/INR + aPTT)'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Specimen Tube Requirement"
              value={requisitionForm.specimen}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, specimen: e.target.value })}
              options={[
                'Gold Gel (SST) + Lavender EDTA',
                'Gold Gel (SST) + Green Heparin',
                'Lavender EDTA + Grey Fluoride',
                'Light Blue (Sodium Citrate)',
                'Sterile Urine Cup'
              ]}
            />
            <Select
              label="Clinical Urgency"
              value={requisitionForm.urgency}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, urgency: e.target.value })}
              options={[
                'Routine (Standard TAT 4h)',
                'Urgent (TAT 2h)',
                'STAT Emergency Panic (TAT 30m)'
              ]}
            />
          </div>

          <Select
            label="Billing & Ledger Allocation"
            value={requisitionForm.billingMode}
            onChange={(e) => setRequisitionForm({ ...requisitionForm, billingMode: e.target.value })}
            options={[
              'OPD Walk-in Paid (UPI / POS Settlement)',
              'IPD Bed Ledger Chargeable',
              'TPA / Cashless Corporate Insurance'
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsRequisitionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Requisition & Issue Barcode
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Phlebotomy Specimen Draw & Barcode Allocation */}
      <Modal
        isOpen={isPhlebotomyModalOpen}
        onClose={() => setIsPhlebotomyModalOpen(false)}
        title={`Phlebotomy Specimen Draw: ${selectedSample.barcode}`}
        subtitle={`Patient: ${selectedSample.patientName} (${selectedSample.uhid})`}
      >
        <form onSubmit={handleSavePhlebotomy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Collection Chair"
              value={phlebotomyForm.chairNo}
              onChange={(e) => setPhlebotomyForm({ ...phlebotomyForm, chairNo: e.target.value })}
              options={[
                'Chair #1 (Phlebotomy Suite A)',
                'Chair #2 (Main Phlebotomy Suite)',
                'Chair #3 (Fast Track)',
                'Bedside Inpatient Mobile Cart'
              ]}
            />
            <Select
              label="Fasting Verification Gate"
              value={phlebotomyForm.fastingStatus}
              onChange={(e) => setPhlebotomyForm({ ...phlebotomyForm, fastingStatus: e.target.value })}
              options={[
                'Fasting >= 8 Hours Confirmed',
                'Post-Prandial (2h Post Meal)',
                'Random Sample (Non-Fasting Allowed)'
              ]}
            />
          </div>

          <Input
            label="Tubes Drawn & Allocated"
            required
            value={phlebotomyForm.tubeTypes}
            onChange={(e) => setPhlebotomyForm({ ...phlebotomyForm, tubeTypes: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Total Specimen Volume Drawn"
              value={phlebotomyForm.volumeDrawn}
              onChange={(e) => setPhlebotomyForm({ ...phlebotomyForm, volumeDrawn: e.target.value })}
            />
            <Input
              label="Phlebotomy Technician ID"
              required
              value={phlebotomyForm.operator}
              onChange={(e) => setPhlebotomyForm({ ...phlebotomyForm, operator: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsPhlebotomyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Draw & Timestamp
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Instrument Worklist Dispatch */}
      <Modal
        isOpen={isInstrumentModalOpen}
        onClose={() => setIsInstrumentModalOpen(false)}
        title={`Instrument Worklist Interfacing: ${selectedSample.barcode}`}
      >
        <form onSubmit={handleSaveInstrument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Target Clinical Analyzer"
            value={instrumentForm.analyzer}
            onChange={(e) => setInstrumentForm({ ...instrumentForm, analyzer: e.target.value })}
            options={[
              'Roche Cobas 6000 (ASTM Interfaced)',
              'Abbott Architect i2000SR',
              'Bio-Rad D-10 HPLC',
              'Sysmex XN-1000 Automated Hematology'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Rack & Cup Coordinate"
              required
              value={instrumentForm.rackCupPosition}
              onChange={(e) => setInstrumentForm({ ...instrumentForm, rackCupPosition: e.target.value })}
            />
            <Select
              label="Interfacing Priority"
              value={instrumentForm.priority}
              onChange={(e) => setInstrumentForm({ ...instrumentForm, priority: e.target.value })}
              options={['Normal Batch', 'STAT High Priority Emergency', 'Quality Control (QC) Pre-Check']}
            />
          </div>

          <Input
            label="Analytical Profile"
            value={instrumentForm.testProfile}
            onChange={(e) => setInstrumentForm({ ...instrumentForm, testProfile: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsInstrumentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Dispatch to Instrument Worklist
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Quantitative Result Entry & Panic Flag */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Analyte Quantitative Result: ${selectedSample.barcode}`}
        subtitle={`Patient: ${selectedSample.patientName}`}
      >
        <form onSubmit={handleSaveResult} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Select
              label="Analyte / Parameter"
              value={resultForm.param}
              onChange={(e) => setResultForm({ ...resultForm, param: e.target.value })}
              options={[
                'Serum Potassium (K+)',
                'Serum Sodium (Na+)',
                'Serum Creatinine',
                'Blood Urea Nitrogen (BUN)',
                'Fasting Blood Glucose',
                'Troponin-I High Sensitivity',
                'Hemoglobin (Hb)',
                'Platelet Count'
              ]}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <Input
                label="Value"
                required
                value={resultForm.val}
                onChange={(e) => setResultForm({ ...resultForm, val: e.target.value })}
              />
              <Input
                label="Unit"
                required
                value={resultForm.unit}
                onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Biological Reference Range"
              value={resultForm.range}
              onChange={(e) => setResultForm({ ...resultForm, range: e.target.value })}
            />
            <Select
              label="Flag & Interpretation"
              value={resultForm.flag}
              onChange={(e) => setResultForm({ ...resultForm, flag: e.target.value, isPanic: e.target.value.includes('Critical') })}
              options={[
                'Normal',
                'H (Elevated)',
                'L (Low)',
                'H (Critical High)',
                'L (Critical Low)'
              ]}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: resultForm.isPanic ? '#FEF2F2' : '#F8FAFA', border: resultForm.isPanic ? '1px solid #FECACA' : '1px solid var(--color-border)' }}>
            <input
              type="checkbox"
              checked={resultForm.isPanic}
              onChange={(e) => setResultForm({ ...resultForm, isPanic: e.target.checked })}
            />
            <span style={{ fontWeight: resultForm.isPanic ? '700' : '500', color: resultForm.isPanic ? '#DC2626' : 'inherit' }}>
              Arm Critical Life-Threatening Panic Value Alert (Fires emergency Doctor push call)
            </span>
          </label>

          <Input
            label="Analytical Quality / Escalation Remarks"
            value={resultForm.escalationNote}
            onChange={(e) => setResultForm({ ...resultForm, escalationNote: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsResultModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Commit Result to LIS
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Pathologist Electronic Verification & Sign-off */}
      <Modal
        isOpen={isPathologistModalOpen}
        onClose={() => setIsPathologistModalOpen(false)}
        title={`Pathologist Digital Authorization: ${selectedSample.barcode}`}
      >
        <form onSubmit={handleSavePathologist} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Consultant Pathologist Diagnostic Remark *
            </label>
            <textarea
              required
              rows={3}
              value={pathologistForm.remark}
              onChange={(e) => setPathologistForm({ ...pathologistForm, remark: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.84rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#FAFCFC' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Mandatory Release Checkpoints
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={pathologistForm.deltaCheckPassed}
                  onChange={(e) => setPathologistForm({ ...pathologistForm, deltaCheckPassed: e.target.checked })}
                />
                <span>Delta Check & Baseline Historical Concordance Verified</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={pathologistForm.verbalPanicCommunicated}
                  onChange={(e) => setPathologistForm({ ...pathologistForm, verbalPanicCommunicated: e.target.checked })}
                />
                <span>Verbal panic value alert personally communicated to treating physician</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <Input
              label="Attending Doctor Notified"
              value={pathologistForm.doctorNotified}
              onChange={(e) => setPathologistForm({ ...pathologistForm, doctorNotified: e.target.value })}
            />
            <Input
              label="Digital Signing PIN"
              type="password"
              required
              value={pathologistForm.digitalPin}
              onChange={(e) => setPathologistForm({ ...pathologistForm, digitalPin: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsPathologistModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Sign Certificate & Release Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default LaboratoryView;
