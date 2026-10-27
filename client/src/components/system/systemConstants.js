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
  AlertTriangle
} from 'lucide-react';

export const SYSTEM_SUBMODULES = [
  {
    id: '29.1',
    label: 'User Sessions',
    shortLabel: 'User Sessions',
    icon: Users,
    badge: 'Live Sessions',
    description: 'Monitor active staff workstations, IP addresses, browser agents, and enforce remote session termination.',
    subsubmodules: [
      { id: '29.1.1', label: 'Active Staff Live Sessions & Device IPs' },
      { id: '29.1.2', label: 'Workstation Security & Remote Session Termination' },
      { id: '29.1.3', label: 'Concurrent Login Enforcement & Idle Timeout Rules' }
    ]
  },
  {
    id: '29.2',
    label: 'Audit Trails',
    shortLabel: 'Audit Trails',
    icon: ShieldCheck,
    badge: 'Audit Logs',
    description: 'Comprehensive immutable logs of user authentication, privilege alterations, drug dose updates, and diagnostic changes.',
    subsubmodules: [
      { id: '29.2.1', label: 'System-Level Audit Trail (Authentication & Permissions)' },
      { id: '29.2.2', label: 'Clinical Audit Trail (Prescriptions, Vitals & EMR Changes)' },
      { id: '29.2.3', label: 'Immutable Compliance Export & Hash Verification' }
    ]
  },
  {
    id: '29.3',
    label: 'Department & Module Master Setup',
    shortLabel: 'Department Master Setup',
    icon: Settings,
    badge: 'Master Setup',
    description: 'Centralized configuration for all 32 hospital modules, sequence numbering prefixes, tax codes, and default operating rules.',
    subsubmodules: [
      { id: '29.3.1', label: 'Department Operational Parameters & Tax Setup' },
      { id: '29.3.2', label: 'Document Sequence Numbering (UHID, Invoices, Indents)' },
      { id: '29.3.3', label: 'Clinical Thresholds & Auto-Approval Rules' }
    ]
  },
  {
    id: '29.4',
    label: 'Event Configuration',
    shortLabel: 'Event Configuration',
    icon: Bell,
    badge: 'Event Triggers',
    description: 'Configure automated SMS, WhatsApp, and audio chime triggers for critical events like panic lab alerts and triage level 1.',
    subsubmodules: [
      { id: '29.4.1', label: 'Clinical Alert Events & Urgent Sound Triggers' },
      { id: '29.4.2', label: 'SMS, WhatsApp & Email Notification Dispatch Templates' },
      { id: '29.4.3', label: 'Multi-Tier Escalation Time Matrix' }
    ]
  },
  {
    id: '29.5',
    label: 'Role-Based Access Control (RBAC)',
    shortLabel: 'RBAC & Permissions',
    icon: Key,
    badge: 'Access Control',
    description: 'Manage staff roles, granular action permissions across all 32 modules, and institutional access inheritance.',
    subsubmodules: [
      { id: '29.5.1', label: 'Staff Role Hierarchy & Privilege Definition' },
      { id: '29.5.2', label: '32-Module Granular Action Permission Matrix' },
      { id: '29.5.3', label: 'User Role Assignment & Policy Inheritance' }
    ]
  }
];

