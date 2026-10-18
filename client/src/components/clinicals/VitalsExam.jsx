import React, { useState, useMemo } from 'react';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { evaluateVitalRange, calculateBMI } from './clinicalDemoData';

export const VitalsExam = ({ patient, onSaveVitals }) => {
  const initialVitals = patient?.vitals || {};

  const [systolic, setSystolic] = useState(initialVitals.systolic || '');
  const [diastolic, setDiastolic] = useState(initialVitals.diastolic || '');
  const [heartRate, setHeartRate] = useState(initialVitals.heartRate || '');
  const [respiratoryRate, setRespiratoryRate] = useState(initialVitals.respiratoryRate || '');
  const [temperature, setTemperature] = useState(initialVitals.temperature || '');
  const [tempUnit, setTempUnit] = useState(initialVitals.tempUnit || 'C');
  const [spo2, setSpo2] = useState(initialVitals.spo2 || '');
  const [height, setHeight] = useState(initialVitals.height || '');
  const [weight, setWeight] = useState(initialVitals.weight || '');

  // Systemic exam notes
  const [cvs, setCvs] = useState(initialVitals.cvs || '');
  const [rs, setRs] = useState(initialVitals.rs || '');
  const [abdomen, setAbdomen] = useState(initialVitals.abdomen || '');
  const [cns, setCns] = useState(initialVitals.cns || '');

  const [saveToast, setSaveToast] = useState('');

  // Auto-calculated BMI
  const bmiInfo = useMemo(() => calculateBMI(height, weight), [height, weight]);

  // Validations
  const systolicEval = useMemo(() => evaluateVitalRange('systolic', systolic), [systolic]);
  const diastolicEval = useMemo(() => evaluateVitalRange('diastolic', diastolic), [diastolic]);
  const hrEval = useMemo(() => evaluateVitalRange('heartRate', heartRate), [heartRate]);
  const rrEval = useMemo(() => evaluateVitalRange('respiratoryRate', respiratoryRate), [respiratoryRate]);
  const tempEval = useMemo(() => evaluateVitalRange('temperature', temperature, tempUnit), [temperature, tempUnit]);
  const spo2Eval = useMemo(() => evaluateVitalRange('spo2', spo2), [spo2]);

  // Temperature unit toggle
  const handleToggleTempUnit = () => {
    if (temperature !== '') {
      const num = parseFloat(temperature);
      if (!isNaN(num)) {
        if (tempUnit === 'C') {
          // C to F
          setTemperature(((num * 9) / 5 + 32).toFixed(1));
          setTempUnit('F');
        } else {
          // F to C
          setTemperature((((num - 32) * 5) / 9).toFixed(1));
          setTempUnit('C');
        }
        return;
      }
    }
    setTempUnit(prev => (prev === 'C' ? 'F' : 'C'));
  };

  const handleSave = () => {
    if (onSaveVitals) {
      onSaveVitals({
        systolic,
        diastolic,
        heartRate,
        respiratoryRate,
        temperature,
        tempUnit,
        spo2,
        height,
        weight,
        cvs,
        rs,
        abdomen,
        cns
      });
    }
    setSaveToast('Vitals and physical examination notes saved locally.');
    setTimeout(() => setSaveToast(''), 4000);
  };

  const renderEvalIndicator = (evaluation) => {
    if (!evaluation) return null;
    const colorMap = {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-error)',
      info: 'var(--color-primary-teal)',
      error: 'var(--color-error)'
    };
    const iconMap = {
      success: CheckCircle2,
      warning: AlertTriangle,
      danger: AlertTriangle,
      info: Info,
      error: AlertTriangle
    };
    const IconComponent = iconMap[evaluation.type] || Info;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          color: colorMap[evaluation.type] || 'var(--color-text-secondary)',
          marginTop: '3px'
        }}
      >
        <IconComponent size={12} />
        <span>{evaluation.message}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notification Toast */}
      {saveToast && (
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
          <span>{saveToast}</span>
        </div>
      )}

      {/* Vitals Form Card */}
      <Card
        title="Physiological Vitals & Biometrics"
        subtitle="Record measured parameters. Missing observations are left blank and never assumed as zero."
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
            title="Save vitals to current patient record"
          >
            Save Vitals
          </Button>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Blood Pressure */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Blood Pressure (mmHg)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Systolic (e.g. 120)"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>/</span>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Diastolic (e.g. 80)"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
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
            {renderEvalIndicator(systolicEval)}
            {renderEvalIndicator(diastolicEval)}
          </div>

          {/* Heart Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              placeholder="e.g. 72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
            {renderEvalIndicator(hrEval)}
          </div>

          {/* Respiratory Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Respiratory Rate (breaths/min)
            </label>
            <input
              type="number"
              placeholder="e.g. 16"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
            {renderEvalIndicator(rrEval)}
          </div>

          {/* Temperature with Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Body Temperature
              </label>
              <button
                type="button"
                onClick={handleToggleTempUnit}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  color: 'var(--color-primary-teal)',
                  border: '1px solid rgba(8, 127, 140, 0.25)',
                  cursor: 'pointer'
                }}
                title="Toggle between Celsius and Fahrenheit"
              >
                Switch to °{tempUnit === 'C' ? 'F' : 'C'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                step="0.1"
                placeholder={tempUnit === 'C' ? 'e.g. 37.0' : 'e.g. 98.6'}
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                °{tempUnit}
              </span>
            </div>
            {renderEvalIndicator(tempEval)}
          </div>

          {/* SpO2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Oxygen Saturation SpO₂ (%)
            </label>
            <input
              type="number"
              placeholder="e.g. 98"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
            {renderEvalIndicator(spo2Eval)}
          </div>

          {/* Height */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Height (cm)
            </label>
            <input
              type="number"
              placeholder="e.g. 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Weight */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 70.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Calculated BMI Card / Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'var(--color-bg-soft-cyan)',
              border: '1px solid rgba(8, 127, 140, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              <Scale size={14} color="var(--color-primary-teal)" />
              <span>Calculated Body Mass Index (BMI)</span>
            </div>

            {bmiInfo ? (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {bmiInfo.value}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>kg/m²</span>
                  <Badge variant={bmiInfo.variant} size="sm">
                    {bmiInfo.category}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {bmiInfo.description}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Enter valid Height (cm) and Weight (kg) to compute BMI automatically.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Systemic Physical Examination Card */}
      <Card
        title="Systemic Physical Examination"
        subtitle="Document clinical examination observations by major organ system."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {/* CVS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Cardiovascular System (CVS)
            </label>
            <textarea
              rows={3}
              value={cvs}
              onChange={(e) => setCvs(e.target.value)}
              placeholder="Heart sounds (S1, S2), murmurs, gallops, rubs, peripheral pulses..."
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

          {/* Respiratory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Respiratory System (RS)
            </label>
            <textarea
              rows={3}
              value={rs}
              onChange={(e) => setRs(e.target.value)}
              placeholder="Air entry, vesicular breath sounds, crackles, rhonchi, wheezing..."
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

          {/* Abdominal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Abdominal Examination (PA)
            </label>
            <textarea
              rows={3}
              value={abdomen}
              onChange={(e) => setAbdomen(e.target.value)}
              placeholder="Soft/rigid, localized tenderness, guarding, organomegaly, bowel sounds..."
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

          {/* CNS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Central Nervous System (CNS)
            </label>
            <textarea
              rows={3}
              value={cns}
              onChange={(e) => setCns(e.target.value)}
              placeholder="Orientation, Glasgow Coma Scale (GCS), cranial nerves, motor tone, gait..."
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
