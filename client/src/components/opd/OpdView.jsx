import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Clock,
  Printer,
  CalendarCheck,
  CheckCircle2,
  Search,
  UserCheck,
  Building,
  QrCode,
  ArrowRight,
  TrendingUp,
  Send,
  MessageSquare,
  AlertTriangle,
  BadgeCheck,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Modal } from '../common/UIPrimitives';

const OPD_SUBMODULES = [
  {
    id: '22.1',
    label: 'OPD Clinic Desk Dashboard',
    icon: Stethoscope,
    subsubmodules: [
      { id: '22.1.1', label: 'Specialty Clinic Session Activation' },
      { id: '22.1.2', label: 'Doctor Duty Roster & Room Assignments' },
      { id: '22.1.3', label: 'Clinic Flow Rate & Wait Time Telemetry' }
    ]
  },
  {
    id: '22.2',
    label: 'Patient Arrival & Check-in',
    icon: UserCheck,
    subsubmodules: [
      { id: '22.2.1', label: 'Reception Desk Check-in' },
      { id: '22.2.2', label: 'Arrival Confirmation & Status Flip' }
    ]
  },
  {
    id: '22.3',
    label: 'Consultation Queue Management',
    icon: Users,
    subsubmodules: [
      { id: '22.3.1', label: 'Live Consultation Queue Pacing' },
      { id: '22.3.2', label: 'Emergency & Senior Citizen Priority' },
      { id: '22.3.3', label: 'Cabin Waiting Count Display' }
    ]
  },
  {
    id: '22.4',
    label: 'OPD Visit Slip Printout',
    icon: Printer,
    subsubmodules: [
      { id: '22.4.1', label: 'Automated Visit Slip Generation' },
      { id: '22.4.2', label: 'Barcode & Token Slip Printing' }
    ]
  },
  {
    id: '22.5',
    label: 'Follow-up Tracking',
    icon: CalendarCheck,
    subsubmodules: [
      { id: '22.5.1', label: 'Consultation Review Date Scheduling' },
      { id: '22.5.2', label: 'Automated Recall SMS & WhatsApp Triggers' }
    ]
  }
];

