import {
  ShoppingBag,
  ScanLine,
  Tag,
  ShieldCheck,
  UserCheck,
  Wrench,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Calculator,
  Truck,
  Eye,
  Stethoscope,
  CheckCircle2,
  QrCode,
  IndianRupee,
  RefreshCw,
  Lock,
  Building2,
  Bell,
  Sliders,
  Award,
  Database,
  Activity,
  Download
} from 'lucide-react';

/**
 * 7 Main Purchase Module Sidebar Groups
 * Encompassing Modules 26 through 32 (34 submodules total).
 * Strict adherence to Appointment module design standards.
 */
export const PURCHASE_MODULE_GROUPS = [
  {
    id: '26',
    groupNumber: 'Purchase & Procurement',
    name: 'Purchase & Procurement',
    label: 'Purchase & Procurement',
    shortLabel: 'Purchase & Procurement',
    icon: ShoppingBag,
    badge: 'Procurement',
    submodules: [
      {
        id: '26.1',
        routeId: 'purchase:26.1',
        code: '26.1',
        label: 'Purchase Requisition (Indent)',
        shortLabel: 'Purchase Requisition',
        icon: FileText,
        badge: 'Indent',
        description: 'Internal departmental purchase requisitions, urgency ratings, and budget allocation.'
      },
      {
        id: '26.2',
        routeId: 'purchase:26.2',
        code: '26.2',
        label: 'Request for Quotation (RFQ)',
        shortLabel: 'RFQ Tenders',
        icon: FileSpreadsheet,
        badge: 'RFQ',
        description: 'Supplier RFQ generation, item specifications, and vendor tender invitations.'
      },
      {
        id: '26.3',
        routeId: 'purchase:26.3',
        code: '26.3',
        label: 'Vendor Quotation Comparison',
        shortLabel: 'Quotation Comparison',
        icon: Calculator,
        badge: 'Compare',
        description: 'Side-by-side L1/L2 vendor quotation comparison matrix, commercial terms, and vendor selection.'
      },
      {
        id: '26.4',
        routeId: 'purchase:26.4',
        code: '26.4',
        label: 'Purchase Order (PO) Creation & Approval',
        shortLabel: 'PO Creation & Approval',
        icon: ShoppingBag,
        badge: 'Purchase Orders',
        description: 'Formal purchase orders, multi-level management approvals, and delivery milestones.'
      },
      {
        id: '26.5',
        routeId: 'purchase:26.5',
        code: '26.5',
        label: 'Goods Receipt Note (GRN) Inward Inspection',
        shortLabel: 'GRN Inward Inspection',
        icon: Truck,
        badge: 'GRN Inward',
        description: 'Gate entry, physical quality inspection, batch tracking, and GRN acceptance.'
      }
    ]
  },
  {
    id: '27',
    groupNumber: 'Radiology & PACS',
    name: 'Radiology & PACS',
    label: 'Radiology & PACS',
    shortLabel: 'Radiology & PACS',
    icon: ScanLine,
    badge: 'Imaging',
    submodules: [
      {
        id: '27.1',
        routeId: 'purchase:27.1',
        code: '27.1',
        label: 'Modality Scheduling & MWL',
        shortLabel: 'Modality Scheduling',
        icon: Stethoscope,
        badge: 'MWL',
        description: 'MRI, CT, X-Ray, and USG machine slot planning with DICOM Modality Worklist (MWL).'
      },
      {
        id: '27.2',
        routeId: 'purchase:27.2',
        code: '27.2',
        label: 'DICOM Image Acquisition & PACS Storage',
        shortLabel: 'DICOM PACS Archive',
        icon: Database,
        badge: 'Storage',
        description: 'Secure archiving of DICOM studies, storage tiering, and modality series indexing.'
      },
      {
        id: '27.3',
        routeId: 'purchase:27.3',
        code: '27.3',
        label: 'Browser-based DICOM PACS Viewer',
        shortLabel: 'DICOM Viewer',
        icon: Eye,
        badge: 'PACS Viewer',
        description: 'Zero-footprint web viewer with windowing, zoom, pan, brightness/contrast, and measurement tools.'
      },
      {
        id: '27.4',
        routeId: 'purchase:27.4',
        code: '27.4',
        label: 'Radiology Report Authoring',
        shortLabel: 'Report Authoring',
        icon: FileText,
        badge: 'Drafting',
        description: 'Radiologist structured reporting templates, findings, and diagnostic impressions.'
      },
      {
        id: '27.5',
        routeId: 'purchase:27.5',
        code: '27.5',
        label: 'Report Verification & EMR Distribution',
        shortLabel: 'Report EMR Distribution',
        icon: CheckCircle2,
        badge: 'EMR Sync',
        description: 'Final radiologist electronic signature authorization and instant sync to clinician EMR.'
      }
    ]
  },
  {
    id: '28',
    groupNumber: 'OTC Retail & Payments',
    name: 'OTC Retail & Payments',
    label: 'OTC Retail & Payments',
    shortLabel: 'OTC Retail & Payments',
    icon: Tag,
    badge: 'Retail POS',
    submodules: [
      {
        id: '28.1',
        routeId: 'purchase:28.1',
        code: '28.1',
        label: 'Over-the-Counter (OTC) POS Counter',
        shortLabel: 'OTC POS Counter',
        icon: Tag,
        badge: 'Walk-in POS',
        description: 'Direct retail sales, walk-in customer counter, and instant receipt printing.'
      },
      {
        id: '28.2',
        routeId: 'purchase:28.2',
        code: '28.2',
        label: 'Quick Barcode Scanning & Billing',
        shortLabel: 'Barcode Checkout',
        icon: RefreshCw,
        badge: 'Fast Scan',
        description: 'High-speed barcode checkout, GST rate breakdown, and instant item tally.'
      },
      {
        id: '28.3',
        routeId: 'purchase:28.3',
        code: '28.3',
        label: 'Multi-Mode Instant Payment',
        shortLabel: 'Multi-Mode Payment',
        icon: QrCode,
        badge: 'Payments',
        description: 'UPI QR code, credit/debit card swipe, cash collection, and split tenders.'
      },
      {
        id: '28.4',
        routeId: 'purchase:28.4',
        code: '28.4',
        label: 'Retail Sales Return & Cash Refund',
        shortLabel: 'Sales Return & Refund',
        icon: IndianRupee,
        badge: 'Refunds',
        description: 'Item return against sales invoice, restock verification, and cash refund.'
      }
    ]
  },
  {
    id: '29',
    groupNumber: 'System Administration & Audit',
    name: 'System Administration & Audit',
    label: 'System Administration & Audit',
    shortLabel: 'System Admin & Audit',
    icon: ShieldCheck,
    badge: 'Security',
    submodules: [
      {
        id: '29.1',
        routeId: 'purchase:29.1',
        code: '29.1',
        label: 'View User Sessions',
        shortLabel: 'Active Sessions',
        icon: UserCheck,
        badge: 'Sessions',
        description: 'Active staff logins, terminal IP addresses, session duration, and terminate sessions.'
      },
      {
        id: '29.2',
        routeId: 'purchase:29.2',
        code: '29.2',
        label: 'AUDIT: System Audit Trail & Clinical Audit Trail',
        shortLabel: 'Audit Trails',
        icon: ShieldCheck,
        badge: 'Audit Logs',
        description: 'Immutable record of patient data access, medication edits, and administrative changes.'
      },
      {
        id: '29.3',
        routeId: 'purchase:29.3',
        code: '29.3',
        label: 'SETUP: Department & Module Master Setup',
        shortLabel: 'Department Master',
        icon: Building2,
        badge: 'Master Setup',
        description: 'Clinical disciplines setup, hospital wing configurations, and module flags.'
      },
      {
        id: '29.4',
        routeId: 'purchase:29.4',
        code: '29.4',
        label: 'SYSTEM: Event Configuration',
        shortLabel: 'Event Configuration',
        icon: Bell,
        badge: 'Events',
        description: 'System notification triggers, panic alarm webhooks, and SMS templates.'
      },
      {
        id: '29.5',
        routeId: 'purchase:29.5',
        code: '29.5',
        label: 'Role-Based Access Control (RBAC) & Permissions',
        shortLabel: 'RBAC Permissions',
        icon: Lock,
        badge: 'RBAC',
        description: 'Clinician, nurse, pharmacist, cashier, and admin role permission matrix.'
      }
    ]
  },
  {
    id: '30',
    groupNumber: 'User Profile & Preferences',
    name: 'User Profile & Preferences',
    label: 'User Profile & Preferences',
    shortLabel: 'User Profile & Preferences',
    icon: UserCheck,
    badge: 'Preferences',
    submodules: [
      {
        id: '30.1',
        routeId: 'purchase:30.1',
        code: '30.1',
        label: 'Manage Profile',
        shortLabel: 'User Profile',
        icon: UserCheck,
        badge: 'Profile',
        description: 'Staff user personal details, contact number, qualification, and signature.'
      },
      {
        id: '30.2',
        routeId: 'purchase:30.2',
        code: '30.2',
        label: 'Change Password & Security',
        shortLabel: 'Security Credentials',
        icon: Lock,
        badge: 'Security',
        description: 'Credential updates, multi-factor authentication (MFA), and security logs.'
      },
      {
        id: '30.3',
        routeId: 'purchase:30.3',
        code: '30.3',
        label: 'Switch Active Hospital Branch',
        shortLabel: 'Branch Switcher',
        icon: Building2,
        badge: 'Branch',
        description: 'Switch workstation context between multi-hospital branch facilities.'
      },
      {
        id: '30.4',
        routeId: 'purchase:30.4',
        code: '30.4',
        label: 'Switch Active Role',
        shortLabel: 'Role Switcher',
        icon: Sliders,
        badge: 'Role',
        description: 'Toggle user privileges between assigned clinical or administrative roles.'
      },
      {
        id: '30.5',
        routeId: 'purchase:30.5',
        code: '30.5',
        label: 'User UI Preferences & Theme',
        shortLabel: 'UI Theme & Density',
        icon: Sliders,
        badge: 'Theme',
        description: 'Compact density, table row heights, theme color options, and default desk.'
      }
    ]
  },
  {
    id: '31',
    groupNumber: 'Work Order Management',
    name: 'Work Order Management',
    label: 'Work Order Management',
    shortLabel: 'Work Order Management',
    icon: Wrench,
    badge: 'Maintenance',
    submodules: [
      {
        id: '31.1',
        routeId: 'purchase:31.1',
        code: '31.1',
        label: 'Record Work Order',
        shortLabel: 'Record Work Order',
        icon: Wrench,
        badge: 'Create WO',
        description: 'Service work orders for facility maintenance, biomedical equipment, and external contractors.'
      },
      {
        id: '31.2',
        routeId: 'purchase:31.2',
        code: '31.2',
        label: 'Record Work Order Requisition',
        shortLabel: 'WO Requisition',
        icon: FileText,
        badge: 'Requisitions',
        description: 'Departmental maintenance and repair requisitions with priority levels.'
      },
      {
        id: '31.3',
        routeId: 'purchase:31.3',
        code: '31.3',
        label: 'Record Work Order Receipt',
        shortLabel: 'WO Receipt',
        icon: CheckCircle2,
        badge: 'Receipts',
        description: 'Deliverable completion note, technician service signoff, and spares used.'
      },
      {
        id: '31.4',
        routeId: 'purchase:31.4',
        code: '31.4',
        label: 'View Work Orders / Requisitions / Receipts',
        shortLabel: 'Track WO Status',
        icon: Eye,
        badge: 'Status Tracker',
        description: 'Central consolidated work order tracking and contractor SLA status.'
      },
      {
        id: '31.5',
        routeId: 'purchase:31.5',
        code: '31.5',
        label: 'ORDERS: Approve Work Orders, Confirm Work Orders, Review Rejected',
        shortLabel: 'WO Orders Workflow',
        icon: ShieldCheck,
        badge: 'Approvals',
        description: 'Engineering supervisor and administrative financial approval workflow and rejected orders review.'
      },
      {
        id: '31.6',
        routeId: 'purchase:31.6',
        code: '31.6',
        label: 'RECEIPTS: Approve Work Order Receipts, Confirm Work Order Receipts',
        shortLabel: 'WO Receipts Workflow',
        icon: Award,
        badge: 'Receipt Signoff',
        description: 'Final work completion acceptance, inspection sign-off, and invoice clearance.'
      }
    ]
  },
  {
    id: '32',
    groupNumber: 'Analytics & Data Export',
    name: 'Analytics & Data Export',
    label: 'Analytics & Data Export',
    shortLabel: 'Analytics & Data Export',
    icon: BarChart3,
    badge: 'BI & Export',
    submodules: [
      {
        id: '32.1',
        routeId: 'purchase:32.1',
        code: '32.1',
        label: 'ANALYTICS: Billing, Inventory, Purchase, System Analytics',
        shortLabel: 'Operations Analytics',
        icon: BarChart3,
        badge: 'Analytics',
        description: 'Operational charts, revenue trends, stock consumption, and turn-around times.'
      },
      {
        id: '32.2',
        routeId: 'purchase:32.2',
        code: '32.2',
        label: 'DATA EXPORT: Billing Data Export, System Data Export',
        shortLabel: 'Statutory Data Export',
        icon: Database,
        badge: 'Data Export',
        description: 'Statutory compliance exports, GST reports, and encrypted system backups.'
      },
      {
        id: '32.3',
        routeId: 'purchase:32.3',
        code: '32.3',
        label: 'Executive KPI Dashboard Widgets',
        shortLabel: 'Executive KPIs',
        icon: Activity,
        badge: 'Executive KPIs',
        description: 'Bed occupancy rate (BOR), average length of stay (ALOS), and hospital OP counts.'
      },
      {
        id: '32.4',
        routeId: 'purchase:32.4',
        code: '32.4',
        label: 'Tabular Data Export (Excel / CSV)',
        shortLabel: 'Tabular CSV Export',
        icon: Download,
        badge: 'CSV / Excel',
        description: 'Filtered tabular reporting exports to CSV, XLSX, and printable formats.'
      }
    ]
  }
];

