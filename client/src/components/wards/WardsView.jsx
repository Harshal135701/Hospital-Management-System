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
import { Card, Button, Badge, SafeImage, Modal } from '../common/UIPrimitives';
import { InpatientWardService } from '../../services/api';
import { HEALTHCARE_IMAGES, CLINICAL_FALLBACK_SVG } from '../../assets/images';

export const WardsView = ({ onBack, onNavigate }) => {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
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
    </div>
  );
};
