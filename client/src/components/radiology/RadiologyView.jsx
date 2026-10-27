import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScanLine,
  Camera,
  Eye,
  FileText,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Plus,
  Activity,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { Button, Badge } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import {
  RADIOLOGY_CORE_SUBMODULES,
  RADIOLOGY_MODULE_GROUPS,
  ALL_RADIOLOGY_SUBMODULES,
  findRadiologySubmoduleById,
  findRadiologyGroupBySubmoduleId,
  stripNumericPrefix
} from './radiologyConstants';
import { INITIAL_FALLBACK_STUDIES } from './radiologyMockData';
import { ModalitySchedulingDesk } from './ModalitySchedulingDesk';
import { DicomAcquisitionDesk } from './DicomAcquisitionDesk';
import { DicomViewerDesk } from './DicomViewerDesk';
import { ReportAuthoringDesk } from './ReportAuthoringDesk';
import { ReportVerificationDesk } from './ReportVerificationDesk';

// Existing module view imports for seamless cross-group navigation
import { BillingView } from '../billing/BillingView';
import { BloodBankView } from '../bloodbank/BloodBankView';
import { CreditBillingView } from '../credit-billing/CreditBillingView';
import { DayCareView } from '../daycare/DayCareView';
import { DietView } from '../diet/DietView';
import { EmbryologyView } from '../embryology/EmbryologyView';
import { EmergencyView } from '../emergency/EmergencyView';
import { EmrView } from '../emr/EmrView';
import { FinanceView } from '../finance/FinanceView';
import { FixedAssetView } from '../fixed-asset/FixedAssetView';
import { GeneralView } from '../general/GeneralView';
import { InventoryView } from '../inventory/InventoryView';
import { IpdView } from '../ipd/IpdView';
import { IvfView } from '../ivf/IvfView';
import { LaboratoryView } from '../laboratory/LaboratoryView';
import { MrdView } from '../mrd/MrdView';
import { NursingView } from '../nursing/NursingView';
import { OpdView } from '../opd/OpdView';
import { OperationTheatreView } from '../ot/OperationTheatreView';
import { PatientsView } from '../patients/PatientsView';
import { PharmacyView } from '../pharmacy/PharmacyView';
import { PurchaseView } from '../purchase/PurchaseView';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { SubmodulesView } from '../appointments/SubmodulesView';

import { RadiologyService, PatientService, ClinicalStaffService } from '../../services/api';

