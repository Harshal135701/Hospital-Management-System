/**
 * Realistic operational datasets for Hospital Billing, Andrology, Hardware Configurations,
 * and External Integration monitoring.
 */

export const INITIAL_SEMEN_ANALYSIS_RECORDS = [
  {
    id: 'sa-001',
    accessionNo: 'SA-2026-0481',
    barcode: 'SA20260481',
    patientName: 'Devika Sengupta (Spouse: Rahul Sengupta)',
    patientUhid: 'UHID-2026-0814',
    age: 34,
    collectionDate: '2026-10-22T09:15:00',
    receiptDate: '2026-10-22T09:30:00',
    collectionMethod: 'Masturbation on-site (Private Room 3)',
    abstinenceDays: 4,
    technician: 'Dr. Priya Nair (Lead Embryologist)',
    status: 'Verified',
    // Macroscopic
    volume: 3.2,
    liquefaction: 'Complete (<30 min)',
    viscosity: 'Normal',
    appearance: 'Normal grey-opalescent',
    ph: 7.6,
    // Microscopic
    concentration: 48, // M/ml
    totalCount: 153.6, // M/ejaculate
    progressiveMotility: 52, // %
    nonProgressiveMotility: 14, // %
    immotile: 34, // %
    totalMotility: 66, // %
    normalMorphology: 7, // % (>4% WHO)
    abnormalHead: 62,
    abnormalNeck: 20,
    abnormalTail: 11,
    vitality: 78, // %
    roundCells: 0.4, // M/ml
    agglutination: 'None',
    comments: 'Normozoospermia compliant with WHO 6th Edition reference values. Suitable for IVF/ICSI cycles.',
    isDraft: false
  },
  {
    id: 'sa-002',
    accessionNo: 'SA-2026-0482',
    barcode: 'SA20260482',
    patientName: 'Vikramaditya Bose',
    patientUhid: 'UHID-2026-1180',
    age: 38,
    collectionDate: '2026-10-22T10:45:00',
    receiptDate: '2026-10-22T11:00:00',
    collectionMethod: 'Masturbation on-site',
    abstinenceDays: 3,
    technician: 'Mr. Anik Mukherjee (Senior Andrologist)',
    status: 'In Analysis',
    volume: 1.8,
    liquefaction: 'Delayed (>60 min)',
    viscosity: 'Slightly Increased',
    appearance: 'Normal grey-opalescent',
    ph: 7.4,
    concentration: 12.5,
    totalCount: 22.5,
    progressiveMotility: 24,
    nonProgressiveMotility: 12,
    immotile: 64,
    totalMotility: 36,
    normalMorphology: 3,
    abnormalHead: 75,
    abnormalNeck: 14,
    abnormalTail: 8,
    vitality: 48,
    roundCells: 1.2,
    agglutination: 'Isolated head-to-head',
    comments: 'Oligoasthenoteratozoospermia (OAT) pattern. Repeat semen analysis advised in 3 weeks.',
    isDraft: true
  },
  {
    id: 'sa-003',
    accessionNo: 'SA-2026-0479',
    barcode: 'SA20260479',
    patientName: 'Rajesh Mukherjee',
    patientUhid: 'UHID-2026-0104',
    age: 41,
    collectionDate: '2026-10-21T14:00:00',
    receiptDate: '2026-10-21T14:15:00',
    collectionMethod: 'PESA (Percutaneous Epididymal Sperm Aspiration)',
    abstinenceDays: 5,
    technician: 'Dr. Priya Nair',
    status: 'Verified',
    volume: 0.6,
    liquefaction: 'Immediate',
    viscosity: 'Normal',
    appearance: 'Clear fluid with cellular pellet',
    ph: 7.5,
    concentration: 6.2,
    totalCount: 3.72,
    progressiveMotility: 18,
    nonProgressiveMotility: 22,
    immotile: 60,
    totalMotility: 40,
    normalMorphology: 4,
    abnormalHead: 80,
    abnormalNeck: 10,
    abnormalTail: 6,
    vitality: 52,
    roundCells: 0.1,
    agglutination: 'None',
    comments: 'Epididymal surgical aspirate. Cryopreservation completed in Straws #ST-26-871 to #873.',
    isDraft: false
  }
];