export const INITIAL_SESSIONS = [
  {
    id: 'SESS-2026-901',
    username: 'dr.anand.kulkarni',
    fullName: 'Dr. Anand Kulkarni',
    role: 'Senior Consultant Physician',
    department: 'OPD & General Medicine',
    workstationIp: '192.168.10.45',
    deviceBrowser: 'Chrome 122 / Windows 11 Workstation',
    terminalLocation: 'OPD Cabin 104 (Main Campus)',
    loginTimestamp: '27 Oct 2026, 08:30 IST',
    lastPing: 'Just now (12s ago)',
    status: 'Active'
  },
  {
    id: 'SESS-2026-902',
    username: 'dr.priya.deshmukh',
    fullName: 'Dr. Priya Deshmukh',
    role: 'Chief Embryologist',
    department: 'IVF & Fertility Suite',
    workstationIp: '192.168.12.18',
    deviceBrowser: 'Edge 121 / Medical Cleanroom Tablet',
    terminalLocation: 'IVF Cleanroom Console #2',
    loginTimestamp: '27 Oct 2026, 09:15 IST',
    lastPing: '1m ago',
    status: 'Active'
  },
  {
    id: 'SESS-2026-903',
    username: 'tech.suresh.kumar',
    fullName: 'Suresh Kumar (DMLT)',
    role: 'Senior Lab Technologist',
    department: 'Laboratory & Biochemistry',
    workstationIp: '192.168.14.88',
    deviceBrowser: 'Chrome 122 / LIS Station',
    terminalLocation: 'Hematology Analyzer Bench 1',
    loginTimestamp: '27 Oct 2026, 07:45 IST',
    lastPing: '30s ago',
    status: 'Active'
  },
  {
    id: 'SESS-2026-904',
    username: 'bbo.meenakshi.rao',
    fullName: 'Dr. Meenakshi Rao',
    role: 'Blood Bank Officer',
    department: 'Blood Bank & Transfusion',
    workstationIp: '192.168.14.92',
    deviceBrowser: 'Chrome 122 / Dual-Gate Terminal',
    terminalLocation: 'Blood Bank Crossmatch Room',
    loginTimestamp: '27 Oct 2026, 08:00 IST',
    lastPing: '2m ago',
    status: 'Active'
  },
  {
    id: 'SESS-2026-905',
    username: 'cashier.ramesh.patil',
    fullName: 'Ramesh Patil',
    role: 'Billing Cashier',
    department: 'Cash & Billing POS',
    workstationIp: '192.168.10.12',
    deviceBrowser: 'Firefox 120 / POS Terminal',
    terminalLocation: 'Ground Floor Cashier Counter #3',
    loginTimestamp: '27 Oct 2026, 08:10 IST',
    lastPing: '45s ago',
    status: 'Active'
  },
  {
    id: 'SESS-2026-906',
    username: 'nurse.sarah.fernandes',
    fullName: 'Sr. Sarah Fernandes',
    role: 'Ward Nursing In-Charge',
    department: 'Ward Nursing (ICU Wing)',
    workstationIp: '192.168.16.22',
    deviceBrowser: 'Mobile Safari / Hospital iPad',
    terminalLocation: 'ICU Bedside Cart #5',
    loginTimestamp: '27 Oct 2026, 07:30 IST',
    lastPing: '3m ago',
    status: 'Idle'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-89104',
    timestamp: '27 Oct 2026, 11:42:15 IST',
    type: 'CLINICAL',
    action: 'UPDATE',
    entity: 'Medication Order (MAR-2026-1042)',
    uhid: 'UHID-2026-0814',
    patientName: 'Devika Sengupta',
    userId: 'dr.anand.kulkarni',
    userRole: 'Doctor',
    terminalIp: '192.168.10.45',
    oldValue: 'Inj Meropenem 500mg IV TDS',
    newValue: 'Inj Meropenem 1g IV TDS (Dose escalation for fever spike)',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-89103',
    timestamp: '27 Oct 2026, 11:28:40 IST',
    type: 'SYSTEM',
    action: 'UPDATE',
    entity: 'User Role Assignment',
    uhid: 'N/A',
    patientName: 'N/A',
    userId: 'admin.super',
    userRole: 'Super Admin',
    terminalIp: '192.168.10.02',
    oldValue: 'Role: Nurse (Ward Inpatient Only)',
    newValue: 'Role: Senior Nurse Supervisor (+ ICU Access Granted)',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-89102',
    timestamp: '27 Oct 2026, 10:55:12 IST',
    type: 'CLINICAL',
    action: 'UPDATE',
    entity: 'Lab Result Authorization',
    uhid: 'UHID-2026-0922',
    patientName: 'Rajesh Verma',
    userId: 'tech.suresh.kumar',
    userRole: 'Lab Technologist',
    terminalIp: '192.168.14.88',
    oldValue: 'Serum Potassium: 6.8 mEq/L (Critical High - Unverified)',
    newValue: 'Serum Potassium: 6.8 mEq/L (Verified & Panic Doctor Page Dispatched)',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-89101',
    timestamp: '27 Oct 2026, 10:14:02 IST',
    type: 'SYSTEM',
    action: 'LOGIN',
    entity: 'Staff Session Auth',
    uhid: 'N/A',
    patientName: 'N/A',
    userId: 'bbo.meenakshi.rao',
    userRole: 'Blood Bank Officer',
    terminalIp: '192.168.14.92',
    oldValue: 'Session: Offline',
    newValue: 'Session: Authenticated (2FA Verified via TOTP)',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-89100',
    timestamp: '27 Oct 2026, 09:40:33 IST',
    type: 'CLINICAL',
    action: 'INSERT',
    entity: 'Blood Bag Safe Release',
    uhid: 'UHID-2026-1045',
    patientName: 'Amina Khatun',
    userId: 'bbo.meenakshi.rao',
    userRole: 'Blood Bank Officer',
    terminalIp: '192.168.14.92',
    oldValue: 'Status: Crossmatch Completed',
    newValue: 'Status: Handover Dispatched to OT-3 (Bag #PRC-2026-0412)',
    status: 'VERIFIED'
  }
];

