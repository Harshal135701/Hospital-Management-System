/**
 * Hospital Operations & Retail POS Mock / Baseline Data
 * Realistic, hospital-grade items, sessions, audit trails, work orders, and analytics.
 */

export const INITIAL_RETAIL_CATALOG = [
  { id: 'OTC-01', barcode: '890103001', name: 'Digital Infrared Forehead Thermometer', price: 950, gst: 12, category: 'Diagnostic Device', stock: 35, location: 'Shelf A-01' },
  { id: 'OTC-02', barcode: '890103002', name: 'Digital Finger Pulse Oximeter OLED', price: 1100, gst: 12, category: 'Diagnostic Device', stock: 42, location: 'Shelf A-02' },
  { id: 'OTC-03', barcode: '890103003', name: 'Vicks VapoRub 50g Relief Ointment', price: 145, gst: 5, category: 'OTC Remedy', stock: 110, location: 'Shelf B-04' },
  { id: 'OTC-04', barcode: '890103004', name: 'Volini Joint & Muscle Pain Relief Gel 75g', price: 220, gst: 12, category: 'Topical Pain', stock: 75, location: 'Shelf B-05' },
  { id: 'OTC-05', barcode: '890103005', name: 'Electral WHO-Formula ORS Sachets (Box of 10)', price: 215, gst: 5, category: 'Electrolyte Balance', stock: 180, location: 'Shelf C-01' },
  { id: 'OTC-06', barcode: '890103006', name: 'Dettol Antiseptic Liquid Disinfectant 500ml', price: 198, gst: 18, category: 'First Aid & Wound Care', stock: 95, location: 'Shelf C-03' },
  { id: 'OTC-07', barcode: '890103007', name: 'Accu-Chek Active Blood Glucose Test Strips (50s)', price: 890, gst: 12, category: 'Diabetes Care', stock: 50, location: 'Shelf A-03' },
  { id: 'OTC-08', barcode: '890103008', name: 'Band-Aid Washproof Strips (Pack of 50)', price: 120, gst: 12, category: 'First Aid & Wound Care', stock: 140, location: 'Shelf B-01' },
  { id: 'OTC-09', barcode: '890103009', name: 'Crepe Bandage B.P. 10cm x 4m Elastic Support', price: 165, gst: 12, category: 'Orthopedic Support', stock: 65, location: 'Shelf B-02' },
  { id: 'OTC-10', barcode: '890103010', name: 'Povidone Iodine 10% Antiseptic Ointment 20g', price: 78, gst: 12, category: 'First Aid & Wound Care', stock: 85, location: 'Shelf C-04' },
  { id: 'OTC-11', barcode: '890103011', name: 'N95 Medical Respirator Face Masks (Pack of 5)', price: 250, gst: 5, category: 'Personal Protection', stock: 220, location: 'Shelf D-01' },
  { id: 'OTC-12', barcode: '890103012', name: 'Otrivin Adult Nasal Decongestant Spray 10ml', price: 105, gst: 12, category: 'ENT & Cold Care', stock: 60, location: 'Shelf B-06' }
];

export const INITIAL_PAST_INVOICES = [
  {
    invoiceNumber: 'INV-2026-901',
    date: '2026-10-26 14:30',
    customerName: 'Devika Sengupta',
    customerPhone: '+91 98301 24567',
    uhid: 'UHID-2026-0814',
    items: [
      { id: 'OTC-01', name: 'Digital Infrared Forehead Thermometer', price: 950, gst: 12, qty: 1, returnable: true },
      { id: 'OTC-05', name: 'Electral WHO-Formula ORS Sachets (Box of 10)', price: 215, gst: 5, qty: 2, returnable: true }
    ],
    subtotal: 1380,
    gst: 135.5,
    total: 1515.5,
    tender: 'UPI QR',
    status: 'Settled'
  },
  {
    invoiceNumber: 'INV-2026-902',
    date: '2026-10-25 11:15',
    customerName: 'Bikram Ghosh',
    customerPhone: '+91 98311 55678',
    uhid: 'UHID-2026-0412',
    items: [
      { id: 'OTC-02', name: 'Digital Finger Pulse Oximeter OLED', price: 1100, gst: 12, qty: 1, returnable: true },
      { id: 'OTC-04', name: 'Volini Joint & Muscle Pain Relief Gel 75g', price: 220, gst: 12, qty: 1, returnable: true }
    ],
    subtotal: 1320,
    gst: 158.4,
    total: 1478.4,
    tender: 'Credit Card',
    status: 'Settled'
  }
];

