import {
  FlaskConical,
  Settings,
  Calendar,
  Receipt,
  Droplet,
  Stethoscope,
  ShieldCheck,
  Bed,
  Utensils,
  Egg,
  Siren,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Landmark,
  Wrench,
  Building2,
  Package,
  BedDouble,
  HeartPulse,
  Activity,
  Archive,
  Users,
  Syringe,
  Snowflake,
  Flame,
  LayoutGrid,
  Printer,
  Network,
  Clock,
  Bell,
  CreditCard,
  IndianRupee,
  RefreshCw,
  CheckCircle2,
  ClipboardList,
  CheckSquare,
  Paperclip,
  Tag,
  Pill,
  BookOpen,
  TrendingUp,
  Calculator,
  List,
  FileCheck,
  FileInput,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  UserPlus,
  LayoutDashboard,
  Grid,
  ArrowRightLeft,
  UserCheck,
  Eye,
  Award,
  Barcode,
  Cpu,
  CheckCheck,
  FolderArchive,
  FileCode,
  FileHeart,
  FileClock,
  Heart,
  ListOrdered,
  FileEdit,
  ArrowRightCircle
} from 'lucide-react';

/**
 * 23 Operation Theatre (OT) Workspace Module Groups
 * Groups 1 through 23, exactly 111 submodules.
 * Design aligned with the Appointment module sidebar pattern.
 */
