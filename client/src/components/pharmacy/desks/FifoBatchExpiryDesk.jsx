import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../common/UIPrimitives';

function getDaysUntilExpiry(expiryDateStr) {
  if (!expiryDateStr) return 999;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function FifoBatchExpiryDesk({
  batches = [],
  onBatchUpdated
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('ALL'); // 'ALL', 'CRITICAL', 'NEAR_EXPIRY', 'EXPIRED'
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState('Physical packaging damage observed');
  const [notification, setNotification] = useState(null);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return batches.filter(batch => {
      const matchSearch =
        !q ||
        (batch.medicineName && batch.medicineName.toLowerCase().includes(q)) ||
        (batch.batchNo && batch.batchNo.toLowerCase().includes(q)) ||
        (batch.supplier && batch.supplier.toLowerCase().includes(q)) ||
        (batch.rackLocation && batch.rackLocation.toLowerCase().includes(q));

      const days = getDaysUntilExpiry(batch.expiryDate);
      let matchExpiry = true;
      if (expiryFilter === 'CRITICAL') {
        matchExpiry = days > 0 && days <= 30;
      } else if (expiryFilter === 'NEAR_EXPIRY') {
        matchExpiry = days > 0 && days <= 90;
      } else if (expiryFilter === 'EXPIRED') {
        matchExpiry = days <= 0 || batch.status.includes('Expired');
      }

      return matchSearch && matchExpiry;
    });
  }, [batches, searchQuery, expiryFilter]);

  // FIFO Grouping by Medicine
  const fifoSequences = useMemo(() => {
    const map = {};
    batches.forEach(b => {
      if (!map[b.medicineName]) map[b.medicineName] = [];
      map[b.medicineName].push(b);
    });

    // Sort batches by expiryDate ascending (First-Expiry-First-Out)
    Object.keys(map).forEach(med => {
      map[med].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    });

    return map;
  }, [batches]);

  const handleOpenQuarantine = (batch) => {
    setSelectedBatch(batch);
    setIsQuarantineModalOpen(true);
  };

  const handleExecuteQuarantine = (quarantine = true) => {
    if (!selectedBatch) return;

    const nextStatus = quarantine ? 'Expired - Quarantined' : 'Active (FIFO Primary)';
    const updated = {
      ...selectedBatch,
      status: nextStatus,
      quarantinedAt: quarantine ? new Date().toISOString() : null,
      quarantineReason: quarantine ? quarantineReason : null
    };

    if (onBatchUpdated) {
      onBatchUpdated(updated);
    }

    setIsQuarantineModalOpen(false);
    setNotification(`Batch ${selectedBatch.batchNo} (${selectedBatch.medicineName}) has been ${quarantine ? 'quarantined from dispensing' : 'restored to active stock'}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Alert */}
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#166534',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      {/* Primary Batch Inventory Card */}
      <Card
        title="25.3 FIFO Batch Ledger & Near-Expiry Vigilance"
        subtitle="Enforces First-In First-Out (FIFO) & First-Expiry First-Out (FEFO) dispensing order and monitors critical shelf-life thresholds"
      >
        {/* Search & Expiry Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by Medicine, Batch #, Supplier, Rack Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setExpiryFilter('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: expiryFilter === 'ALL' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: expiryFilter === 'ALL' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                color: expiryFilter === 'ALL' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: expiryFilter === 'ALL' ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              All Batches
            </button>

            <button
              type="button"
              onClick={() => setExpiryFilter('NEAR_EXPIRY')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: expiryFilter === 'NEAR_EXPIRY' ? '2px solid #D97706' : '1px solid var(--color-border)',
                backgroundColor: expiryFilter === 'NEAR_EXPIRY' ? '#FFFBEB' : '#FFFFFF',
                color: expiryFilter === 'NEAR_EXPIRY' ? '#D97706' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: expiryFilter === 'NEAR_EXPIRY' ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              Near Expiry (&lt; 90 Days)
            </button>

            <button
              type="button"
              onClick={() => setExpiryFilter('CRITICAL')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: expiryFilter === 'CRITICAL' ? '2px solid #DC2626' : '1px solid var(--color-border)',
                backgroundColor: expiryFilter === 'CRITICAL' ? '#FEF2F2' : '#FFFFFF',
                color: expiryFilter === 'CRITICAL' ? '#DC2626' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: expiryFilter === 'CRITICAL' ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              Critical (&lt; 30 Days)
            </button>

            <button
              type="button"
              onClick={() => setExpiryFilter('EXPIRED')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: expiryFilter === 'EXPIRED' ? '2px solid #7F1D1D' : '1px solid var(--color-border)',
                backgroundColor: expiryFilter === 'EXPIRED' ? '#FEF2F2' : '#FFFFFF',
                color: expiryFilter === 'EXPIRED' ? '#7F1D1D' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: expiryFilter === 'EXPIRED' ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              Expired / Quarantined
            </button>
          </div>
        </div>

        {/* Batches Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Medicine Name</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Batch Number</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>GRN Date</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Expiry Date</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Shelf-Life Remaining</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Available Qty</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Storage Location</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>FIFO Status</th>
                <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No stock batches found matching the selected expiry criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map(batch => {
                  const days = getDaysUntilExpiry(batch.expiryDate);
                  const isExpired = days <= 0 || batch.status.includes('Expired');
                  const isCritical = days > 0 && days <= 30;
                  const isNear = days > 30 && days <= 90;

                  return (
                    <tr
                      key={batch.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isExpired ? '#FEF2F2' : isCritical ? '#FFFDF5' : '#FFFFFF'
                      }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{batch.medicineName}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>{batch.supplier}</div>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {batch.batchNo}
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)', fontSize: '0.74rem' }}>
                        {batch.receivedDate}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700' }}>
                        {batch.expiryDate}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {isExpired ? (
                          <Badge variant="danger">Expired (Prohibited)</Badge>
                        ) : isCritical ? (
                          <Badge variant="danger">{days} Days Left</Badge>
                        ) : isNear ? (
                          <Badge variant="warning">{days} Days Left</Badge>
                        ) : (
                          <span style={{ color: '#16A34A', fontWeight: '600', fontSize: '0.76rem' }}>
                            ✓ {days} Days Valid
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '800' }}>
                        {batch.availableQty}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {batch.rackLocation}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge variant={isExpired ? 'danger' : batch.status.includes('Primary') ? 'teal' : 'neutral'}>
                          {batch.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        {isExpired ? (
                          <button
                            type="button"
                            onClick={() => { setSelectedBatch(batch); handleExecuteQuarantine(false); }}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #BBF7D0',
                              backgroundColor: '#F0FDF4',
                              color: '#166534',
                              fontSize: '0.70rem',
                              cursor: 'pointer'
                            }}
                          >
                            Release
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenQuarantine(batch)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #FECACA',
                              backgroundColor: '#FEF2F2',
                              color: '#991B1B',
                              fontSize: '0.70rem',
                              cursor: 'pointer'
                            }}
                          >
                            Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FIFO Allocation Priority Visualizer */}
      <Card
        title="FIFO / FEFO Allocation Ladder Preview"
        subtitle="Visualizing the automated priority queue used during prescription dispensing"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {Object.keys(fifoSequences).slice(0, 4).map(medName => {
            const medBatches = fifoSequences[medName];
            return (
              <div
                key={medName}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--color-primary-teal)' }}>
                  {medName}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {medBatches.map((b, idx) => {
                    const isFirst = idx === 0 && !b.status.includes('Expired');
                    return (
                      <div
                        key={b.id}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: isFirst ? '#F0FDF4' : '#FFFFFF',
                          border: isFirst ? '1px solid #86EFAC' : '1px solid var(--color-border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.76rem'
                        }}
                      >
                        <div>
                          <strong style={{ fontFamily: 'monospace' }}>{b.batchNo}</strong> • Exp: {b.expiryDate}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700' }}>{b.availableQty} units</span>
                          {isFirst && <Badge variant="success">Next Out (FIFO 1)</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quarantine Confirmation Modal */}
      {isQuarantineModalOpen && selectedBatch && (
        <Modal
          isOpen={isQuarantineModalOpen}
          onClose={() => setIsQuarantineModalOpen(false)}
          title={`Quarantine Batch — ${selectedBatch.batchNo}`}
          subtitle={`Medicine: ${selectedBatch.medicineName} • Available: ${selectedBatch.availableQty} units`}
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA', color: '#991B1B' }}>
              Quarantining this batch will immediately remove it from all electronic prescription dispensing algorithms and mark it as ineligible for sale.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.80rem' }}>Mandatory Quarantine Audit Reason:</label>
              <textarea
                value={quarantineReason}
                onChange={(e) => setQuarantineReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button variant="outline" onClick={() => setIsQuarantineModalOpen(false)}>Cancel</Button>
              <Button variant="danger" icon={Ban} onClick={() => handleExecuteQuarantine(true)}>
                Confirm Quarantine
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
