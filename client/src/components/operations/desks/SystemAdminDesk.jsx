import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Bell,
  Lock,
  Search,
  Filter,
  Power,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Server,
  Layers,
  Check,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import {
  INITIAL_USER_SESSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEPARTMENTS,
  INITIAL_EVENTS,
  INITIAL_RBAC_MATRIX
} from '../operationsMockData';
import { DepartmentService } from '../../../services/api';

export function SystemAdminDesk({
  activeSubtab = '29.1',
  currentUser = null,
  onNavigateSubmodule
}) {
  const [sessions, setSessions] = useState(INITIAL_USER_SESSIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [rbacMatrix, setRbacMatrix] = useState(INITIAL_RBAC_MATRIX);

  // Filter & Search states
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState('all');
  const [sessionSearch, setSessionSearch] = useState('');

  // Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    hod: 'Dr. Arindam Mitra',
    clinics: 2,
    inpatientBeds: 10
  });

  // Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    channel: 'SMS + Pager Webhook',
    recipient: '',
    triggerCondition: ''
  });

  // RBAC Edit Confirmation Modal
  const [pendingRbacChange, setPendingRbacChange] = useState(null);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);

  // Terminate Session Modal
  const [sessionToTerminate, setSessionToTerminate] = useState(null);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load live departments if available
  useEffect(() => {
    async function loadDepts() {
      try {
        const live = await DepartmentService.getDepartments();
        if (Array.isArray(live) && live.length > 0) {
          // Merge or supplement
          const mapped = live.map((d, idx) => ({
            id: d.id,
            code: d.code || `DEP-0${idx + 1}`,
            name: d.name,
            hod: d.hod || 'Dr. Department Lead',
            clinics: d.clinic_count || 2,
            inpatientBeds: d.bed_count || 12,
            status: 'Active'
          }));
          setDepartments(mapped);
        }
      } catch (e) {
        console.warn('[SystemAdminDesk] Using fallback departments master.');
      }
    }
    loadDepts();
  }, []);

  // Filtered Sessions (29.1)
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (sessionSearch.trim()) {
        const q = sessionSearch.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.username.toLowerCase().includes(q) ||
          s.ipAddress.includes(q) ||
          s.terminal.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sessions, sessionSearch]);

  // Filtered Audit Logs (29.2)
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditCategory !== 'all' && log.category !== auditCategory) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        return (
          log.actor.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.resource.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.ipAddress.includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, auditCategory, auditSearch]);

  // Categories in Audit Trail
  const auditCategories = useMemo(() => {
    const set = new Set(auditLogs.map(l => l.category));
    return ['all', ...Array.from(set)];
  }, [auditLogs]);

  // Session Termination Handler
  const handleConfirmTerminateSession = () => {
    if (!sessionToTerminate) return;
    setSessions(prev => prev.filter(s => s.id !== sessionToTerminate.id));
    showToast(`Staff session for ${sessionToTerminate.fullName} (${sessionToTerminate.ipAddress}) terminated. Bearer token revoked.`);
    setSessionToTerminate(null);
  };

  // Add Department Handler (29.3)
  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      alert('Department Code and Name are required.');
      return;
    }

    const newDept = {
      id: `DEP-${Math.floor(10 + Math.random() * 89)}`,
      code: deptForm.code.toUpperCase(),
      name: deptForm.name,
      hod: deptForm.hod,
      clinics: parseInt(deptForm.clinics, 10) || 1,
      inpatientBeds: parseInt(deptForm.inpatientBeds, 10) || 0,
      status: 'Active'
    };

    setDepartments([newDept, ...departments]);
    setIsDeptModalOpen(false);
    setDeptForm({ code: '', name: '', hod: 'Dr. Arindam Mitra', clinics: 2, inpatientBeds: 10 });
    showToast(`Department "${newDept.name}" created and configured in hospital registry.`);
  };

  // Toggle Event Webhook (29.4)
  const handleToggleEvent = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
    showToast('System event trigger status updated.');
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.recipient) {
      alert('Event name and recipient are required.');
      return;
    }

    const newEvt = {
      id: `EVT-0${events.length + 1}`,
      name: eventForm.name,
      channel: eventForm.channel,
      recipient: eventForm.recipient,
      triggerCondition: eventForm.triggerCondition || 'Automated hospital event trigger',
      enabled: true
    };

    setEvents([...events, newEvt]);
    setIsEventModalOpen(false);
    setEventForm({ name: '', channel: 'SMS + Pager Webhook', recipient: '', triggerCondition: '' });
    showToast(`Event trigger "${newEvt.name}" added to system dispatcher.`);
  };

  // Toggle RBAC Permission Flag (29.5)
  const handleRbacCellClick = (moduleName, roleKey, currentValue) => {
    setPendingRbacChange({
      moduleName,
      roleKey,
      currentValue,
      newValue: !currentValue
    });
    setIsRbacModalOpen(true);
  };

  const handleConfirmRbacChange = () => {
    if (!pendingRbacChange) return;
    const { moduleName, roleKey, newValue } = pendingRbacChange;

    setRbacMatrix(prev => prev.map(row => {
      if (row.module === moduleName) {
        return { ...row, [roleKey]: newValue };
      }
      return row;
    }));

    showToast(`RBAC matrix updated: ${moduleName} [${roleKey.toUpperCase()}] set to ${newValue ? 'ENABLED' : 'REVOKED'}.`);
    setIsRbacModalOpen(false);
    setPendingRbacChange(null);
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

      {/* SUBMODULE 29.1: View User Sessions */}
      {activeSubtab === '29.1' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  Active Staff User Sessions (29.1)
                </span>
                <Badge variant="teal" size="sm">
                  {sessions.length} Live Terminals
                </Badge>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Real-time tracking of institutional staff credentials, terminal IP addresses, active workstations, and remote token invalidation.
              </p>
            </div>

            <div style={{ width: '240px' }}>
              <Input
                placeholder="Search staff, username, IP..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Staff Name & User</th>
                  <th style={{ padding: '8px 10px' }}>Role</th>
                  <th style={{ padding: '8px 10px' }}>Branch & Terminal</th>
                  <th style={{ padding: '8px 10px' }}>IP Address & Browser</th>
                  <th style={{ padding: '8px 10px' }}>Login Time</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {s.fullName}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        @{s.username} • {s.id}
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="secondary" size="sm">
                        {s.roleLabel || s.role}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '500' }}>{s.branch}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>{s.terminal}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: '600' }}>{s.ipAddress}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>{s.device}</div>
                    </td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <div>{s.loginTime}</div>
                      <div style={{ fontSize: '0.70rem', color: '#16A34A' }}>Active {s.lastActive}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={s.status === 'Active' ? 'teal' : 'amber'} size="sm">
                        {s.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Power}
                        onClick={() => setSessionToTerminate(s)}
                        title="Forcefully terminate session & revoke token"
                      >
                        Terminate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.2: System Audit Trail & Clinical Audit Trail */}
      {activeSubtab === '29.2' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  Hospital System & Clinical Audit Trail (29.2)
                </span>
                <Badge variant="teal" size="sm">
                  Read-Only Immutable Archive
                </Badge>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Immutable historical event log tracing all clinical prescriptions, diagnostic reports, POS cash settlements, and security permission overrides.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '220px' }}>
                <Input
                  placeholder="Search actor, action, resource..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {auditCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setAuditCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: auditCategory === cat ? 'var(--color-primary-teal)' : 'var(--color-border)',
                  backgroundColor: auditCategory === cat ? 'var(--color-primary-teal)' : 'transparent',
                  color: auditCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: auditCategory === cat ? '600' : '400',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === 'all' ? 'All Audit Categories' : cat}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Audit ID & Time</th>
                  <th style={{ padding: '8px 10px' }}>Staff Actor</th>
                  <th style={{ padding: '8px 10px' }}>Category</th>
                  <th style={{ padding: '8px 10px' }}>Action Type</th>
                  <th style={{ padding: '8px 10px' }}>Affected Resource</th>
                  <th style={{ padding: '8px 10px' }}>Event Details</th>
                  <th style={{ padding: '8px 10px' }}>Terminal IP</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {log.id}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                        {log.timestamp}
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600' }}>{log.actor}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>{log.role}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="secondary" size="sm">
                        {log.category}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                      {log.resource}
                    </td>
                    <td style={{ padding: '10px', maxWidth: '300px', lineHeight: 1.35 }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                      {log.ipAddress}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={log.status === 'Success' ? 'teal' : 'amber'} size="sm">
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.3: Department & Module Master Setup */}
      {activeSubtab === '29.3' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  Department & Clinical Discipline Master (29.3)
                </span>
                <Badge variant="teal" size="sm">
                  {departments.length} Disciplines
                </Badge>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Setup clinical departments, inpatient bed allocation caps, designated Head of Department (HOD), and clinic hierarchies.
              </p>
            </div>

            <Button variant="primary" icon={Plus} onClick={() => setIsDeptModalOpen(true)}>
              Add Department
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Dept Code</th>
                  <th style={{ padding: '8px 10px' }}>Department Name</th>
                  <th style={{ padding: '8px 10px' }}>Head of Department (HOD)</th>
                  <th style={{ padding: '8px 10px' }}>OPD Clinics</th>
                  <th style={{ padding: '8px 10px' }}>Inpatient Beds</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                      {d.code}
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600' }}>
                      {d.name}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {d.hod}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {d.clinics} Consultation Rooms
                    </td>
                    <td style={{ padding: '10px' }}>
                      {d.inpatientBeds} Dedicated Beds
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="teal" size="sm">
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.4: System Event Configuration */}
      {activeSubtab === '29.4' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  System Notification Event Triggers & Webhooks (29.4)
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Configure critical hospital alert dispatches, panic value push notifications, SMS gateways, and administrative webhooks.
              </p>
            </div>

            <Button variant="primary" icon={Plus} onClick={() => setIsEventModalOpen(true)}>
              New Event Trigger
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: evt.enabled ? '#FFFFFF' : '#F8FAFC'
                }}
              >
                <div style={{ flex: 1, paddingRight: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                      {evt.id}
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                      {evt.name}
                    </span>
                    <Badge variant={evt.enabled ? 'teal' : 'secondary'} size="sm">
                      {evt.channel}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                    <strong>Trigger:</strong> {evt.triggerCondition} • <strong>Recipient:</strong> {evt.recipient}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleEvent(evt.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '14px',
                      border: '1px solid',
                      borderColor: evt.enabled ? '#10B981' : '#CBD5E1',
                      backgroundColor: evt.enabled ? '#ECFDF5' : '#F1F5F9',
                      color: evt.enabled ? '#065F46' : '#64748B',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {evt.enabled ? 'Active / Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.5: Role-Based Access Control (RBAC) & Permissions */}
      {activeSubtab === '29.5' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
                  Role-Based Access Control (RBAC) Permissions Matrix (29.5)
                </span>
                <Badge variant="teal" size="sm">
                  7 Approved Hospital Roles
                </Badge>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Granular permission matrix across hospital modules. Click any checkbox to modify permission safeguards with administrative confirmation.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)', textAlign: 'center' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Hospital Functional Module</th>
                  <th style={{ padding: '10px' }}>Doctor</th>
                  <th style={{ padding: '10px' }}>Nurse</th>
                  <th style={{ padding: '10px' }}>Pharmacist</th>
                  <th style={{ padding: '10px' }}>Cashier</th>
                  <th style={{ padding: '10px' }}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map((row) => (
                  <tr key={row.module} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {row.module}
                    </td>
                    {['doctor', 'nurse', 'pharmacist', 'cashier', 'admin'].map((roleKey) => {
                      const isAllowed = row[roleKey];
                      return (
                        <td key={roleKey} style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRbacCellClick(row.module, roleKey, isAllowed)}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '4px',
                              border: isAllowed ? '1px solid #10B981' : '1px solid #CBD5E1',
                              backgroundColor: isAllowed ? '#ECFDF5' : '#FFFFFF',
                              color: isAllowed ? '#059669' : '#94A3B8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.12s ease'
                            }}
                            title={`Toggle ${roleKey} permission for ${row.module}`}
                          >
                            {isAllowed ? <Check size={16} strokeWidth={2.5} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Department Modal (29.3) */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Register New Hospital Department Master"
        size="md"
      >
        <form onSubmit={handleSaveDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <Input
              label="Dept Code (e.g. CARD, NEUR)"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              required
            />
            <Input
              label="Department Full Name"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              required
            />
          </div>
          <Input
            label="Head of Department (HOD)"
            value={deptForm.hod}
            onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="OPD Consultation Rooms"
              type="number"
              value={deptForm.clinics}
              onChange={(e) => setDeptForm({ ...deptForm, clinics: e.target.value })}
            />
            <Input
              label="Inpatient Beds Quota"
              type="number"
              value={deptForm.inpatientBeds}
              onChange={(e) => setDeptForm({ ...deptForm, inpatientBeds: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Event Modal (29.4) */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Configure New Notification Event Webhook"
        size="md"
      >
        <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            label="Event Name / Description"
            value={eventForm.name}
            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            placeholder="e.g. Code Blue Resuscitation Alert"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Dispatch Channel
              </label>
              <Select
                value={eventForm.channel}
                onChange={(e) => setEventForm({ ...eventForm, channel: e.target.value })}
              >
                <option>SMS + Pager Webhook</option>
                <option>Email Notification</option>
                <option>Real-Time EMR Flag</option>
                <option>Work Order Auto-Ticket</option>
              </Select>
            </div>
            <Input
              label="Designated Recipient / Role"
              value={eventForm.recipient}
              onChange={(e) => setEventForm({ ...eventForm, recipient: e.target.value })}
              placeholder="e.g. ICU Duty Team"
              required
            />
          </div>
          <Input
            label="Trigger Condition Rule"
            value={eventForm.triggerCondition}
            onChange={(e) => setEventForm({ ...eventForm, triggerCondition: e.target.value })}
            placeholder="e.g. Patient Vitals SpO2 < 85%"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Event Trigger
            </Button>
          </div>
        </form>
      </Modal>

      {/* Terminate Session Confirmation Dialog (29.1) */}
      {sessionToTerminate && (
        <Modal
          isOpen={Boolean(sessionToTerminate)}
          onClose={() => setSessionToTerminate(null)}
          title="Confirm Remote Session Termination"
          size="sm"
        >
          <div style={{ padding: '8px 0', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '10px' }}>
              <ShieldAlert size={24} />
              <span style={{ fontWeight: '700' }}>Revoke Staff Access Token Immediately?</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              Are you sure you want to terminate the active session for <strong>{sessionToTerminate.fullName}</strong> at terminal <strong>{sessionToTerminate.terminal}</strong> ({sessionToTerminate.ipAddress})? Their current JWT cryptographic token will be blacklisted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setSessionToTerminate(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmTerminateSession}>
                Terminate Session
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* RBAC Change Confirmation Dialog (29.5) */}
      {pendingRbacChange && (
        <Modal
          isOpen={isRbacModalOpen}
          onClose={() => setIsRbacModalOpen(false)}
          title="Security Authorization: Modify RBAC Privilege"
          size="sm"
        >
          <div style={{ padding: '8px 0', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#B45309', marginBottom: '10px' }}>
              <AlertTriangle size={24} />
              <span style={{ fontWeight: '700' }}>Confirm Institutional Privilege Change</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
              You are about to change permissions for <strong>{pendingRbacChange.moduleName}</strong> for role <strong>{pendingRbacChange.roleKey.toUpperCase()}</strong> from <strong>{pendingRbacChange.currentValue ? 'ENABLED' : 'REVOKED'}</strong> to <strong>{pendingRbacChange.newValue ? 'ENABLED' : 'REVOKED'}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" onClick={() => setIsRbacModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmRbacChange}>
                Confirm & Apply
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SystemAdminDesk;
