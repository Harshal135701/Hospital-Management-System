const pool = require("../../config/db");

// In-Memory Master Data Store for Inpatient Nursing Operations
const wardPatients = [
  {
    id: "P-101",
    uhid: "UHID-88210",
    name: "Ramesh Patil",
    age: 54,
    gender: "Male",
    bed: "Bed 201-A",
    wing: "General Ward - Wing A",
    floor: "2nd Floor",
    admissionDate: "2026-10-28",
    doctor: "Dr. P. Sen",
    specialty: "Surgical Gastroenterology",
    diagnosis: "Post-op Laparoscopic Cholecystectomy (POD-1)",
    diet: "Soft Bland Diet",
    fallRisk: "Moderate (Score 45)",
    carePlan: "Post-op surgical monitoring, wound dressing daily, mobilize with assistance, titrate analgesia",
    primaryNurse: "Sister Mary",
    status: "Stable",
    barcode: "BRC-P101-88210",
    vitalAlert: null,
    cumulativeFluidBalance: "+450 mL (Balanced)"
  },
  {
    id: "P-102",
    uhid: "UHID-88214",
    name: "Sunita Rao",
    age: 68,
    gender: "Female",
    bed: "Bed 202-B",
    wing: "General Ward - Wing A",
    floor: "2nd Floor",
    admissionDate: "2026-10-29",
    doctor: "Dr. N. Joshi",
    specialty: "Pulmonology & Critical Care",
    diagnosis: "Acute Exacerbation of COPD with Type II Resp Failure",
    diet: "Diabetic Salt Restricted",
    fallRisk: "High (Score 70)",
    carePlan: "Continuous O2 therapy 2L via nasal cannula, maintain SpO2 > 92%, Duolin nebulization q6h, monitor ABG",
    primaryNurse: "Sister Sneha",
    status: "Critical Alert - SpO2 91%",
    barcode: "BRC-P102-88214",
    vitalAlert: "Hypoxemia (SpO2 91% on room air)",
    cumulativeFluidBalance: "+120 mL (Balanced)"
  },
  {
    id: "P-103",
    uhid: "UHID-88218",
    name: "Rajesh Verma",
    age: 42,
    gender: "Male",
    bed: "Bed 203-A",
    wing: "General Ward - Wing A",
    floor: "2nd Floor",
    admissionDate: "2026-10-30",
    doctor: "Dr. V. Singhal",
    specialty: "Internal Medicine",
    diagnosis: "Acute Alcoholic Pancreatitis with Dehydration",
    diet: "Strict NPO (Nil Per Os)",
    fallRisk: "Low (Score 20)",
    carePlan: "Strict NPO, vigorous IV fluid resuscitation Ringer Lactate 120 mL/hr, strict hourly I/O charting, IV PPI",
    primaryNurse: "Sister Sneha",
    status: "Fluid Deficit Alert",
    barcode: "BRC-P103-88218",
    vitalAlert: "Tachycardia (Pulse 112 bpm)",
    cumulativeFluidBalance: "-680 mL (Negative Balance Alert)"
  },
  {
    id: "P-104",
    uhid: "UHID-88225",
    name: "Ananya Sharma",
    age: 29,
    gender: "Female",
    bed: "Bed 301-B",
    wing: "ICU Step-Down Unit",
    floor: "3rd Floor",
    admissionDate: "2026-10-29",
    doctor: "Dr. S. K. Roy",
    specialty: "Obstetrics & Gynecology",
    diagnosis: "Emergency LSCS with Postpartum Hemorrhage (Stabilized)",
    diet: "High Protein Lactating Diet",
    fallRisk: "Moderate (Score 40)",
    carePlan: "Uterine fundal tone check q2h, lochia output quantification, IV Cefuroxime 1.5g BD, monitor Hb",
    primaryNurse: "Sister Priya",
    status: "Stable",
    barcode: "BRC-P104-88225",
    vitalAlert: null,
    cumulativeFluidBalance: "+820 mL (Positive Retention)"
  },
  {
    id: "P-105",
    uhid: "UHID-88231",
    name: "Farooq Merchant",
    age: 71,
    gender: "Male",
    bed: "Bed 302-A",
    wing: "ICU Step-Down Unit",
    floor: "3rd Floor",
    admissionDate: "2026-10-27",
    doctor: "Dr. N. Joshi",
    specialty: "Nephrology & Critical Care",
    diagnosis: "Urosepsis with Acute Kidney Injury (KDIGO Stage 2)",
    diet: "Renal Diet (Low Potassium & Sodium)",
    fallRisk: "High (Score 80)",
    carePlan: "Foley catheter hourly urometer check (Target > 30 mL/hr), restrict IV fluids to 80 mL/hr, daily creatinine",
    primaryNurse: "Sister Priya",
    status: "Critical Alert - Oliguria",
    barcode: "BRC-P105-88231",
    vitalAlert: "Oliguria (< 25 mL/hr for last 3 hours)",
    cumulativeFluidBalance: "+1,450 mL (Fluid Overload Warning)"
  },
  {
    id: "P-106",
    uhid: "UHID-88240",
    name: "Geeta Deshpande",
    age: 61,
    gender: "Female",
    bed: "Bed 208-B",
    wing: "General Ward - Wing B",
    floor: "2nd Floor",
    admissionDate: "2026-10-28",
    doctor: "Dr. P. Sen",
    specialty: "General & Vascular Surgery",
    diagnosis: "Type 2 DM with Infected Diabetic Foot Ulcer (Wagner Grade 3)",
    diet: "Diabetic 1600 kcal",
    fallRisk: "Moderate (Score 50)",
    carePlan: "Daily aseptic wound debridement and silver dressing, regular insulin sliding scale AC & HS, offload right limb",
    primaryNurse: "Sister Sneha",
    status: "Stable",
    barcode: "BRC-P106-88240",
    vitalAlert: null,
    cumulativeFluidBalance: "+210 mL (Balanced)"
  }
];

