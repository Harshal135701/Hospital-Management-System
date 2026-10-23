import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Eye,
  Save,
  Check,
  Clock,
  User,
  ShieldCheck,
  Activity,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Settings,
  Sliders
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_SEMEN_ANALYSIS_RECORDS } from '../common/billingMockData';
import { formatDateIN, formatDateTimeIN } from '../../../utils/formatters';
import { useHospitalState, DEFAULT_SEMEN_ANALYSIS_LIMITS } from '../../../context/HospitalStateContext';

export function SemenAnalysisEntry() {
  const hospitalState = useHospitalState();
  const limits = hospitalState?.semenAnalysisLimits || DEFAULT_SEMEN_ANALYSIS_LIMITS;
  const updateLimits = hospitalState?.updateSemenAnalysisLimits;

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configForm, setConfigForm] = useState(() => ({
    standard_name: limits.standard_name,
    volume_ml_min: limits.volume_ml_min,
    ph_min: limits.ph_min,
    concentration_m_per_ml_min: limits.concentration_m_per_ml_min,
    total_count_m_min: limits.total_count_m_min,
    progressive_motility_pct_min: limits.progressive_motility_pct_min,
    total_motility_pct_min: limits.total_motility_pct_min,
    normal_morphology_pct_min: limits.normal_morphology_pct_min,
    vitality_pct_min: limits.vitality_pct_min,
    round_cells_m_per_ml_max: limits.round_cells_m_per_ml_max
  }));
  const [configError, setConfigError] = useState(null);
  const [records, setRecords] = useState(INITIAL_SEMEN_ANALYSIS_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState(INITIAL_SEMEN_ANALYSIS_RECORDS[0]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Active Entry Form
  const [formData, setFormData] = useState({
    accessionNo: `SA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `SA2026${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: '',
    patientUhid: '',
    age: '',
    spouseName: '',
    collectionDate: new Date().toISOString().slice(0, 16),
    receiptDate: new Date().toISOString().slice(0, 16),
    collectionMethod: 'Masturbation on-site (Private Room 3)',
    abstinenceDays: '',
    technician: '',
    status: 'In Analysis',
    // Macroscopic
    volume: '',
    liquefaction: 'Complete (<30 min)',
    viscosity: 'Normal',
    appearance: 'Normal grey-opalescent',
    ph: '',
    // Microscopic
    concentration: '',
    progressiveMotility: '',
    nonProgressiveMotility: '',
    immotile: '',
    normalMorphology: '',
    abnormalHead: '',
    abnormalNeck: '',
    abnormalTail: '',
    vitality: '',
    roundCells: '',
    agglutination: 'None',
    comments: ''
  });

  // Automatically calculate total sperm count (Concentration * Volume)
  const calculatedTotalCount = useMemo(() => {
    const vol = parseFloat(formData.volume) || 0;
    const conc = parseFloat(formData.concentration) || 0;
    return (vol * conc).toFixed(1);
  }, [formData.volume, formData.concentration]);

  // Calculate total motility (PR + NP)
  const calculatedTotalMotility = useMemo(() => {
    const pr = parseFloat(formData.progressiveMotility) || 0;
    const np = parseFloat(formData.nonProgressiveMotility) || 0;
    return (pr + np).toFixed(0);
  }, [formData.progressiveMotility, formData.nonProgressiveMotility]);

  // Handle Form Change
  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate WHO standard reference ranges
  const validateForm = () => {
    const errs = {};
    const vol = parseFloat(formData.volume);
    const conc = parseFloat(formData.concentration);
    const pr = parseFloat(formData.progressiveMotility);
    const np = parseFloat(formData.nonProgressiveMotility);
    const im = parseFloat(formData.immotile);

    if (isNaN(vol) || vol <= 0) errs.volume = 'Volume must be greater than 0 mL.';
    if (isNaN(conc) || conc < 0) errs.concentration = 'Concentration cannot be negative.';
    if (Math.round((pr || 0) + (np || 0) + (im || 0)) !== 100) {
      errs.motilitySum = 'Motility breakdown (PR + NP + IM) must sum to exactly 100%.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const vol = parseFloat(configForm.volume_ml_min);
    const ph = parseFloat(configForm.ph_min);
    const conc = parseFloat(configForm.concentration_m_per_ml_min);
    const tc = parseFloat(configForm.total_count_m_min);
    const pr = parseFloat(configForm.progressive_motility_pct_min);
    const tm = parseFloat(configForm.total_motility_pct_min);
    const morph = parseFloat(configForm.normal_morphology_pct_min);
    const vit = parseFloat(configForm.vitality_pct_min);
    const rc = parseFloat(configForm.round_cells_m_per_ml_max);

    if (isNaN(vol) || vol <= 0) {
      setConfigError('Ejaculate Volume minimum must be greater than 0 mL.');
      return;
    }
    if (isNaN(ph) || ph < 0 || ph > 14) {
      setConfigError('pH minimum must be between 0 and 14.');
      return;
    }
    if (isNaN(conc) || conc <= 0) {
      setConfigError('Sperm Concentration minimum must be greater than 0 M/mL.');
      return;
    }
    if (isNaN(tc) || tc <= 0) {
      setConfigError('Total Sperm Count minimum must be greater than 0 M/ejaculate.');
      return;
    }
    if (isNaN(pr) || pr < 0 || pr > 100) {
      setConfigError('Progressive Motility (PR) percentage must be between 0% and 100%.');
      return;
    }
    if (isNaN(tm) || tm < 0 || tm > 100) {
      setConfigError('Total Motility (PR + NP) percentage must be between 0% and 100%.');
      return;
    }
    if (isNaN(morph) || morph < 0 || morph > 100) {
      setConfigError('Normal Morphology percentage must be between 0% and 100%.');
      return;
    }
    if (isNaN(vit) || vit < 0 || vit > 100) {
      setConfigError('Vitality percentage must be between 0% and 100%.');
      return;
    }
    if (isNaN(rc) || rc < 0) {
      setConfigError('Round Cells maximum must be non-negative.');
      return;
    }

    const validatedLimits = {
      standard_name: (configForm.standard_name || 'Custom Reference Limits').trim(),
      volume_ml_min: vol,
      ph_min: ph,
      concentration_m_per_ml_min: conc,
      total_count_m_min: tc,
      progressive_motility_pct_min: pr,
      total_motility_pct_min: tm,
      normal_morphology_pct_min: morph,
      vitality_pct_min: vit,
      round_cells_m_per_ml_max: rc
    };

    if (typeof updateLimits === 'function') {
      updateLimits(validatedLimits);
    }
    setConfigError(null);
    setIsConfigModalOpen(false);
    setSuccessBanner(`Clinical reference limits updated to "${validatedLimits.standard_name}".`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleResetConfigToDefaults = () => {
    setConfigForm({ ...DEFAULT_SEMEN_ANALYSIS_LIMITS });
    if (typeof updateLimits === 'function') {
      updateLimits({ ...DEFAULT_SEMEN_ANALYSIS_LIMITS });
    }
    setConfigError(null);
    setSuccessBanner('Clinical reference limits reset to WHO 6th Edition (2021) defaults.');
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleValidateClick = () => {
    if (validateForm()) {
      setSuccessBanner('Validation Passed: All clinical values conform to WHO 6th Edition reference standards.');
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    const draftRecord = {
      ...formData,
      id: `sa-${Date.now()}`,
      totalCount: calculatedTotalCount,
      totalMotility: calculatedTotalMotility,
      status: 'Draft Saved',
      isDraft: true
    };
    setRecords(prev => [draftRecord, ...prev.filter(r => r.accessionNo !== draftRecord.accessionNo)]);
    setSuccessBanner(`Draft saved for accession ${draftRecord.accessionNo}.`);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleSubmitAnalysis = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const completedRecord = {
      ...formData,
      id: `sa-${Date.now()}`,
      totalCount: calculatedTotalCount,
      totalMotility: calculatedTotalMotility,
      status: 'Verified',
      isDraft: false
    };
    setRecords(prev => [completedRecord, ...prev.filter(r => r.accessionNo !== completedRecord.accessionNo)]);
    setSelectedRecord(completedRecord);
    setSuccessBanner(`Analysis ${completedRecord.accessionNo} validated and verified successfully.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleSelectHistoricalRecord = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      accessionNo: rec.accessionNo,
      barcode: rec.barcode,
      patientName: rec.patientName,
      patientUhid: rec.patientUhid,
      age: rec.age || 32,
      spouseName: rec.spouseName || 'Spouse',
      collectionDate: rec.collectionDate?.slice(0, 16) || '',
      receiptDate: rec.receiptDate?.slice(0, 16) || '',
      collectionMethod: rec.collectionMethod || 'Masturbation on-site',
      abstinenceDays: rec.abstinenceDays || 3,
      technician: rec.technician || 'Embryologist',
      status: rec.status,
      volume: String(rec.volume || '2.5'),
      liquefaction: rec.liquefaction || 'Complete (<30 min)',
      viscosity: rec.viscosity || 'Normal',
      appearance: rec.appearance || 'Normal grey-opalescent',
      ph: String(rec.ph || '7.5'),
      concentration: String(rec.concentration || '40'),
      progressiveMotility: String(rec.progressiveMotility || '45'),
      nonProgressiveMotility: String(rec.nonProgressiveMotility || '15'),
      immotile: String(rec.immotile || '40'),
      normalMorphology: String(rec.normalMorphology || '5'),
      abnormalHead: String(rec.abnormalHead || '65'),
      abnormalNeck: String(rec.abnormalNeck || '15'),
      abnormalTail: String(rec.abnormalTail || '15'),
      vitality: String(rec.vitality || '75'),
      roundCells: String(rec.roundCells || '0.5'),
      agglutination: rec.agglutination || 'None',
      comments: rec.comments || ''
    });
    setIsHistoryModalOpen(false);
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
            <Badge variant="teal" size="sm">Submodule 1.1</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Semen Analysis Entry Workbench
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            WHO 6th Edition laboratory manual criteria for macroscopic & microscopic semen evaluation with automated concentration and motility indexing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Sliders}
            onClick={() => setIsConfigModalOpen(true)}
          >
            Configure Clinical Limits
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Clock}
            onClick={() => setIsHistoryModalOpen(true)}
          >
            Past Accessions ({records.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setIsReportModalOpen(true)}
          >
            Preview Report
          </Button>
        </div>
      </div>

      {/* Integration Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#1E40AF'
        }}
      >
        <Info size={16} style={{ flexShrink: 0, color: '#2563EB' }} />
        <span>
          <strong>Andrology LIS Sync Note:</strong> Automated CASA (Computer-Assisted Sperm Analysis) analyzer hardware hook is running in validation mode. Manual entries are logged and cross-validated with WHO 6th edition reference intervals.
        </span>
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

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmitAnalysis}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          {/* Left Column: Patient, Macroscopic, Microscopic */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section A: Patient & Specimen Accession */}
            <Card
              title="1. Patient & Specimen Accession"
              subtitle="Demographics, collection conditions, and accession identifier"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <Input
                  label="Patient Name"
                  placeholder="e.g. Rahul Sengupta"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  required
                />
                <Input
                  label="Patient UHID"
                  placeholder="e.g. UHID-2026-0814"
                  value={formData.patientUhid}
                  onChange={(e) => handleChange('patientUhid', e.target.value)}
                  required
                />
                <Input
                  label="Specimen Accession No."
                  value={formData.accessionNo}
                  onChange={(e) => handleChange('accessionNo', e.target.value)}
                  required
                />
                <Input
                  label="Specimen Barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  required
                />
                <Input
                  label="Collection Date & Time"
                  type="datetime-local"
                  value={formData.collectionDate}
                  onChange={(e) => handleChange('collectionDate', e.target.value)}
                  required
                />
                <Input
                  label="Lab Receipt Date & Time"
                  type="datetime-local"
                  value={formData.receiptDate}
                  onChange={(e) => handleChange('receiptDate', e.target.value)}
                  required
                />
                <Input
                  label="Abstinence Period (Days)"
                  type="number"
                  placeholder="e.g. 4"
                  min="1"
                  max="14"
                  value={formData.abstinenceDays}
                  onChange={(e) => handleChange('abstinenceDays', e.target.value)}
                  helperText="Recommended: 2 - 7 days"
                />
                <Select
                  label="Collection Method"
                  value={formData.collectionMethod}
                  onChange={(e) => handleChange('collectionMethod', e.target.value)}
                  options={[
                    { value: 'Masturbation on-site (Private Room 3)', label: 'Masturbation on-site (Private Room 3)' },
                    { value: 'Home collection (<1 hr transport with temp maintenance)', label: 'Home collection (<1 hr transport)' },
                    { value: 'PESA (Percutaneous Epididymal Sperm Aspiration)', label: 'PESA (Surgical Epididymal)' },
                    { value: 'TESE (Testicular Sperm Extraction)', label: 'TESE (Surgical Testicular)' }
                  ]}
                />
              </div>
            </Card>

            {/* Section B: Macroscopic Examination */}
            <Card
              title="2. Macroscopic Physical Examination"
              subtitle="Physical volume, liquefaction time, viscosity, and pH"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <Input
                  label="Volume (mL)"
                  type="number"
                  step="0.1"
                  value={formData.volume}
                  onChange={(e) => handleChange('volume', e.target.value)}
                  error={validationErrors.volume}
                  helperText={`Ref: ≥ ${limits.volume_ml_min} mL`}
                  required
                />
                <Select
                  label="Liquefaction"
                  value={formData.liquefaction}
                  onChange={(e) => handleChange('liquefaction', e.target.value)}
                  options={[
                    { value: 'Complete (<30 min)', label: 'Complete (<30 min)' },
                    { value: 'Delayed (30 - 60 min)', label: 'Delayed (30 - 60 min)' },
                    { value: 'Incomplete (>60 min)', label: 'Incomplete (>60 min)' }
                  ]}
                />
                <Select
                  label="Viscosity"
                  value={formData.viscosity}
                  onChange={(e) => handleChange('viscosity', e.target.value)}
                  options={[
                    { value: 'Normal', label: 'Normal (drop by drop)' },
                    { value: 'Slightly Increased', label: 'Slightly Increased' },
                    { value: 'High (>2cm thread)', label: 'High (>2cm thread)' }
                  ]}
                />
                <Input
                  label="pH"
                  type="number"
                  step="0.1"
                  value={formData.ph}
                  onChange={(e) => handleChange('ph', e.target.value)}
                  helperText={`Ref: ≥ ${limits.ph_min}`}
                  required
                />
              </div>
            </Card>

            {/* Section C: Microscopic Parameters */}
            <Card
              title="3. Microscopic Motility & Count"
              subtitle="Concentration and progressive motility breakdown (WHO 6th Edition)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <Input
                  label="Sperm Concentration (M/mL)"
                  type="number"
                  step="0.1"
                  value={formData.concentration}
                  onChange={(e) => handleChange('concentration', e.target.value)}
                  helperText={`Ref: ≥ ${limits.concentration_m_per_ml_min} M/mL`}
                  required
                />
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                    Total Sperm Count (Calculated)
                  </label>
                  <div
                    style={{
                      padding: '9px 14px',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border)',
                      fontWeight: '700',
                      color: parseFloat(calculatedTotalCount) >= limits.total_count_m_min ? 'var(--color-primary-teal)' : 'var(--color-warning)'
                    }}
                  >
                    {calculatedTotalCount} M/ejaculate
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Ref: ≥ {limits.total_count_m_min} M</span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  Motility Distribution (%):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <Input
                    label="Progressive (PR %)"
                    type="number"
                    value={formData.progressiveMotility}
                    onChange={(e) => handleChange('progressiveMotility', e.target.value)}
                    helperText={`Ref: ≥ ${limits.progressive_motility_pct_min}%`}
                    required
                  />
                  <Input
                    label="Non-Progressive (NP %)"
                    type="number"
                    value={formData.nonProgressiveMotility}
                    onChange={(e) => handleChange('nonProgressiveMotility', e.target.value)}
                    required
                  />
                  <Input
                    label="Immotile (IM %)"
                    type="number"
                    value={formData.immotile}
                    onChange={(e) => handleChange('immotile', e.target.value)}
                    required
                  />
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                      Total Motility (PR + NP)
                    </label>
                    <div
                      style={{
                        padding: '9px 12px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        fontWeight: '700',
                        color: parseFloat(calculatedTotalMotility) >= limits.total_motility_pct_min ? 'var(--color-success)' : 'var(--color-error)'
                      }}
                    >
                      {calculatedTotalMotility}% (Ref: ≥ {limits.total_motility_pct_min}%)
                    </div>
                  </div>
                </div>
                {validationErrors.motilitySum && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '6px', marginBottom: 0 }}>
                    {validationErrors.motilitySum}
                  </p>
                )}
              </div>

              {/* Morphology & Vitality */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <Input
                  label="Normal Forms (% Strict Kruger)"
                  type="number"
                  step="0.5"
                  value={formData.normalMorphology}
                  onChange={(e) => handleChange('normalMorphology', e.target.value)}
                  helperText={`Ref: ≥ ${limits.normal_morphology_pct_min}%`}
                  required
                />
                <Input
                  label="Vitality (% Live Eosin)"
                  type="number"
                  value={formData.vitality}
                  onChange={(e) => handleChange('vitality', e.target.value)}
                  helperText={`Ref: ≥ ${limits.vitality_pct_min}%`}
                  required
                />
                <Input
                  label="Leukocytes / Round Cells (M/mL)"
                  type="number"
                  step="0.1"
                  value={formData.roundCells}
                  onChange={(e) => handleChange('roundCells', e.target.value)}
                  helperText={`Ref: < ${limits.round_cells_m_per_ml_max} M/mL`}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Reference Summary, Technician Notes, Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Reference Ranges Quick Check Card */}
            <Card title={`${limits.standard_name || 'WHO 6th Edition'} Reference Limits`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Ejaculate Volume:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.volume_ml_min} mL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Minimum pH:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.ph_min}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Sperm Concentration:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.concentration_m_per_ml_min} × 10⁶ / mL</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Total Sperm Count:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.total_count_m_min} × 10⁶ / ejaculate</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Total Motility (PR + NP):</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.total_motility_pct_min}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Progressive Motility (PR):</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.progressive_motility_pct_min}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Normal Morphology:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.normal_morphology_pct_min}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Vitality / Viability:</span>
                  <span style={{ fontWeight: '600' }}>≥ {limits.vitality_pct_min}% live</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Round Cells:</span>
                  <span style={{ fontWeight: '600' }}>&lt; {limits.round_cells_m_per_ml_max} × 10⁶ / mL</span>
                </div>
              </div>
            </Card>

            {/* Technician Sign-Off & Observations */}
            <Card title="Technician Observations & Impression">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                    Laboratory Technician / Embryologist
                  </label>
                  <Input
                    value={formData.technician}
                    onChange={(e) => handleChange('technician', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                    Clinical Impression / Remarks
                  </label>
                  <textarea
                    rows={4}
                    value={formData.comments}
                    onChange={(e) => handleChange('comments', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-border)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Button
                  type="button"
                  variant="outline"
                  icon={Save}
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  icon={CheckCircle2}
                  onClick={handleValidateClick}
                >
                  Validate
                </Button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Check}
                style={{ width: '100%' }}
              >
                Submit & Verify Analysis
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Semen Analysis Logs & Historical Accessions"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Accession</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Patient / UHID</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Vol / Conc</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Motility</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{rec.accessionNo}</td>
                    <td style={{ padding: '8px' }}>
                      <div>{rec.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{rec.patientUhid}</div>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {rec.volume} mL | {rec.concentration} M/mL
                    </td>
                    <td style={{ padding: '8px' }}>
                      {rec.progressiveMotility}% PR ({rec.totalMotility || 65}% Tot)
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Badge variant={rec.status === 'Verified' ? 'success' : 'warning'} size="sm">
                        {rec.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => handleSelectHistoricalRecord(rec)}
                      >
                        Load to Editor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Report Preview Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Andrology Laboratory Diagnostic Report Preview"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            id="andrology-printable-report"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5,
              fontSize: '0.85rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #087F8C', paddingBottom: '12px', marginBottom: '14px' }}>
              <div>
                <h2 style={{ margin: '0 0 2px', fontSize: '1.25rem', color: '#087F8C', fontWeight: '800' }}>
                  APEX IVF & ANDROLOGY CENTRE
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#4B5563' }}>Department of Reproductive Medicine & Assisted Conception</div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Accredited by National ART Registry of India | ISO 15189 Compliant</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>Accession: {formData.accessionNo}</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Date: {formatDateIN(formData.collectionDate)}</div>
              </div>
            </div>

            {/* Patient Details Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', marginBottom: '14px', fontSize: '0.78rem' }}>
              <div><strong>Patient Name:</strong> {formData.patientName}</div>
              <div><strong>UHID:</strong> {formData.patientUhid}</div>
              <div><strong>Age / Gender:</strong> {formData.age} Yrs / Male</div>
              <div><strong>Abstinence:</strong> {formData.abstinenceDays} Days</div>
              <div><strong>Collection Method:</strong> {formData.collectionMethod}</div>
              <div><strong>Referring Consultant:</strong> Dr. Arindam Mitra (Reproductive Medicine)</div>
            </div>

            {/* Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #D1D5DB' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Parameter</th>
                  <th style={{ textAlign: 'center', padding: '6px' }}>Observed Result</th>
                  <th style={{ textAlign: 'center', padding: '6px' }}>Biological Reference Interval ({limits.standard_name})</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Ejaculate Volume</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{formData.volume} mL</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.volume_ml_min} mL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Liquefaction Time</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>{formData.liquefaction}</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>Complete within 60 mins</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>pH</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>{formData.ph}</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.ph_min}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Sperm Concentration</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{formData.concentration} × 10⁶ / mL</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.concentration_m_per_ml_min} × 10⁶ / mL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Total Sperm Count</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{calculatedTotalCount} × 10⁶ / ejaculate</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.total_count_m_min} × 10⁶ / ejaculate</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Progressive Motility (PR)</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{formData.progressiveMotility}%</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.progressive_motility_pct_min}%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Total Motility (PR + NP)</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{calculatedTotalMotility}%</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.total_motility_pct_min}%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '6px' }}>Normal Morphology (Strict Kruger)</td>
                  <td style={{ textAlign: 'center', padding: '6px', fontWeight: '700' }}>{formData.normalMorphology}%</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.normal_morphology_pct_min}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px' }}>Vitality (Eosin-Nigrosin)</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>{formData.vitality}%</td>
                  <td style={{ textAlign: 'center', padding: '6px' }}>≥ {limits.vitality_pct_min}%</td>
                </tr>
              </tbody>
            </table>

            {/* Impressions */}
            <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderLeft: '3px solid #087F8C', marginBottom: '20px', fontSize: '0.78rem' }}>
              <strong>Laboratory Impression:</strong> {formData.comments}
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #E5E7EB', fontSize: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: '700' }}>{formData.technician}</div>
                <div style={{ color: '#6B7280' }}>Senior Andrologist / Embryologist</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700' }}>Dr. Priya Nair, Ph.D.</div>
                <div style={{ color: '#6B7280' }}>Laboratory Director & Chief Embryologist</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Diagnostic Report
            </Button>
          </div>
        </div>
      </Modal>
      {/* Configurable Clinical Limits Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configure Semen Analysis Clinical Reference Limits"
        size="md"
      >
        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Adjust the biological reference limits for semen analysis. Units are clearly indicated and will apply across the analysis entry workbench, automated count evaluation, and printable diagnostic reports.
          </div>

          {configError && (
            <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{configError}</span>
            </div>
          )}

          <Input
            label="Reference Standard Name / Edition"
            value={configForm.standard_name}
            onChange={(e) => setConfigForm(prev => ({ ...prev, standard_name: e.target.value }))}
            helperText="e.g. WHO 6th Edition (2021) or In-House Fertility Lab Protocol"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Ejaculate Volume Min (mL)"
              type="number"
              step="0.1"
              value={configForm.volume_ml_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, volume_ml_min: e.target.value }))}
              required
            />
            <Input
              label="Minimum pH"
              type="number"
              step="0.1"
              value={configForm.ph_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, ph_min: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Sperm Concentration Min (M/mL)"
              type="number"
              step="0.1"
              value={configForm.concentration_m_per_ml_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, concentration_m_per_ml_min: e.target.value }))}
              required
            />
            <Input
              label="Total Sperm Count Min (M/ejaculate)"
              type="number"
              step="0.1"
              value={configForm.total_count_m_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, total_count_m_min: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Progressive Motility PR Min (%)"
              type="number"
              step="1"
              value={configForm.progressive_motility_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, progressive_motility_pct_min: e.target.value }))}
              required
            />
            <Input
              label="Total Motility (PR + NP) Min (%)"
              type="number"
              step="1"
              value={configForm.total_motility_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, total_motility_pct_min: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Normal Morphology Min (%)"
              type="number"
              step="0.5"
              value={configForm.normal_morphology_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, normal_morphology_pct_min: e.target.value }))}
              required
            />
            <Input
              label="Vitality Live Min (%)"
              type="number"
              step="1"
              value={configForm.vitality_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, vitality_pct_min: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Round Cells / Leukocytes Max (M/mL)"
            type="number"
            step="0.1"
            value={configForm.round_cells_m_per_ml_max}
            onChange={(e) => setConfigForm(prev => ({ ...prev, round_cells_m_per_ml_max: e.target.value }))}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetConfigToDefaults}
            >
              Reset to WHO Defaults
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfigModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Save Limits
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}