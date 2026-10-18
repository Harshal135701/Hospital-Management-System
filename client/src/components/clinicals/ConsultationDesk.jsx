import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Activity,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Modal } from '../common/UIPrimitives';

export const ConsultationDesk = ({
  patient,
  onSaveDraft,
  onCompleteConsultation,
  onNavigateSubtab
}) => {
  const [formData, setFormData] = useState({
    chiefComplaint: patient?.chief_complaint || '',
    summary: patient?.consultationDesk?.summary || '',
    examination: patient?.consultationDesk?.examination || '',
    impression: patient?.consultationDesk?.impression || ''
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSaveDraft) {
      onSaveDraft({
        chief_complaint: formData.chiefComplaint,
        consultationDesk: {
          summary: formData.summary,
          examination: formData.examination,
          impression: formData.impression
        }
      });
    }
    setSaveSuccessMsg('Consultation draft saved locally. (Frontend session only; no backend mutation)');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleConfirmComplete = () => {
    setIsConfirmModalOpen(false);
    if (onCompleteConsultation) {
      onCompleteConsultation({
        chief_complaint: formData.chiefComplaint,
        consultationDesk: {
          summary: formData.summary,
          examination: formData.examination,
          impression: formData.impression
        }
      });
    }
  };

  const isCompleted = patient?.status === 'completed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Save Notification Banner */}
      {saveSuccessMsg && (
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
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Overview Cards / Quick Jump Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px'
        }}
      >
        <div
          onClick={() => onNavigateSubtab && onNavigateSubtab('vitals')}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Jump to Vitals & Physical Examination"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Vitals & Physical Exam
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                {patient?.vitals?.systolic ? `BP: ${patient.vitals.systolic}/${patient.vitals.diastolic} • HR: ${patient.vitals.heartRate}` : 'Pending vitals capture'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>→</span>
        </div>

        <div
          onClick={() => onNavigateSubtab && onNavigateSubtab('orders')}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Jump to Diagnostic Orders (CPOE)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-soft-cyan)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ClipboardList size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Diagnostic Orders (CPOE)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                {patient?.orders?.length ? `${patient.orders.length} order(s) placed` : '0 orders active'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>→</span>
        </div>

        <div
          onClick={() => onNavigateSubtab && onNavigateSubtab('notes')}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Jump to Progress Notes (SOAP)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Clinical Progress Notes
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                {patient?.notes?.length ? `${patient.notes.length} historical note(s)` : 'SOAP draft in progress'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>→</span>
        </div>
      </div>

      {/* Main Consultation Form Card */}
      <Card
        title="Consultation Summary & Clinical Impression"
        subtitle="Record presenting symptoms, examination findings, and clinical impressions for this encounter."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              onClick={handleSave}
              disabled={isCompleted}
              title="Save draft observations locally"
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isCompleted}
              title="Finalize and complete consultation encounter"
            >
              {isCompleted ? 'Consultation Completed' : 'Complete Consultation'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isCompleted && (
            <div
              style={{
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-info)',
                border: '1px solid var(--color-info-border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} />
              <span>This consultation has been finalized and marked as completed. Records are viewable in read-only mode.</span>
            </div>
          )}

          {/* Chief Complaint */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Chief Complaint / Reason for Visit
            </label>
            <input
              type="text"
              value={formData.chiefComplaint}
              onChange={(e) => handleChange('chiefComplaint', e.target.value)}
              disabled={isCompleted}
              placeholder="e.g. Exertional retrosternal chest pain with shortness of breath..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary)',
                backgroundColor: isCompleted ? '#F8FAFA' : '#FFFFFF'
              }}
            />
          </div>

          {/* Consultation Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Clinical Summary & Observations
            </label>
            <textarea
              rows={4}
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              disabled={isCompleted}
              placeholder="Detailed description of clinical interview, duration of symptoms, and chronological course..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                backgroundColor: isCompleted ? '#F8FAFA' : '#FFFFFF',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Physical Examination Findings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Physical Examination Notes
              </label>
              <textarea
                rows={4}
                value={formData.examination}
                onChange={(e) => handleChange('examination', e.target.value)}
                disabled={isCompleted}
                placeholder="Inspection, palpation, auscultation, localized signs and pedal edema..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  backgroundColor: isCompleted ? '#F8FAFA' : '#FFFFFF',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Clinical Impression & Provisional Diagnosis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Clinical Impression / Provisional Diagnosis
              </label>
              <textarea
                rows={4}
                value={formData.impression}
                onChange={(e) => handleChange('impression', e.target.value)}
                disabled={isCompleted}
                placeholder="Working diagnosis, differential considerations, and clinical assessment..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  backgroundColor: isCompleted ? '#F8FAFA' : '#FFFFFF',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal before Completing Consultation */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Complete Patient Consultation?"
        subtitle={`Encounter: ${patient?.appointment_number} • ${patient?.patient_name} (${patient?.uhid})`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--color-primary-teal)' }}>
              Consultation Encounter Summary
            </div>
            <div><strong>Patient:</strong> {patient?.patient_name} ({patient?.age}y / {patient?.gender})</div>
            <div><strong>Doctor:</strong> {patient?.doctor_name} ({patient?.department})</div>
            <div><strong>Impression:</strong> {formData.impression || 'None recorded'}</div>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Finalizing this consultation will mark this encounter as <strong>Completed</strong> in the OPD queue. Please confirm that all physical examination notes, vitals, and diagnostic orders are accurate.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              onClick={handleConfirmComplete}
            >
              Confirm & Complete Consultation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