// Vitals History Log
const vitalsHistory = [
  {
    id: "vit-001",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    temperature: 98.6,
    pulse: 76,
    bloodPressureSystolic: 124,
    bloodPressureDiastolic: 80,
    respiratoryRate: 16,
    spO2: 98,
    painScore: 3,
    recordedAt: "2026-10-31 08:30 AM",
    recordedBy: "Sister Mary",
    isAbnormal: false,
    alertMessage: null
  },
  {
    id: "vit-002",
    patientId: "P-102",
    uhid: "UHID-88214",
    patientName: "Sunita Rao",
    bed: "Bed 202-B",
    temperature: 99.8,
    pulse: 98,
    bloodPressureSystolic: 142,
    bloodPressureDiastolic: 88,
    respiratoryRate: 24,
    spO2: 91,
    painScore: 2,
    recordedAt: "2026-10-31 08:15 AM",
    recordedBy: "Sister Sneha",
    isAbnormal: true,
    alertMessage: "Low SpO2 (91%) & Tachypnea (RR 24)"
  },
  {
    id: "vit-003",
    patientId: "P-103",
    uhid: "UHID-88218",
    patientName: "Rajesh Verma",
    bed: "Bed 203-A",
    temperature: 100.4,
    pulse: 112,
    bloodPressureSystolic: 110,
    bloodPressureDiastolic: 72,
    respiratoryRate: 20,
    spO2: 97,
    painScore: 7,
    recordedAt: "2026-10-31 08:45 AM",
    recordedBy: "Sister Sneha",
    isAbnormal: true,
    alertMessage: "Severe Pain (7/10) & Tachycardia (112 bpm)"
  },
  {
    id: "vit-004",
    patientId: "P-104",
    uhid: "UHID-88225",
    patientName: "Ananya Sharma",
    bed: "Bed 301-B",
    temperature: 98.4,
    pulse: 82,
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 76,
    respiratoryRate: 18,
    spO2: 99,
    painScore: 4,
    recordedAt: "2026-10-31 09:00 AM",
    recordedBy: "Sister Priya",
    isAbnormal: false,
    alertMessage: null
  },
  {
    id: "vit-005",
    patientId: "P-105",
    uhid: "UHID-88231",
    patientName: "Farooq Merchant",
    bed: "Bed 302-A",
    temperature: 101.2,
    pulse: 104,
    bloodPressureSystolic: 168,
    bloodPressureDiastolic: 96,
    respiratoryRate: 22,
    spO2: 94,
    painScore: 5,
    recordedAt: "2026-10-31 09:15 AM",
    recordedBy: "Sister Priya",
    isAbnormal: true,
    alertMessage: "Fever (101.2°F), Hypertension (168/96) & Tachycardia (104 bpm)"
  }
];

