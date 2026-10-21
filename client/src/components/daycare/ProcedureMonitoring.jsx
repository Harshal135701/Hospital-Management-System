import React, { useState, useMemo } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  FileText,
  ShieldCheck,
  Syringe
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { formatDateTimeIN } from '../../utils/formatters';

export function ProcedureMonitoring({
  admissions,
  selectedAdmission,
  onSelectAdmission,
  onAddMonitoringLog
}) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Vitals form
  const [pulse, setPulse] = useState('78');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [spo2, setSpo2] = useState('99');
  const [respRate, setRespRate] = useState('16');
  const [temp, setTemp] = useState('36.7');
  const [anesthesiaType, setAnesthesiaType] = useState('Local / Topical');
  const [sedationScore, setSedationScore] = useState('Awake & Oriented (RASS 0)');
  const [surgicalChecklist, setSurgicalChecklist] = useState(true);
  const [adverseEvents, setAdverseEvents] = useState('None');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Active admissions eligible for monitoring
  const activeAdmissions = useMemo(() => {
    return admissions.filter(a => ['admitted', 'in_procedure', 'recovering'].includes(a.status));
  }, [admissions]);

  // Current active episode to monitor
  const activeEpisode = selectedAdmission || activeAdmissions[0] || admissions[0] || null;

  const monitoringLogs = useMemo(() => {
    if (!activeEpisode) return [];
    return activeEpisode.monitoring_records || [];
  }, [activeEpisode]);

  const latestVitals = monitoringLogs.length > 0 ? monitoringLogs[monitoringLogs.length - 1] : null;

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!activeEpisode) return;

    const logEntry = {
      id: `mon-${Date.now()}`,
      monitored_at: new Date().toISOString(),
      pulse_rate: Number(pulse),
      systolic_bp: Number(systolic),
      diastolic_bp: Number(diastolic),
      oxygen_saturation: Number(spo2),
      respiratory_rate: Number(respRate),
      temperature: temp,
      anesthesia_type: anesthesiaType,
      sedation_score: sedationScore,
      surgical_checklist_signed: Boolean(surgicalChecklist),
      adverse_events: adverseEvents || 'None',
      notes: clinicalNotes
    };

    onAddMonitoringLog(activeEpisode.id, logEntry);
    setIsLogModalOpen(false);
    setClinicalNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Patient Episode Selector Header */}
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
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Monitoring Active Episode
            </div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
              {activeEpisode ? `${activeEpisode.patient_name} (${activeEpisode.patient_uhid})` : 'No Patient Selected'}
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
            {activeAdmissions.map(adm => (
              <option key={adm.id} value={adm.id}>
                {adm.patient_name} - {adm.procedure_name} ({adm.status})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            icon={Plus}
            disabled={!activeEpisode}
            onClick={() => setIsLogModalOpen(true)}
          >
            Record Vitals & Recovery
          </Button>
        </div>
      </div>

      {activeEpisode && (
        <>
          {/* Episode Context & Live Vitals Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* Heart Rate / Pulse */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: '500' }}>
                <span>Pulse Rate</span>
                <Heart size={14} style={{ color: 'var(--color-error)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {latestVitals ? latestVitals.pulse_rate : '--'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>bpm</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '4px' }}>
                {latestVitals?.pulse_rate >= 60 && latestVitals?.pulse_rate <= 100 ? 'Normal sinus rhythm' : 'Awaiting baseline'}
              </div>
            </div>

            {/* Blood Pressure */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: '500' }}>
                <span>Blood Pressure</span>
                <Activity size={14} style={{ color: 'var(--color-primary-teal)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {latestVitals ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : '--/--'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>mmHg</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Target: &lt;140/90 mmHg
              </div>
            </div>

            {/* SpO2 */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: '500' }}>
                <span>Oxygen Saturation</span>
                <Wind size={14} style={{ color: 'var(--color-primary-teal)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: '700', color: latestVitals?.oxygen_saturation < 95 ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                  {latestVitals ? `${latestVitals.oxygen_saturation}%` : '--'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>SpO2</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: latestVitals?.oxygen_saturation >= 95 ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '4px' }}>
                {latestVitals?.oxygen_saturation >= 95 ? 'Adequate room air' : 'Supplementary O2 required'}
              </div>
            </div>

            {/* Temperature & Respiratory */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: '500' }}>
                <span>Temp & Resp</span>
                <Thermometer size={14} style={{ color: 'var(--color-warning)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {latestVitals ? `${latestVitals.temperature}°C` : '--'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  • {latestVitals ? `${latestVitals.respiratory_rate} rpm` : '--'}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Sedation: {latestVitals?.sedation_score || 'Resting'}
              </div>
            </div>
          </div>

          {/* Procedure & Anesthesia Clinical Context Box */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {activeEpisode.procedure_name}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Consultant: <strong>{activeEpisode.doctor_name}</strong> • Station: <strong>{activeEpisode.chair_name || 'Unallocated'}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="teal">WHO Checklist: Signed</Badge>
              <Badge variant="info">Anesthesia: {latestVitals?.anesthesia_type || 'Local / Sedation'}</Badge>
            </div>
          </div>

          {/* Historical Monitoring Logs Table */}
          <Card
            title={`Clinical Observation & Recovery Log (${monitoringLogs.length} entries)`}
            subtitle="Sequential vital sign charting, sedation status, and post-procedure recovery remarks."
          >
            {monitoringLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
                <Activity size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div style={{ fontWeight: '500', fontSize: '0.88rem' }}>No monitoring entries recorded yet for this episode.</div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Click "Record Vitals & Recovery" to add baseline measurements.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Time</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Pulse</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Blood Pressure</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>SpO2</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Temp / Resp</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Sedation & Recovery</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Clinical Notes / Interventions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitoringLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--color-primary-teal)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {formatDateTimeIN(log.monitored_at)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                          {log.pulse_rate} bpm
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                          {log.systolic_bp}/{log.diastolic_bp} mmHg
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: log.oxygen_saturation < 95 ? 'var(--color-error)' : 'inherit' }}>
                          {log.oxygen_saturation}%
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {log.temperature}°C • {log.respiratory_rate} rpm
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                            {log.sedation_score}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          <div>{log.notes || 'Routine vitals stable.'}</div>
                          {log.adverse_events && log.adverse_events !== 'None' && (
                            <div style={{ color: 'var(--color-error)', fontWeight: '500', fontSize: '0.74rem', marginTop: '2px' }}>
                              ⚠ Adverse: {log.adverse_events}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Record Vitals Entry Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Record Clinical Monitoring Entry — ${activeEpisode?.patient_name || ''}`}
        subtitle="Log vital signs, anesthesia recovery stage, and medication administration."
        maxWidth="600px"
      >
        <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Vitals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Pulse (bpm) *
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                required
                min="30"
                max="240"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Systolic BP (mmHg) *
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                required
                min="50"
                max="260"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Diastolic BP (mmHg) *
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                required
                min="30"
                max="160"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                SpO2 (%) *
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                required
                min="50"
                max="100"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Respiratory (rpm)
              </label>
              <input
                type="number"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
                min="8"
                max="60"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Temp (°C)
              </label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="36.7"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Anesthesia & Sedation Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Anesthesia Regimen
              </label>
              <select
                value={anesthesiaType}
                onChange={(e) => setAnesthesiaType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              >
                <option value="Local / Topical">Local / Topical</option>
                <option value="Sedation / Monitored Anesthesia Care">Sedation / MAC</option>
                <option value="Peribulbar / Regional Block">Regional / Nerve Block</option>
                <option value="General Anesthesia (LMA)">General Anesthesia (LMA)</option>
                <option value="None / Not Required">None / Not Required</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Sedation / Recovery Stage
              </label>
              <select
                value={sedationScore}
                onChange={(e) => setSedationScore(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              >
                <option value="Awake & Oriented (RASS 0)">Awake & Oriented (RASS 0)</option>
                <option value="Lightly Sedated, Eyes Open to Voice (RASS -1)">Lightly Sedated (RASS -1)</option>
                <option value="Moderate Sedation, Opens Eyes to Touch (RASS -2)">Moderate Sedation (RASS -2)</option>
                <option value="Deep Sedation (RASS -3)">Deep Sedation (RASS -3)</option>
                <option value="Fully Ambulatory">Fully Ambulatory / Ready for Discharge</option>
              </select>
            </div>
          </div>

          {/* Checklist & Adverse Events */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
              <input
                type="checkbox"
                id="whoChecklist"
                checked={surgicalChecklist}
                onChange={(e) => setSurgicalChecklist(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="whoChecklist" style={{ fontSize: '0.82rem', fontWeight: '500', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                WHO Surgical Safety Checklist verified
              </label>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Adverse Reaction / Complication
              </label>
              <input
                type="text"
                value={adverseEvents}
                onChange={(e) => setAdverseEvents(e.target.value)}
                placeholder="None reported"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Observation & Infusion Notes
            </label>
            <textarea
              rows="3"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record IV fluids infused, wound dressing status, pain management..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Observation Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
