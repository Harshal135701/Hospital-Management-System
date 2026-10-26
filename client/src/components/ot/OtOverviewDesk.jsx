import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileEdit,
  Eye
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import {
  OT_THEATRES,
  SURGERY_STATUS_BADGES
} from './otConstants';
import { DEMO_OT_SURGEONS, DEMO_OT_ANESTHETISTS } from './otMockData';

export function OtOverviewDesk({
  cases = [],
  theatres = OT_THEATRES,
  onUpdateCase,
  onCreateCase,
  onNavigateSubtab: _onNavigateSubtab
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheatreFilter, setSelectedTheatreFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState(null);
  const [selectedCaseForWho, setSelectedCaseForWho] = useState(null);
  const [selectedCaseForPac, setSelectedCaseForPac] = useState(null);
  const [selectedCaseForIntraOp, setSelectedCaseForIntraOp] = useState(null);
  const [selectedCaseForPacu, setSelectedCaseForPacu] = useState(null);
  const [selectedTheatreForDetail, setSelectedTheatreForDetail] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Surgery Slot Form State
  const [newSlotForm, setNewSlotForm] = useState({
    patientName: '',
    patientUhid: '',
    age: 45,
    gender: 'Male',
    diagnosis: '',
    procedureName: '',
    surgeryType: 'Elective',
    theatreId: 'theatre-1',
    leadSurgeon: DEMO_OT_SURGEONS[0].name,
    anesthetist: DEMO_OT_ANESTHETISTS[0].name,
    timeSlot: '14:00 – 16:00'
  });

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      (c.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.patientUhid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.procedureName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.leadSurgeon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTheatre =
      selectedTheatreFilter === 'ALL' || c.theatreId === selectedTheatreFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;

    return matchesSearch && matchesTheatre && matchesStatus;
  });

  // Metrics
  const totalCases = cases.length;
  const inSurgeryCount = cases.filter(c => c.status === 'in_surgery').length;
  const inPacuCount = cases.filter(c => c.status === 'in_pacu').length;
  const preOpCount = cases.filter(c => c.status === 'pre_op_ready' || c.status === 'scheduled').length;
  const transferredWardCount = cases.filter(c => c.status === 'discharged_ward').length;

  const handleCreateSurgery = (e) => {
    e.preventDefault();
    if (!newSlotForm.patientName || !newSlotForm.procedureName) {
      alert('Please fill in patient name and surgical procedure.');
      return;
    }

    const targetTheatre = theatres.find(t => t.id === newSlotForm.theatreId);
    const newCase = {
      id: `OT-CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientId: `pat-${Date.now()}`,
      patientName: newSlotForm.patientName,
      patientUhid: newSlotForm.patientUhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      age: Number(newSlotForm.age),
      gender: newSlotForm.gender,
      diagnosis: newSlotForm.diagnosis || 'Clinical Diagnosis Verified',
      procedureName: newSlotForm.procedureName,
      surgeryType: newSlotForm.surgeryType,
      theatreId: newSlotForm.theatreId,
      theatreName: targetTheatre?.name || 'Major OT',
      leadSurgeon: newSlotForm.leadSurgeon,
      anesthetist: newSlotForm.anesthetist,
      scrubNurse: 'Assigned OT Scrub Nurse',
      timeSlot: newSlotForm.timeSlot,
      scheduledDate: new Date().toISOString().split('T')[0],
      pacStatus: 'Cleared (ASA Class I)',
      asaGrade: 'ASA Class I',
      mallampatiClass: 'Class I',
      npoStatus: 'Verified NPO',
      airwayAssessment: 'Normal Mallampati Class I',
      cardiacClearance: 'ECG Normal Sinus, Cleared',
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
      surgicalNotes: 'Patient scheduled for operative procedure on hospital OT roster.',
      status: 'scheduled',
      pacuBay: 'Reserved PACU Bay',
      aldreteScore: 0,
      pacuStatus: 'Scheduled'
    };

    onCreateCase(newCase);
    setIsScheduleModalOpen(false);
    // Reset form
    setNewSlotForm({
      patientName: '',
      patientUhid: '',
      age: 45,
      gender: 'Male',
      diagnosis: '',
      procedureName: '',
      surgeryType: 'Elective',
      theatreId: 'theatre-1',
      leadSurgeon: DEMO_OT_SURGEONS[0].name,
      anesthetist: DEMO_OT_ANESTHETISTS[0].name,
      timeSlot: '14:00 – 16:00'
    });
  };

  const handleToggleWhoItem = (key) => {
    if (!selectedCaseForWho) return;
    const updatedChecklist = {
      ...selectedCaseForWho.whoChecklist,
      [key]: !selectedCaseForWho.whoChecklist[key]
    };

    const allChecked =
      updatedChecklist.patientConfirmed &&
      updatedChecklist.siteMarked &&
      updatedChecklist.anesthesiaSafetyCheck &&
      updatedChecklist.oximeterFunctioning &&
      updatedChecklist.teamIntroduced &&
      updatedChecklist.antibioticGiven &&
      updatedChecklist.countsVerified &&
      updatedChecklist.specimensLabeled;

    const updatedCase = {
      ...selectedCaseForWho,
      whoChecklist: updatedChecklist,
      whoChecklistStatus: allChecked ? 'Completed (All 3 Phases)' : 'In Progress'
    };

    onUpdateCase(updatedCase);
    setSelectedCaseForWho(updatedCase);
  };

  const handleUpdateStatus = (c, newStatus) => {
    const updated = { ...c, status: newStatus };
    onUpdateCase(updated);
    if (selectedCaseForDetail?.id === c.id) setSelectedCaseForDetail(updated);
    if (selectedCaseForPacu?.id === c.id) setSelectedCaseForPacu(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 OT KPI Metric Cards matching Appointment / Finance desk styling */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total Surgeries Today */}
        <div
          onClick={() => setSelectedStatusFilter('ALL')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: selectedStatusFilter === 'ALL' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Today's Surgeries
            </span>
            <span style={{ backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              OT Census
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {totalCases}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Total scheduled elective & emergency procedures
          </span>
        </div>

        {/* In Surgery Active */}
        <div
          onClick={() => setSelectedStatusFilter('in_surgery')}
          style={{
            backgroundColor: selectedStatusFilter === 'in_surgery' ? '#FFFBEB' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedStatusFilter === 'in_surgery' ? '#FDE68A' : 'var(--color-border)'}`,
            borderLeft: '4px solid #D97706',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400E', textTransform: 'uppercase' }}>
              In Surgery (Live)
            </span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Active Incision
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D97706' }}>
            {inSurgeryCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#92400E' }}>
            Active operating theatres with live scrub teams
          </span>
        </div>

        {/* PACU Recovery */}
        <div
          onClick={() => setSelectedStatusFilter('in_pacu')}
          style={{
            backgroundColor: selectedStatusFilter === 'in_pacu' ? '#EFF6FF' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedStatusFilter === 'in_pacu' ? '#BFDBFE' : 'var(--color-border)'}`,
            borderLeft: '4px solid #2563EB',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' }}>
              PACU Recovery
            </span>
            <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Post-Op Bay
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563EB' }}>
            {inPacuCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#1E40AF' }}>
            Extubated & monitored under Aldrete recovery score
          </span>
        </div>

        {/* Pre-Op Ready */}
        <div
          onClick={() => setSelectedStatusFilter('pre_op_ready')}
          style={{
            backgroundColor: selectedStatusFilter === 'pre_op_ready' ? '#CCFBF1' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedStatusFilter === 'pre_op_ready' ? '#99F6E4' : 'var(--color-border)'}`,
            borderLeft: '4px solid #0D9488',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#115E59', textTransform: 'uppercase' }}>
              Pre-Op Ready
            </span>
            <span style={{ backgroundColor: '#E6FFFA', color: '#0D9488', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              PAC Cleared
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0D9488' }}>
            {preOpCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#115E59' }}>
            Fasting, blood crossmatched & awaiting theatre wheel-in
          </span>
        </div>

        {/* Transferred to Ward */}
        <div
          onClick={() => setSelectedStatusFilter('discharged_ward')}
          style={{
            backgroundColor: selectedStatusFilter === 'discharged_ward' ? '#F0FDF4' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedStatusFilter === 'discharged_ward' ? '#BBF7D0' : 'var(--color-border)'}`,
            borderLeft: '4px solid #16A34A',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>
              Transferred to Ward
            </span>
            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Discharged
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16A34A' }}>
            {transferredWardCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#166534' }}>
            Aldrete ≥ 9/10, stable transfer to inpatient rooms
          </span>
        </div>
      </div>

      {/* Live OT Suite Status & Availability Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Operating Suite Status & Availability Grid
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Real-time positive pressure air handling, sterile field monitoring, and surgical suite turnover tracking
            </p>
          </div>
          <Badge variant="teal" size="sm">
            5 Major & Emergency Theatres Active
          </Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px'
          }}
        >
          {theatres.map((th) => {
            const isOcc = th.status === 'in_surgery';
            const isTurnover = th.status === 'turnover';

            const statusBg = isOcc ? '#FEF3C7' : isTurnover ? '#EFF6FF' : '#DCFCE7';
            const statusColor = isOcc ? '#92400E' : isTurnover ? '#1E40AF' : '#166534';
            const statusLabel = isOcc ? 'IN SURGERY' : isTurnover ? 'TURNOVER CLEANING' : 'READY / AVAILABLE';
            const borderAccent = isOcc ? '#D97706' : isTurnover ? '#2563EB' : '#16A34A';

            return (
              <div
                key={th.id}
                onClick={() => setSelectedTheatreForDetail(th)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  borderTop: `4px solid ${borderAccent}`,
                  padding: '14px',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      {th.code}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      {th.name.split('(')[0].trim()}
                    </h4>
                  </div>
                  <span
                    style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.68rem',
                      fontWeight: '800'
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.3' }}>
                  <div style={{ fontWeight: '600', color: isOcc ? '#92400E' : 'var(--color-text-primary)' }}>
                    {th.currentSurgery}
                  </div>
                  {isOcc && (
                    <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>
                      Patient: <strong>{th.patientName}</strong>
                    </div>
                  )}
                  <div style={{ marginTop: '4px', fontSize: '0.73rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Surgeon: <strong>{th.surgeon.split(',')[0]}</strong></span>
                    <span>Anesthetist: <strong>{th.anesthetist}</strong></span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.71rem',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}
                >
                  <span>{th.hvac.split('•')[0].trim()}</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                    {th.startTime} – {th.estimatedEnd}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Surgery Schedule Card matching Appointment Module */}
      <Card
        title="Today's Surgical Master Schedule"
        subtitle="Complete perioperative surgical cases, lead operating consultants, pre-op readiness, and PACU status"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule Surgery Slot
            </Button>
          </div>
        }
      >
        {/* Search & Filter Toolbar matching Appointment Desk */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border-subtle)'
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search by UHID, patient name, procedure, or surgeon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Theatre:
              </span>
              <select
                value={selectedTheatreFilter}
                onChange={(e) => setSelectedTheatreFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="ALL">All Suites (5 Theatres)</option>
                {theatres.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Status:
              </span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="ALL">All Case Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="pre_op_ready">Pre-Op Ready</option>
                <option value="in_surgery">In Surgery</option>
                <option value="in_pacu">In PACU Recovery</option>
                <option value="discharged_ward">Transferred to Ward</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact, Hospital-Grade Surgery Schedule Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Slot ID</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Operating Theatre</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Patient Details</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Surgical Procedure</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Lead Surgeon & Team</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Time Slot</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>PAC Readiness</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>WHO Safety Checklist</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>Case Status</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontWeight: '700', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No surgical cases found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((otCase) => {
                  const statusBadge = SURGERY_STATUS_BADGES[otCase.status] || SURGERY_STATUS_BADGES.scheduled;

                  return (
                    <tr
                      key={otCase.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: otCase.status === 'in_surgery' ? '#FFFDF5' : 'transparent',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      {/* Slot ID */}
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)', whiteSpace: 'nowrap' }}>
                        {otCase.id}
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                          {otCase.surgeryType}
                        </div>
                      </td>

                      {/* Theatre */}
                      <td style={{ padding: '10px 14px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {otCase.theatreName.split('(')[0].trim()}
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>
                          {otCase.theatreId.toUpperCase()}
                        </div>
                      </td>

                      {/* Patient */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {otCase.patientName}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)' }}>
                          {otCase.patientUhid} • {otCase.age}y/{otCase.gender[0]}
                        </div>
                      </td>

                      {/* Procedure */}
                      <td style={{ padding: '10px 14px', maxWidth: '220px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }} title={otCase.procedureName}>
                          {otCase.procedureName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={otCase.diagnosis}>
                          {otCase.diagnosis}
                        </div>
                      </td>

                      {/* Surgical Team */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '600' }}>{otCase.leadSurgeon}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Anesth: {otCase.anesthetist}
                        </div>
                      </td>

                      {/* Time Slot */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {otCase.timeSlot}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Today
                        </div>
                      </td>

                      {/* PAC Readiness */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCaseForPac(otCase)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: otCase.pacStatus.includes('Cleared') ? '#DCFCE7' : '#FEF3C7',
                              color: otCase.pacStatus.includes('Cleared') ? '#166534' : '#92400E',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              display: 'inline-block'
                            }}
                          >
                            ✓ {otCase.asaGrade}
                          </span>
                          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {otCase.npoStatus.split(' ')[0]} {otCase.npoStatus.split(' ')[1]}
                          </div>
                        </button>
                      </td>

                      {/* WHO Safety Checklist */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <Button
                          size="sm"
                          variant={otCase.whoChecklistStatus.includes('Completed') ? 'outline' : 'secondary'}
                          onClick={() => setSelectedCaseForWho(otCase)}
                          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        >
                          {otCase.whoChecklistStatus.includes('Completed') ? '✓ 3/3 Phases' : otCase.whoChecklistStatus}
                        </Button>
                      </td>

                      {/* Case Status */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color,
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            display: 'inline-block'
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCaseForDetail(otCase)}
                            title="View Complete Perioperative Dossier"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCaseForIntraOp(otCase)}
                            title="Open Intra-Operative Anesthesia Notes"
                          >
                            <FileEdit size={14} />
                          </Button>
                          {otCase.status === 'in_surgery' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(otCase, 'in_pacu')}
                              style={{ fontSize: '0.70rem', padding: '2px 6px', color: '#2563EB' }}
                              title="Shift patient to PACU recovery"
                            >
                              To PACU
                            </Button>
                          )}
                          {otCase.status === 'in_pacu' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setSelectedCaseForPacu(otCase)}
                              style={{ fontSize: '0.70rem', padding: '2px 6px' }}
                              title="Evaluate Aldrete score for ward discharge"
                            >
                              Aldrete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Schedule Surgery Slot */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Operating Theatre Slot"
        subtitle="Book operating suite, surgical consultant, anesthetist and elective schedule"
        maxWidth="620px"
      >
        <form onSubmit={handleCreateSurgery} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Meera Ramanathan"
                value={newSlotForm.patientName}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, patientName: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Patient UHID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. UHID-2026-1490"
                value={newSlotForm.patientUhid}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, patientUhid: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Age</label>
              <input
                type="number"
                value={newSlotForm.age}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, age: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
              <select
                value={newSlotForm.gender}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, gender: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Surgery Priority</label>
              <select
                value={newSlotForm.surgeryType}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, surgeryType: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                <option value="Elective">Elective</option>
                <option value="Elective Day Care">Elective Day Care</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency Level 1">Emergency Level 1</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Surgical Procedure Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Laparoscopic Appendectomy / Total Knee Replacement"
              value={newSlotForm.procedureName}
              onChange={(e) => setNewSlotForm({ ...newSlotForm, procedureName: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Clinical Pre-Op Diagnosis</label>
            <input
              type="text"
              placeholder="e.g. Acute appendicitis with localized guarding"
              value={newSlotForm.diagnosis}
              onChange={(e) => setNewSlotForm({ ...newSlotForm, diagnosis: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Operating Theatre Suite</label>
              <select
                value={newSlotForm.theatreId}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, theatreId: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                {theatres.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Time Slot</label>
              <select
                value={newSlotForm.timeSlot}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, timeSlot: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                <option value="08:30 – 10:30">08:30 – 10:30 (Morning Slot 1)</option>
                <option value="11:00 – 13:00">11:00 – 13:00 (Morning Slot 2)</option>
                <option value="14:00 – 16:30">14:00 – 16:30 (Afternoon Slot 1)</option>
                <option value="17:00 – 19:30">17:00 – 19:30 (Evening Slot 1)</option>
                <option value="Emergency Immediate">Emergency Immediate</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Lead Surgeon</label>
              <select
                value={newSlotForm.leadSurgeon}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, leadSurgeon: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                {DEMO_OT_SURGEONS.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px' }}>Lead Anesthetist</label>
              <select
                value={newSlotForm.anesthetist}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, anesthetist: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
              >
                {DEMO_OT_ANESTHETISTS.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm & Book OT Slot</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Interactive WHO Surgical Safety Checklist */}
      {selectedCaseForWho && (
        <Modal
          isOpen={Boolean(selectedCaseForWho)}
          onClose={() => setSelectedCaseForWho(null)}
          title="WHO Surgical Safety Checklist"
          subtitle={`Case ${selectedCaseForWho.id} — ${selectedCaseForWho.patientName} (${selectedCaseForWho.procedureName})`}
          maxWidth="680px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            {/* Phase 1: Sign-in */}
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)', marginBottom: '8px' }}>
                Phase 1: Sign-in (Before Induction of Anesthesia)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.patientConfirmed}
                    onChange={() => handleToggleWhoItem('patientConfirmed')}
                  />
                  <span>Patient identity, incision site, surgical procedure, and consent confirmed</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.siteMarked}
                    onChange={() => handleToggleWhoItem('siteMarked')}
                  />
                  <span>Surgical site is clearly marked by the operating consultant</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.anesthesiaSafetyCheck}
                    onChange={() => handleToggleWhoItem('anesthesiaSafetyCheck')}
                  />
                  <span>Anesthesia machine and medication check completed & functioning</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.oximeterFunctioning}
                    onChange={() => handleToggleWhoItem('oximeterFunctioning')}
                  />
                  <span>Pulse oximeter on patient and functioning properly</span>
                </label>
              </div>
            </div>

            {/* Phase 2: Time-out */}
            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', color: '#92400E', marginBottom: '8px' }}>
                Phase 2: Time-out (Before Skin Incision)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.teamIntroduced}
                    onChange={() => handleToggleWhoItem('teamIntroduced')}
                  />
                  <span>All team members have introduced themselves by name and role</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.antibioticGiven}
                    onChange={() => handleToggleWhoItem('antibioticGiven')}
                  />
                  <span>Antibiotic prophylaxis given within the past 60 minutes</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.bloodLossRiskAssessed}
                    onChange={() => handleToggleWhoItem('bloodLossRiskAssessed')}
                  />
                  <span>Anticipated critical events, blood loss risk, and sterility confirmed</span>
                </label>
              </div>
            </div>

            {/* Phase 3: Sign-out */}
            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
                Phase 3: Sign-out (Before Patient Leaves Operating Room)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.countsVerified}
                    onChange={() => handleToggleWhoItem('countsVerified')}
                  />
                  <span>Instrument, sponge and needle counts verified 100% correct by scrub nurse</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedCaseForWho.whoChecklist.specimensLabeled}
                    onChange={() => handleToggleWhoItem('specimensLabeled')}
                  />
                  <span>Specimen labeled accurately (patient name, UHID, exact tissue origin)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                Checklist Status: <strong>{selectedCaseForWho.whoChecklistStatus}</strong>
              </span>
              <Button variant="primary" onClick={() => setSelectedCaseForWho(null)}>
                Save Checklist Sign-off
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Pre-Anesthesia Checkup (PAC) Readiness Modal */}
      {selectedCaseForPac && (
        <Modal
          isOpen={Boolean(selectedCaseForPac)}
          onClose={() => setSelectedCaseForPac(null)}
          title="Pre-Anesthesia Checkup (PAC) Clearance"
          subtitle={`Patient: ${selectedCaseForPac.patientName} (${selectedCaseForPac.patientUhid})`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>ASA Physical Status</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                  {selectedCaseForPac.asaGrade}
                </div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>Mallampati Airway Score</div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {selectedCaseForPac.mallampatiClass}
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px' }}>Clinical Pre-Op Assessments:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--color-text-secondary)' }}>
                <div>• Fasting Compliance: <strong>{selectedCaseForPac.npoStatus}</strong></div>
                <div>• Airway Evaluation: <strong>{selectedCaseForPac.airwayAssessment}</strong></div>
                <div>• Cardiac & Echo Clearance: <strong>{selectedCaseForPac.cardiacClearance}</strong></div>
                <div>• Blood Transfusion Reservation: <strong>{selectedCaseForPac.crossmatchUnits}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setSelectedCaseForPac(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleUpdateStatus(selectedCaseForPac, 'pre_op_ready');
                  setSelectedCaseForPac(null);
                }}
              >
                Confirm Pre-Op Readiness
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: Intra-Operative & Anesthesia Notes */}
      {selectedCaseForIntraOp && (
        <Modal
          isOpen={Boolean(selectedCaseForIntraOp)}
          onClose={() => setSelectedCaseForIntraOp(null)}
          title="Intra-Operative Anesthesia & Surgical Notes"
          subtitle={`Case: ${selectedCaseForIntraOp.procedureName} (${selectedCaseForIntraOp.theatreName})`}
          maxWidth="650px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>Anesthesia Technique</div>
                <div style={{ fontWeight: '700', marginTop: '2px' }}>{selectedCaseForIntraOp.anesthesiaType}</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem' }}>Estimated Blood Loss (EBL)</div>
                <div style={{ fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>{selectedCaseForIntraOp.estimatedBloodLoss}</div>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Implants & Consumables Barcode:</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>{selectedCaseForIntraOp.implantsUsed}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                ✓ Mop, Sponge & Instrument Verification:
              </div>
              <div style={{ color: '#166534', fontSize: '0.78rem' }}>
                Pre-incision, cavity closure, and skin closure counts verified 100% correct by Scrub Nurse ({selectedCaseForIntraOp.scrubNurse}).
              </div>
            </div>

            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Operative Findings & Notes:</div>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                {selectedCaseForIntraOp.surgicalNotes}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setSelectedCaseForIntraOp(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleUpdateStatus(selectedCaseForIntraOp, 'in_pacu');
                  setSelectedCaseForIntraOp(null);
                }}
              >
                Sign Off & Transfer to PACU
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: PACU Recovery Monitoring & Aldrete Score */}
      {selectedCaseForPacu && (
        <Modal
          isOpen={Boolean(selectedCaseForPacu)}
          onClose={() => setSelectedCaseForPacu(null)}
          title="PACU Recovery & Aldrete Score Evaluation"
          subtitle={`Patient: ${selectedCaseForPacu.patientName} (${selectedCaseForPacu.pacuBay})`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-primary-teal)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Current Modified Aldrete Score
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {selectedCaseForPacu.aldreteScore || 9} / 10
                </div>
              </div>
              <Badge variant="success">✓ Cleared for Ward Transfer (Score ≥ 9)</Badge>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>Aldrete Recovery Criteria Breakdown:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--color-text-secondary)' }}>
                <div>• Activity: <strong>2/2</strong> — Moves all 4 extremities voluntarily or on command</div>
                <div>• Respiration: <strong>2/2</strong> — Breathes deeply and coughs freely, airway patent</div>
                <div>• Circulation: <strong>2/2</strong> — Blood pressure within ± 20% of pre-anesthetic level</div>
                <div>• Consciousness: <strong>2/2</strong> — Fully awake and oriented to time/place</div>
                <div>• Oxygen Saturation: <strong>1/2</strong> — SpO2 &gt; 92% on supplemental nasal prongs (2 L/min)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setSelectedCaseForPacu(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleUpdateStatus(selectedCaseForPacu, 'discharged_ward');
                  setSelectedCaseForPacu(null);
                }}
              >
                Authorize Transfer to Inpatient Surgical Ward
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: Theatre Environmental Details Modal */}
      {selectedTheatreForDetail && (
        <Modal
          isOpen={Boolean(selectedTheatreForDetail)}
          onClose={() => setSelectedTheatreForDetail(null)}
          title={`Operating Suite Telemetry: ${selectedTheatreForDetail.code}`}
          subtitle={selectedTheatreForDetail.name}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>HVAC & Positive Pressure Specs</div>
              <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>{selectedTheatreForDetail.hvac}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>Surgical & Anesthetic Equipment</div>
              <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>{selectedTheatreForDetail.equipment}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>Specialty Allocation</div>
              <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>{selectedTheatreForDetail.specialty}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSelectedTheatreForDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 7: Case Detail Dossier */}
      {selectedCaseForDetail && (
        <Modal
          isOpen={Boolean(selectedCaseForDetail)}
          onClose={() => setSelectedCaseForDetail(null)}
          title={`Perioperative Case Dossier — ${selectedCaseForDetail.id}`}
          subtitle={`${selectedCaseForDetail.patientName} (${selectedCaseForDetail.patientUhid})`}
          maxWidth="650px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Procedure:</strong> {selectedCaseForDetail.procedureName}</div>
              <div><strong>Diagnosis:</strong> {selectedCaseForDetail.diagnosis}</div>
              <div><strong>Lead Surgeon:</strong> {selectedCaseForDetail.leadSurgeon}</div>
              <div><strong>Anesthetist:</strong> {selectedCaseForDetail.anesthetist}</div>
              <div><strong>Theatre Suite:</strong> {selectedCaseForDetail.theatreName}</div>
              <div><strong>Time Slot:</strong> {selectedCaseForDetail.timeSlot}</div>
              <div><strong>PAC Status:</strong> {selectedCaseForDetail.pacStatus}</div>
              <div><strong>WHO Checklist:</strong> {selectedCaseForDetail.whoChecklistStatus}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <strong>Surgical Protocol Notes:</strong>
              <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                {selectedCaseForDetail.surgicalNotes}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSelectedCaseForDetail(null)}>Close Dossier</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
