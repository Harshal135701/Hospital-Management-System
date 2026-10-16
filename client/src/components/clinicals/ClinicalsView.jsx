import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Activity,
  FileText,
  ClipboardList,
  Search,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { INITIAL_QUEUE_PATIENTS } from './clinicalDemoData';
import { PatientBanner } from './PatientBanner';
import { ConsultationDesk } from './ConsultationDesk';
import { VitalsExam } from './VitalsExam';
import { ComplaintsHistory } from './ComplaintsHistory';
import { OrdersCPOE } from './OrdersCPOE';
import { ProgressNotes } from './ProgressNotes';

export const ClinicalsView = ({ initialSubtab, onNavigate: _onNavigate }) => {
  // Queue state
  const [patients, setPatients] = useState(INITIAL_QUEUE_PATIENTS);
  const [activePatientId, setActivePatientId] = useState('enc-2026-001'); // Eleanor Vance selected by default
  const [internalSubtab, setInternalSubtab] = useState(null);
  const currentSubtab = internalSubtab !== null ? internalSubtab : (initialSubtab || 'consultation');
  const setCurrentSubtab = (tab) => setInternalSubtab(tab);

  // OPD Queue Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'waiting' | 'in_consultation' | 'completed'
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Notification toast
  const [workspaceToast, setWorkspaceToast] = useState('');

  // Active patient object
  const activePatient = useMemo(() => {
    return patients.find(p => p.id === activePatientId) || null;
  }, [patients, activePatientId]);

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return patients.filter(p => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      // Department filter
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = p.patient_name.toLowerCase().includes(q);
        const matchesUhid = p.uhid.toLowerCase().includes(q);
        const matchesApt = p.appointment_number.toLowerCase().includes(q);
        const matchesDoc = p.doctor_name.toLowerCase().includes(q);
        if (!matchesName && !matchesUhid && !matchesApt && !matchesDoc) return false;
      }
      return true;
    });
  }, [patients, statusFilter, departmentFilter, searchTerm]);

  // Counts for queue tabs
  const queueCounts = useMemo(() => {
    return {
      all: patients.length,
      waiting: patients.filter(p => p.status === 'waiting').length,
      in_consultation: patients.filter(p => p.status === 'in_consultation').length,
      completed: patients.filter(p => p.status === 'completed').length
    };
  }, [patients]);

  const departments = ['all', 'Cardiology', 'Internal Medicine', 'General Surgery', 'Orthopedics'];

  // Handle open consultation
  const handleOpenConsultation = (patientId, targetSubtab = 'consultation') => {
    setActivePatientId(patientId);
    setCurrentSubtab(targetSubtab);
    // If patient was waiting, automatically transition to in_consultation
    setPatients(prev => prev.map(p => {
      if (p.id === patientId && p.status === 'waiting') {
        return { ...p, status: 'in_consultation' };
      }
      return p;
    }));
  };

  // State update handlers for active patient
  const handleUpdateActivePatient = (updater) => {
    setPatients(prev => prev.map(p => {
      if (p.id === activePatientId) {
        return typeof updater === 'function' ? updater(p) : { ...p, ...updater };
      }
      return p;
    }));
  };

  const handleSaveDraftConsultation = (deskData) => {
    handleUpdateActivePatient(deskData);
  };

  const handleCompleteConsultation = (deskData) => {
    handleUpdateActivePatient(p => ({
      ...p,
      ...deskData,
      status: 'completed'
    }));
    setWorkspaceToast(`Consultation for ${activePatient?.patient_name} (${activePatient?.uhid}) completed.`);
    setTimeout(() => setWorkspaceToast(''), 4500);
  };

  const handleSaveVitals = (vitalsData) => {
    handleUpdateActivePatient(p => ({
      ...p,
      vitals: { ...p.vitals, ...vitalsData }
    }));
  };

  const handleSaveHistory = (historyData) => {
    handleUpdateActivePatient(p => ({
      ...p,
      history: { ...p.history, ...historyData }
    }));
  };

  const handleUpdateOrders = (ordersList) => {
    handleUpdateActivePatient(p => ({
      ...p,
      orders: ordersList
    }));
  };

  const handleSaveNotes = (notesList) => {
    handleUpdateActivePatient(p => ({
      ...p,
      notes: notesList
    }));
  };

  const subtabs = [
    { id: 'consultation', label: 'Consultation Desk', icon: Stethoscope },
    { id: 'vitals', label: 'Vitals & Examination', icon: Activity },
    { id: 'history', label: 'Complaints & History', icon: ClipboardList },
    { id: 'orders', label: 'Orders (CPOE)', icon: FileText, badge: activePatient?.orders?.length || null },
    { id: 'notes', label: 'Progress Notes', icon: CheckCircle2, badge: activePatient?.notes?.length || null }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Workspace Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Stethoscope size={20} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              Clinical Workspace
            </h1>
          </div>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            Patient consultations, clinical observations, diagnostic orders and progress notes.
          </p>
        </div>

        {/* Global Quick Action / View Queue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant={activePatient ? 'outline' : 'primary'}
            size="sm"
            icon={Users}
            onClick={() => setActivePatientId(null)}
          >
            OPD Queue ({queueCounts.all})
          </Button>
        </div>
      </div>

      {/* Global Toast */}
      {workspaceToast && (
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
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{workspaceToast}</span>
        </div>
      )}

      {/* Main Workspace Area: Active Patient View OR Queue View */}
      {activePatient ? (
        <div key={activePatient.id}>
          {/* Active Patient Identity Banner */}
          <PatientBanner
            patient={activePatient}
            onBackToQueue={() => setActivePatientId(null)}
            onStatusChange={(newStatus) => handleUpdateActivePatient({ status: newStatus })}
          />

          {/* Submodule Tab Navigation Bar */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '2px solid var(--color-border)',
              marginBottom: '20px',
              overflowX: 'auto',
              paddingBottom: '2px'
            }}
          >
            {subtabs.map((tab) => {
              const isActive = currentSubtab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setCurrentSubtab(tab.id)}
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
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    marginBottom: '-2px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && tab.badge !== undefined && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: '700',
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

          {/* Active Submodule Screen */}
          <div>
            {currentSubtab === 'consultation' && (
              <ConsultationDesk
                patient={activePatient}
                onSaveDraft={handleSaveDraftConsultation}
                onCompleteConsultation={handleCompleteConsultation}
                onNavigateSubtab={(tab) => setCurrentSubtab(tab)}
              />
            )}

            {currentSubtab === 'vitals' && (
              <VitalsExam
                patient={activePatient}
                onSaveVitals={handleSaveVitals}
              />
            )}

            {currentSubtab === 'history' && (
              <ComplaintsHistory
                patient={activePatient}
                onSaveHistory={handleSaveHistory}
              />
            )}

            {currentSubtab === 'orders' && (
              <OrdersCPOE
                patient={activePatient}
                onUpdateOrders={handleUpdateOrders}
              />
            )}

            {currentSubtab === 'notes' && (
              <ProgressNotes
                patient={activePatient}
                onSaveNote={handleSaveNotes}
              />
            )}
          </div>
        </div>
      ) : (
        /* OPD Patient Queue Landing Screen */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search & Filter Toolbar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '280px', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search patient by UHID, Name, Appointment #, or Doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                Department:
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer'
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OPD Queue Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
            {[
              { id: 'all', label: 'All Patients', count: queueCounts.all },
              { id: 'waiting', label: 'Waiting', count: queueCounts.waiting },
              { id: 'in_consultation', label: 'In Consultation', count: queueCounts.in_consultation },
              { id: 'completed', label: 'Completed', count: queueCounts.completed }
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      backgroundColor: isSelected ? 'var(--color-primary-teal)' : '#EEF2F2',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Queue Patient Cards Grid / List */}
          <Card
            title={`OPD Encounter Queue (${filteredQueue.length})`}
            subtitle="Patients registered for clinical consultation today. Select a patient to open the Consultation Desk."
          >
            {filteredQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  No Patients Found in Queue
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  No encounters match your current search or filter criteria. Try clearing filters or searching for another UHID.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredQueue.map((pat) => {
                  const statusVariant = {
                    waiting: 'warning',
                    in_consultation: 'teal',
                    completed: 'success'
                  }[pat.status] || 'gray';

                  const statusText = {
                    waiting: 'Waiting',
                    in_consultation: 'In Consultation',
                    completed: 'Completed'
                  }[pat.status] || pat.status;

                  return (
                    <div
                      key={pat.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-bg-pale-aqua)',
                            color: 'var(--color-primary-teal)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            flexShrink: 0
                          }}
                        >
                          {pat.patient_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--color-text-primary)' }}>
                              {pat.patient_name}
                            </span>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                color: 'var(--color-primary-teal)',
                                backgroundColor: 'var(--color-bg-pale-aqua)',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              {pat.uhid}
                            </span>
                            <Badge variant={statusVariant} size="sm">
                              {statusText}
                            </Badge>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              fontSize: '0.78rem',
                              color: 'var(--color-text-secondary)',
                              marginTop: '4px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <span>{pat.age}y / {pat.gender}</span>
                            <span>•</span>
                            <span>{pat.department}</span>
                            <span>•</span>
                            <span>{pat.doctor_name}</span>
                            <span>•</span>
                            <span>Appt: <strong>{pat.appointment_time}</strong> ({pat.appointment_number})</span>
                          </div>

                          {pat.chief_complaint && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              Complaint: {pat.chief_complaint}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button
                          variant={pat.status === 'completed' ? 'outline' : 'primary'}
                          size="sm"
                          icon={Stethoscope}
                          onClick={() => handleOpenConsultation(pat.id)}
                        >
                          {pat.status === 'completed' ? 'View Encounter' : 'Open Consultation'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
