import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';

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

  // Mock State for Ward Nursing
  const [patients, setPatients] = useState([
    {
      bed: 'Bed 201-A',
      uhid: 'UHID-89211',
      name: 'Rohan Mehra',
      age: 48,
      gender: 'Male',
      diagnosis: 'Acute Pancreatitis (Post-Op Day 2)',
      dr: 'Dr. S. K. Roy (Gastro)',
      nurse: 'Sr. Priya M.',
      status: 'Critical Alert',
      diet: 'NPO (Nil Per Os)',
      temp: '99.4°F',
      pulse: '98 bpm',
      bp: '135/88 mmHg',
      spo2: '97%',
      painScore: 6,
      fallRisk: 'High (Morse 65)',
      allergies: 'Penicillin, NSAIDs',
      intake: 1850,
      output: 1420
    },
    {
      bed: 'Bed 202-B',
      uhid: 'UHID-89240',
      name: 'Sunita Sharma',
      age: 62,
      gender: 'Female',
      diagnosis: 'Total Knee Replacement (Right)',
      dr: 'Dr. V. Singhal (Ortho)',
      nurse: 'Sr. Anjali R.',
      status: 'Stable',
      diet: 'Diabetic Low-Sodium',
      temp: '98.2°F',
      pulse: '76 bpm',
      bp: '124/80 mmHg',
      spo2: '99%',
      painScore: 3,
      fallRisk: 'High (Assisted Walk)',
      allergies: 'None Known',
      intake: 2200,
      output: 2050
    },
    {
      bed: 'Bed 203-A',
      uhid: 'UHID-89304',
      name: 'Arjun Verma',
      age: 34,
      gender: 'Male',
      diagnosis: 'Dengue with Thrombocytopenia',
      dr: 'Dr. N. Joshi (Int. Med)',
      nurse: 'Sr. Priya M.',
      status: 'Monitoring',
      diet: 'High Protein Soft',
      temp: '101.2°F',
      pulse: '104 bpm',
      bp: '110/72 mmHg',
      spo2: '96%',
      painScore: 4,
      fallRisk: 'Moderate',
      allergies: 'Sulfa Drugs',
      intake: 3100,
      output: 2600
    },
    {
      bed: 'Bed 204-C',
      uhid: 'UHID-89312',
      name: 'Kavita Das',
      age: 29,
      gender: 'Female',
      diagnosis: 'LSCS Day 1 (Postnatal)',
      dr: 'Dr. A. Sen (OBGYN)',
      nurse: 'Sr. Deepa K.',
      status: 'Stable',
      diet: 'Lactation Diet',
      temp: '98.6°F',
      pulse: '80 bpm',
      bp: '118/76 mmHg',
      spo2: '99%',
      painScore: 2,
      fallRisk: 'Low',
      allergies: 'None',
      intake: 2500,
      output: 2300
    }
  ]);

  // Selected patient for detail modals / vitals
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    temp: '99.2',
    pulse: '92',
    bpSys: '130',
    bpDia: '84',
    rr: '18',
    spo2: '98',
    painScore: '4',
    oxygenFlow: 'Room Air'
  });

  // MAR State
  const [marRecords, setMarRecords] = useState([
    {
      id: 'MAR-001',
      patientUhid: 'UHID-89211',
      patientName: 'Rohan Mehra',
      bed: '201-A',
      medication: 'Inj. Pantoprazole 40mg IV',
      route: 'IV Bolus',
      frequency: 'OD (08:00)',
      scheduledTime: '08:00 AM',
      status: 'Administered',
      adminBy: 'Sr. Priya M.',
      adminTime: '08:05 AM',
      barcodeVerified: true
    },
    {
      id: 'MAR-002',
      patientUhid: 'UHID-89211',
      patientName: 'Rohan Mehra',
      bed: '201-A',
      medication: 'Inj. Tramadol 50mg in 100ml NS',
      route: 'IV Infusion over 30m',
      frequency: 'TDS (08:00, 14:00, 20:00)',
      scheduledTime: '14:00 PM',
      status: 'Due Soon',
      adminBy: '-',
      adminTime: '-',
      barcodeVerified: false
    },
    {
      id: 'MAR-003',
      patientUhid: 'UHID-89240',
      patientName: 'Sunita Sharma',
      bed: '202-B',
      medication: 'Inj. Clexane (Enoxaparin) 40mg SC',
      route: 'Subcutaneous (Abdomen)',
      frequency: 'OD (20:00)',
      scheduledTime: '20:00 PM',
      status: 'Scheduled',
      adminBy: '-',
      adminTime: '-',
      barcodeVerified: false
    },
    {
      id: 'MAR-004',
      patientUhid: 'UHID-89304',
      patientName: 'Arjun Verma',
      bed: '203-A',
      medication: 'Inj. Paracetamol 1g IV Infusion',
      route: 'IV Piggyback',
      frequency: 'SOS (Temp > 100°F)',
      scheduledTime: '12:30 PM (SOS)',
      status: 'Administered',
      adminBy: 'Sr. Priya M.',
      adminTime: '12:35 PM',
      barcodeVerified: true
    },
    {
      id: 'MAR-005',
      patientUhid: 'UHID-89211',
      patientName: 'Rohan Mehra',
      bed: '201-A',
      medication: 'Tab. Telmisartan 40mg Oral',
      route: 'Oral (NG Tube)',
      frequency: 'OD (09:00)',
      scheduledTime: '09:00 AM',
      status: 'Withheld',
      adminBy: 'Sr. Priya M.',
      adminTime: '09:10 AM',
      barcodeVerified: true,
      withheldReason: 'Clinician hold: Patient NPO & BP systolic 110. Awaiting morning lab.'
    }
  ]);

  // Doctor Orders
  const [doctorOrders, setDoctorOrders] = useState([
    {
      id: 'ORD-7701',
      bed: 'Bed 201-A',
      patient: 'Rohan Mehra',
      doctor: 'Dr. S. K. Roy',
      orderType: 'Nursing Intervention',
      description: 'Sterile surgical site dressing change with Betadine & Aquacel Ag gauze.',
      priority: 'Urgent',
      timePlaced: '10:15 AM',
      status: 'Pending',
      executedBy: null,
      execTimestamp: null
    },
    {
      id: 'ORD-7702',
      bed: 'Bed 203-A',
      patient: 'Arjun Verma',
      doctor: 'Dr. N. Joshi',
      orderType: 'Diagnostics & Blood Draw',
      description: 'Repeat CBC & Serum Electrolytes STAT. Note Platelet trend.',
      priority: 'STAT',
      timePlaced: '11:00 AM',
      status: 'Completed',
      executedBy: 'Sr. Priya M.',
      execTimestamp: '11:20 AM'
    },
    {
      id: 'ORD-7703',
      bed: 'Bed 202-B',
      patient: 'Sunita Sharma',
      doctor: 'Dr. V. Singhal',
      orderType: 'Physiotherapy & Mobilization',
      description: 'Quadriceps isometric exercises and assisted walker ambulation 30m.',
      priority: 'Routine',
      timePlaced: '09:30 AM',
      status: 'Completed',
      executedBy: 'PT Rahul / Sr. Anjali',
      execTimestamp: '10:00 AM'
    },
    {
      id: 'ORD-7704',
      bed: 'Bed 201-A',
      patient: 'Rohan Mehra',
      doctor: 'Dr. S. K. Roy',
      orderType: 'Transfusion Order',
      description: 'Cross-match & infuse 1 Unit Packed Red Blood Cells (PRBC) over 3 hours with pre-medication.',
      priority: 'Urgent',
      timePlaced: '12:00 PM',
      status: 'Pending',
      executedBy: null,
      execTimestamp: null
    }
  ]);

  // Fluid Balance Log state
  const [fluidLogs, setFluidLogs] = useState([
    { time: '08:00', type: 'Intake', route: 'IV Normal Saline 500ml', amount: 500, balance: '+500 ml' },
    { time: '09:30', type: 'Output', route: 'Urine (Foley Catheter)', amount: 450, balance: '+50 ml' },
    { time: '11:00', type: 'Intake', route: 'IV Ringer Lactate 500ml', amount: 500, balance: '+550 ml' },
    { time: '12:30', type: 'Output', route: 'Abdominal Drain Serosanguinous', amount: 150, balance: '+400 ml' },
    { time: '13:00', type: 'Intake', route: 'IV Metronidazole piggyback', amount: 100, balance: '+500 ml' }
  ]);

  // SBAR Shift Handover State
  const [sbarNotes, setSbarNotes] = useState({
    shift: 'Day Shift (07:00 - 15:00)',
    ward: 'Wing B (Surgical & Post-Op Stepdown)',
    situation: 'Total 18 Beds occupied. 2 critical post-op recoveries. 1 STAT blood transfusion pending for Bed 201-A.',
    background: 'Bed 201-A (Rohan Mehra) Post-Op Day 2 Pancreatitis, low Hb (8.2 g/dL), Foley and Ryle tube in situ. Bed 203-A (Arjun Verma) Dengue platelet count stable at 48k.',
    assessment: 'Bed 201-A pain controlled at 4/10 with IV analgesic. Drain output 150ml clear. Sunita Sharma (202-B) mobilized without dizziness.',
    recommendation: 'Complete PRBC transfusion for Bed 201-A before 17:00. Check evening electrolytes for Bed 203-A at 18:00. Monitor TKR drain for Bed 202-B.',
    outgoingNurse: 'Sr. Priya Mohan (Emp #RN-4029)',
    incomingNurse: 'Sr. Sunaina Iyer (Emp #RN-3882)',
    isSignedOff: false
  });

  // Additional Interactive Modals
  const [isCarePlanModalOpen, setIsCarePlanModalOpen] = useState(false);
  const [isFluidModalOpen, setIsFluidModalOpen] = useState(false);
  const [isMarAdminModalOpen, setIsMarAdminModalOpen] = useState(false);
  const [selectedMarItem, setSelectedMarItem] = useState(null);
  const [isNewMedModalOpen, setIsNewMedModalOpen] = useState(false);
  const [isDoctorOrderModalOpen, setIsDoctorOrderModalOpen] = useState(false);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState(false);

  // Form states
  const [carePlanForm, setCarePlanForm] = useState({
    fallRisk: 'High (Morse 65)',
    diet: 'NPO (Nil Per Os)',
    hydrationGoal: 'IV Maintenance @ 80 ml/hr NS + 5% Dextrose',
    drainProtocol: 'Foley catheter gravity bag to be emptied Q6H. Observe wound drain volume.',
    precautions: 'Bed rails elevated x4. Deep vein thrombosis (DVT) stockings worn continuously.',
    nurse: 'Sr. Priya M.'
  });

  const [fluidForm, setFluidForm] = useState({
    category: 'Intake',
    route: 'IV Electrolyte Infusion 250ml',
    amount: '250',
    time: '14:00',
    colorNotes: 'Clear normal fluid'
  });

  const [marAdminForm, setMarAdminForm] = useState({
    action: 'administer',
    barcodeVerified: true,
    nurseName: 'Sr. Priya M.',
    withheldReason: ''
  });

  const [newMedForm, setNewMedForm] = useState({
    patientUhid: 'UHID-89211',
    medication: 'Inj. Meropenem 1g IV',
    route: 'IV Piggyback over 30m',
    frequency: 'TDS (08:00, 14:00, 20:00)',
    scheduledTime: '14:00 PM',
    doctor: 'Dr. S. K. Roy'
  });

  const [doctorOrderForm, setDoctorOrderForm] = useState({
    bed: 'Bed 201-A',
    doctor: 'Dr. S. K. Roy',
    orderType: 'Nursing Intervention',
    description: 'Sterile surgical site dressing change with Betadine & Aquacel Ag gauze.',
    priority: 'Urgent'
  });

  const [sbarForm, setSbarForm] = useState({
    shift: 'Day Shift (07:00 - 15:00)',
    situation: 'Total 18 Beds occupied. 2 critical post-op recoveries. 1 STAT blood transfusion pending for Bed 201-A.',
    background: 'Bed 201-A (Rohan Mehra) Post-Op Day 2 Pancreatitis, low Hb (8.2 g/dL), Foley and Ryle tube in situ. Bed 203-A (Arjun Verma) Dengue platelet count stable at 48k.',
    assessment: 'Bed 201-A pain controlled at 4/10 with IV analgesic. Drain output 150ml clear. Sunita Sharma (202-B) mobilized without dizziness.',
    recommendation: 'Complete PRBC transfusion for Bed 201-A before 17:00. Check evening electrolytes for Bed 203-A at 18:00. Monitor TKR drain for Bed 202-B.',
    outgoingNurse: 'Sr. Priya Mohan (Emp #RN-4029)',
    incomingNurse: 'Sr. Sunaina Iyer (Emp #RN-3882)'
  });

  const [notificationMsg, setNotificationMsg] = useState(null);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleAdministerMedication = (id) => {
    setMarRecords(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'Administered',
          adminBy: 'Sr. Priya M. (Dual-Scanned)',
          adminTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          barcodeVerified: true
        };
      }
      return m;
    }));
    showNotification(`Medication ${id} electronically administered with barcode wristband verification.`);
  };

  const handleExecuteDoctorOrder = (id) => {
    setDoctorOrders(prev => prev.map(ord => {
      if (ord.id === id) {
        return {
          ...ord,
          status: 'Completed',
          executedBy: 'Sr. Priya M.',
          execTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return ord;
    }));
    showNotification(`Doctor Order ${id} executed and signed off bedside.`);
  };

  const handleSaveVitals = (e) => {
    e.preventDefault();
    if (selectedPatient) {
      setPatients(prev => prev.map(p => {
        if (p.uhid === selectedPatient.uhid) {
          return {
            ...p,
            temp: `${vitalsForm.temp}°F`,
            pulse: `${vitalsForm.pulse} bpm`,
            bp: `${vitalsForm.bpSys}/${vitalsForm.bpDia} mmHg`,
            spo2: `${vitalsForm.spo2}%`,
            painScore: parseInt(vitalsForm.painScore, 10)
          };
        }
        return p;
      }));
    }
    setShowVitalsModal(false);
    showNotification(`Bedside vitals & pain score logged for ${selectedPatient?.name} (${selectedPatient?.bed}).`);
  };

  const handleSaveCarePlan = (e) => {
    e.preventDefault();
    if (selectedPatient) {
      setPatients(prev => prev.map(p => {
        if (p.uhid === selectedPatient.uhid) {
          return {
            ...p,
            fallRisk: carePlanForm.fallRisk,
            diet: carePlanForm.diet,
            nurse: carePlanForm.nurse
          };
        }
        return p;
      }));
    }
    setIsCarePlanModalOpen(false);
    showNotification(`Care Plan updated for ${selectedPatient?.name}: ${carePlanForm.diet}, Fall Risk: ${carePlanForm.fallRisk}`);
  };

  const handleSaveFluid = (e) => {
    e.preventDefault();
    const amountNum = parseInt(fluidForm.amount, 10) || 0;
    const isIntake = fluidForm.category === 'Intake';
    const newEntry = {
      time: fluidForm.time,
      type: fluidForm.category,
      route: fluidForm.route,
      amount: amountNum,
      balance: isIntake ? `+${amountNum} ml` : `-${amountNum} ml`
    };
    setFluidLogs([newEntry, ...fluidLogs]);
    if (selectedPatient) {
      setPatients(prev => prev.map(p => {
        if (p.uhid === selectedPatient.uhid) {
          return {
            ...p,
            intake: isIntake ? p.intake + amountNum : p.intake,
            output: !isIntake ? p.output + amountNum : p.output
          };
        }
        return p;
      }));
    }
    setIsFluidModalOpen(false);
    showNotification(`Fluid ${fluidForm.category} (${amountNum} ml) recorded via ${fluidForm.route}.`);
  };

  const handleSaveMarAdmin = (e) => {
    e.preventDefault();
    if (!selectedMarItem) return;
    const isWithhold = marAdminForm.action === 'withhold';
    setMarRecords(prev => prev.map(m => {
      if (m.id === selectedMarItem.id) {
        return {
          ...m,
          status: isWithhold ? 'Withheld' : 'Administered',
          adminBy: `${marAdminForm.nurseName} (${marAdminForm.barcodeVerified ? 'Dual-Scanned' : 'Manual'})`,
          adminTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          barcodeVerified: marAdminForm.barcodeVerified,
          withheldReason: isWithhold ? marAdminForm.withheldReason : undefined
        };
      }
      return m;
    }));
    setIsMarAdminModalOpen(false);
    showNotification(`Medication ${selectedMarItem.id} marked as ${isWithhold ? 'Withheld' : 'Administered'}.`);
  };

  const handleSaveNewMed = (e) => {
    e.preventDefault();
    const targetPat = patients.find(p => p.uhid === newMedForm.patientUhid) || selectedPatient;
    const newRecord = {
      id: `MAR-00${marRecords.length + 1}`,
      patientUhid: targetPat.uhid,
      patientName: targetPat.name,
      bed: targetPat.bed.replace('Bed ', ''),
      medication: newMedForm.medication,
      route: newMedForm.route,
      frequency: newMedForm.frequency,
      scheduledTime: newMedForm.scheduledTime,
      status: 'Due Soon',
      adminBy: '-',
      adminTime: '-',
      barcodeVerified: false
    };
    setMarRecords([newRecord, ...marRecords]);
    setIsNewMedModalOpen(false);
    showNotification(`Scheduled medication order added to MAR: ${newRecord.medication} for ${targetPat.name}`);
  };

  const handleSaveDoctorOrder = (e) => {
    e.preventDefault();
    const newOrd = {
      id: `ORD-${doctorOrders.length + 7705}`,
      bed: doctorOrderForm.bed,
      patient: patients.find(p => p.bed === doctorOrderForm.bed)?.name || 'Inpatient',
      doctor: doctorOrderForm.doctor,
      orderType: doctorOrderForm.orderType,
      description: doctorOrderForm.description,
      priority: doctorOrderForm.priority,
      timePlaced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      executedBy: null,
      execTimestamp: null
    };
    setDoctorOrders([newOrd, ...doctorOrders]);
    setIsDoctorOrderModalOpen(false);
    showNotification(`CPOE Doctor Order placed: ${newOrd.id} (${newOrd.orderType})`);
  };

  const handleSaveSbar = (e) => {
    e.preventDefault();
    setSbarNotes({
      ...sbarNotes,
      shift: sbarForm.shift,
      situation: sbarForm.situation,
      background: sbarForm.background,
      assessment: sbarForm.assessment,
      recommendation: sbarForm.recommendation,
      outgoingNurse: sbarForm.outgoingNurse,
      incomingNurse: sbarForm.incomingNurse
    });
    setIsSbarModalOpen(false);
    showNotification(`SBAR Shift Handover observations updated for ${sbarForm.shift}.`);
  };

  const currentSubmodule = NURSING_SUBMODULES.find(s => s.id === activeSubtab);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-[var(--color-bg-primary)]">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-[var(--color-primary-teal)] text-white text-sm font-medium rounded-lg shadow-xl border border-blue-600 animate-slide-in">
          <CheckCircle2 size={18} className="text-sky-200" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[var(--color-primary-teal)] shadow-xs">
              <HeartPulse size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
                Ward Nursing Workstation
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Inpatient Bedside Census, Vitals & Intake-Output, Electronic MAR, and Shift SBAR Handovers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-pale-aqua)] border border-sky-100 text-xs font-medium text-[var(--color-primary-teal)]">
            <Bed size={14} />
            <span>Wing B (18/20 Beds Occupied)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Clock size={14} />
            <span>Day Shift: 07:00 - 15:00</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowVitalsModal(true)}
            className="flex items-center gap-2 shadow-xs"
          >
            <Thermometer size={15} />
            <span>Record Bedside Vitals</span>
          </Button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Active Census</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[var(--color-primary-teal)]">
              <Bed size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-text-main)]">18</span>
            <span className="text-xs text-emerald-600 font-semibold">90% Occupancy</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">2 Available • 1 Discharge Ready</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Critical Watch</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">3</span>
            <span className="text-xs text-rose-600 font-medium">STAT Monitoring</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Bed 201-A, 203-A, 206-B</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">MAR Doses Due (14:00)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Pill size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">7</span>
            <span className="text-xs text-amber-600 font-medium">Pending Verify</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Barcode wristband scan required</p>
        </Card>

        <Card className="p-4 bg-white border border-[var(--color-border-subtle)] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Pending Doctor Orders</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">2</span>
            <span className="text-xs text-indigo-600 font-medium">1 Transfusion STAT</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">All CPOE synced & verified</p>
        </Card>
      </div>

      {/* Level 2 Submodule Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border-subtle)] overflow-x-auto pb-0.5">
        {NURSING_SUBMODULES.map((sub) => {
          const SubIcon = sub.icon;
          const isActive = activeSubtab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => handleSubtabSelect(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-[var(--color-primary-teal)] text-[var(--color-primary-teal)] bg-sky-50/40 shadow-xs'
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
        <div className="flex items-center gap-2 flex-wrap bg-[var(--color-bg-pale-aqua)]/50 p-2 rounded-lg border border-sky-100">
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
                    : 'bg-white text-[var(--color-text-muted)] hover:text-[var(--color-primary-teal)] border border-sky-100'
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
      {activeSubtab === '21.1' && (
        <div className="space-y-6">
          <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-main)]">
                  Ward Inpatient Roster & Bedside Census
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Live bed assignments, clinical acuity score, vitals summary, and diet orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Bed, UHID or Patient..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">Bed / Location</th>
                    <th className="py-2.5 px-3">Patient Details</th>
                    <th className="py-2.5 px-3">Diagnosis & Consultant</th>
                    <th className="py-2.5 px-3">Bedside Vitals</th>
                    <th className="py-2.5 px-3">Diet & Allergies</th>
                    <th className="py-2.5 px-3">Acuity Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {patients.map((p) => (
                    <tr
                      key={p.uhid}
                      onClick={() => setSelectedPatient(p)}
                      className={`hover:bg-sky-50/20 cursor-pointer transition-colors ${
                        selectedPatient?.uhid === p.uhid ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-[var(--color-text-main)]">
                        <div className="flex items-center gap-1.5">
                          <Bed size={14} className="text-[var(--color-primary-teal)]" />
                          <span>{p.bed}</span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)] block font-normal">Wing B - Room 2</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--color-text-main)]">{p.name}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          {p.age}y • {p.gender} • <span className="font-mono text-sky-700">{p.uhid}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{p.diagnosis}</div>
                        <div className="text-[11px] text-slate-500">{p.dr}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold">{p.temp}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100">{p.bp}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-sky-800 font-bold">{p.spo2}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Pain: <span className="font-bold text-amber-700">{p.painScore}/10</span> • PR: {p.pulse}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-700">{p.diet}</div>
                        <div className="text-[10px] text-rose-600 font-semibold">
                          Allergy: {p.allergies}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {p.status === 'Critical Alert' && (
                          <Badge variant="danger" className="text-[10px]">
                            Critical Alert
                          </Badge>
                        )}
                        {p.status === 'Monitoring' && (
                          <Badge variant="warning" className="text-[10px]">
                            Monitoring
                          </Badge>
                        )}
                        {p.status === 'Stable' && (
                          <Badge variant="success" className="text-[10px]">
                            Stable
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(p);
                              setShowVitalsModal(true);
                            }}
                          >
                            Vitals
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubtabSelect('21.3');
                            }}
                          >
                            MAR
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Active Care Plan Launcher Drawer */}
          {selectedPatient && (
            <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-[var(--color-primary-teal)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-text-main)]">
                    Active Care Plan & Bedside Protocol: {selectedPatient.name} ({selectedPatient.bed})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Fall Risk: {selectedPatient.fallRisk}
                  </span>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      setCarePlanForm({
                        fallRisk: selectedPatient.fallRisk,
                        diet: selectedPatient.diet,
                        hydrationGoal: 'IV Maintenance @ 80 ml/hr NS + 5% Dextrose',
                        drainProtocol: 'Foley catheter gravity bag to be emptied Q6H.',
                        precautions: 'Bed rails elevated x4. DVT stockings worn.',
                        nurse: selectedPatient.nurse
                      });
                      setIsCarePlanModalOpen(true);
                    }}
                  >
                    Edit Care Plan
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Droplet size={14} className="text-sky-600" />
                    Hydration & Fluid Target
                  </h4>
                  <p className="text-xs text-slate-600">IV Maintenance @ 80 ml/hr NS + 5% Dextrose.</p>
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    24h Balance: <span className="font-bold text-sky-700">+{selectedPatient.intake - selectedPatient.output} ml</span> (Intake: {selectedPatient.intake}ml / Output: {selectedPatient.output}ml)
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Activity size={14} className="text-amber-600" />
                    Drain & Catheter Protocol
                  </h4>
                  <p className="text-xs text-slate-600">Foley catheter gravity bag to be emptied Q6H. Observe wound drain volume.</p>
                  <div className="mt-2 text-[11px] text-amber-700 font-medium">
                    Catheter inserted: 24 Oct 06:00 AM (Day 1)
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Special Nursing Precautions
                  </h4>
                  <p className="text-xs text-slate-600">Bed rails elevated x4. Deep vein thrombosis (DVT) stockings worn continuously.</p>
                  <div className="mt-2 text-[11px] text-emerald-700 font-medium">
                    Assigned Primary Nurse: {selectedPatient.nurse}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 21.2 Vitals & Intake-Output Charting */}
      {activeSubtab === '21.2' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 bg-white border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Activity size={18} className="text-[var(--color-primary-teal)]" />
                  24-Hour Fluid Intake vs. Output Cumulative Ledger
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Hourly charting for Bed 201-A ({selectedPatient?.name})
                </p>
              </div>
              <Button
                variant="primary"
                size="xs"
                onClick={() => setIsFluidModalOpen(true)}
              >
                + Add Fluid Entry
              </Button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-slate-50 font-semibold uppercase">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Route / Source</th>
                    <th className="py-2.5 px-3 text-right">Volume (ml)</th>
                    <th className="py-2.5 px-3 text-right">Running Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {fluidLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{log.time}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.type === 'Intake' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{log.route}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{log.amount} ml</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-800">{log.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-pale-aqua)]/50 border border-sky-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[var(--color-text-muted)] block">Total Intake (24h)</span>
                  <span className="font-bold text-sky-800 text-sm">2,600 ml</span>
                </div>
                <div className="h-6 w-px bg-teal-200" />
                <div>
                  <span className="text-[var(--color-text-muted)] block">Total Output (24h)</span>
                  <span className="font-bold text-amber-800 text-sm">2,050 ml</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[var(--color-text-muted)] block">Net Positive Balance</span>
                <span className="font-bold text-teal-900 text-base font-mono">+550 ml</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-[var(--color-border-subtle)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-main)] pb-3 border-b border-[var(--color-border-subtle)] flex items-center gap-2">
                <Thermometer size={18} className="text-[var(--color-primary-teal)]" />
                Current Bedside Telemetry
              </h3>

              <div className="space-y-3 mt-4">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Body Temperature</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{selectedPatient.temp}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Normal Range</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Pulse Rate / Rhythm</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{selectedPatient.pulse}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Regular Sinus</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Non-Invasive Blood Pressure (NIBP)</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{selectedPatient.bp}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Mild Pre-HTN</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Oxygen Saturation (SpO2)</span>
                    <span className="text-lg font-bold font-mono text-sky-800">{selectedPatient.spo2}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Room Air</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">VAS Pain Rating Scale (0-10)</span>
                    <span className="text-lg font-bold font-mono text-amber-700">{selectedPatient.painScore} / 10</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Moderate Pain</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVitalsModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2"
            >
              <Activity size={15} />
              <span>Update Bedside Vitals</span>
            </Button>
          </Card>
        </div>
      )}

      {/* 21.3 Medication Administration Record (MAR) */}
      {activeSubtab === '21.3' && (
        <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-[var(--color-primary-teal)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                  Shift Scheduled Medication Administration Record (MAR)
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Barcode 2-way verification (Patient Wristband + Drug Blister) before administration
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Scheduled Slots:</span>
              <span className="px-2 py-1 rounded bg-sky-50 text-[var(--color-primary-teal)] text-xs font-mono font-semibold border border-sky-200">
                08:00
              </span>
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-mono font-semibold border border-amber-200">
                14:00 (Current)
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono font-semibold border border-slate-200">
                20:00
              </span>
              <Button
                variant="primary"
                size="xs"
                onClick={() => setIsNewMedModalOpen(true)}
              >
                + Add Medication
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-slate-50 font-semibold uppercase">
                  <th className="py-2.5 px-3">Patient & Bed</th>
                  <th className="py-2.5 px-3">Drug Name & Dosage</th>
                  <th className="py-2.5 px-3">Route / Frequency</th>
                  <th className="py-2.5 px-3">Scheduled Slot</th>
                  <th className="py-2.5 px-3">Verification & Admin Status</th>
                  <th className="py-2.5 px-3">Nurse / Remarks</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {marRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--color-text-main)]">{m.patientName}</div>
                      <div className="text-[11px] text-sky-800 font-mono">
                        {m.bed} • {m.patientUhid}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{m.medication}</div>
                      <div className="text-[10px] text-slate-500">ID: {m.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">{m.route}</span>
                      <span className="text-[11px] text-slate-500 block">{m.frequency}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {m.scheduledTime}
                    </td>
                    <td className="py-3 px-3">
                      {m.status === 'Administered' && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check size={12} /> Administered
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{m.adminTime}</span>
                        </div>
                      )}
                      {m.status === 'Due Soon' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={12} /> Due Soon (14:00)
                        </span>
                      )}
                      {m.status === 'Scheduled' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          Scheduled
                        </span>
                      )}
                      {m.status === 'Withheld' && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle size={12} /> Withheld
                          </span>
                          <p className="text-[10px] text-rose-700 mt-1 max-w-xs italic">
                            "{m.withheldReason}"
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{m.adminBy}</div>
                      {m.barcodeVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 font-medium">
                          <QrCode size={11} /> Barcode Dual-Match
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {m.status === 'Due Soon' || m.status === 'Scheduled' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              setSelectedMarItem(m);
                              setMarAdminForm({
                                action: 'administer',
                                barcodeVerified: true,
                                nurseName: 'Sr. Priya M.',
                                withheldReason: ''
                              });
                              setIsMarAdminModalOpen(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <QrCode size={12} />
                            <span>Scan & Give</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSelectedMarItem(m);
                              setMarAdminForm({
                                action: 'withhold',
                                barcodeVerified: false,
                                nurseName: 'Sr. Priya M.',
                                withheldReason: 'Clinical hold: Patient NPO & BP systolic < 100.'
                              });
                              setIsMarAdminModalOpen(true);
                            }}
                          >
                            Withhold
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Logged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 21.4 Doctor Order Execution */}
      {activeSubtab === '21.4' && (
        <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-[var(--color-primary-teal)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                  CPOE Inpatient Doctor Orders Execution Queue
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Bedside sign-off for clinical procedures, wound dressings, and blood transfusion verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                1 STAT Transfusion Order Pending
              </span>
              <Button
                variant="primary"
                size="xs"
                onClick={() => setIsDoctorOrderModalOpen(true)}
              >
                + New Doctor Order
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-slate-50 font-semibold uppercase">
                  <th className="py-2.5 px-3">Order ID & Priority</th>
                  <th className="py-2.5 px-3">Bed & Patient</th>
                  <th className="py-2.5 px-3">Attending Physician</th>
                  <th className="py-2.5 px-3">Order Details & Instructions</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Execution Sign-off</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {doctorOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-mono font-semibold text-slate-800">{ord.id}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.priority === 'STAT' ? 'bg-rose-100 text-rose-800' : ord.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ord.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[var(--color-text-main)]">{ord.patient}</div>
                      <span className="text-[11px] font-mono text-sky-800">{ord.bed}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {ord.doctor}
                      <span className="text-[10px] text-slate-500 block">Placed @ {ord.timePlaced}</span>
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <div className="font-semibold text-slate-800">{ord.orderType}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{ord.description}</p>
                    </td>
                    <td className="py-3 px-3">
                      {ord.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> Executed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={12} /> Pending Action
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {ord.executedBy ? (
                        <div>
                          <div className="font-medium text-slate-800">{ord.executedBy}</div>
                          <div className="text-[10px] text-slate-500 font-mono">@{ord.execTimestamp}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting Nurse Sign-off</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ord.status === 'Pending' ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleExecuteDoctorOrder(ord.id)}
                          className="flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>Execute & Sign</span>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Signed</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 21.5 Shift Handover Notes (SBAR) */}
      {activeSubtab === '21.5' && (
        <Card className="p-5 bg-white border border-[var(--color-border-subtle)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-primary-teal)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                  Standard SBAR Shift Handover Protocol & Counter-Sign
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Situation • Background • Assessment • Recommendation for Wing B Day-to-Night Handover
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded">
                Shift: {sbarNotes.shift}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setSbarForm({
                    shift: sbarNotes.shift,
                    situation: sbarNotes.situation,
                    background: sbarNotes.background,
                    assessment: sbarNotes.assessment,
                    recommendation: sbarNotes.recommendation,
                    outgoingNurse: sbarNotes.outgoingNurse,
                    incomingNurse: sbarNotes.incomingNurse
                  });
                  setIsSbarModalOpen(true);
                }}
              >
                Edit SBAR Observations
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/20">
              <span className="text-xs font-bold text-[var(--color-primary-teal)] uppercase tracking-wider block mb-1">
                S - Situation (Current Ward State)
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{sbarNotes.situation}</p>
            </div>

            <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/20">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-1">
                B - Background (Clinical Histories & Acuity)
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{sbarNotes.background}</p>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/20">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                A - Assessment (Vitals, Drains, Lab Alerts)
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{sbarNotes.assessment}</p>
            </div>

            <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/20">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">
                R - Recommendation (Pending Orders & Night Instructions)
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{sbarNotes.recommendation}</p>
            </div>
          </div>

          {/* Signatures & Electronic Acceptance */}
          <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[11px] text-slate-500 block">Outgoing Primary Nurse</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  {sbarNotes.outgoingNurse} (Signed 14:45)
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[11px] text-slate-500 block">Incoming Night Shift Nurse</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User size={14} className="text-sky-600" />
                  {sbarNotes.incomingNurse}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {sbarNotes.isSignedOff ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Handover Accepted & Electronically Sealed</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSbarNotes(prev => ({ ...prev, isSignedOff: true }));
                    showNotification('Shift handover accepted by incoming nurse Sr. Sunaina Iyer.');
                  }}
                  className="flex items-center gap-2"
                >
                  <Check size={15} />
                  <span>Accept Handover & Take Ward Charge</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Bedside Vitals Recording Modal */}
      {showVitalsModal && (
        <Modal
          isOpen={showVitalsModal}
          onClose={() => setShowVitalsModal(false)}
          title={`Record Bedside Vitals: ${selectedPatient?.name} (${selectedPatient?.bed})`}
        >
          <form onSubmit={handleSaveVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.temp}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  Pulse (bpm)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.pulse}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  BP Systolic (mmHg)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.bpSys}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bpSys: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  BP Diastolic (mmHg)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.bpDia}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bpDia: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  Respiratory Rate (/min)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.rr}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, rr: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                  SpO2 Saturation (%)
                </label>
                <input
                  type="text"
                  required
                  value={vitalsForm.spo2}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-md focus:ring-1 focus:ring-[var(--color-primary-teal)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-main)] mb-1">
                Pain Score (0 - No Pain to 10 - Unbearable Pain)
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setVitalsForm({ ...vitalsForm, painScore: String(num) })}
                    className={`w-7 h-7 text-xs font-bold rounded ${
                      vitalsForm.painScore === String(num)
                        ? 'bg-[var(--color-primary-teal)] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowVitalsModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Record Vitals
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 1. Inpatient Care Plan Modal */}
      {isCarePlanModalOpen && (
        <Modal
          isOpen={isCarePlanModalOpen}
          onClose={() => setIsCarePlanModalOpen(false)}
          title={`Update Bedside Care Plan - ${selectedPatient?.name} (${selectedPatient?.bed})`}
          size="md"
        >
          <form onSubmit={handleSaveCarePlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fall Risk Assessment</label>
                <select
                  value={carePlanForm.fallRisk}
                  onChange={(e) => setCarePlanForm({ ...carePlanForm, fallRisk: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="High (Morse 65)">High (Morse 65 - Yellow Wristband)</option>
                  <option value="Moderate (Morse 35)">Moderate (Morse 35)</option>
                  <option value="Low (Morse 10)">Low (Morse 10)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribed Diet</label>
                <select
                  value={carePlanForm.diet}
                  onChange={(e) => setCarePlanForm({ ...carePlanForm, diet: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="NPO (Nil Per Os)">NPO (Nil Per Os)</option>
                  <option value="Diabetic Soft Diet">Diabetic Soft Diet</option>
                  <option value="Clear Fluids Only">Clear Fluids Only</option>
                  <option value="Normal Regular Diet">Normal Regular Diet</option>
                  <option value="Low Sodium Renal Diet">Low Sodium Renal Diet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hydration & IV Fluid Goal</label>
              <input
                type="text"
                required
                value={carePlanForm.hydrationGoal}
                onChange={(e) => setCarePlanForm({ ...carePlanForm, hydrationGoal: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Drain & Catheter Protocol</label>
              <textarea
                rows={2}
                value={carePlanForm.drainProtocol}
                onChange={(e) => setCarePlanForm({ ...carePlanForm, drainProtocol: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Precautions & Mobility</label>
              <textarea
                rows={2}
                value={carePlanForm.precautions}
                onChange={(e) => setCarePlanForm({ ...carePlanForm, precautions: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Primary Nurse</label>
              <input
                type="text"
                required
                value={carePlanForm.nurse}
                onChange={(e) => setCarePlanForm({ ...carePlanForm, nurse: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCarePlanModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Care Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Fluid Intake / Output Modal */}
      {isFluidModalOpen && (
        <Modal
          isOpen={isFluidModalOpen}
          onClose={() => setIsFluidModalOpen(false)}
          title={`Record Fluid Balance - ${selectedPatient?.name} (${selectedPatient?.bed})`}
          size="md"
        >
          <form onSubmit={handleSaveFluid} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={fluidForm.category}
                  onChange={(e) => setFluidForm({ ...fluidForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Intake">Fluid Intake (+)</option>
                  <option value="Output">Fluid Output / Excretion (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Recorded</label>
                <input
                  type="text"
                  required
                  value={fluidForm.time}
                  onChange={(e) => setFluidForm({ ...fluidForm, time: e.target.value })}
                  placeholder="e.g. 14:00"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route / Source</label>
                <select
                  value={fluidForm.route}
                  onChange={(e) => setFluidForm({ ...fluidForm, route: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {fluidForm.category === 'Intake' ? (
                    <>
                      <option value="IV Electrolyte Infusion 250ml">IV Electrolyte Infusion 250ml</option>
                      <option value="IV Normal Saline 0.9% 500ml">IV Normal Saline 0.9% 500ml</option>
                      <option value="Oral Water / Fluids 200ml">Oral Water / Fluids 200ml</option>
                      <option value="Ryle Tube Enteral Feed 250ml">Ryle Tube Enteral Feed 250ml</option>
                      <option value="IV Antibiotic Infusion 100ml">IV Antibiotic Infusion 100ml</option>
                    </>
                  ) : (
                    <>
                      <option value="Foley Catheter Clear Straw">Foley Catheter Clear Straw</option>
                      <option value="Surgical Wound Drain (Jackson-Pratt)">Surgical Wound Drain (Jackson-Pratt)</option>
                      <option value="Nasogastric Decompression Aspirate">Nasogastric Decompression Aspirate</option>
                      <option value="Spontaneous Voiding">Spontaneous Voiding</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Volume (ml)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="5000"
                  value={fluidForm.amount}
                  onChange={(e) => setFluidForm({ ...fluidForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color / Clarity / Clinical Notes</label>
              <input
                type="text"
                value={fluidForm.colorNotes}
                onChange={(e) => setFluidForm({ ...fluidForm, colorNotes: e.target.value })}
                placeholder="e.g. Clear pale straw, no sediment"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFluidModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Fluid Chart
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Electronic Medication Administration (eMAR) Modal */}
      {isMarAdminModalOpen && selectedMarItem && (
        <Modal
          isOpen={isMarAdminModalOpen}
          onClose={() => setIsMarAdminModalOpen(false)}
          title={`BCMA Medication Administration - ${selectedMarItem.id}`}
          size="md"
        >
          <form onSubmit={handleSaveMarAdmin} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Patient:</span>
                <span className="text-xs font-bold text-slate-800">{selectedMarItem.patientName} ({selectedMarItem.patientUhid})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Bed Location:</span>
                <span className="text-xs font-semibold text-slate-700">Bed {selectedMarItem.bed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Drug & Route:</span>
                <span className="text-xs font-bold text-sky-800">{selectedMarItem.medication} • {selectedMarItem.route}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Scheduled Slot:</span>
                <span className="text-xs font-mono font-medium text-slate-700">{selectedMarItem.scheduledTime} ({selectedMarItem.frequency})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administration Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarAdminForm({ ...marAdminForm, action: 'administer' })}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                    marAdminForm.action === 'administer'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Administer Dose
                </button>
                <button
                  type="button"
                  onClick={() => setMarAdminForm({ ...marAdminForm, action: 'withhold' })}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                    marAdminForm.action === 'withhold'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Withhold / Hold Dose
                </button>
              </div>
            </div>

            {marAdminForm.action === 'administer' ? (
              <div className="p-3 rounded-lg border border-sky-100 bg-sky-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marAdminForm.barcodeVerified}
                    onChange={(e) => setMarAdminForm({ ...marAdminForm, barcodeVerified: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Dual Barcode Verified (Patient 2D Wristband + Medication Unit Dose)
                  </span>
                </label>
                <p className="text-[11px] text-sky-700 pl-6">
                  Confirms 5 Rights: Right Patient, Right Drug, Right Dose, Right Route, Right Time.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">Clinical Justification for Withholding</label>
                <textarea
                  required
                  rows={2}
                  value={marAdminForm.withheldReason}
                  onChange={(e) => setMarAdminForm({ ...marAdminForm, withheldReason: e.target.value })}
                  placeholder="e.g. Systolic BP < 90 mmHg, patient nauseous, or NPO prior to surgery"
                  className="w-full px-3 py-2 text-xs border border-rose-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administering Nurse Sign-off</label>
              <input
                type="text"
                required
                value={marAdminForm.nurseName}
                onChange={(e) => setMarAdminForm({ ...marAdminForm, nurseName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMarAdminModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={marAdminForm.action === 'withhold' ? 'destructive' : 'primary'}
                size="sm"
              >
                {marAdminForm.action === 'withhold' ? 'Confirm Withhold' : 'Sign & Complete MAR'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. Add Medication Order to MAR Modal */}
      {isNewMedModalOpen && (
        <Modal
          isOpen={isNewMedModalOpen}
          onClose={() => setIsNewMedModalOpen(false)}
          title="Add Scheduled Inpatient Medication"
          size="md"
        >
          <form onSubmit={handleSaveNewMed} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inpatient</label>
                <select
                  value={newMedForm.patientUhid}
                  onChange={(e) => setNewMedForm({ ...newMedForm, patientUhid: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.bed} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  required
                  value={newMedForm.doctor}
                  onChange={(e) => setNewMedForm({ ...newMedForm, doctor: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name & Strength</label>
              <input
                type="text"
                required
                value={newMedForm.medication}
                onChange={(e) => setNewMedForm({ ...newMedForm, medication: e.target.value })}
                placeholder="e.g. Inj. Meropenem 1g IV"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                <select
                  value={newMedForm.route}
                  onChange={(e) => setNewMedForm({ ...newMedForm, route: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="IV Piggyback over 30m">IV Piggyback over 30m</option>
                  <option value="IV Push Slow">IV Push Slow</option>
                  <option value="Oral / Enteral">Oral / Enteral</option>
                  <option value="Subcutaneous">Subcutaneous</option>
                  <option value="IM Injection">IM Injection</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={newMedForm.frequency}
                  onChange={(e) => setNewMedForm({ ...newMedForm, frequency: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="TDS (08:00, 14:00, 20:00)">TDS (Q8H)</option>
                  <option value="BD (08:00, 20:00)">BD (Q12H)</option>
                  <option value="OD (08:00 AM)">OD (Once Daily)</option>
                  <option value="STAT (Once)">STAT (Immediate)</option>
                  <option value="Q4H PRN">Q4H PRN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Next Slot</label>
                <input
                  type="text"
                  required
                  value={newMedForm.scheduledTime}
                  onChange={(e) => setNewMedForm({ ...newMedForm, scheduledTime: e.target.value })}
                  placeholder="e.g. 14:00 PM"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewMedModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add to eMAR
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. CPOE Doctor Order Modal */}
      {isDoctorOrderModalOpen && (
        <Modal
          isOpen={isDoctorOrderModalOpen}
          onClose={() => setIsDoctorOrderModalOpen(false)}
          title="Place Inpatient CPOE Doctor Order"
          size="md"
        >
          <form onSubmit={handleSaveDoctorOrder} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bed / Patient</label>
                <select
                  value={doctorOrderForm.bed}
                  onChange={(e) => setDoctorOrderForm({ ...doctorOrderForm, bed: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {patients.map(p => (
                    <option key={p.bed} value={p.bed}>{p.bed} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Doctor</label>
                <input
                  type="text"
                  required
                  value={doctorOrderForm.doctor}
                  onChange={(e) => setDoctorOrderForm({ ...doctorOrderForm, doctor: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={doctorOrderForm.priority}
                  onChange={(e) => setDoctorOrderForm({ ...doctorOrderForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="STAT">STAT (Emergency)</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order Category</label>
              <select
                value={doctorOrderForm.orderType}
                onChange={(e) => setDoctorOrderForm({ ...doctorOrderForm, orderType: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Nursing Intervention">Nursing Intervention</option>
                <option value="Blood Transfusion">Blood Transfusion</option>
                <option value="Diagnostic Investigation">Diagnostic Investigation</option>
                <option value="Physiotherapy / Mobilization">Physiotherapy / Mobilization</option>
                <option value="Dietary Order">Dietary Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions & Orders</label>
              <textarea
                required
                rows={3}
                value={doctorOrderForm.description}
                onChange={(e) => setDoctorOrderForm({ ...doctorOrderForm, description: e.target.value })}
                placeholder="Specific clinical steps, monitoring parameters, or transfusion requirements"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDoctorOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Transmit Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. SBAR Shift Handover Modal */}
      {isSbarModalOpen && (
        <Modal
          isOpen={isSbarModalOpen}
          onClose={() => setIsSbarModalOpen(false)}
          title="Compose / Edit SBAR Shift Handover"
          size="lg"
        >
          <form onSubmit={handleSaveSbar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duty Shift</label>
              <select
                value={sbarForm.shift}
                onChange={(e) => setSbarForm({ ...sbarForm, shift: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Day Shift (07:00 - 15:00)">Day Shift (07:00 - 15:00)</option>
                <option value="Evening Shift (15:00 - 23:00)">Evening Shift (15:00 - 23:00)</option>
                <option value="Night Shift (23:00 - 07:00)">Night Shift (23:00 - 07:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">S - Situation (Census & Immediate Risks)</label>
              <textarea
                required
                rows={2}
                value={sbarForm.situation}
                onChange={(e) => setSbarForm({ ...sbarForm, situation: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 mb-1">B - Background (Clinical History & Pre-existing)</label>
              <textarea
                required
                rows={2}
                value={sbarForm.background}
                onChange={(e) => setSbarForm({ ...sbarForm, background: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-700 mb-1">A - Assessment (Current Findings & Response to Rx)</label>
              <textarea
                required
                rows={2}
                value={sbarForm.assessment}
                onChange={(e) => setSbarForm({ ...sbarForm, assessment: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">R - Recommendation (Pending Labs, Transfusions, Action Plan)</label>
              <textarea
                required
                rows={2}
                value={sbarForm.recommendation}
                onChange={(e) => setSbarForm({ ...sbarForm, recommendation: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relieving Nurse (Sign-off)</label>
                <input
                  type="text"
                  required
                  value={sbarForm.outgoingNurse}
                  onChange={(e) => setSbarForm({ ...sbarForm, outgoingNurse: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Taking Over Nurse (Acknowledgement)</label>
                <input
                  type="text"
                  required
                  value={sbarForm.incomingNurse}
                  onChange={(e) => setSbarForm({ ...sbarForm, incomingNurse: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsSbarModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Sign Handover
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default NursingView;
