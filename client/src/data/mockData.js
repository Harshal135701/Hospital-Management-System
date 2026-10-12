// Central Enterprise Hospital Management System (HIS/HMS) Data Store
// Aligned with the database schema: departments, rooms, patients, doctors, doctor_rosters, appointments

export const DEPARTMENTS = [
  { id: "dept-1", code: "CARD", name: "Cardiology & Interventional Cath", description: "Comprehensive cardiovascular diagnosis and surgical treatment", is_active: true, head: "Dr. Arvind Rathore", floor: "3rd Floor" },
  { id: "dept-2", code: "NEUR", name: "Neurology & Neurosurgery", description: "Brain, spine and peripheral nervous system care", is_active: true, head: "Dr. Sunita Deshmukh", floor: "4th Floor" },
  { id: "dept-3", code: "ORTH", name: "Orthopaedics & Joint Replacement", description: "Musculoskeletal trauma, arthroscopy and joint reconstruction", is_active: true, head: "Dr. Rajesh Kulkarni", floor: "2nd Floor" },
  { id: "dept-4", code: "PEDI", name: "Paediatrics & Neonatology (NICU)", description: "Specialized childcare, growth monitoring and critical neonatology", is_active: true, head: "Dr. Meenakshi Sundaram", floor: "1st Floor" },
  { id: "dept-5", code: "OBGY", name: "Obstetrics, Gynaecology & IVF", description: "Maternal care, reproductive health and ART embryology", is_active: true, head: "Dr. Prachi Verma", floor: "2nd Floor" },
  { id: "dept-6", code: "ONCO", name: "Medical & Surgical Oncology", description: "Comprehensive cancer staging, chemotherapy and tumor resection", is_active: true, head: "Dr. Farhan Qureshi", floor: "5th Floor" },
  { id: "dept-7", code: "EMER", name: "Emergency Medicine & Trauma (ER)", description: "Level-1 emergency triage, resuscitation and acute resuscitation", is_active: true, head: "Dr. Vikram Seth", floor: "Ground Floor" },
  { id: "dept-8", code: "RADI", name: "Radiology & Diagnostic Imaging", description: "128-Slice CT, 3T MRI, Sonography and Digital X-Ray", is_active: true, head: "Dr. Rohit Singhania", floor: "Basement 1" },
  { id: "dept-9", code: "PATH", name: "Pathology & Central Laboratory", description: "Automated biochemistry, hematology, microbiology and histopathology", is_active: true, head: "Dr. Alok Patwardhan", floor: "Basement 1" },
  { id: "dept-10", code: "NEPH", name: "Nephrology & Dialysis Unit", description: "Hemodialysis, peritoneal dialysis and renal disease management", is_active: true, head: "Dr. Deepa Nair", floor: "3rd Floor" },
];

export const ROOMS = [
  { id: "room-101", room_number: "OPD-101", name: "Cardio Consultation Suite 1", floor: "3rd Floor", is_active: true, type: "OPD" },
  { id: "room-102", room_number: "OPD-102", name: "Neuro Clinical Desk 2", floor: "4th Floor", is_active: true, type: "OPD" },
  { id: "room-103", room_number: "OPD-103", name: "Orthopaedic Exam Room", floor: "2nd Floor", is_active: true, type: "OPD" },
  { id: "room-201", room_number: "ICU-BED-01", name: "Cardiac Intensive Care Unit 01", floor: "3rd Floor", is_active: true, type: "ICU" },
  { id: "room-202", room_number: "ICU-BED-02", name: "Critical Care Unit 02", floor: "3rd Floor", is_active: true, type: "ICU" },
  { id: "room-301", room_number: "WARD-A-12", name: "Male General Medical Ward", floor: "2nd Floor", is_active: true, type: "Ward" },
  { id: "room-302", room_number: "PVT-SUITE-405", name: "Executive Deluxe Suite", floor: "4th Floor", is_active: true, type: "Private" },
  { id: "room-401", room_number: "OT-MAJOR-1", name: "Modular Laminar Flow OT 1", floor: "5th Floor", is_active: true, type: "OT" },
  { id: "room-402", room_number: "OT-ORTHO-2", name: "Joint Replacement OT 2", floor: "5th Floor", is_active: true, type: "OT" },
  { id: "room-501", room_number: "ER-BAY-03", name: "Acute Resuscitation Bay 03", floor: "Ground Floor", is_active: true, type: "Emergency" },
];