// Intake-Output Charting Logs
const intakeOutputLogs = [
  {
    id: "io-001",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    shift: "Morning Shift (08:00 - 14:00)",
    date: "2026-10-31",
    intakeOral: 400,
    intakeIv: 800,
    intakeEnteral: 0,
    totalIntake: 1200,
    outputUrine: 650,
    outputDrain: 100,
    outputVomitus: 0,
    totalOutput: 750,
    balance: 450,
    status: "Adequate Hydration",
    recordedBy: "Sister Mary",
    timestamp: "2026-10-31 12:00 PM",
    notes: "Abdominal drain serosanguinous 100 mL. Urine clear amber."
  },
  {
    id: "io-002",
    patientId: "P-102",
    uhid: "UHID-88214",
    patientName: "Sunita Rao",
    bed: "Bed 202-B",
    shift: "Morning Shift (08:00 - 14:00)",
    date: "2026-10-31",
    intakeOral: 300,
    intakeIv: 500,
    intakeEnteral: 0,
    totalIntake: 800,
    outputUrine: 680,
    outputDrain: 0,
    outputVomitus: 0,
    totalOutput: 680,
    balance: 120,
    status: "Balanced",
    recordedBy: "Sister Sneha",
    timestamp: "2026-10-31 12:30 PM",
    notes: "Oral sips tolerated well without nausea."
  },
  {
    id: "io-003",
    patientId: "P-103",
    uhid: "UHID-88218",
    patientName: "Rajesh Verma",
    bed: "Bed 203-A",
    shift: "Morning Shift (08:00 - 14:00)",
    date: "2026-10-31",
    intakeOral: 0,
    intakeIv: 1000,
    intakeEnteral: 0,
    totalIntake: 1000,
    outputUrine: 1100,
    outputDrain: 0,
    outputVomitus: 580,
    totalOutput: 1680,
    balance: -680,
    status: "Negative Balance Alert",
    recordedBy: "Sister Sneha",
    timestamp: "2026-10-31 01:00 PM",
    notes: "NG aspirate bilious 580 mL. Ringer Lactate rate stepped up to 150 mL/hr as ordered."
  },
  {
    id: "io-004",
    patientId: "P-105",
    uhid: "UHID-88231",
    patientName: "Farooq Merchant",
    bed: "Bed 302-A",
    shift: "Morning Shift (08:00 - 14:00)",
    date: "2026-10-31",
    intakeOral: 150,
    intakeIv: 1500,
    intakeEnteral: 0,
    totalIntake: 1650,
    outputUrine: 200,
    outputDrain: 0,
    outputVomitus: 0,
    totalOutput: 200,
    balance: 1450,
    status: "Fluid Overload Alert (Oliguria)",
    recordedBy: "Sister Priya",
    timestamp: "2026-10-31 01:15 PM",
    notes: "Low urine output 200 mL in 5 hours (< 40 mL/hr). Reported to Dr. Joshi. Inj Lasix 20mg IV ordered."
  }
];

