import {
  Calendar,
  Clock,
  Users,
  Bell,
  CreditCard,
  Receipt,
  FileText,
  IndianRupee,
  RefreshCw,
  Landmark,
  Droplet,
  Stethoscope,
  Activity,
  ClipboardList,
  FileSpreadsheet,
  ShieldCheck,
  Bed,
  Utensils,
  Egg,
  Siren,
  History,
  Pill,
  Paperclip,
  BookOpen,
  Calculator,
  Wrench,
  Building2,
  Tag,
  Handshake,
  BarChart3,
  Award,
  Search,
  CheckCircle2,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Eye,
  Camera,
  Radio,
  Sliders,
  UserCheck,
  UserPlus,
  Key,
  Database,
  Lock,
  Archive,
  HeartPulse,
  Syringe,
  ScanLine,
  AlertCircle
} from 'lucide-react';

export const MODULE_GROUPS = [
  { id: '3', label: 'Appointments', count: 4, icon: Calendar, category: 'clinical', description: 'Outpatient consultation bookings, doctor shift rosters, live waiting room queue display, and patient SMS/WhatsApp alerts.' },
  { id: '4', label: 'Billing', count: 6, icon: Receipt, category: 'operations', description: 'OPD POS billing counters, interim IPD running bills, final discharge clearance, deposits, refunds, and cashier day-end settlements.' },
  { id: '5', label: 'Blood Bank', count: 5, icon: Droplet, category: 'diagnostic', description: 'Donor screening, phlebotomy barcoding, component centrifuge separation, serology testing release, and bedside cross-matching.' },
  { id: '6', label: 'Clinical', count: 5, icon: Stethoscope, category: 'clinical', description: 'Doctor consultation workstation, vitals charting, physical examination, chief complaints, CPOE orders, and progress notes.' },
  { id: '7', label: 'Insurance & TPA', count: 5, icon: ShieldCheck, category: 'operations', description: 'Insurance cashless pre-authorization, package enhancement requests, claim dossier compilation, and corporate co-pay collections.' },
  { id: '8', label: 'Day Care', count: 4, icon: Bed, category: 'clinical', description: 'Short-stay day care admissions, chemotherapy/dialysis chair allocation, procedure monitoring, and same-day discharge summaries.' },
  { id: '9', label: 'Diet & Nutrition', count: 4, icon: Utensils, category: 'operations', description: 'Dietitian clinical nutritional assessment, therapeutic diet ordering, kitchen batch meal production, and ward tray delivery tracking.' },
  { id: '10', label: 'IVF Laboratory', count: 5, icon: Egg, category: 'diagnostic', description: 'Oocyte retrieval (OPU) dish logs, ICSI fertilization verification, Gardner embryo grading, embryo transfer, and cryo-tank storage.' },
  { id: '11', label: 'Emergency', count: 5, icon: Siren, category: 'clinical', description: 'Level 1 to 4 Manchester triage, MLC registry, trauma bay resuscitation, trauma charting, and rapid ICU/OT disposition.' },
  { id: '12', label: 'Patient Clinical Records', count: 5, icon: FileSpreadsheet, category: 'clinical', description: 'Longitudinal lifetime patient timeline, e-Prescription studio, ICD-10 & SNOMED CT coding, encounters browser, and attachments.' },
  { id: '13', label: 'Finance & Accounting', count: 5, icon: Landmark, category: 'admin', description: 'Hospital chart of accounts, debit/credit payment vouchers, doctor revenue share payouts, bank reconciliation, and P&L reports.' },
  { id: '14', label: 'Assets & Maintenance', count: 5, icon: Wrench, category: 'admin', description: 'Biomedical equipment master, AMC/CMC warranties, preventive maintenance scheduler, breakdown tickets, and depreciation.' },
  { id: '15', label: 'Hospital & Master Data', count: 5, icon: Building2, category: 'admin', description: 'Multi-branch hospital master, department clinic hierarchy, doctor credentialing, tariff catalog master, and corporate rate contracts.' },
  { id: '16', label: 'Inventory & Stores', count: 5, icon: Package, category: 'operations', description: 'Item master, store requisitions (indents), ward/OT issues, physical audit stock verification, and min/max reorder levels.' },
  { id: '17', label: 'Admission & IPD', count: 6, icon: Bed, category: 'clinical', description: 'Inpatient admission desk, active IPD census, interactive ward bed board matrix, bed transfers, daily rounds, and discharge summaries.' },
  { id: '18', label: 'IVF & Fertility', count: 5, icon: HeartPulse, category: 'diagnostic', description: 'Couple registration and legal consent, stimulation protocols, follicular ultrasound tracking, trigger timing, and cycle outcomes.' },
  { id: '19', label: 'Laboratory', count: 5, icon: Activity, category: 'diagnostic', description: 'Lab test requisitions, phlebotomy tube barcoding, analyzer worklists, result entry with panic value alerts, and pathologist sign-off.' },
  { id: '20', label: 'Medical Records', count: 4, icon: Archive, category: 'admin', description: 'Physical medical record archival, rack tracking, ICD-10 coding audit, birth & death registration, and file loan checkout.' },
  { id: '21', label: 'Nursing', count: 5, icon: HeartPulse, category: 'clinical', description: 'Ward nursing station, intake-output charting, electronic MAR medication execution, doctor order execution, and shift handover.' },
  { id: '22', label: 'OPD', count: 5, icon: Stethoscope, category: 'clinical', description: 'OPD clinic reception desk, patient arrival check-in, token queue pacing, OPD visit slip barcode printing, and follow-up tracking.' },
  { id: '23', label: 'Operation Theatre', count: 5, icon: Syringe, category: 'clinical', description: 'OT slot scheduling, pre-anesthesia checkup (PAC), WHO surgical safety checklist, intra-operative surgical notes, and PACU recovery.' },
  { id: '24', label: 'Patient Registration', count: 5, icon: UserPlus, category: 'clinical', description: 'New patient registration desk, UHID generation with smart card printing, encounter creation, record merge, and demographic updates.' },
  { id: '25', label: 'Pharmacy', count: 5, icon: Pill, category: 'operations', description: 'Prescription dispensing, medicine formulary salt master, FIFO batch expiry management, IPD medicine returns, and reorder indents.' },
  { id: '26', label: 'Purchase & Procurement', count: 5, icon: Truck, category: 'operations', description: 'Purchase requisitions (indents), RFQ vendor quotes comparison, purchase order approval workflows, and GRN inward inspection.' },
  { id: '27', label: 'Radiology', count: 5, icon: ScanLine, category: 'diagnostic', description: 'Modality scheduling, DICOM image acquisition, browser-based PACS viewer, radiology structured authoring, and EMR distribution.' },
  { id: '28', label: 'Retail & OTC', count: 4, icon: ShoppingBag, category: 'operations', description: 'Over-the-counter POS pharmacy desk, instant barcode scanning, multi-mode cash/UPI/card payments, and sales returns.' },
  { id: '29', label: 'System Administration & Security', count: 5, icon: Lock, category: 'admin', description: 'User active sessions monitor, clinical immutable audit trail, department & module permissions, event triggers, and RBAC matrix.' },
  { id: '30', label: 'User Profile & Preferences', count: 5, icon: UserCheck, category: 'admin', description: 'Manage staff user profile, password and 2FA credentials, switch active hospital branch, switch active role, and UI themes.' },
  { id: '31', label: 'Work Orders', count: 6, icon: Wrench, category: 'operations', description: 'Facilities work order records, department requisitions, work order receipts, approval chains, and vendor confirmation receipts.' },
  { id: '32', label: 'Analytics & Data Export', count: 4, icon: BarChart3, category: 'admin', description: 'Cross-module revenue, inventory and OPD analytics, automated data export pipelines, executive KPI widgets, and Excel/CSV exports.' }
];

