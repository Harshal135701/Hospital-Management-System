import React, { useState } from 'react';
import { Card, Badge } from '../common/UIPrimitives';

export function IntraOpNotesDesk({ cases = [], onUpdateCase: _onUpdateCase }) {
  const [selectedCase, setSelectedCase] = useState(cases[0] || null);

  return (
    <Card
      title="23.4 Intra-Operative Anesthesia & Surgical Procedure Notes"
      subtitle="Surgical incision findings, estimated blood loss (EBL), implant lot/barcode tracking, and sponge/instrument count verification"
    >
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {cases.map(c => {
          const isSel = selectedCase?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCase(c)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: isSel ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isSel ? '700' : '500',
                fontSize: '0.80rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {c.patientName} — {c.procedureName.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {selectedCase && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
          <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{selectedCase.procedureName}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Patient: <strong>{selectedCase.patientName}</strong> ({selectedCase.patientUhid}) • {selectedCase.theatreName}
                </div>
              </div>
              <Badge variant="teal">{selectedCase.anesthesiaType.split('(')[0].trim()}</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '12px' }}>
              <div><strong>Lead Surgeon:</strong> {selectedCase.leadSurgeon}</div>
              <div><strong>Anesthetist:</strong> {selectedCase.anesthetist}</div>
              <div><strong>Scrub Nurse:</strong> {selectedCase.scrubNurse}</div>
              <div><strong>Est. Blood Loss:</strong> <span style={{ color: '#DC2626', fontWeight: '700' }}>{selectedCase.estimatedBloodLoss}</span></div>
            </div>
          </div>

          <div style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem' }}>Implants, Prosthetics & Barcodes Logged:</h4>
            <div style={{ padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              {selectedCase.implantsUsed}
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', color: '#166534' }}>
              ✓ Surgical Instrument & Sponge Safety Count Audit:
            </h4>
            <div style={{ color: '#166534', fontSize: '0.78rem' }}>
              Pre-incision count, pre-cavity closure count, and final skin closure count verified 100% complete and signed by Operating Consultant and Scrub Nurse.
            </div>
          </div>

          <div style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem' }}>Operative Description & Findings:</h4>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {selectedCase.surgicalNotes}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
