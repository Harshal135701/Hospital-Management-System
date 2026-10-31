import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
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
  ChevronRight,
  Plus,
  SlidersHorizontal,
  ShieldCheck,
  Tv,
  Volume2,
  VolumeX,
  PhoneCall,
  Calendar,
  Layers,
  FileText,
  User,
  Phone,
  Share2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { Card, Button, Modal, Badge, Input, Select } from '../common/UIPrimitives';
import { OpdService, PatientService } from '../../services/api';

const OPD_SUBMODULES = [
  {
    id: '22.1',
    label: 'OPD Clinic Desk Dashboard',
    icon: LayoutDashboard,
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
      { id: '22.2.2', label: 'Arrival Confirmation & Status Flip' },
      { id: '22.2.3', label: 'Walk-in Rapid Intake & Token Issuance' }
    ]
  },
  {
    id: '22.3',
    label: 'Consultation Queue Management',
    icon: Users,
    subsubmodules: [
      { id: '22.3.1', label: 'Live Consultation Queue Pacing' },
      { id: '22.3.2', label: 'Emergency & Senior Citizen Priority' },
      { id: '22.3.3', label: 'Cabin Waiting Count Display' },
      { id: '22.3.4', label: 'Digital TV Audio Chime Display' }
    ]
  },
  {
    id: '22.4',
    label: 'OPD Visit Slip Printout',
    icon: Printer,
    subsubmodules: [
      { id: '22.4.1', label: 'Standardized Visit Slip Preview' },
      { id: '22.4.2', label: 'Thermal POS (80mm) Barcode Slip' },
      { id: '22.4.3', label: 'Turnstile QR Gate Access' }
    ]
  },
  {
    id: '22.5',
    label: 'Follow-up Tracking',
    icon: CalendarCheck,
    subsubmodules: [
      { id: '22.5.1', label: 'Consultation Review Date Scheduling' },
      { id: '22.5.2', label: 'Automated Recall SMS & WhatsApp Triggers' },
      { id: '22.5.3', label: 'Overdue Follow-up Re-booking' }
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

  // Live Toast & Notifications
  const [toastMessage, setToastMessage] = useState(null);
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audio Chime & Speech Synthesis
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [callingBanner, setCallingBanner] = useState(null);

  const playVoiceChime = useCallback((tokenNo, cabin, doctorName) => {
    setCallingBanner({ tokenNo, cabin, doctorName, time: new Date().toLocaleTimeString() });
    setTimeout(() => setCallingBanner(null), 7000);

    if (soundEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Token number ${tokenNo.replace('-', ' ')}, please proceed to ${cabin}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis chime error:', e);
      }
    }
  }, [soundEnabled]);

  // Telemetry KPI State
  const [dashboardStats, setDashboardStats] = useState({
    todayVisits: 142,
    consulted: 94,
    inProgress: 48,
    waitingInLobby: 18,
    scheduled: 8,
    activeCabinsCount: 4,
    totalCabinsPresent: 4,
    avgWaitTime: '14 mins',
    peakWaitSpecialty: 'Cardiology (6)',
    followUpsDueCount: 24
  });

  // Clinic Cabins Roster
  const [clinicRooms, setClinicRooms] = useState([
    {
      cabin: 'Cabin 101',
      specialty: 'Internal Medicine',
      doctor: 'Dr. N. Joshi',
      shift: 'Morning (09:00 - 13:00)',
      status: 'In Consultation',
      currentPatient: 'Rohan Mehra (Token #T-04)',
      waitingCount: 4,
      avgConsultTime: '12 min',
      floor: 'Ground Floor Clinic Wing',
      tokenCapacity: 30,
      fee: 800
    },
    {
      cabin: 'Cabin 102',
      specialty: 'Cardiology',
      doctor: 'Dr. V. Singhal',
      shift: 'Morning (09:30 - 13:30)',
      status: 'Ready for Next',
      currentPatient: '-',
      waitingCount: 6,
      avgConsultTime: '15 min',
      floor: '1st Floor North Wing',
      tokenCapacity: 35,
      fee: 1200
    },
    {
      cabin: 'Cabin 103',
      specialty: 'Orthopedics & Joint',
      doctor: 'Dr. P. Sen',
      shift: 'Full Day (09:00 - 17:00)',
      status: 'In Consultation',
      currentPatient: 'Sunita Sharma (Token #T-03)',
      waitingCount: 5,
      avgConsultTime: '14 min',
      floor: '1st Floor South Wing',
      tokenCapacity: 40,
      fee: 900
    },
    {
      cabin: 'Cabin 104',
      specialty: 'Gynecology & ART',
      doctor: 'Dr. S. K. Roy',
      shift: 'Morning (10:00 - 14:00)',
      status: 'In Consultation',
      currentPatient: 'Meera Kapur (Token #T-02)',
      waitingCount: 3,
      avgConsultTime: '18 min',
      floor: '2nd Floor East Wing',
      tokenCapacity: 25,
      fee: 1000
    }
  ]);

  // OPD Visits & Live Queue
  const [opdVisits, setOpdVisits] = useState([
    {
      id: 'opd-v-001',
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
      fee: '₹800 (Paid - Cash)',
      invoiceNo: 'INV-OPD-2026-08145',
      isPriority: false,
      followUpDate: '2026-11-07',
      waitMinutes: 8
    },
    {
      id: 'opd-v-002',
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
      fee: '₹1,000 (Paid - UPI)',
      invoiceNo: 'INV-OPD-2026-08146',
      isPriority: false,
      followUpDate: 'Pending',
      waitMinutes: 12
    },
    {
      id: 'opd-v-003',
      tokenNo: 'T-03',
      uhid: 'UHID-89403',
      patientName: 'Sunita Sharma',
      age: 62,
      gender: 'Female',
      phone: '+91 98203 34567',
      doctor: 'Dr. P. Sen',
      specialty: 'Orthopedics & Joint',
      cabin: 'Cabin 103',
      category: 'Senior Citizen',
      checkInTime: '09:35 AM',
      status: 'In Cabin',
      fee: '₹800 (Paid - Card)',
      invoiceNo: 'INV-OPD-2026-08147',
      isPriority: false,
      followUpDate: 'Pending',
      waitMinutes: 14
    },
    {
      id: 'opd-v-004',
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
      fee: '₹800 (Paid - UPI)',
      invoiceNo: 'INV-OPD-2026-08148',
      isPriority: true,
      followUpDate: 'Pending',
      waitMinutes: 5
    },
    {
      id: 'opd-v-005',
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
      fee: '₹1,200 (Paid - Dynamic UPI QR)',
      invoiceNo: 'INV-OPD-2026-08149',
      isPriority: false,
      followUpDate: 'Pending',
      waitMinutes: 18
    },
    {
      id: 'opd-v-006',
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
      fee: 'Unpaid (Pay at Counter)',
      invoiceNo: 'INV-OPD-2026-08150',
      isPriority: false,
      followUpDate: 'Pending',
      waitMinutes: 0
    }
  ]);

  // Follow-up Tracking Records
  const [followUps, setFollowUps] = useState([
    {
      id: 'fu-001',
      uhid: 'UHID-89401',
      patientName: 'Anil Deshmukh',
      phone: '+91 98201 12345',
      doctor: 'Dr. N. Joshi',
      specialty: 'Internal Medicine',
      timeframe: '7 Days Post-Consult',
      dueDate: '2026-11-07',
      status: 'Pending Re-booking',
      channels: { whatsapp: true, sms: true, ivrCall: false },
      whatsappStatus: 'Queued (48h)',
      smsStatus: 'Scheduled',
      instructions: 'Review fasting blood sugar & serum creatinine. Continue Tab Metformin 500mg BD.'
    },
    {
      id: 'fu-002',
      uhid: 'UHID-89388',
      patientName: 'Preeti Desai',
      phone: '+91 98208 90123',
      doctor: 'Dr. V. Singhal',
      specialty: 'Cardiology',
      timeframe: 'Follow up in 2 weeks',
      dueDate: '2026-11-14',
      status: 'Pending Re-booking',
      channels: { whatsapp: true, sms: true, ivrCall: false },
      whatsappStatus: 'Queued (48h)',
      smsStatus: 'Scheduled',
      instructions: 'Repeat 2D Echocardiogram and 24-hr Holter monitor review. Check BP daily.'
    },
    {
      id: 'fu-003',
      uhid: 'UHID-89350',
      patientName: 'Gopal Krishna Rao',
      phone: '+91 98209 01234',
      doctor: 'Dr. P. Sen',
      specialty: 'Orthopedics & Joint',
      timeframe: '3 Days Post-Op',
      dueDate: '2026-11-03',
      status: 'Re-booked (Confirmed)',
      channels: { whatsapp: true, sms: true, ivrCall: false },
      whatsappStatus: 'Delivered',
      smsStatus: 'Sent',
      instructions: 'Knee arthroscopy surgical wound inspection and suture removal. Physical therapy review.'
    },
    {
      id: 'fu-004',
      uhid: 'UHID-89299',
      patientName: 'Ayesha Siddiqui',
      phone: '+91 98210 12345',
      doctor: 'Dr. S. K. Roy',
      specialty: 'Gynecology & ART',
      timeframe: '14 Days (Beta hCG Review)',
      dueDate: '2026-10-30',
      status: 'Overdue - Reminder Sent',
      channels: { whatsapp: true, sms: true, ivrCall: false },
      whatsappStatus: 'Delivered',
      smsStatus: 'Sent',
      instructions: 'Serum Beta hCG blood pregnancy titer check post-embryo transfer cycle #2.'
    }
  ]);

  // Load live data from server with graceful fallback
  useEffect(() => {
    let isMounted = true;
    const fetchOpdData = async () => {
      try {
        const [dash, cabins, q, fu] = await Promise.all([
          OpdService.getDashboard(),
          OpdService.getCabins(),
          OpdService.getQueue(),
          OpdService.getFollowUps()
        ]);
        if (isMounted) {
          if (dash) setDashboardStats(dash);
          if (cabins && cabins.length > 0) setClinicRooms(cabins);
          if (q && q.length > 0) setOpdVisits(q);
          if (fu && fu.length > 0) setFollowUps(fu);
        }
      } catch (err) {
        console.warn('[OpdView] Server sync error, running with active client store:', err);
      }
    };

    fetchOpdData();
    return () => { isMounted = false; };
  }, []);

  // Filter States
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCabinFilter, setSelectedCabinFilter] = useState('ALL');
  const [arrivalStatusFilter, setArrivalStatusFilter] = useState('ALL');

  // Selected visit for slip printout modal & preview
  const [selectedVisitForSlip, setSelectedVisitForSlip] = useState(opdVisits[4] || opdVisits[0]);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Modals Visibility
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isQueueActionModalOpen, setIsQueueActionModalOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedFollowUpItem, setSelectedFollowUpItem] = useState(null);

  // Form States
  const [sessionForm, setSessionForm] = useState({
    cabin: 'Cabin 105',
    specialty: 'Pediatrics & Neonatology',
    doctor: 'Dr. Anita Desai',
    shift: 'Morning (09:00 - 13:00)',
    tokenCapacity: '30',
    fee: '800'
  });

  const [checkInForm, setCheckInForm] = useState({
    uhid: 'UHID-89407',
    patientName: 'Kavita Sundaram',
    age: '34',
    gender: 'Female',
    phone: '+91 98207 78901',
    doctor: 'Dr. N. Joshi',
    specialty: 'Internal Medicine',
    cabin: 'Cabin 101',
    category: 'General',
    fee: '₹800 (Paid - UPI)'
  });

  const [queueActionForm, setQueueActionForm] = useState({
    category: 'Emergency / STAT',
    cabin: 'Cabin 101',
    notes: 'Severe chest discomfort and dyspnea; urgent ECG required.'
  });

  const [followUpForm, setFollowUpForm] = useState({
    uhid: 'UHID-89401',
    patientName: 'Anil Deshmukh',
    doctor: 'Dr. N. Joshi',
    timeframe: 'Follow up in 2 weeks',
    dueDate: '2026-11-14',
    channels: { whatsapp: true, sms: true, ivrCall: false },
    instructions: 'Review fasting blood sugar & serum creatinine. Continue Tab Metformin 500mg BD.'
  });

  // Modal Handlers
  const handleSaveSession = async (e) => {
    e.preventDefault();
    try {
      await OpdService.activateSession(sessionForm);
    } catch {
      // client store handling
    }
    const newRoom = {
      cabin: sessionForm.cabin,
      specialty: sessionForm.specialty,
      doctor: sessionForm.doctor,
      shift: sessionForm.shift,
      status: 'Ready for Next',
      currentPatient: '-',
      waitingCount: 0,
      avgConsultTime: '12 min',
      floor: 'Ground Floor Clinic Wing',
      tokenCapacity: Number(sessionForm.tokenCapacity) || 30,
      fee: Number(sessionForm.fee) || 800
    };
    setClinicRooms(prev => {
      const idx = prev.findIndex(r => r.cabin === sessionForm.cabin);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRoom;
        return updated;
      }
      return [...prev, newRoom];
    });
    setIsSessionModalOpen(false);
    showNotification(`Specialty Clinic Session activated: ${sessionForm.doctor} in ${sessionForm.cabin} (${sessionForm.specialty}).`);
  };

  const handleSaveCheckIn = async (e) => {
    e.preventDefault();
    const nextTokenNum = opdVisits.length + 1;
    const tokenNo = `T-${nextTokenNum < 10 ? '0' + nextTokenNum : nextTokenNum}`;
    const newVisit = {
      id: `opd-v-${Date.now()}`,
      tokenNo,
      uhid: checkInForm.uhid,
      patientName: checkInForm.patientName,
      age: parseInt(checkInForm.age, 10) || 30,
      gender: checkInForm.gender,
      phone: checkInForm.phone,
      doctor: checkInForm.doctor,
      specialty: checkInForm.specialty,
      cabin: checkInForm.cabin,
      category: checkInForm.category,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting in Lobby',
      fee: checkInForm.fee,
      invoiceNo: `INV-OPD-2026-0${8150 + nextTokenNum}`,
      isPriority: checkInForm.category === 'Emergency / STAT',
      followUpDate: 'Pending',
      waitMinutes: 1
    };

    try {
      await OpdService.checkIn(newVisit);
    } catch {
      // client store handling
    }

    setOpdVisits([newVisit, ...opdVisits]);
    setClinicRooms(prev => prev.map(r => r.cabin === checkInForm.cabin ? { ...r, waitingCount: (r.waitingCount || 0) + 1 } : r));
    setDashboardStats(prev => ({
      ...prev,
      todayVisits: prev.todayVisits + 1,
      waitingInLobby: prev.waitingInLobby + 1
    }));
    setIsCheckInModalOpen(false);
    setSelectedVisitForSlip(newVisit);
    showNotification(`Patient arrived! Token ${tokenNo} generated for ${checkInForm.patientName}. Routed to ${checkInForm.cabin}.`);
  };

  const handleSaveQueueAction = async (e) => {
    e.preventDefault();
    if (!selectedQueueItem) return;
    try {
      await OpdService.setPriority(selectedQueueItem.id || selectedQueueItem.tokenNo, {
        isPriority: queueActionForm.category === 'Emergency / STAT',
        category: queueActionForm.category,
        cabin: queueActionForm.cabin,
        notes: queueActionForm.notes
      });
    } catch {
      // client store fallback
    }

    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === selectedQueueItem.tokenNo) {
        return {
          ...v,
          category: queueActionForm.category,
          cabin: queueActionForm.cabin,
          isPriority: queueActionForm.category === 'Emergency / STAT'
        };
      }
      return v;
    }));
    setIsQueueActionModalOpen(false);
    showNotification(`Token ${selectedQueueItem.tokenNo} updated: Priority ${queueActionForm.category}, routed to ${queueActionForm.cabin}.`);
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    const newFu = {
      id: `fu-${Date.now()}`,
      uhid: followUpForm.uhid,
      patientName: followUpForm.patientName,
      phone: '+91 98200 00000',
      doctor: followUpForm.doctor,
      specialty: 'Outpatient Specialty',
      timeframe: followUpForm.timeframe,
      dueDate: followUpForm.dueDate,
      status: 'Pending Re-booking',
      channels: followUpForm.channels,
      whatsappStatus: 'Queued (48h)',
      smsStatus: 'Scheduled',
      instructions: followUpForm.instructions
    };

    try {
      await OpdService.scheduleFollowUp(newFu);
    } catch {
      // client store fallback
    }

    setFollowUps([newFu, ...followUps]);
    setIsFollowUpModalOpen(false);
    showNotification(`Follow-up review scheduled for ${followUpForm.patientName} (${followUpForm.timeframe} - Due ${followUpForm.dueDate}). Alert logged.`);
  };

  // Operational Inline Actions
  const handleCheckInPatient = async (tokenNo) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        const updated = {
          ...v,
          status: 'Waiting in Lobby',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fee: '₹800 (Paid - UPI)',
          waitMinutes: 1
        };
        setSelectedVisitForSlip(updated);
        return updated;
      }
      return v;
    }));
    setDashboardStats(prev => ({
      ...prev,
      waitingInLobby: prev.waitingInLobby + 1,
      scheduled: Math.max(0, prev.scheduled - 1)
    }));
    showNotification(`Patient with ${tokenNo} confirmed presence. Status switched from "Scheduled" to "Waiting in Lobby".`);
  };

  const handleCallToCabin = async (tokenNo, cabinName) => {
    const targetPatient = opdVisits.find(v => v.tokenNo === tokenNo);
    const rm = clinicRooms.find(r => r.cabin === cabinName);

    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        return { ...v, status: 'In Cabin' };
      }
      return v;
    }));

    setClinicRooms(prev => prev.map(r => {
      if (r.cabin === cabinName) {
        return {
          ...r,
          status: 'In Consultation',
          currentPatient: `${targetPatient?.patientName || 'Patient'} (${tokenNo})`,
          waitingCount: Math.max(0, (r.waitingCount || 1) - 1)
        };
      }
      return r;
    }));

    setDashboardStats(prev => ({
      ...prev,
      waitingInLobby: Math.max(0, prev.waitingInLobby - 1),
      inProgress: prev.inProgress + 1
    }));

    playVoiceChime(tokenNo, cabinName, rm?.doctor || 'Consulting Physician');
    showNotification(`Patient ${tokenNo} (${targetPatient?.patientName}) summoned to ${cabinName}. Audio chime broadcasting in waiting lounge.`);
  };

  const handleTogglePriority = (tokenNo) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        const isNowStat = v.category !== 'Emergency / STAT';
        return {
          ...v,
          category: isNowStat ? 'Emergency / STAT' : 'General',
          isPriority: isNowStat
        };
      }
      return v;
    }));
    showNotification(`Priority toggled for Token ${tokenNo}. Emergency STAT walk-ins elevated to top of queue.`);
  };

  const handleCompleteConsultation = (tokenNo) => {
    setOpdVisits(prev => prev.map(v => {
      if (v.tokenNo === tokenNo) {
        return { ...v, status: 'Completed' };
      }
      return v;
    }));
    setDashboardStats(prev => ({
      ...prev,
      inProgress: Math.max(0, prev.inProgress - 1),
      consulted: prev.consulted + 1
    }));
    showNotification(`Consultation completed for Token ${tokenNo}. Patient advised and cleared.`);
  };

  const handleSendReminder = async (fuId, phone) => {
    try {
      await OpdService.sendFollowUpReminder(fuId);
    } catch {
      // client store fallback
    }
    setFollowUps(prev => prev.map(f => {
      if (f.id === fuId) {
        return {
          ...f,
          whatsappStatus: 'Delivered',
          smsStatus: 'Sent',
          status: 'Overdue - Reminder Sent'
        };
      }
      return f;
    }));
    showNotification(`Automated Follow-up recall SMS & WhatsApp dispatched to ${phone}.`);
  };

  const handleBroadcastReminders = async () => {
    try {
      await OpdService.broadcastReminders();
    } catch {
      // client store fallback
    }
    setFollowUps(prev => prev.map(f => ({
      ...f,
      whatsappStatus: 'Delivered',
      smsStatus: 'Sent'
    })));
    showNotification(`Broadcast complete: Automated recall reminders dispatched via SMS & WhatsApp to all due patients.`);
  };

  // Filtered Queue and Visits
  const filteredVisits = useMemo(() => {
    return opdVisits.filter(v => {
      const matchSearch = !searchFilter ||
        v.tokenNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
        v.uhid.toLowerCase().includes(searchFilter.toLowerCase()) ||
        v.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        v.doctor.toLowerCase().includes(searchFilter.toLowerCase());

      const matchCabin = selectedCabinFilter === 'ALL' || v.cabin === selectedCabinFilter;

      const matchArrival = arrivalStatusFilter === 'ALL' ||
        (arrivalStatusFilter === 'SCHEDULED' && v.status === 'Scheduled') ||
        (arrivalStatusFilter === 'WAITING' && v.status === 'Waiting in Lobby') ||
        (arrivalStatusFilter === 'IN_CABIN' && v.status === 'In Cabin') ||
        (arrivalStatusFilter === 'COMPLETED' && v.status === 'Completed');

      return matchSearch && matchCabin && matchArrival;
    });
  }, [opdVisits, searchFilter, selectedCabinFilter, arrivalStatusFilter]);

  // Priority sorted queue for 22.3
  const prioritySortedQueue = useMemo(() => {
    const list = [...opdVisits.filter(v => v.status === 'Waiting in Lobby' || v.status === 'In Cabin')];
    return list.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return a.tokenNo.localeCompare(b.tokenNo);
    });
  }, [opdVisits]);

  const currentSubmodule = OPD_SUBMODULES.find(s => s.id === activeSubtab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'var(--color-primary-teal)',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="#93C5FD" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live Audio Chime Banner Alert */}
      {callingBanner && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #3B82F6',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.18)',
            animation: 'pulse 1.8s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Volume2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E3A8A' }}>
                DIGITAL ANNOUNCEMENT: TOKEN #{callingBanner.tokenNo} → {callingBanner.cabin} ({callingBanner.doctorName})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#3B82F6' }}>
                Bilingual voice chime broadcasted in Ground Floor Waiting Lounge 2 • {callingBanner.time}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#DBEAFE',
              color: '#1E40AF',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundEnabled ? 'Chime Audio: ON' : 'Chime Audio: MUTED'}
          </button>
        </div>
      )}

      {/* Enterprise Header Banner (matching Screenshot 3 - MRD) */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(10, 65, 116, 0.15)'
              }}
            >
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Out-Patient Department (OPD) & Clinic Desk Management
                </h1>
                <Badge variant="teal">NABH / Ambulatory Care Standard</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0', maxWidth: '820px' }}>
                Comprehensive outpatient administration: specialty clinic desk activation, patient arrival check-in, live queue pacing, thermal visit slip generation, and automated follow-up recalls.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(10, 65, 116, 0.25)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
                color: 'var(--color-primary-teal)'
              }}
            >
              <ShieldCheck size={16} color="var(--color-success)" />
              Real-Time Queue Active
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedVisitForSlip(opdVisits[4] || opdVisits[0]);
                setShowSlipModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Print OPD Token Slip</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCheckInForm({
                  uhid: `UHID-8940${opdVisits.length + 1}`,
                  patientName: '',
                  age: '32',
                  gender: 'Female',
                  phone: '+91 98200 00000',
                  doctor: 'Dr. N. Joshi',
                  specialty: 'Internal Medicine',
                  cabin: 'Cabin 101',
                  category: 'General',
                  fee: '₹800 (Paid - UPI)'
                });
                setIsCheckInModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>+ Patient Check-In</span>
            </Button>
          </div>
        </div>

        {/* Level 2 Submodule Tabs (matching Screenshot 3 - MRD) */}
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
          {OPD_SUBMODULES.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSubtabSelect(tab.id)}
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

        {/* Level 3 Workflows Bar (matching Screenshot 3 - MRD) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WORKFLOWS:
          </span>
          {currentSubmodule?.subsubmodules.map(subsub => {
            const isSubsubActive = activeSubsubtab === subsub.id;
            return (
              <button
                key={subsub.id}
                type="button"
                onClick={() => handleSubsubSelect(subsub.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSubsubActive ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSubsubActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSubsubActive ? '700' : '500',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'
                  }}
                />
                <span>{subsub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Telemetry KPI Cards Row (matching Screenshot 2 - Dashboard) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Total Visits */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Today's Total OPD Visits
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {dashboardStats.todayVisits}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A' }}>
              +18% vs Yesterday
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {dashboardStats.consulted} Consulted • {dashboardStats.inProgress} In-Progress
          </div>
        </div>

        {/* Card 2: Waiting in Lobby */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Waiting in Lobby
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#B45309' }}>
              {dashboardStats.waitingInLobby}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#D97706' }}>
              Avg Wait: {dashboardStats.avgWaitTime}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Peak wait in {dashboardStats.peakWaitSpecialty}
          </div>
        </div>

        {/* Card 3: Active Doctors */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Active Doctors on Duty
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Stethoscope size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
              {dashboardStats.activeCabinsCount} / {dashboardStats.totalCabinsPresent}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16A34A' }}>
              100% Present
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Internal Med, Cardio, Ortho, ART
          </div>
        </div>

        {/* Card 4: Follow-up Recall */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              Recall Follow-up Due
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarCheck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0369A1' }}>
              {dashboardStats.followUpsDueCount}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0284C7' }}>
              WhatsApp & SMS Sync
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Automated alerts scheduled 48h prior
          </div>
        </div>
      </div>

      {/* SUBMODULE 22.1: OPD Clinic Desk Dashboard */}
      {activeSubtab === '22.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-border-subtle)'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                  22.1 Specialty Clinic Cabin Roster & Live Sessions
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  Line-by-line flow: Active consulting suites, doctor duty assignments, room allocation, and real-time waiting load.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSessionForm({
                    cabin: 'Cabin 105',
                    specialty: 'Pediatrics & Neonatology',
                    doctor: 'Dr. Anita Desai',
                    shift: 'Morning (09:00 - 13:00)',
                    tokenCapacity: '30',
                    fee: '800'
                  });
                  setIsSessionModalOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Activate Specialty Clinic Session</span>
              </Button>
            </div>

            {/* Cabin Roster Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginTop: '20px'
              }}
            >
              {clinicRooms.map((rm) => (
                <div
                  key={rm.cabin}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FAFCFE',
                    boxShadow: 'var(--shadow-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      <Building size={16} color="var(--color-primary-teal)" />
                      <span>{rm.cabin}</span>
                    </div>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        backgroundColor: rm.status === 'In Consultation' ? '#FEF3C7' : '#DCFCE7',
                        color: rm.status === 'In Consultation' ? '#B45309' : '#15803D',
                        border: rm.status === 'In Consultation' ? '1px solid #FDE68A' : '1px solid #BBF7D0'
                      }}
                    >
                      {rm.status}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{rm.doctor}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', marginTop: '2px' }}>{rm.specialty}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{rm.shift} • {rm.floor}</div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Currently Consulting:</span>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {rm.currentPatient}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Waiting Outside:</span>
                      <span style={{ fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', padding: '1px 8px', borderRadius: '4px' }}>
                        {rm.waitingCount} Patients
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Average Consultation Pace:</span>
                      <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{rm.avgConsultTime}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCallToCabin('T-04', rm.cabin)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem' }}
                    >
                      <Volume2 size={13} />
                      <span>Call Next</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubtabSelect('22.3')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem' }}
                    >
                      <span>Queue</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry & Display Link Card */}
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <TrendingUp size={20} color="var(--color-primary-teal)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                Real-Time Clinic Flow Rate & Waiting Room Display Link (22.1.3)
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #BAE6FD',
                  backgroundColor: '#F0F9FF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0369A1', fontSize: '0.86rem' }}>
                  <Tv size={16} />
                  <span>Waiting Lounge Digital Signage</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#0F2438', margin: 0 }}>
                  HDMI TV screen in Ground Floor Lobby 2 shows live token callout with bilingual voice chime.
                </p>
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#15803D', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Digital Display Connected (IP: 192.168.1.180)
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1E293B', fontSize: '0.86rem' }}>
                  <Clock size={16} />
                  <span>Doctor Consultation Speed Meter</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                  Target speed: 12-15 minutes per consultation to keep lobby wait below 20 minutes.
                </p>
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: 'var(--color-primary-teal)', fontWeight: '700' }}>
                  Current Clinic Average: 14.2 min
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #FDE68A',
                  backgroundColor: '#FEFCE8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#A16207', fontSize: '0.86rem' }}>
                  <AlertTriangle size={16} />
                  <span>No-Show & Late Arrival Buffer</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#713F12', margin: 0 }}>
                  Late arrivals past 30 mins automatically rescheduled to end of the current session.
                </p>
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#A16207', fontWeight: '700' }}>
                  Today's No-Show Rate: 3.5% (Strict Queue Compliance)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 22.2: Patient Arrival & Check-in */}
      {activeSubtab === '22.2' && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="var(--color-primary-teal)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                  22.2 Patient Arrival Desk & Rapid Check-in Intake
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                Line-by-line flow: Patient arrives at clinic reception desk → Assistant confirms presence and clicks [ Check-In / Arrived ] → Status switches from "Scheduled" to "Waiting in Lobby".
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCheckInForm({
                    uhid: `UHID-8940${opdVisits.length + 1}`,
                    patientName: '',
                    age: '32',
                    gender: 'Female',
                    phone: '+91 98200 00000',
                    doctor: 'Dr. N. Joshi',
                    specialty: 'Internal Medicine',
                    cabin: 'Cabin 101',
                    category: 'General',
                    fee: '₹800 (Paid - UPI)'
                  });
                  setIsCheckInModalOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Walk-In Patient Check-In</span>
              </Button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  minWidth: '260px'
                }}
              >
                <Search size={15} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="Filter token, UHID or patient name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}
                />
              </div>

              <select
                value={selectedCabinFilter}
                onChange={(e) => setSelectedCabinFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="ALL">All Doctor Cabins</option>
                {clinicRooms.map(r => (
                  <option key={r.cabin} value={r.cabin}>{r.cabin} ({r.doctor})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'SCHEDULED', 'WAITING', 'IN_CABIN', 'COMPLETED'].map(statusKey => {
                const isSel = arrivalStatusFilter === statusKey;
                const labels = {
                  ALL: 'All Statuses',
                  SCHEDULED: 'Scheduled (Awaiting Check-in)',
                  WAITING: 'Waiting in Lobby',
                  IN_CABIN: 'In Cabin',
                  COMPLETED: 'Completed'
                };
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setArrivalStatusFilter(statusKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: isSel ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                      backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                      fontWeight: isSel ? '700' : '500',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {labels[statusKey]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arrivals Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>TOKEN & UHID</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>PATIENT DETAILS</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>SPECIALTY & CABIN</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>CHECK-IN TIME</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>PRIORITY</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((v, idx) => (
                  <tr
                    key={v.tokenNo}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-bg-pale-aqua)',
                            border: '1px solid rgba(10, 65, 116, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            color: 'var(--color-primary-teal)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {v.tokenNo}
                        </span>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)', display: 'block' }}>{v.uhid}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{v.fee}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{v.patientName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                        {v.age} Y • {v.gender} • {v.phone}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{v.doctor}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                        {v.cabin} ({v.specialty})
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                      {v.checkInTime}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {v.category === 'Emergency / STAT' ? (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Emergency STAT
                        </span>
                      ) : v.category === 'Senior Citizen' ? (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: '#E0E7FF', color: '#3730A3' }}>
                          Senior Citizen
                        </span>
                      ) : (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '500', backgroundColor: '#F1F5F9', color: '#475569' }}>
                          General OPD
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {v.status === 'Scheduled' && (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '600', backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
                          Scheduled
                        </span>
                      )}
                      {v.status === 'Waiting in Lobby' && (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Waiting in Lobby
                        </span>
                      )}
                      {v.status === 'In Cabin' && (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                          In Cabin Now
                        </span>
                      )}
                      {v.status === 'Completed' && (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Consulted
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {v.status === 'Scheduled' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCheckInPatient(v.tokenNo)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '5px 10px' }}
                          >
                            <UserCheck size={13} />
                            <span>Check-In / Arrived</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVisitForSlip(v);
                            setShowSlipModal(true);
                          }}
                          title="Print Standardized OPD Visit Slip"
                          style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                        >
                          <Printer size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedQueueItem(v);
                            setQueueActionForm({
                              category: v.category,
                              cabin: v.cabin,
                              notes: 'Patient priority triage review / cabin reassignment.'
                            });
                            setIsQueueActionModalOpen(true);
                          }}
                          title="Triage Priority"
                          style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--color-primary-teal)' }}
                        >
                          <SlidersHorizontal size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 22.3: Consultation Queue Management */}
      {activeSubtab === '22.3' && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--color-primary-teal)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                  22.3 Consultation Queue Management & Emergency Triage Pacing
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                Line-by-line flow: Patients ordered in live consultation queue based on token number and appointment slot → Assistant prioritizes emergency walk-in patients using priority toggle → Doctor cabin displays live count of patients waiting outside.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCallToCabin('T-05', 'Cabin 102')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Volume2 size={15} />
                <span>Simulate Cabin Callout Chime</span>
              </Button>
            </div>
          </div>

          {/* Cabin Waiting Load Bar (22.3.3) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(10, 65, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LIVE DOCTOR CABIN WAITING LOADS (22.3.3):
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {clinicRooms.map(r => (
                <div
                  key={r.cabin}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.76rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{r.cabin}:</span>
                  <span style={{ fontWeight: '800', color: r.waitingCount > 5 ? '#B91C1C' : '#B45309' }}>
                    {r.waitingCount} Waiting {r.waitingCount > 5 ? '(PEAK)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Queue Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>QUEUE ORDER</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>PATIENT DETAILS</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>ASSIGNED CABIN & DOCTOR</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>WAIT TIME</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>PRIORITY TIER (TOGGLE)</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>CABIN ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {prioritySortedQueue.map((v, idx) => (
                  <tr
                    key={v.tokenNo}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: v.isPriority ? '#FFF1F2' : idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-text-muted)' }}>#{idx + 1}</span>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: v.isPriority ? '#BE123C' : 'var(--color-bg-pale-aqua)',
                            color: v.isPriority ? '#FFFFFF' : 'var(--color-primary-teal)',
                            fontWeight: '800',
                            fontFamily: 'monospace'
                          }}
                        >
                          {v.tokenNo}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{v.patientName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {v.uhid} • {v.phone}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{v.cabin}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{v.doctor} ({v.specialty})</div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          backgroundColor: v.waitMinutes > 15 ? '#FEE2E2' : '#E0F2FE',
                          color: v.waitMinutes > 15 ? '#B91C1C' : '#0369A1'
                        }}
                      >
                        {v.waitMinutes} min in lobby
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePriority(v.tokenNo)}
                        title="Click to toggle Emergency Priority (22.3.2)"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: v.isPriority ? '1.5px solid #BE123C' : '1px solid var(--color-border)',
                          backgroundColor: v.isPriority ? '#FFE4E6' : '#FFFFFF',
                          color: v.isPriority ? '#BE123C' : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <AlertTriangle size={12} color={v.isPriority ? '#BE123C' : '#94A3B8'} />
                        <span>{v.isPriority ? 'Emergency STAT (Top Priority)' : 'Routine Priority (Click to Escalate)'}</span>
                      </button>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {v.status === 'In Cabin' ? (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}>
                          In Cabin Now
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}>
                          Waiting Outside
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {v.status === 'Waiting in Lobby' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCallToCabin(v.tokenNo, v.cabin)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '5px 10px' }}
                          >
                            <Volume2 size={13} />
                            <span>Call Cabin</span>
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCompleteConsultation(v.tokenNo)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '5px 10px' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Complete</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVisitForSlip(v);
                            setShowSlipModal(true);
                          }}
                          style={{ padding: '5px 8px' }}
                          title="Print OPD Visit Slip"
                        >
                          <Printer size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 22.4: OPD Visit Slip Printout */}
      {activeSubtab === '22.4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={20} color="var(--color-primary-teal)" />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                    22.4 OPD Visit Slip Generation & Thermal POS Printout
                  </h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                  Line-by-line flow: On check-in, system generates standardized OPD Visit Slip → Slip prints with patient UHID, Name, Age/Gender, Consulting Doctor, Room Number, Token Number, and Barcode → Patient carries slip into consultation room.
                </p>
              </div>

              {/* Patient Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Select Patient:</span>
                <select
                  value={selectedVisitForSlip?.tokenNo || ''}
                  onChange={(e) => {
                    const found = opdVisits.find(v => v.tokenNo === e.target.value);
                    if (found) setSelectedVisitForSlip(found);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {opdVisits.map(v => (
                    <option key={v.tokenNo} value={v.tokenNo}>{v.tokenNo} - {v.patientName} ({v.uhid})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dual Panel: Left Thermal Receipt, Right Controls */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'start',
                marginTop: '12px'
              }}
            >
              {/* High-Fidelity Standardized 80mm Thermal Receipt */}
              <div
                style={{
                  maxWidth: '380px',
                  margin: '0 auto',
                  width: '100%',
                  padding: '24px 20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed #94A3B8',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#0F2438'
                }}
              >
                {/* Hospital Header */}
                <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1.5px dashed #CBD5E1' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-teal)', letterSpacing: '0.04em' }}>
                    SARJI GROUP OF HOSPITALS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                    MedicsPrime Ambulatory Care Network
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    ISO 9001:2015 & NABH ACCREDITED • OPD WING
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '6px', textTransform: 'uppercase' }}>
                    Standardized OPD Routing Slip
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    Date: {new Date().toLocaleDateString('en-GB')} • Time: {selectedVisitForSlip?.checkInTime || '10:00 AM'}
                  </div>
                </div>

                {/* Consultation Token Box */}
                <div style={{ textAlign: 'center', padding: '14px 0', borderBottom: '1.5px dashed #CBD5E1' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em' }}>
                    CONSULTATION TOKEN
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-primary-teal)', margin: '4px 0', lineHeight: 1 }}>
                    {selectedVisitForSlip?.tokenNo || 'T-05'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', display: 'inline-block', padding: '3px 12px', borderRadius: '4px' }}>
                    {selectedVisitForSlip?.cabin || 'Cabin 102'} (Ground Floor)
                  </div>
                </div>

                {/* Detailed Patient Grid */}
                <div style={{ padding: '12px 0', borderBottom: '1.5px dashed #CBD5E1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>UHID:</span>
                    <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{selectedVisitForSlip?.uhid}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Patient Name:</span>
                    <span style={{ fontWeight: '700' }}>{selectedVisitForSlip?.patientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Age / Gender:</span>
                    <span>{selectedVisitForSlip?.age} Y / {selectedVisitForSlip?.gender}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Priority Tier:</span>
                    <span style={{ fontWeight: '700' }}>{selectedVisitForSlip?.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Consulting Doctor:</span>
                    <span style={{ fontWeight: '700' }}>{selectedVisitForSlip?.doctor}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Department:</span>
                    <span>{selectedVisitForSlip?.specialty}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Tariff & Billing:</span>
                    <span style={{ fontWeight: '700', color: '#15803D' }}>{selectedVisitForSlip?.fee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Invoice Ref:</span>
                    <span style={{ fontSize: '0.72rem' }}>{selectedVisitForSlip?.invoiceNo || 'INV-OPD-89405'}</span>
                  </div>
                </div>

                {/* Barcode & Turnstile QR Gate Code */}
                <div style={{ textAlign: 'center', paddingTop: '14px' }}>
                  <div
                    style={{
                      height: '38px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      letterSpacing: '0.22em',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      color: '#334155'
                    }}
                  >
                    ||| | ||| |||| | ||| || {selectedVisitForSlip?.uhid} ||| | ||
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '6px' }}>
                    ★ Turnstile Gate Access Token Valid for 4 Hours ★
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px' }}>
                    Please carry this slip into the consultation room and present to doctor.
                  </div>
                </div>
              </div>

              {/* Right Side: Print Actions & Gate Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FAFCFE',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Printer size={16} color="var(--color-primary-teal)" />
                    <span>Print Dispatch Options</span>
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Select output device for patient routing token slip:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => showNotification(`Standardized 80mm visit slip printed for ${selectedVisitForSlip?.patientName} (${selectedVisitForSlip?.tokenNo}).`)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Printer size={16} />
                      <span>Print to Thermal POS (80mm ESC/POS)</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => showNotification(`A4 Consultation encounter form generated for ${selectedVisitForSlip?.patientName}.`)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FileText size={16} />
                      <span>Print Standard A4 Slip</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => showNotification(`Paperless digital token pass dispatched via WhatsApp to ${selectedVisitForSlip?.phone}.`)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <MessageSquare size={16} />
                      <span>Send WhatsApp Digital Token Pass</span>
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={16} color="var(--color-primary-teal)" />
                    <span>Turnstile Gate Configuration (22.4.3)</span>
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Connected Gate:</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>Ground Floor Turnstile 1 & 2</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Barcode Validation:</span>
                      <strong style={{ color: '#16A34A' }}>Active (1-Time Use)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Slip Timeout:</span>
                      <strong>240 Minutes</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 22.5: Follow-up Tracking */}
      {activeSubtab === '22.5' && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="var(--color-primary-teal)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                  22.5 Consultation Follow-Up Schedule & Automated Multi-Channel Recalls
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                Line-by-line flow: Doctor selects follow-up timeframe (e.g., "Follow up in 2 weeks") → System logs follow-up alert into patient profile → If patient does not re-book by target date, automated reminder SMS sent inviting them to schedule follow-up.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBroadcastReminders}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} />
                <span>Broadcast Due Reminders</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedFollowUpItem(opdVisits[0]);
                  setFollowUpForm({
                    uhid: opdVisits[0]?.uhid || 'UHID-89401',
                    patientName: opdVisits[0]?.patientName || 'Anil Deshmukh',
                    doctor: opdVisits[0]?.doctor || 'Dr. N. Joshi',
                    timeframe: 'Follow up in 2 weeks',
                    dueDate: '2026-11-14',
                    channels: { whatsapp: true, sms: true, ivrCall: false },
                    instructions: 'Review fasting blood sugar & CBC. Check HbA1c.'
                  });
                  setIsFollowUpModalOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Schedule Follow-up</span>
              </Button>
            </div>
          </div>

          {/* Follow-up Tracking Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>PATIENT & UHID</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>ATTENDING PHYSICIAN</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>TIMEFRAME ADVICE</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>SCHEDULED DUE DATE</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>RE-BOOKING STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>AUTOMATED RECALL</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-text-secondary)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((fu, idx) => (
                  <tr
                    key={fu.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFE',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{fu.patientName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {fu.uhid} • {fu.phone}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{fu.doctor}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{fu.specialty}</div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          border: '1px solid rgba(10, 65, 116, 0.2)'
                        }}
                      >
                        {fu.timeframe}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '240px' }}>
                        {fu.instructions}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      {fu.dueDate}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {fu.status === 'Re-booked (Confirmed)' ? (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Re-booked Confirmed
                        </span>
                      ) : fu.status === 'Overdue - Reminder Sent' ? (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Overdue • Reminded
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Pending Re-booking
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600', backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                          WhatsApp: {fu.whatsappStatus}
                        </span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600', backgroundColor: '#F1F5F9', color: '#475569' }}>
                          SMS: {fu.smsStatus}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSendReminder(fu.id, fu.phone)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', padding: '5px 10px' }}
                        >
                          <Send size={12} />
                          <span>Remind Now</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Activate Specialty Clinic Session */}
      {isSessionModalOpen && (
        <Modal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          title="Activate Specialty Clinic Session & Cabin Allocation (22.1)"
          size="md"
        >
          <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Cabin Suite
                </label>
                <select
                  value={sessionForm.cabin}
                  onChange={(e) => setSessionForm({ ...sessionForm, cabin: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Cabin 101">Cabin 101</option>
                  <option value="Cabin 102">Cabin 102</option>
                  <option value="Cabin 103">Cabin 103</option>
                  <option value="Cabin 104">Cabin 104</option>
                  <option value="Cabin 105">Cabin 105 (Pediatrics Suite)</option>
                  <option value="Cabin 106">Cabin 106 (General Surgery)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Specialty
                </label>
                <select
                  value={sessionForm.specialty}
                  onChange={(e) => setSessionForm({ ...sessionForm, specialty: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics & Joint">Orthopedics & Joint</option>
                  <option value="Gynecology & ART">Gynecology & ART</option>
                  <option value="Pediatrics & Neonatology">Pediatrics & Neonatology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Consulting Physician
              </label>
              <input
                type="text"
                required
                value={sessionForm.doctor}
                onChange={(e) => setSessionForm({ ...sessionForm, doctor: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Session Shift
                </label>
                <select
                  value={sessionForm.shift}
                  onChange={(e) => setSessionForm({ ...sessionForm, shift: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Morning (09:00 - 13:00)">Morning (09:00 - 13:00)</option>
                  <option value="Afternoon (13:30 - 17:30)">Afternoon (13:30 - 17:30)</option>
                  <option value="Evening (18:00 - 21:00)">Evening (18:00 - 21:00)</option>
                  <option value="Full Day (09:00 - 17:00)">Full Day (09:00 - 17:00)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Token Quota
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={sessionForm.tokenCapacity}
                  onChange={(e) => setSessionForm({ ...sessionForm, tokenCapacity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Tariff (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={sessionForm.fee}
                  onChange={(e) => setSessionForm({ ...sessionForm, fee: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSessionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Activate Clinic Session
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Patient Check-In & Token Generation */}
      {isCheckInModalOpen && (
        <Modal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          title="OPD Reception Desk: Patient Check-In & Token Issuance (22.2)"
          size="md"
        >
          <form onSubmit={handleSaveCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  UHID
                </label>
                <input
                  type="text"
                  required
                  value={checkInForm.uhid}
                  onChange={(e) => setCheckInForm({ ...checkInForm, uhid: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavita Sundaram"
                  value={checkInForm.patientName}
                  onChange={(e) => setCheckInForm({ ...checkInForm, patientName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  required
                  value={checkInForm.age}
                  onChange={(e) => setCheckInForm({ ...checkInForm, age: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Gender
                </label>
                <select
                  value={checkInForm.gender}
                  onChange={(e) => setCheckInForm({ ...checkInForm, gender: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Mobile Phone
                </label>
                <input
                  type="text"
                  required
                  value={checkInForm.phone}
                  onChange={(e) => setCheckInForm({ ...checkInForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Department / Specialty
                </label>
                <select
                  value={checkInForm.specialty}
                  onChange={(e) => {
                    const spec = e.target.value;
                    const matchedRoom = clinicRooms.find(r => r.specialty.includes(spec) || spec.includes(r.specialty));
                    setCheckInForm({
                      ...checkInForm,
                      specialty: spec,
                      cabin: matchedRoom?.cabin || checkInForm.cabin,
                      doctor: matchedRoom?.doctor || checkInForm.doctor
                    });
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics & Joint">Orthopedics & Joint</option>
                  <option value="Gynecology & ART">Gynecology & ART</option>
                  <option value="Pediatrics & Neonatology">Pediatrics & Neonatology</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Assigned Cabin & Doctor
                </label>
                <select
                  value={checkInForm.cabin}
                  onChange={(e) => {
                    const cab = e.target.value;
                    const rm = clinicRooms.find(r => r.cabin === cab);
                    setCheckInForm({
                      ...checkInForm,
                      cabin: cab,
                      doctor: rm?.doctor || checkInForm.doctor,
                      specialty: rm?.specialty || checkInForm.specialty
                    });
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  {clinicRooms.map(r => (
                    <option key={r.cabin} value={r.cabin}>{r.cabin} - {r.doctor} ({r.specialty})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Priority Classification
                </label>
                <select
                  value={checkInForm.category}
                  onChange={(e) => setCheckInForm({ ...checkInForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="General">General OPD</option>
                  <option value="Senior Citizen">Senior Citizen Priority</option>
                  <option value="Emergency / STAT">Emergency / STAT Triage</option>
                  <option value="Physically Challenged">Physically Challenged</option>
                  <option value="Follow-up">Review Follow-up</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Consultation Billing Status
                </label>
                <select
                  value={checkInForm.fee}
                  onChange={(e) => setCheckInForm({ ...checkInForm, fee: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="₹800 (Paid - UPI)">₹800 (Paid - UPI / QR)</option>
                  <option value="₹800 (Paid - Cash)">₹800 (Paid - Cash)</option>
                  <option value="₹1,000 (Paid - Card)">₹1,000 (Paid - Card)</option>
                  <option value="Exempt / Staff">Exempt / Hospital Staff</option>
                  <option value="Unpaid (Pay at Counter)">Unpaid (Pay at Counter)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckInModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Complete Check-In & Generate Token Slip
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Triage Priority & Cabin Transfer */}
      {isQueueActionModalOpen && selectedQueueItem && (
        <Modal
          isOpen={isQueueActionModalOpen}
          onClose={() => setIsQueueActionModalOpen(false)}
          title={`Triage & Priority Management: Token ${selectedQueueItem.tokenNo}`}
          size="md"
        >
          <form onSubmit={handleSaveQueueAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Patient:</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{selectedQueueItem.patientName} ({selectedQueueItem.uhid})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Current Suite:</span>
                <strong style={{ color: 'var(--color-primary-teal)' }}>{selectedQueueItem.cabin} • {selectedQueueItem.doctor}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Escalate / Change Priority
                </label>
                <select
                  value={queueActionForm.category}
                  onChange={(e) => setQueueActionForm({ ...queueActionForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Emergency / STAT">Emergency / STAT (Top of Queue)</option>
                  <option value="Senior Citizen">Senior Citizen Priority</option>
                  <option value="General">General Routine</option>
                  <option value="Fast Track">Fast Track Review</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Transfer Cabin Suite
                </label>
                <select
                  value={queueActionForm.cabin}
                  onChange={(e) => setQueueActionForm({ ...queueActionForm, cabin: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  {clinicRooms.map(r => (
                    <option key={r.cabin} value={r.cabin}>{r.cabin} - {r.doctor}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Clinical Triage Rationale
              </label>
              <textarea
                required
                rows={2}
                value={queueActionForm.notes}
                onChange={(e) => setQueueActionForm({ ...queueActionForm, notes: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsQueueActionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Apply Queue Update
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Schedule Follow-up Review */}
      {isFollowUpModalOpen && (
        <Modal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title={`Schedule Consultation Follow-Up Review (22.5)`}
          size="md"
        >
          <form onSubmit={handleSaveFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Patient UHID & Name
                </label>
                <select
                  value={followUpForm.uhid}
                  onChange={(e) => {
                    const uh = e.target.value;
                    const pat = opdVisits.find(v => v.uhid === uh);
                    setFollowUpForm({
                      ...followUpForm,
                      uhid: uh,
                      patientName: pat?.patientName || '',
                      doctor: pat?.doctor || followUpForm.doctor
                    });
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  {opdVisits.map(v => (
                    <option key={v.uhid} value={v.uhid}>{v.uhid} - {v.patientName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Attending Physician
                </label>
                <input
                  type="text"
                  required
                  value={followUpForm.doctor}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, doctor: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Follow-up Timeframe (22.5.1)
                </label>
                <select
                  value={followUpForm.timeframe}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, timeframe: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                >
                  <option value="Follow up in 3 days">Follow up in 3 days (Post-Op)</option>
                  <option value="Follow up in 1 week">Follow up in 1 week</option>
                  <option value="Follow up in 2 weeks">Follow up in 2 weeks (Standard)</option>
                  <option value="Follow up in 1 month">Follow up in 1 month (Chronic Care)</option>
                  <option value="Follow up in 3 months">Follow up in 3 months (Routine)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Target Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={followUpForm.dueDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Automated Multi-Channel Recalls (48h & 24h prior) (22.5.3)
              </label>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={followUpForm.channels.whatsapp}
                    onChange={(e) => setFollowUpForm({
                      ...followUpForm,
                      channels: { ...followUpForm.channels, whatsapp: e.target.checked }
                    })}
                  />
                  <span>WhatsApp Reminder</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={followUpForm.channels.sms}
                    onChange={(e) => setFollowUpForm({
                      ...followUpForm,
                      channels: { ...followUpForm.channels, sms: e.target.checked }
                    })}
                  />
                  <span>SMS Notification</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Clinical Instructions & Reports Required
              </label>
              <textarea
                required
                rows={2}
                value={followUpForm.instructions}
                onChange={(e) => setFollowUpForm({ ...followUpForm, instructions: e.target.value })}
                placeholder="Diagnostic investigations or medication adjustments before visit"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.82rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFollowUpModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Log Follow-Up Alert
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 5: Standalone Print Token Slip Modal */}
      {showSlipModal && selectedVisitForSlip && (
        <Modal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          title={`OPD Token & Routing Slip Preview: ${selectedVisitForSlip.tokenNo}`}
          size="md"
        >
          <div
            style={{
              padding: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed #94A3B8',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                SARJI GROUP OF HOSPITALS
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>Out-Patient Department (OPD) Routing Slip</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Date: {new Date().toLocaleDateString()} | Time: {selectedVisitForSlip.checkInTime}</div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0', borderBottom: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>CONSULTATION TOKEN</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--color-primary-teal)' }}>
                {selectedVisitForSlip.tokenNo}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#B45309' }}>
                {selectedVisitForSlip.cabin}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Patient:</span>
                <strong>{selectedVisitForSlip.patientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>UHID:</span>
                <strong>{selectedVisitForSlip.uhid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Doctor:</span>
                <strong>{selectedVisitForSlip.doctor}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Specialty:</span>
                <span>{selectedVisitForSlip.specialty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Billing Status:</span>
                <span style={{ color: '#15803D', fontWeight: '700' }}>{selectedVisitForSlip.fee}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
              <div style={{ letterSpacing: '0.2em', fontWeight: '800', fontSize: '0.75rem', color: '#475569' }}>
                |||||||| {selectedVisitForSlip.uhid} ||||||||
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94A3B8', marginTop: '4px' }}>
                Valid for Ground Floor Clinic Turnstile Gates
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="outline" size="sm" onClick={() => setShowSlipModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowSlipModal(false);
                showNotification(`Token Slip ${selectedVisitForSlip.tokenNo} dispatched to thermal receipt printer.`);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
