import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  ScanLine,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  Printer,
  PauseCircle,
  Play,
  RotateCcw,
  User,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Tag
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_RETAIL_CATALOG, INITIAL_PAST_INVOICES } from '../operationsMockData';
import { stripNumericPrefix } from '../operationsConstants';

export function RetailPosDesk({
  activeSubtab = '28.1',
  patients = [],
  onNavigateSubmodule
}) {
  const [catalog, setCatalog] = useState(INITIAL_RETAIL_CATALOG);
  const [cart, setCart] = useState([
    { id: 'OTC-01', barcode: '890103001', name: 'Digital Infrared Forehead Thermometer', price: 950, gst: 12, qty: 1, stock: 35 },
    { id: 'OTC-03', barcode: '890103003', name: 'Vicks VapoRub 50g Relief Ointment', price: 145, gst: 5, qty: 2, stock: 110 }
  ]);

  // Search & Barcode states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Customer / Patient Details
  const [customerType, setCustomerType] = useState('walkin'); // 'walkin' | 'registered'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('+91 ');

  // Payment states (28.3)
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' | 'CARD' | 'CASH' | 'SPLIT'
  const [cashTendered, setCashTendered] = useState('');
  const [cardAuthCode, setCardAuthCode] = useState('');
  const [upiRefNo, setUpiRefNo] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitOnline, setSplitOnline] = useState('');

  // Cart Queues (Hold / Resume)
  const [heldCarts, setHeldCarts] = useState([]);

  // Return & Refund states (28.4)
  const [pastInvoices, setPastInvoices] = useState(INITIAL_PAST_INVOICES);
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [foundInvoice, setFoundInvoice] = useState(null);
  const [returnItemsQty, setReturnItemsQty] = useState({});
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [refundReason, setRefundReason] = useState('Unopened / Defective package');

  // Receipt Modal state
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Handle Registered Patient Selection
  const handleSelectRegisteredPatient = (patId) => {
    setSelectedPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat) {
      setCustomerName(pat.full_name || pat.name);
      setCustomerPhone(pat.phone || '+91 98301 00000');
    }
  };

  // Cart Totals Calculation
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const totalGst = cart.reduce((acc, item) => acc + (item.price * item.qty * item.gst) / 100, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const netTotal = Math.max(0, Math.round(subtotal + totalGst - discountAmount));
    const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return { subtotal, totalGst, discountAmount, netTotal, totalItemsCount };
  }, [cart, discountPercent]);

  // Change Due Calculation for Cash
  const cashChangeDue = useMemo(() => {
    if (paymentMode !== 'CASH') return 0;
    const tendered = parseFloat(cashTendered) || 0;
    return Math.max(0, Math.round(tendered - cartTotals.netTotal));
  }, [cashTendered, cartTotals.netTotal, paymentMode]);

  // Categories in catalog
  const categories = useMemo(() => {
    const set = new Set(catalog.map(c => c.category));
    return ['all', ...Array.from(set)];
  }, [catalog]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCode = item.id.toLowerCase().includes(q);
        const matchesBarcode = item.barcode.includes(q);
        if (!matchesName && !matchesCode && !matchesBarcode) return false;
      }
      return true;
    });
  }, [catalog, selectedCategory, catalogSearch]);

  // Add Item to Cart with Stock Verification
  const handleAddToCart = (product) => {
    const existing = cart.find(c => c.id === product.id);
    const currentQtyInCart = existing ? existing.qty : 0;

    if (currentQtyInCart + 1 > product.stock) {
      showToast(`Warning: Cannot add more than available stock (${product.stock} units) for ${product.name}`);
      return;
    }

    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showToast(`Added ${product.name} to cart.`);
  };

  // Adjust Quantity
  const handleUpdateQty = (id, delta) => {
    const item = catalog.find(p => p.id === id);
    const current = cart.find(c => c.id === id);
    if (!item || !current) return;

    const targetQty = current.qty + delta;
    if (targetQty > item.stock) {
      showToast(`Maximum available stock reached (${item.stock} units).`);
      return;
    }

    if (targetQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, qty: targetQty } : c));
    }
  };

  const handleRemoveItem = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  // Barcode Fast Scan Submission (28.2)
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const trimmed = barcodeInput.trim();
    const found = catalog.find(p => p.barcode === trimmed || p.id.toLowerCase() === trimmed.toLowerCase());

    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      showToast(`Item not found for scanned barcode: ${trimmed}`);
    }
  };

  // Hold / Resume Cart
  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const holdRecord = {
      holdId: `HOLD-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      customerName,
      customerPhone,
      customerType,
      selectedPatientId,
      total: cartTotals.netTotal
    };
    setHeldCarts([holdRecord, ...heldCarts]);
    setCart([]);
    showToast(`Cart held as ${holdRecord.holdId}. Counter freed for next customer.`);
  };

  const handleResumeCart = (holdRecord) => {
    setCart(holdRecord.cart);
    setCustomerName(holdRecord.customerName);
    setCustomerPhone(holdRecord.customerPhone);
    setCustomerType(holdRecord.customerType);
    setSelectedPatientId(holdRecord.selectedPatientId);
    setHeldCarts(heldCarts.filter(h => h.holdId !== holdRecord.holdId));
    showToast(`Cart ${holdRecord.holdId} resumed.`);
  };

  // Complete Payment & Generate Tax Invoice (28.3)
  const handleCompletePayment = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Cart is empty. Please add items before finalizing payment.');
      return;
    }

    // Validation for cash
    if (paymentMode === 'CASH') {
      const tendered = parseFloat(cashTendered) || 0;
      if (tendered < cartTotals.netTotal) {
        alert(`Insufficient cash tendered. Total is ₹${cartTotals.netTotal.toLocaleString()}, tendered is ₹${tendered.toLocaleString()}.`);
        return;
      }
    }

    // Validation for split
    if (paymentMode === 'SPLIT') {
      const c = parseFloat(splitCash) || 0;
      const o = parseFloat(splitOnline) || 0;
      if (Math.round(c + o) !== cartTotals.netTotal) {
        alert(`Split tender amounts (₹${c} + ₹${o} = ₹${c + o}) must match net total (₹${cartTotals.netTotal}).`);
        return;
      }
    }

    // Generate Invoice Record
    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceData = {
      invoiceNumber: invoiceNum,
      date: new Date().toLocaleString(),
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || 'N/A',
      uhid: customerType === 'registered' ? (patients.find(p => p.id === selectedPatientId)?.uhid || 'REG-UHID') : 'WALK-IN',
      items: cart.map(item => ({ ...item, returnable: true })),
      subtotal: cartTotals.subtotal,
      gst: cartTotals.totalGst,
      discount: cartTotals.discountAmount,
      total: cartTotals.netTotal,
      tender: paymentMode,
      refDetails: paymentMode === 'UPI' ? (upiRefNo || 'UPI-QR-APPROVED') : paymentMode === 'CARD' ? (cardAuthCode || 'AUTH-CARD-APPROVED') : 'CASH-COUNTER',
      status: 'Settled'
    };

    // Update stock levels in catalog
    setCatalog(prev => prev.map(p => {
      const inCart = cart.find(c => c.id === p.id);
      if (inCart) {
        return { ...p, stock: Math.max(0, p.stock - inCart.qty) };
      }
      return p;
    }));

    setPastInvoices([invoiceData, ...pastInvoices]);
    setCompletedInvoice(invoiceData);
    setIsReceiptModalOpen(true);
    setCart([]);
    setCashTendered('');
    setUpiRefNo('');
    setCardAuthCode('');
    setSplitCash('');
    setSplitOnline('');
    showToast(`Payment of ₹${invoiceData.total.toLocaleString()} confirmed. Invoice ${invoiceNum} generated.`);
  };

  // Invoice Lookup for Returns (28.4)
  const handleSearchInvoiceForReturn = (e) => {
    e.preventDefault();
    if (!searchInvoiceNo.trim()) return;

    const found = pastInvoices.find(inv =>
      inv.invoiceNumber.toLowerCase() === searchInvoiceNo.trim().toLowerCase()
    );

    if (found) {
      setFoundInvoice(found);
      const initialReturns = {};
      found.items.forEach(it => {
        initialReturns[it.id] = 0;
      });
      setReturnItemsQty(initialReturns);
      showToast(`Invoice ${found.invoiceNumber} verified.`);
    } else {
      setFoundInvoice(null);
      showToast(`No matching invoice found for: ${searchInvoiceNo}`);
    }
  };

  // Return calculation
  const refundTotals = useMemo(() => {
    if (!foundInvoice) return { subtotal: 0, gst: 0, total: 0 };
    let sub = 0;
    let gstVal = 0;

    foundInvoice.items.forEach(it => {
      const qty = returnItemsQty[it.id] || 0;
      if (qty > 0) {
        const itemSub = it.price * qty;
        sub += itemSub;
        gstVal += (itemSub * it.gst) / 100;
      }
    });

    return { subtotal: sub, gst: gstVal, total: Math.round(sub + gstVal) };
  }, [foundInvoice, returnItemsQty]);

  // Execute Return & Restock
  const handleConfirmReturn = () => {
    if (refundTotals.total <= 0) {
      alert('Please specify quantity to return for at least one item.');
      return;
    }

    // Restock returned items back into catalog
    setCatalog(prev => prev.map(catItem => {
      const returnedQty = returnItemsQty[catItem.id] || 0;
      if (returnedQty > 0) {
        return { ...catItem, stock: catItem.stock + returnedQty };
      }
      return catItem;
    }));

    showToast(`Refund of ₹${refundTotals.total.toLocaleString()} via ${refundMethod} authorized. Returned items restocked to pharmacy inventory.`);
    setFoundInvoice(null);
    setSearchInvoiceNo('');
    setReturnItemsQty({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg, #F0FDF4)',
            color: 'var(--color-success, #166534)',
            border: '1px solid var(--color-success-border, #BBF7D0)',
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

      {/* SUBMODULES 28.1, 28.2, 28.3: OTC POS Workspace */}
      {(activeSubtab === '28.1' || activeSubtab === '28.2' || activeSubtab === '28.3') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Product Catalog & Fast Barcode Scanning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Quick Barcode Scanner Bar (28.2) */}
            <Card style={{ padding: '14px 16px', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ScanLine size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                  Quick Barcode Scanning & Auto-Cart
                </span>
                <Badge variant="teal" size="sm">
                  Laser Scanner Ready
                </Badge>
              </div>
              <form onSubmit={handleBarcodeSubmit} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Input
                    placeholder="Scan EAN-13 barcode or type product code (e.g. 890103001, OTC-04)..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}
                  />
                </div>
                <Button variant="primary" type="submit" icon={Plus}>
                  Scan Item
                </Button>
              </form>
            </Card>

            {/* Catalog Search & Category Filters */}
            <Card style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="var(--color-primary-teal)" />
                  <span style={{ fontWeight: '700', fontSize: '0.90rem', color: 'var(--color-text-primary)' }}>
                    Retail Product Master ({filteredCatalog.length} Items)
                  </span>
                </div>
                <div style={{ width: '220px' }}>
                  <Input
                    placeholder="Search OTC catalog..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? 'var(--color-primary-teal)' : 'var(--color-border)',
                      backgroundColor: selectedCategory === cat ? 'var(--color-primary-teal)' : 'transparent',
                      color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: selectedCategory === cat ? '600' : '400',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat === 'all' ? 'All Products' : cat}
                  </button>
                ))}
              </div>

              {/* Catalog Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    style={{
                      padding: '10px',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary-teal)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                          {item.id} | {item.barcode}
                        </span>
                        <Badge variant={item.stock > 10 ? 'secondary' : 'amber'} size="sm">
                          {item.stock} in stock
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {item.category} • {item.location}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed var(--color-border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.90rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          ₹{item.price}
                        </span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                          (+{item.gst}% GST)
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                        + Add
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: POS Cart, Customer Details, & Settlement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Customer Header & Queue Hold */}
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} color="var(--color-primary-teal)" />
                  <span style={{ fontWeight: '700', fontSize: '0.84rem' }}>
                    Customer / Patient Context
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={PauseCircle}
                    onClick={handleHoldCart}
                    disabled={cart.length === 0}
                    title="Hold cart and take next customer"
                  >
                    Hold Cart
                  </Button>
                </div>
              </div>

              {/* Held Carts Notification Bar */}
              {heldCarts.length > 0 && (
                <div style={{ backgroundColor: '#FEF3C7', padding: '6px 10px', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#92400E', fontWeight: '600' }}>
                    {heldCarts.length} cart(s) on hold:
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {heldCarts.map(h => (
                      <button
                        key={h.holdId}
                        type="button"
                        onClick={() => handleResumeCart(h)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #F59E0B',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.70rem',
                          fontWeight: '600',
                          color: '#B45309'
                        }}
                      >
                        Resume {h.holdId} (₹{h.total})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Type Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCustomerType('walkin')}
                  style={{
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: customerType === 'walkin' ? 'var(--color-primary-teal)' : 'var(--color-border)',
                    backgroundColor: customerType === 'walkin' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: customerType === 'walkin' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: customerType === 'walkin' ? '700' : '500',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Walk-in Retail Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('registered')}
                  style={{
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: customerType === 'registered' ? 'var(--color-primary-teal)' : 'var(--color-border)',
                    backgroundColor: customerType === 'registered' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: customerType === 'registered' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: customerType === 'registered' ? '700' : '500',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Registered Hospital Patient
                </button>
              </div>

              {customerType === 'registered' ? (
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Select Patient (UHID Link)
                  </label>
                  <Select
                    value={selectedPatientId}
                    onChange={(e) => handleSelectRegisteredPatient(e.target.value)}
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.name} [{p.uhid || 'UHID-2026'}]
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Input
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="Mobile (+91)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              )}
            </Card>

            {/* Cart Items Table */}
            <Card style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>
                  Current Billing Basket ({cartTotals.totalItemsCount} items)
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.72rem', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <ShoppingBag size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>Cart is empty. Scan barcodes or select products.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          ₹{item.price} each • {item.gst}% GST
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.80rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div style={{ minWidth: '60px', textAlign: 'right', fontWeight: '700', fontSize: '0.84rem' }}>
                        ₹{(item.price * item.qty).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', marginLeft: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bill Financial Summary */}
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    <span>Items Subtotal:</span>
                    <span>₹{cartTotals.subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    <span>Total GST (CGST + SGST):</span>
                    <span>₹{cartTotals.totalGst.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    <span>Staff / Senior Discount (%):</span>
                    <div style={{ width: '80px' }}>
                      <Select
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                      </Select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-primary)', borderTop: '2px dashed var(--color-border)', paddingTop: '8px' }}>
                    <span>Net Amount Payable:</span>
                    <span style={{ color: 'var(--color-primary-teal)' }}>
                      ₹{cartTotals.netTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Instant Multi-Mode Settlement Desk (28.3) */}
            {cart.length > 0 && (
              <Card style={{ padding: '16px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <CreditCard size={18} color="var(--color-primary-teal)" />
                  <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>
                    Multi-Mode Instant Settlement (28.3)
                  </span>
                </div>

                {/* Tender Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { id: 'UPI', label: 'UPI QR', icon: QrCode },
                    { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
                    { id: 'CASH', label: 'Cash Counter', icon: IndianRupee },
                    { id: 'SPLIT', label: 'Split Tender', icon: RefreshCw }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = paymentMode === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPaymentMode(t.id)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)',
                          backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                          color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        <Icon size={16} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mode Specific Inputs */}
                {paymentMode === 'UPI' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '64px', height: '64px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px dashed #CBD5E1' }}>
                        <QrCode size={40} color="#0A4174" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          Dynamic UPI Merchant QR
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                          Amount: ₹{cartTotals.netTotal.toLocaleString()} • VPA: sarji.hospital@icici
                        </div>
                        <div style={{ marginTop: '6px' }}>
                          <Input
                            placeholder="Bank UTR / UPI Ref (Optional for cashbook)..."
                            value={upiRefNo}
                            onChange={(e) => setUpiRefNo(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMode === 'CARD' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                      PineLabs / EDC POS Machine Terminal
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Input
                        placeholder="Terminal Auth Code / Slip No..."
                        value={cardAuthCode}
                        onChange={(e) => setCardAuthCode(e.target.value)}
                      />
                      <Select defaultValue="VISA / Master">
                        <option>VISA / Mastercard</option>
                        <option>RuPay Debit Card</option>
                        <option>Amex Card</option>
                      </Select>
                    </div>
                  </div>
                )}

                {paymentMode === 'CASH' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                          Cash Tendered (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g. 2000"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                          Change Due to Return (₹)
                        </label>
                        <div style={{ height: '36px', display: 'flex', alignItems: 'center', padding: '0 10px', backgroundColor: '#F1F5F9', borderRadius: '4px', fontWeight: '800', color: cashChangeDue > 0 ? '#16A34A' : '#475569', fontSize: '1rem' }}>
                          ₹{cashChangeDue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMode === 'SPLIT' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Cash Portion (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="Amount in cash"
                          value={splitCash}
                          onChange={(e) => setSplitCash(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Online/Card Portion (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder="Amount via UPI/Card"
                          value={splitOnline}
                          onChange={(e) => setSplitOnline(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  icon={CheckCircle2}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleCompletePayment}
                >
                  Confirm Payment & Print Receipt (₹{cartTotals.netTotal.toLocaleString()})
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE 28.4: Retail Sales Return & Cash Refund Desk */}
      {activeSubtab === '28.4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <RefreshCw size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.90rem' }}>
                Retail Sales Return & Cash Refund Desk (28.4)
              </span>
            </div>
            <p style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', margin: '0 0 14px 0' }}>
              Verify original invoice number, inspect seal integrity of returned OTC goods, and authorize cash refund or reversal to original tender.
            </p>

            <form onSubmit={handleSearchInvoiceForReturn} style={{ display: 'flex', gap: '10px', maxWidth: '520px' }}>
              <Input
                placeholder="Enter Sales Invoice No (e.g. INV-2026-901)..."
                value={searchInvoiceNo}
                onChange={(e) => setSearchInvoiceNo(e.target.value)}
              />
              <Button variant="primary" type="submit" icon={Search}>
                Verify Invoice
              </Button>
            </form>
          </Card>

          {/* Found Invoice Return Processing Matrix */}
          {foundInvoice && (
            <Card style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
                    Original Tax Invoice: {foundInvoice.invoiceNumber}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                    Billed On: {foundInvoice.date} • Customer: {foundInvoice.customerName} ({foundInvoice.customerPhone})
                  </div>
                </div>
                <Badge variant="teal" size="sm">
                  Original Tender: {foundInvoice.tender}
                </Badge>
              </div>

              {/* Items Return Table */}
              <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px' }}>Item Description</th>
                      <th style={{ padding: '8px 10px' }}>Purchased Qty</th>
                      <th style={{ padding: '8px 10px' }}>Unit Price</th>
                      <th style={{ padding: '8px 10px' }}>GST Rate</th>
                      <th style={{ padding: '8px 10px', width: '130px' }}>Return Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Refund Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundInvoice.items.map((item) => {
                      const returnQty = returnItemsQty[item.id] || 0;
                      const lineRefund = (item.price * returnQty) + ((item.price * returnQty * item.gst) / 100);

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}>{item.name}</td>
                          <td style={{ padding: '8px 10px' }}>{item.qty} units</td>
                          <td style={{ padding: '8px 10px' }}>₹{item.price}</td>
                          <td style={{ padding: '8px 10px' }}>{item.gst}%</td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => setReturnItemsQty({ ...returnItemsQty, [item.id]: Math.max(0, returnQty - 1) })}
                                style={{ width: '22px', height: '22px', borderRadius: '3px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                              >
                                -
                              </button>
                              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700' }}>
                                {returnQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setReturnItemsQty({ ...returnItemsQty, [item.id]: Math.min(item.qty, returnQty + 1) })}
                                style={{ width: '22px', height: '22px', borderRadius: '3px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>
                            ₹{Math.round(lineRefund).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Refund Configuration & Authorization */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Refund Payout Method
                  </label>
                  <Select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
                    <option value="Cash">Cash Counter Payout</option>
                    <option value="Original Tender">Reversal to Original Tender ({foundInvoice.tender})</option>
                    <option value="Store Credit">Store Credit / Customer Balance Note</option>
                  </Select>

                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Reason for Return / Restock Audit
                    </label>
                    <Select value={refundReason} onChange={(e) => setRefundReason(e.target.value)}>
                      <option>Unopened / Defective package</option>
                      <option>Doctor prescription changed</option>
                      <option>Customer purchased duplicate item</option>
                      <option>Expired / damaged on inspection</option>
                    </Select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Total Refund Amount (Incl. GST reversal):
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#DC2626', marginTop: '2px' }}>
                      ₹{refundTotals.total.toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="md"
                    icon={RefreshCw}
                    onClick={handleConfirmReturn}
                    disabled={refundTotals.total <= 0}
                  >
                    Confirm Restock & Issue Refund (₹{refundTotals.total.toLocaleString()})
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tax Invoice Printable Receipt Modal */}
      {completedInvoice && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Sarji Hospital — Official OTC Tax Invoice"
          size="md"
        >
          <div style={{ padding: '8px', fontSize: '0.80rem', color: 'var(--color-text-primary)' }}>
            {/* Hospital Letterhead */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0A4174', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0A4174' }}>
                SARJI HOSPITAL & RESEARCH INSTITUTE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Retail Pharmacy & OTC Outpost • GSTIN: 19AAACH7890K1Z2 • DL No: 20B/21B-4521
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                Salt Lake Sector V, Kolkata - 700091 • Phone: +91 33 2357 0000
              </div>
            </div>

            {/* Bill Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '0.75rem' }}>
              <div>
                <div><strong>Invoice No:</strong> {completedInvoice.invoiceNumber}</div>
                <div><strong>Date & Time:</strong> {completedInvoice.date}</div>
                <div><strong>Payment Tender:</strong> {completedInvoice.tender}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Customer:</strong> {completedInvoice.customerName}</div>
                <div><strong>Phone:</strong> {completedInvoice.customerPhone}</div>
                <div><strong>UHID:</strong> {completedInvoice.uhid}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Item</th>
                  <th style={{ padding: '6px' }}>Qty</th>
                  <th style={{ padding: '6px' }}>Rate</th>
                  <th style={{ padding: '6px' }}>GST%</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {completedInvoice.items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '6px' }}>{it.name}</td>
                    <td style={{ padding: '6px' }}>{it.qty}</td>
                    <td style={{ padding: '6px' }}>₹{it.price}</td>
                    <td style={{ padding: '6px' }}>{it.gst}%</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>₹{(it.price * it.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Box */}
            <div style={{ borderTop: '1px dashed #94A3B8', paddingTop: '8px', marginBottom: '14px', fontSize: '0.80rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Subtotal:</span>
                <span>₹{completedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Tax (CGST + SGST):</span>
                <span>₹{completedInvoice.gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#0A4174', borderTop: '1px solid #CBD5E1', paddingTop: '4px' }}>
                <span>Net Total Paid:</span>
                <span>₹{completedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.70rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              Thank you for visiting Sarji Hospital Pharmacy. Wishing you good health!
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RetailPosDesk;
