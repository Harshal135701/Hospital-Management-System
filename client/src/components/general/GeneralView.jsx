
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Network,
  Stethoscope,
  ClipboardList,
  Handshake,
  Users,
  Activity,
  IndianRupee,
  FileCheck2,
  X,
  RotateCcw,
} from 'lucide-react';

import { GENERAL_SUBMODULES, GENERAL_STORAGE_KEY } from './generalConstants';
import { GENERAL_SEED_DATA } from './generalMockData';
import './GeneralView.css';

const SECTION_CONFIG = {
  '15.1': {
    key: 'hospitals',
    title: 'Hospital & Branch Master',
    singular: 'Hospital / Branch',
    fields: [
      ['name', 'Hospital Name', 'text', true],
      ['code', 'Branch Code', 'text', true],
      ['type', 'Branch Type', 'select', true, [
        ['main_hospital', 'Main Hospital'],
        ['branch_hospital', 'Branch Hospital'],
        ['clinic', 'Clinic'],
        ['diagnostic_centre', 'Diagnostic Centre'],
      ]],
      ['registrationNo', 'Registration Number', 'text', true],
      ['phone', 'Contact Number', 'tel', true],
      ['email', 'Email Address', 'email', false],
      ['address', 'Address', 'text', true],
      ['city', 'City', 'text', true],
      ['state', 'State', 'text', true],
      ['status', 'Status', 'status', true],
    ],
    columns: [
      ['name', 'Hospital / Branch'],
      ['code', 'Branch Code'],
      ['type', 'Type'],
      ['city', 'City'],
      ['phone', 'Contact'],
      ['status', 'Status'],
    ],
  },
  '15.2': {
    key: 'departments',
    title: 'Department & Clinic Hierarchy',
    singular: 'Department / Clinic',
    fields: [
      ['name', 'Department Name', 'text', true],
      ['code', 'Department Code', 'text', true],
      ['type', 'Department Type', 'select', true, [
        ['clinical', 'Clinical'],
        ['diagnostic', 'Diagnostic'],
        ['administrative', 'Administrative'],
        ['support', 'Support Services'],
      ]],
      ['hospitalId', 'Hospital / Branch', 'hospital', true],
      ['parentId', 'Parent Department', 'department', false],
      ['head', 'Department Head', 'text', false],
      ['location', 'Location', 'text', false],
      ['status', 'Status', 'status', true],
    ],
    columns: [
      ['name', 'Department'],
      ['code', 'Code'],
      ['type', 'Type'],
      ['hospitalId', 'Hospital'],
      ['head', 'Department Head'],
      ['status', 'Status'],
    ],
  },
  '15.3': {
    key: 'doctors',
    title: 'Doctor & Consultant Master',
    singular: 'Doctor / Consultant',
    fields: [
      ['name', 'Doctor Name', 'text', true],
      ['registrationNo', 'Medical Registration No.', 'text', true],
      ['specialization', 'Specialization', 'text', true],
      ['qualification', 'Qualifications', 'text', true],
      ['hospitalId', 'Hospital / Branch', 'hospital', true],
      ['departmentId', 'Department', 'department', true],
      ['phone', 'Contact Number', 'tel', true],
      ['email', 'Email Address', 'email', false],
      ['consultationFee', 'Consultation Fee (₹)', 'number', true],
      ['availability', 'Availability / Schedule', 'text', false],
      ['status', 'Status', 'status', true],
    ],
    columns: [
      ['name', 'Doctor / Consultant'],
      ['specialization', 'Specialization'],
      ['registrationNo', 'Registration No.'],
      ['departmentId', 'Department'],
      ['consultationFee', 'Consultation Fee'],
      ['status', 'Status'],
    ],
  },
  '15.4': {
    key: 'services',
    title: 'Service Catalog & Tariff Master',
    singular: 'Hospital Service',
    fields: [
      ['name', 'Service Name', 'text', true],
      ['code', 'Service Code', 'text', true],
      ['category', 'Service Category', 'select', true, [
        ['consultation', 'Consultation'],
        ['procedure', 'Procedure'],
        ['diagnostic', 'Diagnostic'],
        ['laboratory', 'Laboratory'],
        ['imaging', 'Imaging'],
        ['bed', 'Bed / Room'],
        ['other', 'Other'],
      ]],
      ['hospitalId', 'Hospital / Branch', 'hospital', true],
      ['departmentId', 'Department', 'department', true],
      ['standardRate', 'Standard Rate (₹)', 'number', true],
      ['taxPercent', 'Tax (%)', 'number', true],
      ['unit', 'Billing Unit', 'text', true],
      ['status', 'Status', 'status', true],
    ],
    columns: [
      ['name', 'Service'],
      ['code', 'Service Code'],
      ['category', 'Category'],
      ['departmentId', 'Department'],
      ['standardRate', 'Standard Rate'],
      ['status', 'Status'],
    ],
  },
  '15.5': {
    key: 'contracts',
    title: 'Corporate Tariff Rate Contracts',
    singular: 'Corporate Contract',
    fields: [
      ['contractNo', 'Contract Number', 'text', true],
      ['corporateName', 'Corporate / Company Name', 'text', true],
      ['corporateCode', 'Corporate Code', 'text', true],
      ['hospitalId', 'Hospital / Branch', 'hospital', true],
      ['startDate', 'Contract Start Date', 'date', true],
      ['endDate', 'Contract End Date', 'date', true],
      ['discountPercent', 'Default Discount (%)', 'number', true],
      ['contactPerson', 'Contact Person', 'text', true],
      ['contactEmail', 'Contact Email', 'email', false],
      ['status', 'Contract Status', 'contractStatus', true],
    ],
    columns: [
      ['contractNo', 'Contract No.'],
      ['corporateName', 'Corporate'],
      ['hospitalId', 'Hospital'],
      ['startDate', 'Start Date'],
      ['endDate', 'End Date'],
      ['status', 'Status'],
    ],
  },
};