// Medication Administration Records (MAR)
const marSchedule = [
  {
    id: "mar-101",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    medication: "Inj. Pantoprazole 40 mg",
    route: "IV Bolus",
    frequency: "Once Daily (OD)",
    scheduledTime: "08:00 AM",
    shift: "Morning Shift",
    status: "Administered",
    barcodeVerified: true,
    administeredAt: "2026-10-31 08:10 AM",
    administeredBy: "Sister Mary",
    withheldReason: null,
    notes: "Given slowly IV over 2 minutes."
  },
  {
    id: "mar-102",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    medication: "Inj. Cefoperazone + Sulbactam 1.5 g",
    route: "IV Infusion in 100mL NS",
    frequency: "Twice Daily (BD)",
    scheduledTime: "08:00 AM",
    shift: "Morning Shift",
    status: "Administered",
    barcodeVerified: true,
    administeredAt: "2026-10-31 08:25 AM",
    administeredBy: "Sister Mary",
    withheldReason: null,
    notes: "Skin test negative. Infused over 30 minutes without reaction."
  },
  {
    id: "mar-103",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    medication: "Inj. Paracetamol 1 g IV",
    route: "IV Infusion",
    frequency: "TDS / SOS",
    scheduledTime: "02:00 PM",
    shift: "Afternoon Shift",
    status: "Due / Pending",
    barcodeVerified: false,
    administeredAt: null,
    administeredBy: null,
    withheldReason: null,
    notes: "Scheduled for post-op analgesia."
  },
  {
    id: "mar-104",
    patientId: "P-102",
    uhid: "UHID-88214",
    patientName: "Sunita Rao",
    bed: "Bed 202-B",
    medication: "Nebulization Duolin (Levosalbutamol + Ipratropium)",
    route: "Inhalation via O2 mask",
    frequency: "Every 6 Hours (Q6H)",
    scheduledTime: "08:00 AM",
    shift: "Morning Shift",
    status: "Administered",
    barcodeVerified: true,
    administeredAt: "2026-10-31 08:05 AM",
    administeredBy: "Sister Sneha",
    withheldReason: null,
    notes: "Administered with 4L O2 flow. Patient reports improved breathlessness."
  },
  {
    id: "mar-105",
    patientId: "P-102",
    uhid: "UHID-88214",
    patientName: "Sunita Rao",
    bed: "Bed 202-B",
    medication: "Tab. Amlodipine 5 mg",
    route: "Oral (PO)",
    frequency: "Once Daily (OD)",
    scheduledTime: "08:00 AM",
    shift: "Morning Shift",
    status: "Withheld",
    barcodeVerified: true,
    administeredAt: null,
    administeredBy: null,
    withheldReason: "Patient BP low (88/56 mmHg < 90/60 threshold). Doctor notified.",
    withheldBy: "Sister Sneha",
    notes: "Dose held as per clinical protocol."
  },
  {
    id: "mar-106",
    patientId: "P-103",
    uhid: "UHID-88218",
    patientName: "Rajesh Verma",
    bed: "Bed 203-A",
    medication: "Inj. Tramadol 50 mg in 100mL NS",
    route: "IV Infusion",
    frequency: "SOS / Pain > 6",
    scheduledTime: "09:00 AM",
    shift: "Morning Shift",
    status: "Administered",
    barcodeVerified: true,
    administeredAt: "2026-10-31 09:05 AM",
    administeredBy: "Sister Sneha",
    withheldReason: null,
    notes: "Given for severe epigastric pain (Score 7). Pain score reduced to 3 at 45 min."
  },
  {
    id: "mar-107",
    patientId: "P-105",
    uhid: "UHID-88231",
    patientName: "Farooq Merchant",
    bed: "Bed 302-A",
    medication: "Inj. Furosemide (Lasix) 20 mg",
    route: "IV Push",
    frequency: "STAT",
    scheduledTime: "01:30 PM",
    shift: "Afternoon Shift",
    status: "Due / Pending",
    barcodeVerified: false,
    administeredAt: null,
    administeredBy: null,
    withheldReason: null,
    notes: "STAT dose ordered for fluid retention and oliguria."
  }
];

