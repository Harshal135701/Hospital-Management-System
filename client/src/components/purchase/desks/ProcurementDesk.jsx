import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_PURCHASE_ORDERS } from '../../inventory/inventoryMockData';

export function ProcurementDesk({ activeSubtab = '26.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [notification, setNotification] = useState('');

  // Requisitions (26.1)
  const [requisitions, setRequisitions] = useState([
    {
      id: 'PR-2026-101',
      date: '2026-10-24',
      dept: 'Intensive Care Unit (ICU)',
      item: 'Multipara Vital Signs Patient Monitor 12-inch',
      qty: 4,
      estCost: 320000,
      priority: 'Urgent',
      status: 'Approved by HOD',
      justification: 'Replacement for damaged monitors in ICU Bed 03-06'
    },
    {
      id: 'PR-2026-102',
      date: '2026-10-23',
      dept: 'Operation Theatre Complex',
      item: 'Harmonic Scalpel Generator Handpieces',
      qty: 6,
      estCost: 195000,
      priority: 'High',
      status: 'Pending Finance Signoff',
      justification: 'High surgical volume in Laparoscopy Suite'
    },
    {
      id: 'PR-2026-103',
      date: '2026-10-21',
      dept: 'Central Pathology Laboratory',
      item: 'Roche Cobas Automated Chemiluminescence Reagents',
      qty: 20,
      estCost: 145000,
      priority: 'Normal',
      status: 'Approved by HOD',
      justification: 'Monthly routine diagnostic replenishment'
    },
    {
      id: 'PR-2026-104',
      date: '2026-10-20',
      dept: 'Emergency & Trauma Department',
      item: 'Biphasic Defibrillator with Pacing & ECG Recorder',
      qty: 2,
      estCost: 450000,
      priority: 'Urgent',
      status: 'Approved by Medical Director',
      justification: 'Essential life-support equipment for Resus Bay 1 & 2'
    }
  ]);

  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [reqForm, setReqForm] = useState({
    dept: 'Intensive Care Unit (ICU)',
    item: '',
    qty: 1,
    estCost: '',
    priority: 'Normal',
    justification: ''
  });

  // RFQ (26.2)
  const [rfqs, setRfqs] = useState([
    {
      id: 'RFQ-2026-041',
      date: '2026-10-22',
      category: 'Biomedical Capital Equipment',
      title: 'Tender for 64-Slice Cardiac CT Scanner System with UPS',
      invitedVendors: 4,
      bidsReceived: 3,
      deadline: '2026-11-05',
      status: 'Bidding Open'
    },
    {
      id: 'RFQ-2026-042',
      date: '2026-10-19',
      category: 'Hospital Surgical Consumables',
      title: 'Annual Rate Contract for Laparoscopic Disposable Trocars & Endobags',
      invitedVendors: 5,
      bidsReceived: 5,
      deadline: '2026-10-28',
      status: 'Technical Evaluation'
    },
    {
      id: 'RFQ-2026-043',
      date: '2026-10-15',
      category: 'Pharmaceutical Formulation Bulk Supply',
      title: 'Quarterly Injectable Antibiotics & Intravenous Infusions Contract',
      invitedVendors: 6,
      bidsReceived: 6,
      deadline: '2026-10-25',
      status: 'Evaluation Completed'
    }
  ]);

  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqForm, setRfqForm] = useState({
    category: 'Biomedical Capital Equipment',
    title: '',
    invitedVendors: 3,
    deadline: ''
  });

  // Quotation Comparison (26.3)
  const [selectedRfqForComparison, setSelectedRfqForComparison] = useState('RFQ-2026-042');
  const quoteComparisonData = {
    'RFQ-2026-042': [
      { vendor: 'Johnson & Johnson MedTech India', brand: 'Ethicon EndoSurgery', unitRate: 1850, warranty: '1 Year OEM', paymentTerms: '45 Days Credit', lScore: 'L2', compliant: 'Yes' },
      { vendor: 'Medtronic Healthcare India Pvt Ltd', brand: 'Covidien SurgiSleeve', unitRate: 1690, warranty: '2 Years Comprehensive', paymentTerms: '30 Days Credit', lScore: 'L1 Lowest Bid', compliant: 'Yes' },
      { vendor: 'Stryker Global Healthcare', brand: 'Stryker LapTroc', unitRate: 2150, warranty: '1 Year Standard', paymentTerms: '30 Days Net', lScore: 'L3', compliant: 'Yes' }
    ]
  };

  // PO Creation (26.4)
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poForm, setPoForm] = useState({
    vendor: 'Medtronic Healthcare India Pvt Ltd',
    dept: 'Operation Theatre Complex',
    item: 'Covidien SurgiSleeve Laparoscopic Disposable Trocars',
    qty: 150,
    rate: 1690,
    taxRate: 12
  });

  // GRN Inward Inspection (26.5)
  const [grnList, setGrnList] = useState([
    {
      id: 'GRN-2026-881',
      date: '2026-10-24',
      poRef: 'PO-2026-001',
      vendor: 'Siemens Healthcare Diagnostics India',
      invoiceNo: 'SHD/IN/2026/8941',
      itemReceived: 'Advia Centaur Automated Immunoassay Reagents',
      receivedQty: 50,
      acceptedQty: 50,
      rejectedQty: 0,
      batchNo: 'BAT-2026-SM99',
      expiryDate: '2027-10-31',
      status: 'Accepted & Stock Updated',
      inspector: 'Biomedical Engineer Ravi K.'
    },
    {
      id: 'GRN-2026-882',
      date: '2026-10-22',
      poRef: 'PO-2026-002',
      vendor: 'Abbott Laboratories India Ltd',
      invoiceNo: 'ABT-99214-MUM',
      itemReceived: 'Alinity m SARS-CoV-2 Real-Time PCR Assay Kits',
      receivedQty: 25,
      acceptedQty: 23,
      rejectedQty: 2,
      batchNo: 'AB-PCR-8820',
      expiryDate: '2027-04-15',
      status: 'Partial Acceptance (2 Damaged)',
      inspector: 'Lab Store Executive Sunita P.'
    }
  ]);

  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [grnForm, setGrnForm] = useState({
    poRef: 'PO-2026-001',
    vendor: 'Siemens Healthcare Diagnostics India',
    invoiceNo: '',
    itemReceived: '',
    receivedQty: 10,
    rejectedQty: 0,
    batchNo: '',
    expiryDate: ''
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.item) return;

    const newReq = {
      id: `PR-2026-${Math.floor(105 + Math.random() * 890)}`,
      date: new Date().toISOString().split('T')[0],
      dept: reqForm.dept,
      item: reqForm.item,
      qty: parseInt(reqForm.qty, 10) || 1,
      estCost: parseFloat(reqForm.estCost) || 50000,
      priority: reqForm.priority,
      status: 'Pending HOD Approval',
      justification: reqForm.justification || 'Routine Department Need'
    };

    setRequisitions([newReq, ...requisitions]);
    setIsRequisitionModalOpen(false);
    showToast(`Purchase Requisition ${newReq.id} submitted successfully.`);
    setReqForm({
      dept: 'Intensive Care Unit (ICU)',
      item: '',
      qty: 1,
      estCost: '',
      priority: 'Normal',
      justification: ''
    });
  };

  const handleCreateRfq = (e) => {
    e.preventDefault();
    if (!rfqForm.title) return;

    const newRfq = {
      id: `RFQ-2026-${Math.floor(45 + Math.random() * 50)}`,
      date: new Date().toISOString().split('T')[0],
      category: rfqForm.category,
      title: rfqForm.title,
      invitedVendors: parseInt(rfqForm.invitedVendors, 10) || 3,
      bidsReceived: 0,
      deadline: rfqForm.deadline || '2026-11-15',
      status: 'Tender Issued'
    };

    setRfqs([newRfq, ...rfqs]);
    setIsRfqModalOpen(false);
    showToast(`RFQ ${newRfq.id} issued to empaneled suppliers.`);
  };

  const handleCreatePo = (e) => {
    e.preventDefault();
    const qty = parseInt(poForm.qty, 10) || 1;
    const rate = parseFloat(poForm.rate) || 1000;
    const subtotal = qty * rate;
    const total = subtotal * (1 + (parseFloat(poForm.taxRate) || 12) / 100);

    const newPo = {
      id: `PO-2026-${Math.floor(101 + Math.random() * 890)}`,
      date: new Date().toISOString().split('T')[0],
      vendor: poForm.vendor,
      department: poForm.dept,
      item: poForm.item,
      qty,
      unitPrice: rate,
      totalAmount: total,
      status: 'Pending Finance Approval',
      deliveryMilestone: '15 Days Net'
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setIsPoModalOpen(false);
    showToast(`Official Purchase Order ${newPo.id} created.`);
  };

  const handleApprovePo = (id) => {
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved & Issued' } : p));
    showToast(`Purchase Order ${id} electronically approved and emailed to supplier.`);
  };

  const handleCreateGrn = (e) => {
    e.preventDefault();
    const recQty = parseInt(grnForm.receivedQty, 10) || 1;
    const rejQty = parseInt(grnForm.rejectedQty, 10) || 0;
    const accQty = Math.max(0, recQty - rejQty);

    const newGrn = {
      id: `GRN-2026-${Math.floor(885 + Math.random() * 100)}`,
      date: new Date().toISOString().split('T')[0],
      poRef: grnForm.poRef,
      vendor: grnForm.vendor,
      invoiceNo: grnForm.invoiceNo || 'INV-TEMP-2026',
      itemReceived: grnForm.itemReceived || 'Biomedical Supplies',
      receivedQty: recQty,
      acceptedQty: accQty,
      rejectedQty: rejQty,
      batchNo: grnForm.batchNo || 'BAT-GEN-2026',
      expiryDate: grnForm.expiryDate || '2028-12-31',
      status: rejQty > 0 ? `Accepted with ${rejQty} Rejection(s)` : 'Accepted & Stock Updated',
      inspector: 'Chief Hospital Pharmacist / Biomedical Lead'
    };

    setGrnList([newGrn, ...grnList]);
    setIsGrnModalOpen(false);
    showToast(`GRN ${newGrn.id} recorded. Stock levels incremented.`);
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

      {/* SUBMODULE 26.1: Purchase Requisition (Indent) */}
      {activeSubtab === '26.1' && (
        <Card
          title="Purchase Requisition (Indent)"
          subtitle="Departmental purchase requests, capital asset proposals, priority tiering, and HOD approvals"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Indents:</span>
              <Badge variant="teal">{requisitions.length} Requisitions</Badge>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsRequisitionModalOpen(true)}>
              Raise Purchase Requisition
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Req ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Department</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Proposed Item & Spec</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>Est. Cost (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{req.id}</td>
                    <td style={{ padding: '8px 10px' }}>{req.date}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{req.dept}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '600' }}>{req.item}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{req.justification}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{req.qty}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>₹{req.estCost.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={req.priority === 'Urgent' ? 'danger' : req.priority === 'High' ? 'warning' : 'gray'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={req.status.includes('Approved') ? 'success' : 'teal'}>
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

      {/* SUBMODULE 26.2: Request for Quotation (RFQ) */}
      {activeSubtab === '26.2' && (
        <Card
          title="Request for Quotation (RFQ)"
          subtitle="Tender document issuance, technical specifications, vendor portal invitations, and tender submission deadlines"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Tenders:</span>
              <Badge variant="teal">{rfqs.length} Live RFQs</Badge>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsRfqModalOpen(true)}>
              Issue New Supplier RFQ
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.85rem' }}>{rfq.id}</span>
                  <Badge variant={rfq.status === 'Bidding Open' ? 'teal' : 'gray'}>{rfq.status}</Badge>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{rfq.title}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                  Category: <strong>{rfq.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '4px', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '8px' }}>
                  <span>Invited: {rfq.invitedVendors} Vendors • Bids: {rfq.bidsReceived}</span>
                  <span style={{ fontWeight: '700', color: '#D97706' }}>Deadline: {rfq.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 26.3: Vendor Quotation Comparison */}
      {activeSubtab === '26.3' && (
        <Card
          title="Vendor Quotation Comparison Matrix"
          subtitle="Side-by-side L1/L2 tender rate evaluation, commercial warranties, payment terms, and vendor selection"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Select RFQ to Compare:</span>
            <Select
              label=""
              value={selectedRfqForComparison}
              onChange={(e) => setSelectedRfqForComparison(e.target.value)}
              options={rfqs.map(r => ({ value: r.id, label: `${r.id}: ${r.title.slice(0, 48)}...` }))}
            />
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Empaneled Vendor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Quoted Brand / Model</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>Unit Rate (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Warranty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Payment Terms</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>L-Evaluation</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {(quoteComparisonData[selectedRfqForComparison] || []).map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: row.lScore.includes('L1') ? '#F0FDF4' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontWeight: '700' }}>{row.vendor}</td>
                    <td style={{ padding: '8px 10px' }}>{row.brand}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: row.lScore.includes('L1') ? '#166534' : 'inherit' }}>
                      ₹{row.unitRate.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 10px' }}>{row.warranty}</td>
                    <td style={{ padding: '8px 10px' }}>{row.paymentTerms}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={row.lScore.includes('L1') ? 'success' : 'gray'}>
                        {row.lScore}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Button
                        size="xs"
                        variant={row.lScore.includes('L1') ? 'primary' : 'outline'}
                        onClick={() => showToast(`Selected ${row.vendor} as preferred supplier. Generating PO...`)}
                      >
                        Select Supplier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 26.4: Purchase Order Creation & Approval */}
      {activeSubtab === '26.4' && (
        <Card
          title="Purchase Order (PO) Creation & Approval"
          subtitle="Legally binding purchase orders, multi-level management approvals, delivery milestones, and dispatch tracking"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Issued POs:</span>
              <Badge variant="teal">{purchaseOrders.length} Orders</Badge>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsPoModalOpen(true)}>
              Draft New Purchase Order
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>PO Number</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Supplier / Vendor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Item Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>Total Amount (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Approval Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{po.id}</td>
                    <td style={{ padding: '8px 10px' }}>{po.date}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{po.vendor}</td>
                    <td style={{ padding: '8px 10px' }}>{po.item}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{po.qty}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>₹{po.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={po.status.includes('Approved') ? 'success' : 'warning'}>
                        {po.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      {po.status.includes('Pending') ? (
                        <Button size="xs" variant="primary" icon={Check} onClick={() => handleApprovePo(po.id)}>
                          Approve PO
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>✓ Released</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 26.5: Goods Receipt Note (GRN) Inward Inspection */}
      {activeSubtab === '26.5' && (
        <Card
          title="Goods Receipt Note (GRN) Inward Inspection"
          subtitle="Gate entry receipt, physical quality inspection, batch tracking, damaged goods quarantine, and GRN authorization"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Recorded Inward Consignments:</span>
              <Badge variant="teal">{grnList.length} GRNs</Badge>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsGrnModalOpen(true)}>
              Record Inward Consignment (GRN)
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>GRN Ref</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Inward Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>PO & Supplier</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Item Consignment</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Rec / Acc / Rej</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Batch & Expiry</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>QA Status</th>
                </tr>
              </thead>
              <tbody>
                {grnList.map((grn) => (
                  <tr key={grn.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{grn.id}</td>
                    <td style={{ padding: '8px 10px' }}>{grn.date}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '600' }}>{grn.vendor}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>PO: {grn.poRef} • Inv: {grn.invoiceNo}</div>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{grn.itemReceived}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontWeight: '700' }}>{grn.receivedQty}</span> / <span style={{ color: '#16A34A', fontWeight: '700' }}>{grn.acceptedQty}</span> / <span style={{ color: grn.rejectedQty > 0 ? '#DC2626' : 'var(--color-text-muted)' }}>{grn.rejectedQty}</span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '600' }}>{grn.batchNo}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Exp: {grn.expiryDate}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={grn.rejectedQty > 0 ? 'warning' : 'success'}>
                        {grn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: New Requisition */}
      <Modal isOpen={isRequisitionModalOpen} onClose={() => setIsRequisitionModalOpen(false)} title="Raise Departmental Purchase Requisition (Indent)">
        <form onSubmit={handleCreateRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Requesting Department"
            value={reqForm.dept}
            onChange={(e) => setReqForm({ ...reqForm, dept: e.target.value })}
            options={[
              { value: 'Intensive Care Unit (ICU)', label: 'Intensive Care Unit (ICU)' },
              { value: 'Operation Theatre Complex', label: 'Operation Theatre Complex' },
              { value: 'Central Pathology Laboratory', label: 'Central Pathology Laboratory' },
              { value: 'Emergency & Trauma Department', label: 'Emergency & Trauma Department' },
              { value: 'Radiology & Imaging', label: 'Radiology & Imaging' }
            ]}
          />
          <Input
            label="Required Item Name & Specification"
            placeholder="e.g. Multipara Vital Signs Monitor 12-inch"
            value={reqForm.item}
            onChange={(e) => setReqForm({ ...reqForm, item: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={reqForm.qty}
              onChange={(e) => setReqForm({ ...reqForm, qty: e.target.value })}
              required
            />
            <Input
              label="Estimated Cost (₹)"
              type="number"
              placeholder="e.g. 150000"
              value={reqForm.estCost}
              onChange={(e) => setReqForm({ ...reqForm, estCost: e.target.value })}
              required
            />
          </div>
          <Select
            label="Clinical Urgency Priority"
            value={reqForm.priority}
            onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}
            options={[
              { value: 'Normal', label: 'Normal (Planned Replenishment)' },
              { value: 'High', label: 'High (Buffer Depleting)' },
              { value: 'Urgent', label: 'Urgent (Emergency Life-Support / Critical)' }
            ]}
          />
          <Input
            label="Clinical / Operational Justification"
            placeholder="Reason for purchase"
            value={reqForm.justification}
            onChange={(e) => setReqForm({ ...reqForm, justification: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRequisitionModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Indent</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New RFQ */}
      <Modal isOpen={isRfqModalOpen} onClose={() => setIsRfqModalOpen(false)} title="Issue Request for Quotation (RFQ Tender)">
        <form onSubmit={handleCreateRfq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Procurement Category"
            value={rfqForm.category}
            onChange={(e) => setRfqForm({ ...rfqForm, category: e.target.value })}
            options={[
              { value: 'Biomedical Capital Equipment', label: 'Biomedical Capital Equipment' },
              { value: 'Hospital Surgical Consumables', label: 'Hospital Surgical Consumables' },
              { value: 'Pharmaceutical Formulation Bulk Supply', label: 'Pharmaceutical Formulation Bulk Supply' },
              { value: 'IT Infrastructure & Hardware', label: 'IT Infrastructure & Hardware' }
            ]}
          />
          <Input
            label="RFQ Tender Title & Scope"
            placeholder="e.g. Annual Rate Contract for Laparoscopic Trocars"
            value={rfqForm.title}
            onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Number of Invited Vendors"
              type="number"
              value={rfqForm.invitedVendors}
              onChange={(e) => setRfqForm({ ...rfqForm, invitedVendors: e.target.value })}
            />
            <Input
              label="Bidding Submission Deadline"
              type="date"
              value={rfqForm.deadline}
              onChange={(e) => setRfqForm({ ...rfqForm, deadline: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRfqModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Publish RFQ</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Draft PO */}
      <Modal isOpen={isPoModalOpen} onClose={() => setIsPoModalOpen(false)} title="Draft Formal Purchase Order (PO)">
        <form onSubmit={handleCreatePo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Supplier / Vendor Entity"
            value={poForm.vendor}
            onChange={(e) => setPoForm({ ...poForm, vendor: e.target.value })}
            required
          />
          <Input
            label="Target Hospital Department"
            value={poForm.dept}
            onChange={(e) => setPoForm({ ...poForm, dept: e.target.value })}
            required
          />
          <Input
            label="Item Description"
            value={poForm.item}
            onChange={(e) => setPoForm({ ...poForm, item: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="Quantity"
              type="number"
              value={poForm.qty}
              onChange={(e) => setPoForm({ ...poForm, qty: e.target.value })}
              required
            />
            <Input
              label="Unit Rate (₹)"
              type="number"
              value={poForm.rate}
              onChange={(e) => setPoForm({ ...poForm, rate: e.target.value })}
              required
            />
            <Input
              label="GST %"
              type="number"
              value={poForm.taxRate}
              onChange={(e) => setPoForm({ ...poForm, taxRate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsPoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New GRN */}
      <Modal isOpen={isGrnModalOpen} onClose={() => setIsGrnModalOpen(false)} title="Record Goods Receipt Note (GRN Inward Consignment)">
        <form onSubmit={handleCreateGrn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Purchase Order Ref"
              placeholder="e.g. PO-2026-001"
              value={grnForm.poRef}
              onChange={(e) => setGrnForm({ ...grnForm, poRef: e.target.value })}
              required
            />
            <Input
              label="Supplier / Vendor Name"
              value={grnForm.vendor}
              onChange={(e) => setGrnForm({ ...grnForm, vendor: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Vendor Invoice / Delivery Challan #"
              placeholder="e.g. INV-9941"
              value={grnForm.invoiceNo}
              onChange={(e) => setGrnForm({ ...grnForm, invoiceNo: e.target.value })}
              required
            />
            <Input
              label="Item Consignment"
              placeholder="e.g. Reagents / Consumables"
              value={grnForm.itemReceived}
              onChange={(e) => setGrnForm({ ...grnForm, itemReceived: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Received Qty"
              type="number"
              value={grnForm.receivedQty}
              onChange={(e) => setGrnForm({ ...grnForm, receivedQty: e.target.value })}
              required
            />
            <Input
              label="Rejected / Damaged Qty"
              type="number"
              value={grnForm.rejectedQty}
              onChange={(e) => setGrnForm({ ...grnForm, rejectedQty: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Batch / Lot Number"
              placeholder="e.g. BAT-2026-X1"
              value={grnForm.batchNo}
              onChange={(e) => setGrnForm({ ...grnForm, batchNo: e.target.value })}
              required
            />
            <Input
              label="Expiry Date"
              type="date"
              value={grnForm.expiryDate}
              onChange={(e) => setGrnForm({ ...grnForm, expiryDate: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsGrnModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Authorize GRN Inward</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
