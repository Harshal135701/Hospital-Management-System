import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';

export function PacAssessmentDesk({ cases = [], onUpdateCase: _onUpdateCase }) {
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  const filtered = cases.filter(c =>
    (c.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.procedureName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.patientUhid || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card
      title="23.2 Pre-Anesthesia Checkup (PAC) Clinical Clearance"
      subtitle="Airway assessment (Mallampati score), ASA Physical Status grading, NPO fasting compliance, and laboratory clearances"
    >
      <div style={{ marginBottom: '14px', maxWidth: '380px' }}>
        <input
          type="text"
          placeholder="Search by patient name, UHID or procedure..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {filtered.map(c => {
          const isCleared = c.pacStatus.includes('Cleared');
          return (
            <div
              key={c.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${isCleared ? '#16A34A' : '#D97706'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.90rem', color: 'var(--color-text-primary)' }}>{c.patientName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{c.patientUhid} • {c.age}y/{c.gender[0]}</div>
                </div>
                <Badge variant={isCleared ? 'success' : 'warning'}>{c.asaGrade}</Badge>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                <div><strong>Procedure:</strong> {c.procedureName}</div>
                <div><strong>Mallampati Airway:</strong> {c.mallampatiClass}</div>
                <div><strong>Fasting (NPO):</strong> {c.npoStatus}</div>
                <div><strong>Cardiac / Investigations:</strong> {c.cardiacClearance}</div>
                <div><strong>Crossmatch:</strong> {c.crossmatchUnits}</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: isCleared ? '#166534' : '#92400E', fontWeight: '700' }}>
                  {isCleared ? '✓ Cleared for Anesthesia' : '⚠ High Risk Evaluation'}
                </span>
                <Button size="sm" variant="outline" onClick={() => setSelectedCase(c)}>
                  View Full Evaluation
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`PAC Clearance Dossier — ${selectedCase.patientName}`}
          subtitle={`${selectedCase.patientUhid} • ASA Grade: ${selectedCase.asaGrade}`}
          maxWidth="550px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Scheduled Procedure:</strong> {selectedCase.procedureName}</div>
              <div><strong>Lead Surgeon:</strong> {selectedCase.leadSurgeon}</div>
              <div><strong>Operating Anesthetist:</strong> {selectedCase.anesthetist}</div>
            </div>
            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <strong>Airway & Anesthetic Risk Details:</strong>
              <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                {selectedCase.airwayAssessment}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="primary" onClick={() => setSelectedCase(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
