import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Wrench,
  FileText,
  Eye,
  ShieldCheck,
  AlertCircle,
  Award,
  Search,
  Check,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_WORK_ORDERS } from '../inventoryMockData';

export function WorkOrderGroup({ activeSubtab = '31.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [notification, setNotification] = useState('');

  // Requisitions list
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
      date: '2026-10-23',
      department: 'Intensive Care Unit (ICU)',
      requester: 'Dr. Pradeep K. Sharma',
      equipment: 'Dialysis Water Treatment RO Booster Pump',
      priority: 'High',
      status: 'Converted to WO',
      description: 'Unusual motor vibration on water intake line #2.'
    },
    {
      id: 'WOR-2026-083',
      date: '2026-10-22',
      department: 'Inpatient Ward 3 (Female)',
      requester: 'Nurse Supervisor Reena Roy',
      equipment: 'Nurse Call Bell Terminal Bed 308-314',
      priority: 'Medium',
      status: 'Pending Review',
      description: 'Audio chime intermittent in central station console.'
    }
  ]);

  // Receipts list
  const [receipts, setReceipts] = useState([
    {
      id: 'WR-2026-051',
      woRef: 'WO-2026-015',
      title: 'Dialysis Reverse Osmosis (RO) Plant Quarterly Membrane Descaling',
      contractor: 'Aquafresh Industrial Systems',
      completionDate: '2026-10-24',
      technician: 'Senior Field Eng. Rajesh Nair',
      sparesUsed: '4x Industrial RO Membranes, Descaling Bio-agent 20L',
      labTestResult: 'Pass (TDS: 11 ppm, Microbiological: 0 CFU)',
      invoiceAmount: 28000,
      approvalStatus: 'Approved by Supervisor',
      confirmationStatus: 'Confirmed & Cleared for Payment'
    },
    {
      id: 'WR-2026-052',
      woRef: 'WO-2026-012',
      title: 'OT 1 Air Handling Unit (AHU) Hepa Filter Replacement',
      contractor: 'BlueStar CleanAir Services',
      completionDate: '2026-10-25',
      technician: 'HVAC Specialist M. K. Sen',
      sparesUsed: '8x Grade H14 HEPA Filters, Pre-filter media 4-ply',
      labTestResult: 'Air Particle Count: Class 100 Compliant (NABH)',
      invoiceAmount: 38000,
      approvalStatus: 'Pending Technical Inspection',
      confirmationStatus: 'Pending Final Confirmation'
    }
  ]);

  // Rejected work orders
  const [rejectedOrders, setRejectedOrders] = useState([
    {
      id: 'WO-2026-009',
      title: 'Inpatient Ward 4 Decorative Wall Cladding',
      department: 'Civil Maintenance',
      contractor: 'Apex Interior Finishes',
      estimatedCost: 85000,
      rejectedBy: 'Finance & CAPEX Committee',
      rejectedDate: '2026-10-18',
      reason: 'Non-essential aesthetic expense during current fiscal quarter budget ceiling.',
      appealStatus: 'Can Appeal with Revised Scope'
    },
    {
      id: 'WO-2026-007',
      title: 'Executive Boardroom Smart Audio-Visual Console Overhaul',
      department: 'IT & AV Services',
      contractor: 'Sony Pro Systems',
      estimatedCost: 140000,
      rejectedBy: 'Medical Superintendent',
      rejectedDate: '2026-10-14',
      reason: 'Existing system under active OEM AMC warranty. In-house warranty claim to be raised first.',
      appealStatus: 'Closed'
    }
  ]);

  // Modals state
  const [isRecordWoModalOpen, setIsRecordWoModalOpen] = useState(false);
  const [isNewRequisitionModalOpen, setIsNewRequisitionModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedOrderToReject, setSelectedOrderToReject] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Form states
  const [woForm, setWoForm] = useState({
    title: '',
    department: 'Biomedical & Engineering',
    priority: 'High',
    contractor: 'BlueStar CleanAir Services',
    estimatedCost: '25000',
    targetDate: '2026-11-05'
  });

  const [reqForm, setReqForm] = useState({
    department: 'Operation Theatre Complex',
    requester: 'Staff Nurse Senior',
    equipment: '',
    priority: 'Urgent',
    description: ''
  });

  const [receiptForm, setReceiptForm] = useState({
    woRef: 'WO-2026-012',
    contractor: 'BlueStar CleanAir Services',
    technician: '',
    sparesUsed: '',
    labTestResult: 'Pass - Meets Engineering Specifications',
    invoiceAmount: '38000'
  });

  const [viewFilter, setViewFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreateWo = (e) => {
    e.preventDefault();
    const newWo = {
      id: `WO-2026-0${16 + workOrders.length}`,
      title: woForm.title || 'General Maintenance Work Order',
      department: woForm.department,
      priority: woForm.priority,
      contractor: woForm.contractor,
      estimatedCost: Number(woForm.estimatedCost),
      targetDate: woForm.targetDate,
      status: 'Pending Approval',
      approvalLevel: 'Engineering Supervisor'
    };
    setWorkOrders([newWo, ...workOrders]);
    setIsRecordWoModalOpen(false);
    showToast(`Work Order ${newWo.id} recorded! Routed to Supervisor for review.`);
  };

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.equipment || !reqForm.description) return;
    const newReq = {
      id: `WOR-2026-0${84 + requisitions.length}`,
      date: new Date().toISOString().split('T')[0],
      department: reqForm.department,
      requester: reqForm.requester,
      equipment: reqForm.equipment,
      priority: reqForm.priority,
      status: 'Pending Review',
      description: reqForm.description
    };
    setRequisitions([newReq, ...requisitions]);
    setIsNewRequisitionModalOpen(false);
    showToast(`Work Order Requisition ${newReq.id} recorded successfully!`);
  };

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    const newRec = {
      id: `WR-2026-0${53 + receipts.length}`,
      woRef: receiptForm.woRef,
      title: workOrders.find(w => w.id === receiptForm.woRef)?.title || 'Facility Maintenance',
      contractor: receiptForm.contractor,
      completionDate: new Date().toISOString().split('T')[0],
      technician: receiptForm.technician || 'Technician Incharge',
      sparesUsed: receiptForm.sparesUsed || 'Standard maintenance kit',
      labTestResult: receiptForm.labTestResult,
      invoiceAmount: Number(receiptForm.invoiceAmount) || 20000,
      approvalStatus: 'Pending Technical Inspection',
      confirmationStatus: 'Pending Final Confirmation'
    };
    setReceipts([newRec, ...receipts]);
    setIsNewReceiptModalOpen(false);
    showToast(`Work Order Completion Receipt ${newRec.id} logged!`);
  };

  const handleApproveWo = (woId) => {
    setWorkOrders(prev => prev.map(w => w.id === woId ? { ...w, status: 'Approved', approvalLevel: 'Executive Director' } : w));
    showToast(`Work Order ${woId} approved by Supervisor!`);
  };

  const handleOpenRejectModal = (wo) => {
    setSelectedOrderToReject(wo);
    setRejectionReasonText('');
    setIsRejectReasonModalOpen(true);
  };

  const handleConfirmRejectOrder = (e) => {
    e.preventDefault();
    if (!selectedOrderToReject) return;
    const reason = rejectionReasonText || 'Budget limit or scope non-compliance.';

    // Remove from active or update status
    setWorkOrders(prev => prev.filter(w => w.id !== selectedOrderToReject.id));
    setRejectedOrders([
      {
        id: selectedOrderToReject.id,
        title: selectedOrderToReject.title,
        department: selectedOrderToReject.department,
        contractor: selectedOrderToReject.contractor,
        estimatedCost: selectedOrderToReject.estimatedCost,
        rejectedBy: 'Engineering Supervisor',
        rejectedDate: new Date().toISOString().split('T')[0],
        reason: reason,
        appealStatus: 'Under Appeal Review'
      },
      ...rejectedOrders
    ]);
    setIsRejectReasonModalOpen(false);
    showToast(`Work Order ${selectedOrderToReject.id} rejected and logged to Review Registry.`);
  };

  const handleConfirmWo = (woId) => {
    setWorkOrders(prev => prev.map(w => w.id === woId ? { ...w, status: 'Confirmed & Issued', approvalLevel: 'Contractor Dispatched' } : w));
    showToast(`Work Order ${woId} confirmed & officially issued to contractor.`);
  };

  const handleApproveReceipt = (recId) => {
    setReceipts(prev => prev.map(r => r.id === recId ? { ...r, approvalStatus: 'Approved by Supervisor' } : r));
    showToast(`Technical sign-off approved for Receipt ${recId}!`);
  };

  const handleConfirmReceipt = (recId) => {
    setReceipts(prev => prev.map(r => r.id === recId ? { ...r, confirmationStatus: 'Confirmed & Cleared for Payment' } : r));
    showToast(`Receipt ${recId} confirmed! Financial accounts cleared for invoice settlement.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 31.1: Record Work Order */}
      {activeSubtab === '31.1' && (
        <Card
          title="Record Facility & Biomedical Work Order"
          subtitle="Generate maintenance tasks, equipment overhaul orders, and assign external contractors"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsRecordWoModalOpen(true)}>
              Record New Work Order
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>WO Number</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Title / Scope</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Department</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Contractor</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Est. Cost</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Target Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((w) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{w.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{w.title}</td>
                    <td style={{ padding: '10px 14px' }}>{w.department}</td>
                    <td style={{ padding: '10px 14px' }}>{w.contractor}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>₹{w.estimatedCost.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>{w.targetDate}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={w.status.includes('Confirmed') ? 'success' : w.status === 'Approved' ? 'teal' : 'warning'}>
                        {w.status}
                      </Badge>
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
          title="Record Work Order Requisition"
          subtitle="Departmental maintenance and repair requisitions with priority urgency indicators"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewRequisitionModalOpen(true)}>
              Raise New Requisition
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Requisition ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Department</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Equipment / Facility Item</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Reported Issue</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Priority</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{req.id}</td>
                    <td style={{ padding: '10px 14px' }}>{req.date}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{req.department}</td>
                    <td style={{ padding: '10px 14px' }}>{req.equipment}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{req.description}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.priority === 'Urgent' ? 'danger' : req.priority === 'High' ? 'warning' : 'teal'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.status === 'Converted to WO' ? 'success' : 'teal'}>
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
        <Card
          title="Record Work Order Completion Receipt"
          subtitle="Contractor deliverable acceptance note, technician timesheets, test certificates, and replaced parts logging"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewReceiptModalOpen(true)}>
              Record Completion Receipt
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Receipt ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>WO Reference</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Deliverable Title</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Contractor & Tech</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Parts / Spares Used</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>QA Test Verification</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Invoice (₹)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{rec.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{rec.woRef}</td>
                    <td style={{ padding: '10px 14px' }}>{rec.title}</td>
                    <td style={{ padding: '10px 14px' }}>{rec.contractor} ({rec.technician})</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{rec.sparesUsed}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>{rec.labTestResult}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{rec.invoiceAmount.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={rec.confirmationStatus.includes('Cleared') ? 'success' : 'warning'}>
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
        <Card
          title="Central Consolidated Work Order Status Console"
          subtitle="End-to-end tracking across all facility work orders, engineering requisitions, and completion receipts"
        >
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Search orders, contractors, or departments..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Records' },
                  { value: 'Pending', label: 'Pending Approval' },
                  { value: 'Approved', label: 'Approved & Active' },
                  { value: 'Confirmed', label: 'Confirmed & Closed' }
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {workOrders
              .filter(w => viewFilter === 'ALL' || w.status.includes(viewFilter))
              .filter(w => w.title.toLowerCase().includes(searchTerm.toLowerCase()) || w.department.toLowerCase().includes(searchTerm.toLowerCase()) || w.contractor.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((w) => (
                <div key={w.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.88rem' }}>{w.id}</span>
                      <Badge variant={w.priority === 'Urgent' ? 'danger' : 'teal'}>{w.priority}</Badge>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', marginTop: '8px' }}>{w.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Dept: <strong>{w.department}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      Contractor: <strong>{w.contractor}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>₹{w.estimatedCost.toLocaleString()}</div>
                    <Badge variant={w.status.includes('Confirmed') ? 'success' : w.status === 'Approved' ? 'teal' : 'warning'}>
                      {w.status}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.5: Orders: Approve Work Orders */}
      {activeSubtab === '31.5' && (
        <Card
          title="Orders: Approve Work Orders"
          subtitle="Engineering supervisor review, technical feasibility vetting, budget authorization, and sign-off"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {workOrders.filter(w => w.status === 'Pending Approval').length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                ✓ No pending work orders awaiting supervisory approval.
              </div>
            ) : (
              workOrders.filter(w => w.status === 'Pending Approval').map((w) => (
                <div key={w.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{w.id}</span>
                      <Badge variant="warning">{w.priority} Priority</Badge>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{w.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Department: {w.department} • Contractor: {w.contractor} • Target: {w.targetDate}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                      Estimated Budget: ₹{w.estimatedCost.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button size="sm" variant="outline" icon={X} onClick={() => handleOpenRejectModal(w)}>
                      Reject with Reason
                    </Button>
                    <Button size="sm" variant="primary" icon={Check} onClick={() => handleApproveWo(w.id)}>
                      Approve Work Order
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.6: Orders: Confirm Work Orders */}
      {activeSubtab === '31.6' && (
        <Card
          title="Orders: Confirm Work Orders & Issue to Contractor"
          subtitle="Final order issuance, contractor SLA confirmation, gate pass clearance, and schedule lock"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {workOrders.map((w) => (
              <div key={w.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{w.id}</span>
                    <Badge variant={w.status.includes('Confirmed') ? 'success' : 'teal'}>{w.status}</Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{w.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Contractor: {w.contractor} • Target Completion: {w.targetDate} • Est: ₹{w.estimatedCost.toLocaleString()}
                  </div>
                </div>

                <div>
                  {w.status === 'Approved' ? (
                    <Button size="sm" variant="primary" icon={Award} onClick={() => handleConfirmWo(w.id)}>
                      Confirm & Issue Official WO
                    </Button>
                  ) : w.status.includes('Confirmed') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} />
                      Issued to Contractor (SLA Active)
                    </div>
                  ) : (
                    <Badge variant="gray">Awaiting Supervisor Approval First</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.7: Orders: Review Rejected Work Orders */}
      {activeSubtab === '31.7' && (
        <Card
          title="Orders: Review Rejected Work Orders & Appeals"
          subtitle="Audit log of declined maintenance proposals, justification memos, and appeal resubmissions"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {rejectedOrders.map((rej) => (
              <div key={rej.id} style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#991B1B' }}>{rej.id}: {rej.title}</div>
                  <Badge variant="danger">Rejected by {rej.rejectedBy}</Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#7F1D1D', marginTop: '6px' }}>
                  <strong>Rejection Justification:</strong> {rej.reason}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#B91C1C' }}>
                  <span>Department: {rej.department} • Cost: ₹{rej.estimatedCost.toLocaleString()} • Date: {rej.rejectedDate}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      showToast(`Appeal dossier prepared for ${rej.id}. Resubmitted to Engineering Board.`);
                    }}
                  >
                    Resubmit with Scope Revision
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.8: Receipts: Approve Work Order Receipts */}
      {activeSubtab === '31.8' && (
        <Card
          title="Receipts: Approve Work Order Receipts"
          subtitle="Engineering supervisor deliverable verification, quality audit, and technical signoff"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {receipts.map((rec) => (
              <div key={rec.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{rec.id}</span>
                    <Badge variant="teal">Ref: {rec.woRef}</Badge>
                    <Badge variant={rec.approvalStatus.includes('Approved') ? 'success' : 'warning'}>{rec.approvalStatus}</Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{rec.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Contractor: {rec.contractor} • Tech: {rec.technician} • Spares: {rec.sparesUsed}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-teal)', fontWeight: '600', marginTop: '2px' }}>
                    QA Compliance: {rec.labTestResult}
                  </div>
                </div>

                <div>
                  {rec.approvalStatus.includes('Pending') ? (
                    <Button size="sm" variant="primary" icon={ShieldCheck} onClick={() => handleApproveReceipt(rec.id)}>
                      Approve Technical QA Receipt
                    </Button>
                  ) : (
                    <div style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} />
                      Technical Signoff Approved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.9: Receipts: Confirm Work Order Receipts */}
      {activeSubtab === '31.9' && (
        <Card
          title="Receipts: Confirm Work Order Receipts & Invoice Clearance"
          subtitle="Final administrative and financial acceptance, warranty lock, and invoice settlement clearance"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {receipts.map((rec) => (
              <div key={rec.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{rec.id}</span>
                    <Badge variant={rec.confirmationStatus.includes('Cleared') ? 'success' : 'teal'}>{rec.confirmationStatus}</Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{rec.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Contractor: {rec.contractor} • Completion Date: {rec.completionDate}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                    Payable Invoice: ₹{rec.invoiceAmount.toLocaleString()}
                  </div>
                </div>

                <div>
                  {rec.confirmationStatus.includes('Cleared') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} />
                      Invoice Cleared for Accounts Payout
                    </div>
                  ) : (
                    <Button size="sm" variant="primary" icon={Award} onClick={() => handleConfirmReceipt(rec.id)}>
                      Confirm Receipt & Authorize Payment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Record Work Order */}
      <Modal
        isOpen={isRecordWoModalOpen}
        onClose={() => setIsRecordWoModalOpen(false)}
        title="Record New Maintenance Work Order"
        subtitle="Specify engineering scope and contractor allocation"
      >
        <form onSubmit={handleCreateWo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Work Order Scope / Title"
            required
            placeholder="e.g. ICU Negative Pressure Ventilation Calibration"
            value={woForm.title}
            onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Department"
              value={woForm.department}
              onChange={(e) => setWoForm({ ...woForm, department: e.target.value })}
              options={['Biomedical & Engineering', 'Electrical Services', 'Maintenance', 'Nephrology Engineering', 'HVAC & CleanAir']}
            />
            <Select
              label="Priority"
              value={woForm.priority}
              onChange={(e) => setWoForm({ ...woForm, priority: e.target.value })}
              options={['Low', 'Medium', 'High', 'Urgent']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Contractor Name"
              value={woForm.contractor}
              onChange={(e) => setWoForm({ ...woForm, contractor: e.target.value })}
            />
            <Input
              label="Estimated Cost (₹)"
              type="number"
              value={woForm.estimatedCost}
              onChange={(e) => setWoForm({ ...woForm, estimatedCost: e.target.value })}
            />
          </div>

          <Input
            label="Target Completion Date"
            type="date"
            value={woForm.targetDate}
            onChange={(e) => setWoForm({ ...woForm, targetDate: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRecordWoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Work Order</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Work Order Requisition */}
      <Modal
        isOpen={isNewRequisitionModalOpen}
        onClose={() => setIsNewRequisitionModalOpen(false)}
        title="Raise Department Work Order Requisition"
        subtitle="Report equipment malfunction or facility maintenance request"
      >
        <form onSubmit={handleCreateRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Department / Ward"
              value={reqForm.department}
              onChange={(e) => setReqForm({ ...reqForm, department: e.target.value })}
              options={[
                'Operation Theatre Complex',
                'Intensive Care Unit (ICU)',
                'Inpatient Ward 3 (Female)',
                'Emergency Trauma Care',
                'Radiology & Imaging',
                'Central Pathology Lab'
              ]}
            />
            <Select
              label="Priority Urgency"
              value={reqForm.priority}
              onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}
              options={['Medium', 'High', 'Urgent']}
            />
          </div>

          <Input
            label="Requester Name & Designation"
            required
            value={reqForm.requester}
            onChange={(e) => setReqForm({ ...reqForm, requester: e.target.value })}
          />

          <Input
            label="Equipment Asset or Facility Item"
            required
            placeholder="e.g. OT 1 Anesthesia Workstation Vaporizer Seal"
            value={reqForm.equipment}
            onChange={(e) => setReqForm({ ...reqForm, equipment: e.target.value })}
          />

          <Input
            label="Problem Description & Clinical Urgency"
            required
            placeholder="Describe the failure, error code, or breakdown details"
            value={reqForm.description}
            onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewRequisitionModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Requisition</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Work Order Receipt */}
      <Modal
        isOpen={isNewReceiptModalOpen}
        onClose={() => setIsNewReceiptModalOpen(false)}
        title="Record Work Order Completion Receipt"
        subtitle="Log contractor deliverable, parts replaced, and inspection certificate"
      >
        <form onSubmit={handleCreateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Select Work Order Reference"
            value={receiptForm.woRef}
            onChange={(e) => setReceiptForm({ ...receiptForm, woRef: e.target.value })}
            options={workOrders.map(w => w.id)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Contractor Name"
              value={receiptForm.contractor}
              onChange={(e) => setReceiptForm({ ...receiptForm, contractor: e.target.value })}
            />
            <Input
              label="Technician / Engineer Incharge"
              placeholder="e.g. Field Engineer Rajesh Nair"
              value={receiptForm.technician}
              onChange={(e) => setReceiptForm({ ...receiptForm, technician: e.target.value })}
            />
          </div>

          <Input
            label="Spares / Parts Used"
            placeholder="e.g. Filter cartridge, O-rings, solenoid valve"
            value={receiptForm.sparesUsed}
            onChange={(e) => setReceiptForm({ ...receiptForm, sparesUsed: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="QA / Lab Test Result"
              value={receiptForm.labTestResult}
              onChange={(e) => setReceiptForm({ ...receiptForm, labTestResult: e.target.value })}
            />
            <Input
              label="Final Invoice Amount (₹)"
              type="number"
              value={receiptForm.invoiceAmount}
              onChange={(e) => setReceiptForm({ ...receiptForm, invoiceAmount: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewReceiptModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Log Completion Receipt</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reject Work Order Reason */}
      <Modal
        isOpen={isRejectReasonModalOpen}
        onClose={() => setIsRejectReasonModalOpen(false)}
        title="Reject Work Order Proposal"
        subtitle={selectedOrderToReject ? `Rejecting ${selectedOrderToReject.id} (${selectedOrderToReject.title})` : ''}
      >
        <form onSubmit={handleConfirmRejectOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Rejection Justification Memo"
            required
            placeholder="State why this proposal cannot be approved (e.g. budget exceeded, existing AMC, alternate solution)"
            value={rejectionReasonText}
            onChange={(e) => setRejectionReasonText(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRejectReasonModalOpen(false)}>Cancel</Button>
            <Button variant="danger" type="submit">Confirm Rejection</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