export const INITIAL_EVENT_CONFIGS = [
  {
    id: 'EVT-01',
    code: 'PANIC_LAB_ALERT',
    name: 'Critical / Life-Threatening Lab Panic Value Alert',
    category: 'Clinical Safety',
    description: 'Triggered when serum potassium > 6.0, troponin > 0.4, or platelet < 20,000.',
    channels: { sms: true, whatsapp: true, email: true, audioChime: true },
    recipientType: 'Treating Doctor & Chief Pathologist',
    template: 'CRITICAL ALERT: Patient {PATIENT_NAME} ({UHID}) in {WARD_BED} has critical {TEST_NAME} = {VALUE} (Normal: {REF_RANGE}). Immediate clinical review required.',
    escalationMinutes: 5,
    enabled: true
  },
  {
    id: 'EVT-02',
    code: 'EMERGENCY_TRIAGE_L1',
    name: 'Emergency Department Level 1 Resuscitation Triage',
    category: 'Emergency / Trauma',
    description: 'Triggered when patient arrives in cardiac arrest, massive trauma, or airway collapse.',
    channels: { sms: true, whatsapp: true, email: false, audioChime: true },
    recipientType: 'Trauma Lead Doctor, Anesthesiologist, ICU Team',
    template: 'CODE RED TRAUMA: Level 1 Patient arrived at Bay {BAY_NO}. Trauma team assemble immediately at Emergency Resus Bay.',
    escalationMinutes: 2,
    enabled: true
  },
  {
    id: 'EVT-03',
    code: 'IPD_FINAL_BILL_PAID',
    name: 'Inpatient Final Bill Paid & Clearance Gate Pass',
    category: 'Billing & Clearance',
    description: 'Triggered upon zero-balance settlement of discharge summary and cashier signoff.',
    channels: { sms: true, whatsapp: true, email: true, audioChime: false },
    recipientType: 'Patient Relative & Main Exit Security Gate',
    template: 'Dear {PATIENT_NAME}, your final IPD discharge bill (Receipt #{RECEIPT_NO}) is settled. Gate Pass #{GATE_PASS} is cleared for exit. Thank you for choosing Sarji Hospitals.',
    escalationMinutes: 0,
    enabled: true
  },
  {
    id: 'EVT-04',
    code: 'BLOOD_BAG_ISSUED',
    name: 'Crossmatched Blood Bag Safe Release Notification',
    category: 'Blood Bank',
    description: 'Triggered when Blood Bank releases packed red cells or platelets to OT/ICU.',
    channels: { sms: true, whatsapp: false, email: false, audioChime: true },
    recipientType: 'Ward Nursing Desk & Transport Phlebotomist',
    template: 'BLOOD ISSUE: Bag #{BAG_NO} ({BLOOD_GROUP}) for {PATIENT_NAME} ({UHID}) is ready for cold-box pickup at Blood Bank Counter.',
    escalationMinutes: 10,
    enabled: true
  }
];

export const INITIAL_NUMBERING_PREFIXES = [
  { id: 'PFX-01', module: 'Patient Registration', entity: 'UHID Number', prefix: 'UHID-2026-', currentSeq: 8412, sample: 'UHID-2026-08413' },
  { id: 'PFX-02', module: 'OPD Billing', entity: 'OPD Receipt No', prefix: 'OPD-REC-2026-', currentSeq: 19402, sample: 'OPD-REC-2026-19403' },
  { id: 'PFX-03', module: 'Inpatient (IPD)', entity: 'Admission ID', prefix: 'IPD-ADM-2026-', currentSeq: 3810, sample: 'IPD-ADM-2026-03811' },
  { id: 'PFX-04', module: 'Pharmacy POS', entity: 'Pharmacy Bill No', prefix: 'RX-BILL-2026-', currentSeq: 41200, sample: 'RX-BILL-2026-41201' },
  { id: 'PFX-05', module: 'Laboratory LIS', entity: 'Lab Accession No', prefix: 'LAB-ACC-2026-', currentSeq: 90412, sample: 'LAB-ACC-2026-90413' },
  { id: 'PFX-06', module: 'Work Order Engineering', entity: 'Work Order No', prefix: 'WO-2026-', currentSeq: 142, sample: 'WO-2026-00143' }
];

export const ALL_32_MODULE_NAMES = [
  '01. Semen Analysis Entry',
  '02. Widgets & Configuration',
  '03. Appointments & Queue',
  '04. OPD Billing POS',
  '05. Blood Bank Management',
  '06. Clinical Desk & CPOE',
  '07. Credit Billing & TPA',
  '08. Day Care Admission',
  '09. Diet & Nutrition',
  '10. Embryology Suite',
  '11. Emergency & Trauma',
  '12. EMR Records Studio',
  '13. Finance & General Ledger',
  '14. Fixed Asset Management',
  '15. Hospital & Branch Master',
  '16. Inventory & Store Indents',
  '17. Inpatient (IPD) Bed Board',
  '18. IVF Fertility Suite',
  '19. Laboratory (LIS)',
  '20. Medical Records (MRD)',
  '21. Ward Nursing & MAR',
  '22. OPD Clinic Flow',
  '23. Operation Theatre (OT)',
  '24. Patient Registration',
  '25. Pharmacy & Dispensing',
  '26. Purchase & Procurement',
  '27. Radiology & PACS',
  '28. OTC Retail POS',
  '29. System Administration',
  '30. User Profile & Security',
  '31. Work Order Engineering',
  '32. Analytics & Data Export'
];
