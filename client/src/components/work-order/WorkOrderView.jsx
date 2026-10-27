import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  FileText,
  ShieldCheck,
  Check,
  X,
  Upload,
  Download,
  Barcode,
  Layers,
  Sliders,
  DollarSign,
  Activity,
  ArrowRight,
  ClipboardList,
  Cpu
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  WORK_ORDER_SUBMODULES,
  INITIAL_WORK_ORDERS,
  INITIAL_REQUISITIONS,
  INITIAL_RECEIPTS,
  HOSPITAL_ASSETS
} from './workOrderConstants';

export function WorkOrderView({ initialSubtab = '31.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('31.')) return initialSubtab;
    return '31.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = WORK_ORDER_SUBMODULES.find(s => s.id === (initialSubtab || '31.1'));
    return parent?.subsubmodules[0]?.id || '31.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('work-order:', '');
      if (WORK_ORDER_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || WORK_ORDER_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`work-order:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`work-order:${activeSubtab}:${subsubId}`);
    }
  };

  // State: Work Orders
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Detail State
  const [inspectedWO, setInspectedWO] = useState(null);
  const [rejectingWO, setRejectingWO] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form State: New Work Order
  const [newWOAsset, setNewWOAsset] = useState(HOSPITAL_ASSETS[0].id);
  const [newWOFault, setNewWOFault] = useState('');
  const [newWODesc, setNewWODesc] = useState('');
  const [newWOSeverity, setNewWOSeverity] = useState('High');
  const [newWOTech, setNewWOTech] = useState('Kiran Shenoy (Bio-Med)');
  const [newWOCost, setNewWOCost] = useState('15000');

  // Form State: New Requisition
  const [reqWOId, setReqWOId] = useState(workOrders[0]?.id || 'WO-2026-0814');
  const [reqPartName, setReqPartName] = useState('');
  const [reqPartCode, setReqPartCode] = useState('');
  const [reqQty, setReqQty] = useState('1');
  const [reqPrice, setReqPrice] = useState('5000');

  // Form State: New Receipt
  const [recWOId, setRecWOId] = useState(workOrders[0]?.id || 'WO-2026-0814');
  const [recHours, setRecHours] = useState('2.5');
  const [recSparesCost, setRecSparesCost] = useState('6500');
  const [recLaborCost, setRecLaborCost] = useState('1800');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handler: Create Work Order
  const handleCreateWO = (e) => {
    e.preventDefault();
    if (!newWOFault.trim()) {
      triggerToast('Error: Please describe the equipment fault.');
      return;
    }
    const assetObj = HOSPITAL_ASSETS.find(a => a.id === newWOAsset) || HOSPITAL_ASSETS[0];
    const generatedId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: generatedId,
      assetId: assetObj.id,
      assetName: assetObj.name,
      department: assetObj.dept,
      faultType: newWOFault,
      description: newWODesc || 'Standard biomedical inspection requested.',
      severity: newWOSeverity,
      requestedBy: 'Senior Clinical Staff',
      createdAt: 'Just Now',
      status: 'Pending Approval',
      estimatedCost: Number(newWOCost) || 12000,
      technicianAssigned: newWOTech
    };
    setWorkOrders([newEntry, ...workOrders]);
    setNewWOFault('');
    setNewWODesc('');
    triggerToast(`Work Order ${generatedId} logged successfully. Dispatched to Biomedical Supervisor.`);
  };

  // Handler: Create Requisition
  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqPartName.trim()) {
      triggerToast('Error: Please enter spare part name.');
      return;
    }
    const generatedReq = `REQ-WO-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: generatedReq,
      woId: reqWOId,
      itemCode: reqPartCode || `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: reqPartName,
      category: 'Biomedical Replacement Spares',
      quantity: Number(reqQty) || 1,
      unitPrice: Number(reqPrice) || 2000,
      totalPrice: (Number(reqQty) || 1) * (Number(reqPrice) || 2000),
      sourceStore: 'Central Engineering Store #1',
      indentStatus: 'Indent Created',
      requestedDate: 'Just Now'
    };
    setRequisitions([newReq, ...requisitions]);
    setReqPartName('');
    setReqPartCode('');
    triggerToast(`Requisition ${generatedReq} created for ${reqWOId}. Indent sent to Central Store.`);
  };

  // Handler: Create Receipt
  const handleCreateReceipt = (e) => {
    e.preventDefault();
    const woObj = workOrders.find(w => w.id === recWOId) || workOrders[0];
    const generatedRec = `REC-WO-${Math.floor(500 + Math.random() * 499)}`;
    const total = Number(recSparesCost) + Number(recLaborCost);
    const newRec = {
      id: generatedRec,
      woId: recWOId,
      assetName: woObj.assetName,
      technician: woObj.technicianAssigned,
      downtimeHours: Number(recHours) || 2.0,
      sparesCost: Number(recSparesCost) || 0,
      laborCost: Number(recLaborCost) || 0,
      totalCost: total,
      electricalSafetyPassed: true,
      calibrationStatus: 'Calibrated & Certified',
      completionDate: 'Just Now',
      status: 'Pending Verification'
    };
    setReceipts([newRec, ...receipts]);
    triggerToast(`Work Order Receipt ${generatedRec} logged. Electrical safety verification pending.`);
  };

  // Handler: Approve Work Order
  const handleApproveWO = (id) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status: 'Approved' } : w));
    triggerToast(`Work Order ${id} approved by Bio-Med Supervisor. Work clearance granted.`);
  };

  // Handler: Reject Work Order
  const handleRejectWO = (id) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status: 'Rejected', rejectReason } : w));
    setRejectingWO(null);
    setRejectReason('');
    triggerToast(`Work Order ${id} rejected. Reason logged in audit trail.`);
  };

  const activeSubmoduleObj = WORK_ORDER_SUBMODULES.find(s => s.id === activeSubtab) || WORK_ORDER_SUBMODULES[0];

  const filteredWOs = workOrders.filter(w => {
    const matchSearch =
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || w.status.toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            backgroundColor: '#0A4174',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(10, 65, 116, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: '600',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Enterprise Header Banner */}
      <div
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(8, 127, 140, 0.15)'
              }}
            >
              <Wrench size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Biomedical Engineering & Work Order Operations
                </h1>
                <Badge variant="teal">AERB & NABH Bio-Med Compliant</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                Asset breakdown tracking, spare part indents, OEM service tickets, electrical safety calibrations, and supervisor sign-offs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(8, 127, 140, 0.25)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: 'var(--color-primary-teal)'
              }}
            >
              <Cpu size={14} color="var(--color-primary-teal)" />
              <span>Bio-Med Uptime: <strong>99.4%</strong></span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: '#065F46'
              }}
            >
              <ShieldCheck size={14} color="#10B981" />
              <span>NABH Asset Calibration Active</span>
            </div>
          </div>
        </div>

        {/* Level 2 Submodule Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--color-border)',
            overflowX: 'auto',
            paddingBottom: '2px',
            marginTop: '8px'
          }}
        >
          {WORK_ORDER_SUBMODULES.map(tab => {
            const Icon = tab.icon || Wrench;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSubtab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                  borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginBottom: '-1.5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level 3 Subsubmodule Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflows:
          </span>
          {WORK_ORDER_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
            const isSubsubActive = activeSubsubtab === subsub.id;
            return (
              <button
                key={subsub.id}
                type="button"
                onClick={() => handleSelectSubsubtab(subsub.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSubsubActive ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSubsubActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSubsubActive ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'
                  }}
                />
                {subsub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBMODULE 31.1: RECORD WORK ORDER */}
      {activeSubtab === '31.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 31.1.1: Breakdown Ticket Creation Form */}
          {(activeSubsubtab === '31.1.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Log New Biomedical Breakdown / Maintenance Work Order
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Generates hospital WO ticket with instant alert dispatch to Biomedical Engineering and Department In-Charge.
              </p>

              <form onSubmit={handleCreateWO} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Select Hospital Equipment / Asset
                  </label>
                  <select
                    value={newWOAsset}
                    onChange={(e) => setNewWOAsset(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  >
                    {HOSPITAL_ASSETS.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.id}] {a.name} ({a.dept})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Fault Category / Symptom Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Laser power drift, Vacuum suction loss"
                    value={newWOFault}
                    onChange={(e) => setNewWOFault(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Breakdown Severity
                  </label>
                  <select
                    value={newWOSeverity}
                    onChange={(e) => setNewWOSeverity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  >
                    <option value="Critical">Critical (Immediate Clinical Halt / OT / ICU)</option>
                    <option value="Urgent">Urgent (High Patient Impact / Day Care)</option>
                    <option value="High">High (Diagnostics / LIS Workstation)</option>
                    <option value="Medium">Medium (Routine Preventive Check)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Assign Primary Bio-Med Technician
                  </label>
                  <input
                    type="text"
                    value={newWOTech}
                    onChange={(e) => setNewWOTech(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Estimated Repair Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={newWOCost}
                    onChange={(e) => setNewWOCost(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Detailed Fault Clinical Description & Error Codes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide alarm codes, when the breakdown occurred, and whether patient treatment was interrupted..."
                    value={newWODesc}
                    onChange={(e) => setNewWODesc(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button
                    type="submit"
                    variant="teal"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0A4174' }}
                  >
                    <Plus size={16} />
                    <span>Generate & Record Work Order</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* 31.1.2: Asset Master Barcode Lookup */}
          {activeSubsubtab === '31.1.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Biomedical Asset Barcode Lookup & Warranty Contracts
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Scan physical asset barcode sticker or search equipment to verify active AMC/CMC service coverage.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {HOSPITAL_ASSETS.map((asset) => (
                  <div key={asset.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0A4174', backgroundColor: 'var(--color-bg-pale-aqua)', padding: '2px 6px', borderRadius: '4px' }}>
                        {asset.id}
                      </span>
                      <Badge variant="teal">{asset.dept}</Badge>
                    </div>
                    <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', margin: '4px 0' }}>{asset.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Serial: {asset.serial}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600', marginTop: '4px' }}>Contract: {asset.warranty}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 31.1.3: Isolation & Safety Protocols */}
          {activeSubsubtab === '31.1.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Clinical Isolation & Lock-Out Tag-Out (LOTO) Protocol
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Mandatory pre-service biomedical isolation checklist to prevent accidental clinical utilization during repairs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '650px' }}>
                {[
                  'Physical Equipment Isolation: "OUT OF SERVICE" Tag Attached to Console',
                  'Electrical Mains Disconnect & LOTO Breaker Padlock Applied',
                  'Bio-Hazard & Chemical Decontamination Performed by Infection Control Team',
                  'Clinical Standby Backup Machine Deployed to OT / Bedside'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '6px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid rgba(73, 118, 159, 0.25)' }}>
                    <CheckCircle2 size={18} color="#10B981" />
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0A4174' }}>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 31.2: RECORD REQUISITION */}
      {activeSubtab === '31.2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 31.2.1: Spare Parts Indent */}
          {(activeSubsubtab === '31.2.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Record Work Order Spare Parts Requisition & Store Indent
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Issue indent to Central Engineering Store or Procurement Desk for replacement components.
              </p>

              <form onSubmit={handleCreateRequisition} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Select Linked Work Order
                  </label>
                  <select
                    value={reqWOId}
                    onChange={(e) => setReqWOId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  >
                    {workOrders.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.id} — {w.assetName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Spare Part Name / Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O2 Fuel Cell, Halogen Lamp, NIBP Cuff"
                    value={reqPartName}
                    onChange={(e) => setReqPartName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Part OEM Code / Item Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SP-DRG-6850"
                    value={reqPartCode}
                    onChange={(e) => setReqPartCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Required Quantity
                  </label>
                  <input
                    type="number"
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    min={1}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Estimated Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={reqPrice}
                    onChange={(e) => setReqPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="teal"
                    style={{ width: '100%', backgroundColor: '#0A4174' }}
                  >
                    Submit Spare Requisition
                  </Button>
                </div>
              </form>

              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0A4174', margin: '0 0 12px' }}>
                Active Spare Parts Indents
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Requisition #</th>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Linked WO #</th>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Spare Part</th>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Qty</th>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Total Cost</th>
                      <th style={{ padding: '8px 12px', color: '#0A4174' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0A4174' }}>{req.id}</td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{req.woId}</td>
                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#0F172A' }}>{req.itemName}</td>
                        <td style={{ padding: '8px 12px' }}>{req.quantity}</td>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0A4174' }}>₹{req.totalPrice?.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px' }}><Badge variant="teal">{req.indentStatus}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 31.2.2 & 31.2.3: Vendor Requisition */}
          {(activeSubsubtab === '31.2.2' || activeSubsubtab === '31.2.3') && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                External Vendor Requisition & Calibration Gas Procurement
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Dispatch specialized OEM engineers (GE, Siemens, Dräger) or order certified calibration mixtures.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0A4174', display: 'block', marginBottom: '6px' }}>
                    OEM Technical Service Call Dispatch
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 10px' }}>
                    Direct integration with Wipro GE Healthcare and Dräger Medical Field Service Centers.
                  </p>
                  <Button variant="teal" size="sm" onClick={() => triggerToast('OEM Service Ticket dispatched to vendor hotline.')} style={{ backgroundColor: '#0A4174' }}>
                    Dispatch OEM Technician
                  </Button>
                </div>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0A4174', display: 'block', marginBottom: '6px' }}>
                    Calibration Test Gas Cylinders (O2, CO2, N2O)
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 10px' }}>
                    High-precision certified span calibration gases for anesthesia vaporizers and blood gas analyzers.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => triggerToast('Gas requisition sent to Medical Gas store.')} style={{ borderColor: '#49769F', color: '#0A4174' }}>
                    Indent Calibration Gas
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 31.3: RECORD RECEIPT */}
      {activeSubtab === '31.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(activeSubsubtab === '31.3.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Record Work Order Service Completion Receipt
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Log repair completion details, technician labor hours, replaced parts cost, and electrical calibration verification.
              </p>

              <form onSubmit={handleCreateReceipt} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Select Completed Work Order
                  </label>
                  <select
                    value={recWOId}
                    onChange={(e) => setRecWOId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  >
                    {workOrders.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.id} — {w.assetName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Total Downtime Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={recHours}
                    onChange={(e) => setRecHours(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Total Spares Cost Incurred (₹)
                  </label>
                  <input
                    type="number"
                    value={recSparesCost}
                    onChange={(e) => setRecSparesCost(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Technician Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={recLaborCost}
                    onChange={(e) => setRecLaborCost(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="teal"
                    style={{ backgroundColor: '#0A4174' }}
                  >
                    Save Service Receipt
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {(activeSubsubtab === '31.3.2' || activeSubsubtab === '31.3.3') && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Replaced Spare Scrap Handover & Service Sheet Attachment
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Ensure old defective parts are securely tagged and handed over to Central Store for warranty return or biomedical scrap disposal.
              </p>
              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#0A4174' }}>Generate Scrap Handover Gate Pass</strong>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>Barcoded scrap dispatch slip required before vendor invoice sign-off.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => triggerToast('Scrap Handover Pass printed.')} style={{ borderColor: '#49769F', color: '#0A4174' }}>
                  Print Scrap Pass
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 31.4: VIEW WORK ORDERS / REGISTERS */}
      {activeSubtab === '31.4' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: 0 }}>
                Work Orders, Requisitions & Service Receipts Register
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                Live filterable master list of hospital equipment maintenance tickets.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search WO#, Asset, Dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '6px 12px 6px 30px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.82rem', fontWeight: '600' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="IN-PROGRESS">In-Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>WO ID</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Asset / Equipment</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Department</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Severity</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Assigned Tech</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Est. Cost</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174' }}>Status</th>
                  <th style={{ padding: '10px 12px', color: '#0A4174', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWOs.map((wo) => (
                  <tr key={wo.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0A4174' }}>{wo.id}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <strong style={{ color: '#0F172A' }}>{wo.assetName}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{wo.assetId}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{wo.department}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor:
                            wo.severity === 'Critical' ? '#FEE2E2' :
                            wo.severity === 'Urgent' ? '#FFEDD5' :
                            wo.severity === 'High' ? '#FEF3C7' : '#E2E8F0',
                          color:
                            wo.severity === 'Critical' ? '#991B1B' :
                            wo.severity === 'Urgent' ? '#C2410C' :
                            wo.severity === 'High' ? '#B45309' : '#334155'
                        }}
                      >
                        {wo.severity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>{wo.technicianAssigned}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0A4174' }}>
                      ₹{wo.estimatedCost?.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={wo.status === 'Approved' ? 'teal' : wo.status === 'Pending Approval' ? 'warning' : 'neutral'}>
                        {wo.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectedWO(wo)}
                        style={{ fontSize: '0.74rem', borderColor: '#49769F', color: '#0A4174' }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.5: ORDERS APPROVAL WORKFLOW */}
      {activeSubtab === '31.5' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: 0 }}>
                Supervisor Approval Queue (Screenshot 4 Reference)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                Review and authorize maintenance budget releases, repair scopes, or reject unverified breakdown orders.
              </p>
            </div>
            <Badge variant="teal">Supervisor Action Desk</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workOrders.filter(w => w.status === 'Pending Approval').length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                No pending work orders requiring supervisor sign-off at this time.
              </div>
            ) : (
              workOrders.filter(w => w.status === 'Pending Approval').map((wo) => (
                <div
                  key={wo.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.96rem', color: '#0A4174' }}>{wo.id}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F172A' }}>{wo.assetName}</span>
                      <Badge variant="warning">{wo.severity}</Badge>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                      <strong>Dept:</strong> {wo.department} • <strong>Requested By:</strong> {wo.requestedBy} • <strong>Est. Budget:</strong> ₹{wo.estimatedCost?.toLocaleString()}
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0, fontStyle: 'italic' }}>
                      "{wo.description}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectingWO(wo)}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Reject Order
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => handleApproveWO(wo.id)}
                      style={{ fontSize: '0.78rem', backgroundColor: '#0A4174', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={14} />
                      <span>Approve Work Order</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* SUBMODULE 31.6: RECEIPTS APPROVAL WORKFLOW */}
      {activeSubtab === '31.6' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
            31.6 Work Order Receipt Approval & Electrical Safety Calibration Verification
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
            Final acceptance testing: Electrical safety test (IEC 62353/60601), leakage current pass, and operational census restoration.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {receipts.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0A4174' }}>{rec.id} ({rec.woId})</strong>
                  <Badge variant="teal">{rec.calibrationStatus}</Badge>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: '700', color: '#0F172A', margin: '0 0 4px' }}>{rec.assetName}</h4>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Technician: {rec.technician} • Downtime: {rec.downtimeHours} hrs
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '8px 12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: '6px' }}>
                  <span>Spares: ₹{rec.sparesCost} | Labor: ₹{rec.laborCost}</span>
                  <strong style={{ color: '#0A4174' }}>Total: ₹{rec.totalCost?.toLocaleString()}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#10B981', fontWeight: '600' }}>
                  <CheckCircle2 size={15} />
                  <span>IEC-62353 Electrical Safety & Earth Continuity Passed</span>
                </div>

                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => triggerToast(`Receipt ${rec.id} signed off. Asset restored to active hospital census.`)}
                  style={{ backgroundColor: '#0A4174', marginTop: '4px' }}
                >
                  Final Supervisor Acceptance Sign-off
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: View Details */}
      {inspectedWO && (
        <Modal
          isOpen={true}
          title={`Work Order Details — ${inspectedWO.id}`}
          onClose={() => setInspectedWO(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div><strong>Equipment:</strong> {inspectedWO.assetName} ({inspectedWO.assetId})</div>
            <div><strong>Department:</strong> {inspectedWO.department}</div>
            <div><strong>Severity:</strong> {inspectedWO.severity}</div>
            <div><strong>Fault Description:</strong> {inspectedWO.description}</div>
            <div><strong>Technician Assigned:</strong> {inspectedWO.technicianAssigned}</div>
            <div><strong>Estimated Cost:</strong> ₹{inspectedWO.estimatedCost?.toLocaleString()}</div>
            <div><strong>Current Status:</strong> {inspectedWO.status}</div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="teal" onClick={() => setInspectedWO(null)} style={{ backgroundColor: '#0A4174' }}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reject WO */}
      {rejectingWO && (
        <Modal
          isOpen={true}
          title={`Reject Work Order — ${rejectingWO.id}`}
          onClose={() => setRejectingWO(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
              Specify reason for rejecting equipment repair order for: <strong>{rejectingWO.assetName}</strong>.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Budget exceeded; asset scheduled for decommissioning; redundant ticket."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setRejectingWO(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleRejectWO(rejectingWO.id)}>Confirm Rejection</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
