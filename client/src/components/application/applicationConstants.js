import {
  LayoutGrid,
  Printer,
  FileSpreadsheet,
  Network,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

export const APPLICATION_SUBMODULES = [
  {
    id: '2.1',
    number: '2.1',
    title: 'Widgets & Dashboard Configuration',
    shortTitle: 'Widgets & Dashboard',
    badge: 'Layout Studio',
    icon: LayoutGrid,
    description: 'Customize hospital command center widgets, role-based visibility, grid arrangements, and live operational previews.'
  },
  {
    id: '2.2',
    number: '2.2',
    title: 'Barcode & Thermal Printer Settings',
    shortTitle: 'Printers & Barcodes',
    badge: 'Hardware Spooler',
    icon: Printer,
    description: 'Configure 80mm thermal receipt printers, laboratory tube barcode printers, wristbands, and cryo-straw label templates.'
  },
  {
    id: '2.3',
    number: '2.3',
    title: 'Document Scanner & Attachment Setup',
    shortTitle: 'Scanners & Attachments',
    badge: 'EMR Storage',
    icon: FileSpreadsheet,
    description: 'Manage EMR document acquisition policies, file size quotas, category retention rules, and clinical scan uploads.'
  },
  {
    id: '2.4',
    number: '2.4',
    title: 'External API Integration Status',
    shortTitle: 'External API Telemetry',
    badge: 'Gateway Monitor',
    icon: Network,
    description: 'Real-time telemetry, webhook health, latency checks, and secure masked credential oversight for third-party gateways.'
  }
];

export const WIDGET_CATEGORIES = [
  'All Categories',
  'Financial',
  'Clinical Operations',
  'Inpatient',
  'Diagnostic Lab',
  'Communications',
  'Administration'
];

export const USER_ROLES = [
  'All Roles',
  'Hospital Admin',
  'Doctor',
  'Nurse',
  'Cashier',
  'Billing Lead',
  'Embryologist',
  'Lab Technician',
  'Receptionist',
  'Finance Officer'
];

export const GRID_COLUMN_OPTIONS = [
  { value: 2, label: '2-Column Compact Grid' },
  { value: 3, label: '3-Column Standard Desktop' },
  { value: 4, label: '4-Column Wide Wallboard' }
];

export const PRINTER_TYPES = [
  'Direct Thermal',
  'Thermal Transfer',
  'Impact / Dot-Matrix',
  'Laser / Document'
];

export const CONNECTION_INTERFACES = [
  'USB 2.0 / 3.0',
  'Network LAN (Ethernet IP)',
  'Wi-Fi 802.11 b/g/n',
  'Virtual COM Port (RS-232)'
];

export const LABEL_TEMPLATES = [
  { id: 'pos_receipt', name: '80mm Thermal Receipt (Billing & OPD)', width: '80mm', height: 'Continuous', symbology: 'Code 128 / QR Code' },
  { id: 'specimen_tube', name: '50x25mm Specimen Tube Label (Laboratory)', width: '50mm', height: '25mm', symbology: 'Code 128 (Subtype B)' },
  { id: 'wristband', name: '25x280mm Inpatient Adult Wristband (IPD)', width: '25mm', height: '280mm', symbology: 'DataMatrix 2D' },
  { id: 'cryo_straw', name: '38x19mm Cryo-Resistant Straw Tag (Andrology/IVF)', width: '38mm', height: '19mm', symbology: 'Micro-QR / Code 128' }
];

export const BARCODE_SYMBOLOGIES = [
  'Code 128',
  'QR Code',
  'DataMatrix',
  'Code 39',
  'EAN-13'
];

export const SCANNER_ACQUISITION_MODES = [
  { id: 'browser_upload', name: 'Browser File Upload / Intake', description: 'Standard secure file chooser and drag-and-drop' },
  { id: 'twain_bridge', name: 'TWAIN / WIA Local Bridge Service', description: 'High-speed flatbed & document feeder workstation bridge' },
  { id: 'camera_capture', name: 'Webcam / Device Video Capture', description: 'Direct document photographing via workstation camera' }
];

export const ALLOWED_MIME_TYPES = [
  { ext: 'PDF', mime: 'application/pdf', label: 'Adobe PDF Documents' },
  { ext: 'JPG / JPEG', mime: 'image/jpeg', label: 'JPEG Scanned Images' },
  { ext: 'PNG', mime: 'image/png', label: 'PNG Lossless Images' },
  { ext: 'DICOM (.dcm)', mime: 'application/dicom', label: 'Radiology DICOM Studies' }
];

export const FILE_SIZE_LIMIT_OPTIONS = [
  { value: 5, label: '5 MB (Standard Text / Summaries)' },
  { value: 10, label: '10 MB (Recommended for Reports & Consents)' },
  { value: 25, label: '25 MB (High-Resolution Scans & Ultrasound)' },
  { value: 50, label: '50 MB (Multi-Page Studies & CT / MRI slices)' }
];

export const GATEWAY_CATEGORIES = [
  'All Gateways',
  'SMS DLT',
  'WhatsApp Cloud',
  'Payment Gateway',
  'HL7 / LIS Socket',
  'Government ABDM',
  'Insurance / TPA Switch'
];

export const GATEWAY_STATUS_CONFIG = {
  healthy: {
    label: 'Healthy / Active',
    badgeVariant: 'green',
    icon: CheckCircle2,
    color: '#16A34A',
    bg: '#DCFCE7'
  },
  sandbox: {
    label: 'Active (Production Sandbox)',
    badgeVariant: 'blue',
    icon: Sparkles,
    color: '#2563EB',
    bg: '#DBEAFE'
  },
  degraded: {
    label: 'Degraded / Latency Warning',
    badgeVariant: 'amber',
    icon: AlertTriangle,
    color: '#D97706',
    bg: '#FEF3C7'
  },
  disconnected: {
    label: 'Disconnected / Offline',
    badgeVariant: 'red',
    icon: AlertTriangle,
    color: '#DC2626',
    bg: '#FEE2E2'
  },
  not_tested: {
    label: 'Not Tested Yet',
    badgeVariant: 'outline',
    icon: Clock,
    color: '#6B7280',
    bg: '#F3F4F6'
  }
};
