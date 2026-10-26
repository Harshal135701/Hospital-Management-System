import React, { useState } from 'react';
import {
  Download,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Select } from '../../common/UIPrimitives';

export function AnalyticsExportDesk({ activeSubtab = '32.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [notification, setNotification] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Genuine Client-Side CSV Download Generator
  const downloadClientCsv = (filename, rows, headers) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Generated and downloaded ${filename}.csv successfully!`);
  };

  const handleExportBilling = () => {
    const headers = ['Invoice ID', 'Date', 'UHID', 'Patient Name', 'Encounter Type', 'Department', 'Subtotal', 'Tax Amount', 'Gross Total', 'Settlement Mode'];
    const rows = [
      ['INV-2026-901', '2026-10-24', 'UHID-2026-001', 'Bikram Ghosh', 'OPD Clinic', 'Cardiology', '1800.00', '216.00', '2016.00', 'UPI QR'],
      ['INV-2026-902', '2026-10-23', 'UHID-2026-002', 'Sujata Sen', 'IPD Ward', 'General Surgery', '45200.00', '5424.00', '50624.00', 'TPA Cashless'],
      ['INV-2026-903', '2026-10-22', 'UHID-2026-003', 'Amitava Das', 'Emergency', 'Emergency / Trauma', '8500.00', '1020.00', '9520.00', 'Credit Card'],
      ['INV-2026-904', '2026-10-21', 'UHID-2026-004', 'Rekha Sharma', 'OPD Clinic', 'Gynecology', '1200.00', '144.00', '1344.00', 'Cash Counter']
    ];
    downloadClientCsv('medicsprime-revenue-billing-export', rows, headers);
  };

  const handleExportSystem = () => {
    const headers = ['Audit ID', 'Timestamp', 'User Account', 'Terminal IP', 'Action Type', 'Resource Entity', 'Details'];
    const rows = [
      ['AUD-101', '2026-10-24 10:14', 'Dr. Arindam Mitra', '192.168.1.45', 'CLINICAL_DISPENSE', 'UHID-2026-001', 'Dispensed Augmentin 625 Duo'],
      ['AUD-102', '2026-10-24 11:30', 'Cashier Priya Das', '192.168.1.12', 'POS_SETTLEMENT', 'INV-2026-901', 'Settled via UPI GPay'],
      ['AUD-103', '2026-10-24 14:05', 'Admin Rajesh K', '192.168.1.99', 'CONFIG_UPDATE', 'SYS_EVENT', 'Modified Panic Webhook']
    ];
    downloadClientCsv('medicsprime-system-audit-export', rows, headers);
  };

  const handleExportMaterials = () => {
    const headers = ['Item Code', 'Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit Price', 'Location'];
    const rows = [
      ['MED-001', 'Augmentin 625 Duo Tablet', 'Antibiotic', '240', '100', '19.50', 'Main Rack A-01'],
      ['MED-002', 'Paracetamol 650mg (Dolo)', 'Antipyretic', '1400', '500', '2.80', 'Main Rack A-02'],
      ['MED-003', 'Meropenem 1g Injection', 'Critical Injectable', '45', '80', '850.00', 'Cold Storage 2°C-8°C'],
      ['MED-004', 'Pantoprazole 40mg IV', 'PPI Injectable', '620', '200', '48.00', 'Main Rack B-04']
    ];
    downloadClientCsv('medicsprime-inventory-stock-export', rows, headers);
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

      {/* SUBMODULE 32.1: ANALYTICS: Billing, Inventory, Purchase, System Analytics */}
      {activeSubtab === '32.1' && (
        <Card
          title="32.1 ANALYTICS: Hospital Operations, Billing, Inventory & Purchase Analytics"
          subtitle="Real-time clinical operational statistics, department revenue velocity, material turn-around time, and inventory consumption trends"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.80rem', fontWeight: 600 }}>Analytics Reporting Period:</span>
            <Select
              label=""
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'Today', label: 'Today (Real-Time)' },
                { value: 'Last 7 Days', label: 'Last 7 Days' },
                { value: 'Last 30 Days', label: 'Last 30 Days' },
                { value: 'Current Quarter', label: 'Current Quarter (Q3 2026)' },
                { value: 'Fiscal Year', label: 'Fiscal Year (FY 2026-27)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {/* Chart Simulation 1: Department Revenue */}
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', color: 'var(--color-primary-teal)' }}>
                Department Revenue Contribution ({dateRange})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { dept: 'Operation Theatre & Surgery', share: '38%', amt: '₹42,50,000', color: '#0284C7' },
                  { dept: 'Inpatient General & HDU Beds', share: '26%', amt: '₹29,10,000', color: '#0D9488' },
                  { dept: 'Pharmacy & OTC Retail', share: '18%', amt: '₹20,15,000', color: '#16A34A' },
                  { dept: 'Radiology PACS & Pathology', share: '12%', amt: '₹13,44,000', color: '#7C3AED' },
                  { dept: 'Outpatient Consultations', share: '6%', amt: '₹6,72,000', color: '#D97706' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '2px' }}>
                      <span>{item.dept}</span>
                      <span style={{ fontWeight: 700 }}>{item.amt} ({item.share})</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: item.share, height: '100%', backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Simulation 2: Inventory Turn-Around */}
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', color: '#166534' }}>
                Material Inventory Turn-Around Ratio & Stock Velocity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { group: 'Essential Antibiotics & Oral Tablets', ratio: '8.4x / Year', status: 'Optimal' },
                  { group: 'IV Fluids & Critical Injectables', ratio: '12.2x / Year', status: 'High Velocity' },
                  { group: 'Surgical Consumables & Sutures', ratio: '6.1x / Year', status: 'Normal' },
                  { group: 'Biomedical Spares & Filters', ratio: '2.4x / Year', status: 'Buffer Stock' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.group}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-teal)' }}>{item.ratio}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.2: DATA EXPORT: Billing Data Export, System Data Export */}
      {activeSubtab === '32.2' && (
        <Card
          title="32.2 DATA EXPORT: Financial Billing & System Security Compliance Datasets"
          subtitle="Generate itemized tax invoices, GSTR compliance returns, TPA receivables, and immutable system audit log files"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>1. Financial Billing & Revenue Dataset</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Contains itemized OPD/IPD invoices, GST breakdowns (CGST + SGST), insurance cashless co-pay, and cashier reconciliations.
                </div>
              </div>
              <Button variant="primary" icon={Download} onClick={handleExportBilling}>
                Download Billing CSV File
              </Button>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>2. System Audit & Security Event Dump</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Immutable ISO-27001 / HIPAA audit trail of user sessions, clinical modifications, prescription edits, and admin overrides.
                </div>
              </div>
              <Button variant="primary" icon={Download} onClick={handleExportSystem}>
                Download System Audit CSV
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.3: Executive KPI Dashboard Widgets */}
      {activeSubtab === '32.3' && (
        <Card
          title="32.3 Executive Hospital KPI Dashboard Widgets"
          subtitle="Bed Occupancy Rate (BOR), Average Length of Stay (ALOS), OT Utilization Index, and Cash Collection Velocity"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>BED OCCUPANCY RATE (BOR)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-teal)' }}>87.4%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', marginTop: '2px' }}>175 / 200 operational beds occupied</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>AVERAGE LENGTH OF STAY (ALOS)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#166534' }}>3.4 Days</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', marginTop: '2px' }}>Optimal clinical discharge turnover</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>OT THEATRE UTILIZATION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#7C3AED' }}>82.1%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>4 suites active across 2 surgical shifts</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>CASH COLLECTION RATIO</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#D97706' }}>96.8%</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-success)', marginTop: '2px' }}>Instant UPI / Card settlement on counter</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.4: Tabular Data Export (Excel / CSV) */}
      {(activeSubtab === '32.4' || activeSubtab === '32.5') && (
        <Card
          title="32.4 Tabular Data Export (Excel / CSV)"
          subtitle="Direct client-side spreadsheet generation for material inventory stock, supplier rate comparison, and work order audit records"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Active Material Stock & Reorder Levels Dataset</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Complete inventory catalogue containing item codes, batch numbers, storage racks, and safety buffer thresholds.
                </div>
              </div>
              <Button variant="primary" icon={Download} onClick={handleExportMaterials}>
                Export Stock CSV
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
