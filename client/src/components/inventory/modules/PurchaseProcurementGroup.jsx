import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Calculator,
  ShoppingBag,
  Truck,
  Check,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_PURCHASE_ORDERS } from '../inventoryMockData';

export function PurchaseProcurementGroup({ activeSubtab = '26.1', onNavigateSubmodule: _onNavigateSubmodule }) {
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
      justification: 'Quarterly thyroid & tumor marker antibody kit'
    }
  ]);

  // RFQ Tenders (26.2)
  const [rfqList, setRfqList] = useState([
    {
      id: 'RFQ-2026-033',
      title: 'High-End Biomedical Multipara Monitors & Defibrillators',
      category: 'Biomedical Capital Equipment',
      invitedVendors: 'Medtronic, Philips Healthcare, Mindray India',
      bidsReceived: 3,
      deadline: '2026-10-28',
      status: 'Quotes Received (Ready for Comparison)',
      budgetCeiling: 350000
    },
    {
      id: 'RFQ-2026-034',
      title: 'Annual Consumables Supply Contract: Infusion Solutions & IV Sets',
      category: 'Hospital Consumables',
      invitedVendors: 'B. Braun Medical, Baxter Healthcare, Fresenius Kabi',
      bidsReceived: 2,
      deadline: '2026-11-04',
      status: 'Tender Open (Awaiting Bids)',
      budgetCeiling: 500000
    }
  ]);

  // GRN Inward Inspection (26.5)
  const [grnList, setGrnList] = useState([
    {
      id: 'GRN-2026-088',
      poRef: 'PO-2026-046',
      vendor: 'B. Braun Medical India Pvt Ltd',
      invoiceNo: 'INV-BB-89102',
      gatePassNo: 'GP-2026-1104',
      itemDescription: 'IV Infusion Sets with Air Vent & 15 Micron Filter',
      orderedQty: 500,
      receivedQty: 500,
      acceptedQty: 495,
      rejectedQty: 5,
      rejectionReason: 'Damaged sterile packaging box during transit',
      inspectionResult: 'Passed QC Inspection',
      inspectedBy: 'Quality Officer Anand Mohan',
      status: 'Stock Accepted into Warehouse'
    },
    {
      id: 'GRN-2026-089',
      poRef: 'PO-2026-044',
      vendor: 'Apollo Medisurg Supplies LLP',
      invoiceNo: 'INV-AP-44019',
      gatePassNo: 'GP-2026-1110',
      itemDescription: 'Sterile Surgical Gloves 7.5 & Vicryl Sutures',
      orderedQty: 250,
      receivedQty: 250,
      acceptedQty: 250,
      rejectedQty: 0,
      rejectionReason: 'None',
      inspectionResult: 'Passed QC Inspection',
      inspectedBy: 'Store Officer B. Ramesh',
      status: 'Stock Accepted into Warehouse'
    }
  ]);

  // Modals state
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isNewRfqModalOpen, setIsNewRfqModalOpen] = useState(false);

  // Forms state
  const [newPoForm, setNewPoForm] = useState({
    vendorName: 'Apollo Medisurg Supplies LLP',
    amount: '75000',
    dueDate: '2026-11-10',
    paymentTerms: 'Net 30 Days'
  });

  const [reqForm, setReqForm] = useState({
    dept: 'Intensive Care Unit (ICU)',
    item: '',
    qty: 1,
    estCost: '50000',
    priority: 'High',
    justification: ''
  });

  const [rfqForm, setRfqForm] = useState({
    title: '',
    category: 'Biomedical Capital Equipment',
    invitedVendors: 'Philips, GE Healthcare, Siemens Healthineers',
    deadline: '2026-11-15',
    budgetCeiling: '250000'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreatePo = (e) => {
    e.preventDefault();
    const newPo = {
      id: `PO-2026-${40 + purchaseOrders.length + 1}`,
      poDate: new Date().toISOString().split('T')[0],
      vendorName: newPoForm.vendorName,
      rfqRef: `RFQ-2026-0${35 + purchaseOrders.length}`,
      totalAmount: Number(newPoForm.amount) || 50000,
      deliveryDueDate: newPoForm.dueDate,
      approvedBy: 'Pending Approval',
      status: 'Pending Approval',
      paymentTerms: newPoForm.paymentTerms
    };
    setPurchaseOrders([newPo, ...purchaseOrders]);
    setIsNewPoModalOpen(false);
    showToast(`Purchase Order ${newPo.id} generated! Sent to Finance for signoff.`);
  };

  const handleApprovePo = (poId) => {
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Approved & Dispatched', approvedBy: 'Medical Director Dr. K. N. Sen' } : p));
    showToast(`Purchase Order ${poId} approved and dispatched to vendor.`);
  };

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    if (!reqForm.item) return;
    const newReq = {
      id: `PR-2026-${104 + requisitions.length}`,
      date: new Date().toISOString().split('T')[0],
      dept: reqForm.dept,
      item: reqForm.item,
      qty: Number(reqForm.qty) || 1,
      estCost: Number(reqForm.estCost) || 20000,
      priority: reqForm.priority,
      status: 'Approved by HOD',
      justification: reqForm.justification || 'Department requirement'
    };
    setRequisitions([newReq, ...requisitions]);
    setIsNewReqModalOpen(false);
    showToast(`Purchase Requisition ${newReq.id} recorded!`);
  };

  const handleCreateRfq = (e) => {
    e.preventDefault();
    if (!rfqForm.title) return;
    const newRfq = {
      id: `RFQ-2026-0${35 + rfqList.length}`,
      title: rfqForm.title,
      category: rfqForm.category,
      invitedVendors: rfqForm.invitedVendors,
      bidsReceived: 0,
      deadline: rfqForm.deadline,
      status: 'Tender Open (Awaiting Bids)',
      budgetCeiling: Number(rfqForm.budgetCeiling) || 100000
    };
    setRfqList([newRfq, ...rfqList]);
    setIsNewRfqModalOpen(false);
    showToast(`RFQ Tender ${newRfq.id} issued to invited suppliers!`);
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

      {/* SUBMODULE 26.1: Purchase Requisition (Indent) */}
      {activeSubtab === '26.1' && (
        <Card
          title="Hospital Purchase Requisition (Indent) Portal"
          subtitle="Annual CAPEX / OPEX department purchase indents, justification notes, and budget validation"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewReqModalOpen(true)}>
              Raise Purchase Requisition
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
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Material / Equipment Scope</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Qty</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Est. Budget</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Priority</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{req.id}</td>
                    <td style={{ padding: '10px 14px' }}>{req.date}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{req.dept}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{req.item}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{req.justification}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{req.qty}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{req.estCost.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.priority === 'Urgent' ? 'danger' : req.priority === 'High' ? 'warning' : 'teal'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">{req.status}</Badge>
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
          title="Request for Quotation (RFQ) & Vendor Tenders"
          subtitle="Generate item specification RFQ tenders, invite registered suppliers, and set submission deadlines"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewRfqModalOpen(true)}>
              Issue New RFQ Tender
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {rfqList.map((rfq) => (
              <div key={rfq.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.9rem' }}>{rfq.id}</span>
                    <Badge variant="teal">{rfq.category}</Badge>
                    <Badge variant={rfq.bidsReceived >= 3 ? 'success' : 'warning'}>
                      {rfq.bidsReceived} Quotes Received
                    </Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{rfq.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Invited Vendors: <strong>{rfq.invitedVendors}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Bid Deadline: <strong>{rfq.deadline}</strong> • Budget Ceiling: <strong>₹{rfq.budgetCeiling.toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showToast(`Exported vendor bid summary for ${rfq.id}`)}
                  >
                    View Vendor Dossiers
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      showToast(`Evaluating quotes for ${rfq.id}. Ready for L1 Comparison.`);
                    }}
                  >
                    Open Comparative Analysis
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 26.3: Vendor Quotation Comparison */}
      {activeSubtab === '26.3' && (
        <Card
          title="Side-by-Side Vendor Quotation Comparative Statement"
          subtitle="Comparative financial rate evaluation, L1 lowest-bidder determination, warranty, and payment terms"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Supplier</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Quoted Base Rate</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>GST / Freight</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Total Landed Cost</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Warranty</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Credit Terms</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Bid Rank</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: '#F0FDF4' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '700' }}>Apollo Medisurg Supplies</td>
                  <td style={{ padding: '10px 14px' }}>₹1,65,000</td>
                  <td style={{ padding: '10px 14px' }}>₹19,500 (12% GST)</td>
                  <td style={{ padding: '10px 14px', fontWeight: '800', color: '#166534' }}>₹1,84,500</td>
                  <td style={{ padding: '10px 14px' }}>2 Years Comprehensive</td>
                  <td style={{ padding: '10px 14px' }}>Net 30 Days</td>
                  <td style={{ padding: '10px 14px' }}><Badge variant="success">L1 Winner</Badge></td>
                  <td style={{ padding: '10px 14px' }}>
                    <Button size="sm" variant="primary" onClick={() => showToast('Selected L1 Bidder: Apollo Medisurg. Ready to raise PO.')}>
                      Select L1 & Draft PO
                    </Button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Medtronic India Div</td>
                  <td style={{ padding: '10px 14px' }}>₹1,80,000</td>
                  <td style={{ padding: '10px 14px' }}>₹21,600 (12% GST)</td>
                  <td style={{ padding: '10px 14px' }}>₹2,01,600</td>
                  <td style={{ padding: '10px 14px' }}>3 Years Comprehensive</td>
                  <td style={{ padding: '10px 14px' }}>15 Days</td>
                  <td style={{ padding: '10px 14px' }}><Badge variant="gray">L2 Bidder</Badge></td>
                  <td style={{ padding: '10px 14px' }}>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>Mindray India Diagnostics</td>
                  <td style={{ padding: '10px 14px' }}>₹1,95,000</td>
                  <td style={{ padding: '10px 14px' }}>₹23,400 (12% GST)</td>
                  <td style={{ padding: '10px 14px' }}>₹2,18,400</td>
                  <td style={{ padding: '10px 14px' }}>2 Years Standard</td>
                  <td style={{ padding: '10px 14px' }}>Advance 20%</td>
                  <td style={{ padding: '10px 14px' }}><Badge variant="gray">L3 Bidder</Badge></td>
                  <td style={{ padding: '10px 14px' }}>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 26.4: Purchase Order (PO) Creation & Approval */}
      {activeSubtab === '26.4' && (
        <Card
          title="Purchase Order (PO) Authoring & Multi-Tier Approval"
          subtitle="Commercial purchase contracts, delivery terms, HSN code billing, and medical director authorization"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewPoModalOpen(true)}>
              Draft Purchase Order
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>PO Number</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>PO Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Vendor / Supplier</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Total Amount</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Delivery Due</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Terms</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{po.id}</td>
                    <td style={{ padding: '10px 14px' }}>{po.poDate}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{po.vendorName}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{po.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>{po.deliveryDueDate}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{po.paymentTerms}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={po.status.includes('Approved') ? 'success' : po.status.includes('Accepted') ? 'teal' : 'warning'}>
                        {po.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {po.status === 'Pending Approval' ? (
                        <Button size="sm" variant="primary" icon={Check} onClick={() => handleApprovePo(po.id)}>
                          Approve PO
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => showToast(`Printing official PO copy for ${po.id}...`)}>
                          Print PO PDF
                        </Button>
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
          title="Goods Receipt Note (GRN) & Inward Quality Inspection"
          subtitle="Gate security entry, barcode batch acceptance, transit defect quarantine, and warehouse ledger credit"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {grnList.map((grn) => (
              <div key={grn.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.95rem' }}>{grn.id}</span>
                    <Badge variant="teal">Ref PO: {grn.poRef}</Badge>
                    <Badge variant="success">{grn.status}</Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Gate Pass: <strong>{grn.gatePassNo}</strong> • Invoice: <strong>{grn.invoiceNo}</strong>
                  </div>
                </div>

                <div style={{ fontWeight: '700', marginTop: '8px' }}>{grn.itemDescription}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Supplier: <strong>{grn.vendor}</strong> • Inspector: <strong>{grn.inspectedBy}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)' }}>
                  <div>Ordered: <strong>{grn.orderedQty} units</strong></div>
                  <div>Received: <strong>{grn.receivedQty} units</strong></div>
                  <div style={{ color: 'var(--color-success)', fontWeight: '700' }}>Accepted QC: {grn.acceptedQty} units</div>
                  <div style={{ color: grn.rejectedQty > 0 ? 'var(--color-error)' : 'inherit', fontWeight: '700' }}>
                    Rejected: {grn.rejectedQty} units {grn.rejectedQty > 0 && `(${grn.rejectionReason})`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New Purchase Requisition */}
      <Modal
        isOpen={isNewReqModalOpen}
        onClose={() => setIsNewReqModalOpen(false)}
        title="Raise Department Purchase Indent"
        subtitle="Forward requisition to Procurement and Materials Management"
      >
        <form onSubmit={handleCreateRequisition} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Requesting Department"
            value={reqForm.dept}
            onChange={(e) => setReqForm({ ...reqForm, dept: e.target.value })}
            options={[
              'Intensive Care Unit (ICU)',
              'Operation Theatre Complex',
              'Central Pathology Laboratory',
              'Emergency Trauma Care',
              'Radiology & PACS'
            ]}
          />
          <Input
            label="Material / Equipment Name"
            required
            placeholder="e.g. Syringe Infusion Pump Dual Channel"
            value={reqForm.item}
            onChange={(e) => setReqForm({ ...reqForm, item: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Quantity Required"
              type="number"
              value={reqForm.qty}
              onChange={(e) => setReqForm({ ...reqForm, qty: e.target.value })}
            />
            <Input
              label="Estimated Cost (₹)"
              type="number"
              value={reqForm.estCost}
              onChange={(e) => setReqForm({ ...reqForm, estCost: e.target.value })}
            />
          </div>
          <Select
            label="Priority Urgency"
            value={reqForm.priority}
            onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}
            options={['Normal', 'High', 'Urgent']}
          />
          <Input
            label="Clinical Justification Note"
            placeholder="Reason for purchase / patient care justification"
            value={reqForm.justification}
            onChange={(e) => setReqForm({ ...reqForm, justification: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewReqModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Purchase Indent</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New RFQ Tender */}
      <Modal
        isOpen={isNewRfqModalOpen}
        onClose={() => setIsNewRfqModalOpen(false)}
        title="Issue Request for Quotation (RFQ) Tender"
        subtitle="Invite competitive bids from pre-qualified hospital vendors"
      >
        <form onSubmit={handleCreateRfq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Tender Scope / Title"
            required
            placeholder="e.g. Supply of Sterile Surgical Drapes and Gowns"
            value={rfqForm.title}
            onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
          />
          <Select
            label="Material Category"
            value={rfqForm.category}
            onChange={(e) => setRfqForm({ ...rfqForm, category: e.target.value })}
            options={[
              'Biomedical Capital Equipment',
              'Hospital Consumables',
              'Pharmaceutical Formulary',
              'Diagnostic Lab Reagents'
            ]}
          />
          <Input
            label="Invited Vendor Names (Comma separated)"
            value={rfqForm.invitedVendors}
            onChange={(e) => setRfqForm({ ...rfqForm, invitedVendors: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Submission Deadline"
              type="date"
              value={rfqForm.deadline}
              onChange={(e) => setRfqForm({ ...rfqForm, deadline: e.target.value })}
            />
            <Input
              label="Budget Ceiling (₹)"
              type="number"
              value={rfqForm.budgetCeiling}
              onChange={(e) => setRfqForm({ ...rfqForm, budgetCeiling: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewRfqModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Issue RFQ Tender</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Purchase Order */}
      <Modal
        isOpen={isNewPoModalOpen}
        onClose={() => setIsNewPoModalOpen(false)}
        title="Author Purchase Order (PO)"
        subtitle="Specify contract commercials, vendor, and delivery milestone"
      >
        <form onSubmit={handleCreatePo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Supplier / Vendor"
            value={newPoForm.vendorName}
            onChange={(e) => setNewPoForm({ ...newPoForm, vendorName: e.target.value })}
            options={[
              'Apollo Medisurg Supplies LLP',
              'Medtronic India Diagnostic Div',
              'B. Braun Medical India Pvt Ltd',
              'Baxter Healthcare India',
              'Roche Diagnostics India'
            ]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Total Purchase Value (₹)"
              type="number"
              value={newPoForm.amount}
              onChange={(e) => setNewPoForm({ ...newPoForm, amount: e.target.value })}
            />
            <Input
              label="Delivery Due Date"
              type="date"
              value={newPoForm.dueDate}
              onChange={(e) => setNewPoForm({ ...newPoForm, dueDate: e.target.value })}
            />
          </div>
          <Select
            label="Commercial Payment Terms"
            value={newPoForm.paymentTerms}
            onChange={(e) => setNewPoForm({ ...newPoForm, paymentTerms: e.target.value })}
            options={['Net 30 Days', 'Immediate RTGS', '10% Advance, 90% against GRN', 'Against Delivery Bill']}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewPoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate PO & Route for Approval</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
