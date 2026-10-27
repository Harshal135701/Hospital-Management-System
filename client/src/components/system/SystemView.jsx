import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Settings,
  Bell,
  Key,
  Terminal,
  Database,
  FileText,
  Activity,
  Layers,
  Lock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Eye,
  Edit2,
  Plus,
  Save,
  Check,
  X
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  SYSTEM_SUBMODULES,
  INITIAL_SESSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EVENT_CONFIGS,
  INITIAL_NUMBERING_PREFIXES,
  ALL_32_MODULE_NAMES
} from './systemConstants';

export function SystemView({ initialSubtab = '29.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('29.')) return initialSubtab;
    return '29.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = SYSTEM_SUBMODULES.find(s => s.id === (initialSubtab || '29.1'));
    return parent?.subsubmodules[0]?.id || '29.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('system:', '');
      if (SYSTEM_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || SYSTEM_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`system:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`system:${activeSubtab}:${subsubId}`);
    }
  };

  // State: Sessions
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionToTerminate, setSessionToTerminate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleTerminateSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setSessionToTerminate(null);
    triggerToast(`Session ${id} successfully revoked. Workstation logged out immediately.`);
  };

  // State: Audit Logs
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [inspectedAuditLog, setInspectedAuditLog] = useState(null);

  // State: Setup & Numbering
  const [prefixes, setPrefixes] = useState(INITIAL_NUMBERING_PREFIXES);
  const [editingPrefix, setEditingPrefix] = useState(null);

  // State: Events
  const [eventConfigs, setEventConfigs] = useState(INITIAL_EVENT_CONFIGS);
  const [editingEvent, setEditingEvent] = useState(null);

  // State: RBAC
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [permissions, setPermissions] = useState(() => {
    const map = {};
    ALL_32_MODULE_NAMES.forEach((m, idx) => {
      map[m] = {
        view: true,
        create: idx % 2 === 0,
        edit: idx % 3 === 0,
        delete: false,
        approve: idx === 5 || idx === 18 || idx === 22
      };
    });
    return map;
  });

  const togglePermission = (mod, action) => {
    setPermissions(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod]?.[action]
      }
    }));
  };

  const activeSubmoduleObj = SYSTEM_SUBMODULES.find(s => s.id === activeSubtab) || SYSTEM_SUBMODULES[0];
  const activeSubsubmoduleObj = activeSubmoduleObj.subsubmodules.find(ss => ss.id === activeSubsubtab) || activeSubmoduleObj.subsubmodules[0];

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
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  System Administration & Governance
                </h1>
                <Badge variant="teal">NABH & ISO 27001 Compliant</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '780px' }}>
                Enterprise hospital system monitoring: live user sessions, dual clinical & system audit trails, department master sequence setups, event trigger engines, and 32-module RBAC permissions.
              </p>
            </div>
          </div>

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
            <ShieldCheck size={16} color="var(--color-success)" />
            NABH Compliance & Audit Shield Active
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
          {SYSTEM_SUBMODULES.map(tab => {
            const Icon = tab.icon;
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
          {SYSTEM_SUBMODULES.find(s => s.id === activeSubtab)?.subsubmodules.map(subsub => {
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

      {/* SUBMODULE 29.1: VIEW USER SESSIONS */}
      {activeSubtab === '29.1' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                Live Active Staff Sessions
              </h2>
              <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '2px 0 0' }}>
                Workstation terminal connections, IP address logs, and remote disconnection controls.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748B' }} />
                <input
                  type="text"
                  placeholder="Search staff, IP, or location..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.80rem',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg-soft-cyan)'
                  }}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => triggerToast('Session heartbeat synchronized across all terminals.')}
              >
                Refresh Heartbeats
              </Button>
            </div>
          </div>

          {/* Sessions Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', color: '#0A4174', fontWeight: '700' }}>
                  <th style={{ padding: '10px 14px' }}>Staff Member</th>
                  <th style={{ padding: '10px 14px' }}>Role & Department</th>
                  <th style={{ padding: '10px 14px' }}>Terminal IP & Location</th>
                  <th style={{ padding: '10px 14px' }}>Login Time & Ping</th>
                  <th style={{ padding: '10px 14px' }}>Session Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Security Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions
                  .filter(s =>
                    s.fullName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
                    s.workstationIp.includes(sessionSearch) ||
                    s.terminalLocation.toLowerCase().includes(sessionSearch.toLowerCase())
                  )
                  .map((s, idx) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-soft-cyan)'
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#1E293B' }}>{s.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.username} • {s.id}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '600', color: '#0A4174' }}>{s.role}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.department}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                          <Terminal size={13} color="#0A4174" />
                          <span>{s.workstationIp}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.terminalLocation}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div>{s.loginTimestamp}</div>
                        <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>Ping: {s.lastPing}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant={s.status === 'Active' ? 'success' : 'warning'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSessionToTerminate(s)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <LogOut size={12} />
                          <span>Terminate</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.2: AUDIT TRAILS */}
      {activeSubtab === '29.2' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                System & Clinical Audit Trails
              </h2>
              <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '2px 0 0' }}>
                Immutable tamper-proof event stream recording every permission change, drug dosage edit, and diagnostic update.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={auditTypeFilter}
                onChange={(e) => setAuditTypeFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="CLINICAL">Clinical EMR Alterations</option>
                <option value="SYSTEM">System & Authentication</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => triggerToast('Tamper-proof compliance report exported (SHA-256 seal verified).')}
              >
                Export Audit Log
              </Button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', color: '#0A4174', fontWeight: '700' }}>
                  <th style={{ padding: '10px 14px' }}>Audit ID / Time</th>
                  <th style={{ padding: '10px 14px' }}>Domain & Action</th>
                  <th style={{ padding: '10px 14px' }}>Entity / Target</th>
                  <th style={{ padding: '10px 14px' }}>Patient UHID</th>
                  <th style={{ padding: '10px 14px' }}>Staff ID & IP</th>
                  <th style={{ padding: '10px 14px' }}>Changes (Old → New)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Verify</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs
                  .filter(log => auditTypeFilter === 'ALL' || log.type === auditTypeFilter)
                  .map((log, idx) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-soft-cyan)'
                      }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#1E293B' }}>{log.id}</div>
                        <div style={{ fontSize: '0.70rem', color: '#64748B' }}>{log.timestamp}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant={log.type === 'CLINICAL' ? 'teal' : 'neutral'}>{log.type}</Badge>
                        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#0A4174', marginLeft: '6px' }}>{log.action}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1E293B' }}>
                        {log.entity}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {log.uhid !== 'N/A' ? (
                          <div>
                            <span style={{ fontWeight: '600', color: '#0A4174' }}>{log.uhid}</span>
                            <div style={{ fontSize: '0.70rem', color: '#64748B' }}>{log.patientName}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600' }}>{log.userId}</div>
                        <div style={{ fontSize: '0.70rem', color: '#64748B' }}>IP: {log.terminalIp}</div>
                      </td>
                      <td style={{ padding: '10px 14px', maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#DC2626', textDecoration: 'line-through' }}>{log.oldValue}</div>
                        <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: '600' }}>{log.newValue}</div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setInspectedAuditLog(log)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: '#FFFFFF',
                            color: '#0A4174',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: '600'
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.3: SETUP - DEPARTMENT MASTER SETUP */}
      {activeSubtab === '29.3' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                Document Sequence Numbering & Department Prefixes
              </h2>
              <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '2px 0 0' }}>
                Standardize unique auto-numbering series for patient UHIDs, billing receipts, laboratory accessions, and work tickets.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={() => triggerToast('Sequence numbering rules successfully committed to system database.')}
            >
              Save Prefix Rules
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {prefixes.map((pfx) => (
              <div
                key={pfx.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-soft-cyan)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0A4174', textTransform: 'uppercase' }}>
                    {pfx.module}
                  </span>
                  <Badge variant="teal">{pfx.id}</Badge>
                </div>

                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: '700', color: '#1E293B' }}>{pfx.entity}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                    Live Preview: <strong>{pfx.sample}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#475569', fontWeight: '600' }}>Prefix String</label>
                    <input
                      type="text"
                      value={pfx.prefix}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrefixes(prev => prev.map(item => item.id === pfx.id ? { ...item, prefix: val, sample: `${val}${String(item.currentSeq + 1).padStart(5, '0')}` } : item));
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.80rem',
                        fontWeight: '600',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#475569', fontWeight: '600' }}>Current Seq</label>
                    <input
                      type="number"
                      value={pfx.currentSeq}
                      onChange={(e) => {
                        const seq = parseInt(e.target.value) || 0;
                        setPrefixes(prev => prev.map(item => item.id === pfx.id ? { ...item, currentSeq: seq, sample: `${item.prefix}${String(seq + 1).padStart(5, '0')}` } : item));
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.80rem',
                        fontWeight: '600',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.4: EVENT CONFIGURATION */}
      {activeSubtab === '29.4' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                Automated Event Dispatch Engine
              </h2>
              <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '2px 0 0' }}>
                Event-driven clinical alerts, WhatsApp / SMS family communications, and emergency audio chime triggers.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => triggerToast('Custom event trigger template builder initiated.')}
            >
              Add Event Trigger
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {eventConfigs.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: evt.enabled ? '#FFFFFF' : '#F8FAFC',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.90rem', fontWeight: '700', color: '#0A4174' }}>{evt.name}</span>
                    <Badge variant={evt.enabled ? 'success' : 'neutral'}>
                      {evt.enabled ? 'ACTIVE' : 'DISABLED'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '8px' }}>
                    {evt.description} • Target: <strong>{evt.recipientType}</strong>
                  </div>

                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-bg-pale-aqua)',
                      borderRadius: '6px',
                      border: '1px solid rgba(73, 118, 159, 0.25)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#0A4174'
                    }}
                  >
                    {evt.template}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEventConfigs(prev => prev.map(e => e.id === evt.id ? { ...e, enabled: !e.enabled } : e));
                      triggerToast(`${evt.name} toggled ${!evt.enabled ? 'ON' : 'OFF'}.`);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${evt.enabled ? '#10B981' : '#CBD5E1'}`,
                      backgroundColor: evt.enabled ? '#ECFDF5' : '#FFFFFF',
                      color: evt.enabled ? '#047857' : '#64748B',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {evt.enabled ? 'Enabled' : 'Disabled'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingEvent(evt)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      color: '#0A4174',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.5: ROLE-BASED ACCESS CONTROL (RBAC) */}
      {activeSubtab === '29.5' && (
        <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                Role-Based Access Control (RBAC) Permission Matrix
              </h2>
              <p style={{ fontSize: '0.80rem', color: '#64748B', margin: '2px 0 0' }}>
                Map granular View, Create, Edit, Delete, and Approve authorizations across all 32 clinical and administrative modules.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Selected Role:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #0A4174',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    color: '#0A4174',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Doctor">Doctor / Consultant Physician</option>
                  <option value="Nurse">Ward Nurse & Inpatient Staff</option>
                  <option value="Lab Technician">Lab Technologist & Serology</option>
                  <option value="Blood Bank Officer">Blood Bank Officer (Dual-Gate)</option>
                  <option value="Billing Cashier">Billing Cashier & POS Operator</option>
                  <option value="Biomedical Engineer">Biomedical Work Order Engineer</option>
                  <option value="Super Admin">Super Administrator</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Save}
                onClick={() => triggerToast(`Permissions matrix updated successfully for role: ${selectedRole}.`)}
              >
                Save Role Matrix
              </Button>
            </div>
          </div>

          <div style={{ maxHeight: '520px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.80rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', color: '#0A4174', fontWeight: '700' }}>
                  <th style={{ padding: '10px 14px' }}>Hospital Module</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>View</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Create</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Edit</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Delete</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Approve</th>
                </tr>
              </thead>
              <tbody>
                {ALL_32_MODULE_NAMES.map((mod, idx) => (
                  <tr
                    key={mod}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-soft-cyan)'
                    }}
                  >
                    <td style={{ padding: '8px 14px', fontWeight: '700', color: '#1E293B' }}>{mod}</td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permissions[mod]?.view || false}
                        onChange={() => togglePermission(mod, 'view')}
                        style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permissions[mod]?.create || false}
                        onChange={() => togglePermission(mod, 'create')}
                        style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permissions[mod]?.edit || false}
                        onChange={() => togglePermission(mod, 'edit')}
                        style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permissions[mod]?.delete || false}
                        onChange={() => togglePermission(mod, 'delete')}
                        style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={permissions[mod]?.approve || false}
                        onChange={() => togglePermission(mod, 'approve')}
                        style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Terminate Session Confirmation */}
      {sessionToTerminate && (
        <Modal
          isOpen={Boolean(sessionToTerminate)}
          onClose={() => setSessionToTerminate(null)}
          title="Confirm Workstation Session Termination"
          subtitle="Immediate revocation of active login credentials on remote terminal"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '0.82rem',
                lineHeight: '1.5'
              }}
            >
              <strong>Security Protocol Warning:</strong>
              <p style={{ margin: '6px 0 0' }}>
                Terminating the session for <strong>{sessionToTerminate.fullName}</strong> will immediately revoke bearer token <code>{sessionToTerminate.id}</code> on terminal IP <strong>{sessionToTerminate.workstationIp}</strong> ({sessionToTerminate.terminalLocation}).
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setSessionToTerminate(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleTerminateSession(sessionToTerminate.id)}
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
              >
                Terminate Remote Session
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Audit Log Details */}
      {inspectedAuditLog && (
        <Modal
          isOpen={Boolean(inspectedAuditLog)}
          onClose={() => setInspectedAuditLog(null)}
          title={`Audit Record Details: ${inspectedAuditLog.id}`}
          subtitle="Cryptographically verified immutable ledger log entry"
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><strong>Domain:</strong> {inspectedAuditLog.type}</div>
              <div><strong>Action:</strong> {inspectedAuditLog.action}</div>
              <div><strong>Timestamp:</strong> {inspectedAuditLog.timestamp}</div>
              <div><strong>Terminal IP:</strong> {inspectedAuditLog.terminalIp}</div>
              <div><strong>Staff User ID:</strong> {inspectedAuditLog.userId}</div>
              <div><strong>Role:</strong> {inspectedAuditLog.userRole}</div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <strong>Target Entity:</strong>
              <div style={{ padding: '6px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--color-border)', marginTop: '4px' }}>
                {inspectedAuditLog.entity}
              </div>
            </div>

            <div>
              <strong>Original Value (Before Modification):</strong>
              <pre style={{ margin: '4px 0 0', padding: '8px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '6px', fontSize: '0.74rem', whiteSpace: 'pre-wrap' }}>
                {inspectedAuditLog.oldValue}
              </pre>
            </div>

            <div>
              <strong>New Value (After Modification):</strong>
              <pre style={{ margin: '4px 0 0', padding: '8px', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '6px', fontSize: '0.74rem', whiteSpace: 'pre-wrap' }}>
                {inspectedAuditLog.newValue}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" onClick={() => setInspectedAuditLog(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Edit Event Template */}
      {editingEvent && (
        <Modal
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          title={`Configure Trigger Template: ${editingEvent.name}`}
          subtitle="Automated message dispatch template with dynamic data placeholders"
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#334155' }}>Message Template</label>
              <textarea
                rows={4}
                value={editingEvent.template}
                onChange={(e) => setEditingEvent({ ...editingEvent, template: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.70rem', color: '#64748B' }}>
                Available placeholders: <code>{'{PATIENT_NAME}'}</code>, <code>{'{UHID}'}</code>, <code>{'{WARD_BED}'}</code>, <code>{'{TEST_NAME}'}</code>, <code>{'{VALUE}'}</code>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setEditingEvent(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setEventConfigs(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
                  setEditingEvent(null);
                  triggerToast(`Trigger template updated for ${editingEvent.name}.`);
                }}
              >
                Save Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SystemView;
