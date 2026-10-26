import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileSpreadsheet,
  Activity,
  Pill,
  Tag,
  Stethoscope,
  Paperclip,
  RefreshCw,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { PatientTimeline } from './PatientTimeline';
import { PrescriptionStudio } from './PrescriptionStudio';
import { DiagnosisCoding } from './DiagnosisCoding';
import { EncountersBrowser } from './EncountersBrowser';
import { DocumentAttachments } from './DocumentAttachments';
import {
  INITIAL_TIMELINE_EVENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSES,
  INITIAL_DOCUMENTS,
  INITIAL_ENCOUNTERS
} from './emrDemoData';
import { EmrService, PatientService, ClinicalStaffService } from '../../services/api';

const DEMO_FALLBACK_PATIENTS = [
  {
    id: 'p-01',
    uhid: 'UHID-2026-0104',
    full_name: 'Rajesh Mukherjee',
    gender: 'Male',
    age: 52,
    date_of_birth: '1974-06-15',
    blood_group: 'B+',
    mobile: '+91 98310 44521',
    allergies: 'Penicillin (mild cutaneous rash)'
  },
  {
    id: 'p-02',
    uhid: 'UHID-2026-0219',
    full_name: 'Priyanka Das',
    gender: 'Female',
    age: 38,
    date_of_birth: '1988-03-22',
    blood_group: 'O+',
    mobile: '+91 94331 88720',
    allergies: 'None recorded'
  },
  {
    id: 'p-03',
    uhid: 'UHID-2026-0305',
    full_name: 'Amitabh Sengupta',
    gender: 'Male',
    age: 64,
    date_of_birth: '1962-11-09',
    blood_group: 'A+',
    mobile: '+91 98200 11234',
    allergies: 'Sulfa drugs (bronchospasm)'
  }
];