export const PATIENTS = [
  { id: "pat-1", uhid: "UHID-2026-004812", full_name: "Aarav Shantaram Sharma", mobile: "+91 98201 44521", date_of_birth: "1984-06-15", gender: "Male", blood_group: "O+", address: "402, Lotus Greens, Andheri East, Mumbai", emergency_contact: "Sneha Sharma (Wife) - 98201 44522", allergies: "Penicillin, Sulfa drugs", national_id: "AADHAAR: **** **** 8821" },
  { id: "pat-2", uhid: "UHID-2026-004813", full_name: "Pooja Ramesh Patel", mobile: "+91 98450 11928", date_of_birth: "1992-11-20", gender: "Female", blood_group: "B+", address: "78, Shanti Vihar, Viman Nagar, Pune", emergency_contact: "Ramesh Patel (Father) - 98450 11920", allergies: "None reported", national_id: "AADHAAR: **** **** 1943" },
  { id: "pat-3", uhid: "UHID-2026-004814", full_name: "Harish Chandra Gupta", mobile: "+91 97112 88471", date_of_birth: "1958-03-08", gender: "Male", blood_group: "A+", address: "12/C, Civil Lines, Nagpur", emergency_contact: "Vikas Gupta (Son) - 97112 88479", allergies: "Aspirin, Contrast dye", national_id: "AADHAAR: **** **** 3390" },
  { id: "pat-4", uhid: "UHID-2026-004815", full_name: "Ananya Devraj Roy", mobile: "+91 99031 66205", date_of_birth: "2001-08-25", gender: "Female", blood_group: "AB+", address: "Flat 5A, Silver Oak, Salt Lake, Kolkata", emergency_contact: "Devraj Roy (Father) - 99031 66200", allergies: "Ibuprofen", national_id: "AADHAAR: **** **** 7120" },
  { id: "pat-5", uhid: "UHID-2026-004816", full_name: "Mohammed Tariq Ansari", mobile: "+91 94220 55182", date_of_birth: "1975-01-14", gender: "Male", blood_group: "A-", address: "B/14, Noor Baug, Byculla, Mumbai", emergency_contact: "Farida Ansari (Wife) - 94220 55180", allergies: "Latex", national_id: "AADHAAR: **** **** 9044" },
  { id: "pat-6", uhid: "UHID-2026-004817", full_name: "Kavita S. Rao", mobile: "+91 98860 33410", date_of_birth: "1988-04-30", gender: "Female", blood_group: "O-", address: "23, Indiranagar 100ft Rd, Bengaluru", emergency_contact: "Srinivas Rao (Husband) - 98860 33411", allergies: "None", national_id: "AADHAAR: **** **** 5183" },
];

export const DOCTORS = [
  { id: "doc-1", employee_code: "EMP-MED-0101", full_name: "Dr. Arvind Rathore", mobile: "+91 98200 11223", department_id: "dept-1", department_name: "Cardiology", room_id: "room-101", room_number: "OPD-101", is_active: true, qualification: "MD, DM (Cardiology), FACC", fee: 1500, rating: 4.9, opd_days: "Mon, Wed, Fri" },
  { id: "doc-2", employee_code: "EMP-MED-0102", full_name: "Dr. Sunita Deshmukh", mobile: "+91 98200 22334", department_id: "dept-2", department_name: "Neurology", room_id: "room-102", room_number: "OPD-102", is_active: true, qualification: "MBBS, MCh (Neurosurgery), FINR", fee: 1800, rating: 4.8, opd_days: "Tue, Thu, Sat" },
  { id: "doc-3", employee_code: "EMP-MED-0103", full_name: "Dr. Rajesh Kulkarni", mobile: "+91 98200 33445", department_id: "dept-3", department_name: "Orthopaedics", room_id: "room-103", room_number: "OPD-103", is_active: true, qualification: "MS (Ortho), Fellowship Arthroplasty (UK)", fee: 1400, rating: 4.7, opd_days: "Mon, Tue, Thu, Fri" },
  { id: "doc-4", employee_code: "EMP-MED-0104", full_name: "Dr. Prachi Verma", mobile: "+91 98200 44556", department_id: "dept-5", department_name: "Obstetrics & IVF", room_id: "room-101", room_number: "OPD-201", is_active: true, qualification: "MS (OBGY), Fellowship ART & Embryology", fee: 1600, rating: 4.9, opd_days: "Mon to Sat" },
  { id: "doc-5", employee_code: "EMP-MED-0105", full_name: "Dr. Vikram Seth", mobile: "+91 98200 55667", department_id: "dept-7", department_name: "Emergency & Trauma", room_id: "room-501", room_number: "ER-BAY-03", is_active: true, qualification: "MD (Emergency Medicine), MRCEM", fee: 1200, rating: 4.9, opd_days: "All Days (24x7 Roster)" },
];

