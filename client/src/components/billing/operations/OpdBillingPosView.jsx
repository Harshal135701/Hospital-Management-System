import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  CreditCard,
  IndianRupee,
  Calendar,
  User,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { BillingOpsService, PatientService, ClinicalStaffService, OperationsQueueService } from '../../../services/api';
import { INITIAL_SERVICES_CATALOGUE } from '../common/billingMockData';
import { formatINR, formatDateTimeIN } from '../../../utils/formatters';

const DEFAULT_OPD_BILLS = [
  { id: 'b-01', bill_number: 'OPD-2026-0914', patient_name: 'Devika Sengupta', patient_uhid: 'UHID-2026-0814', doctor_name: 'Dr. Arindam Mitra', total_amount: 1450, paid_amount: 1450, payment_mode: 'UPI', created_at: '2026-10-22T10:15:00Z', status: 'paid' },
  { id: 'b-02', bill_number: 'OPD-2026-0915', patient_name: 'Rajesh Narayan Verma', patient_uhid: 'UHID-2026-0922', doctor_name: 'Dr. Ananya Sharma', total_amount: 800, paid_amount: 800, payment_mode: 'Cash', created_at: '2026-10-22T10:30:00Z', status: 'paid' },
  { id: 'b-03', bill_number: 'OPD-2026-0916', patient_name: 'Amina Khatun', patient_uhid: 'UHID-2026-1045', doctor_name: 'Dr. Sunita Rao', total_amount: 2200, paid_amount: 2200, payment_mode: 'Debit Card', created_at: '2026-10-22T11:00:00Z', status: 'paid' },
  { id: 'b-04', bill_number: 'OPD-2026-0917', patient_name: 'Vikramaditya Bose', patient_uhid: 'UHID-2026-1180', doctor_name: 'Dr. Pradeep K. Sharma', total_amount: 950, paid_amount: 950, payment_mode: 'UPI QR', created_at: '2026-10-22T11:45:00Z', status: 'paid' },
];

