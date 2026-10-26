import {
  Siren,
  ShieldAlert,
  Bed,
  Activity,
  ArrowRightCircle,
  Clock,
  Landmark,
  FileText,
  Pill,
  Tag,
  Stethoscope,
  Paperclip,
  UserPlus,
  LayoutDashboard,
  Grid,
  ArrowRightLeft,
  UserCheck,
  FileCheck,
  Heart,
  ClipboardList,
  CheckSquare,
  FileSpreadsheet,
  Users,
  ListOrdered,
  Printer,
  Calendar,
  CreditCard,
  Search,
  Edit,
  Egg,
  Eye,
  Award,
  FlaskConical,
  Barcode,
  Cpu,
  AlertTriangle,
  CheckCheck,
  Scan,
  Database,
  Monitor,
  FileEdit,
  Send,
  BookOpen,
  Receipt,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  Building2,
  Network,
  List,
  ShieldCheck,
  Settings,
  Bell,
  Lock,
  User,
  KeyRound,
  GitBranch,
  Shield,
  Palette,
  BarChart3,
  LineChart,
  Download,
  LayoutGrid,
  Boxes,
  Package,
  Truck,
  ClipboardCheck,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  HelpCircle,
  GitCompare,
  CheckCircle,
  ScanLine,
  Undo2,
  Wrench,
  Calculator,
  FilePlus,
  FileInput,
  Archive,
  FolderArchive,
  FileCode,
  FileHeart,
  FileClock,
  BedDouble,
  HeartPulse
} from 'lucide-react';

/**
 * 22 Hospital Emergency Workspace Module Groups
 * Modules 11 through 32, exactly 109 submodules.
 * Design aligned with the Appointment module sidebar pattern.
 */