export const APPOINTMENTS = [
  {
    id: "apt-101",
    patient_id: "pat-1",
    patient_name: "Aarav Shantaram Sharma",
    uhid: "UHID-2026-004812",
    mobile: "+91 98201 44521",
    doctor_id: "doc-1",
    doctor_name: "Dr. Arvind Rathore",
    department_id: "dept-1",
    department_name: "Cardiology",
    room_number: "OPD-101",
    appointment_date: "2026-10-12",
    start_time: "09:30",
    end_time: "09:45",
    visit_type: "first_visit",
    token_number: 1,
    status: "in_consultation",
    arrived_at: "09:12 AM",
    consultation_started_at: "09:31 AM",
    chief_complaint: "Exertional dyspnea & chest heaviness for 3 days",
    priority: "Standard",
    payment_status: "Paid",
    amount: 1500
  },
  {
    id: "apt-102",
    patient_id: "pat-2",
    patient_name: "Pooja Ramesh Patel",
    uhid: "UHID-2026-004813",
    mobile: "+91 98450 11928",
    doctor_id: "doc-1",
    doctor_name: "Dr. Arvind Rathore",
    department_id: "dept-1",
    department_name: "Cardiology",
    room_number: "OPD-101",
    appointment_date: "2026-10-12",
    start_time: "09:45",
    end_time: "10:00",
    visit_type: "follow_up",
    token_number: 2,
    status: "waiting",
    arrived_at: "09:25 AM",
    chief_complaint: "Post-angioplasty 6-week review, BP checking",
    priority: "Standard",
    payment_status: "Paid",
    amount: 1000
  },
  {
    id: "apt-103",
    patient_id: "pat-3",
    patient_name: "Harish Chandra Gupta",
    uhid: "UHID-2026-004814",
    mobile: "+91 97112 88471",
    doctor_id: "doc-2",
    doctor_name: "Dr. Sunita Deshmukh",
    department_id: "dept-2",
    department_name: "Neurology",
    room_number: "OPD-102",
    appointment_date: "2026-10-12",
    start_time: "10:00",
    end_time: "10:20",
    visit_type: "first_visit",
    token_number: 3,
    status: "booked",
    chief_complaint: "Right sided tremor and intermittent gait instability",
    priority: "Senior Citizen",
    payment_status: "Paid",
    amount: 1800
  },
  {
    id: "apt-104",
    patient_id: "pat-4",
    patient_name: "Ananya Devraj Roy",
    uhid: "UHID-2026-004815",
    mobile: "+91 99031 66205",
    doctor_id: "doc-3",
    doctor_name: "Dr. Rajesh Kulkarni",
    department_id: "dept-3",
    department_name: "Orthopaedics",
    room_number: "OPD-103",
    appointment_date: "2026-10-12",
    start_time: "10:30",
    end_time: "10:45",
    visit_type: "first_visit",
    token_number: 4,
    status: "arrived",
    arrived_at: "09:50 AM",
    chief_complaint: "Acute anterior cruciate ligament (ACL) knee strain",
    priority: "Standard",
    payment_status: "Paid",
    amount: 1400
  },
  {
    id: "apt-105",
    patient_id: "pat-5",
    patient_name: "Mohammed Tariq Ansari",
    uhid: "UHID-2026-004816",
    mobile: "+91 94220 55182",
    doctor_id: "doc-1",
    doctor_name: "Dr. Arvind Rathore",
    department_id: "dept-1",
    department_name: "Cardiology",
    room_number: "OPD-101",
    appointment_date: "2026-10-12",
    start_time: "11:00",
    end_time: "11:15",
    visit_type: "follow_up",
    token_number: 5,
    status: "booked",
    chief_complaint: "Holter monitor report discussion & dose titration",
    priority: "Standard",
    payment_status: "Pending",
    amount: 1500
  }
];

