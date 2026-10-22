import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { ICD10_LEXICON } from './emrDemoData';
import { formatDateIN } from '../../utils/formatters';

export function DiagnosisCoding({
  selectedPatient,
  diagnoses,
  onSaveDiagnosis,
  onToggleStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedIcd, setSelectedIcd] = useState(ICD10_LEXICON[0]);
  const [diagnosisType, setDiagnosisType] = useState('Primary');
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));
  const [clinicalNotes, setClinicalNotes] = useState('');

  const filteredLexicon = useMemo(() => {
    if (!searchTerm.trim()) return ICD10_LEXICON;
    const q = searchTerm.toLowerCase();
    return ICD10_LEXICON.filter(item =>
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const patientDiagnoses = useMemo(() => {
    if (!selectedPatient) return diagnoses;
    return diagnoses.filter(d => String(d.patient_id) === String(selectedPatient.id) || !d.patient_id);
  }, [diagnoses, selectedPatient]);

  const handleOpenAdd = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIcd || !selectedPatient) return;

    const newDiagnosis = {
      id: `diag-${Date.now()}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name || selectedPatient.name,
      icd10_code: selectedIcd.code,
      description: selectedIcd.description,
      type: diagnosisType,
      status: 'active',
      onset_date: onsetDate,
      notes: clinicalNotes,
      diagnosed_by: 'Attending Clinician'
    };

    onSaveDiagnosis(newDiagnosis);
    setIsModalOpen(false);
    setClinicalNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Terminology Service Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#F8FAFC',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tag size={18} style={{ color: 'var(--color-primary-teal)' }} />
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
              ICD-10-CM & SNOMED CT Diagnostic Lexicon
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
              Standardized World Health Organization diagnostic codes for medical necessity, insurance claims, and clinical charting.
            </div>
          </div>
        </div>

        <Badge variant="warning">
          Mock ICD-10 Lexicon (Terminology Server Unconnected)
        </Badge>
      </div>

      {/* Main Diagnosis Coding Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
        {/* Left: Terminology Search & Selection */}
        <Card
          title="Clinical Diagnostic Terminology Search"
          subtitle="Search standardized disease nomenclature and select for patient record."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by ICD-10 code (e.g. E11.9, I10) or disease description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
              {filteredLexicon.map(item => {
                const isSelected = selectedIcd?.code === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => setSelectedIcd(item)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.86rem', color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                          {item.code}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          • {item.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {item.description}
                      </div>
                    </div>

                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIcd(item);
                        setIsModalOpen(true);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Right: Active Diagnoses for Selected Patient */}
        <Card
          title={`Diagnoses Charted for ${selectedPatient ? selectedPatient.full_name : 'Patient'} (${patientDiagnoses.length})`}
          subtitle="Primary admitting diagnoses, comorbidities, and chronological onset status."
        >
          {patientDiagnoses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
              <FileSpreadsheet size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No diagnoses recorded for this patient.</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Select an ICD-10 code from the search catalog on the left to assign.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patientDiagnoses.map(diag => (
                <div
                  key={diag.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: diag.status === 'resolved' ? '#F8FAFC' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-primary-teal)' }}>
                        {diag.icd10_code}
                      </span>
                      <Badge variant={diag.type === 'Primary' ? 'teal' : 'gray'}>
                        {diag.type}
                      </Badge>
                      <Badge variant={diag.status === 'active' ? 'success' : 'gray'}>
                        {diag.status}
                      </Badge>
                    </div>

                    <div style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                      {diag.description}
                    </div>

                    {diag.notes && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        Notes: {diag.notes}
                      </div>
                    )}

                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Onset: {formatDateIN(diag.onset_date)} • Diagnosed by {diag.diagnosed_by || 'Clinician'}
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(diag.id, diag.status === 'active' ? 'resolved' : 'active')}
                    >
                      {diag.status === 'active' ? 'Resolve' : 'Reactivate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Assign Diagnosis Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Chart Diagnosis: ${selectedIcd?.code}`}
        subtitle="Associate standardized clinical code with current patient episode."
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--color-primary-teal)',
              fontWeight: '500'
            }}
          >
            <strong>{selectedIcd?.code}</strong>: {selectedIcd?.description}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Diagnosis Designation *
              </label>
              <select
                value={diagnosisType}
                onChange={(e) => setDiagnosisType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
              >
                <option value="Primary">Primary (Principal reason for admission/visit)</option>
                <option value="Secondary">Secondary / Comorbidity</option>
                <option value="Differential">Differential Diagnosis</option>
                <option value="Provisional">Provisional / Working</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Onset Date *
              </label>
              <input
                type="date"
                value={onsetDate}
                onChange={(e) => setOnsetDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Clinical Specifics / Stage Notes
            </label>
            <textarea
              rows="2"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Stage 2, well controlled with metformin..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Confirm Diagnosis
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
