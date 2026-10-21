import React, { useState, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Thermometer,
  User,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { formatDateTimeIN } from '../../utils/formatters';

export function WardDeliveryTracking({
  deliveries,
  onUpdateDeliveryStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [exceptionReason, setExceptionReason] = useState('');

  const wards = useMemo(() => {
    return Array.from(new Set(deliveries.map(d => d.ward)));
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (d.patient_name || '').toLowerCase().includes(q) ||
        (d.patient_uhid || '').toLowerCase().includes(q) ||
        (d.tray_barcode || '').toLowerCase().includes(q) ||
        (d.bed || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchWard = wardFilter === 'all' || d.ward === wardFilter;
      return matchSearch && matchStatus && matchWard;
    });
  }, [deliveries, searchTerm, statusFilter, wardFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'dispatched':
        return <Badge variant="info">Dispatched from Kitchen</Badge>;
      case 'in_transit':
        return <Badge variant="warning">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered to Bedside</Badge>;
      case 'exception_returned':
        return <Badge variant="danger">Exception / Withheld</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const handleOpenException = (delivery) => {
    setSelectedDelivery(delivery);
    setExceptionReason('');
    setIsExceptionModalOpen(true);
  };

  const handleConfirmException = (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    onUpdateDeliveryStatus(selectedDelivery.id, 'exception_returned', exceptionReason || 'Patient unready / fasting protocol active');
    setIsExceptionModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by patient, UHID, bed or tray barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Delivery States</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered to Bedside</option>
            <option value="exception_returned">Exception / Withheld</option>
          </select>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Inpatient Wards</option>
            {wards.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tray Delivery Registry Card */}
      <Card
        title={`Ward Meal Tray Dispatch & Bedside Handover (${filteredDeliveries.length})`}
        subtitle="Live chain-of-custody tracking from kitchen food warmers to inpatient bedside consumption."
      >
        {filteredDeliveries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Truck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No delivery records match criteria.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Tray Barcode</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Patient & Ward Location</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Diet Type</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Meal & Temp</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Handover / Clinical Notes</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(del => (
                  <tr
                    key={del.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: del.status === 'exception_returned' ? '#FFF5F5' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                      {del.tray_barcode}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{del.patient_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        <strong>{del.ward}</strong> • {del.bed} ({del.patient_uhid})
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: del.diet_code === 'NPO' ? '#FEE2E2' : 'var(--color-bg-pale-aqua)',
                          color: del.diet_code === 'NPO' ? 'var(--color-error)' : 'var(--color-primary-teal)',
                          fontWeight: '600',
                          fontSize: '0.76rem'
                        }}
                      >
                        {del.diet_name}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{del.meal_type}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Thermometer size={11} /> {del.temperature_c}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(del.status)}
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                        {del.delivered_at ? formatDateTimeIN(del.delivered_at) : del.dispatched_at ? `Dispatched ${formatDateTimeIN(del.dispatched_at)}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>
                        {del.handover_nurse}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {del.notes}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {del.status === 'in_transit' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => onUpdateDeliveryStatus(del.id, 'delivered', 'Delivered warm to bedside. Verified by nurse.')}
                          >
                            Delivered
                          </Button>
                        )}
                        {del.status !== 'delivered' && del.status !== 'exception_returned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenException(del)}
                          >
                            Exception
                          </Button>
                        )}
                        {del.status === 'delivered' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>
                            ✓ Confirmed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Exception Modal */}
      <Modal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        title="Report Delivery Exception / Meal Withheld"
        subtitle="Log reason why food tray could not be delivered to bedside."
        maxWidth="480px"
      >
        <form onSubmit={handleConfirmException} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
            Patient: <strong>{selectedDelivery?.patient_name}</strong> ({selectedDelivery?.ward} - {selectedDelivery?.bed})
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Reason for Withholding Tray *
            </label>
            <select
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <option value="">-- Choose Exception Reason --</option>
              <option value="Patient transferred to Operation Theatre (OT) / Procedure">Patient transferred to OT / Procedure</option>
              <option value="Surgeon ordered emergency NPO fasting">Surgeon ordered emergency NPO fasting</option>
              <option value="Patient asleep / requested later delivery">Patient asleep / requested later delivery</option>
              <option value="Patient undergoing diagnostic imaging / ultrasound">Patient undergoing diagnostic imaging</option>
              <option value="Tray temperature below food safety threshold">Tray temperature below food safety threshold</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsExceptionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Withhold Tray & Return to Kitchen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
