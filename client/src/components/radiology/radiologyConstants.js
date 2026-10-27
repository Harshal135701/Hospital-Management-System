import {
  ScanLine,
  Camera,
  Eye,
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Bell,
  CreditCard,
  Receipt,
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
  ShieldAlert,
  ArrowRightCircle,
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
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Sliders,
  UserCheck,
  UserPlus,
  Key,
  Database,
  Lock,
  Archive,
  HeartPulse,
  Syringe,
  AlertCircle,
  Snowflake,
  Flame,
  LayoutGrid,
  Printer,
  Network,
  FlaskConical,
  Settings,
  Dna,
  Microscope
} from 'lucide-react';

/**
 * Strips leading numeric indices such as "27.1 ", "10. ", "4.5 "
 * so labels render cleanly without numeric prefixes in sidebar and page titles.
 */
export const stripNumericPrefix = (text) => {
  if (!text) return '';
  return text.replace(/^\d+(\.\d+)*\s*[-–.]?\s*/, '').trim();
};

/**
 * The 5 Core Radiology & PACS Submodules (Group 27)
 */
export const RADIOLOGY_CORE_SUBMODULES = [
  {
    id: '27.1',
    routeId: 'radiology:27.1',
    code: '27.1',
    label: 'Modality Scheduling & MWL',
    shortLabel: 'Modality Scheduling',
    icon: ScanLine,
    badge: 'MWL',
    description: 'MRI, CT, X-Ray, and USG machine slot planning with DICOM Modality Worklist (MWL).'
  },
  {
    id: '27.2',
    routeId: 'radiology:27.2',
    code: '27.2',
    label: 'DICOM Image Acquisition & PACS Storage',
    shortLabel: 'PACS Storage',
    icon: Camera,
    badge: 'PACS Storage',
    description: 'Secure archive of DICOM studies, storage tiering, series indexing, and AE node telemetry.'
  },
  {
    id: '27.3',
    routeId: 'radiology:27.3',
    code: '27.3',
    label: 'Browser-based DICOM PACS Viewer',
    shortLabel: 'DICOM PACS Viewer',
    icon: Eye,
    badge: 'PACS Viewer',
    description: 'Zero-footprint web viewer with windowing, zoom, pan, multi-slice, and measurement tools.'
  },
  {
    id: '27.4',
    routeId: 'radiology:27.4',
    code: '27.4',
    label: 'Radiology Report Authoring',
    shortLabel: 'Report Authoring',
    icon: FileText,
    badge: 'Reporting',
    description: 'Radiologist structured reporting templates, findings, impressions, and panic value alerts.'
  },
  {
    id: '27.5',
    routeId: 'radiology:27.5',
    code: '27.5',
    label: 'Report Verification & EMR Distribution',
    shortLabel: 'Verification & EMR',
    icon: CheckCircle2,
    badge: 'Authorization',
    description: 'Digital signature authorization and instant synchronization with clinician EMR timeline.'
  }
];

/**
 * Complete 13 Expandable Groups for Radiology Module
 * EXACTLY as requested in Section 1 of the specification.
 * Clean display labels without numeric prefixes or headings like "Group 1".
 */
