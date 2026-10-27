
import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Download, Package, Activity, Wrench, IndianRupee,
  Barcode, Eye, Pencil, Printer, RotateCcw, X, Save,
} from 'lucide-react';
import {
  ASSET_STATUSES, ASSET_CATEGORIES, ASSET_DEPARTMENTS,
} from './fixedAssetConstants';
import { FIXED_ASSET_SEED } from './fixedAssetMockData';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const inputStyle = {
  width: '100%',
  padding: '10px 11px',
  border: '1px solid var(--color-border, #DCE5E8)',
  borderRadius: '8px',
  fontSize: '13px',
  background: '#FFFFFF',
  color: 'var(--color-text-primary, #172B3A)',
  boxSizing: 'border-box',
};

const emptyAsset = {
  name: '',
  category: 'Medical Equipment',
  department: 'Radiology',
  location: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  purchaseCost: '',
  usefulLife: 5,
  warrantyExpiry: '',
  status: 'Active',
  notes: '',
};

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#526477' }}>{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Active: ['#E8F7EF', '#16794B'],
    'Under Maintenance': ['#FFF5DB', '#986600'],
    Breakdown: ['#FDECEC', '#B42318'],
    Retired: ['#EEF1F4', '#526477'],
  };
  const [background, color] = colors[status] || colors.Active;
  return (
    <span style={{
      display: 'inline-flex', padding: '5px 9px', borderRadius: 20,
      background, color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

export function AssetMasterDesk({ assets, setAssets, onToast }) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [category, setCategory] = useState('All Categories');
  const [modal, setModal] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyAsset);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => assets.filter((asset) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [
      asset.id, asset.name, asset.barcode, asset.serialNumber,
      asset.manufacturer, asset.model, asset.location,
    ].some((value) => String(value || '').toLowerCase().includes(term));
    return matchesSearch
      && (department === 'All Departments' || asset.department === department)
      && (status === 'All Statuses' || asset.status === status)
      && (category === 'All Categories' || asset.category === category);
  }), [assets, search, department, status, category]);

  const totalValue = assets.reduce((sum, item) => sum + Number(item.purchaseCost || 0), 0);
  const activeCount = assets.filter((item) => item.status === 'Active').length;
  const maintenanceCount = assets.filter((item) => item.status === 'Under Maintenance').length;
  const breakdownCount = assets.filter((item) => item.status === 'Breakdown').length;

  const openAdd = () => {
    setForm(emptyAsset);
    setErrors({});
    setSelected(null);
    setModal('form');
  };

  const openEdit = (asset) => {
    setForm({ ...emptyAsset, ...asset });
    setErrors({});
    setSelected(asset);
    setModal('form');
  };

  const saveAsset = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Asset name is required.';
    if (!form.department) nextErrors.department = 'Select a department.';
    if (!form.location.trim()) nextErrors.location = 'Location is required.';
    if (!form.serialNumber.trim()) nextErrors.serialNumber = 'Serial number is required.';
    if (!form.purchaseDate) nextErrors.purchaseDate = 'Purchase date is required.';
    if (form.purchaseCost === '' || Number(form.purchaseCost) < 0) {
      nextErrors.purchaseCost = 'Enter a valid purchase cost.';
    }
    if (!form.usefulLife || Number(form.usefulLife) < 1) {
      nextErrors.usefulLife = 'Useful life must be at least 1 year.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const id = selected?.id || `AST-${String(Date.now()).slice(-6)}`;
    const asset = {
      ...form,
      id,
      barcode: selected?.barcode || id.replace(/-/g, ''),
      purchaseCost: Number(form.purchaseCost),
      usefulLife: Number(form.usefulLife),
    };

    setAssets((previous) => selected
      ? previous.map((item) => item.id === selected.id ? asset : item)
      : [asset, ...previous]);

    setModal('');
    onToast?.(selected ? 'Asset updated successfully.' : 'Asset registered successfully.');
  };

  const exportCSV = () => {
    const columns = [
      'id', 'name', 'category', 'department', 'location', 'manufacturer',
      'model', 'serialNumber', 'purchaseDate', 'purchaseCost', 'usefulLife',
      'warrantyExpiry', 'status', 'barcode',
    ];
    const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      columns.join(','),
      ...filtered.map((asset) => columns.map((key) => csvCell(asset[key])).join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hospital-fixed-asset-register.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setDepartment('All Departments');
    setStatus('All Statuses');
    setCategory('All Categories');
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };
  const primaryButton = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, padding: '10px 14px', border: '1px solid #49769F',
    borderRadius: 8, background: '#49769F', color: '#FFFFFF',
    fontWeight: 700, fontSize: 12, cursor: 'pointer',
  };
  const secondaryButton = {
    ...primaryButton, background: '#FFFFFF', color: '#415466',
    borderColor: '#DCE5E8',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#172B3A' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#7A8998', marginBottom: 5 }}>
            Fixed Asset Management / Asset Register
          </div>
          <h2 style={{ fontSize: 21, margin: 0, fontWeight: 750 }}>
            Asset Master & Barcode Tagging
          </h2>
          <p style={{ fontSize: 12, color: '#718096', margin: '6px 0 0' }}>
            Register, track and identify hospital-owned equipment and assets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={secondaryButton} onClick={exportCSV}><Download size={15} /> Export CSV</button>
          <button style={primaryButton} onClick={openAdd}><Plus size={16} /> Register Asset</button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
        gap: 12,
      }}>
        {[
          { label: 'Total Registered Assets', value: assets.length, detail: 'All asset categories', icon: Package, color: '#49769F', bg: '#E5F5F5' },
          { label: 'Total Acquisition Value', value: money(totalValue), detail: 'Recorded purchase cost', icon: IndianRupee, color: '#2665B0', bg: '#EAF2FF' },
          { label: 'Operational Assets', value: activeCount, detail: 'Currently marked active', icon: Activity, color: '#16835D', bg: '#E8F7EF' },
          { label: 'Needs Attention', value: maintenanceCount + breakdownCount, detail: `${maintenanceCount} maintenance · ${breakdownCount} breakdown`, icon: Wrench, color: '#B7791F', bg: '#FFF5DB' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} style={{
              background: '#FFFFFF', border: '1px solid #E2E9ED',
              borderRadius: 12, padding: 16, boxShadow: '0 2px 7px rgba(20,45,60,0.025)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#718096' }}>{item.label}</span>
                <span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: item.bg, color: item.color }}>
                  <Icon size={16} />
                </span>
              </div>
              <div style={{ fontSize: 23, fontWeight: 750, marginTop: 10, overflowWrap: 'anywhere' }}>{item.value}</div>
              <div style={{ fontSize: 11, color: '#8492A0', marginTop: 5 }}>{item.detail}</div>
            </div>
          );
        })}
      </div>

      <section style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #E8EEF1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
            <Search size={16} color="#49769F" />
            <strong style={{ fontSize: 13 }}>Find an Asset</strong>
            <span style={{ fontSize: 11, color: '#83919E' }}>({filtered.length} results)</span>
            <button onClick={resetFilters} style={{ ...secondaryButton, padding: '6px 9px', marginLeft: 'auto' }}>
              <RotateCcw size={12} /> Clear filters
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID, serial, barcode..." style={inputStyle} />
            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={selectStyle}>
              <option>All Departments</option>
              {ASSET_DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              <option>All Categories</option>
              {ASSET_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
              <option>All Statuses</option>
              {ASSET_STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F7FAFB' }}>
              <tr>
                {['Asset / ID', 'Category', 'Department & Location', 'Purchase Cost', 'Warranty Expiry', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} style={{ padding: '12px 14px', color: '#687B8C', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.045em', borderBottom: '1px solid #E6ECEF', whiteSpace: 'nowrap' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid #EDF1F3' }}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{asset.name}</div>
                    <div style={{ fontSize: 10, color: '#7C8A98', marginTop: 4 }}>{asset.id} · SN: {asset.serialNumber}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: '#49769F', fontSize: 10 }}><Barcode size={13} /> {asset.barcode}</div>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: 11 }}>{asset.category}</td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{asset.department}</div>
                    <div style={{ fontSize: 10, color: '#7C8A98', marginTop: 4 }}>{asset.location}</div>
                  </td>
                  <td style={{ padding: '13px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(asset.purchaseCost)}</td>
                  <td style={{ padding: '13px 14px', fontSize: 11, whiteSpace: 'nowrap' }}>{asset.warrantyExpiry || 'Not recorded'}</td>
                  <td style={{ padding: '13px 14px' }}><StatusBadge status={asset.status} /></td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button title="View details" onClick={() => { setSelected(asset); setModal('details'); }} style={{ ...secondaryButton, padding: 7 }}><Eye size={14} /></button>
                      <button title="Edit asset" onClick={() => openEdit(asset)} style={{ ...secondaryButton, padding: 7 }}><Pencil size={14} /></button>
                      <button title="Barcode label" onClick={() => { setSelected(asset); setModal('barcode'); }} style={{ ...secondaryButton, padding: 7 }}><Barcode size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} style={{ padding: 38, textAlign: 'center', color: '#83919E', fontSize: 12 }}>No assets match these filters. Try clearing your search or register a new asset.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '11px 16px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', color: '#7D8B99', fontSize: 10, background: '#FCFDFD' }}>
          <span>Showing {filtered.length} of {assets.length} registered assets</span>
          <span>Demo register · Local browser storage</span>
        </div>
      </section>

      {modal === 'form' && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,35,50,.48)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <form onSubmit={saveAsset} style={{ width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, boxShadow: '0 22px 65px rgba(0,0,0,.22)' }}>
            <div style={{ padding: 20, borderBottom: '1px solid #E8EEF1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ margin: 0, fontSize: 17 }}>{selected ? 'Edit Asset' : 'Register New Asset'}</h3><p style={{ margin: '5px 0 0', fontSize: 11, color: '#7A8998' }}>Enter the equipment details for the hospital asset register.</p></div>
              <button type="button" onClick={() => setModal('')} style={{ ...secondaryButton, padding: 7 }}><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
              <Field label="Asset Name *"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <small style={{ color: '#B42318' }}>{errors.name}</small>}</Field>
              <Field label="Category *"><select style={selectStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{ASSET_CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Department *"><select style={selectStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{ASSET_DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}</select>{errors.department && <small style={{ color: '#B42318' }}>{errors.department}</small>}</Field>
              <Field label="Physical Location *"><input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Building / floor / room" />{errors.location && <small style={{ color: '#B42318' }}>{errors.location}</small>}</Field>
              <Field label="Manufacturer"><input style={inputStyle} value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></Field>
              <Field label="Model"><input style={inputStyle} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
              <Field label="Serial Number *"><input style={inputStyle} value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />{errors.serialNumber && <small style={{ color: '#B42318' }}>{errors.serialNumber}</small>}</Field>
              <Field label="Purchase Date *"><input type="date" style={inputStyle} value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />{errors.purchaseDate && <small style={{ color: '#B42318' }}>{errors.purchaseDate}</small>}</Field>
              <Field label="Purchase Cost (₹) *"><input type="number" min="0" style={inputStyle} value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })} />{errors.purchaseCost && <small style={{ color: '#B42318' }}>{errors.purchaseCost}</small>}</Field>
              <Field label="Useful Life (Years) *"><input type="number" min="1" style={inputStyle} value={form.usefulLife} onChange={(e) => setForm({ ...form, usefulLife: e.target.value })} />{errors.usefulLife && <small style={{ color: '#B42318' }}>{errors.usefulLife}</small>}</Field>
              <Field label="Warranty Expiry"><input type="date" style={inputStyle} value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} /></Field>
              <Field label="Current Status"><select style={selectStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{ASSET_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <div style={{ gridColumn: '1 / -1' }}><Field label="Notes"><textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Maintenance notes or identifying details..." /></Field></div>
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #E8EEF1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" style={secondaryButton} onClick={() => setModal('')}>Cancel</button>
              <button type="submit" style={primaryButton}><Save size={15} /> {selected ? 'Save Changes' : 'Register Asset'}</button>
            </div>
          </form>
        </div>
      )}

      {(modal === 'details' || modal === 'barcode') && selected && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,35,50,.48)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: 'min(520px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, boxShadow: '0 22px 65px rgba(0,0,0,.22)' }}>
            <div style={{ padding: 18, borderBottom: '1px solid #E8EEF1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{modal === 'barcode' ? 'Asset Barcode Label' : 'Asset Details'}</h3>
              <button onClick={() => setModal('')} style={{ ...secondaryButton, padding: 7 }}><X size={16} /></button>
            </div>
            {modal === 'details' ? (
              <div style={{ padding: 20 }}>
                <div style={{ background: '#F3FAFA', borderRadius: 10, padding: 14, marginBottom: 15 }}>
                  <div style={{ fontSize: 10, color: '#49769F', fontWeight: 700 }}>{selected.id}</div>
                  <h3 style={{ margin: '5px 0', fontSize: 18 }}>{selected.name}</h3>
                  <StatusBadge status={selected.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    ['Category', selected.category], ['Department', selected.department],
                    ['Location', selected.location], ['Manufacturer', selected.manufacturer || '—'],
                    ['Model', selected.model || '—'], ['Serial Number', selected.serialNumber],
                    ['Purchase Date', selected.purchaseDate], ['Purchase Cost', money(selected.purchaseCost)],
                    ['Useful Life', `${selected.usefulLife} years`], ['Warranty Expiry', selected.warrantyExpiry || '—'],
                    ['Barcode ID', selected.barcode],
                  ].map(([label, value]) => <div key={label}><div style={{ fontSize: 10, color: '#83919E' }}>{label}</div><div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</div></div>)}
                </div>
                {selected.notes && <p style={{ fontSize: 12, color: '#526477', marginTop: 16 }}>Notes: {selected.notes}</p>}
              </div>
            ) : (
              <div style={{ padding: 24 }}>
                <div id="asset-barcode-print" style={{ border: '1px dashed #9BAAB4', borderRadius: 10, padding: 20, textAlign: 'center', color: '#172B3A' }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>MEDICSPRIME HOSPITAL</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>{selected.name}</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>{selected.department} · {selected.location}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, height: 62, margin: '18px auto 8px', overflow: 'hidden' }}>
                    {Array.from({ length: 72 }, (_, i) => {
                      const seed = `${selected.barcode}${i}`;
                      const width = ((seed.charCodeAt(i % seed.length) * (i + 7)) % 3) + 1;
                      return <span key={i} style={{ width, background: i % 4 === 0 ? '#FFFFFF' : '#111827', flexShrink: 0 }} />;
                    })}
                  </div>
                  <div style={{ fontSize: 13, letterSpacing: 2, fontWeight: 800 }}>{selected.barcode}</div>
                  <div style={{ fontSize: 9, marginTop: 8, color: '#526477' }}>Property of MedicsPrime Hospital</div>
                </div>
                <p style={{ fontSize: 10, color: '#83919E', textAlign: 'center', margin: '12px 0 0' }}>Demo label preview. Connect a barcode library or printer integration for production scanning.</p>
              </div>
            )}
            <div style={{ padding: 16, borderTop: '1px solid #E8EEF1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {modal === 'barcode' && <button style={primaryButton} onClick={() => window.print()}><Printer size={14} /> Print Label</button>}
              <button style={secondaryButton} onClick={() => setModal('')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { FIXED_ASSET_SEED };
