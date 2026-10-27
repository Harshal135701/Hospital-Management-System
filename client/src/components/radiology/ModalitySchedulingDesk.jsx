import React, { useState, useMemo } from 'react';
import {
  ScanLine,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Eye,
  User,
  Activity,
  ArrowRight,
  X,
  Stethoscope,
  Building2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  SUPPORTED_MODALITIES,
  STUDY_STATUS_CONFIG,
  REPORT_STATUS_CONFIG,
  PRIORITY_CONFIG
} from './radiologyConstants';

export function ModalitySchedulingDesk({
  studies = [],
  patients = [],
  doctors = [],
  loading = false,
  onScheduleStudy,
  onUpdateStatus,
  onOpenViewer,
  onOpenAuthoring,
  onOpenVerification
}) {
  const [selectedModality, setSelectedModality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form State for Scheduling Modal
  const [formData, setFormData] = useState({
    patient_id: '',
    modality_id: 'XR',
    study_description: 'Chest X-Ray (PA View Digital)',
    body_part: 'Thorax / Chest',
    clinical_indication: '',
    ordering_doctor_id: '',
    priority: 'routine',
    scheduled_at: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    technologist_name: ''
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = studies.length;
    const pendingScans = studies.filter(s => s.status === 'scheduled' || s.status === 'arrived').length;
    const inProgress = studies.filter(s => s.status === 'in_progress').length;
    const awaitingReport = studies.filter(s => s.status === 'completed' && (!s.report_status || s.report_status === 'draft')).length;
    const verified = studies.filter(s => s.report_status === 'verified' || s.report_status === 'distributed').length;
    const urgentCount = studies.filter(s => (s.priority === 'urgent' || s.priority === 'stat') && s.status !== 'completed').length;

    return { total, pendingScans, inProgress, awaitingReport, verified, urgentCount };
  }, [studies]);

  // Filtered Studies List
  const filteredStudies = useMemo(() => {
    return studies.filter(s => {
      if (selectedModality !== 'all' && s.modality_id !== selectedModality) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && s.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAccession = s.accession_number?.toLowerCase().includes(q);
        const matchesUhid = s.patient_uhid?.toLowerCase().includes(q);
        const matchesName = s.patient_name?.toLowerCase().includes(q);
        const matchesDesc = s.study_description?.toLowerCase().includes(q);
        const matchesIndication = s.clinical_indication?.toLowerCase().includes(q);
        if (!matchesAccession && !matchesUhid && !matchesName && !matchesDesc && !matchesIndication) return false;
      }
      return true;
    });
  }, [studies, selectedModality, selectedStatus, selectedPriority, searchQuery]);

  const handleOpenScheduleModal = () => {
    setFormData({
      patient_id: patients[0]?.id || '',
      modality_id: 'XR',
      study_description: 'Chest X-Ray (PA View Digital)',
      body_part: 'Thorax / Chest',
      clinical_indication: '',
      ordering_doctor_id: doctors[0]?.id || '',
      priority: 'routine',
      scheduled_at: new Date(Date.now() + 1800000).toISOString().slice(0, 16),
      technologist_name: 'Tech Rajesh Sharma'
    });
    setIsScheduleModalOpen(true);
  };

  const handleSubmitSchedule = (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      alert('Please select a valid patient.');
      return;
    }
    if (onScheduleStudy) {
      onScheduleStudy({
        ...formData,
        scheduled_at: new Date(formData.scheduled_at).toISOString()
      });
    }
    setIsScheduleModalOpen(false);
  };

  const handleModalityChange = (modId) => {
    let defaultDesc = 'Diagnostic Study';
    let defaultBody = 'General';
    if (modId === 'XR') {
      defaultDesc = 'Chest X-Ray (PA View Digital)';
      defaultBody = 'Thorax / Chest';
    } else if (modId === 'CT') {
      defaultDesc = 'HRCT Thorax (Chest High Resolution)';
      defaultBody = 'Thorax / Pulmonary';
    } else if (modId === 'MRI') {
      defaultDesc = 'MRI Brain with Contrast (3.0T)';
      defaultBody = 'Neuro / Brain';
    } else if (modId === 'USG') {
      defaultDesc = 'USG Whole Abdomen & Pelvis';
      defaultBody = 'Abdomen & Pelvis';
    } else if (modId === 'MAMMO') {
      defaultDesc = 'Bilateral Digital Screening Mammography';
      defaultBody = 'Breast Bilateral';
    }
    setFormData(prev => ({
      ...prev,
      modality_id: modId,
      study_description: defaultDesc,
      body_part: defaultBody
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}
      >
        <Card style={{ padding: '12px 16px', borderLeft: '4px solid var(--color-primary-teal)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Total Studies Today
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Scheduled & walk-ins
          </div>
        </Card>

        <Card style={{ padding: '12px 16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Pending Scans
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#d97706', marginTop: '4px' }}>
            {metrics.pendingScans}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Awaiting gantry/room
          </div>
        </Card>

        <Card style={{ padding: '12px 16px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            In Progress
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#7c3aed', marginTop: '4px' }}>
            {metrics.inProgress}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Currently scanning
          </div>
        </Card>

        <Card style={{ padding: '12px 16px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Awaiting Verification
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0284c7', marginTop: '4px' }}>
            {metrics.awaitingReport}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Pending radiologist sign-off
          </div>
        </Card>

        <Card style={{ padding: '12px 16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Verified & Distributed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#059669', marginTop: '4px' }}>
            {metrics.verified}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Synced to patient EMR
          </div>
        </Card>

        <Card style={{ padding: '12px 16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            Urgent / STAT Scans
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#dc2626', marginTop: '4px' }}>
            {metrics.urgentCount}
          </div>
          <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            High-acuity priority
          </div>
        </Card>
      </div>

      {/* Main Workspace Card */}
      <Card style={{ padding: '16px' }}>
        {/* Modality Filter Pills & Action Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border-subtle)'
          }}
        >
          {/* Modality Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginRight: '4px' }}>
              Modality:
            </span>
            <button
              type="button"
              onClick={() => setSelectedModality('all')}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: selectedModality === 'all' ? 'var(--color-primary-teal)' : 'var(--color-border)',
                backgroundColor: selectedModality === 'all' ? 'var(--color-primary-teal)' : '#FFFFFF',
                color: selectedModality === 'all' ? '#FFFFFF' : 'var(--color-text-primary)',
                fontSize: '0.78rem',
                fontWeight: selectedModality === 'all' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Modalities
            </button>
            {SUPPORTED_MODALITIES.map(mod => {
              const isSelected = selectedModality === mod.id;
              return (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => setSelectedModality(mod.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isSelected ? mod.color : 'var(--color-border)',
                    backgroundColor: isSelected ? mod.color : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>

          {/* Schedule Study Action Button */}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenScheduleModal}
          >
            Schedule Modality Study
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '12px',
            marginBottom: '14px'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '450px' }}>
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
              placeholder="Search by UHID, Patient Name, Accession #, Study..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                backgroundColor: 'var(--color-bg-light)'
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.78rem'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="arrived">Arrived</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.78rem'
                }}
              >
                <option value="all">All Priorities</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT / Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Studies Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.80rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Accession / UHID</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Patient Details</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Modality & Study</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Ordering Clinician</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Schedule / Time</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Priority</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Report Status</th>
                <th style={{ padding: '9px 12px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudies.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <ScanLine size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: '600', fontSize: '0.90rem' }}>No radiology studies match current filters</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                      Schedule a study or adjust the modality, status, or search query.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudies.map((study) => {
                  const statusCfg = STUDY_STATUS_CONFIG[study.status] || { label: study.status, variant: 'secondary' };
                  const priorityCfg = PRIORITY_CONFIG[study.priority] || { label: study.priority, variant: 'secondary' };
                  const reportStatusCfg = study.report_status ? REPORT_STATUS_CONFIG[study.report_status] : null;

                  return (
                    <tr
                      key={study.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.12s ease'
                      }}
                      className="hover-table-row"
                    >
                      {/* Accession & UHID */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                          {study.accession_number}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {study.patient_uhid}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {study.patient_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          {study.patient_gender} {study.patient_dob ? `(${new Date().getFullYear() - new Date(study.patient_dob).getFullYear()}y)` : ''}
                        </div>
                      </td>

                      {/* Modality & Study */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              backgroundColor: 'var(--color-bg-pale-aqua)',
                              color: 'var(--color-primary-teal)',
                              fontWeight: '700',
                              fontSize: '0.70rem',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {study.modality_id}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {study.study_description}
                          </span>
                        </div>
                        {study.clinical_indication && (
                          <div
                            style={{
                              fontSize: '0.71rem',
                              color: 'var(--color-text-muted)',
                              marginTop: '2px',
                              maxWidth: '240px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={study.clinical_indication}
                          >
                            Indic: {study.clinical_indication}
                          </div>
                        )}
                      </td>

                      {/* Ordering Clinician */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
                          {study.ordering_doctor_name || 'Dr. Assigned Clinician'}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>
                          {study.ordering_doctor_code || 'OPD Ref'}
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
                          {new Date(study.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.71rem', color: 'var(--color-text-muted)' }}>
                          {new Date(study.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Badge variant={priorityCfg.variant} size="sm">
                          {priorityCfg.label}
                        </Badge>
                      </td>

                      {/* Status & Quick Status Pacing */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Badge variant={statusCfg.variant} size="sm">
                            {statusCfg.label}
                          </Badge>
                          {study.status === 'scheduled' && onUpdateStatus && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(study.id, 'arrived')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary-teal)',
                                cursor: 'pointer',
                                fontSize: '0.70rem',
                                textDecoration: 'underline'
                              }}
                              title="Patient arrived at radiology reception"
                            >
                              Arrive
                            </button>
                          )}
                          {study.status === 'arrived' && onUpdateStatus && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(study.id, 'in_progress')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#7c3aed',
                                cursor: 'pointer',
                                fontSize: '0.70rem',
                                fontWeight: '600'
                              }}
                              title="Begin scan inside modality suite"
                            >
                              Start
                            </button>
                          )}
                          {study.status === 'in_progress' && onUpdateStatus && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(study.id, 'completed')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#059669',
                                cursor: 'pointer',
                                fontSize: '0.70rem',
                                fontWeight: '600'
                              }}
                              title="Finish scan and record images"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Report Status */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {reportStatusCfg ? (
                          <Badge variant={reportStatusCfg.variant} size="sm">
                            {reportStatusCfg.label}
                          </Badge>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            No Report Yet
                          </span>
                        )}
                        {study.report_critical_alert && (
                          <span
                            style={{
                              marginLeft: '4px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.65rem',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              fontWeight: '700'
                            }}
                          >
                            CRITICAL
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {/* Launch DICOM Viewer */}
                          <button
                            type="button"
                            onClick={() => onOpenViewer && onOpenViewer(study)}
                            style={{
                              padding: '4px 7px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.72rem'
                            }}
                            title="Open DICOM PACS Viewer for this study"
                          >
                            <Eye size={12} />
                            <span>DICOM</span>
                          </button>

                          {/* Launch Report Authoring */}
                          <button
                            type="button"
                            onClick={() => onOpenAuthoring && onOpenAuthoring(study)}
                            style={{
                              padding: '4px 7px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.72rem'
                            }}
                            title="Author or edit structured report"
                          >
                            <FileText size={12} />
                            <span>Report</span>
                          </button>

                          {/* Verification */}
                          {study.report_status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => onOpenVerification && onOpenVerification(study)}
                              style={{
                                padding: '4px 7px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-primary-teal)',
                                backgroundColor: 'var(--color-bg-pale-aqua)',
                                color: 'var(--color-primary-teal)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.72rem',
                                fontWeight: '600'
                              }}
                              title="Review and digitally authorize report"
                            >
                              <CheckCircle2 size={12} />
                              <span>Verify</span>
                            </button>
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

      {/* Schedule Study Modal */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule New Modality Study (MWL Intake)"
        >
          <form onSubmit={handleSubmitSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Patient Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Patient <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                >
                  <option value="">-- Select Patient Record --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.uhid} - {p.full_name} ({p.gender || 'Patient'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordering Clinician */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Ordering Clinician
                </label>
                <select
                  value={formData.ordering_doctor_id}
                  onChange={(e) => setFormData({ ...formData, ordering_doctor_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.specialty || d.employee_code || 'Consultant'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Modality */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Modality <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={formData.modality_id}
                  onChange={(e) => handleModalityChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                >
                  {SUPPORTED_MODALITIES.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} [{m.room}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Clinical Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT / Immediate Emergency</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Study Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Study Description <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.study_description}
                  onChange={(e) => setFormData({ ...formData, study_description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                />
              </div>

              {/* Body Part */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Body Part / Anatomical Region
                </label>
                <input
                  type="text"
                  value={formData.body_part}
                  onChange={(e) => setFormData({ ...formData, body_part: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                />
              </div>
            </div>

            {/* Scheduled Date Time & Technologist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Scheduled Date & Time Slot <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                  Assigned Technologist
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Rajesh Sharma"
                  value={formData.technologist_name}
                  onChange={(e) => setFormData({ ...formData, technologist_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem'
                  }}
                />
              </div>
            </div>

            {/* Clinical Indication */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', marginBottom: '4px' }}>
                Clinical Indication & History
              </label>
              <textarea
                rows={2}
                placeholder="Specific clinical questions, symptoms, rule-out indications..."
                value={formData.clinical_indication}
                onChange={(e) => setFormData({ ...formData, clinical_indication: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={loading}
              >
                Confirm Slot & Issue MWL
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