export function OpdBillingPosView({ onOpenReceiptModal }) {
  const [bills, setBills] = useState(DEFAULT_OPD_BILLS);
  const [servicesCatalogue] = useState(INITIAL_SERVICES_CATALOGUE);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [successBanner, setSuccessBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active POS Cart
  // Patient Search State
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Doctors State
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const [patientData, setPatientData] = useState({
    name: 'Devika Sengupta',
    uhid: 'UHID-2026-0814',
    phone: '+91 98310 44521',
    ageGender: '34 Y / Female',
    category: 'General OPD',
    doctor: 'Dr. Arindam Mitra (Reproductive Medicine)'
  });

  const [cartItems, setCartItems] = useState([
    { id: 'srv-02', name: 'Specialist Consultation Fee', price: 800, qty: 1, discount: 0, taxRate: 0, total: 800 },
    { id: 'srv-08', name: '12-Lead Electrocardiogram (ECG)', price: 350, qty: 1, discount: 0, taxRate: 0, total: 350 },
    { id: 'srv-04', name: 'Complete Blood Count (CBC with ESR)', price: 450, qty: 1, discount: 150, taxRate: 0, total: 300 }
  ]);

  const [paymentMode, setPaymentMode] = useState('upi');
  const [txnRef, setTxnRef] = useState('UPI-REF-2026-9041');
  const [discountTotal, setDiscountTotal] = useState(150);

  // Load doctors for consultation fee selection
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await ClinicalStaffService.getStaff();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDoctorsList(list);
        if (list.length > 0) setSelectedDoctorId(list[0].id);
      } catch {
        //
      }
    }
    loadDoctors();
  }, []);

  // Debounced Patient Search
  useEffect(() => {
    if (!patientQuery.trim() || patientQuery.trim().length < 2) {
      setPatientResults([]);
      setIsSearchingPatient(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPatient(true);
      try {
        const results = await PatientService.searchPatients(patientQuery.trim());
        setPatientResults(Array.isArray(results) ? results : []);
      } catch {
        setPatientResults([]);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientQuery]);

  const handleSelectPatient = (p) => {
    setPatientData({
      id: p.id,
      name: p.full_name,
      uhid: p.uhid,
      phone: p.mobile || 'N/A',
      ageGender: `${p.gender || 'General'} ${p.date_of_birth ? '• ' + String(p.date_of_birth).slice(0, 10) : ''}`,
      category: 'General OPD',
      doctor: patientData.doctor
    });
    setPatientQuery('');
    setPatientResults([]);
  };

  const handleAddDoctorFee = (docId) => {
    const doc = doctorsList.find(d => String(d.id) === String(docId));
    if (!doc) return;
    const fee = doc.consultation_fee ? Number(doc.consultation_fee) : 500;
    const docName = doc.full_name || doc.name;
    setPatientData(prev => ({ ...prev, doctor: `Dr. ${docName} (${doc.specialty || doc.department || 'Consultant'})` }));

    setCartItems(prev => {
      const filtered = prev.filter(i => !i.id.startsWith('srv-doc-'));
      return [
        {
          id: `srv-doc-${doc.id}`,
          name: `Consultation Fee - Dr. ${docName}`,
          price: fee,
          qty: 1,
          discount: 0,
          taxRate: 0,
          total: fee
        },
        ...filtered
      ];
    });
  };

  // Load live bills from API if present
  useEffect(() => {
    async function fetchBills() {
      setIsLoading(true);
      try {
        const live = await BillingOpsService.getBills();
        if (Array.isArray(live) && live.length > 0) {
          setBills(live);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
    fetchBills();
  }, []);

  // Compute Cart Totals
  const totals = useMemo(() => {
    const gross = cartItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
    const disc = cartItems.reduce((acc, it) => acc + (it.discount || 0), 0);
    const payable = Math.max(0, gross - disc);
    return { gross, disc, payable };
  }, [cartItems]);

  const handleAddItemFromCatalogue = (srv) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === srv.id);
      if (existing) {
        return prev.map(i =>
          i.id === srv.id
            ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price - i.discount }
            : i
        );
      }
      return [
        ...prev,
        {
          id: srv.id,
          name: srv.name,
          price: srv.price,
          qty: 1,
          discount: 0,
          taxRate: srv.taxRate,
          total: srv.price
        }
      ];
    });
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateQty = (id, newQty) => {
    const q = Math.max(1, parseInt(newQty) || 1);
    setCartItems(prev =>
      prev.map(i => (i.id === id ? { ...i, qty: q, total: q * i.price - i.discount } : i))
    );
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    const newBill = {
      id: `b-${Date.now()}`,
      bill_number: `OPD-2026-0${Math.floor(Math.random() * 900) + 100}`,
      patient_name: patientData.name,
      patient_uhid: patientData.uhid,
      doctor_name: patientData.doctor,
      total_amount: totals.payable,
      paid_amount: totals.payable,
      payment_mode: paymentMode.toUpperCase(),
      txn_ref: txnRef,
      items: cartItems,
      created_at: new Date().toISOString(),
      status: 'paid'
    };

    try {
      await BillingOpsService.createBill({
        patientName: patientData.name,
        patientUhid: patientData.uhid,
        doctorName: patientData.doctor,
        serviceName: cartItems.map(i => i.name).join(', '),
        totalAmount: totals.payable,
        consultationFee: totals.payable,
        investigationFee: 0,
        paymentMode
      });
    } catch {
      //
    }

    // Trigger post-payment SMS confirmation safely
    try {
      if (patientData.phone && patientData.phone !== 'N/A') {
        OperationsQueueService.scheduleEvent(
          newBill.id,
          'booking_confirmation',
          ['sms']
        ).catch(() => {});
      }
    } catch {
      //
    }

    setBills(prev => [newBill, ...prev]);
    setSuccessBanner(`Invoice ${newBill.bill_number} generated for ${formatINR(totals.payable)}.`);
    setIsSubmitting(false);

    if (onOpenReceiptModal) {
      onOpenReceiptModal(newBill);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 4.1</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Outpatient (OPD) Billing POS Counter
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Point-of-sale consultation invoicing, multi-tariff line items, instant UPI QR collections, and thermal receipt generation.
          </p>
        </div>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* POS Top Grid: Service Catalogue + Active Bill Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '20px' }}>
        {/* Left Column: Patient Search & Service Catalogue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Patient Details Banner */}
          <Card title="Patient Encounter Lookup">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
              <div><strong>Name:</strong> {patientData.name}</div>
              <div><strong>UHID:</strong> <span style={{ color: 'var(--color-primary-teal)', fontWeight: '700' }}>{patientData.uhid}</span></div>
              <div><strong>Category:</strong> {patientData.category}</div>
              <div><strong>Phone:</strong> {patientData.phone}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Consultant:</strong> {patientData.doctor}</div>
            </div>
          </Card>

          {/* Service Catalogue Picker */}
          <Card title="Tariff & Service Catalogue (Quick Add)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
              {servicesCatalogue.map((srv) => (
                <div
                  key={srv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{srv.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{srv.category} • Code: {srv.code}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#111827' }}>{formatINR(srv.price)}</span>
                    <Button
                      variant="soft"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleAddItemFromCatalogue(srv)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Invoice Cart & Payment Settlement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Active Invoicing Cart">
            <form onSubmit={handleCreateInvoiceSubmit}>
              {/* Cart Table */}
              <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Item Description</th>
                      <th style={{ textAlign: 'center', padding: '8px', width: '70px' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Price (₹)</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Total (₹)</th>
                      <th style={{ textAlign: 'center', padding: '8px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '8px' }}>
                          <div style={{ fontWeight: '600' }}>{item.name}</div>
                          {item.discount > 0 && (
                            <div style={{ fontSize: '0.68rem', color: '#059669' }}>Discount applied: -{formatINR(item.discount)}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.qty}
                            onChange={(e) => handleUpdateQty(item.id, e.target.value)}
                            style={{ width: '46px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                          />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          {formatINR(item.price)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700' }}>
                          {formatINR(item.total)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '14px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Gross Bill Subtotal:</span>
                  <span>{formatINR(totals.gross)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#059669' }}>
                  <span>Authorized Hospital Discount:</span>
                  <span>-{formatINR(totals.disc)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  <span>GST / Tax Rate:</span>
                  <span>Exempt (Health Services)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #111827', paddingTop: '8px', marginTop: '6px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                  <span>NET PAYABLE TOTAL:</span>
                  <span style={{ color: 'var(--color-primary-teal)' }}>{formatINR(totals.payable)}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                  >
                    <option value="upi">UPI / QR Counter Scan</option>
                    <option value="cash">Physical Cash Drawer</option>
                    <option value="card">Credit / Debit Card Swipe</option>
                    <option value="neft">NEFT / Bank Transfer</option>
                  </select>
                </div>
                <Input
                  label="Transaction / Approval Ref"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  required
                />
              </div>

              {/* Action Buttons */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                style={{ width: '100%' }}
                icon={Receipt}
              >
                Collect {formatINR(totals.payable)} & Print Receipt
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Recent OPD Invoices Ledger */}
      <Card
        title="Recent OPD Invoices Ledger"
        subtitle="Searchable history of generated outpatient bills with thermal receipt reprints"
        action={
          <div style={{ width: '260px' }}>
            <Input
              placeholder="Search by UHID, patient name..."
              icon={Search}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Bill No.</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Patient / UHID</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Doctor</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Mode</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills
                .filter(b => (b.patient_name || '').toLowerCase().includes(searchFilter.toLowerCase()) || (b.bill_number || '').toLowerCase().includes(searchFilter.toLowerCase()))
                .map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {b.bill_number}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600' }}>{b.patient_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{b.patient_uhid}</div>
                    </td>
                    <td style={{ padding: '10px' }}>{b.doctor_name}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="teal" size="sm">{b.payment_mode}</Badge>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>
                      {formatINR(b.total_amount)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {formatDateTimeIN(b.created_at)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Printer}
                        onClick={() => onOpenReceiptModal && onOpenReceiptModal(b)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