// Screenshot 1 Reference: My Refunds Table & Inpatient Admissions
export const REFUNDS = [
  {
    refund_no: "RF-2026-00891",
    patient_name: "Kavita S. Rao",
    uhid: "UHID-2026-004817",
    bill_no: "INV-OPD-99201",
    original_amount: 3200,
    refund_amount: 1200,
    reason: "Test cancelled by Pathologist (Thyroid profile duplicate)",
    mode: "UPI / Bank Transfer",
    status: "Approved",
    cashier: "Anjali Saxena (C-04)",
    requested_at: "2026-10-12 10:15 AM",
    approved_by: "Chief Finance Officer"
  },
  {
    refund_no: "RF-2026-00890",
    patient_name: "Harish Chandra Gupta",
    uhid: "UHID-2026-004814",
    bill_no: "INV-IPD-88210",
    original_amount: 45000,
    refund_amount: 8500,
    reason: "Excess advance deposit after final discharge settlement",
    mode: "Original Payment Card",
    status: "Processing",
    cashier: "Suresh Menon (C-02)",
    requested_at: "2026-10-12 09:30 AM",
    approved_by: "Audit Head Pending"
  },
  {
    refund_no: "RF-2026-00889",
    patient_name: "Aarav Shantaram Sharma",
    uhid: "UHID-2026-004812",
    bill_no: "INV-OPD-99155",
    original_amount: 1500,
    refund_amount: 1500,
    reason: "Consultation slot rescheduled to next week on doctor emergency",
    mode: "Cash / Cashier Counter",
    status: "Completed",
    cashier: "Anjali Saxena (C-04)",
    requested_at: "2026-10-11 04:45 PM",
    approved_by: "Dr. Arvind Rathore"
  }
];

// Screenshot 1 Reference: My IP Admissions Dashboard
export const IP_ADMISSIONS = [
  {
    ip_no: "IP-2026-03120",
    patient_name: "Harish Chandra Gupta",
    uhid: "UHID-2026-004814",
    age_gender: "68 Y / Male",
    admitted_on: "2026-10-09 14:30",
    ward_bed: "ICU-BED-01 (Cardiac CCU)",
    consultant: "Dr. Arvind Rathore",
    diagnosis: "Acute Coronary Syndrome, STEMI post PCI Stenting",
    insurance_tpa: "Star Health Comprehensive (Claim Approved: ₹2,40,000)",
    running_bill: 184500,
    advance_paid: 50000,
    balance_due: 134500,
    status: "Admitted - Stable"
  },
  {
    ip_no: "IP-2026-03121",
    patient_name: "Mohammed Tariq Ansari",
    uhid: "UHID-2026-004816",
    age_gender: "51 Y / Male",
    admitted_on: "2026-10-10 11:15",
    ward_bed: "WARD-A-12 (Male Medical)",
    consultant: "Dr. Rajesh Kulkarni",
    diagnosis: "Comminuted Fracture Right Femur, Scheduled for ORIF",
    insurance_tpa: "HDFC ERGO Health (Pre-Auth Pending ₹1,80,000)",
    running_bill: 62400,
    advance_paid: 25000,
    balance_due: 37400,
    status: "Pre-Operative"
  },
  {
    ip_no: "IP-2026-03122",
    patient_name: "Pooja Ramesh Patel",
    uhid: "UHID-2026-004813",
    age_gender: "33 Y / Female",
    admitted_on: "2026-10-11 08:45",
    ward_bed: "PVT-SUITE-405 (Maternity)",
    consultant: "Dr. Prachi Verma",
    diagnosis: "Day Care Diagnostic Laparoscopy & Chromopertubation",
    insurance_tpa: "Self Pay / Cash",
    running_bill: 41200,
    advance_paid: 45000,
    balance_due: -3800,
    status: "Observation"
  }
];