// Inpatient Doctor Orders Execution Queue
const doctorOrders = [
  {
    id: "ord-201",
    patientId: "P-101",
    uhid: "UHID-88210",
    patientName: "Ramesh Patil",
    bed: "Bed 201-A",
    orderType: "Nursing Procedure",
    title: "Change Surgical Dressing & Wound Inspection",
    details: "Sterile gauze dressing change for 4 port sites under aseptic precautions. Inspect for hematoma or erythema.",
    orderedBy: "Dr. P. Sen",
    orderedAt: "2026-10-31 07:30 AM",
    priority: "Routine",
    status: "Pending",
    executedBy: null,
    executedAt: null,
    executionNotes: null
  },
  {
    id: "ord-202",
    patientId: "P-102",
    uhid: "UHID-88214",
    patientName: "Sunita Rao",
    bed: "Bed 202-B",
    orderType: "Diagnostic Check",
    title: "Arterial Blood Gas (ABG) Analysis on 2L O2",
    details: "Collect heparinized radial arterial blood sample on 2L O2 and send immediately on crushed ice to central lab.",
    orderedBy: "Dr. N. Joshi",
    orderedAt: "2026-10-31 08:00 AM",
    priority: "Urgent",
    status: "Completed",
    executedBy: "Sister Sneha",
    executedAt: "2026-10-31 08:40 AM",
    executionNotes: "Right radial artery puncture successful on first attempt. Direct pressure applied for 10 minutes. Sample sent to lab."
  },
  {
    id: "ord-203",
    patientId: "P-103",
    uhid: "UHID-88218",
    patientName: "Rajesh Verma",
    bed: "Bed 203-A",
    orderType: "Nursing Intervention",
    title: "Nasogastric Tube Aspiration & Drainage Charting",
    details: "Check Ryle's tube placement by auscultation. Aspirate stomach contents every 2 hours and record volume & character.",
    orderedBy: "Dr. V. Singhal",
    orderedAt: "2026-10-31 08:30 AM",
    priority: "Urgent",
    status: "In Progress",
    executedBy: "Sister Sneha",
    executedAt: "2026-10-31 09:00 AM",
    executionNotes: "Tube position confirmed at 55 cm. Free gravity drainage running into bile bag."
  },
  {
    id: "ord-204",
    patientId: "P-104",
    uhid: "UHID-88225",
    patientName: "Ananya Sharma",
    bed: "Bed 301-B",
    orderType: "Transfusion / Blood Bank",
    title: "Transfuse PRBC 1 Unit (Compatible Bag BLD-2026-0899)",
    details: "Pre-transfusion vitals, dual nurse bedside wristband verification, start at 15 drops/min for first 15 min, complete within 3 hours.",
    orderedBy: "Dr. S. K. Roy",
    orderedAt: "2026-10-31 09:30 AM",
    priority: "STAT / Critical",
    status: "In Progress",
    executedBy: "Sister Priya & Sister Mary",
    executedAt: "2026-10-31 10:00 AM",
    executionNotes: "Dual verification with Sister Mary complete. Blood unit warming checked. Baseline BP 118/76, pulse 82, temp 98.4°F."
  },
  {
    id: "ord-205",
    patientId: "P-105",
    uhid: "UHID-88231",
    patientName: "Farooq Merchant",
    bed: "Bed 302-A",
    orderType: "Catheter Care & Output",
    title: "Foley Catheter 16 Fr Replacement & Hourly Urometer",
    details: "Aseptic Foley catheter replacement with 10mL sterile water in balloon. Connect to closed urometer drainage system.",
    orderedBy: "Dr. N. Joshi",
    orderedAt: "2026-10-31 07:00 AM",
    priority: "Urgent",
    status: "Completed",
    executedBy: "Sister Priya",
    executedAt: "2026-10-31 07:45 AM",
    executionNotes: "16 Fr silicone Foley inserted smoothly under sterile precautions. 150 mL concentrated cloudy urine drained initially."
  },
  {
    id: "ord-206",
    patientId: "P-106",
    uhid: "UHID-88240",
    patientName: "Geeta Deshpande",
    bed: "Bed 208-B",
    orderType: "Capillary Blood Glucose (CBG)",
    title: "Check 6-Point CBG Profile with Sliding Scale Insulin",
    details: "Check fingerstick CBG at 07:30, 11:30, 15:30, 19:30, 23:30, 03:30. Administer Actrapid insulin as per sliding scale chart.",
    orderedBy: "Dr. P. Sen",
    orderedAt: "2026-10-31 07:00 AM",
    priority: "Routine",
    status: "In Progress",
    executedBy: "Sister Sneha",
    executedAt: "2026-10-31 07:30 AM",
    executionNotes: "Fasting CBG 184 mg/dL. 4 Units regular insulin administered SC over left abdomen."
  }
];

