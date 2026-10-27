import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Siren,
  ShieldAlert,
  Bed,
  Activity,
  ArrowRightCircle,
  RefreshCw,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HeartPulse,
  Users
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import {
  EMERGENCY_SUBMODULES,
  TRIAGE_LEVELS,
  EMERGENCY_MODULE_GROUPS,
  ALL_HOSPITAL_EMERGENCY_SUBMODULES,
  findEmergencyGroupBySubmoduleId,
  findEmergencySubmoduleById
} from './emergencyConstants';
import { EmrView } from '../emr/EmrView';
import { FinanceView } from '../finance/FinanceView';
import { FixedAssetView } from '../fixed-asset/FixedAssetView';
import { GeneralView } from '../general/GeneralView';
import { IpdView } from '../ipd/IpdView';
import { IvfView } from '../ivf/IvfView';
import { LaboratoryView } from '../laboratory/LaboratoryView';
import { MrdView } from '../mrd/MrdView';
import { NursingView } from '../nursing/NursingView';
import { OpdView } from '../opd/OpdView';
import { InventoryView } from '../inventory/InventoryView';
import { SubmodulesView } from '../appointments/SubmodulesView';
import {
  INITIAL_TRIAGE_LIST,
  INITIAL_MLC_RECORDS,
  INITIAL_EMERGENCY_BAYS,
  INITIAL_TRAUMA_CHARTS,
  INITIAL_DISPOSITIONS,
  DEMO_EMERGENCY_DOCTORS
} from './emergencyMockData';
import { TriageDesk } from './TriageDesk';
import { MlcRegistryDesk } from './MlcRegistryDesk';
import { EmergencyBaysDesk } from './EmergencyBaysDesk';
import { TraumaChartingDesk } from './TraumaChartingDesk';
import { RapidDispositionDesk } from './RapidDispositionDesk';
import { EmergencyService, PatientService, ClinicalStaffService } from '../../services/api';

