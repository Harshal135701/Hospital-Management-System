import React, { useState } from 'react';
import {
  Egg,
  Dna,
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
import { OOCYTE_MATURITY_STAGES } from './embryologyConstants';

export function OpuRecordingDesk({
  opus = [],
  cycles = [],
  onCreateOpu,
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOpu, setSelectedOpu] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form state for new OPU
  const [formData, setFormData] = useState({
    cycle_id: cycles[0]?.id || '',
    patient_name: cycles[0]?.patient_name || '',
    patient_uhid: cycles[0]?.patient_uhid || '',
    retrieval_date: new Date().toISOString().slice(0, 16),
    follicles_aspirated: 14,
    oocytes_retrieved: 12,
    mii_count: 9,
    mi_count: 2,
    gv_count: 1,
    degenerated_count: 0,
    physician_name: 'Dr. Priya Nair (Reproductive Medicine)',
    embryologist_name: 'Aruna Nair (Senior Clinical Embryologist)',
    dish_id: `DISH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    incubator_chamber: 'Esco MIRI Benchtop Chamber 2',
    notes: 'Follicular fluid clean with minimal cellular debris. Cumulus cells intact around 9 MII complexes.'
  });

  const totalMaturitySum =
    Number(formData.mii_count || 0) +
    Number(formData.mi_count || 0) +
    Number(formData.gv_count || 0) +
    Number(formData.degenerated_count || 0);

  const isCountMismatch = totalMaturitySum !== Number(formData.oocytes_retrieved || 0);

  // Filtered List
  const filteredList = opus.filter((item) => {
    return (
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dish_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate totals
  const totalAspirated = opus.reduce((acc, c) => acc + Number(c.follicles_aspirated || 0), 0);
  const totalRetrieved = opus.reduce((acc, c) => acc + Number(c.oocytes_retrieved || 0), 0);
  const totalMii = opus.reduce((acc, c) => acc + Number(c.mii_count || 0), 0);
  const totalMi = opus.reduce((acc, c) => acc + Number(c.mi_count || 0), 0);
  const totalGv = opus.reduce((acc, c) => acc + Number(c.gv_count || 0), 0);

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
    if (isCountMismatch) {
      alert(`Maturity count total (${totalMaturitySum}) does not equal total retrieved oocytes (${formData.oocytes_retrieved}).`);
      return;
    }
    const cycle = cycles.find((c) => c.id === formData.cycle_id);
    const payload = {
      ...formData,
      cycle_number: cycle ? cycle.cycle_number : `IVF-2026-${Math.floor(800 + Math.random() * 100)}`
    };
    if (onCreateOpu) {
      onCreateOpu(payload);
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
            <Egg size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                10.1 Oocyte Retrieval (OPU) Recording
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
                Aspiration
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Follicular aspiration dish logging, gamete maturity breakdown (MII, MI, GV, DEG), and incubator tracking
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.2')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Dna size={14} />
            <span>Fertilization Desk</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Log OPU Procedure</span>
          </Button>
        </div>
      </div>

      {/* Maturity Breakdown Metric Cards */}
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
            Total Retrieved
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {totalRetrieved}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>From {totalAspirated} follicles</span>
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
              MII Mature (ICSI Ready)
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              {totalRetrieved > 0 ? Math.round((totalMii / totalRetrieved) * 100) : 0}%
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {totalMii}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>First polar body extruded</span>
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
            MI Intermediate
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-warning)', marginTop: '4px' }}>
            {totalMi}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>No polar body</span>
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
            GV Immature / Degenerated
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-error)', marginTop: '4px' }}>
            {totalGv}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Germinal vesicle arrest</span>
        </div>
      </div>

      {/* Main OPU Table Container */}
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
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by patient, UHID, cycle number, dish ID..."
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

          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredList.length} procedures
          </span>
        </div>

        {/* Procedures Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 16px', fontWeight: '600' }}>Patient & UHID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Cycle #</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Retrieval Date</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Aspirated / Yield</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Maturity Breakdown</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Dish & Incubator</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Clinical Staff</th>
                <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No oocyte retrieval procedures found.
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
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                      {new Date(item.retrieval_date).toLocaleDateString()} {new Date(item.retrieval_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.oocytes_retrieved}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem' }}> / {item.follicles_aspirated} fol.</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: '600', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)' }}>
                          {item.mii_count} MII
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: '600', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                          {item.mi_count} MI
                        </span>
                        {item.gv_count > 0 && (
                          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: '600', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                            {item.gv_count} GV
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>{item.dish_id}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.incubator_chamber}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>{item.physician_name?.split(' ')[0]} {item.physician_name?.split(' ')[1]}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.embryologist_name?.split(' ')[0]}</span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOpu(item);
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

      {/* Log New OPU Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Log Oocyte Retrieval (OPU) Procedure"
          size="lg"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  Aspiration Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.retrieval_date}
                  onChange={(e) => setFormData({ ...formData, retrieval_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Follicles Aspirated *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.follicles_aspirated}
                  onChange={(e) => setFormData({ ...formData, follicles_aspirated: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Total Oocytes Retrieved *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.oocytes_retrieved}
                  onChange={(e) => setFormData({ ...formData, oocytes_retrieved: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            {/* Maturity Breakdown Group */}
            <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                Nuclear Maturity Breakdown (Must total {formData.oocytes_retrieved})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-primary-teal)', marginBottom: '2px' }}>
                    MII (Mature)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.mii_count}
                    onChange={(e) => setFormData({ ...formData, mii_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-warning)', marginBottom: '2px' }}>
                    MI (Intermediate)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.mi_count}
                    onChange={(e) => setFormData({ ...formData, mi_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-error)', marginBottom: '2px' }}>
                    GV (Immature)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.gv_count}
                    onChange={(e) => setFormData({ ...formData, gv_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                    Degenerated
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.degenerated_count}
                    onChange={(e) => setFormData({ ...formData, degenerated_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {isCountMismatch && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-error)', fontSize: '0.74rem', marginTop: '8px' }}>
                  <AlertTriangle size={13} />
                  <span>Sum of maturity counts ({totalMaturitySum}) does not equal retrieved count ({formData.oocytes_retrieved}).</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Aspiration Dish Barcode ID *
                </label>
                <Input
                  type="text"
                  value={formData.dish_id}
                  onChange={(e) => setFormData({ ...formData, dish_id: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Benchtop Incubator Chamber *
                </label>
                <Input
                  type="text"
                  value={formData.incubator_chamber}
                  onChange={(e) => setFormData({ ...formData, incubator_chamber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Aspiration Physician (ART Consultant)
                </label>
                <Input
                  type="text"
                  value={formData.physician_name}
                  onChange={(e) => setFormData({ ...formData, physician_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Clinical Embryologist
                </label>
                <Input
                  type="text"
                  value={formData.embryologist_name}
                  onChange={(e) => setFormData({ ...formData, embryologist_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Procedure Observations / Notes
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
              <Button type="submit" variant="primary" size="sm" disabled={isCountMismatch}>
                Save OPU Record
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* OPU Detail Inspection Modal */}
      {isDetailModalOpen && selectedOpu && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`OPU Procedure Record — ${selectedOpu.patient_name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                  {selectedOpu.cycle_number}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {selectedOpu.patient_uhid}
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {selectedOpu.patient_name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Follicles</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{selectedOpu.follicles_aspirated}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)' }}>MII Mature</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{selectedOpu.mii_count}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-warning)' }}>MI Inter.</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-warning)' }}>{selectedOpu.mi_count}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-error)' }}>GV / DEG</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-error)' }}>{Number(selectedOpu.gv_count || 0) + Number(selectedOpu.degenerated_count || 0)}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              <strong>Incubator & Dish:</strong> {selectedOpu.dish_id} &bull; {selectedOpu.incubator_chamber}
            </div>

            {selectedOpu.notes && (
              <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                <strong>Clinical Notes:</strong> {selectedOpu.notes}
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
