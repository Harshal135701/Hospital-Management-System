import React, { useState } from 'react';
import {
  Syringe,
  Microscope,
  Snowflake,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../common/UIPrimitives';

const CATHETER_TYPES = [
  'Cook Echotip Soft 4.0 Fr',
  'Wallace Classical Catheter (18cm)',
  'Kitazato ET Catheter with Guide',
  'Edwards-Wallace Sure View Echogenic',
  'Guardia Access ET Catheter'
];

const ENDOMETRIAL_PATTERNS = [
  'Trilaminar (Triple-line) Pattern',
  'Hyperechoic Homogeneous',
  'Isoechoic Heterogeneous',
  'Irregular / Thin Pattern'
];

export function EmbryoTransferDesk({
  transfers = [],
  embryos = [],
  cycles = [],
  onCreateTransfer,
  onUpdateTransfer,
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // New Transfer Form State
  const [formData, setFormData] = useState({
    cycle_id: cycles[0]?.id || '',
    patient_name: cycles[0]?.patient_name || '',
    patient_uhid: cycles[0]?.patient_uhid || '',
    transfer_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    transfer_type: 'fresh',
    embryos_transferred_count: 1,
    embryo_codes: 'E1-Day5 (4AA Blastocyst)',
    catheter_type: 'Cook Echotip Soft 4.0 Fr',
    ultrasound_guided: true,
    endometrium_thickness_mm: 9.8,
    endometrial_pattern: 'Trilaminar (Triple-line) Pattern',
    physician_name: 'Dr. Priya Nair (Reproductive Medicine)',
    embryologist_name: 'Aruna Nair (Senior Clinical Embryologist)',
    luteal_phase_regimen: 'Micronized Progesterone 400mg vaginally twice daily + Dydrogesterone 10mg TDS',
    pregnancy_test_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    notes: 'Elective single embryo transfer (eSET). Transabdominal ultrasound guidance confirmed fundal positioning 1.5cm from fundus.'
  });

  const handleCycleChange = (cycleId) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (cycle) {
      setFormData((prev) => ({
        ...prev,
        cycle_id: cycle.id,
        patient_name: cycle.patient_name,
        patient_uhid: cycle.patient_uhid
      }));
    } else {
      setFormData((prev) => ({ ...prev, cycle_id: cycleId }));
    }
  };

  const filteredTransfers = transfers.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.embryo_codes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.physician_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || item.transfer_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCount = transfers.length;
  const plannedCount = transfers.filter((t) => t.status === 'planned').length;
  const completedCount = transfers.filter((t) => t.status === 'completed').length;
  const freshCount = transfers.filter((t) => t.transfer_type === 'fresh').length;
  const frozenCount = transfers.filter((t) => t.transfer_type === 'frozen').length;

  const handleSubmitNew = (e) => {
    e.preventDefault();
    const cycle = cycles.find((c) => c.id === formData.cycle_id);
    const payload = {
      ...formData,
      cycle_number: cycle ? cycle.cycle_number : `IVF-2026-${Math.floor(800 + Math.random() * 100)}`,
      status: 'planned'
    };
    if (onCreateTransfer) {
      onCreateTransfer(payload);
    }
    setIsNewModalOpen(false);
  };

  const handleMarkCompleted = (transferId) => {
    if (onUpdateTransfer) {
      onUpdateTransfer(transferId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
    if (selectedTransfer && selectedTransfer.id === transferId) {
      setSelectedTransfer((prev) => ({
        ...prev,
        status: 'completed',
        completed_at: new Date().toISOString()
      }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Submodule Section Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Syringe size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                10.4 Embryo Transfer (ET) Protocol
              </h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  color: 'var(--color-primary-teal)',
                  textTransform: 'uppercase'
                }}
              >
                Transfer Suite
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Fresh and frozen embryo transfers, catheter tracking, ultrasound guidance, and luteal phase support
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.3')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Microscope size={14} />
            <span>Embryo Grading Desk</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Schedule Transfer Protocol</span>
          </Button>
        </div>
      </div>

      {/* Transfer Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Total Protocols
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Recorded ET procedures</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-warning)', textTransform: 'uppercase' }}>
            Scheduled / Pending
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-warning)', marginTop: '4px' }}>
            {plannedCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Awaiting procedure</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-success)', textTransform: 'uppercase' }}>
            Completed Transfers
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Catheter check clear</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
            Fresh vs FET
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {freshCount} / {frozenCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{freshCount} Fresh &bull; {frozenCount} FET</span>
        </div>
      </div>

      {/* Main Transfers Table Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Table Filters */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#FAFCFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search patient, UHID, cycle, catheter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none'
                }}
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '130px' }}
            >
              <option value="all">All Types</option>
              <option value="fresh">Fresh ET</option>
              <option value="frozen">Frozen (FET)</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '130px' }}
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredTransfers.length} protocols
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 16px', fontWeight: '600' }}>Patient & UHID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Date & Time</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Embryos</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Catheter & USG</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Endometrium</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Target &beta;-hCG</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No embryo transfer protocols match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.cycle_number} &bull; {item.patient_uhid}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      <div>{new Date(item.transfer_date).toLocaleDateString()}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {new Date(item.transfer_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '600',
                          backgroundColor: item.transfer_type === 'fresh' ? 'var(--color-bg-pale-aqua)' : '#EEF5FC',
                          color: item.transfer_type === 'fresh' ? 'var(--color-primary-teal)' : '#4388C7'
                        }}
                      >
                        {item.transfer_type === 'fresh' ? 'Fresh ET' : 'FET (Frozen)'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-primary)' }}>
                      <strong>{item.embryos_transferred_count} Embryo{item.embryos_transferred_count > 1 ? 's' : ''}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.embryo_codes}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      <div>{item.catheter_type}</div>
                      <span style={{ fontSize: '0.7rem', color: item.ultrasound_guided ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {item.ultrasound_guided ? 'USG Guided' : 'Clinical Pass'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      <div>{item.endometrium_thickness_mm} mm</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>{item.endometrial_pattern}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-primary-teal)', fontFamily: 'monospace', fontWeight: '600', fontSize: '0.78rem' }}>
                      {item.pregnancy_test_date}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '600',
                          backgroundColor: item.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                          color: item.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransfer(item);
                            setIsDetailModalOpen(true);
                          }}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <Eye size={13} style={{ marginRight: '4px' }} />
                          View
                        </Button>

                        {item.status === 'planned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkCompleted(item.id)}
                            style={{ fontSize: '0.76rem', padding: '3px 8px', color: 'var(--color-success)', borderColor: 'var(--color-success-border)' }}
                          >
                            <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                            Done
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule New Transfer Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Schedule Embryo Transfer (ET) Protocol"
          size="lg"
        >
          <form onSubmit={handleSubmitNew} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select IVF Cycle *
                </label>
                <Select
                  value={formData.cycle_id}
                  onChange={(e) => handleCycleChange(e.target.value)}
                  required
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cycle_number} — {c.patient_name} ({c.patient_uhid})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Protocol Type *
                </label>
                <Select
                  value={formData.transfer_type}
                  onChange={(e) => setFormData({ ...formData, transfer_type: e.target.value })}
                >
                  <option value="fresh">Fresh Embryo Transfer (Day 3 / Day 5)</option>
                  <option value="frozen">Frozen Embryo Transfer (FET)</option>
                </Select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Transfer Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.transfer_date}
                  onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Embryos to Transfer
                </label>
                <Select
                  value={formData.embryos_transferred_count}
                  onChange={(e) => setFormData({ ...formData, embryos_transferred_count: parseInt(e.target.value) || 1 })}
                >
                  <option value={1}>1 (Elective Single - eSET)</option>
                  <option value={2}>2 (Double Embryo Transfer - DET)</option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Embryo Identifiers / Grade
                </label>
                <Input
                  type="text"
                  value={formData.embryo_codes}
                  onChange={(e) => setFormData({ ...formData, embryo_codes: e.target.value })}
                  placeholder="e.g. E1-Day5 (4AA)"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Transfer Catheter
                </label>
                <Select
                  value={formData.catheter_type}
                  onChange={(e) => setFormData({ ...formData, catheter_type: e.target.value })}
                >
                  {CATHETER_TYPES.map((catheter) => (
                    <option key={catheter} value={catheter}>
                      {catheter}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Endometrial Thickness (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="20.0"
                  value={formData.endometrium_thickness_mm}
                  onChange={(e) => setFormData({ ...formData, endometrium_thickness_mm: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Endometrial Pattern
                </label>
                <Select
                  value={formData.endometrial_pattern}
                  onChange={(e) => setFormData({ ...formData, endometrial_pattern: e.target.value })}
                >
                  {ENDOMETRIAL_PATTERNS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Performing ART Clinician
                </label>
                <Input
                  type="text"
                  value={formData.physician_name}
                  onChange={(e) => setFormData({ ...formData, physician_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Witnessing Embryologist
                </label>
                <Input
                  type="text"
                  value={formData.embryologist_name}
                  onChange={(e) => setFormData({ ...formData, embryologist_name: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Luteal Phase Support Prescription
                </label>
                <Input
                  type="text"
                  value={formData.luteal_phase_regimen}
                  onChange={(e) => setFormData({ ...formData, luteal_phase_regimen: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Target Pregnancy Test Date (&beta;-hCG)
                </label>
                <Input
                  type="date"
                  value={formData.pregnancy_test_date}
                  onChange={(e) => setFormData({ ...formData, pregnancy_test_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Procedure Instructions / Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="2"
                style={{
                  width: '100%',
                  fontSize: '0.8rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Transfer Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Protocol Summary Inspection Modal */}
      {isDetailModalOpen && selectedTransfer && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`ET Protocol Sheet — ${selectedTransfer.patient_name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                  {selectedTransfer.cycle_number}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {selectedTransfer.patient_uhid}
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {selectedTransfer.patient_name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Type</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>{selectedTransfer.transfer_type}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)' }}>Endometrium</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{selectedTransfer.endometrium_thickness_mm} mm</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Catheter</span>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{selectedTransfer.catheter_type?.split(' ')[0]}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)' }}>&beta;-hCG Date</span>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>{selectedTransfer.pregnancy_test_date}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
              <strong>Luteal Support Regimen:</strong> {selectedTransfer.luteal_phase_regimen}
            </div>

            {selectedTransfer.notes && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                <strong>Procedure Notes:</strong> {selectedTransfer.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="outline" size="sm" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={13} />
                <span>Print Transfer Summary</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
