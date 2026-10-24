import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Search, Plus, Eye, Pencil, X, Save,
  Wrench, Clock3, CheckCircle2, ClipboardList, RefreshCw,
  UserRound, MapPin, Building2, Filter
} from 'lucide-react';

const STORAGE_KEY = 'medicsprime_breakdown_tickets_v1';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const seedTickets = [
  {
    id: 'BT-2026-001',
    assetCode: 'AST-0001',
    assetName: 'MRI Scanner 1.5T',
    department: 'Radiology',
    location: 'Imaging Wing · Ground Floor',
    reportedBy: 'Dr. Meera Joshi',
    reportedDate: dateOffset(-2),
    breakdownType: 'Equipment Failure',
    severity: 'Critical',
    description: 'Scanner stopped during startup. System reports a cooling subsystem fault.',
    technician: 'Amit Patil',
    vendor: 'Siemens Healthineers',
    status: 'In Progress',
    downtimeHours: 6,
    repairCost: 0,
    resolution: '',
    closedDate: '',
  },
  {
    id: 'BT-2026-002',
    assetCode: 'AST-0002',
    assetName: 'ICU Ventilator V-12',
    department: 'Intensive Care Unit',
    location: 'ICU · Bed 04',
    reportedBy: 'ICU Nursing Station',
    reportedDate: dateOffset(-1),
    breakdownType: 'Performance Issue',
    severity: 'Critical',
    description: 'Unexpected alarm and inconsistent readings reported during equipment check.',
    technician: 'Rahul Shinde',
    vendor: 'Dräger Service India',
    status: 'Open',
    downtimeHours: 0,
    repairCost: 0,
    resolution: '',
    closedDate: '',
  },
  {
    id: 'BT-2026-003',
    assetCode: 'AST-0003',
    assetName: 'Digital X-Ray System',
    department: 'Radiology',
    location: 'X-Ray Room 02',
    reportedBy: 'Radiology Technician',
    reportedDate: dateOffset(-5),
    breakdownType: 'Calibration Issue',
    severity: 'High',
    description: 'Image quality inconsistent; calibration check requested.',
    technician: 'Neha Kulkarni',
    vendor: 'GE HealthCare',
    status: 'Resolved',
    downtimeHours: 3,
    repairCost: 12500,
    resolution: 'Calibration completed and image quality verified.',
    closedDate: dateOffset(-3),
  },
  {
    id: 'BT-2026-004',
    assetCode: 'AST-0004',
    assetName: 'Patient Monitor PM-08',
    department: 'Emergency',
    location: 'Emergency · Bay 03',
    reportedBy: 'Emergency Nurse',
    reportedDate: dateOffset(-8),
    breakdownType: 'Power / Electrical',
    severity: 'Medium',
    description: 'Intermittent power issue during routine inspection.',
    technician: 'Sagar Jadhav',
    vendor: 'In-house Biomedical Team',
    status: 'Closed',
    downtimeHours: 2,
    repairCost: 1800,
    resolution: 'Power adapter replaced and function tested.',
    closedDate: dateOffset(-6),
  },
];

const emptyForm = {
  assetCode: '',
  assetName: '',
  department: '',
  location: '',
  reportedBy: '',
  reportedDate: today(),
  breakdownType: 'Equipment Failure',
  severity: 'Medium',
  description: '',
  technician: '',
  vendor: '',
  status: 'Open',
  downtimeHours: 0,
  repairCost: 0,
  resolution: '',
  closedDate: '',
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

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function TicketStatus({ status }) {
  const map = {
    Open: ['#FFF1DB', '#9A5B00'],
    'In Progress': ['#EAF2FF', '#2457A7'],
    Resolved: ['#E6F6ED', '#18794E'],
    Closed: ['#F0F2F4', '#657583'],
    Cancelled: ['#F0F2F4', '#657583'],
  };
  const [bg, color] = map[status] || map.Open;
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '5px 9px', fontSize: 10, fontWeight: 750, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    Critical: ['#FDECEC', '#B42318'],
    High: ['#FFF0E2', '#B45309'],
    Medium: ['#FFF8D9', '#8A6D00'],
    Low: ['#E8F5EE', '#21764B'],
  };
  const [bg, color] = map[severity] || map.Medium;
  return <span style={{ background: bg, color, borderRadius: 5, padding: '4px 7px', fontSize: 10, fontWeight: 750 }}>{severity}</span>;
}

