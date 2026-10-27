
import React, { useEffect, useMemo, useState } from 'react';
import {
  Wrench,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  Save,
  ClipboardCheck,
  RefreshCw,
  MapPin,
  UserRound,
  Building2,
  Filter,
  CalendarClock,
} from 'lucide-react';

const STORAGE_KEY = 'medicsprime_preventive_maintenance_v1';

const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const shiftDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const seedSchedules = [
  {
    id: 'PM-2026-001',
    assetCode: 'AST-0001',
    assetName: 'MRI Scanner 1.5T',
    category: 'Diagnostic Imaging',
    department: 'Radiology',
    location: 'Imaging Wing · Ground Floor',
    maintenanceType: 'Preventive Inspection',
    frequency: 'Monthly',
    lastServiceDate: shiftDate(-25),
    dueDate: shiftDate(-5),
    technician: 'Amit Patil',
    vendor: 'Siemens Healthineers',
    priority: 'Critical',
    status: 'Overdue',
    notes: 'Inspect cooling system, coils and emergency shutdown.',
  },
  {
    id: 'PM-2026-002',
    assetCode: 'AST-0002',
    assetName: 'ICU Ventilator V-12',
    category: 'Critical Care',
    department: 'Intensive Care Unit',
    location: 'ICU · Bed 04',
    maintenanceType: 'Safety & Performance Check',
    frequency: 'Monthly',
    lastServiceDate: shiftDate(-20),
    dueDate: shiftDate(2),
    technician: 'Rahul Shinde',
    vendor: 'Dräger Service India',
    priority: 'High',
    status: 'Scheduled',
    notes: 'Verify alarms, battery backup and oxygen delivery.',
  },
  {
    id: 'PM-2026-003',
    assetCode: 'AST-0003',
    assetName: 'Digital X-Ray System',
    category: 'Diagnostic Imaging',
    department: 'Radiology',
    location: 'X-Ray Room 02',
    maintenanceType: 'Calibration',
    frequency: 'Quarterly',
    lastServiceDate: shiftDate(-75),
    dueDate: shiftDate(5),
    technician: 'Neha Kulkarni',
    vendor: 'GE HealthCare',
    priority: 'High',
    status: 'Scheduled',
    notes: 'Verify detector calibration and image quality.',
  },
  {
    id: 'PM-2026-004',
    assetCode: 'AST-0004',
    assetName: 'Patient Monitor PM-08',
    category: 'Patient Monitoring',
    department: 'Emergency',
    location: 'Emergency · Bay 03',
    maintenanceType: 'Electrical Safety Check',
    frequency: 'Monthly',
    lastServiceDate: shiftDate(-28),
    dueDate: shiftDate(0),
    technician: 'Sagar Jadhav',
    vendor: 'In-house Biomedical Team',
    priority: 'Medium',
    status: 'Scheduled',
    notes: 'Check ECG, SpO2, NIBP and power supply.',
  },
  {
    id: 'PM-2026-005',
    assetCode: 'AST-0005',
    assetName: 'Anaesthesia Workstation',
    category: 'Operation Theatre',
    department: 'Operation Theatre',
    location: 'OT Complex · OT 01',
    maintenanceType: 'Preventive Inspection',
    frequency: 'Quarterly',
    lastServiceDate: shiftDate(-90),
    dueDate: shiftDate(12),
    technician: 'Amit Patil',
    vendor: 'In-house Biomedical Team',
    priority: 'High',
    status: 'Scheduled',
    notes: 'Inspect gas connections, vaporizers and alarms.',
  },
  {
    id: 'PM-2026-006',
    assetCode: 'AST-0006',
    assetName: 'Autoclave Unit AC-02',
    category: 'Sterilization',
    department: 'CSSD',
    location: 'CSSD · Sterilization Room',
    maintenanceType: 'Performance Validation',
    frequency: 'Monthly',
    lastServiceDate: shiftDate(-10),
    dueDate: shiftDate(-2),
    technician: 'Rahul Shinde',
    vendor: 'In-house Biomedical Team',
    priority: 'Medium',
    status: 'Completed',
    notes: 'Cycle validation completed; operating parameters verified.',
    completedDate: shiftDate(-2),
    completionNotes: 'Pressure, temperature and cycle parameters checked.',
  },
];

