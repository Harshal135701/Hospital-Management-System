import {
  Calendar,
  Clock,
  Users,
  Bell,
  CreditCard,
  Receipt,
  FileText,
  DollarSign,
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
  Search
} from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

export const MODULE_GROUPS = [
  { id: 'all', label: 'All Submodules', count: 52 },
  { id: '3', label: '3. Appointments & Queue', count: 4, icon: Calendar },
  { id: '4', label: '4. Billing & POS', count: 6, icon: Receipt },
  { id: '5', label: '5. Blood Bank', count: 5, icon: Droplet },
  { id: '6', label: '6. Clinical Consultation', count: 5, icon: Stethoscope },
  { id: '7', label: '7. TPA & Insurance', count: 5, icon: ShieldCheck },
  { id: '8', label: '8. Day Care Surgery', count: 4, icon: Bed },
  { id: '9', label: '9. Dietary & Kitchen', count: 4, icon: Utensils },
  { id: '10', label: '10. IVF & Reproductive', count: 5, icon: Egg },
  { id: '11', label: '11. Emergency & Trauma', count: 5, icon: Siren },
  { id: '12', label: '12. EMR & Clinical Records', count: 5, icon: FileSpreadsheet },
  { id: '13', label: '13. Hospital Financials', count: 5, icon: Landmark },
  { id: '14', label: '14. Asset & Biomedical', count: 5, icon: Wrench },
  { id: '15', label: '15. Enterprise Master', count: 5, icon: Building2 },
];

