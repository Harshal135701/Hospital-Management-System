import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight,
  Tv,
  Printer,
  CalendarCheck
} from 'lucide-react';
import { DOCTORS, ROOMS } from '../../data/mockData';

export default function AppointmentsView({ appointments, onOpenBookModal, onOpenQueueDisplay }) {
  const [activeSubTab, setActiveSubTab] = useState('3.1'); // 3.1 Book/Reschedule, 3.2 Doctor Roster, 3.3 Token Queue, 3.4 SMS Alerts
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('ALL');
  const [smsStatus, setSmsStatus] = useState({});

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus;
    const matchesDoctor = selectedDoctorFilter === 'ALL' || apt.doctor_id === selectedDoctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const sendReminder = (id, type) => {
    setSmsStatus(prev => ({ ...prev, [id]: `Sent via ${type} at ${new Date().toLocaleTimeString()}` }));
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-mono text-xs font-bold">
              MODULE 3.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Outpatient Appointments & Token Queue Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Doctor Rosters, Token Scheduling, Waiting Room Displays & Automated Notifications
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenQueueDisplay}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Tv className="w-4 h-4 text-teal-400" />
            <span>Launch TV Display (3.3)</span>
          </button>
          <button
            onClick={onOpenBookModal}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment (3.1)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: 3.1, 3.2, 3.3, 3.4 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('3.1')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition ${
            activeSubTab === '3.1'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>3.1 Book / Reschedule Appointment</span>
          <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">{appointments.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('3.2')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition ${
            activeSubTab === '3.2'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>3.2 Doctor Roster & Shift Planning</span>
        </button>

        <button
          onClick={() => setActiveSubTab('3.3')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition ${
            activeSubTab === '3.3'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>3.3 Token Queue Waiting Room Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('3.4')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition ${
            activeSubTab === '3.4'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>3.4 SMS / WhatsApp Alerts & Reminders</span>
        </button>
      </div>

      {/* Tab 3.1: Appointments Table & Operations */}
      {activeSubTab === '3.1' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by Patient Name, UHID, Doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Consultants</option>
                {DOCTORS.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              {['ALL', 'in_consultation', 'waiting', 'booked', 'arrived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                    filterStatus === st
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Token / Slot</th>
                    <th className="py-3 px-4">Patient Information</th>
                    <th className="py-3 px-4">Consultant & Room</th>
                    <th className="py-3 px-4">Visit Type</th>
                    <th className="py-3 px-4">Chief Complaints</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold flex items-center justify-center text-xs border border-sky-300/40">
                            #{apt.token_number}
                          </span>
                          <div>
                            <span className="font-semibold block text-slate-900 dark:text-slate-100">{apt.start_time} - {apt.end_time}</span>
                            <span className="text-[10px] text-slate-400">{apt.appointment_date}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{apt.patient_name}</p>
                          <p className="font-mono text-[11px] text-teal-600 dark:text-teal-400">{apt.uhid}</p>
                          <p className="text-[10px] text-slate-400">{apt.mobile}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{apt.doctor_name}</p>
                          <p className="text-[11px] text-slate-500">{apt.department_name}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                            {apt.room_number}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          apt.visit_type === 'first_visit'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {apt.visit_type === 'first_visit' ? 'New Consultation' : 'Follow Up'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="truncate text-slate-600 dark:text-slate-400 text-xs" title={apt.chief_complaint}>
                          {apt.chief_complaint}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === 'in_consultation'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : apt.status === 'waiting'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            : apt.status === 'arrived'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => sendReminder(apt.id, 'WhatsApp')}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
                            title="Send WhatsApp Token Slip"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                            title="Print Token Slip (22.4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3.2: Doctor Roster & Shift Planning */}
      {activeSubTab === '3.2' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Duty Rosters & Shift Planning (3.2)</h3>
              <p className="text-xs text-slate-500">Weekly OPD slot allocations, room scheduling, leave tracking and capacity limits</p>
            </div>
            <button className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-xs">
              + Publish Weekly Roster
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {DOCTORS.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold">{doc.employee_code}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold">
                    Published Roster
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{doc.full_name}</h4>
                  <p className="text-xs text-slate-500">{doc.department_name} • {doc.qualification}</p>
                </div>
                <div className="space-y-1 text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Assigned Room:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{doc.room_number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>OPD Days:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{doc.opd_days}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shift Window:</span>
                    <strong className="text-slate-800 dark:text-slate-200">09:00 AM - 01:30 PM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Patients / Shift:</span>
                    <strong className="text-teal-600 font-bold">30 Patients</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3.3: Token Waiting Room Preview */}
      {activeSubTab === '3.3' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Waiting Room Token & Queue Controller (3.3)</h3>
              <p className="text-xs text-slate-500">Live multi-room token queue monitor with audio chime dispatcher</p>
            </div>
            <button
              onClick={onOpenQueueDisplay}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5"
            >
              <Tv className="w-4 h-4" />
              <span>Open Fullscreen Waiting Display</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900/60 text-center">
              <span className="text-xs text-sky-700 dark:text-sky-300 font-semibold uppercase">Patients In Waiting Room</span>
              <p className="text-3xl font-black text-sky-800 dark:text-sky-200 mt-2">14</p>
              <p className="text-[11px] text-slate-500 mt-1">Average wait time: 18 mins</p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-center">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Active In Consultation</span>
              <p className="text-3xl font-black text-emerald-800 dark:text-emerald-200 mt-2">5</p>
              <p className="text-[11px] text-slate-500 mt-1">Across 5 OPD Suites</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/60 text-center">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase">Completed Consultations</span>
              <p className="text-3xl font-black text-purple-800 dark:text-purple-200 mt-2">42</p>
              <p className="text-[11px] text-slate-500 mt-1">Today's Morning Shift</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3.4: SMS / WhatsApp Reminders & Alerts */}
      {activeSubTab === '3.4' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">SMS & WhatsApp Notification Gateway (3.4)</h3>
              <p className="text-xs text-slate-500">Automated slot booking confirmations, delay broadcasts, and doctor absence alerts</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Twilio & Meta Cloud API Online
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {appointments.map(apt => (
              <div key={apt.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{apt.patient_name}</span>
                  <span className="text-slate-400 ml-2">({apt.mobile})</span>
                  <p className="text-[11px] text-slate-500">
                    Template: "Dear {apt.patient_name}, Token #{apt.token_number} confirmed for {apt.doctor_name} at {apt.start_time}."
                  </p>
                  {smsStatus[apt.id] && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ {smsStatus[apt.id]}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => sendReminder(apt.id, 'SMS')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Send SMS
                  </button>
                  <button
                    onClick={() => sendReminder(apt.id, 'WhatsApp')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Send WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
