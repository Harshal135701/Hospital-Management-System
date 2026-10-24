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
import { Card, Button, Badge } from '../common/UIPrimitives';

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
  const [samples, _setSamples] = useState([
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
        <Card title="19.1 Test Requisition & Billing Intake">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>
                Order Intake Channels
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                Electronic provider orders route instantly from Outpatient Consultation Desk or Inpatient EMR. Direct walk-in requisitions generate immediate cashier invoices.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="xs" variant="primary" icon={Plus}>New Walk-in Order</Button>
                <Button size="xs" variant="outline" icon={RefreshCw}>Sync CPOE Orders (14 Pending)</Button>
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
        <Card title="19.2 Phlebotomy & Color-Coded Tube Barcoding">
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
              <Button size="sm" variant="outline" icon={Printer}>Print Thermal Tube Barcodes</Button>
              <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => triggerToast('Phlebotomy sample status marked COLLECTED with timestamp')}>Mark Draw Completed</Button>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '19.3' && (
        <Card title="19.3 Automated Instrument Worklist & ASTM/HL7 Gateway">
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
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.barcode}</td>
                    <td style={{ padding: '8px 12px' }}>{s.patientName} ({s.uhid})</td>
                    <td style={{ padding: '8px 12px' }}>{s.analyzer}</td>
                    <td style={{ padding: '8px 12px' }}><Badge variant="teal">ASTM Query Handshake OK</Badge></td>
                    <td style={{ padding: '8px 12px', fontWeight: '600' }}>{s.status}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <Button size="xs" variant="outline" onClick={() => setSelectedSample(s)}>Inspect</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubtab === '19.4' && (
        <Card title="19.4 Quantitative Result Entry & Panic Telemetry Grid">
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
                {[
                  { param: 'Serum Potassium (K+)', val: '6.8 mEq/L', range: '3.5 - 5.1 mEq/L', flag: 'H (Critical High)', panic: true },
                  { param: 'Serum Sodium (Na+)', val: '138 mEq/L', range: '135 - 145 mEq/L', flag: 'Normal', panic: false },
                  { param: 'Serum Creatinine', val: '2.1 mg/dL', range: '0.7 - 1.3 mg/dL', flag: 'H (Elevated)', panic: false },
                  { param: 'Blood Urea Nitrogen (BUN)', val: '42 mg/dL', range: '7 - 20 mg/dL', flag: 'H (High)', panic: false }
                ].map((row, i) => (
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
        <Card title="19.5 Pathologist Electronic Verification & Authorization Gate">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <h4 style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)' }}>
                Consultant Pathologist Diagnostic Remark
              </h4>
              <textarea
                defaultValue="Marked hyperkalemia (K+ 6.8 mEq/L) noted with co-existing azotemia. Sample re-run twice on Cobas 6000 and confirmed. No gross hemolysis visible in serum. Panic value communicated verbally to Attending Nephrologist at 09:12 AM."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Digital Signing Certificate: <strong>Dr. Jayant Mukherjee (MD Pathology, Reg #KMC-41908)</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="outline" icon={Eye}>Preview Report PDF</Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={ShieldCheck}
                  onClick={() => triggerToast('Report Authorized & Signed! Released to EMR and WhatsApp notification sent.')}
                >
                  Authorize & Sign Report
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