export function OpdView({ initialSubtab = '22.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('22.')) return initialSubtab;
    return '22.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = OPD_SUBMODULES.find(s => s.id === (initialSubtab || '22.1'));
    return parent?.subsubmodules[0]?.id || '22.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('opd:', '');
      if (OPD_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSubtabSelect = (subId) => {
    setActiveSubtab(subId);
    const parent = OPD_SUBMODULES.find(s => s.id === subId);
    const firstSubsub = parent?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(firstSubsub);
    if (onNavigate) {
      onNavigate(`opd:${subId}:${firstSubsub}`);
    }
  };

  const handleSubsubSelect = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (onNavigate) {
      onNavigate(`opd:${activeSubtab}:${subsubId}`);
    }
  };

  // Mock State for Clinics and Cabins
  const [clinicRooms] = useState([
    {
      cabin: 'Cabin 101',
      specialty: 'Internal Medicine',
      doctor: 'Dr. N. Joshi',
      shift: 'Morning (09:00 - 13:00)',
      status: 'In Consultation',
      currentPatient: 'Rohan Mehra (Token #04)',
      waitingCount: 4,
      avgConsultTime: '12 min'
    },
    {
      cabin: 'Cabin 102',
      specialty: 'Cardiology',
      doctor: 'Dr. V. Singhal',
      shift: 'Morning (09:30 - 13:30)',
      status: 'Ready for Next',
      currentPatient: '-',
      waitingCount: 6,
      avgConsultTime: '15 min'
    },
    {
      cabin: 'Cabin 103',
      specialty: 'Orthopedics & Joint',
      doctor: 'Dr. P. Sen',
      shift: 'Full Day (09:00 - 17:00)',
      status: 'In Consultation',
      currentPatient: 'Sunita Sharma (Token #03)',
      waitingCount: 5,
      avgConsultTime: '14 min'
    },
    {
      cabin: 'Cabin 104',
      specialty: 'Gynecology & ART',
      doctor: 'Dr. S. K. Roy',
      shift: 'Morning (10:00 - 14:00)',
      status: 'In Consultation',
      currentPatient: 'Meera Kapur (Token #02)',
      waitingCount: 3,
      avgConsultTime: '18 min'
    }
  ]);

  // Mock OPD Visits & Queue
  const [opdVisits, setOpdVisits] = useState([
    {
      tokenNo: 'T-01',
      uhid: 'UHID-89401',
      patientName: 'Anil Deshmukh',
      age: 68,
      gender: 'Male',
      phone: '+91 98201 12345',
      doctor: 'Dr. N. Joshi',
      specialty: 'Internal Medicine',
      cabin: 'Cabin 101',
      category: 'Senior Citizen',
      checkInTime: '09:05 AM',
      status: 'Completed',
      fee: '₹800 (Paid)',
      followUpDate: '31-Oct-2026'
    },
    {
      tokenNo: 'T-02',
      uhid: 'UHID-89402',
      patientName: 'Meera Kapur',
      age: 33,
      gender: 'Female',
      phone: '+91 98202 23456',
      doctor: 'Dr. S. K. Roy',
      specialty: 'Gynecology & ART',
      cabin: 'Cabin 104',
      category: 'General',
      checkInTime: '09:20 AM',
      status: 'In Cabin',
      fee: '₹1,000 (Paid)',
      followUpDate: 'Pending'
    },
    {
      tokenNo: 'T-03',
      uhid: 'UHID-89403',
      patientName: 'Sunita Sharma',
      age: 62,
      gender: 'Female',
      phone: '+91 98203 34567',
      doctor: 'Dr. P. Sen',
      specialty: 'Orthopedics',
      cabin: 'Cabin 103',
      category: 'Senior Citizen',
      checkInTime: '09:35 AM',
      status: 'In Cabin',
      fee: '₹800 (Paid)',
      followUpDate: 'Pending'
    },
    {
      tokenNo: 'T-04',
      uhid: 'UHID-89404',
      patientName: 'Rohan Mehra',
      age: 48,
      gender: 'Male',
      phone: '+91 98204 45678',
      doctor: 'Dr. N. Joshi',
      specialty: 'Internal Medicine',
      cabin: 'Cabin 101',
      category: 'Emergency / STAT',
      checkInTime: '09:40 AM',
      status: 'In Cabin',
      fee: '₹800 (Paid)',
      followUpDate: 'Pending'
    },
    {
      tokenNo: 'T-05',
      uhid: 'UHID-89405',
      patientName: 'Divya Nambiar',
      age: 27,
      gender: 'Female',
      phone: '+91 98205 56789',
      doctor: 'Dr. V. Singhal',
      specialty: 'Cardiology',
      cabin: 'Cabin 102',
      category: 'General',
      checkInTime: '09:55 AM',
      status: 'Waiting in Lobby',
      fee: '₹1,200 (Paid)',
      followUpDate: 'Pending'
    },
    {
      tokenNo: 'T-06',
      uhid: 'UHID-89406',
      patientName: 'Vikram Patel',
      age: 54,
      gender: 'Male',
      phone: '+91 98206 67890',
      doctor: 'Dr. V. Singhal',
      specialty: 'Cardiology',
      cabin: 'Cabin 102',
      category: 'General',
      checkInTime: '10:10 AM',
      status: 'Scheduled',
      fee: 'Unpaid',
      followUpDate: 'Pending'
    }
  ]);

  // Selected visit for slip printout modal
  const [selectedVisit, setSelectedVisit] = useState(opdVisits[4]);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleCheckInPatient = (tokenNo) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        return {
          ...v,
          status: 'Waiting in Lobby',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fee: '₹800 (Paid)'
        };
      }
      return v;
    }));
    showNotification(`Patient with ${tokenNo} checked in and added to live waiting queue.`);
  };

  const handleCallToCabin = (tokenNo, cabin) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        return {
          ...v,
          status: 'In Cabin'
        };
      }
      return v;
    }));
    showNotification(`Patient ${tokenNo} called into ${cabin}.`);
  };

  const handlePrioritize = (tokenNo) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        return {
          ...v,
          category: 'Emergency / STAT'
        };
      }
      return v;
    }));
    showNotification(`Token ${tokenNo} escalated to Emergency STAT priority.`);
  };

  const handleSendReminder = (tokenNo, phone) => {
    showNotification(`Recall & Follow-up SMS/WhatsApp notification dispatched to ${phone}.`);
  };

  const currentSubmodule = OPD_SUBMODULES.find(s => s.id === activeSubtab);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[var(--color-bg-primary)]">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[var(--color-primary-teal)] text-white text-sm font-medium rounded-lg shadow-xl border border-teal-600 animate-slide-in">
          <CheckCircle2 size={18} className="text-emerald-200" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--color-primary-teal)] shadow-xs">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
                OPD Clinic Desk & Queue Management
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Specialty Cabin Allocation, Real-time Lobby Tokens, Thermal Slip Barcodes, and Patient Recalls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-pale-aqua)] border border-teal-100 text-xs font-medium text-[var(--color-primary-teal)]">
            <Building size={14} />
            <span>4 Active Specialty Cabins</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Clock size={14} />
            <span>Avg Wait: 14 mins</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedVisit(opdVisits[4]);
              setShowSlipModal(true);
            }}
            className="flex items-center gap-2 shadow-xs"
          >
            <Printer size={15} />
            <span>Print OPD Token Slip</span>
          </Button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Today's Total OPD Visits</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[var(--color-primary-teal)]">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-main)]">142</span>
            <span className="text-xs text-emerald-600 font-semibold">+18% vs Yesterday</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">94 Consulted • 48 In-Progress</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Waiting in Lobby</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">18</span>
            <span className="text-xs text-amber-600 font-medium">Across all Cabins</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Peak wait in Cardiology (6)</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Active Doctors on Duty</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Stethoscope size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">4 / 4</span>
            <span className="text-xs text-emerald-600 font-medium">100% Present</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Internal Med, Cardio, Ortho, ART</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Recall Follow-up Due</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-700">24</span>
            <span className="text-xs text-sky-600 font-medium">WhatsApp Sync</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Auto-reminders dispatched at 08:00</p>
        </Card>
      </div>

      {/* Level 2 Submodule Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border-subtle)] overflow-x-auto pb-0.5">
        {OPD_SUBMODULES.map((sub) => {
          const SubIcon = sub.icon;
          const isActive = activeSubtab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => handleSubtabSelect(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-[var(--color-primary-teal)] text-[var(--color-primary-teal)] bg-teal-50/40 shadow-xs'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-slate-50'
              }`}
            >
              <SubIcon size={15} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level 3 Subsubmodule Pills */}
      {currentSubmodule && currentSubmodule.subsubmodules && (
        <div className="flex items-center gap-2 flex-wrap bg-[var(--color-bg-pale-aqua)]/50 p-2 rounded-lg border border-teal-100">
          <span className="text-[11px] font-semibold text-[var(--color-primary-teal)] uppercase tracking-wider px-2">
            Workflows:
          </span>
          {currentSubmodule.subsubmodules.map((subsub) => {
            const isSubsubActive = activeSubsubtab === subsub.id;
            return (
              <button
                key={subsub.id}
                onClick={() => handleSubsubSelect(subsub.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  isSubsubActive
                    ? 'bg-[var(--color-primary-teal)] text-white shadow-xs font-semibold'
                    : 'bg-white text-[var(--color-text-muted)] hover:text-[var(--color-primary-teal)] border border-teal-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                <span>{subsub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Areas based on Submodule */}
      {activeSubtab === '22.1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {clinicRooms.map((rm) => (
              <Card key={rm.cabin} className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--color-text-main)]">
                    <Building size={16} className="text-[var(--color-primary-teal)]" />
                    <span>{rm.cabin}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    rm.status === 'In Consultation' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {rm.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-800">{rm.doctor}</div>
                  <div className="text-[11px] text-[var(--color-primary-teal)] font-medium">{rm.specialty}</div>
                  <div className="text-[10px] text-slate-500">{rm.shift}</div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                    <span className="text-slate-500">Waiting Outside:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">
                      {rm.waitingCount} Patients
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Avg Pace:</span>
                    <span className="font-mono text-slate-700">{rm.avgConsultTime}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleSubtabSelect('22.3')}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-[11px]"
                >
                  <span>Manage Queue</span>
                  <ArrowRight size={12} />
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] pb-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--color-primary-teal)]" />
              Real-Time Clinic Flow Rate & Waiting Room Display Link
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-lg border border-teal-100 bg-teal-50/20">
                <span className="text-xs font-bold text-[var(--color-primary-teal)] block mb-1">
                  Waiting Lounge Digital Signage
                </span>
                <p className="text-xs text-slate-600">
                  HDMI TV screen in Ground Floor Lobby 2 shows live token callout with bilingual voice chime.
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Display Connected (IP: 192.168.1.180)
                </div>
              </div>

              <div className="p-3 rounded-lg border border-sky-100 bg-sky-50/20">
                <span className="text-xs font-bold text-sky-800 block mb-1">
                  Doctor Consultation Speed Meter
                </span>
                <p className="text-xs text-slate-600">
                  Target speed: 12-15 minutes per consultation to keep lobby wait below 20 minutes.
                </p>
                <div className="mt-2 text-[11px] text-sky-800 font-semibold font-mono">
                  Current Clinic Average: 14.2 min
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/20">
                <span className="text-xs font-bold text-amber-800 block mb-1">
                  No-Show & Late Arrival Buffer
                </span>
                <p className="text-xs text-slate-600">
                  Late arrivals past 30 mins automatically rescheduled to end of the current session.
                </p>
                <div className="mt-2 text-[11px] text-amber-800 font-semibold">
                  Today's No-Show Rate: 3.5%
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 22.2 Patient Arrival & Check-in & 22.3 Queue Management */}
      {(activeSubtab === '22.2' || activeSubtab === '22.3') && (
        <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[var(--color-primary-teal)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                  Live OPD Reception & Waiting Queue Roster
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Front-desk check-in, token sequencing, senior citizen priority, and doctor cabin callouts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter token, UHID or name..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-slate-50 font-semibold uppercase">
                  <th className="py-2.5 px-3">Token & UHID</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Specialty / Assigned Cabin</th>
                  <th className="py-2.5 px-3">Check-in Time</th>
                  <th className="py-2.5 px-3">Priority Category</th>
                  <th className="py-2.5 px-3">Queue Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {opdVisits.map((v) => (
                  <tr key={v.tokenNo} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-bold font-mono text-[var(--color-primary-teal)]">
                          {v.tokenNo}
                        </span>
                        <div>
                          <span className="font-mono text-teal-800 font-semibold block">{v.uhid}</span>
                          <span className="text-[10px] text-slate-400">{v.fee}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--color-text-main)]">{v.patientName}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        {v.age}y • {v.gender} • {v.phone}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{v.doctor}</div>
                      <div className="text-[11px] text-[var(--color-primary-teal)] flex items-center gap-1 font-medium">
                        <Building size={12} />
                        {v.cabin} ({v.specialty})
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {v.checkInTime}
                    </td>
                    <td className="py-3 px-3">
                      {v.category === 'Emergency / STAT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle size={11} /> Emergency STAT
                        </span>
                      )}
                      {v.category === 'Senior Citizen' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          <BadgeCheck size={11} /> Senior Citizen
                        </span>
                      )}
                      {v.category === 'General' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          General OPD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {v.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> Consulted
                        </span>
                      )}
                      {v.status === 'In Cabin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          In Cabin Now
                        </span>
                      )}
                      {v.status === 'Waiting in Lobby' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          <Clock size={12} /> In Waiting Lobby
                        </span>
                      )}
                      {v.status === 'Scheduled' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status === 'Scheduled' && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleCheckInPatient(v.tokenNo)}
                            className="flex items-center gap-1"
                          >
                            <UserCheck size={12} />
                            <span>Check-in</span>
                          </Button>
                        )}
                        {v.status === 'Waiting in Lobby' && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleCallToCabin(v.tokenNo, v.cabin)}
                              className="flex items-center gap-1"
                            >
                              <span>Call Cabin</span>
                              <ChevronRight size={12} />
                            </Button>
                            {v.category !== 'Emergency / STAT' && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handlePrioritize(v.tokenNo)}
                                title="Escalate to Emergency Priority"
                              >
                                Escal.
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setSelectedVisit(v);
                            setShowSlipModal(true);
                          }}
                          title="Print Thermal Slip"
                        >
                          <Printer size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 22.4 OPD Visit Slip Printout Preview */}
      {activeSubtab === '22.4' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] pb-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
              <Printer size={18} className="text-[var(--color-primary-teal)]" />
              Thermal POS Token Slip Designer & Preview
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              High-speed 80mm thermal receipt printer template with embedded QR and barcode for turnstile check-in.
            </p>

            <div className="mt-5 p-5 bg-amber-50/20 border-2 border-dashed border-slate-300 rounded-lg max-w-sm mx-auto font-mono text-xs shadow-xs text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-bold text-sm tracking-wider uppercase text-teal-900">
                  CITY GENERAL HOSPITAL
                </div>
                <div className="text-[10px] text-slate-500">Out-Patient Department (OPD) Routing Slip</div>
                <div className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()} | Time: 10:15 AM</div>
              </div>

              <div className="py-3 text-center border-b border-dashed border-slate-400">
                <div className="text-xs font-semibold text-slate-600">CONSULTATION TOKEN</div>
                <div className="text-4xl font-extrabold text-[var(--color-primary-teal)] my-1">
                  {selectedVisit?.tokenNo || 'T-05'}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {selectedVisit?.cabin || 'Cabin 102'}
                </div>
              </div>

              <div className="py-3 space-y-1.5 border-b border-dashed border-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold">{selectedVisit?.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UHID:</span>
                  <span className="font-bold">{selectedVisit?.uhid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialty:</span>
                  <span>{selectedVisit?.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold">{selectedVisit?.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Status:</span>
                  <span className="text-emerald-700 font-bold">{selectedVisit?.fee}</span>
                </div>
              </div>

              <div className="pt-3 text-center">
                <div className="w-32 h-10 mx-auto bg-slate-200 rounded flex items-center justify-center font-bold text-[10px] tracking-widest text-slate-700">
                  |||||| {selectedVisit?.uhid || 'UHID-89405'} ||||||
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Please show token outside Doctor Cabin</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => showNotification(`Thermal slip printed for ${selectedVisit?.patientName} (${selectedVisit?.tokenNo}).`)}
                className="flex items-center gap-2"
              >
                <Printer size={15} />
                <span>Print to Thermal POS (80mm)</span>
              </Button>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] pb-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
              <QrCode size={18} className="text-[var(--color-primary-teal)]" />
              Patient Turnstile QR Gate Configuration
            </h3>
            <div className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 mb-1">Automated Lobby Turnstile Sync</h4>
                <p className="text-slate-600">
                  Once checked in, the barcode on the visit slip permits 1-time access through the 1st floor clinic turnstile gates.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 mb-1">Queue Paging Display Output</h4>
                <p className="text-slate-600">
                  Bilingual automated voice synthesizer rings in English and Hindi when doctor presses 'Call Next' in their EMR cabin console.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 mb-1">Paperless Mobile Pass</h4>
                <p className="text-slate-600">
                  Patients receive digital WhatsApp wallet pass with live turn counter updating dynamically in real time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 22.5 Follow-up Tracking & Recalls */}
      {activeSubtab === '22.5' && (
        <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-[var(--color-primary-teal)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                  Consultation Follow-Up Schedule & Automated Multi-Channel Recalls
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Automated SMS & WhatsApp reminders dispatched 48h prior to doctor consultation review dates
              </p>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={() => showNotification('Batch SMS & WhatsApp reminders dispatched to all 24 due patients.')}
              className="flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Broadcast Due Reminders</span>
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-slate-50 font-semibold uppercase">
                  <th className="py-2.5 px-3">Patient & UHID</th>
                  <th className="py-2.5 px-3">Attending Physician</th>
                  <th className="py-2.5 px-3">Follow-up Due Date</th>
                  <th className="py-2.5 px-3">Review Interval</th>
                  <th className="py-2.5 px-3">Recall Channel Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {opdVisits.map((v) => (
                  <tr key={v.tokenNo} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--color-text-main)]">{v.patientName}</div>
                      <div className="text-[11px] text-teal-800 font-mono">
                        {v.uhid} • {v.phone}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{v.doctor}</div>
                      <span className="text-[11px] text-slate-500">{v.specialty}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {v.followUpDate === 'Pending' ? '31-Oct-2026 (Est.)' : v.followUpDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-[var(--color-primary-teal)] border border-teal-200">
                        7 Days Post-Consult
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <MessageSquare size={11} /> WhatsApp Queued
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                          SMS Sent
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleSendReminder(v.tokenNo, v.phone)}
                        className="flex items-center gap-1 ml-auto"
                      >
                        <Send size={11} />
                        <span>Send Now</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Visit Slip Modal */}
      {showSlipModal && selectedVisit && (
        <Modal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          title={`OPD Token & Routing Slip: ${selectedVisit.tokenNo}`}
        >
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs space-y-3">
            <div className="text-center pb-2 border-b border-slate-300">
              <div className="font-bold text-sm text-teal-900">CITY GENERAL HOSPITAL</div>
              <div className="text-[11px] text-slate-500">Out-Patient Department (OPD)</div>
            </div>
            <div className="text-center py-2">
              <div className="text-3xl font-extrabold text-[var(--color-primary-teal)]">{selectedVisit.tokenNo}</div>
              <div className="text-xs font-bold text-slate-800 mt-1">{selectedVisit.cabin}</div>
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-300 text-[11px]">
              <div><strong>Patient:</strong> {selectedVisit.patientName}</div>
              <div><strong>UHID:</strong> {selectedVisit.uhid}</div>
              <div><strong>Doctor:</strong> {selectedVisit.doctor}</div>
              <div><strong>Specialty:</strong> {selectedVisit.specialty}</div>
              <div><strong>Fee:</strong> {selectedVisit.fee}</div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSlipModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowSlipModal(false);
                showNotification(`Token Slip ${selectedVisit.tokenNo} dispatched to thermal printer.`);
              }}
              className="flex items-center gap-1"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default OpdView;
