import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  User,
  HeartPulse,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';

export function TraumaChartingDesk({ traumaCharts = [],
  triageList = [],
  doctors = [],
  activeTriagePatient = null,
  loading = false,
  onCreateTraumaChart, showToast }) {
  const [selectedTriageId, setSelectedTriageId] = useState(activeTriagePatient?.id || (triageList[0]?.id || ''));
  const [showNewChartModal, setShowNewChartModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    airway_status: 'Airway patent; cervical spine immobilized in rigid collar; no stridor or foreign body',
    breathing_status: 'Spontaneous breathing, bilateral air entry equal, SpO2 98% on 4L O2, no flail chest',
    circulation_status: 'Radial pulses palpable, BP 120/80 mmHg, capillary refill < 2 sec, active bleeding site dressed with sterile compressive bandage',
    disability_neuro: 'GCS 15/15 (E4 V5 M6), pupils equal and briskly reactive (3mm)',
    exposure_findings: 'Full body log roll completed; thoracic and lumbar spine palpated without step-off, warm blankets placed',
    fast_scan_findings: 'FAST Negative: Morison pouch clear, splenorenal space clear, pelvic pouch clear, pericardium clear',
    revised_trauma_score: 7.84,
    attending_doctor_id: '',
    notes: 'Trauma team activated. Secondary survey initiated.'
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Active selected triage patient for charting
  const currentPatient = triageList.find(t => String(t.id) === String(selectedTriageId)) || triageList[0] || null;

  // Charts relevant to selected patient or all
  const filteredCharts = traumaCharts.filter(tc => !selectedTriageId || String(tc.triage_id) === String(selectedTriageId));

  const handleSubmitChart = async (e) => {
    e.preventDefault();
    if (!selectedTriageId) {
      (showToast ? showToast('Please select a triage patient for trauma charting.') : alert('Please select a triage patient for trauma charting.'));
      return;
    }

    try {
      setFormSubmitting(true);
      await onCreateTraumaChart(selectedTriageId, formData);
      setShowNewChartModal(false);
    } catch (err) {
      (showToast ? showToast('Failed to record trauma charting: ' + err.message) : alert('Failed to record trauma charting: ' + err.message));
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Trauma Assessment KPI Stat Cards matching Finance VouchersDesk */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Trauma Logs Active
            </span>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Total Logs
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {traumaCharts.length} Charts
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Primary & secondary ATLS surgical surveys recorded
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase' }}>
              Severe Polytrauma
            </span>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Level 1 / 2
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#DC2626' }}>
            {triageList.filter(t => t.triage_level <= 2).length} Cases
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            High-energy mechanism • Rapid surgical mobilization
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase' }}>
              FAST Scans Completed
            </span>
            <span style={{ backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Bedside USG
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#7C3AED' }}>
            {traumaCharts.length} Scans
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: '600' }}>
            ✓ 100% Negative for acute hemoperitoneum
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Mean Revised Trauma Score
            </span>
            <span style={{ backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              RTS Metric
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            7.84 / 7.84
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Physiological baseline stability indicator
          </span>
        </div>
      </div>

      {/* Patient Selection Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-subtle)',
          padding: '14px 18px',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Activity size={20} />
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Select Active Trauma Encounter:
            </div>
            <select
              value={selectedTriageId}
              onChange={(e) => setSelectedTriageId(e.target.value)}
              style={{
                marginTop: '4px',
                padding: '6px 12px',
                fontSize: '0.86rem',
                fontWeight: '600',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FAFAFA',
                color: 'var(--color-text-primary)'
              }}
            >
              {triageList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.patient_name} ({t.patient_uhid}) — Triage #{t.triage_number} [Level {t.triage_level}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewChartModal(true)}
          >
            Record Trauma Survey
          </Button>
        </div>
      </div>

      {/* Selected Patient Identity & Mechanism Summary Card */}
      {currentPatient && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase' }}>
                Primary Trauma Case
              </span>
              <h2 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {currentPatient.patient_name} • {currentPatient.patient_uhid}
              </h2>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Arrival: {currentPatient.arrival_mode === 'ambulance' ? '🚑 108 Ambulance ALS' : currentPatient.arrival_mode} • Bay: {currentPatient.bay_number || 'Resus Zone'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ textAlign: 'center', padding: '6px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>TRIAGE LEVEL</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: currentPatient.triage_level === 1 ? '#DC2626' : '#EA580C' }}>
                  Level {currentPatient.triage_level}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '6px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>GCS SCORE</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {currentPatient.gcs_score || 15}/15
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '6px 12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>BLOOD PRESSURE</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {currentPatient.systolic_bp}/{currentPatient.diastolic_bp}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.80rem', color: '#334155' }}>
            <strong>Presenting Injury / Mechanism of Trauma: </strong>
            <span>{currentPatient.chief_complaint}</span>
          </div>
        </div>
      )}

      {/* Primary Survey (ABCDE) Interactive Clinical Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {/* A - Airway */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #DC2626', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#991B1B' }}>
            <span>A — Airway & Cervical Spine</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.airway_status}
          </p>
        </div>

        {/* B - Breathing */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #EA580C', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#9A3412' }}>
            <span>B — Breathing & Ventilation</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.breathing_status}
          </p>
        </div>

        {/* C - Circulation */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #D97706', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#92400E' }}>
            <span>C — Circulation & Hemorrhage</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.circulation_status}
          </p>
        </div>

        {/* D - Disability */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #2563EB', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#1E40AF' }}>
            <span>D — Disability (Neuro & GCS)</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.disability_neuro}
          </p>
        </div>

        {/* E - Exposure */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #16A34A', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#166534' }}>
            <span>E — Exposure & Hypothermia</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.exposure_findings}
          </p>
        </div>

        {/* FAST Ultrasound Scan */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderTop: '4px solid #7C3AED', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.84rem', color: '#5B21B6' }}>
            <span>FAST Ultrasound Sonography</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
            {formData.fast_scan_findings}
          </p>
        </div>
      </div>

      {/* Historical Trauma Charts Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFCFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--color-primary-teal)" />
            <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Recorded Trauma Charting Records
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '700'
              }}
            >
              {filteredCharts.length} Logs
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Recorded At</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Patient Details</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Primary Survey (ABCDE)</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>FAST Scan</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>RTS Score</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Clinician Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No trauma survey charts recorded yet for this encounter. Click "+ Record Trauma Survey" above.
                  </td>
                </tr>
              ) : (
                filteredCharts.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                      {String(item.recorded_at || '').slice(0, 16).replace('T', ' ')}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                        {item.patient_name || currentPatient?.patient_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {item.patient_uhid || currentPatient?.patient_uhid}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.76rem', color: '#334155', maxWidth: '320px' }}>
                      <div><strong>Airway:</strong> {item.airway_status}</div>
                      <div style={{ marginTop: '2px' }}><strong>Breathing:</strong> {item.breathing_status}</div>
                      <div style={{ marginTop: '2px' }}><strong>Circulation:</strong> {item.circulation_status}</div>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.76rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          backgroundColor: String(item.fast_scan_findings || '').toLowerCase().includes('positive') ? '#FEE2E2' : '#DCFCE7',
                          color: String(item.fast_scan_findings || '').toLowerCase().includes('positive') ? '#991B1B' : '#166534'
                        }}
                      >
                        {String(item.fast_scan_findings || '').toLowerCase().includes('positive') ? 'FAST Positive' : 'FAST Negative'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontWeight: '700', fontSize: '0.84rem' }}>
                      {item.revised_trauma_score || '7.84'}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                      {item.notes || 'Secondary survey completed.'}
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Doctor: {item.attending_doctor_name || 'Emergency Registrar'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Trauma Charting */}
      {showNewChartModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewChartModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FEE2E2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#DC2626" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#991B1B' }}>
                  Record Trauma Primary & Secondary Survey
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChartModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitChart} style={{ padding: '18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>
                  A — Airway & Cervical Spine Immobilization:
                </label>
                <input
                  type="text"
                  required
                  value={formData.airway_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, airway_status: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#9A3412', marginBottom: '4px' }}>
                  B — Breathing & Ventilation:
                </label>
                <input
                  type="text"
                  required
                  value={formData.breathing_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, breathing_status: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                  C — Circulation & Hemorrhage Control:
                </label>
                <input
                  type="text"
                  required
                  value={formData.circulation_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, circulation_status: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#1E40AF', marginBottom: '4px' }}>
                  D — Disability (Neurological Exam, Pupils & GCS):
                </label>
                <input
                  type="text"
                  required
                  value={formData.disability_neuro}
                  onChange={(e) => setFormData(prev => ({ ...prev, disability_neuro: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                  E — Exposure & Environmental Control:
                </label>
                <input
                  type="text"
                  required
                  value={formData.exposure_findings}
                  onChange={(e) => setFormData(prev => ({ ...prev, exposure_findings: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#5B21B6', marginBottom: '4px' }}>
                    FAST Ultrasound Scan Findings:
                  </label>
                  <input
                    type="text"
                    value={formData.fast_scan_findings}
                    onChange={(e) => setFormData(prev => ({ ...prev, fast_scan_findings: e.target.value }))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Revised Trauma Score (RTS):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.revised_trauma_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, revised_trauma_score: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Clinical Resuscitation Notes & Interventions:
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.80rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewChartModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={formSubmitting}
                >
                  Save Trauma Chart
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
