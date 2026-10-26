import React, { useState } from 'react';
import {
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';

export function PacuRecoveryDesk({ cases = [], onUpdateCase }) {
  const [pacuCases, setPacuCases] = useState(cases.filter(c => c.status === 'in_pacu' || c.status === 'discharged_ward'));
  const [successMsg, setSuccessMsg] = useState('');

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDischargeToWard = (c) => {
    const updated = { ...c, status: 'discharged_ward', pacuStatus: 'Transferred to Inpatient Surgical Ward' };
    onUpdateCase(updated);
    setPacuCases(prev => prev.map(item => item.id === c.id ? updated : item));
    showToast(`Patient ${c.patientName} authorized and transferred to surgical ward.`);
  };

  return (
    <Card
      title="23.5 Post-Anesthesia Care Unit (PACU) Recovery Monitoring"
      subtitle="Modified Aldrete Recovery Score (0-10), vital sign stability, and post-op ward transfer authorization"
    >
      {successMsg && (
        <div style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {pacuCases.map(c => {
          const isDischarged = c.status === 'discharged_ward';
          return (
            <div
              key={c.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${isDischarged ? '#16A34A' : '#2563EB'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.90rem' }}>{c.patientName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                    {c.patientUhid} • {c.pacuBay}
                  </div>
                </div>
                <Badge variant={isDischarged ? 'success' : 'teal'}>
                  {isDischarged ? 'Ward Transferred' : 'In PACU'}
                </Badge>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <div><strong>Procedure:</strong> {c.procedureName}</div>
                <div><strong>Surgeon:</strong> {c.leadSurgeon} • <strong>Anesth:</strong> {c.anesthetist}</div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                  Modified Aldrete Score
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {c.aldreteScore || 9} / 10
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                {c.pacuStatus}
              </div>

              {!isDischarged && (
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => handleDischargeToWard(c)}
                  >
                    Authorize Transfer to Ward
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
