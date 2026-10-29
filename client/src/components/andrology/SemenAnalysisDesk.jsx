import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  Printer,
  ShieldCheck,
  Layers,
  Sliders,
  Check,
  User
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  SEMEN_ANALYSIS_STATUS_CONFIG,
  WHO_6TH_EDITION_STANDARDS,
  COLLECTION_METHODS,
  SAMPLE_COMPLETENESS_OPTIONS,
  LIQUEFACTION_OPTIONS,
  VISCOSITY_OPTIONS,
  APPEARANCE_OPTIONS,
  AGGLUTINATION_OPTIONS,
  DIAGNOSTIC_IMPRESSIONS
} from './andrologyConstants';
import { INITIAL_SEMEN_ANALYSIS_RECORDS } from './andrologyMockData';
import { formatDateTimeIN } from '../../utils/formatters';
import { useHospitalState, DEFAULT_SEMEN_ANALYSIS_LIMITS } from '../../context/HospitalStateContext';
import sarjiLogo from '../../assets/sarji-logo.png';

export function SemenAnalysisDesk({ onNotify }) {
  const hospitalState = useHospitalState();
  const limits = hospitalState?.semenAnalysisLimits || DEFAULT_SEMEN_ANALYSIS_LIMITS;
  const updateLimits = hospitalState?.updateSemenAnalysisLimits;

  const [records, setRecords] = useState(INITIAL_SEMEN_ANALYSIS_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [impressionFilter, setImpressionFilter] = useState('all');

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(INITIAL_SEMEN_ANALYSIS_RECORDS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Form State
  const defaultFormState = {
    accessionNo: `SA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `SA2026${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: '',
    patientUhid: '',
    age: '',
    spouseName: '',
    orderingDoctor: 'Dr. Arindam Mitra (Reproductive Medicine)',
    clinicalIndication: 'Pre-IVF Workup & Couple Infertility Evaluation',
    collectionDate: new Date().toISOString().slice(0, 16),
    receiptDate: new Date().toISOString().slice(0, 16),
    collectionMethod: 'Masturbation on-site (Private Room 3)',
    sampleCompleteness: 'Complete ejaculate collected',
    abstinenceDays: '3',
    technician: 'Dr. Priya Nair (Lead Embryologist)',
    reviewer: 'Dr. S. K. Roy (Chief Pathologist)',
    status: 'In Analysis',
    // Macroscopic
    volume: '2.5',
    liquefaction: 'Complete (<30 min)',
    viscosity: 'Normal',
    appearance: 'Normal grey-opalescent',
    ph: '7.5',
    // Microscopic
    concentration: '45.0',
    progressiveMotility: '50',
    nonProgressiveMotility: '15',
    immotile: '35',
    normalMorphology: '6',
    abnormalHead: '65',
    abnormalNeck: '18',
    abnormalTail: '11',
    vitality: '76',
    roundCells: '0.4',
    agglutination: 'None',
    diagnosticImpression: 'Normozoospermia',
    comments: 'Ejaculate parameters conform to WHO 6th Edition criteria.'
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Clinical Limits Config State
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

  // Real-time calculations
  const calculatedTotalCount = useMemo(() => {
    const vol = parseFloat(formData.volume) || 0;
    const conc = parseFloat(formData.concentration) || 0;
    return (vol * conc).toFixed(1);
  }, [formData.volume, formData.concentration]);

  const calculatedTotalMotility = useMemo(() => {
    const pr = parseFloat(formData.progressiveMotility) || 0;
    const np = parseFloat(formData.nonProgressiveMotility) || 0;
    return (pr + np).toFixed(0);
  }, [formData.progressiveMotility, formData.nonProgressiveMotility]);

  const calculatedTotalMotileCount = useMemo(() => {
    const totalCount = parseFloat(calculatedTotalCount) || 0;
    const totalMotilityPct = parseFloat(calculatedTotalMotility) || 0;
    return ((totalCount * totalMotilityPct) / 100).toFixed(1);
  }, [calculatedTotalCount, calculatedTotalMotility]);

  const motilitySum = useMemo(() => {
    const pr = parseFloat(formData.progressiveMotility) || 0;
    const np = parseFloat(formData.nonProgressiveMotility) || 0;
    const im = parseFloat(formData.immotile) || 0;
    return Math.round(pr + np + im);
  }, [formData.progressiveMotility, formData.nonProgressiveMotility, formData.immotile]);

  // Form field handler
  const handleFormFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validation function
  const validateForm = () => {
    const errs = {};
    if (!formData.patientName?.trim()) errs.patientName = 'Patient name is required.';
    if (!formData.patientUhid?.trim()) errs.patientUhid = 'Patient UHID is required.';

    const vol = parseFloat(formData.volume);
    const conc = parseFloat(formData.concentration);
    const ph = parseFloat(formData.ph);
    const morph = parseFloat(formData.normalMorphology);
    const vit = parseFloat(formData.vitality);

    if (isNaN(vol) || vol <= 0) errs.volume = 'Volume must be a positive number (>0 mL).';
    if (isNaN(conc) || conc < 0) errs.concentration = 'Concentration cannot be negative.';
    if (isNaN(ph) || ph < 5 || ph > 10) errs.ph = 'pH must be physiologically valid (between 5.0 and 10.0).';
    if (isNaN(morph) || morph < 0 || morph > 100) errs.normalMorphology = 'Morphology must be between 0% and 100%.';
    if (isNaN(vit) || vit < 0 || vit > 100) errs.vitality = 'Vitality must be between 0% and 100%.';

    if (motilitySum !== 100) {
      errs.motilitySum = `Motility categories (PR ${formData.progressiveMotility}% + NP ${formData.nonProgressiveMotility}% + IM ${formData.immotile}%) must sum to exactly 100% (currently ${motilitySum}%).`;
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Open modal for new entry
  const handleOpenNewEntry = () => {
    setIsEditing(false);
    setValidationErrors({});
    const newAccession = `SA-2026-0${Math.floor(500 + Math.random() * 400)}`;
    setFormData({
      ...defaultFormState,
      accessionNo: newAccession,
      barcode: newAccession.replace(/[^0-9]/g, 'SA'),
      patientUhid: `UHID-2026-0${Math.floor(200 + Math.random() * 700)}`,
      collectionDate: new Date().toISOString().slice(0, 16),
      receiptDate: new Date().toISOString().slice(0, 16)
    });
    setIsEntryModalOpen(true);
  };

  // Open modal for editing record
  const handleOpenEditEntry = (rec) => {
    setIsEditing(true);
    setValidationErrors({});
    setSelectedRecord(rec);
    setFormData({
      accessionNo: rec.accessionNo,
      barcode: rec.barcode,
      patientName: rec.patientName,
      patientUhid: rec.patientUhid,
      age: String(rec.age || ''),
      spouseName: rec.spouseName || '',
      orderingDoctor: rec.orderingDoctor || 'Dr. Arindam Mitra',
      clinicalIndication: rec.clinicalIndication || 'Pre-IVF Assessment',
      collectionDate: rec.collectionDate ? rec.collectionDate.slice(0, 16) : '',
      receiptDate: rec.receiptDate ? rec.receiptDate.slice(0, 16) : '',
      collectionMethod: rec.collectionMethod || COLLECTION_METHODS[0],
      sampleCompleteness: rec.sampleCompleteness || SAMPLE_COMPLETENESS_OPTIONS[0],
      abstinenceDays: String(rec.abstinenceDays || '3'),
      technician: rec.technician || 'Dr. Priya Nair',
      reviewer: rec.reviewer || 'Dr. S. K. Roy',
      status: rec.status,
      volume: String(rec.volume || '2.5'),
      liquefaction: rec.liquefaction || LIQUEFACTION_OPTIONS[0],
      viscosity: rec.viscosity || VISCOSITY_OPTIONS[0],
      appearance: rec.appearance || APPEARANCE_OPTIONS[0],
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
      roundCells: String(rec.roundCells || '0.4'),
      agglutination: rec.agglutination || 'None',
      diagnosticImpression: rec.diagnosticImpression || 'Normozoospermia',
      comments: rec.comments || ''
    });
    setIsEntryModalOpen(true);
  };

  // Save as Draft
  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!formData.patientName?.trim() || !formData.patientUhid?.trim()) {
      setValidationErrors({
        patientName: !formData.patientName?.trim() ? 'Patient name is required for draft.' : undefined,
        patientUhid: !formData.patientUhid?.trim() ? 'Patient UHID is required for draft.' : undefined
      });
      return;
    }

    const recordPayload = {
      ...formData,
      id: isEditing ? selectedRecord.id : `sa-${Date.now()}`,
      age: parseInt(formData.age, 10) || 30,
      volume: parseFloat(formData.volume) || 0,
      ph: parseFloat(formData.ph) || 7.2,
      concentration: parseFloat(formData.concentration) || 0,
      totalCount: parseFloat(calculatedTotalCount) || 0,
      progressiveMotility: parseInt(formData.progressiveMotility, 10) || 0,
      nonProgressiveMotility: parseInt(formData.nonProgressiveMotility, 10) || 0,
      immotile: parseInt(formData.immotile, 10) || 0,
      totalMotility: parseInt(calculatedTotalMotility, 10) || 0,
      totalMotileCount: parseFloat(calculatedTotalMotileCount) || 0,
      normalMorphology: parseInt(formData.normalMorphology, 10) || 0,
      vitality: parseInt(formData.vitality, 10) || 0,
      roundCells: parseFloat(formData.roundCells) || 0,
      status: 'Draft Saved',
      isDraft: true,
      updated_at: new Date().toISOString()
    };

    setRecords(prev => {
      const filtered = prev.filter(r => r.accessionNo !== recordPayload.accessionNo);
      return [recordPayload, ...filtered];
    });

    setIsEntryModalOpen(false);
    onNotify?.(`Draft saved for accession ${recordPayload.accessionNo}.`);
  };

  // Submit / Finalize Analysis
  const handleSubmitFinalize = (e, targetStatus = 'Verified') => {
    e.preventDefault();
    if (!validateForm()) return;

    const recordPayload = {
      ...formData,
      id: isEditing ? selectedRecord.id : `sa-${Date.now()}`,
      age: parseInt(formData.age, 10) || 32,
      abstinenceDays: parseInt(formData.abstinenceDays, 10) || 3,
      volume: parseFloat(formData.volume),
      ph: parseFloat(formData.ph),
      concentration: parseFloat(formData.concentration),
      totalCount: parseFloat(calculatedTotalCount),
      progressiveMotility: parseInt(formData.progressiveMotility, 10),
      nonProgressiveMotility: parseInt(formData.nonProgressiveMotility, 10),
      immotile: parseInt(formData.immotile, 10),
      totalMotility: parseInt(calculatedTotalMotility, 10),
      totalMotileCount: parseFloat(calculatedTotalMotileCount),
      normalMorphology: parseInt(formData.normalMorphology, 10),
      abnormalHead: parseInt(formData.abnormalHead, 10) || 0,
      abnormalNeck: parseInt(formData.abnormalNeck, 10) || 0,
      abnormalTail: parseInt(formData.abnormalTail, 10) || 0,
      vitality: parseInt(formData.vitality, 10),
      roundCells: parseFloat(formData.roundCells),
      status: targetStatus,
      isDraft: false,
      updated_at: new Date().toISOString()
    };

    setRecords(prev => {
      const filtered = prev.filter(r => r.accessionNo !== recordPayload.accessionNo);
      return [recordPayload, ...filtered];
    });

    setSelectedRecord(recordPayload);
    setIsEntryModalOpen(false);
    onNotify?.(`Analysis ${recordPayload.accessionNo} saved as ${targetStatus}.`);
  };

  // Save Reference Limits Config
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
    if (isNaN(ph) || ph < 5 || ph > 9) {
      setConfigError('pH minimum must be between 5.0 and 9.0.');
      return;
    }
    if (isNaN(conc) || conc <= 0) {
      setConfigError('Sperm Concentration minimum must be greater than 0 M/mL.');
      return;
    }
    if (isNaN(tc) || tc <= 0) {
      setConfigError('Total Sperm Count minimum must be greater than 0 M.');
      return;
    }
    if (isNaN(pr) || pr < 0 || pr > 100) {
      setConfigError('Progressive Motility percentage must be between 0% and 100%.');
      return;
    }

    const validatedLimits = {
      standard_name: (configForm.standard_name || 'WHO 6th Edition (2021)').trim(),
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
    onNotify?.(`Clinical reference thresholds updated to "${validatedLimits.standard_name}".`);
  };

  // Filtered Records List
  const filteredList = useMemo(() => {
    return records.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.accessionNo.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.patientUhid.toLowerCase().includes(q) ||
        (item.technician && item.technician.toLowerCase().includes(q)) ||
        (item.diagnosticImpression && item.diagnosticImpression.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesImpression =
        impressionFilter === 'all' ||
        (item.diagnosticImpression && item.diagnosticImpression.toLowerCase().includes(impressionFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesImpression;
    });
  }, [records, searchTerm, statusFilter, impressionFilter]);

  // KPI Metrics
  const totalCount = records.length;
  const verifiedCount = records.filter(r => r.status === 'Verified' || r.status === 'Finalized').length;
  const inAnalysisCount = records.filter(r => r.status === 'In Analysis' || r.status === 'Draft Saved').length;
  const abnormalCount = records.filter(r => r.diagnosticImpression && r.diagnosticImpression !== 'Normozoospermia').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Total Analysis Accessions
            </span>
            <FlaskConical size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Diagnostic andrology worklist logs
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Verified & Finalized
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {verifiedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Pathologist sign-off completed
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              In Analysis / Drafts
            </span>
            <Clock size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {inAnalysisCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Workstations currently entering data
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Abnormal / Sub-fertile
            </span>
            <AlertTriangle size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {abnormalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            OAT, Oligo, or Astheno patterns
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search Accession, Patient, UHID..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Verified', label: 'Verified' },
                  { value: 'Finalized', label: 'Finalized' },
                  { value: 'In Analysis', label: 'In Analysis' },
                  { value: 'Draft Saved', label: 'Draft Saved' },
                  { value: 'Under Review', label: 'Under Review' }
                ]}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                value={impressionFilter}
                onChange={(e) => setImpressionFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Impressions' },
                  { value: 'Normozoospermia', label: 'Normozoospermia' },
                  { value: 'Oligozoospermia', label: 'Oligozoospermia' },
                  { value: 'Asthenozoospermia', label: 'Asthenozoospermia' },
                  { value: 'Teratozoospermia', label: 'Teratozoospermia' },
                  { value: 'Oligoasthenoteratozoospermia', label: 'OAT Pattern' },
                  { value: 'Azoospermia', label: 'Azoospermia' },
                  { value: 'Surgical', label: 'Surgical Aspirate' }
                ]}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => {
                setConfigForm({
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
                });
                setConfigError(null);
                setIsConfigModalOpen(true);
              }}
              title="Configure laboratory reference ranges"
            >
              WHO Reference Ranges
            </Button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenNewEntry}
          >
            New Semen Analysis
          </Button>
        </div>
      </Card>

      {/* Main Listing Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Accession & Barcode
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Patient & UHID
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Collection Details
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Key Laboratory Results
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Diagnostic Impression
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Technician / Reviewer
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Report Status
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
                    No semen analysis accessions match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = SEMEN_ANALYSIS_STATUS_CONFIG[item.status] || SEMEN_ANALYSIS_STATUS_CONFIG['Draft Saved'];
                  const StatusIcon = statusConf.icon;

                  const isVolLow = item.volume < limits.volume_ml_min;
                  const isConcLow = item.concentration < limits.concentration_m_per_ml_min;
                  const isMotLow = item.progressiveMotility < limits.progressive_motility_pct_min;
                  const isMorphLow = item.normalMorphology < limits.normal_morphology_pct_min;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      {/* Accession & Barcode */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                          {item.accessionNo}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                          BC: {item.barcode}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-primary-teal)', marginTop: '3px' }}>
                          WHO 6th Manual Ed.
                        </div>
                      </td>

                      {/* Patient & UHID */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {item.patientName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.patientUhid} • {item.age} yrs
                        </div>
                        {item.spouseName && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Spouse: {item.spouseName}
                          </div>
                        )}
                      </td>

                      {/* Collection Details */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '240px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {formatDateTimeIN(item.collectionDate)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.collectionMethod}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: '2px' }}>
                          Abstinence: <strong>{item.abstinenceDays} days</strong>
                        </div>
                      </td>

                      {/* Key Results */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 12px', fontSize: '0.75rem' }}>
                          <div>
                            Vol: <strong style={{ color: isVolLow ? 'var(--color-error)' : 'inherit' }}>{item.volume} mL</strong>
                          </div>
                          <div>
                            Conc: <strong style={{ color: isConcLow ? 'var(--color-error)' : 'inherit' }}>{item.concentration} M/mL</strong>
                          </div>
                          <div>
                            PR Mot: <strong style={{ color: isMotLow ? 'var(--color-error)' : 'inherit' }}>{item.progressiveMotility}%</strong>
                          </div>
                          <div>
                            Morph: <strong style={{ color: isMorphLow ? 'var(--color-error)' : 'inherit' }}>{item.normalMorphology}%</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Total Count: <strong>{item.totalCount} M</strong> (Motile: {item.totalMotileCount || (item.totalCount * (item.totalMotility / 100)).toFixed(1)} M)
                        </div>
                      </td>

                      {/* Impression */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '220px' }}>
                        <div style={{ fontWeight: '600', color: item.diagnosticImpression === 'Normozoospermia' ? 'var(--color-success)' : '#B45309' }}>
                          {item.diagnosticImpression || 'Under Analysis'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.comments ? `${item.comments.slice(0, 65)}...` : 'Pending final review'}
                        </div>
                      </td>

                      {/* Staff */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {item.technician || 'Technician'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Rev: {item.reviewer || 'Senior Embryologist'}
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
                              setSelectedRecord(item);
                              setIsReportModalOpen(true);
                            }}
                            title="View Diagnostic Report"
                          >
                            Report
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            icon={Edit3}
                            onClick={() => handleOpenEditEntry(item)}
                            title="Edit / Enter Results"
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Printer}
                            onClick={() => {
                              setSelectedRecord(item);
                              setIsLabelModalOpen(true);
                            }}
                            title="Print Specimen Tube Barcode Label"
                          >
                            Label
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

      {/* Analysis Entry & Edit Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title={isEditing ? `Edit Semen Analysis — ${formData.accessionNo}` : 'New Semen Analysis Entry'}
        subtitle="WHO 6th Edition compliant macroscopic & microscopic analysis with live kinetic derivations"
        maxWidth="950px"
      >
        <form onSubmit={(e) => handleSubmitFinalize(e, 'Verified')} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Section 1: Demographics & Collection */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} /> 1. Patient Demographics & Collection Conditions
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Input
                label="Patient Name"
                required
                value={formData.patientName}
                onChange={(e) => handleFormFieldChange('patientName', e.target.value)}
                error={validationErrors.patientName}
                placeholder="e.g. Rahul Sengupta"
              />
              <Input
                label="Patient UHID"
                required
                value={formData.patientUhid}
                onChange={(e) => handleFormFieldChange('patientUhid', e.target.value)}
                error={validationErrors.patientUhid}
                placeholder="e.g. UHID-2026-0814"
              />
              <Input
                label="Age (Years)"
                type="number"
                value={formData.age}
                onChange={(e) => handleFormFieldChange('age', e.target.value)}
                placeholder="e.g. 34"
              />
              <Input
                label="Spouse Name"
                value={formData.spouseName}
                onChange={(e) => handleFormFieldChange('spouseName', e.target.value)}
                placeholder="e.g. Devika Sengupta"
              />
              <Input
                label="Collection Date & Time"
                type="datetime-local"
                value={formData.collectionDate}
                onChange={(e) => handleFormFieldChange('collectionDate', e.target.value)}
              />
              <Input
                label="Receipt in Lab Date & Time"
                type="datetime-local"
                value={formData.receiptDate}
                onChange={(e) => handleFormFieldChange('receiptDate', e.target.value)}
              />
              <Select
                label="Collection Method"
                value={formData.collectionMethod}
                onChange={(e) => handleFormFieldChange('collectionMethod', e.target.value)}
                options={COLLECTION_METHODS}
              />
              <Select
                label="Sample Completeness"
                value={formData.sampleCompleteness}
                onChange={(e) => handleFormFieldChange('sampleCompleteness', e.target.value)}
                options={SAMPLE_COMPLETENESS_OPTIONS}
              />
              <Input
                label="Abstinence Duration (Days)"
                type="number"
                value={formData.abstinenceDays}
                onChange={(e) => handleFormFieldChange('abstinenceDays', e.target.value)}
                placeholder="2-7 days recommended"
                helperText="WHO reference recommendation: 2 to 7 days"
              />
            </div>
          </div>

          {/* Section 2: Macroscopic Examination */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={15} /> 2. Macroscopic Examination (Physical Parameters)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Input
                label="Ejaculate Volume (mL)"
                required
                type="number"
                step="0.1"
                value={formData.volume}
                onChange={(e) => handleFormFieldChange('volume', e.target.value)}
                error={validationErrors.volume}
                helperText={`WHO Reference: ≥ ${limits.volume_ml_min} mL`}
              />
              <Input
                label="pH (Acidity/Alkalinity)"
                required
                type="number"
                step="0.1"
                value={formData.ph}
                onChange={(e) => handleFormFieldChange('ph', e.target.value)}
                error={validationErrors.ph}
                helperText={`WHO Reference: ≥ ${limits.ph_min}`}
              />
              <Select
                label="Liquefaction Time"
                value={formData.liquefaction}
                onChange={(e) => handleFormFieldChange('liquefaction', e.target.value)}
                options={LIQUEFACTION_OPTIONS}
              />
              <Select
                label="Viscosity"
                value={formData.viscosity}
                onChange={(e) => handleFormFieldChange('viscosity', e.target.value)}
                options={VISCOSITY_OPTIONS}
              />
              <Select
                label="Appearance"
                value={formData.appearance}
                onChange={(e) => handleFormFieldChange('appearance', e.target.value)}
                options={APPEARANCE_OPTIONS}
              />
            </div>
          </div>

          {/* Section 3: Microscopic Examination & Motility */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} /> 3. Microscopic Evaluation (Kinetic & Morphological Metrics)
              </h4>
              <Badge variant={motilitySum === 100 ? 'success' : 'danger'} size="sm">
                Motility Sum: {motilitySum}% / 100%
              </Badge>
            </div>

            {validationErrors.motilitySum && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.75rem', marginBottom: '12px' }}>
                {validationErrors.motilitySum}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Input
                label="Sperm Concentration (M/mL)"
                required
                type="number"
                step="0.1"
                value={formData.concentration}
                onChange={(e) => handleFormFieldChange('concentration', e.target.value)}
                error={validationErrors.concentration}
                helperText={`WHO Ref: ≥ ${limits.concentration_m_per_ml_min} M/mL`}
              />
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Total Sperm Count (M)
                </label>
                <div style={{ padding: '9px 14px', backgroundColor: '#E2E8F0', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginTop: '6px' }}>
                  {calculatedTotalCount} M <span style={{ fontSize: '0.72rem', fontWeight: 'normal', color: '#64748B' }}>(Vol × Conc)</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>WHO Ref: ≥ {limits.total_count_m_min} M</span>
              </div>

              <Input
                label="Progressive Motility (PR %)"
                required
                type="number"
                value={formData.progressiveMotility}
                onChange={(e) => handleFormFieldChange('progressiveMotility', e.target.value)}
                helperText={`WHO Ref: ≥ ${limits.progressive_motility_pct_min}%`}
              />
              <Input
                label="Non-Progressive Motility (NP %)"
                required
                type="number"
                value={formData.nonProgressiveMotility}
                onChange={(e) => handleFormFieldChange('nonProgressiveMotility', e.target.value)}
              />
              <Input
                label="Immotile Sperm (IM %)"
                required
                type="number"
                value={formData.immotile}
                onChange={(e) => handleFormFieldChange('immotile', e.target.value)}
              />

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Total Motility (PR + NP %)
                </label>
                <div style={{ padding: '9px 14px', backgroundColor: '#E2E8F0', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.9rem', color: '#1E293B', marginTop: '6px' }}>
                  {calculatedTotalMotility}% <span style={{ fontSize: '0.72rem', fontWeight: 'normal', color: '#64748B' }}>(PR + NP)</span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>WHO Ref: ≥ {limits.total_motility_pct_min}%</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px' }}>
              <Input
                label="Normal Morphology (Strict %)"
                required
                type="number"
                value={formData.normalMorphology}
                onChange={(e) => handleFormFieldChange('normalMorphology', e.target.value)}
                error={validationErrors.normalMorphology}
                helperText={`Kruger strict criteria; WHO Ref: ≥ ${limits.normal_morphology_pct_min}%`}
              />
              <Input
                label="Vitality / Viability (%)"
                required
                type="number"
                value={formData.vitality}
                onChange={(e) => handleFormFieldChange('vitality', e.target.value)}
                error={validationErrors.vitality}
                helperText={`Eosin-Nigrosin test; WHO Ref: ≥ ${limits.vitality_pct_min}%`}
              />
              <Input
                label="Leukocytes / Round Cells (M/mL)"
                type="number"
                step="0.1"
                value={formData.roundCells}
                onChange={(e) => handleFormFieldChange('roundCells', e.target.value)}
                helperText={`WHO Reference: < ${limits.round_cells_m_per_ml_max} M/mL`}
              />
              <Select
                label="Agglutination Pattern"
                value={formData.agglutination}
                onChange={(e) => handleFormFieldChange('agglutination', e.target.value)}
                options={AGGLUTINATION_OPTIONS}
              />
            </div>
          </div>

          {/* Section 4: Interpretation & Staff */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} /> 4. Clinical Impression & Authorization
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <Select
                label="Diagnostic Impression Category"
                value={formData.diagnosticImpression}
                onChange={(e) => handleFormFieldChange('diagnosticImpression', e.target.value)}
                options={DIAGNOSTIC_IMPRESSIONS}
              />
              <Input
                label="Operating Technician"
                value={formData.technician}
                onChange={(e) => handleFormFieldChange('technician', e.target.value)}
              />
              <Input
                label="Reviewing Pathologist / Embryologist"
                value={formData.reviewer}
                onChange={(e) => handleFormFieldChange('reviewer', e.target.value)}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                Laboratory Observations & Clinical Recommendations
              </label>
              <textarea
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                  minHeight: '70px',
                  resize: 'vertical'
                }}
                value={formData.comments}
                onChange={(e) => handleFormFieldChange('comments', e.target.value)}
                placeholder="Remarks regarding cryopreservation suitability, post-wash recovery, repeat recommendations, or clinical flags..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEntryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="soft"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
            >
              Validate & Finalize Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* WHO Reference Limits Config Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="WHO Laboratory Reference Ranges"
        subtitle="Manage baseline cut-offs for macroscopic & microscopic semen analysis verification"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px' }}>
          {configError && (
            <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.78rem' }}>
              {configError}
            </div>
          )}

          <Input
            label="Standard Guidelines Reference Name"
            value={configForm.standard_name}
            onChange={(e) => setConfigForm(prev => ({ ...prev, standard_name: e.target.value }))}
            placeholder="WHO 6th Edition (2021)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Volume Min (mL)"
              type="number"
              step="0.1"
              value={configForm.volume_ml_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, volume_ml_min: e.target.value }))}
            />
            <Input
              label="pH Min"
              type="number"
              step="0.1"
              value={configForm.ph_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, ph_min: e.target.value }))}
            />
            <Input
              label="Concentration Min (M/mL)"
              type="number"
              step="0.1"
              value={configForm.concentration_m_per_ml_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, concentration_m_per_ml_min: e.target.value }))}
            />
            <Input
              label="Total Sperm Count Min (M)"
              type="number"
              step="0.1"
              value={configForm.total_count_m_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, total_count_m_min: e.target.value }))}
            />
            <Input
              label="Progressive Motility Min (PR %)"
              type="number"
              value={configForm.progressive_motility_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, progressive_motility_pct_min: e.target.value }))}
            />
            <Input
              label="Total Motility Min (PR+NP %)"
              type="number"
              value={configForm.total_motility_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, total_motility_pct_min: e.target.value }))}
            />
            <Input
              label="Normal Morphology Min (Strict %)"
              type="number"
              value={configForm.normal_morphology_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, normal_morphology_pct_min: e.target.value }))}
            />
            <Input
              label="Vitality Min (%)"
              type="number"
              value={configForm.vitality_pct_min}
              onChange={(e) => setConfigForm(prev => ({ ...prev, vitality_pct_min: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setConfigForm({
                  standard_name: 'WHO 6th Edition (2021)',
                  ...WHO_6TH_EDITION_STANDARDS
                });
              }}
            >
              Reset to WHO 2021 Defaults
            </Button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Thresholds
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Diagnostic Laboratory Report Preview Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Andrology Diagnostic Laboratory Report"
        subtitle={`Sample Accession: ${selectedRecord?.accessionNo} • Patient: ${selectedRecord?.patientName}`}
        maxWidth="850px"
      >
        <div style={{ padding: '20px 24px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Printable Report Header */}
          <div
            style={{
              padding: '16px 20px',
              border: '1.5px solid #CBD5E1',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={sarjiLogo} alt="Hospital Logo" style={{ height: '48px', objectFit: 'contain' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary-teal)', fontWeight: '800' }}>
                    SARJI IVF & ANDROLOGY CENTRE
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Department of Reproductive Medicine & Assisted Reproductive Technology • NABH Accredited
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge variant="teal" size="sm">WHO 6th Ed. (2021)</Badge>
                <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: '700', marginTop: '4px' }}>
                  {selectedRecord?.accessionNo}
                </div>
              </div>
            </div>

            {/* Patient Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px', padding: '12px 0', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
              <div><strong>Patient Name:</strong> {selectedRecord?.patientName}</div>
              <div><strong>UHID:</strong> {selectedRecord?.patientUhid}</div>
              <div><strong>Age:</strong> {selectedRecord?.age} Yrs</div>
              <div><strong>Spouse Name:</strong> {selectedRecord?.spouseName || 'N/A'}</div>
              <div><strong>Ref. Doctor:</strong> {selectedRecord?.orderingDoctor || 'Dr. Arindam Mitra'}</div>
              <div><strong>Abstinence:</strong> {selectedRecord?.abstinenceDays || 3} Days</div>
              <div><strong>Collection Date:</strong> {formatDateTimeIN(selectedRecord?.collectionDate)}</div>
              <div><strong>Collection Method:</strong> {selectedRecord?.collectionMethod}</div>
              <div><strong>Completeness:</strong> {selectedRecord?.sampleCompleteness || 'Complete ejaculate'}</div>
            </div>

            {/* Test Results Table */}
            <h4 style={{ margin: '14px 0 8px', fontSize: '0.84rem', color: 'var(--color-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              1. Physical & Macroscopic Examination
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Parameter</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Observed Result</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>WHO 6th Edition Reference Interval</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Liquefaction Time</td>
                  <td style={{ padding: '6px 10px', fontWeight: '600' }}>{selectedRecord?.liquefaction}</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>Complete within 60 minutes at 37°C</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Viscosity</td>
                  <td style={{ padding: '6px 10px', fontWeight: '600' }}>{selectedRecord?.viscosity}</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>Normal (discrete drops or thread &lt; 2 cm)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Appearance</td>
                  <td style={{ padding: '6px 10px', fontWeight: '600' }}>{selectedRecord?.appearance}</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>Normal grey-opalescent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Ejaculate Volume</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.volume < limits.volume_ml_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.volume} mL
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.volume_ml_min} mL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>pH</td>
                  <td style={{ padding: '6px 10px', fontWeight: '600' }}>{selectedRecord?.ph}</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.ph_min}</td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ margin: '14px 0 8px', fontSize: '0.84rem', color: 'var(--color-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              2. Microscopic Examination & Kinetic Indices
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Parameter</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Observed Result</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>WHO 6th Edition Reference Interval</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Sperm Concentration</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.concentration < limits.concentration_m_per_ml_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.concentration} Million/mL
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.concentration_m_per_ml_min} Million/mL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Total Sperm Count</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700' }}>{selectedRecord?.totalCount} Million/ejaculate</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.total_count_m_min} Million/ejaculate</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Progressive Motility (PR)</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.progressiveMotility < limits.progressive_motility_pct_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.progressiveMotility} %
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.progressive_motility_pct_min} %</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Non-Progressive Motility (NP)</td>
                  <td style={{ padding: '6px 10px' }}>{selectedRecord?.nonProgressiveMotility} %</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>-</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Immotile (IM)</td>
                  <td style={{ padding: '6px 10px' }}>{selectedRecord?.immotile} %</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>-</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Total Motility (PR + NP)</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.totalMotility < limits.total_motility_pct_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.totalMotility} %
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.total_motility_pct_min} %</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Total Motile Sperm Count (TMSC)</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700' }}>
                    {selectedRecord?.totalMotileCount || (selectedRecord?.totalCount * (selectedRecord?.totalMotility / 100)).toFixed(1)} Million
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>&gt; 20 M ideal for IUI; &gt; 5 M acceptable for IVF</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Normal Morphology (Strict Kruger)</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.normalMorphology < limits.normal_morphology_pct_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.normalMorphology} %
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.normal_morphology_pct_min} % strict forms</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Vitality (Eosin-Nigrosin)</td>
                  <td style={{ padding: '6px 10px', fontWeight: '700', color: selectedRecord?.vitality < limits.vitality_pct_min ? '#DC2626' : '#0F172A' }}>
                    {selectedRecord?.vitality} %
                  </td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>≥ {limits.vitality_pct_min} % live cells</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Round Cells / Leukocytes</td>
                  <td style={{ padding: '6px 10px' }}>{selectedRecord?.roundCells} Million/mL</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>&lt; {limits.round_cells_m_per_ml_max} Million/mL</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 10px' }}>Agglutination</td>
                  <td style={{ padding: '6px 10px' }}>{selectedRecord?.agglutination}</td>
                  <td style={{ padding: '6px 10px', color: '#64748B' }}>None / Isolated</td>
                </tr>
              </tbody>
            </table>

            {/* Diagnostic Impression Box */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary-teal)', margin: '12px 0' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0F172A' }}>
                DIAGNOSTIC IMPRESSION: {selectedRecord?.diagnosticImpression?.toUpperCase() || 'NORMOZOOSPERMIA'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                {selectedRecord?.comments || 'Report verified and signed.'}
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #CBD5E1', fontSize: '0.76rem' }}>
              <div>
                <div style={{ fontWeight: '600' }}>{selectedRecord?.technician || 'Operating Embryologist'}</div>
                <div style={{ color: '#64748B' }}>Andrology Technical Officer</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Badge variant="success" size="sm">
                  <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                  DIGITALLY SIGNED & VERIFIED
                </Badge>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600' }}>{selectedRecord?.reviewer || 'Dr. S. K. Roy'}</div>
                <div style={{ color: '#64748B' }}>Consultant Pathologist & Lab Director</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                window.print();
              }}
            >
              Print Formal Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Barcode Label Modal */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Direct Thermal Tube Label Preview"
        subtitle={`Barcode: ${selectedRecord?.barcode} • Accession: ${selectedRecord?.accessionNo}`}
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div
            style={{
              width: '260px',
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              border: '2px dashed #94A3B8',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0F172A', letterSpacing: '0.04em' }}>
              SARJI HOSPITAL ANDROLOGY
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', marginTop: '4px', color: '#0F172A' }}>
              {selectedRecord?.patientName}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#475569' }}>
              {selectedRecord?.patientUhid} • {selectedRecord?.age}Y
            </div>
            {/* Monospace Barcode representation */}
            <div style={{ margin: '8px 0', padding: '6px', backgroundColor: '#000000', color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '4px', fontSize: '0.86rem', fontWeight: 'bold' }}>
              ||| | |||| | ||| ||
            </div>
            <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: '700' }}>
              {selectedRecord?.barcode}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748B', marginTop: '4px' }}>
              ACC: {selectedRecord?.accessionNo} • {formatDateTimeIN(selectedRecord?.collectionDate)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsLabelModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => {
                onNotify?.(`Direct thermal label printed for sample ${selectedRecord?.accessionNo}.`);
                setIsLabelModalOpen(false);
              }}
            >
              Print 25×10mm Tube Label
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
