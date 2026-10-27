import React, { useState, useMemo } from 'react';
import {
  Wrench,
  FileText,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Award,
  Search,
  Filter,
  Plus,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building2,
  Clock,
  Printer
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import {
  INITIAL_WORK_ORDERS,
  INITIAL_REQUISITIONS,
  INITIAL_WORK_ORDER_RECEIPTS,
  INITIAL_REJECTED_ORDERS
} from '../operationsMockData';

export function WorkOrderDesk({
  activeSubtab = '31.1',
  currentUser = null,
  onNavigateSubmodule
}) {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [receipts, setReceipts] = useState(INITIAL_WORK_ORDER_RECEIPTS);
  const [rejectedOrders, setRejectedOrders] = useState(INITIAL_REJECTED_ORDERS);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modals
  const [isNewWoModalOpen, setIsNewWoModalOpen] = useState(false);
  const [isNewRequisitionModalOpen, setIsNewRequisitionModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);

  // Action Confirmation Modals
  const [pendingApprovalWo, setPendingApprovalWo] = useState(null);
  const [pendingConfirmationWo, setPendingConfirmationWo] = useState(null);
  const [pendingReceiptSignoff, setPendingReceiptSignoff] = useState(null);
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Form States
  const [woForm, setWoForm] = useState({
    title: '',
    department: 'Biomedical & Engineering',
    requisitionRef: '',
    contractor: 'Philips Medical Systems India',
    technician: 'Senior Field Tech Anand V.',
    priority: 'High',
    estimatedCost: '45000',
    targetDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    notes: ''
  });

  const [reqForm, setReqForm] = useState({
    department: 'Operation Theatre Complex',
    requester: 'Sister Incharge Mary Kurian',
    equipment: '',
    priority: 'High',
    description: ''
  });

  const [receiptForm, setReceiptForm] = useState({
    woRef: 'WO-2026-012',
    contractor: 'BlueStar CleanAir Services Ltd',
    title: 'OT 1 AHU Hepa Filter Replacement',
    technician: 'Lead Engineer Sandeep Roy',
    sparesUsed: 'H14 Hepa Filter Units, Neoprene Gaskets',
    labTestResult: 'Cleanroom particle count PASSED (ISO Class 5)'
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Departments List for Filters
  const departmentOptions = [
    'all',
    'Biomedical & Engineering',
    'Electrical Engineering',
    'Facility Maintenance',
    'Nephrology Engineering',
    'Operation Theatre Complex',
    'Central Sterilization (CSSD)',
    'Emergency & Trauma Care'
  ];

  // Filtered Work Orders (31.4)
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
      if (deptFilter !== 'all' && wo.department !== deptFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          wo.referenceNumber.toLowerCase().includes(q) ||
          wo.title.toLowerCase().includes(q) ||
          wo.contractor.toLowerCase().includes(q) ||
          wo.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workOrders, statusFilter, deptFilter, searchQuery]);

  // Create Work Order (31.1)
  const handleSaveWorkOrder = (e) => {
    e.preventDefault();
    if (!woForm.title) {
      alert('Work order title is required.');
      return;
    }

    const newWo = {
      id: `WO-2026-0${workOrders.length + 15}`,
      referenceNumber: `WO-2026-0${workOrders.length + 15}`,
      requisitionRef: woForm.requisitionRef || `WOR-2026-0${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      title: woForm.title,
      department: woForm.department,
      requester: currentUser?.fullName || 'Hospital Engineering Supervisor',
      contractor: woForm.contractor,
      technician: woForm.technician,
      priority: woForm.priority,
      estimatedCost: parseFloat(woForm.estimatedCost) || 0,
      targetDate: woForm.targetDate,
      status: 'Pending Approval',
      approvalLevel: 'Pending Supervisor',
      notes: woForm.notes || 'Service SLA priority assigned.'
    };

    setWorkOrders([newWo, ...workOrders]);
    setIsNewWoModalOpen(false);
    showToast(`Work Order ${newWo.referenceNumber} recorded successfully.`);
  };

  // Create Requisition (31.2)
  const handleSaveRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.equipment || !reqForm.description) {
      alert('Equipment name and description are required.');
      return;
    }

    const newReq = {
      id: `WOR-2026-0${requisitions.length + 84}`,
      date: new Date().toISOString().slice(0, 10),
      department: reqForm.department,
      requester: reqForm.requester,
      equipment: reqForm.equipment,
      priority: reqForm.priority,
      status: 'Pending Review',
      description: reqForm.description
    };

    setRequisitions([newReq, ...requisitions]);
    setIsNewRequisitionModalOpen(false);
    showToast(`Maintenance Requisition ${newReq.id} recorded.`);
  };

  // Create Work Order Receipt (31.3)
  const handleSaveReceipt = (e) => {
    e.preventDefault();
    if (!receiptForm.woRef || !receiptForm.technician) {
      alert('Work order reference and technician name are required.');
      return;
    }

    const newReceipt = {
      id: `REC-2026-0${receipts.length + 43}`,
      woRef: receiptForm.woRef,
      date: new Date().toISOString().slice(0, 10),
      contractor: receiptForm.contractor,
      title: receiptForm.title,
      technician: receiptForm.technician,
      sparesUsed: receiptForm.sparesUsed,
      labTestResult: receiptForm.labTestResult,
      approvalStatus: 'Pending Supervisor Approval',
      confirmationStatus: 'Pending Finance Clearance'
    };

    setReceipts([newReceipt, ...receipts]);
    setIsNewReceiptModalOpen(false);
    showToast(`Work Order Deliverable Receipt ${newReceipt.id} logged for ${newReceipt.woRef}.`);
  };

  // Approve Work Order (31.5)
  const handleConfirmApproval = () => {
    if (!pendingApprovalWo) return;
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === pendingApprovalWo.id) {
        return {
          ...wo,
          status: 'Approved',
          approvalLevel: 'Biomedical Engineering Head'
        };
      }
      return wo;
    }));
    showToast(`Work Order ${pendingApprovalWo.referenceNumber} approved by Engineering Head.`);
    setPendingApprovalWo(null);
  };

  // Financial Confirmation (31.5)
  const handleConfirmOrderExecution = () => {
    if (!pendingConfirmationWo) return;
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === pendingConfirmationWo.id) {
        return {
          ...wo,
          status: 'In Execution',
          approvalLevel: 'Finance & Medical Director Cleared'
        };
      }
      return wo;
    }));
    showToast(`Work Order ${pendingConfirmationWo.referenceNumber} confirmed for active vendor execution.`);
    setPendingConfirmationWo(null);
  };

  // Reject Order Handler (31.5)
  const handleConfirmRejection = () => {
    if (!rejectionModalOrder || !rejectionReasonText.trim()) {
      alert('Please state an administrative reason for rejection.');
      return;
    }

    const rejectedEntry = {
      id: rejectionModalOrder.referenceNumber,
      date: new Date().toISOString().slice(0, 10),
      title: rejectionModalOrder.title,
      department: rejectionModalOrder.department,
      contractor: rejectionModalOrder.contractor,
      estimatedCost: rejectionModalOrder.estimatedCost,
      rejectedBy: currentUser?.fullName || 'Medical Superintendent',
      reason: rejectionReasonText.trim()
    };

    setRejectedOrders([rejectedEntry, ...rejectedOrders]);
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === rejectionModalOrder.id) {
        return { ...wo, status: 'Rejected', notes: `Rejected: ${rejectionReasonText.trim()}` };
      }
      return wo;
    }));

    showToast(`Work Order ${rejectionModalOrder.referenceNumber} rejected. Transferred to review audit.`);
    setRejectionModalOrder(null);
    setRejectionReasonText('');
  };

  // Approve Receipt (31.6)
  const handleConfirmReceiptApproval = (receiptId) => {
    setReceipts(prev => prev.map(r => {
      if (r.id === receiptId) {
        return {
          ...r,
          approvalStatus: 'Approved by Biomedical Lead',
          confirmationStatus: 'Cleared for Payment'
        };
      }
      return r;
    }));
    showToast(`Receipt ${receiptId} inspection validated and signed off.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1.5px solid #86EFAC',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUBMODULE 31.1: Record Work Order */}
      {activeSubtab === '31.1' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                Record Formal Work Order (31.1)
              </span>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsNewWoModalOpen(true)}>
              New Work Order Form
            </Button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 14px 0' }}>
            Commission maintenance contracts, biomedical recalibration services, and structural facility repairs with assigned SLAs and authorized contractor quotes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {workOrders.slice(0, 4).map((wo) => (
              <div
                key={wo.id}
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.78rem', color: 'var(--color-primary-teal)' }}>
                      {wo.referenceNumber}
                    </span>
                    <Badge variant={wo.priority === 'Urgent' ? 'danger' : wo.priority === 'High' ? 'amber' : 'secondary'} size="sm">
                      {wo.priority}
                    </Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {wo.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {wo.department} • Contractor: {wo.contractor}
                  </div>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>
                    ₹{wo.estimatedCost.toLocaleString()}
                  </span>
                  <Badge variant={wo.status === 'Approved' ? 'teal' : wo.status === 'In Execution' ? 'blue' : 'secondary'} size="sm">
                    {wo.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.2: Record Work Order Requisition */}
      {activeSubtab === '31.2' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                Departmental Maintenance & Repair Requisitions (31.2)
              </span>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsNewRequisitionModalOpen(true)}>
              Raise Requisition
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Requisition ID</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Department</th>
                  <th style={{ padding: '8px 10px' }}>Equipment / Asset</th>
                  <th style={{ padding: '8px 10px' }}>Requester</th>
                  <th style={{ padding: '8px 10px' }}>Fault Description</th>
                  <th style={{ padding: '8px 10px' }}>Priority</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {req.id}
                    </td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{req.date}</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{req.department}</td>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{req.equipment}</td>
                    <td style={{ padding: '10px' }}>{req.requester}</td>
                    <td style={{ padding: '10px', maxWidth: '280px', lineHeight: 1.35 }}>{req.description}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={req.priority === 'Urgent' ? 'danger' : 'amber'} size="sm">
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={req.status.includes('Approved') ? 'teal' : 'secondary'} size="sm">
                        {req.status}
                      </Badge>
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
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                Record Work Order Deliverable Completion Receipt (31.3)
              </span>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setIsNewReceiptModalOpen(true)}>
              Log Service Receipt
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Receipt ID</th>
                  <th style={{ padding: '8px 10px' }}>WO Ref</th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Contractor & Tech</th>
                  <th style={{ padding: '8px 10px' }}>Deliverable Description</th>
                  <th style={{ padding: '8px 10px' }}>Spares Replaced</th>
                  <th style={{ padding: '8px 10px' }}>Inspection Result</th>
                  <th style={{ padding: '8px 10px' }}>Clearance</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {rec.id}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{rec.woRef}</td>
                    <td style={{ padding: '10px' }}>{rec.date}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600' }}>{rec.contractor}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>{rec.technician}</div>
                    </td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{rec.title}</td>
                    <td style={{ padding: '10px', maxWidth: '200px' }}>{rec.sparesUsed}</td>
                    <td style={{ padding: '10px', color: '#16A34A', fontWeight: '600' }}>{rec.labTestResult}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="teal" size="sm">
                        {rec.confirmationStatus}
                      </Badge>
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
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  Central Consolidated Work Orders & SLA Tracker (31.4)
                </span>
                <Badge variant="teal" size="sm">
                  {filteredWorkOrders.length} Records
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ width: '180px' }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="In Execution">In Execution</option>
                  <option value="Receipt Confirmed">Receipt Confirmed</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </div>
              <div style={{ width: '180px' }}>
                <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  {departmentOptions.map(d => (
                    <option key={d} value={d}>
                      {d === 'all' ? 'All Departments' : d}
                    </option>
                  ))}
                </Select>
              </div>
              <div style={{ width: '200px' }}>
                <Input
                  placeholder="Search WO#, title, vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>WO Ref</th>
                  <th style={{ padding: '8px 10px' }}>Requisition Ref</th>
                  <th style={{ padding: '8px 10px' }}>Work Title</th>
                  <th style={{ padding: '8px 10px' }}>Department</th>
                  <th style={{ padding: '8px 10px' }}>Contractor</th>
                  <th style={{ padding: '8px 10px' }}>Estimated Cost</th>
                  <th style={{ padding: '8px 10px' }}>Target Date</th>
                  <th style={{ padding: '8px 10px' }}>Priority</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {wo.referenceNumber}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {wo.requisitionRef}
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{wo.title}</td>
                    <td style={{ padding: '10px' }}>{wo.department}</td>
                    <td style={{ padding: '10px' }}>{wo.contractor}</td>
                    <td style={{ padding: '10px', fontWeight: '700' }}>₹{wo.estimatedCost.toLocaleString()}</td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{wo.targetDate}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={wo.priority === 'Urgent' ? 'danger' : wo.priority === 'High' ? 'amber' : 'secondary'} size="sm">
                        {wo.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={wo.status === 'Approved' ? 'teal' : wo.status === 'In Execution' ? 'blue' : wo.status === 'Rejected' ? 'danger' : 'secondary'} size="sm">
                        {wo.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.5: Approve Work Orders, Confirm Work Orders & Review Rejected */}
      {activeSubtab === '31.5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
              <ShieldCheck size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                Supervisory Work Order Approvals & Confirmations (31.5)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workOrders.filter(wo => wo.status === 'Pending Approval' || wo.status === 'Approved').map((wo) => (
                <div
                  key={wo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)', fontSize: '0.80rem' }}>
                        {wo.referenceNumber}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>
                        {wo.title}
                      </span>
                      <Badge variant={wo.priority === 'Urgent' ? 'danger' : 'amber'} size="sm">
                        {wo.priority}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                      Dept: {wo.department} • Contractor: {wo.contractor} • Cost Estimate: <strong>₹{wo.estimatedCost.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {wo.status === 'Pending Approval' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() => setPendingApprovalWo(wo)}
                      >
                        Approve Order
                      </Button>
                    )}
                    {wo.status === 'Approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ShieldCheck}
                        onClick={() => setPendingConfirmationWo(wo)}
                      >
                        Confirm Execution
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={X}
                      onClick={() => {
                        setRejectionModalOrder(wo);
                        setRejectionReasonText('');
                      }}
                    >
                      Reject Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rejected Orders Review Section (31.5) */}
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={18} color="#DC2626" />
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#991B1B' }}>
                Administrative Review of Rejected Work Orders ({rejectedOrders.length} Entries)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rejectedOrders.map((rej) => (
                <div
                  key={rej.id}
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: '0.76rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: '700', color: '#991B1B' }}>
                      {rej.id}: {rej.title}
                    </span>
                    <span style={{ color: '#7F1D1D' }}>
                      Rejected On: {rej.date} by <strong>{rej.rejectedBy}</strong>
                    </span>
                  </div>
                  <div style={{ color: '#B91C1C' }}>
                    <strong>Administrative Reason:</strong> {rej.reason}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* SUBMODULE 31.6: Approve Work Order Receipts & Confirm Work Order Receipts */}
      {activeSubtab === '31.6' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Award size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Inspection Acceptance & Deliverable Sign-off Workflow (31.6)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {receipts.map((rec) => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)', fontSize: '0.80rem' }}>
                      {rec.id} ({rec.woRef})
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>
                      {rec.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                    Technician: <strong>{rec.technician}</strong> ({rec.contractor}) • Spares: {rec.sparesUsed}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '2px' }}>
                    ✔ Inspection Verification: {rec.labTestResult}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {rec.approvalStatus.includes('Pending') ? (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Award}
                      onClick={() => handleConfirmReceiptApproval(rec.id)}
                    >
                      Sign-off & Clear Payment
                    </Button>
                  ) : (
                    <Badge variant="teal" size="sm">
                      Signed Off & Cleared
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New Work Order Form (31.1) */}
      <Modal
        isOpen={isNewWoModalOpen}
        onClose={() => setIsNewWoModalOpen(false)}
        title="Commission New Service Work Order"
        size="md"
      >
        <form onSubmit={handleSaveWorkOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Work Order Title / Scope"
            placeholder="e.g. Cath Lab UPS Battery Replacement"
            value={woForm.title}
            onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Department
              </label>
              <Select value={woForm.department} onChange={(e) => setWoForm({ ...woForm, department: e.target.value })}>
                {departmentOptions.filter(d => d !== 'all').map(d => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Priority Level
              </label>
              <Select value={woForm.priority} onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </Select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Assigned Contractor Company"
              value={woForm.contractor}
              onChange={(e) => setWoForm({ ...woForm, contractor: e.target.value })}
              required
            />
            <Input
              label="Estimated Cost (₹)"
              type="number"
              value={woForm.estimatedCost}
              onChange={(e) => setWoForm({ ...woForm, estimatedCost: e.target.value })}
              required
            />
          </div>
          <Input
            label="Service SLA Target Completion Date"
            type="date"
            value={woForm.targetDate}
            onChange={(e) => setWoForm({ ...woForm, targetDate: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewWoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Work Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Requisition Form (31.2) */}
      <Modal
        isOpen={isNewRequisitionModalOpen}
        onClose={() => setIsNewRequisitionModalOpen(false)}
        title="Record Departmental Maintenance Requisition"
        size="md"
      >
        <form onSubmit={handleSaveRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Equipment / Machine Name"
            placeholder="e.g. Ventilator V60 Sensor Calibrator"
            value={reqForm.equipment}
            onChange={(e) => setReqForm({ ...reqForm, equipment: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Department
              </label>
              <Select value={reqForm.department} onChange={(e) => setReqForm({ ...reqForm, department: e.target.value })}>
                {departmentOptions.filter(d => d !== 'all').map(d => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Priority
              </label>
              <Select value={reqForm.priority} onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </Select>
            </div>
          </div>
          <Input
            label="Fault Description & Symptoms"
            placeholder="Describe malfunction observed..."
            value={reqForm.description}
            onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewRequisitionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Work Order Receipt Form (31.3) */}
      <Modal
        isOpen={isNewReceiptModalOpen}
        onClose={() => setIsNewReceiptModalOpen(false)}
        title="Record Work Order Completion Receipt"
        size="md"
      >
        <form onSubmit={handleSaveReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Work Order Reference (WO#)"
              value={receiptForm.woRef}
              onChange={(e) => setReceiptForm({ ...receiptForm, woRef: e.target.value })}
              required
            />
            <Input
              label="Lead Service Technician"
              value={receiptForm.technician}
              onChange={(e) => setReceiptForm({ ...receiptForm, technician: e.target.value })}
              required
            />
          </div>
          <Input
            label="Deliverable Completion Note"
            value={receiptForm.title}
            onChange={(e) => setReceiptForm({ ...receiptForm, title: e.target.value })}
            required
          />
          <Input
            label="Spares & Consumables Replaced"
            value={receiptForm.sparesUsed}
            onChange={(e) => setReceiptForm({ ...receiptForm, sparesUsed: e.target.value })}
            required
          />
          <Input
            label="Quality / Lab Calibration Sign-off"
            value={receiptForm.labTestResult}
            onChange={(e) => setReceiptForm({ ...receiptForm, labTestResult: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewReceiptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Service Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approval Confirmation Dialog (31.5) */}
      {pendingApprovalWo && (
        <Modal
          isOpen={Boolean(pendingApprovalWo)}
          onClose={() => setPendingApprovalWo(null)}
          title="Supervisory Approval of Work Order"
          size="sm"
        >
          <div style={{ padding: '8px 0', fontSize: '0.82rem' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              Authorize execution of <strong>{pendingApprovalWo.referenceNumber}</strong>: <em>{pendingApprovalWo.title}</em> for department <strong>{pendingApprovalWo.department}</strong> (Cost Estimate: ₹{pendingApprovalWo.estimatedCost.toLocaleString()})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setPendingApprovalWo(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmApproval}>
                Approve Work Order
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Financial Confirmation Dialog (31.5) */}
      {pendingConfirmationWo && (
        <Modal
          isOpen={Boolean(pendingConfirmationWo)}
          onClose={() => setPendingConfirmationWo(null)}
          title="Confirm Financial Clearance for Work Order"
          size="sm"
        >
          <div style={{ padding: '8px 0', fontSize: '0.82rem' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              Confirm budget clearance and vendor purchase issuance for <strong>{pendingConfirmationWo.referenceNumber}</strong> to <strong>{pendingConfirmationWo.contractor}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setPendingConfirmationWo(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmOrderExecution}>
                Confirm Execution
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Modal Dialog (31.5) */}
      {rejectionModalOrder && (
        <Modal
          isOpen={Boolean(rejectionModalOrder)}
          onClose={() => setRejectionModalOrder(null)}
          title="Administrative Rejection of Work Order"
          size="sm"
        >
          <div style={{ padding: '8px 0', fontSize: '0.82rem' }}>
            <p style={{ margin: '0 0 10px 0', color: '#991B1B' }}>
              State mandatory administrative justification for rejecting <strong>{rejectionModalOrder.referenceNumber}</strong>:
            </p>
            <Input
              placeholder="e.g. Routine servicing already completed; cost exceeded quota..."
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setRejectionModalOrder(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRejection}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default WorkOrderDesk;