const ICONS = {
  '15.1': Building2,
  '15.2': Network,
  '15.3': Stethoscope,
  '15.4': ClipboardList,
  '15.5': Handshake,
};

const createId = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const humanize = (value) => {
  if (value === null || value === undefined || value === '') return '—';

  const labels = {
    main_hospital: 'Main Hospital',
    branch_hospital: 'Branch Hospital',
    diagnostic_centre: 'Diagnostic Centre',
    clinical: 'Clinical',
    diagnostic: 'Diagnostic',
    administrative: 'Administrative',
    support: 'Support Services',
    consultation: 'Consultation',
    procedure: 'Procedure',
    laboratory: 'Laboratory',
    imaging: 'Imaging',
    bed: 'Bed / Room',
    other: 'Other',
    pending_approval: 'Pending Approval',
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    terminated: 'Terminated',
    draft: 'Draft',
  };

  return labels[value] || String(value).replaceAll('_', ' ');
};

const formatMoney = (value) =>
  value === null || value === undefined || value === ''
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN')}`;

const getInitialData = () => {
  try {
    const saved = localStorage.getItem(GENERAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Could not load General module data:', error);
  }

  return JSON.parse(JSON.stringify(GENERAL_SEED_DATA));
};

export function GeneralView({ initialSubtab = '15.1', onNavigate }) {
  const [activeTab, setActiveTab] = useState(
    SECTION_CONFIG[initialSubtab] ? initialSubtab : '15.1'
  );
  const [data, setData] = useState(getInitialData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(GENERAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Could not save General module data:', error);
    }
  }, [data]);

  useEffect(() => {
    if (initialSubtab && SECTION_CONFIG[initialSubtab]) {
      setActiveTab(initialSubtab);
    }
  }, [initialSubtab]);

  const config = SECTION_CONFIG[activeTab];
  const records = data[config.key] || [];

  const hospitalOptions = (data.hospitals || []).map((item) => [
    item.id,
    item.name,
  ]);

  const departmentOptions = (data.departments || []).map((item) => [
    item.id,
    item.name,
  ]);

  const resolveValue = (key, value) => {
    if (key === 'hospitalId') {
      return data.hospitals?.find((item) => item.id === value)?.name || '—';
    }
    if (key === 'departmentId' || key === 'parentId') {
      return data.departments?.find((item) => item.id === value)?.name || '—';
    }
    if (key.toLowerCase().includes('rate') || key === 'consultationFee') {
      return formatMoney(value);
    }
    if (key === 'discountPercent' || key === 'taxPercent') {
      return value === '' || value == null ? '—' : `${value}%`;
    }
    return humanize(value);
  };

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        Object.values(record).some((value) => {
          if (Array.isArray(value) || (value && typeof value === 'object')) {
            return false;
          }
          return String(value ?? '').toLowerCase().includes(query);
        });

      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const activeCount = records.filter((item) => item.status === 'active').length;
  const inactiveCount = records.filter((item) => item.status === 'inactive').length;

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const openAddModal = () => {
    const initial = {};

    config.fields.forEach(([key, , type, , options]) => {
      if (type === 'status') initial[key] = 'active';
      else if (type === 'contractStatus') initial[key] = 'draft';
      else if (type === 'select') initial[key] = options?.[0]?.[0] || '';
      else if (type === 'number') initial[key] = '0';
      else initial[key] = '';
    });

    if (activeTab === '15.1') initial.type = 'branch_hospital';
    if (activeTab === '15.5') initial.status = 'draft';

    setEditingRecord(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    const values = { ...record };

    config.fields.forEach(([key, , type]) => {
      if (type === 'number') values[key] = String(values[key] ?? 0);
      else values[key] = values[key] ?? '';
    });

    setEditingRecord(record);
    setForm(values);
    setModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredFields = config.fields.filter((field) => field[3]);
    const missing = requiredFields.find(
      ([key]) => form[key] === '' || form[key] === null || form[key] === undefined
    );

    if (missing) {
      notify(`Please enter ${missing[1].toLowerCase()}.`);
      return;
    }

    if (
      activeTab === '15.5' &&
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      notify('Contract end date cannot be before the start date.');
      return;
    }

    const idPrefixes = {
      '15.1': 'HSP',
      '15.2': 'DEP',
      '15.3': 'DOC',
      '15.4': 'SRV',
      '15.5': 'CTR',
    };

    const normalized = { ...form };

    config.fields.forEach(([key, , type]) => {
      if (type === 'number') normalized[key] = Number(normalized[key] || 0);
    });

    if (activeTab === '15.5') {
      normalized.rates = editingRecord?.rates || [];
    }

    if (editingRecord) {
      setData((previous) => ({
        ...previous,
        [config.key]: previous[config.key].map((item) =>
          item.id === editingRecord.id ? { ...item, ...normalized } : item
        ),
      }));
      notify(`${config.singular} updated successfully.`);
    } else {
      const newRecord = {
        ...normalized,
        id: createId(idPrefixes[activeTab]),
      };

      setData((previous) => ({
        ...previous,
        [config.key]: [newRecord, ...previous[config.key]],
      }));
      notify(`${config.singular} added successfully.`);
    }

    setModalOpen(false);
  };

  const deleteRecord = (record) => {
    const label = record.name || record.corporateName || record.contractNo;

    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    setData((previous) => ({
      ...previous,
      [config.key]: previous[config.key].filter((item) => item.id !== record.id),
    }));

    notify(`${config.singular} deleted.`);
  };

  const resetDemoData = () => {
    if (!window.confirm('Reset all five General submodules to the original demo data?')) {
      return;
    }

    const freshData = JSON.parse(JSON.stringify(GENERAL_SEED_DATA));
    setData(freshData);
    setSearch('');
    setStatusFilter('all');
    notify('General demo data has been reset.');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearch('');
    setStatusFilter('all');

    if (onNavigate) onNavigate(tabId);
  };

  const stats = [
    {
      label: 'Total Records',
      value: records.length,
      icon: Activity,
      tone: 'teal',
    },
    {
      label: 'Active Records',
      value: activeCount,
      icon: FileCheck2,
      tone: 'green',
    },
    {
      label: 'Inactive Records',
      value: inactiveCount,
      icon: Users,
      tone: 'amber',
    },
    {
      label: 'Submodules',
      value: GENERAL_SUBMODULES.length,
      icon: Network,
      tone: 'blue',
    },
  ];

  return (
    <div className="general-page">
      <div className="general-breadcrumb">
        <span>Administration</span>
        <span className="general-breadcrumb-separator">/</span>
        <span>General</span>
        <span className="general-breadcrumb-separator">/</span>
        <strong>{config.title}</strong>
      </div>

      <header className="general-header">
        <div className="general-header-copy">
          <div className="general-eyebrow">MASTER DATA MANAGEMENT</div>
          <h1>General Administration</h1>
          <p>
            Manage hospital structure, medical staff, service pricing, and
            corporate agreements from one workspace.
          </p>
        </div>

        <button
          type="button"
          className="general-button general-button-secondary"
          onClick={resetDemoData}
        >
          <RotateCcw size={16} />
          Reset Demo
        </button>
      </header>

      <div className="general-module-tabs">
        {GENERAL_SUBMODULES.map((item) => {
          const Icon = ICONS[item.id];
          const selected = activeTab === item.id;

          return (
            <button
              type="button"
              key={item.id}
              className={`general-module-tab ${selected ? 'is-active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="general-tab-icon">
                <Icon size={18} />
              </span>
              <span className="general-tab-text">
                <span className="general-tab-label">{item.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="general-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="general-stat-card" key={item.label}>
              <div className={`general-stat-icon tone-${item.tone}`}>
                <Icon size={19} />
              </div>
              <div>
                <div className="general-stat-label">{item.label}</div>
                <div className="general-stat-value">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="general-content-card">
        <div className="general-section-heading">
          <div className="general-section-icon">
            {React.createElement(ICONS[activeTab], { size: 21 })}
          </div>
          <div className="general-section-title">
            <h2>{config.title}</h2>
            <p>{GENERAL_SUBMODULES.find((item) => item.id === activeTab)?.description}</p>
          </div>
          <span className="general-record-count">{records.length} records</span>
        </div>

        <div className="general-toolbar">
          <div className="general-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${config.singular.toLowerCase()}...`}
              aria-label={`Search ${config.title}`}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="general-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {[
              'active',
              'inactive',
              'draft',
              'pending_approval',
              'expired',
              'terminated',
            ].map((status) => (
              <option key={status} value={status}>
                {humanize(status)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="general-button general-button-primary"
            onClick={openAddModal}
          >
            <Plus size={17} />
            Add {config.singular}
          </button>
        </div>

        <div className="general-table-wrap">
          <table className="general-table">
            <thead>
              <tr>
                {config.columns.map(([, label]) => (
                  <th key={label}>{label}</th>
                ))}
                <th className="general-actions-heading">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  {config.columns.map(([key, label]) => {
                    const value = record[key];

                    return (
                      <td key={key}>
                        {key === 'status' ? (
                          <span
                            className={`general-status status-${record.status}`}
                          >
                            <span className="general-status-dot" />
                            {humanize(record.status)}
                          </span>
                        ) : key === 'name' || key === 'corporateName' || key === 'contractNo' ? (
                          <div className="general-primary-cell">
                            <strong>{value || '—'}</strong>
                            <span>{record.id}</span>
                          </div>
                        ) : (
                          <span>{resolveValue(key, value)}</span>
                        )}
                      </td>
                    );
                  })}

                  <td>
                    <div className="general-row-actions">
                      <button
                        type="button"
                        className="general-icon-button"
                        aria-label={`Edit ${record.name || record.corporateName || record.id}`}
                        title="Edit record"
                        onClick={() => openEditModal(record)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="general-icon-button danger"
                        aria-label={`Delete ${record.name || record.corporateName || record.id}`}
                        title="Delete record"
                        onClick={() => deleteRecord(record)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1}>
                    <div className="general-empty-state">
                      <Search size={26} />
                      <strong>No matching records</strong>
                      <span>Try a different search or status filter.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="general-table-footer">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of{' '}
            <strong>{records.length}</strong> records
          </span>
          <span>General Administration</span>
        </div>
      </section>

      {modalOpen && (
        <div
          className="general-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className="general-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="general-modal-title"
          >
            <header className="general-modal-header">
              <div>
                <div className="general-eyebrow">
                  {editingRecord ? 'UPDATE MASTER DATA' : 'CREATE MASTER DATA'}
                </div>
                <h2 id="general-modal-title">
                  {editingRecord ? 'Edit' : 'Add'} {config.singular}
                </h2>
                <p>Enter the details below. Fields marked * are required.</p>
              </div>
              <button
                type="button"
                className="general-icon-button"
                aria-label="Close form"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="general-form-grid">
                {config.fields.map(([key, label, type, required, options]) => {
                  let choices = options || [];

                  if (type === 'status') {
                    choices = [
                      ['active', 'Active'],
                      ['inactive', 'Inactive'],
                    ];
                  } else if (type === 'contractStatus') {
                    choices = [
                      ['draft', 'Draft'],
                      ['pending_approval', 'Pending Approval'],
                      ['active', 'Active'],
                      ['expired', 'Expired'],
                      ['terminated', 'Terminated'],
                    ];
                  } else if (type === 'hospital') {
                    choices = hospitalOptions;
                  } else if (type === 'department') {
                    choices = departmentOptions;
                    if (key === 'parentId') {
                      choices = [['', 'No parent department'], ...choices];
                    }
                  }

                  return (
                    <label className="general-form-field" key={key}>
                      <span>
                        {label}
                        {required && <b> *</b>}
                      </span>

                      {[
                        'select',
                        'status',
                        'contractStatus',
                        'hospital',
                        'department',
                      ].includes(type) ? (
                        <select
                          value={form[key] ?? ''}
                          required={required}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select {label.toLowerCase()}</option>
                          {choices.map(([value, optionLabel]) => (
                            <option key={value || 'none'} value={value}>
                              {optionLabel}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={type}
                          min={type === 'number' ? 0 : undefined}
                          step={type === 'number' ? 'any' : undefined}
                          value={form[key] ?? ''}
                          required={required}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              [key]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              <footer className="general-modal-footer">
                <button
                  type="button"
                  className="general-button general-button-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="general-button general-button-primary"
                >
                  {editingRecord ? 'Save Changes' : 'Create Record'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="general-toast" role="status">
          <span className="general-toast-check">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default GeneralView;
