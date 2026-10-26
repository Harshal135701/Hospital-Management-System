import React, { useState } from 'react';
import {
  Tag,
  Trash2,
  CheckCircle2,
  Printer,
  QrCode,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Search,
  Plus,
  Minus,
  PauseCircle,
  PlayCircle,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_RETAIL_CATALOG } from '../inventoryMockData';

export function OtcRetailPosGroup({ activeSubtab = '28.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [catalog, setCatalog] = useState(INITIAL_RETAIL_CATALOG);
  const [cart, setCart] = useState([
    { id: 'OTC-01', barcode: '890103001', name: 'Digital Infrared Thermometer', price: 950, gst: 12, qty: 1 },
    { id: 'OTC-03', barcode: '890103003', name: 'Vicks VapoRub 50g Relief Ointment', price: 145, gst: 5, qty: 2 }
  ]);

  // Fast barcode scan state
  const [fastScanInput, setFastScanInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [heldQueues, setHeldQueues] = useState([]);
  const [customerType, setCustomerType] = useState('Walk-in Customer');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('+91 98300 12345');

  // Multi-Mode Payment Terminal state
  const [paymentMode, setPaymentMode] = useState('UPI QR Code');
  const [cashTendered, setCashTendered] = useState('');
  const [splitCashAmount, setSplitCashAmount] = useState('500');
  const [splitUpiAmount, setSplitUpiAmount] = useState('740');
  const [edcAuthCode, setEdcAuthCode] = useState('');
  const [isEdcProcessing, setIsEdcProcessing] = useState(false);

  // Return & Refund state
  const [searchReceiptNum, setSearchReceiptNum] = useState('');
  const [returnReceipt, setReturnReceipt] = useState({
    receiptNo: 'REC-2026-9810',
    date: '2026-10-25 11:30 AM',
    customer: 'Devika Sengupta (+91 98301 24567)',
    items: [
      { id: 'RET-01', name: 'Volini Pain Relief Gel 75g', price: 220, gst: 12, qty: 1, returnReason: 'Wrong strength purchased', returnQty: 1, condition: 'Intact Unopened' },
      { id: 'RET-02', name: 'Electral ORS Sachets Box of 10', price: 215, gst: 5, qty: 1, returnReason: 'Not needed', returnQty: 0, condition: 'Intact Unopened' }
    ],
    status: 'Eligible for Refund'
  });
  const [refundProcessed, setRefundProcessed] = useState(false);

  // Modals state
  const [notification, setNotification] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Cart calculations
  const subtotal = cart.reduce((acc, itm) => acc + (itm.price * itm.qty), 0);
  const gstAmount = cart.reduce((acc, itm) => acc + ((itm.price * itm.qty * itm.gst) / 100), 0);
  const totalPayable = subtotal + gstAmount;
  const cashChangeDue = Math.max(0, (Number(cashTendered) || 0) - totalPayable);

  // Add item to cart
  const handleAddToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    showToast(`Added ${item.name} to bill cart.`);
  };

  const handleUpdateQty = (id, delta) => {
    setCart(prev => prev.map(itm => {
      if (itm.id === id) {
        const newQty = itm.qty + delta;
        return newQty > 0 ? { ...itm, qty: newQty } : null;
      }
      return itm;
    }).filter(Boolean));
  };

  const handleRemoveCartItem = (id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  // Fast Barcode Scan handler
  const handleFastBarcodeScan = (e) => {
    e.preventDefault();
    if (!fastScanInput) return;
    const found = catalog.find(c => c.barcode === fastScanInput.trim() || c.id.toLowerCase() === fastScanInput.trim().toLowerCase());
    if (found) {
      handleAddToCart(found);
      setFastScanInput('');
      if (soundEnabled) {
        // play simulated beep notification
        showToast(`⚡ Barcode ${found.barcode} Scanned: ${found.name} (₹${found.price})`);
      }
    } else {
      showToast(`⚠️ Barcode ${fastScanInput} not recognized in retail stock.`);
    }
  };

  // Hold / Park Cart
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    setHeldQueues([...heldQueues, { id: `HOLD-${heldQueues.length + 1}`, time: new Date().toLocaleTimeString(), customer: customerName, cart: [...cart] }]);
    setCart([]);
    showToast('Active ticket held and parked! Ready for next customer.');
  };

  // Resume Parked Cart
  const handleResumeCart = (held) => {
    setCart(held.cart);
    setHeldQueues(heldQueues.filter(h => h.id !== held.id));
    showToast(`Resumed ticket ${held.id}`);
  };

  // EDC Terminal Swipe simulation
  const handleSimulateEdcSwipe = () => {
    setIsEdcProcessing(true);
    setTimeout(() => {
      setIsEdcProcessing(false);
      setEdcAuthCode(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
      showToast('Card terminal approval received from HDFC Merchant Gateway!');
    }, 1200);
  };

  // Complete Payment
  const handleCompletePayment = () => {
    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastReceiptData({
      receiptNo: receiptNum,
      customer: customerName,
      customerPhone: customerPhone,
      items: [...cart],
      subtotal: subtotal,
      gst: gstAmount,
      total: totalPayable,
      paymentMode: paymentMode,
      date: new Date().toLocaleString()
    });
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    showToast(`Payment of ₹${totalPayable.toFixed(2)} settled via ${paymentMode}!`);
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

      {/* SUBMODULE 28.1: Over-the-Counter (OTC) POS Counter */}
      {activeSubtab === '28.1' && (
        <Card
          title="Over-the-Counter (OTC) Retail POS Counter"
          subtitle="Instant retail sales, walk-in billing, multi-customer queues, and cash drawer management"
        >
          {/* Customer & Session Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <Select
              label="Customer Type"
              value={customerType}
              onChange={(e) => {
                setCustomerType(e.target.value);
                if (e.target.value === 'Registered Hospital Patient') {
                  setCustomerName('Rameshwar Teli (UHID-2026-0412)');
                } else {
                  setCustomerName('Walk-in Retail Customer');
                }
              }}
              options={['Walk-in Customer', 'Registered Hospital Patient', 'Hospital Staff / Doctor']}
            />
            <Input
              label="Customer Name / UHID"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
            {/* Left: Retail Products Catalog */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                  OTC Products Catalog ({catalog.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Click card to add to ticket</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {catalog.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleAddToCart(cat)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{cat.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Code: {cat.barcode}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.9rem' }}>₹{cat.price}</div>
                      <Badge variant="teal" size="sm">Stock: {cat.stock}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Ticket Cart */}
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                    Active Ticket ({cart.length} items)
                  </div>
                  {cart.length > 0 && (
                    <Button size="sm" variant="ghost" icon={PauseCircle} onClick={handleHoldCart}>
                      Hold Ticket
                    </Button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                    Shopping cart is empty. Scan barcode or click items to add.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {cart.map((c) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>₹{c.price} (GST {c.gst}%)</div>
                        </div>

                        {/* Quantity adjusters */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '14px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(c.id, -1)}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--color-border)', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: '700', fontSize: '0.82rem', minWidth: '18px', textAlign: 'center' }}>{c.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(c.id, 1)}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--color-border)', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.86rem' }}>₹{(c.price * c.qty).toFixed(2)}</div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(c.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>GST Taxes:</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  <span>Grand Total:</span>
                  <span>₹{totalPayable.toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <Button
                    variant="primary"
                    disabled={cart.length === 0}
                    style={{ width: '100%' }}
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    Proceed to Instant Payment (₹{totalPayable.toFixed(2)})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.2: Quick Barcode Scanning & Billing */}
      {activeSubtab === '28.2' && (
        <Card
          title="Quick Barcode Scanning & High-Speed Fast Billing"
          subtitle="Continuous laser scanner stream, automated ticket accumulation, price checker, and one-touch POS tender"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={soundEnabled ? Volume2 : VolumeX}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              Scanner Audio: {soundEnabled ? 'ON' : 'MUTED'}
            </Button>
          }
        >
          {/* Barcode Fast Scan Console */}
          <form onSubmit={handleFastBarcodeScan} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Scan continuous barcode stream (e.g. 890103001, 890103002, 890103003, 890103004, 890103005)..."
                icon={Tag}
                autoFocus
                value={fastScanInput}
                onChange={(e) => setFastScanInput(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit">Scan Barcode</Button>
          </form>

          {/* Quick Barcode Test Triggers */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Quick Barcode Bar:
            </span>
            {catalog.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  handleAddToCart(cat);
                  if (soundEnabled) showToast(`Scanned: ${cat.name}`);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.74rem',
                  cursor: 'pointer'
                }}
              >
                {cat.name} ({cat.barcode})
              </button>
            ))}
          </div>

          {/* Active Fast Bill Stream */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '18px' }}>
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Item Name</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Barcode</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Rate</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Qty</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{c.barcode}</td>
                      <td style={{ padding: '10px 14px' }}>₹{c.price}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '700' }}>{c.qty}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        ₹{(c.price * c.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fast Tender Summary */}
            <div style={{ padding: '18px', backgroundColor: '#F0FDFA', border: '1.5px solid #99F6E4', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0F766E', fontSize: '0.92rem' }}>High-Speed Fast Checkout</div>
                <div style={{ fontSize: '0.78rem', color: '#115E59', marginTop: '4px' }}>Items scanned: {cart.reduce((a, b) => a + b.qty, 0)} units</div>

                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid #CCFBF1' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>TOTAL DUE:</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-primary-teal)' }}>
                    ₹{totalPayable.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="primary"
                  style={{ width: '100%', height: '42px', fontSize: '0.9rem' }}
                  disabled={cart.length === 0}
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  Instant Tender Payment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.3: Multi-Mode Instant Payment */}
      {activeSubtab === '28.3' && (
        <Card
          title="Multi-Mode Instant Payment Terminal Console"
          subtitle="Instant settlement via UPI dynamic QR code, BharatQR, EDC card swipe terminal, and cash drawer reconciliation"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left: Payment Method Selection & Tender */}
            <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>Select POS Tender Mode</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['UPI QR Code', 'Cash in Counter Drawer', 'Credit / Debit Card Terminal', 'Split Tender (Cash + UPI)'].map(mode => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMode === mode ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      backgroundColor: paymentMode === mode ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      color: paymentMode === mode ? 'var(--color-primary-teal)' : 'var(--color-text-primary)',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Mode Specific Display */}
              {paymentMode === 'UPI QR Code' && (
                <div style={{ padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: '#166534', marginBottom: '8px' }}>Scan with Any UPI App (GPay / PhonePe / Paytm / BHIM)</div>
                  <div style={{ display: 'inline-block', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                    <QrCode size={130} color="#087F8C" />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D', marginTop: '8px' }}>
                    VPA: <strong>medicsprime.pos@icici</strong> • Amount: <strong>₹{totalPayable.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {paymentMode === 'Cash in Counter Drawer' && (
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    label="Cash Amount Tendered by Customer (₹)"
                    type="number"
                    placeholder="e.g. 2000"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontWeight: '600' }}>Change Due to Customer:</span>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '1rem' }}>
                      ₹{cashChangeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMode === 'Credit / Debit Card Terminal' && (
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    PineLabs / Plutus EDC Terminal Connected on IP 192.168.1.15
                  </div>
                  <Button
                    variant="primary"
                    icon={CreditCard}
                    disabled={isEdcProcessing}
                    onClick={handleSimulateEdcSwipe}
                  >
                    {isEdcProcessing ? 'Waiting for Customer Card PIN...' : 'Send Charge to EDC Machine'}
                  </Button>
                  {edcAuthCode && (
                    <div style={{ padding: '8px', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-sm)', color: '#065F46', fontWeight: '700', fontSize: '0.78rem' }}>
                      ✓ Card Auth Code: {edcAuthCode} (HDFC Merchant Terminal)
                    </div>
                  )}
                </div>
              )}

              {paymentMode === 'Split Tender (Cash + UPI)' && (
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    label="Split Part 1: Cash Amount (₹)"
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => setSplitCashAmount(e.target.value)}
                  />
                  <Input
                    label="Split Part 2: UPI Amount (₹)"
                    type="number"
                    value={splitUpiAmount}
                    onChange={(e) => setSplitUpiAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Right: Drawer Status & Settlement */}
            <div style={{ padding: '18px', backgroundColor: '#FAFDFD', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.95rem' }}>POS Drawer Cash Float Status</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Counter #02 • Cashier: Amitabh Sen • Shift: Morning
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span>Opening Float Balance:</span>
                    <strong>₹5,000.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span>Total Cash Collected Today:</span>
                    <strong>₹18,450.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span>Total UPI / Digital Collections:</span>
                    <strong>₹42,320.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span>Refunds Paid from Drawer:</span>
                    <strong style={{ color: 'var(--color-error)' }}>- ₹435.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                    <span>Current Drawer Cash on Hand:</span>
                    <span>₹23,015.00</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleCompletePayment();
                  }}
                >
                  Settle Current Ticket (₹{totalPayable.toFixed(2)}) & Open Drawer
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.4: Retail Sales Return & Cash Refund */}
      {activeSubtab === '28.4' && (
        <Card
          title="Retail Sales Return & Immediate Cash Refund"
          subtitle="Process item return against sales receipt, restock inspection, and instant cash refund drawer payout"
        >
          {/* Invoice Lookup Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Search sales invoice by receipt number (e.g. REC-2026-9810) or customer phone..."
                icon={Search}
                value={searchReceiptNum}
                onChange={(e) => setSearchReceiptNum(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={() => showToast('Loaded receipt REC-2026-9810 for customer Devika Sengupta')}>
              Lookup Receipt
            </Button>
          </div>

          {/* Receipt Details and Items to Return */}
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.92rem' }}>{returnReceipt.receiptNo}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Customer: <strong>{returnReceipt.customer}</strong> • Purchase Date: {returnReceipt.date}
                </div>
              </div>
              <Badge variant="teal">{returnReceipt.status}</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Purchased Item</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Original Qty</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Unit Price</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Return Qty</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Reason for Return</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Condition Check</th>
                  </tr>
                </thead>
                <tbody>
                  {returnReceipt.items.map((itm) => (
                    <tr key={itm.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>{itm.name}</td>
                      <td style={{ padding: '10px 14px' }}>{itm.qty}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{itm.price}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: '700', color: itm.returnQty > 0 ? 'var(--color-primary-teal)' : 'inherit' }}>
                          {itm.returnQty}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{itm.returnReason}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant="success">{itm.condition}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Refund Settlement Calculation */}
            <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Total Cash Refund Due:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-error)' }}>
                  ₹220.00 (Cash)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Credit Note #CRN-2026-042 will be generated & restocked into OTC inventory.
                </div>
              </div>

              <div>
                {refundProcessed ? (
                  <div style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} />
                    Cash Refund Payout Completed (CRN-2026-042)
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    icon={IndianRupee}
                    onClick={() => {
                      setRefundProcessed(true);
                      showToast('Refund of ₹220.00 debited from cash drawer and restocked.');
                    }}
                  >
                    Authorize Return & Dispense Cash Refund
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Multi-Mode Payment */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Multi-Mode POS Payment Tender"
        subtitle={`Total Payable: ₹${totalPayable.toFixed(2)}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Payment Tender Mode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            options={['UPI QR Code', 'Cash in Counter Drawer', 'Credit / Debit Card Terminal', 'Split Tender (Cash + UPI)']}
          />

          {paymentMode === 'UPI QR Code' && (
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontWeight: '700', color: '#166534', marginBottom: '8px' }}>Scan with Any UPI App (GPay / PhonePe / Paytm)</div>
              <div style={{ display: 'inline-block', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                <QrCode size={110} color="#087F8C" />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '6px' }}>VPA: medicsprime.pos@icici • Amount: ₹{totalPayable.toFixed(2)}</div>
            </div>
          )}

          {paymentMode === 'Cash in Counter Drawer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Input
                label="Cash Received (₹)"
                type="number"
                placeholder="e.g. 1500"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
              />
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                Change Due: ₹{cashChangeDue.toFixed(2)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCompletePayment}>Confirm Payment & Print Receipt</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Receipt Preview */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Tax Invoice / POS Cash Receipt"
        subtitle="MedicsPrime Healthcare Retail Pharmacy"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '16px', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>MEDICSPRIME RETAIL PHARMACY</div>
            <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#4B5563' }}>GSTIN: 27AAAAA0000A1Z5 • DL: DL-2026-99120</div>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
            <div>Receipt: #{lastReceiptData?.receiptNo || 'REC-2026-9912'}</div>
            <div>Customer: {lastReceiptData?.customer || customerName}</div>
            <div>Date: {lastReceiptData?.date || new Date().toLocaleString()}</div>
            <div>Payment Mode: {lastReceiptData?.paymentMode || paymentMode}</div>
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
            {(lastReceiptData?.items || cart).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>{c.name} x{c.qty}</span>
                <span>₹{(c.price * c.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderBottom: '1px dashed #000', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>TOTAL PAID:</span>
              <span>₹{(lastReceiptData?.total || totalPayable).toFixed(2)}</span>
            </div>
          </div>

          <Button variant="primary" icon={Printer} onClick={() => {
            setIsReceiptModalOpen(false);
            setCart([]);
            showToast('Receipt printed & cash drawer opened.');
          }}>
            Print 80mm Thermal Receipt
          </Button>
        </div>
      </Modal>
    </div>
  );
}
