import {
  FlaskConical,
  Snowflake,
  Flame,
  Users,
  LayoutGrid,
  Printer,
  ScanLine,
  Globe,
  Calendar,
  Clock,
  Tv,
  Bell,
  CreditCard,
  Receipt,
  FileCheck2,
  BadgeAlert,
  RotateCcw,
  Landmark,
  Droplet,
  Layers,
  FlaskRound,
  ShieldCheck,
  CheckSquare,
  Stethoscope,
  Activity,
  FileText,
  ClipboardList,
  FileSignature,
  ShieldAlert,
  FileSpreadsheet,
  IndianRupee,
  Bed,
  BedDouble,
  Utensils,
  Scale,
  ChefHat,
  Truck,
  Egg,
  Dna,
  Microscope,
  Syringe,
  Siren,
  HeartPulse,
  ArrowRightCircle,
  Pill,
  Tag,
  Paperclip,
  Wrench,
  TrendingDown,
  Building2,
  Network,
  Package,
  DoorOpen,
  CalendarDays
} from 'lucide-react';

export const IPD_GROUPS = [
  {
    id: '1',
    groupNumber: 'Group 1',
    title: 'Semen Analysis & Cryopreservation',
    shortTitle: 'Semen Analysis & Cryo',
    badge: '4 Modules',
    icon: FlaskConical,
    submodules: [
      {
        id: '1.1',
        title: 'Semen Analysis Entry',
        shortTitle: 'Semen Analysis',
        group: '1',
        groupTitle: 'Semen Analysis & Cryopreservation',
        description: 'WHO-aligned macroscopic and microscopic sperm motility, morphology, and count analysis',
        icon: FlaskConical,
        badge: 'Analysis'
      },
      {
        id: '1.2',
        title: 'Cryopreservation / Semen Freezing',
        shortTitle: 'Semen Freezing',
        group: '1',
        groupTitle: 'Semen Analysis & Cryopreservation',
        description: 'Vitrification and liquid nitrogen cryostorage vial allocation with tank/canister tracking',
        icon: Snowflake,
        badge: 'Freezing'
      },
      {
        id: '1.3',
        title: 'Sample Thaw & Usage',
        shortTitle: 'Sample Thaw & Usage',
        group: '1',
        groupTitle: 'Semen Analysis & Cryopreservation',
        description: 'Post-thaw recovery rate evaluation and clinical release to IUI/IVF embryology suites',
        icon: Flame,
        badge: 'Thaw'
      },
      {
        id: '1.4',
        title: 'Donor Registry',
        shortTitle: 'Donor Registry',
        group: '1',
        groupTitle: 'Semen Analysis & Cryopreservation',
        description: 'Anonymized ART donor profiles, blood grouping, genetic screening, and vial quotas',
        icon: Users,
        badge: 'Donors'
      }
    ]
  },
  {
    id: '2',
    groupNumber: 'Group 2',
    title: 'Dashboard & Device Configuration',
    shortTitle: 'Dashboard & Devices',
    badge: '4 Modules',
    icon: LayoutGrid,
    submodules: [
      {
        id: '2.1',
        title: 'Widgets & Dashboard Configuration',
        shortTitle: 'Widgets & Dashboard',
        group: '2',
        groupTitle: 'Dashboard & Device Configuration',
        description: 'Customizable clinician metrics, department KPI cards, and bed occupancy gauges',
        icon: LayoutGrid,
        badge: 'Widgets'
      },
      {
        id: '2.2',
        title: 'Barcode & Thermal Printer Settings',
        shortTitle: 'Barcode & Thermal Printers',
        group: '2',
        groupTitle: 'Dashboard & Device Configuration',
        description: 'EPL/ZPL label printer dimensions, patient wristbands, and specimen tube barcodes',
        icon: Printer,
        badge: 'Printers'
      },
      {
        id: '2.3',
        title: 'Document Scanner & Attachment Setup',
        shortTitle: 'Document Scanner Setup',
        group: '2',
        groupTitle: 'Dashboard & Device Configuration',
        description: 'TWAIN/WIA scanner resolution, compression profiles, and DICOM upload gateways',
        icon: ScanLine,
        badge: 'Scanners'
      },
      {
        id: '2.4',
        title: 'External API Integration Status',
        shortTitle: 'External API Integration',
        group: '2',
        groupTitle: 'Dashboard & Device Configuration',
        description: 'Health Insurance exchange, LIS/RIS interfaces, SMS gateways, and webhook health',
        icon: Globe,
        badge: 'APIs'
      }
    ]
  },
  {
    id: '3',
    groupNumber: 'Group 3',
    title: 'Appointment & Scheduling',
    shortTitle: 'Appointment & Scheduling',
    badge: '4 Modules',
    icon: Calendar,
    submodules: [
      {
        id: '3.1',
        title: 'Book / Reschedule Appointment',
        shortTitle: 'Book / Reschedule',
        group: '3',
        groupTitle: 'Appointment & Scheduling',
        description: 'Inpatient doctor consultations, cross-speciality visits, and diagnostic slot bookings',
        icon: Calendar,
        badge: 'Booking'
      },
      {
        id: '3.2',
        title: 'Doctor Roster & Shift Planning',
        shortTitle: 'Doctor Roster & Shifts',
        group: '3',
        groupTitle: 'Appointment & Scheduling',
        description: 'Senior consultant on-call rotations, night duty rosters, and ward duty allocation',
        icon: Clock,
        badge: 'Rosters'
      },
      {
        id: '3.3',
        title: 'Token Queue / Waiting Room Display',
        shortTitle: 'Token Queue & Waiting Display',
        group: '3',
        groupTitle: 'Appointment & Scheduling',
        description: 'Real-time outpatient and inpatient consultation queue monitor with digital audio chime',
        icon: Tv,
        badge: 'Queue'
      },
      {
        id: '3.4',
        title: 'SMS / WhatsApp Reminders & Alerts',
        shortTitle: 'SMS / WhatsApp Reminders',
        group: '3',
        groupTitle: 'Appointment & Scheduling',
        description: 'Automated notification dispatch for scheduled procedures, admissions, and reports',
        icon: Bell,
        badge: 'Alerts'
      }
    ]
  },
  {
    id: '4',
    groupNumber: 'Group 4',
    title: 'Patient Billing & Cashier',
    shortTitle: 'Billing & Cashier',
    badge: '6 Modules',
    icon: CreditCard,
    submodules: [
      {
        id: '4.1',
        title: 'OPD Billing POS',
        shortTitle: 'OPD Billing POS',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Walk-in outpatient consultation, minor procedure vouchers, and instant POS checkout',
        icon: Receipt,
        badge: 'POS'
      },
      {
        id: '4.2',
        title: 'IPD Running / Interim Bill',
        shortTitle: 'IPD Running / Interim Bill',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Real-time bed charges, nursing tariffs, surgical fees, and pharmacy indents during admission',
        icon: FileText,
        badge: 'Running'
      },
      {
        id: '4.3',
        title: 'Discharge Final Bill',
        shortTitle: 'Discharge Final Bill',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Comprehensive financial settlement, insurance deduction, and final clearance slip',
        icon: FileCheck2,
        badge: 'Discharge'
      },
      {
        id: '4.4',
        title: 'Advance Deposit Collection',
        shortTitle: 'Advance Deposit Collection',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Pre-admission and mid-stay security deposits with receipt generator and ledger logging',
        icon: Landmark,
        badge: 'Deposits'
      },
      {
        id: '4.5',
        title: 'My Refunds',
        shortTitle: 'My Refunds',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Authorized cancellation reversals, surplus deposit returns, and credit notes',
        icon: RotateCcw,
        badge: 'Refunds'
      },
      {
        id: '4.6',
        title: 'Day-End Cashier Settlement',
        shortTitle: 'Day-End Cashier Settlement',
        group: '4',
        groupTitle: 'Patient Billing & Cashier',
        description: 'Daily cash drawer reconciliation, digital payment batch totals, and supervisor lock',
        icon: CreditCard,
        badge: 'Settlement'
      }
    ]
  },
  {
    id: '5',
    groupNumber: 'Group 5',
    title: 'Blood Bank Management',
    shortTitle: 'Blood Bank Management',
    badge: '5 Modules',
    icon: Droplet,
    submodules: [
      {
        id: '5.1',
        title: 'Donor Registration & Screening',
        shortTitle: 'Donor Registration & Screening',
        group: '5',
        groupTitle: 'Blood Bank Management',
        description: 'Voluntary and replacement donor eligibility questionnaire, hemoglobin check, and consent',
        icon: Users,
        badge: 'Donors'
      },
      {
        id: '5.2',
        title: 'Bag Collection & Phlebotomy Barcoding',
        shortTitle: 'Bag Collection & Barcoding',
        group: '5',
        groupTitle: 'Blood Bank Management',
        description: 'Phlebotomy chair assignments, sterile collection bag barcoding, and segment sealing',
        icon: Droplet,
        badge: 'Collection'
      },
      {
        id: '5.3',
        title: 'Component Separation',
        shortTitle: 'Component Separation',
        group: '5',
        groupTitle: 'Blood Bank Management',
        description: 'Refrigerated centrifuge fractionation into PRBC, FFP, Platelet Concentrate, and Cryo',
        icon: Layers,
        badge: 'Separation'
      },
      {
        id: '5.4',
        title: 'Serology Testing & Safe Release',
        shortTitle: 'Serology Testing & Safe Release',
        group: '5',
        groupTitle: 'Blood Bank Management',
        description: 'Mandatory ELISA/NAT screening for HIV, HBV, HCV, Syphilis, and Malaria prior to quarantine release',
        icon: ShieldCheck,
        badge: 'Serology'
      },
      {
        id: '5.5',
        title: 'Cross Matching & Patient Issue',
        shortTitle: 'Cross Matching & Patient Issue',
        group: '5',
        groupTitle: 'Blood Bank Management',
        description: 'Major and minor compatibility crossmatching, emergency O-negative release, and bedside dispatch',
        icon: CheckSquare,
        badge: 'Issue'
      }
    ]
  },
  {
    id: '6',
    groupNumber: 'Group 6',
    title: 'Clinical Consultation & Documentation',
    shortTitle: 'Clinical Consultation',
    badge: '5 Modules',
    icon: Stethoscope,
    submodules: [
      {
        id: '6.1',
        title: 'Doctor Consultation Desk',
        shortTitle: 'Doctor Consultation Desk',
        group: '6',
        groupTitle: 'Clinical Consultation & Documentation',
        description: 'Comprehensive clinician workstation for inpatient assessment and diagnosis formulation',
        icon: Stethoscope,
        badge: 'Consult'
      },
      {
        id: '6.2',
        title: 'Vitals Recording & Physical Examination',
        shortTitle: 'Vitals Recording & Exam',
        group: '6',
        groupTitle: 'Clinical Consultation & Documentation',
        description: 'Continuous BP, SpO2, heart rate, temperature charting, and head-to-toe systemic findings',
        icon: Activity,
        badge: 'Vitals'
      },
      {
        id: '6.3',
        title: 'Chief Complaints & Clinical History',
        shortTitle: 'Chief Complaints & History',
        group: '6',
        groupTitle: 'Clinical Consultation & Documentation',
        description: 'History of present illness, past surgical interventions, allergy profiles, and family history',
        icon: ClipboardList,
        badge: 'History'
      },
      {
        id: '6.4',
        title: 'Computerized Provider Order Entry (CPOE)',
        shortTitle: 'CPOE Order Entry',
        group: '6',
        groupTitle: 'Clinical Consultation & Documentation',
        description: 'Direct computerized ordering of lab tests, radiology scans, medications, and bedside nursing orders',
        icon: FileSignature,
        badge: 'CPOE'
      },
      {
        id: '6.5',
        title: 'Clinical Progress Notes',
        shortTitle: 'Clinical Progress Notes',
        group: '6',
        groupTitle: 'Clinical Consultation & Documentation',
        description: 'SOAP-formatted daily medical rounds documentation and multi-speciality multidisciplinary notes',
        icon: FileText,
        badge: 'Notes'
      }
    ]
  },
  {
    id: '7',
    groupNumber: 'Group 7',
    title: 'TPA & Insurance',
    shortTitle: 'TPA & Insurance',
    badge: '5 Modules',
    icon: ShieldCheck,
    submodules: [
      {
        id: '7.1',
        title: 'TPA & Insurance Pre-Authorization',
        shortTitle: 'Pre-Authorization',
        group: '7',
        groupTitle: 'TPA & Insurance',
        description: 'Cashless admission authorization requests, initial approval tracking, and denial appeals',
        icon: ShieldCheck,
        badge: 'PreAuth'
      },
      {
        id: '7.2',
        title: 'Enhancement Request Management',
        shortTitle: 'Enhancement Requests',
        group: '7',
        groupTitle: 'TPA & Insurance',
        description: 'Mid-treatment sanctioned limit extension submissions backed by clinical justification sheets',
        icon: Activity,
        badge: 'Enhance'
      },
      {
        id: '7.3',
        title: 'Claim Dossier Compilation & Submission',
        shortTitle: 'Claim Dossier Compilation',
        group: '7',
        groupTitle: 'TPA & Insurance',
        description: 'Bundling discharge summaries, pharmacy bills, diagnostic reports, and final signed claim forms',
        icon: FileSpreadsheet,
        badge: 'Claims'
      },
      {
        id: '7.4',
        title: 'Co-Payment & Deductible Collection',
        shortTitle: 'Co-Payment & Deductibles',
        group: '7',
        groupTitle: 'TPA & Insurance',
        description: 'Patient co-pay calculation, non-payable consumable tracking, and settlement receipting',
        icon: IndianRupee,
        badge: 'CoPay'
      },
      {
        id: '7.5',
        title: 'TPA Reconciliation & Payment Posting',
        shortTitle: 'TPA Reconciliation & Posting',
        group: '7',
        groupTitle: 'TPA & Insurance',
        description: 'Insurer NEFT/RTGS batch settlement matching, TDS deductions, and disallowed claim write-offs',
        icon: Landmark,
        badge: 'Recon'
      }
    ]
  },
  {
    id: '8',
    groupNumber: 'Group 8',
    title: 'Day Care Management',
    shortTitle: 'Day Care Management',
    badge: '4 Modules',
    icon: Bed,
    submodules: [
      {
        id: '8.1',
        title: 'Day Care Admission & Procedure Booking',
        shortTitle: 'Day Care Admission',
        group: '8',
        groupTitle: 'Day Care Management',
        description: 'Same-day minor surgeries, chemotherapy sessions, and dialysis procedure scheduling',
        icon: Calendar,
        badge: 'Booking'
      },
      {
        id: '8.2',
        title: 'Chair / Bed Allocation',
        shortTitle: 'Chair / Bed Allocation',
        group: '8',
        groupTitle: 'Day Care Management',
        description: 'Dynamic allocation of infusion recliners and short-stay recovery beds with turn-around timers',
        icon: Bed,
        badge: 'Allocation'
      },
      {
        id: '8.3',
        title: 'Clinical Procedure Monitoring',
        shortTitle: 'Procedure Monitoring',
        group: '8',
        groupTitle: 'Day Care Management',
        description: 'Intra-procedure vitals, medication infusion logs, and post-sedation recovery score charting',
        icon: Activity,
        badge: 'Monitor'
      },
      {
        id: '8.4',
        title: 'Same-Day Discharge Summary',
        shortTitle: 'Same-Day Discharge Summary',
        group: '8',
        groupTitle: 'Day Care Management',
        description: 'Post-op discharge instructions, home medication prescriptions, and same-day gate passes',
        icon: FileText,
        badge: 'Discharge'
      }
    ]
  },
  {
    id: '9',
    groupNumber: 'Group 9',
    title: 'Diet & Nutrition',
    shortTitle: 'Diet & Nutrition',
    badge: '4 Modules',
    icon: Utensils,
    submodules: [
      {
        id: '9.1',
        title: 'Dietitian Nutritional Assessment',
        shortTitle: 'Nutritional Assessment',
        group: '9',
        groupTitle: 'Diet & Nutrition',
        description: 'Caloric requirement calculation, BMI tracking, diabetic / renal / salt dietary plans',
        icon: Scale,
        badge: 'Assessment'
      },
      {
        id: '9.2',
        title: 'Patient Diet Ordering',
        shortTitle: 'Patient Diet Ordering',
        group: '9',
        groupTitle: 'Diet & Nutrition',
        description: 'Doctor / dietitian ward diet orders, liquid feeds, NPO status, and RT feed schedules',
        icon: Utensils,
        badge: 'Diet Orders'
      },
      {
        id: '9.3',
        title: 'Kitchen Meal Batch Production',
        shortTitle: 'Kitchen Batch Production',
        group: '9',
        groupTitle: 'Diet & Nutrition',
        description: 'Central hospital kitchen cooking batch tallies, therapeutic tray prep, and hygiene audit',
        icon: ChefHat,
        badge: 'Kitchen'
      },
      {
        id: '9.4',
        title: 'Ward Meal Delivery Tracking',
        shortTitle: 'Meal Delivery Tracking',
        group: '9',
        groupTitle: 'Diet & Nutrition',
        description: 'Trolley dispatch to inpatient wards, bedside meal delivery confirmation, and intake logs',
        icon: Truck,
        badge: 'Delivery'
      }
    ]
  },
  {
    id: '10',
    groupNumber: 'Group 10',
    title: 'IVF & Embryology',
    shortTitle: 'IVF & Embryology',
    badge: '5 Modules',
    icon: Egg,
    submodules: [
      {
        id: '10.1',
        title: 'Oocyte Retrieval (OPU) Recording',
        shortTitle: 'Oocyte Retrieval (OPU)',
        group: '10',
        groupTitle: 'IVF & Embryology',
        description: 'Follicular aspiration log, cumulus-oocyte complex counts, and maturity grade recording (MII/MI/GV)',
        icon: Egg,
        badge: 'OPU'
      },
      {
        id: '10.2',
        title: 'Fertilization (Conventional IVF / ICSI)',
        shortTitle: 'Fertilization (IVF / ICSI)',
        group: '10',
        groupTitle: 'IVF & Embryology',
        description: 'Intracytoplasmic sperm injection documentation, sperm source selection, and 2PN check',
        icon: Syringe,
        badge: 'ICSI'
      },
      {
        id: '10.3',
        title: 'Embryo Morphological Grading',
        shortTitle: 'Embryo Grading',
        group: '10',
        groupTitle: 'IVF & Embryology',
        description: 'Day 3 cleavage and Day 5/6 blastocyst Gardner scoring (ICM & Trophectoderm expansion)',
        icon: Microscope,
        badge: 'Grading'
      },
      {
        id: '10.4',
        title: 'Embryo Transfer (ET) Protocol',
        shortTitle: 'Embryo Transfer (ET)',
        group: '10',
        groupTitle: 'IVF & Embryology',
        description: 'Ultrasound-guided catheter selection, embryo loading verification, and luteal support plan',
        icon: Dna,
        badge: 'Transfer'
      },
      {
        id: '10.5',
        title: 'Embryo Cryostorage Management',
        shortTitle: 'Embryo Cryostorage',
        group: '10',
        groupTitle: 'IVF & Embryology',
        description: 'Liquid nitrogen vitrification straw tracking, cane indexing, and annual storage renewals',
        icon: Snowflake,
        badge: 'Cryo'
      }
    ]
  },
  {
    id: '11',
    groupNumber: 'Group 11',
    title: 'Emergency & Trauma',
    shortTitle: 'Emergency & Trauma',
    badge: '5 Modules',
    icon: Siren,
    submodules: [
      {
        id: '11.1',
        title: 'Triage Assessment (Level 1 to 4)',
        shortTitle: 'Triage Assessment',
        group: '11',
        groupTitle: 'Emergency & Trauma',
        description: 'Emergency Severity Index (ESI) color coding (Red, Yellow, Green, Black) and vital stability',
        icon: Siren,
        badge: 'Triage'
      },
      {
        id: '11.2',
        title: 'Medico-Legal Case (MLC) Registry',
        shortTitle: 'MLC Registry',
        group: '11',
        groupTitle: 'Emergency & Trauma',
        description: 'Police intimation slips, injury wound certificates, chain of custody, and forensic evidence notes',
        icon: ShieldAlert,
        badge: 'MLC'
      },
      {
        id: '11.3',
        title: 'Emergency Bay & Bed Allocation',
        shortTitle: 'Emergency Bay Allocation',
        group: '11',
        groupTitle: 'Emergency & Trauma',
        description: 'Resuscitation bay, acute observation trolley, and crash cart station assignments',
        icon: Bed,
        badge: 'Bays'
      },
      {
        id: '11.4',
        title: 'Trauma Clinical Charting',
        shortTitle: 'Trauma Clinical Charting',
        group: '11',
        groupTitle: 'Emergency & Trauma',
        description: 'ATLS primary & secondary survey documentation, FAST exam findings, and trauma score calculation',
        icon: HeartPulse,
        badge: 'Trauma'
      },
      {
        id: '11.5',
        title: 'Rapid Disposition (ICU / OT / Ward / Discharge)',
        shortTitle: 'Rapid Disposition',
        group: '11',
        groupTitle: 'Emergency & Trauma',
        description: 'Fast-track transfer orders to Emergency OT, Cath Lab, Intensive Care, or home discharge',
        icon: ArrowRightCircle,
        badge: 'Disposition'
      }
    ]
  },
  {
    id: '12',
    groupNumber: 'Group 12',
    title: 'Patient Records & E-Prescription',
    shortTitle: 'Patient Records & Rx',
    badge: '5 Modules',
    icon: FileText,
    submodules: [
      {
        id: '12.1',
        title: 'Longitudinal Patient Lifetime Timeline',
        shortTitle: 'Patient Lifetime Timeline',
        group: '12',
        groupTitle: 'Patient Records & E-Prescription',
        description: 'Chronological visual history of all past admissions, surgeries, diagnostics, and clinic visits',
        icon: Clock,
        badge: 'Timeline'
      },
      {
        id: '12.2',
        title: 'E-Prescription (Rx) Studio',
        shortTitle: 'E-Prescription Studio',
        group: '12',
        groupTitle: 'Patient Records & E-Prescription',
        description: 'Digital drug formulary prescribing, dosage calculators, drug-drug interaction warnings, and QR code Rx',
        icon: Pill,
        badge: 'Rx'
      },
      {
        id: '12.3',
        title: 'ICD-10 & SNOMED Diagnosis Coding',
        shortTitle: 'ICD-10 & Diagnosis Coding',
        group: '12',
        groupTitle: 'Patient Records & E-Prescription',
        description: 'Standardized morbidity coding, primary and secondary diagnosis mapping, and clinical search',
        icon: Tag,
        badge: 'Coding'
      },
      {
        id: '12.4',
        title: 'Previous Encounters Browser',
        shortTitle: 'Previous Encounters',
        group: '12',
        groupTitle: 'Patient Records & E-Prescription',
        description: 'Quick lookup of discharge summaries, OT operation notes, and past prescription archives',
        icon: ClipboardList,
        badge: 'Encounters'
      },
      {
        id: '12.5',
        title: 'Clinical Document Attachments',
        shortTitle: 'Clinical Attachments',
        group: '12',
        groupTitle: 'Patient Records & E-Prescription',
        description: 'Secure upload and viewing of scanned consent forms, referral letters, and external lab reports',
        icon: Paperclip,
        badge: 'Uploads'
      }
    ]
  },
  {
    id: '13',
    groupNumber: 'Group 13',
    title: 'Finance & General Ledger',
    shortTitle: 'Finance & Ledger',
    badge: '5 Modules',
    icon: Landmark,
    submodules: [
      {
        id: '13.1',
        title: 'Chart of Accounts & General Ledger',
        shortTitle: 'Chart of Accounts & GL',
        group: '13',
        groupTitle: 'Finance & General Ledger',
        description: 'Double-entry hospital account codes, assets, liabilities, revenue streams, and journal vouchers',
        icon: Landmark,
        badge: 'GL'
      },
      {
        id: '13.2',
        title: 'Debit / Credit Payment Vouchers',
        shortTitle: 'Payment Vouchers',
        group: '13',
        groupTitle: 'Finance & General Ledger',
        description: 'Vendor disbursements, utility expense vouchers, petty cash transactions, and approvals',
        icon: Receipt,
        badge: 'Vouchers'
      },
      {
        id: '13.3',
        title: 'Doctor Payout & Revenue Share Calculation',
        shortTitle: 'Doctor Payout & Revenue Share',
        group: '13',
        groupTitle: 'Finance & General Ledger',
        description: 'OPD / IPD fee share calculation, procedure incentive splits, and monthly consultant payslips',
        icon: IndianRupee,
        badge: 'Payouts'
      },
      {
        id: '13.4',
        title: 'Bank Reconciliation',
        shortTitle: 'Bank Reconciliation',
        group: '13',
        groupTitle: 'Finance & General Ledger',
        description: 'Automated bank statement matching with hospital cash books, cleared cheques, and uncleared receipts',
        icon: FileSpreadsheet,
        badge: 'Recon'
      },
      {
        id: '13.5',
        title: 'Profit & Loss / Balance Sheet Reporting',
        shortTitle: 'P&L / Balance Sheet',
        group: '13',
        groupTitle: 'Finance & General Ledger',
        description: 'Real-time financial statement generation, departmental profitability, and EBITDA analysis',
        icon: Activity,
        badge: 'Reports'
      }
    ]
  },
  {
    id: '14',
    groupNumber: 'Group 14',
    title: 'Fixed Asset Management',
    shortTitle: 'Fixed Asset Management',
    badge: '5 Modules',
    icon: Package,
    submodules: [
      {
        id: '14.1',
        title: 'Asset Master & Barcode Tagging',
        shortTitle: 'Asset Master & Tagging',
        group: '14',
        groupTitle: 'Fixed Asset Management',
        description: 'Hospital medical machinery registry, serial numbers, QR code location tags, and custodians',
        icon: Package,
        badge: 'Master'
      },
      {
        id: '14.2',
        title: 'AMC / CMC Service Contracts & Warranties',
        shortTitle: 'AMC / CMC Contracts',
        group: '14',
        groupTitle: 'Fixed Asset Management',
        description: 'Vendor maintenance contract expiry tracking, SLA commitments, and renewal notifications',
        icon: ClipboardList,
        badge: 'Contracts'
      },
      {
        id: '14.3',
        title: 'Preventive Maintenance Scheduling',
        shortTitle: 'Preventive Maintenance',
        group: '14',
        groupTitle: 'Fixed Asset Management',
        description: 'Biomedical engineering routine calibration dates, safety inspections, and servicing logs',
        icon: Wrench,
        badge: 'Service'
      },
      {
        id: '14.4',
        title: 'Breakdown Reporting & Work Ticket',
        shortTitle: 'Breakdown Work Tickets',
        group: '14',
        groupTitle: 'Fixed Asset Management',
        description: 'Urgent ward equipment failure tickets, engineering dispatch, parts replaced, and resolution time',
        icon: ShieldAlert,
        badge: 'Tickets'
      },
      {
        id: '14.5',
        title: 'Asset Depreciation Calculation',
        shortTitle: 'Asset Depreciation',
        group: '14',
        groupTitle: 'Fixed Asset Management',
        description: 'Straight line and written down value (WDV) depreciation calculation for tax and audit compliance',
        icon: TrendingDown,
        badge: 'Depreciation'
      }
    ]
  },
  {
    id: '15',
    groupNumber: 'Group 15',
    title: 'Hospital & Administration Setup',
    shortTitle: 'Hospital & Admin Setup',
    badge: '5 Modules',
    icon: Building2,
    submodules: [
      {
        id: '15.1',
        title: 'Hospital & Branch Master',
        shortTitle: 'Hospital & Branch Master',
        group: '15',
        groupTitle: 'Hospital & Administration Setup',
        description: 'Corporate entity setup, branch clinic registration, tax identifiers, and official letterhead',
        icon: Building2,
        badge: 'Branches'
      },
      {
        id: '15.2',
        title: 'Department & Clinic Hierarchy',
        shortTitle: 'Department & Clinic Hierarchy',
        group: '15',
        groupTitle: 'Hospital & Administration Setup',
        description: 'Clinical divisions, inpatient wards, surgical suites, administrative units, and reporting lines',
        icon: Network,
        badge: 'Hierarchy'
      },
      {
        id: '15.3',
        title: 'Doctor & Consultant Master',
        shortTitle: 'Doctor & Consultant Master',
        group: '15',
        groupTitle: 'Hospital & Administration Setup',
        description: 'Specialist practitioner profiles, medical council registration numbers, OPD consultation fees',
        icon: Users,
        badge: 'Doctors'
      },
      {
        id: '15.4',
        title: 'Service Catalog & Tariff Master',
        shortTitle: 'Service Catalog & Tariffs',
        group: '15',
        groupTitle: 'Hospital & Administration Setup',
        description: 'Master list of billable investigations, bed rates, nursing procedures, and surgical packages',
        icon: ClipboardList,
        badge: 'Tariffs'
      },
      {
        id: '15.5',
        title: 'Corporate Tariff Rate Contracts',
        shortTitle: 'Corporate Tariff Contracts',
        group: '15',
        groupTitle: 'Hospital & Administration Setup',
        description: 'Special pricing agreements for corporate empaneled partners, discounts, and tier contracts',
        icon: Landmark,
        badge: 'Contracts'
      }
    ]
  },
  {
    id: '16',
    groupNumber: 'Group 16',
    title: 'Inventory & Store Management',
    shortTitle: 'Store & Inventory',
    badge: '5 Modules',
    icon: Package,
    submodules: [
      {
        id: '16.1',
        title: 'Item Master & Material Categories',
        shortTitle: 'Item Master & Categories',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Consumables, surgical instruments, implants, linen, and classification taxonomy',
        icon: Package,
        badge: 'Catalogue'
      },
      {
        id: '16.2',
        title: 'Store Requisition (Indent)',
        shortTitle: 'Store Requisition (Indent)',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Inpatient ward and OT material requirement requisitions, approvals, and dispatch orders',
        icon: FileText,
        badge: 'Indents'
      },
      {
        id: '16.3',
        title: 'Store Issue to Wards / OT',
        shortTitle: 'Store Issue to Wards / OT',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Direct stock transfer, batch allocation, expiry tracking, and departmental receipt sign-off',
        icon: Truck,
        badge: 'Dispatches'
      },
      {
        id: '16.4',
        title: 'Physical Stock Verification & Audit',
        shortTitle: 'Physical Stock Audit',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Periodic physical counts, variance reconciliation, shrinkage audit, and damage write-offs',
        icon: ClipboardList,
        badge: 'Audit'
      },
      {
        id: '16.5',
        title: 'Minimum / Maximum Reorder Alerts',
        shortTitle: 'Reorder Alerts',
        group: '16',
        groupTitle: 'Inventory & Store Management',
        description: 'Safety stock threshold warnings, lead time buffer calculation, and automated purchase triggers',
        icon: Bell,
        badge: 'Alerts'
      }
    ]
  },
  {
    id: '17',
    groupNumber: 'Group 17',
    title: 'Inpatient Admission & Bed Management',
    shortTitle: 'Inpatient & Bed Management',
    badge: '6 Modules',
    icon: BedDouble,
    submodules: [
      {
        id: '17.1',
        title: 'Admission Desk & Form',
        shortTitle: 'Admission Desk & Form',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Elective and emergency IPD registration, UHID verification, admitting consultant, and room choice',
        icon: DoorOpen,
        badge: 'Admission'
      },
      {
        id: '17.2',
        title: 'My IP Admissions Dashboard',
        shortTitle: 'IP Admissions Dashboard',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Real-time census of admitted patients, length of stay (LOS), primary diagnoses, and ward status',
        icon: Users,
        badge: 'Admissions'
      },
      {
        id: '17.3',
        title: 'Live Bed Matrix / Bed Board',
        shortTitle: 'Live Bed Matrix / Bed Board',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Interactive visual ward map showing occupied, vacant, cleaning, and maintenance beds',
        icon: BedDouble,
        badge: 'Matrix'
      },
      {
        id: '17.4',
        title: 'Bed Transfer Management',
        shortTitle: 'Bed Transfer Management',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Inter-ward transfers, ICU step-down, room upgrade requests, and bed turnover sanitization',
        icon: Truck,
        badge: 'Transfer'
      },
      {
        id: '17.5',
        title: 'Inpatient Doctor Daily Rounds',
        shortTitle: 'Doctor Daily Rounds',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Bedside clinical rounds review, treatment regimen adjustment, and order updates',
        icon: Stethoscope,
        badge: 'Rounds'
      },
      {
        id: '17.6',
        title: 'Discharge Summary & Clearance Workflow',
        shortTitle: 'Discharge & Clearance',
        group: '17',
        groupTitle: 'Inpatient Admission & Bed Management',
        description: 'Multi-stage discharge approval: medical summary, pharmacy clearance, nursing sign-off, billing clearance',
        icon: FileCheck2,
        badge: 'Clearance'
      }
    ]
  }
];

export const ALL_IPD_SUBMODULES = IPD_GROUPS.flatMap(g => g.submodules);