export const SUBMODULES = [
  // Module 3
  {
    id: '3.1',
    groupId: '3',
    groupName: 'Appointments & Queue',
    title: 'Book / Reschedule Appointment',
    subtitle: 'Outpatient consultation booking, slot management and cancellations',
    icon: Calendar,
    badge: 'Core'
  },
  {
    id: '3.2',
    groupId: '3',
    groupName: 'Appointments & Queue',
    title: 'Doctor Roster & Shift Planning',
    subtitle: 'Duty shifts, OPD slot allocation, and clinician leave management',
    icon: Clock,
    badge: 'Operations'
  },
  {
    id: '3.3',
    groupId: '3',
    groupName: 'Appointments & Queue',
    title: 'Token Queue & Waiting Room Display',
    subtitle: 'Live token calling, triage queue display, and patient call-outs',
    icon: Users,
    badge: 'Realtime'
  },
  {
    id: '3.4',
    groupId: '3',
    groupName: 'Appointments & Queue',
    title: 'SMS & WhatsApp Reminders & Alerts',
    subtitle: 'Automated SMS/WhatsApp appointment reminders and notifications',
    icon: Bell,
    badge: 'Messaging'
  },

  // Module 4
  {
    id: '4.1',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'OPD Billing POS',
    subtitle: 'Point of sale billing, consultation receipts, and instant invoices',
    icon: Receipt,
    badge: 'Billing'
  },
  {
    id: '4.2',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'IPD Running / Interim Bill',
    subtitle: 'Accumulated in-patient charges, room tariffs, and pharmacy additions',
    icon: CreditCard,
    badge: 'Inpatient'
  },
  {
    id: '4.3',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'Discharge Final Bill',
    subtitle: 'Final clearance, deductions, package settlement, and discharge summary bill',
    icon: FileText,
    badge: 'Settlement'
  },
  {
    id: '4.4',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'Advance Deposit Collection',
    subtitle: 'Pre-admission deposits, surgery advances, and security collections',
    icon: DollarSign,
    badge: 'Cash'
  },
  {
    id: '4.5',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'My Refunds',
    subtitle: 'Refund request processing, authorization workflow, and reversals',
    icon: RefreshCw,
    badge: 'Reversals'
  },
  {
    id: '4.6',
    groupId: '4',
    groupName: 'Billing & POS',
    title: 'Day-End Cashier Settlement',
    subtitle: 'Counter reconciliation, cash drawer balance, and shift handover closing',
    icon: Landmark,
    badge: 'Audit'
  },

  // Module 5
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

  // Module 6
  {
    id: '6.1',
    groupId: '6',
    groupName: 'Clinical Consultation',
    title: 'Doctor Consultation Desk',
    subtitle: 'Outpatient consultation workstation, patient queue, and clinical notes',
    icon: Stethoscope,
    badge: 'Doctor Desk'
  },
  {
    id: '6.2',
    groupId: '6',
    groupName: 'Clinical Consultation',
    title: 'Vitals Recording & Physical Examination',
    subtitle: 'Temperature, pulse, BP, SpO2, BMI, and head-to-toe examination',
    icon: Activity,
    badge: 'Vitals'
  },
  {
    id: '6.3',
    groupId: '6',
    groupName: 'Clinical Consultation',
    title: 'Chief Complaints & Clinical History',
    subtitle: 'Symptom duration, HPI, past surgical/medical history, and drug allergies',
    icon: ClipboardList,
    badge: 'History'
  },
  {
    id: '6.4',
    groupId: '6',
    groupName: 'Clinical Consultation',
    title: 'Computerized Provider Order Entry (CPOE)',
    subtitle: 'Electronic orders for laboratory tests, imaging, and therapeutic procedures',
    icon: FileSpreadsheet,
    badge: 'CPOE'
  },
  {
    id: '6.5',
    groupId: '6',
    groupName: 'Clinical Consultation',
    title: 'Clinical Progress Notes',
    subtitle: 'SOAP structured clinical notes (Subjective, Objective, Assessment, Plan)',
    icon: FileText,
    badge: 'Documentation'
  },

  // Module 7
  {
    id: '7.1',
    groupId: '7',
    groupName: 'TPA & Insurance',
    title: 'TPA & Insurance Pre-Authorization',
    subtitle: 'Cashless treatment approvals, initial pre-authorization, and policy validation',
    icon: ShieldCheck,
    badge: 'Pre-Auth'
  },
  {
    id: '7.2',
    groupId: '7',
    groupName: 'TPA & Insurance',
    title: 'Enhancement Request Management',
    subtitle: 'Mid-stay limit enhancements, clinical justification, and revised approvals',
    icon: ShieldCheck,
    badge: 'Enhancements'
  },
  {
    id: '7.3',
    groupId: '7',
    groupName: 'TPA & Insurance',
    title: 'Claim Dossier Compilation & Submission',
    subtitle: 'Final hospital bills, discharge summary, reports, and claim filing',
    icon: FileSpreadsheet,
    badge: 'Claims'
  },
  {
    id: '7.4',
    groupId: '7',
    groupName: 'TPA & Insurance',
    title: 'Co-Payment & Deductible Collection',
    subtitle: 'Patient responsibility collection, non-covered deductions, and receipts',
    icon: DollarSign,
    badge: 'Patient Share'
  },
  {
    id: '7.5',
    groupId: '7',
    groupName: 'TPA & Insurance',
    title: 'TPA Reconciliation & Payment Posting',
    subtitle: 'Settlement advices, bank remittance matching, and write-off tracking',
    icon: Landmark,
    badge: 'Reconciliation'
  },

  // Module 8
  {
    id: '8.1',
    groupId: '8',
    groupName: 'Day Care Surgery',
    title: 'Day Care Admission & Procedure Booking',
    subtitle: 'Ambulatory surgery scheduling, same-day admissions, and pre-op prep',
    icon: Calendar,
    badge: 'Day Care'
  },
  {
    id: '8.2',
    groupId: '8',
    groupName: 'Day Care Surgery',
    title: 'Chair / Bed Allocation',
    subtitle: 'Recliner pods, recovery bed allocation, bay transfers, and releases',
    icon: Bed,
    badge: 'Resource'
  },
  {
    id: '8.3',
    groupId: '8',
    groupName: 'Day Care Surgery',
    title: 'Clinical Procedure Monitoring',
    subtitle: 'Intra-op vitals, anesthesia recovery logs, and surgical checklist sign-off',
    icon: Activity,
    badge: 'Monitoring'
  },
  {
    id: '8.4',
    groupId: '8',
    groupName: 'Day Care Surgery',
    title: 'Same-Day Discharge Summary',
    subtitle: 'Aldrete recovery scoring, medication instructions, and safe departure',
    icon: CheckCircle2,
    badge: 'Discharge'
  },

  // Module 9
  {
    id: '9.1',
    groupId: '9',
    groupName: 'Dietary & Kitchen',
    title: 'Dietitian Nutritional Assessment',
    subtitle: 'Nutritional goals, calorie requirements, diabetic/renal diet plans, and BMI',
    icon: Utensils,
    badge: 'Nutrition'
  },
  {
    id: '9.2',
    groupId: '9',
    groupName: 'Dietary & Kitchen',
    title: 'Patient Diet Ordering',
    subtitle: 'Breakfast, lunch, and dinner meal orders customized for patient beds',
    icon: Utensils,
    badge: 'Diet Orders'
  },
  {
    id: '9.3',
    groupId: '9',
    groupName: 'Dietary & Kitchen',
    title: 'Kitchen Meal Batch Production',
    subtitle: 'Dietary batching, portion counts, temperature checks, and kitchen shifts',
    icon: Utensils,
    badge: 'Kitchen'
  },
  {
    id: '9.4',
    groupId: '9',
    groupName: 'Dietary & Kitchen',
    title: 'Ward Meal Delivery Tracking',
    subtitle: 'Trolley dispatch, ward delivery timestamps, temperature check, and recipient sign',
    icon: Clock,
    badge: 'Delivery'
  },

  // Module 10
  {
    id: '10.1',
    groupId: '10',
    groupName: 'IVF & Reproductive',
    title: 'Oocyte Retrieval (OPU) Recording',
    subtitle: 'Follicles aspirated, oocytes retrieved, and MII/MI/GV maturity grading',
    icon: Egg,
    badge: 'OPU'
  },
  {
    id: '10.2',
    groupId: '10',
    groupName: 'IVF & Reproductive',
    title: 'Fertilization (Conventional IVF / ICSI)',
    subtitle: 'Sperm preparation, ICSI microinjection, and 2PN fertilization count',
    icon: Egg,
    badge: 'Embryology'
  },
  {
    id: '10.3',
    groupId: '10',
    groupName: 'IVF & Reproductive',
    title: 'Embryo Morphological Grading',
    subtitle: 'Cleavage stage, Day 3 & Day 5 Blastocyst grading (Gardner criteria)',
    icon: Egg,
    badge: 'Grading'
  },
  {
    id: '10.4',
    groupId: '10',
    groupName: 'IVF & Reproductive',
    title: 'Embryo Transfer (ET) Protocol',
    subtitle: 'Fresh/frozen ET, catheter tracking, ultrasound guidance, and luteal support',
    icon: Egg,
    badge: 'Transfer'
  },
  {
    id: '10.5',
    groupId: '10',
    groupName: 'IVF & Reproductive',
    title: 'Embryo Cryostorage Management',
    subtitle: 'Vitrification straws, liquid nitrogen tanks, canister coordinates, and expiry',
    icon: Droplet,
    badge: 'Cryo'
  },

  // Module 11
  {
    id: '11.1',
    groupId: '11',
    groupName: 'Emergency & Trauma',
    title: 'Triage Assessment (Level 1 to 4)',
    subtitle: 'Emergency severity index (ESI), triage vitals, GCS, and pain evaluation',
    icon: Siren,
    badge: 'Triage'
  },
  {
    id: '11.2',
    groupId: '11',
    groupName: 'Emergency & Trauma',
    title: 'Medico-Legal Case (MLC) Registry',
    subtitle: 'Police intimation, RTA, assault, poisoning registry, and injury certificates',
    icon: ShieldCheck,
    badge: 'MLC'
  },
  {
    id: '11.3',
    groupId: '11',
    groupName: 'Emergency & Trauma',
    title: 'Emergency Bay & Bed Allocation',
    subtitle: 'Red Resuscitation, Yellow Monitored, and Green Ambulatory emergency bays',
    icon: Bed,
    badge: 'Emergency Bay'
  },
  {
    id: '11.4',
    groupId: '11',
    groupName: 'Emergency & Trauma',
    title: 'Trauma Clinical Charting',
    subtitle: 'Primary ABCDE survey, FAST ultrasound scan, and Revised Trauma Score',
    icon: Activity,
    badge: 'Trauma'
  },
  {
    id: '11.5',
    groupId: '11',
    groupName: 'Emergency & Trauma',
    title: 'Rapid Disposition (ICU/OT/Ward/Discharge)',
    subtitle: 'Fast-track transfer to Cath Lab, ICU, OT, Inpatient Ward, or discharge',
    icon: CheckCircle2,
    badge: 'Disposition'
  },

  // Module 12
  {
    id: '12.1',
    groupId: '12',
    groupName: 'EMR & Clinical Records',
    title: 'Longitudinal Patient Lifetime Timeline',
    subtitle: 'Unified lifetime medical chronology across consultations, admissions, and labs',
    icon: History,
    badge: 'Timeline'
  },
  {
    id: '12.2',
    groupId: '12',
    groupName: 'EMR & Clinical Records',
    title: 'E-Prescription (Rx) Studio',
    subtitle: 'Drug master search, dosage, frequency, food relation, and pharmacy dispense',
    icon: Pill,
    badge: 'Rx'
  },
  {
    id: '12.3',
    groupId: '12',
    groupName: 'EMR & Clinical Records',
    title: 'ICD-10 & SNOMED Diagnosis Coding',
    subtitle: 'Standardized clinical coding for morbidity, primary, and differential diagnosis',
    icon: FileText,
    badge: 'Coding'
  },
  {
    id: '12.4',
    groupId: '12',
    groupName: 'EMR & Clinical Records',
    title: 'Previous Encounters Browser',
    subtitle: 'Comprehensive encounter lookup across OPD, IPD, and Emergency visits',
    icon: BookOpen,
    badge: 'Encounters'
  },
  {
    id: '12.5',
    groupId: '12',
    groupName: 'EMR & Clinical Records',
    title: 'Clinical Document Attachments',
    subtitle: 'Scanned reports, ECG traces, operative notes, and consent attachments',
    icon: Paperclip,
    badge: 'Documents'
  },

  // Module 13
  {
    id: '13.1',
    groupId: '13',
    groupName: 'Hospital Financials',
    title: 'Chart of Accounts & General Ledger',
    subtitle: 'Double-entry bookkeeping, multi-level account hierarchy, and journal ledger',
    icon: Landmark,
    badge: 'General Ledger'
  },
  {
    id: '13.2',
    groupId: '13',
    groupName: 'Hospital Financials',
    title: 'Debit / Credit Payment Vouchers',
    subtitle: 'Vendor payments, receipt vouchers, contra entries, and cashier disbursements',
    icon: Receipt,
    badge: 'Vouchers'
  },
  {
    id: '13.3',
    groupId: '13',
    groupName: 'Hospital Financials',
    title: 'Doctor Payout & Revenue Share Calculation',
    subtitle: 'Consultant revenue splits on OPD, IPD surgeries, and diagnostics with TDS',
    icon: Award,
    badge: 'Doctor Payout'
  },
  {
    id: '13.4',
    groupId: '13',
    groupName: 'Hospital Financials',
    title: 'Bank Reconciliation',
    subtitle: 'Automated bank statement balancing, ledger discrepancy matching',
    icon: Landmark,
    badge: 'Banking'
  },
  {
    id: '13.5',
    groupId: '13',
    groupName: 'Hospital Financials',
    title: 'Profit & Loss / Balance Sheet Reporting',
    subtitle: 'Executive financial reporting, revenue vs expense, and balance sheet summary',
    icon: BarChart3,
    badge: 'Financials'
  },

  // Module 14
  {
    id: '14.1',
    groupId: '14',
    groupName: 'Asset & Biomedical',
    title: 'Asset Master & Barcode Tagging',
    subtitle: 'Biomedical devices, serial tags, barcode tracking, and equipment locations',
    icon: Tag,
    badge: 'Asset Master'
  },
  {
    id: '14.2',
    groupId: '14',
    groupName: 'Asset & Biomedical',
    title: 'AMC / CMC Service Contracts & Warranties',
    subtitle: 'Vendor annual maintenance contracts, warranty expiry alerts, and terms',
    icon: Handshake,
    badge: 'Contracts'
  },
  {
    id: '14.3',
    groupId: '14',
    groupName: 'Asset & Biomedical',
    title: 'Preventive Maintenance Scheduling',
    subtitle: 'Periodic safety calibrations, electrical safety tests, and checklist signoffs',
    icon: Clock,
    badge: 'Maintenance'
  },
  {
    id: '14.4',
    groupId: '14',
    groupName: 'Asset & Biomedical',
    title: 'Breakdown Reporting & Work Ticket',
    subtitle: 'Downtime reporting, technician work tickets, root-cause, and repair logging',
    icon: Wrench,
    badge: 'Breakdown'
  },
  {
    id: '14.5',
    groupId: '14',
    groupName: 'Asset & Biomedical',
    title: 'Asset Depreciation Calculation',
    subtitle: 'Straight Line Method (SLM) and WDV depreciation schedules and net book value',
    icon: Calculator,
    badge: 'Depreciation'
  },

  // Module 15
  {
    id: '15.1',
    groupId: '15',
    groupName: 'Enterprise Master',
    title: 'Hospital & Branch Master',
    subtitle: 'Multi-hospital entities, branch locations, registration numbers, and GSTIN',
    icon: Building2,
    badge: 'Hospital Master'
  },
  {
    id: '15.2',
    groupId: '15',
    groupName: 'Enterprise Master',
    title: 'Department & Clinic Hierarchy',
    subtitle: 'Clinical disciplines, sub-specialty clinics, floor zones, and department heads',
    icon: Building2,
    badge: 'Clinics'
  },
  {
    id: '15.3',
    groupId: '15',
    groupName: 'Enterprise Master',
    title: 'Doctor & Consultant Master',
    subtitle: 'Clinician profiles, specialties, council registration numbers, and active status',
    icon: Stethoscope,
    badge: 'Doctors'
  },
  {
    id: '15.4',
    groupId: '15',
    groupName: 'Enterprise Master',
    title: 'Service Catalog & Tariff Master',
    subtitle: 'Hospital chargemaster, standard rates, taxes, and service classifications',
    icon: Tag,
    badge: 'Tariff Master'
  },
  {
    id: '15.5',
    groupId: '15',
    groupName: 'Enterprise Master',
    title: 'Corporate Tariff Rate Contracts',
    subtitle: 'Insurance & TPA negotiated rate cards, discount matrices, and validity periods',
    icon: Handshake,
    badge: 'Corporate Rates'
  },
];
