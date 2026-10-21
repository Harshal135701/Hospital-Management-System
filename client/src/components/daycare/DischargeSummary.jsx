import React, { useState } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { formatDateIN, formatINR } from '../../utils/formatters';

export function DischargeSummary({
  admissions,
  selectedAdmission,
  onSelectAdmission,
  onCreateDischargeSummary,
  onApproveDischarge
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State for creating/editing discharge summary
  const [aldreteScore, setAldreteScore] = useState(10);
  const [padssScore, setPadssScore] = useState(9);
  const [recoveryNotes, setRecoveryNotes] = useState('Patient alert, oriented, vital signs stable, tolerating oral fluids.');
  const [dischargeCondition, setDischargeCondition] = useState('Stable for Home Discharge');
  const [homeMeds, setHomeMeds] = useState('Analgesic / Anti-inflammatory as prescribed. Follow dressing care.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 5 * 86400 * 1000).toISOString().slice(0, 10)
  );

  const activeEpisode = selectedAdmission || admissions[0] || null;
  const summary = activeEpisode?.discharge_summary || null;

  const handleOpenEdit = () => {
    if (summary) {
      setAldreteScore(summary.aldrete_score || 10);
      setPadssScore(summary.padss_score || 9);
      setRecoveryNotes(summary.recovery_observations || '');
      setDischargeCondition(summary.discharge_condition || 'Stable for Home Discharge');
      setHomeMeds(summary.home_medications || '');
      setFollowUpDate(summary.follow_up_date || new Date().toISOString().slice(0, 10));
    }
    setIsEditModalOpen(true);
  };

  const handleSaveSummary = (e) => {
    e.preventDefault();
    if (!activeEpisode) return;

    const summaryPayload = {
      aldrete_score: Number(aldreteScore),
      padss_score: Number(padssScore),
      recovery_observations: recoveryNotes,
      discharge_condition: dischargeCondition,
      home_medications: homeMeds,
      follow_up_date: followUpDate,
      consultant_approved: false, // Must be explicitly signed
      approved_by: null,
      approved_at: null
    };

    onCreateDischargeSummary(activeEpisode.id, summaryPayload);
    setIsEditModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Episode Selector & Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Day Care Discharge Summary
            </div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
              {activeEpisode ? `${activeEpisode.patient_name} (${activeEpisode.patient_uhid})` : 'Select Patient'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={activeEpisode?.id || ''}
            onChange={(e) => {
              const adm = admissions.find(a => a.id === e.target.value);
              if (adm) onSelectAdmission(adm);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            {admissions.map(adm => (
              <option key={adm.id} value={adm.id}>
                {adm.patient_name} - {adm.procedure_name} ({adm.discharge_summary?.consultant_approved ? 'Approved' : 'Pending'})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
            disabled={!summary}
          >
            Print Card
          </Button>

          <Button
            variant="primary"
            icon={FileText}
            onClick={handleOpenEdit}
            disabled={!activeEpisode}
          >
            {summary ? 'Edit Summary' : 'Prepare Discharge'}
          </Button>
        </div>
      </div>

      {activeEpisode && (
        <div className="printable-discharge-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Discharge Validation Status Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Consultant Medical Clearance Status */}
            <div
              style={{
                backgroundColor: summary?.consultant_approved ? '#F0FDF4' : '#FFFBEB',
                border: summary?.consultant_approved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                  Consultant Medical Sign-off
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.98rem', color: summary?.consultant_approved ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '2px' }}>
                  {summary?.consultant_approved ? `Approved by ${summary.approved_by || 'Consultant'}` : 'Pending Consultant Sign-Off'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {summary?.approved_at ? new Date(summary.approved_at).toLocaleString() : 'Requires attending surgeon authorization'}
                </div>
              </div>
              {!summary?.consultant_approved && summary && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => onApproveDischarge(activeEpisode.id, activeEpisode.doctor_name || 'Dr. Attending Surgeon')}
                >
                  Approve Sign-off
                </Button>
              )}
            </div>

            {/* Cashier Billing Clearance Status */}
            <div
              style={{
                backgroundColor: activeEpisode.billing_cleared ? '#F0FDF4' : '#FEF2F2',
                border: activeEpisode.billing_cleared ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                  Cashier Billing Clearance
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.98rem', color: activeEpisode.billing_cleared ? 'var(--color-success)' : 'var(--color-error)', marginTop: '2px' }}>
                  {activeEpisode.billing_cleared ? 'Clearance Granted' : 'Pending Clearance at POS'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Package Total: {formatINR(activeEpisode.total_package_cost || 0)}
                </div>
              </div>
              <Badge variant={activeEpisode.billing_cleared ? 'success' : 'danger'}>
                {activeEpisode.billing_cleared ? 'Cleared' : 'Cashier Hold'}
              </Badge>
            </div>
          </div>

          {/* Printable Discharge Document Card */}
          <Card
            title={`Day Care Ambulatory Discharge Summary — ${activeEpisode.admission_number}`}
            subtitle="Official outpatient procedural recovery record and post-operative home instructions."
          >
            {!summary ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Discharge Summary Not Yet Prepared</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Click "Prepare Discharge" above to evaluate recovery scores and generate home instructions.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Clinical Header Banner */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    padding: '14px',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(8, 127, 140, 0.15)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Patient Name:</span>{' '}
                    <strong style={{ color: 'var(--color-text-primary)' }}>{activeEpisode.patient_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>UHID:</span>{' '}
                    <strong>{activeEpisode.patient_uhid}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Age / Gender:</span>{' '}
                    <strong>{activeEpisode.patient_age}y / {activeEpisode.patient_gender}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Attending Consultant:</span>{' '}
                    <strong>{activeEpisode.doctor_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Procedure:</span>{' '}
                    <strong>{activeEpisode.procedure_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Date of Procedure:</span>{' '}
                    <strong>{formatDateIN(activeEpisode.procedure_date)}</strong>
                  </div>
                </div>

                {/* Objective Recovery Scores (Aldrete / PADSS) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                        Modified Aldrete Recovery Score
                      </span>
                      <Badge variant={summary.aldrete_score >= 9 ? 'success' : 'warning'}>
                        {summary.aldrete_score} / 10
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      Evaluates motor activity, respiration, circulation, consciousness, and O2 saturation. Score ≥ 9 required for discharge.
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                        Post-Anesthesia Discharge Score (PADSS)
                      </span>
                      <Badge variant={summary.padss_score >= 9 ? 'success' : 'warning'}>
                        {summary.padss_score} / 10
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      Evaluates vital signs, ambulation, nausea/vomiting, surgical bleeding, and pain control.
                    </div>
                  </div>
                </div>

                {/* Structured Discharge Observations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      Post-Procedure Recovery Observations & Findings
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: 1.45 }}>
                      {summary.recovery_observations}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      Discharge Condition
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--color-success)', marginTop: '4px' }}>
                      {summary.discharge_condition}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      Home Medications & Wound Care Instructions
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: 1.45 }}>
                      {summary.home_medications || 'Take prescribed analgesics as required. Keep wound dry.'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      Scheduled Follow-up Date
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--color-primary-teal)' }} />
                      {formatDateIN(summary.follow_up_date)} (OPD Consultation Wing)
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Attending Doctor Signature Block */}
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <div>Emergency Helpline: <strong>+91 33 2400 9999</strong> (24/7 Day Care Helpline)</div>
                    <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>In case of excessive bleeding, intractable pain or fever, report to ER immediately.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      {summary.consultant_approved ? summary.approved_by : activeEpisode.doctor_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                      {summary.consultant_approved ? 'Verified Consultant Medical Sign-off' : 'Pending Electronic Signature'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Prepare / Edit Discharge Summary Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Prepare Day Care Discharge Summary — ${activeEpisode?.patient_name || ''}`}
        subtitle="Record recovery assessments, clinical condition, and home care instructions."
        maxWidth="620px"
      >
        <form onSubmit={handleSaveSummary} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recovery Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Modified Aldrete Score (0 - 10) *
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={aldreteScore}
                onChange={(e) => setAldreteScore(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                PADSS Score (0 - 10) *
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={padssScore}
                onChange={(e) => setPadssScore(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Recovery Observations & Findings *
            </label>
            <textarea
              rows="3"
              value={recoveryNotes}
              onChange={(e) => setRecoveryNotes(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Discharge Condition *
              </label>
              <select
                value={dischargeCondition}
                onChange={(e) => setDischargeCondition(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              >
                <option value="Stable for Home Discharge">Stable for Home Discharge</option>
                <option value="Satisfactory - Needs Adult Supervision">Satisfactory - Needs Adult Supervision</option>
                <option value="Requires Prolonged Day Observation">Requires Prolonged Day Observation</option>
                <option value="Transferred to Inpatient Ward">Transferred to Inpatient Ward</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Follow-up Date *
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Home Medications & Wound Instructions
            </label>
            <textarea
              rows="2"
              value={homeMeds}
              onChange={(e) => setHomeMeds(e.target.value)}
              placeholder="Dosages, warning signs, dressing instructions..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Discharge Summary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
