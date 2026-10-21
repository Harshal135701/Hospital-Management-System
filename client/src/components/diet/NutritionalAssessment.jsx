import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Scale,
  Activity,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  Search,
  Droplet,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { ALLERGY_OPTIONS } from './dietDemoData';
import { formatDateTimeIN } from '../../utils/formatters';

export function NutritionalAssessment({
  assessments,
  patients,
  onSaveAssessment
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [swallowingRisk, setSwallowingRisk] = useState('Normal');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [targetCalories, setTargetCalories] = useState('1800');
  const [targetProtein, setTargetProtein] = useState('75');
  const [targetFluid, setTargetFluid] = useState('2000');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Auto calculate BMI
  const calculatedBmi = useMemo(() => {
    const h = Number(heightCm) / 100;
    const w = Number(weightKg);
    if (h > 0 && w > 0) {
      return Number((w / (h * h)).toFixed(1));
    }
    return 0;
  }, [heightCm, weightKg]);

  const bmiCategory = useMemo(() => {
    if (calculatedBmi === 0) return 'Unknown';
    if (calculatedBmi < 18.5) return 'Underweight';
    if (calculatedBmi < 25) return 'Normal weight';
    if (calculatedBmi < 30) return 'Overweight';
    return 'Obese';
  }, [calculatedBmi]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return patients.filter(p =>
      (p.full_name || p.name || '').toLowerCase().includes(q) ||
      (p.uhid || '').toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      const q = searchTerm.toLowerCase();
      return (
        (a.patient_name || '').toLowerCase().includes(q) ||
        (a.patient_uhid || '').toLowerCase().includes(q) ||
        (a.clinical_notes || '').toLowerCase().includes(q)
      );
    });
  }, [assessments, searchTerm]);

  const handleOpenModal = () => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
    setIsModalOpen(true);
  };

  const handleToggleAllergy = (allergy) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId)) || {
      id: selectedPatientId,
      full_name: 'Patient ' + selectedPatientId,
      uhid: 'UHID-2026-0999',
      gender: 'Unspecified',
      age: 40
    };

    const newAssessment = {
      id: `ass-${Date.now()}`,
      patient_id: patientObj.id,
      patient_name: patientObj.full_name || patientObj.name,
      patient_uhid: patientObj.uhid,
      patient_age: patientObj.age || 45,
      patient_gender: patientObj.gender || 'Not specified',
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      bmi: calculatedBmi,
      bmi_category: bmiCategory,
      swallowing_risk: swallowingRisk,
      allergies: selectedAllergies.length > 0 ? selectedAllergies : ['None reported'],
      daily_calories_target: Number(targetCalories),
      daily_protein_target_g: Number(targetProtein),
      daily_fluid_target_ml: Number(targetFluid),
      clinical_notes: clinicalNotes,
      assessed_by: 'Dietitian Clinical Team',
      assessed_at: new Date().toISOString()
    };

    onSaveAssessment(newAssessment);
    setIsModalOpen(false);
    setClinicalNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search nutritional assessments by patient, UHID or clinical note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenModal}
        >
          New Nutritional Assessment
        </Button>
      </div>

      {/* Assessment Registry Table */}
      <Card
        title={`Clinical Nutritional Assessments (${filteredAssessments.length})`}
        subtitle="Anthropometric evaluation, dysphagia screening, allergen flags, and nutritional targets."
      >
        {filteredAssessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Utensils size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No nutritional assessments found.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Perform an initial dietitian assessment for inpatient care or day-care protocols.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Patient Details</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Anthropometry & BMI</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Swallowing Risk</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Food Allergies</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Daily Targets</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Dietitian Notes</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Date & Clinician</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {item.patient_uhid} • {item.patient_gender}, {item.patient_age}y
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
                          BMI {item.bmi}
                        </span>
                        <Badge variant={item.bmi >= 18.5 && item.bmi <= 24.9 ? 'success' : 'warning'}>
                          {item.bmi_category}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Ht: {item.height_cm} cm • Wt: {item.weight_kg} kg
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={item.swallowing_risk === 'Normal' ? 'teal' : 'danger'}>
                        {item.swallowing_risk}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {Array.isArray(item.allergies) && item.allergies.length > 0 && !item.allergies.includes('None reported') ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.allergies.map((al, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 7px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#FEE2E2',
                                color: 'var(--color-error)',
                                fontSize: '0.72rem',
                                fontWeight: '600'
                              }}
                            >
                              <ShieldAlert size={11} /> {al}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>None reported</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-primary)' }}>
                        <strong>{item.daily_calories_target}</strong> kcal/day
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        Protein: <strong>{item.daily_protein_target_g}g</strong> • Fluid: <strong>{item.daily_fluid_target_ml}mL</strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '240px', color: 'var(--color-text-secondary)' }}>
                      <div style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                        {item.clinical_notes || 'Standard protocol.'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      <div>{formatDateTimeIN(item.assessed_at)}</div>
                      <div style={{ color: 'var(--color-primary-teal)', fontWeight: '500', marginTop: '2px' }}>
                        {item.assessed_by}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dietitian Clinical Nutritional Assessment"
        subtitle="Evaluate anthropometry, dysphagia aspiration risk, and set daily caloric/fluid goals."
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient Quick Select */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Patient *
            </label>
            <input
              type="text"
              placeholder="Search patient by name or UHID..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', marginBottom: '6px', fontSize: '0.84rem' }}
            />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.name} ({p.uhid}) - {p.gender}, {p.age || 'Adult'}
                </option>
              ))}
            </select>
          </div>

          {/* Anthropometrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Height (cm) *
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
                min="50"
                max="250"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Weight (kg) *
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                min="10"
                max="300"
                step="0.1"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Calculated BMI
              </label>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  border: '1.5px solid rgba(8, 127, 140, 0.3)',
                  fontWeight: '700',
                  color: 'var(--color-primary-teal)',
                  fontSize: '0.9rem'
                }}
              >
                {calculatedBmi} ({bmiCategory})
              </div>
            </div>
          </div>

          {/* Swallowing Risk */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Swallowing / Dysphagia Risk Screening *
            </label>
            <select
              value={swallowingRisk}
              onChange={(e) => setSwallowingRisk(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <option value="Normal">Normal — No swallowing difficulty</option>
              <option value="Mild Dysphagia">Mild Dysphagia — Needs soft texture</option>
              <option value="Moderate Dysphagia">Moderate Dysphagia — Pureed food and thickened liquids</option>
              <option value="Severe Dysphagia / Aspiration Risk (NPO)">Severe Dysphagia / High Aspiration Risk (Strict NPO)</option>
            </select>
          </div>

          {/* Food Allergies Multi-select */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
              Known Food Allergens & Sensitivities
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ALLERGY_OPTIONS.map(allergy => {
                const isSelected = selectedAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => handleToggleAllergy(allergy)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: isSelected ? '1px solid var(--color-error)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? '#FEE2E2' : '#FFFFFF',
                      color: isSelected ? 'var(--color-error)' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}{allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nutritional Targets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Calories (kcal/day)
              </label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                min="800"
                max="4000"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Protein (g/day)
              </label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(e.target.value)}
                min="30"
                max="200"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Fluid Goal (mL/day)
              </label>
              <input
                type="number"
                value={targetFluid}
                onChange={(e) => setTargetFluid(e.target.value)}
                min="500"
                max="4500"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Clinical Assessment Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Dietitian Assessment & Special Requirements
            </label>
            <textarea
              rows="3"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Patient on dialysis; restrict potassium & phosphorus. Diabetic management protocol..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Assessment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
