import React, { useState } from 'react';
import {
  CheckCircle2
} from 'lucide-react';
import { Card, Badge } from '../common/UIPrimitives';

export function WhoChecklistDesk({ cases = [], onUpdateCase }) {
  const [activeCase, setActiveCase] = useState(cases[0] || null);
  const [successToast, setSuccessToast] = useState('');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleToggle = (key) => {
    if (!activeCase) return;
    const updatedChecklist = {
      ...activeCase.whoChecklist,
      [key]: !activeCase.whoChecklist[key]
    };
    const allChecked =
      updatedChecklist.patientConfirmed &&
      updatedChecklist.siteMarked &&
      updatedChecklist.anesthesiaSafetyCheck &&
      updatedChecklist.oximeterFunctioning &&
      updatedChecklist.teamIntroduced &&
      updatedChecklist.antibioticGiven &&
      updatedChecklist.countsVerified &&
      updatedChecklist.specimensLabeled;

    const updated = {
      ...activeCase,
      whoChecklist: updatedChecklist,
      whoChecklistStatus: allChecked ? 'Completed (All 3 Phases)' : 'In Progress'
    };
    onUpdateCase(updated);
    setActiveCase(updated);
    showToast('Checklist state saved electronically.');
  };

  return (
    <Card
      title="23.3 WHO Surgical Safety Checklist Verification"
      subtitle="Perioperative safety sign-in, intra-operative surgical time-out, and final post-op sign-out with scrub nurse verification"
    >
      {successToast && (
        <div style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Case Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {cases.map(c => {
          const isSel = activeCase?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCase(c)}
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
              {c.patientName} — {c.procedureName.split(' ')[0]} ({c.theatreId.toUpperCase()})
            </button>
          );
        })}
      </div>

      {activeCase && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.94rem' }}>{activeCase.procedureName}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                Patient: <strong>{activeCase.patientName}</strong> ({activeCase.patientUhid}) • Surgeon: <strong>{activeCase.leadSurgeon}</strong>
              </div>
            </div>
            <Badge variant="teal">{activeCase.whoChecklistStatus}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
            {/* Phase 1 */}
            <div style={{ padding: '16px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#0F766E' }}>Phase 1: Sign-in (Before Induction)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.patientConfirmed} onChange={() => handleToggle('patientConfirmed')} />
                  <span>Patient identity, site & consent confirmed</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.siteMarked} onChange={() => handleToggle('siteMarked')} />
                  <span>Surgical site is visibly marked</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.anesthesiaSafetyCheck} onChange={() => handleToggle('anesthesiaSafetyCheck')} />
                  <span>Anesthesia machine & medication safety check</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.oximeterFunctioning} onChange={() => handleToggle('oximeterFunctioning')} />
                  <span>Pulse oximeter functioning on patient</span>
                </label>
              </div>
            </div>

            {/* Phase 2 */}
            <div style={{ padding: '16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#92400E' }}>Phase 2: Time-out (Before Skin Incision)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.teamIntroduced} onChange={() => handleToggle('teamIntroduced')} />
                  <span>All team members introduced by name & role</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.antibioticGiven} onChange={() => handleToggle('antibioticGiven')} />
                  <span>Antibiotic prophylaxis given &lt; 60 mins</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.bloodLossRiskAssessed} onChange={() => handleToggle('bloodLossRiskAssessed')} />
                  <span>Anticipated blood loss & sterilization confirmed</span>
                </label>
              </div>
            </div>

            {/* Phase 3 */}
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#166534' }}>Phase 3: Sign-out (Before Leaving Room)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.countsVerified} onChange={() => handleToggle('countsVerified')} />
                  <span>Instrument, sponge & needle count correct</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activeCase.whoChecklist.specimensLabeled} onChange={() => handleToggle('specimensLabeled')} />
                  <span>Specimen labeled accurately with UHID</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