export const INITIAL_CRYO_SPECIMENS = [
  {
    id: 'cryo-001',
    containerId: 'CRYO-STR-2026-091',
    barcode: 'CRYO091',
    patientName: 'Rahul Sengupta & Devika Sengupta',
    patientUhid: 'UHID-2026-0814',
    category: 'Autologous Patient Sperm',
    freezeDate: '2026-10-15T11:30:00',
    protocol: 'Standard Slow Freezing (Planer Controlled)',
    cryoprotectant: 'Irvine Scientific SpermFreeze (1:1 Glycerol)',
    aliquotsStored: 4,
    aliquotsRemaining: 3,
    storageLocation: {
      tank: 'Tank Alpha (LN2 -196°C)',
      canister: 'Canister 02',
      cane: 'Cane 08',
      goblet: 'Yellow Goblet 10mm',
      strawIds: ['ST-26-901', 'ST-26-902', 'ST-26-903', 'ST-26-904']
    },
    consentStatus: 'Verified (Signed e-Form valid till Oct 2031)',
    preFreezeConcentration: '45 M/ml',
    preFreezeMotility: '62%',
    operator: 'Dr. Priya Nair',
    status: 'Stored',
    notes: 'Preserved prior to spouse planned ICSI stimulation cycle.'
  },
  {
    id: 'cryo-002',
    containerId: 'CRYO-STR-2026-085',
    barcode: 'CRYO085',
    patientName: 'Donor ID: DONOR-SP-042',
    patientUhid: 'DNR-2026-0042',
    category: 'Certified Anonymous Donor',
    freezeDate: '2026-09-28T14:00:00',
    protocol: 'Rapid Vitrification',
    cryoprotectant: 'CryoBioSystem SpermFreeze G-EY',
    aliquotsStored: 6,
    aliquotsRemaining: 6,
    storageLocation: {
      tank: 'Tank Beta (LN2 Donor Vault)',
      canister: 'Canister 01',
      cane: 'Cane 04',
      goblet: 'Blue Goblet 10mm',
      strawIds: ['D42-ST-01', 'D42-ST-02', 'D42-ST-03', 'D42-ST-04', 'D42-ST-05', 'D42-ST-06']
    },
    consentStatus: 'Verified (ART Bank Notarized Consent)',
    preFreezeConcentration: '72 M/ml',
    preFreezeMotility: '75%',
    operator: 'Mr. Anik Mukherjee',
    status: 'Stored',
    notes: 'Cleared 6-month infectious serology quarantine window.'
  },
  {
    id: 'cryo-003',
    containerId: 'CRYO-STR-2026-074',
    barcode: 'CRYO074',
    patientName: 'Rajesh Mukherjee',
    patientUhid: 'UHID-2026-0104',
    category: 'PESA Surgical Aspirate',
    freezeDate: '2026-10-21T15:00:00',
    protocol: 'Controlled Rate Freezing',
    cryoprotectant: 'Origio Medi-Cult Sperm Freezing Media',
    aliquotsStored: 3,
    aliquotsRemaining: 3,
    storageLocation: {
      tank: 'Tank Alpha (LN2 -196°C)',
      canister: 'Canister 03',
      cane: 'Cane 12',
      goblet: 'Red Goblet 10mm',
      strawIds: ['ST-26-871', 'ST-26-872', 'ST-26-873']
    },
    consentStatus: 'Verified (Cryo Retention Order signed)',
    preFreezeConcentration: '6.2 M/ml',
    preFreezeMotility: '40%',
    operator: 'Dr. Priya Nair',
    status: 'Stored',
    notes: 'Surgical recovery; low volume aliquots reserved for ICSI only.'
  }
];

