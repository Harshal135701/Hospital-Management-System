import React, { useState } from 'react';
import {
  Dna,
  Microscope,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  ChevronRight
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../common/UIPrimitives';
import { FERTILIZATION_METHODS, PRONUCLEAR_STAGES } from './embryologyConstants';

export function FertilizationDesk({
  fertilizations = [],
  cycles = [],
  opus = [],
  onCreateFertilization,
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedFert, setSelectedFert] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cycle_id: cycles[0]?.id || '',
    patient_name: cycles[0]?.patient_name || '',
    patient_uhid: cycles[0]?.patient_uhid || '',
    fertilization_method: 'ICSI',
    sperm_sample_id: 'SP-2026-0941 (Count 32M/mL, Motility 50% PR)',
    insemination_time: new Date().toISOString().slice(0, 16),
    oocytes_inseminated: 10,
    normal_2pn_count: 8,
    abnormal_1pn_count: 1,
    abnormal_multipn_count: 0,
    unfertilized_count: 1,
    embryologist_name: 'Aruna Nair (Senior Clinical Embryologist)',
    remarks: 'ICSI microinjection performed cleanly on 10 MII oocytes using PVP medium. Normal 2PN check completed at 17 hours post-injection.'
  });

  const calculatedFertRate =
    Number(formData.oocytes_inseminated) > 0
      ? ((Number(formData.normal_2pn_count || 0) / Number(formData.oocytes_inseminated)) * 100).toFixed(1)
      : 0;

  // Filtered List
  const filteredList = fertilizations.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sperm_sample_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || item.fertilization_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  // Calculate totals
  const totalInseminated = fertilizations.reduce((acc, c) => acc + Number(c.oocytes_inseminated || 0), 0);
  const total2Pn = fertilizations.reduce((acc, c) => acc + Number(c.normal_2pn_count || 0), 0);
  const totalAbnormal = fertilizations.reduce(
    (acc, c) => acc + Number(c.abnormal_1pn_count || 0) + Number(c.abnormal_multipn_count || 0),
    0
  );
  const totalUnfertilized = fertilizations.reduce((acc, c) => acc + Number(c.unfertilized_count || 0), 0);
  const overallRate = totalInseminated > 0 ? ((total2Pn / totalInseminated) * 100).toFixed(1) : 0;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const cycle = cycles.find((c) => c.id === formData.cycle_id);
    const payload = {
      ...formData,
      cycle_number: cycle ? cycle.cycle_number : `IVF-2026-${Math.floor(800 + Math.random() * 100)}`,
      fertilization_rate_pct: parseFloat(calculatedFertRate)
    };
    if (onCreateFertilization) {
      onCreateFertilization(payload);
    }
    setIsNewModalOpen(false);
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
            <Dna size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                10.2 Fertilization (Conventional IVF / ICSI)
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
                Insemination
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Insemination protocols, sperm microinjections, and 16-18h pronuclear (2PN) verification
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
            <span>Record Fertilization Check</span>
          </Button>
        </div>
      </div>

      {/* Fertilization Metrics Grid */}
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
            Inseminated Oocytes
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalInseminated}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Across {fertilizations.length} cases</span>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Normal 2PN Count
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              {overallRate}%
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {total2Pn}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>2 Pronuclei + 2 polar bodies</span>
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
            Abnormal (1PN / Multi-PN)
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-warning)', marginTop: '4px' }}>
            {totalAbnormal}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Excluded from culture</span>
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
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-error)', textTransform: 'uppercase' }}>
            Unfertilized (0PN)
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-error)', marginTop: '4px' }}>
            {totalUnfertilized}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>No pronuclei visible</span>
        </div>
      </div>

      {/* Main Fertilization Records Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Table Filter Bar */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
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
                placeholder="Search patient, UHID, cycle, sperm ID..."
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
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '150px' }}
            >
              <option value="all">All Methods</option>
              <option value="ICSI">ICSI</option>
              <option value="Conventional_IVF">Conventional IVF</option>
              <option value="PICSI">PICSI</option>
            </Select>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredList.length} cases
          </span>
        </div>

        {/* Records Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 16px', fontWeight: '600' }}>Patient & UHID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Cycle #</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Method</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Inseminated</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Normal 2PN</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Fert. Rate (%)</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Embryologist</th>
                <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No fertilization records match current filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.patient_uhid}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                      {item.cycle_number}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)'
                        }}
                      >
                        {item.fertilization_method}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {item.oocytes_inseminated} MII
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>{item.normal_2pn_count} 2PN</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                        ({item.abnormal_1pn_count || 0} Abn / {item.unfertilized_count || 0} 0PN)
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontSize: '0.86rem' }}>
                        {item.fertilization_rate_pct}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                      {item.embryologist_name?.split(' ')[0]} {item.embryologist_name?.split(' ')[1]}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFert(item);
                          setIsDetailModalOpen(true);
                        }}
                        style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                      >
                        <Eye size={13} style={{ marginRight: '4px' }} />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Insemination / 2PN Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Record Insemination & 17h Fertilization Check"
          size="lg"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select Treatment Cycle *
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
                  Fertilization Method *
                </label>
                <Select
                  value={formData.fertilization_method}
                  onChange={(e) => setFormData({ ...formData, fertilization_method: e.target.value })}
                >
                  {FERTILIZATION_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Sperm Sample Preparation ID
                </label>
                <Input
                  type="text"
                  value={formData.sperm_sample_id}
                  onChange={(e) => setFormData({ ...formData, sperm_sample_id: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Insemination Timestamp *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.insemination_time}
                  onChange={(e) => setFormData({ ...formData, insemination_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                Pronuclear (PN) Assessment at 16–18 Hours
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Oocytes Inseminated
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.oocytes_inseminated}
                    onChange={(e) => setFormData({ ...formData, oocytes_inseminated: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-success)', marginBottom: '2px' }}>
                    Normal 2PN
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.normal_2pn_count}
                    onChange={(e) => setFormData({ ...formData, normal_2pn_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-warning)', marginBottom: '2px' }}>
                    Abnormal 1PN
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.abnormal_1pn_count}
                    onChange={(e) => setFormData({ ...formData, abnormal_1pn_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-error)', marginBottom: '2px' }}>
                    Unfertilized (0PN)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.unfertilized_count}
                    onChange={(e) => setFormData({ ...formData, unfertilized_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                Calculated Normal Fertilization Rate: {calculatedFertRate}%
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Supervising Clinical Embryologist
              </label>
              <Input
                type="text"
                value={formData.embryologist_name}
                onChange={(e) => setFormData({ ...formData, embryologist_name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Procedure Observations / Media Notes
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                Save Fertilization Check
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Fertilization Detail Modal */}
      {isDetailModalOpen && selectedFert && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Fertilization Record — ${selectedFert.patient_name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                  {selectedFert.cycle_number}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {selectedFert.patient_uhid}
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {selectedFert.patient_name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Inseminated</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{selectedFert.oocytes_inseminated}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success)' }}>Normal 2PN</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-success)' }}>{selectedFert.normal_2pn_count}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)' }}>Fert. Rate</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{selectedFert.fertilization_rate_pct}%</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              <strong>Method:</strong> {selectedFert.fertilization_method} &bull; <strong>Sperm ID:</strong> {selectedFert.sperm_sample_id}
            </div>

            {selectedFert.remarks && (
              <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <strong>Embryologist Remarks:</strong> {selectedFert.remarks}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
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
