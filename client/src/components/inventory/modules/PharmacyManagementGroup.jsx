import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Pill,
  BookOpen,
  Clock,
  Package,
  Plus,
  Search,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_PHARMACY_BATCHES } from '../inventoryMockData';

export function PharmacyManagementGroup({ activeSubtab = '25.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [batches, setBatches] = useState(INITIAL_PHARMACY_BATCHES);
  const [notification, setNotification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 25.1: e-Prescriptions queue
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX-2026-9921',
      date: '2026-10-25 09:30 AM',
      type: 'IPD Inpatient',
      uhid: 'UHID-2026-0412',
      patientName: 'Rameshwar Teli',
      wardBed: 'General Ward - BED-101',
      doctor: 'Dr. Arindam Mitra',
      items: [
        { drug: 'Augmentin 625mg Tablet', qty: 10, batch: 'AG-9821', price: 21.55 },
        { drug: 'Pantoprazole 40mg IV Injection', qty: 5, batch: 'PT-1102', price: 62.00 }
      ],
      totalAmount: 525.50,
      allergyWarning: 'No Known Drug Allergies',
      status: 'Pending Dispensing'
    },
    {
      id: 'RX-2026-9922',
      date: '2026-10-25 09:45 AM',
      type: 'OPD Outpatient',
      uhid: 'UHID-2026-0814',
      patientName: 'Devika Sengupta',
      wardBed: 'OPD General Medicine Desk 1',
      doctor: 'Dr. Arindam Mitra',
      items: [
        { drug: 'Paracetamol 650mg (Dolo)', qty: 15, batch: 'DL-7782', price: 3.40 },
        { drug: 'Azithromycin 500mg Tablet', qty: 5, batch: 'AZ-4410', price: 24.00 }
      ],
      totalAmount: 171.00,
      allergyWarning: 'Penicillin Allergy Flagged',
      status: 'Pending Dispensing'
    }
  ]);

  // 25.4: Medicine Returns list
  const [returnsList, setReturnsList] = useState([
    {
      id: 'CRN-2026-904',
      date: '2026-10-24',
      uhid: 'UHID-2026-0681',
      patientName: 'Ananya Mukherjee',
      bedNumber: 'BED-201 (Private AC)',
      drugName: 'Meropenem 1g IV Injection',
      batchNo: 'MR-2109',
      returnQty: 2,
      refundAmount: 3700.00,
      reason: 'Discharged early; IV antibiotics stepped down to oral',
      condition: 'Sealed Vial Intact & Cold Chain Verified',
      status: 'Credited to IPD Ledger & Restocked'
    },
    {
      id: 'CRN-2026-905',
      date: '2026-10-23',
      uhid: 'UHID-2026-0518',
      patientName: 'Sanjay Deshmukh',
      bedNumber: 'BED-103 (Male Ward)',
      drugName: 'Pantoprazole 40mg IV Injection',
      batchNo: 'PT-1102',
      returnQty: 4,
      refundAmount: 248.00,
      reason: 'Physician discontinued IV order',
      condition: 'Intact Vials',
      status: 'Credited to IPD Ledger & Restocked'
    }
  ]);

  // 25.5: Pharmacy Reorder Alerts
  const [reorderAlerts, setReorderAlerts] = useState([
    {
      id: 'RA-01',
      drugName: 'Meropenem 1g IV Injection',
      salt: 'Meropenem Trihydrate 1g',
      category: 'Critical Reserve Antibiotic',
      currentStock: 42,
      minLevel: 80,
      dailyConsumption: 14,
      daysCover: 3,
      leadTime: '24 Hours',
      suggestedIndentQty: 100,
      status: 'Critical Low Stock'
    },
    {
      id: 'RA-02',
      drugName: 'Azithromycin 500mg Tablet',
      salt: 'Azithromycin Dihydrate 500mg',
      category: 'Macrolide Antibiotic',
      currentStock: 95,
      minLevel: 200,
      dailyConsumption: 25,
      daysCover: 4,
      leadTime: '48 Hours',
      suggestedIndentQty: 300,
      status: 'Reorder Buffer Breached'
    },
    {
      id: 'RA-03',
      drugName: 'Paracetamol 650mg (Dolo)',
      salt: 'Paracetamol 650mg IP',
      category: 'Analgesic / Antipyretic',
      currentStock: 1800,
      minLevel: 500,
      dailyConsumption: 120,
      daysCover: 15,
      leadTime: '48 Hours',
      suggestedIndentQty: 1000,
      status: 'Healthy Stock Level'
    }
  ]);

  // Modals state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isIndentModalOpen, setIsIndentModalOpen] = useState(false);

  // Return Form
  const [returnForm, setReturnForm] = useState({
    uhid: 'UHID-2026-0412',
    patientName: 'Rameshwar Teli',
    bedNumber: 'BED-101',
    drugName: 'Augmentin 625mg (Amoxycillin + Clavulanic Acid)',
    returnQty: '5',
    reason: 'Patient discharged; unused blister packs returned'
  });

  const [indentForm, setIndentForm] = useState({
    drugName: 'Meropenem 1g IV Injection',
    qty: '100',
    urgency: 'STAT Critical',
    remarks: 'ICU septic shock consumption spike'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDispenseRx = (rxId) => {
    setPrescriptions(prev => prev.map(p => p.id === rxId ? { ...p, status: 'Dispensed & Invoiced' } : p));
    showToast(`Prescription ${rxId} dispensed! Charged to patient billing ledger.`);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    const qty = Number(returnForm.returnQty) || 5;
    const newCrn = {
      id: `CRN-2026-90${6 + returnsList.length}`,
      date: new Date().toISOString().split('T')[0],
      uhid: returnForm.uhid,
      patientName: returnForm.patientName,
      bedNumber: returnForm.bedNumber,
      drugName: returnForm.drugName,
      batchNo: 'AG-9821',
      returnQty: qty,
      refundAmount: qty * 21.55,
      reason: returnForm.reason,
      condition: 'Sealed & Intact',
      status: 'Credited to IPD Ledger & Restocked'
    };

    setReturnsList([newCrn, ...returnsList]);
    setIsReturnModalOpen(false);
    showToast(`Credit Note ${newCrn.id} issued for ₹${newCrn.refundAmount.toFixed(2)}. Restocked into dispensary!`);
  };

  const handleCreateIndent = (e) => {
    e.preventDefault();
    setIsIndentModalOpen(false);
    showToast(`Pharmacy Internal Indent generated for ${indentForm.qty} units of ${indentForm.drugName}!`);
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

      {/* SUBMODULE 25.1: Prescription Dispensing (OPD & IPD) */}
      {activeSubtab === '25.1' && (
        <Card
          title="Electronic Prescription Dispensing Counter (OPD & IPD)"
          subtitle="Verification of physician orders, barcode batch matching, allergy contraindications, and bill settlement"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {prescriptions.map((rx) => (
              <div key={rx.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.92rem' }}>{rx.id}</span>
                    <Badge variant="teal">{rx.type}</Badge>
                    <Badge variant={rx.status.includes('Dispensed') ? 'success' : 'warning'}>{rx.status}</Badge>
                  </div>

                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '6px' }}>
                    {rx.patientName} ({rx.uhid}) • {rx.wardBed}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Prescriber: <strong>{rx.doctor}</strong> • Prescribed: {rx.date}
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {rx.items.map((itm, idx) => (
                      <span key={idx} style={{ padding: '3px 8px', backgroundColor: '#F3F4F6', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600' }}>
                        {itm.drug} (x{itm.qty})
                      </span>
                    ))}
                  </div>

                  {rx.allergyWarning.includes('Allergy') && (
                    <div style={{ marginTop: '6px', fontSize: '0.74rem', color: 'var(--color-error)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} />
                      {rx.allergyWarning}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginBottom: '8px' }}>
                    ₹{rx.totalAmount.toFixed(2)}
                  </div>
                  {rx.status.includes('Dispensed') ? (
                    <div style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} />
                      Dispensed & Billed
                    </div>
                  ) : (
                    <Button size="sm" variant="primary" icon={Pill} onClick={() => handleDispenseRx(rx.id)}>
                      Dispense & Charge to Ledger
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 25.2: Medicine Master & Salt Information */}
      {activeSubtab === '25.2' && (
        <Card
          title="Hospital Medicine Master & Generic Salt Formulary"
          subtitle="National Essential Medicines List (NLEI), active generic salts, drug interactions, and schedule H1 flags"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Brand Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Active Generic Salt</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Manufacturer</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>MRP (₹)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Unit Cost</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Current Stock</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{b.drugName}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{b.salt}</td>
                    <td style={{ padding: '10px 14px' }}>{b.mfc}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{b.mrp.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px' }}>₹{b.unitRate.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{b.stockQty}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={b.status.includes('Near Expiry') ? 'danger' : 'teal'}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 25.3: FIFO Batch & Expiry Management */}
      {activeSubtab === '25.3' && (
        <Card
          title="FIFO Batch Allocation & Near-Expiry Quarantine"
          subtitle="First-in first-out automated dispensing pick, 90-day expiry threshold monitoring, and vendor return logs"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {batches.map((b) => (
              <div key={b.id} style={{ padding: '16px', border: `1.5px solid ${b.status.includes('Near Expiry') ? '#FCA5A5' : 'var(--color-border-subtle)'}`, backgroundColor: b.status.includes('Near Expiry') ? '#FEF2F2' : '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{b.drugName}</div>
                  <Badge variant={b.status.includes('Near Expiry') ? 'danger' : 'success'}>
                    Batch {b.batchNo}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Expiry: <strong>{b.expiryDate}</strong> • Stock Available: <strong>{b.stockQty} units</strong>
                </div>
                {b.status.includes('Near Expiry') ? (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: '700' }}>
                      ⚠️ 60 Days to Expiry (Quarantine recommended)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showToast(`Batch ${b.batchNo} moved to near-expiry quarantine shelf.`)}
                    >
                      Quarantine Batch
                    </Button>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: '600' }}>
                    ✓ Safe shelf life (&gt;18 months remaining)
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 25.4: IPD Unused Medicine Return & Credit */}
      {activeSubtab === '25.4' && (
        <Card
          title="IPD Unused Medicine Return & Patient Credit Note"
          subtitle="Return of sealed unused blister packs upon patient discharge and automated credit ledger reversal"
          action={
            <Button variant="primary" icon={RotateCcw} size="sm" onClick={() => setIsReturnModalOpen(true)}>
              Process Ward Return & Credit Note
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Credit Note #</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient / Ward</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Returned Medication</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Qty Returned</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Refund Credit (₹)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Quality Check</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnsList.map((ret) => (
                  <tr key={ret.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{ret.id}</td>
                    <td style={{ padding: '10px 14px' }}>{ret.date}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{ret.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{ret.bedNumber}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: '600' }}>{ret.drugName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Batch: {ret.batchNo}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{ret.returnQty}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-success)' }}>
                      ₹{ret.refundAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="success">{ret.condition}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">{ret.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 25.5: Pharmacy Stock Indents & Reorder Alerts */}
      {activeSubtab === '25.5' && (
        <Card
          title="Pharmacy Stock Indents & High-Velocity Reorder Alerts"
          subtitle="Safety buffer reorder automation, warehouse internal indents, and fast-moving hospital formulary stock"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsIndentModalOpen(true)}>
              Create Warehouse Store Indent
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reorderAlerts.map((ra) => (
              <div key={ra.id} style={{ padding: '16px', border: `1.5px solid ${ra.status.includes('Critical') ? '#FCA5A5' : 'var(--color-border-subtle)'}`, backgroundColor: ra.status.includes('Critical') ? '#FFFBEB' : '#FFFFFF', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.92rem' }}>{ra.drugName}</span>
                    <Badge variant={ra.status.includes('Critical') ? 'danger' : ra.status.includes('Breached') ? 'warning' : 'success'}>
                      {ra.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Generic Salt: {ra.salt} • Class: {ra.category}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Daily Consumption: <strong>{ra.dailyConsumption} units/day</strong> • Lead Time: <strong>{ra.leadTime}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>STOCK DEFICIT</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: ra.currentStock <= ra.minLevel ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {ra.currentStock} / {ra.minLevel} units ({ra.daysCover} days cover)
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      showToast(`Automated Warehouse Indent raised for ${ra.suggestedIndentQty} units of ${ra.drugName}!`);
                    }}
                  >
                    Indent {ra.suggestedIndentQty} Units
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Process Medicine Return */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Inpatient Unused Medication Return"
        subtitle="Restock undamaged sealed pharmaceuticals and issue credit note"
      >
        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Name"
              value={returnForm.patientName}
              onChange={(e) => setReturnForm({ ...returnForm, patientName: e.target.value })}
            />
            <Input
              label="UHID / Bed Number"
              value={`${returnForm.uhid} (${returnForm.bedNumber})`}
              onChange={(e) => setReturnForm({ ...returnForm, bedNumber: e.target.value })}
            />
          </div>

          <Select
            label="Select Medication to Return"
            value={returnForm.drugName}
            onChange={(e) => setReturnForm({ ...returnForm, drugName: e.target.value })}
            options={batches.map(b => b.drugName)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Quantity Returned"
              type="number"
              required
              value={returnForm.returnQty}
              onChange={(e) => setReturnForm({ ...returnForm, returnQty: e.target.value })}
            />
            <Select
              label="Packaging Condition"
              options={['Sealed & Intact', 'Blister Intact (Non-refrigerated)', 'Cold Chain Maintained']}
            />
          </div>

          <Input
            label="Return Reason"
            value={returnForm.reason}
            onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Verify Restock & Issue Credit Note</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Warehouse Indent */}
      <Modal
        isOpen={isIndentModalOpen}
        onClose={() => setIsIndentModalOpen(false)}
        title="Raise Warehouse Stock Indent"
        subtitle="Order replenishment stock from Hospital Central Store"
      >
        <form onSubmit={handleCreateIndent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Formulary Item"
            value={indentForm.drugName}
            onChange={(e) => setIndentForm({ ...indentForm, drugName: e.target.value })}
            options={batches.map(b => b.drugName)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Quantity Required"
              type="number"
              value={indentForm.qty}
              onChange={(e) => setIndentForm({ ...indentForm, qty: e.target.value })}
            />
            <Select
              label="Urgency"
              value={indentForm.urgency}
              onChange={(e) => setIndentForm({ ...indentForm, urgency: e.target.value })}
              options={['STAT Critical', 'Urgent 24h', 'Routine Replenishment']}
            />
          </div>

          <Input
            label="Clinical Remarks"
            value={indentForm.remarks}
            onChange={(e) => setIndentForm({ ...indentForm, remarks: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsIndentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Warehouse Indent</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
