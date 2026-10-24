
import React, { useMemo, useState } from 'react';
import {
  Plus, Search, FileText, CalendarClock, IndianRupee,
  AlertTriangle, Eye, Pencil, X, Save, RotateCcw,
} from 'lucide-react';

const KEY = 'medicsprime_asset_contracts_v1';

const SEED = [
  {
    id: 'AMC-2001',
    assetId: 'AST-1001',
    assetName: 'MRI Scanner 1.5T',
    type: 'CMC',
    provider: 'Siemens Healthineers',
    contractNo: 'SH-CMC-2026-114',
    startDate: '2026-02-15',
    endDate: '2027-02-14',
    cost: 1450000,
    visits: 4,
    contactPerson: 'Service Coordinator',
    phone: '020-40001001',
    coverage: 'Parts, labour, calibration and preventive service',
    status: 'Active',
    notes: 'Priority response for scanner downtime.',
  },
  {
    id: 'AMC-2002',
    assetId: 'AST-1002',
    assetName: 'ICU Ventilator',
    type: 'AMC',
    provider: 'Dräger Service India',
    contractNo: 'DR-AMC-26-208',
    startDate: '2025-08-10',
    endDate: '2026-08-09',
    cost: 86000,
    visits: 2,
    contactPerson: 'Regional Service Desk',
    phone: '020-40001002',
    coverage: 'Labour and scheduled preventive maintenance',
    status: 'Expired',
    notes: 'Renewal review required.',
  },
  {
    id: 'AMC-2003',
    assetId: 'AST-1003',
    assetName: 'Digital X-Ray System',
    type: 'AMC',
    provider: 'GE HealthCare',
    contractNo: 'GE-AMC-26-077',
    startDate: '2026-05-01',
    endDate: '2026-11-01',
    cost: 320000,
    visits: 2,
    contactPerson: 'Equipment Support',
    phone: '020-40001003',
    coverage: 'Labour, inspection and preventive maintenance',
    status: 'Active',
    notes: '',
  },
];

const money = (n) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Number(n) || 0);

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 11px',
  border: '1px solid #DCE5E8', borderRadius: 8, fontSize: 12,
  background: '#FFFFFF', color: '#172B3A',
};

const primary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 7, padding: '9px 13px', border: '1px solid #087F8C',
  borderRadius: 8, background: '#087F8C', color: '#FFFFFF',
  fontWeight: 700, fontSize: 11, cursor: 'pointer',
};

const secondary = {
  ...primary, background: '#FFFFFF', color: '#526477', borderColor: '#DCE5E8',
};

const blank = {
  assetId: '', assetName: '', type: 'AMC', provider: '', contractNo: '',
  startDate: '', endDate: '', cost: '', visits: 2, contactPerson: '',
  phone: '', coverage: '', status: 'Active', notes: '',
};

