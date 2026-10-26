import React, { useState } from 'react';
import {
  Siren,
  Search,
  Plus,
  Clock,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Filter,
  User,
  Bed,
  FileText,
  Ambulance,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { TRIAGE_LEVELS, ARRIVAL_MODES } from './emergencyConstants';

export function TriageDesk({
  triageList = [],
  bays = [],
  patients = [],
  doctors = [],
  loading = false,
  onCreateTriage,
  onNavigateSubtab,
  onSelectTriagePatient
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL');
  const [showNewTriageModal, setShowNewTriageModal] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);

  // Form state for New Triage Intake
  const [formData, setFormData] = useState({
    patient_id: '',
    custom_patient_name: '',
    custom_patient_uhid: '',
    triage_level: 2,
    arrival_mode: 'ambulance',
    chief_complaint: '',
    systolic_bp: 120,
    diastolic_bp: 80,
    pulse_rate: 88,
    respiratory_rate: 20,
    oxygen_saturation: 98,
    temperature_c: 37.0,
    pain_score: 5,
    gcs_score: 15,
    triaged_by: 'Staff Nurse on Duty'
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Rapid Chief Complaint pre-fills
  const COMMON_COMPLAINTS = [
    { label: 'Chest Pain / Acute Coronary Syndrome', level: 1, complaint: 'Acute retrosternal chest tightness radiating to jaw/left arm, sweating, shortness of breath' },
    { label: 'Severe Trauma / RTA', level: 2, complaint: 'High-speed motor vehicle collision; compound extremity injury, active bleeding, pelvic pain' },
    { label: 'Acute Severe Dyspnea', level: 2, complaint: 'Severe respiratory distress, wheezing, tachypneic > 30/min, accessory muscle use' },
    { label: 'Stroke / Code White', level: 1, complaint: 'Sudden onset facial asymmetry, arm drift, slurred speech within 2 hours' },
    { label: 'Acute Abdomen / Appendicitis', level: 3, complaint: 'Severe localized right lower quadrant pain, guarding, fever and nausea' },
    { label: 'Suspected Ingestion / Poisoning', level: 2, complaint: 'Suspected chemical/toxic pesticide ingestion; nausea, vomiting, hypersalivation' },
    { label: 'Scalp / Extremity Laceration', level: 4, complaint: 'Bleeding laceration following fall, conscious, oriented, neuro-intact' }
  ];

  // Filtered queue
  const filteredTriage = triageList.filter((item) => {
    const matchesSearch =
      (item.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.patient_uhid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.triage_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.chief_complaint || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      selectedLevelFilter === 'ALL' || String(item.triage_level) === String(selectedLevelFilter);

    const matchesMode =
      selectedModeFilter === 'ALL' || item.arrival_mode === selectedModeFilter;

    return matchesSearch && matchesLevel && matchesMode;
  });

  // Level counts
  const levelCounts = {
    all: triageList.length,
    l1: triageList.filter(t => t.triage_level === 1).length,
    l2: triageList.filter(t => t.triage_level === 2).length,
    l3: triageList.filter(t => t.triage_level === 3).length,
    l4: triageList.filter(t => t.triage_level === 4).length
  };

  const handleApplyComplaint = (c) => {
    setFormData(prev => ({
      ...prev,
      chief_complaint: c.complaint,
      triage_level: c.level
    }));
  };

  const handleSubmitTriage = async (e) => {
    e.preventDefault();
    if (!formData.chief_complaint) {
      alert('Please specify the chief complaint.');
      return;
    }

    try {
      setFormSubmitting(true);
      await onCreateTriage(formData);
      setShowNewTriageModal(false);
      // Reset form
      setFormData({
        patient_id: '',
        custom_patient_name: '',
        custom_patient_uhid: '',
        triage_level: 2,
        arrival_mode: 'ambulance',
        chief_complaint: '',
        systolic_bp: 120,
        diastolic_bp: 80,
        pulse_rate: 88,
        respiratory_rate: 20,
        oxygen_saturation: 98,
        temperature_c: 37.0,
        pain_score: 5,
        gcs_score: 15,
        triaged_by: 'Staff Nurse on Duty'
      });
    } catch (err) {
      alert('Error creating triage entry: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Triage Severity Summary Cards matching Finance VouchersDesk */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total in Triage */}
        <div
          onClick={() => setSelectedLevelFilter('ALL')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: selectedLevelFilter === 'ALL' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              All Active Cases
            </span>
            <span style={{ backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              ED Census
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {levelCounts.all}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Total emergency intake across all acuity tiers
          </span>
        </div>

        {/* Level 1 Resuscitation */}
        <div
          onClick={() => setSelectedLevelFilter('1')}
          style={{
            backgroundColor: selectedLevelFilter === '1' ? TRIAGE_LEVELS[1].bgColor : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedLevelFilter === '1' ? TRIAGE_LEVELS[1].borderColor : 'var(--color-border)'}`,
            borderLeft: `4px solid ${TRIAGE_LEVELS[1].badgeColor}`,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: TRIAGE_LEVELS[1].textColor, textTransform: 'uppercase' }}>
              Level 1: Resuscitation
            </span>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Immediate
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: TRIAGE_LEVELS[1].badgeColor }}>
            {levelCounts.l1}
          </div>
          <span style={{ fontSize: '0.74rem', color: TRIAGE_LEVELS[1].textColor }}>
            Target: 0 min • Cardiac arrest / severe shock
          </span>
        </div>

        {/* Level 2 Emergent */}
        <div
          onClick={() => setSelectedLevelFilter('2')}
          style={{
            backgroundColor: selectedLevelFilter === '2' ? TRIAGE_LEVELS[2].bgColor : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedLevelFilter === '2' ? TRIAGE_LEVELS[2].borderColor : 'var(--color-border)'}`,
            borderLeft: `4px solid ${TRIAGE_LEVELS[2].badgeColor}`,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: TRIAGE_LEVELS[2].textColor, textTransform: 'uppercase' }}>
              Level 2: Emergent
            </span>
            <span style={{ backgroundColor: '#FFEDD5', color: '#9A3412', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              &lt; 10 Mins
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: TRIAGE_LEVELS[2].badgeColor }}>
            {levelCounts.l2}
          </div>
          <span style={{ fontSize: '0.74rem', color: TRIAGE_LEVELS[2].textColor }}>
            Chest pain, STEMI, acute stroke, major trauma
          </span>
        </div>

        {/* Level 3 Urgent */}
        <div
          onClick={() => setSelectedLevelFilter('3')}
          style={{
            backgroundColor: selectedLevelFilter === '3' ? TRIAGE_LEVELS[3].bgColor : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedLevelFilter === '3' ? TRIAGE_LEVELS[3].borderColor : 'var(--color-border)'}`,
            borderLeft: `4px solid ${TRIAGE_LEVELS[3].badgeColor}`,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: TRIAGE_LEVELS[3].textColor, textTransform: 'uppercase' }}>
              Level 3: Urgent
            </span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              &lt; 30 Mins
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: TRIAGE_LEVELS[3].badgeColor }}>
            {levelCounts.l3}
          </div>
          <span style={{ fontSize: '0.74rem', color: TRIAGE_LEVELS[3].textColor }}>
            Acute abdomen, moderate dyspnea, fractures
          </span>
        </div>

        {/* Level 4 Semi-Urgent */}
        <div
          onClick={() => setSelectedLevelFilter('4')}
          style={{
            backgroundColor: selectedLevelFilter === '4' ? TRIAGE_LEVELS[4].bgColor : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: `1px solid ${selectedLevelFilter === '4' ? TRIAGE_LEVELS[4].borderColor : 'var(--color-border)'}`,
            borderLeft: `4px solid ${TRIAGE_LEVELS[4].badgeColor}`,
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: TRIAGE_LEVELS[4].textColor, textTransform: 'uppercase' }}>
              Level 4: Semi-Urgent
            </span>
            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              &lt; 60 Mins
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: TRIAGE_LEVELS[4].badgeColor }}>
            {levelCounts.l4}
          </div>
          <span style={{ fontSize: '0.74rem', color: TRIAGE_LEVELS[4].textColor }}>
            Lacerations, sprains, minor injuries, ambulatory
          </span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, New Triage Intake Button */}
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
              placeholder="Search by patient name, UHID, triage # or complaint..."
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

          {/* Mode Filter */}
          <select
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value)}
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
            <option value="ALL">All Arrival Modes</option>
            <option value="ambulance">Ambulance</option>
            <option value="walk_in">Walk-in</option>
            <option value="wheelchair">Wheelchair</option>
            <option value="police">Police Escort</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewTriageModal(true)}
          >
            New Triage Intake
          </Button>
        </div>
      </div>

      {/* Main Triage Queue Table */}
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
            <Siren size={16} color="var(--color-primary-teal)" />
            <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Live Triage Intake & Severity Queue
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600'
              }}
            >
              {filteredTriage.length} Enroute / Arrived
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
            Sorted by Acuity (Level 1 → 4) & Time of Arrival
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Triage #</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Patient & Demographics</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Acuity Level</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Chief Complaint</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Triage Vitals</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Assigned Bay</th>
                <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTriage.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No emergency triage records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredTriage.map((item) => {
                  const levelCfg = TRIAGE_LEVELS[item.triage_level] || TRIAGE_LEVELS[3];
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: item.triage_level === 1 ? '#FEF2F2' : item.triage_level === 2 ? '#FFFDF5' : '#FFFFFF',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      {/* Triage # & Arrival Mode */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                          {item.triage_number}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          {item.arrival_mode === 'ambulance' ? (
                            <span style={{ color: '#DC2626', fontWeight: '600' }}>🚑 Ambulance</span>
                          ) : item.arrival_mode === 'wheelchair' ? (
                            <span>♿ Wheelchair</span>
                          ) : (
                            <span>🚶 Walk-in</span>
                          )}
                        </div>
                        {item.is_mlc && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              padding: '1px 6px',
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              borderRadius: '4px'
                            }}
                          >
                            MLC CASE
                          </span>
                        )}
                      </td>

                      {/* Patient & Demographics */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                          {item.patient_name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.patient_uhid} • {item.patient_gender || 'M'}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          By: {item.triaged_by || 'ER Nurse'}
                        </div>
                      </td>

                      {/* Acuity Level Badge */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            backgroundColor: levelCfg.bgColor,
                            color: levelCfg.textColor,
                            border: `1px solid ${levelCfg.borderColor}`
                          }}
                        >
                          {levelCfg.shortName}
                        </span>
                        <div style={{ fontSize: '0.69rem', color: levelCfg.textColor, marginTop: '3px', fontWeight: '500' }}>
                          Target: {levelCfg.targetTime}
                        </div>
                      </td>

                      {/* Chief Complaint */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top', maxWidth: '280px' }}>
                        <div style={{ fontSize: '0.80rem', color: '#1E293B', lineHeight: '1.35', fontWeight: '500' }}>
                          {item.chief_complaint}
                        </div>
                      </td>

                      {/* Vitals Summary */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 10px', fontSize: '0.74rem' }}>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>BP: </span>
                            <span style={{ fontWeight: '600', color: (item.systolic_bp < 90 || item.systolic_bp > 160) ? '#DC2626' : 'var(--color-text-primary)' }}>
                              {item.systolic_bp}/{item.diastolic_bp}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>HR: </span>
                            <span style={{ fontWeight: '600', color: (item.pulse_rate > 100 || item.pulse_rate < 55) ? '#EA580C' : 'var(--color-text-primary)' }}>
                              {item.pulse_rate} bpm
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>SpO2: </span>
                            <span style={{ fontWeight: '600', color: item.oxygen_saturation < 94 ? '#DC2626' : '#16A34A' }}>
                              {item.oxygen_saturation}%
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>GCS: </span>
                            <span style={{ fontWeight: '600', color: item.gcs_score < 13 ? '#DC2626' : 'var(--color-text-primary)' }}>
                              {item.gcs_score}/15
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Pain: </span>
                            <span style={{ fontWeight: '600', color: item.pain_score >= 7 ? '#DC2626' : 'var(--color-text-primary)' }}>
                              {item.pain_score}/10
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Temp: </span>
                            <span style={{ fontWeight: '600', color: item.temperature_c > 38 ? '#DC2626' : 'var(--color-text-primary)' }}>
                              {item.temperature_c}°C
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Bay */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        {item.bay_number ? (
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                backgroundColor: item.bay_zone === 'RED' ? '#FEE2E2' : item.bay_zone === 'YELLOW' ? '#FEF3C7' : '#DCFCE7',
                                color: item.bay_zone === 'RED' ? '#991B1B' : item.bay_zone === 'YELLOW' ? '#92400E' : '#166534'
                              }}
                            >
                              <Bed size={12} />
                              {item.bay_number}
                            </span>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              Zone {item.bay_zone}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.70rem',
                                fontWeight: '600',
                                backgroundColor: '#F1F5F9',
                                color: '#64748B'
                              }}
                            >
                              Awaiting Bed
                            </span>
                            <div style={{ marginTop: '4px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectTriagePatient && onSelectTriagePatient(item);
                                  onNavigateSubtab && onNavigateSubtab('11.3');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: 'var(--color-primary-teal)',
                                  fontSize: '0.72rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                Allocate Bay →
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPatientForDetail(item)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-primary)',
                              cursor: 'pointer'
                            }}
                          >
                            Triage Sheet
                          </button>

                          {/* Quick shortcuts to other submodules */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTriagePatient && onSelectTriagePatient(item);
                              onNavigateSubtab && onNavigateSubtab('11.4');
                            }}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.70rem',
                              fontWeight: '600',
                              backgroundColor: 'var(--color-bg-pale-aqua)',
                              border: '1px solid #B8E4E1',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-primary-teal)',
                              cursor: 'pointer'
                            }}
                          >
                            Trauma Chart →
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectTriagePatient && onSelectTriagePatient(item);
                              onNavigateSubtab && onNavigateSubtab('11.5');
                            }}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.70rem',
                              fontWeight: '600',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              borderRadius: 'var(--radius-sm)',
                              color: '#1D4ED8',
                              cursor: 'pointer'
                            }}
                          >
                            Disposition →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Triage Intake */}
      {showNewTriageModal && (
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
            if (e.target === e.currentTarget) setShowNewTriageModal(false);
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
            {/* Modal Header */}
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
                <Siren size={18} color="var(--color-primary-teal)" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Rapid Emergency Triage Intake
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTriageModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTriage} style={{ padding: '18px' }}>
              {/* Patient Selection / Intake Mode */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select Registered Patient OR Enter Emergency Walk-in Name:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const pat = patients.find(p => String(p.id) === String(selId));
                      setFormData(prev => ({
                        ...prev,
                        patient_id: selId,
                        custom_patient_name: pat ? pat.full_name : '',
                        custom_patient_uhid: pat ? pat.uhid : ''
                      }));
                    }}
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="">-- Choose Existing Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.uhid})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or Type Name: e.g. Unknown Trauma Male"
                    value={formData.custom_patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_patient_name: e.target.value }))}
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </div>
              </div>

              {/* Arrival Mode & Triaged By */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Arrival Mode:
                  </label>
                  <select
                    value={formData.arrival_mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrival_mode: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {ARRIVAL_MODES.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Triaged By (Staff Nurse / Clinician):
                  </label>
                  <input
                    type="text"
                    value={formData.triaged_by}
                    onChange={(e) => setFormData(prev => ({ ...prev, triaged_by: e.target.value }))}
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

              {/* Rapid Complaint Pills */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Quick Complaint Pre-Sets:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_COMPLAINTS.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyComplaint(c)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        color: '#334155'
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chief Complaint Input */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Chief Presenting Complaint & Trauma Mechanism:
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
                  placeholder="Describe acute symptoms, duration, precipitating factors, mechanism of injury..."
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

              {/* Triage Level Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  Assigned Triage Acuity Level (ESI / Manchester):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[1, 2, 3, 4].map((lvl) => {
                    const cfg = TRIAGE_LEVELS[lvl];
                    const isSelected = formData.triage_level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, triage_level: lvl }))}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? `2px solid ${cfg.badgeColor}` : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? cfg.bgColor : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '0.80rem', color: cfg.badgeColor }}>
                          Level {lvl}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: cfg.textColor, marginTop: '2px' }}>
                          {cfg.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Triage Vital Signs Grid */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>
                  Triage Vitals & Consciousness Level:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={formData.systolic_bp}
                      onChange={(e) => setFormData(prev => ({ ...prev, systolic_bp: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={formData.diastolic_bp}
                      onChange={(e) => setFormData(prev => ({ ...prev, diastolic_bp: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Pulse / HR (bpm)</label>
                    <input
                      type="number"
                      value={formData.pulse_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, pulse_rate: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Resp Rate (/min)</label>
                    <input
                      type="number"
                      value={formData.respiratory_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, respiratory_rate: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>SpO2 (%)</label>
                    <input
                      type="number"
                      value={formData.oxygen_saturation}
                      onChange={(e) => setFormData(prev => ({ ...prev, oxygen_saturation: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature_c}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature_c: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>Pain (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.pain_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, pain_score: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.70rem', color: '#64748B' }}>GCS Score (3-15)</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={formData.gcs_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, gcs_score: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '5px', fontSize: '0.80rem', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewTriageModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={formSubmitting}
                >
                  Confirm Triage Intake
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal: Full Triage Sheet */}
      {selectedPatientForDetail && (
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
            if (e.target === e.currentTarget) setSelectedPatientForDetail(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '560px',
              padding: '20px',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                  Triage Record: {selectedPatientForDetail.triage_number}
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                  {selectedPatientForDetail.patient_name} ({selectedPatientForDetail.patient_uhid})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientForDetail(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', fontSize: '0.82rem', lineHeight: '1.6' }}>
              <div><strong>Triage Level:</strong> Level {selectedPatientForDetail.triage_level} ({TRIAGE_LEVELS[selectedPatientForDetail.triage_level]?.name})</div>
              <div><strong>Arrival Mode:</strong> {selectedPatientForDetail.arrival_mode}</div>
              <div><strong>Chief Complaint:</strong> {selectedPatientForDetail.chief_complaint}</div>
              <div><strong>Assigned Bay:</strong> {selectedPatientForDetail.bay_number || 'Awaiting Bed Allocation'}</div>
              <div><strong>Triaged By:</strong> {selectedPatientForDetail.triaged_by}</div>
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                <strong>Vitals Recorded:</strong>
                <div>BP: {selectedPatientForDetail.systolic_bp}/{selectedPatientForDetail.diastolic_bp} mmHg • HR: {selectedPatientForDetail.pulse_rate} bpm</div>
                <div>RR: {selectedPatientForDetail.respiratory_rate}/min • SpO2: {selectedPatientForDetail.oxygen_saturation}% • Temp: {selectedPatientForDetail.temperature_c}°C</div>
                <div>GCS: {selectedPatientForDetail.gcs_score}/15 • Pain Score: {selectedPatientForDetail.pain_score}/10</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatientForDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
