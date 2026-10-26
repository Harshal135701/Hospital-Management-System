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
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';

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
  const [couples, setCouples] = useState([
    {
      artId: 'ART-2026-0042',
      wifeName: 'Sunita Sharma',
      wifeUhid: 'UHID-2026-0891',
      wifeAge: 32,
      wifeBlood: 'B Positive',
      husbandName: 'Rahul Sharma',
      husbandUhid: 'UHID-2026-0892',
      husbandAge: 35,
      husbandBlood: 'O Positive',
      infertilityType: 'Primary (4.5 Years)',
      etiology: 'PCOS + Mild Teratozoospermia',
      protocol: 'Antagonist Protocol (Flexible)',
      cycleDay: 'Day 10',
      leadFollicles: 4,
      e2Level: '2,140 pg/mL',
      p4Level: '0.85 ng/mL',
      status: 'Stimulation Active'
    },
    {
      artId: 'ART-2026-0038',
      wifeName: 'Meera Nambiar',
      wifeUhid: 'UHID-2026-0744',
      wifeAge: 29,
      wifeBlood: 'A Positive',
      husbandName: 'Karthik Nambiar',
      husbandUhid: 'UHID-2026-0745',
      husbandAge: 31,
      husbandBlood: 'A Positive',
      infertilityType: 'Secondary (3 Years)',
      etiology: 'Bilateral Tubal Occlusion',
      protocol: 'Long Agonist Protocol',
      cycleDay: 'Trigger Scheduled',
      leadFollicles: 6,
      e2Level: '3,480 pg/mL',
      p4Level: '0.92 ng/mL',
      status: 'Trigger Scheduled (OPU 08:30 Tomorrow)'
    }
  ]);

  const [selectedCouple, setSelectedCouple] = useState(couples[0]);

  // Bilateral Follicle Grid State
  const [follicles, setFollicles] = useState({
    rightOvary: [19.5, 18.2, 17.0, 15.4, 14.1, 11.2],
    leftOvary: [19.0, 18.6, 16.8, 15.0, 13.5],
    endometrium: 10.4,
    pattern: 'Trilaminar (Grade A Receptive)',
    sonologist: 'Dr. Sunita Rao (MD, DNB)'
  });

  // Daily Stimulation Logs
  const [stimulationLogs, setStimulationLogs] = useState([
    { day: 'Day 2', date: '15 Oct 2026', rfsh: '225 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: 'None', e2: '48 pg/mL', nurse: 'Sr. Mary K. (08:30)' },
    { day: 'Day 5', date: '18 Oct 2026', rfsh: '225 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: 'None', e2: '380 pg/mL', nurse: 'Sr. Deepa S. (08:45)' },
    { day: 'Day 8', date: '21 Oct 2026', rfsh: '200 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: '0.25 mg Cetrorelix', e2: '1,240 pg/mL', nurse: 'Sr. Mary K. (08:30)' },
    { day: 'Day 10 (Today)', date: '23 Oct 2026', rfsh: '150 IU (Gonal-F)', hmg: '75 IU (Menopur)', ant: '0.25 mg Cetrorelix', e2: '2,140 pg/mL', nurse: 'Sr. Anita R. (08:30)' }
  ]);

  // Trigger State
  const [triggerData, setTriggerData] = useState({
    drug: 'Dual Trigger: rhCG 250 mcg + Triptorelin 0.2 mg',
    injectionTime: '23 Oct 2026 at 22:30 IST',
    opuTime: '25 Oct 2026 • 10:00 AM (35.5h)',
    theatre: 'OT-2 (IVF Cleanroom Suite)',
    anesthesiologist: 'Dr. Arvind Swamy',
    matureFolliclesCount: 6,
    isConfirmed: true
  });

  // Pregnancy Outcome State
  const [pregnancyOutcome, setPregnancyOutcome] = useState({
    day14Hcg: '248.5 mIU/mL',
    day16Hcg: '526.0 mIU/mL',
    clinicalTvs: 'Intrauterine Gestational Sac Confirmed',
    fhr: '138 bpm (Positive Cardiac Motion)',
    classification: 'Single Clinical Pregnancy',
    batchId: 'ICMR-ART-BATCH-2026-Q4-019',
    status: 'Batch Ready to Push'
  });

  // Modals visibility
  const [isNewCoupleModalOpen, setIsNewCoupleModalOpen] = useState(false);
  const [isSwitchCoupleModalOpen, setIsSwitchCoupleModalOpen] = useState(false);
  const [isStimulationModalOpen, setIsStimulationModalOpen] = useState(false);
  const [isFollicleModalOpen, setIsFollicleModalOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isPregnancyModalOpen, setIsPregnancyModalOpen] = useState(false);

  // Form States
  const [newCoupleForm, setNewCoupleForm] = useState({
    wifeName: '',
    wifeUhid: '',
    wifeAge: '',
    wifeBlood: 'B Positive',
    husbandName: '',
    husbandUhid: '',
    husbandAge: '',
    husbandBlood: 'O Positive',
    infertilityType: 'Primary (3 Years)',
    etiology: 'PCOS + Mild Teratozoospermia',
    protocol: 'Antagonist Protocol (Flexible)',
    form12Signed: true,
    form14Signed: true,
    surrogacyDisclosure: true
  });

  const [stimForm, setStimForm] = useState({
    day: 'Day 12',
    date: '25 Oct 2026',
    rfsh: '150 IU (Gonal-F)',
    hmg: '75 IU (Menopur)',
    ant: '0.25 mg Cetrorelix',
    e2: '2,680 pg/mL',
    p4: '0.90 ng/mL',
    nurse: 'Sr. Anita R. (08:30)'
  });

  const [follicleForm, setFollicleForm] = useState({
    rightOvary: '19.5, 18.2, 17.0, 15.4, 14.1, 11.2',
    leftOvary: '19.0, 18.6, 16.8, 15.0, 13.5',
    endometrium: '10.4',
    pattern: 'Trilaminar (Grade A Receptive)',
    sonologist: 'Dr. Sunita Rao (MD, DNB)'
  });

  const [triggerForm, setTriggerForm] = useState({
    drug: 'Dual Trigger: rhCG 250 mcg + Triptorelin 0.2 mg',
    injectionTime: '23 Oct 2026 at 22:30 IST',
    opuTime: '25 Oct 2026 • 10:00 AM',
    theatre: 'OT-2 (IVF Cleanroom Suite)',
    anesthesiologist: 'Dr. Arvind Swamy',
    matureFolliclesCount: '6'
  });

  const [pregnancyForm, setPregnancyForm] = useState({
    day14Hcg: '248.5',
    day16Hcg: '526.0',
    clinicalTvs: 'Intrauterine Gestational Sac Confirmed',
    fhr: '138 bpm',
    classification: 'Single Clinical Pregnancy',
    batchId: 'ICMR-ART-BATCH-2026-Q4-019'
  });

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleSaveNewCouple = (e) => {
    e.preventDefault();
    if (!newCoupleForm.wifeName || !newCoupleForm.husbandName) {
      alert('Please fill in both partners names.');
      return;
    }
    const newArtId = `ART-2026-00${couples.length + 43}`;
    const newEntry = {
      artId: newArtId,
      wifeName: newCoupleForm.wifeName,
      wifeUhid: newCoupleForm.wifeUhid || `UHID-2026-09${couples.length + 10}`,
      wifeAge: parseInt(newCoupleForm.wifeAge) || 30,
      wifeBlood: newCoupleForm.wifeBlood,
      husbandName: newCoupleForm.husbandName,
      husbandUhid: newCoupleForm.husbandUhid || `UHID-2026-09${couples.length + 11}`,
      husbandAge: parseInt(newCoupleForm.husbandAge) || 33,
      husbandBlood: newCoupleForm.husbandBlood,
      infertilityType: newCoupleForm.infertilityType,
      etiology: newCoupleForm.etiology,
      protocol: newCoupleForm.protocol,
      cycleDay: 'Day 2 (Basal)',
      leadFollicles: 0,
      e2Level: '45 pg/mL',
      p4Level: '0.40 ng/mL',
      status: 'Cycle Initiated (Consent Locked)'
    };
    setCouples([newEntry, ...couples]);
    setSelectedCouple(newEntry);
    setIsNewCoupleModalOpen(false);
    triggerToast(`Bonded Couple Registered: ${newEntry.wifeName} & ${newEntry.husbandName} (${newArtId})`);
  };

  const handleSaveStimulation = (e) => {
    e.preventDefault();
    const newRow = {
      day: stimForm.day,
      date: stimForm.date,
      rfsh: stimForm.rfsh,
      hmg: stimForm.hmg,
      ant: stimForm.ant,
      e2: stimForm.e2,
      nurse: stimForm.nurse
    };
    setStimulationLogs([...stimulationLogs, newRow]);
    setSelectedCouple(prev => ({ ...prev, cycleDay: stimForm.day, e2Level: stimForm.e2, p4Level: stimForm.p4 }));
    setIsStimulationModalOpen(false);
    triggerToast(`Daily stimulation dose logged for ${stimForm.day}: E2 ${stimForm.e2}`);
  };

  const handleSaveFollicles = (e) => {
    e.preventDefault();
    const rParsed = follicleForm.rightOvary.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const lParsed = follicleForm.leftOvary.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const endoParsed = parseFloat(follicleForm.endometrium) || 10.4;
    
    setFollicles({
      rightOvary: rParsed.length ? rParsed : [18.0],
      leftOvary: lParsed.length ? lParsed : [17.5],
      endometrium: endoParsed,
      pattern: follicleForm.pattern,
      sonologist: follicleForm.sonologist
    });

    const leadCount = [...rParsed, ...lParsed].filter(x => x >= 18).length;
    setSelectedCouple(prev => ({ ...prev, leadFollicles: leadCount }));
    setIsFollicleModalOpen(false);
    triggerToast(`Folliculometry scan recorded: ${leadCount} mature follicles >= 18mm, Endo: ${endoParsed}mm`);
  };

  const handleSaveTrigger = (e) => {
    e.preventDefault();
    setTriggerData({
      drug: triggerForm.drug,
      injectionTime: triggerForm.injectionTime,
      opuTime: triggerForm.opuTime,
      theatre: triggerForm.theatre,
      anesthesiologist: triggerForm.anesthesiologist,
      matureFolliclesCount: parseInt(triggerForm.matureFolliclesCount) || 6,
      isConfirmed: true
    });
    setSelectedCouple(prev => ({ ...prev, status: `Trigger Scheduled (${triggerForm.opuTime})` }));
    setIsTriggerModalOpen(false);
    triggerToast(`Ovulation Trigger locked for ${triggerForm.injectionTime}. OPU Scheduled: ${triggerForm.opuTime}`);
  };

  const handleSavePregnancy = (e) => {
    e.preventDefault();
    setPregnancyOutcome({
      day14Hcg: `${pregnancyForm.day14Hcg} mIU/mL`,
      day16Hcg: `${pregnancyForm.day16Hcg} mIU/mL`,
      clinicalTvs: pregnancyForm.clinicalTvs,
      fhr: pregnancyForm.fhr,
      classification: pregnancyForm.classification,
      batchId: pregnancyForm.batchId,
      status: 'Verified & Batch Locked'
    });
    setSelectedCouple(prev => ({ ...prev, status: `Clinical Outcome: ${pregnancyForm.classification}` }));
    setIsPregnancyModalOpen(false);
    triggerToast(`Pregnancy outcome recorded: Beta-hCG ${pregnancyForm.day14Hcg} mIU/mL (${pregnancyForm.classification})`);
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
            <Button size="sm" variant="outline" icon={Users} onClick={() => setIsSwitchCoupleModalOpen(true)}>
              Switch Couple
            </Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsNewCoupleModalOpen(true)}>
              New IVF Cycle
            </Button>
          </div>
        </div>
      </Card>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-pale-aqua)',
            border: '1.5px solid var(--color-primary-teal)',
            color: 'var(--color-primary-teal)',
            fontWeight: '600',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(8, 127, 140, 0.15)'
          }}
        >
          <CheckCircle2 size={18} color="var(--color-primary-teal)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Submodule Dynamic Renderings */}
      {activeSubtab === '18.1' && (
        <Card
          title="18.1 Couple Registration & Legal Consent Matrix"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsNewCoupleModalOpen(true)}>
              Register New Couple
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FAFCFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={18} color="var(--color-primary-teal)" />
                <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem' }}>Bonded Unit Clinical Identifiers</h4>
              </div>
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Joint ART Registry ID:</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-teal)' }}>{selectedCouple.artId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Female Partner:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.wifeName} ({selectedCouple.wifeUhid}) • {selectedCouple.wifeBlood}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Male Partner:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.husbandName} ({selectedCouple.husbandUhid}) • {selectedCouple.husbandBlood}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Current Status:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>{selectedCouple.status}</span>
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
                  <span style={{ color: 'var(--color-text-secondary)' }}>Primary Etiology:</span>
                  <span style={{ fontWeight: '600' }}>{selectedCouple.etiology}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Selected Protocol:</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-teal)' }}>{selectedCouple.protocol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Cycle Day:</span>
                  <span style={{ fontWeight: '700' }}>{selectedCouple.cycleDay}</span>
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
                  <Button size="xs" variant="primary" icon={ShieldCheck} onClick={() => triggerToast(`Consent vault re-locked for ${selectedCouple.artId}. All statutory forms verified.`)}>
                    Verify & Re-Lock Consent Vault
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '18.2' && (
        <Card
          title="18.2 Controlled Ovarian Hyperstimulation (COH) Protocol"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsStimulationModalOpen(true)}>
              Log Daily Stimulation Dose
            </Button>
          }
        >
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
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>{selectedCouple.p4Level || '0.85 ng/mL'} (Safe &lt; 1.5)</div>
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
                  {stimulationLogs.map((row, idx) => (
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
        <Card
          title="18.3 Folliculometry & Bilateral Ovary Growth Grid"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsFollicleModalOpen(true)}>
              Record TVS Scan
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Right Ovary */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ScanLine size={18} /> Right Ovary ({follicles.rightOvary.length} Follicles)
                </h4>
                <Badge variant="teal">Lead: {Math.max(...follicles.rightOvary, 0)} mm</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
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
                  <ScanLine size={18} /> Left Ovary ({follicles.leftOvary.length} Follicles)
                </h4>
                <Badge variant="teal">Lead: {Math.max(...follicles.leftOvary, 0)} mm</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
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
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Endometrial Thickness:</span>
                <span style={{ fontWeight: '800', marginLeft: '6px', color: 'var(--color-primary-teal)' }}>{follicles.endometrium} mm</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Pattern:</span>
                <span style={{ fontWeight: '800', marginLeft: '6px', color: 'var(--color-success)' }}>{follicles.pattern}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Sonologist:</span>
                <span style={{ fontWeight: '700', marginLeft: '6px' }}>{follicles.sonologist}</span>
              </div>
            </div>
            <Button size="sm" variant="primary" icon={Sparkles} onClick={() => {
              const mature = [...follicles.rightOvary, ...follicles.leftOvary].filter(x => x >= 18).length;
              if (mature >= 3 && follicles.endometrium >= 8) {
                triggerToast(`Trigger Readiness: EXCELLENT (${mature} follicles >= 18mm, Endo ${follicles.endometrium}mm). Ready for trigger.`);
                setIsTriggerModalOpen(true);
              } else {
                triggerToast(`Trigger Readiness: Ongoing (${mature} follicles >= 18mm, Endo ${follicles.endometrium}mm). Continue stimulation.`);
              }
            }}>
              Calculate Trigger Readiness Score
            </Button>
          </div>
        </Card>
      )}

      {activeSubtab === '18.4' && (
        <Card
          title="18.4 Ovulation Trigger Clock & Oocyte Pick-Up (OPU) Lock"
          action={
            <Button size="sm" variant="primary" icon={Clock} onClick={() => setIsTriggerModalOpen(true)}>
              Update Trigger & OPU Slot
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <h4 style={{ margin: '0 0 12px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Trigger Injection Protocol</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Trigger Medication:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{triggerData.drug}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Exact Scheduled Injection Time:</span>
                  <span style={{ fontWeight: '700', color: '#B45309' }}>{triggerData.injectionTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFA', borderRadius: 'var(--radius-sm)' }}>
                  <span>Maturity Cohort:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>{triggerData.matureFolliclesCount} Follicles &gt;= 18mm Verified</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-primary-teal)', backgroundColor: 'var(--color-bg-pale-aqua)', textAlign: 'center' }}>
              <Clock size={36} color="var(--color-primary-teal)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                OPU Surgery Slot (35.5h Post-Trigger)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                {triggerData.opuTime}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {triggerData.theatre} • Anesthesiologist: {triggerData.anesthesiologist}
              </div>
              <div style={{ marginTop: '14px' }}>
                <Button size="sm" variant="primary" icon={CheckSquare} onClick={() => setIsTriggerModalOpen(true)}>
                  Confirm Theatre & Embryologist Slot
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeSubtab === '18.5' && (
        <Card
          title="18.5 Cycle Outcome & National ART Board Registry"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsPregnancyModalOpen(true)}>
              Record Cycle Outcome
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Day 14 Serum Beta hCG</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>
                  {pregnancyOutcome.day14Hcg}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Day 16: <strong>{pregnancyOutcome.day16Hcg}</strong>
                </div>
                <Badge variant="teal" style={{ marginTop: '6px' }}>Positive Implantation</Badge>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>6-Week Clinical TVS Scan</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {pregnancyOutcome.clinicalTvs}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  FHR: <strong>{pregnancyOutcome.fhr}</strong>
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Registry Classification</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                  {pregnancyOutcome.classification}
                </div>
                <Badge variant="info" style={{ marginTop: '6px' }}>{pregnancyOutcome.status}</Badge>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button size="sm" variant="outline" icon={Download} onClick={() => triggerToast(`Exported ICMR ART Summary PDF for ${selectedCouple.artId}`)}>
                Export ICMR ART Summary (PDF)
              </Button>
              <Button size="sm" variant="primary" icon={Share2} onClick={() => triggerToast(`Pushed Batch ${pregnancyOutcome.batchId} to National ART Registry Portal successfully.`)}>
                Push to National ART Registry Portal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL 1: New Bonded Couple Registration & Legal Consent Vault */}
      <Modal
        isOpen={isNewCoupleModalOpen}
        onClose={() => setIsNewCoupleModalOpen(false)}
        title="Bonded Couple Registration & Legal Consent Vault"
        subtitle="Mandatory registration under ICMR & ART (Regulation) Act 2021"
      >
        <form onSubmit={handleSaveNewCouple} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Female Partner (Wife / Intended Mother)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
              <Input
                label="Full Name"
                required
                placeholder="e.g. Ananya Roy"
                value={newCoupleForm.wifeName}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, wifeName: e.target.value })}
              />
              <Input
                label="Age (Years)"
                type="number"
                required
                placeholder="e.g. 31"
                value={newCoupleForm.wifeAge}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, wifeAge: e.target.value })}
              />
              <Select
                label="Blood Group"
                value={newCoupleForm.wifeBlood}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, wifeBlood: e.target.value })}
                options={['A Positive', 'A Negative', 'B Positive', 'B Negative', 'O Positive', 'O Negative', 'AB Positive', 'AB Negative']}
              />
            </div>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Male Partner (Husband / Intended Father)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
              <Input
                label="Full Name"
                required
                placeholder="e.g. Sourav Roy"
                value={newCoupleForm.husbandName}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, husbandName: e.target.value })}
              />
              <Input
                label="Age (Years)"
                type="number"
                required
                placeholder="e.g. 34"
                value={newCoupleForm.husbandAge}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, husbandAge: e.target.value })}
              />
              <Select
                label="Blood Group"
                value={newCoupleForm.husbandBlood}
                onChange={(e) => setNewCoupleForm({ ...newCoupleForm, husbandBlood: e.target.value })}
                options={['A Positive', 'A Negative', 'B Positive', 'B Negative', 'O Positive', 'O Negative', 'AB Positive', 'AB Negative']}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Infertility Type & Duration"
              value={newCoupleForm.infertilityType}
              onChange={(e) => setNewCoupleForm({ ...newCoupleForm, infertilityType: e.target.value })}
              options={[
                'Primary (2 Years)',
                'Primary (3 Years)',
                'Primary (4.5 Years)',
                'Primary (5+ Years)',
                'Secondary (2 Years)',
                'Secondary (4 Years)'
              ]}
            />
            <Select
              label="Primary Etiology"
              value={newCoupleForm.etiology}
              onChange={(e) => setNewCoupleForm({ ...newCoupleForm, etiology: e.target.value })}
              options={[
                'PCOS + Mild Teratozoospermia',
                'Bilateral Tubal Occlusion',
                'Severe Male Factor Oligoasthenoteratozoospermia',
                'Diminished Ovarian Reserve (DOR)',
                'Stage IV Endometriosis',
                'Unexplained Infertility'
              ]}
            />
          </div>

          <Select
            label="Clinical Stimulation Protocol Choice"
            value={newCoupleForm.protocol}
            onChange={(e) => setNewCoupleForm({ ...newCoupleForm, protocol: e.target.value })}
            options={[
              'Antagonist Protocol (Flexible)',
              'Long Agonist Protocol',
              'Mild Stimulation / Natural Cycle',
              'Progestin-Primed Ovarian Stimulation (PPOS)'
            ]}
          />

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: '#FAFCFC' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              Mandatory Consent Vault Electronic Verification
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCoupleForm.form12Signed}
                  onChange={(e) => setNewCoupleForm({ ...newCoupleForm, form12Signed: e.target.checked })}
                />
                <span>Form 12: ART Treatment Informed Consent executed & biometric dual-signed</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCoupleForm.form14Signed}
                  onChange={(e) => setNewCoupleForm({ ...newCoupleForm, form14Signed: e.target.checked })}
                />
                <span>Form 14: Cryopreservation of Gametes & Surplus Embryos signed</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newCoupleForm.surrogacyDisclosure}
                  onChange={(e) => setNewCoupleForm({ ...newCoupleForm, surrogacyDisclosure: e.target.checked })}
                />
                <span>Notarized Statutory Non-Commercial Disclosure verified</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsNewCoupleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register & Lock Bonded Couple
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Switch Active Couple */}
      <Modal
        isOpen={isSwitchCoupleModalOpen}
        onClose={() => setIsSwitchCoupleModalOpen(false)}
        title="Select Active ART Couple Registry"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {couples.map((c) => (
            <div
              key={c.artId}
              onClick={() => {
                setSelectedCouple(c);
                setIsSwitchCoupleModalOpen(false);
                triggerToast(`Switched active couple to: ${c.wifeName} & ${c.husbandName} (${c.artId})`);
              }}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: selectedCouple.artId === c.artId ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: selectedCouple.artId === c.artId ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  {c.wifeName} & {c.husbandName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {c.artId} • {c.etiology} • {c.cycleDay}
                </div>
              </div>
              <Badge variant={selectedCouple.artId === c.artId ? 'teal' : 'gray'}>
                {selectedCouple.artId === c.artId ? 'Active' : 'Select'}
              </Badge>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL 3: Daily Stimulation & Injections Log */}
      <Modal
        isOpen={isStimulationModalOpen}
        onClose={() => setIsStimulationModalOpen(false)}
        title={`Log Daily Gonadotropin & E2: ${selectedCouple.artId}`}
      >
        <form onSubmit={handleSaveStimulation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Stimulation Day"
              value={stimForm.day}
              onChange={(e) => setStimForm({ ...stimForm, day: e.target.value })}
              options={['Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14']}
            />
            <Input
              label="Administration Date"
              required
              value={stimForm.date}
              onChange={(e) => setStimForm({ ...stimForm, date: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Recombinant FSH (rFSH)"
              value={stimForm.rfsh}
              onChange={(e) => setStimForm({ ...stimForm, rfsh: e.target.value })}
              options={['150 IU (Gonal-F)', '225 IU (Gonal-F)', '300 IU (Gonal-F)', '375 IU (Gonal-F)', 'None']}
            />
            <Select
              label="hMG Dose"
              value={stimForm.hmg}
              onChange={(e) => setStimForm({ ...stimForm, hmg: e.target.value })}
              options={['75 IU (Menopur)', '150 IU (Menopur)', '225 IU (Menopur)', 'None']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="GnRH Antagonist"
              value={stimForm.ant}
              onChange={(e) => setStimForm({ ...stimForm, ant: e.target.value })}
              options={['None', '0.25 mg Cetrorelix', '0.25 mg Ganirelix']}
            />
            <Input
              label="Serum E2 (pg/mL)"
              required
              value={stimForm.e2}
              onChange={(e) => setStimForm({ ...stimForm, e2: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Serum Progesterone P4 (ng/mL)"
              value={stimForm.p4}
              onChange={(e) => setStimForm({ ...stimForm, p4: e.target.value })}
            />
            <Input
              label="Administering Nurse / Timestamp"
              required
              value={stimForm.nurse}
              onChange={(e) => setStimForm({ ...stimForm, nurse: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsStimulationModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Stimulation Dose
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: TVS Folliculometry Scan Entry */}
      <Modal
        isOpen={isFollicleModalOpen}
        onClose={() => setIsFollicleModalOpen(false)}
        title={`Serial TVS Folliculometry Scan: ${selectedCouple.artId}`}
      >
        <form onSubmit={handleSaveFollicles} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Right Ovary Follicle Sizes in mm (comma-separated)"
            required
            helperText="e.g. 19.5, 18.2, 17.0, 15.4, 14.1, 11.2"
            value={follicleForm.rightOvary}
            onChange={(e) => setFollicleForm({ ...follicleForm, rightOvary: e.target.value })}
          />

          <Input
            label="Left Ovary Follicle Sizes in mm (comma-separated)"
            required
            helperText="e.g. 19.0, 18.6, 16.8, 15.0, 13.5"
            value={follicleForm.leftOvary}
            onChange={(e) => setFollicleForm({ ...follicleForm, leftOvary: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
            <Input
              label="Endometrial Thickness (mm)"
              required
              type="number"
              step="0.1"
              value={follicleForm.endometrium}
              onChange={(e) => setFollicleForm({ ...follicleForm, endometrium: e.target.value })}
            />
            <Select
              label="Endometrial Echo-Pattern"
              value={follicleForm.pattern}
              onChange={(e) => setFollicleForm({ ...follicleForm, pattern: e.target.value })}
              options={[
                'Trilaminar (Grade A Receptive)',
                'Isoechoic (Grade B Intermediate)',
                'Hyperechoic (Grade C Luteinized)'
              ]}
            />
          </div>

          <Input
            label="Attending Sonologist"
            required
            value={follicleForm.sonologist}
            onChange={(e) => setFollicleForm({ ...follicleForm, sonologist: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsFollicleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Commit Folliculometry Grid
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Ovulatory Trigger & OPU Slot Booking */}
      <Modal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        title={`Schedule Ovulatory Trigger & OPU Surgery: ${selectedCouple.artId}`}
      >
        <form onSubmit={handleSaveTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Trigger Medication"
            value={triggerForm.drug}
            onChange={(e) => setTriggerForm({ ...triggerForm, drug: e.target.value })}
            options={[
              'Dual Trigger: rhCG 250 mcg + Triptorelin 0.2 mg',
              'Recombinant hCG 250 mcg (Ovitrelle)',
              'GnRH Agonist Triptorelin 0.2 mg (Decapeptyl)',
              'Urinary hCG 10,000 IU'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Exact Trigger Injection Time"
              required
              placeholder="e.g. 23 Oct 2026 at 22:30 IST"
              value={triggerForm.injectionTime}
              onChange={(e) => setTriggerForm({ ...triggerForm, injectionTime: e.target.value })}
            />
            <Input
              label="Scheduled OPU Surgery Slot (35.5h)"
              required
              placeholder="e.g. 25 Oct 2026 • 10:00 AM"
              value={triggerForm.opuTime}
              onChange={(e) => setTriggerForm({ ...triggerForm, opuTime: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Cleanroom Theatre"
              value={triggerForm.theatre}
              onChange={(e) => setTriggerForm({ ...triggerForm, theatre: e.target.value })}
              options={[
                'OT-2 (IVF Cleanroom Suite)',
                'OT-1 (Main Operating Theatre)',
                'Minor OT Cleanroom Suite'
              ]}
            />
            <Input
              label="Lead Anesthesiologist"
              required
              value={triggerForm.anesthesiologist}
              onChange={(e) => setTriggerForm({ ...triggerForm, anesthesiologist: e.target.value })}
            />
          </div>

          <Input
            label="Mature Follicles Cohort Count (>= 18mm)"
            type="number"
            required
            value={triggerForm.matureFolliclesCount}
            onChange={(e) => setTriggerForm({ ...triggerForm, matureFolliclesCount: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsTriggerModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Lock Trigger & Book OPU Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Cycle Outcome & National ART Registry Entry */}
      <Modal
        isOpen={isPregnancyModalOpen}
        onClose={() => setIsPregnancyModalOpen(false)}
        title={`Cycle Outcome & ART Registry: ${selectedCouple.artId}`}
      >
        <form onSubmit={handleSavePregnancy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Day 14 Serum Beta hCG (mIU/mL)"
              required
              placeholder="e.g. 248.5"
              value={pregnancyForm.day14Hcg}
              onChange={(e) => setPregnancyForm({ ...pregnancyForm, day14Hcg: e.target.value })}
            />
            <Input
              label="Day 16 Doubling Beta hCG (mIU/mL)"
              required
              placeholder="e.g. 526.0"
              value={pregnancyForm.day16Hcg}
              onChange={(e) => setPregnancyForm({ ...pregnancyForm, day16Hcg: e.target.value })}
            />
          </div>

          <Select
            label="6-Week Clinical TVS Ultrasound Finding"
            value={pregnancyForm.clinicalTvs}
            onChange={(e) => setPregnancyForm({ ...pregnancyForm, clinicalTvs: e.target.value })}
            options={[
              'Intrauterine Gestational Sac Confirmed',
              'Twin Intrauterine Gestational Sacs Confirmed',
              'Triplet Gestational Sacs',
              'No Intrauterine Sac / Biochemical Pregnancy',
              'Ectopic Pregnancy Suspected'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Fetal Heart Rate (FHR)"
              value={pregnancyForm.fhr}
              onChange={(e) => setPregnancyForm({ ...pregnancyForm, fhr: e.target.value })}
              placeholder="e.g. 138 bpm"
            />
            <Select
              label="National Registry Classification"
              value={pregnancyForm.classification}
              onChange={(e) => setPregnancyForm({ ...pregnancyForm, classification: e.target.value })}
              options={[
                'Single Clinical Pregnancy',
                'Twin Clinical Pregnancy',
                'Biochemical Pregnancy',
                'Negative Cycle / Implantation Failure'
              ]}
            />
          </div>

          <Input
            label="ICMR ART Registry Batch Clearance ID"
            value={pregnancyForm.batchId}
            onChange={(e) => setPregnancyForm({ ...pregnancyForm, batchId: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsPregnancyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Commit Outcome to Registry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default IvfView;
