
import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator, Search, Plus, Eye, Pencil, X, Save,
  TrendingDown, IndianRupee, Landmark, CalendarDays,
  Download, RefreshCw, FileSpreadsheet
} from 'lucide-react';

const STORAGE_KEY = 'medicsprime_asset_depreciation_v1';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const yearsAgo = (years) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const seedAssets = [
  {
    id: 'DEP-001',
    assetCode: 'AST-0001',
    assetName: 'MRI Scanner 1.5T',
    department: 'Radiology',
    purchaseDate: yearsAgo(3),
    purchaseCost: 8500000,
    residualValue: 500000,
    usefulLife: 10,
    method: 'Straight-Line',
    depreciationRate: 10,
    status: 'Active',
    notes: 'Major diagnostic imaging equipment.',
  },
  {
    id: 'DEP-002',
    assetCode: 'AST-0002',
    assetName: 'ICU Ventilator V-12',
    department: 'Intensive Care Unit',
    purchaseDate: yearsAgo(2),
    purchaseCost: 650000,
    residualValue: 50000,
    usefulLife: 7,
    method: 'WDV',
    depreciationRate: 20,
    status: 'Active',
    notes: 'Critical-care ventilator.',
  },
  {
    id: 'DEP-003',
    assetCode: 'AST-0003',
    assetName: 'Digital X-Ray System',
    department: 'Radiology',
    purchaseDate: yearsAgo(5),
    purchaseCost: 4200000,
    residualValue: 200000,
    usefulLife: 8,
    method: 'Straight-Line',
    depreciationRate: 12.5,
    status: 'Active',
    notes: 'Digital radiography system.',
  },
  {
    id: 'DEP-004',
    assetCode: 'AST-0004',
    assetName: 'Patient Monitor PM-08',
    department: 'Emergency',
    purchaseDate: yearsAgo(1),
    purchaseCost: 185000,
    residualValue: 15000,
    usefulLife: 5,
    method: 'WDV',
    depreciationRate: 20,
    status: 'Active',
    notes: 'Bedside patient monitoring equipment.',
  },
];

const emptyForm = {
  assetCode: '',
  assetName: '',
  department: '',
  purchaseDate: todayISO(),
  purchaseCost: '',
  residualValue: 0,
  usefulLife: 5,
  method: 'Straight-Line',
  depreciationRate: 20,
  status: 'Active',
  notes: '',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #D9E2E8',
  borderRadius: 8,
  padding: '10px 11px',
  fontSize: 12,
  color: '#243746',
  background: '#FFFFFF',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#526575',
  marginBottom: 6,
};

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  border: '1px solid #DCE5E9',
  borderRadius: 8,
  padding: '9px 12px',
  background: '#FFFFFF',
  color: '#344B5A',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const money = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function getAgeInYears(purchaseDate) {
  if (!purchaseDate) return 0;

  const start = new Date(`${purchaseDate}T00:00:00`);
  const now = new Date();

  if (Number.isNaN(start.getTime()) || start > now) return 0;

  const years = now.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());

  return Math.max(0, years - (beforeAnniversary ? 1 : 0));
}

function calculateDepreciation(asset) {
  const cost = Math.max(0, Number(asset.purchaseCost) || 0);
  const residual = Math.min(cost, Math.max(0, Number(asset.residualValue) || 0));
  const life = Math.max(1, Number(asset.usefulLife) || 1);
  const rate = Math.min(100, Math.max(0, Number(asset.depreciationRate) || 0));
  const age = getAgeInYears(asset.purchaseDate);
  const depreciableAmount = Math.max(0, cost - residual);

  let accumulated = 0;
  let annualDepreciation = 0;
  const schedule = [];

  for (let year = 1; year <= life; year += 1) {
    const opening = Math.max(0, cost - accumulated);
    let depreciation = 0;

    if (asset.method === 'WDV') {
      depreciation = Math.min(
        Math.max(0, opening - residual),
        opening * (rate / 100)
      );
    } else {
      annualDepreciation = depreciableAmount / life;
      depreciation = Math.min(annualDepreciation, Math.max(0, opening - residual));
    }

    const closing = Math.max(residual, opening - depreciation);

    schedule.push({
      year,
      opening,
      depreciation,
      accumulated: accumulated + depreciation,
      closing,
    });

    accumulated += depreciation;
  }

  const elapsed = Math.min(age, life);
  const current = schedule[elapsed - 1];

  let accumulatedDepreciation = elapsed > 0 ? current.accumulated : 0;
  let bookValue = Math.max(residual, cost - accumulatedDepreciation);

  if (asset.method === 'WDV') {
    // WDV is calculated year by year; do not depreciate below residual value.
    accumulatedDepreciation = cost - bookValue;
  }

  return {
    age,
    life,
    residual,
    cost,
    depreciableAmount,
    annualDepreciation: asset.method === 'WDV'
      ? (elapsed > 0 ? schedule[elapsed - 1].depreciation : cost * rate / 100)
      : annualDepreciation,
    accumulatedDepreciation,
    bookValue,
    fullyDepreciated: age >= life || bookValue <= residual,
    schedule,
  };
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span style={{
      background: active ? '#E6F6ED' : '#F0F2F4',
      color: active ? '#18794E' : '#657583',
      borderRadius: 20,
      padding: '5px 9px',
      fontSize: 10,
      fontWeight: 750,
    }}>
      {status}
    </span>
  );
}