// Screenshot 2 Reference: Hospital & Branch Master
export const HOSPITAL_BRANCHES = [
  {
    id: "br-01",
    branch_name: "Aura Metro Superspecialty Hospital (Flagship Campus)",
    code: "AMS-MUM",
    city: "Mumbai, Maharashtra",
    address: "Plot 42, Bandra-Kurla Complex, Bandra East, Mumbai - 400051",
    total_beds: 450,
    icu_beds: 75,
    ot_suites: 12,
    contact: "+91 22 6900 8800",
    nabh_status: "NABH 5th Edition Accredited (Valid till 2028)",
    status: "Active (Current HQ)"
  },
  {
    id: "br-02",
    branch_name: "Aura Multispecialty Clinic & Surgical Centre",
    code: "AMC-PUN",
    city: "Pune, Maharashtra",
    address: "Senapati Bapat Road, Shivajinagar, Pune - 411016",
    total_beds: 120,
    icu_beds: 20,
    ot_suites: 4,
    contact: "+91 20 4455 1100",
    nabh_status: "NABH Entry-Level Accredited",
    status: "Active"
  },
  {
    id: "br-03",
    branch_name: "Aura West Wing Trauma & Emergency Center",
    code: "AWT-MUM",
    city: "Thane / Mumbai Metro",
    address: "Ghodbunder Road, Majiwada Junction, Thane West - 400607",
    total_beds: 200,
    icu_beds: 45,
    ot_suites: 6,
    contact: "+91 22 2580 9999",
    nabh_status: "NABH Level-1 Trauma Certified",
    status: "Active"
  }
];

// Screenshot 3 Reference: User Sessions & Audit Trail & Event Configuration
export const USER_SESSIONS = [
  { session_id: "SES-882194", user: "Dr. Arvind Rathore", role: "Chief Medical Officer", ip: "192.168.10.45", terminal: "Doctor-Desk-Cardio-01", branch: "AMS-MUM", login_time: "2026-10-12 08:30:12", status: "Active" },
  { session_id: "SES-882195", user: "Sister Mary Fernandez", role: "Charge Nurse", ip: "192.168.10.88", terminal: "Nursing-Workstation-ICU", branch: "AMS-MUM", login_time: "2026-10-12 07:00:00", status: "Active" },
  { session_id: "SES-882196", user: "Rohan Verma", role: "Cashier POS 01", ip: "192.168.10.12", terminal: "Billing-Counter-01", branch: "AMS-MUM", login_time: "2026-10-12 08:00:22", status: "Active" },
  { session_id: "SES-882197", user: "Admin Devendra", role: "Super Administrator", ip: "192.168.1.101", terminal: "IT-SecOps-Blade-02", branch: "All Branches", login_time: "2026-10-12 06:45:10", status: "Active" },
  { session_id: "SES-882189", user: "Dr. Sunita Deshmukh", role: "Consultant Neuro", ip: "192.168.10.46", terminal: "Doctor-Desk-Neuro", branch: "AMS-MUM", login_time: "2026-10-11 18:20:00", status: "Terminated (Timeout)" }
];

export const AUDIT_TRAIL = [
  { id: "AUD-99120", timestamp: "2026-10-12 11:24:08", module: "E-Prescription (Rx)", user: "Dr. Arvind Rathore", action: "UPDATE_RX", target_uhid: "UHID-2026-004812", details: "Titrated Tab. Atorvastatin from 20mg to 40mg OD HS; Added Tab. Ticagrelor 90mg BD", severity: "Clinical-High" },
  { id: "AUD-99119", timestamp: "2026-10-12 11:15:33", module: "Billing & Cashier", user: "Rohan Verma", action: "ISSUE_REFUND", target_uhid: "UHID-2026-004817", details: "Generated Refund Request RF-2026-00891 for amount ₹1,200 (Duplicate Thyroid panel)", severity: "Financial-Medium" },
  { id: "AUD-99118", timestamp: "2026-10-12 10:48:50", module: "Inpatient Bed Board", user: "Sister Mary Fernandez", action: "BED_TRANSFER", target_uhid: "UHID-2026-004814", details: "Transferred Harish Chandra Gupta from ER-BAY-03 to ICU-BED-01. Vitals verified at transit.", severity: "Clinical-Info" },
  { id: "AUD-99117", timestamp: "2026-10-12 09:30:11", module: "RBAC & Security", user: "Admin Devendra", action: "GRANT_PERMISSION", target_uhid: "N/A", details: "Enabled 'Approve Work Order Receipts' permission for Facility Manager ID EMP-FAC-09", severity: "Security-Warning" }
];

