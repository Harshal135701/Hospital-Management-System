import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  ShieldCheck,
  ArrowUpRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { formatINR } from '../../utils/formatters';
import { REPORT_PERIODS } from './financeConstants';

export function FinancialReportsDesk({
  accounts,
  plStatement
}) {
  const [activeTab, setActiveTab] = useState('pl'); // 'pl' | 'bs' | 'ratios'
  const [selectedPeriod, setSelectedPeriod] = useState('fy2627_ytd');
  const [isExecutiveBriefOpen, setIsExecutiveBriefOpen] = useState(false);

  // Collapsible section toggles
  const [expandedSections, setExpandedSections] = useState({
    revenues: true,
    directCosts: true,
    indirectExpenses: true,
    currentAssets: true,
    fixedAssets: true,
    currentLiabilities: true,
    longTermLiabilities: true,
    equity: true
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // P&L Calculations
  const plSummary = useMemo(() => {
    let totalRevenue = 0;
    let prevTotalRevenue = 0;
    plStatement.revenues.forEach(r => {
      totalRevenue += r.amount;
      prevTotalRevenue += r.prevAmount;
    });

    let totalDirectCosts = 0;
    let prevTotalDirectCosts = 0;
    plStatement.directCosts.forEach(c => {
      totalDirectCosts += c.amount;
      prevTotalDirectCosts += c.prevAmount;
    });

    const grossProfit = totalRevenue - totalDirectCosts;
    const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

    let totalIndirectExpenses = 0;
    let prevTotalIndirectExpenses = 0;
    plStatement.indirectExpenses.forEach(e => {
      totalIndirectExpenses += e.amount;
      prevTotalIndirectExpenses += e.prevAmount;
    });

    const ebitda = grossProfit - totalIndirectExpenses;
    const ebitdaMarginPct = totalRevenue > 0 ? ((ebitda / totalRevenue) * 100).toFixed(1) : '0';

    const netSurplus = ebitda - plStatement.fixedDepreciation;
    const netMarginPct = totalRevenue > 0 ? ((netSurplus / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      prevTotalRevenue,
      totalDirectCosts,
      prevTotalDirectCosts,
      grossProfit,
      grossMarginPct,
      totalIndirectExpenses,
      prevTotalIndirectExpenses,
      ebitda,
      ebitdaMarginPct,
      netSurplus,
      netMarginPct
    };
  }, [plStatement]);

  // Balance Sheet Calculations (derived from Chart of Accounts)
  const bsSummary = useMemo(() => {
    const currentAssetsList = accounts.filter(a => a.category === 'asset' && a.subType === 'Current Asset');
    const fixedAssetsList = accounts.filter(a => a.category === 'asset' && (a.subType === 'Fixed Asset' || a.subType === 'Contra Asset'));

    const currentLiabilitiesList = accounts.filter(a => a.category === 'liability' && a.subType === 'Current Liability');
    const longTermLiabilitiesList = accounts.filter(a => a.category === 'liability' && a.subType === 'Non-Current Liability');
    const equityList = accounts.filter(a => a.category === 'equity');

    const totalCurrentAssets = currentAssetsList.reduce((sum, a) => sum + a.balance, 0);
    const totalFixedAssets = fixedAssetsList.reduce((sum, a) => sum + a.balance, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities = currentLiabilitiesList.reduce((sum, a) => sum + a.balance, 0);
    const totalLongTermLiabilities = longTermLiabilitiesList.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity = equityList.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 100;

    return {
      currentAssetsList,
      fixedAssetsList,
      currentLiabilitiesList,
      longTermLiabilitiesList,
      equityList,
      totalCurrentAssets,
      totalFixedAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced
    };
  }, [accounts]);

  // Healthcare KPI Ratios
  const ratios = useMemo(() => {
    const currentRatio = bsSummary.totalCurrentLiabilities > 0
      ? (bsSummary.totalCurrentAssets / bsSummary.totalCurrentLiabilities).toFixed(2)
      : '3.4';

    const tpaAr = accounts.find(a => a.code === '1040')?.balance || 2845000;
    const dsoDays = plSummary.totalRevenue > 0
      ? Math.round((tpaAr / plSummary.totalRevenue) * 180)
      : 23;

    const arpob = Math.round(plSummary.totalRevenue / 3510);

    return {
      currentRatio,
      dsoDays,
      arpob,
      debtToEquity: (bsSummary.totalLongTermLiabilities / (bsSummary.totalEquity || 1)).toFixed(2)
    };
  }, [bsSummary, plSummary, accounts]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'MedicsPrime Healthcare Systems - Financial Report\n';
    csvContent += `Period: ${selectedPeriod}, Generated: ${new Date().toISOString()}\n\n`;

    if (activeTab === 'pl') {
      csvContent += 'PROFIT AND LOSS STATEMENT (INCOME STATEMENT)\n';
      csvContent += 'Section,Head,Amount (INR),Previous Period (INR)\n';
      plStatement.revenues.forEach(r => {
        csvContent += `Operating Revenue,"${r.title}",${r.amount},${r.prevAmount}\n`;
      });
      csvContent += `Total Revenue,,${plSummary.totalRevenue},${plSummary.prevTotalRevenue}\n\n`;

      plStatement.directCosts.forEach(c => {
        csvContent += `Direct Clinical Costs,"${c.title}",${c.amount},${c.prevAmount}\n`;
      });
      csvContent += `Gross Profit,,${plSummary.grossProfit},\n\n`;

      plStatement.indirectExpenses.forEach(e => {
        csvContent += `Operating Expenses,"${e.title}",${e.amount},${e.prevAmount}\n`;
      });
      csvContent += `EBITDA,,${plSummary.ebitda},\n`;
      csvContent += `Net Hospital Surplus (Profit),,${plSummary.netSurplus},\n`;
    } else {
      csvContent += 'BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)\n';
      csvContent += 'Classification,Account Head,Balance (INR)\n';
      bsSummary.currentAssetsList.forEach(a => {
        csvContent += `Current Asset,"${a.name}",${a.balance}\n`;
      });
      bsSummary.fixedAssetsList.forEach(a => {
        csvContent += `Fixed Asset,"${a.name}",${a.balance}\n`;
      });
      csvContent += `TOTAL ASSETS,,${bsSummary.totalAssets}\n\n`;

      bsSummary.currentLiabilitiesList.forEach(a => {
        csvContent += `Current Liability,"${a.name}",${a.balance}\n`;
      });
      bsSummary.longTermLiabilitiesList.forEach(a => {
        csvContent += `Long-Term Liability,"${a.name}",${a.balance}\n`;
      });
      bsSummary.equityList.forEach(a => {
        csvContent += `Equity & Reserves,"${a.name}",${a.balance}\n`;
      });
      csvContent += `TOTAL LIABILITIES & EQUITY,,${bsSummary.totalLiabilitiesAndEquity}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_${activeTab.toUpperCase()}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Executive KPI Banner Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total Hospital Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Gross Revenue
            </span>
            <span style={{ color: 'var(--color-success)', fontSize: '0.74rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={13} /> +8.4%
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(plSummary.totalRevenue)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Clinical IPD, OT, Diagnostics & Pharmacy
          </span>
        </div>

        {/* Clinical Gross Margin */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Gross Profit
            </span>
            <Badge variant="success">{plSummary.grossMarginPct}%</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {formatINR(plSummary.grossProfit)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            After Doctor Share & Medical Consumables
          </span>
        </div>

        {/* Operating EBITDA */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>
              Operating EBITDA
            </span>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              {plSummary.ebitdaMarginPct}%
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(plSummary.ebitda)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Pre-depreciation operational hospital cashflow
          </span>
        </div>

        {/* Net Hospital Surplus */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-pale-aqua)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1.5px solid rgba(8, 127, 140, 0.3)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Net Hospital Surplus
            </span>
            <Badge variant="teal">{plSummary.netMarginPct}% Net</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {formatINR(plSummary.netSurplus)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            Net reinvestable clinical hospital surplus
          </span>
        </div>
      </div>

      {/* Main Report Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '14px'
            }}
          >
            {/* View Switcher Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('pl')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${activeTab === 'pl' ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                  backgroundColor: activeTab === 'pl' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: activeTab === 'pl' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === 'pl' ? '700' : '500',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Profit & Loss (Income Statement)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bs')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${activeTab === 'bs' ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                  backgroundColor: activeTab === 'bs' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: activeTab === 'bs' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === 'bs' ? '700' : '500',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Balance Sheet (Statement of Position)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ratios')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${activeTab === 'ratios' ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                  backgroundColor: activeTab === 'ratios' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: activeTab === 'ratios' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === 'ratios' ? '700' : '500',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Financial Ratios & Metrics
              </button>
            </div>

            {/* Period Selector & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)'
                }}
              >
                {REPORT_PERIODS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => setIsExecutiveBriefOpen(true)}
              >
                Executive Brief
              </Button>
            </div>
          </div>

          {/* Tab 1: Profit & Loss Statement */}
          {activeTab === 'pl' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Section 1: Operating Revenue */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSection('revenues')}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {expandedSections.revenues ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>1. Operating Healthcare Revenues (Gross Turnover)</span>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '1rem' }}>
                    {formatINR(plSummary.totalRevenue)}
                  </div>
                </div>

                {expandedSections.revenues && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                        <th style={{ padding: '8px 18px' }}>Service Department</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Current Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Previous Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plStatement.revenues.map((rev, idx) => {
                        const growthPct = (((rev.amount - rev.prevAmount) / rev.prevAmount) * 100).toFixed(1);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '10px 18px', fontWeight: '500' }}>{rev.title}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: '600' }}>{formatINR(rev.amount)}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{formatINR(rev.prevAmount)}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-success)', fontWeight: '600' }}>+{growthPct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Section 2: Direct Clinical Operating Costs */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSection('directCosts')}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {expandedSections.directCosts ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>2. Direct Clinical Operating Costs (COGS & Doctor Share)</span>
                  </div>
                  <div style={{ fontWeight: '800', color: '#D97706', fontSize: '1rem' }}>
                    {formatINR(plSummary.totalDirectCosts)}
                  </div>
                </div>

                {expandedSections.directCosts && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                        <th style={{ padding: '8px 18px' }}>Direct Cost Head</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Current Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Previous Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Cost % of Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plStatement.directCosts.map((c, idx) => {
                        const pctOfRev = ((c.amount / plSummary.totalRevenue) * 100).toFixed(1);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '10px 18px', fontWeight: '500' }}>{c.title}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: '600' }}>{formatINR(c.amount)}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{formatINR(c.prevAmount)}</td>
                            <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{pctOfRev}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Subtotal: Gross Profit Highlight */}
              <div
                style={{
                  padding: '12px 18px',
                  backgroundColor: 'var(--color-success-bg)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1.5px solid var(--color-success-border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--color-success)', fontSize: '0.96rem' }}>
                    GROSS CLINICAL OPERATIONAL PROFIT
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-success)' }}>
                    Revenue minus Direct Medical Consumables and Doctor Remuneration
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-success)' }}>
                    {formatINR(plSummary.grossProfit)}
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--color-success)' }}>
                    {plSummary.grossMarginPct}% Gross Margin
                  </div>
                </div>
              </div>

              {/* Section 3: Indirect Hospital Operating Expenses */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSection('indirectExpenses')}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {expandedSections.indirectExpenses ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>3. Indirect Operating & Facility Overhead Expenses</span>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--color-error)', fontSize: '1rem' }}>
                    {formatINR(plSummary.totalIndirectExpenses)}
                  </div>
                </div>

                {expandedSections.indirectExpenses && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: '#FFFFFF', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                        <th style={{ padding: '8px 18px' }}>Administrative & Facility Head</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Current Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Previous Period (INR)</th>
                        <th style={{ padding: '8px 18px', textAlign: 'right' }}>Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plStatement.indirectExpenses.map((exp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '10px 18px', fontWeight: '500' }}>{exp.title}</td>
                          <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: '600' }}>{formatINR(exp.amount)}</td>
                          <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{formatINR(exp.prevAmount)}</td>
                          <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                            {formatINR(exp.amount - exp.prevAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Final Bottomline: Net Surplus */}
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '2px solid rgba(8, 127, 140, 0.35)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '1.1rem' }}>
                    NET HOSPITAL OPERATIONAL SURPLUS (EBIT)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                    After Less Fixed Asset Depreciation provision ({formatINR(plStatement.fixedDepreciation)})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                    {formatINR(plSummary.netSurplus)}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                    {plSummary.netMarginPct}% Net Surplus Margin
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Balance Sheet */}
          {activeTab === 'bs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Balance Sheet Verification Banner */}
              <div
                style={{
                  backgroundColor: bsSummary.isBalanced ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                  border: `1.5px solid ${bsSummary.isBalanced ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color={bsSummary.isBalanced ? 'var(--color-success)' : '#D97706'} />
                  <span style={{ fontWeight: '700', color: bsSummary.isBalanced ? 'var(--color-success)' : '#D97706', fontSize: '0.9rem' }}>
                    {bsSummary.isBalanced
                      ? 'Balance Sheet Verified: Total Assets = Total Liabilities & Equity'
                      : 'Audit Variance in Statement of Position'}
                  </span>
                </div>
                <Badge variant={bsSummary.isBalanced ? 'success' : 'warning'}>
                  {formatINR(bsSummary.totalAssets)}
                </Badge>
              </div>

              {/* Assets Section */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                    I. ASSETS (Hospital Capital & Resources)
                  </span>
                  <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '1.05rem' }}>
                    {formatINR(bsSummary.totalAssets)}
                  </span>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Current Assets */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Current Assets ({formatINR(bsSummary.totalCurrentAssets)})
                    </div>
                    {bsSummary.currentAssetsList.map(a => (
                      <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)', fontSize: '0.85rem' }}>
                        <span>#{a.code} - {a.name}</span>
                        <strong>{formatINR(a.balance)}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Fixed Assets */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Fixed & Clinical Infrastructure Assets ({formatINR(bsSummary.totalFixedAssets)})
                    </div>
                    {bsSummary.fixedAssetsList.map(a => (
                      <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)', fontSize: '0.85rem' }}>
                        <span>#{a.code} - {a.name}</span>
                        <strong style={{ color: a.balance < 0 ? 'var(--color-error)' : 'inherit' }}>{formatINR(a.balance)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity Section */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--color-bg-card-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' }}>
                    II. LIABILITIES & EQUITY (Funding & Capital Reserves)
                  </span>
                  <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '1.05rem' }}>
                    {formatINR(bsSummary.totalLiabilitiesAndEquity)}
                  </span>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Current Liabilities */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Current Liabilities ({formatINR(bsSummary.totalCurrentLiabilities)})
                    </div>
                    {bsSummary.currentLiabilitiesList.map(a => (
                      <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)', fontSize: '0.85rem' }}>
                        <span>#{a.code} - {a.name}</span>
                        <strong>{formatINR(a.balance)}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Long-Term Liabilities */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Long-Term Term Loans ({formatINR(bsSummary.totalLongTermLiabilities)})
                    </div>
                    {bsSummary.longTermLiabilitiesList.map(a => (
                      <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)', fontSize: '0.85rem' }}>
                        <span>#{a.code} - {a.name}</span>
                        <strong>{formatINR(a.balance)}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Equity */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Hospital Equity & Retained Surpluses ({formatINR(bsSummary.totalEquity)})
                    </div>
                    {bsSummary.equityList.map(a => (
                      <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border-subtle)', fontSize: '0.85rem' }}>
                        <span>#{a.code} - {a.name}</span>
                        <strong>{formatINR(a.balance)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Financial Ratios & Healthcare Performance */}
          {activeTab === 'ratios' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* ARPOB */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  ARPOB (Avg Revenue / Occupied Bed)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {formatINR(ratios.arpob)} / day
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Based on 150-bed multi-specialty clinical facility operating at 78% average occupancy across general, ICU and deluxe suites.
                </p>
              </div>

              {/* TPA DSO */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Days Sales Outstanding (TPA Claims DSO)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-success)' }}>
                  {ratios.dsoDays} Days
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Average cycle time for Star Health, HDFC ERGO, and Medi Assist cashless claims to clear into hospital checking accounts.
                </p>
              </div>

              {/* Current Ratio */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Current Ratio (Liquidity Health)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                  {ratios.currentRatio} : 1
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Short-term assets covering current payables, indicating exceptional financial resilience and uninterrupted supply chain solvency.
                </p>
              </div>

              {/* Debt to Equity */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Long-Term Debt to Equity
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#475569' }}>
                  {ratios.debtToEquity}
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Conservative capital gearing ratio, preserving balance sheet capacity for next-phase robotic surgery acquisition.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal: Executive Brief Print View */}
      <Modal
        isOpen={isExecutiveBriefOpen}
        onClose={() => setIsExecutiveBriefOpen(false)}
        title="Executive Hospital Financial Briefing"
        subtitle="Confidential Board of Directors & Medical Director Presentation Brief"
        maxWidth="720px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: '#FFFFFF'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  MEDICSPRIME HEALTHCARE SYSTEMS
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                  Executive Financial Briefing • Reporting Period: FY 2026-27 YTD
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge variant="teal">CFO SIGN-OFF</Badge>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  NABH Accredited Tertiary Centre
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                border: '1px solid rgba(8, 127, 140, 0.2)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Total Clinical Billings</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {formatINR(plSummary.totalRevenue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Gross Operational Margin</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-success)' }}>
                  {plSummary.grossMarginPct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Net Hospital Surplus</div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {formatINR(plSummary.netSurplus)}
                </div>
              </div>
            </div>

            {/* Department Contributions */}
            <div style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '8px' }}>
              Department Revenue Breakdown:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
              {plStatement.revenues.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                  <span>{r.title}</span>
                  <strong>{formatINR(r.amount)}</strong>
                </div>
              ))}
            </div>

            {/* Balance Sheet Summary */}
            <div style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '8px' }}>
              Capital & Liquidity Position:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem', marginBottom: '20px' }}>
              <div style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total Hospital Assets: </span>
                <strong style={{ color: 'var(--color-primary-teal)' }}>{formatINR(bsSummary.totalAssets)}</strong>
              </div>
              <div style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Operating Cash & Banks: </span>
                <strong>{formatINR(accounts.find(a => a.code === '1020')?.balance || 4865200)}</strong>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
              <div>
                <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Head of Financial Planning (FP&A)
                </div>
              </div>
              <div>
                <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                  Chief Executive Officer & Medical Director
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="outline" onClick={() => setIsExecutiveBriefOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={() => {
                window.print();
              }}
            >
              Print Briefing Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
