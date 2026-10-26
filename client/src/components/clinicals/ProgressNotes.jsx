import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Eye,
  Lock,
  Clock,
  User,
  FileCheck
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import { ClinicalService } from '../../services/api';

export const ProgressNotes = ({ patient, onSaveNote }) => {
  const { user } = useAuth();
  const authorName = user?.full_name ? `${user.full_name} (${user.role ? user.role.replace(/_/g, ' ') : 'Clinician'})` : (patient?.doctor_name || 'Attending Physician');

  // Existing historical notes
  const [historicalNotes, setHistoricalNotes] = useState(patient?.notes || []);

  // Current draft SOAP note fields
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Modals & Feedback
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHistoricalNotes(patient?.notes || []);
  }, [patient?.id, patient?.notes]);

  const [currentDateTimeStr] = useState(() => new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));

  const handleSaveDraft = async () => {
    setIsSaving(true);
    if (patient?.is_live && patient?.encounter_id) {
      try {
        const saved = await ClinicalService.saveProgressNote({
          encounter_id: patient.encounter_id,
          patient_id: patient.patient_id,
          note_type: 'soap',
          subjective: subjective || undefined,
          objective: objective || undefined,
          assessment: assessment || undefined,
          plan: plan || undefined,
          status: 'draft'
        });

        const newNote = {
          id: saved?.id || `note-${Date.now()}`,
          author: authorName,
          timestamp: currentDateTimeStr,
          status: 'Draft',
          subjective: subjective || 'None recorded',
          objective: objective || 'None recorded',
          assessment: assessment || 'None recorded',
          plan: plan || 'None recorded'
        };

        const updated = [newNote, ...historicalNotes];
        setHistoricalNotes(updated);
        if (onSaveNote) onSaveNote(updated);

        setToastMessage('SOAP progress note draft saved to database.');
        setTimeout(() => setToastMessage(''), 4000);
        return;
      } catch (err) {
        console.error('[ProgressNotes] Save draft error:', err);
        setToastMessage(`Failed to save draft note: ${err.message}`);
        setTimeout(() => setToastMessage(''), 5000);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    setToastMessage('SOAP progress note draft saved in local session.');
    setTimeout(() => setToastMessage(''), 4000);
    setIsSaving(false);
  };

  const handleConfirmFinalize = async () => {
    setIsSaving(true);
    if (patient?.is_live && patient?.encounter_id) {
      try {
        const saved = await ClinicalService.saveProgressNote({
          encounter_id: patient.encounter_id,
          patient_id: patient.patient_id,
          note_type: 'soap',
          subjective: subjective || undefined,
          objective: objective || undefined,
          assessment: assessment || undefined,
          plan: plan || undefined,
          status: 'finalized'
        });

        const newNote = {
          id: saved?.id || `note-${Date.now()}`,
          author: authorName,
          timestamp: currentDateTimeStr,
          status: 'Finalized',
          subjective: subjective || 'None recorded',
          objective: objective || 'None recorded',
          assessment: assessment || 'None recorded',
          plan: plan || 'None recorded'
        };

        const updated = [newNote, ...historicalNotes];
        setHistoricalNotes(updated);
        if (onSaveNote) onSaveNote(updated);

        setSubjective('');
        setObjective('');
        setAssessment('');
        setPlan('');
        setIsFinalizeModalOpen(false);

        setToastMessage('Progress note successfully signed, finalized, and saved to database.');
        setTimeout(() => setToastMessage(''), 4000);
        return;
      } catch (err) {
        console.error('[ProgressNotes] Finalize note error:', err);
        setToastMessage(`Failed to finalize note: ${err.message}`);
        setTimeout(() => setToastMessage(''), 5000);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    const newNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      timestamp: currentDateTimeStr,
      status: 'Finalized',
      subjective: subjective || 'None recorded',
      objective: objective || 'None recorded',
      assessment: assessment || 'None recorded',
      plan: plan || 'None recorded'
    };

    const updated = [newNote, ...historicalNotes];
    setHistoricalNotes(updated);
    if (onSaveNote) {
      onSaveNote(updated);
    }

    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setIsFinalizeModalOpen(false);
    setIsSaving(false);

    setToastMessage('Progress note successfully signed and finalized.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const isFormEmpty = !subjective && !objective && !assessment && !plan;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
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
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active SOAP Note Editor Card */}
      <Card
        title="Clinical Progress Note (SOAP Framework)"
        subtitle="Author standardized clinical notes. Finalized notes are signed and locked."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              onClick={handleSaveDraft}
              disabled={isFormEmpty}
              title="Save working draft locally"
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setIsPreviewOpen(true)}
              disabled={isFormEmpty}
              title="Preview formatted clinical note"
            >
              Preview Note
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={() => setIsFinalizeModalOpen(true)}
              disabled={isFormEmpty}
              title="Sign and finalize note"
            >
              Finalize Note
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata Header */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)' }}>
              <User size={15} color="var(--color-primary-teal)" />
              <span><strong>Author:</strong> {authorName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-secondary)' }}>
                <Clock size={14} />
                <span>{currentDateTimeStr}</span>
              </span>
              <Badge variant="warning" size="sm">
                Unsaved Draft
              </Badge>
            </div>
          </div>

          {/* SOAP Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Subjective */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>S</span>
                Subjective
              </label>
              <textarea
                rows={4}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                placeholder="Patient history, current complaints, symptoms reported, review of systems..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Objective */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>O</span>
                Objective
              </label>
              <textarea
                rows={4}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Vital signs, physical examination findings, bedside observations, lab results..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Assessment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>A</span>
                Assessment
              </label>
              <textarea
                rows={4}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="Diagnostic impressions, differential diagnoses, response to interventions..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Plan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', padding: '1px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>P</span>
                Plan
              </label>
              <textarea
                rows={4}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Diagnostic orders, medications, procedures, patient education, follow-up..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Progress Notes List */}
      <Card
        title="Historical Clinical Progress Notes"
        subtitle="Chronological audit record of finalized progress notes for this patient."
      >
        {historicalNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No finalized progress notes recorded for this patient encounter yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {historicalNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: '10px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {note.author}
                    </span>
                    <Badge variant="teal" size="sm">
                      {note.status}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {note.timestamp}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: 'var(--color-primary-teal)' }}>Subjective:</strong>
                    <div style={{ color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                      {note.subjective}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: 'var(--color-primary-teal)' }}>Objective:</strong>
                    <div style={{ color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                      {note.objective}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: 'var(--color-primary-teal)' }}>Assessment:</strong>
                    <div style={{ color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                      {note.assessment}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: 'var(--color-primary-teal)' }}>Plan:</strong>
                    <div style={{ color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                      {note.plan}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Preview Note Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Clinical Chart Note Preview"
        subtitle={`Patient: ${patient?.patient_name} (${patient?.uhid})`}
        maxWidth="640px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '16px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FAFCFC'
            }}
          >
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary-teal)' }}>
                  Sarji Group of Hospitals — Progress Note
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{currentDateTimeStr}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Patient: {patient?.patient_name} • UHID: {patient?.uhid} • Clinician: {authorName}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <strong>[S] Subjective:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                  {subjective || 'No subjective statements documented.'}
                </p>
              </div>

              <div>
                <strong>[O] Objective:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                  {objective || 'No objective findings documented.'}
                </p>
              </div>

              <div>
                <strong>[A] Assessment:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                  {assessment || 'No clinical assessments documented.'}
                </p>
              </div>

              <div>
                <strong>[P] Plan:</strong>
                <p style={{ margin: '3px 0 0', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                  {plan || 'No treatment plans documented.'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="md" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* Finalize Confirmation Modal */}
      <Modal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        title="Finalize & Sign Clinical Progress Note?"
        subtitle="Electronic signing and permanent clinical record lock"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-info-bg)',
              border: '1px solid var(--color-info-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.82rem',
              color: 'var(--color-info)'
            }}
          >
            <strong>Medical Chart Compliance:</strong> Finalized progress notes are electronically stamped with author credentials ({authorName}) and timestamp. In accordance with clinical governance standards, finalized notes cannot be silently overwritten.
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
            Are you sure you want to finalize this SOAP note? This will move the note to the historical consultation ledger for this patient encounter.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            <Button variant="outline" size="md" onClick={() => setIsFinalizeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={FileCheck}
              loading={isSaving}
              disabled={isSaving}
              onClick={handleConfirmFinalize}
            >
              Sign & Finalize Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
