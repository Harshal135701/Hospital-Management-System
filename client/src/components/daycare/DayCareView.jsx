import React, { useState, useEffect, useCallback } from 'react';
import {
  Bed,
  Calendar,
  Layers,
  Activity,
  FileText,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { AdmissionBooking } from './AdmissionBooking';
import { ChairAllocation } from './ChairAllocation';
import { ProcedureMonitoring } from './ProcedureMonitoring';
import { DischargeSummary } from './DischargeSummary';
import { INITIAL_ADMISSIONS, INITIAL_CHAIRS } from './daycareDemoData';
import { DayCareService, PatientService, ClinicalStaffService } from '../../services/api';

export function DayCareView({ initialSubtab = '8.1', onNavigate }) {
  const resolveSubtab = (sub) => {
    if (!sub) return '8.1';
    const clean = String(sub).replace('daycare:', '');
    if (['8.1', '8.2', '8.3', '8.4'].includes(clean)) return clean;
    return '8.1';
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
      onNavigate(`daycare:${subtabId}`);
    }
  };

  const [admissions, setAdmissions] = useState(INITIAL_ADMISSIONS);
  const [chairs, setChairs] = useState(INITIAL_CHAIRS);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Load backend data if available, fallback gracefully to initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [admRes, chairsRes, patientRes, staffRes] = await Promise.allSettled([
        DayCareService.getAdmissions(),
        DayCareService.getChairs(),
        PatientService.getPatients(),
        ClinicalStaffService.getStaff()
      ]);

      if (admRes.status === 'fulfilled' && Array.isArray(admRes.value) && admRes.value.length > 0) {
        setAdmissions(admRes.value);
      }
      if (chairsRes.status === 'fulfilled' && Array.isArray(chairsRes.value) && chairsRes.value.length > 0) {
        setChairs(chairsRes.value);
      }
      if (patientRes.status === 'fulfilled' && patientRes.value?.data) {
        setPatients(patientRes.value.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        setDoctors(staffRes.value.data);
      }
    } catch (err) {
      console.warn('[DayCareView] Error fetching live data, using demo state:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Day Care workflow
  const handleCreateAdmission = async (newAdmissionData) => {
    const admissionNumber = `DCA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAdmission = {
      ...newAdmissionData,
      id: `adm-${Date.now()}`,
      admission_number: admissionNumber,
      admitted_at: new Date().toISOString(),
      monitoring_records: [],
      discharge_summary: null
    };

    setAdmissions(prev => [fullAdmission, ...prev]);
    showToast(`Day Care episode ${admissionNumber} created for ${fullAdmission.patient_name}.`);

    try {
      await DayCareService.createAdmission(newAdmissionData);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleUpdateStatus = async (admissionId, newStatus) => {
    setAdmissions(prev =>
      prev.map(a => (a.id === admissionId ? { ...a, status: newStatus } : a))
    );
    showToast(`Episode status updated to '${newStatus}'.`);

    try {
      await DayCareService.updateStatus(admissionId, newStatus);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleAllocateChair = async (admissionId, chairId) => {
    const chairObj = chairs.find(c => c.id === chairId);
    setChairs(prev =>
      prev.map(c => (c.id === chairId ? { ...c, status: 'occupied', admissionId } : c))
    );
    setAdmissions(prev =>
      prev.map(a =>
        a.id === admissionId
          ? { ...a, chair_id: chairId, chair_name: chairObj?.name, status: 'admitted' }
          : a
      )
    );
    showToast(`Allocated ${chairObj?.name || 'station'} to patient.`);

    try {
      await DayCareService.allocateChair(admissionId, chairId);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleReleaseChair = async (targetId) => {
    // targetId can be admissionId or chairId
    setChairs(prev =>
      prev.map(c =>
        c.id === targetId || c.admissionId === targetId
          ? { ...c, status: 'cleaning', admissionId: null }
          : c
      )
    );
    setAdmissions(prev =>
      prev.map(a => (a.id === targetId ? { ...a, chair_id: null, chair_name: null } : a))
    );
    showToast('Station released and queued for sanitization.');

    try {
      await DayCareService.releaseChair(targetId);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleUpdateChairStatus = async (chairId, status) => {
    setChairs(prev =>
      prev.map(c => (c.id === chairId ? { ...c, status, admissionId: status === 'available' ? null : c.admissionId } : c))
    );
    showToast(`Station marked as ${status}.`);
  };

  const handleAddMonitoringLog = async (admissionId, logData) => {
    setAdmissions(prev =>
      prev.map(a =>
        a.id === admissionId
          ? {
              ...a,
              monitoring_records: [...(a.monitoring_records || []), logData]
            }
          : a
      )
    );
    showToast('Vitals and observation record saved.');

    try {
      await DayCareService.addMonitoring(admissionId, logData);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleCreateDischargeSummary = async (admissionId, summaryData) => {
    setAdmissions(prev =>
      prev.map(a =>
        a.id === admissionId
          ? { ...a, discharge_summary: summaryData }
          : a
      )
    );
    showToast('Day Care discharge summary prepared.');

    try {
      await DayCareService.createDischarge(admissionId, summaryData);
    } catch (e) {
      console.info('[DayCareView] Live API fallback:', e.message);
    }
  };

  const handleApproveDischarge = async (admissionId, approverName) => {
    setAdmissions(prev =>
      prev.map(a => {
        if (a.id === admissionId && a.discharge_summary) {
          return {
            ...a,
            status: 'discharged',
            discharged_at: new Date().toISOString(),
            discharge_summary: {
              ...a.discharge_summary,
              consultant_approved: true,
              approved_by: approverName,
              approved_at: new Date().toISOString()
            }
          };
        }
        return a;
      })
    );
    showToast(`Medical discharge approved by ${approverName}.`);
  };

  const subtabs = [
    { id: '8.1', label: 'Admissions & Booking', icon: Calendar, badge: admissions.length },
    { id: '8.2', label: 'Chair & Station Allocation', icon: Layers, badge: chairs.filter(c => c.status === 'occupied').length },
    { id: '8.3', label: 'Procedure Monitoring', icon: Activity },
    { id: '8.4', label: 'Discharge Summary', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
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
        className="daycare-banner"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="teal" size="sm">Ambulatory & Short-Stay Care</Badge>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Day Care & Ambulatory Procedure Workspace
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Integrated same-day admissions, chemotherapy & dialysis chair allocation, vital signs procedure monitoring, and Aldrete discharge clearance.
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
              Same-Day Discharge Gated
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <Button
            variant={activeSubtab === '8.1' ? 'primary' : 'outline'}
            size="sm"
            icon={Plus}
            onClick={() => handleSubtabChange('8.1')}
          >
            New Admission
          </Button>
          <Button
            variant={activeSubtab === '8.2' ? 'primary' : 'outline'}
            size="sm"
            icon={Bed}
            onClick={() => handleSubtabChange('8.2')}
          >
            Allocate Chair
          </Button>
          <Button
            variant={activeSubtab === '8.3' ? 'primary' : 'outline'}
            size="sm"
            icon={Activity}
            onClick={() => handleSubtabChange('8.3')}
          >
            Record Vitals
          </Button>
          <Button
            variant={activeSubtab === '8.4' ? 'primary' : 'soft'}
            size="sm"
            icon={FileText}
            onClick={() => handleSubtabChange('8.4')}
          >
            Discharge Summary
          </Button>
        </div>
      </div>

      {/* Global Toast Notice */}
      {toastMessage && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-pale-aqua)',
            border: '1px solid rgba(8, 127, 140, 0.3)',
            color: 'var(--color-primary-teal)',
            fontSize: '0.84rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-in'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Four Submodule Navigation Tabs (Blood Bank style) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {subtabs.map(tab => {
          const isActive = activeSubtab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
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
              <IconComponent size={16} />
              <span>{tab.label}</span>
              {tab.badge != null && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Submodule Component Render */}
      <div>
        {activeSubtab === '8.1' && (
          <AdmissionBooking
            admissions={admissions}
            patients={patients}
            doctors={doctors}
            onSelectAdmission={(adm) => {
              setSelectedAdmission(adm);
              setActiveSubtab('8.3');
            }}
            onCreateAdmission={handleCreateAdmission}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeSubtab === '8.2' && (
          <ChairAllocation
            chairs={chairs}
            admissions={admissions}
            onAllocateChair={handleAllocateChair}
            onReleaseChair={handleReleaseChair}
            onUpdateChairStatus={handleUpdateChairStatus}
          />
        )}

        {activeSubtab === '8.3' && (
          <ProcedureMonitoring
            admissions={admissions}
            selectedAdmission={selectedAdmission}
            onSelectAdmission={setSelectedAdmission}
            onAddMonitoringLog={handleAddMonitoringLog}
          />
        )}

        {activeSubtab === '8.4' && (
          <DischargeSummary
            admissions={admissions}
            selectedAdmission={selectedAdmission}
            onSelectAdmission={setSelectedAdmission}
            onCreateDischargeSummary={handleCreateDischargeSummary}
            onApproveDischarge={handleApproveDischarge}
          />
        )}
      </div>
    </div>
  );
}