export const INITIAL_USER_SESSIONS = [
  {
    id: 'SESS-901',
    username: 'dr.arindam',
    fullName: 'Dr. Arindam Mitra',
    role: 'clinician_doctor',
    roleLabel: 'Consultant Physician',
    branch: 'Main Campus (Salt Lake)',
    ipAddress: '192.168.1.42',
    device: 'Chrome 122 (Windows 11)',
    terminal: 'OPD Suite Desk 3',
    loginTime: '2026-10-27 08:30 AM',
    lastActive: '2 mins ago',
    status: 'Active'
  },
  {
    id: 'SESS-902',
    username: 'nurse.reena',
    fullName: 'Reena Roy',
    role: 'staff_nurse',
    roleLabel: 'Senior Staff Nurse',
    branch: 'Main Campus (Salt Lake)',
    ipAddress: '192.168.1.88',
    device: 'Edge 121 (Workstation Terminal)',
    terminal: 'Ward 1 Nursing Desk',
    loginTime: '2026-10-27 07:45 AM',
    lastActive: '5 mins ago',
    status: 'Active'
  },
  {
    id: 'SESS-903',
    username: 'cashier.priya',
    fullName: 'Priya Das',
    role: 'receptionist',
    roleLabel: 'Billing Cashier',
    branch: 'Main Campus (Salt Lake)',
    ipAddress: '192.168.1.15',
    device: 'Chrome 122 (POS Terminal)',
    terminal: 'OTC Counter 2',
    loginTime: '2026-10-27 08:15 AM',
    lastActive: 'Just now',
    status: 'Active'
  },
  {
    id: 'SESS-904',
    username: 'super.admin',
    fullName: 'System Administrator',
    role: 'super_admin',
    roleLabel: 'Super Administrator',
    branch: 'Main Campus (Salt Lake)',
    ipAddress: '192.168.1.10',
    device: 'Firefox 123 (Server Admin Console)',
    terminal: 'Server Room Console',
    loginTime: '2026-10-27 06:00 AM',
    lastActive: '12 mins ago',
    status: 'Active'
  },
  {
    id: 'SESS-905',
    username: 'pharma.vikram',
    fullName: 'Vikram Seth',
    role: 'pharmacist',
    roleLabel: 'Chief Pharmacist',
    branch: 'South Bay Diagnostic Clinic',
    ipAddress: '192.168.2.33',
    device: 'Chrome 122 (Pharmacy POS)',
    terminal: 'Pharmacy Dispense Counter',
    loginTime: '2026-10-27 09:00 AM',
    lastActive: '18 mins ago',
    status: 'Idle'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-8801',
    timestamp: '2026-10-27 10:14:22',
    actor: 'Dr. Arindam Mitra',
    role: 'clinician_doctor',
    category: 'Clinical Care',
    action: 'MEDICATION_ORDER',
    resource: 'UHID-2026-0814 / DEV-SEN',
    ipAddress: '192.168.1.42',
    details: 'Prescribed Tab Augmentin 625 Duo TID x 5 days with digital signature',
    status: 'Success'
  },
  {
    id: 'AUD-8802',
    timestamp: '2026-10-27 10:02:15',
    actor: 'Priya Das',
    role: 'receptionist',
    category: 'Billing & POS',
    action: 'INVOICE_SETTLEMENT',
    resource: 'INV-2026-901 / POS',
    ipAddress: '192.168.1.15',
    details: 'Settled OTC POS Bill Rs 1,515.50 via UPI QR code confirmation',
    status: 'Success'
  },
  {
    id: 'AUD-8803',
    timestamp: '2026-10-27 09:45:00',
    actor: 'System Administrator',
    role: 'super_admin',
    category: 'System Security',
    action: 'RBAC_PERMISSION_UPDATE',
    resource: 'ROLE:staff_nurse',
    ipAddress: '192.168.1.10',
    details: 'Updated Emergency Clinical override permission for triage nurses',
    status: 'Success'
  },
  {
    id: 'AUD-8804',
    timestamp: '2026-10-27 09:21:40',
    actor: 'Reena Roy',
    role: 'staff_nurse',
    category: 'Nursing Administration',
    action: 'VITALS_RECORDED',
    resource: 'BED-101 / RAM-TELI',
    ipAddress: '192.168.1.88',
    details: 'Logged morning vitals: BP 124/82, SpO2 97%, HR 78 bpm',
    status: 'Success'
  },
  {
    id: 'AUD-8805',
    timestamp: '2026-10-27 08:44:11',
    actor: 'Dr. Rajiv Menon',
    role: 'clinician_doctor',
    category: 'Radiology PACS',
    action: 'REPORT_AUTHORIZED',
    resource: 'ACC-2026-XR-8137',
    ipAddress: '192.168.1.66',
    details: 'Digitally verified and distributed Chest X-Ray diagnostic report to EMR',
    status: 'Success'
  },
  {
    id: 'AUD-8806',
    timestamp: '2026-10-27 08:12:05',
    actor: 'Unknown / External',
    role: 'anonymous',
    category: 'Authentication',
    action: 'LOGIN_FAILURE',
    resource: 'USER:staff_test@hospital.com',
    ipAddress: '192.168.1.205',
    details: 'Invalid password attempt (3 of 5 allowed before lockout)',
    status: 'Warning'
  }
];