export const INITIAL_THAW_RECORDS = [
  {
    id: 'thaw-001',
    thawDate: '2026-10-18T08:30:00',
    patientName: 'Rahul & Devika Sengupta',
    patientUhid: 'UHID-2026-0814',
    cryoContainerId: 'CRYO-STR-2026-091',
    strawsThawed: 1,
    remainingStraws: 3,
    protocol: 'Rapid Thaw 37°C in water bath 5 min followed by Sil-Select gradient wash',
    indication: 'OPU Cycle ICSI Insemination (Cycle #IVF-2026-014)',
    postThawMotility: 44, // %
    cryoRecoveryRate: 71, // %
    vitalityPostThaw: 68,
    embryologist: 'Dr. Priya Nair',
    physician: 'Dr. Arindam Mitra',
    status: 'Utilized Successfully'
  }
];

export const INITIAL_DONOR_REGISTRY = [
  {
    id: 'dnr-042',
    donorCode: 'DONOR-SP-042',
    category: 'Sperm Donor',
    regDate: '2026-06-12',
    age: 26,
    bloodGroup: 'B+ (Positive)',
    education: 'Postgraduate Engineering',
    physicalTraits: 'Height: 178 cm, Eye: Dark Brown, Skin Tone: Fair',
    screeningStatus: 'Cleared & Released',
    consentStatus: 'Full ART Act Waiver Signed',
    serology: {
      hiv: 'Non-Reactive (ELISA 4th Gen)',
      hbsag: 'Non-Reactive',
      hcv: 'Non-Reactive',
      vdrl: 'Non-Reactive',
      karyotype: '46,XY Normal Male Banding',
      thalassemia: 'HPLC Normal (HbA2 2.4%)'
    },
    inventoryVials: 6,
    storageLocation: 'Tank Beta / Canister 01 / Cane 04',
    lastDonation: '2026-09-28',
    status: 'Active'
  },
  {
    id: 'dnr-045',
    donorCode: 'DONOR-SP-045',
    category: 'Sperm Donor',
    regDate: '2026-08-04',
    age: 29,
    bloodGroup: 'O+ (Positive)',
    education: 'Bachelor of Science (Biotech)',
    physicalTraits: 'Height: 182 cm, Eye: Black, Skin Tone: Medium',
    screeningStatus: 'Under 180-Day Quarantine',
    consentStatus: 'Signed & Notarized',
    serology: {
      hiv: 'Non-Reactive (Initial)',
      hbsag: 'Non-Reactive',
      hcv: 'Non-Reactive',
      vdrl: 'Non-Reactive',
      karyotype: '46,XY Normal Male',
      thalassemia: 'Normal'
    },
    inventoryVials: 8,
    storageLocation: 'Tank Beta / Quarantine Rack 9',
    lastDonation: '2026-08-10',
    status: 'Quarantined (Retest Due 2027-02-10)'
  },
  {
    id: 'dnr-018',
    donorCode: 'DONOR-OO-018',
    category: 'Oocyte Donor',
    regDate: '2026-05-18',
    age: 24,
    bloodGroup: 'A+ (Positive)',
    education: 'Graduate in Commerce',
    physicalTraits: 'Height: 165 cm, Eye: Hazel Brown, Skin Tone: Fair',
    screeningStatus: 'Cleared & Released',
    consentStatus: 'Signed ART Bank Agreement',
    serology: {
      hiv: 'Non-Reactive',
      hbsag: 'Non-Reactive',
      hcv: 'Non-Reactive',
      vdrl: 'Non-Reactive',
      karyotype: '46,XX Normal Female',
      thalassemia: 'Normal'
    },
    inventoryVials: 2,
    storageLocation: 'Tank Alpha / Oocyte Canister 04',
    lastDonation: '2026-07-22',
    status: 'Active'
  }
];