export const SYSTEM_EVENTS = [
  { event_id: "EVT-CRIT-01", event_code: "PANIC_LAB_VALUE", trigger: "Troponin-I > 0.04 ng/mL or Potassium < 2.5 mEq/L", channel: "Immediate SMS + Audio Siren + Doctor Screen Pop", enabled: true },
  { event_id: "EVT-CRIT-02", event_code: "CODE_BLUE_CARDIAC", trigger: "Resuscitation button pressed in Ward/ICU/ER", channel: "Hospital PA Audio + Crash Team Pager Broadcast", enabled: true },
  { event_id: "EVT-CRIT-03", event_code: "NARCOTICS_OVERRIDE", trigger: "Schedule H1 / Fentanyl dispense without digital sign", channel: "Pharmacy CISO Security Audit Flag", enabled: true },
  { event_id: "EVT-CRIT-04", event_code: "TPA_PREAUTH_REJECT", trigger: "Third Party Administrator pre-auth denied", channel: "Billing Manager Alert & Patient SMS notification", enabled: true }
];

// Screenshot 4 Reference: Work Orders & Requisitions
export const WORK_ORDERS = [
  {
    wo_id: "WO-2026-0419",
    type: "Bio-Medical Calibration",
    equipment: "GE Healthcare Vivid E95 Echo Ultrasound",
    department: "Cardiology Lab",
    vendor: "Wipro GE Healthcare India Ltd.",
    estimated_cost: 38500,
    priority: "High",
    status: "Pending Approval",
    requested_by: "Dr. Arvind Rathore",
    date: "2026-10-11",
    action_type: "ORDER"
  },
  {
    wo_id: "WO-2026-0418",
    type: "HVAC HEPA Filter Overhaul",
    equipment: "Laminar Airflow Cleanroom System OT-1",
    department: "Operation Theatre Complex",
    vendor: "Voltas Air-Tech Systems",
    estimated_cost: 92000,
    priority: "Critical",
    status: "Approved & In Progress",
    requested_by: "Facility Eng. Sunil Mehta",
    date: "2026-10-10",
    action_type: "ORDER"
  },
  {
    wo_id: "WO-2026-0417",
    type: "Medical Gas Pipeline Refill & Testing",
    equipment: "Central Oxygen Liquified Cryo-Tank",
    department: "Hospital Utilities & Plant",
    vendor: "Linde India Industrial Gases",
    estimated_cost: 145000,
    priority: "Routine",
    status: "Completed & Verified",
    requested_by: "Facility Eng. Sunil Mehta",
    date: "2026-10-08",
    action_type: "RECEIPT"
  },
  {
    wo_id: "WO-2026-0416",
    type: "Dialysis RO Plant Membrane Replacement",
    equipment: "Water Softener & Reverse Osmosis Unit",
    department: "Nephrology Dialysis Wing",
    vendor: "Fresenius Medical Care",
    estimated_cost: 64000,
    priority: "High",
    status: "Rejected (Price Variance)",
    requested_by: "Dr. Deepa Nair",
    date: "2026-10-07",
    action_type: "ORDER"
  }
];

// Live Bed Board Status for 17.3
export const BEDS_MATRIX = [
  { id: "B-ICU-01", ward: "Cardio ICU (CCU)", number: "ICU-01", status: "Occupied", patient: "Harish Chandra Gupta", doctor: "Dr. Arvind Rathore", o2_type: "High Flow Nasal 60%", monitor_hr: 82, monitor_bp: "128/84", monitor_spo2: 98 },
  { id: "B-ICU-02", ward: "Cardio ICU (CCU)", number: "ICU-02", status: "Occupied", patient: "Devendra S. Patil", doctor: "Dr. Arvind Rathore", o2_type: "BiPAP Vent Support", monitor_hr: 94, monitor_bp: "142/90", monitor_spo2: 96 },
  { id: "B-ICU-03", ward: "Cardio ICU (CCU)", number: "ICU-03", status: "Cleaning / Sanitizing", patient: "Discharged 30m ago", doctor: "-", o2_type: "Available", monitor_hr: 0, monitor_bp: "-", monitor_spo2: 0 },
  { id: "B-ICU-04", ward: "Cardio ICU (CCU)", number: "ICU-04", status: "Available", patient: "-", doctor: "-", o2_type: "Available", monitor_hr: 0, monitor_bp: "-", monitor_spo2: 0 },
  { id: "B-WRD-101", ward: "General Male Ward", number: "M-101", status: "Occupied", patient: "Mohammed Tariq Ansari", doctor: "Dr. Rajesh Kulkarni", o2_type: "Room Air", monitor_hr: 76, monitor_bp: "120/80", monitor_spo2: 99 },
  { id: "B-WRD-102", ward: "General Male Ward", number: "M-102", status: "Reserved (Post-Op Transfer)", patient: "R. K. Verma", doctor: "Dr. Rajesh Kulkarni", o2_type: "Room Air", monitor_hr: 0, monitor_bp: "-", monitor_spo2: 0 },
  { id: "B-WRD-103", ward: "General Male Ward", number: "M-103", status: "Available", patient: "-", doctor: "-", o2_type: "Room Air", monitor_hr: 0, monitor_bp: "-", monitor_spo2: 0 },
  { id: "B-WRD-104", ward: "General Male Ward", number: "M-104", status: "Occupied", patient: "Kailash Narang", doctor: "Dr. Arvind Rathore", o2_type: "Nasal Cannula 2L", monitor_hr: 78, monitor_bp: "134/86", monitor_spo2: 97 },
  { id: "B-PVT-401", ward: "Deluxe Private Suite", number: "PVT-401", status: "Occupied", patient: "Pooja Ramesh Patel", doctor: "Dr. Prachi Verma", o2_type: "Room Air", monitor_hr: 72, monitor_bp: "118/78", monitor_spo2: 99 },
  { id: "B-PVT-402", ward: "Deluxe Private Suite", number: "PVT-402", status: "Available", patient: "-", doctor: "-", o2_type: "Room Air", monitor_hr: 0, monitor_bp: "-", monitor_spo2: 0 },
];

