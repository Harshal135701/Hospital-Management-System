import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  ScanLine,
  Clock,
  CheckCircle2,
  Plus,
  FileText,
  ShieldCheck,
  Users,
  Download,
  Share2,
  CheckSquare,
  Lock,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';

const IVF_SUBMODULES = [
  {
    id: '18.1',
    label: 'Couple Registration & Legal Consent',
    icon: Users,
    subsubmodules: [
      { id: '18.1.1', label: 'Couple Registration & Bonded Identifier' },
      { id: '18.1.2', label: 'Infertility Etiology & ART History' },
      { id: '18.1.3', label: 'Mandatory ART Regulatory Consent' }
    ]
  },
  {
    id: '18.2',
    label: 'Ovarian Stimulation Protocol',
    icon: Activity,
    subsubmodules: [
      { id: '18.2.1', label: 'Stimulation Protocol Initiation' },
      { id: '18.2.2', label: 'Daily Gonadotropin Injections Log' },
      { id: '18.2.3', label: 'Serum E2 & P4 Hormone Tracking' }
    ]
  },
  {
    id: '18.3',
    label: 'Follicular Ultrasound Tracking',
    icon: ScanLine,
    subsubmodules: [
      { id: '18.3.1', label: 'Serial Transvaginal Scans (TVS)' },
      { id: '18.3.2', label: 'Bilateral Ovary Follicle Grid' },
      { id: '18.3.3', label: 'Endometrial Thickness & Pattern' },
      { id: '18.3.4', label: 'Follicular Growth Curve Plot' }
    ]
  },
  {
    id: '18.4',
    label: 'Trigger Timing & Scheduling',
    icon: Clock,
    subsubmodules: [
      { id: '18.4.1', label: 'Follicular Maturity Assessment' },
      { id: '18.4.2', label: 'Ovulation Trigger Timing' },
      { id: '18.4.3', label: 'OPU Theatre Slot Booking (35-36h)' }
    ]
  },
  {
    id: '18.5',
    label: 'Cycle Outcome & Pregnancy Registry',
    icon: HeartPulse,
    subsubmodules: [
      { id: '18.5.1', label: 'Serum Beta hCG Quantitative Entry' },
      { id: '18.5.2', label: '6-Week Ultrasound Confirmation' },
      { id: '18.5.3', label: 'National ART Registry Submission' }
    ]
  }
];

