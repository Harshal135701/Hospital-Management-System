import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  Activity,
  ClipboardList,
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Bed,
  Search,
  Droplet,
  FileText,
  ShieldCheck,
  QrCode,
  XCircle,
  Thermometer,
  Check,
  Plus,
  RefreshCw,
  ChevronRight,
  Filter,
  Eye,
  SlidersHorizontal,
  Stethoscope,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { NursingService } from '../../services/api';

const NURSING_SUBMODULES = [
  {
    id: '21.1',
    label: 'Ward Nursing Workstation',
    icon: Bed,
    subsubmodules: [
      { id: '21.1.1', label: 'Assigned Wing Shift Dashboard' },
      { id: '21.1.2', label: 'Bedside Vital Alerts & Priority Census' },
      { id: '21.1.3', label: 'Active Patient Care Plan Launcher' }
    ]
  },
  {
    id: '21.2',
    label: 'Vitals & Intake-Output Charting',
    icon: Activity,
    subsubmodules: [
      { id: '21.2.1', label: 'Bedside Scheduled Vitals & Pain Score' },
      { id: '21.2.2', label: 'Fluid Intake Logging' },
      { id: '21.2.3', label: 'Fluid Output Logging' },
      { id: '21.2.4', label: '24-Hour Cumulative Fluid Balance' }
    ]
  },
  {
    id: '21.3',
    label: 'Medication Administration Record (MAR)',
    icon: Pill,
    subsubmodules: [
      { id: '21.3.1', label: 'Shift Scheduled Medication Grid' },
      { id: '21.3.2', label: 'Bedside Wristband & Barcode Verification' },
      { id: '21.3.3', label: 'Administered Electronic Timestamp' },
      { id: '21.3.4', label: 'Withheld Dose & Clinical Reason' }
    ]
  },
  {
    id: '21.4',
    label: 'Doctor Order Execution',
    icon: ClipboardList,
    subsubmodules: [
      { id: '21.4.1', label: 'Real-time Inpatient Order Queue' },
      { id: '21.4.2', label: 'Bedside Execution & Clinical Sign-off' }
    ]
  },
  {
    id: '21.5',
    label: 'Shift Handover Notes',
    icon: FileText,
    subsubmodules: [
      { id: '21.5.1', label: 'Shift End Summary Auto-Compilation' },
      { id: '21.5.2', label: 'Outgoing Nurse SBAR Observations' },
      { id: '21.5.3', label: 'Incoming Nurse Electronic Acceptance' }
    ]
  }
];

