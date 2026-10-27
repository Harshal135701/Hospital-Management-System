import React, { useState } from 'react';
import {
  Bed,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  Siren,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { BAY_ZONES, TRIAGE_LEVELS } from './emergencyConstants';

export function EmergencyBaysDesk({ bays = [],
  triageList = [],
  loading = false,
  onAllocateBay,
  onVacateBay, showToast }) {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [targetBayForAllocation, setTargetBayForAllocation] = useState(null);

  // Allocation modal form
  const [selectedTriageId, setSelectedTriageId] = useState('');
  const [allocatedBy, setAllocatedBy] = useState('Staff Nurse in Charge');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Triage patients who currently have no bay assigned
  const unallocatedPatients = triageList.filter(t => !t.bay_id && !t.bay_number);

  // Filtered bays
  const filteredBays = bays.filter((bay) => {
    const matchesZone =
      selectedZoneFilter === 'ALL' || bay.zone === selectedZoneFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || bay.status === selectedStatusFilter;

    const matchesSearch =
      (bay.bay_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bay.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bay.patient_uhid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bay.equipment || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesZone && matchesStatus && matchesSearch;
  });

  // Bed stats
  const totalBays = bays.length;
  const occupiedBays = bays.filter(b => b.status === 'occupied').length;
  const availableBays = bays.filter(b => b.status === 'available').length;
  const cleaningBays = bays.filter(b => b.status === 'cleaning').length;
  const occupancyRate = totalBays > 0 ? Math.round((occupiedBays / totalBays) * 100) : 0;

  const handleOpenAllocate = (bay) => {
    setTargetBayForAllocation(bay);
    setSelectedTriageId(unallocatedPatients[0]?.id || '');
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = async (e) => {
    e.preventDefault();
    if (!selectedTriageId || !targetBayForAllocation) {
      (showToast ? showToast('Please select a triage patient.') : alert('Please select a triage patient.'));
      return;
    }

    try {
      setIsSubmitting(true);
      await onAllocateBay(selectedTriageId, targetBayForAllocation.id, allocatedBy);
      setShowAllocateModal(false);
    } catch (err) {
      (showToast ? showToast('Failed to allocate bay: ' + err.message) : alert('Failed to allocate bay: ' + err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmVacate = async (bay) => {
    // Locate triage record associated with this bay
    const trg = triageList.find(t => t.bay_id === bay.id || t.bay_number === bay.bay_number);
    if (!trg && !bay.patient_name) {
      (showToast ? showToast('No active patient assigned to this bay.') : alert('No active patient assigned to this bay.'));
      return;
    }

    const triageIdToVacate = trg ? trg.id : bay.patient_id;
    if (!window.confirm(`Release and mark ${bay.bay_number} as available? This will discharge/vacate the current occupant from the bay.`)) {
      return;
    }

    try {
      await onVacateBay(triageIdToVacate);
    } catch (err) {
      (showToast ? showToast('Failed to release bay: ' + err.message) : alert('Failed to release bay: ' + err.message));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Bed Board Summary KPI Cards matching Finance VouchersDesk */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Total Emergency Beds
            </span>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Capacity
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {totalBays} Beds
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Resuscitation (Red), Monitored (Yellow), Green & Isolation
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase' }}>
              Occupied Beds ({occupancyRate}%)
            </span>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Occupied
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#DC2626' }}>
            {occupiedBays} / {totalBays}
          </div>
          <span style={{ fontSize: '0.74rem', color: occupancyRate >= 80 ? '#DC2626' : 'var(--color-text-muted)', fontWeight: occupancyRate >= 80 ? '600' : 'normal' }}>
            {occupancyRate >= 80 ? '⚠ High Bed Pressure • Expedite Dispositions' : 'Optimal acute census capacity'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' }}>
              Available Ready Beds
            </span>
            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Turnaround
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#16A34A' }}>
            {availableBays} Ready
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: '600' }}>
            Sanitized and equipped for immediate patient intake
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: unallocatedPatients.length > 0 ? '#EA580C' : 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Awaiting Bay Allocation
            </span>
            <span style={{ backgroundColor: unallocatedPatients.length > 0 ? '#FFEDD5' : '#F1F5F9', color: unallocatedPatients.length > 0 ? '#9A3412' : '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Queue
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: unallocatedPatients.length > 0 ? '#EA580C' : 'var(--color-text-primary)' }}>
            {unallocatedPatients.length} Patients
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Triaged ED cases requiring acute bay placement
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Zone Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search bay number, patient name, UHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                fontSize: '0.82rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                backgroundColor: '#FAFAFA'
              }}
            />
          </div>

          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: '0.82rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Emergency Zones</option>
            <option value="RED">Zone Red (Resuscitation)</option>
            <option value="YELLOW">Zone Yellow (Acute Monitored)</option>
            <option value="GREEN">Zone Green (Ambulatory/Obs)</option>
            <option value="BLUE">Zone Blue (Isolation/Decon)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: '0.82rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Bed Statuses</option>
            <option value="available">Available Ready</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning / Decon</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DC2626' }}></span>
            <span>Occupied</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
            <span>Cleaning</span>
          </div>
        </div>
      </div>

      {/* Interactive Emergency Bed Grid Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
        {filteredBays.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            No emergency bays match the selected filters.
          </div>
        ) : (
          filteredBays.map((bay) => {
            const zoneCfg = BAY_ZONES[bay.zone] || BAY_ZONES.YELLOW;
            const isOccupied = bay.status === 'occupied';
            const isAvailable = bay.status === 'available';
            const isCleaning = bay.status === 'cleaning';

            return (
              <div
                key={bay.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: isOccupied ? '1px solid #FECACA' : isAvailable ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Bay Header */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isOccupied ? '#FEF2F2' : isAvailable ? '#F0FDF4' : '#FFFBEB'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bed size={16} color={isOccupied ? '#DC2626' : isAvailable ? '#16A34A' : '#D97706'} />
                    <span style={{ fontWeight: '800', fontSize: '0.90rem', color: 'var(--color-text-primary)' }}>
                      {bay.bay_number}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        backgroundColor: zoneCfg.bgColor,
                        color: zoneCfg.color,
                        border: `1px solid ${zoneCfg.borderColor}`
                      }}
                    >
                      {zoneCfg.name.split('—')[0].trim()}
                    </span>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.70rem',
                        fontWeight: '700',
                        backgroundColor: isOccupied ? '#FEE2E2' : isAvailable ? '#DCFCE7' : '#FEF3C7',
                        color: isOccupied ? '#991B1B' : isAvailable ? '#166534' : '#92400E'
                      }}
                    >
                      {isOccupied ? 'Occupied' : isAvailable ? 'Ready' : 'Cleaning'}
                    </span>
                  </div>
                </div>

                {/* Bay Body Content */}
                <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {isOccupied ? (
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                        Current Occupant:
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                        {bay.patient_name || 'Active Triage Patient'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {bay.patient_uhid || 'UHID Registered'} • Triage: {bay.triage_number || 'TRG-ACTIVE'}
                      </div>

                      {bay.triage_level && (
                        <div style={{ marginTop: '8px' }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.70rem',
                              fontWeight: '700',
                              backgroundColor: TRIAGE_LEVELS[bay.triage_level]?.bgColor,
                              color: TRIAGE_LEVELS[bay.triage_level]?.textColor,
                              border: `1px solid ${TRIAGE_LEVELS[bay.triage_level]?.borderColor}`
                            }}
                          >
                            Level {bay.triage_level}: {TRIAGE_LEVELS[bay.triage_level]?.category}
                          </span>
                        </div>
                      )}

                      <div style={{ marginTop: '10px', fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                        <strong>Telemetry & Equipment:</strong> {bay.equipment || 'Standard Resus Monitoring'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.78rem', color: isAvailable ? '#166534' : '#92400E', fontWeight: '600' }}>
                        {isAvailable ? '✓ Bed Sanitized & Available for Allocation' : '⚠ Terminal Cleaning & UV Disinfection in progress'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                        {bay.equipment || 'Standard Emergency Bay Equipment Installed'}
                      </div>
                    </div>
                  )}

                  {/* Bay Card Action Footer */}
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {isAvailable && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleOpenAllocate(bay)}
                      >
                        Allocate Patient
                      </Button>
                    )}

                    {isOccupied && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmVacate(bay)}
                      >
                        Release / Vacate Bed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Allocate Patient to Bay */}
      {showAllocateModal && targetBayForAllocation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAllocateModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '520px',
              padding: '20px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bed size={18} color="var(--color-primary-teal)" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700' }}>
                  Allocate Bay {targetBayForAllocation.bay_number} ({targetBayForAllocation.zone} Zone)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Select Triage Patient Awaiting Bed:
                </label>
                {unallocatedPatients.length === 0 ? (
                  <div style={{ padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '4px', fontSize: '0.76rem', color: '#92400E' }}>
                    All currently triaged patients already have an assigned emergency bay. You may also select any active triage case to transfer.
                  </div>
                ) : null}

                <select
                  required
                  value={selectedTriageId}
                  onChange={(e) => setSelectedTriageId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '6px'
                  }}
                >
                  <option value="">-- Choose Triage Patient --</option>
                  {(unallocatedPatients.length > 0 ? unallocatedPatients : triageList).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.patient_name} ({t.patient_uhid}) — Level {t.triage_level}: {t.triage_number}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Allocated By (Staff Nurse / Ward In-Charge):
                </label>
                <input
                  type="text"
                  required
                  value={allocatedBy}
                  onChange={(e) => setAllocatedBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '0.82rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={isSubmitting}
                >
                  Confirm Bay Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
