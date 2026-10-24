import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Tag,
  Eye,
  Archive,
  ArrowRight,
  Printer,
  Sparkles,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_CRYO_SPECIMENS, INITIAL_THAW_RECORDS } from '../common/billingMockData';
import { formatDateIN, formatDateTimeIN } from '../../../utils/formatters';

export function SampleThawUsageView() {
  const [cryoInventory, setCryoInventory] = useState(INITIAL_CRYO_SPECIMENS);
  const [thawHistory, setThawHistory] = useState(INITIAL_THAW_RECORDS);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [isThawModalOpen, setIsThawModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Thaw Form State
  const [thawForm, setThawForm] = useState({
    strawsToThaw: 1,
    thawDate: new Date().toISOString().slice(0, 16),
    indication: 'OPU Cycle ICSI Insemination (Cycle #IVF-2026-015)',
    protocol: 'Rapid Thaw 37°C water bath 5 min followed by Sil-Select gradient wash',
    treatingPhysician: 'Dr. Arindam Mitra (Reproductive Medicine)',
    embryologist: 'Dr. Priya Nair (Lead Embryologist)',
    postThawMotility: '46',
    cryoRecoveryRate: '72',
    consentConfirmed: true,
    serologyCleared: true,
    notes: 'Sample verified with double witness checking before thaw.'
  });

  const filteredInventory = useMemo(() => {
    return cryoInventory.filter(s => {
      const q = searchFilter.toLowerCase();
      return (
        s.containerId.toLowerCase().includes(q) ||
        s.patientName.toLowerCase().includes(q) ||
        s.patientUhid.toLowerCase().includes(q) ||
        s.storageLocation.tank.toLowerCase().includes(q)
      );
    });
  }, [cryoInventory, searchFilter]);

  const handleOpenThawModal = (specimen) => {
    setSelectedSpecimen(specimen);
    setThawForm(prev => ({
      ...prev,
      strawsToThaw: 1,
      thawDate: new Date().toISOString().slice(0, 16)
    }));
    setValidationError('');
    setIsThawModalOpen(true);
  };

  const handleExecuteThaw = (e) => {
    e.preventDefault();
    if (!selectedSpecimen) return;

    const count = parseInt(thawForm.strawsToThaw) || 0;
    if (count <= 0) {
      setValidationError('Please select at least 1 straw to retrieve.');
      return;
    }
    if (count > selectedSpecimen.aliquotsRemaining) {
      setValidationError(`Cannot retrieve ${count} straws. Only ${selectedSpecimen.aliquotsRemaining} straws available in storage.`);
      return;
    }
    if (!thawForm.consentConfirmed || !thawForm.serologyCleared) {
      setValidationError('Consent verification and serology clearance are strictly required prior to cryo release.');
      return;
    }

    // Deduct remaining balance
    const newRemaining = selectedSpecimen.aliquotsRemaining - count;
    setCryoInventory(prev =>
      prev.map(item =>
        item.id === selectedSpecimen.id
          ? {
              ...item,
              aliquotsRemaining: newRemaining,
              status: newRemaining === 0 ? 'Depleted' : 'Stored'
            }
          : item
      )
    );

    // Add to Thaw history
    const newThawRecord = {
      id: `thaw-${Date.now()}`,
      thawDate: thawForm.thawDate,
      patientName: selectedSpecimen.patientName,
      patientUhid: selectedSpecimen.patientUhid,
      cryoContainerId: selectedSpecimen.containerId,
      strawsThawed: count,
      remainingStraws: newRemaining,
      protocol: thawForm.protocol,
      indication: thawForm.indication,
      postThawMotility: parseFloat(thawForm.postThawMotility) || 40,
      cryoRecoveryRate: parseFloat(thawForm.cryoRecoveryRate) || 65,
      vitalityPostThaw: 70,
      embryologist: thawForm.embryologist,
      physician: thawForm.treatingPhysician,
      status: 'Utilized Successfully'
    };

    setThawHistory(prev => [newThawRecord, ...prev]);
    setIsThawModalOpen(false);
    setSuccessBanner(
      `Retrieved ${count} straw(s) from ${selectedSpecimen.containerId}. Remaining in ${selectedSpecimen.storageLocation.tank}: ${newRemaining} straw(s).`
    );
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 1.3</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Specimen Thaw & Clinical Usage Workbench
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Controlled retrieval of frozen semen straws, dual-witness verification, post-thaw survival assessment, and strict inventory balance deduction.
          </p>
        </div>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Available Frozen Inventory Table */}
      <Card
        title="Available Frozen Specimen Inventory"
        subtitle="Select an active cryo container to initiate thawing protocol and aliquot retrieval"
        action={
          <div style={{ width: '280px' }}>
            <Input
              placeholder="Filter by UHID, Container ID, Tank..."
              icon={Search}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Container / Specimen</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Subject / UHID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Tank / Canister Location</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Available Balance</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Initial Motility</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{item.containerId}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Freeze: {formatDateIN(item.freezeDate)}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{item.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.patientUhid} • {item.category}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{item.storageLocation.tank}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                      {item.storageLocation.canister} / {item.storageLocation.cane}
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <Badge variant={item.aliquotsRemaining > 0 ? 'teal' : 'danger'} size="sm">
                      {item.aliquotsRemaining} / {item.aliquotsStored} Straws Available
                    </Badge>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontWeight: '600' }}>{item.preFreezeMotility}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>({item.preFreezeConcentration})</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    <Button
                      variant={item.aliquotsRemaining > 0 ? 'primary' : 'outline'}
                      size="sm"
                      icon={Flame}
                      disabled={item.aliquotsRemaining <= 0}
                      onClick={() => handleOpenThawModal(item)}
                    >
                      Retrieve & Thaw
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Thaw Log & Clinical Traceability History */}
      <Card
        title="Thawing & Usage Traceability Audit Log"
        subtitle="Audit trail of specimen retrieval, post-thaw recovery parameters, and linked ART cycles"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Thaw Date & Time</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Patient / Container</th>
                <th style={{ textAlign: 'center', padding: '8px 10px' }}>Straws Thawed</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Clinical Indication / Procedure</th>
                <th style={{ textAlign: 'center', padding: '8px 10px' }}>Post-Thaw Motility</th>
                <th style={{ textAlign: 'center', padding: '8px 10px' }}>Recovery %</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Operator</th>
                <th style={{ textAlign: 'right', padding: '8px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {thawHistory.map((th) => (
                <tr key={th.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <div>{formatDateIN(th.thawDate)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDateTimeIN(th.thawDate).split(',')[1]}</div>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: '600' }}>{th.patientName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)' }}>{th.cryoContainerId}</div>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>
                    {th.strawsThawed} Straw(s)
                  </td>
                  <td style={{ padding: '8px 10px' }}>{th.indication}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', color: '#0369A1' }}>
                    {th.postThawMotility}%
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', color: 'var(--color-success)' }}>
                    {th.cryoRecoveryRate}%
                  </td>
                  <td style={{ padding: '8px 10px' }}>{th.embryologist}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    <Badge variant="success" size="sm">
                      {th.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Thaw Protocol Modal */}
      <Modal
        isOpen={isThawModalOpen}
        onClose={() => setIsThawModalOpen(false)}
        title="Execute Specimen Thaw & Clinical Release"
        size="lg"
      >
        {selectedSpecimen && (
          <form onSubmit={handleExecuteThaw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Specimen Snapshot */}
            <div style={{ padding: '12px 16px', backgroundColor: '#F0FDFA', borderRadius: 'var(--radius-md)', border: '1px solid #CCFBF1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                    {selectedSpecimen.containerId} • {selectedSpecimen.patientName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>
                    Location: {selectedSpecimen.storageLocation.tank} / {selectedSpecimen.storageLocation.canister} / {selectedSpecimen.storageLocation.cane}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant="teal" size="sm">
                    {selectedSpecimen.aliquotsRemaining} Straws Available
                  </Badge>
                </div>
              </div>
            </div>

            {validationError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Checklist */}
            <div style={{ padding: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: '700', color: '#92400E', marginBottom: '8px' }}>Pre-Thaw Mandatory Safety Checklist:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={thawForm.consentConfirmed}
                    onChange={(e) => setThawForm({ ...thawForm, consentConfirmed: e.target.checked })}
                  />
                  <span>Signed Patient / Couple consent verified for this specific ART procedure.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={thawForm.serologyCleared}
                    onChange={(e) => setThawForm({ ...thawForm, serologyCleared: e.target.checked })}
                  />
                  <span>HIV, HBsAg, HCV, and VDRL clearance verified within valid regulatory window.</span>
                </label>
              </div>
            </div>

            {/* Thaw Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <Input
                label="Number of Straws to Retrieve"
                type="number"
                min="1"
                max={selectedSpecimen.aliquotsRemaining}
                value={thawForm.strawsToThaw}
                onChange={(e) => setThawForm({ ...thawForm, strawsToThaw: e.target.value })}
                required
              />
              <Input
                label="Thaw Date & Time"
                type="datetime-local"
                value={thawForm.thawDate}
                onChange={(e) => setThawForm({ ...thawForm, thawDate: e.target.value })}
                required
              />
              <Input
                label="Clinical Indication / Procedure"
                value={thawForm.indication}
                onChange={(e) => setThawForm({ ...thawForm, indication: e.target.value })}
                required
              />
              <Input
                label="Treating Clinician / Consultant"
                value={thawForm.treatingPhysician}
                onChange={(e) => setThawForm({ ...thawForm, treatingPhysician: e.target.value })}
                required
              />
              <Input
                label="Post-Thaw Progressive Motility (%)"
                type="number"
                value={thawForm.postThawMotility}
                onChange={(e) => setThawForm({ ...thawForm, postThawMotility: e.target.value })}
                required
              />
              <Input
                label="Cryo Survival / Recovery Rate (%)"
                type="number"
                value={thawForm.cryoRecoveryRate}
                onChange={(e) => setThawForm({ ...thawForm, cryoRecoveryRate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsThawModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Flame}>
                Confirm Thaw & Deduct Balance
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
