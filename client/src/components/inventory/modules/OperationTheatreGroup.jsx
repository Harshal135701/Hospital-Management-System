import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_OT_SCHEDULE } from '../inventoryMockData';

export function OperationTheatreGroup({ activeSubtab = '23.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [schedule, setSchedule] = useState(INITIAL_OT_SCHEDULE);
  const [notification, setNotification] = useState('');
  const [isBookOtModalOpen, setIsBookOtModalOpen] = useState(false);
  const [isWhoChecklistModalOpen, setIsWhoChecklistModalOpen] = useState(false);
  const [selectedOtCase, setSelectedOtCase] = useState(null);

  // WHO checklist interactive state
  const [whoChecklist, setWhoChecklist] = useState({
    identityConfirmed: true,
    siteMarked: true,
    anesthesiaSafetyCheck: true,
    pulseOximeterFunctioning: true,
    allergyKnown: false,
    airwayDifficultyAssessed: true,
    teamIntroduced: true,
    antibioticProphylaxisGiven: true,
    spongeInstrumentCountCorrect: true,
    specimenLabeled: true
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCompleteWhoChecklist = () => {
    if (selectedOtCase) {
      setSchedule(prev => prev.map(s => s.id === selectedOtCase.id ? { ...s, whoChecklistStatus: 'Completed (All 3 Phases)' } : s));
    }
    setIsWhoChecklistModalOpen(false);
    showToast('WHO Surgical Safety Checklist verified & electronically signed!');
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

      {/* SUBMODULE 23.1: OT Slot Scheduling & Theatre Roster */}
      {activeSubtab === '23.1' && (
        <Card
          title="Operation Theatre Slot Scheduling & Roster"
          subtitle="Operating suite slot allocations, chief surgical consultants, anesthetists, and elective schedules"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsBookOtModalOpen(true)}>
              Schedule OT Slot
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Slot ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Operating Theatre</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Surgical Procedure</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Lead Surgeon</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Anesthetist</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Time Slot</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>PAC Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>WHO Checklist</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((ot) => (
                  <tr key={ot.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{ot.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{ot.theatre}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{ot.surgeryName}</td>
                    <td style={{ padding: '10px 14px' }}>{ot.surgeon}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{ot.anesthetist}</td>
                    <td style={{ padding: '10px 14px' }}>{ot.time}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">{ot.pacStatus}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedOtCase(ot);
                        setIsWhoChecklistModalOpen(true);
                      }}>
                        {ot.whoChecklistStatus}
                      </Button>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={ot.status === 'In Progress' ? 'warning' : ot.status.includes('PACU') ? 'teal' : 'success'}>
                        {ot.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 23.2: Pre-Anesthesia Checkup (PAC) */}
      {activeSubtab === '23.2' && (
        <Card
          title="Pre-Anesthesia Checkup (PAC) Clinical Clearance"
          subtitle="Airway assessment (Mallampati score), ASA Physical Status grading, NPO fasting compliance"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Laparoscopic Cholecystectomy — Ananya Mukherjee</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                ASA Grade: <strong>ASA Class II</strong> (Controlled Hypertension) • Mallampati Class: <strong>Class I</strong> • NPO: 8 Hours Verified
              </div>
              <div style={{ marginTop: '10px' }}>
                <Badge variant="success">✓ Medically Cleared for General Anesthesia</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 23.3: WHO Surgical Safety Checklist */}
      {activeSubtab === '23.3' && (
        <Card
          title="WHO Surgical Safety Checklist Verification"
          subtitle="Perioperative safety sign-in, intra-operative surgical time-out, and final post-op sign-out"
        >
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>Standard Operating Safety Protocol</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              The WHO 10-point perioperative checklist is mandatory for every surgical case prior to scalpel-to-skin incision.
            </p>
            <div style={{ marginTop: '14px' }}>
              <Button size="sm" variant="primary" onClick={() => {
                setSelectedOtCase(schedule[0]);
                setIsWhoChecklistModalOpen(true);
              }}>
                Launch Safety Checklist Module
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 23.4: Intra-Operative Anesthesia & Surgical Notes */}
      {activeSubtab === '23.4' && (
        <Card
          title="Intra-Operative Anesthesia & Surgical Procedure Notes"
          subtitle="Surgical incision findings, estimated blood loss (EBL), implant lot/barcode tracking, and sponge count verification"
        >
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Operation: Total Knee Arthroplasty Left</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              <div>Anesthesia: Combined Spinal-Epidural (Bupivacaine 0.5% Heavy 3.0 ml)</div>
              <div>Estimated Blood Loss: 150 ml • Tourniquet Time: 48 Mins • Implant: Stryker Triathlon CoCr (Lot #ST-99120)</div>
              <div style={{ color: 'var(--color-success)', fontWeight: '700', marginTop: '4px' }}>✓ Mop, Gauge & Instrument Count verified 100% correct by Scrub Nurse</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 23.5: Post-Anesthesia Care Unit (PACU) Recovery */}
      {activeSubtab === '23.5' && (
        <Card
          title="Post-Anesthesia Care Unit (PACU) Recovery Monitoring"
          subtitle="Modified Aldrete Recovery Score (0-10), vital sign stability, and post-op ward transfer authorization"
        >
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700' }}>Patient in PACU Bay 2 (Post Exploratory Laparotomy)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Aldrete Score: <strong>9 / 10</strong> (Motor: 2, Respiration: 2, Circulation: 2, Consciousness: 2, O2 Sat: 1)
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => showToast('Patient cleared for transfer to Surgical Inpatient Ward.')}>
              Clear for Ward Transfer
            </Button>
          </div>
        </Card>
      )}

      {/* Modal: WHO Surgical Safety Checklist */}
      <Modal
        isOpen={isWhoChecklistModalOpen}
        onClose={() => setIsWhoChecklistModalOpen(false)}
        title="WHO Surgical Safety Checklist"
        subtitle={selectedOtCase ? `Case: ${selectedOtCase.surgeryName} (${selectedOtCase.theatre})` : 'Perioperative Checklist'}
        maxWidth="650px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
          <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
            Phase 1: Sign-in (Before induction of anesthesia)
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={whoChecklist.identityConfirmed} onChange={(e) => setWhoChecklist({ ...whoChecklist, identityConfirmed: e.target.checked })} />
            <span>Has the patient confirmed his/her identity, site, procedure, and consent?</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={whoChecklist.siteMarked} onChange={(e) => setWhoChecklist({ ...whoChecklist, siteMarked: e.target.checked })} />
            <span>Is the surgical incision site clearly marked by the surgeon?</span>
          </label>

          <div style={{ padding: '10px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', fontWeight: '700', color: '#B45309' }}>
            Phase 2: Time-out (Before skin incision)
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={whoChecklist.teamIntroduced} onChange={(e) => setWhoChecklist({ ...whoChecklist, teamIntroduced: e.target.checked })} />
            <span>Have all team members introduced themselves by name and role?</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={whoChecklist.antibioticProphylaxisGiven} onChange={(e) => setWhoChecklist({ ...whoChecklist, antibioticProphylaxisGiven: e.target.checked })} />
            <span>Has IV antibiotic prophylaxis been given within the past 60 minutes?</span>
          </label>

          <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', fontWeight: '700', color: '#166534' }}>
            Phase 3: Sign-out (Before patient leaves operating room)
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={whoChecklist.spongeInstrumentCountCorrect} onChange={(e) => setWhoChecklist({ ...whoChecklist, spongeInstrumentCountCorrect: e.target.checked })} />
            <span>Instrument, sponge and needle counts are confirmed correct?</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsWhoChecklistModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCompleteWhoChecklist}>Sign & Verify Checklist</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Book OT */}
      <Modal
        isOpen={isBookOtModalOpen}
        onClose={() => setIsBookOtModalOpen(false)}
        title="Schedule Operation Theatre Slot"
        subtitle="Reserve surgical theatre and assign operating team"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Procedure Name" placeholder="e.g. Laparoscopic Appendectomy" />
          <Select label="Select Operating Theatre" options={['Major OT 1 (Laparoscopy)', 'Major OT 2 (Ortho)', 'Minor OT 3', 'Emergency OT Suite']} />
          <Select label="Surgeon" options={['Dr. Sandeep Kulkarni', 'Dr. Harish Bahl', 'Dr. Rajiv Menon']} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsBookOtModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setIsBookOtModalOpen(false);
              showToast('OT slot booked on hospital schedule.');
            }}>
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