// Blood Bank Inventory (5.1 - 5.5)
export const BLOOD_BANK_INVENTORY = [
  { group: "A+ Positive", prbc_units: 42, ffp_units: 28, platelets: 14, cryo: 9, status: "Adequate" },
  { group: "A- Negative", prbc_units: 8, ffp_units: 6, platelets: 2, cryo: 1, status: "Low Stock" },
  { group: "B+ Positive", prbc_units: 56, ffp_units: 34, platelets: 20, cryo: 12, status: "Adequate" },
  { group: "B- Negative", prbc_units: 5, ffp_units: 4, platelets: 1, cryo: 0, status: "Critical Shortage" },
  { group: "AB+ Positive", prbc_units: 24, ffp_units: 18, platelets: 8, cryo: 5, status: "Adequate" },
  { group: "AB- Negative", prbc_units: 3, ffp_units: 2, platelets: 1, cryo: 0, status: "Critical Shortage" },
  { group: "O+ Positive", prbc_units: 68, ffp_units: 45, platelets: 25, cryo: 16, status: "Optimal" },
  { group: "O- Negative", prbc_units: 9, ffp_units: 7, platelets: 3, cryo: 2, status: "Alert / Donor Call" }
];

// LIS Pathology Tests (19.1 - 19.5)
export const LAB_ORDERS = [
  { req_no: "LAB-2026-901", uhid: "UHID-2026-004812", patient: "Aarav Shantaram Sharma", test_name: "High Sensitivity Troponin-I", value: "0.082 ng/mL", normal_range: "< 0.014 ng/mL", status: "Panic High", flagged: true, pathologist: "Dr. Alok Patwardhan", sample_barcode: "SMP-TRP-881" },
  { req_no: "LAB-2026-902", uhid: "UHID-2026-004812", patient: "Aarav Shantaram Sharma", test_name: "Lipid Profile Panel (Direct LDL)", value: "LDL: 162 mg/dL", normal_range: "< 100 mg/dL", status: "Elevated", flagged: false, pathologist: "Dr. Alok Patwardhan", sample_barcode: "SMP-LIP-882" },
  { req_no: "LAB-2026-903", uhid: "UHID-2026-004814", patient: "Harish Chandra Gupta", test_name: "Serum Creatinine & eGFR", value: "1.1 mg/dL", normal_range: "0.7 - 1.3 mg/dL", status: "Normal", flagged: false, pathologist: "Dr. Alok Patwardhan", sample_barcode: "SMP-RFT-711" },
  { req_no: "LAB-2026-904", uhid: "UHID-2026-004813", patient: "Pooja Ramesh Patel", test_name: "Beta-hCG Quantitative Serum", value: "14,800 mIU/mL", normal_range: "Gestational 5-6 Wks", status: "Normal Positive", flagged: false, pathologist: "Dr. Alok Patwardhan", sample_barcode: "SMP-HCG-319" }
];