export const INITIAL_DEPARTMENTS = [
  { id: 'DEP-01', code: 'MED', name: 'General Medicine & Critical Care', hod: 'Dr. Arindam Mitra', clinics: 4, inpatientBeds: 24, status: 'Active' },
  { id: 'DEP-02', code: 'OBGYN', name: 'Obstetrics & Gynaecology (Women Health)', hod: 'Dr. Ananya Sharma', clinics: 3, inpatientBeds: 18, status: 'Active' },
  { id: 'DEP-03', code: 'ICU', name: 'Intensive Care Unit & Anesthesiology', hod: 'Dr. Pradeep K. Sharma', clinics: 1, inpatientBeds: 12, status: 'Active' },
  { id: 'DEP-04', code: 'SURG', name: 'General & Minimally Invasive Surgery', hod: 'Dr. Sandeep Kulkarni', clinics: 2, inpatientBeds: 20, status: 'Active' },
  { id: 'DEP-05', code: 'PED', name: 'Pediatrics & Neonatal ICU (NICU)', hod: 'Dr. Meenakshi Sanyal', clinics: 2, inpatientBeds: 10, status: 'Active' },
  { id: 'DEP-06', code: 'RAD', name: 'Diagnostic Radiology & Imaging', hod: 'Dr. Rajiv Menon', clinics: 2, inpatientBeds: 0, status: 'Active' }
];

export const INITIAL_EVENTS = [
  { id: 'EVT-01', name: 'Critical Emergency Triage Level 1 Red Alert', channel: 'SMS + Pager Webhook', recipient: 'Duty Emergency Medical Officer (EMO)', triggerCondition: 'Triage assessment assigned Score 1', enabled: true },
  { id: 'EVT-02', name: 'High-Value Cash Bill (> ₹50,000) Settlement', channel: 'Email Notification', recipient: 'Chief Financial Officer & Internal Auditor', triggerCondition: 'Cash POS receipt exceeds limit', enabled: true },
  { id: 'EVT-03', name: 'Narcotic / Schedule X Medication Dispense', channel: 'Real-Time EMR Flag', recipient: 'Medical Superintendent & Pharmacist Lead', triggerCondition: 'Formulary Schedule X item issued', enabled: true },
  { id: 'EVT-04', name: 'Biomedical Equipment Breakdown Ticket Logged', channel: 'Work Order Auto-Ticket', recipient: 'Senior Biomedical Engineer', triggerCondition: 'Equipment ticket priority = Urgent', enabled: true },
  { id: 'EVT-05', name: 'Diagnostic Panic / Critical Lab Panic Value Alert', channel: 'Push Alert + Mobile SMS', recipient: 'Ordering Consultant Physician', triggerCondition: 'Lab result flags Critical Panic', enabled: true }
];