function Metric({ icon: Icon, label, value, hint, color, bg }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 37, height: 37, display: 'grid', placeItems: 'center', borderRadius: 10, color, background: bg }}>
          <Icon size={19} />
        </div>
        <span style={{ fontSize: 10, color: '#81909B', textAlign: 'right' }}>{hint}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 750, marginTop: 12, color: '#1D3444' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#647684', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function AssetDepreciationDesk({ assets = [], onToast }) {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seedAssets;
    } catch {
      return seedAssets;
    }
  });

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      onToast?.('Unable to save depreciation records in this browser.');
    }
  }, [records]);

  const notify = (message) => onToast ? onToast(message) : window.alert(message);

  const calculated = useMemo(() => records.map((asset) => ({
    ...asset,
    calculation: calculateDepreciation(asset),
  })), [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return calculated.filter((asset) => {
      const searchable = [
        asset.id, asset.assetCode, asset.assetName, asset.department, asset.method,
      ].join(' ').toLowerCase();

      return (!q || searchable.includes(q))
        && (methodFilter === 'All' || asset.method === methodFilter)
        && (statusFilter === 'All' || asset.status === statusFilter);
    });
  }, [calculated, search, methodFilter, statusFilter]);

  const totals = useMemo(() => ({
    cost: calculated.reduce((sum, item) => sum + item.calculation.cost, 0),
    accumulated: calculated.reduce((sum, item) => sum + item.calculation.accumulatedDepreciation, 0),
    bookValue: calculated.reduce((sum, item) => sum + item.calculation.bookValue, 0),
    fullyDepreciated: calculated.filter((item) => item.calculation.fullyDepreciated).length,
  }), [calculated]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, purchaseDate: todayISO() });
    setModal('form');
  };

  const openEdit = (asset) => {
    setEditingId(asset.id);
    setForm({ ...emptyForm, ...asset });
    setModal('form');
  };

  const save = (event) => {
    event.preventDefault();

    const cost = Number(form.purchaseCost);
    const residual = Number(form.residualValue);
    const life = Number(form.usefulLife);
    const rate = Number(form.depreciationRate);

    if (!form.assetName.trim() || !form.department.trim() || !form.purchaseDate) {
      notify('Enter the asset name, department and purchase date.');
      return;
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      notify('Purchase cost must be greater than zero.');
      return;
    }

    if (!Number.isFinite(residual) || residual < 0 || residual > cost) {
      notify('Residual value must be between zero and the purchase cost.');
      return;
    }

    if (!Number.isFinite(life) || life < 1 || life > 100) {
      notify('Useful life must be between 1 and 100 years.');
      return;
    }

    if (form.purchaseDate > todayISO()) {
      notify('Purchase date cannot be in the future.');
      return;
    }

    if (form.method === 'WDV' && (!Number.isFinite(rate) || rate <= 0 || rate > 100)) {
      notify('WDV depreciation rate must be greater than 0% and no more than 100%.');
      return;
    }

    if (editingId) {
      setRecords((current) => current.map((item) =>
        item.id === editingId ? { ...item, ...form, id: editingId } : item
      ));
      notify('Depreciation record updated.');
    } else {
      const id = `DEP-${String(Date.now()).slice(-7)}`;
      setRecords((current) => [{ ...form, id }, ...current]);
      notify('Asset depreciation record created.');
    }

    setModal('');
  };

  const restore = () => {
    if (!window.confirm('Replace current depreciation records with sample data?')) return;
    setRecords(seedAssets);
    notify('Sample depreciation records restored.');
  };

  const exportCsv = () => {
    const headers = [
      'Record ID', 'Asset Code', 'Asset Name', 'Department', 'Purchase Date',
      'Purchase Cost INR', 'Residual Value INR', 'Useful Life Years', 'Method',
      'Annual Depreciation Rate %', 'Age Years', 'Accumulated Depreciation INR',
      'Net Book Value INR', 'Status',
    ];

    const rows = filtered.map((asset) => [
      asset.id,
      asset.assetCode,
      asset.assetName,
      asset.department,
      asset.purchaseDate,
      asset.calculation.cost,
      asset.calculation.residual,
      asset.usefulLife,
      asset.method,
      asset.depreciationRate,
      asset.calculation.age,
      Math.round(asset.calculation.accumulatedDepreciation),
      Math.round(asset.calculation.bookValue),
      asset.status,
    ]);

    const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-depreciation-${todayISO()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const field = (label, key, options = {}) => (
    <div>
      <label style={labelStyle}>{label}{options.required ? ' *' : ''}</label>
      {options.options ? (
        <select value={form[key] ?? ''} onChange={(e) => update(key, e.target.value)} required={options.required} style={inputStyle}>
          {options.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          type={options.type || 'text'}
          min={options.min}
          max={options.max}
          step={options.step}
          value={form[key] ?? ''}
          onChange={(e) => update(key, e.target.value)}
          required={options.required}
          placeholder={options.placeholder || ''}
          style={inputStyle}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#233746' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 11, background: '#E5F5F5', color: '#49769F' }}>
            <Calculator size={21} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 750 }}>Asset Depreciation</h2>
            <p style={{ margin: '4px 0 0', color: '#758794', fontSize: 12 }}>
              Calculate accumulated depreciation and net book value for registered assets.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={restore} style={buttonStyle}><RefreshCw size={14} /> Restore demo data</button>
          <button type="button" onClick={exportCsv} style={buttonStyle}><Download size={14} /> Export CSV</button>
          <button type="button" onClick={openCreate} style={{ ...buttonStyle, background: '#49769F', borderColor: '#49769F', color: '#FFFFFF' }}>
            <Plus size={15} /> Add Asset
          </button>
        </div>
      </div>

      <div style={{ padding: 12, borderRadius: 10, background: '#FFF8E8', border: '1px solid #F0E0B6', color: '#795B16', fontSize: 11, lineHeight: 1.6 }}>
        <strong>Calculation notice:</strong> This screen uses annual, whole-year depreciation for demonstration. It does not automatically apply partial-year conventions, tax-specific rates, impairment, asset revaluation, disposals or accounting-period posting. Verify the approved accounting policy before using figures in financial statements.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <Metric icon={IndianRupee} label="Total acquisition cost" value={money(totals.cost)} hint="Recorded assets" color="#2457A7" bg="#EAF2FF" />
        <Metric icon={TrendingDown} label="Accumulated depreciation" value={money(totals.accumulated)} hint="Calculated to date" color="#B45309" bg="#FFF0E2" />
        <Metric icon={Landmark} label="Net book value" value={money(totals.bookValue)} hint="Current carrying value" color="#49769F" bg="#E5F5F5" />
        <Metric icon={CalendarDays} label="Fully depreciated" value={totals.fullyDepreciated} hint="Based on useful life" color="#18794E" bg="#E6F6ED" />
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14 }}>Depreciation Register</h3>
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#81909B' }}>{filtered.length} of {records.length} assets</p>
          </div>
          <div style={{ position: 'relative', minWidth: 210, maxWidth: 320, flex: 1 }}>
            <Search size={15} color="#82919D" style={{ position: 'absolute', left: 11, top: 11 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset or department..." style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '12px 16px', background: '#FAFCFD', borderBottom: '1px solid #E7EDF0' }}>
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 160, padding: '8px 10px' }}>
            {['All', 'Straight-Line', 'WDV'].map((v) => <option key={v} value={v}>{v === 'All' ? 'All methods' : v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 130, padding: '8px 10px' }}>
            {['All', 'Active', 'Disposed'].map((v) => <option key={v} value={v}>{v === 'All' ? 'All statuses' : v}</option>)}
          </select>
          {(search || methodFilter !== 'All' || statusFilter !== 'All') && (
            <button type="button" onClick={() => { setSearch(''); setMethodFilter('All'); setStatusFilter('All'); }} style={buttonStyle}><X size={13} /> Clear filters</button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F7F9FA' }}>
                {['Asset', 'Purchase cost', 'Method', 'Useful life', 'Annual depreciation', 'Accumulated depreciation', 'Net book value', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 13px', fontSize: 10, color: '#6D7F8C', whiteSpace: 'nowrap', borderBottom: '1px solid #E4EAEE' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #EDF1F3' }}>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ fontSize: 12, fontWeight: 750 }}>{asset.assetName}</div>
                    <div style={{ fontSize: 10, color: '#49769F', marginTop: 4 }}>{asset.assetCode || 'No asset code'}</div>
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 4 }}>{asset.department}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11, fontWeight: 650, whiteSpace: 'nowrap' }}>{money(asset.calculation.cost)}</td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <span style={{ background: '#EAF2FF', color: '#2457A7', borderRadius: 5, padding: '5px 7px', fontSize: 10, fontWeight: 700 }}>{asset.method}</span>
                    {asset.method === 'WDV' && <div style={{ fontSize: 10, color: '#83919C', marginTop: 6 }}>{asset.depreciationRate}% rate</div>}
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11 }}>{asset.usefulLife} years<div style={{ fontSize: 10, color: '#83919C', marginTop: 4 }}>Age: {asset.calculation.age} years</div></td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11, whiteSpace: 'nowrap' }}>{money(asset.calculation.annualDepreciation)}</td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11, whiteSpace: 'nowrap' }}>{money(asset.calculation.accumulatedDepreciation)}</td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11, fontWeight: 750, color: '#49769F', whiteSpace: 'nowrap' }}>
                    {money(asset.calculation.bookValue)}
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 4 }}>Residual: {money(asset.calculation.residual)}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}><StatusBadge status={asset.status} /></td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button type="button" title="View depreciation schedule" onClick={() => { setSelected(asset); setModal('details'); }} style={{ ...buttonStyle, padding: 7 }}><Eye size={14} /></button>
                      <button type="button" title="Edit asset" onClick={() => openEdit(asset)} style={{ ...buttonStyle, padding: 7 }}><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={9} style={{ padding: 42, textAlign: 'center', color: '#81909B', fontSize: 12 }}>No depreciation records match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E7EDF0', fontSize: 10, color: '#81909B' }}>
          Calculations update from the current date and asset details · CSV export contains the currently filtered register.
        </div>
      </div>

      {modal === 'form' && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,34,45,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14 }}>
            <div style={{ padding: 20, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ margin: 0, fontSize: 16 }}>{editingId ? 'Edit Depreciation Record' : 'Add Asset for Depreciation'}</h3><p style={{ margin: '5px 0 0', fontSize: 11, color: '#81909B' }}>Enter asset cost, residual value, method and useful life.</p></div>
              <button type="button" onClick={() => setModal('')} style={buttonStyle}><X size={15} /></button>
            </div>
            <form onSubmit={save}>
              <div style={{ padding: 21, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                  {field('Asset name', 'assetName', { required: true, placeholder: 'e.g. MRI Scanner 1.5T' })}
                  {field('Asset code', 'assetCode', { placeholder: 'e.g. AST-0001' })}
                  {field('Department', 'department', { required: true, placeholder: 'e.g. Radiology' })}
                  {field('Purchase date', 'purchaseDate', { type: 'date', required: true })}
                  {field('Purchase cost (₹)', 'purchaseCost', { type: 'number', min: 0.01, step: '0.01', required: true })}
                  {field('Residual value (₹)', 'residualValue', { type: 'number', min: 0, step: '0.01', required: true })}
                  {field('Useful life (years)', 'usefulLife', { type: 'number', min: 1, max: 100, step: 1, required: true })}
                  {field('Depreciation method', 'method', { options: ['Straight-Line', 'WDV'] })}
                  {form.method === 'WDV' && field('Annual WDV rate (%)', 'depreciationRate', { type: 'number', min: 0.01, max: 100, step: '0.01', required: true })}
                  {field('Asset status', 'status', { options: ['Active', 'Disposed'] })}
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Accounting notes or asset reference..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                {Number(form.purchaseCost) > 0 && Number(form.residualValue) >= 0 && Number(form.residualValue) <= Number(form.purchaseCost) && Number(form.usefulLife) > 0 && (
                  <div style={{ padding: 14, borderRadius: 9, background: '#F0F8F8', border: '1px solid #D2EAEA' }}>
                    <div style={{ fontSize: 11, fontWeight: 750, color: '#49769F', marginBottom: 7 }}>Estimated calculation preview</div>
                    <div style={{ fontSize: 12, color: '#3B5A63' }}>
                      {form.method === 'Straight-Line'
                        ? `Annual depreciation: ${money((Number(form.purchaseCost) - Number(form.residualValue)) / Number(form.usefulLife))}`
                        : `First-year WDV estimate: ${money(Math.min(Number(form.purchaseCost) - Number(form.residualValue), Number(form.purchaseCost) * Number(form.depreciationRate || 0) / 100))}`}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 21px', background: '#FAFCFD', borderTop: '1px solid #E7EDF0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setModal('')} style={buttonStyle}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, background: '#49769F', borderColor: '#49769F', color: '#FFFFFF' }}><Save size={14} />{editingId ? 'Save Changes' : 'Add Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'details' && selected && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,34,45,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14 }}>
            <div style={{ padding: 21, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div><div style={{ fontSize: 10, color: '#49769F', fontWeight: 750 }}>{selected.id} · {selected.assetCode || 'No asset code'}</div><h3 style={{ margin: '6px 0', fontSize: 17 }}>{selected.assetName}</h3><div style={{ fontSize: 11, color: '#81909B' }}>{selected.department} · Purchased {formatDate(selected.purchaseDate)}</div></div>
              <button type="button" onClick={() => setModal('')} style={buttonStyle}><X size={15} /></button>
            </div>
            <div style={{ padding: 21 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                {[
                  ['Acquisition cost', money(selected.calculation.cost)],
                  ['Residual value', money(selected.calculation.residual)],
                  ['Accumulated depreciation', money(selected.calculation.accumulatedDepreciation)],
                  ['Net book value', money(selected.calculation.bookValue)],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: 13, borderRadius: 9, border: '1px solid #E2E9ED' }}>
                    <div style={{ fontSize: 10, color: '#81909B', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 750, color: '#233746' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, marginBottom: 18 }}>
                <StatusBadge status={selected.status} />
                <span style={{ background: '#EAF2FF', color: '#2457A7', borderRadius: 20, padding: '5px 9px', fontSize: 10, fontWeight: 750 }}>{selected.method}</span>
                <span style={{ background: '#F0F2F4', color: '#657583', borderRadius: 20, padding: '5px 9px', fontSize: 10, fontWeight: 750 }}>{selected.usefulLife} year useful life</span>
              </div>

              <h4 style={{ fontSize: 13, margin: '0 0 10px' }}>Year-wise depreciation schedule</h4>
              <div style={{ overflowX: 'auto', border: '1px solid #E4EAEE', borderRadius: 9 }}>
                <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead><tr style={{ background: '#F7F9FA' }}>
                    {['Year', 'Opening value', 'Depreciation', 'Accumulated', 'Closing value'].map((h) => <th key={h} style={{ padding: 10, fontSize: 10, color: '#6D7F8C', whiteSpace: 'nowrap' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {selected.calculation.schedule.map((row) => (
                      <tr key={row.year} style={{ borderTop: '1px solid #EDF1F3' }}>
                        <td style={{ padding: 10, fontSize: 11, textAlign: 'center' }}>{row.year}</td>
                        <td style={{ padding: 10, fontSize: 11, whiteSpace: 'nowrap' }}>{money(row.opening)}</td>
                        <td style={{ padding: 10, fontSize: 11, whiteSpace: 'nowrap' }}>{money(row.depreciation)}</td>
                        <td style={{ padding: 10, fontSize: 11, whiteSpace: 'nowrap' }}>{money(row.accumulated)}</td>
                        <td style={{ padding: 10, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(row.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ margin: '12px 0 0', fontSize: 10, color: '#81909B', lineHeight: 1.6 }}>
                Schedule shows full financial years from acquisition. Actual book value uses completed whole years only. WDV is applied to opening book value and is capped at the residual value.
              </p>

              {selected.notes && <div style={{ marginTop: 15, padding: 13, borderRadius: 9, background: '#F6F9FA', fontSize: 12, color: '#617482' }}><strong>Notes:</strong> {selected.notes}</div>}
            </div>
            <div style={{ padding: '14px 21px', borderTop: '1px solid #E7EDF0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setModal('')} style={buttonStyle}>Close</button>
              <button type="button" onClick={() => openEdit(selected)} style={{ ...buttonStyle, background: '#49769F', borderColor: '#49769F', color: '#FFFFFF' }}><Pencil size={14} /> Edit Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetDepreciationDesk;