export const EMERGENCY_MODULE_GROUPS = [
  {
    id: '11',
    code: '11',
    name: 'Emergency & Trauma',
    label: 'Emergency & Trauma',
    shortLabel: 'Emergency & Trauma',
    icon: Siren,
    submodules: [
      { id: '11.1', routeId: 'emergency:11.1', label: '11.1 Triage Assessment (Level 1 to 4)', shortLabel: 'Triage Assessment', icon: Siren },
      { id: '11.2', routeId: 'emergency:11.2', label: '11.2 Medico-Legal Case (MLC) Registry', shortLabel: 'MLC Registry', icon: ShieldAlert },
      { id: '11.3', routeId: 'emergency:11.3', label: '11.3 Emergency Bay & Bed Allocation', shortLabel: 'Bay & Bed Allocation', icon: Bed },
      { id: '11.4', routeId: 'emergency:11.4', label: '11.4 Trauma Clinical Charting', shortLabel: 'Trauma Charting', icon: Activity },
      { id: '11.5', routeId: 'emergency:11.5', label: '11.5 Rapid Disposition (ICU/OT/Ward/Discharge)', shortLabel: 'Rapid Disposition', icon: ArrowRightCircle }
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
      { id: '12.1', routeId: 'emergency:12.1', label: '12.1 Longitudinal Patient Lifetime Timeline', shortLabel: 'Patient Timeline', icon: Clock },
      { id: '12.2', routeId: 'emergency:12.2', label: '12.2 E-Prescription (Rx) Studio', shortLabel: 'E-Prescription Studio', icon: Pill },
      { id: '12.3', routeId: 'emergency:12.3', label: '12.3 ICD-10 & SNOMED Diagnosis Coding', shortLabel: 'Diagnosis Coding', icon: Tag },
      { id: '12.4', routeId: 'emergency:12.4', label: '12.4 Previous Encounters Browser', shortLabel: 'Previous Encounters', icon: Stethoscope },
      { id: '12.5', routeId: 'emergency:12.5', label: '12.5 Clinical Document Attachments', shortLabel: 'Document Attachments', icon: Paperclip }
    ]
  },
  {
    id: '13',
    code: '13',
    name: 'Finance & Accounting',
    label: 'Finance & Accounting',
    shortLabel: 'Finance & Accounting',
    icon: Landmark,
    submodules: [
      { id: '13.1', routeId: 'emergency:13.1', label: '13.1 Chart of Accounts & General Ledger', shortLabel: 'Chart of Accounts', icon: BookOpen },
      { id: '13.2', routeId: 'emergency:13.2', label: '13.2 Debit / Credit Payment Vouchers', shortLabel: 'Payment Vouchers', icon: Receipt },
      { id: '13.3', routeId: 'emergency:13.3', label: '13.3 Doctor Payout & Revenue Share Calculation', shortLabel: 'Doctor Payouts', icon: IndianRupee },
      { id: '13.4', routeId: 'emergency:13.4', label: '13.4 Bank Reconciliation', shortLabel: 'Bank Reconciliation', icon: RefreshCw },
      { id: '13.5', routeId: 'emergency:13.5', label: '13.5 Profit & Loss / Balance Sheet Reporting', shortLabel: 'P&L / Balance Sheet', icon: TrendingUp }
    ]
  },
  {
    id: '14',
    code: '14',
    name: 'Asset & Maintenance',
    label: 'Asset & Maintenance',
    shortLabel: 'Asset & Maintenance',
    icon: Package,
    submodules: [
      { id: '14.1', routeId: 'emergency:14.1', label: '14.1 Asset Master & Barcode Tagging', shortLabel: 'Asset Master', icon: Tag },
      { id: '14.2', routeId: 'emergency:14.2', label: '14.2 AMC / CMC Service Contracts & Warranties', shortLabel: 'AMC/CMC Contracts', icon: Shield },
      { id: '14.3', routeId: 'emergency:14.3', label: '14.3 Preventive Maintenance Scheduling', shortLabel: 'Preventive Maintenance', icon: Calendar },
      { id: '14.4', routeId: 'emergency:14.4', label: '14.4 Breakdown Reporting & Work Ticket', shortLabel: 'Breakdown Tickets', icon: Wrench },
      { id: '14.5', routeId: 'emergency:14.5', label: '14.5 Asset Depreciation Calculation', shortLabel: 'Depreciation', icon: Calculator }
    ]
  },
  {
    id: '15',
    code: '15',
    name: 'Hospital Configuration',
    label: 'Hospital Configuration',
    shortLabel: 'Hospital Configuration',
    icon: Building2,
    submodules: [
      { id: '15.1', routeId: 'emergency:15.1', label: '15.1 Hospital & Branch Master', shortLabel: 'Hospital Master', icon: Building2 },
      { id: '15.2', routeId: 'emergency:15.2', label: '15.2 Department & Clinic Hierarchy', shortLabel: 'Department Master', icon: Network },
      { id: '15.3', routeId: 'emergency:15.3', label: '15.3 Doctor & Consultant Master', shortLabel: 'Doctor Master', icon: Stethoscope },
      { id: '15.4', routeId: 'emergency:15.4', label: '15.4 Service Catalog & Tariff Master', shortLabel: 'Tariff Master', icon: List },
      { id: '15.5', routeId: 'emergency:15.5', label: '15.5 Corporate Tariff Rate Contracts', shortLabel: 'Corporate Contracts', icon: FileCheck }
    ]
  },
  {
    id: '16',
    code: '16',
    name: 'Inventory & Stores',
    label: 'Inventory & Stores',
    shortLabel: 'Inventory & Stores',
    icon: Boxes,
    submodules: [
      { id: '16.1', routeId: 'emergency:16.1', label: '16.1 Item Master & Material Categories', shortLabel: 'Item Master', icon: Package },
      { id: '16.2', routeId: 'emergency:16.2', label: '16.2 Store Requisition (Indent)', shortLabel: 'Store Indents', icon: FileInput },
      { id: '16.3', routeId: 'emergency:16.3', label: '16.3 Store Issue to Wards/OT', shortLabel: 'Store Issues', icon: Truck },
      { id: '16.4', routeId: 'emergency:16.4', label: '16.4 Physical Stock Verification & Audit', shortLabel: 'Stock Audit', icon: ClipboardCheck },
      { id: '16.5', routeId: 'emergency:16.5', label: '16.5 Minimum / Maximum Reorder Alerts', shortLabel: 'Reorder Alerts', icon: AlertTriangle }
    ]
  },
  {
    id: '17',
    code: '17',
    name: 'IPD & Bed Management',
    label: 'IPD & Bed Management',
    shortLabel: 'IPD & Bed Management',
    icon: BedDouble,
    submodules: [
      { id: '17.1', routeId: 'emergency:17.1', label: '17.1 Admission Desk & Form', shortLabel: 'Admission Desk', icon: UserPlus },
      { id: '17.2', routeId: 'emergency:17.2', label: '17.2 My IP Admissions Dashboard', shortLabel: 'My IP Admissions', icon: LayoutDashboard },
      { id: '17.3', routeId: 'emergency:17.3', label: '17.3 Live Bed Matrix / Bed Board', shortLabel: 'Bed Board', icon: Grid },
      { id: '17.4', routeId: 'emergency:17.4', label: '17.4 Bed Transfer Management', shortLabel: 'Bed Transfer', icon: ArrowRightLeft },
      { id: '17.5', routeId: 'emergency:17.5', label: '17.5 Inpatient Doctor Daily Rounds', shortLabel: 'Daily Rounds', icon: UserCheck },
      { id: '17.6', routeId: 'emergency:17.6', label: '17.6 Discharge Process & Summary', shortLabel: 'Discharge Process', icon: FileCheck }
    ]
  },
  {
    id: '18',
    code: '18',
    name: 'Embryology & Fertility',
    label: 'Embryology & Fertility',
    shortLabel: 'Embryology & Fertility',
    icon: Egg,
    submodules: [
      { id: '18.1', routeId: 'emergency:18.1', label: '18.1 Couple Registration & Legal Consent', shortLabel: 'Couple Registration', icon: Users },
      { id: '18.2', routeId: 'emergency:18.2', label: '18.2 Ovarian Stimulation Protocol', shortLabel: 'Stimulation Protocol', icon: Activity },
      { id: '18.3', routeId: 'emergency:18.3', label: '18.3 Follicular Ultrasound Tracking', shortLabel: 'Follicular Tracking', icon: Eye },
      { id: '18.4', routeId: 'emergency:18.4', label: '18.4 Trigger Timing & Scheduling', shortLabel: 'Trigger Timing', icon: Clock },
      { id: '18.5', routeId: 'emergency:18.5', label: '18.5 Cycle Outcome & Pregnancy Registry', shortLabel: 'Cycle Outcomes', icon: Award }
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
      { id: '19.1', routeId: 'emergency:19.1', label: '19.1 Test Requisition & Billing', shortLabel: 'Test Requisitions', icon: Receipt },
      { id: '19.2', routeId: 'emergency:19.2', label: '19.2 Phlebotomy & Sample Barcode Labeling', shortLabel: 'Sample Barcodes', icon: Barcode },
      { id: '19.3', routeId: 'emergency:19.3', label: '19.3 Instrument Worklist Interfacing', shortLabel: 'Instrument Worklist', icon: Cpu },
      { id: '19.4', routeId: 'emergency:19.4', label: '19.4 Result Entry & Panic Value Alerts', shortLabel: 'Panic Value Alerts', icon: AlertTriangle },
      { id: '19.5', routeId: 'emergency:19.5', label: '19.5 Pathologist Verification & Authorization', shortLabel: 'Pathologist Verify', icon: CheckCheck }
    ]
  },
  {
    id: '20',
    code: '20',
    name: 'Medical Records & Coding',
    label: 'Medical Records & Coding',
    shortLabel: 'Medical Records & Coding',
    icon: Archive,
    submodules: [
      { id: '20.1', routeId: 'emergency:20.1', label: '20.1 Physical File Archival & Rack Tracking', shortLabel: 'Physical Archival', icon: FolderArchive },
      { id: '20.2', routeId: 'emergency:20.2', label: '20.2 ICD-10 & CPT Clinical Coding', shortLabel: 'ICD-10/CPT Coding', icon: FileCode },
      { id: '20.3', routeId: 'emergency:20.3', label: '20.3 Birth & Death Registration', shortLabel: 'Birth & Death Reg', icon: FileHeart },
      { id: '20.4', routeId: 'emergency:20.4', label: '20.4 File Checkout & Audit Lending', shortLabel: 'Audit Lending', icon: FileClock }
    ]
  },
  {
    id: '21',
    code: '21',
    name: 'Nursing',
    label: 'Nursing',
    shortLabel: 'Nursing',
    icon: HeartPulse,
    submodules: [
      { id: '21.1', routeId: 'emergency:21.1', label: '21.1 Ward Nursing Workstation', shortLabel: 'Ward Workstation', icon: Activity },
      { id: '21.2', routeId: 'emergency:21.2', label: '21.2 Vitals & Intake-Output Charting', shortLabel: 'Vitals & I/O Chart', icon: Heart },
      { id: '21.3', routeId: 'emergency:21.3', label: '21.3 Medication Administration Record (MAR)', shortLabel: 'MAR Records', icon: Pill },
      { id: '21.4', routeId: 'emergency:21.4', label: '21.4 Doctor Order Execution', shortLabel: 'Order Execution', icon: CheckSquare },
      { id: '21.5', routeId: 'emergency:21.5', label: '21.5 Shift Handover Notes', shortLabel: 'Shift Handover', icon: ClipboardList }
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
      { id: '22.1', routeId: 'emergency:22.1', label: '22.1 OPD Clinic Desk Dashboard', shortLabel: 'Clinic Desk', icon: LayoutGrid },
      { id: '22.2', routeId: 'emergency:22.2', label: '22.2 Patient Arrival & Check-in', shortLabel: 'Arrival Check-in', icon: UserCheck },
      { id: '22.3', routeId: 'emergency:22.3', label: '22.3 Consultation Queue Management', shortLabel: 'Consultation Queue', icon: ListOrdered },
      { id: '22.4', routeId: 'emergency:22.4', label: '22.4 OPD Visit Slip Printout', shortLabel: 'Visit Slips', icon: Printer },
      { id: '22.5', routeId: 'emergency:22.5', label: '22.5 Follow-up Tracking', shortLabel: 'Follow-up Tracking', icon: Calendar }
    ]
  },
  {
    id: '23',
    code: '23',
    name: 'Operation Theatre',
    label: 'Operation Theatre',
    shortLabel: 'Operation Theatre',
    icon: Activity,
    submodules: [
      { id: '23.1', routeId: 'emergency:23.1', label: '23.1 OT Slot Scheduling & Theatre Roster', shortLabel: 'OT Slot Scheduling', icon: Calendar },
      { id: '23.2', routeId: 'emergency:23.2', label: '23.2 Pre-Anesthesia Checkup (PAC)', shortLabel: 'Pre-Anesthesia PAC', icon: Stethoscope },
      { id: '23.3', routeId: 'emergency:23.3', label: '23.3 WHO Surgical Safety Checklist', shortLabel: 'WHO Safety Checklist', icon: CheckSquare },
      { id: '23.4', routeId: 'emergency:23.4', label: '23.4 Intra-Operative Anesthesia & Surgical Notes', shortLabel: 'Intra-Op Notes', icon: FileEdit },
      { id: '23.5', routeId: 'emergency:23.5', label: '23.5 Post-Anesthesia Care Unit (PACU) Recovery', shortLabel: 'PACU Recovery', icon: Bed }
    ]
  },
  {
    id: '24',
    code: '24',
    name: 'Patient Registration',
    label: 'Patient Registration',
    shortLabel: 'Patient Registration',
    icon: UserPlus,
    submodules: [
      { id: '24.1', routeId: 'emergency:24.1', label: '24.1 New Patient Registration', shortLabel: 'New Registration', icon: UserPlus },
      { id: '24.2', routeId: 'emergency:24.2', label: '24.2 UHID Generation & Smart Card Print', shortLabel: 'UHID Generation', icon: CreditCard },
      { id: '24.3', routeId: 'emergency:24.3', label: '24.3 Create New Visit / Encounter', shortLabel: 'New Encounter', icon: Calendar },
      { id: '24.4', routeId: 'emergency:24.4', label: '24.4 Patient Search & Record Merge', shortLabel: 'Patient Search', icon: Search },
      { id: '24.5', routeId: 'emergency:24.5', label: '24.5 Demographic & Identity Updates', shortLabel: 'Demographic Updates', icon: Edit }
    ]
  },
  {
    id: '25',
    code: '25',
    name: 'Pharmacy',
    label: 'Pharmacy',
    shortLabel: 'Pharmacy',
    icon: Pill,
    submodules: [
      { id: '25.1', routeId: 'emergency:25.1', label: '25.1 Prescription Dispensing (OPD & IPD)', shortLabel: 'Rx Dispensing', icon: ShoppingCart },
      { id: '25.2', routeId: 'emergency:25.2', label: '25.2 Medicine Master & Salt Information', shortLabel: 'Medicine Master', icon: Database },
      { id: '25.3', routeId: 'emergency:25.3', label: '25.3 FIFO Batch & Expiry Management', shortLabel: 'FIFO Batch Expiry', icon: Clock },
      { id: '25.4', routeId: 'emergency:25.4', label: '25.4 IPD Unused Medicine Return & Credit', shortLabel: 'IPD Return & Credit', icon: RotateCcw },
      { id: '25.5', routeId: 'emergency:25.5', label: '25.5 Pharmacy Stock Indents & Reorder Alerts', shortLabel: 'Pharmacy Indents', icon: AlertCircle }
    ]
  },
  {
    id: '26',
    code: '26',
    name: 'Purchase & Procurement',
    label: 'Purchase & Procurement',
    shortLabel: 'Purchase & Procurement',
    icon: ShoppingBag,
    submodules: [
      { id: '26.1', routeId: 'emergency:26.1', label: '26.1 Purchase Requisition (Indent)', shortLabel: 'Purchase Indents', icon: FileText },
      { id: '26.2', routeId: 'emergency:26.2', label: '26.2 Request for Quotation (RFQ)', shortLabel: 'RFQ Management', icon: HelpCircle },
      { id: '26.3', routeId: 'emergency:26.3', label: '26.3 Vendor Quotation Comparison', shortLabel: 'Vendor Comparison', icon: GitCompare },
      { id: '26.4', routeId: 'emergency:26.4', label: '26.4 Purchase Order (PO) Creation & Approval', shortLabel: 'PO Approval', icon: CheckCircle },
      { id: '26.5', routeId: 'emergency:26.5', label: '26.5 Goods Receipt Note (GRN) Inward Inspection', shortLabel: 'GRN Inwarding', icon: CheckSquare }
    ]
  },
  {
    id: '27',
    code: '27',
    name: 'Radiology & PACS',
    label: 'Radiology & PACS',
    shortLabel: 'Radiology & PACS',
    icon: Scan,
    submodules: [
      { id: '27.1', routeId: 'emergency:27.1', label: '27.1 Modality Scheduling & MWL', shortLabel: 'Modality Scheduling', icon: Calendar },
      { id: '27.2', routeId: 'emergency:27.2', label: '27.2 DICOM Image Acquisition & PACS Storage', shortLabel: 'DICOM PACS Storage', icon: Database },
      { id: '27.3', routeId: 'emergency:27.3', label: '27.3 Browser-based DICOM PACS Viewer', shortLabel: 'PACS Viewer', icon: Monitor },
      { id: '27.4', routeId: 'emergency:27.4', label: '27.4 Radiology Report Authoring', shortLabel: 'Report Authoring', icon: FileEdit },
      { id: '27.5', routeId: 'emergency:27.5', label: '27.5 Report Verification & EMR Distribution', shortLabel: 'Report Verification', icon: Send }
    ]
  },
  {
    id: '28',
    code: '28',
    name: 'Retail & OTC Billing',
    label: 'Retail & OTC Billing',
    shortLabel: 'Retail & OTC Billing',
    icon: Receipt,
    submodules: [
      { id: '28.1', routeId: 'emergency:28.1', label: '28.1 Over-the-Counter (OTC) POS Counter', shortLabel: 'OTC POS Counter', icon: ShoppingCart },
      { id: '28.2', routeId: 'emergency:28.2', label: '28.2 Quick Barcode Scanning & Billing', shortLabel: 'Barcode Billing', icon: ScanLine },
      { id: '28.3', routeId: 'emergency:28.3', label: '28.3 Multi-Mode Instant Payment', shortLabel: 'Multi-Mode Payment', icon: CreditCard },
      { id: '28.4', routeId: 'emergency:28.4', label: '28.4 Retail Sales Return & Cash Refund', shortLabel: 'Sales Return & Refund', icon: Undo2 }
    ]
  },
  {
    id: '29',
    code: '29',
    name: 'System Administration & Audit',
    label: 'System Administration & Audit',
    shortLabel: 'System Administration & Audit',
    icon: ShieldCheck,
    submodules: [
      { id: '29.1', routeId: 'emergency:29.1', label: '29.1 View User Sessions', shortLabel: 'User Sessions', icon: Users },
      { id: '29.2', routeId: 'emergency:29.2', label: '29.2 AUDIT: System Audit Trail & Clinical Audit Trail', shortLabel: 'Audit Trails', icon: ShieldAlert },
      { id: '29.3', routeId: 'emergency:29.3', label: '29.3 SETUP: Department & Module Master Setup', shortLabel: 'Master Setup', icon: Settings },
      { id: '29.4', routeId: 'emergency:29.4', label: '29.4 SYSTEM: Event Configuration', shortLabel: 'Event Configuration', icon: Bell },
      { id: '29.5', routeId: 'emergency:29.5', label: '29.5 Role-Based Access Control (RBAC) & Permissions', shortLabel: 'RBAC Permissions', icon: Lock }
    ]
  },
  {
    id: '30',
    code: '30',
    name: 'User Profile & Security',
    label: 'User Profile & Security',
    shortLabel: 'User Profile & Security',
    icon: User,
    submodules: [
      { id: '30.1', routeId: 'emergency:30.1', label: '30.1 Manage Profile', shortLabel: 'Manage Profile', icon: User },
      { id: '30.2', routeId: 'emergency:30.2', label: '30.2 Change Password & Security', shortLabel: 'Change Password', icon: KeyRound },
      { id: '30.3', routeId: 'emergency:30.3', label: '30.3 Switch Active Hospital Branch', shortLabel: 'Switch Branch', icon: GitBranch },
      { id: '30.4', routeId: 'emergency:30.4', label: '30.4 Switch Active Role', shortLabel: 'Switch Role', icon: Shield },
      { id: '30.5', routeId: 'emergency:30.5', label: '30.5 User UI Preferences & Theme', shortLabel: 'UI Preferences', icon: Palette }
    ]
  },
  {
    id: '31',
    code: '31',
    name: 'Work Orders',
    label: 'Work Orders',
    shortLabel: 'Work Orders',
    icon: ClipboardCheck,
    submodules: [
      { id: '31.1', routeId: 'emergency:31.1', label: '31.1 Record Work Order', shortLabel: 'Record Work Order', icon: FilePlus },
      { id: '31.2', routeId: 'emergency:31.2', label: '31.2 Record Work Order Requisition', shortLabel: 'Work Order Req', icon: FileInput },
      { id: '31.3', routeId: 'emergency:31.3', label: '31.3 Record Work Order Receipt', shortLabel: 'Work Order Receipt', icon: Receipt },
      { id: '31.4', routeId: 'emergency:31.4', label: '31.4 View Work Orders / Requisitions / Receipts', shortLabel: 'View Work Orders', icon: Eye },
      { id: '31.5', routeId: 'emergency:31.5', label: '31.5 ORDERS: Approve Work Orders, Confirm Work Orders, Review Rejected', shortLabel: 'Approve Orders', icon: CheckSquare },
      { id: '31.6', routeId: 'emergency:31.6', label: '31.6 RECEIPTS: Approve Work Order Receipts, Confirm Work Order Receipts', shortLabel: 'Approve Receipts', icon: ShieldCheck }
    ]
  },
  {
    id: '32',
    code: '32',
    name: 'Analytics & Data Export',
    label: 'Analytics & Data Export',
    shortLabel: 'Analytics & Data Export',
    icon: BarChart3,
    submodules: [
      { id: '32.1', routeId: 'emergency:32.1', label: '32.1 ANALYTICS: Billing, Inventory, Purchase, System Analytics', shortLabel: 'Module Analytics', icon: LineChart },
      { id: '32.2', routeId: 'emergency:32.2', label: '32.2 DATA EXPORT: Billing Data Export, System Data Export', shortLabel: 'Data Export', icon: Download },
      { id: '32.3', routeId: 'emergency:32.3', label: '32.3 Executive KPI Dashboard Widgets', shortLabel: 'KPI Dashboard', icon: LayoutDashboard },
      { id: '32.4', routeId: 'emergency:32.4', label: '32.4 Tabular Data Export (Excel / CSV)', shortLabel: 'Tabular Export', icon: FileSpreadsheet }
    ]
  }
];

