import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Egg,
  Dna,
  Microscope,
  Syringe,
  Snowflake,
  Activity,
  CheckCircle2,
  RefreshCw,
  Plus,
  ChevronRight,
  Search
} from 'lucide-react';
import { Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { EMBRYOLOGY_SUBMODULES } from './embryologyConstants';
import {
  INITIAL_IVF_CYCLES,
  INITIAL_OPUS,
  INITIAL_FERTILIZATIONS,
  INITIAL_EMBRYOS,
  INITIAL_TRANSFERS,
  INITIAL_CRYOSTORAGES
} from './embryologyMockData';
import { EmbryologyService } from '../../services/api';

// Submodule components
import { EmbryologyOverview } from './EmbryologyOverview';
import { OpuRecordingDesk } from './OpuRecordingDesk';
import { FertilizationDesk } from './FertilizationDesk';
import { EmbryoGradingDesk } from './EmbryoGradingDesk';
import { EmbryoTransferDesk } from './EmbryoTransferDesk';
import { CryostorageDesk } from './CryostorageDesk';

export function EmbryologyView({ initialSubtab = 'overview', onNavigate }) {
  // Normalize subtab parameter
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return 'overview';
    if (tab === 'overview' || tab === '10.0' || tab === 'dashboard') return 'overview';
    if (tab === 'opu' || tab === 'oocyte' || tab === '10.1') return '10.1';
    if (tab === 'fertilization' || tab === 'icsi' || tab === 'ivf' || tab === '10.2') return '10.2';
    if (tab === 'grading' || tab === 'blastocyst' || tab === 'embryos' || tab === '10.3') return '10.3';
    if (tab === 'transfer' || tab === 'et' || tab === 'fet' || tab === '10.4') return '10.4';
    if (tab === 'cryo' || tab === 'cryostorage' || tab === 'freezing' || tab === '10.5') return '10.5';

    const clean = tab.replace('embryology:', '').replace('ivf:', '').replace('submodule:', '');
    const found = EMBRYOLOGY_SUBMODULES.find((s) => s.id === clean || s.number === clean);
    return found ? found.id : 'overview';
  }, []);

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Core domain state
  const [cycles, setCycles] = useState(INITIAL_IVF_CYCLES);
  const [opus, setOpus] = useState(INITIAL_OPUS);
  const [fertilizations, setFertilizations] = useState(INITIAL_FERTILIZATIONS);
  const [embryos, setEmbryos] = useState(INITIAL_EMBRYOS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [cryoStraws, setCryoStraws] = useState(INITIAL_CRYOSTORAGES);

  // New Cycle Modal
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [newCycleForm, setNewCycleForm] = useState({
    cycle_number: `IVF-2026-${Math.floor(820 + Math.random() * 80)}`,
    patient_name: '',
    patient_uhid: 'UHID-2026-00',
    cycle_type: 'IVF_ICSI',
    protocol: 'Antagonist Protocol',
    status: 'in_progress',
    start_date: new Date().toISOString().slice(0, 10),
    clinician_name: 'Dr. Priya Nair (Reproductive Medicine)'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Sync prop updates
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab, normalizeSubtab]);

  // Current active submodule descriptor
  const activeSubmodule = useMemo(() => {
    return EMBRYOLOGY_SUBMODULES.find((s) => s.id === activeSubtab) || EMBRYOLOGY_SUBMODULES[0];
  }, [activeSubtab]);

  // Load backend data if available, fallback gracefully
  const loadBackendData = useCallback(async () => {
    setLoading(true);
    try {
      const [cycRes, opuRes, fertRes, embRes, traRes, cryRes] = await Promise.allSettled([
        EmbryologyService.getCycles(),
        EmbryologyService.getOpus(),
        EmbryologyService.getFertilizations(),
        EmbryologyService.getEmbryos(),
        EmbryologyService.getTransfers(),
        EmbryologyService.getCryostorage()
      ]);

      if (cycRes.status === 'fulfilled' && Array.isArray(cycRes.value) && cycRes.value.length > 0) {
        setCycles(cycRes.value);
      }
      if (opuRes.status === 'fulfilled' && Array.isArray(opuRes.value) && opuRes.value.length > 0) {
        setOpus(opuRes.value);
      }
      if (fertRes.status === 'fulfilled' && Array.isArray(fertRes.value) && fertRes.value.length > 0) {
        setFertilizations(fertRes.value);
      }
      if (embRes.status === 'fulfilled' && Array.isArray(embRes.value) && embRes.value.length > 0) {
        setEmbryos(embRes.value);
      }
      if (traRes.status === 'fulfilled' && Array.isArray(traRes.value) && traRes.value.length > 0) {
        setTransfers(traRes.value);
      }
      if (cryRes.status === 'fulfilled' && Array.isArray(cryRes.value) && cryRes.value.length > 0) {
        setCryoStraws(cryRes.value);
      }
    } catch (err) {
      console.warn('Embryology API sync failed, utilizing fallback data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Submodule navigation handler
  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(id === 'overview' ? 'embryology' : `embryology:${id}`);
    }
  };

  // State update handlers
  const handleCreateOpu = (opuRecord) => {
    const newRecord = {
      ...opuRecord,
      id: `opu-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setOpus((prev) => [newRecord, ...prev]);
    showToast(`Oocyte retrieval record for ${opuRecord.patient_name || 'patient'} recorded successfully.`);
  };

  const handleCreateFertilization = (fertRecord) => {
    const newRecord = {
      ...fertRecord,
      id: `fert-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setFertilizations((prev) => [newRecord, ...prev]);
    showToast(`Fertilization (2PN) record for ${fertRecord.patient_name || 'patient'} recorded.`);
  };

  const handleCreateEmbryo = (embRecord) => {
    const newRecord = {
      ...embRecord,
      id: `emb-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setEmbryos((prev) => [newRecord, ...prev]);
    showToast(`Embryo ${embRecord.embryo_code} added to active culture.`);
  };

  const handleUpdateEmbryo = (embryoId, updates) => {
    setEmbryos((prev) =>
      prev.map((e) => (e.id === embryoId ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
    showToast(`Embryo assessment successfully updated.`);
  };

  const handleCreateTransfer = (transferRecord) => {
    const newRecord = {
      ...transferRecord,
      id: `et-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setTransfers((prev) => [newRecord, ...prev]);
    showToast(`Embryo transfer protocol scheduled for ${transferRecord.patient_name || 'patient'}.`);
  };

  const handleUpdateTransfer = (transferId, updates) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
    showToast(`Embryo transfer protocol updated.`);
  };

  const handleCreateCryoRecord = (cryoRecord) => {
    const newRecord = {
      ...cryoRecord,
      id: `cryo-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setCryoStraws((prev) => [newRecord, ...prev]);
    showToast(`Cryostorage straw ${cryoRecord.straw_number} deposited in ${cryoRecord.tank_id}.`);
  };

  const handleUpdateCryoRecord = (cryoId, updates) => {
    setCryoStraws((prev) =>
      prev.map((c) => (c.id === cryoId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
    showToast(`Cryostorage record updated.`);
  };

  const handleCreateNewCycle = (e) => {
    e.preventDefault();
    if (!newCycleForm.patient_name) {
      alert('Please enter patient name');
      return;
    }
    const newCycle = {
      ...newCycleForm,
      id: `cyc-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setCycles((prev) => [newCycle, ...prev]);
    setIsNewCycleModalOpen(false);
    showToast(`IVF Cycle ${newCycle.cycle_number} registered for ${newCycle.patient_name}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Workspace Header - Clinical Module Pattern */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Egg size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                10. Embryology
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  color: 'var(--color-primary-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                IVF Laboratory
              </span>
            </div>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--color-text-secondary)',
                margin: '3px 0 0',
                lineHeight: 1.4
              }}
            >
              Oocyte retrieval dish logs, conventional & ICSI fertilization, Gardner blastocyst grading, embryo transfers, and liquid nitrogen cryo-bank
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadBackendData}
            disabled={loading}
            title="Synchronize latest IVF laboratory records"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Data</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewCycleModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Register New Cycle</span>
          </Button>
        </div>
      </div>

      {/* Workspace Toast Notification */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Submodule Tab Navigation Bar - Styled Exactly like Clinical Module */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '2px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {EMBRYOLOGY_SUBMODULES.map((sub) => {
          const isActive = activeSubtab === sub.id;
          const SubIcon = sub.icon;

          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => handleSelectSubmodule(sub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 15px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: '-2px',
                transition: 'all 0.15s ease'
              }}
            >
              <SubIcon size={16} style={{ flexShrink: 0 }} />
              <span>{sub.number === '10.0' ? 'Overview' : sub.number}</span>
              <span style={{ fontWeight: 'inherit' }}>{sub.shortTitle}</span>
              {sub.badge && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                  }}
                >
                  {sub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb Context Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)'
        }}
      >
        <span>Clinical Operations</span>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>10. Embryology</span>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--color-primary-teal)', fontWeight: '600' }}>{activeSubmodule.title}</span>
      </div>

      {/* Submodule View Content */}
      <div>
        {activeSubtab === 'overview' && (
          <EmbryologyOverview
            cycles={cycles}
            opus={opus}
            fertilizations={fertilizations}
            embryos={embryos}
            transfers={transfers}
            cryoStraws={cryoStraws}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}

        {activeSubtab === '10.1' && (
          <OpuRecordingDesk
            opus={opus}
            cycles={cycles}
            onCreateOpu={handleCreateOpu}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}

        {activeSubtab === '10.2' && (
          <FertilizationDesk
            fertilizations={fertilizations}
            opus={opus}
            cycles={cycles}
            onCreateFertilization={handleCreateFertilization}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}

        {activeSubtab === '10.3' && (
          <EmbryoGradingDesk
            embryos={embryos}
            cycles={cycles}
            onCreateEmbryo={handleCreateEmbryo}
            onUpdateEmbryo={handleUpdateEmbryo}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}

        {activeSubtab === '10.4' && (
          <EmbryoTransferDesk
            transfers={transfers}
            embryos={embryos}
            cycles={cycles}
            onCreateTransfer={handleCreateTransfer}
            onUpdateTransfer={handleUpdateTransfer}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}

        {activeSubtab === '10.5' && (
          <CryostorageDesk
            cryoStraws={cryoStraws}
            embryos={embryos}
            cycles={cycles}
            onCreateCryoRecord={handleCreateCryoRecord}
            onUpdateCryoRecord={handleUpdateCryoRecord}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        )}
      </div>

      {/* Register New IVF Cycle Modal */}
      {isNewCycleModalOpen && (
        <Modal
          isOpen={isNewCycleModalOpen}
          onClose={() => setIsNewCycleModalOpen(false)}
          title="Register New IVF / ART Treatment Cycle"
          size="md"
        >
          <form onSubmit={handleCreateNewCycle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: 'var(--color-primary-teal)',
                lineHeight: 1.4
              }}
            >
              Initiates an official ART clinical cycle, establishing laboratory dish traceability, fertilization protocols, embryo culture incubators, and transfer regimens.
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Cycle Number *
              </label>
              <Input
                type="text"
                value={newCycleForm.cycle_number}
                onChange={(e) => setNewCycleForm({ ...newCycleForm, cycle_number: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Patient Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Radhika Sharma"
                  value={newCycleForm.patient_name}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, patient_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Patient UHID
                </label>
                <Input
                  type="text"
                  placeholder="UHID-2026-0050"
                  value={newCycleForm.patient_uhid}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, patient_uhid: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Cycle Protocol Type
                </label>
                <Select
                  value={newCycleForm.cycle_type}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, cycle_type: e.target.value })}
                >
                  <option value="IVF_ICSI">IVF / ICSI Combined</option>
                  <option value="ICSI">Pure ICSI</option>
                  <option value="Conventional_IVF">Conventional IVF</option>
                  <option value="FET">Frozen Embryo Transfer (FET)</option>
                  <option value="Oocyte_Freezing">Oocyte Cryopreservation</option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Stimulation Protocol
                </label>
                <Input
                  type="text"
                  value={newCycleForm.protocol}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, protocol: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newCycleForm.start_date}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, start_date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Attending Clinician
                </label>
                <Input
                  type="text"
                  value={newCycleForm.clinician_name}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, clinician_name: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewCycleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Register Treatment Cycle
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
