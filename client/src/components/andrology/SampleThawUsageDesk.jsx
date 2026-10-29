import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Plus,
  CheckCircle2,
  Eye,
  Printer,
  Tag,
  Archive,
  Check,
  HeartPulse,
  Activity
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  THAW_STATUS_CONFIG,
  THAW_PROTOCOLS,
  THAW_INDICATIONS
} from './andrologyConstants';
import { INITIAL_THAW_RECORDS, INITIAL_CRYO_SPECIMENS } from './andrologyMockData';
import { formatDateTimeIN } from '../../utils/formatters';

export function SampleThawUsageDesk({ onNotify }) {
  const [thawRecords, setThawRecords] = useState(INITIAL_THAW_RECORDS);
  const [cryoInventory, setCryoInventory] = useState(INITIAL_CRYO_SPECIMENS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [indicationFilter, setIndicationFilter] = useState('all');

  // Modals state
  const [isThawModalOpen, setIsThawModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedThawRecord, setSelectedThawRecord] = useState(INITIAL_THAW_RECORDS[0]);
  const [validationErrors, setValidationErrors] = useState({});

  // New Thaw Form State
  const defaultFormState = {
    selectedCryoId: '',
    strawsToRetrieveCount: 1,
    selectedStrawIds: [],
    thawDate: new Date().toISOString().slice(0, 16),
    protocol: THAW_PROTOCOLS[0],
    washMethod: 'Density Gradient Centrifugation (Sil-Select 80%/40%)',
    indication: THAW_INDICATIONS[0],
    linkedProcedureCycle: `Cycle #IVF-${new Date().getFullYear()}-0${Math.floor(10 + Math.random() * 40)}`,
    postThawMotility: '44',
    postThawVitality: '68',
    cryoRecoveryRate: '71',
    treatingPhysician: 'Dr. Arindam Mitra (Reproductive Medicine)',
    operatingEmbryologist: 'Dr. Priya Nair (Lead Embryologist)',
    witnessEmbryologist: 'Mr. Anik Mukherjee (Senior Andrologist)',
    consentConfirmed: true,
    serologyCleared: true,
    status: 'Utilized Successfully',
    notes: 'Rapid thaw completed; sperm motility and recovery acceptable for micro-injection.'
  };

  const [thawForm, setThawForm] = useState(defaultFormState);

  // Currently selected specimen details
  const selectedSpecimenForThaw = useMemo(() => {
    return cryoInventory.find(s => s.id === thawForm.selectedCryoId) || null;
  }, [cryoInventory, thawForm.selectedCryoId]);

  // Available straws from selected specimen
  const availableStrawsList = useMemo(() => {
    if (!selectedSpecimenForThaw) return [];
    const allStraws = selectedSpecimenForThaw.storageLocation?.strawIds || [];
    const remainingCount = selectedSpecimenForThaw.aliquotsRemaining || 0;
    // The first `remainingCount` straws are currently available in inventory
    return allStraws.slice(0, remainingCount);
  }, [selectedSpecimenForThaw]);

  // Open Thaw Modal
  const handleOpenThawModal = (preselectedSpecimen = null) => {
    setValidationErrors({});
    // Find first specimen with remaining straws > 0
    const candidate = preselectedSpecimen || cryoInventory.find(s => s.aliquotsRemaining > 0);
    const initialStraws = candidate?.storageLocation?.strawIds?.slice(0, 1) || [];

    setThawForm({
      ...defaultFormState,
      selectedCryoId: candidate ? candidate.id : '',
      selectedStrawIds: initialStraws,
      strawsToRetrieveCount: 1,
      thawDate: new Date().toISOString().slice(0, 16),
      linkedProcedureCycle: `Cycle #IVF-${new Date().getFullYear()}-0${Math.floor(10 + Math.random() * 40)}`
    });
    setIsThawModalOpen(true);
  };

  // Specimen selection change
  const handleSpecimenSelectionChange = (cryoId) => {
    const found = cryoInventory.find(s => s.id === cryoId);
    const available = found?.storageLocation?.strawIds?.slice(0, 1) || [];
    setThawForm(prev => ({
      ...prev,
      selectedCryoId: cryoId,
      strawsToRetrieveCount: 1,
      selectedStrawIds: available
    }));
  };

  // Toggle straw checkbox
  const handleToggleStrawCheckbox = (strawId) => {
    setThawForm(prev => {
      const current = prev.selectedStrawIds || [];
      const next = current.includes(strawId)
        ? current.filter(id => id !== strawId)
        : [...current, strawId];

      return {
        ...prev,
        selectedStrawIds: next,
        strawsToRetrieveCount: next.length
      };
    });
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!selectedSpecimenForThaw) {
      errs.selectedCryoId = 'Please select a valid cryopreserved specimen with available inventory.';
      setValidationErrors(errs);
      return false;
    }

    if (selectedSpecimenForThaw.aliquotsRemaining <= 0) {
      errs.selectedCryoId = 'This specimen is completely depleted (0 straws available). Please choose another specimen.';
    }

    const count = parseInt(thawForm.strawsToRetrieveCount, 10) || 0;
    if (count <= 0) {
      errs.strawsToRetrieveCount = 'Please select at least 1 straw to retrieve and thaw.';
    } else if (count > selectedSpecimenForThaw.aliquotsRemaining) {
      errs.strawsToRetrieveCount = `Cannot retrieve ${count} straws. Only ${selectedSpecimenForThaw.aliquotsRemaining} straws available in cryo storage.`;
    }

    if (!thawForm.consentConfirmed || !thawForm.serologyCleared) {
      errs.compliance = 'Patient legal consent verification and serology clearance are strictly mandatory before sample retrieval.';
    }

    const postMot = parseFloat(thawForm.postThawMotility);
    if (isNaN(postMot) || postMot < 0 || postMot > 100) {
      errs.postThawMotility = 'Post-thaw motility must be a valid percentage (0–100%).';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleExecuteThawSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const count = parseInt(thawForm.strawsToRetrieveCount, 10);
    const newRemaining = Math.max(0, selectedSpecimenForThaw.aliquotsRemaining - count);

    // 1. Create new immutable thaw record
    const newThawRecord = {
      id: `thaw-${Date.now()}`,
      thawRecordNumber: `THAW-${new Date().getFullYear()}-0${Math.floor(100 + Math.random() * 900)}`,
      cryoContainerId: selectedSpecimenForThaw.containerId,
      patientName: selectedSpecimenForThaw.patientName,
      patientUhid: selectedSpecimenForThaw.patientUhid,
      strawsThawedIds: thawForm.selectedStrawIds.length > 0 ? thawForm.selectedStrawIds : [`${selectedSpecimenForThaw.containerId}-S1`],
      strawsThawedCount: count,
      remainingStrawsAfterThaw: newRemaining,
      thawDate: thawForm.thawDate,
      protocol: thawForm.protocol,
      washMethod: thawForm.washMethod,
      indication: thawForm.indication,
      linkedProcedureCycle: thawForm.linkedProcedureCycle,
      postThawMotility: parseInt(thawForm.postThawMotility, 10),
      postThawVitality: parseInt(thawForm.postThawVitality, 10) || 65,
      cryoRecoveryRate: parseInt(thawForm.cryoRecoveryRate, 10) || 70,
      treatingPhysician: thawForm.treatingPhysician,
      operatingEmbryologist: thawForm.operatingEmbryologist,
      witnessEmbryologist: thawForm.witnessEmbryologist,
      consentConfirmed: thawForm.consentConfirmed,
      serologyCleared: thawForm.serologyCleared,
      status: thawForm.status,
      notes: thawForm.notes,
      created_at: new Date().toISOString()
    };

    // 2. Deduct from Cryo Specimen Inventory (prevent over-consumption)
    setCryoInventory(prev =>
      prev.map(item => {
        if (item.id === selectedSpecimenForThaw.id) {
          return {
            ...item,
            aliquotsRemaining: newRemaining,
            status: newRemaining === 0 ? 'Depleted' : 'Partially Thawed',
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    );

    // 3. Append to Thaw Audit Records
    setThawRecords(prev => [newThawRecord, ...prev]);
    setIsThawModalOpen(false);
    setSelectedThawRecord(newThawRecord);
    onNotify?.(`Thaw record ${newThawRecord.thawRecordNumber} executed. ${count} straw(s) consumed; ${newRemaining} remaining in LN2.`);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return thawRecords.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.thawRecordNumber.toLowerCase().includes(q) ||
        item.cryoContainerId.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.patientUhid.toLowerCase().includes(q) ||
        item.linkedProcedureCycle.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesIndication = indicationFilter === 'all' || item.indication === indicationFilter;

      return matchesSearch && matchesStatus && matchesIndication;
    });
  }, [thawRecords, searchTerm, statusFilter, indicationFilter]);

  // KPI Metrics
  const totalThawCount = thawRecords.length;
  const successfulUsages = thawRecords.filter(t => t.status === 'Utilized Successfully').length;
  const avgSurvivalRate = totalThawCount > 0
    ? Math.round(thawRecords.reduce((acc, curr) => acc + (curr.cryoRecoveryRate || 0), 0) / totalThawCount)
    : 0;
  const totalActiveStrawsInStorage = cryoInventory.reduce((acc, curr) => acc + (curr.aliquotsRemaining || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Total Thaw & Usage Events
            </span>
            <Flame size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalThawCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Aliquot retrieval & warming audit logs
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Procedures Executed
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {successfulUsages}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ICSI, IVF & IUI cycle inseminations
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Avg Post-Thaw Survival
            </span>
            <Activity size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {avgSurvivalRate}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Cryo recovery benchmark (&gt;60% target)
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Remaining Straws in Vault
            </span>
            <Archive size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {totalActiveStrawsInStorage}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Available for future treatments
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search Thaw No, Container, Patient, Cycle..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '240px' }}>
              <Select
                value={indicationFilter}
                onChange={(e) => setIndicationFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Linked Procedures' },
                  ...THAW_INDICATIONS.map(ind => ({ value: ind, label: ind }))
                ]}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Usage Statuses' },
                  { value: 'Utilized Successfully', label: 'Utilized Successfully' },
                  { value: 'Partially Used', label: 'Partially Used' },
                  { value: 'In Procedure', label: 'In Procedure' },
                  { value: 'Discarded / Non-Viable', label: 'Discarded / Non-Viable' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleOpenThawModal()}
          >
            New Thaw / Usage Record
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
                  Thaw Record ID
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Patient / Donor & UHID
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Source Cryo Specimen & Straws
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Thaw Date & Time
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Linked Procedure & Indication
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Post-Thaw Quality
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Embryologists
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Usage Status
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No thaw & usage records match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = THAW_STATUS_CONFIG[item.status] || THAW_STATUS_CONFIG['Utilized Successfully'];
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      {/* Thaw Record ID */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                          {item.thawRecordNumber}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-success)', marginTop: '2px' }}>
                          Consent & Serology Cleared
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
                      </td>

                      {/* Source Cryo Specimen & Straws */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                          {item.cryoContainerId}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#1E293B', marginTop: '2px' }}>
                          Thawed: <strong>{item.strawsThawedIds?.join(', ')}</strong> ({item.strawsThawedCount} straw)
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Remaining in Vault: <strong>{item.remainingStrawsAfterThaw} straws</strong>
                        </div>
                      </td>

                      {/* Thaw Date */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {formatDateTimeIN(item.thawDate)}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          37°C Rapid Warm Protocol
                        </div>
                      </td>

                      {/* Linked Procedure */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '240px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {item.linkedProcedureCycle}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.indication}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Ref Doc: {item.treatingPhysician?.split('(')[0]}
                        </div>
                      </td>

                      {/* Post-Thaw Quality */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#1E293B' }}>
                          Motility: {item.postThawMotility}%
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', marginTop: '2px' }}>
                          Recovery: <strong>{item.cryoRecoveryRate}%</strong>
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                          Vitality: {item.postThawVitality}%
                        </div>
                      </td>

                      {/* Staff */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {item.operatingEmbryologist?.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Wit: {item.witnessEmbryologist?.split('(')[0] || 'Verified'}
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
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => {
                            setSelectedThawRecord(item);
                            setIsCertificateModalOpen(true);
                          }}
                          title="View Official Thaw & Usage Certificate"
                        >
                          Certificate
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Thaw / Usage Record Modal */}
      <Modal
        isOpen={isThawModalOpen}
        onClose={() => setIsThawModalOpen(false)}
        title="Execute Cryo Specimen Thaw & Treatment Linkage"
        subtitle="Mandatory consent verification, straw retrieval deduction, and post-thaw survival assessment"
        maxWidth="900px"
      >
        <form onSubmit={handleExecuteThawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Section 1: Specimen Selection */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Archive size={15} /> 1. Select Active Specimen from Cryo-Bank
            </h4>

            <Select
              label="Cryopreserved Specimen"
              required
              value={thawForm.selectedCryoId}
              onChange={(e) => handleSpecimenSelectionChange(e.target.value)}
              error={validationErrors.selectedCryoId}
              options={cryoInventory
                .filter(s => s.aliquotsRemaining > 0)
                .map(s => ({
                  value: s.id,
                  label: `${s.containerId} • ${s.patientName} (${s.patientUhid}) — ${s.aliquotsRemaining} straws available in ${s.storageLocation?.tank?.split(' ')[1]}`
                }))}
            />

            {selectedSpecimenForThaw && (
              <div style={{ marginTop: '12px', padding: '12px 14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 14px', fontSize: '0.78rem' }}>
                <div><strong>Patient / Donor:</strong> {selectedSpecimenForThaw.patientName}</div>
                <div><strong>UHID:</strong> {selectedSpecimenForThaw.patientUhid}</div>
                <div><strong>Category:</strong> {selectedSpecimenForThaw.category}</div>
                <div><strong>Pre-Freeze Baseline:</strong> {selectedSpecimenForThaw.preFreezeConcentration} • {selectedSpecimenForThaw.preFreezeMotility} motile</div>
                <div><strong>Storage Location:</strong> {selectedSpecimenForThaw.storageLocation?.tank} • {selectedSpecimenForThaw.storageLocation?.canister}</div>
                <div><strong>Available Balance:</strong> <strong style={{ color: 'var(--color-primary-teal)', fontSize: '0.88rem' }}>{selectedSpecimenForThaw.aliquotsRemaining} straws</strong></div>
              </div>
            )}
          </div>

          {/* Section 2: Straw Retrieval & Quantity Deduction */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={15} /> 2. Aliquot Retrieval & Inventory Deduction
            </h4>

            {validationErrors.strawsToRetrieveCount && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.75rem', marginBottom: '12px' }}>
                {validationErrors.strawsToRetrieveCount}
              </div>
            )}

            <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
              Select specific straws to retrieve from canister:
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {availableStrawsList.map(strawId => {
                const isChecked = thawForm.selectedStrawIds?.includes(strawId);
                return (
                  <button
                    type="button"
                    key={strawId}
                    onClick={() => handleToggleStrawCheckbox(strawId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'var(--color-primary-teal)' : '#FFFFFF',
                      color: isChecked ? '#FFFFFF' : '#1E293B',
                      border: `1.5px solid ${isChecked ? 'var(--color-primary-teal)' : '#CBD5E1'}`,
                      fontSize: '0.76rem',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isChecked ? '✓' : '○'}</span>
                    <span>{strawId}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                Straws Selected for Retrieval: <strong>{thawForm.selectedStrawIds?.length || 0}</strong>
              </div>
              <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                Remaining Balance After Thaw: <strong style={{ color: 'var(--color-success)' }}>{Math.max(0, (selectedSpecimenForThaw?.aliquotsRemaining || 0) - (thawForm.selectedStrawIds?.length || 0))} straws</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Thaw Protocol & Quality Assessment */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={15} /> 3. Thaw Execution & Post-Thaw Assessment
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Input
                label="Thaw Execution Date & Time"
                type="datetime-local"
                value={thawForm.thawDate}
                onChange={(e) => setThawForm(prev => ({ ...prev, thawDate: e.target.value }))}
              />
              <Select
                label="Thaw Warming Protocol"
                value={thawForm.protocol}
                onChange={(e) => setThawForm(prev => ({ ...prev, protocol: e.target.value }))}
                options={THAW_PROTOCOLS}
              />
              <Input
                label="Sperm Preparation / Wash Method"
                value={thawForm.washMethod}
                onChange={(e) => setThawForm(prev => ({ ...prev, washMethod: e.target.value }))}
              />
              <Input
                label="Post-Thaw Progressive Motility (%)"
                required
                type="number"
                value={thawForm.postThawMotility}
                onChange={(e) => setThawForm(prev => ({ ...prev, postThawMotility: e.target.value }))}
                error={validationErrors.postThawMotility}
              />
              <Input
                label="Post-Thaw Vitality (%)"
                type="number"
                value={thawForm.postThawVitality}
                onChange={(e) => setThawForm(prev => ({ ...prev, postThawVitality: e.target.value }))}
              />
              <Input
                label="Cryo Recovery Survival Rate (%)"
                type="number"
                value={thawForm.cryoRecoveryRate}
                onChange={(e) => setThawForm(prev => ({ ...prev, cryoRecoveryRate: e.target.value }))}
                helperText="Formula: (Post-thaw PR / Pre-freeze PR) × 100"
              />
            </div>
          </div>

          {/* Section 4: Procedure Linkage & Compliance */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartPulse size={15} /> 4. Clinical Procedure Linkage & Double-Witnessing
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Select
                label="Clinical Indication / Procedure"
                value={thawForm.indication}
                onChange={(e) => setThawForm(prev => ({ ...prev, indication: e.target.value }))}
                options={THAW_INDICATIONS}
              />
              <Input
                label="Linked Cycle Identifier / Dish"
                value={thawForm.linkedProcedureCycle}
                onChange={(e) => setThawForm(prev => ({ ...prev, linkedProcedureCycle: e.target.value }))}
                placeholder="e.g. Cycle #IVF-2026-015"
              />
              <Input
                label="Treating Clinician"
                value={thawForm.treatingPhysician}
                onChange={(e) => setThawForm(prev => ({ ...prev, treatingPhysician: e.target.value }))}
              />
              <Input
                label="Operating Embryologist"
                value={thawForm.operatingEmbryologist}
                onChange={(e) => setThawForm(prev => ({ ...prev, operatingEmbryologist: e.target.value }))}
              />
              <Input
                label="Witnessing Embryologist"
                value={thawForm.witnessEmbryologist}
                onChange={(e) => setThawForm(prev => ({ ...prev, witnessEmbryologist: e.target.value }))}
              />
            </div>

            {/* Compliance checkboxes */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={thawForm.consentConfirmed}
                  onChange={(e) => setThawForm(prev => ({ ...prev, consentConfirmed: e.target.checked }))}
                />
                <span>Mandatory ART treatment consent & cryo release authorization verified on patient EMR.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={thawForm.serologyCleared}
                  onChange={(e) => setThawForm(prev => ({ ...prev, serologyCleared: e.target.checked }))}
                />
                <span>Viral serology (HIV, HBsAg, HCV, VDRL) clearance verified and unexpired.</span>
              </label>
            </div>

            {validationErrors.compliance && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.75rem', marginTop: '8px' }}>
                {validationErrors.compliance}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsThawModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
            >
              Confirm Thaw & Deduct Aliquots
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Thaw Certificate Modal */}
      <Modal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        title="Official Cryo Thaw & Usage Certificate"
        subtitle={`Record: ${selectedThawRecord?.thawRecordNumber} • Container: ${selectedThawRecord?.cryoContainerId}`}
        maxWidth="750px"
      >
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '76vh', overflowY: 'auto' }}>
          <div style={{ padding: '16px', border: '1.5px solid #CBD5E1', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--color-primary-teal)', fontSize: '1rem', fontWeight: '800' }}>
                  SARJI IVF & ANDROLOGY CENTRE
                </h4>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Cryobiology & Gamete Traceability Division
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>THAW CERTIFICATE</div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', fontFamily: 'monospace' }}>
                  {selectedThawRecord?.thawRecordNumber}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px', padding: '12px 0', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
              <div><strong>Patient / Couple:</strong> {selectedThawRecord?.patientName}</div>
              <div><strong>UHID:</strong> {selectedThawRecord?.patientUhid}</div>
              <div><strong>Source Specimen:</strong> {selectedThawRecord?.cryoContainerId}</div>
              <div><strong>Straws Retrieved:</strong> {selectedThawRecord?.strawsThawedIds?.join(', ')} ({selectedThawRecord?.strawsThawedCount} straw)</div>
              <div><strong>Thaw Date & Time:</strong> {formatDateTimeIN(selectedThawRecord?.thawDate)}</div>
              <div><strong>Remaining in Vault:</strong> {selectedThawRecord?.remainingStrawsAfterThaw} straws</div>
              <div><strong>Linked Procedure:</strong> {selectedThawRecord?.linkedProcedureCycle}</div>
              <div><strong>Treating Physician:</strong> {selectedThawRecord?.treatingPhysician}</div>
            </div>

            <h5 style={{ margin: '12px 0 6px', color: 'var(--color-primary-teal)', fontSize: '0.8rem' }}>
              Post-Thaw Quality & Viability Indices
            </h5>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', marginBottom: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Parameter</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Post-Thaw Result</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Quality Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px' }}>Progressive Motility</td>
                  <td style={{ padding: '6px 8px', fontWeight: '700' }}>{selectedThawRecord?.postThawMotility}%</td>
                  <td style={{ padding: '6px 8px', color: 'var(--color-success)' }}>Adequate for micromanipulation</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px' }}>Cryo Survival Recovery Rate</td>
                  <td style={{ padding: '6px 8px', fontWeight: '700' }}>{selectedThawRecord?.cryoRecoveryRate}%</td>
                  <td style={{ padding: '6px 8px', color: 'var(--color-success)' }}>High survival (&gt;60% benchmark)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '6px 8px' }}>Post-Thaw Vitality</td>
                  <td style={{ padding: '6px 8px', fontWeight: '700' }}>{selectedThawRecord?.postThawVitality}%</td>
                  <td style={{ padding: '6px 8px', color: '#64748B' }}>Live intact cell membranes</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #E2E8F0', fontSize: '0.74rem' }}>
              <div>
                <strong>Operating Embryologist:</strong> {selectedThawRecord?.operatingEmbryologist}
              </div>
              <div>
                <strong>Witness Embryologist:</strong> {selectedThawRecord?.witnessEmbryologist}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsCertificateModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                window.print();
              }}
            >
              Print Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