export const INITIAL_WIDGETS_CONFIG = [
  {
    id: 'w-opd-pos',
    name: 'OPD Billing & POS Collections',
    description: 'Real-time counters for daily outpatient cash, card, and UPI revenue collections.',
    category: 'Financial',
    enabled: true,
    columnSpan: 2,
    roleVisibility: ['Cashier', 'Billing Lead', 'Hospital Admin'],
    order: 1
  },
  {
    id: 'w-token-queue',
    name: 'Outpatient Waiting Room Pacing',
    description: 'Current token queue, active consulting rooms, and waiting duration meters.',
    category: 'Clinical Operations',
    enabled: true,
    columnSpan: 1,
    roleVisibility: ['Receptionist', 'Doctor', 'Nurse'],
    order: 2
  },
  {
    id: 'w-cashier-settlement',
    name: 'Day-End Cashier Handover Status',
    description: 'Counter cash drawer balance and live variance monitoring before shift closing.',
    category: 'Financial',
    enabled: true,
    columnSpan: 1,
    roleVisibility: ['Cashier', 'Finance Officer'],
    order: 3
  },
  {
    id: 'w-ipd-census',
    name: 'Inpatient Active Bed & Running Bill Census',
    description: 'Active bed occupancies, accrued daily tariffs, and unbilled pharmacy indents.',
    category: 'Inpatient',
    enabled: true,
    columnSpan: 2,
    roleVisibility: ['Billing Lead', 'Ward Supervisor', 'Doctor'],
    order: 4
  },
  {
    id: 'w-andrology-lab',
    name: 'Andrology & Cryo Specimen Log',
    description: 'Pending semen analyses, freezing aliquots in storage, and liquid nitrogen levels.',
    category: 'Diagnostic Lab',
    enabled: false,
    columnSpan: 1,
    roleVisibility: ['Embryologist', 'Lab Technician'],
    order: 5
  },
  {
    id: 'w-alerts-sms',
    name: 'Patient SMS & WhatsApp Alerts Delivery Meter',
    description: 'Live delivery success rates, scheduled reminders, and SMS gateway latency.',
    category: 'Communications',
    enabled: false,
    columnSpan: 1,
    roleVisibility: ['Receptionist', 'IT Admin'],
    order: 6
  }
];

export const INITIAL_PRINTER_SETTINGS = [
  {
    id: 'prn-01',
    name: 'Citizen CT-S310II POS Receipt Printer',
    type: 'Direct Thermal',
    role: 'OPD / IPD Cashier Receipts',
    interface: 'USB / Virtual COM Port COM3',
    status: 'Connected / Ready',
    paperWidth: '80mm Roll (Thermal continuous)',
    barcodeFormat: 'Code 128 / QR Code',
    defaultDensity: 'Normal (10)',
    speed: '160 mm/sec',
    isDefaultReceipt: true
  },
  {
    id: 'prn-02',
    name: 'TSC TE244 Specimen Label Barcode Printer',
    type: 'Thermal Transfer',
    role: 'Laboratory Tubes & Specimen Accessions',
    interface: 'USB 2.0 (High Speed)',
    status: 'Connected / Ready',
    paperWidth: '50mm x 25mm 2-Across Labels',
    barcodeFormat: 'Code 128 (Subtype B)',
    defaultDensity: 'High (12)',
    speed: '4 ips',
    isDefaultSpecimen: true
  },
  {
    id: 'prn-03',
    name: 'Zebra ZD420 Healthcare Wristband Printer',
    type: 'Direct Thermal (Disinfectant-ready casing)',
    role: 'Inpatient UHID Wristbands',
    interface: 'Ethernet IP 192.168.1.145',
    status: 'Connected / Online',
    paperWidth: '25mm x 280mm Adult Wristband',
    barcodeFormat: 'DataMatrix 2D',
    defaultDensity: 'Medium (8)',
    speed: '6 ips',
    isDefaultWristband: true
  },
  {
    id: 'prn-04',
    name: 'SATO CL4NX Plus Industrial Cryo Printer',
    type: 'Thermal Transfer Cryo-Resistant',
    role: 'IVF Straw & Cryo Vial Labels (-196°C resistant)',
    interface: 'Network LAN 192.168.1.148',
    status: 'Standby / Ready',
    paperWidth: '38mm x 19mm Cryo-Tags',
    barcodeFormat: 'Micro-QR / Code 128',
    defaultDensity: 'Max (14)',
    speed: '2 ips',
    isDefaultCryo: true
  }
];

