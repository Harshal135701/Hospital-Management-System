import React, { useState } from 'react';
import {
  Trash2,
  CheckCircle2,
  Printer,
  QrCode,
  CreditCard,
  IndianRupee,
  Search,
  Plus,
  PauseCircle,
  Volume2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../../common/UIPrimitives';
import { INITIAL_RETAIL_CATALOG } from '../../inventory/inventoryMockData';

export function OtcRetailPosDesk({ activeSubtab = '28.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [catalog] = useState(INITIAL_RETAIL_CATALOG);
  const [cart, setCart] = useState([
    { id: 'OTC-01', barcode: '890103001', name: 'Digital Infrared Thermometer', price: 950, gst: 12, qty: 1 },
    { id: 'OTC-03', barcode: '890103003', name: 'Vicks VapoRub 50g Relief Ointment', price: 145, gst: 5, qty: 2 }
  ]);

  // Fast barcode scan state
  const [fastScanInput, setFastScanInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [heldQueues, setHeldQueues] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  // Multi-mode Payment state (28.3)
  const [paymentMode, setPaymentMode] = useState('UPI'); // UPI, CARD, CASH, SPLIT
  const [cashTendered, setCashTendered] = useState('');
  const [cardRefNo, setCardRefNo] = useState('');
  const [upiRefNo, setUpiRefNo] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitCard, setSplitCard] = useState('');
  const discountPercent = 0;

  // Return & Refund state (28.4)
  const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
  const [returnItems, setReturnItems] = useState([]);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalGst = cart.reduce((acc, item) => acc + (item.price * item.qty * item.gst) / 100, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const netPayable = Math.round(subtotal + totalGst - discountAmount);

  // Cart Handlers
  const handleAddToCart = (product) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showToast(`Added ${product.name} to POS cart.`);
  };

  const handleUpdateQty = (id, delta) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : c;
      }
      return c;
    }));
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  // Barcode Fast Scan input handler
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!fastScanInput.trim()) return;

    const found = catalog.find(p => p.barcode === fastScanInput.trim() || p.id.toLowerCase() === fastScanInput.trim().toLowerCase());
    if (found) {
      handleAddToCart(found);
      setFastScanInput('');
    } else {
      showToast(`Item not found for barcode: ${fastScanInput}`);
    }
  };

  // Hold / Resume Queue
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString(),
      customerName,
      cart: [...cart]
    };
    setHeldQueues([...heldQueues, newHold]);
    setCart([]);
    showToast(`Current transaction held: ${newHold.id}. Counter cleared for next customer.`);
  };

  const _handleResumeCart = (holdItem) => {
    setCart(holdItem.cart);
    setHeldQueues(heldQueues.filter(h => h.id !== holdItem.id));
    setCustomerName(holdItem.customerName);
    showToast(`Resumed transaction ${holdItem.id}.`);
  };

  // Complete Payment
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items.');
      return;
    }
    setIsReceiptModalOpen(true);
  };

  const handleFinalizePrint = () => {
    setIsReceiptModalOpen(false);
    setCart([]);
    setCashTendered('');
    showToast(`Receipt printed. Sale registered successfully.`);
  };

  // Return lookup
  const handleLookupInvoice = () => {
    if (!returnInvoiceNo.trim()) return;
    setReturnItems([
      { id: 'OTC-01', name: 'Digital Infrared Thermometer', qtyBilled: 1, returnQty: 1, unitPrice: 950, refundAmt: 1064 },
      { id: 'OTC-03', name: 'Vicks VapoRub 50g Relief Ointment', qtyBilled: 2, returnQty: 1, unitPrice: 145, refundAmt: 152.25 }
    ]);
    showToast(`Invoice ${returnInvoiceNo} verified. Returnable items loaded.`);
  };

  const handleProcessRefund = () => {
    setReturnItems([]);
    setReturnInvoiceNo('');
    showToast(`Cash refund processed & Credit Note issued.`);
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

      {/* SUBMODULE 28.1: Over-the-Counter (OTC) POS Counter */}
      {activeSubtab === '28.1' && (
        <Card
          title="28.1 Over-the-Counter (OTC) Retail POS Terminal"
          subtitle="Walk-in patient retail sales, fast barcode checkout, hold/resume active queues, and instant receipt printing"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
            {/* Left: Product Catalog Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Hospital OTC Retail Formulary</span>
                <Badge variant="teal">{catalog.length} Products</Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {catalog.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddToCart(prod)}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.80rem', fontWeight: 700 }}>{prod.name}</div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Barcode: {prod.barcode} • Stock: {prod.stock}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.86rem' }}>₹{prod.price}</span>
                      <Button size="xs" variant="outline" icon={Plus}>Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Cart */}
            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>Active Retail Cart</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button size="xs" variant="outline" icon={PauseCircle} onClick={handleHoldCart} disabled={cart.length === 0}>
                    Hold
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setCart([])} disabled={cart.length === 0}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem', padding: '24px' }}>
                    Cart is empty. Click a product or scan barcode.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>
                          ₹{item.price} + {item.gst}% GST
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button type="button" onClick={() => handleUpdateQty(item.id, -1)} style={{ padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '3px', background: '#FFFFFF', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                        <button type="button" onClick={() => handleUpdateQty(item.id, 1)} style={{ padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '3px', background: '#FFFFFF', cursor: 'pointer' }}>+</button>
                        <button type="button" onClick={() => handleRemoveFromCart(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#DC2626', marginLeft: '4px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bill Totals */}
              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '10px', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST:</span>
                  <span>₹{totalGst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.94rem', color: 'var(--color-primary-teal)', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                  <span>Total Payable:</span>
                  <span>₹{netPayable.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                icon={CreditCard}
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                style={{ marginTop: '12px', width: '100%' }}
              >
                Checkout & Pay (₹{netPayable.toLocaleString()})
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.2: Quick Barcode Scanning & Billing */}
      {activeSubtab === '28.2' && (
        <Card
          title="28.2 High-Speed Barcode Scanning & Rapid Billing"
          subtitle="Hardware barcode scanner listening port, audio beep feedback, instant item lookup, and queue acceleration"
        >
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <form onSubmit={handleBarcodeSubmit} style={{ display: 'flex', gap: '10px' }}>
              <Input
                placeholder="Scan / Type Barcode (e.g. 890103001, 890103002...)"
                value={fastScanInput}
                onChange={(e) => setFastScanInput(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary" icon={Search}>
                Lookup
              </Button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="var(--color-primary-teal)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Barcode Audio Beep Feedback:</span>
              </div>
              <Button size="xs" variant={soundEnabled ? 'primary' : 'outline'} onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? 'Sound ON' : 'Sound Muted'}
              </Button>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Recent Rapid Barcode Items in Cart:</span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {cart.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 8px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                    <span>{c.name} ({c.barcode})</span>
                    <span style={{ fontWeight: 700 }}>₹{c.price * c.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.3: Multi-Mode Instant Payment */}
      {activeSubtab === '28.3' && (
        <Card
          title="28.3 Multi-Mode Instant Payment Engine"
          subtitle="Dynamic UPI QR Code generation, credit/debit card EDC terminal reconciliation, cash tendered change, and split tenders"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Payment Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['UPI', 'CARD', 'CASH', 'SPLIT'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: paymentMode === mode ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      backgroundColor: paymentMode === mode ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      color: paymentMode === mode ? 'var(--color-primary-teal)' : 'inherit',
                      fontWeight: paymentMode === mode ? 700 : 500,
                      fontSize: '0.80rem',
                      cursor: 'pointer'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {paymentMode === 'UPI' && (
                <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <QrCode size={120} color="#0F172A" style={{ margin: '0 auto' }} />
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', marginTop: '10px', color: 'var(--color-primary-teal)' }}>
                    ₹{netPayable.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Scan with GPay / PhonePe / Paytm / BHIM
                  </div>
                  <Input
                    placeholder="Enter UPI UTR / RRN Reference #"
                    value={upiRefNo}
                    onChange={(e) => setUpiRefNo(e.target.value)}
                    style={{ marginTop: '12px' }}
                  />
                </div>
              )}

              {paymentMode === 'CASH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Input
                    label="Cash Amount Tendered by Customer (₹)"
                    type="number"
                    placeholder="e.g. 2000"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                  />
                  {cashTendered && parseFloat(cashTendered) >= netPayable && (
                    <div style={{ padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 'var(--radius-md)', color: '#166534', fontWeight: 700, fontSize: '0.86rem' }}>
                      Change to Return Customer: ₹{(parseFloat(cashTendered) - netPayable).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {paymentMode === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Input
                    label="POS EDC Terminal Authorization / Approval Code"
                    placeholder="e.g. AUTH-449102"
                    value={cardRefNo}
                    onChange={(e) => setCardRefNo(e.target.value)}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                    Swipe/Dip card on EDC Terminal #04 (PineLabs / HDFC).
                  </div>
                </div>
              )}

              {paymentMode === 'SPLIT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Input
                    label="Cash Part (₹)"
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(e.target.value)}
                  />
                  <Input
                    label="Card/UPI Part (₹)"
                    type="number"
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                  />
                </div>
              )}

              <Button variant="primary" icon={CheckCircle2} onClick={handleCompleteSale}>
                Confirm Payment & Generate Tax Invoice
              </Button>
            </div>

            {/* Bill Summary */}
            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '8px' }}>Order Settlement Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer:</span>
                  <span style={{ fontWeight: 600 }}>{customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Items:</span>
                  <span>{cart.length} line items</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Net Total:</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary-teal)', fontSize: '0.94rem' }}>₹{netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 28.4: Retail Sales Return & Cash Refund */}
      {activeSubtab === '28.4' && (
        <Card
          title="28.4 Retail Sales Return & Instant Cash Refund"
          subtitle="Scan original retail invoice number, item physical condition verification, return to sellable inventory, and refund voucher"
        >
          <div style={{ display: 'flex', gap: '10px', maxWidth: '520px', marginBottom: '16px' }}>
            <Input
              placeholder="Enter Original Retail Invoice # (e.g. INV-2026-902)"
              value={returnInvoiceNo}
              onChange={(e) => setReturnInvoiceNo(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button variant="primary" icon={Search} onClick={handleLookupInvoice}>
              Verify Invoice
            </Button>
          </div>

          {returnItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Item Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Billed Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Return Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>Refundable Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '600' }}>{item.name}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.qtyBilled}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.returnQty}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>₹{item.refundAmt.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="ghost" onClick={() => setReturnItems([])}>Cancel</Button>
                <Button variant="primary" icon={IndianRupee} onClick={handleProcessRefund}>
                  Authorize Cash Refund Voucher
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Printable Receipt Modal */}
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Retail Tax Invoice Receipt">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.80rem' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px' }}>
            <div style={{ fontWeight: '800', fontSize: '0.94rem' }}>MEDICSPRIME HOSPITAL PHARMACY</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>GSTIN: 29AABCU9603R1ZM • DL: DL-20B-99412</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Date: 26/10/2026, 10:00:00 PM</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {cart.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.name} x {c.qty}</span>
                <span>₹{(c.price * c.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>NET PAID:</span>
            <span>₹{netPayable.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="primary" icon={Printer} onClick={handleFinalizePrint}>
              Print Receipt & Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