export const RADIOLOGY_MODULE_GROUPS = [
  {
    id: 'fertility',
    label: 'Fertility & Reproductive Medicine',
    icon: HeartPulse,
    submodules: [
      { id: '1.1', routeId: 'radiology:1.1', label: 'Semen Analysis Entry', badge: 'Andrology', icon: FlaskConical },
      { id: '1.2', routeId: 'radiology:1.2', label: 'Cryopreservation / Semen Freezing', badge: 'Cryo', icon: Snowflake },
      { id: '1.3', routeId: 'radiology:1.3', label: 'Sample Thaw & Usage', badge: 'Thaw', icon: Flame },
      { id: '1.4', routeId: 'radiology:1.4', label: 'Donor Registry', badge: 'Donor', icon: Users },
      { id: '5.1', routeId: 'radiology:5.1', label: 'Donor Registration & Screening', badge: 'Screening', icon: UserCheck },
      { id: '10.1', routeId: 'radiology:10.1', label: 'Oocyte Retrieval (OPU) Recording', badge: 'OPU', icon: Egg },
      { id: '10.2', routeId: 'radiology:10.2', label: 'Fertilization (Conventional IVF / ICSI)', badge: 'ICSI', icon: Dna },
      { id: '10.3', routeId: 'radiology:10.3', label: 'Embryo Morphological Grading', badge: 'Grading', icon: Microscope },
      { id: '10.4', routeId: 'radiology:10.4', label: 'Embryo Transfer (ET) Protocol', badge: 'Transfer', icon: HeartPulse },
      { id: '10.5', routeId: 'radiology:10.5', label: 'Embryo Cryostorage Management', badge: 'Cryotank', icon: Archive },
      { id: '18.1', routeId: 'radiology:18.1', label: 'Couple Registration & Legal Consent', badge: 'Consent', icon: FileText },
      { id: '18.2', routeId: 'radiology:18.2', label: 'Ovarian Stimulation Protocol', badge: 'Protocol', icon: Activity },
      { id: '18.3', routeId: 'radiology:18.3', label: 'Follicular Ultrasound Tracking', badge: 'Follicle USG', icon: ScanLine },
      { id: '18.4', routeId: 'radiology:18.4', label: 'Trigger Timing & Scheduling', badge: 'Trigger', icon: Clock },
      { id: '18.5', routeId: 'radiology:18.5', label: 'Cycle Outcome & Pregnancy Registry', badge: 'Outcome', icon: CheckCircle2 }
    ]
  },
  {
    id: 'configuration',
    label: 'System Configuration & Hospital Setup',
    icon: Settings,
    submodules: [
      { id: '2.1', routeId: 'radiology:2.1', label: 'Widgets & Dashboard Configuration', badge: 'Widgets', icon: LayoutGrid },
      { id: '2.2', routeId: 'radiology:2.2', label: 'Barcode & Thermal Printer Settings', badge: 'Printer', icon: Printer },
      { id: '2.3', routeId: 'radiology:2.3', label: 'Document Scanner & Attachment Setup', badge: 'Scanner', icon: Camera },
      { id: '2.4', routeId: 'radiology:2.4', label: 'External API Integration Status', badge: 'Gateway', icon: Network },
      { id: '15.1', routeId: 'radiology:15.1', label: 'Hospital & Branch Master', badge: 'Hospital', icon: Building2 },
      { id: '15.2', routeId: 'radiology:15.2', label: 'Department & Clinic Hierarchy', badge: 'Clinics', icon: Building2 },
      { id: '15.3', routeId: 'radiology:15.3', label: 'Doctor & Consultant Master', badge: 'Doctors', icon: UserCheck },
      { id: '15.4', routeId: 'radiology:15.4', label: 'Service Catalog & Tariff Master', badge: 'Tariff', icon: Receipt },
      { id: '15.5', routeId: 'radiology:15.5', label: 'Corporate Tariff Rate Contracts', badge: 'Contracts', icon: Handshake }
    ]
  },
  {
    id: 'appointments-opd',
    label: 'Appointments, OPD & Patient Registration',
    icon: Calendar,
    submodules: [
      { id: '3.1', routeId: 'radiology:3.1', label: 'Book / Reschedule Appointment', badge: 'Booking', icon: Calendar },
      { id: '3.2', routeId: 'radiology:3.2', label: 'Doctor Roster & Shift Planning', badge: 'Roster', icon: Clock },
      { id: '3.3', routeId: 'radiology:3.3', label: 'Token Queue / Waiting Room Display', badge: 'Queue', icon: Users },
      { id: '3.4', routeId: 'radiology:3.4', label: 'SMS / WhatsApp Reminders & Alerts', badge: 'Alerts', icon: Bell },
      { id: '22.1', routeId: 'radiology:22.1', label: 'OPD Clinic Desk Dashboard', badge: 'Desk', icon: Stethoscope },
      { id: '22.2', routeId: 'radiology:22.2', label: 'Patient Arrival & Check-in', badge: 'Check-in', icon: UserCheck },
      { id: '22.3', routeId: 'radiology:22.3', label: 'Consultation Queue Management', badge: 'Queue Flow', icon: Users },
      { id: '22.4', routeId: 'radiology:22.4', label: 'OPD Visit Slip Printout', badge: 'Visit Slip', icon: Printer },
      { id: '22.5', routeId: 'radiology:22.5', label: 'Follow-up Tracking', badge: 'Follow-up', icon: History },
      { id: '24.1', routeId: 'radiology:24.1', label: 'New Patient Registration', badge: 'New Patient', icon: UserPlus },
      { id: '24.2', routeId: 'radiology:24.2', label: 'UHID Generation & Smart Card Print', badge: 'UHID', icon: Tag },
      { id: '24.3', routeId: 'radiology:24.3', label: 'Create New Visit / Encounter', badge: 'Encounter', icon: FileText },
      { id: '24.4', routeId: 'radiology:24.4', label: 'Patient Search & Record Merge', badge: 'Merge', icon: Search },
      { id: '24.5', routeId: 'radiology:24.5', label: 'Demographic & Identity Updates', badge: 'KYC', icon: UserCheck }
    ]
  },
  {
    id: 'billing-finance',
    label: 'Billing, Finance & Insurance',
    icon: Receipt,
    submodules: [
      { id: '4.1', routeId: 'radiology:4.1', label: 'OPD Billing POS', badge: 'POS', icon: CreditCard },
      { id: '4.2', routeId: 'radiology:4.2', label: 'IPD Running / Interim Bill', badge: 'Interim', icon: Receipt },
      { id: '4.3', routeId: 'radiology:4.3', label: 'Discharge Final Bill', badge: 'Discharge', icon: FileText },
      { id: '4.4', routeId: 'radiology:4.4', label: 'Advance Deposit Collection', badge: 'Deposit', icon: IndianRupee },
      { id: '4.5', routeId: 'radiology:4.5', label: 'My Refunds', badge: 'Refunds', icon: RefreshCw },
      { id: '4.6', routeId: 'radiology:4.6', label: 'Day-End Cashier Settlement', badge: 'Day End', icon: Landmark },
      { id: '7.1', routeId: 'radiology:7.1', label: 'TPA & Insurance Pre-Authorization', badge: 'Pre-Auth', icon: ShieldCheck },
      { id: '7.2', routeId: 'radiology:7.2', label: 'Enhancement Request Management', badge: 'Enhancement', icon: FileSpreadsheet },
      { id: '7.3', routeId: 'radiology:7.3', label: 'Claim Dossier Compilation & Submission', badge: 'Dossier', icon: ClipboardList },
      { id: '7.4', routeId: 'radiology:7.4', label: 'Co-Payment & Deductible Collection', badge: 'Co-Pay', icon: CreditCard },
      { id: '7.5', routeId: 'radiology:7.5', label: 'TPA Reconciliation & Payment Posting', badge: 'Recon', icon: CheckCircle2 },
      { id: '13.1', routeId: 'radiology:13.1', label: 'Chart of Accounts & General Ledger', badge: 'Ledger', icon: BookOpen },
      { id: '13.2', routeId: 'radiology:13.2', label: 'Debit / Credit Payment Vouchers', badge: 'Vouchers', icon: Calculator },
      { id: '13.3', routeId: 'radiology:13.3', label: 'Doctor Payout & Revenue Share Calculation', badge: 'Payout', icon: IndianRupee },
      { id: '13.4', routeId: 'radiology:13.4', label: 'Bank Reconciliation', badge: 'Bank Recon', icon: Landmark },
      { id: '13.5', routeId: 'radiology:13.5', label: 'Profit & Loss / Balance Sheet Reporting', badge: 'P&L', icon: BarChart3 }
    ]
  },
  {
    id: 'clinical-emr',
    label: 'Clinical Care & Electronic Medical Records',
    icon: Stethoscope,
    submodules: [
      { id: '6.1', routeId: 'radiology:6.1', label: 'Doctor Consultation Desk', badge: 'Consult', icon: Stethoscope },
      { id: '6.2', routeId: 'radiology:6.2', label: 'Vitals Recording & Physical Examination', badge: 'Vitals', icon: Activity },
      { id: '6.3', routeId: 'radiology:6.3', label: 'Chief Complaints & Clinical History', badge: 'History', icon: ClipboardList },
      { id: '6.4', routeId: 'radiology:6.4', label: 'Computerized Provider Order Entry (CPOE)', badge: 'CPOE', icon: FileSpreadsheet },
      { id: '6.5', routeId: 'radiology:6.5', label: 'Clinical Progress Notes', badge: 'Notes', icon: FileText },
      { id: '12.1', routeId: 'radiology:12.1', label: 'Longitudinal Patient Lifetime Timeline', badge: 'Timeline', icon: Clock },
      { id: '12.2', routeId: 'radiology:12.2', label: 'E-Prescription (Rx) Studio', badge: 'Rx Studio', icon: Pill },
      { id: '12.3', routeId: 'radiology:12.3', label: 'ICD-10 & SNOMED Diagnosis Coding', badge: 'Coding', icon: Tag },
      { id: '12.4', routeId: 'radiology:12.4', label: 'Previous Encounters Browser', badge: 'Encounters', icon: History },
      { id: '12.5', routeId: 'radiology:12.5', label: 'Clinical Document Attachments', badge: 'Attachments', icon: Paperclip },
      { id: '20.2', routeId: 'radiology:20.2', label: 'ICD-10 & CPT Clinical Coding', badge: 'CPT Coding', icon: Tag },
      { id: '20.3', routeId: 'radiology:20.3', label: 'Birth & Death Registration', badge: 'Vital Registry', icon: FileText }
    ]
  },
  {
    id: 'inpatient-nursing',
    label: 'Inpatient, Nursing & Day Care',
    icon: Bed,
    submodules: [
      { id: '8.1', routeId: 'radiology:8.1', label: 'Day Care Admission & Procedure Booking', badge: 'Day Care', icon: Bed },
      { id: '8.2', routeId: 'radiology:8.2', label: 'Chair / Bed Allocation', badge: 'Chair Bay', icon: Bed },
      { id: '8.3', routeId: 'radiology:8.3', label: 'Clinical Procedure Monitoring', badge: 'Monitoring', icon: Activity },
      { id: '8.4', routeId: 'radiology:8.4', label: 'Same-Day Discharge Summary', badge: 'Discharge', icon: FileText },
      { id: '17.1', routeId: 'radiology:17.1', label: 'Admission Desk & Form', badge: 'Admission', icon: Bed },
      { id: '17.2', routeId: 'radiology:17.2', label: 'My IP Admissions Dashboard', badge: 'Census', icon: Users },
      { id: '17.3', routeId: 'radiology:17.3', label: 'Live Bed Matrix / Bed Board', badge: 'Bed Matrix', icon: LayoutGrid },
      { id: '17.4', routeId: 'radiology:17.4', label: 'Bed Transfer Management', badge: 'Transfer', icon: ArrowRightCircle },
      { id: '17.5', routeId: 'radiology:17.5', label: 'Inpatient Doctor Daily Rounds', badge: 'Rounds', icon: Stethoscope },
      { id: '17.6', routeId: 'radiology:17.6', label: 'Discharge Process & Summary', badge: 'Summary', icon: FileText },
      { id: '21.1', routeId: 'radiology:21.1', label: 'Ward Nursing Workstation', badge: 'Station', icon: HeartPulse },
      { id: '21.2', routeId: 'radiology:21.2', label: 'Vitals & Intake-Output Charting', badge: 'I/O Chart', icon: Activity },
      { id: '21.3', routeId: 'radiology:21.3', label: 'Medication Administration Record (MAR)', badge: 'e-MAR', icon: Pill },
      { id: '21.4', routeId: 'radiology:21.4', label: 'Doctor Order Execution', badge: 'Orders', icon: ClipboardList },
      { id: '21.5', routeId: 'radiology:21.5', label: 'Shift Handover Notes', badge: 'SBAR', icon: FileText }
    ]
  },
  {
    id: 'emergency-trauma',
    label: 'Emergency & Trauma Care',
    icon: Siren,
    submodules: [
      { id: '11.1', routeId: 'radiology:11.1', label: 'Triage Assessment (Level 1 to 4)', badge: 'Triage', icon: Siren },
      { id: '11.2', routeId: 'radiology:11.2', label: 'Medico-Legal Case (MLC) Registry', badge: 'MLC', icon: ShieldAlert },
      { id: '11.3', routeId: 'radiology:11.3', label: 'Emergency Bay & Bed Allocation', badge: 'Bays', icon: Bed },
      { id: '11.4', routeId: 'radiology:11.4', label: 'Trauma Clinical Charting', badge: 'Trauma', icon: Activity },
      { id: '11.5', routeId: 'radiology:11.5', label: 'Rapid Disposition (ICU/OT/Ward/Discharge)', badge: 'Disposition', icon: ArrowRightCircle }
    ]
  },
  {
    id: 'laboratory-bloodbank',
    label: 'Laboratory & Blood Bank',
    icon: FlaskConical,
    submodules: [
      { id: '5.1', routeId: 'radiology:5.1', label: 'Donor Registration & Screening', badge: 'Donor Screen', icon: Users },
      { id: '5.2', routeId: 'radiology:5.2', label: 'Bag Collection & Phlebotomy Barcoding', badge: 'Phlebotomy', icon: Droplet },
      { id: '5.3', routeId: 'radiology:5.3', label: 'Component Separation', badge: 'Components', icon: Layers },
      { id: '5.4', routeId: 'radiology:5.4', label: 'Serology Testing & Safe Release', badge: 'Serology', icon: ShieldCheck },
      { id: '5.5', routeId: 'radiology:5.5', label: 'Cross Matching & Patient Issue', badge: 'Crossmatch', icon: CheckCircle2 },
      { id: '19.1', routeId: 'radiology:19.1', label: 'Test Requisition & Billing', badge: 'Requisition', icon: FileText },
      { id: '19.2', routeId: 'radiology:19.2', label: 'Phlebotomy & Sample Barcode Labeling', badge: 'Sample Draw', icon: Tag },
      { id: '19.3', routeId: 'radiology:19.3', label: 'Instrument Worklist Interfacing', badge: 'Analyzer', icon: Activity },
      { id: '19.4', routeId: 'radiology:19.4', label: 'Result Entry & Panic Value Alerts', badge: 'Panic Alerts', icon: AlertCircle },
      { id: '19.5', routeId: 'radiology:19.5', label: 'Pathologist Verification & Authorization', badge: 'Sign-off', icon: CheckCircle2 }
    ]
  },
  {
    id: 'radiology-pacs',
    label: 'Radiology & PACS',
    icon: ScanLine,
    submodules: [
      { id: '27.1', routeId: 'radiology:27.1', label: 'Modality Scheduling & MWL', badge: 'MWL', icon: ScanLine },
      { id: '27.2', routeId: 'radiology:27.2', label: 'DICOM Image Acquisition & PACS Storage', badge: 'PACS Storage', icon: Camera },
      { id: '27.3', routeId: 'radiology:27.3', label: 'Browser-based DICOM PACS Viewer', badge: 'PACS Viewer', icon: Eye },
      { id: '27.4', routeId: 'radiology:27.4', label: 'Radiology Report Authoring', badge: 'Reporting', icon: FileText },
      { id: '27.5', routeId: 'radiology:27.5', label: 'Report Verification & EMR Distribution', badge: 'Authorization', icon: CheckCircle2 }
    ]
  },
  {
    id: 'nutrition-dietary',
    label: 'Nutrition & Dietary Services',
    icon: Utensils,
    submodules: [
      { id: '9.1', routeId: 'radiology:9.1', label: 'Dietitian Nutritional Assessment', badge: 'Nutrition', icon: Utensils },
      { id: '9.2', routeId: 'radiology:9.2', label: 'Patient Diet Ordering', badge: 'Diet Order', icon: ClipboardList },
      { id: '9.3', routeId: 'radiology:9.3', label: 'Kitchen Meal Batch Production', badge: 'Kitchen Batch', icon: Package },
      { id: '9.4', routeId: 'radiology:9.4', label: 'Ward Meal Delivery Tracking', badge: 'Tray Delivery', icon: Truck }
    ]
  },
  {
    id: 'ot-surgical',
    label: 'Operation Theatre & Surgical Care',
    icon: Syringe,
    submodules: [
      { id: '23.1', routeId: 'radiology:23.1', label: 'OT Slot Scheduling & Theatre Roster', badge: 'OT Roster', icon: Calendar },
      { id: '23.2', routeId: 'radiology:23.2', label: 'Pre-Anesthesia Checkup (PAC)', badge: 'PAC Clearance', icon: ShieldCheck },
      { id: '23.3', routeId: 'radiology:23.3', label: 'WHO Surgical Safety Checklist', badge: 'WHO Checklist', icon: ClipboardList },
      { id: '23.4', routeId: 'radiology:23.4', label: 'Intra-Operative Anesthesia & Surgical Notes', badge: 'Surgical Notes', icon: Activity },
      { id: '23.5', routeId: 'radiology:23.5', label: 'Post-Anesthesia Care Unit (PACU) Recovery', badge: 'PACU', icon: Clock }
    ]
  },
  {
    id: 'pharmacy-inventory',
    label: 'Pharmacy, Inventory & Procurement',
    icon: Pill,
    submodules: [
      { id: '25.1', routeId: 'radiology:25.1', label: 'Prescription Dispensing (OPD & IPD)', badge: 'Dispense', icon: Pill },
      { id: '25.2', routeId: 'radiology:25.2', label: 'Medicine Master & Salt Information', badge: 'Formulary', icon: BookOpen },
      { id: '25.3', routeId: 'radiology:25.3', label: 'FIFO Batch & Expiry Management', badge: 'FIFO Batch', icon: Layers },
      { id: '25.4', routeId: 'radiology:25.4', label: 'IPD Unused Medicine Return & Credit', badge: 'Return', icon: RefreshCw },
      { id: '25.5', routeId: 'radiology:25.5', label: 'Pharmacy Stock Indents & Reorder Alerts', badge: 'Reorder', icon: Bell },
      { id: '16.1', routeId: 'radiology:16.1', label: 'Item Master & Material Categories', badge: 'Items', icon: Package },
      { id: '16.2', routeId: 'radiology:16.2', label: 'Store Requisition (Indent)', badge: 'Indent', icon: FileText },
      { id: '16.3', routeId: 'radiology:16.3', label: 'Store Issue to Wards/OT', badge: 'Store Issue', icon: Truck },
      { id: '16.4', routeId: 'radiology:16.4', label: 'Physical Stock Verification & Audit', badge: 'Audit', icon: CheckCircle2 },
      { id: '16.5', routeId: 'radiology:16.5', label: 'Minimum / Maximum Reorder Alerts', badge: 'Min/Max', icon: AlertCircle },
      { id: '26.1', routeId: 'radiology:26.1', label: 'Purchase Requisition (Indent)', badge: 'Purchase Indent', icon: ShoppingBag },
      { id: '26.2', routeId: 'radiology:26.2', label: 'Request for Quotation (RFQ)', badge: 'RFQ', icon: FileSpreadsheet },
      { id: '26.3', routeId: 'radiology:26.3', label: 'Vendor Quotation Comparison', badge: 'Quotes', icon: Layers },
      { id: '26.4', routeId: 'radiology:26.4', label: 'Purchase Order (PO) Creation & Approval', badge: 'PO Approval', icon: CheckCircle2 },
      { id: '26.5', routeId: 'radiology:26.5', label: 'Goods Receipt Note (GRN) Inward Inspection', badge: 'GRN Inward', icon: Truck }
    ]
  },
  {
    id: 'mrd-assets',
    label: 'Medical Records, Assets & Maintenance',
    icon: Archive,
    submodules: [
      { id: '20.1', routeId: 'radiology:20.1', label: 'Physical File Archival & Rack Tracking', badge: 'Archival', icon: Archive },
      { id: '20.4', routeId: 'radiology:20.4', label: 'File Checkout & Audit Lending', badge: 'File Checkout', icon: BookOpen },
      { id: '14.1', routeId: 'radiology:14.1', label: 'Asset Master & Barcode Tagging', badge: 'Assets', icon: Tag },
      { id: '14.2', routeId: 'radiology:14.2', label: 'AMC / CMC Service Contracts & Warranties', badge: 'AMC/CMC', icon: Handshake },
      { id: '14.3', routeId: 'radiology:14.3', label: 'Preventive Maintenance Scheduling', badge: 'PM Schedule', icon: Wrench },
      { id: '14.4', routeId: 'radiology:14.4', label: 'Breakdown Reporting & Work Ticket', badge: 'Breakdown', icon: AlertCircle },
      { id: '14.5', routeId: 'radiology:14.5', label: 'Asset Depreciation Calculation', badge: 'Depreciation', icon: Calculator }
    ]
  }
];