// Flattened list of all 34 submodules
export const ALL_PURCHASE_SUBMODULES = PURCHASE_MODULE_GROUPS.flatMap(g => g.submodules);

export function findPurchaseGroupBySubmoduleId(submoduleId) {
  if (!submoduleId) return PURCHASE_MODULE_GROUPS[0];
  const cleanId = String(submoduleId).replace('purchase:', '').replace('submodule:', '');
  const prefix = cleanId.split('.')[0];
  return (
    PURCHASE_MODULE_GROUPS.find(g => g.id === prefix || g.submodules.some(s => s.id === cleanId)) ||
    PURCHASE_MODULE_GROUPS[0]
  );
}

export function findPurchaseSubmoduleById(submoduleId) {
  if (!submoduleId) return ALL_PURCHASE_SUBMODULES[0];
  const cleanId = String(submoduleId).replace('purchase:', '').replace('submodule:', '');
  return ALL_PURCHASE_SUBMODULES.find(s => s.id === cleanId) || ALL_PURCHASE_SUBMODULES[0];
}

export function normalizePurchaseSubtab(subtab) {
  if (!subtab) return '26.1';
  const clean = String(subtab).replace('purchase:', '').replace('submodule:', '');
  if (ALL_PURCHASE_SUBMODULES.some(s => s.id === clean)) return clean;
  if (clean === '26') return '26.1';
  if (clean === '27') return '27.1';
  if (clean === '28') return '28.1';
  if (clean === '29') return '29.1';
  if (clean === '30') return '30.1';
  if (clean === '31') return '31.1';
  if (clean === '32') return '32.1';
  return '26.1';
}