function Metric({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, padding: 16 }}>
      <div style={{ width: 37, height: 37, display: 'grid', placeItems: 'center', borderRadius: 10, color, background: bg }}>
        <Icon size={19} />
      </div>
      <div style={{ fontSize: 25, fontWeight: 750, marginTop: 12, color: '#1D3444' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#647684', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function BreakdownWorkTicketDesk({ assets = [], onToast }) {
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seedTickets;
    } catch {
      return seedTickets;
    }
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [modal, setModal] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      onToast?.('Unable to save work tickets in this browser.');
    }
  }, [tickets]);

  const notify = (message) => onToast ? onToast(message) : window.alert(message);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const text = [t.id, t.assetCode, t.assetName, t.department, t.technician, t.reportedBy, t.vendor]
        .join(' ').toLowerCase();
      return (!q || text.includes(q))
        && (statusFilter === 'All' || t.status === statusFilter)
        && (severityFilter === 'All' || t.severity === severityFilter);
    }).sort((a, b) => (b.reportedDate || '').localeCompare(a.reportedDate || ''));
  }, [tickets, search, statusFilter, severityFilter]);

  const metrics = useMemo(() => ({
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    critical: tickets.filter((t) => t.severity === 'Critical' && !['Resolved', 'Closed', 'Cancelled'].includes(t.status)).length,
    resolved: tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length,
  }), [tickets]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, reportedDate: today() });
    setModal('form');
  };

  const openEdit = (ticket) => {
    setEditingId(ticket.id);
    setForm({ ...emptyForm, ...ticket });
    setModal('form');
  };

  const save = (event) => {
    event.preventDefault();

    if (!form.assetName.trim() || !form.department.trim() || !form.reportedBy.trim() || !form.description.trim()) {
      notify('Enter the asset name, department, reporter and breakdown description.');
      return;
    }

    if (Number(form.downtimeHours) < 0 || Number(form.repairCost) < 0) {
      notify('Downtime and repair cost cannot be negative.');
      return;
    }

    const finalForm = {
      ...form,
      downtimeHours: Number(form.downtimeHours || 0),
      repairCost: Number(form.repairCost || 0),
      closedDate: ['Resolved', 'Closed'].includes(form.status) ? (form.closedDate || today()) : '',
    };

    if (editingId) {
      setTickets((current) => current.map((t) => t.id === editingId ? { ...t, ...finalForm, id: editingId } : t));
      notify('Work ticket updated successfully.');
    } else {
      const id = `BT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setTickets((current) => [{ ...finalForm, id }, ...current]);
      notify('Breakdown reported and work ticket created.');
    }

    setModal('');
  };

  const advanceStatus = (ticket, nextStatus) => {
    const closedDate = ['Resolved', 'Closed'].includes(nextStatus) ? today() : '';
    const resolution = nextStatus === 'Resolved' || nextStatus === 'Closed'
      ? (ticket.resolution || 'Repair completed; equipment requires functional verification.')
      : ticket.resolution;

    setTickets((current) => current.map((t) =>
      t.id === ticket.id ? { ...t, status: nextStatus, closedDate, resolution } : t
    ));

    setSelected((current) => current?.id === ticket.id
      ? { ...current, status: nextStatus, closedDate, resolution }
      : current);

    notify(`Ticket status updated to ${nextStatus}.`);
  };

  const restore = () => {
    if (!window.confirm('Replace current tickets with sample data?')) return;
    setTickets(seedTickets);
    notify('Sample work tickets restored.');
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
          <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 11, background: '#FDECEC', color: '#B42318' }}>
            <Wrench size={21} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 750 }}>Breakdown Reporting & Work Tickets</h2>
            <p style={{ margin: '4px 0 0', color: '#758794', fontSize: 12 }}>Report equipment failures, assign repairs and track resolution.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={restore} style={buttonStyle}><RefreshCw size={14} /> Restore demo data</button>
          <button type="button" onClick={openCreate} style={{ ...buttonStyle, background: '#087F8C', borderColor: '#087F8C', color: '#FFFFFF' }}>
            <Plus size={15} /> Report Breakdown
          </button>
        </div>
      </div>

      {metrics.critical > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 13, borderRadius: 10, background: '#FFF3F1', border: '1px solid #F4D2CE' }}>
          <AlertTriangle size={19} color="#B42318" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 750, color: '#A4261D' }}>{metrics.critical} unresolved critical breakdown{metrics.critical === 1 ? '' : 's'}</div>
            <div style={{ fontSize: 11, color: '#87524E', marginTop: 3 }}>Follow hospital safety procedures and escalate critical equipment issues immediately.</div>
          </div>
          <button type="button" onClick={() => { setSeverityFilter('Critical'); setStatusFilter('All'); }} style={buttonStyle}>Review</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: 12 }}>
        <Metric icon={ClipboardList} label="Open tickets" value={metrics.open} color="#B7791F" bg="#FFF4DF" />
        <Metric icon={Wrench} label="In progress" value={metrics.inProgress} color="#2457A7" bg="#EAF2FF" />
        <Metric icon={AlertTriangle} label="Critical unresolved" value={metrics.critical} color="#B42318" bg="#FDECEC" />
        <Metric icon={CheckCircle2} label="Resolved / closed" value={metrics.resolved} color="#18794E" bg="#E6F6ED" />
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E9ED', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid #E7EDF0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14 }}>Breakdown Register</h3>
            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#81909B' }}>{filtered.length} of {tickets.length} tickets</p>
          </div>
          <div style={{ position: 'relative', minWidth: 220, maxWidth: 320, flex: 1 }}>
            <Search size={15} color="#82919D" style={{ position: 'absolute', left: 11, top: 11 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket, asset, technician..." style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '12px 16px', background: '#FAFCFD', borderBottom: '1px solid #E7EDF0' }}>
          <Filter size={14} color="#718391" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 140, padding: '8px 10px' }}>
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'].map((v) => <option key={v} value={v}>{v === 'All' ? 'All statuses' : v}</option>)}
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 140, padding: '8px 10px' }}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((v) => <option key={v} value={v}>{v === 'All' ? 'All severities' : v}</option>)}
          </select>
          {(search || statusFilter !== 'All' || severityFilter !== 'All') && (
            <button type="button" onClick={() => { setSearch(''); setStatusFilter('All'); setSeverityFilter('All'); }} style={buttonStyle}><X size={13} /> Clear filters</button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 1050, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F7F9FA' }}>
                {['Ticket / Asset', 'Department / Location', 'Reported', 'Severity', 'Technician', 'Repair cost', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 13px', fontSize: 10, color: '#6D7F8C', whiteSpace: 'nowrap', borderBottom: '1px solid #E4EAEE' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #EDF1F3' }}>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ fontSize: 12, fontWeight: 750 }}>{t.id}</div>
                    <div style={{ fontSize: 11, marginTop: 5 }}>{t.assetName}</div>
                    <div style={{ fontSize: 10, color: '#087F8C', marginTop: 4 }}>{t.assetCode || 'No asset code'}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}><Building2 size={13} color="#82919D" />{t.department}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 10, color: '#83919C', marginTop: 6 }}><MapPin size={12} />{t.location || '—'}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 11, fontWeight: 650 }}>{formatDate(t.reportedDate)}</div>
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 4 }}>{t.breakdownType}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}><SeverityBadge severity={t.severity} /></td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}><UserRound size={13} color="#82919D" />{t.technician || 'Unassigned'}</div>
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 5 }}>{t.vendor || 'No vendor'}</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top', fontSize: 11, fontWeight: 650, whiteSpace: 'nowrap' }}>
                    ₹{Number(t.repairCost || 0).toLocaleString('en-IN')}
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 5 }}>{t.downtimeHours || 0} hrs downtime</div>
                  </td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}><TicketStatus status={t.status} /></td>
                  <td style={{ padding: 13, verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button type="button" title="View" onClick={() => { setSelected(t); setModal('details'); }} style={{ ...buttonStyle, padding: 7 }}><Eye size={14} /></button>
                      <button type="button" title="Edit" onClick={() => openEdit(t)} style={{ ...buttonStyle, padding: 7 }}><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 42, color: '#81909B', fontSize: 12 }}>No work tickets match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E7EDF0', fontSize: 10, color: '#81909B' }}>
          Demo data stored in this browser · Critical breakdowns must follow hospital safety and escalation procedures.
        </div>
      </div>

      {modal === 'form' && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,34,45,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 780, maxHeight: '92vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14 }}>
            <div style={{ padding: 20, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ margin: 0, fontSize: 16 }}>{editingId ? 'Edit Work Ticket' : 'Report Equipment Breakdown'}</h3><p style={{ margin: '5px 0 0', fontSize: 11, color: '#81909B' }}>Record the failure and assign a repair owner.</p></div>
              <button type="button" onClick={() => setModal('')} style={buttonStyle}><X size={15} /></button>
            </div>
            <form onSubmit={save}>
              <div style={{ padding: 21, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <section>
                  <h4 style={{ margin: '0 0 13px', fontSize: 12, color: '#087F8C' }}>Equipment & incident</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                    {field('Asset name', 'assetName', { required: true, placeholder: 'Equipment name' })}
                    {field('Asset code', 'assetCode', { placeholder: 'e.g. AST-0001' })}
                    {field('Department', 'department', { required: true, placeholder: 'e.g. Radiology' })}
                    {field('Location', 'location', { placeholder: 'Room, floor or ward' })}
                    {field('Reported by', 'reportedBy', { required: true, placeholder: 'Reporter name / role' })}
                    {field('Reported date', 'reportedDate', { type: 'date', required: true })}
                    {field('Breakdown type', 'breakdownType', { options: ['Equipment Failure', 'Performance Issue', 'Power / Electrical', 'Calibration Issue', 'Physical Damage', 'Software / Control Error', 'Other'] })}
                    {field('Severity', 'severity', { options: ['Critical', 'High', 'Medium', 'Low'] })}
                  </div>
                  <label style={{ ...labelStyle, marginTop: 13 }}>Breakdown description *</label>
                  <textarea required value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Describe symptoms, error codes and when the issue occurred..." style={{ ...inputStyle, resize: 'vertical' }} />
                </section>
                <section>
                  <h4 style={{ margin: '0 0 13px', fontSize: 12, color: '#087F8C' }}>Repair assignment & resolution</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                    {field('Assigned technician', 'technician', { placeholder: 'Technician name' })}
                    {field('Service vendor', 'vendor', { placeholder: 'Vendor / in-house team' })}
                    {field('Status', 'status', { options: ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled'] })}
                    {field('Downtime (hours)', 'downtimeHours', { type: 'number', min: 0, step: '0.5' })}
                    {field('Repair cost (₹)', 'repairCost', { type: 'number', min: 0, step: '0.01' })}
                    {field('Closed / resolved date', 'closedDate', { type: 'date' })}
                  </div>
                  <label style={{ ...labelStyle, marginTop: 13 }}>Resolution / repair notes</label>
                  <textarea value={form.resolution} onChange={(e) => update('resolution', e.target.value)} rows={3} placeholder="Diagnosis, repair performed, parts replaced and verification..." style={{ ...inputStyle, resize: 'vertical' }} />
                </section>
              </div>
              <div style={{ padding: '14px 21px', background: '#FAFCFD', borderTop: '1px solid #E7EDF0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setModal('')} style={buttonStyle}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, background: '#087F8C', borderColor: '#087F8C', color: '#FFFFFF' }}><Save size={14} />{editingId ? 'Save Changes' : 'Create Work Ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'details' && selected && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(''); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(16,34,45,.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 14 }}>
            <div style={{ padding: 21, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div><div style={{ fontSize: 10, color: '#087F8C', fontWeight: 750 }}>{selected.id}</div><h3 style={{ margin: '6px 0', fontSize: 17 }}>{selected.assetName}</h3><div style={{ fontSize: 11, color: '#81909B' }}>{selected.assetCode || 'No asset code'}</div></div>
              <button type="button" onClick={() => setModal('')} style={buttonStyle}><X size={15} /></button>
            </div>
            <div style={{ padding: 21 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}><TicketStatus status={selected.status} /><SeverityBadge severity={selected.severity} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  ['Department', selected.department],
                  ['Location', selected.location],
                  ['Reported by', selected.reportedBy],
                  ['Reported date', formatDate(selected.reportedDate)],
                  ['Breakdown type', selected.breakdownType],
                  ['Technician', selected.technician],
                  ['Vendor', selected.vendor],
                  ['Downtime', `${selected.downtimeHours || 0} hours`],
                  ['Repair cost', `₹${Number(selected.repairCost || 0).toLocaleString('en-IN')}`],
                  ['Closed date', formatDate(selected.closedDate)],
                ].map(([label, value]) => <div key={label}><div style={{ fontSize: 10, color: '#81909B', marginBottom: 5 }}>{label}</div><div style={{ fontSize: 12, fontWeight: 650 }}>{value || '—'}</div></div>)}
              </div>
              <div style={{ marginTop: 20, padding: 13, borderRadius: 9, background: '#F6F9FA' }}><div style={{ fontSize: 11, fontWeight: 750, marginBottom: 6 }}>Incident description</div><div style={{ fontSize: 12, color: '#617482', whiteSpace: 'pre-wrap' }}>{selected.description}</div></div>
              <div style={{ marginTop: 12, padding: 13, borderRadius: 9, background: '#F6F9FA' }}><div style={{ fontSize: 11, fontWeight: 750, marginBottom: 6 }}>Resolution notes</div><div style={{ fontSize: 12, color: '#617482', whiteSpace: 'pre-wrap' }}>{selected.resolution || 'No resolution recorded yet.'}</div></div>
            </div>
            <div style={{ padding: '14px 21px', borderTop: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {selected.status === 'Open' && <button type="button" onClick={() => advanceStatus(selected, 'In Progress')} style={buttonStyle}><Wrench size={14} /> Assign / Start Repair</button>}
                {selected.status === 'In Progress' && <button type="button" onClick={() => advanceStatus(selected, 'Resolved')} style={{ ...buttonStyle, color: '#18794E' }}><CheckCircle2 size={14} /> Mark Resolved</button>}
                {selected.status === 'Resolved' && <button type="button" onClick={() => advanceStatus(selected, 'Closed')} style={{ ...buttonStyle, color: '#18794E' }}><CheckCircle2 size={14} /> Close Ticket</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { setModal(''); openEdit(selected); }} style={buttonStyle}><Pencil size={14} /> Edit</button>
                <button type="button" onClick={() => setModal('')} style={buttonStyle}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BreakdownWorkTicketDesk;