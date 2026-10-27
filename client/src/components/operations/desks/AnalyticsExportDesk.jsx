import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Database,
  Activity,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Layers,
  Building2,
  Users
} from 'lucide-react';
import { Card, Button, Badge, Select } from '../../common/UIPrimitives';

export function AnalyticsExportDesk({
  activeSubtab = '32.1',
  currentUser = null,
  onNavigateSubmodule
}) {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Robust Client-Side CSV Generator
  const downloadClientCsv = (filename, rows, headers) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(val => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
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
    showToast(`Generated & downloaded ${filename}.csv successfully.`);
  };

  // Export 1: Billing & Statutory Revenue (32.2 & 32.4)
  const handleExportBilling = () => {
    const headers = ['Invoice No', 'Date', 'UHID', 'Patient Name', 'Encounter Type', 'Department', 'Subtotal (INR)', 'GST Tax (INR)', 'Total Amount (INR)', 'Settlement Mode', 'Status'];
    const rows = [
      ['INV-2026-901', '2026-10-27', 'UHID-2026-0814', 'Devika Sengupta', 'OPD Clinic', 'General Medicine', '1380.00', '135.50', '1515.50', 'UPI QR', 'Settled'],
      ['INV-2026-902', '2026-10-26', 'UHID-2026-0412', 'Bikram Ghosh', 'Inpatient Ward', 'General Surgery', '45200.00', '5424.00', '50624.00', 'Credit Card', 'Settled'],
      ['INV-2026-903', '2026-10-25', 'UHID-2026-0119', 'Amitava Das', 'Emergency', 'Trauma Care', '8500.00', '1020.00', '9520.00', 'Cash Counter', 'Settled'],
      ['INV-2026-904', '2026-10-24', 'UHID-2026-0745', 'Rekha Sharma', 'OPD Clinic', 'Obstetrics & Gynaecology', '1200.00', '144.00', '1344.00', 'UPI QR', 'Settled'],
      ['INV-2026-905', '2026-10-23', 'UHID-2026-0633', 'Kunal Sen', 'Day Care', 'Dialysis Bay', '3400.00', '408.00', '3808.00', 'TPA Cashless', 'Settled'],
      ['INV-2026-906', '2026-10-22', 'UHID-2026-0920', 'Anita Paul', 'OPD Clinic', 'Pediatrics', '1450.00', '174.00', '1624.00', 'Cash Counter', 'Settled']
    ];
    downloadClientCsv('sarji-hospital-billing-revenue-report', rows, headers);
  };

  // Export 2: System & Clinical Audit Log (32.2 & 32.4)
  const handleExportAudit = () => {
    const headers = ['Audit ID', 'Timestamp', 'Staff Actor', 'Role', 'Category', 'Action Type', 'Resource Entity', 'Details', 'Terminal IP', 'Status'];
    const rows = [
      ['AUD-8801', '2026-10-27 10:14:22', 'Dr. Arindam Mitra', 'clinician_doctor', 'Clinical Care', 'MEDICATION_ORDER', 'UHID-2026-0814', 'Prescribed Tab Augmentin 625 Duo TID x 5 days', '192.168.1.42', 'Success'],
      ['AUD-8802', '2026-10-27 10:02:15', 'Priya Das', 'receptionist', 'Billing & POS', 'INVOICE_SETTLEMENT', 'INV-2026-901', 'Settled OTC POS Bill Rs 1515.50 via UPI QR', '192.168.1.15', 'Success'],
      ['AUD-8803', '2026-10-27 09:45:00', 'System Administrator', 'super_admin', 'System Security', 'RBAC_UPDATE', 'ROLE:staff_nurse', 'Updated Emergency Clinical override permission', '192.168.1.10', 'Success'],
      ['AUD-8804', '2026-10-27 09:21:40', 'Reena Roy', 'staff_nurse', 'Nursing Admin', 'VITALS_RECORDED', 'BED-101', 'Logged vitals: BP 124/82, SpO2 97%, HR 78', '192.168.1.88', 'Success'],
      ['AUD-8805', '2026-10-27 08:44:11', 'Dr. Rajiv Menon', 'clinician_doctor', 'Radiology PACS', 'REPORT_AUTHORIZED', 'ACC-2026-XR-8137', 'Verified and distributed Chest X-Ray report', '192.168.1.66', 'Success']
    ];
    downloadClientCsv('sarji-hospital-system-audit-log', rows, headers);
  };

  // Export 3: Materials & Stock Inventory Consumption (32.4)
  const handleExportInventory = () => {
    const headers = ['Item Code', 'Item Name', 'Category', 'Unit', 'Store Location', 'Opening Stock', 'Consumed Qty', 'Closing Stock', 'Unit Cost (INR)', 'Valuation (INR)'];
    const rows = [
      ['MED-IV-01', 'Ringer Lactate Infusion 500ml', 'Infusions', 'Bottle', 'Central Pharmacy Store', '600', '150', '450', '48.00', '21600.00'],
      ['OTC-01', 'Digital Infrared Forehead Thermometer', 'Diagnostic Device', 'Piece', 'OTC Retail Shelf A-01', '50', '15', '35', '950.00', '33250.00'],
      ['OTC-02', 'Digital Finger Pulse Oximeter OLED', 'Diagnostic Device', 'Piece', 'OTC Retail Shelf A-02', '60', '18', '42', '1100.00', '46200.00'],
      ['SURG-01', 'Disposable Sterile Surgical Gloves (Size 7.5)', 'Consumables', 'Pair', 'OT Sterile Rack B', '1200', '340', '860', '32.00', '27520.00'],
      ['PHARM-01', 'Augmentin 625 Duo Tablet', 'Antibiotics', 'Strip (10s)', 'Inpatient Dispense', '800', '240', '560', '172.40', '96544.00']
    ];
    downloadClientCsv('sarji-hospital-inventory-consumption', rows, headers);
  };

  // Export 4: Work Orders & Engineering SLAs (32.4)
  const handleExportWorkOrders = () => {
    const headers = ['WO Ref', 'Date', 'Title', 'Department', 'Contractor', 'Technician', 'Estimated Cost (INR)', 'Target Date', 'Priority', 'Status'];
    const rows = [
      ['WO-2026-012', '2026-10-24', 'OT 1 AHU Hepa Filter Replacement', 'Biomedical & Engineering', 'BlueStar CleanAir Services', 'Sandeep Roy', '38000', '2026-10-28', 'High', 'Approved'],
      ['WO-2026-013', '2026-10-25', 'Cath Lab UPS Battery Bank Annual Audit', 'Electrical Engineering', 'Schneider Electric APC', 'Anand Verma', '65000', '2026-10-26', 'Urgent', 'In Execution'],
      ['WO-2026-014', '2026-10-26', 'Ward 2 Bedhead Oxygen Pressure Valve Overhaul', 'Facility Maintenance', 'In-house Crew', 'K. Mondal', '14500', '2026-10-31', 'Medium', 'Pending Approval'],
      ['WO-2026-015', '2026-10-22', 'Dialysis RO Plant Membrane Descaling', 'Nephrology Engineering', 'Aquafresh Industrial', 'P. Das', '28000', '2026-10-24', 'High', 'Receipt Confirmed']
    ];
    downloadClientCsv('sarji-hospital-work-orders-report', rows, headers);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1.5px solid #86EFAC',
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

      {/* Global Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.80rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Date Range Filter:
          </span>
          <div style={{ width: '180px' }}>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option>Today (Live Operations)</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter (Q3 FY26)</option>
              <option>Financial Year 2026-27</option>
            </Select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportBilling}>
            Quick Export CSV
          </Button>
        </div>
      </div>

      {/* SUBMODULE 32.1: Billing, Inventory, Purchase & System Analytics */}
      {activeSubtab === '32.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Executive Analytics Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
            <Card style={{ padding: '14px 16px', borderLeft: '4px solid var(--color-primary-teal)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Total Revenue ({dateRange})
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                ₹48,24,650
              </div>
              <div style={{ fontSize: '0.70rem', color: '#16A34A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> +14.2% vs previous period
              </div>
            </Card>

            <Card style={{ padding: '14px 16px', borderLeft: '4px solid #0284C7' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                OTC Retail POS Turnover
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>
                ₹6,18,400
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                1,420 counter transactions
              </div>
            </Card>

            <Card style={{ padding: '14px 16px', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Inventory Stock Turns
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#7C3AED', marginTop: '4px' }}>
                8.4x / Year
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Central Pharmacy & OTC Store
              </div>
            </Card>

            <Card style={{ padding: '14px 16px', borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Maintenance SLA Adherence
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                96.4%
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                34 of 36 work orders on schedule
              </div>
            </Card>
          </div>

          {/* Departmental Revenue & Cost Breakdown */}
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BarChart3 size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.90rem' }}>
                Revenue & Consumption Distribution by Department
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Inpatient Wards & ICU Care', revenue: 2450000, percentage: 51, color: 'var(--color-primary-teal)' },
                { name: 'Operation Theatre Complex', revenue: 1120000, percentage: 23, color: '#0284C7' },
                { name: 'OTC Retail Pharmacy Outpost', revenue: 618400, percentage: 13, color: '#7C3AED' },
                { name: 'Diagnostic Imaging & Radiology', revenue: 420000, percentage: 9, color: '#F59E0B' },
                { name: 'Emergency Trauma Outpatient', revenue: 216250, percentage: 4, color: '#EF4444' }
              ].map((dep) => (
                <div key={dep.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{dep.name}</span>
                    <span style={{ fontWeight: '700' }}>₹{dep.revenue.toLocaleString()} ({dep.percentage}%)</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${dep.percentage}%`, height: '100%', backgroundColor: dep.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* SUBMODULE 32.2: Billing Data Export & System Data Export */}
      {activeSubtab === '32.2' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Database size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Statutory Compliance & System Data Archives (32.2)
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
            Generate statutory audit dossiers, GST outward supply reports (GSTR-1 compatible), and cryptographic clinical audit archives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <DollarSign size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>
                  Statutory GST Billing & Cash Collection
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                Itemized GST breakups (0%, 5%, 12%, 18%), HSN codes, customer UHIDs, and settlement mode ledger.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportBilling}>
                Download Billing CSV
              </Button>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Database size={18} color="#0284C7" />
                <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>
                  System Audit Trail & Security Archives
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                Immutable historical event logs including IP addresses, timestamps, actor accounts, and clinical actions.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportAudit}>
                Download Audit Trail CSV
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.3: Executive KPI Dashboard Widgets */}
      {activeSubtab === '32.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
              <Activity size={18} color="var(--color-primary-teal)" />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                Executive Hospital Operational KPI Widgets (32.3)
              </span>
              <Badge variant="teal" size="sm">
                NABH Benchmark Standards
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {/* BOR */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Bed Occupancy Rate (BOR)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                  84.2%
                </div>
                <div style={{ fontSize: '0.70rem', color: '#16A34A', marginTop: '2px' }}>
                  Benchmark: 80-85% (Optimal)
                </div>
              </div>

              {/* ALOS */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Average Length of Stay (ALOS)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>
                  3.8 Days
                </div>
                <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  General Inpatient Medical/Surgical
                </div>
              </div>

              {/* Daily Footfall */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Daily OPD Clinic Footfall
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#7C3AED', marginTop: '4px' }}>
                  348 Patients
                </div>
                <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Across 18 specialty consultation clinics
                </div>
              </div>

              {/* OT Utilization */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Operation Theatre Utilization
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#F59E0B', marginTop: '4px' }}>
                  78.6%
                </div>
                <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  6 Active Major Theatres
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SUBMODULE 32.4: Tabular Data Export (Excel / CSV) */}
      {activeSubtab === '32.4' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <FileSpreadsheet size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Tabular Hospital Dataset Export Suite (32.4)
            </span>
            <Badge variant="teal" size="sm">
              Standard RFC 4180 CSV / XLSX Ready
            </Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontWeight: '700', fontSize: '0.86rem', marginBottom: '4px' }}>
                1. Billing & Financial Revenue Ledger
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                Full customer invoices, tax subtotals, GST categories, and tender distribution.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportBilling}>
                Export Revenue CSV
              </Button>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontWeight: '700', fontSize: '0.86rem', marginBottom: '4px' }}>
                2. System & Clinical Security Audit Trail
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                Complete read-only audit log with staff actor identities, IP terminals, and event details.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportAudit}>
                Export Audit CSV
              </Button>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontWeight: '700', fontSize: '0.86rem', marginBottom: '4px' }}>
                3. Materials, OTC & Inventory Stock Levels
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                Central store item codes, opening/closing counts, shelf locations, and valuation totals.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportInventory}>
                Export Inventory CSV
              </Button>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontWeight: '700', fontSize: '0.86rem', marginBottom: '4px' }}>
                4. Biomedical & Facility Work Orders
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0 0 10px 0' }}>
                Maintenance contracts, requisition references, cost estimates, and inspection sign-offs.
              </p>
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportWorkOrders}>
                Export Work Orders CSV
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AnalyticsExportDesk;
