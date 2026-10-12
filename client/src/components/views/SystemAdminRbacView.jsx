import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Settings2, 
  BellRing, 
  Lock, 
  Search, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Power 
} from 'lucide-react';
import { USER_SESSIONS, AUDIT_TRAIL, SYSTEM_EVENTS, DEPARTMENTS } from '../../data/mockData';

export default function SystemAdminRbacView() {
  const [activeSubTab, setActiveSubTab] = useState('29.1'); // 29.1 Sessions (S3), 29.2 Audit (S3), 29.3 Setup (S5), 29.4 Events (S3), 29.5 RBAC
  const [sessions, setSessions] = useState(USER_SESSIONS);
  const [auditLogs, setAuditLogs] = useState(AUDIT_TRAIL);
  const [events, setEvents] = useState(SYSTEM_EVENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const terminateSession = (sessionId) => {
    setSessions(prev =>
      prev.map(s => s.session_id === sessionId ? { ...s, status: "Terminated (Admin Override)" } : s)
    );
  };

  const toggleEvent = (eventId) => {
    setEvents(prev =>
      prev.map(ev => ev.event_id === eventId ? { ...ev, enabled: !ev.enabled } : ev)
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono text-xs font-bold">
              MODULE 29.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Enterprise System Administration, Audit & Security
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active User Sessions, Immutable Clinical Audit Trail, Event Broadcast Setup & RBAC Permissions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-teal-300 font-mono text-xs border border-slate-700 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AUDIT LOGGING: ENFORCED (SHA-256)</span>
          </span>
        </div>
      </div>

      {/* Sub-Tabs: 29.1 to 29.5 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('29.1')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '29.1'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>29.1 View User Sessions</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-bold">
            Screenshot 3
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('29.2')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '29.2'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>29.2 AUDIT: System & Clinical Trail</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-bold">
            Screenshot 3
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('29.3')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '29.3'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>29.3 SETUP: Department & Module Setup</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-bold">
            Screenshot 5
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('29.4')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '29.4'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>29.4 SYSTEM: Event Configuration</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-bold">
            Screenshot 3
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('29.5')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '29.5'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          29.5 Role-Based Access Control (RBAC)
        </button>
      </div>

      {/* 29.1 VIEW USER SESSIONS (Screenshot 3) */}
      {activeSubTab === '29.1' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user, role, IP address or terminal..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500">
              Active Sessions: <strong className="text-emerald-600">{sessions.filter(s => s.status === 'Active').length} Active</strong>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Session ID</th>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Role / Persona</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Terminal Identifier</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Login Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sessions.map(s => (
                    <tr key={s.session_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {s.session_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {s.user}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {s.ip}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {s.terminal}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {s.branch}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {s.login_time}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.status === 'Active' && (
                          <button
                            onClick={() => terminateSession(s.session_id)}
                            className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                          >
                            Kill Session
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 29.2 AUDIT TRAIL (Screenshot 3) */}
      {activeSubTab === '29.2' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical & System Audit Trail (29.2)</h3>
              <p className="text-xs text-slate-500">Forensic, tamper-proof logging of prescriptions, refunds, bed transfers and access control</p>
            </div>
            <span className="text-xs font-mono text-slate-400">HIPAA & NABH Audit Standard</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{log.id}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{log.module}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{log.user}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      log.severity.includes('High') ? 'bg-rose-100 text-rose-800' :
                      log.severity.includes('Warning') ? 'bg-amber-100 text-amber-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{log.details}</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 29.3 SETUP: DEPARTMENT & MODULE MASTER SETUP (Screenshot 5) */}
      {activeSubTab === '29.3' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Department & Module Master Setup (Screenshot 5)</h3>
              <p className="text-xs text-slate-500">Configure global service units, clinical sub-specialties, billing codes & module features</p>
            </div>
            <button className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs">
              + Add Master Mapping
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {DEPARTMENTS.map(dept => (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono font-bold flex items-center justify-center text-xs">
                      {dept.code}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-rose-600 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div><span>Module Group:</span> <strong className="text-slate-800 dark:text-slate-200 block">Clinical OPD/IPD</strong></div>
                  <div><span>Floor / Wing:</span> <strong className="text-slate-800 dark:text-slate-200 block">{dept.floor}</strong></div>
                  <div><span>HOD Consultant:</span> <strong className="text-slate-800 dark:text-slate-200 block">{dept.head}</strong></div>
                  <div><span>Status:</span> <strong className="text-emerald-600 block">Enabled Active</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 29.4 EVENT CONFIGURATION (Screenshot 3) */}
      {activeSubTab === '29.4' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital Event Configuration & Sirens (29.4)</h3>
              <p className="text-xs text-slate-500">Real-time alert routing for panic laboratory values, Code Blue and audit triggers</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">WebSocket Bus: ONLINE</span>
          </div>

          <div className="space-y-3 pt-2">
            {events.map(ev => (
              <div key={ev.event_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{ev.event_code}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{ev.trigger}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Broadcast Channels: {ev.channel}</p>
                </div>
                <button
                  onClick={() => toggleEvent(ev.event_id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    ev.enabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {ev.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 29.5 RBAC Permissions */}
      {activeSubTab === '29.5' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) (29.5)</h3>
          <p className="text-xs text-slate-500">Fine-grained capability matrix across clinical, financial and operational roles</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            Configured with 6 Enterprise Personas: Chief Medical Officer, Consultant Physician, Charge Nurse, Billing Officer, Pharmacy In-Charge, System Admin.
          </div>
        </div>
      )}
    </div>
  );
}
