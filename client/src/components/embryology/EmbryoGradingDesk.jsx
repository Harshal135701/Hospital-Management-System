import React, { useState } from 'react';
import {
  Microscope,
  Syringe,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  ChevronRight,
  Edit
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../common/UIPrimitives';
import {
  GARDNER_EXPANSION_STAGES,
  GARDNER_ICM_GRADES,
  GARDNER_TE_GRADES,
  EMBRYO_STATUSES
} from './embryologyConstants';

export function EmbryoGradingDesk({
  embryos = [],
  cycles = [],
  onCreateEmbryo,
  onUpdateEmbryo,
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [selectedEmbryo, setSelectedEmbryo] = useState(null);

  // New Embryo Form State
  const [formData, setFormData] = useState({
    cycle_id: cycles[0]?.id || '',
    patient_name: cycles[0]?.patient_name || '',
    patient_uhid: cycles[0]?.patient_uhid || '',
    embryo_code: `E${embryos.length + 1}-Day5`,
    day_number: 5,
    cell_count: 100,
    fragmentation_percent: 5,
    expansion_grade: '4',
    icm_grade: 'A',
    te_grade: 'A',
    gardner_grade: '4AA',
    status: 'viable',
    biopsy_taken: false,
    notes: 'Expanded blastocyst with prominent tightly packed inner cell mass.'
  });

  // Assessment Edit State
  const [assessForm, setAssessForm] = useState({
    day_number: 5,
    cell_count: 100,
    fragmentation_percent: 5,
    expansion_grade: '4',
    icm_grade: 'A',
    te_grade: 'A',
    gardner_grade: '4AA',
    status: 'viable',
    biopsy_taken: false,
    notes: ''
  });

  // Filtered List
  const filteredList = embryos.filter((item) => {
    const matchesSearch =
      item.embryo_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gardner_grade?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDay = dayFilter === 'all' || String(item.day_number) === dayFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesDay && matchesStatus;
  });

  // Stats
  const totalEmbryos = embryos.length;
  const viableCount = embryos.filter((e) => e.status === 'viable').length;
  const day5BlastCount = embryos.filter((e) => e.day_number >= 5).length;
  const frozenCount = embryos.filter((e) => e.status === 'frozen').length;
  const transferredCount = embryos.filter((e) => e.status === 'transferred').length;

  const handleCycleSelect = (cycleId) => {
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

  const handleUpdateGardnerString = (exp, icm, te) => {
    if (exp && icm && te) {
      return `${exp}${icm}${te}`;
    }
    return 'Pending';
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const cycle = cycles.find((c) => c.id === formData.cycle_id);
    const calculatedGrade =
      formData.day_number >= 5
        ? `${formData.expansion_grade || '4'}${formData.icm_grade || 'A'}${formData.te_grade || 'A'}`
        : `Grade 1 (${formData.cell_count} Cell)`;

    const payload = {
      ...formData,
      cycle_number: cycle ? cycle.cycle_number : `IVF-2026-${Math.floor(800 + Math.random() * 100)}`,
      gardner_grade: calculatedGrade
    };

    if (onCreateEmbryo) {
      onCreateEmbryo(payload);
    }
    setIsNewModalOpen(false);
  };

  const handleOpenAssess = (embryo) => {
    setSelectedEmbryo(embryo);
    setAssessForm({
      day_number: embryo.day_number || 5,
      cell_count: embryo.cell_count || 100,
      fragmentation_percent: embryo.fragmentation_percent || 5,
      expansion_grade: embryo.expansion_grade || '4',
      icm_grade: embryo.icm_grade || 'A',
      te_grade: embryo.te_grade || 'A',
      gardner_grade: embryo.gardner_grade || '4AA',
      status: embryo.status || 'viable',
      biopsy_taken: Boolean(embryo.biopsy_taken),
      notes: embryo.notes || ''
    });
    setIsAssessModalOpen(true);
  };

  const handleSaveAssess = (e) => {
    e.preventDefault();
    if (!selectedEmbryo) return;

    const calculatedGrade =
      assessForm.day_number >= 5
        ? `${assessForm.expansion_grade || '4'}${assessForm.icm_grade || 'A'}${assessForm.te_grade || 'A'}`
        : `Grade 1 (${assessForm.cell_count} Cell)`;

    const updates = {
      ...assessForm,
      gardner_grade: calculatedGrade
    };

    if (onUpdateEmbryo) {
      onUpdateEmbryo(selectedEmbryo.id, updates);
    }
    setIsAssessModalOpen(false);
    setSelectedEmbryo(null);
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
            <Microscope size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                10.3 Embryo Morphological Grading
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
                Morphology
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Day 3 cleavage evaluations and Day 5/6 Gardner blastocyst criteria (expansion, ICM, trophectoderm)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.4')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Syringe size={14} />
            <span>Transfer (ET) Protocol</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Grade New Embryo</span>
          </Button>
        </div>
      </div>

      {/* Morphological Metric Cards */}
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
            Total Cohort
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalEmbryos}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Assessed embryos</span>
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
            Day 5/6 Blastocysts
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {day5BlastCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Gardner system graded</span>
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
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#4388C7', textTransform: 'uppercase' }}>
            Viable in Culture
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#4388C7', marginTop: '4px' }}>
            {viableCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Active monitoring</span>
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
            Cryopreserved / Transferred
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>
            {frozenCount + transferredCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{frozenCount} frozen &bull; {transferredCount} ET</span>
        </div>
      </div>

      {/* Main Embryo Table Container */}
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
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search embryo code, patient, grade..."
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
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '130px' }}
            >
              <option value="all">All Days</option>
              <option value="3">Day 3 Cleavage</option>
              <option value="5">Day 5 Blastocyst</option>
              <option value="6">Day 6 Blastocyst</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '140px' }}
            >
              <option value="all">All Statuses</option>
              <option value="viable">Viable</option>
              <option value="selected_for_et">Selected for ET</option>
              <option value="frozen">Frozen</option>
              <option value="transferred">Transferred</option>
              <option value="arrested">Arrested</option>
            </Select>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredList.length} embryos
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 16px', fontWeight: '600' }}>Embryo ID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & Cycle</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Stage</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Gardner Grade</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Biopsy (PGT)</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No embryo grading records match current filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                      {item.embryo_code}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.cycle_number}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      Day {item.day_number} &bull; {item.cell_count} Cells
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {item.gardner_grade || 'Grade 1'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {item.biopsy_taken ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          PGT Biopsied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '600',
                          backgroundColor:
                            item.status === 'viable'
                              ? 'var(--color-bg-pale-aqua)'
                              : item.status === 'frozen'
                              ? '#EEF5FC'
                              : item.status === 'transferred'
                              ? 'var(--color-success-bg)'
                              : '#EEF2F2',
                          color:
                            item.status === 'viable'
                              ? 'var(--color-primary-teal)'
                              : item.status === 'frozen'
                              ? '#4388C7'
                              : item.status === 'transferred'
                              ? 'var(--color-success)'
                              : 'var(--color-text-secondary)'
                        }}
                      >
                        {EMBRYO_STATUSES[item.status]?.label || item.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAssess(item)}
                        style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                      >
                        <Edit size={13} style={{ marginRight: '4px' }} />
                        Assess
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade New Embryo Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Grade New Cleavage / Blastocyst Embryo"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select IVF Cycle *
                </label>
                <Select
                  value={formData.cycle_id}
                  onChange={(e) => handleCycleSelect(e.target.value)}
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
                  Embryo Traceable Code *
                </label>
                <Input
                  type="text"
                  value={formData.embryo_code}
                  onChange={(e) => setFormData({ ...formData, embryo_code: e.target.value })}
                  placeholder="e.g. E1-Day5"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Developmental Day *
                </label>
                <Select
                  value={formData.day_number}
                  onChange={(e) => setFormData({ ...formData, day_number: parseInt(e.target.value) || 5 })}
                >
                  <option value={3}>Day 3 (Cleavage Stage)</option>
                  <option value={4}>Day 4 (Morula Stage)</option>
                  <option value={5}>Day 5 (Blastocyst)</option>
                  <option value={6}>Day 6 (Extended Blastocyst)</option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Cell Count
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cell_count}
                  onChange={(e) => setFormData({ ...formData, cell_count: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Fragmentation (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fragmentation_percent}
                  onChange={(e) => setFormData({ ...formData, fragmentation_percent: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Gardner Blastocyst Criteria */}
            {formData.day_number >= 5 && (
              <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                  Gardner Blastocyst Evaluation (Expansion + ICM + TE)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                      Expansion Stage (1–6)
                    </label>
                    <Select
                      value={formData.expansion_grade}
                      onChange={(e) => setFormData({ ...formData, expansion_grade: e.target.value })}
                    >
                      {GARDNER_EXPANSION_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                      Inner Cell Mass (ICM)
                    </label>
                    <Select
                      value={formData.icm_grade}
                      onChange={(e) => setFormData({ ...formData, icm_grade: e.target.value })}
                    >
                      {GARDNER_ICM_GRADES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                      Trophectoderm (TE)
                    </label>
                    <Select
                      value={formData.te_grade}
                      onChange={(e) => setFormData({ ...formData, te_grade: e.target.value })}
                    >
                      {GARDNER_TE_GRADES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--color-primary-teal)', fontWeight: '700' }}>
                  Calculated Grade: {formData.expansion_grade}{formData.icm_grade}{formData.te_grade}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Clinical Culture Status *
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="viable">Viable (Culturing)</option>
                  <option value="selected_for_et">Selected for Transfer</option>
                  <option value="frozen">Cryopreserved (Frozen)</option>
                  <option value="arrested">Arrested Development</option>
                  <option value="discarded">Discarded (Non-Viable)</option>
                </Select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                <input
                  type="checkbox"
                  id="biopsy_checkbox"
                  checked={formData.biopsy_taken}
                  onChange={(e) => setFormData({ ...formData, biopsy_taken: e.target.checked })}
                />
                <label htmlFor="biopsy_checkbox" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  Laser Trophectoderm Biopsy Taken (PGT-A)
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Morphological Observations / Notes
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
                Save Embryo Grade
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Re-Assessment Modal */}
      {isAssessModalOpen && selectedEmbryo && (
        <Modal
          isOpen={isAssessModalOpen}
          onClose={() => setIsAssessModalOpen(false)}
          title={`Update Morphology — ${selectedEmbryo.embryo_code} (${selectedEmbryo.patient_name})`}
          size="md"
        >
          <form onSubmit={handleSaveAssess} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  Expansion (1–6)
                </label>
                <Select
                  value={assessForm.expansion_grade}
                  onChange={(e) => setAssessForm({ ...assessForm, expansion_grade: e.target.value })}
                >
                  {GARDNER_EXPANSION_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  ICM (A–C)
                </label>
                <Select
                  value={assessForm.icm_grade}
                  onChange={(e) => setAssessForm({ ...assessForm, icm_grade: e.target.value })}
                >
                  {GARDNER_ICM_GRADES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.value}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  TE (A–C)
                </label>
                <Select
                  value={assessForm.te_grade}
                  onChange={(e) => setAssessForm({ ...assessForm, te_grade: e.target.value })}
                >
                  {GARDNER_TE_GRADES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.value}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Culture Status
              </label>
              <Select
                value={assessForm.status}
                onChange={(e) => setAssessForm({ ...assessForm, status: e.target.value })}
              >
                <option value="viable">Viable in Culture</option>
                <option value="selected_for_et">Selected for Transfer</option>
                <option value="frozen">Cryopreserved (Frozen)</option>
                <option value="transferred">Transferred (ET Completed)</option>
                <option value="arrested">Arrested Development</option>
                <option value="discarded">Discarded</option>
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Assessment Notes
              </label>
              <textarea
                value={assessForm.notes}
                onChange={(e) => setAssessForm({ ...assessForm, notes: e.target.value })}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAssessModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Update Assessment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