export function IvfView({ initialSubtab = '18.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('18.')) return initialSubtab;
    return '18.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = IVF_SUBMODULES.find(s => s.id === (initialSubtab || '18.1'));
    return parent?.subsubmodules[0]?.id || '18.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('ivf:', '');
      if (IVF_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || IVF_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`ivf:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`ivf:${activeSubtab}:${subsubId}`);
    }
  };

  // Mock Couple Data
  const [couples] = useState([
    {
      artId: 'ART-2026-0042',
      wifeName: 'Sunita Sharma',
      wifeUhid: 'UHID-2026-0891',
      wifeAge: 32,
      husbandName: 'Rahul Sharma',
      husbandUhid: 'UHID-2026-0892',
      husbandAge: 35,
      infertilityType: 'Primary (4.5 Years)',
      etiology: 'PCOS + Mild Teratozoospermia',
      protocol: 'Antagonist Protocol (Flexible)',
      cycleDay: 'Day 10',
      leadFollicles: 4,
      e2Level: '2,140 pg/mL',
      status: 'Stimulation Active'
    },
    {
      artId: 'ART-2026-0038',
      wifeName: 'Meera Nambiar',
      wifeUhid: 'UHID-2026-0744',
      wifeAge: 29,
      husbandName: 'Karthik Nambiar',
      husbandUhid: 'UHID-2026-0745',
      husbandAge: 31,
      infertilityType: 'Secondary (3 Years)',
      etiology: 'Bilateral Tubal Occlusion',
      protocol: 'Long Agonist Protocol',
      cycleDay: 'Trigger Scheduled',
      leadFollicles: 6,
      e2Level: '3,480 pg/mL',
      status: 'Trigger Scheduled (OPU 08:30 Tomorrow)'
    }
  ]);

  const [selectedCouple, _setSelectedCouple] = useState(couples[0]);

  // Bilateral Follicle Grid State
  const [follicles] = useState({
    rightOvary: [19.5, 18.2, 17.0, 15.4, 14.1, 11.2],
    leftOvary: [19.0, 18.6, 16.8, 15.0, 13.5],
    endometrium: 10.4,
    pattern: 'Trilaminar (Grade A)'
  });

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
              <HeartPulse size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  IVF & Clinical Assisted Reproductive Technology
                </h1>
                <Badge variant="teal">ICMR / ART Act 2021 Compliant</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                End-to-end clinical fertility cycle tracking: bonded couple registration, controlled ovarian hyperstimulation, folliculometry grid, ovulatory trigger clock, and national pregnancy registry.
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
            National ART Board Gate Active
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
          {IVF_SUBMODULES.map(tab => {
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
          {IVF_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
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

      {/* Couple Telemetry Selector Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}
            >
              👩‍❤️‍👨
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  {selectedCouple.wifeName} ({selectedCouple.wifeAge}y) & {selectedCouple.husbandName} ({selectedCouple.husbandAge}y)
                </span>
                <Badge variant="teal">{selectedCouple.artId}</Badge>
                <Badge variant="info">{selectedCouple.status}</Badge>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '3px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>Wife: <strong>{selectedCouple.wifeUhid}</strong></span>
                <span>•</span>
                <span>Husband: <strong>{selectedCouple.husbandUhid}</strong></span>
                <span>•</span>
                <span>Etiology: <strong>{selectedCouple.etiology}</strong></span>
                <span>•</span>
                <span>Protocol: <strong>{selectedCouple.protocol}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" icon={Users}>
              Switch Couple
            </Button>
            <Button size="sm" variant="primary" icon={Plus}>
              New IVF Cycle
            </Button>
          </div>
        </div>
      </Card>

      {/* Submodule Dynamic Renderings */}
      {activeSubtab === '18.1' && (
        <Card title="18.1 Couple Registration & Legal Consent Matrix">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={18} color="var(--color-primary-teal)" />
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem' }}>Bonded Unit Clinical Identifiers</h4>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Joint ART Registry ID:</span>
                  <span style={{ fontWeight: '600' }}>ART-IND-2026-0042</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Female Partner UHID:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.wifeUhid}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Male Partner UHID:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.husbandUhid}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Marriage Duration:</span>
                  <span style={{ fontWeight: '600' }}>6 Years (Registered Dec 2019)</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FileText size={18} color="var(--color-primary-teal)" />
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem' }}>Infertility Etiology & Prior ART</h4>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Type of Infertility:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.infertilityType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Primary Diagnosis:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.etiology}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Prior IUI Attempts:</span>
                  <span style={{ fontWeight: '600' }}>2 Cycles (Unsuccessful, 2024)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Prior IVF Cycles:</span>
                  <span style={{ fontWeight: '600' }}>0 (Index Cycle #1)</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(8, 127, 140, 0.2)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Lock size={18} color="var(--color-primary-teal)" />
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem' }}>Mandatory ART Regulatory Consents</h4>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Form 12: ART Treatment Informed Consent (Dual e-Signed)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Form 14: Cryopreservation of Gametes & Embryos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="var(--color-success)" />
                  <span>Notarized Non-Commercial Surrogacy/Donor Disclosure</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <Button size="xs" variant="primary" icon={ShieldCheck}>
                    Verify & Re-Lock Consent Vault
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '18.2' && (
        <Card title="18.2 Controlled Ovarian Hyperstimulation (COH) Protocol">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Protocol Type</span>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-primary-teal)' }}>{selectedCouple.protocol}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Current Cycle Day</span>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>{selectedCouple.cycleDay}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Serum Estradiol (E2)</span>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-success)' }}>{selectedCouple.e2Level}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Serum Progesterone (P4)</span>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>0.85 ng/mL (Safe &lt; 1.5)</div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F6F6', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 12px' }}>Stimulation Day</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Recombinant FSH (rFSH)</th>
                    <th style={{ padding: '10px 12px' }}>hMG Dose</th>
                    <th style={{ padding: '10px 12px' }}>GnRH Antagonist</th>
                    <th style={{ padding: '10px 12px' }}>Serum E2 (pg/mL)</th>
                    <th style={{ padding: '10px 12px' }}>Nurse Stamp</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Day 2', date: '15 Oct 2026', rfsh: '225 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: 'None', e2: '48 pg/mL', nurse: 'Sr. Mary K. (08:30)' },
                    { day: 'Day 5', date: '18 Oct 2026', rfsh: '225 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: 'None', e2: '380 pg/mL', nurse: 'Sr. Deepa S. (08:45)' },
                    { day: 'Day 8', date: '21 Oct 2026', rfsh: '200 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: '0.25 mg Cetrorelix', e2: '1,240 pg/mL', nurse: 'Sr. Mary K. (08:30)' },
                    { day: 'Day 10 (Today)', date: '23 Oct 2026', rfsh: '150 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: '0.25 mg Cetrorelix', e2: '2,140 pg/mL', nurse: 'Sr. Anita R. (08:30)' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{row.day}</td>
                      <td style={{ padding: '10px 12px' }}>{row.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>{row.rfsh}</td>
                      <td style={{ padding: '10px 12px' }}>{row.hmg}</td>
                      <td style={{ padding: '10px 12px', color: '#B45309', fontWeight: '600' }}>{row.ant}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700' }}>{row.e2}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>{row.nurse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '18.3' && (
        <Card title="18.3 Folliculometry & Bilateral Ovary Growth Grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Right Ovary */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ScanLine size={18} /> Right Ovary (6 Follicles)
                </h4>
                <Badge variant="teal">Lead: 19.5 mm</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {follicles.rightOvary.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: f >= 18 ? 'var(--color-bg-pale-aqua)' : '#F8FAFA',
                      border: f >= 18 ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>F#{i + 1}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: f >= 18 ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                      {f} <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>mm</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '600', color: f >= 18 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {f >= 18 ? 'Mature Cohort' : 'Growing'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Left Ovary */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ScanLine size={18} /> Left Ovary (5 Follicles)
                </h4>
                <Badge variant="teal">Lead: 19.0 mm</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {follicles.leftOvary.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: f >= 18 ? 'var(--color-bg-pale-aqua)' : '#F8FAFA',
                      border: f >= 18 ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>F#{i + 1}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: f >= 18 ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                      {f} <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>mm</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '600', color: f >= 18 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                      {f >= 18 ? 'Mature Cohort' : 'Growing'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '14px 18px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Endometrial Thickness:</span>
                <span style={{ fontWeight: '800', marginLeft: '6px', color: 'var(--color-primary-teal)' }}>10.4 mm</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Pattern:</span>
                <span style={{ fontWeight: '800', marginLeft: '6px', color: 'var(--color-success)' }}>Trilaminar (Grade A Receptive)</span>
              </div>
            </div>
            <Button size="sm" variant="primary" icon={Sparkles}>
              Calculate Trigger Readiness Score
            </Button>
          </div>
        </Card>
      )}

      {activeSubtab === '18.4' && (
        <Card title="18.4 Ovulation Trigger Clock & Oocyte Pick-Up (OPU) Lock">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <h4 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Trigger Injection Protocol</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Trigger Medication:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>Dual Trigger: rhCG 250 mcg + Triptorelin 0.2 mg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Exact Scheduled Injection Time:</span>
                  <span style={{ fontWeight: '700', color: '#B45309' }}>23 Oct 2026 at 22:30 IST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Maturity Cohort:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>6 Follicles &gt;= 18mm Verified</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-primary-teal)', backgroundColor: 'var(--color-bg-pale-aqua)', textAlign: 'center' }}>
              <Clock size={36} color="var(--color-primary-teal)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                OPU Surgery Slot (35.5h Post-Trigger)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                25 Oct 2026 • 10:00 AM
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                OT-2 (IVF Cleanroom Suite) • Anesthesiologist: Dr. Arvind Swamy
              </div>
              <div style={{ marginTop: '14px' }}>
                <Button size="sm" variant="primary" icon={CheckSquare}>
                  Confirm Theatre & Embryologist Slot
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '18.5' && (
        <Card title="18.5 Cycle Outcome & National ART Board Registry">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Day 14 Serum Beta hCG</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
                  248.5 <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>mIU/mL</span>
                </div>
                <Badge variant="teal" style={{ marginTop: '6px' }}>Positive Implantation</Badge>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>6-Week Clinical TVS Scan</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  Intrauterine Gestational Sac
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Fetal Pole (+) • FHR: 138 bpm
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Registry Classification</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                  Single Clinical Pregnancy
                </div>
                <Badge variant="info" style={{ marginTop: '6px' }}>Batch Ready to Push</Badge>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button size="sm" variant="outline" icon={Download}>
                Export ICMR ART Summary (PDF)
              </Button>
              <Button size="sm" variant="primary" icon={Share2}>
                Push to National ART Registry Portal
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
