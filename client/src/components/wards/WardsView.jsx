import React, { useEffect, useState } from 'react';
import {
  Bed,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  Building,
  Plus,
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, Button, Badge, SafeImage, Modal, Input, Select } from '../common/UIPrimitives';
import { RoomService, DepartmentService, TokenManager } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { InpatientWardService } from '../../services/api';
import { HEALTHCARE_IMAGES, CLINICAL_FALLBACK_SVG } from '../../assets/images';

export const WardsView = ({ onBack, onNavigate }) => {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [successBanner, setSuccessBanner] = useState(null);

  // Add Room / Bed Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '105',
    name: 'General Ward Room 105',
    floor: '1st Floor',
    roomType: 'General Ward',
    departmentId: '',
    capacity: 4,
    dailyTariff: 2000
  });
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [roomModalError, setRoomModalError] = useState(null);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await DepartmentService.getDepartments();
        if (Array.isArray(depts)) setDepartmentsList(depts);
      } catch {}
    }
    loadDepts();
  }, []);

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim() || !roomForm.name.trim()) {
      setRoomModalError('Room number and name are required.');
      return;
    }
    setIsSubmittingRoom(true);
    setRoomModalError(null);

    try {
      const payload = {
        room_number: roomForm.roomNumber.trim(),
        name: roomForm.name.trim(),
        floor: roomForm.floor.trim(),
        room_type: roomForm.roomType,
        department_id: roomForm.departmentId || (departmentsList[0]?.id || null),
        capacity: parseInt(roomForm.capacity) || 1,
        daily_tariff: parseFloat(roomForm.dailyTariff) || 2000
      };

      if (TokenManager.getToken()) {
        const res = await RoomService.createRoom(payload);
        const created = res?.data || res;
        setWards(prev => [
          {
            id: created.id,
            name: created.name,
            wing: `${created.floor} Wing`,
            category: created.room_type,
            imageKey: created.room_type === 'ICU' ? 'hospitalRoomPrivate' : 'inpatientWardBed',
            total_beds: created.capacity,
            occupied_beds: 0,
            available_beds: created.capacity,
            nurse_lead: 'Sister Incharge',
            target_temp: '22°C (Controlled)',
            daily_tariff: created.daily_tariff,
            beds: Array.from({ length: created.capacity }).map((_, idx) => ({
              id: `${created.id}-b${idx+1}`,
              number: `Bed ${created.room_number}-${String(idx+1).padStart(2, '0')}`,
              status: 'available',
              telemetry: 'Clean / Sanitized'
            }))
          },
          ...prev
        ]);
      } else {
        const newRoom = {
          id: `rm-${Date.now()}`,
          name: payload.name,
          wing: `${payload.floor} Wing`,
          category: payload.room_type,
          imageKey: payload.room_type === 'ICU' ? 'hospitalRoomPrivate' : 'inpatientWardBed',
          total_beds: payload.capacity,
          occupied_beds: 0,
          available_beds: payload.capacity,
          nurse_lead: 'Sister Incharge',
          target_temp: '22°C (Controlled)',
          daily_tariff: payload.daily_tariff,
          beds: Array.from({ length: payload.capacity }).map((_, idx) => ({
            id: `rm-${Date.now()}-b${idx+1}`,
            number: `Bed ${payload.room_number}-${String(idx+1).padStart(2, '0')}`,
            status: 'available',
            telemetry: 'Clean / Sanitized'
          }))
        };
        setWards(prev => [newRoom, ...prev]);
      }

      setIsAddRoomOpen(false);
      setSuccessBanner(`Room ${payload.name} (${payload.room_type}) added with daily tariff of ${formatINR(payload.daily_tariff)}.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setRoomModalError(err.message || 'Failed to add room.');
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  useEffect(() => {
    async function loadWards() {
      const res = await InpatientWardService.getWards();
      if (res) {
        setWards(res.data || []);
        if (res.data?.length > 0) setSelectedWard(res.data[0]);
        if (res.isMock) setIsMock(true);
      }
    }
    loadWards();
  }, []);

  const totalBedsCount = wards.reduce((acc, w) => acc + w.total_beds, 0);
  const totalOccupiedCount = wards.reduce((acc, w) => acc + w.occupied_beds, 0);
  const totalAvailableCount = wards.reduce((acc, w) => acc + w.available_beds, 0);
  const occupancyRate = totalBedsCount > 0 ? Math.round((totalOccupiedCount / totalBedsCount) * 100) : 0;

  const categories = ['all', ...new Set(wards.map((w) => w.category))];

  const filteredWards = filterCategory === 'all'
    ? wards
    : wards.filter((w) => w.category === filterCategory);

  const getBedStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="sm">Available</Badge>;
      case 'occupied':
        return <Badge variant="warning" size="sm">Occupied</Badge>;
      case 'reserved':
        return <Badge variant="teal" size="sm">Reserved</Badge>;
      case 'maintenance':
        return <Badge variant="danger" size="sm">Maintenance</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
              Inpatient Care & Bed Allocation
            </span>
            {isMock && <Badge variant="teal" size="sm">Census Connected (Demo Active)</Badge>}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '4px 0 2px 0' }}>
            Beds & Inpatient Wards Telemetry
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Real-time census, sanitization status, and bedside patient-monitoring telemetry across wards.
          </p>
        </div>

        {onBack && (
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Hospital Inpatient Telemetry KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Hospital Capacity
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>
            {totalBedsCount} Beds
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Across 4 specialized inpatient wards
          </div>
        </div>

        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Occupied Beds
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
            {totalOccupiedCount} Beds
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Hospital Occupancy: <strong>{occupancyRate}%</strong>
          </div>
        </div>

        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Sanitized & Ready Beds
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '2px' }}>
            {totalAvailableCount} Available
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Immediate admission capability
          </div>
        </div>
      </div>

      {/* Ward Cards with Authentic Hospital Facility Photography */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
            Inpatient Wings & Bed Bays
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(cat)}
              >
                {cat === 'all' ? 'All Wings' : cat}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '18px' }}>
          {filteredWards.map((w) => {
            const photo = HEALTHCARE_IMAGES[w.imageKey] || HEALTHCARE_IMAGES.inpatientWardBed;
            const pct = Math.round((w.occupied_beds / w.total_beds) * 100);

            return (
              <div
                key={w.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Visual Header with authentic hospital ward photography */}
                <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                  <SafeImage
                    src={photo}
                    fallbackSrc={CLINICAL_FALLBACK_SVG}
                    alt={w.name}
                    style={{ width: '100%', height: '100%' }}
                    borderRadius="0"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(24, 50, 56, 0.75) 0%, transparent 60%)'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-aqua-accent)', textTransform: 'uppercase' }}>
                        {w.wing}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                        {w.name}
                      </h3>
                    </div>
                    <Badge variant={pct >= 85 ? 'warning' : 'teal'} size="sm">
                      {pct}% Full
                    </Badge>
                  </div>
                </div>

                {/* Content Body */}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Capacity Telemetry Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Bed Occupancy Status</span>
                        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {w.occupied_beds} Occupied / {w.available_beds} Free
                        </span>
                      </div>
                      <div style={{ height: '7px', borderRadius: 'var(--radius-full)', backgroundColor: '#EEF4F4', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 85 ? 'var(--color-warning)' : 'var(--color-primary-teal)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      <div>Nurse Lead: <strong>{w.nurse_lead}</strong></div>
                      <div>HVAC Temp: <strong>{w.target_temp}</strong></div>
                    </div>

                    {/* Beds Grid Preview */}
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Bed Bay Telemetry Status
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {w.beds.map((b) => (
                          <div
                            key={b.id}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#FAFCFC',
                              border: '1px solid var(--color-border-subtle)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{b.number}</span>
                              {getBedStatusBadge(b.status)}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.patient || b.telemetry}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Total {w.total_beds} beds in ward
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Ward detail view: ${w.name}. Sanitization protocols verified.`)}
                    >
                      Manage Ward
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Inpatient Room Modal */}
      {isAddRoomOpen && (
        <Modal
          isOpen={isAddRoomOpen}
          onClose={() => setIsAddRoomOpen(false)}
          title="Add Inpatient Room & Ward Capacity"
          subtitle="Configure room number, tariff, ward type, and bed bay capacity"
          maxWidth="540px"
        >
          <form onSubmit={handleAddRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {roomModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {roomModalError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
              <Input
                label="Room Number"
                required
                placeholder="e.g. 204"
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              />

              <Input
                label="Room / Bay Name"
                required
                placeholder="e.g. Post-Op Recovery Ward"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Room Classification Type
                </label>
                <select
                  value={roomForm.roomType}
                  onChange={(e) => {
                    const t = e.target.value;
                    let defTariff = 2000;
                    if (t === 'ICU') defTariff = 5000;
                    else if (t === 'Deluxe') defTariff = 4500;
                    else if (t === 'Semi-Private') defTariff = 3500;
                    setRoomForm({ ...roomForm, roomType: t, dailyTariff: defTariff });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  <option value="General Ward">General Ward (₹2,000/day)</option>
                  <option value="ICU">Intensive Care Unit (ICU @ ₹5,000/day)</option>
                  <option value="Semi-Private">Semi-Private Sharing (₹3,500/day)</option>
                  <option value="Deluxe">Private Deluxe (₹4,500/day)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Assigned Department
                </label>
                <select
                  value={roomForm.departmentId}
                  onChange={(e) => setRoomForm({ ...roomForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
              <Input
                label="Floor / Level"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              />

              <Input
                label="Bed Capacity"
                type="number"
                min="1"
                max="20"
                required
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
              />

              <Input
                label="Daily Tariff (₹)"
                type="number"
                min="0"
                required
                value={roomForm.dailyTariff}
                onChange={(e) => setRoomForm({ ...roomForm, dailyTariff: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAddRoomOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingRoom} icon={CheckCircle2}>
                Add Room & Beds
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
