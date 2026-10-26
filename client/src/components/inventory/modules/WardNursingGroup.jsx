import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  HeartPulse,
  Activity,
  Pill,
  FileText,
  UserCheck,
  Check,
  Clock
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_NURSING_VITALS } from '../inventoryMockData';

export function WardNursingGroup({ activeSubtab = '21.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [vitals, setVitals] = useState(INITIAL_NURSING_VITALS);
  const [notification, setNotification] = useState('');
  const [isLogVitalsModalOpen, setIsLogVitalsModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  // Vitals form
  const [vitalForm, setVitalForm] = useState({
    bedNumber: 'BED-101',
    patientName: 'Rameshwar Teli',
    bp: '120/80 mmHg',
    pulse: 76,
    temp: '98.4 °F',
    spo2: '98%',
    respRate: 18,
    urineOutput: '350 ml',
    ivFluidIntake: '500 ml'
  });

  // 21.4: Doctor Orders
  const [doctorOrders, setDoctorOrders] = useState([
    {
      id: 'ORD-101',
      bedNumber: 'BED-101',
      patientName: 'Rameshwar Teli',
      doctor: 'Dr. Arindam Mitra',
      time: '08:00 AM',
      instruction: 'Duolin (Levosalbutamol + Ipratropium) Nebulization TDS',
      category: 'Respiratory Therapy',
      status: 'Executed',
      executedBy: 'Nurse Reena Roy (08:30 AM)'
    },
    {
      id: 'ORD-102',
      bedNumber: 'BED-101',
      patientName: 'Rameshwar Teli',
      doctor: 'Dr. Arindam Mitra',
      time: '08:00 AM',
      instruction: 'Chest Physiotherapy & Incentive Spirometry 10 breaths q2h',
      category: 'Nursing Intervention',
      status: 'Pending Execution',
      executedBy: '-'
    },
    {
      id: 'ORD-103',
      bedNumber: 'BED-103',
      patientName: 'Sanjay Deshmukh',
      doctor: 'Dr. Sunita Rao',
      time: '09:00 AM',
      instruction: 'Diabetic Foot Ulcer Betadine Dressing & Collagen Sheet application',
      category: 'Wound Care',
      status: 'Pending Execution',
      executedBy: '-'
    },
    {
      id: 'ORD-104',
      bedNumber: 'BED-ICU-01',
      patientName: 'Gurdeep Singh',
      doctor: 'Dr. Pradeep K. Sharma',
      time: '07:30 AM',
      instruction: 'Titrate Noradrenaline infusion to maintain MAP > 65 mmHg',
      category: 'Critical Care Infusion',
      status: 'Executed',
      executedBy: 'ICU Nurse Priya (07:45 AM)'
    }
  ]);

  // 21.5: SBAR Handover Notes
  const [handovers, setHandovers] = useState([
    {
      id: 'SBAR-2026-102',
      shift: 'Night to Morning Handover (07:00 AM)',
      ward: 'General Ward - Male & Female (Level 1)',
      outgoingNurse: 'Night Nurse Sunita Verma',
      incomingNurse: 'Senior Staff Nurse Reena Roy',
      situation: 'Total 12 patients in ward. 1 new admission post-midnight in Bed 104.',
      background: 'Bed 101 (Rameshwar Teli) pneumonia recovering, weaning oxygen from 4L to room air.',
      assessment: 'All morning vitals stable. Urine outputs adequate. Fasting blood sugars taken.',
      recommendation: 'Check repeat serum potassium for Bed 103 at 11 AM; Doctor daily rounds at 10 AM.',
      status: 'Handover Completed & Signed'
    }
  ]);

  const [handoverForm, setHandoverForm] = useState({
    shift: 'Morning to Evening Handover (03:00 PM)',
    outgoingNurse: 'Senior Staff Nurse Reena Roy',
    incomingNurse: 'Staff Nurse Arunima Sen',
    situation: '12 patients stable. Bed 103 dressing completed by surgeon.',
    background: 'Bed 101 IV antibiotics completed on time.',
    assessment: 'Vitals and intake-output normal across all beds.',
    recommendation: 'Ensure evening Nebulization given at 04:00 PM for Bed 101.'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLogVitals = (e) => {
    e.preventDefault();
    const newVital = {
      id: `VIT-${100 + vitals.length + 1}`,
      bedNumber: vitalForm.bedNumber,
      patientName: vitalForm.patientName,
      time: 'Now',
      bp: vitalForm.bp,
      pulse: Number(vitalForm.pulse),
      temp: vitalForm.temp,
      spo2: vitalForm.spo2,
      respRate: Number(vitalForm.respRate),
      urineOutput: vitalForm.urineOutput,
      ivFluidIntake: vitalForm.ivFluidIntake,
      nurse: 'Staff Nurse Reena Roy'
    };
    setVitals([newVital, ...vitals]);
    setIsLogVitalsModalOpen(false);
    showToast(`Vitals & I/O logged for ${newVital.patientName} (${newVital.bedNumber})`);
  };

  const handleExecuteOrder = (orderId) => {
    setDoctorOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'Executed',
      executedBy: 'Staff Nurse Reena Roy (Just now)'
    } : o));
    showToast(`Order ${orderId} executed and verified into clinical record!`);
  };

  const handleCreateHandover = (e) => {
    e.preventDefault();
    const newHandover = {
      id: `SBAR-2026-${103 + handovers.length}`,
      shift: handoverForm.shift,
      ward: 'General Ward - Level 1',
      outgoingNurse: handoverForm.outgoingNurse,
      incomingNurse: handoverForm.incomingNurse,
      situation: handoverForm.situation,
      background: handoverForm.background,
      assessment: handoverForm.assessment,
      recommendation: handoverForm.recommendation,
      status: 'Handover Completed & Signed'
    };
    setHandovers([newHandover, ...handovers]);
    setIsHandoverModalOpen(false);
    showToast(`SBAR Handover ${newHandover.id} recorded and digitally signed!`);
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

      {/* SUBMODULE 21.1: Ward Nursing Workstation */}
      {activeSubtab === '21.1' && (
        <Card
          title="Ward Nursing Shift Console & Bed Assignments"
          subtitle="Real-time nurse shift allocations, pending patient calls, acuity badges, and active ward status"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>ACTIVE ON-DUTY NURSE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>Staff Nurse Reena Roy</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Shift: Morning 07:00 - 15:00 • Ratio: 1:4</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>BED OCCUPANCY IN WARD</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803D', marginTop: '4px' }}>4 Patients Assigned</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>Bed 101, Bed 103, Bed 201, ICU 01</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 21.2: Vitals & Intake-Output Charting */}
      {activeSubtab === '21.2' && (
        <Card
          title="Bedside Vitals & Fluid Intake-Output (I/O) Charting"
          subtitle="Non-invasive blood pressure, pulse oximetry, temperature telemetry, and daily fluid balance"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsLogVitalsModalOpen(true)}>
              Record Bedside Vitals & I/O
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Bed</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>BP</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Pulse</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Temp</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>SpO2</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Resp Rate</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Fluid Intake</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Urine Output</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{v.bedNumber}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{v.patientName}</td>
                    <td style={{ padding: '10px 14px' }}>{v.bp}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{v.pulse} bpm</td>
                    <td style={{ padding: '10px 14px' }}>{v.temp}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: Number(v.spo2.replace(/[^0-9]/g, '')) < 95 ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {v.spo2}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{v.respRate}/min</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-primary-teal)', fontWeight: '600' }}>{v.ivFluidIntake}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{v.urineOutput}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 21.3: Medication Administration Record (MAR) */}
      {activeSubtab === '21.3' && (
        <Card
          title="Medication Administration Record (e-MAR)"
          subtitle="Scheduled bedside drug delivery times, five-rights verification, and nurse digital signoff"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700' }}>Inj Pantoprazole 40mg IV — Rameshwar Teli (BED-101)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Scheduled: 08:00 AM • Dose Given: 08:05 AM by Reena Roy</div>
              </div>
              <Badge variant="success">✓ Given (Signed)</Badge>
            </div>
            <div style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700' }}>Tab Augmentin 625mg PO — Sanjay Deshmukh (BED-103)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Scheduled: 02:00 PM • Due in 2 hours</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => showToast('Medication administered & e-signed.')}>
                Mark Administered
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 21.4: Doctor Order Execution */}
      {activeSubtab === '21.4' && (
        <Card
          title="Doctor Order Execution (CPOE) & Nursing Interventions"
          subtitle="Implementation of consultant CPOE orders, nebulizations, dressing changes, and vitals frequency"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doctorOrders.map((ord) => (
              <div key={ord.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.9rem' }}>{ord.bedNumber}</span>
                    <span style={{ fontWeight: '700' }}>{ord.patientName}</span>
                    <Badge variant="teal">{ord.category}</Badge>
                    <Badge variant={ord.status === 'Executed' ? 'success' : 'warning'}>{ord.status}</Badge>
                  </div>

                  <div style={{ fontSize: '0.86rem', fontWeight: '600', marginTop: '6px', color: 'var(--color-text-primary)' }}>
                    {ord.instruction}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Ordered by <strong>{ord.doctor}</strong> at {ord.time} • Execution Log: {ord.executedBy}
                  </div>
                </div>

                <div>
                  {ord.status === 'Executed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} />
                      Order Executed & Signed
                    </div>
                  ) : (
                    <Button size="sm" variant="primary" icon={Check} onClick={() => handleExecuteOrder(ord.id)}>
                      Mark Executed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 21.5: Shift Handover Notes */}
      {activeSubtab === '21.5' && (
        <Card
          title="SBAR Structured Shift Handover Protocol"
          subtitle="Situation, Background, Assessment, and Recommendation clinical shift handover protocol"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsHandoverModalOpen(true)}>
              Record Shift Handover
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {handovers.map((h) => (
              <div key={h.id} style={{ padding: '18px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.95rem' }}>{h.shift}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Outgoing Nurse: <strong>{h.outgoingNurse}</strong> ➔ Incoming Nurse: <strong>{h.incomingNurse}</strong>
                    </div>
                  </div>
                  <Badge variant="success">{h.status}</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px', fontSize: '0.82rem' }}>
                  <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: '800', color: '#1E40AF', marginBottom: '4px' }}>SITUATION (S)</div>
                    <div>{h.situation}</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAF5FF', borderRadius: 'var(--radius-sm)', border: '1px solid #E9D5FF' }}>
                    <div style={{ fontWeight: '800', color: '#6B21A8', marginBottom: '4px' }}>BACKGROUND (B)</div>
                    <div>{h.background}</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontWeight: '800', color: '#166534', marginBottom: '4px' }}>ASSESSMENT (A)</div>
                    <div>{h.assessment}</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
                    <div style={{ fontWeight: '800', color: '#92400E', marginBottom: '4px' }}>RECOMMENDATION (R)</div>
                    <div>{h.recommendation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Log Vitals */}
      <Modal
        isOpen={isLogVitalsModalOpen}
        onClose={() => setIsLogVitalsModalOpen(false)}
        title="Record Bedside Vitals & Fluid I/O"
        subtitle="Bedside clinical telemetry and fluid intake/output"
      >
        <form onSubmit={handleLogVitals} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Bed Number"
              value={vitalForm.bedNumber}
              onChange={(e) => setVitalForm({ ...vitalForm, bedNumber: e.target.value })}
            />
            <Input
              label="Patient Name"
              value={vitalForm.patientName}
              onChange={(e) => setVitalForm({ ...vitalForm, patientName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Blood Pressure (mmHg)"
              value={vitalForm.bp}
              onChange={(e) => setVitalForm({ ...vitalForm, bp: e.target.value })}
            />
            <Input
              label="Heart Rate (BPM)"
              type="number"
              value={vitalForm.pulse}
              onChange={(e) => setVitalForm({ ...vitalForm, pulse: e.target.value })}
            />
            <Input
              label="Temp (°F)"
              value={vitalForm.temp}
              onChange={(e) => setVitalForm({ ...vitalForm, temp: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="SpO2 (%)"
              value={vitalForm.spo2}
              onChange={(e) => setVitalForm({ ...vitalForm, spo2: e.target.value })}
            />
            <Input
              label="Respiratory Rate (/min)"
              type="number"
              value={vitalForm.respRate}
              onChange={(e) => setVitalForm({ ...vitalForm, respRate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="IV Fluid Intake (ml)"
              value={vitalForm.ivFluidIntake}
              onChange={(e) => setVitalForm({ ...vitalForm, ivFluidIntake: e.target.value })}
            />
            <Input
              label="Urine Output (ml)"
              value={vitalForm.urineOutput}
              onChange={(e) => setVitalForm({ ...vitalForm, urineOutput: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsLogVitalsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Vitals Chart</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: SBAR Handover */}
      <Modal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        title="Record SBAR Shift Handover"
        subtitle="Ensure uninterrupted patient safety during nurse shift transition"
      >
        <form onSubmit={handleCreateHandover} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Shift"
            value={handoverForm.shift}
            onChange={(e) => setHandoverForm({ ...handoverForm, shift: e.target.value })}
            options={[
              'Morning to Evening Handover (03:00 PM)',
              'Evening to Night Handover (11:00 PM)',
              'Night to Morning Handover (07:00 AM)'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Outgoing Nurse"
              value={handoverForm.outgoingNurse}
              onChange={(e) => setHandoverForm({ ...handoverForm, outgoingNurse: e.target.value })}
            />
            <Input
              label="Incoming Nurse"
              value={handoverForm.incomingNurse}
              onChange={(e) => setHandoverForm({ ...handoverForm, incomingNurse: e.target.value })}
            />
          </div>

          <Input
            label="Situation (S)"
            required
            value={handoverForm.situation}
            onChange={(e) => setHandoverForm({ ...handoverForm, situation: e.target.value })}
          />
          <Input
            label="Background (B)"
            required
            value={handoverForm.background}
            onChange={(e) => setHandoverForm({ ...handoverForm, background: e.target.value })}
          />
          <Input
            label="Assessment (A)"
            required
            value={handoverForm.assessment}
            onChange={(e) => setHandoverForm({ ...handoverForm, assessment: e.target.value })}
          />
          <Input
            label="Recommendation (R)"
            required
            value={handoverForm.recommendation}
            onChange={(e) => setHandoverForm({ ...handoverForm, recommendation: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsHandoverModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Sign & Complete Handover</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