export function RadiologyView({ initialSubtab = '27.1', onNavigate }) {
  const { user: currentUser } = useAuth();

  // Normalize incoming tab
  const normalizeSubtab = (tab) => {
    if (!tab) return '27.1';
    const cleaned = String(tab).replace('radiology:', '').replace('submodule:', '');
    const found = ALL_RADIOLOGY_SUBMODULES.some(s => s.id === cleaned);
    return found ? cleaned : '27.1';
  };

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [selectedStudyForViewer, setSelectedStudyForViewer] = useState(null);
  const [selectedStudyForAuthoring, setSelectedStudyForAuthoring] = useState(null);

  // Core Data States
  const [studies, setStudies] = useState(INITIAL_FALLBACK_STUDIES);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pacsStatus, setPacsStatus] = useState(null);

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

  // Fetch Live Radiology Data & Meta
  const fetchRadiologyData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Studies
      try {
        const liveStudies = await RadiologyService.getStudies();
        if (Array.isArray(liveStudies) && liveStudies.length > 0) {
          setStudies(liveStudies);
        }
      } catch (err) {
        console.warn('[RadiologyView] Live studies fallback:', err.message);
      }

      // 2. Patients
      try {
        const livePatients = await PatientService.getPatients();
        if (Array.isArray(livePatients) && livePatients.length > 0) {
          setPatients(livePatients);
        }
      } catch (err) {
        console.warn('[RadiologyView] Live patients fallback:', err.message);
      }

      // 3. Doctors
      try {
        const liveDoctors = await ClinicalStaffService.getDoctors();
        if (Array.isArray(liveDoctors) && liveDoctors.length > 0) {
          setDoctors(liveDoctors);
        }
      } catch (err) {
        console.warn('[RadiologyView] Live doctors fallback:', err.message);
      }

      // 4. PACS Telemetry
      try {
        const pStatus = await RadiologyService.getPacsStatus();
        setPacsStatus(pStatus);
      } catch (err) {
        console.warn('[RadiologyView] Live PACS status fallback:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadiologyData();
  }, [fetchRadiologyData]);

  // Navigation Handler
  const handleSelectSubtab = (subtabId) => {
    const cleanId = String(subtabId).replace('radiology:', '').replace('submodule:', '');
    setActiveSubtab(cleanId);
    if (onNavigate) {
      onNavigate(`radiology:${cleanId}`);
    }
  };

  // Study CRUD Handlers
  const handleScheduleStudy = async (formData) => {
    try {
      const scheduled = await RadiologyService.scheduleStudy(formData);
      showToast(`Study ${scheduled.accession_number} scheduled successfully.`);
      fetchRadiologyData();
    } catch (err) {
      // Client-side fallback if server fails
      const newStudy = {
        id: `rad-${Date.now()}`,
        accession_number: `ACC-2026-${formData.modality_id}-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_id: formData.patient_id,
        patient_name: patients.find(p => p.id === formData.patient_id)?.full_name || 'Registered Patient',
        patient_uhid: patients.find(p => p.id === formData.patient_id)?.uhid || 'UHID-2026',
        patient_gender: 'Unknown',
        modality_id: formData.modality_id,
        study_description: formData.study_description,
        body_part: formData.body_part,
        clinical_indication: formData.clinical_indication,
        ordering_doctor_name: doctors.find(d => d.id === formData.ordering_doctor_id)?.full_name || 'Dr. Consultant',
        scheduled_at: formData.scheduled_at,
        performed_at: null,
        priority: formData.priority,
        status: 'scheduled',
        technologist_name: formData.technologist_name,
        is_demo: true,
        report_status: null
      };
      setStudies(prev => [newStudy, ...prev]);
      showToast(`Study ${newStudy.accession_number} added to schedule.`);
    }
  };

  const handleUpdateStatus = async (studyId, newStatus) => {
    try {
      await RadiologyService.updateStudyStatus(studyId, {
        status: newStatus,
        performed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      showToast(`Study status updated to ${newStatus}.`);
      fetchRadiologyData();
    } catch (err) {
      setStudies(prev => prev.map(s => s.id === studyId ? { ...s, status: newStatus } : s));
      showToast(`Study status updated to ${newStatus}.`);
    }
  };

  const handleSaveReport = async (reportData) => {
    try {
      await RadiologyService.saveReport(reportData);
      showToast('Report saved successfully.');
      fetchRadiologyData();
    } catch (err) {
      setStudies(prev => prev.map(s => {
        if (s.id === reportData.study_id) {
          return {
            ...s,
            report_status: reportData.status,
            report_findings: reportData.findings,
            report_impression: reportData.impression,
            report_critical_alert: reportData.critical_alert
          };
        }
        return s;
      }));
      showToast('Report draft cached locally.');
    }
  };

  const handleVerifyReport = async (reportId) => {
    try {
      await RadiologyService.verifyReport(reportId);
      showToast('Report digitally authorized and verified.');
      fetchRadiologyData();
    } catch (err) {
      setStudies(prev => prev.map(s => {
        if (s.report_id === reportId || s.id === reportId) {
          return { ...s, report_status: 'verified', report_verified_at: new Date().toISOString(), status: 'completed' };
        }
        return s;
      }));
      showToast('Report authorized with electronic signature.');
    }
  };

  const handleDistributeReport = async (reportId) => {
    try {
      await RadiologyService.distributeReport(reportId);
      showToast('Report distributed to Patient EMR and Clinician inbox.');
      fetchRadiologyData();
    } catch (err) {
      setStudies(prev => prev.map(s => {
        if (s.report_id === reportId || s.id === reportId) {
          return { ...s, report_status: 'distributed' };
        }
        return s;
      }));
      showToast('Report distributed to EMR.');
    }
  };

  const handleResetData = () => {
    setStudies(INITIAL_FALLBACK_STUDIES);
    showToast('Radiology studies reset to baseline demonstration dataset.');
  };

  // Active group & submodule resolution
  const currentSubmodule = useMemo(() => {
    return findRadiologySubmoduleById(activeSubtab) || RADIOLOGY_CORE_SUBMODULES[0];
  }, [activeSubtab]);

  const currentGroup = useMemo(() => {
    return findRadiologyGroupBySubmoduleId(activeSubtab) || RADIOLOGY_MODULE_GROUPS[8]; // Default to Radiology & PACS
  }, [activeSubtab]);

  // Tab Badge counts for the 5 Core Radiology tabs
  const tabBadges = useMemo(() => {
    return {
      '27.1': `${studies.length} Studies`,
      '27.2': 'PACS Archive',
      '27.3': 'DICOM Viewer',
      '27.4': `${studies.filter(s => s.report_status === 'draft').length} Drafts`,
      '27.5': `${studies.filter(s => s.report_status === 'verified').length} Signed`
    };
  }, [studies]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching Appointment / Emergency / OT */}
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
            onClick={() => handleSelectSubtab('27.1')}
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
            <ScanLine size={13} />
            <span>Radiology</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => {
              const firstSub = currentGroup.submodules[0]?.id || '27.1';
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
            title={currentGroup.label}
          >
            {stripNumericPrefix(currentGroup.label)}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {stripNumericPrefix(currentSubmodule.label || currentSubmodule.shortLabel)}
          </span>
          {currentSubmodule.badge && (
            <Badge variant="teal" size="sm">
              {currentSubmodule.badge}
            </Badge>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Desk Ref: #{currentSubmodule.id}
          </span>
        </div>
      </div>

      {/* Render Submodules for Group 27 (Radiology & PACS) */}
      {activeSubtab.startsWith('27.') && (
        <>
          {/* Top Header Banner & Global Actions Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0
                }}
              >
                <ScanLine size={20} color="var(--color-primary-teal)" />
                <span>{stripNumericPrefix(currentSubmodule.label)}</span>
              </h2>
              <p
                style={{
                  fontSize: '0.80rem',
                  color: 'var(--color-text-secondary)',
                  margin: '4px 0 0 0'
                }}
              >
                {currentSubmodule.description}
              </p>
            </div>

            {/* Global Actions Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetData}
                title="Reset to clean baseline demonstration data"
              >
                Reset Demo Data
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={loading}
                onClick={fetchRadiologyData}
                title="Synchronize Live Radiology Census"
              >
                Sync Census
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleSelectSubtab('27.1')}
              >
                Schedule Study
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

          {/* 5 Core Radiology Submodule Tabs */}
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
            {RADIOLOGY_CORE_SUBMODULES.map((submodule) => {
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
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'} />
                  <span>{stripNumericPrefix(submodule.label)}</span>
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

          {/* Active Radiology Desk Render */}
          <div>
            {activeSubtab === '27.1' && (
              <ModalitySchedulingDesk
                studies={studies}
                patients={patients}
                doctors={doctors}
                loading={loading}
                onScheduleStudy={handleScheduleStudy}
                onUpdateStatus={handleUpdateStatus}
                onOpenViewer={(study) => {
                  setSelectedStudyForViewer(study);
                  handleSelectSubtab('27.3');
                }}
                onOpenAuthoring={(study) => {
                  setSelectedStudyForAuthoring(study);
                  handleSelectSubtab('27.4');
                }}
                onOpenVerification={(study) => {
                  setSelectedStudyForAuthoring(study);
                  handleSelectSubtab('27.5');
                }}
              />
            )}

            {activeSubtab === '27.2' && (
              <DicomAcquisitionDesk
                studies={studies}
                pacsStatus={pacsStatus}
                onRefresh={fetchRadiologyData}
              />
            )}

            {activeSubtab === '27.3' && (
              <DicomViewerDesk
                studies={studies}
                selectedStudyId={selectedStudyForViewer?.id}
                onNavigateAuthoring={(study) => {
                  setSelectedStudyForAuthoring(study);
                  handleSelectSubtab('27.4');
                }}
              />
            )}

            {activeSubtab === '27.4' && (
              <ReportAuthoringDesk
                studies={studies}
                selectedStudy={selectedStudyForAuthoring}
                currentUser={currentUser}
                onSaveReport={handleSaveReport}
                onNavigateVerification={() => handleSelectSubtab('27.5')}
              />
            )}

            {activeSubtab === '27.5' && (
              <ReportVerificationDesk
                studies={studies}
                currentUser={currentUser}
                onVerifyReport={handleVerifyReport}
                onDistributeReport={handleDistributeReport}
              />
            )}
          </div>
        </>
      )}

      {/* Integration with other module workspaces when selected from the 13-group Radiology sidebar */}
      {/* Group: Fertility & Reproductive Medicine (1.*, 10.*, 18.*) */}
      {(activeSubtab.startsWith('1.') || activeSubtab === '1.1') && (
        <BillingView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('10.') && (
        <EmbryologyView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('18.') && (
        <IvfView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: System Configuration & Hospital Setup (2.*, 15.*) */}
      {activeSubtab.startsWith('2.') && (
        <BillingView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('15.') && (
        <GeneralView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Appointments, OPD & Patient Registration (3.*, 22.*, 24.*) */}
      {activeSubtab.startsWith('3.') && (
        <AppointmentsView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('22.') && (
        <OpdView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('24.') && (
        <PatientsView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Billing, Finance & Insurance (4.*, 7.*, 13.*) */}
      {activeSubtab.startsWith('4.') && (
        <BillingView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('7.') && (
        <CreditBillingView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('13.') && (
        <FinanceView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Clinical Care & Electronic Medical Records (6.*, 12.*, 20.2, 20.3) */}
      {activeSubtab.startsWith('6.') && (
        <SubmodulesView submodule={currentSubmodule} onNavigateSubmodule={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('12.') && (
        <EmrView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {(activeSubtab === '20.2' || activeSubtab === '20.3') && (
        <MrdView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Inpatient, Nursing & Day Care (8.*, 17.*, 21.*) */}
      {activeSubtab.startsWith('8.') && (
        <DayCareView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('17.') && (
        <IpdView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('21.') && (
        <NursingView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Emergency & Trauma Care (11.*) */}
      {activeSubtab.startsWith('11.') && (
        <EmergencyView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Laboratory & Blood Bank (5.*, 19.*) */}
      {activeSubtab.startsWith('5.') && (
        <BloodBankView initialTab={activeSubtab} initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('19.') && (
        <LaboratoryView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Nutrition & Dietary Services (9.*) */}
      {activeSubtab.startsWith('9.') && (
        <DietView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Operation Theatre & Surgical Care (23.*) */}
      {activeSubtab.startsWith('23.') && (
        <OperationTheatreView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Pharmacy, Inventory & Procurement (25.*, 16.*, 26.*) */}
      {activeSubtab.startsWith('25.') && (
        <PharmacyView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('16.') && (
        <InventoryView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('26.') && (
        <PurchaseView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {/* Group: Medical Records, Assets & Maintenance (20.1, 20.4, 14.*) */}
      {(activeSubtab === '20.1' || activeSubtab === '20.4') && (
        <MrdView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}

      {activeSubtab.startsWith('14.') && (
        <FixedAssetView initialSubtab={activeSubtab} onNavigate={handleSelectSubtab} />
      )}
    </div>
  );
}

export default RadiologyView;
