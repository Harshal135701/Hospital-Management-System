import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Calendar,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  DollarSign,
  PieChart,
  HardDrive,
  Cpu,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Check,
  Building2,
  Lock
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  ANALYTICS_SUBMODULES,
  KPI_SUMMARY,
  DEPARTMENT_METRICS,
  SAMPLE_EXPORT_DATA
} from './analyticsConstants';

export function AnalyticsView({ initialSubtab = '32.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('32.')) return initialSubtab;
    return '32.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = ANALYTICS_SUBMODULES.find(s => s.id === (initialSubtab || '32.1'));
    return parent?.subsubmodules[0]?.id || '32.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('analytics:', '');
      if (ANALYTICS_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || ANALYTICS_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`analytics:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`analytics:${activeSubtab}:${subsubId}`);
    }
  };

  // State: Export Column Query Builder
  const [selectedColumns, setSelectedColumns] = useState({
    uhid: true,
    name: true,
    dept: true,
    doctor: true,
    billAmount: true,
    paidAmount: true,
    payMode: true,
    status: true,
    date: true
  });

  const [phiMaskingEnabled, setPhiMaskingEnabled] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState('2026-10-01');
  const [exportDateTo, setExportDateTo] = useState('2026-10-27');
  const [exportDepartment, setExportDepartment] = useState('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // CSV Generator & Downloader
  const handleDownloadCSV = () => {
    const activeCols = Object.keys(selectedColumns).filter(k => selectedColumns[k]);
    if (activeCols.length === 0) {
      triggerToast('Error: Please select at least one column to export.');
      return;
    }

    const headers = activeCols.join(',');
    const rows = SAMPLE_EXPORT_DATA.map(item => {
      return activeCols.map(col => {
        let val = item[col] ?? '';
        if (phiMaskingEnabled && col === 'name') {
          val = `${val.substring(0, 2)}***`;
        }
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sarji_Financial_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('Tabular CSV file successfully generated and downloaded.');
  };

  const activeSubmoduleObj = ANALYTICS_SUBMODULES.find(s => s.id === activeSubtab) || ANALYTICS_SUBMODULES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            backgroundColor: '#0A4174',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(10, 65, 116, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: '600',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Enterprise Header Banner */}
      <div
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(8, 127, 140, 0.15)'
              }}
            >
              <BarChart3 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Enterprise Analytics & Comprehensive Data Export
                </h1>
                <Badge variant="teal">Enterprise BI & Data Governance</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                Executive command telemetry, departmental revenues, clinical quality indicators (NABH), query builder, and tabular Excel / CSV downloads.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(8, 127, 140, 0.25)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: 'var(--color-primary-teal)'
              }}
            >
              <Activity size={14} color="var(--color-primary-teal)" />
              <span>Census: <strong>{KPI_SUMMARY.occupiedBeds} / {KPI_SUMMARY.totalBeds} ({KPI_SUMMARY.occupancyRate}%)</strong></span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: '#065F46'
              }}
            >
              <DollarSign size={14} color="#10B981" />
              <span>Daily Run: <strong>₹{(KPI_SUMMARY.dailyRevenue / 100000).toFixed(2)} Lakhs</strong></span>
            </div>
          </div>
        </div>

        {/* Level 2 Submodule Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--color-border)',
            overflowX: 'auto',
            paddingBottom: '2px',
            marginTop: '8px'
          }}
        >
          {ANALYTICS_SUBMODULES.map(tab => {
            const Icon = tab.icon || BarChart3;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSubtab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                  borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  marginBottom: '-1.5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level 3 Subsubmodule Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Workflows:
          </span>
          {ANALYTICS_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
            const isSubsubActive = activeSubsubtab === subsub.id;
            return (
              <button
                key={subsub.id}
                type="button"
                onClick={() => handleSelectSubsubtab(subsub.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSubsubActive ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSubsubActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSubsubActive ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'
                  }}
                />
                {subsub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBMODULE 32.1: CROSS-FUNCTIONAL ANALYTICS */}
      {activeSubtab === '32.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 32.1.1: Billing & Revenue */}
          {(activeSubsubtab === '32.1.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                32.1.1 Hospital Billing & Revenue Stream Analytics
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Multi-channel settlement breakdown: TPA cashless, Cash/UPI POS, and corporate insurance claims.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>TPA & Insurance Claims</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0A4174', margin: '4px 0' }}>₹7,25,000</div>
                  <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '600' }}>49% of Total Daily Settlement</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>Cash & UPI POS Counters</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>₹6,12,000</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '600' }}>41% of Total Daily Settlement</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>Corporate Credit & MoU</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>₹1,45,500</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '600' }}>10% of Total Daily Settlement</div>
                </div>
              </div>

              {/* Graphical distribution bar */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>
                  <span>Payment Channels Split</span>
                  <span>Total: ₹14,82,500</span>
                </div>
                <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
                  <div style={{ width: '49%', backgroundColor: '#0A4174' }} title="TPA: 49%" />
                  <div style={{ width: '41%', backgroundColor: '#49769F' }} title="Cash/UPI: 41%" />
                  <div style={{ width: '10%', backgroundColor: '#94A3B8' }} title="Corporate: 10%" />
                </div>
              </div>
            </Card>
          )}

          {/* 32.1.2: Inventory Analytics */}
          {activeSubsubtab === '32.1.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                32.1.2 Pharmacy Stock & Material Consumption Telemetry
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Real-time stock turnover rates, 90-day expiry forecast, and buffer threshold warnings.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Active Catalog SKUs</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0A4174' }}>4,820 Items</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Buffer Underflow Alert</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#991B1B' }}>18 SKUs Critical</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D' }}>
                  <div style={{ fontSize: '0.75rem', color: '#92400E' }}>90-Day Expiry Forecast</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#B45309' }}>14 Batches (₹84.2K)</div>
                </div>
              </div>
            </Card>
          )}

          {/* 32.1.3 & 32.1.4: Purchase & System Analytics */}
          {(activeSubsubtab === '32.1.3' || activeSubsubtab === '32.1.4') && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                Purchase Fulfillment Velocity & System Infrastructure Health
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Vendor lead times, ASTM analyzer interfacing packet queues, and server response times.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid rgba(73, 118, 159, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#0A4174', fontWeight: '600' }}>Vendor Average Lead Time</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0A4174' }}>3.4 Days</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>API Response Latency p95</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10B981' }}>42 ms</div>
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>LIS Analyzer ASTM Traffic</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A' }}>1,420 pkts/hr</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 32.2: DATA EXPORT WIZARD */}
      {activeSubtab === '32.2' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
            32.2 Billing & System Master Data Export Wizard
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
            Generate authenticated financial ledgers, clinical summaries, or schedule automated midnight SFTP cloud archives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Export From Date
              </label>
              <input
                type="date"
                value={exportDateFrom}
                onChange={(e) => setExportDateFrom(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Export To Date
              </label>
              <input
                type="date"
                value={exportDateTo}
                onChange={(e) => setExportDateTo(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Department Filter
              </label>
              <select
                value={exportDepartment}
                onChange={(e) => setExportDepartment(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              >
                <option value="ALL">All Hospital Departments</option>
                <option value="Cardiology">Cardiology & Cath Lab</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Nephrology">Nephrology</option>
                <option value="IVF">IVF & Fertility</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="teal"
              onClick={handleDownloadCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0A4174' }}
            >
              <Download size={16} />
              <span>Export Audited Billing Ledger (CSV)</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => triggerToast('System & Clinical Audit dump queued for background compression.')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#49769F', color: '#0A4174' }}
            >
              <Database size={16} />
              <span>Export System Audit Trail (JSON Dump)</span>
            </Button>
          </div>
        </Card>
      )}

      {/* SUBMODULE 32.3: EXECUTIVE KPI DASHBOARD */}
      {activeSubtab === '32.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Command Center Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Card style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '600' }}>Inpatient Census</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A4174', margin: '4px 0' }}>
                {KPI_SUMMARY.occupiedBeds} / {KPI_SUMMARY.totalBeds}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '700' }}>
                {KPI_SUMMARY.occupancyRate}% Bed Occupancy
              </div>
            </Card>

            <Card style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '600' }}>Average Length of Stay (ALOS)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A4174', margin: '4px 0' }}>
                {KPI_SUMMARY.alosDays} Days
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '700' }}>
                NABH Target &lt; 4.5 Days (Achieved)
              </div>
            </Card>

            <Card style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '600' }}>Critical Care ICU Census</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0A4174', margin: '4px 0' }}>
                42 / 48 Beds
              </div>
              <div style={{ fontSize: '0.74rem', color: '#F59E0B', fontWeight: '700' }}>
                {KPI_SUMMARY.icuOccupancy}% (6 Standby Available)
              </div>
            </Card>

            <Card style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '600' }}>NABH Infection Rate (HAI)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10B981', margin: '4px 0' }}>
                {KPI_SUMMARY.haiInfectionRate}%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '700' }}>
                Benchmark &lt; 1.0% (Zero Catheter Infections)
              </div>
            </Card>
          </div>

          {/* Departmental Performance Matrix */}
          <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 16px' }}>
              32.3.3 Departmental Volume, Revenue Share & Bed Occupancy
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: '#0A4174' }}>Clinical Department</th>
                    <th style={{ padding: '10px 14px', color: '#0A4174' }}>Patients Today</th>
                    <th style={{ padding: '10px 14px', color: '#0A4174' }}>Revenue Share</th>
                    <th style={{ padding: '10px 14px', color: '#0A4174' }}>ALOS</th>
                    <th style={{ padding: '10px 14px', color: '#0A4174' }}>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPARTMENT_METRICS.map((dept, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F172A' }}>{dept.name}</td>
                      <td style={{ padding: '10px 14px' }}>{dept.patientsToday} Encounters</td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0A4174' }}>{dept.revenueShare}%</td>
                      <td style={{ padding: '10px 14px' }}>{dept.alos} Days</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: '700', color: dept.occupancy > 90 ? '#0A4174' : '#10B981' }}>
                          {dept.occupancy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SUBMODULE 32.4: TABULAR DATA EXPORT (EXCEL / CSV) */}
      {activeSubtab === '32.4' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: 0 }}>
                32.4 Custom Column Query Builder & Direct File Download
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                Select required data attributes, toggle HIPAA/NABH PHI masking, and export to Excel (.xlsx) or CSV.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="teal"
                onClick={handleDownloadCSV}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0A4174' }}
              >
                <Download size={14} />
                <span>Export to CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => triggerToast('Excel file (.xlsx) formatted with hospital header generated.')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#49769F', color: '#0A4174' }}
              >
                <FileSpreadsheet size={14} />
                <span>Export to Excel (.xlsx)</span>
              </Button>
            </div>
          </div>

          {/* Column Checkboxes */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid rgba(73, 118, 159, 0.25)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0A4174', marginBottom: '8px' }}>
              Select Columns to Include in Export:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                { key: 'uhid', label: 'Patient UHID' },
                { key: 'name', label: 'Patient Name' },
                { key: 'dept', label: 'Department' },
                { key: 'doctor', label: 'Consultant Doctor' },
                { key: 'billAmount', label: 'Gross Bill (₹)' },
                { key: 'paidAmount', label: 'Net Paid (₹)' },
                { key: 'payMode', label: 'Payment Mode' },
                { key: 'status', label: 'Settlement Status' },
                { key: 'date', label: 'Transaction Date' }
              ].map((col) => (
                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedColumns[col.key])}
                    onChange={(e) => setSelectedColumns({ ...selectedColumns, [col.key]: e.target.checked })}
                    style={{ accentColor: '#0A4174' }}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>

            {/* PHI Masking Checkbox */}
            <div style={{ borderTop: '1px solid rgba(73, 118, 159, 0.2)', marginTop: '10px', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="phi-masking"
                checked={phiMaskingEnabled}
                onChange={(e) => setPhiMaskingEnabled(e.target.checked)}
                style={{ accentColor: '#0A4174' }}
              />
              <label htmlFor="phi-masking" style={{ fontSize: '0.76rem', color: '#0A4174', fontWeight: '600', cursor: 'pointer' }}>
                Apply PHI Redaction & Patient Name Masking (For Medical Research / Academic Exports)
              </label>
            </div>
          </div>

          {/* Live Table Preview */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  {selectedColumns.uhid && <th style={{ padding: '8px 12px', color: '#0A4174' }}>UHID</th>}
                  {selectedColumns.name && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Patient Name</th>}
                  {selectedColumns.dept && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Department</th>}
                  {selectedColumns.doctor && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Doctor</th>}
                  {selectedColumns.billAmount && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Gross Bill</th>}
                  {selectedColumns.paidAmount && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Net Paid</th>}
                  {selectedColumns.payMode && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Pay Mode</th>}
                  {selectedColumns.status && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Status</th>}
                  {selectedColumns.date && <th style={{ padding: '8px 12px', color: '#0A4174' }}>Date</th>}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_EXPORT_DATA.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {selectedColumns.uhid && <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0A4174' }}>{row.uhid}</td>}
                    {selectedColumns.name && (
                      <td style={{ padding: '8px 12px', fontWeight: '600' }}>
                        {phiMaskingEnabled ? `${row.name.substring(0, 2)}***` : row.name}
                      </td>
                    )}
                    {selectedColumns.dept && <td style={{ padding: '8px 12px', color: '#475569' }}>{row.dept}</td>}
                    {selectedColumns.doctor && <td style={{ padding: '8px 12px', color: '#334155' }}>{row.doctor}</td>}
                    {selectedColumns.billAmount && <td style={{ padding: '8px 12px', fontWeight: '600' }}>₹{row.billAmount?.toLocaleString()}</td>}
                    {selectedColumns.paidAmount && <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0A4174' }}>₹{row.paidAmount?.toLocaleString()}</td>}
                    {selectedColumns.payMode && <td style={{ padding: '8px 12px', fontSize: '0.74rem' }}>{row.payMode}</td>}
                    {selectedColumns.status && (
                      <td style={{ padding: '8px 12px' }}>
                        <Badge variant="teal">{row.status}</Badge>
                      </td>
                    )}
                    {selectedColumns.date && <td style={{ padding: '8px 12px', color: '#64748B' }}>{row.date}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
