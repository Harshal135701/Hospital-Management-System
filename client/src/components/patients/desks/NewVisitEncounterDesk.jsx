import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../common/UIPrimitives';
import {
  VISIT_TYPES,
  PRIORITY_LEVELS,
  REFERRAL_SOURCES,
  FALLBACK_DEPARTMENTS,
  FALLBACK_DOCTORS,
  calculateAge,
  formatPhoneIN
} from '../patientConstants';
import {
  DepartmentService,
  DoctorAdminService,
  AppointmentService,
  TokenManager
} from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export function NewVisitEncounterDesk({
  patients = [],
  preselectedPatient = null,
  onEncounterCreated,
  onNavigateSubtab
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(preselectedPatient?.uhid || '');
  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient || patients[0] || null);

  // Departments & Doctors
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(FALLBACK_DEPARTMENTS[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Form Fields
  const [visitType, setVisitType] = useState('OPD');
  const [priority, setPriority] = useState('NORMAL');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [visitTime, setVisitTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [referralSource, setReferralSource] = useState(REFERRAL_SOURCES[0]);
  const [chiefComplaint, setChiefComplaint] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmedEncounter, setConfirmedEncounter] = useState(null);

  // Fetch live departments and doctors if available
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        if (TokenManager.getToken()) {
          const [deptRes, docRes] = await Promise.all([
            DepartmentService.getDepartments().catch(() => []),
            DoctorAdminService.getDoctors().catch(() => [])
          ]);
          if (mounted && deptRes && deptRes.length > 0) {
            setDepartments(deptRes);
            setSelectedDepartmentId(deptRes[0].id);
          }
          if (mounted && docRes && docRes.length > 0) {
            setDoctors(docRes);
          }
        }
      } catch (err) {
        console.warn('[VisitEncounterDesk] Using standard fallback roster:', err.message);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Filter doctors by selected department
  const filteredDoctors = useMemo(() => {
    if (!selectedDepartmentId) return doctors;
    const match = doctors.filter(d => String(d.department_id) === String(selectedDepartmentId));
    return match.length > 0 ? match : doctors;
  }, [doctors, selectedDepartmentId]);

  // Set default doctor when department changes
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      setSelectedDoctorId(filteredDoctors[0].id);
    } else {
      setSelectedDoctorId('');
    }
  }, [filteredDoctors]);

  // Sync preselected patient if prop changes
  useEffect(() => {
    if (preselectedPatient) {
      setSelectedPatient(preselectedPatient);
      setSearchQuery(preselectedPatient.uhid);
    }
  }, [preselectedPatient]);

  // Patient search suggestions
  const patientOptions = useMemo(() => {
    if (!searchQuery.trim()) return patients.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p =>
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uhid && p.uhid.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q))
    ).slice(0, 10);
  }, [patients, searchQuery]);

  const handleCreateEncounter = async () => {
    if (!selectedPatient) {
      setErrorMessage('Please select a verified patient record before generating an encounter.');
      return;
    }
    if (!selectedDoctorId) {
      setErrorMessage('Please select an attending clinician doctor.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const selDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId));
    const selDept = departments.find(d => String(d.id) === String(selectedDepartmentId));

    const encounterPayload = {
      patient_id: selectedPatient.id,
      patient_uhid: selectedPatient.uhid,
      patient_name: selectedPatient.full_name,
      doctor_id: selectedDoctorId,
      doctor_name: selDoctor?.full_name || 'Attending Physician',
      department_id: selectedDepartmentId,
      department_name: selDept?.name || 'General Medicine',
      appointment_date: visitDate,
      appointment_time: visitTime,
      type: visitType,
      priority,
      referral_source: referralSource,
      chief_complaint: chiefComplaint.trim() || 'General OPD consultation request',
      created_by: user?.name || user?.username || 'Reception Desk'
    };

    try {
      let created = null;
      if (TokenManager.getToken()) {
        const res = await AppointmentService.createAppointment({
          patient_id: selectedPatient.id,
          doctor_id: selectedDoctorId,
          department_id: selectedDepartmentId,
          appointment_date: visitDate,
          appointment_time: visitTime,
          reason: chiefComplaint || `${visitType} Encounter`,
          type: visitType.toLowerCase()
        });
        created = res?.data || res;
      }

      // Generate realistic encounter ticket
      const tokenLetter = visitType === 'EMERGENCY' ? 'E' : (selDept?.name?.[0]?.toUpperCase() || 'A');
      const tokenNum = Math.floor(1 + Math.random() * 40);
      const encounterNumber = `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const confirmedData = {
        id: created?.id || `enc-${Date.now()}`,
        encounterNumber,
        token: `Token #${tokenLetter}-${tokenNum}`,
        patient: selectedPatient,
        doctor: selDoctor,
        department: selDept,
        visitType,
        priority,
        visitDate,
        visitTime,
        room: selDoctor?.room || 'Consultation Room 101',
        chiefComplaint: chiefComplaint || 'Routine medical review',
        payload: encounterPayload,
        createdAt: new Date().toISOString()
      };

      setConfirmedEncounter(confirmedData);
      if (onEncounterCreated) {
        onEncounterCreated(confirmedData);
      }
    } catch (err) {
      console.error('[VisitEncounterDesk] Encounter generation failed:', err);
      setErrorMessage(err.message || 'Failed to create visit encounter. Please check slot availability and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedEncounter(null);
    setErrorMessage(null);
    setChiefComplaint('');
    setVisitDate(defaultDate);
    setVisitTime(defaultTime);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Confirmed Encounter Success Banner */}
      {confirmedEncounter && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#16A34A" />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#14532D' }}>
                Visit Encounter Generated Successfully
              </div>
              <div style={{ fontSize: '0.84rem', color: '#166534', marginTop: '2px' }}>
                Encounter ID: <strong style={{ fontFamily: 'monospace' }}>{confirmedEncounter.encounterNumber}</strong> • Assigned: <strong style={{ color: '#0F3A5D' }}>{confirmedEncounter.token}</strong> ({confirmedEncounter.room})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '1px' }}>
                Patient: <strong>{confirmedEncounter.patient.full_name}</strong> ({confirmedEncounter.patient.uhid}) → Attending Clinician: <strong>{confirmedEncounter.doctor?.full_name}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print OPD Slip
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleReset}
            >
              Create Another Visit
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#991B1B',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} color="#DC2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Patient Lookup Card */}
      <Card
        title="Reception Visit & Encounter Desk"
        subtitle="Search and select patient to schedule a new OPD, Emergency, Day Care, or Inpatient encounter"
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search patient by UHID, Full Name, or 10-digit Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateSubtab && onNavigateSubtab('24.1')}
          >
            + Register New Patient
          </Button>
        </div>

        {/* Patient Selection Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {patientOptions.map(p => {
            const isSel = selectedPatient?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPatient(p);
                  setSearchQuery(p.uhid);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSel ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSel ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.full_name} ({p.uhid})
              </button>
            );
          })}
        </div>

        {/* Selected Patient Banner */}
        {selectedPatient && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                {selectedPatient.full_name ? selectedPatient.full_name[0].toUpperCase() : 'P'}
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {selectedPatient.full_name} <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-teal)' }}>({selectedPatient.uhid})</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {calculateAge(selectedPatient.date_of_birth)} • {selectedPatient.gender || 'other'} • Blood: {selectedPatient.blood_group || 'Unknown'} • Phone: {formatPhoneIN(selectedPatient.mobile)}
                </div>
              </div>
            </div>
            <Badge variant="teal">Verified Patient Record</Badge>
          </div>
        )}
      </Card>

      {/* Encounter Configuration Form */}
      <Card
        title="Encounter Details & Clinical Routing"
        subtitle="Assign consultation category, attending specialist, queue priority, and clinical reason"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Select
              label="Visit / Encounter Type *"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              options={VISIT_TYPES}
            />

            <Select
              label="Queue Priority *"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={PRIORITY_LEVELS}
            />

            <Select
              label="Clinical Department *"
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              options={departments.map(d => ({ value: d.id, label: d.name }))}
            />

            <Select
              label="Attending Clinician / Doctor *"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={filteredDoctors.map(doc => ({
                value: doc.id,
                label: `${doc.full_name} (${doc.specialty || 'Consultant'})`
              }))}
            />

            <Input
              label="Encounter Date *"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />

            <Input
              label="Scheduled Slot Time *"
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              required
            />

            <Select
              label="Referral Source"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              options={REFERRAL_SOURCES.map(r => ({ value: r, label: r }))}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Chief Complaint / Presenting Symptoms
            </label>
            <textarea
              placeholder="e.g. Acute onset of chest heaviness for 2 hours, shortness of breath on exertion, routine diabetes checkup..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--color-border-subtle)' }}>
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={submitting}
            >
              Reset Details
            </Button>

            <Button
              variant="primary"
              icon={Plus}
              loading={submitting}
              onClick={handleCreateEncounter}
              disabled={!selectedPatient}
            >
              Generate Encounter & Queue Token
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
