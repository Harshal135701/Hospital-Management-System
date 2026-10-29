import React, { useState, useMemo } from 'react';
import {
  Printer,
  Barcode,
  QrCode,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  FileText,
  Info,
  Save
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import {
  PRINTER_TYPES,
  CONNECTION_INTERFACES,
  LABEL_TEMPLATES,
  BARCODE_SYMBOLOGIES
} from './applicationConstants';
import { INITIAL_REGISTERED_PRINTERS } from './applicationMockData';

export function PrinterSettingsDesk({ onNotify }) {
  const [printers, setPrinters] = useState(INITIAL_REGISTERED_PRINTERS);
  const [selectedPrinter, setSelectedPrinter] = useState(INITIAL_REGISTERED_PRINTERS[0]);

  // Label Designer State
  const [activeTemplateId, setActiveTemplateId] = useState('pos_receipt');
  const [barcodeSymbology, setBarcodeSymbology] = useState('Code 128');
  const [barcodeHeight, setBarcodeHeight] = useState(48);
  const [alignment, setAlignment] = useState('center'); // 'left' | 'center' | 'right'
  const [printDensity, setPrintDensity] = useState(10);
  const [includeHumanReadable, setIncludeHumanReadable] = useState(true);

  // Modals & Dialogs
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [deleteConfirmPrinter, setDeleteConfirmPrinter] = useState(null);
  const [testPrintModal, setTestPrintModal] = useState(null);

  // Form State for Add / Edit
  const [printerForm, setPrinterForm] = useState({
    name: '',
    type: PRINTER_TYPES[0],
    role: '',
    interface: CONNECTION_INTERFACES[0],
    paperWidth: '80mm Roll (Thermal continuous)',
    barcodeFormat: 'Code 128 / QR Code',
    defaultDensity: 10,
    speed: '150 mm/sec'
  });

  // Derived KPIs
  const totalPrinters = printers.length;
  const activePrinters = printers.filter(p => p.status.includes('Connected') || p.status.includes('Online')).length;
  const defaultReceiptPrinter = printers.find(p => p.isDefaultReceipt)?.name || 'None';
  const defaultSpecimenPrinter = printers.find(p => p.isDefaultSpecimen)?.name || 'None';

  const activeTemplate = useMemo(() => {
    return LABEL_TEMPLATES.find(t => t.id === activeTemplateId) || LABEL_TEMPLATES[0];
  }, [activeTemplateId]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPrinter(null);
    setPrinterForm({
      name: '',
      type: PRINTER_TYPES[0],
      role: 'Outpatient Billing Receipts',
      interface: CONNECTION_INTERFACES[0],
      paperWidth: '80mm Roll (Thermal continuous)',
      barcodeFormat: 'Code 128 / QR Code',
      defaultDensity: 10,
      speed: '150 mm/sec'
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p) => {
    setEditingPrinter(p);
    setPrinterForm({
      name: p.name,
      type: p.type,
      role: p.role,
      interface: p.interface,
      paperWidth: p.paperWidth,
      barcodeFormat: p.barcodeFormat,
      defaultDensity: p.defaultDensity || 10,
      speed: p.speed || '150 mm/sec'
    });
    setIsAddEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSavePrinterForm = (e) => {
    e.preventDefault();
    if (!printerForm.name.trim()) {
      if (onNotify) onNotify('Validation error: Printer name is required.');
      return;
    }

    if (editingPrinter) {
      setPrinters(prev =>
        prev.map(p =>
          p.id === editingPrinter.id
            ? { ...p, ...printerForm, lastTested: 'Just updated' }
            : p
        )
      );
      if (onNotify) onNotify(`Printer profile for "${printerForm.name}" updated successfully.`);
    } else {
      const newPrinter = {
        id: `prn-0${printers.length + 1}`,
        ...printerForm,
        status: 'Connected / Ready',
        isDefaultReceipt: false,
        isDefaultSpecimen: false,
        isDefaultWristband: false,
        isDefaultCryo: false,
        lastTested: 'New Configuration'
      };
      setPrinters(prev => [...prev, newPrinter]);
      if (onNotify) onNotify(`New printer "${newPrinter.name}" registered successfully.`);
    }
    setIsAddEditModalOpen(false);
  };

  // Remove Printer
  const handleConfirmDelete = () => {
    if (!deleteConfirmPrinter) return;
    setPrinters(prev => prev.filter(p => p.id !== deleteConfirmPrinter.id));
    if (selectedPrinter?.id === deleteConfirmPrinter.id) {
      setSelectedPrinter(printers[0]);
    }
    if (onNotify) onNotify(`Printer "${deleteConfirmPrinter.name}" removed from configuration.`);
    setDeleteConfirmPrinter(null);
  };

  // Execute Test Print
  const handleExecuteTestPrint = (p = selectedPrinter) => {
    setTestPrintModal({
      printer: p,
      template: activeTemplate,
      symbology: barcodeSymbology,
      dispatchedAt: new Date().toLocaleTimeString(),
      samplePayload: activeTemplateId === 'pos_receipt'
        ? { receiptNo: 'RCPT-2026-9921', patient: 'Suresh Chandra Pal', uhid: 'UHID-2026-0511', amount: '₹ 1,450.00' }
        : activeTemplateId === 'specimen_tube'
        ? { accession: 'ACC-2026-0419', test: 'Semen Analysis (WHO 6th)', uhid: 'UHID-2026-0814', barcodeData: 'ACC20260419' }
        : activeTemplateId === 'wristband'
        ? { patient: 'Devika Sengupta', uhid: 'UHID-2026-0814', bloodGroup: 'B Positive', ward: 'IPD Ward 4 - Bed 12' }
        : { strawId: 'STR-2026-0081', donor: 'UHID-2026-0814', tank: 'Tank 02 / Canister C4', temp: '-196°C' }
    });
  };

  const handleBrowserSpoolerTrigger = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 118, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}
          >
            <Printer size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Configured Devices
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {totalPrinters} Printers
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ready / Online
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#16A34A' }}>
              {activePrinters} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ {totalPrinters}</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Default Receipt
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {defaultReceiptPrinter}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9333EA'
            }}
          >
            <Barcode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Default Barcode
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {defaultSpecimenPrinter}
            </div>
          </div>
        </Card>
      </div>

      {/* Honest Device Status Banner */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#1E40AF'
        }}
      >
        <Info size={16} style={{ flexShrink: 0, color: '#2563EB' }} />
        <span>
          <strong>Spooler Integration Notice:</strong> Printing uses the operating system print spooler via CSS page-size media rules (@page 80mm / 50mm). Physical hardware handshake requires direct driver or raw USB communication service on this workstation.
        </span>
      </div>

      {/* Section 1: Registered Printers Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-subtle)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Registered Hospital Printer Devices ({printers.length})
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Configure thermal receipt, barcode label, wristband, and report printing stations.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Register New Printer
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
                <th style={{ padding: '10px 14px' }}>Device Name & Model</th>
                <th style={{ padding: '10px 14px' }}>Interface & Port</th>
                <th style={{ padding: '10px 14px' }}>Type & Media</th>
                <th style={{ padding: '10px 14px' }}>Default Role</th>
                <th style={{ padding: '10px 14px' }}>Status & Last Test</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {printers.map((p) => {
                const isSelected = selectedPrinter?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPrinter(p)}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.04)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {p.role}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                        {p.interface}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '500' }}>{p.type}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {p.paperWidth}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {p.isDefaultReceipt && <Badge variant="teal" size="sm">Default Receipt</Badge>}
                        {p.isDefaultSpecimen && <Badge variant="blue" size="sm">Default Specimen</Badge>}
                        {p.isDefaultWristband && <Badge variant="purple" size="sm">Default Wristband</Badge>}
                        {p.isDefaultCryo && <Badge variant="amber" size="sm">Default Cryo-Tag</Badge>}
                        {!p.isDefaultReceipt && !p.isDefaultSpecimen && !p.isDefaultWristband && !p.isDefaultCryo && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Secondary / Backup</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                        <span style={{ fontWeight: '600', color: '#16A34A', fontSize: '0.75rem' }}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Checked: {p.lastTested}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Printer}
                          onClick={() => handleExecuteTestPrint(p)}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleOpenEditModal(p)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => setDeleteConfirmPrinter(p)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Barcode & Thermal Label Designer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Left: Designer Controls */}
        <Card style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sliders size={18} style={{ color: 'var(--color-teal)' }} />
            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Label Layout & Symbology Designer
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px' }}>
                Template Format Preset
              </label>
              <select
                value={activeTemplateId}
                onChange={(e) => setActiveTemplateId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                {LABEL_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.width} x {t.height})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px' }}>
                  Barcode Symbology
                </label>
                <select
                  value={barcodeSymbology}
                  onChange={(e) => setBarcodeSymbology(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {BARCODE_SYMBOLOGIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px' }}>
                  Alignment
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => setAlignment(align)}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: alignment === align ? 'var(--color-teal)' : '#FFFFFF',
                        color: alignment === align ? '#FFFFFF' : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Barcode Height ({barcodeHeight}px)
                </label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  step="2"
                  value={barcodeHeight}
                  onChange={(e) => setBarcodeHeight(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-teal)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Thermal Density ({printDensity})
                </label>
                <input
                  type="range"
                  min="4"
                  max="15"
                  step="1"
                  value={printDensity}
                  onChange={(e) => setPrintDensity(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-teal)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                <input
                  type="checkbox"
                  checked={includeHumanReadable}
                  onChange={(e) => setIncludeHumanReadable(e.target.checked)}
                  style={{ accentColor: 'var(--color-teal)' }}
                />
                <span style={{ fontWeight: '500' }}>Render Human-Readable Monospace Text Below Barcode</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => handleExecuteTestPrint()}
              >
                Dispatch Test Label
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBarcodeHeight(48);
                  setPrintDensity(10);
                  setAlignment('center');
                  setIncludeHumanReadable(true);
                  if (onNotify) onNotify('Label designer parameters reset to template defaults.');
                }}
              >
                Reset Layout
              </Button>
            </div>
          </div>
        </Card>

        {/* Right: Live Visual Label Preview */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                Live Label Sample Preview
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {activeTemplate.name}
              </p>
            </div>
            <Badge variant="teal" size="sm">{barcodeSymbology}</Badge>
          </div>

          <div
            style={{
              padding: '24px',
              backgroundColor: '#F1F5F9',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Visual Label Mock Card */}
            {activeTemplateId === 'pos_receipt' && (
              <div
                style={{
                  width: '280px',
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '2px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: '#1E293B',
                  textAlign: alignment
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>MEDICSPRIME HOSPITALS</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>OPD CASHIER COUNTER #1</div>
                  <div style={{ fontSize: '0.65rem' }}>TAX INVOICE: RCPT-2026-9921</div>
                </div>

                <div style={{ lineHeight: '1.4', marginBottom: '8px' }}>
                  <div>PATIENT: Suresh Chandra Pal</div>
                  <div>UHID: UHID-2026-0511</div>
                  <div>DATE: 29-OCT-2026 12:45 PM</div>
                </div>

                <div style={{ borderTop: '1px dashed #94A3B8', borderBottom: '1px dashed #94A3B8', padding: '6px 0', margin: '6px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>OPD CONSULTATION</span>
                    <span>₹ 1,000.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>FASTING GLUCOSE LAB</span>
                    <span>₹ 450.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '4px' }}>
                    <span>TOTAL PAID (UPI)</span>
                    <span>₹ 1,450.00</span>
                  </div>
                </div>

                {/* Barcode/QR render */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: alignment === 'center' ? 'center' : alignment === 'left' ? 'flex-start' : 'flex-end', margin: '12px 0 4px 0' }}>
                  <div
                    style={{
                      height: `${barcodeHeight}px`,
                      width: '180px',
                      background: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 7px, transparent 7px, transparent 9px, #000 9px, #000 13px, transparent 13px, transparent 15px)',
                      borderRadius: '1px'
                    }}
                  />
                  {includeHumanReadable && (
                    <div style={{ fontSize: '0.68rem', letterSpacing: '1px', marginTop: '3px' }}>
                      RCPT-2026-9921
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#64748B', marginTop: '8px' }}>
                  *** THANK YOU - WISHING YOU GOOD HEALTH ***
                </div>
              </div>
            )}

            {activeTemplateId === 'specimen_tube' && (
              <div
                style={{
                  width: '260px',
                  backgroundColor: '#FFFFFF',
                  padding: '12px 14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: '#1E293B',
                  textAlign: alignment
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>ANDROLOGY / LIS</span>
                  <span style={{ color: '#0F766E', fontWeight: 'bold' }}>SEMEN SPEC</span>
                </div>

                <div style={{ lineHeight: '1.3', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>ACC: ACC-2026-0419</div>
                  <div>Devika & Rahul Sengupta</div>
                  <div>UHID-2026-0814 | M/34Y</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B' }}>COLL: 29-OCT 10:15 AM | WHO-6TH</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: alignment === 'center' ? 'center' : alignment === 'left' ? 'flex-start' : 'flex-end' }}>
                  <div
                    style={{
                      height: `${barcodeHeight}px`,
                      width: '210px',
                      background: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 6px, transparent 6px, transparent 9px, #000 9px, #000 12px, transparent 12px, transparent 14px)',
                      borderRadius: '1px'
                    }}
                  />
                  {includeHumanReadable && (
                    <div style={{ fontSize: '0.70rem', letterSpacing: '2px', fontWeight: 'bold', marginTop: '3px' }}>
                      *ACC20260419*
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTemplateId === 'wristband' && (
              <div
                style={{
                  width: '340px',
                  height: '75px',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 12px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontFamily: 'sans-serif',
                  fontSize: '0.68rem',
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#0F766E' }}>SENGUPTA, DEVIKA</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>UHID-2026-0814 | F/31Y</div>
                  <div>IPD WARD 4 - BED 12</div>
                  <div style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '0.62rem' }}>ALLERGY: PENICILLIN | B+ POS</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <QrCode size={46} />
                  <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', marginTop: '2px' }}>UHID-2026-0814</span>
                </div>
              </div>
            )}

            {activeTemplateId === 'cryo_straw' && (
              <div
                style={{
                  width: '220px',
                  backgroundColor: '#FFFFFF',
                  padding: '8px 10px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '3px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#1E293B',
                  lineHeight: '1.3'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0F766E', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
                  CRYO-TAG: STR-2026-0081
                </div>
                <div>UHID-2026-0814 (Sengupta)</div>
                <div>LN2: TANK-02 / CANISTER-C4</div>
                <div style={{ fontSize: '0.58rem', color: '#64748B' }}>FROZEN: 29-OCT-2026 (-196°C)</div>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <QrCode size={26} />
                  <span style={{ fontSize: '0.60rem' }}>SAFE ART SECURED</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add / Edit Printer Modal */}
      {isAddEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingPrinter ? `Edit Printer: ${editingPrinter.name}` : 'Register New Hospital Printer'}
        >
          <form onSubmit={handleSavePrinterForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Printer Device Name *
              </label>
              <Input
                type="text"
                value={printerForm.name}
                onChange={(e) => setPrinterForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Zebra ZD420 Lab Barcode Unit"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Printer Type
                </label>
                <select
                  value={printerForm.type}
                  onChange={(e) => setPrinterForm(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {PRINTER_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Connection Interface
                </label>
                <select
                  value={printerForm.interface}
                  onChange={(e) => setPrinterForm(prev => ({ ...prev, interface: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                >
                  {CONNECTION_INTERFACES.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Operational Role & Department
              </label>
              <Input
                type="text"
                value={printerForm.role}
                onChange={(e) => setPrinterForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Outpatient POS Cashier Counter #2"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Paper / Label Size
                </label>
                <Input
                  type="text"
                  value={printerForm.paperWidth}
                  onChange={(e) => setPrinterForm(prev => ({ ...prev, paperWidth: e.target.value }))}
                  placeholder="e.g. 80mm Roll or 50x25mm"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Default Print Density
                </label>
                <Input
                  type="number"
                  min="4"
                  max="15"
                  value={printerForm.defaultDensity}
                  onChange={(e) => setPrinterForm(prev => ({ ...prev, defaultDensity: parseInt(e.target.value, 10) }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
              >
                {editingPrinter ? 'Save Changes' : 'Register Printer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPrinter && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmPrinter(null)}
          title="Remove Printer Configuration"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              Are you sure you want to remove <strong>{deleteConfirmPrinter.name}</strong> from the workstation configuration? Workstations routing jobs to this device will fall back to the system default printer.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmPrinter(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                onClick={handleConfirmDelete}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Test Print Spooler Modal */}
      {testPrintModal && (
        <Modal
          isOpen={true}
          onClose={() => setTestPrintModal(null)}
          title={`Test Print Job: ${testPrintModal.printer.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span>
                Spooler payload prepared for <strong>{testPrintModal.printer.name}</strong> ({testPrintModal.printer.interface}).
              </span>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <div>JOB ID: TST-PRN-{Date.now().toString().slice(-6)}</div>
              <div>TIME: {testPrintModal.dispatchedAt}</div>
              <div>TEMPLATE: {testPrintModal.template.name}</div>
              <div>SYMBOLOGY: {testPrintModal.symbology}</div>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Click <strong>Launch Browser Spooler</strong> to send this test page directly to the operating system print subsystem using CSS print media.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                variant="outline"
                onClick={() => setTestPrintModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                icon={Printer}
                onClick={handleBrowserSpoolerTrigger}
              >
                Launch Browser Spooler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
