import React, { useState } from 'react';
import {
  Plus,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { OT_THEATRES, SURGERY_STATUS_BADGES } from './otConstants';
import { DEMO_OT_SURGEONS, DEMO_OT_ANESTHETISTS } from './otMockData';

export function OtSchedulingDesk({
  cases = [],
  theatres = OT_THEATRES,
  onCreateCase,
  onUpdateCase: _onUpdateCase
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('ALL');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    patientUhid: '',
    age: 50,
    gender: 'Male',
    diagnosis: '',
    procedureName: '',
    surgeryType: 'Elective',
    theatreId: 'theatre-1',
    leadSurgeon: DEMO_OT_SURGEONS[0].name,
    anesthetist: DEMO_OT_ANESTHETISTS[0].name,
    timeSlot: '08:30 – 10:30'
  });

  const filtered = cases.filter(c => {
    const matchSearch =
      (c.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.procedureName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.leadSurgeon || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchTheatre = selectedTheatre === 'ALL' || c.theatreId === selectedTheatre;
    return matchSearch && matchTheatre;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.procedureName) return;
    const th = theatres.find(t => t.id === form.theatreId);
    const newCase = {
      id: `OT-CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: `pat-${Date.now()}`,
      patientName: form.patientName,
      patientUhid: form.patientUhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      age: Number(form.age),
      gender: form.gender,
      diagnosis: form.diagnosis || 'Clinical Diagnosis Verified',
      procedureName: form.procedureName,
      surgeryType: form.surgeryType,
      theatreId: form.theatreId,
      theatreName: th?.name || 'Major OT',
      leadSurgeon: form.leadSurgeon,
      anesthetist: form.anesthetist,
      scrubNurse: 'Assigned OT Scrub Nurse',
      timeSlot: form.timeSlot,
      scheduledDate: new Date().toISOString().split('T')[0],
      pacStatus: 'Cleared (ASA Class I)',
      asaGrade: 'ASA Class I',
      mallampatiClass: 'Class I',
      npoStatus: 'Verified NPO',
      airwayAssessment: 'Mallampati Class I',
      cardiacClearance: 'ECG Normal',
      crossmatchUnits: '2 Units Reserved',
      whoChecklistStatus: 'Pending Sign-in',
      whoChecklist: {
        signInDone: false,
        timeOutDone: false,
        signOutDone: false,
        patientConfirmed: true,
        siteMarked: true,
        anesthesiaSafetyCheck: true,
        oximeterFunctioning: true,
        allergyChecked: true,
        airwayAssessed: true,
        bloodLossRiskAssessed: true,
        teamIntroduced: false,
        antibioticGiven: false,
        countsVerified: false,
        specimensLabeled: false
      },
      anesthesiaType: 'General Anesthesia (Planned)',
      estimatedBloodLoss: 'Scheduled',
      incisionTime: 'Pending',
      closureTime: 'Pending',
      implantsUsed: 'Standard Consumables',
      spongeCountVerified: false,
      instrumentCountVerified: false,
      surgicalNotes: 'Patient scheduled on hospital surgical roster.',
      status: 'scheduled',
      pacuBay: 'Reserved PACU Bay',
      aldreteScore: 0,
      pacuStatus: 'Scheduled'
    };
    onCreateCase(newCase);
    setIsScheduleModalOpen(false);
  };

  return (
    <Card
      title="23.1 Operation Theatre Slot Scheduling & Theatre Roster"
      subtitle="Operating suite slot allocations, chief surgical consultants, anesthetists, and elective schedules"
      action={
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsScheduleModalOpen(true)}>
          Schedule New Slot
        </Button>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search roster by patient, surgeon or procedure..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={selectedTheatre}
          onChange={(e) => setSelectedTheatre(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.80rem' }}
        >
          <option value="ALL">All Suites (5 Theatres)</option>
          {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '10px 14px' }}>Slot ID</th>
              <th style={{ padding: '10px 14px' }}>Theatre Suite</th>
              <th style={{ padding: '10px 14px' }}>Patient Details</th>
              <th style={{ padding: '10px 14px' }}>Surgical Procedure</th>
              <th style={{ padding: '10px 14px' }}>Lead Surgeon</th>
              <th style={{ padding: '10px 14px' }}>Time Slot</th>
              <th style={{ padding: '10px 14px' }}>PAC Clearance</th>
              <th style={{ padding: '10px 14px' }}>WHO Checklist</th>
              <th style={{ padding: '10px 14px' }}>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const statusBadge = SURGERY_STATUS_BADGES[c.status] || SURGERY_STATUS_BADGES.scheduled;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{c.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{c.theatreName}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: '700' }}>{c.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{c.patientUhid} • {c.age}y/{c.gender[0]}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{c.procedureName}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div>{c.leadSurgeon}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Anesth: {c.anesthetist}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>{c.timeSlot}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge variant={c.pacStatus.includes('Cleared') ? 'success' : 'warning'}>{c.asaGrade}</Badge>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge variant="teal">{c.whoChecklistStatus}</Badge>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ backgroundColor: statusBadge.bg, color: statusBadge.color, padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: '700' }}>
                      {statusBadge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule OT Slot" maxWidth="600px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Patient Full Name *</label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Procedure Name *</label>
            <input
              type="text"
              required
              value={form.procedureName}
              onChange={(e) => setForm({ ...form, procedureName: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Operating Theatre</label>
              <select
                value={form.theatreId}
                onChange={(e) => setForm({ ...form, theatreId: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                {theatres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Lead Surgeon</label>
              <select
                value={form.leadSurgeon}
                onChange={(e) => setForm({ ...form, leadSurgeon: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                {DEMO_OT_SURGEONS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Book Slot</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