const initialForm = {
  assetCode: '',
  assetName: '',
  category: 'Medical Equipment',
  department: '',
  location: '',
  maintenanceType: 'Preventive Inspection',
  frequency: 'Monthly',
  lastServiceDate: '',
  dueDate: '',
  technician: '',
  vendor: '',
  priority: 'Medium',
  status: 'Scheduled',
  notes: '',
  completedDate: '',
  completionNotes: '',
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
  outline: 'none',
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

function getEffectiveStatus(item) {
  if (item.status === 'Completed' || item.status === 'Cancelled') {
    return item.status;
  }

  if (item.dueDate && item.dueDate < todayISO()) {
    return 'Overdue';
  }

  return item.status || 'Scheduled';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    Scheduled: { bg: '#EAF2FF', color: '#2457A7' },
    Overdue: { bg: '#FDECEC', color: '#B42318' },
    Completed: { bg: '#E6F6ED', color: '#18794E' },
    Cancelled: { bg: '#F0F2F4', color: '#657583' },
  };

  const style = styles[status] || styles.Scheduled;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 20,
        padding: '5px 9px',
        background: style.bg,
        color: style.color,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    Critical: { bg: '#FCE7E7', color: '#B42318' },
    High: { bg: '#FFF0E2', color: '#B45309' },
    Medium: { bg: '#FFF8D9', color: '#8A6D00' },
    Low: { bg: '#E8F5EE', color: '#21764B' },
  };

  const style = styles[priority] || styles.Medium;

  return (
    <span
      style={{
        display: 'inline-flex',
        borderRadius: 5,
        padding: '4px 7px',
        background: style.bg,
        color: style.color,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {priority}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, hint, color, bg }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E9ED',
        borderRadius: 12,
        padding: '16px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div
          style={{
            width: 38,
            height: 38,
            display: 'grid',
            placeItems: 'center',
            background: bg,
            color,
            borderRadius: 10,
          }}
        >
          <Icon size={19} />
        </div>
        <span style={{ fontSize: 10, color: '#81909B', textAlign: 'right' }}>
          {hint}
        </span>
      </div>

      <div style={{ fontSize: 25, fontWeight: 750, color: '#1D3444', marginTop: 13 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#647684', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export function PreventiveMaintenanceDesk({ assets = [], onToast }) {
  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seedSchedules;
    } catch {
      return seedSchedules;
    }
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [modalMode, setModalMode] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch {
      onToast?.('Unable to save maintenance schedules in this browser.');
    }
  }, [schedules]);

  const departments = useMemo(
    () => [...new Set(schedules.map((item) => item.department).filter(Boolean))].sort(),
    [schedules]
  );

  const enrichedSchedules = useMemo(
    () => schedules.map((item) => ({ ...item, effectiveStatus: getEffectiveStatus(item) })),
    [schedules]
  );

  const filteredSchedules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedSchedules
      .filter((item) => {
        const searchable = [
          item.id,
          item.assetCode,
          item.assetName,
          item.department,
          item.technician,
          item.vendor,
          item.maintenanceType,
        ].join(' ').toLowerCase();

        return (
          (!query || searchable.includes(query)) &&
          (statusFilter === 'All' || item.effectiveStatus === statusFilter) &&
          (priorityFilter === 'All' || item.priority === priorityFilter) &&
          (departmentFilter === 'All' || item.department === departmentFilter)
        );
      })
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [enrichedSchedules, search, statusFilter, priorityFilter, departmentFilter]);

  const metrics = useMemo(() => {
    const today = todayISO();
    const weekEnd = shiftDate(7);
    const monthStart = `${today.slice(0, 7)}-01`;

    return {
      overdue: enrichedSchedules.filter((item) => item.effectiveStatus === 'Overdue').length,
      dueThisWeek: enrichedSchedules.filter(
        (item) =>
          item.effectiveStatus === 'Scheduled' &&
          item.dueDate >= today &&
          item.dueDate <= weekEnd
      ).length,
      scheduledMonth: enrichedSchedules.filter(
        (item) =>
          item.effectiveStatus === 'Scheduled' &&
          item.dueDate >= monthStart &&
          item.dueDate.slice(0, 7) === today.slice(0, 7)
      ).length,
      completedMonth: enrichedSchedules.filter(
        (item) =>
          item.effectiveStatus === 'Completed' &&
          (item.completedDate || '').slice(0, 7) === today.slice(0, 7)
      ).length,
    };
  }, [enrichedSchedules]);

  const notify = (message) => {
    if (onToast) {
      onToast(message);
    } else {
      window.alert(message);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      dueDate: shiftDate(7),
    });
    setModalMode('form');
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...initialForm, ...item });
    setModalMode('form');
  };

  const saveSchedule = (event) => {
    event.preventDefault();

    if (!form.assetName.trim() || !form.department.trim() || !form.dueDate || !form.technician.trim()) {
      notify('Please enter the asset name, department, due date and assigned technician.');
      return;
    }

    if (form.lastServiceDate && form.dueDate < form.lastServiceDate) {
      notify('The next due date cannot be earlier than the last service date.');
      return;
    }

    if (editingId) {
      setSchedules((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, ...form, id: editingId }
            : item
        )
      );
      notify('Maintenance schedule updated successfully.');
    } else {
      const id = `PM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setSchedules((current) => [{ ...form, id }, ...current]);
      notify('Maintenance schedule created successfully.');
    }

    setModalMode('');
    setEditingId(null);
  };

  const markCompleted = (item) => {
    const completedDate = todayISO();
    const completionNotes = window.prompt(
      'Enter service completion notes:',
      item.completionNotes || 'Preventive maintenance completed.'
    );

    if (completionNotes === null) return;

    setSchedules((current) =>
      current.map((record) =>
        record.id === item.id
          ? {
              ...record,
              status: 'Completed',
              completedDate,
              completionNotes,
            }
          : record
      )
    );

    setSelected((current) =>
      current?.id === item.id
        ? {
            ...current,
            status: 'Completed',
            completedDate,
            completionNotes,
          }
        : current
    );

    notify('Maintenance marked as completed.');
  };

  const cancelSchedule = (item) => {
    if (!window.confirm(`Cancel maintenance schedule ${item.id}?`)) return;

    setSchedules((current) =>
      current.map((record) =>
        record.id === item.id ? { ...record, status: 'Cancelled' } : record
      )
    );
    notify('Maintenance schedule cancelled.');
  };

  const restoreDemoData = () => {
    if (!window.confirm('Restore the sample maintenance schedules? Your current schedules will be replaced.')) {
      return;
    }

    setSchedules(seedSchedules);
    notify('Sample maintenance schedules restored.');
  };

  const field = (label, name, options = {}) => (
    <div style={{ minWidth: 0 }}>
      <label style={labelStyle}>
        {label}{options.required ? ' *' : ''}
      </label>

      {options.options ? (
        <select
          value={form[name] || ''}
          onChange={(event) => updateForm(name, event.target.value)}
          required={options.required}
          style={inputStyle}
        >
          {options.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={options.type || 'text'}
          value={form[name] || ''}
          onChange={(event) => updateForm(name, event.target.value)}
          required={options.required}
          placeholder={options.placeholder || ''}
          style={inputStyle}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#233746' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: '#E5F5F5',
                color: '#49769F',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CalendarClock size={21} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 750 }}>
                Preventive Maintenance
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#758794' }}>
                Plan equipment servicing, monitor due dates and maintain service records.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={buttonStyle} onClick={restoreDemoData} type="button">
            <RefreshCw size={14} /> Restore demo data
          </button>
          <button
            type="button"
            onClick={openCreate}
            style={{
              ...buttonStyle,
              background: '#49769F',
              borderColor: '#49769F',
              color: '#FFFFFF',
              padding: '10px 15px',
            }}
          >
            <Plus size={15} /> Add Schedule
          </button>
        </div>
      </div>

      {metrics.overdue > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '12px 15px',
            borderRadius: 10,
            background: '#FFF3F1',
            border: '1px solid #F4D2CE',
          }}
        >
          <AlertTriangle size={19} color="#B42318" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 750, color: '#A4261D' }}>
              {metrics.overdue} maintenance task{metrics.overdue === 1 ? '' : 's'} overdue
            </div>
            <div style={{ fontSize: 11, color: '#87524E', marginTop: 3 }}>
              Review overdue equipment and arrange servicing, especially for critical-care assets.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Overdue')}
            style={{
              ...buttonStyle,
              color: '#A4261D',
              borderColor: '#E7BDB8',
              background: '#FFFFFF',
            }}
          >
            Review overdue
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 12,
        }}
      >
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={metrics.overdue}
          hint="Needs attention"
          color="#B42318"
          bg="#FDECEC"
        />
        <MetricCard
          icon={Clock3}
          label="Due in 7 days"
          value={metrics.dueThisWeek}
          hint="Upcoming"
          color="#B7791F"
          bg="#FFF4DF"
        />
        <MetricCard
          icon={CalendarDays}
          label="Scheduled this month"
          value={metrics.scheduledMonth}
          hint="Current month"
          color="#2457A7"
          bg="#EAF2FF"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed this month"
          value={metrics.completedMonth}
          hint="Service records"
          color="#18794E"
          bg="#E6F6ED"
        />
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E9ED',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #E7EDF0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h3 style={{ fontSize: 14, margin: 0, fontWeight: 750 }}>
              Maintenance Schedule Register
            </h3>
            <p style={{ margin: '5px 0 0', color: '#81909B', fontSize: 11 }}>
              {filteredSchedules.length} of {schedules.length} schedules
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: 220, maxWidth: 310, flex: 1 }}>
            <Search
              size={15}
              color="#82919D"
              style={{ position: 'absolute', left: 11, top: 11 }}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search asset, ID, technician..."
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            padding: '12px 16px',
            background: '#FAFCFD',
            borderBottom: '1px solid #E7EDF0',
          }}
        >
          <Filter size={14} color="#718391" />

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 130, padding: '8px 10px' }}
          >
            {['All', 'Scheduled', 'Overdue', 'Completed', 'Cancelled'].map((value) => (
              <option key={value} value={value}>{value === 'All' ? 'All statuses' : value}</option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 130, padding: '8px 10px' }}
          >
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((value) => (
              <option key={value} value={value}>{value === 'All' ? 'All priorities' : value}</option>
            ))}
          </select>

          <select
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 160, padding: '8px 10px' }}
          >
            <option value="All">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>

          {(statusFilter !== 'All' || priorityFilter !== 'All' || departmentFilter !== 'All' || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setDepartmentFilter('All');
              }}
              style={{ ...buttonStyle, padding: '8px 10px' }}
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 1050, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F7F9FA' }}>
                {['Asset / Schedule', 'Department / Location', 'Maintenance', 'Next due', 'Assigned technician', 'Priority', 'Status', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: '12px 13px',
                      fontSize: 10,
                      fontWeight: 750,
                      color: '#6D7F8C',
                      borderBottom: '1px solid #E4EAEE',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {heading.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredSchedules.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #EDF1F3' }}>
                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: 12, fontWeight: 750, color: '#253B4A' }}>
                      {item.assetName}
                    </div>
                    <div style={{ fontSize: 10, color: '#49769F', marginTop: 4 }}>
                      {item.assetCode || 'No asset code'}
                    </div>
                    <div style={{ fontSize: 10, color: '#8A98A2', marginTop: 3 }}>
                      {item.id}
                    </div>
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: '#354C5B' }}>
                      <Building2 size={13} color="#82919D" />
                      {item.department}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 10, color: '#83919C', marginTop: 6 }}>
                      <MapPin size={12} />
                      {item.location || 'Location not specified'}
                    </div>
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: 11, fontWeight: 650 }}>{item.maintenanceType}</div>
                    <div style={{ fontSize: 10, color: '#82919D', marginTop: 5 }}>
                      Every {item.frequency?.toLowerCase() || 'not specified'}
                    </div>
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: item.effectiveStatus === 'Overdue' ? '#B42318' : '#354C5B',
                    }}>
                      {formatDate(item.dueDate)}
                    </div>
                    <div style={{ fontSize: 10, color: '#87949E', marginTop: 5 }}>
                      Last: {formatDate(item.lastServiceDate)}
                    </div>
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
                      <UserRound size={13} color="#82919D" />
                      {item.technician}
                    </div>
                    <div style={{ fontSize: 10, color: '#83919C', marginTop: 6, maxWidth: 150 }}>
                      {item.vendor || 'No vendor assigned'}
                    </div>
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <PriorityBadge priority={item.priority} />
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <StatusBadge status={item.effectiveStatus} />
                  </td>

                  <td style={{ padding: '13px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        title="View details"
                        aria-label={`View ${item.id}`}
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setModalMode('details');
                        }}
                        style={{ ...buttonStyle, padding: 7 }}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        title="Edit schedule"
                        aria-label={`Edit ${item.id}`}
                        type="button"
                        onClick={() => openEdit(item)}
                        style={{ ...buttonStyle, padding: 7 }}
                      >
                        <Pencil size={14} />
                      </button>

                      {item.effectiveStatus !== 'Completed' && item.effectiveStatus !== 'Cancelled' && (
                        <button
                          title="Mark completed"
                          aria-label={`Complete ${item.id}`}
                          type="button"
                          onClick={() => markCompleted(item)}
                          style={{
                            ...buttonStyle,
                            padding: 7,
                            color: '#18794E',
                            borderColor: '#C7E7D4',
                          }}
                        >
                          <ClipboardCheck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '45px 20px', textAlign: 'center' }}>
                    <CalendarDays size={28} color="#A3B0B9" />
                    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10 }}>
                      No maintenance schedules found
                    </div>
                    <div style={{ fontSize: 11, color: '#83919C', marginTop: 5 }}>
                      Try different filters or add a new maintenance schedule.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #E7EDF0',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
            fontSize: 10,
            color: '#81909B',
          }}
        >
          <span>Schedule records are saved in this browser.</span>
          <span>For demonstration purposes · Not connected to a live service system</span>
        </div>
      </div>

      {modalMode === 'form' && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalMode('');
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(16, 34, 45, 0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 780,
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 14,
              boxShadow: '0 20px 70px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E7EDF0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750 }}>
                  {editingId ? 'Edit Maintenance Schedule' : 'Create Maintenance Schedule'}
                </h3>
                <p style={{ margin: '5px 0 0', fontSize: 11, color: '#81909B' }}>
                  Enter equipment, schedule and assignment details.
                </p>
              </div>
              <button type="button" onClick={() => setModalMode('')} style={buttonStyle}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={saveSchedule}>
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <section>
                  <h4 style={{ margin: '0 0 13px', fontSize: 12, color: '#49769F' }}>
                    Asset & location
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                    {field('Asset name', 'assetName', { required: true, placeholder: 'e.g. MRI Scanner 1.5T' })}
                    {field('Asset code', 'assetCode', { placeholder: 'e.g. AST-0001' })}
                    {field('Category', 'category', { options: ['Medical Equipment', 'Diagnostic Imaging', 'Critical Care', 'Patient Monitoring', 'Operation Theatre', 'Sterilization', 'Facility Equipment', 'Other'] })}
                    {field('Department', 'department', { required: true, placeholder: 'e.g. Radiology' })}
                    {field('Physical location', 'location', { placeholder: 'Building, floor, room or bed' })}
                  </div>
                </section>

                <section>
                  <h4 style={{ margin: '0 0 13px', fontSize: 12, color: '#49769F' }}>
                    Maintenance plan
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                    {field('Maintenance type', 'maintenanceType', { options: ['Preventive Inspection', 'Calibration', 'Electrical Safety Check', 'Performance Validation', 'Cleaning & Lubrication', 'Software / Firmware Update', 'Safety & Performance Check', 'Other'] })}
                    {field('Frequency', 'frequency', { options: ['Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly', 'As required'] })}
                    {field('Last service date', 'lastServiceDate', { type: 'date' })}
                    {field('Next due date', 'dueDate', { type: 'date', required: true })}
                    {field('Priority', 'priority', { options: ['Critical', 'High', 'Medium', 'Low'] })}
                    {field('Status', 'status', { options: ['Scheduled', 'Cancelled'] })}
                  </div>
                </section>

                <section>
                  <h4 style={{ margin: '0 0 13px', fontSize: 12, color: '#49769F' }}>
                    Assignment & notes
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 13 }}>
                    {field('Assigned technician', 'technician', { required: true, placeholder: 'Technician name' })}
                    {field('Service vendor', 'vendor', { placeholder: 'Vendor or in-house team' })}
                  </div>
                  <label style={{ ...labelStyle, marginTop: 13 }}>Work instructions / notes</label>
                  <textarea
                    value={form.notes || ''}
                    onChange={(event) => updateForm('notes', event.target.value)}
                    rows={3}
                    placeholder="Required checks, parts or safety precautions..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </section>
              </div>

              <div
                style={{
                  padding: '14px 22px',
                  background: '#FAFCFD',
                  borderTop: '1px solid #E7EDF0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                }}
              >
                <button type="button" onClick={() => setModalMode('')} style={buttonStyle}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: '#49769F',
                    borderColor: '#49769F',
                    color: '#FFFFFF',
                  }}
                >
                  <Save size={14} /> {editingId ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'details' && selected && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalMode('');
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(16, 34, 45, 0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 14,
              boxShadow: '0 20px 70px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: 21, borderBottom: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: '#49769F', fontWeight: 750 }}>{selected.id}</div>
                <h3 style={{ margin: '6px 0', fontSize: 17 }}>{selected.assetName}</h3>
                <div style={{ fontSize: 11, color: '#81909B' }}>{selected.assetCode || 'No asset code'}</div>
              </div>
              <button type="button" onClick={() => setModalMode('')} style={buttonStyle}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: 21 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <StatusBadge status={getEffectiveStatus(selected)} />
                <PriorityBadge priority={selected.priority} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  ['Department', selected.department],
                  ['Location', selected.location],
                  ['Maintenance type', selected.maintenanceType],
                  ['Frequency', selected.frequency],
                  ['Last service', formatDate(selected.lastServiceDate)],
                  ['Next due', formatDate(selected.dueDate)],
                  ['Assigned technician', selected.technician],
                  ['Vendor', selected.vendor],
                  ['Completed on', formatDate(selected.completedDate)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: '#81909B', marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 650, color: '#304858' }}>{value || '—'}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 13, borderRadius: 9, background: '#F6F9FA' }}>
                <div style={{ fontSize: 11, fontWeight: 750, marginBottom: 6 }}>Work instructions</div>
                <div style={{ fontSize: 12, color: '#617482', whiteSpace: 'pre-wrap' }}>
                  {selected.notes || 'No instructions recorded.'}
                </div>
              </div>

              {selected.completionNotes && (
                <div style={{ marginTop: 12, padding: 13, borderRadius: 9, background: '#EAF7EF' }}>
                  <div style={{ fontSize: 11, fontWeight: 750, color: '#18794E', marginBottom: 6 }}>Completion notes</div>
                  <div style={{ fontSize: 12, color: '#416B54', whiteSpace: 'pre-wrap' }}>{selected.completionNotes}</div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 21px', borderTop: '1px solid #E7EDF0', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                {getEffectiveStatus(selected) !== 'Completed' && getEffectiveStatus(selected) !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => markCompleted(selected)}
                    style={{ ...buttonStyle, color: '#18794E', borderColor: '#C7E7D4' }}
                  >
                    <CheckCircle2 size={14} /> Mark Completed
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {getEffectiveStatus(selected) !== 'Completed' && getEffectiveStatus(selected) !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = selected;
                      setModalMode('');
                      cancelSchedule(item);
                    }}
                    style={{ ...buttonStyle, color: '#B42318' }}
                  >
                    Cancel schedule
                  </button>
                )}
                <button type="button" onClick={() => setModalMode('')} style={buttonStyle}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(selected)}
                  style={{ ...buttonStyle, background: '#49769F', borderColor: '#49769F', color: '#FFFFFF' }}
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreventiveMaintenanceDesk;
