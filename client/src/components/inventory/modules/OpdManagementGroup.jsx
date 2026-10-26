import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  PhoneCall,
  Calendar,
  Send,
  Plus,
  Search,
  Clock
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_OPD_QUEUE } from '../inventoryMockData';

export function OpdManagementGroup({ activeSubtab = '22.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [queue, setQueue] = useState(INITIAL_OPD_QUEUE);
  const [notification, setNotification] = useState('');
  const [isVisitSlipModalOpen, setIsVisitSlipModalOpen] = useState(false);
  const [selectedTokenForSlip, setSelectedTokenForSlip] = useState(null);

  // 22.5 Follow-ups list
  const [followUps, setFollowUps] = useState([
    {
      id: 'FLP-101',
      uhid: 'UHID-2026-0814',
      patientName: 'Devika Sengupta',
      phone: '+91 98301 24567',
      doctor: 'Dr. Arindam Mitra',
      department: 'General Medicine',
      lastVisitDate: '2026-10-18',
      recallDate: '2026-10-28',
      purpose: 'Fasting Lipid & Glycemic Review post Statin therapy',
      channel: 'WhatsApp & SMS',
      status: 'Reminder Dispatched'
    },
    {
      id: 'FLP-102',
      uhid: 'UHID-2026-0922',
      patientName: 'Rajesh Verma',
      phone: '+91 94250 88219',
      doctor: 'Dr. Sandeep Kulkarni',
      department: 'General Surgery',
      lastVisitDate: '2026-10-20',
      recallDate: '2026-10-27',
      purpose: 'Post-Op Day 7 Suture Line Inspection & Dressing',
      channel: 'SMS Priority',
      status: 'Patient Confirmed Visit'
    },
    {
      id: 'FLP-103',
      uhid: 'UHID-2026-1045',
      patientName: 'Amina Khatun',
      phone: '+91 98112 34091',
      doctor: 'Dr. Ananya Sharma',
      department: 'Obstetrics & Gynaecology',
      lastVisitDate: '2026-10-21',
      recallDate: '2026-11-04',
      purpose: 'Antenatal 28-Week Growth Ultrasound & OGTT',
      channel: 'WhatsApp',
      status: 'Scheduled'
    }
  ]);

  const [isScheduleFollowUpModalOpen, setIsScheduleFollowUpModalOpen] = useState(false);
  const [newFollowUpForm, setNewFollowUpForm] = useState({
    patientName: 'Devika Sengupta',
    uhid: 'UHID-2026-0814',
    doctor: 'Dr. Arindam Mitra',
    department: 'General Medicine',
    recallDate: '2026-11-05',
    purpose: 'Routine review',
    channel: 'WhatsApp & SMS'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCallNext = (tokenId) => {
    setQueue(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'In Consultation' } : t));
    showToast(`Token ${tokenId} called to doctor consultation desk!`);
  };

  const handleCompleteConsult = (tokenId) => {
    setQueue(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'Completed' } : t));
    showToast(`Consultation completed for Token ${tokenId}. Follow-up scheduled.`);
  };

  const handleDispatchReminder = (flpId) => {
    setFollowUps(prev => prev.map(f => f.id === flpId ? { ...f, status: 'Reminder Dispatched' } : f));
    showToast(`Automated reminder SMS and WhatsApp sent to patient for ${flpId}!`);
  };

  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    const newFlp = {
      id: `FLP-${104 + followUps.length}`,
      uhid: newFollowUpForm.uhid,
      patientName: newFollowUpForm.patientName,
      phone: '+91 98300 00000',
      doctor: newFollowUpForm.doctor,
      department: newFollowUpForm.department,
      lastVisitDate: new Date().toISOString().split('T')[0],
      recallDate: newFollowUpForm.recallDate,
      purpose: newFollowUpForm.purpose,
      channel: newFollowUpForm.channel,
      status: 'Scheduled'
    };
    setFollowUps([newFlp, ...followUps]);
    setIsScheduleFollowUpModalOpen(false);
    showToast(`Follow-up scheduled for ${newFlp.patientName} on ${newFlp.recallDate}!`);
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

      {/* SUBMODULE 22.1: OPD Clinic Desk Dashboard */}
      {activeSubtab === '22.1' && (
        <Card
          title="OPD Clinic Desk & Doctor Attendance Dashboard"
          subtitle="Specialty clinic sessions, active consulting physicians, token distribution, and pacing"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>ACTIVE CLINIC SESSIONS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>8 Doctors Active</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>General Medicine, OBGYN, Ortho, Cardio</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#B45309' }}>QUEUE WAITING TIME</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#92400E', marginTop: '4px' }}>18 Mins Avg</div>
              <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '4px' }}>Within NABH clinical benchmark</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#047857' }}>CONSULTATIONS TODAY</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#065F46', marginTop: '4px' }}>142 Patients</div>
              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px' }}>86 Finished • 56 In Progress/Waiting</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 22.2: Patient Arrival & Check-in */}
      {activeSubtab === '22.2' && (
        <Card
          title="Patient Arrival & Front-Desk Check-in"
          subtitle="Walk-in barcode validation, appointment verification, and vitals nursing station routing"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Token</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Arrival Time</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Doctor & Department</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Check-in Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{t.tokenNumber}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{t.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{t.patientName}</td>
                    <td style={{ padding: '10px 14px' }}>{t.arrivalTime}</td>
                    <td style={{ padding: '10px 14px' }}>{t.doctor} ({t.department})</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">Checked-in</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 22.3: Consultation Queue Management */}
      {activeSubtab === '22.3' && (
        <Card
          title="Consultation Queue Coordinator & Doctor Call Console"
          subtitle="Calling next token, priority triage escalation, and waiting lounge display synchronization"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {queue.map((t) => (
              <div key={t.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>Token {t.tokenNumber}: {t.patientName} ({t.gender}, {t.age})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Clinician: {t.doctor} • Dept: {t.department}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {t.status === 'Waiting (Next)' && (
                    <Button size="sm" variant="primary" icon={PhoneCall} onClick={() => handleCallNext(t.id)}>
                      Call Next Patient
                    </Button>
                  )}
                  {t.status === 'In Consultation' && (
                    <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => handleCompleteConsult(t.id)}>
                      Complete Consultation
                    </Button>
                  )}
                  {t.status === 'Completed' && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: '700' }}>✓ Completed</span>
                  )}
                  {t.status !== 'Waiting (Next)' && t.status !== 'In Consultation' && t.status !== 'Completed' && (
                    <Badge variant="gray">{t.status}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 22.4: OPD Visit Slip Printout */}
      {activeSubtab === '22.4' && (
        <Card
          title="OPD Encounter Visit Slip Printing"
          subtitle="Direct barcode encounter slips, consulting room numbering, and fee receipt stamps"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {queue.map((t) => (
              <div key={t.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontWeight: '700' }}>{t.patientName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Token {t.tokenNumber} • {t.uhid}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <Button size="sm" variant="outline" icon={Printer} onClick={() => {
                    setSelectedTokenForSlip(t);
                    setIsVisitSlipModalOpen(true);
                  }}>
                    Print OPD Visit Slip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 22.5: Follow-up Tracking */}
      {activeSubtab === '22.5' && (
        <Card
          title="Clinical Follow-up & Chronic Disease Recall Tracking"
          subtitle="Post-consultation follow-up scheduling, automated SMS/WhatsApp recall alerts, and missed appointment tracking"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsScheduleFollowUpModalOpen(true)}>
              Schedule New Follow-up
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Follow-up ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient & Phone</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Consultant & Dept</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Last Visit</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Recall Due Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Clinical Follow-up Scope</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Channel & Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((flp) => (
                  <tr key={flp.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{flp.id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{flp.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{flp.uhid} • {flp.phone}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div>{flp.doctor}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{flp.department}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{flp.lastVisitDate}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {flp.recallDate}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{flp.purpose}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={flp.status.includes('Confirmed') ? 'success' : flp.status.includes('Dispatched') ? 'teal' : 'warning'}>
                        {flp.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Send}
                        onClick={() => handleDispatchReminder(flp.id)}
                      >
                        Send Alert
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: OPD Visit Slip */}
      <Modal
        isOpen={isVisitSlipModalOpen}
        onClose={() => setIsVisitSlipModalOpen(false)}
        title="OPD Visit Encounter Slip"
        subtitle="Printable clinical desk routing docket"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FFFFFF',
            fontSize: '0.82rem'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
              <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '1rem' }}>MEDICSPRIME MULTISPECIALTY HOSPITAL</div>
              <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>OPD CONSULTATION VISIT SLIP</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div>Patient: <strong>{selectedTokenForSlip?.patientName}</strong></div>
              <div>UHID: <strong>{selectedTokenForSlip?.uhid}</strong></div>
              <div>Token No: <strong>{selectedTokenForSlip?.tokenNumber}</strong></div>
              <div>Consultant: <strong>{selectedTokenForSlip?.doctor}</strong></div>
              <div>Department: <strong>{selectedTokenForSlip?.department}</strong></div>
              <div>Room: <strong>Room 104 (Level 1)</strong></div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '8px', fontSize: '0.7rem', color: '#9CA3AF' }}>
              Valid for 7 days for complimentary review. Please bring this slip.
            </div>
          </div>

          <Button variant="primary" icon={Printer} onClick={() => {
            setIsVisitSlipModalOpen(false);
            showToast('Visit slip sent to counter slip printer.');
          }}>
            Print Official Visit Slip
          </Button>
        </div>
      </Modal>

      {/* Modal: Schedule Follow-up */}
      <Modal
        isOpen={isScheduleFollowUpModalOpen}
        onClose={() => setIsScheduleFollowUpModalOpen(false)}
        title="Schedule Clinical Follow-up Recall"
        subtitle="Automate patient reminder dispatch via WhatsApp / SMS"
      >
        <form onSubmit={handleCreateFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Full Name"
              required
              value={newFollowUpForm.patientName}
              onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, patientName: e.target.value })}
            />
            <Input
              label="UHID"
              required
              value={newFollowUpForm.uhid}
              onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Attending Doctor"
              value={newFollowUpForm.doctor}
              onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, doctor: e.target.value })}
              options={['Dr. Arindam Mitra', 'Dr. Sandeep Kulkarni', 'Dr. Ananya Sharma', 'Dr. Pradeep K. Sharma']}
            />
            <Input
              label="Recall Due Date"
              type="date"
              required
              value={newFollowUpForm.recallDate}
              onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, recallDate: e.target.value })}
            />
          </div>

          <Input
            label="Clinical Follow-up Purpose / Instructions"
            required
            placeholder="e.g. Suture removal, BP titrations, HbA1c review"
            value={newFollowUpForm.purpose}
            onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, purpose: e.target.value })}
          />

          <Select
            label="Reminder Notification Channel"
            value={newFollowUpForm.channel}
            onChange={(e) => setNewFollowUpForm({ ...newFollowUpForm, channel: e.target.value })}
            options={['WhatsApp & SMS', 'SMS Priority', 'WhatsApp Only', 'Automated IVR Call']}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsScheduleFollowUpModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Schedule Recall & Queue Alerts</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