export function EmrView({ initialSubtab = '12.1', onNavigate }) {
  const resolveSubtab = (sub) => {
    if (!sub) return '12.1';
    const clean = String(sub).replace('emr:', '');
    if (['12.1', '12.2', '12.3', '12.4', '12.5'].includes(clean)) return clean;
    return '12.1';
  };

  const [activeSubtab, setActiveSubtab] = useState(() => resolveSubtab(initialSubtab));

  useEffect(() => {
    const nextSub = resolveSubtab(initialSubtab);
    if (nextSub) {
      setActiveSubtab(nextSub);
    }
  }, [initialSubtab]);

  const handleSubtabChange = (subtabId) => {
    setActiveSubtab(subtabId);
    if (typeof onNavigate === 'function') {
      onNavigate(`emr:${subtabId}`);
    }
  };

  const [patients, setPatients] = useState(DEMO_FALLBACK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState('p-01');
  const [doctors, setDoctors] = useState([]);

  // Clinical records state
  const [timelineEvents, setTimelineEvents] = useState(INITIAL_TIMELINE_EVENTS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [diagnoses, setDiagnoses] = useState(INITIAL_DIAGNOSES);
  const [encounters, setEncounters] = useState(INITIAL_ENCOUNTERS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Resolve currently active patient
  const selectedPatient = useMemo(() => {
    return patients.find(p => String(p.id) === String(selectedPatientId)) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Load backend data if available, fallback gracefully to initial mock data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [patientRes, staffRes] = await Promise.allSettled([
        PatientService.getPatients(),
        ClinicalStaffService.getStaff()
      ]);

      if (patientRes.status === 'fulfilled' && patientRes.value?.data && patientRes.value.data.length > 0) {
        setPatients(patientRes.value.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.data && staffRes.value.data.length > 0) {
        setDoctors(staffRes.value.data);
      }

      // Try fetching patient-specific EMR records
      if (selectedPatientId) {
        const [timelineRes, rxRes, diagRes, encRes, docRes] = await Promise.allSettled([
          EmrService.getTimeline(selectedPatientId),
          EmrService.getPrescriptions({ patientId: selectedPatientId }),
          EmrService.getDiagnoses({ patientId: selectedPatientId }),
          EmrService.getEncounters(selectedPatientId),
          EmrService.getDocuments({ patientId: selectedPatientId })
        ]);

        if (timelineRes.status === 'fulfilled' && Array.isArray(timelineRes.value) && timelineRes.value.length > 0) {
          setTimelineEvents(timelineRes.value);
        }
        if (rxRes.status === 'fulfilled' && Array.isArray(rxRes.value) && rxRes.value.length > 0) {
          setPrescriptions(rxRes.value);
        }
        if (diagRes.status === 'fulfilled' && Array.isArray(diagRes.value) && diagRes.value.length > 0) {
          setDiagnoses(diagRes.value);
        }
        if (encRes.status === 'fulfilled' && Array.isArray(encRes.value) && encRes.value.length > 0) {
          setEncounters(encRes.value);
        }
        if (docRes.status === 'fulfilled' && Array.isArray(docRes.value) && docRes.value.length > 0) {
          setDocuments(docRes.value);
        }
      }
    } catch (err) {
      console.warn('[EmrView] Live API fallback:', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Prescription creation
  const handleCreatePrescription = async (prescriptionData) => {
    const rxNumber = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPrescription = {
      ...prescriptionData,
      id: `rx-${Date.now()}`,
      rx_number: rxNumber,
      patient_id: selectedPatient?.id || 'p-01',
      patient_name: selectedPatient?.full_name || 'Patient',
      patient_uhid: selectedPatient?.uhid || 'UHID-2026-0000',
      created_at: new Date().toISOString(),
      status: 'active',
      is_dispensed: false
    };

    setPrescriptions(prev => [fullPrescription, ...prev]);

    // Also inject into timeline
    const timelineEntry = {
      id: `tl-rx-${Date.now()}`,
      patient_id: selectedPatient?.id || 'p-01',
      event_type: 'PRESCRIPTION',
      title: `E-Prescription Generated (${fullPrescription.items?.length || 0} medications)`,
      department: fullPrescription.department || 'Outpatient Consultation',
      clinician: fullPrescription.doctor_name || 'Prescribing Doctor',
      timestamp: new Date().toISOString(),
      badgeVariant: 'warning',
      summary: `Active Rx ${rxNumber} generated with ${fullPrescription.items?.map(i => i.medication_name).join(', ')}.`,
      metadata: {
        prescriptionNumber: rxNumber,
        itemCount: fullPrescription.items?.length
      }
    };
    setTimelineEvents(prev => [timelineEntry, ...prev]);
    showToast(`Prescription ${rxNumber} successfully signed and saved.`);

    try {
      await EmrService.createPrescription(fullPrescription);
    } catch (e) {
      console.info('[EmrView] Live API fallback for prescription:', e.message);
    }
  };

  // Dispense action
  const handleDispensePrescription = async (prescriptionId) => {
    setPrescriptions(prev =>
      prev.map(rx => (rx.id === prescriptionId ? { ...rx, status: 'dispensed', is_dispensed: true } : rx))
    );
    showToast(`Prescription marked as dispensed by pharmacy.`);

    try {
      await EmrService.markDispensed(prescriptionId);
    } catch (e) {
      console.info('[EmrView] Live API fallback for dispense:', e.message);
    }
  };

  // Diagnosis save
  const handleSaveDiagnosis = async (diagnosisData) => {
    const newDiag = {
      ...diagnosisData,
      id: `diag-${Date.now()}`,
      patient_id: selectedPatient?.id || 'p-01',
      patient_name: selectedPatient?.full_name || 'Patient',
      status: 'active'
    };

    setDiagnoses(prev => [newDiag, ...prev]);
    showToast(`Diagnosis ${newDiag.icd10_code} (${newDiag.description}) coded.`);

    try {
      await EmrService.createDiagnosis(newDiag);
    } catch (e) {
      console.info('[EmrView] Live API fallback for diagnosis:', e.message);
    }
  };

  // Toggle Diagnosis Status
  const handleToggleDiagnosisStatus = (diagId) => {
    setDiagnoses(prev =>
      prev.map(d => {
        if (d.id === diagId) {
          const nextStatus = d.status === 'active' ? 'resolved' : 'active';
          showToast(`Diagnosis updated to '${nextStatus}'.`);
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // Document upload / attachment
  const handleSaveDocument = async (docData) => {
    const newDoc = {
      ...docData,
      id: `doc-${Date.now()}`,
      patient_id: selectedPatient?.id || 'p-01',
      patient_name: selectedPatient?.full_name || 'Patient',
      patient_uhid: selectedPatient?.uhid || 'UHID-2026-0000',
      uploaded_at: new Date().toISOString()
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Inject document upload into patient timeline
    const timelineEntry = {
      id: `tl-doc-${Date.now()}`,
      patient_id: selectedPatient?.id || 'p-01',
      event_type: 'DOCUMENT',
      title: `Document Upload: ${newDoc.title}`,
      department: 'Clinical Records',
      clinician: newDoc.uploaded_by || 'Staff',
      timestamp: new Date().toISOString(),
      badgeVariant: 'gray',
      summary: `${newDoc.category}: ${newDoc.file_name} (${newDoc.file_size_kb || 250} KB).`,
      metadata: {
        fileName: newDoc.file_name,
        category: newDoc.category
      }
    };
    setTimelineEvents(prev => [timelineEntry, ...prev]);
    showToast(`Document "${newDoc.title}" attached to patient chart.`);

    try {
      await EmrService.createDocument(newDoc);
    } catch (e) {
      console.info('[EmrView] Live API fallback for document:', e.message);
    }
  };

  const SUBTABS = [
    {
      id: '12.1',
      label: '12.1 Patient Timeline',
      icon: Calendar,
      description: 'Unified longitudinal patient journey across all clinical events'
    },
    {
      id: '12.2',
      label: '12.2 Prescription Studio',
      icon: Pill,
      description: 'Formulary-driven digital prescription composer & print studio'
    },
    {
      id: '12.3',
      label: '12.3 ICD-10 Diagnoses',
      icon: Tag,
      description: 'Standardized WHO ICD-10 diagnostic coding & chronic condition registry'
    },
    {
      id: '12.4',
      label: '12.4 Encounters Browser',
      icon: Stethoscope,
      description: 'Comprehensive historical outpatient visits & clinical observations'
    },
    {
      id: '12.5',
      label: '12.5 Clinical Documents',
      icon: Paperclip,
      description: 'External diagnostics, operative records, scan reports & attachments'
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--color-primary-teal)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Workspace Banner */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        className="emr-banner"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
                Submodules 12.1 – 12.5
              </span>
              <Badge variant="teal" size="sm">Longitudinal Patient Chart</Badge>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Electronic Medical Records (EMR) Workspace
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Longitudinal patient timeline, formulary-driven digital prescription studio, ICD-10 diagnostic coding, and diagnostic clinical documents.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.25)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={16} color="var(--color-success)" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              NABH EMR Audit Trail Active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <Button
            variant={activeSubtab === '12.2' ? 'primary' : 'outline'}
            size="sm"
            icon={Pill}
            onClick={() => handleSubtabChange('12.2')}
          >
            Prescription Studio
          </Button>
          <Button
            variant={activeSubtab === '12.1' ? 'primary' : 'outline'}
            size="sm"
            icon={Calendar}
            onClick={() => handleSubtabChange('12.1')}
          >
            Patient Timeline
          </Button>
          <Button
            variant={activeSubtab === '12.3' ? 'primary' : 'outline'}
            size="sm"
            icon={Tag}
            onClick={() => handleSubtabChange('12.3')}
          >
            ICD-10 Diagnoses
          </Button>
          <Button
            variant={activeSubtab === '12.4' ? 'primary' : 'outline'}
            size="sm"
            icon={Stethoscope}
            onClick={() => handleSubtabChange('12.4')}
          >
            Encounters Browser
          </Button>
          <Button
            variant={activeSubtab === '12.5' ? 'primary' : 'soft'}
            size="sm"
            icon={Paperclip}
            onClick={() => handleSubtabChange('12.5')}
          >
            Clinical Documents
          </Button>
        </div>
      </div>

      {/* Active Patient Selector Banner */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-teal)',
                border: '1.5px solid var(--color-border)'
              }}
            >
              <User size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  {selectedPatient ? selectedPatient.full_name : 'No Patient Selected'}
                </span>
                {selectedPatient && (
                  <Badge variant="teal">
                    {selectedPatient.uhid || 'UHID-2026'}
                  </Badge>
                )}
                {selectedPatient?.blood_group && (
                  <Badge variant="danger">
                    Blood: {selectedPatient.blood_group}
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>Gender/Age: <strong>{selectedPatient?.gender || 'N/A'}, {selectedPatient?.age || 50} Yrs</strong></span>
                <span>•</span>
                <span>Mobile: <strong>{selectedPatient?.mobile || 'N/A'}</strong></span>
                <span>•</span>
                <span style={{ color: '#D97706' }}>Allergies: <strong>{selectedPatient?.allergies || 'None'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Active Patient:
            </span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                minWidth: '220px'
              }}
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.uhid || p.id})
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loading}
              onClick={loadData}
            >
              Sync Records
            </Button>
          </div>
        </div>
      </Card>

      {/* Five Submodule Navigation Tabs (Blood Bank style) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubtabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: 'var(--font-size-sm)',
                borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                cursor: 'pointer',
                marginBottom: '-1.5px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Submodule Screen Rendering */}
      <div>
        {activeSubtab === '12.1' && (
          <PatientTimeline
            selectedPatient={selectedPatient}
            timelineEvents={timelineEvents}
            onRefreshTimeline={loadData}
          />
        )}

        {activeSubtab === '12.2' && (
          <PrescriptionStudio
            selectedPatient={selectedPatient}
            prescriptions={prescriptions}
            doctors={doctors}
            onCreatePrescription={handleCreatePrescription}
            onDispensePrescription={handleDispensePrescription}
          />
        )}

        {activeSubtab === '12.3' && (
          <DiagnosisCoding
            selectedPatient={selectedPatient}
            diagnoses={diagnoses}
            onSaveDiagnosis={handleSaveDiagnosis}
            onToggleStatus={handleToggleDiagnosisStatus}
          />
        )}

        {activeSubtab === '12.4' && (
          <EncountersBrowser
            selectedPatient={selectedPatient}
            encounters={encounters}
            onRefreshEncounters={loadData}
          />
        )}

        {activeSubtab === '12.5' && (
          <DocumentAttachments
            selectedPatient={selectedPatient}
            documents={documents}
            onSaveDocument={handleSaveDocument}
          />
        )}
      </div>
    </div>
  );
}
export default EmrView;
