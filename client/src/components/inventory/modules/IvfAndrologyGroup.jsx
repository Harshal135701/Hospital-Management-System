import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_IVF_CYCLES } from '../inventoryMockData';

export function IvfAndrologyGroup({ activeSubtab = '18.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [cycles, setCycles] = useState(INITIAL_IVF_CYCLES);
  const [notification, setNotification] = useState('');
  const [isRegisterCoupleModalOpen, setIsRegisterCoupleModalOpen] = useState(false);
  const [isRecordScanModalOpen, setIsRecordScanModalOpen] = useState(false);

  // Form states
  const [coupleForm, setCoupleForm] = useState({
    femaleName: '',
    femaleAge: 30,
    maleName: '',
    maleAge: 33,
    protocol: 'Antagonist Protocol (GnRH)',
    artConsentSigned: true
  });

  const [scanForm, setScanForm] = useState({
    cycleId: 'IVF-CYC-101',
    dayOfStimulation: 'Day 10',
    rightFollicles: '18mm, 17mm, 15mm, 14mm',
    leftFollicles: '19mm, 16mm, 15mm, 12mm',
    endoThickness: '9.2 mm (Trilaminar)'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleRegisterCouple = (e) => {
    e.preventDefault();
    const newCycle = {
      id: `IVF-CYC-${100 + cycles.length + 1}`,
      coupleId: `CPL-2026-0${25 + cycles.length}`,
      femalePartner: `${coupleForm.femaleName} (${coupleForm.femaleAge})`,
      malePartner: `${coupleForm.maleName} (${coupleForm.maleAge})`,
      protocol: coupleForm.protocol,
      stimulationDay: 'Day 1 (Baseline)',
      triggerDate: 'Pending Folliculometry',
      oocytesExpected: 12,
      status: 'Active Stimulation'
    };
    setCycles([newCycle, ...cycles]);
    setIsRegisterCoupleModalOpen(false);
    showToast(`Couple ${newCycle.femalePartner} & ${newCycle.malePartner} registered with ART Consent!`);
  };

  const handleRecordScan = (e) => {
    e.preventDefault();
    setIsRecordScanModalOpen(false);
    showToast(`Folliculometry scan saved: Endometrium ${scanForm.endoThickness}. Lead follicles maturing.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 18.1: Couple Registration & Legal Consent */}
      {activeSubtab === '18.1' && (
        <Card
          title="Couple Registration & Statutory Legal Consent"
          subtitle="Assisted Reproductive Technology (ART) Act statutory affidavits, legal consent forms, and biological registry"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsRegisterCoupleModalOpen(true)}>
              Register New Couple & Consent
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Cycle ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Couple Reg ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Female Partner</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Male Partner</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>ART Protocol</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cyc) => (
                  <tr key={cyc.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{cyc.id}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{cyc.coupleId}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{cyc.femalePartner}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{cyc.malePartner}</td>
                    <td style={{ padding: '10px 14px' }}>{cyc.protocol}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={cyc.status.includes('Positive') ? 'success' : 'teal'}>
                        {cyc.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 18.2: Ovarian Stimulation Protocol */}
      {activeSubtab === '18.2' && (
        <Card
          title="Ovarian Stimulation Protocol & Gonadotropin Charting"
          subtitle="Recombinant FSH / hMG dose escalation logs, antagonist initiation, and Serum E2/P4 levels"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Pooja Bhatt (Cycle: IVF-CYC-101)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Protocol: Antagonist Protocol • Current: Day 9 of Stimulation • Serum E2: 2,420 pg/ml
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <Badge variant="teal">Inj Gonal-F 225 IU OD</Badge>
                <Badge variant="teal">Inj Cetrotide 0.25mg SubQ</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 18.3: Follicular Ultrasound Tracking */}
      {activeSubtab === '18.3' && (
        <Card
          title="Follicular Ultrasound Tracking (Folliculometry)"
          subtitle="Cohort growth monitoring, mean follicular diameter measurement, and endometrial pattern"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsRecordScanModalOpen(true)}>
              Record Follicular Scan
            </Button>
          }
        >
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem' }}>Latest Scan — Pooja Bhatt (Day 9)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Right Ovary:</strong> 4 follicles (18mm, 17mm, 15mm, 14mm)
              </div>
              <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Left Ovary:</strong> 4 follicles (19mm, 16mm, 15mm, 12mm)
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-sm)', color: '#166534' }}>
                <strong>Endometrium:</strong> 9.2 mm Trilaminar pattern
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 18.4: Trigger Timing & Scheduling */}
      {activeSubtab === '18.4' && (
        <Card
          title="Trigger Timing & Ovum Pick-Up (OPU) Countdown"
          subtitle="Final oocyte maturation trigger administration window, 35-36 hour timing lock, and surgical OT schedule"
        >
          <div style={{ padding: '18px', backgroundColor: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={24} color="#D97706" />
              <div>
                <div style={{ fontWeight: '800', color: '#92400E', fontSize: '0.95rem' }}>
                  Next OPU Trigger Scheduled: Sunita Joshi (IVF-CYC-102)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                  Trigger Injection: Inj Decapeptyl 0.2mg SubQ at <strong>22:00 Hrs Tonight</strong>. OPU Laparoscopy booked at <strong>09:30 AM (T+35.5 hrs)</strong>.
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 18.5: Cycle Outcome & Pregnancy Registry */}
      {activeSubtab === '18.5' && (
        <Card
          title="Cycle Outcome & ART Pregnancy Registry"
          subtitle="Serum Beta-hCG levels, gestational cardiac activity verification, and national registry reporting"
        >
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700' }}>Farzana Parveen & Tariq Parveen (IVF-CYC-109)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Serum Beta-hCG: <strong>685 mIU/mL</strong> (Positive Clinical Pregnancy) • Single intrauterine gestational sac with fetal pole.
                </div>
              </div>
              <Badge variant="success">Clinical Pregnancy Confirmed</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Register Couple */}
      <Modal
        isOpen={isRegisterCoupleModalOpen}
        onClose={() => setIsRegisterCoupleModalOpen(false)}
        title="Register Couple for IVF Cycle"
        subtitle="Capture couple details and statutory ART legal consents"
      >
        <form onSubmit={handleRegisterCouple} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Female Partner Name"
              required
              value={coupleForm.femaleName}
              placeholder="e.g. Pooja Bhatt"
              onChange={(e) => setCoupleForm({ ...coupleForm, femaleName: e.target.value })}
            />
            <Input
              label="Age"
              type="number"
              value={coupleForm.femaleAge}
              onChange={(e) => setCoupleForm({ ...coupleForm, femaleAge: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Male Partner Name"
              required
              value={coupleForm.maleName}
              placeholder="e.g. Rohan Bhatt"
              onChange={(e) => setCoupleForm({ ...coupleForm, maleName: e.target.value })}
            />
            <Input
              label="Age"
              type="number"
              value={coupleForm.maleAge}
              onChange={(e) => setCoupleForm({ ...coupleForm, maleAge: e.target.value })}
            />
          </div>

          <Select
            label="Stimulation Protocol"
            value={coupleForm.protocol}
            onChange={(e) => setCoupleForm({ ...coupleForm, protocol: e.target.value })}
            options={['Antagonist Protocol (GnRH)', 'Long Agonist Protocol', 'Mild Stimulation / Mini IVF', 'Natural Modified Cycle']}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRegisterCoupleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Complete Registration</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Follicular Scan */}
      <Modal
        isOpen={isRecordScanModalOpen}
        onClose={() => setIsRecordScanModalOpen(false)}
        title="Record Folliculometry Ultrasound Scan"
        subtitle="Log follicle diameters and endometrial thickness"
      >
        <form onSubmit={handleRecordScan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Day of Stimulation"
            value={scanForm.dayOfStimulation}
            onChange={(e) => setScanForm({ ...scanForm, dayOfStimulation: e.target.value })}
          />
          <Input
            label="Right Ovary Follicle Cohort (mm)"
            value={scanForm.rightFollicles}
            onChange={(e) => setScanForm({ ...scanForm, rightFollicles: e.target.value })}
          />
          <Input
            label="Left Ovary Follicle Cohort (mm)"
            value={scanForm.leftFollicles}
            onChange={(e) => setScanForm({ ...scanForm, leftFollicles: e.target.value })}
          />
          <Input
            label="Endometrial Thickness & Pattern"
            value={scanForm.endoThickness}
            onChange={(e) => setScanForm({ ...scanForm, endoThickness: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRecordScanModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Ultrasound Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
