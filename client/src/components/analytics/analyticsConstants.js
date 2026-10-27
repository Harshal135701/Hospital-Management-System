import { BarChart3, Database, Activity, FileSpreadsheet } from 'lucide-react';

export const ANALYTICS_SUBMODULES = [
  {
    id: '32.1',
    label: 'Domain Analytics',
    icon: BarChart3,
    badge: 'Real-time',
    description: 'Cross-functional executive analytics: daily collection trends, inventory consumption, vendor lead times, and ASTM telemetry.',
    subsubmodules: [
      { id: '32.1.1', label: 'Billing & Revenue Analytics' },
      { id: '32.1.2', label: 'Inventory & Pharmacy Analytics' },
      { id: '32.1.3', label: 'Purchase & Supply Chain Analytics' },
      { id: '32.1.4', label: 'System & Infrastructure Analytics' }
    ]
  },
  {
    id: '32.2',
    label: 'Data Export Wizard',
    icon: Database,
    badge: 'Exports',
    description: 'Generate audited financial ledgers, clinical visit archives, automated SFTP snapshots, and compliance dumps.',
    subsubmodules: [
      { id: '32.2.1', label: 'Billing Financial Master Export' },
      { id: '32.2.2', label: 'System & Clinical Audit Export' },
      { id: '32.2.3', label: 'Automated SFTP / Cloud Backup Schedule' }
    ]
  },
  {
    id: '32.3',
    label: 'Executive KPI Dashboard',
    icon: Activity,
    badge: 'Command',
    description: 'Hospital command center: live inpatient census, ALOS, bed turnover rate, NABH clinical quality ratios, and department matrix.',
    subsubmodules: [
      { id: '32.3.1', label: 'Hospital Command Center & Census' },
      { id: '32.3.2', label: 'Clinical Quality & Safety Metrics (NABH)' },
      { id: '32.3.3', label: 'Departmental Volume & Revenue Breakdown' }
    ]
  },
  {
    id: '32.4',
    label: 'Tabular Data Export',
    icon: FileSpreadsheet,
    badge: 'CSV / XLSX',
    description: 'Custom column query designer, PHI data masking policies, and direct download to Excel (.xlsx) and CSV files.',
    subsubmodules: [
      { id: '32.4.1', label: 'Custom Column Query Builder' },
      { id: '32.4.2', label: 'Direct Tabular Export (.xlsx / .csv)' },
      { id: '32.4.3', label: 'PHI Compliance & Masking Policy' }
    ]
  }
];

export const KPI_SUMMARY = {
  totalBeds: 350,
  occupiedBeds: 309,
  occupancyRate: 88.4,
  icuOccupancy: 87.5,
  alosDays: 4.2,
  dailyRevenue: 1482500,
  otProceduresToday: 26,
  erTriagesToday: 48,
  haiInfectionRate: 0.38,
  medicationErrorRate: 0.0,
  unplannedOtReturn: 0.12,
  avgPharmacyWaitMins: 11
};

export const DEPARTMENT_METRICS = [
  { name: 'Cardiology & Cath Lab', patientsToday: 84, revenueShare: 32, alos: 3.8, occupancy: 94 },
  { name: 'Orthopaedics & Joint Replacement', patientsToday: 52, revenueShare: 22, alos: 4.5, occupancy: 88 },
  { name: 'General & Laparoscopic Surgery', patientsToday: 46, revenueShare: 18, alos: 3.2, occupancy: 86 },
  { name: 'Obstetrics & Gynaecology (MCH)', patientsToday: 68, revenueShare: 16, alos: 2.8, occupancy: 90 },
  { name: 'Nephrology & Dialysis', patientsToday: 38, revenueShare: 8, alos: 1.2, occupancy: 82 },
  { name: 'Emergency & Critical Care', patientsToday: 48, revenueShare: 4, alos: 2.1, occupancy: 96 }
];

export const SAMPLE_EXPORT_DATA = [
  {
    uhid: 'SP-2026-90412',
    name: 'Kalyani Sen',
    age: 48,
    dept: 'Nephrology',
    doctor: 'Dr. Ramesh N. Rao',
    billAmount: 38500,
    paidAmount: 38500,
    payMode: 'TPA Cashless (Star Health)',
    status: 'Settled',
    date: '2026-10-27'
  },
  {
    uhid: 'SP-2026-90413',
    name: 'Ranganath Gowda',
    age: 62,
    dept: 'Cardiology',
    doctor: 'Dr. Ramesh N. Rao',
    billAmount: 184000,
    paidAmount: 184000,
    payMode: 'Pre-Auth (HDFC ERGO)',
    status: 'Settled',
    date: '2026-10-27'
  },
  {
    uhid: 'SP-2026-90414',
    name: 'Ananya Sharma',
    age: 29,
    dept: 'IVF & Fertility',
    doctor: 'Dr. Shruthi Hegde',
    billAmount: 65000,
    paidAmount: 65000,
    payMode: 'UPI / Direct Bank',
    status: 'Settled',
    date: '2026-10-26'
  },
  {
    uhid: 'SP-2026-90415',
    name: 'Basavaraj Patil',
    age: 55,
    dept: 'Orthopaedics',
    doctor: 'Dr. Vinay Kumar',
    billAmount: 142000,
    paidAmount: 120000,
    payMode: 'Cash / Interim',
    status: 'Interim Bill',
    date: '2026-10-26'
  },
  {
    uhid: 'SP-2026-90416',
    name: 'Mohammed Zubair',
    age: 38,
    dept: 'Emergency / Trauma',
    doctor: 'Dr. Srinivas Rao',
    billAmount: 24500,
    paidAmount: 24500,
    payMode: 'Debit Card POS',
    status: 'Settled',
    date: '2026-10-25'
  }
];
