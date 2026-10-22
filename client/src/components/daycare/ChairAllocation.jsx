import React, { useState, useMemo } from 'react';
import {
  Layers,
  Bed,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge, Modal, Select } from '../common/UIPrimitives';

export function ChairAllocation({
  chairs,
  admissions,
  onAllocateChair,
  onReleaseChair,
  onUpdateChairStatus
}) {
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedChair, setSelectedChair] = useState(null);
  const [targetAdmissionId, setTargetAdmissionId] = useState('');

  // Admissions that need a chair (either unallocated or admitted/booked)
  const unallocatedAdmissions = useMemo(() => {
    return admissions.filter(a => !a.chair_id && ['booked', 'admitted', 'in_procedure'].includes(a.status));
  }, [admissions]);

  const zones = useMemo(() => {
    return Array.from(new Set(chairs.map(c => c.zone)));
  }, [chairs]);

  const filteredChairs = useMemo(() => {
    return chairs.filter(c => {
      const matchZone = selectedZone === 'all' || c.zone === selectedZone;
      const matchType = selectedType === 'all' || c.type === selectedType;
      return matchZone && matchType;
    });
  }, [chairs, selectedZone, selectedType]);

  const counts = useMemo(() => {
    const total = chairs.length;
    const available = chairs.filter(c => c.status === 'available').length;
    const occupied = chairs.filter(c => c.status === 'occupied').length;
    const reserved = chairs.filter(c => c.status === 'reserved').length;
    const cleaning = chairs.filter(c => c.status === 'cleaning').length;
    return { total, available, occupied, reserved, cleaning };
  }, [chairs]);

  const handleOpenAllocate = (chair) => {
    setSelectedChair(chair);
    if (unallocatedAdmissions.length > 0) {
      setTargetAdmissionId(unallocatedAdmissions[0].id);
    }
    setIsAllocateModalOpen(true);
  };

  const handleConfirmAllocation = (e) => {
    e.preventDefault();
    if (!selectedChair || !targetAdmissionId) return;
    onAllocateChair(targetAdmissionId, selectedChair.id);
    setIsAllocateModalOpen(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return {
          badge: <Badge variant="success">Available</Badge>,
          border: '1px solid rgba(16, 185, 129, 0.4)',
          bg: '#F0FDF4',
          accent: 'var(--color-success)'
        };
      case 'occupied':
        return {
          badge: <Badge variant="teal">Occupied</Badge>,
          border: '1.5px solid var(--color-primary-teal)',
          bg: '#FFFFFF',
          accent: 'var(--color-primary-teal)'
        };
      case 'reserved':
        return {
          badge: <Badge variant="warning">Reserved</Badge>,
          border: '1px solid rgba(245, 158, 11, 0.4)',
          bg: '#FFFBEB',
          accent: 'var(--color-warning)'
        };
      case 'cleaning':
        return {
          badge: <Badge variant="gray">Sanitizing</Badge>,
          border: '1px dashed var(--color-border)',
          bg: '#F8FAFC',
          accent: '#64748B'
        };
      default:
        return {
          badge: <Badge variant="gray">{status}</Badge>,
          border: '1px solid var(--color-border)',
          bg: '#FFFFFF',
          accent: '#64748B'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Total Day Stations</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{counts.total}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', fontWeight: '600' }}>Available Stations</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-success)' }}>{counts.available}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(8, 127, 140, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>Active Occupied</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{counts.occupied}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-warning)', fontWeight: '600' }}>Reserved Slots</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-warning)' }}>{counts.reserved}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Cleaning & Prep</div>
          <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#64748B' }}>{counts.cleaning}</div>
        </div>
      </div>

      {/* Zone & Type Filter Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Zone:</span>
          <button
            type="button"
            onClick={() => setSelectedZone('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: '600',
              border: '1px solid var(--color-border)',
              backgroundColor: selectedZone === 'all' ? 'var(--color-primary-teal)' : '#FFFFFF',
              color: selectedZone === 'all' ? '#FFFFFF' : 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            All Zones
          </button>
          {zones.map(z => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: '1px solid var(--color-border)',
                backgroundColor: selectedZone === z ? 'var(--color-primary-teal)' : '#FFFFFF',
                color: selectedZone === z ? '#FFFFFF' : 'var(--color-text-secondary)',
                cursor: 'pointer'
              }}
            >
              {z}
            </button>
          ))}
        </div>

        {unallocatedAdmissions.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {unallocatedAdmissions.length} patient(s) awaiting station allocation
          </div>
        )}
      </div>

      {/* Visual Station Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredChairs.map(chair => {
          const styleInfo = getStatusStyle(chair.status);
          const currentAdmission = admissions.find(a => String(a.chair_id) === String(chair.id) || String(a.id) === String(chair.admissionId));

          return (
            <div
              key={chair.id}
              style={{
                backgroundColor: styleInfo.bg,
                border: styleInfo.border,
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                {/* Station Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-pale-aqua)',
                        color: styleInfo.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Bed size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
                        {chair.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                        {chair.code} • {chair.zone}
                      </div>
                    </div>
                  </div>
                  {styleInfo.badge}
                </div>

                {/* Patient / Episode Content */}
                {chair.status === 'occupied' && currentAdmission ? (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(8, 127, 140, 0.05)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(8, 127, 140, 0.15)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {currentAdmission.patient_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {currentAdmission.patient_uhid} • {currentAdmission.patient_gender}, {currentAdmission.patient_age}y
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-text-primary)', marginTop: '6px' }}>
                      {currentAdmission.procedure_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Admitted: {currentAdmission.admitted_at ? new Date(currentAdmission.admitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </div>
                  </div>
                ) : chair.status === 'reserved' && currentAdmission ? (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      backgroundColor: '#FFFBEB',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      color: 'var(--color-warning)'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>Reserved for {currentAdmission.patient_name}</div>
                    <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>{currentAdmission.procedure_name}</div>
                  </div>
                ) : chair.status === 'cleaning' ? (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={16} style={{ color: 'var(--color-primary-teal)' }} />
                    <span>Undergoing chemical sanitation & linen replacement.</span>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '14px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      textAlign: 'center'
                    }}
                  >
                    Station sanitized and ready for patient intake.
                  </div>
                )}
              </div>

              {/* Station Actions Footer */}
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '6px'
                }}
              >
                {chair.status === 'available' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => handleOpenAllocate(chair)}
                  >
                    Allocate Patient
                  </Button>
                )}

                {chair.status === 'occupied' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReleaseChair(currentAdmission ? currentAdmission.id : chair.id)}
                    title="Release patient and send station to cleaning"
                  >
                    Release Station
                  </Button>
                )}

                {chair.status === 'cleaning' && (
                  <Button
                    variant="soft"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => onUpdateChairStatus(chair.id, 'available')}
                  >
                    Mark Sanitized
                  </Button>
                )}

                {chair.status === 'reserved' && (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => onUpdateChairStatus(chair.id, 'occupied')}
                  >
                    Check In Patient
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chair Allocation Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title={`Allocate ${selectedChair?.name || 'Day Station'}`}
        subtitle="Assign an ambulatory admission episode to this station."
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmAllocation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: 'var(--color-primary-teal)',
              fontWeight: '500'
            }}
          >
            Station: <strong>{selectedChair?.name}</strong> ({selectedChair?.zone})
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
              Select Day Care Admission *
            </label>
            {unallocatedAdmissions.length === 0 ? (
              <div style={{ padding: '14px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                No unallocated Day Care episodes currently waiting. You can book an episode first in screen 8.1.
              </div>
            ) : (
              <select
                value={targetAdmissionId}
                onChange={(e) => setTargetAdmissionId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                {unallocatedAdmissions.map(adm => (
                  <option key={adm.id} value={adm.id}>
                    {adm.admission_number || adm.id} - {adm.patient_name} ({adm.procedure_name})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={unallocatedAdmissions.length === 0}
              icon={CheckCircle2}
            >
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