// Shift Handover SBAR Documentation
const shiftHandovers = [
  {
    id: "ho-301",
    wing: "General Ward - Wing A",
    shiftType: "Night (23:00) → Morning (07:00)",
    handoverDate: "2026-10-31",
    outgoingNurse: "Sister Jennifer D'Souza",
    incomingNurse: "Sister Mary",
    censusCount: 18,
    criticalCount: 2,
    sbarSituation: "18 Patients currently admitted in Wing A. 2 critical alerts: Sunita Rao (Bed 202-B) desaturating on room air and Rajesh Verma (Bed 203-A) severe pancreatitis with fluid deficit.",
    sbarBackground: "Sunita Rao admitted 2 days ago with COPD flare. ABG ordered. Rajesh Verma strict NPO with NG tube in place; required 2 doses of IV analgesia overnight.",
    sbarAssessment: "Bed 202-B needs continuous SpO2 monitoring and prompt nebulization. Bed 203-A needs strict fluid balance recording and vigilance for epigastric guarding.",
    sbarRecommendation: "Verify morning antibiotic administrations (Ceftriaxone & Metronidazole). Assist surgical team with POD-1 dressing for Ramesh Patil (Bed 201-A).",
    abnormalVitalsSummary: "Bed 202-B: SpO2 91% • Bed 203-A: Pulse 112 bpm",
    pendingOrdersSummary: "1 Surgical dressing change • 1 ABG blood sample dispatch",
    highRiskPatientsSummary: "2 High Fall Risk patients identified with yellow wristbands.",
    outgoingSigned: true,
    incomingSigned: true,
    acceptedAt: "2026-10-31 07:15 AM",
    acceptanceNotes: "Handover accepted after physical bedside walk with Sister Jennifer."
  }
];