/**
 * Flat list of all submodules across all 13 groups for lookup
 */
export const ALL_RADIOLOGY_SUBMODULES = RADIOLOGY_MODULE_GROUPS.flatMap(group =>
  group.submodules.map(sub => ({
    ...sub,
    groupId: group.id,
    groupLabel: group.label
  }))
);

export const findRadiologySubmoduleById = (subId) => {
  if (!subId) return null;
  const clean = String(subId).replace('radiology:', '').replace('submodule:', '');
  return ALL_RADIOLOGY_SUBMODULES.find(s => s.id === clean || s.routeId === subId);
};

export const findRadiologyGroupBySubmoduleId = (subId) => {
  const sub = findRadiologySubmoduleById(subId);
  if (!sub) return null;
  return RADIOLOGY_MODULE_GROUPS.find(g => g.id === sub.groupId);
};

/**
 * Supported Modalities Configuration
 */
export const SUPPORTED_MODALITIES = [
  { id: 'XR', label: 'X-Ray (XR)', fullName: 'Digital Radiography (X-Ray)', room: 'Radio Suite 1', color: '#0284c7' },
  { id: 'CT', label: 'CT Scan (CT)', fullName: 'Computed Tomography (128-Slice)', room: 'CT Gantry Suite A', color: '#d97706' },
  { id: 'MRI', label: 'MRI (3.0T)', fullName: 'Magnetic Resonance Imaging (3.0T)', room: 'Supercon Suite B', color: '#7c3aed' },
  { id: 'USG', label: 'Ultrasound (USG)', fullName: 'Ultrasound & Color Doppler', room: 'USG Room 2', color: '#059669' },
  { id: 'MAMMO', label: 'Mammography', fullName: 'Digital Full-Field Mammography', room: 'Women Health Bay', color: '#e11d48' }
];

export const STUDY_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', variant: 'blue' },
  arrived: { label: 'Patient Arrived', variant: 'amber' },
  in_progress: { label: 'In Progress / Scanning', variant: 'purple' },
  completed: { label: 'Scan Completed', variant: 'teal' },
  cancelled: { label: 'Cancelled', variant: 'secondary' }
};

export const REPORT_STATUS_CONFIG = {
  draft: { label: 'Draft Report', variant: 'amber' },
  preliminary: { label: 'Preliminary', variant: 'blue' },
  verified: { label: 'Authorized & Verified', variant: 'teal' },
  distributed: { label: 'Distributed to EMR', variant: 'green' }
};

export const PRIORITY_CONFIG = {
  routine: { label: 'Routine', variant: 'secondary' },
  urgent: { label: 'Urgent', variant: 'amber' },
  stat: { label: 'STAT / Emergency', variant: 'danger' }
};