// DICOM Radiology Studies (27.1 - 27.5)
export const RADIOLOGY_STUDIES = [
  { accession_no: "RAD-2026-1049", uhid: "UHID-2026-004812", patient: "Aarav Shantaram Sharma", modality: "CT Coronary Angiogram", study_date: "2026-10-12 09:10", images_count: 320, radiologist: "Dr. Rohit Singhania", status: "Report Verified", findings: "Moderate 65% stenosis in Proximal LAD with calcified plaque. No acute rupture." },
  { accession_no: "RAD-2026-1048", uhid: "UHID-2026-004815", patient: "Ananya Devraj Roy", modality: "MRI Right Knee Joint 3T", study_date: "2026-10-12 08:30", images_count: 84, radiologist: "Dr. Rohit Singhania", status: "Dictated Pending Sign", findings: "Full-thickness tear of the Anterior Cruciate Ligament (ACL) with grade-1 MCL sprain." },
  { accession_no: "RAD-2026-1047", uhid: "UHID-2026-004816", patient: "Mohammed Tariq Ansari", modality: "Digital Radiography Femur AP/LAT", study_date: "2026-10-11 17:40", images_count: 4, radiologist: "Dr. Rohit Singhania", status: "Report Verified", findings: "Transverse shaft fracture right femur with mild comminution. Alignment maintained." }
];

// Pharmacy Drug Inventory (25.1 - 25.5 & 28.1 - 28.4)
export const PHARMACY_ITEMS = [
  { id: "MED-001", name: "Atorvastatin Calcium 40mg", salt: "Atorvastatin 40mg", batch: "BT-2025-99A", expiry: "2028-06", stock_packs: 340, unit_price: 18.5, reorder_level: 50, type: "Prescription (Rx)" },
  { id: "MED-002", name: "Ticagrelor 90mg Tablets", salt: "Ticagrelor 90mg", batch: "BT-2025-41C", expiry: "2027-11", stock_packs: 190, unit_price: 42.0, reorder_level: 40, type: "Cardio Antiplatelet" },
  { id: "MED-003", name: "Meropenem 1g Injection", salt: "Meropenem Trihydrate", batch: "BT-2026-12Z", expiry: "2027-04", stock_packs: 48, unit_price: 890.0, reorder_level: 30, type: "Critical Care Antibiotic" },
  { id: "MED-004", name: "Paracetamol 650mg (Dolo)", salt: "Paracetamol 650mg", batch: "BT-2026-88F", expiry: "2028-12", stock_packs: 1200, unit_price: 3.2, reorder_level: 200, type: "Analgesic / OTC" },
  { id: "MED-005", name: "Enoxaparin Sodium 40mg/0.4ml Prefilled", salt: "LMWH Heparin", batch: "BT-2026-04M", expiry: "2027-08", stock_packs: 65, unit_price: 410.0, reorder_level: 25, type: "Anticoagulant" }
];

// Triage Emergency Cases (11.1 - 11.5)
export const EMERGENCY_TRIAGE = [
  { triage_id: "ER-TRI-01", uhid: "UHID-2026-004812", patient: "Aarav S. Sharma", level: "Level 2 (Emergent)", color: "red", arrival: "10 mins ago", chief: "Chest pain radiating to left jaw, BP 160/95, SPO2 95%", bay: "ER Resus Bay 1", status: "ECG in progress" },
  { triage_id: "ER-TRI-02", uhid: "UHID-2026-004815", patient: "Ananya D. Roy", level: "Level 3 (Urgent)", color: "amber", arrival: "25 mins ago", chief: "Severe knee pain post sports fall, swollen", bay: "ER Minor Bay 4", status: "Analgesia given, X-Ray queued" },
  { triage_id: "ER-TRI-03", uhid: "UHID-2026-004818", patient: "Govind Nair", level: "Level 1 (Resuscitation)", color: "rose", arrival: "2 mins ago", chief: "Road Traffic Accident (MLC), severe head trauma, GCS 7", bay: "Crash Bay Red", status: "Intubation & Trauma Protocol Active" },
  { triage_id: "ER-TRI-04", uhid: "UHID-2026-004819", patient: "Simran Kaur", level: "Level 4 (Less Urgent)", color: "emerald", arrival: "40 mins ago", chief: "Fever 101 F, sore throat, cough x 2 days", bay: "ER Fast-Track 2", status: "Vitals stable, awaiting MO" }
];
