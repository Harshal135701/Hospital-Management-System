import {
  FlaskConical,
  Snowflake,
  Flame,
  Users,
  LayoutGrid,
  Printer,
  FileSpreadsheet,
  Network,
  Calendar,
  Clock,
  Layers,
  Bell,
  Receipt,
  CreditCard,
  FileText,
  IndianRupee,
  RefreshCw,
  Landmark
} from 'lucide-react';

export const BILLING_GROUPS = [
  {
    id: '1',
    groupNumber: 'Group 1',
    title: 'IVF & Andrology Operations',
    shortTitle: 'IVF & Andrology',
    badge: 'Clinical Lab',
    submodules: [
      {
        id: '1.1',
        title: '1.1 Semen Analysis Entry',
        shortTitle: 'Semen Analysis',
        group: '1',
        groupTitle: 'IVF & Andrology Operations',
        description: 'WHO 6th Edition compliant andrology entry, motility, morphology & vitality worklists',
        icon: FlaskConical,
        badge: 'Diagnostic'
      },
      {
        id: '1.2',
        title: '1.2 Cryopreservation / Semen Freezing',
        shortTitle: 'Cryopreservation',
        group: '1',
        groupTitle: 'IVF & Andrology Operations',
        description: 'Specimen vitrification, straw barcodes, liquid nitrogen tank & canister allocation',
        icon: Snowflake,
        badge: 'Cryo-Bank'
      },
      {
        id: '1.3',
        title: '1.3 Sample Thaw & Usage',
        shortTitle: 'Sample Thaw & Usage',
        group: '1',
        groupTitle: 'IVF & Andrology Operations',
        description: 'Consent verification, aliquot retrieval, thaw survival rate & cycle deduction',
        icon: Flame,
        badge: 'Inventory'
      },
      {
        id: '1.4',
        title: '1.4 Donor Registry',
        shortTitle: 'Donor Registry',
        group: '1',
        groupTitle: 'IVF & Andrology Operations',
        description: 'Anonymous donor profiles, serology screening, consent audit & legal tracking',
        icon: Users,
        badge: 'Registry'
      }
    ]
  },
  {
    id: '2',
    groupNumber: 'Group 2',
    title: 'Configuration & Integrations',
    shortTitle: 'Config & Integrations',
    badge: 'System Admin',
    submodules: [
      {
        id: '2.1',
        title: '2.1 Widgets & Dashboard Configuration',
        shortTitle: 'Widgets & Dashboard',
        group: '2',
        groupTitle: 'Configuration & Integrations',
        description: 'Manage operational dashboard widgets, role-based layout & display visibility',
        icon: LayoutGrid,
        badge: 'Layout'
      },
      {
        id: '2.2',
        title: '2.2 Barcode & Thermal Printer Settings',
        shortTitle: 'Printer & Barcode Settings',
        group: '2',
        groupTitle: 'Configuration & Integrations',
        description: 'Direct thermal, 80mm POS receipt printers, specimen tube & straw label profiles',
        icon: Printer,
        badge: 'Hardware'
      },
      {
        id: '2.3',
        title: '2.3 Document Scanner & Attachment Setup',
        shortTitle: 'Scanner & Attachments',
        group: '2',
        groupTitle: 'Configuration & Integrations',
        description: 'EMR attachment file limits, category configuration & scan upload integration',
        icon: FileSpreadsheet,
        badge: 'EMR Setup'
      },
      {
        id: '2.4',
        title: '2.4 External API Integration Status',
        shortTitle: 'External API Status',
        group: '2',
        groupTitle: 'Configuration & Integrations',
        description: 'Live monitoring of SMS gateways, WhatsApp API, Payment Gateways & LIS links',
        icon: Network,
        badge: 'Gateway'
      }
    ]
  },
  {
    id: '3',
    groupNumber: 'Group 3',
    title: 'Appointments & Patient Flow',
    shortTitle: 'Appointments & Flow',
    badge: 'Front Desk',
    submodules: [
      {
        id: '3.1',
        title: '3.1 Book / Reschedule Appointment',
        shortTitle: 'Book / Reschedule',
        group: '3',
        groupTitle: 'Appointments & Patient Flow',
        description: 'Outpatient consultation booking, doctor slot calendar, cancellations & reschedules',
        icon: Calendar,
        badge: 'Core'
      },
      {
        id: '3.2',
        title: '3.2 Doctor Roster & Shift Planning',
        shortTitle: 'Doctor Roster',
        group: '3',
        groupTitle: 'Appointments & Patient Flow',
        description: 'Consultant clinic shift planning, department duty rosters & leave approval',
        icon: Clock,
        badge: 'Staff'
      },
      {
        id: '3.3',
        title: '3.3 Token Queue / Waiting Room Display',
        shortTitle: 'Token Queue',
        group: '3',
        groupTitle: 'Appointments & Patient Flow',
        description: 'Live outpatient token pacing, waiting lounge LCD display & doctor call-next desk',
        icon: Layers,
        badge: 'Pacing'
      },
      {
        id: '3.4',
        title: '3.4 SMS / WhatsApp Reminders & Alerts',
        shortTitle: 'Reminders & Alerts',
        group: '3',
        groupTitle: 'Appointments & Patient Flow',
        description: 'Automated consultation reminder dispatches, failure inspection & message triggers',
        icon: Bell,
        badge: 'Alerts'
      }
    ]
  },
  {
    id: '4',
    groupNumber: 'Group 4',
    title: 'Financial Billing Operations',
    shortTitle: 'Financial Billing',
    badge: 'Cashier POS',
    submodules: [
      {
        id: '4.1',
        title: '4.1 OPD Billing POS',
        shortTitle: 'OPD Billing POS',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Outpatient point of sale, multi-item charges, UPI QR, card & instant tax receipts',
        icon: Receipt,
        badge: 'POS'
      },
      {
        id: '4.2',
        title: '4.2 IPD Running / Interim Bill',
        shortTitle: 'IPD Interim Bill',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Accrued room tariffs, daily nursing, pharmacy indents & interim bill statements',
        icon: CreditCard,
        badge: 'Inpatient'
      },
      {
        id: '4.3',
        title: '4.3 Discharge Final Bill',
        shortTitle: 'Discharge Final Bill',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Complete discharge package settlement, TPA cashless deductions & gate passes',
        icon: FileText,
        badge: 'Discharge'
      },
      {
        id: '4.4',
        title: '4.4 Advance Deposit Collection',
        shortTitle: 'Advance Deposits',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Pre-admission advances, surgery deposits ledger & unutilized balance tracking',
        icon: IndianRupee,
        badge: 'Ledger'
      },
      {
        id: '4.5',
        title: '4.5 My Refunds',
        shortTitle: 'My Refunds',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Refund requests, authorization workflows, duplicate reversal & payout tracking',
        icon: RefreshCw,
        badge: 'Reversals'
      },
      {
        id: '4.6',
        title: '4.6 Day-End Cashier Settlement',
        shortTitle: 'Day-End Settlement',
        group: '4',
        groupTitle: 'Financial Billing Operations',
        description: 'Counter cash drawer reconciliation, currency denomination count & shift closing',
        icon: Landmark,
        badge: 'Reconciliation'
      }
    ]
  }
];

export const ALL_BILLING_SUBMODULES = BILLING_GROUPS.flatMap(g => g.submodules);
