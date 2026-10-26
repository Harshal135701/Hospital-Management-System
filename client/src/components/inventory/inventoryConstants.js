import {
  Package,
  FileText,
  Truck,
  ClipboardList,
  Bell,
  Bed,
  Activity,
  RefreshCw,
  Stethoscope,
  CheckCircle2,
  HeartPulse,
  ScanLine,
  Clock,
  Tag,
  Sliders,
  AlertCircle,
  Archive,
  Award,
  BookOpen,
  Pill,
  Users,
  Syringe,
  ShieldCheck,
  UserPlus,
  Search,
  ShoppingBag,
  Calculator,
  Camera,
  Eye,
  IndianRupee,
  Lock,
  Key,
  Building2,
  Wrench,
  BarChart3,
  Database,
  FileSpreadsheet
} from 'lucide-react';

export const INVENTORY_GROUPS = [
  {
    id: '16',
    groupNumber: 'Group 1',
    title: 'Inventory & Store Management',
    shortTitle: 'Store Management',
    badge: 'Stores',
    icon: Package,
    submodules: [
      {
        id: '16.1',
        title: 'Item Master & Material Categories',
        shortTitle: 'Item Master',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Central catalogue of consumables, surgical items, and material groupings',
        icon: Package,
        badge: 'Catalogue'
      },
      {
        id: '16.2',
        title: 'Store Requisition (Indent)',
        shortTitle: 'Store Requisition',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Departmental store indents, consumption requests, and approval workflow',
        icon: FileText,
        badge: 'Indents'
      },
      {
        id: '16.3',
        title: 'Store Issue to Wards/OT',
        shortTitle: 'Store Issue',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Transfer of consumables to inpatient wards, ICUs, and surgical suites',
        icon: Truck,
        badge: 'Dispatches'
      },
      {
        id: '16.4',
        title: 'Physical Stock Verification & Audit',
        shortTitle: 'Stock Audit',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Stock counts, reconciliation of variances, and expiry auditing',
        icon: ClipboardList,
        badge: 'Audit'
      },
      {
        id: '16.5',
        title: 'Minimum / Maximum Reorder Alerts',
        shortTitle: 'Reorder Alerts',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Automated safety stock thresholds, lead-time tracking, and reorder triggers',
        icon: Bell,
        badge: 'Alerts'
      }
    ]
  },
  {
    id: '17',
    groupNumber: 'Group 2',
    title: 'Inpatient & Bed Management',
    shortTitle: 'Inpatient & Beds',
    badge: 'IPD',
    icon: Bed,
    submodules: [
      {
        id: '17.1',
        title: 'Admission Desk & Form',
        shortTitle: 'Admission Desk',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Inpatient admission capture, admitting consultant, and room allotment',
        icon: Bed,
        badge: 'Admit'
      },
      {
        id: '17.2',
        title: 'My IP Admissions Dashboard',
        shortTitle: 'IP Admissions',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Live inpatient census, length of stay, and treating clinician breakdown',
        icon: Activity,
        badge: 'Census'
      },
      {
        id: '17.3',
        title: 'Live Bed Matrix / Bed Board',
        shortTitle: 'Live Bed Matrix',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Real-time interactive ward bed status, occupancy colors, and housekeeping tags',
        icon: Bed,
        badge: 'Live Board'
      },
      {
        id: '17.4',
        title: 'Bed Transfer Management',
        shortTitle: 'Bed Transfers',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Inter-ward transfers, ICU upgrade/downgrade requests, and bed handovers',
        icon: RefreshCw,
        badge: 'Transfers'
      },
      {
        id: '17.5',
        title: 'Inpatient Doctor Daily Rounds',
        shortTitle: 'Daily Rounds',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Daily consultant rounds, clinical assessments, and bedside order reviews',
        icon: Stethoscope,
        badge: 'Rounds'
      },
      {
        id: '17.6',
        title: 'Discharge Process & Summary',
        shortTitle: 'Discharge Process',
        group: '17',
        groupTitle: 'Inpatient & Bed Management',
        description: 'Planned discharge initiation, medical clearance, and discharge summary',
        icon: CheckCircle2,
        badge: 'Discharge'
      }
    ]
  },
  {
    id: '18',
    groupNumber: 'Group 3',
    title: 'IVF & Andrology Cycle Management',
    shortTitle: 'IVF & Andrology Cycle',
    badge: 'Fertility',
    icon: HeartPulse,
    submodules: [
      {
        id: '18.1',
        title: 'Couple Registration & Legal Consent',
        shortTitle: 'Couple Registration',
        group: '18',
        groupTitle: 'IVF & Andrology Cycle Management',
        description: 'ART regulatory consent, couple biological records, and legal document capture',
        icon: HeartPulse,
        badge: 'Legal Consent'
      },
      {
        id: '18.2',
        title: 'Ovarian Stimulation Protocol',
        shortTitle: 'Stimulation Protocol',
        group: '18',
        groupTitle: 'IVF & Andrology Cycle Management',
        description: 'Gonadotropin dosage tracking, protocol selection (antagonist/agonist), and logs',
        icon: Activity,
        badge: 'Protocol'
      },
      {
        id: '18.3',
        title: 'Follicular Ultrasound Tracking',
        shortTitle: 'Follicular Ultrasound',
        group: '18',
        groupTitle: 'IVF & Andrology Cycle Management',
        description: 'Folliculometry follicular cohort measurements and endometrial thickness charting',
        icon: ScanLine,
        badge: 'Ultrasound'
      },
      {
        id: '18.4',
        title: 'Trigger Timing & Scheduling',
        shortTitle: 'Trigger Timing',
        group: '18',
        groupTitle: 'IVF & Andrology Cycle Management',
        description: 'hCG / GnRH agonist trigger timing, 36-hour countdown, and OPU scheduling',
        icon: Clock,
        badge: 'Trigger'
      },
      {
        id: '18.5',
        title: 'Cycle Outcome & Pregnancy Registry',
        shortTitle: 'Cycle Outcome',
        group: '18',
        groupTitle: 'IVF & Andrology Cycle Management',
        description: 'Beta-hCG confirmation, clinical pregnancy tracking, and ART registry reporting',
        icon: CheckCircle2,
        badge: 'Registry'
      }
    ]
  },
  {
    id: '19',
    groupNumber: 'Group 4',
    title: 'Laboratory Management',
    shortTitle: 'Laboratory',
    badge: 'Diagnostics',
    icon: Activity,
    submodules: [
      {
        id: '19.1',
        title: 'Test Requisition & Billing',
        shortTitle: 'Test Requisition',
        group: '19',
        groupTitle: 'Laboratory Management',
        description: 'Diagnostic test ordering, outpatient lab billing, and panel selection',
        icon: Activity,
        badge: 'Requisitions'
      },
      {
        id: '19.2',
        title: 'Phlebotomy & Sample Barcode Labeling',
        shortTitle: 'Phlebotomy & Labels',
        group: '19',
        groupTitle: 'Laboratory Management',
        description: 'Sample accessioning, barcode tube generation, and phlebotomy collection',
        icon: Tag,
        badge: 'Phlebotomy'
      },
      {
        id: '19.3',
        title: 'Instrument Worklist Interfacing',
        shortTitle: 'Instrument Worklists',
        group: '19',
        groupTitle: 'Laboratory Management',
        description: 'Biochemistry and hematology automated analyzer interfacing (ASTM/HL7)',
        icon: Sliders,
        badge: 'Interfaces'
      },
      {
        id: '19.4',
        title: 'Result Entry & Panic Value Alerts',
        shortTitle: 'Result Entry & Alerts',
        group: '19',
        groupTitle: 'Laboratory Management',
        description: 'Analyte values, reference ranges, critical/panic value notifications',
        icon: AlertCircle,
        badge: 'Panic Alerts'
      },
      {
        id: '19.5',
        title: 'Pathologist Verification & Authorization',
        shortTitle: 'Pathologist Sign-off',
        group: '19',
        groupTitle: 'Laboratory Management',
        description: 'Digital sign-off, clinical interpretation, and EMR authorization release',
        icon: CheckCircle2,
        badge: 'Authorization'
      }
    ]
  },
  {
    id: '20',
    groupNumber: 'Group 5',
    title: 'Medical Records & HIM',
    shortTitle: 'Medical Records (HIM)',
    badge: 'HIM',
    icon: Archive,
    submodules: [
      {
        id: '20.1',
        title: 'Physical File Archival & Rack Tracking',
        shortTitle: 'File Archival & Racks',
        group: '20',
        groupTitle: 'Medical Records & HIM',
        description: 'Physical case sheet indexing, compactor rack location, and barcodes',
        icon: Archive,
        badge: 'Archival'
      },
      {
        id: '20.2',
        title: 'ICD-10 & CPT Clinical Coding',
        shortTitle: 'ICD-10 & CPT Coding',
        group: '20',
        groupTitle: 'Medical Records & HIM',
        description: 'Morbidity and mortality coding for insurance dossiers and WHO reporting',
        icon: FileText,
        badge: 'Coding'
      },
      {
        id: '20.3',
        title: 'Birth & Death Registration',
        shortTitle: 'Birth & Death Registry',
        group: '20',
        groupTitle: 'Medical Records & HIM',
        description: 'Statutory birth/death certificates, Form 4A, and municipal reporting',
        icon: Award,
        badge: 'Civil Registry'
      },
      {
        id: '20.4',
        title: 'File Checkout & Audit Lending',
        shortTitle: 'File Checkout & Lending',
        group: '20',
        groupTitle: 'Medical Records & HIM',
        description: 'File lending audit trail, department borrowers, and return tracking',
        icon: BookOpen,
        badge: 'Lending'
      }
    ]
  },
  {
    id: '21',
    groupNumber: 'Group 6',
    title: 'Ward Nursing',
    shortTitle: 'Ward Nursing',
    badge: 'Nursing',
    icon: HeartPulse,
    submodules: [
      {
        id: '21.1',
        title: 'Ward Nursing Workstation',
        shortTitle: 'Nursing Workstation',
        group: '21',
        groupTitle: 'Ward Nursing',
        description: 'Nurse shift console, active bed assignments, and handover briefings',
        icon: HeartPulse,
        badge: 'Station'
      },
      {
        id: '21.2',
        title: 'Vitals & Intake-Output Charting',
        shortTitle: 'Vitals & I/O Charting',
        group: '21',
        groupTitle: 'Ward Nursing',
        description: 'Bedside telemetry, fluid balance charts, and drainage recordings',
        icon: Activity,
        badge: 'Charting'
      },
      {
        id: '21.3',
        title: 'Medication Administration Record (MAR)',
        shortTitle: 'MAR Medication',
        group: '21',
        groupTitle: 'Ward Nursing',
        description: 'Scheduled drug doses, time administration logs, and nurse e-sign',
        icon: Pill,
        badge: 'e-MAR'
      },
      {
        id: '21.4',
        title: 'Doctor Order Execution',
        shortTitle: 'Doctor Order Execution',
        group: '21',
        groupTitle: 'Ward Nursing',
        description: 'Implementation of clinician orders, nursing interventions, and verifications',
        icon: CheckCircle2,
        badge: 'Orders'
      },
      {
        id: '21.5',
        title: 'Shift Handover Notes',
        shortTitle: 'Shift Handover',
        group: '21',
        groupTitle: 'Ward Nursing',
        description: 'SBAR structured nursing handover between morning, evening, and night shifts',
        icon: FileText,
        badge: 'SBAR'
      }
    ]
  },
  {
    id: '22',
    groupNumber: 'Group 7',
    title: 'OPD Management',
    shortTitle: 'OPD Management',
    badge: 'OPD',
    icon: Stethoscope,
    submodules: [
      {
        id: '22.1',
        title: 'OPD Clinic Desk Dashboard',
        shortTitle: 'Clinic Desk',
        group: '22',
        groupTitle: 'OPD Management',
        description: 'Clinic session management, specialty desks, and consultant attendance',
        icon: Stethoscope,
        badge: 'Desk'
      },
      {
        id: '22.2',
        title: 'Patient Arrival & Check-in',
        shortTitle: 'Arrival & Check-in',
        group: '22',
        groupTitle: 'OPD Management',
        description: 'Front-desk patient check-in, token validation, and vitals station routing',
        icon: Users,
        badge: 'Check-in'
      },
      {
        id: '22.3',
        title: 'Consultation Queue Management',
        shortTitle: 'Queue Management',
        group: '22',
        groupTitle: 'OPD Management',
        description: 'OPD waiting room queue coordinator, doctor call console, and triage priority',
        icon: Users,
        badge: 'Queue'
      },
      {
        id: '22.4',
        title: 'OPD Visit Slip Printout',
        shortTitle: 'Visit Slip Printout',
        group: '22',
        groupTitle: 'OPD Management',
        description: 'Clinical OPD encounter slip generation with barcode and consultant stamp',
        icon: FileText,
        badge: 'Print Slip'
      },
      {
        id: '22.5',
        title: 'Follow-up Tracking',
        shortTitle: 'Follow-up Tracking',
        group: '22',
        groupTitle: 'OPD Management',
        description: 'Post-consultation follow-up scheduling and chronic patient recall reminders',
        icon: Clock,
        badge: 'Follow-up'
      }
    ]
  },
  {
    id: '23',
    groupNumber: 'Group 8',
    title: 'Operation Theatre Management',
    shortTitle: 'Operation Theatre',
    badge: 'Surgical',
    icon: Syringe,
    submodules: [
      {
        id: '23.1',
        title: 'OT Slot Scheduling & Theatre Roster',
        shortTitle: 'OT Slot Scheduling',
        group: '23',
        groupTitle: 'Operation Theatre Management',
        description: 'Operating room slot allocation, surgeon rosters, and elective booking',
        icon: Syringe,
        badge: 'OT Roster'
      },
      {
        id: '23.2',
        title: 'Pre-Anesthesia Checkup (PAC)',
        shortTitle: 'PAC Fitness',
        group: '23',
        groupTitle: 'Operation Theatre Management',
        description: 'Pre-operative anesthesia fitness, ASA grading, and airway risk evaluation',
        icon: ShieldCheck,
        badge: 'PAC'
      },
      {
        id: '23.3',
        title: 'WHO Surgical Safety Checklist',
        shortTitle: 'WHO Safety Checklist',
        group: '23',
        groupTitle: 'Operation Theatre Management',
        description: 'Sign-in, Time-out, and Sign-out perioperative patient safety verification',
        icon: CheckCircle2,
        badge: 'WHO Safety'
      },
      {
        id: '23.4',
        title: 'Intra-Operative Anesthesia & Surgical Notes',
        shortTitle: 'Intra-Op Surgical Notes',
        group: '23',
        groupTitle: 'Operation Theatre Management',
        description: 'Surgical findings, implant serial numbers, blood loss, and anesthesia record',
        icon: FileText,
        badge: 'Notes'
      },
      {
        id: '23.5',
        title: 'Post-Anesthesia Care Unit (PACU) Recovery',
        shortTitle: 'PACU Recovery',
        group: '23',
        groupTitle: 'Operation Theatre Management',
        description: 'PACU recovery score, vital monitoring, and post-op ward transfer clearance',
        icon: Activity,
        badge: 'PACU'
      }
    ]
  },
  {
    id: '24',
    groupNumber: 'Group 9',
    title: 'Patient Registration & Records',
    shortTitle: 'Patient Registration',
    badge: 'Front Office',
    icon: UserPlus,
    submodules: [
      {
        id: '24.1',
        title: 'New Patient Registration',
        shortTitle: 'New Registration',
        group: '24',
        groupTitle: 'Patient Registration & Records',
        description: 'Demographics, government ID (Aadhaar/ABHA), emergency contacts, and photo',
        icon: UserPlus,
        badge: 'Register'
      },
      {
        id: '24.2',
        title: 'UHID Generation & Smart Card Print',
        shortTitle: 'UHID Smart Card',
        group: '24',
        groupTitle: 'Patient Registration & Records',
        description: 'Unique health identification number assignment and plastic card printing',
        icon: Tag,
        badge: 'Smart Card'
      },
      {
        id: '24.3',
        title: 'Create New Visit / Encounter',
        shortTitle: 'Create Encounter',
        group: '24',
        groupTitle: 'Patient Registration & Records',
        description: 'OPD, IPD, Day Care, or Emergency encounter generation with visit category',
        icon: Activity,
        badge: 'Encounter'
      },
      {
        id: '24.4',
        title: 'Patient Search & Record Merge',
        shortTitle: 'Search & Merge',
        group: '24',
        groupTitle: 'Patient Registration & Records',
        description: 'Fuzzy patient search, duplicate record detection, and UHID consolidation',
        icon: Search,
        badge: 'Consolidation'
      },
      {
        id: '24.5',
        title: 'Demographic & Identity Updates',
        shortTitle: 'Demographic Updates',
        group: '24',
        groupTitle: 'Patient Registration & Records',
        description: 'Address revisions, insurance carrier updates, and phone verification',
        icon: RefreshCw,
        badge: 'Updates'
      }
    ]
  },
  {
    id: '25',
    groupNumber: 'Group 10',
    title: 'Pharmacy Management',
    shortTitle: 'Pharmacy',
    badge: 'Pharmacy',
    icon: Pill,
    submodules: [
      {
        id: '25.1',
        title: 'Prescription Dispensing (OPD & IPD)',
        shortTitle: 'Dispensing POS',
        group: '25',
        groupTitle: 'Pharmacy Management',
        description: 'Electronic prescription dispensing, barcoded drug pick, and bill generation',
        icon: Pill,
        badge: 'Dispense'
      },
      {
        id: '25.2',
        title: 'Medicine Master & Salt Information',
        shortTitle: 'Medicine & Salt Master',
        group: '25',
        groupTitle: 'Pharmacy Management',
        description: 'Pharmacopoeia master, generic molecule salts, contraindications, and HSN codes',
        icon: BookOpen,
        badge: 'Formulary'
      },
      {
        id: '25.3',
        title: 'FIFO Batch & Expiry Management',
        shortTitle: 'FIFO Batch & Expiry',
        group: '25',
        groupTitle: 'Pharmacy Management',
        description: 'First-in-first-out batch dispensing, near-expiry quarantine, and stock aging',
        icon: Clock,
        badge: 'Expiry'
      },
      {
        id: '25.4',
        title: 'IPD Unused Medicine Return & Credit',
        shortTitle: 'Medicine Returns & Credit',
        group: '25',
        groupTitle: 'Pharmacy Management',
        description: 'Inpatient unused medications return, credit note generation, and restock',
        icon: RefreshCw,
        badge: 'Returns'
      },
      {
        id: '25.5',
        title: 'Pharmacy Stock Indents & Reorder Alerts',
        shortTitle: 'Stock Indents & Alerts',
        group: '25',
        groupTitle: 'Pharmacy Management',
        description: 'Automated warehouse indents, fast-moving items reorder, and safety levels',
        icon: Package,
        badge: 'Reorder'
      }
    ]
  },
  {
    id: '26',
    groupNumber: 'Group 11',
    title: 'Purchase & Procurement',
    shortTitle: 'Purchase & Procurement',
    badge: 'Procurement',
    icon: ShoppingBag,
    submodules: [
      {
        id: '26.1',
        title: 'Purchase Requisition (Indent)',
        shortTitle: 'Purchase Requisition',
        group: '26',
        groupTitle: 'Purchase & Procurement',
        description: 'Internal purchase requisition, department approval, and budget allocation',
        icon: FileText,
        badge: 'Requisition'
      },
      {
        id: '26.2',
        title: 'Request for Quotation (RFQ)',
        shortTitle: 'RFQ Tenders',
        group: '26',
        groupTitle: 'Purchase & Procurement',
        description: 'Supplier RFQ generation, item specifications, and vendor tender invites',
        icon: FileSpreadsheet,
        badge: 'RFQ'
      },
      {
        id: '26.3',
        title: 'Vendor Quotation Comparison',
        shortTitle: 'Quotation Comparison',
        group: '26',
        groupTitle: 'Purchase & Procurement',
        description: 'Side-by-side L1/L2 vendor rate comparison, commercial terms, and selection',
        icon: Calculator,
        badge: 'Comparison'
      },
      {
        id: '26.4',
        title: 'Purchase Order (PO) Creation & Approval',
        shortTitle: 'PO Creation & Approval',
        group: '26',
        groupTitle: 'Purchase & Procurement',
        description: 'Formal purchase orders, multi-level management approvals, and delivery milestones',
        icon: ShoppingBag,
        badge: 'Purchase Orders'
      },
      {
        id: '26.5',
        title: 'Goods Receipt Note (GRN) Inward Inspection',
        shortTitle: 'GRN Inward Inspection',
        group: '26',
        groupTitle: 'Purchase & Procurement',
        description: 'Gate entry, physical quality inspection, batch tracking, and GRN acceptance',
        icon: Truck,
        badge: 'GRN Inward'
      }
    ]
  },
  {
    id: '27',
    groupNumber: 'Group 12',
    title: 'Radiology & PACS',
    shortTitle: 'Radiology & PACS',
    badge: 'Imaging',
    icon: ScanLine,
    submodules: [
      {
        id: '27.1',
        title: 'Modality Scheduling & MWL',
        shortTitle: 'Modality Scheduling',
        group: '27',
        groupTitle: 'Radiology & PACS',
        description: 'MRI, CT, X-Ray, and USG machine slot planning with DICOM Modality Worklist',
        icon: ScanLine,
        badge: 'MWL'
      },
      {
        id: '27.2',
        title: 'DICOM Image Acquisition & PACS Storage',
        shortTitle: 'DICOM PACS Archive',
        group: '27',
        groupTitle: 'Radiology & PACS',
        description: 'Secure archive of DICOM studies, storage tiering, and series indexing',
        icon: Camera,
        badge: 'Archive'
      },
      {
        id: '27.3',
        title: 'Browser-Based DICOM PACS Viewer',
        shortTitle: 'DICOM PACS Viewer',
        group: '27',
        groupTitle: 'Radiology & PACS',
        description: 'Zero-footprint web viewer with windowing, zoom, pan, and measurement tools',
        icon: Eye,
        badge: 'Viewer'
      },
      {
        id: '27.4',
        title: 'Radiology Report Authoring',
        shortTitle: 'Radiology Reporting',
        group: '27',
        groupTitle: 'Radiology & PACS',
        description: 'Radiologist structured reporting templates, voice dictation, and impressions',
        icon: FileText,
        badge: 'Authoring'
      },
      {
        id: '27.5',
        title: 'Report Verification & EMR Distribution',
        shortTitle: 'Report Authorization',
        group: '27',
        groupTitle: 'Radiology & PACS',
        description: 'Final radiologist signature authorization and instant sync to clinician EMR',
        icon: CheckCircle2,
        badge: 'Distribution'
      }
    ]
  },
  {
    id: '28',
    groupNumber: 'Group 13',
    title: 'OTC Retail Sales',
    shortTitle: 'OTC Retail Sales',
    badge: 'Retail POS',
    icon: ShoppingBag,
    submodules: [
      {
        id: '28.1',
        title: 'Over-the-Counter (OTC) POS Counter',
        shortTitle: 'OTC POS Counter',
        group: '28',
        groupTitle: 'OTC Retail Sales',
        description: 'Direct retail sales, walk-in customer counter, and instant receipt printing',
        icon: ShoppingBag,
        badge: 'POS Desk'
      },
      {
        id: '28.2',
        title: 'Quick Barcode Scanning & Billing',
        shortTitle: 'Barcode Fast Scan',
        group: '28',
        groupTitle: 'OTC Retail Sales',
        description: 'High-speed barcode checkout, GST rate breakdown, and discount codes',
        icon: Tag,
        badge: 'Barcode'
      },
      {
        id: '28.3',
        title: 'Multi-Mode Instant Payment',
        shortTitle: 'Multi-Mode Payments',
        group: '28',
        groupTitle: 'OTC Retail Sales',
        description: 'UPI QR code, credit/debit card swipe, cash collection, and split tenders',
        icon: IndianRupee,
        badge: 'Payments'
      },
      {
        id: '28.4',
        title: 'Retail Sales Return & Cash Refund',
        shortTitle: 'Retail Sales Return',
        group: '28',
        groupTitle: 'OTC Retail Sales',
        description: 'Item return against sales invoice, restock verification, and cash refund',
        icon: RefreshCw,
        badge: 'Refunds'
      }
    ]
  },
  {
    id: '29',
    groupNumber: 'Group 14',
    title: 'System Administration & Audit',
    shortTitle: 'System Admin & Audit',
    badge: 'Security',
    icon: Lock,
    submodules: [
      {
        id: '29.1',
        title: 'View User Sessions',
        shortTitle: 'Active User Sessions',
        group: '29',
        groupTitle: 'System Administration & Audit',
        description: 'Active staff logins, terminal IP addresses, session duration, and terminate',
        icon: Users,
        badge: 'Sessions'
      },
      {
        id: '29.2',
        title: 'System Audit Trail & Clinical Audit Trail',
        shortTitle: 'System & Clinical Audit',
        group: '29',
        groupTitle: 'System Administration & Audit',
        description: 'Immutable record of patient data access, medication edits, and admin changes',
        icon: ShieldCheck,
        badge: 'Audit Log'
      },
      {
        id: '29.3',
        title: 'Department & Module Master Setup',
        shortTitle: 'Dept & Module Setup',
        group: '29',
        groupTitle: 'System Administration & Audit',
        description: 'Clinical disciplines setup, hospital wing configurations, and module flags',
        icon: Building2,
        badge: 'Master Setup'
      },
      {
        id: '29.4',
        title: 'System Event Configuration',
        shortTitle: 'System Event Config',
        group: '29',
        groupTitle: 'System Administration & Audit',
        description: 'System notification triggers, panic alarm webhooks, and SMS templates',
        icon: Bell,
        badge: 'Triggers'
      },
      {
        id: '29.5',
        title: 'Role-Based Access Control (RBAC) & Permissions',
        shortTitle: 'RBAC & Permissions',
        group: '29',
        groupTitle: 'System Administration & Audit',
        description: 'Clinician, nurse, pharmacist, cashier, and admin permission matrix',
        icon: Lock,
        badge: 'RBAC'
      }
    ]
  },
  {
    id: '30',
    groupNumber: 'Group 15',
    title: 'User Profile & Preferences',
    shortTitle: 'User Profile',
    badge: 'Profile',
    icon: Key,
    submodules: [
      {
        id: '30.1',
        title: 'Manage Profile',
        shortTitle: 'Manage Profile',
        group: '30',
        groupTitle: 'User Profile & Preferences',
        description: 'Staff user personal details, contact number, qualification, and signature',
        icon: Users,
        badge: 'Profile'
      },
      {
        id: '30.2',
        title: 'Change Password & Security',
        shortTitle: 'Password & Security',
        group: '30',
        groupTitle: 'User Profile & Preferences',
        description: 'Credential updates, multi-factor authentication (MFA), and security logs',
        icon: Key,
        badge: 'Security'
      },
      {
        id: '30.3',
        title: 'Switch Active Hospital Branch',
        shortTitle: 'Switch Branch',
        group: '30',
        groupTitle: 'User Profile & Preferences',
        description: 'Switch workstation context between multi-hospital branch facilities',
        icon: Building2,
        badge: 'Branch'
      },
      {
        id: '30.4',
        title: 'Switch Active Role',
        shortTitle: 'Switch Role',
        group: '30',
        groupTitle: 'User Profile & Preferences',
        description: 'Toggle user privileges between assigned clinical or administrative roles',
        icon: ShieldCheck,
        badge: 'Role'
      },
      {
        id: '30.5',
        title: 'User UI Preferences & Theme',
        shortTitle: 'UI Theme & Preferences',
        group: '30',
        groupTitle: 'User Profile & Preferences',
        description: 'Compact density, table row heights, theme color options, and default desk',
        icon: Sliders,
        badge: 'Theme'
      }
    ]
  },
  {
    id: '31',
    groupNumber: 'Group 16',
    title: 'Work Order Management',
    shortTitle: 'Work Orders',
    badge: 'Facilities',
    icon: Wrench,
    submodules: [
      {
        id: '31.1',
        title: 'Record Work Order',
        shortTitle: 'Record Work Order',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Service work orders for facility maintenance, IT, and external contractors',
        icon: Wrench,
        badge: 'New Order'
      },
      {
        id: '31.2',
        title: 'Record Work Order Requisition',
        shortTitle: 'Record Requisition',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Departmental maintenance and repair requisitions with priority levels',
        icon: FileText,
        badge: 'Requisitions'
      },
      {
        id: '31.3',
        title: 'Record Work Order Receipt',
        shortTitle: 'Record Receipt',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Deliverable completion note, technician service signoff, and spares used',
        icon: CheckCircle2,
        badge: 'Receipts'
      },
      {
        id: '31.4',
        title: 'View Work Orders / Requisitions / Receipts',
        shortTitle: 'View Consolidated',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Central consolidated work order tracking and contractor SLA status',
        icon: Eye,
        badge: 'Consolidated'
      },
      {
        id: '31.5',
        title: 'Orders: Approve Work Orders',
        shortTitle: 'Approve Orders',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Engineering supervisor and administrative financial approval workflow',
        icon: ShieldCheck,
        badge: 'Approve'
      },
      {
        id: '31.6',
        title: 'Orders: Confirm Work Orders',
        shortTitle: 'Confirm Orders',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Final order sign-off and issuance to contractor/engineering crew',
        icon: CheckCircle2,
        badge: 'Confirm'
      },
      {
        id: '31.7',
        title: 'Orders: Review Rejected Work Orders',
        shortTitle: 'Review Rejected',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Audit rejected work order requests, reason logs, and resubmissions',
        icon: AlertCircle,
        badge: 'Rejected'
      },
      {
        id: '31.8',
        title: 'Receipts: Approve Work Order Receipts',
        shortTitle: 'Approve Receipts',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Supervisor approval of completed deliverables and technician timesheets',
        icon: ShieldCheck,
        badge: 'Approve'
      },
      {
        id: '31.9',
        title: 'Receipts: Confirm Work Order Receipts',
        shortTitle: 'Confirm Receipts',
        group: '31',
        groupTitle: 'Work Order Management',
        description: 'Final work completion acceptance, inspection sign-off, and invoice clearance',
        icon: Award,
        badge: 'Confirmation'
      }
    ]
  },
  {
    id: '32',
    groupNumber: 'Group 17',
    title: 'Analytics & Data Export',
    shortTitle: 'Analytics & Export',
    badge: 'BI & Reports',
    icon: BarChart3,
    submodules: [
      {
        id: '32.1',
        title: 'Billing, Inventory, Purchase & System Analytics',
        shortTitle: 'Cross-Module Analytics',
        group: '32',
        groupTitle: 'Analytics & Data Export',
        description: 'Operational charts, revenue trends, stock consumption, and turn-around times',
        icon: BarChart3,
        badge: 'Analytics'
      },
      {
        id: '32.2',
        title: 'Billing Data Export',
        shortTitle: 'Billing Data Export',
        group: '32',
        groupTitle: 'Analytics & Data Export',
        description: 'Financial collections, TPA receivables, tariff reconciliation and GST exports',
        icon: Database,
        badge: 'Export'
      },
      {
        id: '32.3',
        title: 'System Data Export',
        shortTitle: 'System Data Export',
        group: '32',
        groupTitle: 'Analytics & Data Export',
        description: 'Encrypted audit logs, master lists, user access logs, and clinical datasets',
        icon: FileSpreadsheet,
        badge: 'System Dumps'
      },
      {
        id: '32.4',
        title: 'Executive KPI Dashboard Widgets',
        shortTitle: 'Executive KPI Widgets',
        group: '32',
        groupTitle: 'Analytics & Data Export',
        description: 'Bed occupancy rate (BOR), average length of stay (ALOS), and hospital OP counts',
        icon: Activity,
        badge: 'KPIs'
      },
      {
        id: '32.5',
        title: 'Tabular Data Export (Excel / CSV)',
        shortTitle: 'Tabular Export (CSV)',
        group: '32',
        groupTitle: 'Analytics & Data Export',
        description: 'Filtered tabular reporting exports to CSV, XLSX, and printable formats',
        icon: FileSpreadsheet,
        badge: 'CSV Download'
      }
    ]
  }
];

export const ALL_INVENTORY_SUBMODULES = INVENTORY_GROUPS.flatMap(g => g.submodules);
