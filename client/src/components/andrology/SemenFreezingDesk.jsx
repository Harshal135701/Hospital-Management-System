import React, { useState, useMemo } from 'react';
import {
  Snowflake,
  Search,
  Plus,
  CheckCircle2,
  Eye,
  Printer,
  ShieldCheck,
  Archive,
  User,
  FlaskConical,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  CRYO_STATUS_CONFIG,
  CRYO_PROTOCOLS,
  CRYOPROTECTANTS,
  LN2_STORAGE_TANKS
} from './andrologyConstants';
import { INITIAL_CRYO_SPECIMENS, INITIAL_SEMEN_ANALYSIS_RECORDS } from './andrologyMockData';
import { formatDateTimeIN, formatDateIN } from '../../utils/formatters';

export function SemenFreezingDesk({ onNotify }) {
  const [specimens, setSpecimens] = useState(INITIAL_CRYO_SPECIMENS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tankFilter, setTankFilter] = useState('all');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState(INITIAL_CRYO_SPECIMENS[0]);
  const [validationErrors, setValidationErrors] = useState({});

  // Form State
  const defaultFormState = {
    patientName: 'Devika & Rahul Sengupta',
    patientUhid: 'UHID-2026-0814',
    category: 'Autologous Patient Sperm',
    sourceAccessionNo: 'SA-2026-0481',
    freezeDate: new Date().toISOString().slice(0, 16),
    protocol: CRYO_PROTOCOLS[0],
    cryoprotectant: CRYOPROTECTANTS[0],
    aliquots: 4,
    strawPrefix: `ST-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100 + Math.random() * 800)}`,
    strawColor: 'Yellow Goblet 10mm',
    tank: LN2_STORAGE_TANKS[0].name,
    canister: 'Canister 02',
    cane: 'Cane 08',
    goblet: 'Yellow Goblet 10mm',
    consentStatus: 'Verified (Signed e-Consent on Record)',
    preFreezeConcentration: '48.0 M/mL',
    preFreezeMotility: '66%',
    preFreezeVitality: '78%',
    operator: 'Dr. Priya Nair (Lead Embryologist)',
    witnessOperator: 'Mr. Anik Mukherjee (Senior Andrologist)',
    notes: 'Preserved prior to spouse planned ICSI stimulation cycle.'
  };

  const [form, setForm] = useState(defaultFormState);

  // Generate unique straw IDs preview based on prefix and count
  const generatedStrawIds = useMemo(() => {
    const count = Math.max(1, parseInt(form.aliquots, 10) || 1);
    const prefix = (form.strawPrefix || 'ST-26-90').trim();
    return Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}`);
  }, [form.aliquots, form.strawPrefix]);

  // Check if straw IDs conflict with existing inventory
  const hasDuplicateStraw = useMemo(() => {
    const existingStraws = new Set();
    specimens.forEach(s => {
      s.storageLocation?.strawIds?.forEach(id => existingStraws.add(id));
    });
    return generatedStrawIds.some(id => existingStraws.has(id));
  }, [generatedStrawIds, specimens]);

  // Handle source accession selection
  const handleSourceSampleSelect = (accNo) => {
    const foundSample = INITIAL_SEMEN_ANALYSIS_RECORDS.find(s => s.accessionNo === accNo);
    if (foundSample) {
      setForm(prev => ({
        ...prev,
        sourceAccessionNo: foundSample.accessionNo,
        patientName: foundSample.patientName,
        patientUhid: foundSample.patientUhid,
        preFreezeConcentration: `${foundSample.concentration} M/mL`,
        preFreezeMotility: `${foundSample.totalMotility}%`,
        preFreezeVitality: `${foundSample.vitality}%`
      }));
    } else {
      setForm(prev => ({ ...prev, sourceAccessionNo: accNo }));
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!form.patientName?.trim()) errs.patientName = 'Patient or donor name is required.';
    if (!form.patientUhid?.trim()) errs.patientUhid = 'UHID / Donor ID is required.';
    if (!form.sourceAccessionNo?.trim()) errs.sourceAccessionNo = 'Source semen sample accession reference is required.';
    const aliquotsNum = parseInt(form.aliquots, 10);
    if (isNaN(aliquotsNum) || aliquotsNum <= 0 || aliquotsNum > 24) {
      errs.aliquots = 'Straw count must be between 1 and 24.';
    }
    if (hasDuplicateStraw) {
      errs.strawPrefix = 'One or more generated straw identifiers already exist in inventory. Please change the prefix.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const count = parseInt(form.aliquots, 10) || 1;
    const newCryo = {
      id: `cryo-${Date.now()}`,
      containerId: `CRYO-STR-${new Date().getFullYear()}-0${Math.floor(100 + Math.random() * 900)}`,
      barcode: `CRYO${Math.floor(100 + Math.random() * 900)}`,
      sourceAccessionNo: form.sourceAccessionNo,
      patientName: form.patientName,
      patientUhid: form.patientUhid,
      category: form.category,
      freezeDate: form.freezeDate,
      protocol: form.protocol,
      cryoprotectant: form.cryoprotectant,
      aliquotsStored: count,
      aliquotsRemaining: count,
      strawColor: form.strawColor,
      storageLocation: {
        tank: form.tank,
        canister: form.canister,
        cane: form.cane,
        goblet: form.goblet,
        strawIds: generatedStrawIds
      },
      consentStatus: form.consentStatus,
      preFreezeConcentration: form.preFreezeConcentration,
      preFreezeMotility: form.preFreezeMotility,
      preFreezeVitality: form.preFreezeVitality,
      operator: form.operator,
      witnessOperator: form.witnessOperator,
      status: 'Stored',
      notes: form.notes,
      created_at: new Date().toISOString()
    };

    setSpecimens(prev => [newCryo, ...prev]);
    setIsRegisterModalOpen(false);
    setSelectedSpecimen(newCryo);
    onNotify?.(`Cryopreservation record ${newCryo.containerId} registered with ${count} straws.`);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return specimens.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.containerId.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.patientUhid.toLowerCase().includes(q) ||
        item.sourceAccessionNo.toLowerCase().includes(q) ||
        (item.storageLocation?.tank && item.storageLocation.tank.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesTank = tankFilter === 'all' || (item.storageLocation?.tank && item.storageLocation.tank.includes(tankFilter));

      return matchesSearch && matchesCat && matchesStatus && matchesTank;
    });
  }, [specimens, searchTerm, categoryFilter, statusFilter, tankFilter]);

  // KPI Metrics
  const totalContainers = specimens.length;
  const totalStrawsStored = specimens.reduce((acc, curr) => acc + (curr.aliquotsStored || 0), 0);
  const totalStrawsRemaining = specimens.reduce((acc, curr) => acc + (curr.aliquotsRemaining || 0), 0);
  const autologousStraws = specimens
    .filter(s => s.category.includes('Autologous') || s.category.includes('Surgical') || s.category.includes('Oncology'))
    .reduce((acc, curr) => acc + (curr.aliquotsRemaining || 0), 0);
  const donorStraws = specimens
    .filter(s => s.category.includes('Donor'))
    .reduce((acc, curr) => acc + (curr.aliquotsRemaining || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Total Preserved Specimens
            </span>
            <Snowflake size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalContainers}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {totalStrawsRemaining} of {totalStrawsStored} straws available in LN2
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Autologous Patient Straws
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {autologousStraws}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Reserved for IVF, ICSI & surgical cases
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Certified Donor Straws
            </span>
            <ShieldCheck size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {donorStraws}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Stored in secure donor vault (Tank Beta)
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Storage Tanks Active
            </span>
            <Archive size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            3 Tanks
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            LN2 -196°C telemetry monitored 24/7
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search Container, Patient, UHID, Source..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Specimen Categories' },
                  { value: 'Autologous Patient Sperm', label: 'Autologous Patient Sperm' },
                  { value: 'Certified Anonymous Donor', label: 'Certified Donor Sperm' },
                  { value: 'PESA / TESA Surgical Aspirate', label: 'PESA/TESA Surgical Aspirate' },
                  { value: 'Oncology Fertility Preservation', label: 'Oncology Preservation' }
                ]}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Storage Statuses' },
                  { value: 'Stored', label: 'Stored in LN2' },
                  { value: 'Partially Thawed', label: 'Partially Thawed' },
                  { value: 'Depleted', label: 'Depleted (0 Straws)' },
                  { value: 'Quarantined', label: 'Quarantined' }
                ]}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={tankFilter}
                onChange={(e) => setTankFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All LN2 Tanks' },
                  { value: 'Tank Alpha', label: 'Tank Alpha' },
                  { value: 'Tank Beta', label: 'Tank Beta (Donor)' },
                  { value: 'Tank Gamma', label: 'Tank Gamma (Quarantine)' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setForm(defaultFormState);
              setValidationErrors({});
              setIsRegisterModalOpen(true);
            }}
          >
            New Cryopreservation Record
          </Button>
        </div>
      </Card>

      {/* Main Structured Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Cryo Record ID & Barcode
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Patient / Donor Details
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Source Sample Ref
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Freezing Date & Protocol
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Straws (Rem / Total)
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Physical Storage Coordinates
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No cryopreservation records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = CRYO_STATUS_CONFIG[item.status] || CRYO_STATUS_CONFIG.Stored;
                  const StatusIcon = statusConf.icon;
                  const loc = item.storageLocation || {};

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      {/* Container ID */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                          {item.containerId}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                          BC: {item.barcode}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Patient / Donor */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {item.patientName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.patientUhid}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-success)', marginTop: '2px' }}>
                          {item.consentStatus?.split(' ')[0]} Consent Verified
                        </div>
                      </td>

                      {/* Source Sample */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {item.sourceAccessionNo}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Pre-Freeze Conc: <strong>{item.preFreezeConcentration}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Pre-Freeze Mot: <strong>{item.preFreezeMotility}</strong>
                        </div>
                      </td>

                      {/* Freeze Date & Protocol */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '220px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {formatDateTimeIN(item.freezeDate)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.protocol?.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Media: {item.cryoprotectant?.split('(')[0]}
                        </div>
                      </td>

                      {/* Aliquots Stored vs Remaining */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: item.aliquotsRemaining === 0 ? 'var(--color-text-muted)' : 'var(--color-primary-teal)' }}>
                            {item.aliquotsRemaining}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>/</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {item.aliquotsStored}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Straws In-Stock
                        </div>
                      </td>

                      {/* Storage Coordinates */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.78rem' }}>
                          {loc.tank}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {loc.canister} • {loc.cane} • {loc.goblet}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {loc.strawIds?.slice(0, 3).join(', ')}
                          {loc.strawIds?.length > 3 && ` +${loc.strawIds.length - 3} more`}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={statusConf.variant} size="sm">
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {statusConf.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => {
                              setSelectedSpecimen(item);
                              setIsDossierModalOpen(true);
                            }}
                            title="View Specimen Storage Pedigree Dossier"
                          >
                            Dossier
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            icon={Printer}
                            onClick={() => {
                              setSelectedSpecimen(item);
                              setIsLabelModalOpen(true);
                            }}
                            title="Print Straw Barcode Labels"
                          >
                            Labels
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Cryopreservation Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="New Semen Cryopreservation Record"
        subtitle="Vitrification & liquid nitrogen canister allocation with straw-level barcode traceability"
        maxWidth="900px"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Section 1: Specimen & Patient Linkage */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} /> 1. Patient / Donor & Source Semen Linkage
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Select
                label="Source Semen Analysis Accession"
                required
                value={form.sourceAccessionNo}
                onChange={(e) => handleSourceSampleSelect(e.target.value)}
                options={INITIAL_SEMEN_ANALYSIS_RECORDS.map(s => ({
                  value: s.accessionNo,
                  label: `${s.accessionNo} (${s.patientName} - Conc: ${s.concentration}M)`
                }))}
              />
              <Input
                label="Patient / Donor Name"
                required
                value={form.patientName}
                onChange={(e) => setForm(prev => ({ ...prev, patientName: e.target.value }))}
                error={validationErrors.patientName}
              />
              <Input
                label="UHID / Donor Code"
                required
                value={form.patientUhid}
                onChange={(e) => setForm(prev => ({ ...prev, patientUhid: e.target.value }))}
                error={validationErrors.patientUhid}
              />
              <Select
                label="Specimen Category"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                options={[
                  'Autologous Patient Sperm',
                  'Certified Anonymous Donor',
                  'PESA / TESA Surgical Aspirate',
                  'Oncology Fertility Preservation'
                ]}
              />
              <Input
                label="Freezing Date & Time"
                type="datetime-local"
                value={form.freezeDate}
                onChange={(e) => setForm(prev => ({ ...prev, freezeDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Section 2: Laboratory Pre-Freeze Baseline */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={15} /> 2. Pre-Freeze Parameters & Freezing Protocol
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Input
                label="Pre-Freeze Concentration"
                value={form.preFreezeConcentration}
                onChange={(e) => setForm(prev => ({ ...prev, preFreezeConcentration: e.target.value }))}
                placeholder="e.g. 48.0 M/mL"
              />
              <Input
                label="Pre-Freeze Total Motility"
                value={form.preFreezeMotility}
                onChange={(e) => setForm(prev => ({ ...prev, preFreezeMotility: e.target.value }))}
                placeholder="e.g. 66%"
              />
              <Input
                label="Pre-Freeze Vitality"
                value={form.preFreezeVitality}
                onChange={(e) => setForm(prev => ({ ...prev, preFreezeVitality: e.target.value }))}
                placeholder="e.g. 78%"
              />
              <Select
                label="Freezing Protocol"
                value={form.protocol}
                onChange={(e) => setForm(prev => ({ ...prev, protocol: e.target.value }))}
                options={CRYO_PROTOCOLS}
              />
              <Select
                label="Cryoprotectant Media"
                value={form.cryoprotectant}
                onChange={(e) => setForm(prev => ({ ...prev, cryoprotectant: e.target.value }))}
                options={CRYOPROTECTANTS}
              />
            </div>
          </div>

          {/* Section 3: Straws & Physical Storage Coordinates */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Archive size={15} /> 3. Aliquots & Physical Storage Coordinates
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Input
                label="Number of Straws / Vials"
                required
                type="number"
                min="1"
                max="24"
                value={form.aliquots}
                onChange={(e) => setForm(prev => ({ ...prev, aliquots: e.target.value }))}
                error={validationErrors.aliquots}
              />
              <Input
                label="Straw Identifier Prefix"
                required
                value={form.strawPrefix}
                onChange={(e) => setForm(prev => ({ ...prev, strawPrefix: e.target.value }))}
                error={validationErrors.strawPrefix}
                placeholder="e.g. ST-26-92"
              />
              <Select
                label="Straw Color / Goblet Size"
                value={form.strawColor}
                onChange={(e) => setForm(prev => ({ ...prev, strawColor: e.target.value }))}
                options={[
                  'Yellow Goblet 10mm (Autologous)',
                  'Blue Goblet 10mm (Donor)',
                  'Red Goblet 10mm (Surgical Aspirate)',
                  'Green Goblet 10mm (Oncology)',
                  'White Goblet 10mm'
                ]}
              />
              <Select
                label="Liquid Nitrogen Tank"
                value={form.tank}
                onChange={(e) => setForm(prev => ({ ...prev, tank: e.target.value }))}
                options={LN2_STORAGE_TANKS.map(t => t.name)}
              />
              <Select
                label="Canister Number"
                value={form.canister}
                onChange={(e) => setForm(prev => ({ ...prev, canister: e.target.value }))}
                options={['Canister 01', 'Canister 02', 'Canister 03', 'Canister 04', 'Canister 05', 'Canister 06']}
              />
              <Select
                label="Cane Number"
                value={form.cane}
                onChange={(e) => setForm(prev => ({ ...prev, cane: e.target.value }))}
                options={['Cane 02', 'Cane 04', 'Cane 08', 'Cane 12', 'Cane 14', 'Cane 18']}
              />
            </div>

            {/* Generated Straws Display */}
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Allocated Straw Identifiers ({generatedStrawIds.length} straws):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {generatedStrawIds.map(id => (
                  <span
                    key={id}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-bg-pale-aqua)',
                      color: 'var(--color-primary-teal)',
                      border: '1px solid rgba(73, 118, 159, 0.35)'
                    }}
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Consent & Staff Double-Witnessing */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} /> 4. Legal ART Consent & Double-Witness Embryologists
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <Select
                label="Consent & Regulatory Status"
                value={form.consentStatus}
                onChange={(e) => setForm(prev => ({ ...prev, consentStatus: e.target.value }))}
                options={[
                  'Verified (Signed e-Consent on Record)',
                  'Verified (Notarized ART Bank Agreement)',
                  'Verified (10-Yr Oncology Cryo Retention Form)',
                  'Pending Witness Signature'
                ]}
              />
              <Input
                label="Primary Operating Embryologist"
                value={form.operator}
                onChange={(e) => setForm(prev => ({ ...prev, operator: e.target.value }))}
              />
              <Input
                label="Secondary Witnessing Embryologist"
                value={form.witnessOperator}
                onChange={(e) => setForm(prev => ({ ...prev, witnessOperator: e.target.value }))}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <Input
                label="Clinical Notes & Storage Remarks"
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g. Preserved prior to spouse planned ICSI stimulation cycle..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
            >
              Register & Store in LN2
            </Button>
          </div>
        </form>
      </Modal>

      {/* Specimen Storage Pedigree Dossier Modal */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Cryopreserved Specimen Storage Dossier"
        subtitle={`Container ID: ${selectedSpecimen?.containerId} • Patient: ${selectedSpecimen?.patientName}`}
        maxWidth="750px"
      >
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '76vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFB', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>CONTAINER ID</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                {selectedSpecimen?.containerId}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>INVENTORY STATUS</div>
              <Badge variant={CRYO_STATUS_CONFIG[selectedSpecimen?.status]?.variant || 'teal'} size="md">
                {selectedSpecimen?.status}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.8rem' }}>
            <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
                Patient & Source Pedigree
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Patient / Donor:</strong> {selectedSpecimen?.patientName}</div>
                <div><strong>UHID:</strong> {selectedSpecimen?.patientUhid}</div>
                <div><strong>Category:</strong> {selectedSpecimen?.category}</div>
                <div><strong>Source Accession:</strong> {selectedSpecimen?.sourceAccessionNo}</div>
                <div><strong>Freezing Date:</strong> {formatDateTimeIN(selectedSpecimen?.freezeDate)}</div>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
                Pre-Freeze Baseline & Media
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Concentration:</strong> {selectedSpecimen?.preFreezeConcentration}</div>
                <div><strong>Total Motility:</strong> {selectedSpecimen?.preFreezeMotility}</div>
                <div><strong>Vitality:</strong> {selectedSpecimen?.preFreezeVitality || '75%'}</div>
                <div><strong>Media:</strong> {selectedSpecimen?.cryoprotectant}</div>
                <div><strong>Protocol:</strong> {selectedSpecimen?.protocol}</div>
              </div>
            </div>
          </div>

          {/* Physical Storage Coordinates */}
          <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#F8FAFC' }}>
            <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
              Physical Storage Coordinates in LN2 (-196°C)
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '0.78rem', marginBottom: '12px' }}>
              <div><strong>Tank:</strong> {selectedSpecimen?.storageLocation?.tank}</div>
              <div><strong>Canister:</strong> {selectedSpecimen?.storageLocation?.canister}</div>
              <div><strong>Cane:</strong> {selectedSpecimen?.storageLocation?.cane}</div>
              <div><strong>Goblet:</strong> {selectedSpecimen?.storageLocation?.goblet}</div>
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Traceable Straw Identifiers ({selectedSpecimen?.aliquotsRemaining} of {selectedSpecimen?.aliquotsStored} Remaining):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedSpecimen?.storageLocation?.strawIds?.map((id, index) => {
                const isConsumed = index >= (selectedSpecimen?.aliquotsRemaining || 0);
                return (
                  <span
                    key={id}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: isConsumed ? '#F1F5F9' : 'var(--color-bg-pale-aqua)',
                      color: isConsumed ? '#94A3B8' : 'var(--color-primary-teal)',
                      border: `1px solid ${isConsumed ? '#CBD5E1' : 'rgba(73, 118, 159, 0.35)'}`,
                      textDecoration: isConsumed ? 'line-through' : 'none'
                    }}
                  >
                    {id} {isConsumed && '(Thawed)'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Staff and Audit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem' }}>
            <div>
              <strong>Operating Embryologist:</strong> {selectedSpecimen?.operator}
            </div>
            <div>
              <strong>Secondary Witness:</strong> {selectedSpecimen?.witnessOperator || 'Verified'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsDossierModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                setIsDossierModalOpen(false);
                setIsLabelModalOpen(true);
              }}
            >
              Print Labels
            </Button>
          </div>
        </div>
      </Modal>

      {/* Straw Barcode Labels Print Modal */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Direct Thermal Straw Label Batch Preview"
        subtitle={`Specimen: ${selectedSpecimen?.containerId} • Patient: ${selectedSpecimen?.patientName}`}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            Direct thermal cryogenic straw labels (25 mm × 10 mm) formatted for Zebra / Brady LN2-resistant label stock:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', width: '100%', alignItems: 'center' }}>
            {selectedSpecimen?.storageLocation?.strawIds?.map(strawId => (
              <div
                key={strawId}
                style={{
                  width: '320px',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #000000',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', color: '#000000' }}>
                    SARJI IVF • {selectedSpecimen?.patientUhid}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.74rem' }}>
                    {selectedSpecimen?.patientName?.slice(0, 18)}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {strawId} • {formatDateIN(selectedSpecimen?.freezeDate)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ padding: '2px 4px', backgroundColor: '#000000', color: '#FFFFFF', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '2px' }}>
                    ||||||||||
                  </div>
                  <div style={{ fontSize: '0.64rem', fontFamily: 'monospace', marginTop: '2px' }}>
                    {selectedSpecimen?.storageLocation?.tank?.split(' ')[1]} / {selectedSpecimen?.storageLocation?.canister}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsLabelModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => {
                onNotify?.(`Batch labels sent to thermal printer for ${selectedSpecimen?.storageLocation?.strawIds?.length} straws.`);
                setIsLabelModalOpen(false);
              }}
            >
              Print All Straw Labels
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