const NursingRepository = {
  // 21.1 Dashboard & Ward Census
  async getDashboard() {
    const totalCensus = wardPatients.length;
    const criticalAlerts = wardPatients.filter(p => p.vitalAlert !== null).length;
    const pendingMarDoses = marSchedule.filter(m => m.status === "Due / Pending").length;
    const pendingOrders = doctorOrders.filter(o => o.status === "Pending" || o.status === "In Progress").length;

    return {
      totalCensus,
      activeBeds: totalCensus,
      capacity: 24,
      occupancyPercent: Math.round((totalCensus / 24) * 100),
      criticalAlerts,
      pendingMarDoses,
      pendingOrders,
      shiftInfo: {
        activeShift: "Day / Morning Shift",
        shiftTiming: "07:00 AM - 03:00 PM",
        chargeNurse: "Sister Mary, RN (Senior Incharge)",
        wardWing: "General Ward - Wing A & Step-Down Unit"
      }
    };
  },

  async getPatients(wing = "ALL") {
    if (!wing || wing === "ALL") {
      return wardPatients;
    }
    return wardPatients.filter(p => p.wing.toLowerCase().includes(wing.toLowerCase()));
  },

  async getPatientById(id) {
    return wardPatients.find(p => p.id === id || p.uhid === id);
  },

  // 21.2 Vitals & Intake-Output
  async getVitals(patientId = null) {
    if (!patientId || patientId === "ALL") {
      return vitalsHistory;
    }
    return vitalsHistory.filter(v => v.patientId === patientId || v.uhid === patientId);
  },

  async recordVitals(data) {
    const patient = wardPatients.find(p => p.id === data.patientId || p.uhid === data.patientId);
    
    // Evaluate clinical alert criteria
    const isAbnormal = 
      data.temperature > 100.4 || data.temperature < 95.0 ||
      data.pulse > 110 || data.pulse < 55 ||
      data.bloodPressureSystolic > 160 || data.bloodPressureSystolic < 90 ||
      data.spO2 < 92 ||
      data.painScore >= 7;

    let alertMessage = null;
    if (isAbnormal) {
      const issues = [];
      if (data.temperature > 100.4) issues.push(`Fever (${data.temperature}°F)`);
      if (data.pulse > 110) issues.push(`Tachycardia (${data.pulse} bpm)`);
      if (data.pulse < 55) issues.push(`Bradycardia (${data.pulse} bpm)`);
      if (data.bloodPressureSystolic > 160) issues.push(`Hypertension (${data.bloodPressureSystolic}/${data.bloodPressureDiastolic})`);
      if (data.bloodPressureSystolic < 90) issues.push(`Hypotension (${data.bloodPressureSystolic}/${data.bloodPressureDiastolic})`);
      if (data.spO2 < 92) issues.push(`Hypoxia (${data.spO2}%)`);
      if (data.painScore >= 7) issues.push(`Severe Pain (${data.painScore}/10)`);
      alertMessage = issues.join(", ");
    }

    const newRecord = {
      id: `vit-${Date.now()}`,
      patientId: data.patientId,
      uhid: patient?.uhid || data.patientId,
      patientName: patient?.name || "Patient",
      bed: patient?.bed || "Bed 201-A",
      temperature: data.temperature,
      pulse: data.pulse,
      bloodPressureSystolic: data.bloodPressureSystolic,
      bloodPressureDiastolic: data.bloodPressureDiastolic,
      respiratoryRate: data.respiratoryRate,
      spO2: data.spO2,
      painScore: data.painScore,
      recordedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today",
      recordedBy: data.recordedBy || "Staff Nurse on Duty",
      isAbnormal,
      alertMessage
    };

    vitalsHistory.unshift(newRecord);

    // Update patient vital alert status
    if (patient) {
      patient.vitalAlert = alertMessage;
      patient.status = isAbnormal ? `Alert: ${alertMessage}` : "Stable";
    }

    return newRecord;
  },

  async getIntakeOutput(patientId = null) {
    if (!patientId || patientId === "ALL") {
      return intakeOutputLogs;
    }
    return intakeOutputLogs.filter(i => i.patientId === patientId || i.uhid === patientId);
  },

  async recordIntakeOutput(data) {
    const patient = wardPatients.find(p => p.id === data.patientId || p.uhid === data.patientId);
    const totalIntake = (Number(data.intakeOral) || 0) + (Number(data.intakeIv) || 0) + (Number(data.intakeEnteral) || 0);
    const totalOutput = (Number(data.outputUrine) || 0) + (Number(data.outputDrain) || 0) + (Number(data.outputVomitus) || 0);
    const balance = totalIntake - totalOutput;

    let status = "Balanced";
    if (balance > 1000) {
      status = "Fluid Retention / Overload Alert";
    } else if (balance < -500) {
      status = "Fluid Deficit Alert";
    }

    const newLog = {
      id: `io-${Date.now()}`,
      patientId: data.patientId,
      uhid: patient?.uhid || data.patientId,
      patientName: patient?.name || "Patient",
      bed: patient?.bed || "Bed 201-A",
      shift: data.shift || "Day Shift (08:00 - 16:00)",
      date: new Date().toISOString().split("T")[0],
      intakeOral: Number(data.intakeOral) || 0,
      intakeIv: Number(data.intakeIv) || 0,
      intakeEnteral: Number(data.intakeEnteral) || 0,
      totalIntake,
      outputUrine: Number(data.outputUrine) || 0,
      outputDrain: Number(data.outputDrain) || 0,
      outputVomitus: Number(data.outputVomitus) || 0,
      totalOutput,
      balance,
      status,
      recordedBy: data.recordedBy || "Staff Nurse on Duty",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today",
      notes: data.notes || ""
    };

    intakeOutputLogs.unshift(newLog);

    if (patient) {
      patient.cumulativeFluidBalance = `${balance >= 0 ? "+" : ""}${balance} mL (${status})`;
    }

    return newLog;
  },

  // 21.3 Medication Administration Record (MAR)
  async getMar(patientId = null) {
    if (!patientId || patientId === "ALL") {
      return marSchedule;
    }
    return marSchedule.filter(m => m.patientId === patientId || m.uhid === patientId);
  },

  async administerMedication(data) {
    const item = marSchedule.find(m => m.id === data.marId);
    if (!item) {
      throw new Error(`MAR record with ID ${data.marId} not found.`);
    }

    item.status = "Administered";
    item.barcodeVerified = data.barcodeVerified !== undefined ? data.barcodeVerified : true;
    item.administeredAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today";
    item.administeredBy = data.administeredBy || "Staff Nurse on Duty";
    item.withheldReason = null;
    if (data.notes) {
      item.notes = data.notes;
    }

    return item;
  },

  async withholdMedication(data) {
    const item = marSchedule.find(m => m.id === data.marId);
    if (!item) {
      throw new Error(`MAR record with ID ${data.marId} not found.`);
    }

    item.status = "Withheld";
    item.withheldReason = data.withheldReason;
    item.withheldBy = data.withheldBy || "Staff Nurse on Duty";
    item.administeredAt = null;
    if (data.notes) {
      item.notes = data.notes;
    }

    return item;
  },

  // 21.4 Doctor Order Execution
  async getDoctorOrders(patientId = null) {
    if (!patientId || patientId === "ALL") {
      return doctorOrders;
    }
    return doctorOrders.filter(o => o.patientId === patientId || o.uhid === patientId);
  },

  async executeDoctorOrder(data) {
    const order = doctorOrders.find(o => o.id === data.orderId);
    if (!order) {
      throw new Error(`Doctor order with ID ${data.orderId} not found.`);
    }

    order.status = "Completed";
    order.executedBy = data.completedBy || "Staff Nurse on Duty";
    order.executedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today";
    order.executionNotes = data.notes || data.executionDetails || "Procedure executed according to hospital clinical protocol.";

    return order;
  },

  // 21.5 Shift Handover Notes
  async getHandovers(wing = "ALL") {
    if (!wing || wing === "ALL") {
      return shiftHandovers;
    }
    return shiftHandovers.filter(h => h.wing.toLowerCase().includes(wing.toLowerCase()));
  },

  async createHandover(data) {
    const newHandover = {
      id: `ho-${Date.now()}`,
      wing: data.wing,
      shiftType: data.shiftType,
      handoverDate: new Date().toISOString().split("T")[0],
      outgoingNurse: data.outgoingNurse,
      incomingNurse: data.incomingNurse,
      censusCount: wardPatients.filter(p => p.wing.toLowerCase().includes(data.wing.toLowerCase())).length || 6,
      criticalCount: wardPatients.filter(p => p.wing.toLowerCase().includes(data.wing.toLowerCase()) && p.vitalAlert !== null).length,
      sbarSituation: data.sbarSituation,
      sbarBackground: data.sbarBackground,
      sbarAssessment: data.sbarAssessment,
      sbarRecommendation: data.sbarRecommendation,
      abnormalVitalsSummary: data.abnormalVitalsSummary || "Vitals within acceptable limits",
      pendingOrdersSummary: data.pendingOrdersSummary || "No pending STAT orders",
      highRiskPatientsSummary: data.highRiskPatientsSummary || "Standard fall precautions in place",
      outgoingSigned: true,
      incomingSigned: false,
      acceptedAt: null,
      acceptanceNotes: null
    };

    shiftHandovers.unshift(newHandover);
    return newHandover;
  },

  async acceptHandover(id, data) {
    const handover = shiftHandovers.find(h => h.id === id);
    if (!handover) {
      throw new Error(`Shift handover record with ID ${id} not found.`);
    }

    handover.incomingSigned = true;
    handover.acceptedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today";
    handover.acceptanceNotes = data.handoverNotes || `Electronically signed and verified by ${data.incomingNurseSignature}`;

    return handover;
  }
};

module.exports = NursingRepository;