export const INITIAL_ATTACHMENT_CATEGORIES = [
  { id: 'cat-1', name: 'Discharge Summary', allowedTypes: 'PDF', maxSizeMb: 10, requiredAuth: 'Medical Record Office' },
  { id: 'cat-2', name: 'Laboratory & Pathology Report', allowedTypes: 'PDF, JPG, PNG', maxSizeMb: 8, requiredAuth: 'Pathologist' },
  { id: 'cat-3', name: 'Radiology / X-Ray / CT / MRI Scan', allowedTypes: 'PDF, DICOM (.dcm), JPEG', maxSizeMb: 25, requiredAuth: 'Radiology' },
  { id: 'cat-4', name: 'External Referral Letter & Past History', allowedTypes: 'PDF, JPG', maxSizeMb: 5, requiredAuth: 'Front Desk' },
  { id: 'cat-5', name: 'Insurance Card & Government ID Proof', allowedTypes: 'PDF, JPG, PNG', maxSizeMb: 5, requiredAuth: 'Billing Desk' },
  { id: 'cat-6', name: 'Informed Surgical & ART Consent Form', allowedTypes: 'PDF', maxSizeMb: 10, requiredAuth: 'Clinician' }
];

export const INITIAL_EXTERNAL_APIS = [
  {
    id: 'api-sms',
    name: 'Fast2SMS Enterprise DLT Gateway',
    purpose: 'Transactional SMS for Outpatient appointments, token queues & OTP verification',
    endpoint: 'https://www.fast2sms.com/dev/bulkV2',
    status: 'Healthy / Active',
    httpStatus: 200,
    lastChecked: '3 minutes ago',
    lastEvent: 'SMS dispatched to +91 98310 44521 (Delivery Receipt OK)',
    authKeyMasked: 'F2SMS••••••••••••••••••••7a91',
    monthlyQuota: '68,450 / 100,000 credits',
    errorRate: '0.02%'
  },
  {
    id: 'api-whatsapp',
    name: 'Meta WhatsApp Business Cloud API',
    purpose: 'Interactive appointment confirmations, digital OPD PDF receipts & discharge notices',
    endpoint: 'https://graph.facebook.com/v19.0/3948210948/messages',
    status: 'Healthy / Active',
    httpStatus: 200,
    lastChecked: '7 minutes ago',
    lastEvent: 'Template message "appointment_booked_in" acknowledged',
    authKeyMasked: 'EAAG••••••••••••••••••••3d9e',
    monthlyQuota: '18,200 / 50,000 Tier-2 Tier',
    errorRate: '0.00%'
  },
  {
    id: 'api-pg',
    name: 'Razorpay Healthcare Payment Gateway',
    purpose: 'Instant UPI dynamic QR generation at billing counters and debit/credit card processing',
    endpoint: 'https://api.razorpay.com/v1/orders',
    status: 'Healthy / Active',
    httpStatus: 200,
    lastChecked: '1 minute ago',
    lastEvent: 'Webhook payment.captured (₹1,450 txn #pay_PQ8912) verified',
    authKeyMasked: 'rzp_live_••••••••••••••••••••9941',
    monthlyQuota: 'Unlimited Commercial Tier',
    errorRate: '0.01%'
  },
  {
    id: 'api-lis',
    name: 'Beckman Coulter & Sysmex HL7 LIS Socket Interface',
    purpose: 'Automated bi-directional hematology & biochemistry result streaming into hospital EMR',
    endpoint: 'tcp://192.168.1.200:5000 (MLLP Protocol)',
    status: 'Healthy / Active',
    httpStatus: 200,
    lastChecked: 'Live Socket Stream Active',
    lastEvent: 'HL7 ORU^R01 packet ingested for Acc #CBC-2026-981',
    authKeyMasked: 'TLS-Mutual-Cert-Valid-2027',
    monthlyQuota: 'Intranet TCP Stream',
    errorRate: '0.00%'
  },
  {
    id: 'api-abdm',
    name: 'Ayushman Bharat Digital Mission (ABDM) Gateway',
    purpose: 'ABHA address lookup, Aadhaar e-KYC demographic verification & health record linking',
    endpoint: 'https://dev.abdm.gov.in/gateway/v0.5',
    status: 'Active (Production Sandbox)',
    httpStatus: 200,
    lastChecked: '15 minutes ago',
    lastEvent: 'Health ID verification handshake verified',
    authKeyMasked: 'CLIENT-ID-••••••••••••••••••••4122',
    monthlyQuota: 'Government Gateway (No Quota)',
    errorRate: '0.15%'
  },
  {
    id: 'api-tpa',
    name: 'MediAssist & Vidal Health Insurance Switch',
    purpose: 'Cashless pre-authorization claims submission & query settlement tracking',
    endpoint: 'https://switch.mediassist.in/api/v2/preauth',
    status: 'Degraded / High Latency',
    httpStatus: 504,
    lastChecked: '4 minutes ago',
    lastEvent: 'Warning: TPA switch response latency 8,420 ms (Threshold 3,000 ms)',
    authKeyMasked: 'TPA-SEC-••••••••••••••••••••8819',
    monthlyQuota: 'Unlimited Hospital Contract',
    errorRate: '3.40%'
  }
];

