import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Pill,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Card, Button } from '../common/UIPrimitives';

export const ComplaintsHistory = ({ patient, onSaveHistory }) => {
  const initialHistory = patient?.history || {};

  const [presentingComplaint, setPresentingComplaint] = useState(initialHistory.presentingComplaint || '');
  const [onsetDuration, setOnsetDuration] = useState(initialHistory.onsetDuration || '');
  const [severity, setSeverity] = useState(initialHistory.severity || 'Moderate');
  const [aggravatingFactors, setAggravatingFactors] = useState(initialHistory.aggravatingFactors || '');
  const [relievingFactors, setRelievingFactors] = useState(initialHistory.relievingFactors || '');
  const [medicalHistory, setMedicalHistory] = useState(initialHistory.medicalHistory || '');
  const [surgicalHistory, setSurgicalHistory] = useState(initialHistory.surgicalHistory || '');
  const [familyHistory, setFamilyHistory] = useState(initialHistory.familyHistory || '');
  const [currentMedications, setCurrentMedications] = useState(initialHistory.currentMedications || '');
  const [allergies, setAllergies] = useState(initialHistory.allergies || (patient?.allergies?.join(', ') || ''));

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const h = patient?.history || {};
    setPresentingComplaint(h.presentingComplaint || patient?.chief_complaint || '');
    setOnsetDuration(h.onsetDuration || '');
    setSeverity(h.severity || 'Moderate');
    setAggravatingFactors(h.aggravatingFactors || '');
    setRelievingFactors(h.relievingFactors || '');
    setMedicalHistory(h.medicalHistory || '');
    setSurgicalHistory(h.surgicalHistory || '');
    setFamilyHistory(h.familyHistory || '');
    setCurrentMedications(h.currentMedications || '');
    setAllergies(h.allergies || (patient?.allergies?.join(', ') || ''));
  }, [patient?.id, patient?.history, patient?.chief_complaint, patient?.allergies]);

  const severityOptions = [
    { label: 'Mild', color: 'var(--color-success)', bg: 'var(--color-success-bg)', border: 'var(--color-success-border)' },
    { label: 'Moderate', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
    { label: 'Severe', color: '#C2410C', bg: '#FFEDD5', border: '#FED7AA' },
    { label: 'Critical', color: 'var(--color-error)', bg: 'var(--color-error-bg)', border: 'var(--color-error-border)' }
  ];

  const handleSave = async () => {
    if (onSaveHistory) {
      await onSaveHistory({
        presentingComplaint,
        onsetDuration,
        severity,
        aggravatingFactors,
        relievingFactors,
        medicalHistory,
        surgicalHistory,
        familyHistory,
        currentMedications,
        allergies
      });
    }
    setToastMessage(patient?.is_live
      ? 'Clinical history & complaints saved to PostgreSQL database.'
      : 'Clinical history & complaints saved locally.');
    setTimeout(() => setToastMessage(''), 4000);
  };

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

      {/* Chief Complaints Card */}
      <Card
        title="Presenting Complaints & Symptom Evolution"
        subtitle="Elicit symptom onset, duration, severity grading, and mitigating factors."
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
            title="Save clinical history changes"
          >
            Save History
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Presenting Complaint */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Presenting Complaint (In Patient's Own Words)
            </label>
            <textarea
              rows={3}
              value={presentingComplaint}
              onChange={(e) => setPresentingComplaint(e.target.value)}
              placeholder="e.g. Substernal chest tightness radiating to left arm when walking..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                lineHeight: 1.4,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* Onset and Duration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Onset & Duration
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)' }}>
                  <Clock size={16} />
                </span>
                <input
                  type="text"
                  value={onsetDuration}
                  onChange={(e) => setOnsetDuration(e.target.value)}
                  placeholder="e.g. 2 weeks ago; episodes lasting 5-10 mins"
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 34px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Severity Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Symptom Severity
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {severityOptions.map((opt) => {
                  const isSelected = severity === opt.label;
                  return (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => setSeverity(opt.label)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? opt.color : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? opt.bg : '#FFFFFF',
                        color: isSelected ? opt.color : 'var(--color-text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Aggravating Factors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Aggravating Factors
              </label>
              <input
                type="text"
                value={aggravatingFactors}
                onChange={(e) => setAggravatingFactors(e.target.value)}
                placeholder="e.g. Physical exertion, climbing stairs, cold weather, heavy meals..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Relieving Factors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Relieving Factors
              </label>
              <input
                type="text"
                value={relievingFactors}
                onChange={(e) => setRelievingFactors(e.target.value)}
                placeholder="e.g. Complete rest, sitting down, sublingual nitrates..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Clinical Background Card */}
      <Card
        title="Clinical Background & Family History"
        subtitle="Medical comorbidities, surgical interventions, and familial risk markers."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Past Medical History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Relevant Past Medical History
              </label>
              <textarea
                rows={3}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Chronic conditions (Hypertension, T2DM, Asthma, IHD, CKD)..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Past Surgical History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Surgical History & Interventions
              </label>
              <textarea
                rows={3}
                value={surgicalHistory}
                onChange={(e) => setSurgicalHistory(e.target.value)}
                placeholder="Previous surgeries, approximate years, and anesthesia complications..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Family History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Family Medical History
            </label>
            <input
              type="text"
              value={familyHistory}
              onChange={(e) => setFamilyHistory(e.target.value)}
              placeholder="e.g. Father had MI at age 54; Mother has Type 2 diabetes; no sudden unexplained deaths"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </Card>

      {/* Medications and Allergies Card */}
      <Card
        title="Active Medications & Known Allergies"
        subtitle="Medication reconciliation and adverse substance reactions."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Medications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={16} color="var(--color-primary-teal)" />
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Current Medications & Dosages
              </label>
            </div>
            <textarea
              rows={3}
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="Drug name, strength, dosage schedule (e.g. Amlodipine 5mg OD, Metformin 1000mg BD)..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Allergies & Reactions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="var(--color-error)" />
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Allergies & Adverse Drug Reactions
              </label>
            </div>
            <textarea
              rows={3}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Substance (e.g. Penicillin, Sulfa, Latex) and documented reaction (e.g. hives, anaphylaxis)..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
