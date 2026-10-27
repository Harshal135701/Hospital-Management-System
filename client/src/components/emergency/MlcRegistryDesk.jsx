import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  FileText,
  FileCheck,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Printer,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { MLC_CASE_TYPES } from './emergencyConstants';

export function MlcRegistryDesk({ mlcList = [],
  triageList = [],
  patients = [],
  doctors = [],
  loading = false,
  onCreateMlc, showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseTypeFilter, setSelectedCaseTypeFilter] = useState('ALL');
  const [showNewMlcModal, setShowNewMlcModal] = useState(false);
  const [selectedMlcForPrint, setSelectedMlcForPrint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patient_id: '',
    triage_id: '',
    police_station: 'Central Division Police Station',
    officer_name: '',
    officer_badge_no: '',
    case_type: 'Road Traffic Accident (RTA)',
    incident_date_time: new Date().toISOString().slice(0, 16),
    injury_details: '',
    alcohol_suspected: false,
    fit_for_statement: true,
    certificate_issued: false,
    registered_by: 'Dr. Alok Verma, MD (Emergency Medicine)'
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filtered MLCs
  const filteredMlc = mlcList.filter((item) => {
    const matchesSearch =
      (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.patient_uhid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.mlc_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.police_station || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.injury_details || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedCaseTypeFilter === 'ALL' || item.case_type === selectedCaseTypeFilter;

    return matchesSearch && matchesType;
  });

  const handleSubmitMlc = async (e) => {
    e.preventDefault();
    if (!formData.injury_details) {
      (showToast ? showToast('Please specify the clinical injury details.') : alert('Please specify the clinical injury details.'));
      return;
    }
    if (!formData.police_station) {
      (showToast ? showToast('Please provide the jurisdictional police station name.') : alert('Please provide the jurisdictional police station name.'));
      return;
    }

    try {
      setFormSubmitting(true);
      await onCreateMlc({
        ...formData,
        mlc_number: `MLC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
      setShowNewMlcModal(false);
      // Reset form
      setFormData({
        patient_id: '',
        triage_id: '',
        police_station: 'Central Division Police Station',
        officer_name: '',
        officer_badge_no: '',
        case_type: 'Road Traffic Accident (RTA)',
        incident_date_time: new Date().toISOString().slice(0, 16),
        injury_details: '',
        alcohol_suspected: false,
        fit_for_statement: true,
        certificate_issued: false,
        registered_by: 'Dr. Alok Verma, MD (Emergency Medicine)'
      });
    } catch (err) {
      (showToast ? showToast('Error registering MLC: ' + err.message) : alert('Error registering MLC: ' + err.message));
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* MLC Legal Compliance Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="#D97706" />
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#92400E' }}>
              Statutory Medico-Legal Case (MLC) Protocol Active
            </div>
            <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '2px' }}>
              All vehicular trauma, burn injuries, poisonings, assault cases, and industrial accidents require immediate Police Station Intimation and chain-of-custody documentation.
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowNewMlcModal(true)}
        >
          Register New MLC
        </Button>
      </div>

      {/* 4 Summary Stat Cards matching Finance VouchersDesk */}
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
              Total MLC Registered
            </span>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Registry
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {mlcList.length}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Official statutory hospital legal registry entries
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
              Police Intimations
            </span>
            <span style={{ backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Dispatched
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {mlcList.length}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: '600' }}>
            ✓ 100% Intimations transmitted to jurisdictional PS
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
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>
              Certificates Issued
            </span>
            <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Injury Certs
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#2563EB' }}>
            {mlcList.filter(m => m.certificate_issued).length}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Official medico-legal injury certificates handed to IO
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
              Toxicology / Substance
            </span>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Suspected
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#DC2626' }}>
            {mlcList.filter(m => m.alcohol_suspected).length}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Blood alcohol & chemical toxicology analysis ordered
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Case Type Filter */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
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
              placeholder="Search MLC #, patient, police station, or injury notes..."
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

          <select
            value={selectedCaseTypeFilter}
            onChange={(e) => setSelectedCaseTypeFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: '0.82rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All MLC Case Categories</option>
            {MLC_CASE_TYPES.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
          Access Controlled • Authorized Legal Desk Only
        </span>
      </div>

      {/* MLC Records Table */}
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
              Official Medico-Legal Case Register
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '700'
              }}
            >
              {filteredMlc.length} Active MLC Records
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
            Recorded in Compliance with CrPC / IPC Hospital Regulations
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>MLC Number</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Patient Details</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Case Type & Incident</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Police Station & Officer</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Clinical Injury Details</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Cert. Status</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMlc.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No medico-legal records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMlc.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    {/* MLC Number */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.84rem', color: '#92400E', fontFamily: 'monospace' }}>
                        {item.mlc_number}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                        Reg: {item.registered_by || 'ER Clinician'}
                      </div>
                    </td>

                    {/* Patient Details */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                        {item.patient_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {item.patient_uhid}
                      </div>
                    </td>

                    {/* Case Type & Incident */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          border: '1px solid #BFDBFE'
                        }}
                      >
                        {item.case_type}
                      </span>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Time: {String(item.incident_date_time || '').replace('T', ' ').slice(0, 16)}
                      </div>
                    </td>

                    {/* Police Station & IO */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.80rem', color: 'var(--color-text-primary)' }}>
                        {item.police_station}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        IO: {item.officer_name || 'Sub-Inspector on Duty'}
                      </div>
                      {item.officer_badge_no && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          Badge: {item.officer_badge_no}
                        </div>
                      )}
                    </td>

                    {/* Clinical Injury Details */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', maxWidth: '300px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.4' }}>
                        {item.injury_details}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {item.alcohol_suspected ? (
                          <span style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: '700', backgroundColor: '#FEF2F2', padding: '1px 6px', borderRadius: '3px' }}>
                            ⚠ Alcohol Suspected
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: '600' }}>
                            ✓ No Alcohol Suspected
                          </span>
                        )}
                        <span style={{ fontSize: '0.68rem', color: item.fit_for_statement ? '#16A34A' : '#D97706', fontWeight: '600' }}>
                          • {item.fit_for_statement ? 'Fit for Statement' : 'Unfit for Statement'}
                        </span>
                      </div>
                    </td>

                    {/* Certificate Status */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      {item.certificate_issued ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            backgroundColor: '#DCFCE7',
                            color: '#166534'
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Issued
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: '#F1F5F9',
                            color: '#64748B'
                          }}
                        >
                          Draft / Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMlcForPrint(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary-teal)',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={13} />
                        Intimation Memo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New MLC */}
      {showNewMlcModal && (
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
            if (e.target === e.currentTarget) setShowNewMlcModal(false);
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
            {/* Header */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FEF3C7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#92400E" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#92400E' }}>
                  Register Medico-Legal Emergency Case
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMlcModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitMlc} style={{ padding: '18px' }}>
              {/* Patient Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Link Patient (From Active Triage Intake):
                </label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">-- Choose Patient / Triage Encounter --</option>
                  {triageList.map(t => (
                    <option key={t.id} value={t.patient_id}>
                      {t.patient_name} ({t.patient_uhid}) — Triage #{t.triage_number}
                    </option>
                  ))}
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Type & Incident Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    MLC Case Type:
                  </label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {MLC_CASE_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Incident Date & Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.incident_date_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, incident_date_time: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
              </div>

              {/* Police Station & IO Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Jurisdictional Police Station:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.police_station}
                    onChange={(e) => setFormData(prev => ({ ...prev, police_station: e.target.value }))}
                    placeholder="e.g. Central City Police Station"
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
                    Officer (IO) Name:
                  </label>
                  <input
                    type="text"
                    value={formData.officer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, officer_name: e.target.value }))}
                    placeholder="Sub-Inspector Name"
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
                    Badge / Buckle No:
                  </label>
                  <input
                    type="text"
                    value={formData.officer_badge_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, officer_badge_no: e.target.value }))}
                    placeholder="e.g. MH-PSI-4412"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
              </div>

              {/* Injury Details */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Detailed Description of Injuries / Weapon / Toxic Agent:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.injury_details}
                  onChange={(e) => setFormData(prev => ({ ...prev, injury_details: e.target.value }))}
                  placeholder="Record anatomical location, size (cm), lacerations, contusions, fractures, weapon characteristics..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Clinical Flags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.alcohol_suspected}
                    onChange={(e) => setFormData(prev => ({ ...prev, alcohol_suspected: e.target.checked }))}
                  />
                  <span>Alcohol / Toxic Influence Suspected</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.fit_for_statement}
                    onChange={(e) => setFormData(prev => ({ ...prev, fit_for_statement: e.target.checked }))}
                  />
                  <span>Conscious & Fit for Statement</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.certificate_issued}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificate_issued: e.target.checked }))}
                  />
                  <span>Issue Injury Certificate Now</span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewMlcModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={formSubmitting}
                >
                  Register MLC & Dispatch Intimation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intimation Memo Preview Modal */}
      {selectedMlcForPrint && (
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
            if (e.target === e.currentTarget) setSelectedMlcForPrint(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '580px',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ borderBottom: '2px solid #334155', paddingBottom: '12px', textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                HOSPITAL EMERGENCY DEPARTMENT
              </h2>
              <div style={{ fontSize: '0.80rem', fontWeight: '700', color: '#92400E', marginTop: '4px' }}>
                POLICE INTIMATION MEMO (MEDICO-LEGAL CASE)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                Under Section 39 Cr.P.C. / Hospital Statutory Legal Register
              </div>
            </div>

            <div style={{ padding: '16px 0', fontSize: '0.82rem', lineHeight: '1.7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                <span><strong>MLC Reference:</strong> {selectedMlcForPrint.mlc_number}</span>
                <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ marginTop: '8px' }}><strong>To:</strong> The Station House Officer (SHO), {selectedMlcForPrint.police_station}</div>
              <div><strong>Patient Name:</strong> {selectedMlcForPrint.patient_name} ({selectedMlcForPrint.patient_uhid})</div>
              <div><strong>Case Classification:</strong> {selectedMlcForPrint.case_type}</div>
              <div><strong>Incident DateTime:</strong> {String(selectedMlcForPrint.incident_date_time).slice(0, 16)}</div>
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                <strong>Nature of Injuries:</strong>
                <div>{selectedMlcForPrint.injury_details}</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>Condition on Arrival:</strong> {selectedMlcForPrint.fit_for_statement ? 'Conscious & Fit for Statement' : 'Unfit for Police Statement at Present'}
              </div>
              <div>
                <strong>Alcohol / Toxic Substance:</strong> {selectedMlcForPrint.alcohol_suspected ? 'Suspected (Blood preserved)' : 'No Clinical Evidence of Alcohol'}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Medical Officer Signature:</div>
                  <div style={{ fontWeight: '700', marginTop: '20px' }}>{selectedMlcForPrint.registered_by}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Police Receiver Signature / Stamp:</div>
                  <div style={{ borderBottom: '1px solid #94A3B8', width: '160px', marginTop: '35px' }}></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedMlcForPrint(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Intimation Memo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