export function NursingView({ initialSubtab = '21.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('21.')) return initialSubtab;
    return '21.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = NURSING_SUBMODULES.find(s => s.id === (initialSubtab || '21.1'));
    return parent?.subsubmodules[0]?.id || '21.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('nursing:', '');
      if (NURSING_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSubtabSelect = (subId) => {
    setActiveSubtab(subId);
    const parent = NURSING_SUBMODULES.find(s => s.id === subId);
    const firstSubsub = parent?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(firstSubsub);
    if (onNavigate) {
      onNavigate(`nursing:${subId}:${firstSubsub}`);
    }
  };

  const handleSubsubSelect = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (onNavigate) {
      onNavigate(`nursing:${activeSubtab}:${subsubId}`);
    }
  };

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Telemetry KPI State
  const [dashboardStats, setDashboardStats] = useState({
    totalCensus: 6,
    activeBeds: 6,
    capacity: 24,
    occupancyPercent: 25,
    criticalAlerts: 3,
    pendingMarDoses: 2,
    pendingOrders: 4,
    shiftInfo: {
      activeShift: 'Day / Morning Shift',
      shiftTiming: '07:00 AM - 03:00 PM',
      chargeNurse: 'Sister Mary, RN (Senior Incharge)',
      wardWing: 'General Ward - Wing A & Step-Down Unit'
    }
  });

  // Master Data States
  const [patients, setPatients] = useState([]);
  const [vitalsList, setVitalsList] = useState([]);
  const [ioList, setIoList] = useState([]);
  const [marList, setMarList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [handoversList, setHandoversList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedWingFilter, setSelectedWingFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('ALL');
  const [marShiftFilter, setMarShiftFilter] = useState('ALL');
  const [orderPriorityFilter, setOrderPriorityFilter] = useState('ALL');

  // Barcode Verification Simulator State
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [barcodeMatchStatus, setBarcodeMatchStatus] = useState(null);

  // Modals
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isIoModalOpen, setIsIoModalOpen] = useState(false);
  const [isMarAdminModalOpen, setIsMarAdminModalOpen] = useState(false);
  const [isMarWithholdModalOpen, setIsMarWithholdModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isCarePlanModalOpen, setIsCarePlanModalOpen] = useState(false);
  const [activeCarePlanPatient, setActiveCarePlanPatient] = useState(null);

  // Active items for modals
  const [activeMarItem, setActiveMarItem] = useState(null);
  const [activeOrderItem, setActiveOrderItem] = useState(null);

  // Form States
  const [vitalsForm, setVitalsForm] = useState({
    patientId: 'P-101',
    temperature: '98.6',
    pulse: '78',
    bloodPressureSystolic: '120',
    bloodPressureDiastolic: '80',
    respiratoryRate: '16',
    spO2: '98',
    painScore: '2',
    notes: 'Patient resting comfortably. Surgical dressing dry and intact.',
    recordedBy: 'Sister Mary, RN'
  });

  const [ioForm, setIoForm] = useState({
    patientId: 'P-101',
    shift: 'Day Shift (08:00 - 16:00)',
    intakeOral: '400',
    intakeIv: '800',
    intakeEnteral: '0',
    outputUrine: '650',
    outputDrain: '100',
    outputVomitus: '0',
    notes: 'Clear amber urine. Abdominal drain serosanguinous 100 mL.',
    recordedBy: 'Sister Mary, RN'
  });

  const [marWithholdForm, setMarWithholdForm] = useState({
    withheldReason: 'Patient BP low (88/56 mmHg < 90/60 safety limit). Attending physician notified.',
    withheldBy: 'Sister Sneha, RN',
    notes: 'Dose held as per clinical protocol pending physician re-evaluation.'
  });

  const [orderExecutionForm, setOrderExecutionForm] = useState({
    completedBy: 'Sister Sneha, RN',
    notes: 'Procedure performed under sterile technique as per standard nursing SOP. Patient tolerated procedure well.'
  });

  const [handoverForm, setHandoverForm] = useState({
    wing: 'General Ward - Wing A',
    shiftType: 'Morning (07:00) → Afternoon (15:00)',
    outgoingNurse: 'Sister Mary, RN',
    incomingNurse: 'Sister Sneha, RN',
    sbarSituation: '6 Patients in assigned wing. 2 critical vital alerts active: Sunita Rao (Bed 202-B) on 2L O2 with SpO2 91%, Rajesh Verma (Bed 203-A) acute pancreatitis with high negative fluid balance.',
    sbarBackground: 'Bed 202-B COPD flare admitted 2 days ago; ABG performed. Bed 203-A strict NPO with NG tube running to free drainage.',
    sbarAssessment: 'Bed 202-B requires continuous pulse oximetry. Bed 203-A requires aggressive RL hydration and hourly I/O charting.',
    sbarRecommendation: 'Follow up lab for serum electrolytes. Ensure 14:00 IV antibiotic doses are administered on schedule.',
    abnormalVitalsSummary: 'Bed 202-B: SpO2 91% • Bed 203-A: Pulse 112 bpm',
    pendingOrdersSummary: '1 Surgical dressing change • 1 STAT PRBC Blood Transfusion in progress',
    highRiskPatientsSummary: '2 High fall risk patients (Bed 202-B & Bed 302-A) identified with yellow wristbands.'
  });

  // Load Initial Data from Backend
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, pts, vitals, io, mar, orders, handovers] = await Promise.all([
        NursingService.getDashboard(),
        NursingService.getPatients(),
        NursingService.getVitals(),
        NursingService.getIntakeOutput(),
        NursingService.getMar(),
        NursingService.getDoctorOrders(),
        NursingService.getHandovers()
      ]);

      if (dash) setDashboardStats(dash);
      if (pts && pts.length > 0) {
        setPatients(pts);
        if (vitalsForm.patientId === 'P-101' && pts[0]?.id) {
          setVitalsForm(prev => ({ ...prev, patientId: pts[0].id }));
          setIoForm(prev => ({ ...prev, patientId: pts[0].id }));
        }
      }
      if (vitals && vitals.length > 0) setVitalsList(vitals);
      if (io && io.length > 0) setIoList(io);
      if (mar && mar.length > 0) setMarList(mar);
      if (orders && orders.length > 0) setOrdersList(orders);
      if (handovers && handovers.length > 0) setHandoversList(handovers);
    } catch (err) {
      console.warn('[NursingView] API fetch error, operating with loaded state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchWing = selectedWingFilter === 'ALL' || p.wing.toLowerCase().includes(selectedWingFilter.toLowerCase());
      const matchSearch = !searchFilter ||
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.uhid.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.bed.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.doctor.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchFilter.toLowerCase());
      return matchWing && matchSearch;
    });
  }, [patients, selectedWingFilter, searchFilter]);

  // Filtered Vitals List
  const filteredVitals = useMemo(() => {
    return vitalsList.filter(v => {
      return selectedPatientId === 'ALL' || v.patientId === selectedPatientId || v.uhid === selectedPatientId;
    });
  }, [vitalsList, selectedPatientId]);

  // Filtered Intake/Output List
  const filteredIo = useMemo(() => {
    return ioList.filter(i => {
      return selectedPatientId === 'ALL' || i.patientId === selectedPatientId || i.uhid === selectedPatientId;
    });
  }, [ioList, selectedPatientId]);

  // Filtered MAR List
  const filteredMar = useMemo(() => {
    return marList.filter(m => {
      const matchPatient = selectedPatientId === 'ALL' || m.patientId === selectedPatientId || m.uhid === selectedPatientId;
      const matchShift = marShiftFilter === 'ALL' || m.shift.toLowerCase().includes(marShiftFilter.toLowerCase());
      return matchPatient && matchShift;
    });
  }, [marList, selectedPatientId, marShiftFilter]);

  // Filtered Doctor Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      const matchPatient = selectedPatientId === 'ALL' || o.patientId === selectedPatientId || o.uhid === selectedPatientId;
      const matchPriority = orderPriorityFilter === 'ALL' || o.priority.toLowerCase().includes(orderPriorityFilter.toLowerCase());
      return matchPatient && matchPriority;
    });
  }, [ordersList, selectedPatientId, orderPriorityFilter]);

  // Handlers for Operations
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...vitalsForm,
        temperature: parseFloat(vitalsForm.temperature),
        pulse: parseInt(vitalsForm.pulse, 10),
        bloodPressureSystolic: parseInt(vitalsForm.bloodPressureSystolic, 10),
        bloodPressureDiastolic: parseInt(vitalsForm.bloodPressureDiastolic, 10),
        respiratoryRate: parseInt(vitalsForm.respiratoryRate, 10),
        spO2: parseInt(vitalsForm.spO2, 10),
        painScore: parseInt(vitalsForm.painScore, 10)
      };

      const result = await NursingService.recordVitals(payload);
      if (result) {
        setVitalsList(prev => [result, ...prev]);
        // Update patient status in local state
        setPatients(prev => prev.map(p => {
          if (p.id === payload.patientId || p.uhid === payload.patientId) {
            return {
              ...p,
              vitalAlert: result.alertMessage,
              status: result.isAbnormal ? `Alert: ${result.alertMessage}` : 'Stable'
            };
          }
          return p;
        }));
      }
      setIsVitalsModalOpen(false);
      showNotification(`Bedside vitals logged successfully for ${vitalsForm.patientId}.`);
    } catch (err) {
      showNotification(`Failed to record vitals: ${err.message}`);
    }
  };

  const handleSaveIo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ioForm,
        intakeOral: parseFloat(ioForm.intakeOral) || 0,
        intakeIv: parseFloat(ioForm.intakeIv) || 0,
        intakeEnteral: parseFloat(ioForm.intakeEnteral) || 0,
        outputUrine: parseFloat(ioForm.outputUrine) || 0,
        outputDrain: parseFloat(ioForm.outputDrain) || 0,
        outputVomitus: parseFloat(ioForm.outputVomitus) || 0
      };

      const result = await NursingService.recordIntakeOutput(payload);
      if (result) {
        setIoList(prev => [result, ...prev]);
        setPatients(prev => prev.map(p => {
          if (p.id === payload.patientId || p.uhid === payload.patientId) {
            return {
              ...p,
              cumulativeFluidBalance: `${result.balance >= 0 ? '+' : ''}${result.balance} mL (${result.status})`
            };
          }
          return p;
        }));
      }
      setIsIoModalOpen(false);
      showNotification(`Fluid intake/output charted successfully for ${ioForm.patientId}.`);
    } catch (err) {
      showNotification(`Failed to log intake/output: ${err.message}`);
    }
  };

  const handleAdministerMar = async (e) => {
    e.preventDefault();
    if (!activeMarItem) return;

    try {
      const payload = {
        marId: activeMarItem.id,
        patientId: activeMarItem.patientId,
        barcodeVerified: true,
        administeredBy: 'Sister Mary, RN',
        notes: 'Administered at bedside. Wristband scan verified.'
      };

      const result = await NursingService.administerMedication(payload);
      setMarList(prev => prev.map(m => m.id === activeMarItem.id ? { ...m, ...result, status: 'Administered' } : m));
      setDashboardStats(prev => ({
        ...prev,
        pendingMarDoses: Math.max(0, prev.pendingMarDoses - 1)
      }));
      setIsMarAdminModalOpen(false);
      showNotification(`Medication ${activeMarItem.medication} marked as Administered with electronic sign-off.`);
    } catch (err) {
      showNotification(`Error administering dose: ${err.message}`);
    }
  };

  const handleWithholdMar = async (e) => {
    e.preventDefault();
    if (!activeMarItem) return;

    try {
      const payload = {
        marId: activeMarItem.id,
        patientId: activeMarItem.patientId,
        withheldReason: marWithholdForm.withheldReason,
        withheldBy: marWithholdForm.withheldBy,
        notes: marWithholdForm.notes
      };

      const result = await NursingService.withholdMedication(payload);
      setMarList(prev => prev.map(m => m.id === activeMarItem.id ? { ...m, ...result, status: 'Withheld' } : m));
      setDashboardStats(prev => ({
        ...prev,
        pendingMarDoses: Math.max(0, prev.pendingMarDoses - 1)
      }));
      setIsMarWithholdModalOpen(false);
      showNotification(`Medication ${activeMarItem.medication} Withheld. Clinical rationale documented.`);
    } catch (err) {
      showNotification(`Error withholding dose: ${err.message}`);
    }
  };

  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    if (!activeOrderItem) return;

    try {
      const payload = {
        orderId: activeOrderItem.id,
        patientId: activeOrderItem.patientId,
        completedBy: orderExecutionForm.completedBy,
        notes: orderExecutionForm.notes,
        executionDetails: orderExecutionForm.notes
      };

      const result = await NursingService.executeDoctorOrder(payload);
      setOrdersList(prev => prev.map(o => o.id === activeOrderItem.id ? { ...o, ...result, status: 'Completed' } : o));
      setDashboardStats(prev => ({
        ...prev,
        pendingOrders: Math.max(0, prev.pendingOrders - 1)
      }));
      setIsOrderModalOpen(false);
      showNotification(`Doctor order "${activeOrderItem.title}" completed and electronically signed.`);
    } catch (err) {
      showNotification(`Error executing order: ${err.message}`);
    }
  };

  const handleSaveHandover = async (e) => {
    e.preventDefault();
    try {
      const result = await NursingService.createHandover(handoverForm);
      if (result) {
        setHandoversList(prev => [result, ...prev]);
      }
      setIsHandoverModalOpen(false);
      showNotification(`Shift handover SBAR documentation recorded for ${handoverForm.wing}.`);
    } catch (err) {
      showNotification(`Error creating handover: ${err.message}`);
    }
  };

  const handleAcceptHandover = async (handoverId) => {
    try {
      const result = await NursingService.acceptHandover(handoverId, {
        incomingNurseSignature: 'Sister Sneha, RN',
        handoverNotes: 'Physical bedside rounds completed. All 6 patients accounted for. Handover formally accepted.'
      });
      setHandoversList(prev => prev.map(h => h.id === handoverId ? { ...h, ...result, incomingSigned: true } : h));
      showNotification(`Shift handover accepted and verified with incoming nurse electronic signature.`);
    } catch (err) {
      showNotification(`Error accepting handover: ${err.message}`);
    }
  };

  const handleSimulateBarcodeScan = (wristbandBarcode, targetPatientId) => {
    setScannedBarcode(wristbandBarcode);
    const matched = patients.find(p => p.barcode === wristbandBarcode || p.id === targetPatientId);
    if (matched) {
      setBarcodeMatchStatus({
        success: true,
        patientName: matched.name,
        bed: matched.bed,
        uhid: matched.uhid
      });
      showNotification(`Barcode Verified: ${wristbandBarcode} matched to ${matched.name} (${matched.bed}). Patient safety check passed.`);
    } else {
      setBarcodeMatchStatus({
        success: false,
        patientName: null
      });
      showNotification(`Barcode Mismatch Alert: Barcode does not match assigned patient.`);
    }
  };

  const currentSubmodule = NURSING_SUBMODULES.find(s => s.id === activeSubtab);

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

      {/* Enterprise Header Banner (matching Screenshot 3 OPD/MRD) */}
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
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HeartPulse size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  Inpatient Nursing Care & Ward Management
                </h1>
                <Badge variant="info">Module 21 • Clinical Operations</Badge>
                <Badge variant="teal">NABH Std. COP.6 / HIC.4 / MOM.7</Badge>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                Ward nursing workstation, bedside scheduled vitals & pain score, 24-hr intake/output fluid balance, medication administration record (MAR) with barcode verification, doctor order execution queue, and electronic SBAR shift handover.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#166534'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <span>Active Shift: Morning (07:00 - 15:00) • Sister Mary, RN (Incharge)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadData}
              title="Refresh live ward telemetry"
            >
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Telemetry KPI Cards (4 Cards in a responsive grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        {/* KPI 1: Assigned Wing Census */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Assigned Wing Census
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#EBF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A4174' }}>
              <Bed size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {dashboardStats.totalCensus} / {dashboardStats.capacity} Beds
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0284C7' }}>
              ({dashboardStats.occupancyPercent}% Occupancy)
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Wing A: 3 • Wing B: 1 • Step-Down ICU: 2</span>
          </div>
        </div>

        {/* KPI 2: Bedside Vital Alerts */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid #FECACA',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#991B1B', textTransform: 'uppercase' }}>
              Bedside Vital Alerts
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#DC2626' }}>
              {dashboardStats.criticalAlerts} Critical
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              Immediate Attention
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#B91C1C' }}>
            1 Hypoxemia (SpO2 91%) • 1 Oliguria • 1 Severe Tachycardia
          </div>
        </div>

        {/* KPI 3: Shift MAR Doses Due */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Shift MAR Doses Due
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Pill size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#D97706' }}>
              {dashboardStats.pendingMarDoses} Scheduled
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              (4 Administered)
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            1 Withheld dose documented (Hypotension BP &lt; 90/60)
          </div>
        </div>

        {/* KPI 4: Doctor Orders Active */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Inpatient Doctor Orders
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#059669' }}>
              {dashboardStats.pendingOrders} Active
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
              (2 Completed)
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            1 STAT Blood Transfusion • 1 Sterile Dressing Pending
          </div>
        </div>
      </div>

      {/* Level 2 Submodule Navigation Tabs Bar (Matching Screenshot 3) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflowX: 'auto'
        }}
      >
        {NURSING_SUBMODULES.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeSubtab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSubtabSelect(tab.id)}
              style={{
                flex: 1,
                minWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-primary-teal)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(10, 65, 116, 0.2)' : 'none'
              }}
            >
              <IconComponent size={16} />
              <span>{tab.id} {tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level 3 Workflows Bar (Matching Screenshot 3) */}
      {currentSubmodule && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-bg-pale-aqua)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #D1E3F5',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Workflows:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentSubmodule.subsubmodules.map(subsub => {
              const isPillActive = activeSubsubtab === subsub.id;
              return (
                <button
                  key={subsub.id}
                  type="button"
                  onClick={() => handleSubsubSelect(subsub.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: isPillActive ? '1px solid var(--color-primary-teal)' : '1px solid #C4DCF2',
                    backgroundColor: isPillActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    color: isPillActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: isPillActive ? '700' : '500',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: isPillActive ? '0 2px 6px rgba(10, 65, 116, 0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subsub.id} {subsub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 21.1: WARD NURSING WORKSTATION                                  */}
      {/* ========================================================================= */}
      {activeSubtab === '21.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar: Wing Filter & Patient Search */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Wing Selection Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {['ALL', 'General Ward - Wing A', 'General Ward - Wing B', 'ICU Step-Down Unit'].map(wing => (
                <button
                  key={wing}
                  type="button"
                  onClick={() => setSelectedWingFilter(wing)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedWingFilter === wing ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: selectedWingFilter === wing ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: selectedWingFilter === wing ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: selectedWingFilter === wing ? '700' : '500',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {wing === 'ALL' ? 'All Assigned Wings (6)' : wing}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Filter by Patient, Bed, UHID or Doctor..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsVitalsModalOpen(true)}
              >
                Record Vitals
              </Button>
            </div>
          </div>

          {/* Patients Census Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '16px'
            }}
          >
            {filteredPatients.map(patient => {
              const isAlert = patient.vitalAlert !== null;
              return (
                <div
                  key={patient.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: isAlert ? '1.5px solid #FCA5A5' : '1px solid var(--color-border)',
                    boxShadow: isAlert ? '0 4px 14px rgba(220, 38, 38, 0.08)' : 'var(--shadow-card)',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar: Bed & Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          fontWeight: '800',
                          fontSize: '0.84rem'
                        }}
                      >
                        {patient.bed}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                        {patient.wing}
                      </span>
                    </div>
                    {isAlert ? (
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <AlertTriangle size={12} />
                        Critical Alert
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '0.74rem',
                          fontWeight: '700'
                        }}
                      >
                        Stable
                      </span>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        {patient.name}
                      </h3>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                        {patient.uhid}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {patient.age} yrs • {patient.gender} • Admitted {patient.admissionDate}
                    </div>
                  </div>

                  {/* Diagnosis & Care Team */}
                  <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: '600' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Dx: </span>
                      {patient.diagnosis}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Attending: <strong>{patient.doctor}</strong></span>
                      <span>Primary: <strong>{patient.primaryNurse}</strong></span>
                    </div>
                  </div>

                  {/* Clinical Indicators & Alerts */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-md)', backgroundColor: '#F1F5F9', color: '#334155', fontSize: '0.72rem', fontWeight: '600' }}>
                      Diet: {patient.diet}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-md)', backgroundColor: patient.fallRisk.includes('High') ? '#FEE2E2' : '#F1F5F9', color: patient.fallRisk.includes('High') ? '#991B1B' : '#334155', fontSize: '0.72rem', fontWeight: '600' }}>
                      Fall Risk: {patient.fallRisk}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '0.72rem', fontWeight: '600' }}>
                      Fluid: {patient.cumulativeFluidBalance}
                    </span>
                  </div>

                  {/* Vital Alert Banner if present */}
                  {isAlert && (
                    <div
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.78rem',
                        color: '#991B1B',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <AlertTriangle size={14} color="#DC2626" />
                      <span>{patient.vitalAlert}</span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCarePlanPatient(patient);
                        setIsCarePlanModalOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary-teal)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} />
                      Care Plan
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setVitalsForm(prev => ({ ...prev, patientId: patient.id }));
                          setIsVitalsModalOpen(true);
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        + Vitals
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIoForm(prev => ({ ...prev, patientId: patient.id }));
                          setIsIoModalOpen(true);
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#F0FDF4',
                          color: '#15803D',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        + I/O
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          handleSubtabSelect('21.3');
                        }}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        MAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 21.2: VITALS & INTAKE-OUTPUT CHARTING                           */}
      {/* ========================================================================= */}
      {activeSubtab === '21.2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Action Bar */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                Filter by Inpatient:
              </span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="ALL">All Ward Patients ({patients.length})</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.bed} - {p.name} ({p.uhid})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Droplet}
                onClick={() => setIsIoModalOpen(true)}
              >
                + Chart Fluid Intake/Output
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Activity}
                onClick={() => setIsVitalsModalOpen(true)}
              >
                + Record Bedside Vitals
              </Button>
            </div>
          </div>

          {/* Section 1: Bedside Scheduled Vitals Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  Bedside Vitals & Pain Score Telemetry Log
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  NABH Scheduled 4-Hourly & STAT Monitoring • Automatic Clinical Threshold Warning Trigger
                </span>
              </div>
              <Badge variant="teal">{filteredVitals.length} Recorded Readings</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Patient & Bed</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Temp (°F)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Pulse (bpm)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>BP (mmHg)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>RR (bpm)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>SpO2 (%)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Pain Score (0-10)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Logged By & Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status / Clinical Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVitals.map(v => (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: v.isAbnormal ? '#FFF5F5' : '#FFFFFF'
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{v.patientName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{v.bed} • {v.uhid}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: v.temperature > 100.4 ? '#DC2626' : 'var(--color-text-primary)' }}>
                        {v.temperature} °F
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: v.pulse > 100 || v.pulse < 55 ? '#DC2626' : 'var(--color-text-primary)' }}>
                        {v.pulse} bpm
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: v.bloodPressureSystolic > 150 || v.bloodPressureSystolic < 90 ? '#DC2626' : 'var(--color-text-primary)' }}>
                        {v.bloodPressureSystolic} / {v.bloodPressureDiastolic}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {v.respiratoryRate} /min
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: v.spO2 < 92 ? '#DC2626' : '#166534' }}>
                        {v.spO2}%
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            backgroundColor: v.painScore >= 7 ? '#FEE2E2' : v.painScore >= 4 ? '#FEF3C7' : '#DCFCE7',
                            color: v.painScore >= 7 ? '#991B1B' : v.painScore >= 4 ? '#B45309' : '#15803D'
                          }}
                        >
                          {v.painScore} / 10
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                        <div>{v.recordedBy}</div>
                        <div>{v.recordedAt}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {v.isAbnormal ? (
                          <span style={{ color: '#DC2626', fontWeight: '700', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} />
                            {v.alertMessage}
                          </span>
                        ) : (
                          <span style={{ color: '#166534', fontWeight: '600', fontSize: '0.76rem' }}>
                            Normal Range
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Fluid Intake-Output & 24-hr Balance */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  Intake & Output Charting (Cumulative 24-Hour Fluid Balance)
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Oral, IV, Enteral Inflow vs. Urine, Surgical Drain, Vomitus/NG Aspirate Outflow (Net +/- mL)
                </span>
              </div>
              <Badge variant="teal">{filteredIo.length} Chart Entries</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Patient & Bed</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Shift & Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Oral / IV / Enteral</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Total Intake</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Urine / Drain / NG</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Total Output</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>24h Net Balance</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status & Clinical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIo.map(i => {
                    const isSevere = i.balance > 1000 || i.balance < -500;
                    return (
                      <tr
                        key={i.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: isSevere ? '#FFFBEB' : '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{i.patientName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{i.bed} • {i.uhid}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                          <div>{i.shift}</div>
                          <div>{i.timestamp}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>Oral: {i.intakeOral} mL</div>
                          <div style={{ color: '#0369A1' }}>IV: {i.intakeIv} mL</div>
                          {i.intakeEnteral > 0 && <div>Enteral: {i.intakeEnteral} mL</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0284C7' }}>
                          {i.totalIntake} mL
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>Urine: {i.outputUrine} mL</div>
                          {i.outputDrain > 0 && <div style={{ color: '#DC2626' }}>Drain: {i.outputDrain} mL</div>}
                          {i.outputVomitus > 0 && <div style={{ color: '#B45309' }}>NG/Vomit: {i.outputVomitus} mL</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: '#B45309' }}>
                          {i.totalOutput} mL
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: '800',
                              backgroundColor: i.balance >= 0 ? '#E0F2FE' : '#FEE2E2',
                              color: i.balance >= 0 ? '#0369A1' : '#991B1B'
                            }}
                          >
                            {i.balance >= 0 ? '+' : ''}{i.balance} mL
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem' }}>
                          <div style={{ fontWeight: '700', color: isSevere ? '#B45309' : '#15803D' }}>
                            {i.status}
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {i.notes}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 21.3: MEDICATION ADMINISTRATION RECORD (MAR)                   */}
      {/* ========================================================================= */}
      {activeSubtab === '21.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Bedside Barcode Scan Simulation & Filters */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid #C4DCF2',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    Bedside Wristband Barcode Verification (NABH Patient Safety Gate)
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Scan patient wristband barcode to verify Identity, Medication, Dose, Route & Time before sign-off
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  Simulate Scanner:
                </span>
                {patients.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSimulateBarcodeScan(p.barcode, p.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    Scan {p.bed} ({p.name})
                  </button>
                ))}
              </div>
            </div>

            {/* Barcode Verification Feedback Banner */}
            {barcodeMatchStatus && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: barcodeMatchStatus.success ? '#F0FDF4' : '#FEF2F2',
                  border: barcodeMatchStatus.success ? '1px solid #BBF7D0' : '1px solid #FECACA',
                  color: barcodeMatchStatus.success ? '#166534' : '#991B1B',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {barcodeMatchStatus.success ? (
                  <>
                    <ShieldCheck size={18} color="#166534" />
                    <span>
                      MATCH CONFIRMED: Barcode verified for {barcodeMatchStatus.patientName} ({barcodeMatchStatus.bed} • {barcodeMatchStatus.uhid}). Safe to administer scheduled dose.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} color="#DC2626" />
                    <span>
                      MISMATCH WARNING: Barcode does not match the active patient chart. Medication administration blocked.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MAR Schedule Filter Bar */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Shift:</span>
              {['ALL', 'Morning', 'Afternoon', 'Night'].map(shift => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => setMarShiftFilter(shift)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: marShiftFilter === shift ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: marShiftFilter === shift ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: marShiftFilter === shift ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: marShiftFilter === shift ? '700' : '500',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {shift === 'ALL' ? 'All Shifts' : `${shift} Shift`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="ALL">All Patients</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.bed} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MAR Schedule Grid Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  Inpatient Medication Administration Record (MAR Grid)
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  Dose Verification, Bedside Electronic Signature & Clinical Withhold Tracking
                </span>
              </div>
              <Badge variant="teal">{filteredMar.length} Doses Listed</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Patient & Bed</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Medication & Dose</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Route & Freq</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Scheduled Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status & Verification</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Administration Details</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMar.map(m => {
                    const isAdministered = m.status === 'Administered';
                    const isWithheld = m.status === 'Withheld';
                    const isDue = m.status === 'Due / Pending';
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: isWithheld ? '#FFFBEB' : '#FFFFFF'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{m.patientName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{m.bed} • {m.uhid}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '800', color: '#0A4174' }}>{m.medication}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{m.notes}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>{m.route}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{m.frequency}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E293B' }}>
                          {m.scheduledTime}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isAdministered && (
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={13} />
                              Administered
                            </span>
                          )}
                          {isWithheld && (
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: '#FEF3C7',
                                color: '#B45309',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <AlertTriangle size={13} />
                              Withheld
                            </span>
                          )}
                          {isDue && (
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: '#E0F2FE',
                                color: '#0369A1',
                                fontSize: '0.74rem',
                                fontWeight: '800'
                              }}
                            >
                              Due / Pending
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.76rem' }}>
                          {isAdministered && (
                            <div>
                              <div>Given by: <strong>{m.administeredBy}</strong></div>
                              <div style={{ color: 'var(--color-text-secondary)' }}>Time: {m.administeredAt}</div>
                            </div>
                          )}
                          {isWithheld && (
                            <div style={{ color: '#991B1B' }}>
                              <div>Withheld by: <strong>{m.withheldBy}</strong></div>
                              <div>Reason: <em>"{m.withheldReason}"</em></div>
                            </div>
                          )}
                          {isDue && (
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              Awaiting administration & bedside scan
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {isDue && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMarItem(m);
                                  setIsMarAdminModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: '#15803D',
                                  color: '#FFFFFF',
                                  fontSize: '0.74rem',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Administer
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMarItem(m);
                                  setIsMarWithholdModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: '0.74rem',
                                  fontWeight: '700',
                                  border: '1px solid #FCD34D',
                                  cursor: 'pointer'
                                }}
                              >
                                Withhold
                              </button>
                            </div>
                          )}
                          {!isDue && (
                            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                              Signed Off
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 21.4: DOCTOR ORDER EXECUTION                                    */}
      {/* ========================================================================= */}
      {activeSubtab === '21.4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Action & Priority Filters */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Priority:</span>
              {['ALL', 'STAT', 'Urgent', 'Routine'].map(prio => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setOrderPriorityFilter(prio)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: orderPriorityFilter === prio ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: orderPriorityFilter === prio ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: orderPriorityFilter === prio ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: orderPriorityFilter === prio ? '700' : '500',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {prio === 'ALL' ? 'All Orders' : prio}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  outline: 'none',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="ALL">All Ward Inpatients</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.bed} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Execution Queue Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '16px'
            }}
          >
            {filteredOrders.map(order => {
              const isStat = order.priority.includes('STAT');
              const isCompleted = order.status === 'Completed';
              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: isStat ? '1.5px solid #FCA5A5' : '1px solid var(--color-border)',
                    boxShadow: isStat ? '0 4px 14px rgba(220, 38, 38, 0.08)' : 'var(--shadow-card)',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Top Bar: Order ID, Priority, Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--color-primary-teal)', padding: '2px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
                        {order.id}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: isStat ? '#FEE2E2' : '#F1F5F9', color: isStat ? '#991B1B' : '#334155' }}>
                        {order.priority}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        backgroundColor: isCompleted ? '#DCFCE7' : '#FEF3C7',
                        color: isCompleted ? '#15803D' : '#B45309'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                      {order.title}
                    </h4>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                      {order.details}
                    </p>
                  </div>

                  {/* Patient & Doctor Meta */}
                  <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', fontSize: '0.76rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Patient: <strong>{order.patientName} ({order.bed})</strong></span>
                    <span>By: <strong>{order.orderedBy}</strong> ({order.orderedAt})</span>
                  </div>

                  {/* Execution Feedback / Sign-off */}
                  {isCompleted ? (
                    <div style={{ padding: '8px 12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', fontSize: '0.76rem', color: '#166534' }}>
                      <div>Executed by: <strong>{order.executedBy}</strong> on {order.executedAt}</div>
                      <div style={{ marginTop: '2px' }}>Notes: <em>"{order.executionNotes}"</em></div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                        Status: <strong>{order.status}</strong>
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() => {
                          setActiveOrderItem(order);
                          setIsOrderModalOpen(true);
                        }}
                      >
                        Complete & Sign-off
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMODULE 21.5: SHIFT HANDOVER NOTES (SBAR)                               */}
      {/* ========================================================================= */}
      {activeSubtab === '21.5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header Action Bar */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                Structured Inpatient Shift Handover (SBAR Framework)
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Situation • Background • Assessment • Recommendation • Electronic Dual Signature Handover
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsHandoverModalOpen(true)}
            >
              + Prepare Shift Handover
            </Button>
          </div>

          {/* Shift Handover List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {handoversList.map(h => (
              <div
                key={h.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Header: Wing, Date, Signatures */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', fontWeight: '800', fontSize: '0.86rem' }}>
                      {h.wing}
                    </span>
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                      {h.shiftType}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      • Date: {h.handoverDate}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.74rem', fontWeight: '700' }}>
                      Outgoing: {h.outgoingNurse} (Signed)
                    </span>
                    {h.incomingSigned ? (
                      <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '0.74rem', fontWeight: '700' }}>
                        Incoming: {h.incomingNurse} (Accepted)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcceptHandover(h.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Accept & Sign Handover
                      </button>
                    )}
                  </div>
                </div>

                {/* SBAR 4-Column Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '14px'
                  }}
                >
                  {/* S: Situation */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E40AF', marginBottom: '6px' }}>
                      S - SITUATION
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1E3A8A', lineHeight: '1.4' }}>
                      {h.sbarSituation}
                    </div>
                  </div>

                  {/* B: Background */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      B - BACKGROUND
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1E293B', lineHeight: '1.4' }}>
                      {h.sbarBackground}
                    </div>
                  </div>

                  {/* A: Assessment */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400E', marginBottom: '6px' }}>
                      A - ASSESSMENT
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78350F', lineHeight: '1.4' }}>
                      {h.sbarAssessment}
                    </div>
                  </div>

                  {/* R: Recommendation */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#166534', marginBottom: '6px' }}>
                      R - RECOMMENDATION
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#14532D', lineHeight: '1.4' }}>
                      {h.sbarRecommendation}
                    </div>
                  </div>
                </div>

                {/* Auto-compiled telemetry summary footer */}
                <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  <span>Vitals Alert: <strong>{h.abnormalVitalsSummary}</strong></span>
                  <span>Pending Orders: <strong>{h.pendingOrdersSummary}</strong></span>
                  <span>Safety: <strong>{h.highRiskPatientsSummary}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD BEDSIDE VITALS                                            */}
      {/* ========================================================================= */}
      {isVitalsModalOpen && (
        <Modal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          title="Record Bedside Patient Vitals & Pain Score"
          size="lg"
        >
          <form onSubmit={handleSaveVitals} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Patient / Bed</label>
                <select
                  value={vitalsForm.patientId}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, patientId: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.bed} - {p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Body Temperature (°F)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value }))}
                  placeholder="e.g. 98.6"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Pulse Rate (bpm)</label>
                <Input
                  type="number"
                  value={vitalsForm.pulse}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, pulse: e.target.value }))}
                  placeholder="e.g. 76"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Blood Pressure (Systolic / Diastolic mmHg)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="number"
                    value={vitalsForm.bloodPressureSystolic}
                    onChange={(e) => setVitalsForm(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                    placeholder="Systolic (120)"
                    required
                  />
                  <Input
                    type="number"
                    value={vitalsForm.bloodPressureDiastolic}
                    onChange={(e) => setVitalsForm(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                    placeholder="Diastolic (80)"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Respiratory Rate (breaths/min)</label>
                <Input
                  type="number"
                  value={vitalsForm.respiratoryRate}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                  placeholder="e.g. 16"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Oxygen Saturation SpO2 (%)</label>
                <Input
                  type="number"
                  value={vitalsForm.spO2}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, spO2: e.target.value }))}
                  placeholder="e.g. 98"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Pain Score (0 - 10 Numeric Rating Scale)</label>
                <select
                  value={vitalsForm.painScore}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, painScore: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  <option value="0">0 - No Pain</option>
                  <option value="1">1 - Minimal</option>
                  <option value="2">2 - Mild</option>
                  <option value="3">3 - Uncomfortable</option>
                  <option value="4">4 - Moderate</option>
                  <option value="5">5 - Distracting</option>
                  <option value="6">6 - Severe</option>
                  <option value="7">7 - Very Severe</option>
                  <option value="8">8 - Intense</option>
                  <option value="9">9 - Excruciating</option>
                  <option value="10">10 - Worst Pain Imaginable</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Staff Nurse on Duty</label>
                <Input
                  type="text"
                  value={vitalsForm.recordedBy}
                  onChange={(e) => setVitalsForm(prev => ({ ...prev, recordedBy: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Bedside Clinical Observations</label>
              <textarea
                value={vitalsForm.notes}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                placeholder="Notes on wound site, respiration pattern, patient comfort, etc."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Vitals</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOG FLUID INTAKE / OUTPUT                                        */}
      {/* ========================================================================= */}
      {isIoModalOpen && (
        <Modal
          isOpen={isIoModalOpen}
          onClose={() => setIsIoModalOpen(false)}
          title="Chart Fluid Intake & Output (I/O Balance)"
          size="lg"
        >
          <form onSubmit={handleSaveIo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Patient / Bed</label>
                <select
                  value={ioForm.patientId}
                  onChange={(e) => setIoForm(prev => ({ ...prev, patientId: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.bed} - {p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Nursing Shift</label>
                <select
                  value={ioForm.shift}
                  onChange={(e) => setIoForm(prev => ({ ...prev, shift: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  <option value="Day Shift (08:00 - 16:00)">Day Shift (08:00 - 16:00)</option>
                  <option value="Evening Shift (16:00 - 23:00)">Evening Shift (16:00 - 23:00)</option>
                  <option value="Night Shift (23:00 - 08:00)">Night Shift (23:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Oral Fluid Intake (mL)</label>
                <Input
                  type="number"
                  value={ioForm.intakeOral}
                  onChange={(e) => setIoForm(prev => ({ ...prev, intakeOral: e.target.value }))}
                  placeholder="Water, tea, juice in mL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>IV Infusion Intake (mL)</label>
                <Input
                  type="number"
                  value={ioForm.intakeIv}
                  onChange={(e) => setIoForm(prev => ({ ...prev, intakeIv: e.target.value }))}
                  placeholder="NS, RL, DNS, Antibiotics in mL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Urine Output (mL)</label>
                <Input
                  type="number"
                  value={ioForm.outputUrine}
                  onChange={(e) => setIoForm(prev => ({ ...prev, outputUrine: e.target.value }))}
                  placeholder="Voided or Foley urometer in mL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Surgical Drain Output (mL)</label>
                <Input
                  type="number"
                  value={ioForm.outputDrain}
                  onChange={(e) => setIoForm(prev => ({ ...prev, outputDrain: e.target.value }))}
                  placeholder="Abdominal / Romovac drain in mL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Vomitus / NG Aspirate (mL)</label>
                <Input
                  type="number"
                  value={ioForm.outputVomitus}
                  onChange={(e) => setIoForm(prev => ({ ...prev, outputVomitus: e.target.value }))}
                  placeholder="NG suction or emesis in mL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Nurse on Duty</label>
                <Input
                  type="text"
                  value={ioForm.recordedBy}
                  onChange={(e) => setIoForm(prev => ({ ...prev, recordedBy: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Clinical Fluid Notes</label>
              <textarea
                value={ioForm.notes}
                onChange={(e) => setIoForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                placeholder="Urine color, drain character (serous / bilious / purulent)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsIoModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Intake/Output</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADMINISTER MAR MEDICATION                                        */}
      {/* ========================================================================= */}
      {isMarAdminModalOpen && activeMarItem && (
        <Modal
          isOpen={isMarAdminModalOpen}
          onClose={() => setIsMarAdminModalOpen(false)}
          title="Administer Bedside Medication (MAR Sign-off)"
          size="md"
        >
          <form onSubmit={handleAdministerMar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#166534' }}>
                {activeMarItem.medication}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803D', marginTop: '4px' }}>
                Patient: <strong>{activeMarItem.patientName} ({activeMarItem.bed})</strong> • Scheduled: {activeMarItem.scheduledTime}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Route: {activeMarItem.route} • Freq: {activeMarItem.frequency}
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#15803D" />
              <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>
                Bedside wristband match confirmed. 5 Rights of Medication checked.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsMarAdminModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Administration</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: WITHHOLD MAR MEDICATION                                          */}
      {/* ========================================================================= */}
      {isMarWithholdModalOpen && activeMarItem && (
        <Modal
          isOpen={isMarWithholdModalOpen}
          onClose={() => setIsMarWithholdModalOpen(false)}
          title="Withhold Scheduled Medication (Mandatory Clinical Rationale)"
          size="md"
        >
          <form onSubmit={handleWithholdMar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#92400E' }}>
                Withholding: {activeMarItem.medication}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '4px' }}>
                Patient: <strong>{activeMarItem.patientName} ({activeMarItem.bed})</strong>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                Clinical Reason for Withholding Dose *
              </label>
              <select
                value={marWithholdForm.withheldReason}
                onChange={(e) => setMarWithholdForm(prev => ({ ...prev, withheldReason: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                required
              >
                <option value="Patient BP low (88/56 mmHg < 90/60 safety limit). Attending physician notified.">
                  Hypotension: Blood Pressure &lt; 90/60 mmHg limit
                </option>
                <option value="Bradycardia observed (Pulse < 60 bpm). Attending cardiologist notified.">
                  Bradycardia: Heart Rate &lt; 60 bpm
                </option>
                <option value="Patient strictly NPO for scheduled surgery / procedure.">
                  Patient NPO for OT / Diagnostic Procedure
                </option>
                <option value="Patient vomited previous oral dose. Awaiting IV conversion order.">
                  Patient nauseous / vomited oral intake
                </option>
                <option value="Patient or surrogate refused medication after counseling.">
                  Patient Refusal (after counseling)
                </option>
                <option value="Suspected adverse drug reaction / allergy development. Doctor notified.">
                  Suspected Drug Reaction / Allergy
                </option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Withholding Nurse Signature</label>
              <Input
                type="text"
                value={marWithholdForm.withheldBy}
                onChange={(e) => setMarWithholdForm(prev => ({ ...prev, withheldBy: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsMarWithholdModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Withhold</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EXECUTE DOCTOR ORDER                                             */}
      {/* ========================================================================= */}
      {isOrderModalOpen && activeOrderItem && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Execute Inpatient Doctor Order"
          size="md"
        >
          <form onSubmit={handleExecuteOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E40AF' }}>
                {activeOrderItem.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1E3A8A', marginTop: '4px' }}>
                Patient: <strong>{activeOrderItem.patientName} ({activeOrderItem.bed})</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Ordered by {activeOrderItem.orderedBy} • Priority: {activeOrderItem.priority}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                Execution Procedure Notes & Clinical Sign-off *
              </label>
              <textarea
                value={orderExecutionForm.notes}
                onChange={(e) => setOrderExecutionForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                placeholder="Details of procedure performed, catheter size, dressing state, etc."
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Staff Nurse Name</label>
              <Input
                type="text"
                value={orderExecutionForm.completedBy}
                onChange={(e) => setOrderExecutionForm(prev => ({ ...prev, completedBy: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Sign & Complete Order</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PREPARE SHIFT HANDOVER (SBAR)                                    */}
      {/* ========================================================================= */}
      {isHandoverModalOpen && (
        <Modal
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          title="Prepare SBAR Shift Handover Note"
          size="lg"
        >
          <form onSubmit={handleSaveHandover} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Ward Wing</label>
                <select
                  value={handoverForm.wing}
                  onChange={(e) => setHandoverForm(prev => ({ ...prev, wing: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  <option value="General Ward - Wing A">General Ward - Wing A</option>
                  <option value="General Ward - Wing B">General Ward - Wing B</option>
                  <option value="ICU Step-Down Unit">ICU Step-Down Unit</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Shift Transition</label>
                <select
                  value={handoverForm.shiftType}
                  onChange={(e) => setHandoverForm(prev => ({ ...prev, shiftType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                >
                  <option value="Morning (07:00) → Afternoon (15:00)">Morning (07:00) → Afternoon (15:00)</option>
                  <option value="Afternoon (15:00) → Night (23:00)">Afternoon (15:00) → Night (23:00)</option>
                  <option value="Night (23:00) → Morning (07:00)">Night (23:00) → Morning (07:00)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Outgoing Incharge Nurse</label>
                <Input
                  type="text"
                  value={handoverForm.outgoingNurse}
                  onChange={(e) => setHandoverForm(prev => ({ ...prev, outgoingNurse: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Incoming Incharge Nurse</label>
                <Input
                  type="text"
                  value={handoverForm.incomingNurse}
                  onChange={(e) => setHandoverForm(prev => ({ ...prev, incomingNurse: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>S - Situation (Census, critical alerts, admissions) *</label>
              <textarea
                value={handoverForm.sbarSituation}
                onChange={(e) => setHandoverForm(prev => ({ ...prev, sbarSituation: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>B - Background (Clinical diagnoses, surgical history, IV infusions) *</label>
              <textarea
                value={handoverForm.sbarBackground}
                onChange={(e) => setHandoverForm(prev => ({ ...prev, sbarBackground: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>A - Assessment (Abnormal vitals, pain, drains, dressings) *</label>
              <textarea
                value={handoverForm.sbarAssessment}
                onChange={(e) => setHandoverForm(prev => ({ ...prev, sbarAssessment: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>R - Recommendation (Pending STAT labs, medication times, physician calls) *</label>
              <textarea
                value={handoverForm.sbarRecommendation}
                onChange={(e) => setHandoverForm(prev => ({ ...prev, sbarRecommendation: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.84rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsHandoverModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Handover</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: PATIENT CARE PLAN DETAILS                                        */}
      {/* ========================================================================= */}
      {isCarePlanModalOpen && activeCarePlanPatient && (
        <Modal
          isOpen={isCarePlanModalOpen}
          onClose={() => setIsCarePlanModalOpen(false)}
          title={`Active Nursing Care Plan: ${activeCarePlanPatient.name} (${activeCarePlanPatient.bed})`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Diagnosis:</div>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                {activeCarePlanPatient.diagnosis}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Attending Physician: {activeCarePlanPatient.doctor} ({activeCarePlanPatient.specialty})
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.84rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                Nursing Interventions & Care Protocol
              </h5>
              <div style={{ padding: '12px 14px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.84rem', lineHeight: '1.5', color: '#1E293B' }}>
                {activeCarePlanPatient.carePlan}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>DIETARY PLAN:</span>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#1E293B', marginTop: '2px' }}>
                  {activeCarePlanPatient.diet}
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F1F5F9', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '700' }}>FALL RISK LEVEL:</span>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: activeCarePlanPatient.fallRisk.includes('High') ? '#DC2626' : '#15803D', marginTop: '2px' }}>
                  {activeCarePlanPatient.fallRisk}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="button" variant="primary" onClick={() => setIsCarePlanModalOpen(false)}>
                Acknowledge Care Plan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default NursingView;