export const OT_MODULE_GROUPS = [
  {
    id: '1',
    code: '1',
    name: 'Semen & Cryopreservation',
    label: 'Semen & Cryopreservation',
    shortLabel: 'Semen & Cryo',
    icon: FlaskConical,
    submodules: [
      { id: '1.1', routeId: 'ot:1.1', label: '1.1 Semen Analysis Entry', shortLabel: 'Semen Analysis', icon: FlaskConical },
      { id: '1.2', routeId: 'ot:1.2', label: '1.2 Cryopreservation / Semen Freezing', shortLabel: 'Cryopreservation', icon: Snowflake },
      { id: '1.3', routeId: 'ot:1.3', label: '1.3 Sample Thaw & Usage', shortLabel: 'Sample Thawing', icon: Flame },
      { id: '1.4', routeId: 'ot:1.4', label: '1.4 Donor Registry', shortLabel: 'Donor Registry', icon: Users }
    ]
  },
  {
    id: '2',
    code: '2',
    name: 'System Configuration',
    label: 'System Configuration',
    shortLabel: 'System Config',
    icon: Settings,
    submodules: [
      { id: '2.1', routeId: 'ot:2.1', label: '2.1 Widgets & Dashboard Configuration', shortLabel: 'Dashboard Widgets', icon: LayoutGrid },
      { id: '2.2', routeId: 'ot:2.2', label: '2.2 Barcode & Thermal Printer Settings', shortLabel: 'Printer Settings', icon: Printer },
      { id: '2.3', routeId: 'ot:2.3', label: '2.3 Document Scanner & Attachment Setup', shortLabel: 'Scanner Setup', icon: FileSpreadsheet },
      { id: '2.4', routeId: 'ot:2.4', label: '2.4 External API Integration Status', shortLabel: 'API Gateways', icon: Network }
    ]
  },
  {
    id: '3',
    code: '3',
    name: 'Appointment Management',
    label: 'Appointment Management',
    shortLabel: 'Appointments',
    icon: Calendar,
    submodules: [
      { id: '3.1', routeId: 'ot:3.1', label: '3.1 Book / Reschedule Appointment', shortLabel: 'Book Appointment', icon: Calendar },
      { id: '3.2', routeId: 'ot:3.2', label: '3.2 Doctor Roster & Shift Planning', shortLabel: 'Doctor Roster', icon: Clock },
      { id: '3.3', routeId: 'ot:3.3', label: '3.3 Token Queue / Waiting Room Display', shortLabel: 'Token Queue', icon: Users },
      { id: '3.4', routeId: 'ot:3.4', label: '3.4 SMS / WhatsApp Reminders & Alerts', shortLabel: 'Reminders & Alerts', icon: Bell }
    ]
  },
  {
    id: '4',
    code: '4',
    name: 'Billing & Cashier',
    label: 'Billing & Cashier',
    shortLabel: 'Billing & Cashier',
    icon: Receipt,
    submodules: [
      { id: '4.1', routeId: 'ot:4.1', label: '4.1 OPD Billing POS', shortLabel: 'OPD Billing', icon: Receipt },
      { id: '4.2', routeId: 'ot:4.2', label: '4.2 IPD Running / Interim Bill', shortLabel: 'IPD Running Bill', icon: FileSpreadsheet },
      { id: '4.3', routeId: 'ot:4.3', label: '4.3 Discharge Final Bill', shortLabel: 'Discharge Final Bill', icon: FileCheck },
      { id: '4.4', routeId: 'ot:4.4', label: '4.4 Advance Deposit Collection', shortLabel: 'Advance Deposits', icon: CreditCard },
      { id: '4.5', routeId: 'ot:4.5', label: '4.5 My Refunds', shortLabel: 'Refunds Desk', icon: IndianRupee },
      { id: '4.6', routeId: 'ot:4.6', label: '4.6 Day-End Cashier Settlement', shortLabel: 'Cashier Settlement', icon: RefreshCw }
    ]
  },
  {
    id: '5',
    code: '5',
    name: 'Blood Bank',
    label: 'Blood Bank',
    shortLabel: 'Blood Bank',
    icon: Droplet,
    submodules: [
      { id: '5.1', routeId: 'ot:5.1', label: '5.1 Donor Registration & Screening', shortLabel: 'Donor Screening', icon: Users },
      { id: '5.2', routeId: 'ot:5.2', label: '5.2 Bag Collection & Phlebotomy Barcoding', shortLabel: 'Bag Collection', icon: Droplet },
      { id: '5.3', routeId: 'ot:5.3', label: '5.3 Component Separation', shortLabel: 'Component Separation', icon: Activity },
      { id: '5.4', routeId: 'ot:5.4', label: '5.4 Serology Testing & Safe Release', shortLabel: 'Serology Release', icon: ShieldCheck },
      { id: '5.5', routeId: 'ot:5.5', label: '5.5 Cross Matching & Patient Issue', shortLabel: 'Crossmatch Issue', icon: CheckCircle2 }
    ]
  },
  {
    id: '6',
    code: '6',
    name: 'Clinical Consultation',
    label: 'Clinical Consultation',
    shortLabel: 'Clinical Consult',
    icon: Stethoscope,
    submodules: [
      { id: '6.1', routeId: 'ot:6.1', label: '6.1 Doctor Consultation Desk', shortLabel: 'Consultation Desk', icon: Stethoscope },
      { id: '6.2', routeId: 'ot:6.2', label: '6.2 Vitals Recording & Physical Examination', shortLabel: 'Vitals Recording', icon: Activity },
      { id: '6.3', routeId: 'ot:6.3', label: '6.3 Chief Complaints & Clinical History', shortLabel: 'Chief Complaints', icon: ClipboardList },
      { id: '6.4', routeId: 'ot:6.4', label: '6.4 Computerized Provider Order Entry (CPOE)', shortLabel: 'CPOE Orders', icon: CheckSquare },
      { id: '6.5', routeId: 'ot:6.5', label: '6.5 Clinical Progress Notes', shortLabel: 'Progress Notes', icon: FileText }
    ]
  },
  {
    id: '7',
    code: '7',
    name: 'Insurance & TPA',
    label: 'Insurance & TPA',
    shortLabel: 'Insurance & TPA',
    icon: ShieldCheck,
    submodules: [
      { id: '7.1', routeId: 'ot:7.1', label: '7.1 TPA & Insurance Pre-Authorization', shortLabel: 'Pre-Authorization', icon: ShieldCheck },
      { id: '7.2', routeId: 'ot:7.2', label: '7.2 Enhancement Request Management', shortLabel: 'Enhancements', icon: RefreshCw },
      { id: '7.3', routeId: 'ot:7.3', label: '7.3 Claim Dossier Compilation & Submission', shortLabel: 'Claim Dossiers', icon: FileSpreadsheet },
      { id: '7.4', routeId: 'ot:7.4', label: '7.4 Co-Payment & Deductible Collection', shortLabel: 'Co-Pay Collection', icon: IndianRupee },
      { id: '7.5', routeId: 'ot:7.5', label: '7.5 TPA Reconciliation & Payment Posting', shortLabel: 'TPA Reconciliation', icon: CheckCircle2 }
    ]
  },
  {
    id: '8',
    code: '8',
    name: 'Day Care',
    label: 'Day Care',
    shortLabel: 'Day Care',
    icon: Bed,
    submodules: [
      { id: '8.1', routeId: 'ot:8.1', label: '8.1 Day Care Admission & Procedure Booking', shortLabel: 'Day Care Booking', icon: Calendar },
      { id: '8.2', routeId: 'ot:8.2', label: '8.2 Chair / Bed Allocation', shortLabel: 'Chair Allocation', icon: Bed },
      { id: '8.3', routeId: 'ot:8.3', label: '8.3 Clinical Procedure Monitoring', shortLabel: 'Procedure Monitor', icon: Activity },
      { id: '8.4', routeId: 'ot:8.4', label: '8.4 Same-Day Discharge Summary', shortLabel: 'Day Discharge', icon: FileCheck }
    ]
  },
  {
    id: '9',
    code: '9',
    name: 'Dietary & Nutrition',
    label: 'Dietary & Nutrition',
    shortLabel: 'Dietary',
    icon: Utensils,
    submodules: [
      { id: '9.1', routeId: 'ot:9.1', label: '9.1 Dietitian Nutritional Assessment', shortLabel: 'Diet Assessment', icon: Utensils },
      { id: '9.2', routeId: 'ot:9.2', label: '9.2 Patient Diet Ordering', shortLabel: 'Diet Ordering', icon: ClipboardList },
      { id: '9.3', routeId: 'ot:9.3', label: '9.3 Kitchen Meal Batch Production', shortLabel: 'Kitchen Production', icon: CheckSquare },
      { id: '9.4', routeId: 'ot:9.4', label: '9.4 Ward Meal Delivery Tracking', shortLabel: 'Meal Delivery', icon: Truck }
    ]
  },
  {
    id: '10',
    code: '10',
    name: 'Embryology & IVF',
    label: 'Embryology & IVF',
    shortLabel: 'Embryology',
    icon: Egg,
    submodules: [
      { id: '10.1', routeId: 'ot:10.1', label: '10.1 Oocyte Retrieval (OPU) Recording', shortLabel: 'OPU Recording', icon: Egg },
      { id: '10.2', routeId: 'ot:10.2', label: '10.2 Fertilization (Conventional IVF / ICSI)', shortLabel: 'ICSI Fertilization', icon: Activity },
      { id: '10.3', routeId: 'ot:10.3', label: '10.3 Embryo Morphological Grading', shortLabel: 'Embryo Grading', icon: Award },
      { id: '10.4', routeId: 'ot:10.4', label: '10.4 Embryo Transfer (ET) Protocol', shortLabel: 'Embryo Transfer', icon: HeartPulse },
      { id: '10.5', routeId: 'ot:10.5', label: '10.5 Embryo Cryostorage Management', shortLabel: 'Cryostorage Tank', icon: Snowflake }
    ]
  },
  {
    id: '11',
    code: '11',
    name: 'Emergency & Trauma',
    label: 'Emergency & Trauma',
    shortLabel: 'Emergency',
    icon: Siren,
    submodules: [
      { id: '11.1', routeId: 'ot:11.1', label: '11.1 Triage Assessment (Level 1 to 4)', shortLabel: 'Triage Assessment', icon: Siren },
      { id: '11.2', routeId: 'ot:11.2', label: '11.2 Medico-Legal Case (MLC) Registry', shortLabel: 'MLC Registry', icon: ShieldAlert },
      { id: '11.3', routeId: 'ot:11.3', label: '11.3 Emergency Bay & Bed Allocation', shortLabel: 'Bay Allocation', icon: Bed },
      { id: '11.4', routeId: 'ot:11.4', label: '11.4 Trauma Clinical Charting', shortLabel: 'Trauma Charting', icon: Activity },
      { id: '11.5', routeId: 'ot:11.5', label: '11.5 Rapid Disposition (ICU/OT/Ward/Discharge)', shortLabel: 'Rapid Disposition', icon: ArrowRightCircle }
    ]
  },
  {
    id: '12',
    code: '12',
    name: 'Patient Clinical Records',
    label: 'Patient Clinical Records',
    shortLabel: 'Clinical Records',
    icon: FileSpreadsheet,
    submodules: [
      { id: '12.1', routeId: 'ot:12.1', label: '12.1 Longitudinal Patient Lifetime Timeline', shortLabel: 'Patient Timeline', icon: Clock },
      { id: '12.2', routeId: 'ot:12.2', label: '12.2 E-Prescription (Rx) Studio', shortLabel: 'E-Prescription Studio', icon: Pill },
      { id: '12.3', routeId: 'ot:12.3', label: '12.3 ICD-10 & SNOMED Diagnosis Coding', shortLabel: 'Diagnosis Coding', icon: Tag },
      { id: '12.4', routeId: 'ot:12.4', label: '12.4 Previous Encounters Browser', shortLabel: 'Previous Encounters', icon: Stethoscope },
      { id: '12.5', routeId: 'ot:12.5', label: '12.5 Clinical Document Attachments', shortLabel: 'Document Attachments', icon: Paperclip }
    ]
  },
  {
    id: '13',
    code: '13',
    name: 'Finance & Accounting',
    label: 'Finance & Accounting',
    shortLabel: 'Finance',
    icon: Landmark,
    submodules: [
      { id: '13.1', routeId: 'ot:13.1', label: '13.1 Chart of Accounts & General Ledger', shortLabel: 'Chart of Accounts', icon: BookOpen },
      { id: '13.2', routeId: 'ot:13.2', label: '13.2 Debit / Credit Payment Vouchers', shortLabel: 'Payment Vouchers', icon: Receipt },
      { id: '13.3', routeId: 'ot:13.3', label: '13.3 Doctor Payout & Revenue Share Calculation', shortLabel: 'Doctor Payouts', icon: IndianRupee },
      { id: '13.4', routeId: 'ot:13.4', label: '13.4 Bank Reconciliation', shortLabel: 'Bank Reconciliation', icon: RefreshCw },
      { id: '13.5', routeId: 'ot:13.5', label: '13.5 Profit & Loss / Balance Sheet Reporting', shortLabel: 'P&L Reports', icon: TrendingUp }
    ]
  },
  {
    id: '14',
    code: '14',
    name: 'Asset & Maintenance',
    label: 'Asset & Maintenance',
    shortLabel: 'Asset & Maintenance',
    icon: Wrench,
    submodules: [
      { id: '14.1', routeId: 'ot:14.1', label: '14.1 Asset Master & Barcode Tagging', shortLabel: 'Asset Master', icon: Tag },
      { id: '14.2', routeId: 'ot:14.2', label: '14.2 AMC / CMC Service Contracts & Warranties', shortLabel: 'AMC/CMC Contracts', icon: ShieldCheck },
      { id: '14.3', routeId: 'ot:14.3', label: '14.3 Preventive Maintenance Scheduling', shortLabel: 'Preventive Maintenance', icon: Calendar },
      { id: '14.4', routeId: 'ot:14.4', label: '14.4 Breakdown Reporting & Work Ticket', shortLabel: 'Breakdown Tickets', icon: Wrench },
      { id: '14.5', routeId: 'ot:14.5', label: '14.5 Asset Depreciation Calculation', shortLabel: 'Depreciation', icon: Calculator }
    ]
  },
  {
    id: '15',
    code: '15',
    name: 'Hospital Configuration',
    label: 'Hospital Configuration',
    shortLabel: 'Hospital Config',
    icon: Building2,
    submodules: [
      { id: '15.1', routeId: 'ot:15.1', label: '15.1 Hospital & Branch Master', shortLabel: 'Hospital Master', icon: Building2 },
      { id: '15.2', routeId: 'ot:15.2', label: '15.2 Department & Clinic Hierarchy', shortLabel: 'Department Master', icon: Network },
      { id: '15.3', routeId: 'ot:15.3', label: '15.3 Doctor & Consultant Master', shortLabel: 'Doctor Master', icon: Stethoscope },
      { id: '15.4', routeId: 'ot:15.4', label: '15.4 Service Catalog & Tariff Master', shortLabel: 'Tariff Master', icon: List },
      { id: '15.5', routeId: 'ot:15.5', label: '15.5 Corporate Tariff Rate Contracts', shortLabel: 'Corporate Contracts', icon: FileCheck }
    ]
  },
  {
    id: '16',
    code: '16',
    name: 'Inventory & Stores',
    label: 'Inventory & Stores',
    shortLabel: 'Inventory',
    icon: Package,
    submodules: [
      { id: '16.1', routeId: 'ot:16.1', label: '16.1 Item Master & Material Categories', shortLabel: 'Item Master', icon: Package },
      { id: '16.2', routeId: 'ot:16.2', label: '16.2 Store Requisition (Indent)', shortLabel: 'Store Indents', icon: FileInput },
      { id: '16.3', routeId: 'ot:16.3', label: '16.3 Store Issue to Wards/OT', shortLabel: 'Store Issues', icon: Truck },
      { id: '16.4', routeId: 'ot:16.4', label: '16.4 Physical Stock Verification & Audit', shortLabel: 'Stock Audit', icon: ClipboardCheck },
      { id: '16.5', routeId: 'ot:16.5', label: '16.5 Minimum / Maximum Reorder Alerts', shortLabel: 'Reorder Alerts', icon: AlertTriangle }
    ]
  },
  {
    id: '17',
    code: '17',
    name: 'IPD & Bed Management',
    label: 'IPD & Bed Management',
    shortLabel: 'IPD & Beds',
    icon: BedDouble,
    submodules: [
      { id: '17.1', routeId: 'ot:17.1', label: '17.1 Admission Desk & Form', shortLabel: 'Admission Desk', icon: UserPlus },
      { id: '17.2', routeId: 'ot:17.2', label: '17.2 My IP Admissions Dashboard', shortLabel: 'My IP Admissions', icon: LayoutDashboard },
      { id: '17.3', routeId: 'ot:17.3', label: '17.3 Live Bed Matrix / Bed Board', shortLabel: 'Bed Board', icon: Grid },
      { id: '17.4', routeId: 'ot:17.4', label: '17.4 Bed Transfer Management', shortLabel: 'Bed Transfer', icon: ArrowRightLeft },
      { id: '17.5', routeId: 'ot:17.5', label: '17.5 Inpatient Doctor Daily Rounds', shortLabel: 'Daily Rounds', icon: UserCheck },
      { id: '17.6', routeId: 'ot:17.6', label: '17.6 Discharge Process & Summary', shortLabel: 'Discharge Process', icon: FileCheck }
    ]
  },
  {
    id: '18',
    code: '18',
    name: 'Fertility Management',
    label: 'Fertility Management',
    shortLabel: 'Fertility',
    icon: HeartPulse,
    submodules: [
      { id: '18.1', routeId: 'ot:18.1', label: '18.1 Couple Registration & Legal Consent', shortLabel: 'Couple Registration', icon: Users },
      { id: '18.2', routeId: 'ot:18.2', label: '18.2 Ovarian Stimulation Protocol', shortLabel: 'Stimulation Protocol', icon: Activity },
      { id: '18.3', routeId: 'ot:18.3', label: '18.3 Follicular Ultrasound Tracking', shortLabel: 'Follicular Tracking', icon: Eye },
      { id: '18.4', routeId: 'ot:18.4', label: '18.4 Trigger Timing & Scheduling', shortLabel: 'Trigger Timing', icon: Clock },
      { id: '18.5', routeId: 'ot:18.5', label: '18.5 Cycle Outcome & Pregnancy Registry', shortLabel: 'Cycle Outcomes', icon: Award }
    ]
  },
  {
    id: '19',
    code: '19',
    name: 'Laboratory',
    label: 'Laboratory',
    shortLabel: 'Laboratory',
    icon: FlaskConical,
    submodules: [
      { id: '19.1', routeId: 'ot:19.1', label: '19.1 Test Requisition & Billing', shortLabel: 'Test Requisitions', icon: Receipt },
      { id: '19.2', routeId: 'ot:19.2', label: '19.2 Phlebotomy & Sample Barcode Labeling', shortLabel: 'Sample Barcodes', icon: Barcode },
      { id: '19.3', routeId: 'ot:19.3', label: '19.3 Instrument Worklist Interfacing', shortLabel: 'Instrument Worklist', icon: Cpu },
      { id: '19.4', routeId: 'ot:19.4', label: '19.4 Result Entry & Panic Value Alerts', shortLabel: 'Panic Value Alerts', icon: AlertTriangle },
      { id: '19.5', routeId: 'ot:19.5', label: '19.5 Pathologist Verification & Authorization', shortLabel: 'Pathologist Verify', icon: CheckCheck }
    ]
  },
  {
    id: '20',
    code: '20',
    name: 'Medical Records & Coding',
    label: 'Medical Records & Coding',
    shortLabel: 'Medical Records',
    icon: Archive,
    submodules: [
      { id: '20.1', routeId: 'ot:20.1', label: '20.1 Physical File Archival & Rack Tracking', shortLabel: 'Physical Archival', icon: FolderArchive },
      { id: '20.2', routeId: 'ot:20.2', label: '20.2 ICD-10 & CPT Clinical Coding', shortLabel: 'ICD-10/CPT Coding', icon: FileCode },
      { id: '20.3', routeId: 'ot:20.3', label: '20.3 Birth & Death Registration', shortLabel: 'Birth & Death Reg', icon: FileHeart },
      { id: '20.4', routeId: 'ot:20.4', label: '20.4 File Checkout & Audit Lending', shortLabel: 'Audit Lending', icon: FileClock }
    ]
  },
  {
    id: '21',
    code: '21',
    name: 'Nursing',
    label: 'Nursing',
    shortLabel: 'Nursing',
    icon: Activity,
    submodules: [
      { id: '21.1', routeId: 'ot:21.1', label: '21.1 Ward Nursing Workstation', shortLabel: 'Ward Workstation', icon: Activity },
      { id: '21.2', routeId: 'ot:21.2', label: '21.2 Vitals & Intake-Output Charting', shortLabel: 'Vitals & I/O Chart', icon: Heart },
      { id: '21.3', routeId: 'ot:21.3', label: '21.3 Medication Administration Record (MAR)', shortLabel: 'MAR Records', icon: Pill },
      { id: '21.4', routeId: 'ot:21.4', label: '21.4 Doctor Order Execution', shortLabel: 'Order Execution', icon: CheckSquare },
      { id: '21.5', routeId: 'ot:21.5', label: '21.5 Shift Handover Notes', shortLabel: 'Shift Handover', icon: ClipboardList }
    ]
  },
  {
    id: '22',
    code: '22',
    name: 'OPD Management',
    label: 'OPD Management',
    shortLabel: 'OPD Management',
    icon: Users,
    submodules: [
      { id: '22.1', routeId: 'ot:22.1', label: '22.1 OPD Clinic Desk Dashboard', shortLabel: 'Clinic Desk', icon: LayoutGrid },
      { id: '22.2', routeId: 'ot:22.2', label: '22.2 Patient Arrival & Check-in', shortLabel: 'Arrival Check-in', icon: UserCheck },
      { id: '22.3', routeId: 'ot:22.3', label: '22.3 Consultation Queue Management', shortLabel: 'Consultation Queue', icon: ListOrdered },
      { id: '22.4', routeId: 'ot:22.4', label: '22.4 OPD Visit Slip Printout', shortLabel: 'Visit Slips', icon: Printer },
      { id: '22.5', routeId: 'ot:22.5', label: '22.5 Follow-up Tracking', shortLabel: 'Follow-up Tracking', icon: Calendar }
    ]
  },
  {
    id: '23',
    code: '23',
    name: 'Operation Theatre',
    label: 'Operation Theatre',
    shortLabel: 'Operation Theatre',
    icon: Syringe,
    submodules: [
      { id: '23.1', routeId: 'ot:23.1', label: '23.1 OT Slot Scheduling & Theatre Roster', shortLabel: 'Slot Scheduling & Roster', icon: Calendar },
      { id: '23.2', routeId: 'ot:23.2', label: '23.2 Pre-Anesthesia Checkup (PAC)', shortLabel: 'Pre-Anesthesia PAC', icon: Stethoscope },
      { id: '23.3', routeId: 'ot:23.3', label: '23.3 WHO Surgical Safety Checklist', shortLabel: 'WHO Safety Checklist', icon: CheckSquare },
      { id: '23.4', routeId: 'ot:23.4', label: '23.4 Intra-Operative Anesthesia & Surgical Notes', shortLabel: 'Intra-Op Notes', icon: FileEdit },
      { id: '23.5', routeId: 'ot:23.5', label: '23.5 Post-Anesthesia Care Unit (PACU) Recovery', shortLabel: 'PACU Recovery', icon: Bed }
    ]
  }
];

export const ALL_OT_MODULES = OT_MODULE_GROUPS;

export const ALL_OT_SUBMODULES = OT_MODULE_GROUPS.flatMap(g => g.submodules);

export function findOtGroupById(groupId) {
  return OT_MODULE_GROUPS.find(g => g.id === String(groupId)) || null;
}

export function findOtGroupBySubmoduleId(submoduleId) {
  const modId = String(submoduleId).replace('ot:', '').replace('submodule:', '').split('.')[0];
  return OT_MODULE_GROUPS.find(g => g.id === modId) || null;
}

export function findOtSubmoduleById(submoduleId) {
  const cleanId = String(submoduleId).replace('ot:', '').replace('submodule:', '');
  return ALL_OT_SUBMODULES.find(s => s.id === cleanId) || null;
}