function contractStatus(contract) {
  if (contract.status === 'Cancelled') return 'Cancelled';
  if (!contract.endDate) return contract.status || 'Active';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${contract.endDate}T00:00:00`);
  if (!Number.isNaN(end.getTime()) && end < today) return 'Expired';

  const remaining = Math.ceil((end - today) / 86400000);
  if (remaining <= 30) return 'Expiring Soon';
  return contract.status === 'Expired' ? 'Expired' : 'Active';
}

function Pill({ value }) {
  const palette = {
    Active: ['#E8F7EF', '#16794B'],
    'Expiring Soon': ['#FFF5DB', '#986600'],
    Expired: ['#FDECEC', '#B42318'],
    Cancelled: ['#EEF1F4', '#526477'],
  };
  const [bg, color] = palette[value] || palette.Active;
  return <span style={{ background: bg, color, padding: '5px 9px', borderRadius: 20, fontSize: 10, fontWeight: 750, whiteSpace: 'nowrap' }}>{value}</span>;
}

export function ServiceContractsDesk({ assets = [], onToast }) {
  const [contracts, setContracts] = useState(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [modal, setModal] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});

  const saveAll = (next) => {
    setContracts(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      onToast?.('Could not save contracts to browser storage.');
    }
  };

  const rows = useMemo(() => contracts.map((c) => ({
    ...c,
    computedStatus: contractStatus(c),
  })).filter((c) => {
    const q = search.toLowerCase().trim();
    const matches = !q || [
      c.id, c.assetName, c.assetId, c.provider, c.contractNo,
    ].some((v) => String(v || '').toLowerCase().includes(q));
    return matches
      && (typeFilter === 'All Types' || c.type === typeFilter)
      && (statusFilter === 'All Statuses' || c.computedStatus === statusFilter);
  }), [contracts, search, typeFilter, statusFilter]);

  const expiring = contracts.filter((c) => contractStatus(c) === 'Expiring Soon').length;
  const expired = contracts.filter((c) => contractStatus(c) === 'Expired').length;
  const annualCost = contracts.filter((c) => contractStatus(c) !== 'Cancelled')
    .reduce((sum, c) => sum + Number(c.cost || 0), 0);

  const openAdd = () => {
    setSelected(null);
    setForm(blank);
    setErrors({});
    setModal('form');
  };

  const openEdit = (contract) => {
    setSelected(contract);
    setForm({ ...blank, ...contract });
    setErrors({});
    setModal('form');
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.assetName.trim()) nextErrors.assetName = 'Asset name is required.';
    if (!form.provider.trim()) nextErrors.provider = 'Service provider is required.';
    if (!form.contractNo.trim()) nextErrors.contractNo = 'Contract number is required.';
    if (!form.startDate) nextErrors.startDate = 'Start date is required.';
    if (!form.endDate) nextErrors.endDate = 'End date is required.';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'End date must be on or after start date.';
    }
    if (form.cost === '' || Number(form.cost) < 0) nextErrors.cost = 'Enter a valid contract cost.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const contract = {
      ...form,
      id: selected?.id || `AMC-${String(Date.now()).slice(-6)}`,
      cost: Number(form.cost),
      visits: Number(form.visits) || 0,
    };

    const next = selected
      ? contracts.map((c) => c.id === selected.id ? contract : c)
      : [contract, ...contracts];

    saveAll(next);
    setModal('');
    onToast?.(selected ? 'Service contract updated.' : 'Service contract registered.');
  };

  const resetDemo = () => {
    if (!window.confirm('Reset service contracts to demo records?')) return;
    saveAll(SEED);
    onToast?.('Service contract demo records restored.');
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 17, color: '#172B3A' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#7A8998', marginBottom: 5 }}>Fixed Asset Management / Service Contracts</div>
          <h2 style={{ fontSize: 21, margin: 0 }}>AMC / CMC Contracts & Warranties</h2>
          <p style={{ fontSize: 12, color: '#718096', margin: '6px 0 0' }}>Track service agreements, warranty coverage, vendors and renewal dates.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={secondary} onClick={resetDemo}><RotateCcw size={14} /> Reset Demo</button>
          <button style={primary} onClick={openAdd}><Plus size={15} /> Add Contract</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { title: 'Total Contracts', value: contracts.length, icon: FileText, color: '#087F8C', bg: '#E5F5F5' },
          { title: 'Renewal Due Soon', value: expiring, icon: CalendarClock, color: '#A66A00', bg: '#FFF5DB' },
          { title: 'Expired Contracts', value: expired, icon: AlertTriangle, color: '#B42318', bg: '#FDECEC' },
          { title: 'Contract Value', value: money(annualCost), icon: IndianRupee, color: '#2665B0', bg: '#EAF2FF' },
        ].map((card) => {
          const Icon = card.icon;
          return <div key={card.title} style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#718096' }}>{card.title}</span>
              <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 9, background: card.bg, color: card.color }}><Icon size={16} /></span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 750, marginTop: 10, overflowWrap: 'anywhere' }}>{card.value}</div>
          </div>;
        })}
      </div>

      {expiring + expired > 0 && <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: 12, borderRadius: 9, border: '1px solid #F3D69A', background: '#FFFAEB', color: '#855B12', fontSize: 11 }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <div><strong>Contract attention required.</strong> {expiring} contract(s) expire within 30 days and {expired} are expired. Review renewal and service continuity.</div>
      </div>}

      <section style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #E8EEF1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Search size={16} color="#087F8C" /><strong style={{ fontSize: 13 }}>Contract Register</strong>
            <span style={{ fontSize: 11, color: '#83919E' }}>({rows.length} results)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <input style={inputStyle} placeholder="Search asset, vendor, contract..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={selectStyle} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All Types</option><option>AMC</option><option>CMC</option><option>Warranty</option>
            </select>
            <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Statuses</option><option>Active</option><option>Expiring Soon</option><option>Expired</option><option>Cancelled</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F7FAFB' }}><tr>
              {['Contract / Asset', 'Type & Provider', 'Period', 'Contract Value', 'Status', 'Actions'].map((h) => <th key={h} style={{ padding: '12px 14px', color: '#687B8C', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #E6ECEF', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((c) => <tr key={c.id} style={{ borderBottom: '1px solid #EDF1F3' }}>
                <td style={{ padding: '13px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{c.contractNo}</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>{c.assetName}</div>
                  <div style={{ fontSize: 10, color: '#7C8A98', marginTop: 3 }}>{c.assetId || 'Asset ID not linked'}</div>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{ fontSize: 10, background: '#E8F6F6', color: '#087F8C', padding: '4px 7px', borderRadius: 5, fontWeight: 750 }}>{c.type}</span>
                  <div style={{ fontSize: 11, marginTop: 6 }}>{c.provider}</div>
                </td>
                <td style={{ padding: '13px 14px', fontSize: 11, whiteSpace: 'nowrap' }}>
                  <div>{c.startDate}</div><div style={{ color: '#7C8A98', marginTop: 4 }}>to {c.endDate}</div>
                </td>
                <td style={{ padding: '13px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(c.cost)}</td>
                <td style={{ padding: '13px 14px' }}><Pill value={c.computedStatus} /></td>
                <td style={{ padding: '13px 14px' }}><div style={{ display: 'flex', gap: 5 }}>
                  <button title="View contract" onClick={() => { setSelected(c); setModal('details'); }} style={{ ...secondary, padding: 7 }}><Eye size={14} /></button>
                  <button title="Edit contract" onClick={() => openEdit(c)} style={{ ...secondary, padding: 7 }}><Pencil size={14} /></button>
                </div></td>
              </tr>)}
              {!rows.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 35, color: '#83919E', fontSize: 12 }}>No matching service contracts found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 12, fontSize: 10, color: '#7D8B99' }}>Demo contracts · Stored in browser local storage</div>
      </section>

      {modal === 'form' && <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,35,50,.48)', display: 'grid', placeItems: 'center', padding: 16 }}>
        <form onSubmit={submit} style={{ width: 'min(760px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14, boxShadow: '0 22px 65px rgba(0,0,0,.22)' }}>
          <div style={{ padding: 20, borderBottom: '1px solid #E8EEF1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h3 style={{ margin: 0, fontSize: 17 }}>{selected ? 'Edit Service Contract' : 'Register Service Contract'}</h3><p style={{ margin: '5px 0 0', fontSize: 11, color: '#7A8998' }}>Capture agreement, coverage and renewal information.</p></div>
            <button type="button" onClick={() => setModal('')} style={{ ...secondary, padding: 7 }}><X size={16} /></button>
          </div>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Asset Name *<input style={{ ...inputStyle, marginTop: 6 }} value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} />{errors.assetName && <small style={{ color: '#B42318' }}>{errors.assetName}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Asset ID<input style={{ ...inputStyle, marginTop: 6 }} value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} placeholder="e.g. AST-1001" /></label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Contract Type *<select style={{ ...inputStyle, marginTop: 6 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>AMC</option><option>CMC</option><option>Warranty</option></select></label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Service Provider *<input style={{ ...inputStyle, marginTop: 6 }} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />{errors.provider && <small style={{ color: '#B42318' }}>{errors.provider}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Contract Number *<input style={{ ...inputStyle, marginTop: 6 }} value={form.contractNo} onChange={(e) => setForm({ ...form, contractNo: e.target.value })} />{errors.contractNo && <small style={{ color: '#B42318' }}>{errors.contractNo}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Contract Cost (₹) *<input type="number" min="0" style={{ ...inputStyle, marginTop: 6 }} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />{errors.cost && <small style={{ color: '#B42318' }}>{errors.cost}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Start Date *<input type="date" style={{ ...inputStyle, marginTop: 6 }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />{errors.startDate && <small style={{ color: '#B42318' }}>{errors.startDate}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>End / Expiry Date *<input type="date" style={{ ...inputStyle, marginTop: 6 }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />{errors.endDate && <small style={{ color: '#B42318' }}>{errors.endDate}</small>}</label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Planned Service Visits<input type="number" min="0" style={{ ...inputStyle, marginTop: 6 }} value={form.visits} onChange={(e) => setForm({ ...form, visits: e.target.value })} /></label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Contact Person<input style={{ ...inputStyle, marginTop: 6 }} value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Contact Number<input style={{ ...inputStyle, marginTop: 6 }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Record Status<select style={{ ...inputStyle, marginTop: 6 }} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Expired</option><option>Cancelled</option></select></label>
            <label style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 600 }}>Coverage & Exclusions<textarea rows={2} style={{ ...inputStyle, marginTop: 6, resize: 'vertical' }} value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} placeholder="Parts, labour, calibration, exclusions..." /></label>
            <label style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 600 }}>Notes<textarea rows={2} style={{ ...inputStyle, marginTop: 6, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #E8EEF1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" style={secondary} onClick={() => setModal('')}>Cancel</button>
            <button type="submit" style={primary}><Save size={14} /> Save Contract</button>
          </div>
        </form>
      </div>}

      {modal === 'details' && selected && <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,35,50,.48)', display: 'grid', placeItems: 'center', padding: 16 }}>
        <div style={{ width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14 }}>
          <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E8EEF1' }}><h3 style={{ margin: 0, fontSize: 16 }}>Contract Details</h3><button onClick={() => setModal('')} style={{ ...secondary, padding: 7 }}><X size={15} /></button></div>
          <div style={{ padding: 20 }}>
            <div style={{ background: '#F3FAFA', borderRadius: 9, padding: 14, marginBottom: 16 }}><div style={{ color: '#087F8C', fontSize: 10, fontWeight: 700 }}>{selected.contractNo}</div><h3 style={{ margin: '6px 0', fontSize: 17 }}>{selected.assetName}</h3><Pill value={contractStatus(selected)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              {[
                ['Type', selected.type], ['Provider', selected.provider], ['Asset ID', selected.assetId || 'Not linked'],
                ['Start Date', selected.startDate], ['Expiry Date', selected.endDate], ['Contract Cost', money(selected.cost)],
                ['Planned Visits', selected.visits], ['Contact Person', selected.contactPerson || '—'],
                ['Contact Number', selected.phone || '—'], ['Coverage', selected.coverage || '—'],
              ].map(([k, v]) => <div key={k}><div style={{ fontSize: 10, color: '#83919E' }}>{k}</div><div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, overflowWrap: 'anywhere' }}>{v}</div></div>)}
            </div>
            {selected.notes && <p style={{ fontSize: 12, color: '#526477', marginTop: 16 }}>Notes: {selected.notes}</p>}
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #E8EEF1', display: 'flex', justifyContent: 'flex-end' }}><button style={secondary} onClick={() => setModal('')}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}

export default ServiceContractsDesk;
