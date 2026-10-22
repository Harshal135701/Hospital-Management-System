import React, { useState, useMemo } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Search,
  ShieldAlert,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { HOSPITAL_FORMULARY } from './emrDemoData';
import { formatDateTimeIN } from '../../utils/formatters';

export function PrescriptionStudio({
  selectedPatient,
  prescriptions,
  doctors,
  onCreatePrescription,
  onDispensePrescription
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [searchDrugQuery, setSearchDrugQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState(HOSPITAL_FORMULARY[0]);
  const [formulation, setFormulation] = useState(HOSPITAL_FORMULARY[0].formulation);
  const [strength, setStrength] = useState(HOSPITAL_FORMULARY[0].strength);
  const [dosage, setDosage] = useState(HOSPITAL_FORMULARY[0].defaultDosage);
  const [frequency, setFrequency] = useState(HOSPITAL_FORMULARY[0].defaultFrequency);
  const [duration, setDuration] = useState('5 Days');
  const [foodInstruction, setFoodInstruction] = useState(HOSPITAL_FORMULARY[0].foodInstruction);
  const [specificInstruction, setSpecificInstruction] = useState('');

  // Cart of medications being prescribed in current session
  const [medicationCart, setMedicationCart] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState('Drink adequate water. Follow-up after completing medication course.');

  // Print modal / preview
  const [previewRx, setPreviewRx] = useState(null);

  const filteredFormulary = useMemo(() => {
    if (!searchDrugQuery.trim()) return HOSPITAL_FORMULARY;
    const q = searchDrugQuery.toLowerCase();
    return HOSPITAL_FORMULARY.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [searchDrugQuery]);

  const handleSelectMedication = (med) => {
    setSelectedMedication(med);
    setFormulation(med.formulation);
    setStrength(med.strength);
    setDosage(med.defaultDosage);
    setFrequency(med.defaultFrequency);
    setDuration(med.defaultDuration);
    setFoodInstruction(med.foodInstruction);
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!selectedMedication) return;

    const newItem = {
      id: `rxi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      medication_name: selectedMedication.name,
      brand_name: selectedMedication.brand,
      formulation,
      strength,
      dosage,
      frequency,
      duration,
      food_instruction: foodInstruction,
      instructions: specificInstruction || 'Take as advised'
    };

    setMedicationCart(prev => [...prev, newItem]);
    setSpecificInstruction('');
  };

  const handleRemoveMedication = (itemId) => {
    setMedicationCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleFinalizePrescription = (e) => {
    e.preventDefault();
    if (medicationCart.length === 0 || !selectedPatient) return;

    const doctorObj = doctors.find(d => String(d.id) === String(selectedDoctorId)) || {
      id: selectedDoctorId || 'doc-01',
      full_name: 'Dr. Sunita Rao, MD',
      qualification: 'MD (Internal Medicine)',
      department: 'General Medicine'
    };

    const newRx = {
      id: `rx-${Date.now()}`,
      rx_number: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name || selectedPatient.name,
      patient_uhid: selectedPatient.uhid,
      doctor_name: doctorObj.full_name || doctorObj.name,
      doctor_qualification: doctorObj.qualification || 'MD',
      department: doctorObj.department || 'Outpatient Clinic',
      created_at: new Date().toISOString(),
      status: 'active',
      is_dispensed: false,
      items: medicationCart,
      doctor_notes: doctorNotes
    };

    onCreatePrescription(newRx);
    setMedicationCart([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Safety Notice Warning Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFBEB',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#92400E'
        }}
      >
        <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <div>
          <strong>Clinical Pharmacovigilance Disclaimer:</strong> Automated drug-drug interaction, duplicate-therapy, and renal dose adjustment checks are visibly simulated placeholders until integration with a live pharmacological decision engine. Prescriptions recorded here are saved as structured clinical drafts; pharmacy electronic dispensing interface is pending.
        </div>
      </div>

      {/* Main Studio Grid: Prescription Form & Active Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        {/* Left Column: Medication Search & Dosing Configuration */}
        <Card
          title="Medication Search & Structured Dosing Formulation"
          subtitle="Hospital formulary search, dosage instructions, frequency and meal guidelines."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search Formulary */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Search Formulary Medicine *
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Type generic name or brand (e.g. Paracetamol, Augmentin, Pan-40)..."
                  value={searchDrugQuery}
                  onChange={(e) => setSearchDrugQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
                />
              </div>

              {/* Quick Medication Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', maxHeight: '110px', overflowY: 'auto' }}>
                {filteredFormulary.map(med => {
                  const isSelected = selectedMedication?.id === med.id;
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => handleSelectMedication(med)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.74rem',
                        fontWeight: '500',
                        border: isSelected ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                        color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {med.name} ({med.strength})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dosing Parameters Grid */}
            <form onSubmit={handleAddMedication} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Formulation
                  </label>
                  <select
                    value={formulation}
                    onChange={(e) => setFormulation(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.84rem' }}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup / Suspension">Syrup / Suspension</option>
                    <option value="IV Infusion / Injection">IV Infusion / Injection</option>
                    <option value="Metered Dose Inhaler (MDI)">Inhaler (MDI)</option>
                    <option value="Topical Ointment">Topical Ointment</option>
                    <option value="Eye / Ear Drops">Eye / Ear Drops</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Strength
                  </label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 500 mg, 1 g"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Dosage Quantity
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet or 5 mL"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Frequency *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.84rem' }}
                  >
                    <option value="OD (Once Daily)">OD (Once Daily - Morning)</option>
                    <option value="BD (Twice Daily)">BD (Twice Daily - Morning & Night)</option>
                    <option value="TID (Thrice Daily)">TID (Thrice Daily - 8 hourly)</option>
                    <option value="QID (Four Times Daily)">QID (Four Times Daily - 6 hourly)</option>
                    <option value="HS (At Bedtime)">HS (At Bedtime)</option>
                    <option value="PRN (As Needed)">PRN (As Needed)</option>
                    <option value="STAT (Immediately)">STAT (Single Immediate Dose)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5 Days, 1 Month"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                    Meal Timing
                  </label>
                  <select
                    value={foodInstruction}
                    onChange={(e) => setFoodInstruction(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.84rem' }}
                  >
                    <option value="After meals">After meals</option>
                    <option value="Before breakfast (Empty stomach)">Before breakfast (Empty stomach)</option>
                    <option value="With food">With food</option>
                    <option value="At bedtime">At bedtime</option>
                    <option value="Independent of meals">Independent of meals</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                  Specific Patient Instructions
                </label>
                <input
                  type="text"
                  value={specificInstruction}
                  onChange={(e) => setSpecificInstruction(e.target.value)}
                  placeholder="e.g. Discontinue if rash occurs; dissolve in warm water..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <Button variant="primary" type="submit" icon={Plus} size="sm">
                  Add to Prescription
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Right Column: Prescription Cart & Final Sign-off */}
        <Card
          title={`Active Prescription Cart (${medicationCart.length} items)`}
          subtitle="Review ordered items, doctor notes, and staging for clinical record."
        >
          {medicationCart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-muted)' }}>
              <Pill size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Prescription cart is empty.</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Search and select medicines from the formulary on the left.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {medicationCart.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
                          {idx + 1}. {item.medication_name}
                        </span>
                        <Badge variant="teal">{item.strength}</Badge>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {item.formulation} • <strong>{item.dosage}</strong> • {item.frequency} • {item.duration}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                        Instructions: {item.food_instruction} {item.instructions && `(${item.instructions})`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Attending Doctor Selector & Doctor Notes */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                  Authorizing Attending Clinician *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.84rem' }}
                >
                  <option value="">-- Select Clinician Identity --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name || d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                  Doctor Lifestyle / Follow-up Notes
                </label>
                <textarea
                  rows="2"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={handleFinalizePrescription}
                >
                  Save & Stage E-Prescription
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Historical Prescriptions List Card */}
      <Card
        title={`Patient Prescription Archive (${prescriptions.length} records)`}
        subtitle="Historical outpatient and inpatient prescriptions, medication regimens, and print slip generation."
      >
        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--color-text-muted)' }}>
            <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.88rem' }}>No historical prescriptions found.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Rx Number</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Patient Details</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Prescribing Clinician</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Medications Prescribed</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(rx => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                      {rx.rx_number}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{rx.patient_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{rx.patient_uhid}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{rx.doctor_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {formatDateTimeIN(rx.created_at)}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                        {rx.items?.map((it, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-bg-pale-aqua)',
                              color: 'var(--color-primary-teal)',
                              fontSize: '0.74rem',
                              fontWeight: '500'
                            }}
                          >
                            {it.medication_name} ({it.frequency || 'Daily'})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={rx.is_dispensed ? 'success' : 'teal'}>
                        {rx.is_dispensed ? 'Dispensed' : 'Prescription Active'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Printer}
                          onClick={() => setPreviewRx(rx)}
                        >
                          Print Rx
                        </Button>
                        {!rx.is_dispensed && (
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => onDispensePrescription(rx.id)}
                          >
                            Mark Dispensed
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Printable Prescription Slip Modal */}
      <Modal
        isOpen={Boolean(previewRx)}
        onClose={() => setPreviewRx(null)}
        title="Official Medical E-Prescription Slip"
        subtitle="Standardized clinical prescription layout formatted for printing and patient record."
        maxWidth="680px"
      >
        {previewRx && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                border: '1px solid #000000',
                padding: '24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                fontFamily: 'serif'
              }}
            >
              {/* Prescription Header */}
              <div style={{ borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-primary-teal)', letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>
                    MEDICSPRIME MULTISPECIALTY HOSPITAL
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#555555', fontFamily: 'sans-serif' }}>
                    Main Clinical Campus • 24/7 Pharmacy & Emergency Care
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{previewRx.doctor_name}</div>
                  <div style={{ fontSize: '0.76rem', color: '#555555' }}>{previewRx.doctor_qualification}</div>
                  <div style={{ fontSize: '0.74rem', color: '#555555' }}>Dept: {previewRx.department}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'sans-serif', marginBottom: '18px' }}>
                <div>Patient: <strong>{previewRx.patient_name}</strong></div>
                <div>UHID: <strong>{previewRx.patient_uhid}</strong></div>
                <div>Date: <strong>{formatDateTimeIN(previewRx.created_at)}</strong></div>
                <div>Rx Ref: <strong>{previewRx.rx_number}</strong></div>
              </div>

              {/* Rx Symbol */}
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-primary-teal)', marginBottom: '8px', lineHeight: 1 }}>
                ℞
              </div>

              {/* Prescribed Items Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {previewRx.items?.map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px dotted #CCCCCC', paddingBottom: '8px', fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{i + 1}. {item.medication_name} ({item.strength})</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#555555' }}>Duration: {item.duration}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#333333', marginTop: '2px' }}>
                      Sig: <strong>{item.dosage}</strong> • {item.frequency} • Timing: <em>{item.food_instruction}</em>
                    </div>
                    {item.instructions && (
                      <div style={{ fontSize: '0.76rem', color: '#666666', fontStyle: 'italic', marginTop: '1px' }}>
                        Notes: {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Advice Notes */}
              {previewRx.doctor_notes && (
                <div style={{ fontSize: '0.82rem', marginBottom: '24px', fontFamily: 'sans-serif' }}>
                  <strong>Physician Advice:</strong> {previewRx.doctor_notes}
                </div>
              )}

              {/* Doctor Signature */}
              <div style={{ borderTop: '1px solid #000000', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.78rem', fontFamily: 'sans-serif' }}>
                <div style={{ color: '#666666', fontSize: '0.7rem' }}>
                  * This e-prescription is generated from the MedicsPrime EMR suite.
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700' }}>{previewRx.doctor_name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#666666' }}>Attending Physician Signature</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setPreviewRx(null)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Prescription
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
