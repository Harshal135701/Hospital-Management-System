import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Plus,
  Bell,
  Building2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Power,
  Users
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_USER_SESSIONS, INITIAL_AUDIT_LOGS } from '../inventoryMockData';

export function SystemAdminAuditGroup({ activeSubtab = '29.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [sessions, setSessions] = useState(INITIAL_USER_SESSIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [notification, setNotification] = useState('');

  // 29.3: Departments Master State
  const [departments, setDepartments] = useState([
    { id: 'DEP-01', code: 'MED', name: 'Department of General Medicine', hod: 'Dr. Arindam Mitra', clinics: 4, inpatientBeds: 24, status: 'Active' },
    { id: 'DEP-02', code: 'OBGYN', name: 'Department of Obstetrics & Gynaecology', hod: 'Dr. Ananya Sharma', clinics: 3, inpatientBeds: 18, status: 'Active' },
    { id: 'DEP-03', code: 'ICU', name: 'Intensive Care & Critical Care Medicine', hod: 'Dr. Pradeep K. Sharma', clinics: 1, inpatientBeds: 12, status: 'Active' },
    { id: 'DEP-04', code: 'SURG', name: 'Department of General & Laparoscopic Surgery', hod: 'Dr. Sandeep Kulkarni', clinics: 2, inpatientBeds: 20, status: 'Active' },
    { id: 'DEP-05', code: 'PED', name: 'Department of Pediatrics & Neonatology (NICU)', hod: 'Dr. Meenakshi Sanyal', clinics: 2, inpatientBeds: 10, status: 'Active' }
  ]);

  const [isNewDeptModalOpen, setIsNewDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    hod: 'Dr. Arindam Mitra',
    clinics: '2',
    inpatientBeds: '15'
  });

  // 29.4: System Event Triggers Configuration State
  const [eventTriggers, setEventTriggers] = useState([
    {
      id: 'EVT-01',
      eventName: 'Critical Laboratory Panic Value Alert',
      severity: 'High Panic',
      channels: 'In-App Alert, SMS & Mobile Pager',
      recipients: 'Attending Doctor, ICU Duty Officer, Nursing Incharge',
      enabled: true
    },
    {
      id: 'EVT-02',
      eventName: 'Code Blue Emergency Crash Team Webhook',
      severity: 'STAT Emergency',
      channels: 'Hospital PA Webhook, Crash Team SMS Broadcast',
      recipients: 'Code Blue Team (Anesthesia, ICU, Cardiology)',
      enabled: true
    },
    {
      id: 'EVT-03',
      eventName: 'Planned Patient Discharge Clearance Initiated',
      severity: 'Normal Workflow',
      channels: 'In-App Notification & EMR Banner',
      recipients: 'Ward Nurse, Pharmacy Dispenser, Inpatient Billing Cashier',
      enabled: true
    },
    {
      id: 'EVT-04',
      eventName: 'High-Value Purchase Order Approval Threshold (> ₹1,00,000)',
      severity: 'Financial Audit',
      channels: 'Email Digest & SMS Approval Token',
      recipients: 'Medical Director, Chief Financial Officer',
      enabled: true
    },
    {
      id: 'EVT-05',
      eventName: 'Formulary Batch Near-Expiry Alert (Within 60 Days)',
      severity: 'Inventory Warning',
      channels: 'Weekly Email Audit Sheet & Dispensary Flag',
      recipients: 'Chief Pharmacist, Central Stores Manager',
      enabled: true
    }
  ]);

  // RBAC Permission state (29.5)
  const [rbacMatrix, setRbacMatrix] = useState({
    'Consultant Physician': { billing: true, cpoe: true, discharge: true, pharmacy: false, admin: false },
    'Staff Nurse': { billing: false, cpoe: true, discharge: false, pharmacy: false, admin: false },
    'Hospital Cashier': { billing: true, cpoe: false, discharge: true, pharmacy: true, admin: false },
    'Pharmacist': { billing: true, cpoe: false, discharge: false, pharmacy: true, admin: false },
    'Super Administrator': { billing: true, cpoe: true, discharge: true, pharmacy: true, admin: true }
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast(`Staff session ${sessionId} forcefully terminated.`);
  };

  const handleToggleRbac = (role, permKey) => {
    setRbacMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permKey]: !prev[role][permKey]
      }
    }));
    showToast(`Updated ${role} privileges for ${permKey}.`);
  };

  const handleToggleTrigger = (triggerId) => {
    setEventTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, enabled: !t.enabled } : t));
    showToast(`Event notification trigger ${triggerId} status toggled!`);
  };

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    const newDept = {
      id: `DEP-0${departments.length + 1}`,
      code: deptForm.code.toUpperCase(),
      name: deptForm.name,
      hod: deptForm.hod,
      clinics: Number(deptForm.clinics) || 1,
      inpatientBeds: Number(deptForm.inpatientBeds) || 10,
      status: 'Active'
    };
    setDepartments([...departments, newDept]);
    setIsNewDeptModalOpen(false);
    showToast(`Department ${newDept.name} registered in Master Setup!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 29.1: View User Sessions */}
      {activeSubtab === '29.1' && (
        <Card
          title="Active Hospital Staff Workstation Sessions"
          subtitle="Real-time terminal logins, authenticated IP addresses, session duration, and administrative kill switch"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Session ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Staff User</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Assigned Role</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Terminal Workstation</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>IP Address</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Login Timestamp</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{s.name} ({s.username})</td>
                    <td style={{ padding: '10px 14px' }}>{s.role}</td>
                    <td style={{ padding: '10px 14px' }}>{s.terminal}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{s.ip}</td>
                    <td style={{ padding: '10px 14px' }}>{s.loginTime}</td>
                    <td style={{ padding: '10px 14px' }}><Badge variant="success">{s.status}</Badge></td>
                    <td style={{ padding: '10px 14px' }}>
                      <Button size="sm" variant="outline" icon={Power} onClick={() => handleTerminateSession(s.id)}>
                        Terminate Session
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
        <Card
          title="System Audit Trail & Clinical Security Event Log"
          subtitle="Immutable audit logging of sensitive EHR access, drug administrations, financial ledger modifications, and override events"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Log ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>User</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Module</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Event Type</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Audit Event Details</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Security Verification</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{log.id}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{log.timestamp}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{log.user}</td>
                    <td style={{ padding: '10px 14px' }}>{log.module}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{log.event}</td>
                    <td style={{ padding: '10px 14px' }}>{log.details}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={log.status === 'Verified' ? 'success' : 'danger'}>
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
        <Card
          title="Hospital Department & Clinical Discipline Master Setup"
          subtitle="Clinical discipline hierarchy, OPD clinic room allocation, inpatient wards, and module licensing"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewDeptModalOpen(true)}>
              Add Clinical Department
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Dept ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Code</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Department Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Head of Department (HOD)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>OPD Clinic Rooms</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Inpatient Bed Quota</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{d.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{d.code}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{d.name}</td>
                    <td style={{ padding: '10px 14px' }}>{d.hod}</td>
                    <td style={{ padding: '10px 14px' }}>{d.clinics} Consulting Desks</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{d.inpatientBeds} Beds</td>
                    <td style={{ padding: '10px 14px' }}><Badge variant="success">{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.4: System Event Configuration */}
      {activeSubtab === '29.4' && (
        <Card
          title="System Event Notification Triggers & Automated Emergency Alerts"
          subtitle="Configure critical lab panic value notifications, code blue emergency webhooks, and SMS triggers"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {eventTriggers.map((trg) => (
              <div key={trg.id} style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.9rem' }}>{trg.id}</span>
                    <Badge variant={trg.severity.includes('STAT') ? 'danger' : trg.severity.includes('Panic') ? 'warning' : 'teal'}>
                      {trg.severity}
                    </Badge>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', marginTop: '4px' }}>{trg.eventName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Dispatch Channels: <strong>{trg.channels}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Recipient Roles: <strong>{trg.recipients}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: trg.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {trg.enabled ? 'ACTIVE TRIGGER' : 'DISABLED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleTrigger(trg.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: trg.enabled ? 'var(--color-primary-teal)' : '#9CA3AF' }}
                  >
                    {trg.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.5: Role-Based Access Control (RBAC) & Permissions */}
      {activeSubtab === '29.5' && (
        <Card
          title="Role-Based Access Control (RBAC) & Privilege Matrix"
          subtitle="Granular permissions matrix for doctors, nursing supervisors, pharmacists, cashiers, and administrators"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Hospital System Role</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>OPD Billing</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Clinical Orders (CPOE)</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Discharge Summaries</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Pharmacy Dispense</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>User Administration</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rbacMatrix).map(([role, perms]) => (
                  <tr key={role} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>{role}</td>
                    {Object.entries(perms).map(([permName, isAllowed]) => (
                      <td key={permName} style={{ padding: '10px 14px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleRbac(role, permName)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${isAllowed ? '#10B981' : '#D1D5DB'}`,
                            backgroundColor: isAllowed ? '#ECFDF5' : '#F3F4F6',
                            color: isAllowed ? '#065F46' : '#6B7280',
                            fontWeight: '600',
                            fontSize: '0.74rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isAllowed ? '✓ Allowed' : '✗ Denied'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Add Department */}
      <Modal
        isOpen={isNewDeptModalOpen}
        onClose={() => setIsNewDeptModalOpen(false)}
        title="Add Hospital Department to Master"
        subtitle="Configure discipline details, consulting rooms, and bed quota"
      >
        <form onSubmit={handleCreateDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Dept Code"
              required
              placeholder="e.g. CARD"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
            />
            <Input
              label="Department Full Name"
              required
              placeholder="e.g. Department of Cardiology & Cath Lab"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            />
          </div>

          <Input
            label="Head of Department (Consultant HOD)"
            value={deptForm.hod}
            onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="OPD Clinic Rooms Count"
              type="number"
              value={deptForm.clinics}
              onChange={(e) => setDeptForm({ ...deptForm, clinics: e.target.value })}
            />
            <Input
              label="Inpatient Bed Quota"
              type="number"
              value={deptForm.inpatientBeds}
              onChange={(e) => setDeptForm({ ...deptForm, inpatientBeds: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewDeptModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
