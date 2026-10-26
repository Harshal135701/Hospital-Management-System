import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Power
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../../common/UIPrimitives';
import { INITIAL_USER_SESSIONS, INITIAL_AUDIT_LOGS } from '../../inventory/inventoryMockData';

export function SystemAdminAuditDesk({ activeSubtab = '29.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [sessions, setSessions] = useState(INITIAL_USER_SESSIONS);
  const [auditLogs] = useState(INITIAL_AUDIT_LOGS);
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
    clinics: 2,
    inpatientBeds: 10
  });

  // 29.4: System Events Config
  const [events, setEvents] = useState([
    { id: 'EVT-01', name: 'Critical Emergency Triage Red Level', channel: 'SMS + Pager Webhook', recipient: 'Duty Emergency Medical Officer', enabled: true },
    { id: 'EVT-02', name: 'High-Value Cash Bill (> ₹50,000)', channel: 'Email Notification', recipient: 'Chief Financial Officer & Internal Auditor', enabled: true },
    { id: 'EVT-03', name: 'Narcotic / Schedule X Dispense Event', channel: 'Real-Time EMR Flag', recipient: 'Hospital Superintendent & Pharmacist Lead', enabled: true },
    { id: 'EVT-04', name: 'Biomedical Equipment Breakdown Log', channel: 'Work Order Auto-Ticket', recipient: 'Senior Biomedical Engineer', enabled: false }
  ]);

  // 29.5: RBAC Matrix State
  const [rbacMatrix] = useState([
    { module: '24. Patient / Visit Registration', doctor: true, nurse: true, pharmacist: false, cashier: true, admin: true },
    { module: '12. Clinical EMR & Encounters', doctor: true, nurse: true, pharmacist: false, cashier: false, admin: true },
    { module: '04. Billing & Cashier POS', doctor: false, nurse: false, pharmacist: false, cashier: true, admin: true },
    { module: '25. Pharmacy Management', doctor: false, nurse: false, pharmacist: true, cashier: false, admin: true },
    { module: '26. Purchase & Procurement', doctor: false, nurse: false, pharmacist: false, cashier: false, admin: true },
    { module: '32. Analytics & Data Export', doctor: false, nurse: false, pharmacist: false, cashier: false, admin: true }
  ]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast(`Session ${sessionId} forcefully terminated. Terminal token invalidated.`);
  };

  const handleToggleEvent = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
    showToast(`Event webhook configuration updated.`);
  };

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

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
    setIsNewDeptModalOpen(false);
    showToast(`Department "${newDept.name}" created in Hospital Master.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#166534',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBMODULE 29.1: View User Sessions */}
      {activeSubtab === '29.1' && (
        <Card
          title="29.1 Active Staff User Sessions & Concurrent Logins"
          subtitle="Real-time terminal logins, authenticated JWT sessions, IP addresses, duration, and administrative revocation"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Terminal Tokens:</span>
              <Badge variant="teal">{sessions.length} Live Sessions</Badge>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              Token Standard: <strong>HMAC-SHA256 JWT</strong> (Idle timeout: 15 mins)
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Session ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Staff User</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Assigned Role</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>IP Address / Terminal</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Login Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{s.userName}</td>
                    <td style={{ padding: '8px 10px' }}>{s.role}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{s.ipAddress}</td>
                    <td style={{ padding: '8px 10px' }}>{s.loginTime}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Button
                        size="xs"
                        variant="outline"
                        icon={Power}
                        onClick={() => handleTerminateSession(s.id)}
                        style={{ color: '#DC2626' }}
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

      {/* SUBMODULE 29.2: AUDIT: System Audit Trail & Clinical Audit Trail */}
      {activeSubtab === '29.2' && (
        <Card
          title="29.2 AUDIT: System Audit Trail & Clinical Immutable Audit Logs"
          subtitle="Non-repudiation audit trail, clinical record edits, medication dispensation logs, and administrative overrides"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Timestamp</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>User</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Action Type</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Target Entity / UHID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Audit Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Origin IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>{log.timestamp}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{log.user}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <Badge variant={log.action.includes('DISPENSE') ? 'teal' : log.action.includes('REFUND') ? 'warning' : 'gray'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{log.entity}</td>
                    <td style={{ padding: '8px 10px' }}>{log.details}</td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.3: SETUP: Department & Module Master Setup */}
      {activeSubtab === '29.3' && (
        <Card
          title="29.3 SETUP: Hospital Department & Specialty Master Setup"
          subtitle="Clinical departments, Head of Department (HOD) allocations, outpatient consulting rooms, and inpatient bed quotas"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Disciplines:</span>
              <Badge variant="teal">{departments.length} Departments</Badge>
            </div>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewDeptModalOpen(true)}>
              Add Clinical Department
            </Button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Dept Code</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Department Name</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Head of Department (HOD)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>OPD Clinics</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Bed Quota</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{d.code}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{d.name}</td>
                    <td style={{ padding: '8px 10px' }}>{d.hod}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{d.clinics}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{d.inpatientBeds}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant="success">{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.4: SYSTEM: Event Configuration */}
      {activeSubtab === '29.4' && (
        <Card
          title="29.4 SYSTEM: Event Triggers & Notification Webhooks"
          subtitle="Clinical panic alarms, automated critical event dispatchers, SMS gateways, and webhook endpoints"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '14px',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.86rem' }}>{evt.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Channel: <strong>{evt.channel}</strong> • Target: {evt.recipient}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge variant={evt.enabled ? 'success' : 'gray'}>
                    {evt.enabled ? 'Webhook Active' : 'Disabled'}
                  </Badge>
                  <Button
                    size="xs"
                    variant={evt.enabled ? 'outline' : 'primary'}
                    onClick={() => handleToggleEvent(evt.id)}
                  >
                    {evt.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 29.5: Role-Based Access Control (RBAC) & Permissions */}
      {activeSubtab === '29.5' && (
        <Card
          title="29.5 Role-Based Access Control (RBAC) & Permission Matrix"
          subtitle="Hospital staff role privileges across clinical, pharmaceutical, financial, and administrative modules"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Hospital Functional Module</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Doctor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Nurse</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Pharmacist</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Cashier</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Hospital Admin</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{row.module}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.doctor ? '✓ Granted' : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.nurse ? '✓ Granted' : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.pharmacist ? '✓ Granted' : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.cashier ? '✓ Granted' : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: 'var(--color-primary-teal)' }}>✓ Granted</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: New Department */}
      <Modal isOpen={isNewDeptModalOpen} onClose={() => setIsNewDeptModalOpen(false)} title="Add Clinical Department / Discipline">
        <form onSubmit={handleCreateDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Dept Code"
              placeholder="e.g. CARD"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              required
            />
            <Input
              label="Department Full Name"
              placeholder="e.g. Department of Cardiology"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="OPD Consultation Rooms"
              type="number"
              value={deptForm.clinics}
              onChange={(e) => setDeptForm({ ...deptForm, clinics: e.target.value })}
            />
            <Input
              label="Inpatient Ward Beds Quota"
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
