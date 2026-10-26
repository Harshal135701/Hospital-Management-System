import React, { useState } from 'react';
import {
  Download,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Select } from '../../common/UIPrimitives';

export function AnalyticsExportGroup({ activeSubtab = '32.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [notification, setNotification] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
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
    const headers = ['Invoice No', 'Date', 'Patient Name', 'UHID', 'Department', 'Gross Amount', 'Discount', 'Net Amount', 'Payment Mode'];
    const rows = [
      ['INV-2026-901', '2026-10-24', 'Devika Sengupta', 'UHID-2026-0814', 'General Medicine', '1500', '0', '1500', 'UPI QR'],
      ['INV-2026-902', '2026-10-24', 'Rajesh Verma', 'UHID-2026-0922', 'General Medicine', '2200', '200', '2000', 'Cash'],
      ['INV-2026-903', '2026-10-23', 'Rameshwar Teli', 'UHID-2026-0412', 'Inpatient Ward', '34500', '1500', '33000', 'Credit TPA'],
      ['INV-2026-904', '2026-10-23', 'Amina Khatun', 'UHID-2026-1045', 'Obstetrics & Gynae', '1800', '0', '1800', 'Debit Card']
    ];
    downloadClientCsv('medicsprime-billing-export', rows, headers);
  };

  const handleExportInventory = () => {
    const headers = ['Item Code', 'Material Name', 'Category', 'Store', 'Unit Cost', 'Current Stock', 'Min Buffer', 'Stock Value'];
    const rows = [
      ['MED-IV-01', 'Ringer Lactate Infusion 500ml', 'Infusion Solutions', 'Main Store', '48.00', '450', '100', '21600.00'],
      ['SURG-GLV-75', 'Sterile Surgical Gloves 7.5', 'Surgical Consumables', 'OT Store', '35.00', '85', '150', '2975.00'],
      ['MED-INJ-P40', 'Pantoprazole 40mg IV Injection', 'Gastroenterology', 'Main Store', '62.00', '320', '80', '19840.00'],
      ['DISP-SYR-05', 'Disposable Syringe 5ml', 'General Consumables', 'Ward 3', '6.50', '25', '200', '162.50'],
      ['SURG-SUT-20', 'Vicryl 2-0 Suture', 'Sutures & Ligatures', 'OT Store', '1450.00', '42', '20', '60900.00']
    ];
    downloadClientCsv('medicsprime-inventory-audit-export', rows, headers);
  };

  const handleExportSystem = () => {
    const headers = ['Timestamp', 'User', 'Module', 'Event Type', 'Details', 'Compliance Status'];
    const rows = [
      ['2026-10-25 09:22:14', 'nurse.reena', 'Ward Nursing', 'MEDICATION_ADMINISTERED', 'Inj Pantoprazole given', 'Verified'],
      ['2026-10-25 09:18:02', 'dr.arindam', 'OPD Clinic', 'PRESCRIPTION_GENERATED', 'Rx generated', 'Verified'],
      ['2026-10-25 09:05:40', 'cashier.amit', 'Billing POS', 'RECEIPT_COLLECTED', 'Collected Rs 1450', 'Verified'],
      ['2026-10-25 08:44:11', 'admin.super', 'RBAC Setup', 'PERMISSION_OVERRIDE', 'Granted override', 'Security Flag']
    ];
    downloadClientCsv('medicsprime-system-audit-dump', rows, headers);
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

      {/* SUBMODULE 32.1: Cross-Module Analytics */}
      {activeSubtab === '32.1' && (
        <Card
          title="Billing, Inventory, Purchase & Operational Analytics"
          subtitle="Hospital KPI performance dashboards, revenue velocity, stock consumption, and departmental metrics"
          action={
            <div style={{ width: '180px' }}>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={['Today', 'This Week', 'Last 30 Days', 'Current Quarter', 'Year to Date']}
              />
            </div>
          }
        >
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>TOTAL HOSPITAL REVENUE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#15803D', marginTop: '4px' }}>₹48,25,400</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>↑ 14.2% vs previous month</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(100,216,208,0.3)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>ACTIVE INVENTORY VALUATION</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>₹1,12,40,000</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Consumables, drugs, and surgical packs</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#B45309' }}>MONTHLY PURCHASE COMMITMENT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#92400E', marginTop: '4px' }}>₹24,80,000</div>
              <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '4px' }}>24 Purchase Orders issued</div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#EEF2FF', borderRadius: 'var(--radius-md)', border: '1px solid #C7D2FE' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4338CA' }}>BED OCCUPANCY RATE (BOR)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3730A3', marginTop: '4px' }}>78.4%</div>
              <div style={{ fontSize: '0.75rem', color: '#4338CA', marginTop: '4px' }}>NABH optimal range benchmark</div>
            </div>
          </div>

          {/* Graphical Analytics Charts (Pure CSS / SVG data visualization matching Billing) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '18px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.88rem' }}>Monthly Revenue vs Inventory Consumption (₹ Lakhs)</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '180px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                {[
                  { month: 'May', rev: 38, cost: 18 },
                  { month: 'Jun', rev: 41, cost: 20 },
                  { month: 'Jul', rev: 44, cost: 21 },
                  { month: 'Aug', rev: 42, cost: 22 },
                  { month: 'Sep', rev: 46, cost: 23 },
                  { month: 'Oct', rev: 48, cost: 24 }
                ].map((bar, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: `${(bar.rev / 55) * 100}%`,
                          backgroundColor: 'var(--color-primary-teal)',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Revenue: ₹${bar.rev} Lakhs`}
                      />
                      <div
                        style={{
                          width: '18px',
                          height: `${(bar.cost / 55) * 100}%`,
                          backgroundColor: '#F59E0B',
                          borderRadius: '4px 4px 0 0'
                        }}
                        title={`Consumption: ₹${bar.cost} Lakhs`}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{bar.month}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.72rem', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary-teal)', borderRadius: '2px' }} />
                  <span>Gross Hospital Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                  <span>Pharmacy & Consumables Cost</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.88rem' }}>Stock Consumption by Specialty</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Operation Theatre Complex</span>
                    <strong>38% (₹9.1L)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '38%', height: '100%', backgroundColor: 'var(--color-primary-teal)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>ICU & Critical Care</span>
                    <strong>26% (₹6.2L)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '26%', height: '100%', backgroundColor: '#0D9488' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Inpatient Wards (General & Private)</span>
                    <strong>20% (₹4.8L)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '20%', height: '100%', backgroundColor: '#14B8A6' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Emergency Trauma Bay</span>
                    <strong>16% (₹3.8L)</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '16%', height: '100%', backgroundColor: '#2DD4BF' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.2: Billing Data Export */}
      {activeSubtab === '32.2' && (
        <Card
          title="Financial & Billing Data Export Engine"
          subtitle="Generate GST outward returns (GSTR-1), TPA receivables aging, and cashier settlement spreadsheets"
        >
          <div style={{ padding: '18px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700' }}>Comprehensive Billing & Revenue Dataset</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Contains itemized OPD/IPD invoices, GST tax breakdowns, insurance co-pay, and cashier reconciliations.
              </div>
            </div>
            <Button variant="primary" icon={Download} onClick={handleExportBilling}>
              Download Billing CSV
            </Button>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.3: System Data Export */}
      {activeSubtab === '32.3' && (
        <Card
          title="System Security & Clinical Audit Data Export"
          subtitle="Generate encrypted system audit logs, compliance reports, and user activity dumps"
        >
          <div style={{ padding: '18px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700' }}>System Audit & Security Event Dump</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Immutable ISO-27001 / HIPAA audit trail of user sessions, clinical modifications, and admin overrides.
              </div>
            </div>
            <Button variant="primary" icon={Download} onClick={handleExportSystem}>
              Download System Audit CSV
            </Button>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.4: Executive KPI Dashboard Widgets */}
      {activeSubtab === '32.4' && (
        <Card
          title="Executive Hospital KPI Dashboard Widgets"
          subtitle="Bed Occupancy Rate (BOR), Average Length of Stay (ALOS), OT Turnaround Time, and Cash Collections"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>AVERAGE LENGTH OF STAY (ALOS)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>3.4 Days</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '4px' }}>Optimal clinical discharge turnaround</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>OT UTILIZATION INDEX</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>82.1%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', marginTop: '4px' }}>4 suites active across 2 shifts</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.5: Tabular Data Export (Excel / CSV) */}
      {activeSubtab === '32.5' && (
        <Card
          title="Direct Tabular Data Export (Genuine Client-Side CSV Download)"
          subtitle="Export live inventory catalogues, stock reorder alerts, and physical audit reconciliation tables"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '18px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700' }}>Active Material Stock & Reorder Levels</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Download CSV of all 8 item master consumables with physical counts, current stock, and valuation.
                </div>
              </div>
              <Button variant="primary" icon={Download} onClick={handleExportInventory}>
                Export Inventory CSV
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
