import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  ShieldCheck,
  Award,
  Check,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_WORK_ORDERS } from '../../inventory/inventoryMockData';

export function WorkOrderDesk({ activeSubtab = '31.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [notification, setNotification] = useState('');

  // Requisitions list (31.2)
  const [requisitions, setRequisitions] = useState([
    {
      id: 'WOR-2026-081',
      date: '2026-10-24',
      department: 'Operation Theatre Complex',
      requester: 'Sister Incharge Mary Kurian',
      equipment: 'OT 2 Surgical Pendant Gas Pressure Valve',
      priority: 'Urgent',
      status: 'Pending Review',
      description: 'Medical nitrous oxide pressure fluctuation detected on digital display.'
    },
    {
      id: 'WOR-2026-082',
      date: '2026-10-22',
      department: 'Central Sterilization (CSSD)',
      requester: 'CSSD Tech Rajesh B.',
      equipment: 'Sterrad 100NX Plasma Sterilizer',
      priority: 'High',
      status: 'Approved & Work Order Created',
      description: 'Vacuum chamber seal gasket periodic replacement as per OEM service manual.'
    }
  ]);

  // Receipts list (31.3)
  const [receipts, setReceipts] = useState([
    {
      id: 'REC-2026-041',
      woRef: 'WO-2026-001',
      date: '2026-10-24',
      contractor: 'Philips Medical Systems India',
      title: 'MRI Liquid Helium Pressure Recalibration',
      technician: 'Senior Field Engineer Anand Verma',
      sparesUsed: 'Cryo-valve seal kit, Liquid He 50L canister',
      labTestResult: 'Magnetic field homogeneity verified within 0.1 ppm',
      approvalStatus: 'Pending Supervisor Approval',
      confirmationStatus: 'Pending Finance Clearance'
    },
    {
      id: 'REC-2026-042',
      woRef: 'WO-2026-002',
      date: '2026-10-23',
      contractor: 'Voltas Facility Care Services',
      title: 'HVAC Hepa Filter Replacement - Dialysis Wing',
      technician: 'Lead Technician Sandeep Roy',
      sparesUsed: '12x High Efficiency Particle HEPA 0.3μm Filters',
      labTestResult: 'Particulate count < 3520 particles/m³ (ISO Class 5 met)',
      approvalStatus: 'Approved by Biomedical Lead',
      confirmationStatus: 'Cleared for Payment'
    }
  ]);

  // Rejected orders list (31.5)
  const [rejectedOrders, setRejectedOrders] = useState([
    {
      id: 'WO-2026-003',
      date: '2026-10-20',
      title: 'Doctor Lounge Air Conditioner Replacement',
      department: 'Administration',
      contractor: 'CoolCare Engineers',
      estimatedCost: 85000,
      rejectedBy: 'Hospital Superintendent',
      reason: 'Routine servicing was performed only 2 months ago. Repair compressor instead of total unit replacement.'
    }
  ]);

  // Modals state
  const [isNewWoModalOpen, setIsNewWoModalOpen] = useState(false);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedWoForReject, setSelectedWoForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 31.5 & 31.6 Workflow Tabs
  const [ordersWorkflowTab, setOrdersWorkflowTab] = useState('approve'); // 'approve', 'confirm', 'rejected'
  const [receiptsWorkflowTab, setReceiptsWorkflowTab] = useState('approve'); // 'approve', 'confirm'

  // Forms
  const [woForm, setWoForm] = useState({
    title: '',
    department: 'Intensive Care Unit (ICU)',
    contractor: 'Siemens Biomedical India',
    estimatedCost: 45000,
    priority: 'Normal',
    targetDate: ''
  });

  const [reqForm, setReqForm] = useState({
    department: 'Operation Theatre Complex',
    requester: '',
    equipment: '',
    priority: 'High',
    description: ''
  });

  const [receiptForm, setReceiptForm] = useState({
    woRef: 'WO-2026-001',
    contractor: 'Philips Medical Systems India',
    title: '',
    technician: '',
    sparesUsed: '',
    labTestResult: 'Passes calibration safety tolerances'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Handlers
  const handleCreateWo = (e) => {
    e.preventDefault();
    if (!woForm.title) return;

    const newWo = {
      id: `WO-2026-${Math.floor(10 + Math.random() * 89)}`,
      title: woForm.title,
      department: woForm.department,
      contractor: woForm.contractor,
      estimatedCost: parseFloat(woForm.estimatedCost) || 25000,
      priority: woForm.priority,
      status: 'Pending Approval',
      targetDate: woForm.targetDate || '2026-11-10'
    };

    setWorkOrders([newWo, ...workOrders]);
    setIsNewWoModalOpen(false);
    showToast(`Work Order ${newWo.id} created successfully.`);
  };

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.equipment) return;

    const newReq = {
      id: `WOR-2026-${Math.floor(90 + Math.random() * 100)}`,
      date: new Date().toISOString().split('T')[0],
      department: reqForm.department,
      requester: reqForm.requester || 'Duty Nurse',
      equipment: reqForm.equipment,
      priority: reqForm.priority,
      status: 'Pending Review',
      description: reqForm.description
    };

    setRequisitions([newReq, ...requisitions]);
    setIsNewReqModalOpen(false);
    showToast(`Work Order Requisition ${newReq.id} recorded.`);
  };

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    const newRec = {
      id: `REC-2026-${Math.floor(50 + Math.random() * 100)}`,
      woRef: receiptForm.woRef,
      date: new Date().toISOString().split('T')[0],
      contractor: receiptForm.contractor,
      title: receiptForm.title || 'Equipment Maintenance Completion',
      technician: receiptForm.technician || 'Biomedical Field Tech',
      sparesUsed: receiptForm.sparesUsed || 'Standard consumables',
      labTestResult: receiptForm.labTestResult,
      approvalStatus: 'Pending Supervisor Approval',
      confirmationStatus: 'Pending Finance Clearance'
    };

    setReceipts([newRec, ...receipts]);
    setIsNewReceiptModalOpen(false);
    showToast(`Work Order Receipt ${newRec.id} logged for ${newRec.woRef}.`);
  };

  const handleApproveWo = (id) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status: 'Supervisor Approved' } : w));
    showToast(`Work Order ${id} approved by engineering supervisor.`);
  };

  const handleConfirmWo = (id) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status: 'Confirmed & Issued to Contractor' } : w));
    showToast(`Work Order ${id} officially confirmed and dispatched.`);
  };

  const handleOpenRejectModal = (wo) => {
    setSelectedWoForReject(wo);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedWoForReject || !rejectReason.trim()) {
      alert('Please state a reason for rejection.');
      return;
    }

    const newRej = {
      id: selectedWoForReject.id,
      date: new Date().toISOString().split('T')[0],
      title: selectedWoForReject.title,
      department: selectedWoForReject.department,
      contractor: selectedWoForReject.contractor,
      estimatedCost: selectedWoForReject.estimatedCost,
      rejectedBy: 'Hospital Engineering Board',
      reason: rejectReason
    };

    setRejectedOrders([newRej, ...rejectedOrders]);
    setWorkOrders(prev => prev.filter(w => w.id !== selectedWoForReject.id));
    setIsRejectModalOpen(false);
    showToast(`Work Order ${selectedWoForReject.id} rejected with reason logged.`);
  };

  const handleApproveReceipt = (id) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, approvalStatus: 'Approved by Biomedical Lead' } : r));
    showToast(`Receipt ${id} technical QA approved.`);
  };

  const handleConfirmReceipt = (id) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, confirmationStatus: 'Cleared for Payment' } : r));
    showToast(`Receipt ${id} invoice settlement cleared.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#166534',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBMODULE 31.1: Record Work Order */}
      {activeSubtab === '31.1' && (
        <Card
          title="31.1 Record Work Order Proposal"
          subtitle="Direct issuance of biomedical repair contracts, engineering maintenance tasks, and facility work orders"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Hospital Work Orders ({workOrders.length})</span>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewWoModalOpen(true)}>
              Record New Work Order
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>WO ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Task Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Contractor / Vendor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>Est. Cost (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((w) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{w.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{w.title}</td>
                    <td style={{ padding: '8px 10px' }}>{w.department}</td>
                    <td style={{ padding: '8px 10px' }}>{w.contractor}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>₹{w.estimatedCost.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={w.priority === 'Urgent' ? 'danger' : 'warning'}>{w.priority}</Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={w.status.includes('Confirmed') ? 'success' : 'teal'}>{w.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.2: Record Work Order Requisition */}
      {activeSubtab === '31.2' && (
        <Card
          title="31.2 Record Work Order Requisition"
          subtitle="Departmental maintenance and biomedical repair requisitions with urgency classifications"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Department Requisitions ({requisitions.length})</span>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewReqModalOpen(true)}>
              Raise Maintenance Requisition
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Req ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Target Equipment & Issue</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Requester</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{r.id}</td>
                    <td style={{ padding: '8px 10px' }}>{r.date}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{r.department}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '600' }}>{r.equipment}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{r.description}</div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>{r.requester}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={r.priority === 'Urgent' ? 'danger' : 'warning'}>{r.priority}</Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={r.status.includes('Approved') ? 'success' : 'teal'}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.3: Record Work Order Receipt */}
      {activeSubtab === '31.3' && (
        <Card
          title="31.3 Record Work Order Completion Receipt"
          subtitle="Contractor job completion deliverables, spares consumed log, and biomedical technician acceptance"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Logged Receipts ({receipts.length})</span>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewReceiptModalOpen(true)}>
              Record Service Completion Receipt
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Receipt ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>WO Ref & Title</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Service Contractor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Field Engineer</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Spares Replaced</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>QA Approval</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{rec.id}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '600' }}>{rec.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Ref: {rec.woRef}</div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>{rec.contractor}</td>
                    <td style={{ padding: '8px 10px' }}>{rec.technician}</td>
                    <td style={{ padding: '8px 10px', fontSize: '0.74rem' }}>{rec.sparesUsed}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={rec.approvalStatus.includes('Approved') ? 'success' : 'warning'}>{rec.approvalStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.4: View Work Orders / Requisitions / Receipts */}
      {activeSubtab === '31.4' && (
        <Card
          title="31.4 Consolidated Work Order & Requisition Status Tracker"
          subtitle="Full facility maintenance lifecycle audit from initial requisition through work order and receipt clearance"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>TOTAL WORK ORDERS ISSUED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-primary-teal)' }}>{workOrders.length}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Value: ₹{workOrders.reduce((a, b) => a + b.estimatedCost, 0).toLocaleString()}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>PENDING REQUISITIONS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#D97706' }}>{requisitions.filter(r => r.status.includes('Pending')).length}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Awaiting engineering triage</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>COMPLETED RECEIPTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#166534' }}>{receipts.length}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Signed off by biomedical leads</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.5: ORDERS: Approve Work Orders, Confirm Work Orders, Review Rejected */}
      {activeSubtab === '31.5' && (
        <Card
          title="31.5 ORDERS: Approve Work Orders, Confirm Work Orders, Review Rejected"
          subtitle="Engineering supervisor review, budget clearance, contractor confirmation, and rejected maintenance appeals"
        >
          {/* Sub-tabs for 31.5 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <Button
              size="sm"
              variant={ordersWorkflowTab === 'approve' ? 'primary' : 'ghost'}
              onClick={() => setOrdersWorkflowTab('approve')}
            >
              1. Approve Work Orders ({workOrders.filter(w => w.status === 'Pending Approval').length})
            </Button>
            <Button
              size="sm"
              variant={ordersWorkflowTab === 'confirm' ? 'primary' : 'ghost'}
              onClick={() => setOrdersWorkflowTab('confirm')}
            >
              2. Confirm Work Orders ({workOrders.length})
            </Button>
            <Button
              size="sm"
              variant={ordersWorkflowTab === 'rejected' ? 'primary' : 'ghost'}
              onClick={() => setOrdersWorkflowTab('rejected')}
            >
              3. Review Rejected Orders ({rejectedOrders.length})
            </Button>
          </div>

          {/* Section 1: Approve Work Orders */}
          {ordersWorkflowTab === 'approve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workOrders.filter(w => w.status === 'Pending Approval').length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', fontSize: '0.84rem' }}>
                  ✓ No pending work orders awaiting supervisory approval.
                </div>
              ) : (
                workOrders.filter(w => w.status === 'Pending Approval').map((w) => (
                  <div key={w.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{w.id}</span>
                        <Badge variant="warning">{w.priority} Priority</Badge>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '4px' }}>{w.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Dept: {w.department} • Contractor: {w.contractor} • Target: {w.targetDate}
                      </div>
                      <div style={{ fontSize: '0.80rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                        Est. Budget: ₹{w.estimatedCost.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="xs" variant="outline" icon={X} onClick={() => handleOpenRejectModal(w)}>
                        Reject with Reason
                      </Button>
                      <Button size="xs" variant="primary" icon={Check} onClick={() => handleApproveWo(w.id)}>
                        Approve Work Order
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Section 2: Confirm Work Orders */}
          {ordersWorkflowTab === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workOrders.map((w) => (
                <div key={w.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{w.id}</span>
                      <Badge variant={w.status.includes('Confirmed') ? 'success' : 'teal'}>{w.status}</Badge>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '4px' }}>{w.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Contractor: {w.contractor} • Est: ₹{w.estimatedCost.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    {w.status.includes('Approved') && !w.status.includes('Confirmed') ? (
                      <Button size="xs" variant="primary" icon={CheckCircle2} onClick={() => handleConfirmWo(w.id)}>
                        Confirm & Issue to Contractor
                      </Button>
                    ) : w.status.includes('Confirmed') ? (
                      <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>✓ Contractor Confirmed</span>
                    ) : (
                      <Badge variant="gray">Awaiting Supervisor Approval First</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 3: Review Rejected Orders */}
          {ordersWorkflowTab === 'rejected' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rejectedOrders.map((rej) => (
                <div key={rej.id} style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#991B1B' }}>{rej.id}: {rej.title}</div>
                    <Badge variant="danger">Rejected by {rej.rejectedBy}</Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#7F1D1D', marginTop: '6px' }}>
                    <strong>Rejection Reason:</strong> {rej.reason}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#B91C1C' }}>
                    <span>Department: {rej.department} • Cost: ₹{rej.estimatedCost.toLocaleString()} • Date: {rej.date}</span>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => showToast(`Appeal dossier prepared for ${rej.id}. Resubmitted to Engineering Board.`)}
                    >
                      Resubmit with Scope Revision
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SUBMODULE 31.6: RECEIPTS: Approve Work Order Receipts, Confirm Work Order Receipts */}
      {activeSubtab === '31.6' && (
        <Card
          title="31.6 RECEIPTS: Approve Work Order Receipts, Confirm Work Order Receipts"
          subtitle="Biomedical engineering supervisory verification, technician signoff, and administrative invoice settlement clearance"
        >
          {/* Sub-tabs for 31.6 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <Button
              size="sm"
              variant={receiptsWorkflowTab === 'approve' ? 'primary' : 'ghost'}
              onClick={() => setReceiptsWorkflowTab('approve')}
            >
              1. Approve QA Receipts ({receipts.length})
            </Button>
            <Button
              size="sm"
              variant={receiptsWorkflowTab === 'confirm' ? 'primary' : 'ghost'}
              onClick={() => setReceiptsWorkflowTab('confirm')}
            >
              2. Confirm Receipts & Clear Invoices
            </Button>
          </div>

          {receiptsWorkflowTab === 'approve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {receipts.map((rec) => (
                <div key={rec.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{rec.id}</span>
                      <Badge variant="teal">Ref: {rec.woRef}</Badge>
                      <Badge variant={rec.approvalStatus.includes('Approved') ? 'success' : 'warning'}>{rec.approvalStatus}</Badge>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '4px' }}>{rec.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Contractor: {rec.contractor} • Tech: {rec.technician} • Spares: {rec.sparesUsed}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-primary-teal)', fontWeight: '600', marginTop: '2px' }}>
                      QA Compliance: {rec.labTestResult}
                    </div>
                  </div>

                  <div>
                    {rec.approvalStatus.includes('Pending') ? (
                      <Button size="xs" variant="primary" icon={ShieldCheck} onClick={() => handleApproveReceipt(rec.id)}>
                        Approve Technical QA Receipt
                      </Button>
                    ) : (
                      <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.76rem' }}>✓ QA Signoff Approved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {receiptsWorkflowTab === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {receipts.map((rec) => (
                <div key={rec.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{rec.id}</span>
                      <Badge variant={rec.confirmationStatus.includes('Cleared') ? 'success' : 'teal'}>{rec.confirmationStatus}</Badge>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '4px' }}>{rec.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Contractor: {rec.contractor} • Tech QA: {rec.approvalStatus}
                    </div>
                  </div>

                  <div>
                    {rec.approvalStatus.includes('Approved') && rec.confirmationStatus.includes('Pending') ? (
                      <Button size="xs" variant="primary" icon={Award} onClick={() => handleConfirmReceipt(rec.id)}>
                        Authorize Invoice Payment Clearance
                      </Button>
                    ) : rec.confirmationStatus.includes('Cleared') ? (
                      <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.76rem' }}>✓ Invoice Cleared for Settlement</span>
                    ) : (
                      <Badge variant="gray">Requires QA Approval First</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal: New Work Order */}
      <Modal isOpen={isNewWoModalOpen} onClose={() => setIsNewWoModalOpen(false)} title="Issue Direct Work Order">
        <form onSubmit={handleCreateWo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Work Order Task Title"
            placeholder="e.g. MRI Helium Pressure Calibration"
            value={woForm.title}
            onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Target Department"
              value={woForm.department}
              onChange={(e) => setWoForm({ ...woForm, department: e.target.value })}
              options={[
                { value: 'Intensive Care Unit (ICU)', label: 'Intensive Care Unit (ICU)' },
                { value: 'Operation Theatre Complex', label: 'Operation Theatre Complex' },
                { value: 'Central Sterilization (CSSD)', label: 'Central Sterilization (CSSD)' },
                { value: 'Radiology & Imaging', label: 'Radiology & Imaging' }
              ]}
            />
            <Input
              label="Service Contractor Entity"
              value={woForm.contractor}
              onChange={(e) => setWoForm({ ...woForm, contractor: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="Estimated Cost (₹)"
              type="number"
              value={woForm.estimatedCost}
              onChange={(e) => setWoForm({ ...woForm, estimatedCost: e.target.value })}
              required
            />
            <Select
              label="Priority"
              value={woForm.priority}
              onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'High', label: 'High' },
                { value: 'Urgent', label: 'Urgent' }
              ]}
            />
            <Input
              label="Target Date"
              type="date"
              value={woForm.targetDate}
              onChange={(e) => setWoForm({ ...woForm, targetDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewWoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Work Order</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Requisition */}
      <Modal isOpen={isNewReqModalOpen} onClose={() => setIsNewReqModalOpen(false)} title="Raise Maintenance Work Order Requisition">
        <form onSubmit={handleCreateRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Equipment / Facility Component"
            placeholder="e.g. Dialysis RO Water Filtration Plant"
            value={reqForm.equipment}
            onChange={(e) => setReqForm({ ...reqForm, equipment: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Staff Requester Name"
              placeholder="e.g. Sister Incharge Mary"
              value={reqForm.requester}
              onChange={(e) => setReqForm({ ...reqForm, requester: e.target.value })}
              required
            />
            <Select
              label="Priority"
              value={reqForm.priority}
              onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'High', label: 'High' },
                { value: 'Urgent', label: 'Urgent' }
              ]}
            />
          </div>
          <Input
            label="Problem Description & Clinical Impact"
            value={reqForm.description}
            onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewReqModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Requisition</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Receipt */}
      <Modal isOpen={isNewReceiptModalOpen} onClose={() => setIsNewReceiptModalOpen(false)} title="Record Work Order Completion Receipt">
        <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Work Order Reference #"
            placeholder="e.g. WO-2026-001"
            value={receiptForm.woRef}
            onChange={(e) => setReceiptForm({ ...receiptForm, woRef: e.target.value })}
            required
          />
          <Input
            label="Completion Task Title"
            value={receiptForm.title}
            onChange={(e) => setReceiptForm({ ...receiptForm, title: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Service Contractor"
              value={receiptForm.contractor}
              onChange={(e) => setReceiptForm({ ...receiptForm, contractor: e.target.value })}
              required
            />
            <Input
              label="Attending Field Engineer"
              value={receiptForm.technician}
              onChange={(e) => setReceiptForm({ ...receiptForm, technician: e.target.value })}
              required
            />
          </div>
          <Input
            label="Spares / Consumables Consumed"
            placeholder="e.g. 2x Valve gaskets, O-rings, OEM kit"
            value={receiptForm.sparesUsed}
            onChange={(e) => setReceiptForm({ ...receiptForm, sparesUsed: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewReceiptModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Record Completion Receipt</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reject Work Order */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Decline / Reject Maintenance Proposal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            Rejecting: <strong>{selectedWoForReject?.id}: {selectedWoForReject?.title}</strong>
          </div>
          <Input
            label="Mandatory Technical / Financial Justification"
            placeholder="State why proposal was declined..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmReject} style={{ backgroundColor: '#DC2626' }}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