export const SUBMODULES = [
  // Group 3 — Appointments
  {
    id: '3.1',
    groupId: '3',
    groupName: 'Appointments',
    title: 'Book / Reschedule Appointment',
    subtitle: 'Outpatient consultation booking, slot management, and cancellations',
    icon: Calendar,
    badge: 'Core'
  },
  {
    id: '3.2',
    groupId: '3',
    groupName: 'Appointments',
    title: 'Doctor Roster & Shift Planning',
    subtitle: 'Clinician duty shifts, OPD session slots, and doctor leave approvals',
    icon: Clock,
    badge: 'Operations'
  },
  {
    id: '3.3',
    groupId: '3',
    groupName: 'Appointments',
    title: 'Token Queue / Waiting Room Display',
    subtitle: 'Live token calling, waiting room TV screen display, and patient call-outs',
    icon: Users,
    badge: 'Realtime'
  },
  {
    id: '3.4',
    groupId: '3',
    groupName: 'Appointments',
    title: 'SMS / WhatsApp Reminders & Alerts',
    subtitle: 'Automated SMS and WhatsApp appointment reminders and status notifications',
    icon: Bell,
    badge: 'Messaging'
  },

  // Group 4 — Billing
  {
    id: '4.1',
    groupId: '4',
    groupName: 'Billing',
    title: 'OPD Billing POS',
    subtitle: 'Point of sale billing, consultation receipts, and instant invoices',
    icon: Receipt,
    badge: 'Billing'
  },
  {
    id: '4.2',
    groupId: '4',
    groupName: 'Billing',
    title: 'IPD Running / Interim Bill',
    subtitle: 'Accumulated in-patient charges, room tariffs, and pharmacy additions',
    icon: CreditCard,
    badge: 'Inpatient'
  },
  {
    id: '4.3',
    groupId: '4',
    groupName: 'Billing',
    title: 'Discharge Final Bill',
    subtitle: 'Final clearance, deductions, package settlement, and discharge billing',
    icon: FileText,
    badge: 'Settlement'
  },
  {
    id: '4.4',
    groupId: '4',
    groupName: 'Billing',
    title: 'Advance Deposit Collection',
    subtitle: 'Pre-admission deposits, surgery advances, and security collections',
    icon: IndianRupee,
    badge: 'Cash'
  },
  {
    id: '4.5',
    groupId: '4',
    groupName: 'Billing',
    title: 'My Refunds',
    subtitle: 'Refund request processing, supervisor authorization, and payment reversals',
    icon: RefreshCw,
    badge: 'Reversals'
  },
  {
    id: '4.6',
    groupId: '4',
    groupName: 'Billing',
    title: 'Day-End Cashier Settlement',
    subtitle: 'Counter reconciliation, cash drawer balance, and shift handover closing',
    icon: Landmark,
    badge: 'Audit'
  },

  // Group 5 — Blood Bank
  {
    id: '5.1',
    groupId: '5',
    groupName: 'Blood Bank',
    title: 'Donor Registration & Screening',
    subtitle: 'Voluntary donor records, vital fitness checks, and screening approval',
    icon: Droplet,
    badge: 'Donation'
  },
  {
    id: '5.2',
    groupId: '5',
    groupName: 'Blood Bank',
    title: 'Bag Collection & Phlebotomy Barcoding',
    subtitle: 'Blood bag collection logging, DIN barcode assignment, and volume capture',
    icon: Droplet,
    badge: 'Collection'
  },
  {
    id: '5.3',
    groupId: '5',
    groupName: 'Blood Bank',
    title: 'Component Separation',
    subtitle: 'PRBC, FFP, Platelet Concentrate, and Cryoprecipitate fractionation',
    icon: Droplet,
    badge: 'Lab'
  },
  {
    id: '5.4',
    groupId: '5',
    groupName: 'Blood Bank',
    title: 'Serology Testing & Safe Release',
    subtitle: 'HIV, HBV, HCV, Syphilis, and Malaria clearance verification',
    icon: ShieldCheck,
    badge: 'Safety'
  },
  {
    id: '5.5',
    groupId: '5',
    groupName: 'Blood Bank',
    title: 'Cross Matching & Patient Issue',
    subtitle: 'Major/minor compatibility cross-matching and ward dispatch requisition',
    icon: Droplet,
    badge: 'Transfusion'
  },

  // Group 6 — Clinical
  {
    id: '6.1',
    groupId: '6',
    groupName: 'Clinical',
    title: 'Doctor Consultation Desk',
    subtitle: 'Outpatient consultation workstation, patient queue, and clinical examination',
    icon: Stethoscope,
    badge: 'Doctor Desk'
  },
  {
    id: '6.2',
    groupId: '6',
    groupName: 'Clinical',
    title: 'Vitals Recording & Physical Examination',
    subtitle: 'Temperature, pulse, BP, SpO2, BMI, and head-to-toe examination',
    icon: Activity,
    badge: 'Vitals'
  },
  {
    id: '6.3',
    groupId: '6',
    groupName: 'Clinical',
    title: 'Chief Complaints & Clinical History',
    subtitle: 'Symptom duration, HPI, past surgical/medical history, and drug allergies',
    icon: ClipboardList,
    badge: 'History'
  },
  {
    id: '6.4',
    groupId: '6',
    groupName: 'Clinical',
    title: 'Computerized Provider Order Entry (CPOE)',
    subtitle: 'Electronic orders for laboratory tests, imaging, and therapeutic procedures',
    icon: FileSpreadsheet,
    badge: 'CPOE'
  },
  {
    id: '6.5',
    groupId: '6',
    groupName: 'Clinical',
    title: 'Clinical Progress Notes',
    subtitle: 'SOAP structured clinical progress notes (Subjective, Objective, Assessment, Plan)',
    icon: FileText,
    badge: 'Documentation'
  },

  // Group 7 — TPA & Insurance
  {
    id: '7.1',
    groupId: '7',
    groupName: 'Insurance & TPA',
    title: 'TPA & Insurance Pre-Authorization',
    subtitle: 'Cashless treatment approvals, initial pre-authorization, and policy validation',
    icon: ShieldCheck,
    badge: 'Pre-Auth'
  },
  {
    id: '7.2',
    groupId: '7',
    groupName: 'Insurance & TPA',
    title: 'Enhancement Request Management',
    subtitle: 'Mid-stay limit enhancements, clinical justification, and revised approvals',
    icon: ShieldCheck,
    badge: 'Enhancements'
  },
  {
    id: '7.3',
    groupId: '7',
    groupName: 'Insurance & TPA',
    title: 'Claim Dossier Compilation & Submission',
    subtitle: 'Final hospital bills, discharge summary, reports, and claim filing',
    icon: FileSpreadsheet,
    badge: 'Claims'
  },
  {
    id: '7.4',
    groupId: '7',
    groupName: 'Insurance & TPA',
    title: 'Co-Payment & Deductible Collection',
    subtitle: 'Patient responsibility collection, non-covered deductions, and receipts',
    icon: IndianRupee,
    badge: 'Patient Share'
  },
  {
    id: '7.5',
    groupId: '7',
    groupName: 'Insurance & TPA',
    title: 'TPA Reconciliation & Payment Posting',
    subtitle: 'Settlement advices, bank remittance matching, and write-off tracking',
    icon: Landmark,
    badge: 'Reconciliation'
  },

  // Group 8 — Day Care
  {
    id: '8.1',
    groupId: '8',
    groupName: 'Day Care',
    title: 'Day Care Admission & Procedure Booking',
    subtitle: 'Ambulatory surgery scheduling, same-day admissions, and pre-op prep',
    icon: Calendar,
    badge: 'Day Care'
  },
  {
    id: '8.2',
    groupId: '8',
    groupName: 'Day Care',
    title: 'Chair / Bed Allocation',
    subtitle: 'Recliner pods, recovery bed allocation, bay transfers, and releases',
    icon: Bed,
    badge: 'Resource'
  },
  {
    id: '8.3',
    groupId: '8',
    groupName: 'Day Care',
    title: 'Clinical Procedure Monitoring',
    subtitle: 'Intra-op vitals, anesthesia recovery logs, and surgical checklist sign-off',
    icon: Activity,
    badge: 'Monitoring'
  },
  {
    id: '8.4',
    groupId: '8',
    groupName: 'Day Care',
    title: 'Same-Day Discharge Summary',
    subtitle: 'Aldrete recovery scoring, medication instructions, and safe departure',
    icon: CheckCircle2,
    badge: 'Discharge'
  },

  // Group 9 — Diet & Nutrition
  {
    id: '9.1',
    groupId: '9',
    groupName: 'Diet & Nutrition',
    title: 'Dietitian Nutritional Assessment',
    subtitle: 'Nutritional goals, calorie requirements, diabetic/renal diet plans, and BMI',
    icon: Utensils,
    badge: 'Nutrition'
  },
  {
    id: '9.2',
    groupId: '9',
    groupName: 'Diet & Nutrition',
    title: 'Patient Diet Ordering',
    subtitle: 'Breakfast, lunch, and dinner meal orders customized for patient beds',
    icon: Utensils,
    badge: 'Diet Orders'
  },
  {
    id: '9.3',
    groupId: '9',
    groupName: 'Diet & Nutrition',
    title: 'Kitchen Meal Batch Production',
    subtitle: 'Dietary batching, portion counts, temperature checks, and kitchen shifts',
    icon: Utensils,
    badge: 'Kitchen'
  },
  {
    id: '9.4',
    groupId: '9',
    groupName: 'Diet & Nutrition',
    title: 'Ward Meal Delivery Tracking',
    subtitle: 'Trolley dispatch, ward delivery timestamps, temperature check, and recipient sign',
    icon: Clock,
    badge: 'Delivery'
  },

  // Group 10 — IVF Laboratory
  {
    id: '10.1',
    groupId: '10',
    groupName: 'IVF Laboratory',
    title: 'Oocyte Retrieval (OPU) Recording',
    subtitle: 'Follicles aspirated, oocytes retrieved, and MII/MI/GV maturity grading',
    icon: Egg,
    badge: 'OPU'
  },
  {
    id: '10.2',
    groupId: '10',
    groupName: 'IVF Laboratory',
    title: 'Fertilization (Conventional IVF / ICSI)',
    subtitle: 'Sperm preparation, ICSI microinjection, and 2PN fertilization count',
    icon: Egg,
    badge: 'Embryology'
  },
  {
    id: '10.3',
    groupId: '10',
    groupName: 'IVF Laboratory',
    title: 'Embryo Morphological Grading',
    subtitle: 'Cleavage stage, Day 3 & Day 5 Blastocyst grading (Gardner criteria)',
    icon: Egg,
    badge: 'Grading'
  },
  {
    id: '10.4',
    groupId: '10',
    groupName: 'IVF Laboratory',
    title: 'Embryo Transfer (ET) Protocol',
    subtitle: 'Fresh/frozen ET, catheter tracking, ultrasound guidance, and luteal support',
    icon: Egg,
    badge: 'Transfer'
  },
  {
    id: '10.5',
    groupId: '10',
    groupName: 'IVF Laboratory',
    title: 'Embryo Cryostorage Management',
    subtitle: 'Vitrification straws, liquid nitrogen tanks, canister coordinates, and expiry',
    icon: Droplet,
    badge: 'Cryo'
  },

  // Group 11 — Emergency & Trauma
  {
    id: '11.1',
    groupId: '11',
    groupName: 'Emergency',
    title: 'Triage Assessment (Level 1 to 4)',
    subtitle: 'Emergency severity index (ESI), triage vitals, GCS, and pain evaluation',
    icon: Siren,
    badge: 'Triage'
  },
  {
    id: '11.2',
    groupId: '11',
    groupName: 'Emergency',
    title: 'Medico-Legal Case (MLC) Registry',
    subtitle: 'Police intimation, RTA, assault, poisoning registry, and injury certificates',
    icon: ShieldCheck,
    badge: 'MLC'
  },
  {
    id: '11.3',
    groupId: '11',
    groupName: 'Emergency',
    title: 'Emergency Bay & Bed Allocation',
    subtitle: 'Red Resuscitation, Yellow Monitored, and Green Ambulatory emergency bays',
    icon: Bed,
    badge: 'Emergency Bay'
  },
  {
    id: '11.4',
    groupId: '11',
    groupName: 'Emergency',
    title: 'Trauma Clinical Charting',
    subtitle: 'Primary ABCDE survey, FAST ultrasound scan, and Revised Trauma Score',
    icon: Activity,
    badge: 'Trauma'
  },
  {
    id: '11.5',
    groupId: '11',
    groupName: 'Emergency',
    title: 'Rapid Disposition (ICU/OT/Ward/Discharge)',
    subtitle: 'Fast-track transfer to Cath Lab, ICU, OT, Inpatient Ward, or discharge',
    icon: CheckCircle2,
    badge: 'Disposition'
  },

  // Group 12 — EMR
  {
    id: '12.1',
    groupId: '12',
    groupName: 'Patient Clinical Records',
    title: 'Longitudinal Patient Lifetime Timeline',
    subtitle: 'Unified lifetime medical chronology across consultations, admissions, and labs',
    icon: History,
    badge: 'Timeline'
  },
  {
    id: '12.2',
    groupId: '12',
    groupName: 'Patient Clinical Records',
    title: 'E-Prescription (Rx) Studio',
    subtitle: 'Drug master search, dosage, frequency, food relation, and pharmacy dispense',
    icon: Pill,
    badge: 'Rx'
  },
  {
    id: '12.3',
    groupId: '12',
    groupName: 'Patient Clinical Records',
    title: 'ICD-10 & SNOMED Diagnosis Coding',
    subtitle: 'Standardized clinical coding for morbidity, primary, and differential diagnosis',
    icon: FileText,
    badge: 'Coding'
  },
  {
    id: '12.4',
    groupId: '12',
    groupName: 'Patient Clinical Records',
    title: 'Previous Encounters Browser',
    subtitle: 'Comprehensive encounter lookup across OPD, IPD, and Emergency visits',
    icon: BookOpen,
    badge: 'Encounters'
  },
  {
    id: '12.5',
    groupId: '12',
    groupName: 'Patient Clinical Records',
    title: 'Clinical Document Attachments',
    subtitle: 'Scanned reports, ECG traces, operative notes, and consent attachments',
    icon: Paperclip,
    badge: 'Documents'
  },

  // Group 13 — Finance & Accounts
  {
    id: '13.1',
    groupId: '13',
    groupName: 'Finance & Accounting',
    title: 'Chart of Accounts & General Ledger',
    subtitle: 'Double-entry bookkeeping, multi-level account hierarchy, and journal ledger',
    icon: Landmark,
    badge: 'General Ledger'
  },
  {
    id: '13.2',
    groupId: '13',
    groupName: 'Finance & Accounting',
    title: 'Debit / Credit Payment Vouchers',
    subtitle: 'Vendor payments, receipt vouchers, contra entries, and cashier disbursements',
    icon: Receipt,
    badge: 'Vouchers'
  },
  {
    id: '13.3',
    groupId: '13',
    groupName: 'Finance & Accounting',
    title: 'Doctor Payout & Revenue Share Calculation',
    subtitle: 'Consultant revenue splits on OPD, IPD surgeries, and diagnostics with TDS',
    icon: Award,
    badge: 'Doctor Payout'
  },
  {
    id: '13.4',
    groupId: '13',
    groupName: 'Finance & Accounting',
    title: 'Bank Reconciliation',
    subtitle: 'Automated bank statement balancing, ledger discrepancy matching',
    icon: Landmark,
    badge: 'Banking'
  },
  {
    id: '13.5',
    groupId: '13',
    groupName: 'Finance & Accounting',
    title: 'Profit & Loss / Balance Sheet Reporting',
    subtitle: 'Executive financial reporting, revenue vs expense, and balance sheet summary',
    icon: BarChart3,
    badge: 'Financials'
  },

  // Group 14 — Asset Management
  {
    id: '14.1',
    groupId: '14',
    groupName: 'Assets & Maintenance',
    title: 'Asset Master & Barcode Tagging',
    subtitle: 'Biomedical devices, serial tags, barcode tracking, and equipment locations',
    icon: Tag,
    badge: 'Asset Master'
  },
  {
    id: '14.2',
    groupId: '14',
    groupName: 'Assets & Maintenance',
    title: 'AMC / CMC Service Contracts & Warranties',
    subtitle: 'Vendor annual maintenance contracts, warranty expiry alerts, and terms',
    icon: Handshake,
    badge: 'Contracts'
  },
  {
    id: '14.3',
    groupId: '14',
    groupName: 'Assets & Maintenance',
    title: 'Preventive Maintenance Scheduling',
    subtitle: 'Periodic safety calibrations, electrical safety tests, and checklist signoffs',
    icon: Clock,
    badge: 'Maintenance'
  },
  {
    id: '14.4',
    groupId: '14',
    groupName: 'Assets & Maintenance',
    title: 'Breakdown Reporting & Work Ticket',
    subtitle: 'Downtime reporting, technician work tickets, root-cause, and repair logging',
    icon: Wrench,
    badge: 'Breakdown'
  },
  {
    id: '14.5',
    groupId: '14',
    groupName: 'Assets & Maintenance',
    title: 'Asset Depreciation Calculation',
    subtitle: 'Straight Line Method (SLM) and WDV depreciation schedules and net book value',
    icon: Calculator,
    badge: 'Depreciation'
  },

  // Group 15 — Hospital Administration & Masters
  {
    id: '15.1',
    groupId: '15',
    groupName: 'Hospital & Master Data',
    title: 'Hospital & Branch Master',
    subtitle: 'Multi-hospital entities, branch locations, registration numbers, and GSTIN',
    icon: Building2,
    badge: 'Hospital Master'
  },
  {
    id: '15.2',
    groupId: '15',
    groupName: 'Hospital & Master Data',
    title: 'Department & Clinic Hierarchy',
    subtitle: 'Clinical disciplines, sub-specialty clinics, floor zones, and department heads',
    icon: Building2,
    badge: 'Clinics'
  },
  {
    id: '15.3',
    groupId: '15',
    groupName: 'Hospital & Master Data',
    title: 'Doctor & Consultant Master',
    subtitle: 'Clinician profiles, specialties, council registration numbers, and active status',
    icon: Stethoscope,
    badge: 'Doctors'
  },
  {
    id: '15.4',
    groupId: '15',
    groupName: 'Hospital & Master Data',
    title: 'Service Catalog & Tariff Master',
    subtitle: 'Hospital chargemaster, standard rates, taxes, and service classifications',
    icon: Tag,
    badge: 'Tariff Master'
  },
  {
    id: '15.5',
    groupId: '15',
    groupName: 'Hospital & Master Data',
    title: 'Corporate Tariff Rate Contracts',
    subtitle: 'Insurance & TPA negotiated rate cards, discount matrices, and validity periods',
    icon: Handshake,
    badge: 'Corporate Rates'
  },

  // Group 16 — Inventory & Stores
  {
    id: '16.1',
    groupId: '16',
    groupName: 'Inventory & Stores',
    title: 'Item Master & Material Categories',
    subtitle: 'Central catalogue of consumables, surgical items, and material groupings',
    icon: Package,
    badge: 'Item Master'
  },
  {
    id: '16.2',
    groupId: '16',
    groupName: 'Inventory & Stores',
    title: 'Store Requisition (Indent)',
    subtitle: 'Departmental store indents, consumption requests, and approval workflow',
    icon: FileText,
    badge: 'Indents'
  },
  {
    id: '16.3',
    groupId: '16',
    groupName: 'Inventory & Stores',
    title: 'Store Issue to Wards/OT',
    subtitle: 'Transfer of consumables to inpatient wards, ICUs, and surgical suites',
    icon: Truck,
    badge: 'Issues'
  },
  {
    id: '16.4',
    groupId: '16',
    groupName: 'Inventory & Stores',
    title: 'Physical Stock Verification & Audit',
    subtitle: 'Stock counts, reconciliation of variances, and expiry auditing',
    icon: ClipboardList,
    badge: 'Audit'
  },
  {
    id: '16.5',
    groupId: '16',
    groupName: 'Inventory & Stores',
    title: 'Minimum / Maximum Reorder Alerts',
    subtitle: 'Automated safety stock thresholds, lead-time tracking, and reorder triggers',
    icon: Bell,
    badge: 'Alerts'
  },

  // Group 17 — IPD
  {
    id: '17.1',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'Admission Desk & Form',
    subtitle: 'Inpatient admission capture, admitting consultant, and room allotment',
    icon: Bed,
    badge: 'Admissions'
  },
  {
    id: '17.2',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'My IP Admissions Dashboard',
    subtitle: 'Live inpatient census, length of stay, and treating clinician breakdown',
    icon: Activity,
    badge: 'Census'
  },
  {
    id: '17.3',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'Live Bed Matrix / Bed Board',
    subtitle: 'Real-time interactive ward bed status, occupancy colors, and housekeeping tags',
    icon: Bed,
    badge: 'Bed Board'
  },
  {
    id: '17.4',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'Bed Transfer Management',
    subtitle: 'Inter-ward transfers, ICU upgrade/downgrade requests, and bed handovers',
    icon: RefreshCw,
    badge: 'Transfers'
  },
  {
    id: '17.5',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'Inpatient Doctor Daily Rounds',
    subtitle: 'Daily consultant rounds, clinical assessments, and bedside order reviews',
    icon: Stethoscope,
    badge: 'Daily Rounds'
  },
  {
    id: '17.6',
    groupId: '17',
    groupName: 'Admission & IPD',
    title: 'Discharge Process & Summary',
    subtitle: 'Planned discharge initiation, medical clearance, and discharge summary',
    icon: CheckCircle2,
    badge: 'Discharge'
  },

  // Group 18 — IVF Cycle Management
  {
    id: '18.1',
    groupId: '18',
    groupName: 'IVF & Fertility',
    title: 'Couple Registration & Legal Consent',
    subtitle: 'ART regulatory consent, couple biological records, and legal document capture',
    icon: HeartPulse,
    badge: 'Consent'
  },
  {
    id: '18.2',
    groupId: '18',
    groupName: 'IVF & Fertility',
    title: 'Ovarian Stimulation Protocol',
    subtitle: 'Gonadotropin dosage tracking, protocol selection (antagonist/agonist), and logs',
    icon: Activity,
    badge: 'Stimulation'
  },
  {
    id: '18.3',
    groupId: '18',
    groupName: 'IVF & Fertility',
    title: 'Follicular Ultrasound Tracking',
    subtitle: 'Folliculometry follicular cohort measurements and endometrial thickness charting',
    icon: ScanLine,
    badge: 'Ultrasound'
  },
  {
    id: '18.4',
    groupId: '18',
    groupName: 'IVF & Fertility',
    title: 'Trigger Timing & Scheduling',
    subtitle: 'hCG / GnRH agonist trigger timing, 36-hour countdown, and OPU scheduling',
    icon: Clock,
    badge: 'Trigger'
  },
  {
    id: '18.5',
    groupId: '18',
    groupName: 'IVF & Fertility',
    title: 'Cycle Outcome & Pregnancy Registry',
    subtitle: 'Beta-hCG confirmation, clinical pregnancy tracking, and ART registry reporting',
    icon: CheckCircle2,
    badge: 'Outcomes'
  },

  // Group 19 — Laboratory
  {
    id: '19.1',
    groupId: '19',
    groupName: 'Laboratory',
    title: 'Test Requisition & Billing',
    subtitle: 'Diagnostic test ordering, outpatient lab billing, and panel selection',
    icon: Activity,
    badge: 'Requisitions'
  },
  {
    id: '19.2',
    groupId: '19',
    groupName: 'Laboratory',
    title: 'Phlebotomy & Sample Barcode Labeling',
    subtitle: 'Sample accessioning, barcode tube generation, and phlebotomy collection',
    icon: Tag,
    badge: 'Phlebotomy'
  },
  {
    id: '19.3',
    groupId: '19',
    groupName: 'Laboratory',
    title: 'Instrument Worklist Interfacing',
    subtitle: 'Biochemistry and hematology automated analyzer interfacing (ASTM/HL7)',
    icon: Sliders,
    badge: 'Instruments'
  },
  {
    id: '19.4',
    groupId: '19',
    groupName: 'Laboratory',
    title: 'Result Entry & Panic Value Alerts',
    subtitle: 'Analyte values, reference ranges, critical/panic value notifications',
    icon: AlertCircle,
    badge: 'Panic Alerts'
  },
  {
    id: '19.5',
    groupId: '19',
    groupName: 'Laboratory',
    title: 'Pathologist Verification & Authorization',
    subtitle: 'Digital sign-off, clinical interpretation, and EMR authorization release',
    icon: CheckCircle2,
    badge: 'Verification'
  },

  // Group 20 — Medical Records
  {
    id: '20.1',
    groupId: '20',
    groupName: 'Medical Records',
    title: 'Physical File Archival & Rack Tracking',
    subtitle: 'Physical case sheet indexing, compactor rack location, and barcodes',
    icon: Archive,
    badge: 'Archival'
  },
  {
    id: '20.2',
    groupId: '20',
    groupName: 'Medical Records',
    title: 'ICD-10 & CPT Clinical Coding',
    subtitle: 'Morbidity and mortality coding for insurance dossiers and WHO reporting',
    icon: FileText,
    badge: 'Coding'
  },
  {
    id: '20.3',
    groupId: '20',
    groupName: 'Medical Records',
    title: 'Birth & Death Registration',
    subtitle: 'Statutory birth/death certificates, Form 4A, and municipal reporting',
    icon: Award,
    badge: 'Civil Registry'
  },
  {
    id: '20.4',
    groupId: '20',
    groupName: 'Medical Records',
    title: 'File Checkout & Audit Lending',
    subtitle: 'File lending audit trail, department borrowers, and return tracking',
    icon: BookOpen,
    badge: 'Lending'
  },

  // Group 21 — Nursing
  {
    id: '21.1',
    groupId: '21',
    groupName: 'Nursing',
    title: 'Ward Nursing Workstation',
    subtitle: 'Nurse shift console, active bed assignments, and handover briefings',
    icon: HeartPulse,
    badge: 'Workstation'
  },
  {
    id: '21.2',
    groupId: '21',
    groupName: 'Nursing',
    title: 'Vitals & Intake-Output Charting',
    subtitle: 'Bedside telemetry, fluid balance charts, and drainage recordings',
    icon: Activity,
    badge: 'Charting'
  },
  {
    id: '21.3',
    groupId: '21',
    groupName: 'Nursing',
    title: 'Medication Administration Record (MAR)',
    subtitle: 'Scheduled drug doses, time administration logs, and nurse e-sign',
    icon: Pill,
    badge: 'MAR'
  },
  {
    id: '21.4',
    groupId: '21',
    groupName: 'Nursing',
    title: 'Doctor Order Execution',
    subtitle: 'Implementation of clinician orders, nursing interventions, and verifications',
    icon: CheckCircle2,
    badge: 'Orders'
  },
  {
    id: '21.5',
    groupId: '21',
    groupName: 'Nursing',
    title: 'Shift Handover Notes',
    subtitle: 'SBAR structured nursing handover between morning, evening, and night shifts',
    icon: FileText,
    badge: 'Handover'
  },

  // Group 22 — OPD
  {
    id: '22.1',
    groupId: '22',
    groupName: 'OPD',
    title: 'OPD Clinic Desk Dashboard',
    subtitle: 'Clinic session management, specialty desks, and consultant attendance',
    icon: Stethoscope,
    badge: 'Clinic Desk'
  },
  {
    id: '22.2',
    groupId: '22',
    groupName: 'OPD',
    title: 'Patient Arrival & Check-in',
    subtitle: 'Front-desk patient check-in, token validation, and vitals station routing',
    icon: UserCheck,
    badge: 'Check-in'
  },
  {
    id: '22.3',
    groupId: '22',
    groupName: 'OPD',
    title: 'Consultation Queue Management',
    subtitle: 'OPD waiting room queue coordinator, doctor call console, and triage priority',
    icon: Users,
    badge: 'Queue'
  },
  {
    id: '22.4',
    groupId: '22',
    groupName: 'OPD',
    title: 'OPD Visit Slip Printout',
    subtitle: 'Clinical OPD encounter slip generation with barcode and consultant stamp',
    icon: FileText,
    badge: 'Visit Slip'
  },
  {
    id: '22.5',
    groupId: '22',
    groupName: 'OPD',
    title: 'Follow-up Tracking',
    subtitle: 'Post-consultation follow-up scheduling and chronic patient recall reminders',
    icon: Clock,
    badge: 'Follow-up'
  },

  // Group 23 — Operation Theatre
  {
    id: '23.1',
    groupId: '23',
    groupName: 'Operation Theatre',
    title: 'OT Slot Scheduling & Theatre Roster',
    subtitle: 'Operating room slot allocation, surgeon rosters, and elective booking',
    icon: Syringe,
    badge: 'OT Roster'
  },
  {
    id: '23.2',
    groupId: '23',
    groupName: 'Operation Theatre',
    title: 'Pre-Anesthesia Checkup (PAC)',
    subtitle: 'Pre-operative anesthesia fitness, ASA grading, and airway risk evaluation',
    icon: ShieldCheck,
    badge: 'PAC'
  },
  {
    id: '23.3',
    groupId: '23',
    groupName: 'Operation Theatre',
    title: 'WHO Surgical Safety Checklist',
    subtitle: 'Sign-in, Time-out, and Sign-out perioperative patient safety verification',
    icon: CheckCircle2,
    badge: 'WHO Checklist'
  },
  {
    id: '23.4',
    groupId: '23',
    groupName: 'Operation Theatre',
    title: 'Intra-Operative Anesthesia & Surgical Notes',
    subtitle: 'Surgical findings, implant serial numbers, blood loss, and anesthesia record',
    icon: FileText,
    badge: 'Surgical Notes'
  },
  {
    id: '23.5',
    groupId: '23',
    groupName: 'Operation Theatre',
    title: 'Post-Anesthesia Care Unit (PACU) Recovery',
    subtitle: 'PACU recovery score, vital monitoring, and post-op ward transfer clearance',
    icon: Activity,
    badge: 'PACU'
  },

  // Group 24 — Patient Registration
  {
    id: '24.1',
    groupId: '24',
    groupName: 'Patient Registration',
    title: 'New Patient Registration',
    subtitle: 'Demographics, government ID (Aadhaar/ABHA), emergency contacts, and photo',
    icon: UserPlus,
    badge: 'Registration'
  },
  {
    id: '24.2',
    groupId: '24',
    groupName: 'Patient Registration',
    title: 'UHID Generation & Smart Card Print',
    subtitle: 'Unique health identification number assignment and plastic card printing',
    icon: Tag,
    badge: 'UHID Card'
  },
  {
    id: '24.3',
    groupId: '24',
    groupName: 'Patient Registration',
    title: 'Create New Visit / Encounter',
    subtitle: 'OPD, IPD, Day Care, or Emergency encounter generation with visit category',
    icon: Calendar,
    badge: 'Encounters'
  },
  {
    id: '24.4',
    groupId: '24',
    groupName: 'Patient Registration',
    title: 'Patient Search & Record Merge',
    subtitle: 'Fuzzy patient search, duplicate record detection, and UHID consolidation',
    icon: Search,
    badge: 'Search & Merge'
  },
  {
    id: '24.5',
    groupId: '24',
    groupName: 'Patient Registration',
    title: 'Demographic & Identity Updates',
    subtitle: 'Address revisions, insurance carrier updates, and phone verification',
    icon: RefreshCw,
    badge: 'Updates'
  },

  // Group 25 — Pharmacy
  {
    id: '25.1',
    groupId: '25',
    groupName: 'Pharmacy',
    title: 'Prescription Dispensing (OPD & IPD)',
    subtitle: 'Electronic prescription dispensing, barcoded drug pick, and bill generation',
    icon: Pill,
    badge: 'Dispensing'
  },
  {
    id: '25.2',
    groupId: '25',
    groupName: 'Pharmacy',
    title: 'Medicine Master & Salt Information',
    subtitle: 'Pharmacopoeia master, generic molecule salts, contraindications, and HSN codes',
    icon: BookOpen,
    badge: 'Drug Master'
  },
  {
    id: '25.3',
    groupId: '25',
    groupName: 'Pharmacy',
    title: 'FIFO Batch & Expiry Management',
    subtitle: 'First-in-first-out batch dispensing, near-expiry quarantine, and stock aging',
    icon: Clock,
    badge: 'Batch & Expiry'
  },
  {
    id: '25.4',
    groupId: '25',
    groupName: 'Pharmacy',
    title: 'IPD Unused Medicine Return & Credit',
    subtitle: 'Inpatient unused medications return, credit note generation, and restock',
    icon: RefreshCw,
    badge: 'Returns'
  },
  {
    id: '25.5',
    groupId: '25',
    groupName: 'Pharmacy',
    title: 'Pharmacy Stock Indents & Reorder Alerts',
    subtitle: 'Automated warehouse indents, fast-moving items reorder, and safety levels',
    icon: Package,
    badge: 'Stock Indents'
  },

  // Group 26 — Procurement
  {
    id: '26.1',
    groupId: '26',
    groupName: 'Purchase & Procurement',
    title: 'Purchase Requisition (Indent)',
    subtitle: 'Internal purchase requisition, department approval, and budget allocation',
    icon: FileText,
    badge: 'Requisitions'
  },
  {
    id: '26.2',
    groupId: '26',
    groupName: 'Purchase & Procurement',
    title: 'Request for Quotation (RFQ)',
    subtitle: 'Supplier RFQ generation, item specifications, and vendor tender invites',
    icon: FileSpreadsheet,
    badge: 'RFQ'
  },
  {
    id: '26.3',
    groupId: '26',
    groupName: 'Purchase & Procurement',
    title: 'Vendor Quotation Comparison',
    subtitle: 'Side-by-side L1/L2 vendor rate comparison, commercial terms, and selection',
    icon: Calculator,
    badge: 'Comparison'
  },
  {
    id: '26.4',
    groupId: '26',
    groupName: 'Purchase & Procurement',
    title: 'Purchase Order (PO) Creation & Approval',
    subtitle: 'Formal purchase orders, multi-level management approvals, and delivery milestones',
    icon: ShoppingBag,
    badge: 'Purchase Orders'
  },
  {
    id: '26.5',
    groupId: '26',
    groupName: 'Purchase & Procurement',
    title: 'Goods Receipt Note (GRN) Inward Inspection',
    subtitle: 'Gate entry, physical quality inspection, batch tracking, and GRN acceptance',
    icon: Truck,
    badge: 'GRN Inward'
  },

  // Group 27 — Radiology & PACS
  {
    id: '27.1',
    groupId: '27',
    groupName: 'Radiology',
    title: 'Modality Scheduling & MWL',
    subtitle: 'MRI, CT, X-Ray, and USG machine slot planning with DICOM Modality Worklist',
    icon: ScanLine,
    badge: 'Modality MWL'
  },
  {
    id: '27.2',
    groupId: '27',
    groupName: 'Radiology',
    title: 'DICOM Image Acquisition & PACS Storage',
    subtitle: 'Secure archive of DICOM studies, storage tiering, and series indexing',
    icon: Camera,
    badge: 'PACS Storage'
  },
  {
    id: '27.3',
    groupId: '27',
    groupName: 'Radiology',
    title: 'Browser-based DICOM PACS Viewer',
    subtitle: 'Zero-footprint web viewer with windowing, zoom, pan, and measurement tools',
    icon: Eye,
    badge: 'DICOM Viewer'
  },
  {
    id: '27.4',
    groupId: '27',
    groupName: 'Radiology',
    title: 'Radiology Report Authoring',
    subtitle: 'Radiologist structured reporting templates, voice dictation, and impressions',
    icon: FileText,
    badge: 'Reporting'
  },
  {
    id: '27.5',
    groupId: '27',
    groupName: 'Radiology',
    title: 'Report Verification & EMR Distribution',
    subtitle: 'Final radiologist signature authorization and instant sync to clinician EMR',
    icon: CheckCircle2,
    badge: 'Authorization'
  },

  // Group 28 — Retail POS
  {
    id: '28.1',
    groupId: '28',
    groupName: 'Retail & OTC',
    title: 'Over-the-Counter (OTC) POS Counter',
    subtitle: 'Direct retail sales, walk-in customer counter, and instant receipt printing',
    icon: ShoppingBag,
    badge: 'OTC Counter'
  },
  {
    id: '28.2',
    groupId: '28',
    groupName: 'Retail & OTC',
    title: 'Quick Barcode Scanning & Billing',
    subtitle: 'High-speed barcode checkout, GST rate breakdown, and discount codes',
    icon: Tag,
    badge: 'Barcode Billing'
  },
  {
    id: '28.3',
    groupId: '28',
    groupName: 'Retail & OTC',
    title: 'Multi-Mode Instant Payment',
    subtitle: 'UPI QR code, credit/debit card swipe, cash collection, and split tenders',
    icon: IndianRupee,
    badge: 'Payments'
  },
  {
    id: '28.4',
    groupId: '28',
    groupName: 'Retail & OTC',
    title: 'Retail Sales Return & Cash Refund',
    subtitle: 'Item return against sales invoice, restock verification, and cash refund',
    icon: RefreshCw,
    badge: 'Returns'
  },

  // Group 29 — Security & System Administration
  {
    id: '29.1',
    groupId: '29',
    groupName: 'System Administration & Security',
    title: 'View User Sessions',
    subtitle: 'Active staff logins, terminal IP addresses, session duration, and terminate',
    icon: Users,
    badge: 'Sessions'
  },
  {
    id: '29.2',
    groupId: '29',
    groupName: 'System Administration & Security',
    title: 'System Audit Trail & Clinical Audit Trail',
    subtitle: 'Immutable record of patient data access, medication edits, and admin changes',
    icon: ShieldCheck,
    badge: 'Audit Trail'
  },
  {
    id: '29.3',
    groupId: '29',
    groupName: 'System Administration & Security',
    title: 'Department & Module Master Setup',
    subtitle: 'Clinical disciplines setup, hospital wing configurations, and module flags',
    icon: Building2,
    badge: 'Master Setup'
  },
  {
    id: '29.4',
    groupId: '29',
    groupName: 'System Administration & Security',
    title: 'Event Configuration',
    subtitle: 'System notification triggers, panic alarm webhooks, and SMS templates',
    icon: Bell,
    badge: 'Events'
  },
  {
    id: '29.5',
    groupId: '29',
    groupName: 'System Administration & Security',
    title: 'Role-Based Access Control (RBAC) & Permissions',
    subtitle: 'Clinician, nurse, pharmacist, cashier, and admin permission matrix',
    icon: Lock,
    badge: 'RBAC'
  },

  // Group 30 — User Profile & Preferences
  {
    id: '30.1',
    groupId: '30',
    groupName: 'User Profile & Preferences',
    title: 'Manage Profile',
    subtitle: 'Staff user personal details, contact number, qualification, and signature',
    icon: UserCheck,
    badge: 'Profile'
  },
  {
    id: '30.2',
    groupId: '30',
    groupName: 'User Profile & Preferences',
    title: 'Change Password & Security',
    subtitle: 'Credential updates, multi-factor authentication (MFA), and security logs',
    icon: Key,
    badge: 'Security'
  },
  {
    id: '30.3',
    groupId: '30',
    groupName: 'User Profile & Preferences',
    title: 'Switch Active Hospital Branch',
    subtitle: 'Switch workstation context between multi-hospital branch facilities',
    icon: Building2,
    badge: 'Branch Switcher'
  },
  {
    id: '30.4',
    groupId: '30',
    groupName: 'User Profile & Preferences',
    title: 'Switch Active Role',
    subtitle: 'Toggle user privileges between assigned clinical or administrative roles',
    icon: ShieldCheck,
    badge: 'Role Switcher'
  },
  {
    id: '30.5',
    groupId: '30',
    groupName: 'User Profile & Preferences',
    title: 'User UI Preferences & Theme',
    subtitle: 'Compact density, table row heights, theme color options, and default desk',
    icon: Sliders,
    badge: 'Preferences'
  },

  // Group 31 — Work Orders
  {
    id: '31.1',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'Record Work Order',
    subtitle: 'Service work orders for facility maintenance, IT, and external contractors',
    icon: Wrench,
    badge: 'Work Order'
  },
  {
    id: '31.2',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'Record Work Order Requisition',
    subtitle: 'Departmental maintenance and repair requisitions with priority levels',
    icon: FileText,
    badge: 'Requisitions'
  },
  {
    id: '31.3',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'Record Work Order Receipt',
    subtitle: 'Deliverable completion note, technician service signoff, and spares used',
    icon: CheckCircle2,
    badge: 'Receipts'
  },
  {
    id: '31.4',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'View Work Orders / Requisitions / Receipts',
    subtitle: 'Central consolidated work order tracking and contractor SLA status',
    icon: Eye,
    badge: 'Track Status'
  },
  {
    id: '31.5',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'Approve Work Orders / Confirm Work Orders / Review Rejected',
    subtitle: 'Engineering supervisor and administrative financial approval workflow',
    icon: ShieldCheck,
    badge: 'Approvals'
  },
  {
    id: '31.6',
    groupId: '31',
    groupName: 'Work Orders',
    title: 'Approve Work Order Receipts / Confirm Work Order Receipts',
    subtitle: 'Final work completion acceptance, inspection sign-off, and invoice clearance',
    icon: Award,
    badge: 'Receipt Approvals'
  },

  // Group 32 — Analytics & Data Export
  {
    id: '32.1',
    groupId: '32',
    groupName: 'Analytics & Data Export',
    title: 'Billing, Inventory, Purchase & System Analytics',
    subtitle: 'Operational charts, revenue trends, stock consumption, and turn-around times',
    icon: BarChart3,
    badge: 'Analytics'
  },
  {
    id: '32.2',
    groupId: '32',
    groupName: 'Analytics & Data Export',
    title: 'Billing Data Export & System Data Export',
    subtitle: 'Statutory compliance exports, GST reports, and encrypted system backups',
    icon: Database,
    badge: 'Data Export'
  },
  {
    id: '32.3',
    groupId: '32',
    groupName: 'Analytics & Data Export',
    title: 'Executive KPI Dashboard Widgets',
    subtitle: 'Bed occupancy rate (BOR), average length of stay (ALOS), and hospital OP counts',
    icon: Activity,
    badge: 'Executive KPIs'
  },
  {
    id: '32.4',
    groupId: '32',
    groupName: 'Analytics & Data Export',
    title: 'Tabular Data Export (Excel / CSV)',
    subtitle: 'Filtered tabular reporting exports to CSV, XLSX, and printable formats',
    icon: FileSpreadsheet,
    badge: 'CSV / Excel'
  }
];
