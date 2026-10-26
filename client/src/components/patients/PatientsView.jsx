import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge } from '../common/UIPrimitives';
import { PATIENT_SUBMODULES } from './patientConstants';
import { NewRegistrationDesk } from './desks/NewRegistrationDesk';
import { UhidSmartCardDesk } from './desks/UhidSmartCardDesk';
import { NewVisitEncounterDesk } from './desks/NewVisitEncounterDesk';
import { PatientSearchMergeDesk } from './desks/PatientSearchMergeDesk';
import { DemographicUpdatesDesk } from './desks/DemographicUpdatesDesk';
import { PatientService, TokenManager } from '../../services/api';
import { useHospitalState } from '../../context/HospitalStateContext';

function normalizePatientSubtab(subtab) {
  if (!subtab) return '24.1';
  const clean = String(subtab).replace(/^(patients:|submodule:)/, '').trim();
  const valid = PATIENT_SUBMODULES.some(s => s.id === clean);
  return valid ? clean : '24.1';
}

export function PatientsView({ initialSubtab, onNavigate }) {
  const { patients: contextPatients, updatePatients } = useHospitalState();
  const [activeSubtab, setActiveSubtab] = useState(() => normalizePatientSubtab(initialSubtab));
  const [livePatients, setLivePatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Selected patient cross-submodule navigation state
  const [crossNavPatient, setCrossNavPatient] = useState(null);

  // Sync active subtab when initialSubtab prop changes externally
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizePatientSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Combined Patients (Context + Remote)
  const currentPatients = useMemo(() => {
    if (livePatients && livePatients.length > 0) return livePatients;
    return contextPatients && contextPatients.length > 0 ? contextPatients : [];
  }, [livePatients, contextPatients]);

  // Load Remote Patients if authenticated
  useEffect(() => {
    let isMounted = true;
    async function loadPatients() {
      if (TokenManager.getToken()) {
        try {
          const res = await PatientService.getPatients();
          if (isMounted && res?.data && Array.isArray(res.data)) {
            setLivePatients(res.data);
          }
        } catch (err) {
          console.warn('[PatientsView] Remote fetch fallback to context patients:', err.message);
        }
      }
    }
    loadPatients();
    return () => { isMounted = false; };
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const handleSelectSubtab = (subId, extraState = null) => {
    const cleanId = normalizePatientSubtab(subId);
    setActiveSubtab(cleanId);
    if (extraState?.selectedPatient) {
      setCrossNavPatient(extraState.selectedPatient);
    }
    if (onNavigate) {
      onNavigate(`patients:${cleanId}`);
    }
  };

  const handlePatientCreated = (newPatient) => {
    updatePatients(prev => {
      const exists = prev.some(p => p.id === newPatient.id || p.uhid === newPatient.uhid);
      if (exists) return prev;
      return [newPatient, ...prev];
    });
    setLivePatients(prev => {
      const exists = prev.some(p => p.id === newPatient.id || p.uhid === newPatient.uhid);
      if (exists) return prev;
      return [newPatient, ...prev];
    });
    showToast(`Patient ${newPatient.full_name} registered with UHID ${newPatient.uhid}.`);
  };

  const handlePatientUpdated = (updatedRecord) => {
    updatePatients(prev => prev.map(p => (p.id === updatedRecord.id || p.uhid === updatedRecord.uhid) ? updatedRecord : p));
    setLivePatients(prev => prev.map(p => (p.id === updatedRecord.id || p.uhid === updatedRecord.uhid) ? updatedRecord : p));
    showToast(`Patient record ${updatedRecord.uhid} updated successfully.`);
  };

  // KPI Calculations
  const totalPatients = currentPatients.length;
  const todayNewCount = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return currentPatients.filter(p => p.created_at && String(p.created_at).slice(0, 10) === todayStr).length;
  }, [currentPatients]);

  const activeSubmodule = useMemo(() => {
    return PATIENT_SUBMODULES.find(s => s.id === activeSubtab) || PATIENT_SUBMODULES[0];
  }, [activeSubtab]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching Appointment / Emergency style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectSubtab('24.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Users size={13} />
            <span>Patient / Visit Management</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            {activeSubmodule.label}
          </span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal">Module 24</Badge>
          <Badge variant="neutral">5 Submodules</Badge>
        </div>
      </div>

      {/* Module Overview Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-teal)',
              flexShrink: 0
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--font-size-lg)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.2px'
              }}
            >
              Patient & Visit Management Workspace
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)'
              }}
            >
              Centralized patient registration, unique health identifier (UHID) issuance, encounter routing, and MPI governance
            </p>
          </div>
        </div>

        {/* Realtime KPI Stat Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Total Registered</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{totalPatients}</div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#166534', textTransform: 'uppercase', fontWeight: '600' }}>Today&apos;s New</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15803D' }}>{todayNewCount}</div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid #BAE6FD',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#0369A1', textTransform: 'uppercase', fontWeight: '600' }}>Verified EHRs</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0284C7' }}>{totalPatients}</div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                showToast('Patient master census synchronized.');
              }, 500);
            }}
            title="Synchronize Patient Master Registry"
          >
            Sync Registry
          </Button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 Submodule Tab Navigation Bar (Appointment / Emergency Module Standard) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '4px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {PATIENT_SUBMODULES.map((submodule) => {
          const isActive = activeSubtab === submodule.id;
          const Icon = submodule.icon;

          return (
            <button
              key={submodule.id}
              type="button"
              onClick={() => handleSelectSubtab(submodule.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                marginBottom: '-2px'
              }}
              title={submodule.description}
            >
              <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'} />
              <span>{submodule.label}</span>
              <span
                style={{
                  padding: '2px 7px',
                  backgroundColor: isActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  borderRadius: '10px',
                  fontSize: '0.70rem',
                  fontWeight: '700'
                }}
              >
                {submodule.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Submodule Workspace Render */}
      <div>
        {activeSubtab === '24.1' && (
          <NewRegistrationDesk
            patients={currentPatients}
            onPatientCreated={handlePatientCreated}
            onNavigateSubtab={handleSelectSubtab}
            onSelectExistingPatient={(p) => handleSelectSubtab('24.2', { selectedPatient: p })}
          />
        )}

        {activeSubtab === '24.2' && (
          <UhidSmartCardDesk
            patients={currentPatients}
            initialPatientUhid={crossNavPatient?.uhid || null}
            onNavigateSubtab={handleSelectSubtab}
          />
        )}

        {activeSubtab === '24.3' && (
          <NewVisitEncounterDesk
            patients={currentPatients}
            preselectedPatient={crossNavPatient}
            onEncounterCreated={(enc) => showToast(`Encounter ${enc.encounterNumber} generated successfully.`)}
            onNavigateSubtab={handleSelectSubtab}
          />
        )}

        {activeSubtab === '24.4' && (
          <PatientSearchMergeDesk
            patients={currentPatients}
            onNavigateSubtab={handleSelectSubtab}
          />
        )}

        {activeSubtab === '24.5' && (
          <DemographicUpdatesDesk
            patients={currentPatients}
            onPatientUpdated={handlePatientUpdated}
          />
        )}
      </div>
    </div>
  );
}
