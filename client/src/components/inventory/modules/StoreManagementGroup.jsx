import React, { useState } from 'react';
import {
  Package,
  FileText,
  Truck,
  ClipboardList,
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import {
  INITIAL_STORE_ITEMS,
  INITIAL_STORE_REQUISITIONS,
  INITIAL_STORE_ISSUES,
  INITIAL_STOCK_AUDIT
} from '../inventoryMockData';

export function StoreManagementGroup({ activeSubtab = '16.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  // Local state
  const [items, setItems] = useState(INITIAL_STORE_ITEMS);
  const [requisitions, setRequisitions] = useState(INITIAL_STORE_REQUISITIONS);
  const [issues, setIssues] = useState(INITIAL_STORE_ISSUES);
  const [audits, setAudits] = useState(INITIAL_STOCK_AUDIT);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isNewIndentModalOpen, setIsNewIndentModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIndentForIssue, setSelectedIndentForIssue] = useState(null);
  const [issueQtyInput, setIssueQtyInput] = useState('');
  const [issueError, setIssueError] = useState('');
  const [notification, setNotification] = useState('');

  // Form states
  const [newItemData, setNewItemData] = useState({
    code: '',
    name: '',
    category: 'Surgical Consumables',
    unit: 'Piece',
    store: 'Main Central Store',
    currentStock: 100,
    minLevel: 50,
    maxLevel: 500,
    unitCost: 120
  });

  const [newIndentData, setNewIndentData] = useState({
    fromDept: 'ICU & Critical Care',
    requestedBy: 'Staff Nurse Senior',
    priority: 'Normal',
    remarks: 'Routine replenishment'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Add Item Handler
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.code) return;
    const newItem = {
      id: `ITM-${1000 + items.length + 1}`,
      ...newItemData,
      currentStock: Number(newItemData.currentStock),
      minLevel: Number(newItemData.minLevel),
      maxLevel: Number(newItemData.maxLevel),
      unitCost: Number(newItemData.unitCost),
      status: Number(newItemData.currentStock) <= Number(newItemData.minLevel) ? 'Low Stock' : 'Normal'
    };
    setItems([newItem, ...items]);
    setIsAddItemModalOpen(false);
    showToast(`Item ${newItem.name} added to Item Master!`);
  };

  // Add Indent Handler
  const handleCreateIndent = (e) => {
    e.preventDefault();
    const newIndent = {
      id: `IND-2026-0${85 + requisitions.length}`,
      indentDate: new Date().toISOString().split('T')[0],
      fromDept: newIndentData.fromDept,
      requestedBy: newIndentData.requestedBy,
      itemsCount: 3,
      priority: newIndentData.priority,
      status: 'Pending Approval',
      remarks: newIndentData.remarks
    };
    setRequisitions([newIndent, ...requisitions]);
    setIsNewIndentModalOpen(false);
    showToast(`Store Indent ${newIndent.id} generated successfully!`);
  };

  // Approve Indent Handler
  const handleApproveIndent = (id) => {
    setRequisitions(prev => prev.map(ind => ind.id === id ? { ...ind, status: 'Approved' } : ind));
    showToast(`Indent ${id} approved for issue.`);
  };

  // Issue Stock Handler (Validates available stock)
  const handleIssueStockSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(issueQtyInput, 10);
    if (!qty || qty <= 0) {
      setIssueError('Please enter a valid issue quantity.');
      return;
    }
    // Check main central stock demo limit
    const mainItem = items[0];
    if (qty > mainItem.currentStock) {
      setIssueError(`Cannot issue ${qty}. Available stock is only ${mainItem.currentStock} ${mainItem.unit}s.`);
      return;
    }

    // Deduct stock
    setItems(prev => prev.map((itm, idx) => idx === 0 ? { ...itm, currentStock: itm.currentStock - qty } : itm));

    const newIssue = {
      id: `ISS-2026-${105 + issues.length}`,
      issueDate: new Date().toISOString().split('T')[0],
      indentRef: selectedIndentForIssue?.id || 'IND-2026-MANUAL',
      toDept: selectedIndentForIssue?.fromDept || 'Operation Theatre Complex',
      issuedBy: 'Store Officer B. Ramesh',
      totalItems: 1,
      issuedQty: qty,
      gatePassNumber: `GP-${9925 + issues.length}`,
      status: 'Dispatched'
    };
    setIssues([newIssue, ...issues]);

    if (selectedIndentForIssue) {
      setRequisitions(prev => prev.map(r => r.id === selectedIndentForIssue.id ? { ...r, status: 'Issued' } : r));
    }

    setIsIssueModalOpen(false);
    setIssueQtyInput('');
    setIssueError('');
    showToast(`Dispatched ${qty} units against ${newIssue.indentRef}. Gate Pass: ${newIssue.gatePassNumber}`);
  };

  // Reconcile Audit Item
  const handleReconcileAudit = (auditId) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, status: 'Reconciled', variance: 0, valueVariance: 0 } : a));
    showToast(`Stock audit variance for ${auditId} reconciled into GL!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-dropdown)'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 16.1: Item Master & Material Categories */}
      {activeSubtab === '16.1' && (
        <Card
          title="Item Master & Material Categories"
          subtitle="Enterprise hospital consumable catalogue, material grouping, and central warehouse unit rates"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsAddItemModalOpen(true)}>
              Add New Material Item
            </Button>
          }
        >
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Search by code, item name, or category..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'Infusion Solutions', label: 'Infusion Solutions' },
                  { value: 'Surgical Consumables', label: 'Surgical Consumables' },
                  { value: 'Gastroenterology', label: 'Gastroenterology' },
                  { value: 'PPE & Infection Control', label: 'PPE & Infection Control' },
                  { value: 'Vascular Access', label: 'Vascular Access' }
                ]}
              />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Item Code</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Material Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Category</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Store Location</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Unit Cost</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Current Stock</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Min / Max</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(itm => filterCategory === 'ALL' || itm.category === filterCategory)
                  .filter(itm =>
                    itm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    itm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    itm.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((itm) => (
                    <tr key={itm.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{itm.code}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>{itm.name}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{itm.category}</td>
                      <td style={{ padding: '10px 14px' }}>{itm.store}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>₹{itm.unitCost.toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: itm.currentStock <= itm.minLevel ? 'var(--color-error)' : 'inherit' }}>
                        {itm.currentStock} {itm.unit}s
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>{itm.minLevel} / {itm.maxLevel}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant={itm.status === 'Normal' ? 'success' : itm.status === 'Low Stock' ? 'warning' : 'danger'}>
                          {itm.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 16.2: Store Requisition (Indent) */}
      {activeSubtab === '16.2' && (
        <Card
          title="Store Requisition (Indent)"
          subtitle="Departmental internal requisition indents, approval routing, and dispatch statuses"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewIndentModalOpen(true)}>
              Raise Department Indent
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', fontWeight: '700' }}>TOTAL INDENTS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{requisitions.length}</div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '700' }}>PENDING APPROVAL</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#92400E' }}>
                {requisitions.filter(r => r.status === 'Pending Approval').length}
              </div>
            </div>
            <div style={{ padding: '14px', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: '700' }}>APPROVED FOR ISSUE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)' }}>
                {requisitions.filter(r => r.status === 'Approved').length}
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Indent ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Requesting Department</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Requested By</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Items Count</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Priority</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{req.id}</td>
                    <td style={{ padding: '10px 14px' }}>{req.indentDate}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{req.fromDept}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{req.requestedBy}</td>
                    <td style={{ padding: '10px 14px' }}>{req.itemsCount} SKUs</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.priority === 'Urgent' ? 'danger' : req.priority === 'High' ? 'warning' : 'teal'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending Approval' ? 'warning' : req.status === 'Issued' ? 'teal' : 'gray'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {req.status === 'Pending Approval' && (
                          <Button size="sm" variant="outline" onClick={() => handleApproveIndent(req.id)}>
                            Approve
                          </Button>
                        )}
                        {req.status === 'Approved' && (
                          <Button size="sm" variant="primary" onClick={() => {
                            setSelectedIndentForIssue(req);
                            setIsIssueModalOpen(true);
                          }}>
                            Issue Store Stock
                          </Button>
                        )}
                        {req.status === 'Issued' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 16.3: Store Issue to Wards/OT */}
      {activeSubtab === '16.3' && (
        <Card
          title="Store Issue to Wards / OT"
          subtitle="Material dispatch notes, security gate pass generation, and recipient ward acknowledgments"
          action={
            <Button variant="primary" icon={Truck} size="sm" onClick={() => {
              setSelectedIndentForIssue(null);
              setIsIssueModalOpen(true);
            }}>
              Direct Floor Issue
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Issue Voucher</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Indent Ref</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Destination Ward/Dept</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Dispatched Qty</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Gate Pass #</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Issued By</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((iss) => (
                  <tr key={iss.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{iss.id}</td>
                    <td style={{ padding: '10px 14px' }}>{iss.issueDate}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{iss.indentRef}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{iss.toDept}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{iss.issuedQty} units</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: '600' }}>{iss.gatePassNumber}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{iss.issuedBy}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={iss.status === 'Received & Verified' ? 'success' : 'teal'}>
                        {iss.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 16.4: Physical Stock Verification & Audit */}
      {activeSubtab === '16.4' && (
        <Card
          title="Physical Stock Verification & Audit"
          subtitle="Discrepancy variance calculations, broken vial write-offs, and ledger reconciliation"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Audit ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Item & Code</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>System Count</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Physical Count</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Variance</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Value Variance</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Reason Log</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Audit Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((aud) => (
                  <tr key={aud.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{aud.id}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{aud.itemName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{aud.itemCode}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{aud.systemStock}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{aud.physicalCount}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: aud.variance < 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {aud.variance}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: aud.valueVariance < 0 ? 'var(--color-error)' : 'inherit' }}>
                      ₹{aud.valueVariance.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{aud.reason}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={aud.status === 'Reconciled' ? 'success' : aud.status === 'Under Review' ? 'warning' : 'teal'}>
                        {aud.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {aud.status !== 'Reconciled' ? (
                        <Button size="sm" variant="outline" onClick={() => handleReconcileAudit(aud.id)}>
                          Reconcile
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-success)' }}>✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 16.5: Minimum / Maximum Reorder Alerts */}
      {activeSubtab === '16.5' && (
        <Card
          title="Minimum / Maximum Reorder Alerts"
          subtitle="Predictive safety stock breaches, automatic purchase requisition triggers, and lead time alerts"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.filter(itm => itm.currentStock <= itm.minLevel).map((itm) => (
              <div
                key={itm.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-md)',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#92400E', fontSize: '0.92rem' }}>
                      {itm.name} ({itm.code})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                      Warehouse: {itm.store} • Category: {itm.category} • Lead Time: 48 Hrs
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: '700' }}>STOCK DEFICIT</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-error)' }}>
                      {itm.currentStock} / {itm.minLevel} {itm.unit}s
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      showToast(`Automated Purchase Indent raised for ${itm.maxLevel - itm.currentStock} ${itm.unit}s of ${itm.name}`);
                    }}
                  >
                    Raise Auto PO Indent
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Add New Material Item */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Material Item to Master"
        subtitle="Configure SKU parameters, inventory units, and buffer stock levels"
      >
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Item Code"
              required
              value={newItemData.code}
              placeholder="e.g. MED-CAN-22"
              onChange={(e) => setNewItemData({ ...newItemData, code: e.target.value })}
            />
            <Select
              label="Category"
              value={newItemData.category}
              onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
              options={[
                'Infusion Solutions',
                'Surgical Consumables',
                'Gastroenterology',
                'General Consumables',
                'Sutures & Ligatures',
                'Diagnostic Strips',
                'PPE & Infection Control',
                'Vascular Access'
              ]}
            />
          </div>

          <Input
            label="Material Name"
            required
            value={newItemData.name}
            placeholder="e.g. IV Cannula 22G Blue with injection valve"
            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Unit of Measure"
              value={newItemData.unit}
              onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
              options={['Piece', 'Vial', 'Bottle', 'Box (12)', 'Pack (50)', 'Pair']}
            />
            <Select
              label="Primary Store"
              value={newItemData.store}
              onChange={(e) => setNewItemData({ ...newItemData, store: e.target.value })}
              options={['Main Central Store', 'OT Sub-Store', 'ICU Sub-Store', 'Emergency Floor Store', 'Ward 3 Sub-Store']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Initial Stock"
              type="number"
              value={newItemData.currentStock}
              onChange={(e) => setNewItemData({ ...newItemData, currentStock: e.target.value })}
            />
            <Input
              label="Min Reorder Level"
              type="number"
              value={newItemData.minLevel}
              onChange={(e) => setNewItemData({ ...newItemData, minLevel: e.target.value })}
            />
            <Input
              label="Unit Cost (₹)"
              type="number"
              value={newItemData.unitCost}
              onChange={(e) => setNewItemData({ ...newItemData, unitCost: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsAddItemModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Material Item</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Raise Department Indent */}
      <Modal
        isOpen={isNewIndentModalOpen}
        onClose={() => setIsNewIndentModalOpen(false)}
        title="Create Department Store Indent"
        subtitle="Forward store requirement requisition to Central Warehouse"
      >
        <form onSubmit={handleCreateIndent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Requesting Department / Ward"
            value={newIndentData.fromDept}
            onChange={(e) => setNewIndentData({ ...newIndentData, fromDept: e.target.value })}
            options={[
              'Emergency Trauma Care',
              'Operation Theatre Complex',
              'ICU & Critical Care',
              'Inpatient Ward 3 (Female)',
              'Day Care Oncology',
              'Dialysis Unit'
            ]}
          />
          <Input
            label="Requested By Staff"
            value={newIndentData.requestedBy}
            onChange={(e) => setNewIndentData({ ...newIndentData, requestedBy: e.target.value })}
          />
          <Select
            label="Priority Level"
            value={newIndentData.priority}
            onChange={(e) => setNewIndentData({ ...newIndentData, priority: e.target.value })}
            options={['Normal', 'High', 'Urgent']}
          />
          <Input
            label="Requisition Clinical Remarks"
            value={newIndentData.remarks}
            onChange={(e) => setNewIndentData({ ...newIndentData, remarks: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewIndentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Indent</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Store Issue to Wards/OT */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setIssueError('');
        }}
        title="Issue Consumables to Ward / OT"
        subtitle={selectedIndentForIssue ? `Fulfilling Indent ${selectedIndentForIssue.id} (${selectedIndentForIssue.fromDept})` : 'Direct Store Dispatch'}
      >
        <form onSubmit={handleIssueStockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{items[0].name} ({items[0].code})</div>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Current Available Store Stock: <strong>{items[0].currentStock} {items[0].unit}s</strong>
            </div>
          </div>

          <Input
            label="Quantity to Issue"
            type="number"
            required
            placeholder="e.g. 50"
            value={issueQtyInput}
            error={issueError}
            onChange={(e) => {
              setIssueQtyInput(e.target.value);
              setIssueError('');
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Authorize Dispatch & Print Gate Pass</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
