import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../../common/UIPrimitives';
import { useAuth } from '../../../context/AuthContext';

export function StockIndentsDesk({
  medicines = [],
  indents = [],
  onIndentCreated,
  onIndentUpdated
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'indents'
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL', 'LOW', 'CRITICAL', 'OUT'

  // New Indent Modal
  const [isNewIndentModalOpen, setIsNewIndentModalOpen] = useState(false);
  const [requestingStore, setRequestingStore] = useState('Emergency Satellite Pharmacy');
  const [indentUrgency, setIndentUrgency] = useState('HIGH');
  const [indentNotes, setIndentNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState([
    { medicineName: medicines[0]?.brandName || 'Augmentin 625 Duo', requestedQty: 100, unit: 'Tablets' }
  ]);

  const [notification, setNotification] = useState(null);

  // Stock Alerts Calculation
  const stockAlerts = useMemo(() => {
    return medicines.map(med => {
      // Calculate total stock from master reorder levels or arbitrary baseline
      const stock = med.reorderLevel ? Math.floor(med.reorderLevel * 0.6) : 60;
      const reorderPoint = med.reorderLevel || 100;
      const minStock = med.minStock || 50;
      const maxStock = med.maxStock || 500;
      const deficit = Math.max(0, maxStock - stock);

      let alertStatus = 'Adequate';
      if (stock === 0) alertStatus = 'Out of Stock';
      else if (stock < minStock) alertStatus = 'Critical Deficit';
      else if (stock <= reorderPoint) alertStatus = 'Low Stock Alert';

      return {
        ...med,
        currentStock: stock,
        reorderPoint,
        minStock,
        maxStock,
        suggestedReorder: deficit,
        alertStatus
      };
    });
  }, [medicines]);

  // Filtered Stock Alerts
  const filteredStock = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stockAlerts.filter(med => {
      const matchSearch =
        !q ||
        (med.brandName && med.brandName.toLowerCase().includes(q)) ||
        (med.genericName && med.genericName.toLowerCase().includes(q)) ||
        (med.code && med.code.toLowerCase().includes(q));

      let matchFilter = true;
      if (stockFilter === 'LOW') matchFilter = med.alertStatus.includes('Low');
      else if (stockFilter === 'CRITICAL') matchFilter = med.alertStatus.includes('Critical');
      else if (stockFilter === 'OUT') matchFilter = med.alertStatus.includes('Out');

      return matchSearch && matchFilter;
    });
  }, [stockAlerts, searchQuery, stockFilter]);

  const handleCreateIndent = () => {
    const newIndent = {
      id: `IND-${Date.now()}`,
      indentNumber: `IND-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestingStore,
      fulfillingStore: 'Central Hospital Warehouse Pharmacy',
      urgency: indentUrgency,
      requestedBy: user?.name || user?.username || 'Satellite Pharmacist',
      requestedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Submitted',
      itemsCount: selectedItems.length,
      items: selectedItems.map(it => ({ ...it, approvedQty: it.requestedQty }))
    };

    if (onIndentCreated) {
      onIndentCreated(newIndent);
    }

    setIsNewIndentModalOpen(false);
    setActiveTab('indents');
    setNotification(`Stock Indent ${newIndent.indentNumber} created and submitted to Central Warehouse.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateIndentStatus = (indent, nextStatus) => {
    const updated = { ...indent, status: nextStatus };
    if (onIndentUpdated) {
      onIndentUpdated(updated);
    }
    setNotification(`Indent ${indent.indentNumber} status updated to "${nextStatus}".`);
    setTimeout(() => setNotification(null), 3000);
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

      {/* Desk Sub-navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'alerts' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'alerts' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
              color: activeTab === 'alerts' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'alerts' ? '700' : '500',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={15} />
            <span>Stock Replenishment & Reorder Alerts</span>
            <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(73, 118, 159, 0.15)' }}>
              {stockAlerts.filter(s => s.alertStatus !== 'Adequate').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('indents')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === 'indents' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
              backgroundColor: activeTab === 'indents' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
              color: activeTab === 'indents' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'indents' ? '700' : '500',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Boxes size={15} />
            <span>Internal Pharmacy Indents</span>
            <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(73, 118, 159, 0.15)' }}>
              {indents.length}
            </span>
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsNewIndentModalOpen(true)}
        >
          Raise Stock Indent
        </Button>
      </div>

      {/* TAB 1: Stock Replenishment Alerts */}
      {activeTab === 'alerts' && (
        <Card
          title="25.5 Real-Time Inventory Replenishment & Reorder Thresholds"
          subtitle="Identifies stock deficits against configured minimum buffers and calculates suggested purchase requisitions"
        >
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search by Medicine, Code, Generic Molecule..."
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
              {['ALL', 'LOW', 'CRITICAL', 'OUT'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStockFilter(st)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: stockFilter === st ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: stockFilter === st ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: stockFilter === st ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontSize: '0.74rem',
                    fontWeight: stockFilter === st ? '700' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {st === 'ALL' ? 'All Items' : st === 'LOW' ? 'Low Stock' : st === 'CRITICAL' ? 'Critical Deficit' : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>

          {/* Replenishment Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: '700' }}>Drug Code</th>
                  <th style={{ padding: '8px 12px', fontWeight: '700' }}>Medicine Brand Name</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Dosage Form</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Current Stock</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Reorder Level</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Min - Max Buffer</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Suggested Reorder</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Replenishment Status</th>
                  <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map(med => {
                  const isCritical = med.alertStatus.includes('Critical') || med.alertStatus.includes('Out');
                  const isLow = med.alertStatus.includes('Low');

                  return (
                    <tr
                      key={med.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isCritical ? '#FEF2F2' : isLow ? '#FFFBEB' : '#FFFFFF'
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {med.code}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '700' }}>{med.brandName}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>{med.genericName}</div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {med.strength} • {med.dosageForm}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '800', color: isCritical ? '#DC2626' : isLow ? '#D97706' : '#16A34A' }}>
                        {med.currentStock} units
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600' }}>
                        {med.reorderPoint}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.74rem' }}>
                        {med.minStock} - {med.maxStock}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        +{med.suggestedReorder} units
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge variant={isCritical ? 'danger' : isLow ? 'warning' : 'success'}>
                          {med.alertStatus}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItems([{ medicineName: med.brandName, requestedQty: med.suggestedReorder, unit: med.packSize || 'Units' }]);
                            setIsNewIndentModalOpen(true);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-primary-teal)',
                            backgroundColor: 'var(--color-bg-pale-aqua)',
                            color: 'var(--color-primary-teal)',
                            fontSize: '0.70rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Indent Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Internal Stock Indents Requisitions */}
      {activeTab === 'indents' && (
        <Card
          title="Internal Pharmacy Stock Requisitions & Dispatch Queue"
          subtitle="Tracks stock transfer requests between Satellite Pharmacies, OT, Wards, and the Central Medical Warehouse"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: '700' }}>Indent Number</th>
                  <th style={{ padding: '8px 12px', fontWeight: '700' }}>Requesting Satellite Store</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Urgency</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Requester</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Items</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {indents.map(ind => {
                  const isApproved = ind.status.includes('Approved');
                  const isFulfilled = ind.status.includes('Fulfilled');

                  return (
                    <tr key={ind.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {ind.indentNumber}
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{ind.requestedAt}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '700' }}>{ind.requestingStore}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>Fulfilling: {ind.fulfillingStore}</div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge variant={ind.urgency === 'HIGH' ? 'danger' : 'neutral'}>
                          {ind.urgency}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.74rem' }}>
                        {ind.requestedBy}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>
                        {ind.itemsCount} Drugs
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <Badge variant={isFulfilled ? 'success' : isApproved ? 'teal' : 'warning'}>
                          {ind.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {!isApproved && !isFulfilled && (
                            <button
                              type="button"
                              onClick={() => handleUpdateIndentStatus(ind, 'Approved (Pending Dispatch)')}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-primary-teal)',
                                backgroundColor: 'var(--color-bg-pale-aqua)',
                                color: 'var(--color-primary-teal)',
                                fontSize: '0.70rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {isApproved && !isFulfilled && (
                            <button
                              type="button"
                              onClick={() => handleUpdateIndentStatus(ind, 'Fulfilled & Dispatched')}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid #86EFAC',
                                backgroundColor: '#F0FDF4',
                                color: '#166534',
                                fontSize: '0.70rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Fulfill & Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Raise Stock Indent Modal */}
      {isNewIndentModalOpen && (
        <Modal
          isOpen={isNewIndentModalOpen}
          onClose={() => setIsNewIndentModalOpen(false)}
          title="Create Internal Pharmacy Stock Requisition (Indent)"
          subtitle="Request stock replenishment from Central Hospital Warehouse"
          maxWidth="540px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <Select
              label="Requesting Satellite Store / Ward *"
              value={requestingStore}
              onChange={(e) => setRequestingStore(e.target.value)}
              options={[
                { value: 'Emergency Satellite Pharmacy', label: 'Emergency Satellite Pharmacy' },
                { value: 'Operation Theatre Pharmacy Sub-Store', label: 'Operation Theatre Pharmacy Sub-Store' },
                { value: 'ICU High Dependency Ward Sub-Store', label: 'ICU High Dependency Ward Sub-Store' },
                { value: 'Inpatient 3rd Floor General Ward Sub-Store', label: 'Inpatient 3rd Floor General Ward Sub-Store' }
              ]}
            />

            <Select
              label="Requisition Urgency Level *"
              value={indentUrgency}
              onChange={(e) => setIndentUrgency(e.target.value)}
              options={[
                { value: 'NORMAL', label: 'Normal (Standard Scheduled Replenishment)' },
                { value: 'HIGH', label: 'High Priority (Low Stock Warning)' },
                { value: 'EMERGENCY', label: 'Immediate Emergency (Stockout Incurred)' }
              ]}
            />

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.80rem', marginBottom: '8px' }}>Requisition Items:</div>
              {selectedItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ flex: 1, fontWeight: '600' }}>{item.medicineName}</div>
                  <Input
                    label=""
                    type="number"
                    value={item.requestedQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 10;
                      setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, requestedQty: val } : it));
                    }}
                    style={{ width: '80px' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{item.unit}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.78rem' }}>Requisition Justification Notes:</label>
              <textarea
                placeholder="e.g. Surge in trauma admissions, routine weekend emergency replenishment..."
                value={indentNotes}
                onChange={(e) => setIndentNotes(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button variant="outline" onClick={() => setIsNewIndentModalOpen(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleCreateIndent}>
                Submit Requisition Indent
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
