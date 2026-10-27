import {
  ShoppingBag,
  ScanLine,
  CreditCard,
  RefreshCw,
  Users,
  ShieldCheck,
  Building2,
  Bell,
  Lock,
  UserCheck,
  Key,
  Sliders,
  Wrench,
  FileText,
  CheckCircle2,
  Eye,
  Award,
  BarChart3,
  Database,
  Activity,
  FileSpreadsheet,
  Tag,
  QrCode,
  IndianRupee,
  Download
} from 'lucide-react';

/**
 * Strips leading numeric indices such as "28.1 ", "29. ", "32.4 "
 * so labels render cleanly without numeric prefixes in sidebar and page titles.
 */
export const stripNumericPrefix = (text) => {
  if (!text) return '';
  return text.replace(/^\d+(\.\d+)*\s*[-–.:]?\s*/, '').replace(/^(AUDIT|SETUP|SYSTEM|ORDERS|RECEIPTS|ANALYTICS|DATA EXPORT):\s*/i, '').trim();
};

/**
 * The 5 Core Groups for Retail Sales & Operations
 * Exactly as requested in Section A of the specification.
 */
export const OPERATIONS_MODULE_GROUPS = [
  {
    id: '28',
    groupId: '28',
    label: 'Retail Sales & POS',
    shortLabel: 'Retail Sales & POS',
    icon: ShoppingBag,
    badge: 'POS',
    submodules: [
      {
        id: '28.1',
        routeId: 'operations:28.1',
        code: '28.1',
        label: 'Over-the-Counter (OTC) POS Counter',
        shortLabel: 'OTC POS Counter',
        icon: ShoppingBag,
        badge: 'OTC Desk',
        description: 'Direct walk-in customer retail sales, product catalog search, and tax invoice generation.'
      },
      {
        id: '28.2',
        routeId: 'operations:28.2',
        code: '28.2',
        label: 'Quick Barcode Scanning & Billing',
        shortLabel: 'Barcode Billing',
        icon: ScanLine,
        badge: 'Fast Scan',
        description: 'High-speed barcode scanner input, real-time item additions, and GST tax computation.'
      },
      {
        id: '28.3',
        routeId: 'operations:28.3',
        code: '28.3',
        label: 'Multi-Mode Instant Payment',
        shortLabel: 'Instant Payment',
        icon: CreditCard,
        badge: 'Payments',
        description: 'Instant settlement via UPI QR codes, Credit/Debit card POS terminal, Cash, and Split tender.'
      },
      {
        id: '28.4',
        routeId: 'operations:28.4',
        code: '28.4',
        label: 'Retail Sales Return & Cash Refund',
        shortLabel: 'Sales Return & Refund',
        icon: RefreshCw,
        badge: 'Returns',
        description: 'Invoice verification, returned item restock audit, and verified cash or original tender refund.'
      }
    ]
  },
  {
    id: '29',
    groupId: '29',
    label: 'System Administration & Audit',
    shortLabel: 'System Admin & Audit',
    icon: ShieldCheck,
    badge: 'Security',
    submodules: [
      {
        id: '29.1',
        routeId: 'operations:29.1',
        code: '29.1',
        label: 'View User Sessions',
        shortLabel: 'Active Sessions',
        icon: Users,
        badge: 'Sessions',
        description: 'Active staff logins, workstation IP addresses, session duration, and remote session termination.'
      },
      {
        id: '29.2',
        routeId: 'operations:29.2',
        code: '29.2',
        label: 'System Audit Trail & Clinical Audit Trail',
        shortLabel: 'Audit Trails',
        icon: ShieldCheck,
        badge: 'Audit Trail',
        description: 'Immutable read-only log of patient data access, medication dispenses, and administrative events.'
      },
      {
        id: '29.3',
        routeId: 'operations:29.3',
        code: '29.3',
        label: 'Department & Module Master Setup',
        shortLabel: 'Department Master',
        icon: Building2,
        badge: 'Master Setup',
        description: 'Clinical department master, bed allocation quotas, head of department (HOD), and module toggles.'
      },
      {
        id: '29.4',
        routeId: 'operations:29.4',
        code: '29.4',
        label: 'System Event Configuration',
        shortLabel: 'Event Configuration',
        icon: Bell,
        badge: 'Events',
        description: 'Automated notification triggers, panic alarm webhooks, and clinical SMS/Email templates.'
      },
      {
        id: '29.5',
        routeId: 'operations:29.5',
        code: '29.5',
        label: 'Role-Based Access Control (RBAC) & Permissions',
        shortLabel: 'RBAC Permissions',
        icon: Lock,
        badge: 'RBAC',
        description: 'Role-based access matrix, granular permission flags, and administrative authorization safeguards.'
      }
    ]
  },
  {
    id: '30',
    groupId: '30',
    label: 'User Profile & Preferences',
    shortLabel: 'Profile & Preferences',
    icon: UserCheck,
    badge: 'Preferences',
    submodules: [
      {
        id: '30.1',
        routeId: 'operations:30.1',
        code: '30.1',
        label: 'Manage Profile',
        shortLabel: 'User Profile',
        icon: UserCheck,
        badge: 'Profile',
        description: 'Staff member biographical details, medical council registration, phone, and qualifications.'
      },
      {
        id: '30.2',
        routeId: 'operations:30.2',
        code: '30.2',
        label: 'Change Password & Security',
        shortLabel: 'Change Password',
        icon: Key,
        badge: 'Security',
        description: 'Secure credential updates with current password verification and token regeneration.'
      },
      {
        id: '30.3',
        routeId: 'operations:30.3',
        code: '30.3',
        label: 'Switch Active Hospital Branch',
        shortLabel: 'Switch Branch',
        icon: Building2,
        badge: 'Branch',
        description: 'Switch operational facility context between multi-hospital branches and diagnostic centers.'
      },
      {
        id: '30.4',
        routeId: 'operations:30.4',
        code: '30.4',
        label: 'Switch Active Role',
        shortLabel: 'Switch Role',
        icon: Sliders,
        badge: 'Role',
        description: 'Switch active clinical or administrative session role for multi-privileged hospital staff.'
      },
      {
        id: '30.5',
        routeId: 'operations:30.5',
        code: '30.5',
        label: 'User UI Preferences & Theme',
        shortLabel: 'UI Preferences',
        icon: Sliders,
        badge: 'Theme',
        description: 'Customize application theme, compact table density, and default operational landing desk.'
      }
    ]
  },
  {
    id: '31',
    groupId: '31',
    label: 'Work Order Management',
    shortLabel: 'Work Order Management',
    icon: Wrench,
    badge: 'Work Orders',
    submodules: [
      {
        id: '31.1',
        routeId: 'operations:31.1',
        code: '31.1',
        label: 'Record Work Order',
        shortLabel: 'Record Work Order',
        icon: Wrench,
        badge: 'Create WO',
        description: 'Generate service work orders for biomedical equipment, facility engineering, and external contractors.'
      },
      {
        id: '31.2',
        routeId: 'operations:31.2',
        code: '31.2',
        label: 'Record Work Order Requisition',
        shortLabel: 'WO Requisition',
        icon: FileText,
        badge: 'Requisitions',
        description: 'Departmental maintenance and repair requisitions with priority urgency indicators.'
      },
      {
        id: '31.3',
        routeId: 'operations:31.3',
        code: '31.3',
        label: 'Record Work Order Receipt',
        shortLabel: 'WO Receipt',
        icon: CheckCircle2,
        badge: 'Receipts',
        description: 'Technician service signoff note, spare parts consumption, and deliverable verification.'
      },
      {
        id: '31.4',
        routeId: 'operations:31.4',
        code: '31.4',
        label: 'View Work Orders / Requisitions / Receipts',
        shortLabel: 'Track Status',
        icon: Eye,
        badge: 'Status Tracker',
        description: 'Consolidated tracking table with search and filters for pending, in-progress, and completed orders.'
      },
      {
        id: '31.5',
        routeId: 'operations:31.5',
        code: '31.5',
        label: 'Approve Work Orders, Confirm Work Orders & Review Rejected',
        shortLabel: 'Order Approvals',
        icon: ShieldCheck,
        badge: 'Approvals',
        description: 'Biomedical engineering supervisory approvals, financial confirmation, and rejection reason review.'
      },
      {
        id: '31.6',
        routeId: 'operations:31.6',
        code: '31.6',
        label: 'Approve Work Order Receipts & Confirm Work Order Receipts',
        shortLabel: 'Receipt Approvals',
        icon: Award,
        badge: 'Receipt Signoff',
        description: 'Inspection acceptance signoff, facility clearance, and invoice release confirmation.'
      }
    ]
  },
  {
    id: '32',
    groupId: '32',
    label: 'Analytics & Data Export',
    shortLabel: 'Analytics & Data Export',
    icon: BarChart3,
    badge: 'BI & Export',
    submodules: [
      {
        id: '32.1',
        routeId: 'operations:32.1',
        code: '32.1',
        label: 'Billing, Inventory, Purchase & System Analytics',
        shortLabel: 'Operations Analytics',
        icon: BarChart3,
        badge: 'Analytics',
        description: 'Multi-department operational analytics, revenue velocity, inventory consumption, and turn-around times.'
      },
      {
        id: '32.2',
        routeId: 'operations:32.2',
        code: '32.2',
        label: 'Billing Data Export & System Data Export',
        shortLabel: 'Compliance Export',
        icon: Database,
        badge: 'Data Export',
        description: 'Statutory GST invoices, accounting revenue reports, and encrypted system audit archives.'
      },
      {
        id: '32.3',
        routeId: 'operations:32.3',
        code: '32.3',
        label: 'Executive KPI Dashboard Widgets',
        shortLabel: 'Executive KPIs',
        icon: Activity,
        badge: 'Executive KPIs',
        description: 'Bed Occupancy Rate (BOR), Average Length of Stay (ALOS), and hospital OP footfall metrics.'
      },
      {
        id: '32.4',
        routeId: 'operations:32.4',
        code: '32.4',
        label: 'Tabular Data Export (Excel / CSV)',
        shortLabel: 'CSV / Excel Export',
        icon: FileSpreadsheet,
        badge: 'CSV / Excel',
        description: 'Export filtered hospital operational tables to standard formatted CSV and Excel-compatible files.'
      }
    ]
  }
];

