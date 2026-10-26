import React, { useState } from 'react';
import {
  ArrowRightCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  AlertTriangle,
  User,
  Bed,
  Ambulance,
  Printer,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { DISPOSITION_DESTINATIONS, TRIAGE_LEVELS } from './emergencyConstants';

export function RapidDispositionDesk({
  dispositions = [],
  triageList = [],
  doctors = [],
  activeTriagePatient = null,
  loading = false,
  onCreateDisposition
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDispositionModal, setShowDispositionModal] = useState(false);
  const [selectedTriageId, setSelectedTriageId] = useState(activeTriagePatient?.id || (triageList[0]?.id || ''));
  const [selectedDispForHandover, setSelectedDispForHandover] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    disposition_type: 'Inpatient Ward (General / Step-Down / Private)',
    target_unit: 'Step-Down Ward 302',
    clinician_id: 'doc-01',
    handover_summary: 'ISBAR Handover: Patient stabilized in ED, acute symptoms resolving. Vitals normal on room air. Primary consultant notified.',
    follow_up_instructions: 'Continue IV hydration and analgesics. Monitor vitals Q4H. Repeat hemogram tomorrow morning.'
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Patients who are still in ED without disposition
  const pendingDispositionPatients = triageList.filter(t => !t.disposition_type);

  // Filtered dispositions
  const filteredDispositions = dispositions.filter((item) => {
    const matchesSearch =
      (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.patient_uhid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.disposition_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.target_unit || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.handover_summary || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleOpenModal = (triageItem = null) => {
    if (triageItem) {
      setSelectedTriageId(triageItem.id);
    } else {
      setSelectedTriageId(pendingDispositionPatients[0]?.id || triageList[0]?.id || '');
    }
    setShowDispositionModal(true);
  };

  const handleSubmitDisposition = async (e) => {
    e.preventDefault();
    if (!selectedTriageId) {
      alert('Please select a triage patient for disposition.');
      return;
    }
    if (!formData.handover_summary) {
      alert('Please record the clinical handover summary.');
      return;
    }

    try {
      setFormSubmitting(true);
      await onCreateDisposition(selectedTriageId, formData);
      setShowDispositionModal(false);
    } catch (err) {
      alert('Failed to record rapid disposition: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Disposition KPI Status Cards matching Finance VouchersDesk */}
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Completed Transfers
            </span>
            <span style={{ backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Dispositions
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {dispositions.length} Transferred
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: '600' }}>
            ✓ Acute ED bays released automatically on transfer
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: pendingDispositionPatients.length > 0 ? '#EA580C' : 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Pending In ED
            </span>
            <span style={{ backgroundColor: pendingDispositionPatients.length > 0 ? '#FFEDD5' : '#F1F5F9', color: pendingDispositionPatients.length > 0 ? '#9A3412' : '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Awaiting Sign-off
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: pendingDispositionPatients.length > 0 ? '#EA580C' : 'var(--color-text-primary)' }}>
            {pendingDispositionPatients.length} Patients
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Stabilized cases requiring unit transfer or discharge
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
              Critical / ICU Transfers
            </span>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              High Acuity
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#DC2626' }}>
            {dispositions.filter(d => String(d.disposition_type || '').includes('ICU') || String(d.disposition_type || '').includes('Cath')).length} Cases
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Expedited handover to Cath Lab, ICU, or Emergency OT
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' }}>
              Safe Discharges Home
            </span>
            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Discharged
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#16A34A' }}>
            {dispositions.filter(d => String(d.disposition_type || '').includes('Discharge')).length} Discharged
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Prescriptions, follow-up advice & discharge summary issued
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
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
            placeholder="Search disposition logs by patient, target unit, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              fontSize: '0.82rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              backgroundColor: '#FAFAFA'
            }}
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => handleOpenModal()}
        >
          Record Rapid Disposition
        </Button>
      </div>

      {/* Active ED Patients Awaiting Final Disposition Callout Card */}
      {pendingDispositionPatients.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FED7AA',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '10px 16px', backgroundColor: '#FFF7ED', borderBottom: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', color: '#9A3412' }}>
              <Clock size={16} />
              <span>Patients in ED Awaiting Disposition Decision ({pendingDispositionPatients.length})</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#C2410C' }}>
              Action Required: Determine ICU / OT / Inpatient / Discharge pathway
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase' }}>Triage #</th>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase' }}>Patient Name</th>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase' }}>Acuity</th>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase' }}>Current Bay</th>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase' }}>Chief Complaint</th>
                  <th style={{ padding: '8px 14px', fontSize: '0.70rem', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Disposition Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDispositionPatients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.78rem' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{p.triage_number}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{p.patient_name} <span style={{ color: '#64748B', fontWeight: '400' }}>({p.patient_uhid})</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: '700', color: TRIAGE_LEVELS[p.triage_level]?.badgeColor }}>
                        Level {p.triage_level}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 6px', backgroundColor: '#F1F5F9', borderRadius: '4px', fontWeight: '600' }}>
                        {p.bay_number || 'Awaiting Bed'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '300px', color: '#475569' }}>{p.chief_complaint}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenModal(p)}
                      >
                        Decide Disposition →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Disposition Records Table */}
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
            <ArrowRightCircle size={16} color="var(--color-primary-teal)" />
            <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Completed Emergency Disposition & Transfer Register
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
              {filteredDispositions.length} Transferred / Discharged
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
            Clinical ISBAR Handover Validated
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Patient Details</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Disposition Pathway</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Target Unit</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>ISBAR Handover Summary</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispositions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No disposition records found.
                  </td>
                </tr>
              ) : (
                filteredDispositions.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                      {String(item.disposition_time || '').slice(0, 16).replace('T', ' ')}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                        {item.patient_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {item.patient_uhid} • {item.triage_number}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: String(item.disposition_type).includes('ICU') || String(item.disposition_type).includes('Cath')
                            ? '#FEE2E2'
                            : String(item.disposition_type).includes('Discharge')
                            ? '#DCFCE7'
                            : '#EFF6FF',
                          color: String(item.disposition_type).includes('ICU') || String(item.disposition_type).includes('Cath')
                            ? '#991B1B'
                            : String(item.disposition_type).includes('Discharge')
                            ? '#166534'
                            : '#1E40AF'
                        }}
                      >
                        {item.disposition_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontWeight: '600', fontSize: '0.80rem' }}>
                      {item.target_unit || 'Designated Ward'}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', fontSize: '0.78rem', color: '#334155', maxWidth: '320px', lineHeight: '1.4' }}>
                      {item.handover_summary}
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Clinician: {item.clinician_name || 'Dr. on Duty'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.70rem',
                          fontWeight: '700',
                          backgroundColor: '#DCFCE7',
                          color: '#166534'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Bay Released
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDispForHandover(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary-teal)',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={13} />
                        Handover Note
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Rapid Disposition */}
      {showDispositionModal && (
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
            if (e.target === e.currentTarget) setShowDispositionModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '640px',
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
                backgroundColor: 'var(--color-bg-pale-aqua)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightCircle size={18} color="var(--color-primary-teal)" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Record Emergency Disposition & Auto-Vacate Bay
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDispositionModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDisposition} style={{ padding: '18px' }}>
              {/* Select Patient */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select Emergency Patient:
                </label>
                <select
                  required
                  value={selectedTriageId}
                  onChange={(e) => setSelectedTriageId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <option value="">-- Choose Patient / Triage Encounter --</option>
                  {(pendingDispositionPatients.length > 0 ? pendingDispositionPatients : triageList).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.patient_name} ({t.patient_uhid}) — Triage #{t.triage_number} [Bay: {t.bay_number || 'Unallocated'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Pathway */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Disposition Destination Pathway:
                </label>
                <select
                  value={formData.disposition_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, disposition_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {DISPOSITION_DESTINATIONS.map(d => (
                    <option key={d.id} value={d.label}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Ward & Clinician */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Target Specific Unit / Room:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.target_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_unit: e.target.value }))}
                    placeholder="e.g. MICU Bed 4 / OT 2 / Home"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Authorizing Clinician:
                  </label>
                  <select
                    value={formData.clinician_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinician_id: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty || 'Emergency'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Handover Summary (ISBAR) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Clinical ISBAR Handover Summary:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.handover_summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, handover_summary: e.target.value }))}
                  placeholder="Record Identity, Situation, Background, Assessment, Recommendation for receiving team..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.80rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Follow-up / Discharge Instructions */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Follow-up Instructions / Discharge Medications:
                </label>
                <input
                  type="text"
                  value={formData.follow_up_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, follow_up_instructions: e.target.value }))}
                  placeholder="Prescriptions, warning signs, OPD review date..."
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '0.80rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: '4px', border: '1px solid #BBF7D0', marginBottom: '16px', fontSize: '0.74rem', color: '#166534' }}>
                ✓ Confirming disposition will automatically release the assigned emergency bay and make it available for the next patient.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowDispositionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={formSubmitting}
                >
                  Confirm Disposition & Release Bay
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Note Detail Modal */}
      {selectedDispForHandover && (
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
            if (e.target === e.currentTarget) setSelectedDispForHandover(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '560px',
              padding: '20px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--color-primary-teal)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                  Clinical ISBAR Handover Note
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispForHandover(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', fontSize: '0.82rem', lineHeight: '1.7' }}>
              <div><strong>Patient:</strong> {selectedDispForHandover.patient_name} ({selectedDispForHandover.patient_uhid})</div>
              <div><strong>Transfer Destination:</strong> {selectedDispForHandover.disposition_type} → {selectedDispForHandover.target_unit}</div>
              <div><strong>Transfer Timestamp:</strong> {String(selectedDispForHandover.disposition_time).slice(0, 16).replace('T', ' ')}</div>
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <strong>ISBAR Summary:</strong>
                <div>{selectedDispForHandover.handover_summary}</div>
              </div>
              {selectedDispForHandover.follow_up_instructions && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Instructions / Medications:</strong> {selectedDispForHandover.follow_up_instructions}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedDispForHandover(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Handover Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