export const INITIAL_SERVICES_CATALOGUE = [
  { id: 'srv-01', code: 'CNS-01', name: 'General Medicine Consultation Fee', category: 'Consultation', price: 500, taxRate: 0 },
  { id: 'srv-02', code: 'CNS-02', name: 'Specialist Consultation (Cardiology / Nephrology)', category: 'Consultation', price: 800, taxRate: 0 },
  { id: 'srv-03', code: 'CNS-03', name: 'Super Specialist / IVF Fertility Consultation', category: 'Consultation', price: 1200, taxRate: 0 },
  { id: 'srv-04', code: 'LAB-01', name: 'Complete Blood Count (CBC with ESR)', category: 'Laboratory', price: 450, taxRate: 0 },
  { id: 'srv-05', code: 'LAB-02', name: 'Comprehensive Semen Analysis (WHO 6th Ed)', category: 'Laboratory', price: 1200, taxRate: 0 },
  { id: 'srv-06', code: 'LAB-03', name: 'Sperm Cryopreservation & 1-Year Storage', category: 'Cryo-Bank', price: 15000, taxRate: 0 },
  { id: 'srv-07', code: 'LAB-04', name: 'Lipid Profile & Liver Function Panel', category: 'Laboratory', price: 1100, taxRate: 0 },
  { id: 'srv-08', code: 'DIA-01', name: '12-Lead Electrocardiogram (ECG)', category: 'Diagnostic', price: 350, taxRate: 0 },
  { id: 'srv-09', code: 'DIA-02', name: 'Pelvic & Follicular Ultrasound (TVS USG)', category: 'Diagnostic', price: 1600, taxRate: 0 },
  { id: 'srv-10', code: 'PRC-01', name: 'Outpatient Dressing & Antiseptic Care', category: 'Nursing', price: 250, taxRate: 0 },
  { id: 'srv-11', code: 'PRC-02', name: 'Nebulization & Oxygen Pulse Setup', category: 'Nursing', price: 300, taxRate: 0 }
];