/**
 * Flat list of all 24 submodules across all 5 groups
 */
export const ALL_OPERATIONS_SUBMODULES = OPERATIONS_MODULE_GROUPS.flatMap(group =>
  group.submodules.map(sub => ({
    ...sub,
    groupId: group.id,
    groupLabel: group.label
  }))
);

export const findOperationsSubmoduleById = (subId) => {
  if (!subId) return ALL_OPERATIONS_SUBMODULES[0];
  const clean = String(subId)
    .replace('operations:', '')
    .replace('retail-operations:', '')
    .replace('purchase:', '')
    .replace('submodule:', '');
  return ALL_OPERATIONS_SUBMODULES.find(s => s.id === clean || s.routeId === subId) || ALL_OPERATIONS_SUBMODULES[0];
};

export const findOperationsGroupBySubmoduleId = (subId) => {
  const sub = findOperationsSubmoduleById(subId);
  if (!sub) return OPERATIONS_MODULE_GROUPS[0];
  return OPERATIONS_MODULE_GROUPS.find(g => g.id === sub.groupId) || OPERATIONS_MODULE_GROUPS[0];
};

export const normalizeOperationsSubtab = (subtab) => {
  if (!subtab) return '28.1';
  const clean = String(subtab)
    .replace('operations:', '')
    .replace('retail-operations:', '')
    .replace('purchase:', '')
    .replace('submodule:', '');
  const found = ALL_OPERATIONS_SUBMODULES.find(s => s.id === clean);
  if (found) return found.id;
  if (clean === '28') return '28.1';
  if (clean === '29') return '29.1';
  if (clean === '30') return '30.1';
  if (clean === '31') return '31.1';
  if (clean === '32') return '32.1';
  return '28.1';
};