export const ALL_HOSPITAL_EMERGENCY_MODULES = EMERGENCY_MODULE_GROUPS;

export const ALL_HOSPITAL_EMERGENCY_SUBMODULES = EMERGENCY_MODULE_GROUPS.flatMap(g => g.submodules);

export function findEmergencyGroupById(groupId) {
  return EMERGENCY_MODULE_GROUPS.find(g => g.id === String(groupId)) || null;
}

export function findEmergencyGroupBySubmoduleId(submoduleId) {
  const modId = String(submoduleId).replace('emergency:', '').replace('submodule:', '').split('.')[0];
  return EMERGENCY_MODULE_GROUPS.find(g => g.id === modId) || null;
}

export function findEmergencySubmoduleById(submoduleId) {
  const cleanId = String(submoduleId).replace('emergency:', '').replace('submodule:', '');
  return ALL_HOSPITAL_EMERGENCY_SUBMODULES.find(s => s.id === cleanId) || null;
}

// Aliases for compatibility
export const findCategoryByModuleId = findEmergencyGroupById;
export const findModuleBySubmoduleId = findEmergencyGroupBySubmoduleId;
export const findCategoryBySubmoduleId = findEmergencyGroupBySubmoduleId;
export const findSubmoduleById = findEmergencySubmoduleById;
export const HOSPITAL_EMERGENCY_WORKSPACE_CATEGORIES = EMERGENCY_MODULE_GROUPS.map(g => ({
  id: g.id,
  title: g.name,
  shortTitle: g.shortLabel,
  icon: g.icon,
  modules: [g]
}));