export const INITIAL_RBAC_MATRIX = [
  { module: 'Patient Registration & UHID', doctor: true, nurse: true, pharmacist: false, cashier: true, admin: true },
  { module: 'Doctor Consultation Desk (EMR)', doctor: true, nurse: false, pharmacist: false, cashier: false, admin: true },
  { module: 'Ward Nursing & MAR Charting', doctor: true, nurse: true, pharmacist: false, cashier: false, admin: true },
  { module: 'Billing POS & Cash Collection', doctor: false, nurse: false, pharmacist: false, cashier: true, admin: true },
  { module: 'Pharmacy Dispense & Inventory', doctor: false, nurse: false, pharmacist: true, cashier: false, admin: true },
  { module: 'Radiology PACS Diagnostic Reporting', doctor: true, nurse: false, pharmacist: false, cashier: false, admin: true },
  { module: 'Work Order Maintenance & SLAs', doctor: false, nurse: true, pharmacist: false, cashier: false, admin: true },
  { module: 'Analytics & Tabular Data Export', doctor: false, nurse: false, pharmacist: false, cashier: false, admin: true }
];

export const INITIAL_WORK_ORDERS = [
  {
    id: 'WO-2026-012',
    referenceNumber: 'WO-2026-012',
    requisitionRef: 'WOR-2026-082',
    date: '2026-10-24',
    title: 'OT 1 Air Handling Unit (AHU) HEPA Filter Replacement',
    department: 'Biomedical & Engineering',
    requester: 'Sister Incharge Mary Kurian',
    contractor: 'BlueStar CleanAir Services Ltd',
    technician: 'Senior Field Tech Sandeep Roy',
    priority: 'High',
    estimatedCost: 38000,
    targetDate: '2026-10-28',
    status: 'Approved',
    approvalLevel: 'Final Engineering Head',
    notes: 'ISO Class 5 sterile particle count validation mandatory before surgical recommissioning.'
  },
  {
    id: 'WO-2026-013',
    referenceNumber: 'WO-2026-013',
    requisitionRef: 'WOR-2026-079',
    date: '2026-10-25',
    title: 'Cath Lab Supercon UPS Battery Bank Annual Impedance Audit',
    department: 'Electrical Engineering',
    requester: 'Cath Lab Tech R. Verma',
    contractor: 'Schneider Electric APC India',
    technician: 'Power Systems Specialist Anand V.',
    priority: 'Urgent',
    estimatedCost: 65000,
    targetDate: '2026-10-26',
    status: 'In Execution',
    approvalLevel: 'Executive Director',
    notes: 'Verify 30-minute full-load autonomous runtime during scheduled maintenance window.'
  },
  {
    id: 'WO-2026-014',
    referenceNumber: 'WO-2026-014',
    requisitionRef: 'WOR-2026-085',
    date: '2026-10-26',
    title: 'Inpatient Ward 2 Bedhead Medical Gas Pressure Valve Overhaul',
    department: 'Facility Maintenance',
    requester: 'Ward Incharge Reena Roy',
    contractor: 'Hospital In-house Maintenance Crew',
    technician: 'Lead Plumber K. Mondal',
    priority: 'Medium',
    estimatedCost: 14500,
    targetDate: '2026-10-31',
    status: 'Pending Approval',
    approvalLevel: 'Pending Supervisor',
    notes: 'Pressure drop of 0.4 bar observed on Bed 201-208 terminal flow meters.'
  },
  {
    id: 'WO-2026-015',
    referenceNumber: 'WO-2026-015',
    requisitionRef: 'WOR-2026-070',
    date: '2026-10-22',
    title: 'Dialysis Reverse Osmosis (RO) Plant Quarterly Membrane Descaling',
    department: 'Nephrology Engineering',
    requester: 'Dialysis Senior Tech S. Bhatt',
    contractor: 'Aquafresh Industrial Systems Ltd',
    technician: 'Chemical Engineer P. Das',
    priority: 'High',
    estimatedCost: 28000,
    targetDate: '2026-10-24',
    status: 'Receipt Confirmed',
    approvalLevel: 'Medical Superintendent',
    notes: 'Product water conductivity verified < 10 µS/cm (AAMI standard met).'
  }
];