export function EmergencyView({ initialSubtab = '11.1', onNavigate }) {
  // Normalize initialSubtab across all 22 hospital emergency workspace modules (11 to 32)
  const normalizeSubtab = (tab) => {
    if (!tab) return '11.1';
    const cleaned = String(tab).replace('emergency:', '').replace('submodule:', '');
    const found = ALL_HOSPITAL_EMERGENCY_SUBMODULES.some(s => s.id === cleaned);
    return found ? cleaned : '11.1';
  };

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [selectedTriagePatient, setSelectedTriagePatient] = useState(null);

  // Core Data States
  const [triageList, setTriageList] = useState(INITIAL_TRIAGE_LIST);
  const [mlcList, setMlcList] = useState(INITIAL_MLC_RECORDS);
  const [bays, setBays] = useState(INITIAL_EMERGENCY_BAYS);
  const [traumaCharts, setTraumaCharts] = useState(INITIAL_TRAUMA_CHARTS);
  const [dispositions, setDispositions] = useState(INITIAL_DISPOSITIONS);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState(DEMO_EMERGENCY_DOCTORS);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Sync with prop when external route changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Fetch Live Emergency Data
  const fetchEmergencyData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Triage List
      try {
        const liveTriage = await EmergencyService.getTriageList();
        if (Array.isArray(liveTriage) && liveTriage.length > 0) {
          setTriageList(liveTriage);
        }
      } catch (err) {
        console.warn('[EmergencyView] Live triage fetch fallback to seed:', err.message);
      }

      // 2. MLC Records
      try {
        const liveMlc = await EmergencyService.getMlcList();
        if (Array.isArray(liveMlc) && liveMlc.length > 0) {
          setMlcList(liveMlc);
        }
      } catch (err) {
        console.warn('[EmergencyView] Live MLC fetch fallback to seed:', err.message);
      }

      // 3. Emergency Bays
      try {
        const liveBays = await EmergencyService.getBays();
        if (Array.isArray(liveBays) && liveBays.length > 0) {
          setBays(liveBays);
        }
      } catch (err) {
        console.warn('[EmergencyView] Live Bays fetch fallback to seed:', err.message);
      }

      // 4. Patients
      try {
        const patRes = await PatientService.getPatients();
        const pList = patRes?.data || patRes || [];
        if (Array.isArray(pList) && pList.length > 0) {
          setPatients(pList);
        }
      } catch (err) {
        console.warn('[EmergencyView] Live Patients fetch fallback:', err.message);
      }

      // 5. Doctors
      try {
        const docRes = await ClinicalStaffService.getStaff();
        const dList = docRes?.data || docRes || [];
        if (Array.isArray(dList) && dList.length > 0) {
          setDoctors(dList);
        }
      } catch (err) {
        console.warn('[EmergencyView] Live Doctors fetch fallback:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencyData();
  }, [fetchEmergencyData]);

  // Handle Tab Navigation
  const handleSelectSubtab = (subtabId) => {
    setActiveSubtab(subtabId);
    if (onNavigate) {
      onNavigate(`emergency:${subtabId}`);
    }
  };

  // 11.1 Create Triage
  const handleCreateTriage = async (data) => {
    try {
      const created = await EmergencyService.createTriage(data);
      const newEntry = created || {
        id: `trg-${Date.now()}`,
        triage_number: `TRG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_id: data.patient_id,
        patient_name: data.custom_patient_name || (patients.find(p => p.id === data.patient_id)?.full_name || 'Emergency Patient'),
        patient_uhid: data.custom_patient_uhid || (patients.find(p => p.id === data.patient_id)?.uhid || 'UHID-NEW'),
        patient_gender: 'Unknown',
        triage_level: Number(data.triage_level),
        chief_complaint: data.chief_complaint,
        arrival_mode: data.arrival_mode,
        gcs_score: data.gcs_score,
        pulse_rate: data.pulse_rate,
        systolic_bp: data.systolic_bp,
        diastolic_bp: data.diastolic_bp,
        respiratory_rate: data.respiratory_rate,
        oxygen_saturation: data.oxygen_saturation,
        temperature_c: data.temperature_c,
        pain_score: data.pain_score,
        triaged_by: data.triaged_by,
        triaged_at: new Date().toISOString()
      };

      setTriageList(prev => [newEntry, ...prev]);
      showToast(`Triage Intake registered successfully: ${newEntry.triage_number} (${newEntry.patient_name}).`);
      return newEntry;
    } catch (err) {
      console.error('[EmergencyView] createTriage error:', err);
      // Fallback optimistic
      const newEntry = {
        id: `trg-${Date.now()}`,
        triage_number: `TRG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_id: data.patient_id,
        patient_name: data.custom_patient_name || (patients.find(p => p.id === data.patient_id)?.full_name || 'Emergency Patient'),
        patient_uhid: data.custom_patient_uhid || (patients.find(p => p.id === data.patient_id)?.uhid || 'UHID-NEW'),
        triage_level: Number(data.triage_level),
        chief_complaint: data.chief_complaint,
        arrival_mode: data.arrival_mode,
        gcs_score: data.gcs_score,
        pulse_rate: data.pulse_rate,
        systolic_bp: data.systolic_bp,
        diastolic_bp: data.diastolic_bp,
        respiratory_rate: data.respiratory_rate,
        oxygen_saturation: data.oxygen_saturation,
        temperature_c: data.temperature_c,
        pain_score: data.pain_score,
        triaged_by: data.triaged_by,
        triaged_at: new Date().toISOString()
      };
      setTriageList(prev => [newEntry, ...prev]);
      showToast(`Triage Intake recorded: ${newEntry.triage_number}`);
      return newEntry;
    }
  };

  // 11.2 Create MLC
  const handleCreateMlc = async (data) => {
    try {
      const created = await EmergencyService.createMlc(data);
      const newEntry = created || {
        id: `mlc-${Date.now()}`,
        ...data,
        patient_name: patients.find(p => p.id === data.patient_id)?.full_name || 'MLC Patient',
        patient_uhid: patients.find(p => p.id === data.patient_id)?.uhid || 'UHID-MLC',
        created_at: new Date().toISOString()
      };
      setMlcList(prev => [newEntry, ...prev]);
      showToast(`MLC Registered: ${newEntry.mlc_number}. Police Intimation logged.`);
      return newEntry;
    } catch (err) {
      console.error('[EmergencyView] createMlc error:', err);
      const newEntry = {
        id: `mlc-${Date.now()}`,
        ...data,
        patient_name: patients.find(p => p.id === data.patient_id)?.full_name || 'MLC Patient',
        patient_uhid: patients.find(p => p.id === data.patient_id)?.uhid || 'UHID-MLC',
        created_at: new Date().toISOString()
      };
      setMlcList(prev => [newEntry, ...prev]);
      showToast(`MLC Registered: ${newEntry.mlc_number}`);
      return newEntry;
    }
  };

  // 11.3 Allocate Bay
  const handleAllocateBay = async (triageId, bayId, allocatedByStaff) => {
    try {
      await EmergencyService.allocateBay(triageId, bayId, allocatedByStaff);
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const targetBay = bays.find(b => String(b.id) === String(bayId));

      // Update bays state
      setBays(prev => prev.map(b => {
        if (String(b.id) === String(bayId)) {
          return {
            ...b,
            status: 'occupied',
            patient_id: targetTriage?.patient_id,
            patient_name: targetTriage?.patient_name,
            patient_uhid: targetTriage?.patient_uhid,
            triage_level: targetTriage?.triage_level,
            triage_number: targetTriage?.triage_number
          };
        }
        return b;
      }));

      // Update triage list state with bay info
      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return {
            ...t,
            bay_id: bayId,
            bay_number: targetBay?.bay_number || 'ALLOCATED',
            bay_zone: targetBay?.zone || 'YELLOW'
          };
        }
        return t;
      }));

      showToast(`Bay ${targetBay?.bay_number} allocated to ${targetTriage?.patient_name}.`);
    } catch (err) {
      console.error('[EmergencyView] allocateBay error:', err);
      // Optimistic update
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const targetBay = bays.find(b => String(b.id) === String(bayId));

      setBays(prev => prev.map(b => {
        if (String(b.id) === String(bayId)) {
          return {
            ...b,
            status: 'occupied',
            patient_id: targetTriage?.patient_id,
            patient_name: targetTriage?.patient_name,
            patient_uhid: targetTriage?.patient_uhid,
            triage_level: targetTriage?.triage_level,
            triage_number: targetTriage?.triage_number
          };
        }
        return b;
      }));

      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return {
            ...t,
            bay_id: bayId,
            bay_number: targetBay?.bay_number || 'ALLOCATED',
            bay_zone: targetBay?.zone || 'YELLOW'
          };
        }
        return t;
      }));

      showToast(`Bay ${targetBay?.bay_number} allocated.`);
    }
  };

  // 11.3 Vacate Bay
  const handleVacateBay = async (triageId) => {
    try {
      await EmergencyService.vacateBay(triageId);
      // Mark bay available
      setBays(prev => prev.map(b => {
        const matches = triageList.find(t => String(t.id) === String(triageId) && t.bay_id === b.id);
        if (matches || b.patient_id === triageId) {
          return {
            ...b,
            status: 'available',
            patient_id: null,
            patient_name: null,
            patient_uhid: null,
            triage_level: null,
            triage_number: null
          };
        }
        return b;
      }));

      // Clear bay from triage
      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return { ...t, bay_id: null, bay_number: null, bay_zone: null };
        }
        return t;
      }));

      showToast(`Bay vacated and marked available.`);
    } catch (err) {
      console.error('[EmergencyView] vacateBay error:', err);
      setBays(prev => prev.map(b => {
        const matches = triageList.find(t => String(t.id) === String(triageId) && t.bay_id === b.id);
        if (matches || b.patient_id === triageId) {
          return {
            ...b,
            status: 'available',
            patient_id: null,
            patient_name: null,
            patient_uhid: null,
            triage_level: null,
            triage_number: null
          };
        }
        return b;
      }));

      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return { ...t, bay_id: null, bay_number: null, bay_zone: null };
        }
        return t;
      }));

      showToast(`Bay vacated.`);
    }
  };

  // 11.4 Create Trauma Chart
  const handleCreateTraumaChart = async (triageId, data) => {
    try {
      const created = await EmergencyService.createTraumaChart(triageId, data);
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const newEntry = created || {
        id: `tc-${Date.now()}`,
        triage_id: triageId,
        patient_name: targetTriage?.patient_name,
        patient_uhid: targetTriage?.patient_uhid,
        ...data,
        recorded_at: new Date().toISOString()
      };
      setTraumaCharts(prev => [newEntry, ...prev]);
      showToast(`Trauma Chart recorded for ${targetTriage?.patient_name || 'Patient'}.`);
      return newEntry;
    } catch (err) {
      console.error('[EmergencyView] createTraumaChart error:', err);
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const newEntry = {
        id: `tc-${Date.now()}`,
        triage_id: triageId,
        patient_name: targetTriage?.patient_name,
        patient_uhid: targetTriage?.patient_uhid,
        ...data,
        recorded_at: new Date().toISOString()
      };
      setTraumaCharts(prev => [newEntry, ...prev]);
      showToast(`Trauma Chart saved.`);
      return newEntry;
    }
  };

  // 11.5 Create Disposition
  const handleCreateDisposition = async (triageId, data) => {
    try {
      const created = await EmergencyService.createDisposition(triageId, data);
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const targetDoc = doctors.find(d => String(d.id) === String(data.clinician_id));

      const newEntry = created || {
        id: `disp-${Date.now()}`,
        triage_id: triageId,
        triage_number: targetTriage?.triage_number,
        patient_name: targetTriage?.patient_name,
        patient_uhid: targetTriage?.patient_uhid,
        triage_level: targetTriage?.triage_level,
        disposition_type: data.disposition_type,
        target_unit: data.target_unit,
        clinician_name: targetDoc?.name || 'Emergency Physician',
        handover_summary: data.handover_summary,
        follow_up_instructions: data.follow_up_instructions,
        disposition_time: new Date().toISOString()
      };

      setDispositions(prev => [newEntry, ...prev]);

      // Update triage item disposition_type
      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return { ...t, disposition_type: data.disposition_type, bay_id: null, bay_number: null };
        }
        return t;
      }));

      // Release bay occupied by this triage
      if (targetTriage?.bay_id) {
        setBays(prev => prev.map(b => {
          if (b.id === targetTriage.bay_id) {
            return { ...b, status: 'available', patient_id: null, patient_name: null };
          }
          return b;
        }));
      }

      showToast(`Disposition confirmed: ${targetTriage?.patient_name} → ${data.disposition_type}. Bay released.`);
      return newEntry;
    } catch (err) {
      console.error('[EmergencyView] createDisposition error:', err);
      const targetTriage = triageList.find(t => String(t.id) === String(triageId));
      const targetDoc = doctors.find(d => String(d.id) === String(data.clinician_id));

      const newEntry = {
        id: `disp-${Date.now()}`,
        triage_id: triageId,
        triage_number: targetTriage?.triage_number,
        patient_name: targetTriage?.patient_name,
        patient_uhid: targetTriage?.patient_uhid,
        triage_level: targetTriage?.triage_level,
        disposition_type: data.disposition_type,
        target_unit: data.target_unit,
        clinician_name: targetDoc?.name || 'Emergency Physician',
        handover_summary: data.handover_summary,
        follow_up_instructions: data.follow_up_instructions,
        disposition_time: new Date().toISOString()
      };

      setDispositions(prev => [newEntry, ...prev]);
      setTriageList(prev => prev.map(t => {
        if (String(t.id) === String(triageId)) {
          return { ...t, disposition_type: data.disposition_type, bay_id: null, bay_number: null };
        }
        return t;
      }));

      showToast(`Disposition recorded.`);
      return newEntry;
    }
  };

  // Reset to Baseline Seed Data (matching FinanceView standard)
  const handleResetData = () => {
    setTriageList(INITIAL_TRIAGE_LIST);
    setMlcList(INITIAL_MLC_RECORDS);
    setBays(INITIAL_EMERGENCY_BAYS);
    setTraumaCharts(INITIAL_TRAUMA_CHARTS);
    setDispositions(INITIAL_DISPOSITIONS);
    showToast('Emergency department demo data successfully reset to baseline.');
  };

  // Active group and submodule resolution across all 22 hospital modules
  const currentSubmodule = useMemo(() => {
    return findEmergencySubmoduleById(activeSubtab) || ALL_HOSPITAL_EMERGENCY_SUBMODULES[0];
  }, [activeSubtab]);

  const currentGroup = useMemo(() => {
    return findEmergencyGroupBySubmoduleId(activeSubtab) || EMERGENCY_MODULE_GROUPS[0];
  }, [activeSubtab]);

  // Tab Badge Counts matching FinanceView pill format
  const tabBadges = useMemo(() => {
    return {
      '11.1': `${triageList.length} Cases`,
      '11.2': `${mlcList.length} MLCs`,
      '11.3': `${bays.filter(b => b.status === 'occupied').length}/${bays.length} Bays`,
      '11.4': `${traumaCharts.length} Charts`,
      '11.5': `${triageList.filter(t => !t.disposition_type).length} Pending`
    };
  }, [triageList, mlcList, bays, traumaCharts]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching FinanceView */}
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
            onClick={() => handleSelectSubtab('11.1')}
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
            <Siren size={13} />
            <span>Emergency Department</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => {
              const firstSub = currentGroup.submodules[0]?.id || '11.1';
              handleSelectSubtab(firstSub);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            title={currentGroup.name}
          >
            {currentGroup.name}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {currentSubmodule.label || currentSubmodule.shortLabel}
          </span>
          {currentSubmodule.badge && (
            <Badge variant="teal" size="sm">
              {currentSubmodule.badge}
            </Badge>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Desk Ref: #{currentSubmodule.code || currentSubmodule.id}
          </span>
        </div>
      </div>

      {/* Group A: Emergency Operations Workspace */}
      {activeSubtab.startsWith('11.') && (
        <>
          {/* Main Module Header matching FinanceView */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '4px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Emergency Department (EDMS)
                </h1>
                <Badge variant="teal">NABH Level 1 Trauma Care</Badge>
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Level 1-4 Triage Stratification, MLC Registry & Intimations, Resuscitation Bay Allocation, Trauma Charting, and Rapid Disposition.
              </p>
            </div>

            {/* Global Action Controls matching FinanceView */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetData}
                title="Reset to clean hospital emergency seed data"
              >
                Reset Demo Data
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={loading}
                onClick={fetchEmergencyData}
                title="Refresh Live ED Data from Database"
              >
                Sync ED Census
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleSelectSubtab('11.1')}
              >
                New Triage Intake
              </Button>
            </div>
          </div>

          {/* Toast Notification Banner matching FinanceView */}
          {toastMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                border: '1px solid var(--color-success-border)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
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

          {/* 5 Submodule Tab Navigation Bar matching FinanceView */}
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
            {EMERGENCY_SUBMODULES.map((submodule) => {
              const isActive = activeSubtab === submodule.id;
              const Icon = submodule.icon;
              const badgeText = tabBadges[submodule.id];

              return (
                <button
                  type="button"
                  key={submodule.id}
                  onClick={() => handleSelectSubtab(submodule.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'} />
                  <span>{submodule.shortLabel}</span>
                  {badgeText && (
                    <span
                      style={{
                        backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : 'var(--color-border-subtle)',
                        color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontSize: '0.70rem',
                        fontWeight: '700'
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Submodule Desk Content Rendering */}
          <div>
            {activeSubtab === '11.1' && (
              <TriageDesk
                triageList={triageList}
                bays={bays}
                patients={patients}
                doctors={doctors}
                loading={loading}
                onCreateTriage={handleCreateTriage}
                onNavigateSubtab={handleSelectSubtab}
                onSelectTriagePatient={setSelectedTriagePatient}
              />
            )}

            {activeSubtab === '11.2' && (
              <MlcRegistryDesk
                mlcList={mlcList}
                triageList={triageList}
                patients={patients}
                doctors={doctors}
                loading={loading}
                onCreateMlc={handleCreateMlc}
              />
            )}

            {activeSubtab === '11.3' && (
              <EmergencyBaysDesk
                bays={bays}
                triageList={triageList}
                loading={loading}
                onAllocateBay={handleAllocateBay}
                onVacateBay={handleVacateBay}
              />
            )}

            {activeSubtab === '11.4' && (
              <TraumaChartingDesk
                traumaCharts={traumaCharts}
                triageList={triageList}
                doctors={doctors}
                activeTriagePatient={selectedTriagePatient}
                loading={loading}
                onCreateTraumaChart={handleCreateTraumaChart}
              />
            )}

            {activeSubtab === '11.5' && (
              <RapidDispositionDesk
                dispositions={dispositions}
                triageList={triageList}
                doctors={doctors}
                activeTriagePatient={selectedTriagePatient}
                loading={loading}
                onCreateDisposition={handleCreateDisposition}
              />
            )}
          </div>
        </>
      )}

      {/* Module 12: Patient Clinical Records */}
      {activeSubtab.startsWith('12.') && (
        <EmrView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('emr:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 13: Finance & Accounting */}
      {activeSubtab.startsWith('13.') && (
        <FinanceView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('finance:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 14: Asset Management */}
      {activeSubtab.startsWith('14.') && (
        <FixedAssetView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('fixed-asset:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 15: Hospital & Master Configuration */}
      {activeSubtab.startsWith('15.') && (
        <GeneralView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('general:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 17: Inpatient Department (IPD) */}
      {activeSubtab.startsWith('17.') && (
        <IpdView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('ipd:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 18: IVF & Fertility */}
      {activeSubtab.startsWith('18.') && (
        <IvfView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('ivf:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 19: Laboratory Services */}
      {activeSubtab.startsWith('19.') && (
        <LaboratoryView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('laboratory:', '').replace('lab:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 20: Medical Records & Clinical Coding */}
      {activeSubtab.startsWith('20.') && (
        <MrdView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('mrd:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 21: Nursing Services */}
      {activeSubtab.startsWith('21.') && (
        <NursingView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('nursing:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Module 22: Outpatient Department (OPD) */}
      {activeSubtab.startsWith('22.') && (
        <OpdView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('opd:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Modules 16, 23 through 32: Inventory, Pharmacy, Purchasing, OT, Registration, POS, Audit, Profile, Work Orders, Analytics */}
      {(activeSubtab.startsWith('16.') || (parseInt(activeSubtab, 10) >= 23 && parseInt(activeSubtab, 10) <= 32)) && (
        <InventoryView
          initialSubtab={activeSubtab}
          onNavigate={(sub) => {
            const cleanSub = String(sub).replace('inventory:', '').replace('emergency:', '');
            handleSelectSubtab(cleanSub);
          }}
        />
      )}

      {/* Clean fallback for any other submodules */}
      {!activeSubtab.startsWith('11.') &&
       !activeSubtab.startsWith('12.') &&
       !activeSubtab.startsWith('13.') &&
       !activeSubtab.startsWith('14.') &&
       !activeSubtab.startsWith('15.') &&
       !activeSubtab.startsWith('17.') &&
       !activeSubtab.startsWith('18.') &&
       !activeSubtab.startsWith('19.') &&
       !activeSubtab.startsWith('20.') &&
       !activeSubtab.startsWith('21.') &&
       !activeSubtab.startsWith('22.') &&
       !(activeSubtab.startsWith('16.') || (parseInt(activeSubtab, 10) >= 23 && parseInt(activeSubtab, 10) <= 32)) && (
        <SubmodulesView
          submodule={{
            id: currentSubmodule.id,
            title: currentSubmodule.label,
            groupName: currentGroup.name,
            subtitle: currentSubmodule.label,
            icon: currentSubmodule.icon
          }}
          onBack={() => handleSelectSubtab('11.1')}
          onNavigateSubmodule={handleSelectSubtab}
        />
      )}
    </div>
  );
}
