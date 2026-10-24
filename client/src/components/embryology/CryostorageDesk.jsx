import React, { useState } from 'react';
import {
  Snowflake,
  Syringe,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  ChevronRight,
  QrCode,
  ThermometerSnowflake,
  Droplet
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../common/UIPrimitives';
import { CRYOSTORAGE_TANKS, GOBLET_COLORS } from './embryologyConstants';

export function CryostorageDesk({
  cryoStraws = [],
  embryos = [],
  cycles = [],
  onCreateCryoRecord,
  onUpdateCryoRecord,
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tankFilter, setTankFilter] = useState('all');
  const [dispositionFilter, setDispositionFilter] = useState('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isThawModalOpen, setIsThawModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // New Vitrification Form State
  const [formData, setFormData] = useState({
    embryo_id: embryos[0]?.id || '',
    cycle_number: cycles[0]?.cycle_number || 'IVF-2026-0812',
    patient_name: cycles[0]?.patient_name || 'Meera Kapoor',
    patient_uhid: cycles[0]?.patient_uhid || 'UHID-2026-0012',
    embryo_code: embryos[0]?.embryo_code || 'E2-Day5',
    gardner_grade: embryos[0]?.gardner_grade || '4AB',
    tank_id: 'Tank-1',
    canister_id: 'Canister-B',
    goblet_color: 'Blue',
    cane_number: 'C-04',
    straw_number: `ST-${Math.floor(100 + Math.random() * 899)}`,
    media_used: 'Kitazato Vitrification Solution (Lot #KZ-9921)',
    freeze_date: new Date().toISOString().slice(0, 10),
    consent_expiry_date: new Date(Date.now() + 5 * 365 * 86400000).toISOString().slice(0, 10),
    embryologist_name: 'Aruna Nair (Senior Clinical Embryologist)',
    notes: 'Cryotop single blastocyst vitrification. Closed system straw plunged into LN2 (-196°C).'
  });

  // Thaw Event Form State
  const [thawData, setThawData] = useState({
    thaw_date: new Date().toISOString().slice(0, 10),
    thawing_media: 'Kitazato Thawing Media Kit (TS, DS, WS1, WS2)',
    post_thaw_survival_pct: 100,
    re_expansion_status: 'Fully Re-expanded (Grade 1)',
    performing_embryologist: 'Aruna Nair (Senior Clinical Embryologist)',
    notes: 'Thawed smoothly with 1.0M sucrose dilution steps. Blastocyst cavity expanded within 2 hours.'
  });

  const filteredList = cryoStraws.filter((item) => {
    const matchesSearch =
      item.straw_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient_uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.embryo_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tank_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTank = tankFilter === 'all' || item.tank_id === tankFilter;
    const matchesDisposition = dispositionFilter === 'all' || item.disposition === dispositionFilter;

    return matchesSearch && matchesTank && matchesDisposition;
  });

  const totalStraws = cryoStraws.length;
  const storedCount = cryoStraws.filter((s) => s.disposition === 'stored').length;
  const thawedCount = cryoStraws.filter((s) => s.disposition === 'thawed').length;

  const handleSubmitNew = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      disposition: 'stored'
    };
    if (onCreateCryoRecord) {
      onCreateCryoRecord(payload);
    }
    setIsNewModalOpen(false);
  };

  const handleConfirmThaw = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    if (onUpdateCryoRecord) {
      onUpdateCryoRecord(selectedRecord.id, {
        disposition: 'thawed',
        thaw_date: thawData.thaw_date,
        thaw_notes: `${thawData.thawing_media} - Survival: ${thawData.post_thaw_survival_pct}%. ${thawData.notes}`
      });
    }

    setIsThawModalOpen(false);
    setSelectedRecord(null);
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
            <Snowflake size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                10.5 Embryo Cryostorage Management
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
                Cryo-Bank
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Multi-tier liquid nitrogen repository matrix, vitrification straws, 5-year consent tracking, and thawing logs
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
            <span>Vitrify & Freeze Embryo</span>
          </Button>
        </div>
      </div>

      {/* Tank Temperature Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {CRYOSTORAGE_TANKS.map((tank) => {
          const tankStraws = cryoStraws.filter((s) => s.tank_id === tank.id && s.disposition === 'stored');
          return (
            <div
              key={tank.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ThermometerSnowflake size={16} color="var(--color-primary-teal)" />
                  <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{tank.id}</span>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)', backgroundColor: 'var(--color-bg-pale-aqua)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace' }}>
                  {tank.temp}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{tank.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Vitrified Straws:</span>
                <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{tankStraws.length} Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Straws Table Container */}
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
                placeholder="Search straw #, patient, UHID, tank..."
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
              value={tankFilter}
              onChange={(e) => setTankFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '130px' }}
            >
              <option value="all">All LN2 Tanks</option>
              <option value="Tank-1">Tank-1 (Cleanroom A)</option>
              <option value="Tank-2">Tank-2 (Manual LN2)</option>
              <option value="Tank-3">Tank-3 (Vapor Shipper)</option>
            </Select>

            <Select
              value={dispositionFilter}
              onChange={(e) => setDispositionFilter(e.target.value)}
              style={{ fontSize: '0.8rem', width: '130px' }}
            >
              <option value="all">All Dispositions</option>
              <option value="stored">Stored in LN2</option>
              <option value="thawed">Thawed</option>
            </Select>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredList.length} straws
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                <th style={{ padding: '10px 16px', fontWeight: '600' }}>Straw Barcode</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & UHID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Embryo & Grade</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>LN2 Coordinates</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Freeze Date</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Consent Expiry</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Disposition</th>
                <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No cryostorage straw records match current filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          border: '1px solid var(--color-border)',
                          fontFamily: 'monospace'
                        }}
                      >
                        {item.straw_number}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.patient_uhid}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.embryo_code}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>{item.gardner_grade}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                      <div>{item.tank_id} &bull; {item.canister_id}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.goblet_color} Goblet &bull; Cane {item.cane_number}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {item.freeze_date}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {item.consent_expiry_date}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '600',
                          backgroundColor: item.disposition === 'stored' ? 'var(--color-bg-pale-aqua)' : 'var(--color-warning-bg)',
                          color: item.disposition === 'stored' ? 'var(--color-primary-teal)' : 'var(--color-warning)'
                        }}
                      >
                        {item.disposition === 'stored' ? 'LN2 Stored' : 'Thawed'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(item);
                            setIsLabelModalOpen(true);
                          }}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <QrCode size={13} style={{ marginRight: '4px' }} />
                          Label
                        </Button>

                        {item.disposition === 'stored' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(item);
                              setIsThawModalOpen(true);
                            }}
                            style={{ fontSize: '0.76rem', padding: '3px 8px', color: 'var(--color-warning)', borderColor: 'var(--color-warning-border)' }}
                          >
                            <Droplet size={13} style={{ marginRight: '4px' }} />
                            Thaw
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

      {/* New Vitrification Straw Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Vitrify & Cryostore Embryo Straw"
          size="lg"
        >
          <form onSubmit={handleSubmitNew} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select IVF Cycle *
                </label>
                <Select
                  value={formData.cycle_number}
                  onChange={(e) => {
                    const cycle = cycles.find((c) => c.cycle_number === e.target.value);
                    if (cycle) {
                      setFormData({
                        ...formData,
                        cycle_number: cycle.cycle_number,
                        patient_name: cycle.patient_name,
                        patient_uhid: cycle.patient_uhid
                      });
                    }
                  }}
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.cycle_number}>
                      {c.cycle_number} — {c.patient_name} ({c.patient_uhid})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Embryo Code & Grade *
                </label>
                <Input
                  type="text"
                  value={formData.embryo_code}
                  onChange={(e) => setFormData({ ...formData, embryo_code: e.target.value })}
                  placeholder="e.g. E2-Day5 (4AA)"
                  required
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                Liquid Nitrogen Physical Coordinates Matrix
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    LN2 Tank
                  </label>
                  <Select
                    value={formData.tank_id}
                    onChange={(e) => setFormData({ ...formData, tank_id: e.target.value })}
                  >
                    <option value="Tank-1">Tank-1 (Auto LN2)</option>
                    <option value="Tank-2">Tank-2 (Manual)</option>
                    <option value="Tank-3">Tank-3 (Vapor)</option>
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Canister
                  </label>
                  <Select
                    value={formData.canister_id}
                    onChange={(e) => setFormData({ ...formData, canister_id: e.target.value })}
                  >
                    <option value="Canister-A">Canister-A</option>
                    <option value="Canister-B">Canister-B</option>
                    <option value="Canister-C">Canister-C</option>
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Goblet Color
                  </label>
                  <Select
                    value={formData.goblet_color}
                    onChange={(e) => setFormData({ ...formData, goblet_color: e.target.value })}
                  >
                    {GOBLET_COLORS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Cane #
                  </label>
                  <Input
                    type="text"
                    value={formData.cane_number}
                    onChange={(e) => setFormData({ ...formData, cane_number: e.target.value })}
                    placeholder="e.g. C-04"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Straw Barcode / ID *
                </label>
                <Input
                  type="text"
                  value={formData.straw_number}
                  onChange={(e) => setFormData({ ...formData, straw_number: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Freeze Date *
                </label>
                <Input
                  type="date"
                  value={formData.freeze_date}
                  onChange={(e) => setFormData({ ...formData, freeze_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Consent Expiry (5 Yrs)
                </label>
                <Input
                  type="date"
                  value={formData.consent_expiry_date}
                  onChange={(e) => setFormData({ ...formData, consent_expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Vitrification Media Lot
                </label>
                <Input
                  type="text"
                  value={formData.media_used}
                  onChange={(e) => setFormData({ ...formData, media_used: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Supervising Embryologist
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
                Cryostorage Notes
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
                Confirm Cryostorage
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Thaw Event Modal */}
      {isThawModalOpen && selectedRecord && (
        <Modal
          isOpen={isThawModalOpen}
          onClose={() => setIsThawModalOpen(false)}
          title={`Log Embryo Thawing Event — Straw ${selectedRecord.straw_number}`}
          size="md"
        >
          <form onSubmit={handleConfirmThaw} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '0.8rem', color: 'var(--color-warning)' }}>
              <strong>Confirm Straw Retrieval:</strong> Patient {selectedRecord.patient_name} ({selectedRecord.patient_uhid}) &bull; Embryo {selectedRecord.embryo_code}.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Thawing Date *
                </label>
                <Input
                  type="date"
                  value={thawData.thaw_date}
                  onChange={(e) => setThawData({ ...thawData, thaw_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Post-Thaw Survival (%) *
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={thawData.post_thaw_survival_pct}
                  onChange={(e) => setThawData({ ...thawData, post_thaw_survival_pct: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Thawing Media Kit & Batch
              </label>
              <Input
                type="text"
                value={thawData.thawing_media}
                onChange={(e) => setThawData({ ...thawData, thawing_media: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Performing Embryologist
              </label>
              <Input
                type="text"
                value={thawData.performing_embryologist}
                onChange={(e) => setThawData({ ...thawData, performing_embryologist: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsThawModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Thaw Record
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Straw Barcode Label Modal */}
      {isLabelModalOpen && selectedRecord && (
        <Modal
          isOpen={isLabelModalOpen}
          onClose={() => setIsLabelModalOpen(false)}
          title={`Cryo Straw Label — ${selectedRecord.straw_number}`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                width: '100%',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-main)'
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                Hospital IVF Cryo-Bank Repository
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'monospace', margin: '4px 0' }}>
                {selectedRecord.straw_number}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <QrCode size={64} color="var(--color-text-primary)" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textAlign: 'left', lineHeight: 1.4 }}>
                <div><strong>Patient:</strong> {selectedRecord.patient_name}</div>
                <div><strong>UHID:</strong> {selectedRecord.patient_uhid}</div>
                <div><strong>Embryo:</strong> {selectedRecord.embryo_code} ({selectedRecord.gardner_grade})</div>
                <div><strong>Coord:</strong> {selectedRecord.tank_id} &bull; {selectedRecord.canister_id} &bull; {selectedRecord.goblet_color}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="outline" size="sm" onClick={() => setIsLabelModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={13} />
                <span>Print Label</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
