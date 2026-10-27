import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Activity,
  Tag,
  Stethoscope,
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { REPORT_TEMPLATES } from './radiologyMockData';

export function ReportAuthoringDesk({
  studies = [],
  selectedStudy = null,
  currentUser = null,
  onSaveReport,
  onNavigateVerification
}) {
  const [activeStudyId, setActiveStudyId] = useState(() => {
    if (selectedStudy?.id) return selectedStudy.id;
    return studies[0]?.id || '';
  });

  const activeStudy = useMemo(() => {
    return studies.find(s => s.id === activeStudyId) || selectedStudy || studies[0] || null;
  }, [studies, activeStudyId, selectedStudy]);

  // Form State
  const [formData, setFormData] = useState({
    technique: '',
    findings: '',
    impression: '',
    recommendations: '',
    critical_alert: false,
    critical_notes: '',
    status: 'draft'
  });

  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Synchronize form when activeStudy changes
  useEffect(() => {
    if (activeStudy) {
      setFormData({
        technique: activeStudy.report_technique || `Volumetric diagnostic acquisition of ${activeStudy.body_part || 'the region'} utilizing standard clinical protocol.`,
        findings: activeStudy.report_findings || '',
        impression: activeStudy.report_impression || '',
        recommendations: activeStudy.report_recommendations || 'Clinical correlation advised.',
        critical_alert: Boolean(activeStudy.report_critical_alert),
        critical_notes: activeStudy.report_critical_notes || '',
        status: activeStudy.report_status || 'draft'
      });
    }
  }, [activeStudy]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleApplyTemplate = (tpl) => {
    setFormData(prev => ({
      ...prev,
      technique: tpl.technique,
      findings: tpl.findings,
      impression: tpl.impression,
      recommendations: tpl.recommendations
    }));
    showToast(`Applied structured template: "${tpl.name}"`);
  };

  const handleSave = async (targetStatus = 'draft') => {
    if (!activeStudy) return;
    setSaving(true);
    try {
      if (onSaveReport) {
        await onSaveReport({
          study_id: activeStudy.id,
          technique: formData.technique,
          findings: formData.findings,
          impression: formData.impression,
          recommendations: formData.recommendations,
          critical_alert: formData.critical_alert,
          critical_notes: formData.critical_notes,
          status: targetStatus
        });
      }
      setFormData(prev => ({ ...prev, status: targetStatus }));
      showToast(targetStatus === 'draft' ? 'Draft report saved successfully.' : 'Report submitted for radiologist verification.');
      if (targetStatus === 'preliminary' && onNavigateVerification) {
        setTimeout(() => onNavigateVerification(activeStudy), 1200);
      }
    } catch (err) {
      alert('Error saving report: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Toast Notification */}
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
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Patient & Study Context Header Banner */}
      <Card style={{ padding: '16px', backgroundColor: 'var(--color-bg-subtle)', borderLeft: '4px solid var(--color-primary-teal)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Active Study for Reporting:
              </span>
              <select
                value={activeStudy?.id || ''}
                onChange={(e) => setActiveStudyId(e.target.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  fontWeight: '700',
                  color: 'var(--color-primary-teal)'
                }}
              >
                {studies.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.modality_id}] {s.accession_number} — {s.patient_name} ({s.patient_uhid})
                  </option>
                ))}
              </select>
            </div>

            {/* Context details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Patient: </span>
                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{activeStudy?.patient_name}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({activeStudy?.patient_gender}, {activeStudy?.patient_uhid})</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Modality / Procedure: </span>
                <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{activeStudy?.modality_id} - {activeStudy?.study_description}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Body Part: </span>
                <span style={{ fontWeight: '600' }}>{activeStudy?.body_part || 'General'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Ordering Clinician: </span>
                <span style={{ fontWeight: '600' }}>{activeStudy?.ordering_doctor_name || 'Dr. House'}</span>
              </div>
            </div>

            {activeStudy?.clinical_indication && (
              <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '4px' }}>
                <strong>Clinical Indication:</strong> {activeStudy.clinical_indication}
              </div>
            )}
          </div>

          {/* Report Status Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <Badge variant={formData.status === 'verified' ? 'teal' : formData.status === 'preliminary' ? 'blue' : 'amber'} size="sm">
              Status: {formData.status.toUpperCase()}
            </Badge>
            <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
              Acc: {activeStudy?.accession_number}
            </span>
          </div>
        </div>
      </Card>

      {/* Structured Reporting Templates Selector */}
      <Card style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            <Sparkles size={16} color="var(--color-primary-teal)" />
            <span>Structured Reporting Templates:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {REPORT_TEMPLATES.map(tpl => (
              <button
                type="button"
                key={tpl.id}
                onClick={() => handleApplyTemplate(tpl)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                className="hover-tab"
                title={`Populate with ${tpl.name}`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Structured Authoring Form */}
      <Card style={{ padding: '18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Technique */}
          <div>
            <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              1. Imaging Technique & Protocol
            </label>
            <input
              type="text"
              value={formData.technique}
              onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
              placeholder="Projection, kVp/mAs, contrast volume, phase, slice collimation..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem'
              }}
            />
          </div>

          {/* Systematic Findings */}
          <div>
            <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              2. Systematic Anatomical Findings <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              rows={6}
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              placeholder="Detailed organ-by-organ or anatomical observation..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
          </div>

          {/* Impression */}
          <div>
            <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              3. Diagnostic Impression / Conclusion <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={formData.impression}
              onChange={(e) => setFormData({ ...formData, impression: e.target.value })}
              placeholder="Primary diagnosis, differential, or normal classification (e.g. BI-RADS 1)..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                fontWeight: '600',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Recommendations */}
          <div>
            <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              4. Recommendations & Follow-Up
            </label>
            <input
              type="text"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Clinical correlation, repeat imaging interval, biopsy or specialist referral..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem'
              }}
            />
          </div>

          {/* Critical Finding Panic Value Alert */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: formData.critical_alert ? '#fef2f2' : '#f8fafc',
              border: `1px solid ${formData.critical_alert ? '#fca5a5' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.80rem', fontWeight: '700', color: formData.critical_alert ? '#b91c1c' : 'var(--color-text-primary)' }}>
                <input
                  type="checkbox"
                  checked={formData.critical_alert}
                  onChange={(e) => setFormData({ ...formData, critical_alert: e.target.checked })}
                  style={{ accentColor: '#dc2626', width: '16px', height: '16px' }}
                />
                <span>Critical Panic Value Finding (Requires Immediate Clinician Verbal Escalation)</span>
              </label>

              {formData.critical_alert && (
                <Badge variant="danger" size="sm">
                  PANIC ALERT ACTIVE
                </Badge>
              )}
            </div>

            {formData.critical_alert && (
              <input
                type="text"
                placeholder="Critical alert reason (e.g. Tension Pneumothorax, Acute Intracranial Bleed, Ectopic Pregnancy)..."
                value={formData.critical_notes}
                onChange={(e) => setFormData({ ...formData, critical_notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #f87171',
                  fontSize: '0.78rem',
                  backgroundColor: '#FFFFFF',
                  color: '#991b1b'
                }}
              />
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '14px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              Reporting Radiologist: <strong>{currentUser?.name || 'Dr. Radiologist'}</strong> ({currentUser?.role || 'Clinician Doctor'})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Save}
                loading={saving}
                onClick={() => handleSave('draft')}
              >
                Save Draft
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                loading={saving}
                onClick={() => handleSave('preliminary')}
              >
                Submit for Verification
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
