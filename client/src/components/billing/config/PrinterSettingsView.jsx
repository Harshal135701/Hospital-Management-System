import React, { useState } from 'react';
import {
  Printer,
  Barcode,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  Settings,
  Sliders,
  FileText,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_PRINTER_SETTINGS } from '../common/billingMockData';

export function PrinterSettingsView() {
  const [printers, setPrinters] = useState(INITIAL_PRINTER_SETTINGS);
  const [selectedPrinter, setSelectedPrinter] = useState(INITIAL_PRINTER_SETTINGS[0]);
  const [activeTemplate, setActiveTemplate] = useState('pos_receipt'); // 'pos_receipt' | 'specimen_tube' | 'wristband' | 'cryo_straw'
  const [barcodeSymbology, setBarcodeSymbology] = useState('Code 128');
  const [printDensity, setPrintDensity] = useState(10);
  const [successBanner, setSuccessBanner] = useState(null);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessBanner(`Printer profile for "${selectedPrinter.name}" saved successfully.`);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const handleTestPrint = () => {
    window.print();
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
            <Badge variant="teal" size="sm">Submodule 2.2</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Barcode & Thermal Printer Hardware Settings
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Configure thermal receipt printers (80mm), specimen tube barcode printers, patient wristbands, and cryo-straw label templates.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Printer}
          onClick={handleTestPrint}
        >
          Print Test Page
        </Button>
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
          <strong>Spooler Integration Notice:</strong> Printing uses the operating system print spooler via CSS page-size media rules (@page 80mm / 50mm). Verify physical paper alignment and thermal ribbon before dispatching production batches.
        </span>
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

      {/* Main Grid: Device List + Active Config + Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left Column: Registered Devices and Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Printer Roster */}
          <Card title="Registered Hardware Printers & Roles">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {printers.map((p) => {
                const isSelected = selectedPrinter.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPrinter(p)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Role: {p.role} • Interface: {p.interface}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '2px' }}>
                        Paper: {p.paperWidth} • Speed: {p.speed}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <Badge variant="success" size="sm">
                        {p.status}
                      </Badge>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {p.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Configuration Form */}
          <Card title={`Configure Settings: ${selectedPrinter.name}`}>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Label Template Selection
                  </label>
                  <select
                    value={activeTemplate}
                    onChange={(e) => setActiveTemplate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                  >
                    <option value="pos_receipt">80mm OPD Financial Receipt</option>
                    <option value="specimen_tube">50mm × 25mm Specimen Tube Label</option>
                    <option value="wristband">25mm × 280mm Patient Wristband</option>
                    <option value="cryo_straw">38mm × 19mm Cryo Straw Label</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                    Barcode Symbology
                  </label>
                  <select
                    value={barcodeSymbology}
                    onChange={(e) => setBarcodeSymbology(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                  >
                    <option value="Code 128">Code 128 (Standard Alpha-Numeric)</option>
                    <option value="QR Code">QR Code 2D High-Density</option>
                    <option value="DataMatrix">DataMatrix 2D (Clinical)</option>
                    <option value="Code 39">Code 39</option>
                  </select>
                </div>

                <Input
                  label="Thermal Darkness / Density (1 - 15)"
                  type="number"
                  min="1"
                  max="15"
                  value={printDensity}
                  onChange={(e) => setPrintDensity(e.target.value)}
                  required
                />

                <Input
                  label="Assigned Port / Network IP"
                  value={selectedPrinter.interface}
                  readOnly
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
                <Button variant="primary" size="sm" type="submit" icon={Save}>
                  Save Device Configuration
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Rendered Label / Receipt Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Live Rendered Label / Ticket Preview">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              {activeTemplate === 'pos_receipt' && (
                <div
                  style={{
                    width: '280px',
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontFamily: 'monospace',
                    fontSize: '0.74rem',
                    lineHeight: 1.4
                  }}
                >
                  <div style={{ textAlign: 'center', borderBottom: '1px dashed #9CA3AF', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>APEX CENTRAL HOSPITAL</div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>80mm Thermal Cashier Desk</div>
                    <div style={{ fontWeight: '700', marginTop: '4px' }}>SAMPLE TEST TICKET</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                    <span>Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ borderBottom: '1px dashed #9CA3AF', paddingBottom: '6px', marginBottom: '6px' }}>
                    <div>Pt: Devika Sengupta</div>
                    <div>UHID: UHID-2026-0814</div>
                    <div>Bill #: OPD-TEST-001</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.85rem', marginBottom: '10px' }}>
                    <span>PAID TOTAL:</span>
                    <span>₹1,450.00</span>
                  </div>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <QrCode size={36} />
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Verified Print Spooler</div>
                  </div>
                </div>
              )}

              {activeTemplate === 'specimen_tube' && (
                <div
                  style={{
                    width: '240px',
                    padding: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #111827',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontFamily: 'monospace',
                    fontSize: '0.72rem',
                    lineHeight: 1.3
                  }}
                >
                  <div style={{ fontWeight: '800', fontSize: '0.78rem' }}>APEX PATH LAB</div>
                  <div style={{ fontWeight: '700' }}>UHID-2026-0814</div>
                  <div>Sengupta, Devika (34Y/F)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                    <div style={{ letterSpacing: '2px', fontWeight: '900', fontSize: '1rem' }}>||||| | ||||| | |||</div>
                  </div>
                  <div style={{ fontSize: '0.65rem' }}>Acc: SA-2026-0481 • Semen Analysis</div>
                </div>
              )}

              {activeTemplate === 'wristband' && (
                <div
                  style={{
                    width: '320px',
                    height: '65px',
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #0D9488',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'sans-serif',
                    fontSize: '0.72rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', color: '#0D9488' }}>UHID-2026-1180</div>
                    <div style={{ fontWeight: '600' }}>BOSE, VIKRAMADITYA</div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>DOB: 12-May-1988 • O+ POS</div>
                  </div>
                  <QrCode size={38} style={{ color: '#0D9488' }} />
                </div>
              )}

              {activeTemplate === 'cryo_straw' && (
                <div
                  style={{
                    width: '220px',
                    padding: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #0369A1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.68rem'
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#0369A1' }}>APEX CRYO-VAULT</div>
                  <div>ID: CRYO-091 • ST-26-901</div>
                  <div>UHID-2026-0814</div>
                  <div style={{ fontSize: '0.62rem', color: '#4B5563', marginTop: '2px' }}>LN2 -196°C • Tank A / Can 02</div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Button variant="outline" size="sm" icon={Printer} onClick={handleTestPrint}>
                Send Test Pattern to {selectedPrinter.name}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