export const INITIAL_REQUISITIONS = [
  {
    id: 'WOR-2026-081',
    date: '2026-10-26',
    department: 'Operation Theatre Complex',
    requester: 'Sister Incharge Mary Kurian',
    equipment: 'OT 2 Surgical Pendant Gas Pressure Valve',
    priority: 'Urgent',
    status: 'Pending Review',
    description: 'Medical nitrous oxide digital flow alarm triggered intermittent acoustic alerts during morning list.'
  },
  {
    id: 'WOR-2026-082',
    date: '2026-10-24',
    department: 'Central Sterilization (CSSD)',
    requester: 'CSSD Tech Rajesh B.',
    equipment: 'Sterrad 100NX Hydrogen Peroxide Gas Plasma Sterilizer',
    priority: 'High',
    status: 'Approved & Work Order Created',
    description: 'Vacuum chamber seal gasket periodic replacement as per OEM service manual at 500 cycles.'
  },
  {
    id: 'WOR-2026-083',
    date: '2026-10-23',
    department: 'Emergency & Trauma Care',
    requester: 'Duty EMO Dr. P. Sengupta',
    equipment: 'Trauma Bay 1 Defibrillator Monitor (Zoll R-Series)',
    priority: 'High',
    status: 'Pending Review',
    description: 'Pacing test lead cable shows intermittent continuity warning on self-test.'
  }
];

export const INITIAL_WORK_ORDER_RECEIPTS = [
  {
    id: 'REC-2026-041',
    woRef: 'WO-2026-015',
    date: '2026-10-24',
    contractor: 'Aquafresh Industrial Systems Ltd',
    title: 'Dialysis Reverse Osmosis (RO) Membrane Descaling',
    technician: 'Chemical Engineer P. Das',
    sparesUsed: 'Citric acid descaling kit, 2x 5-micron pre-filter cartridges',
    labTestResult: 'Permeate conductivity 4.8 µS/cm, microbiological endotoxin < 0.25 EU/ml (PASSED)',
    approvalStatus: 'Approved by Biomedical Lead',
    confirmationStatus: 'Cleared for Payment'
  },
  {
    id: 'REC-2026-042',
    woRef: 'WO-2026-012',
    date: '2026-10-27',
    contractor: 'BlueStar CleanAir Services Ltd',
    title: 'OT 1 AHU HEPA Filter Replacement',
    technician: 'Senior Field Tech Sandeep Roy',
    sparesUsed: '4x H14 Class Terminal HEPA Filters, Neoprene Gaskets',
    labTestResult: 'Cleanroom air velocity 0.45 m/s, zero DOP leak detected (PASSED)',
    approvalStatus: 'Pending Supervisor Approval',
    confirmationStatus: 'Pending Finance Clearance'
  }
];

export const INITIAL_REJECTED_ORDERS = [
  {
    id: 'WO-2026-009',
    date: '2026-10-21',
    title: 'Doctor Lounge Air Conditioner Replacement',
    department: 'Administration',
    contractor: 'CoolCare Engineers',
    estimatedCost: 85000,
    rejectedBy: 'Medical Superintendent',
    reason: 'Routine servicing was performed only 2 months ago. Repair existing compressor valve instead of total unit replacement.'
  },
  {
    id: 'WO-2026-010',
    date: '2026-10-19',
    title: 'Executive Boardroom Conference Audio System Upgrade',
    department: 'Hospital Management',
    contractor: 'Acoustic Sound Lab LLP',
    estimatedCost: 120000,
    rejectedBy: 'Chief Financial Officer',
    reason: 'Non-clinical capital expense deferred to next fiscal quarter as per hospital cost-optimization directive.'
  }
];
