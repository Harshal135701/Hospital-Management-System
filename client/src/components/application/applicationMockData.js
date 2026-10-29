export const INITIAL_DASHBOARD_WIDGETS = [
  {
    id: 'w-opd-pos',
    name: 'OPD Billing & POS Collections',
    description: 'Real-time counters for daily outpatient cash, card, and UPI revenue collections.',
    category: 'Financial',
    enabled: true,
    columnSpan: 2,
    roleVisibility: ['Cashier', 'Billing Lead', 'Hospital Admin'],
    order: 1,
    metrics: { primary: '₹ 1,84,520', secondary: '142 OPD Receipts Today', trend: '+14% vs yesterday' }
  },
  {
    id: 'w-token-queue',
    name: 'Outpatient Waiting Room Pacing',
    description: 'Current token queue, active consulting rooms, and waiting duration meters.',
    category: 'Clinical Operations',
    enabled: true,
    columnSpan: 1,
    roleVisibility: ['Receptionist', 'Doctor', 'Nurse'],
    order: 2,
    metrics: { primary: '28 Patients', secondary: 'Avg Wait 14 mins', trend: 'Queue Pacing Normal' }
  },
  {
    id: 'w-cashier-settlement',
    name: 'Day-End Cashier Handover Status',
    description: 'Counter cash drawer balance and live variance monitoring before shift closing.',
    category: 'Financial',
    enabled: true,
    columnSpan: 1,
    roleVisibility: ['Cashier', 'Finance Officer', 'Hospital Admin'],
    order: 3,
    metrics: { primary: '₹ 42,800 Cash In Drawer', secondary: '0 Discrepancies', trend: 'Ready for Close' }
  },
  {
    id: 'w-ipd-census',
    name: 'Inpatient Active Bed & Running Bill Census',
    description: 'Active bed occupancies, accrued daily tariffs, and unbilled pharmacy indents.',
    category: 'Inpatient',
    enabled: true,
    columnSpan: 2,
    roleVisibility: ['Billing Lead', 'Ward Supervisor', 'Doctor'],
    order: 4,
    metrics: { primary: '78 / 90 Beds (86%)', secondary: '₹ 8,92,400 Accrued Bills', trend: '12 Discharges Pending' }
  },
  {
    id: 'w-andrology-lab',
    name: 'Andrology & Cryo Specimen Log',
    description: 'Pending semen analyses, freezing aliquots in storage, and liquid nitrogen levels.',
    category: 'Diagnostic Lab',
    enabled: true,
    columnSpan: 1,
    roleVisibility: ['Embryologist', 'Lab Technician', 'Doctor'],
    order: 5,
    metrics: { primary: '14 Pending Analyses', secondary: '1,420 Aliquots Vitrified', trend: 'LN2 Tank 100%' }
  },
  {
    id: 'w-alerts-sms',
    name: 'Patient SMS & WhatsApp Alerts Delivery Meter',
    description: 'Live delivery success rates, scheduled reminders, and SMS gateway latency.',
    category: 'Communications',
    enabled: false,
    columnSpan: 1,
    roleVisibility: ['Receptionist', 'Hospital Admin'],
    order: 6,
    metrics: { primary: '99.8% Delivered', secondary: '412 Dispatches Today', trend: 'Latency 180ms' }
  },
  {
    id: 'w-emergency-triage',
    name: 'Emergency Room Triage Activity',
    description: 'Red/Amber/Green acute triage patient counts, resuscitation bay occupancies.',
    category: 'Clinical Operations',
    enabled: false,
    columnSpan: 2,
    roleVisibility: ['Doctor', 'Nurse', 'Hospital Admin'],
    order: 7,
    metrics: { primary: '3 Red Code (Critical)', secondary: '6 Amber / 11 Green', trend: 'Bay 1 & 2 Occupied' }
  },
  {
    id: 'w-ot-schedule',
    name: 'Operation Theatre Procedure Schedule',
    description: 'Live OT suite occupation, planned elective cases, and PAC clearance flags.',
    category: 'Clinical Operations',
    enabled: false,
    columnSpan: 1,
    roleVisibility: ['Doctor', 'Nurse', 'Hospital Admin'],
    order: 8,
    metrics: { primary: '4 Active Surgeries', secondary: '7 Scheduled Cases', trend: 'Suite 2 Sanitizing' }
  }
];

export const INITIAL_REGISTERED_PRINTERS = [
  {
    id: 'prn-01',
    name: 'Citizen CT-S310II POS Receipt Printer',
    type: 'Direct Thermal',
    role: 'OPD / IPD Cashier Receipts',
    interface: 'USB 2.0 / Virtual COM Port COM3',
    status: 'Connected / Ready',
    paperWidth: '80mm Roll (Thermal continuous)',
    barcodeFormat: 'Code 128 / QR Code',
    defaultDensity: 10,
    speed: '160 mm/sec',
    isDefaultReceipt: true,
    isDefaultSpecimen: false,
    isDefaultWristband: false,
    isDefaultCryo: false,
    lastTested: 'Today, 10:45 AM'
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
    defaultDensity: 12,
    speed: '4 ips',
    isDefaultReceipt: false,
    isDefaultSpecimen: true,
    isDefaultWristband: false,
    isDefaultCryo: false,
    lastTested: 'Today, 09:15 AM'
  },
  {
    id: 'prn-03',
    name: 'Zebra ZD420 Healthcare Wristband Printer',
    type: 'Direct Thermal (Disinfectant-ready casing)',
    role: 'Inpatient UHID Wristbands',
    interface: 'Ethernet IP 192.168.1.145',
    status: 'Connected / Ready',
    paperWidth: '25mm x 280mm Adult Wristband',
    barcodeFormat: 'DataMatrix 2D',
    defaultDensity: 8,
    speed: '6 ips',
    isDefaultReceipt: false,
    isDefaultSpecimen: false,
    isDefaultWristband: true,
    isDefaultCryo: false,
    lastTested: 'Yesterday, 04:20 PM'
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
    defaultDensity: 14,
    speed: '2 ips',
    isDefaultReceipt: false,
    isDefaultSpecimen: false,
    isDefaultWristband: false,
    isDefaultCryo: true,
    lastTested: '2 days ago'
  },
  {
    id: 'prn-05',
    name: 'HP LaserJet Enterprise M608dn',
    type: 'Laser / Document',
    role: 'Medical Reports & Discharge Summaries',
    interface: 'Network LAN 192.168.1.140',
    status: 'Connected / Ready',
    paperWidth: 'A4 / Letter Standard Tray',
    barcodeFormat: 'Code 128',
    defaultDensity: 10,
    speed: '65 ppm',
    isDefaultReceipt: false,
    isDefaultSpecimen: false,
    isDefaultWristband: false,
    isDefaultCryo: false,
    lastTested: 'Today, 11:30 AM'
  }
];

export const INITIAL_ATTACHMENT_CATEGORIES = [
  { id: 'cat-1', name: 'Discharge Summary', allowedTypes: 'PDF', maxSizeMb: 10, retentionYears: 10, requiredAuth: 'Medical Record Office', isMandatory: true, active: true },
  { id: 'cat-2', name: 'Laboratory & Pathology Report', allowedTypes: 'PDF, JPG, PNG', maxSizeMb: 8, retentionYears: 7, requiredAuth: 'Pathologist', isMandatory: true, active: true },
  { id: 'cat-3', name: 'Radiology / X-Ray / CT / MRI Scan', allowedTypes: 'PDF, DICOM (.dcm), JPG', maxSizeMb: 25, retentionYears: 10, requiredAuth: 'Radiology Officer', isMandatory: false, active: true },
  { id: 'cat-4', name: 'External Referral Letter & Past History', allowedTypes: 'PDF, JPG', maxSizeMb: 5, retentionYears: 5, requiredAuth: 'Front Desk', isMandatory: false, active: true },
  { id: 'cat-5', name: 'Insurance Card & Government ID Proof', allowedTypes: 'PDF, JPG, PNG', maxSizeMb: 5, retentionYears: 5, requiredAuth: 'Billing Desk', isMandatory: true, active: true },
  { id: 'cat-6', name: 'Informed Surgical & ART Consent Form', allowedTypes: 'PDF', maxSizeMb: 10, retentionYears: 15, requiredAuth: 'Clinician / Embryologist', isMandatory: true, active: true },
  { id: 'cat-7', name: 'Prescription & Pharmacy Dispense Slips', allowedTypes: 'PDF, JPG', maxSizeMb: 5, retentionYears: 3, requiredAuth: 'Pharmacist', isMandatory: false, active: true }
];

export const INITIAL_ATTACHMENTS_LIST = [
  {
    id: 'att-01',
    title: 'Discharge Summary - Laparoscopic Cholecystectomy',
    patient_name: 'Suresh Chandra Pal',
    patient_uhid: 'UHID-2026-0511',
    category: 'Discharge Summary',
    file_name: 'discharge_summary_pal.pdf',
    file_size_kb: 420,
    uploaded_at: '2026-10-21T16:30:00Z',
    uploaded_by: 'Medical Records Officer K. Bose',
    contentSnippet: 'Patient was admitted for symptomatic gallstone disease. Elective laparoscopic cholecystectomy performed under GA on 20-Oct-2026. Post-op recovery uneventful. Discharged in hemodynamically stable condition on oral analgesics and antibiotic coverage.'
  },
  {
    id: 'att-02',
    title: 'Pre-Op Coagulation & Semen Cryo Retention Consent',
    patient_name: 'Devika & Rahul Sengupta',
    patient_uhid: 'UHID-2026-0814',
    category: 'Informed Surgical & ART Consent Form',
    file_name: 'art_consent_signed_sengupta.pdf',
    file_size_kb: 890,
    uploaded_at: '2026-10-22T08:45:00Z',
    uploaded_by: 'Dr. Priya Nair (ART Consultant)',
    contentSnippet: 'Signed legal consent under ART (Regulation) Act 2021 for semen sample cryopreservation, liquid nitrogen quarantine storage, and subsequent ICSI fertilization cycle. Identity verified via Aadhaar OTP e-KYC.'
  },
  {
    id: 'att-03',
    title: 'Pelvic USG & Folliculometry Scan Report',
    patient_name: 'Meera Mukherjee',
    patient_uhid: 'UHID-2026-0772',
    category: 'Radiology / X-Ray / CT / MRI Scan',
    file_name: 'tvs_usg_scan_oct22.pdf',
    file_size_kb: 1450,
    uploaded_at: '2026-10-22T10:15:00Z',
    uploaded_by: 'Radiology Tech K. Roy',
    contentSnippet: 'Transvaginal sonography (TVS) folliculometry: Right ovary exhibits 4 dominant follicles (18mm, 17.5mm, 16mm, 15mm). Left ovary exhibits 3 follicles (17mm, 15mm, 14mm). Triple line endometrial thickness 10.2mm.'
  },
  {
    id: 'att-04',
    title: 'Ayushman Bharat PM-JAY Golden Card e-KYC',
    patient_name: 'Rameshwar Mahato',
    patient_uhid: 'UHID-2026-0429',
    category: 'Insurance Card & Government ID Proof',
    file_name: 'pmjay_card_mahato.pdf',
    file_size_kb: 310,
    uploaded_at: '2026-10-23T11:20:00Z',
    uploaded_by: 'Cashier S. Biswas',
    contentSnippet: 'PM-JAY Health ID: P98214019284. Family Card ID: PMJAY-WB-99120. Pre-authorization sanctioned under General Medicine secondary care package.'
  },
  {
    id: 'att-05',
    title: 'Comprehensive Semen Analysis Laboratory Report',
    patient_name: 'Arjun Sen',
    patient_uhid: 'UHID-2026-0922',
    category: 'Laboratory & Pathology Report',
    file_name: 'semen_analysis_rep_sen.pdf',
    file_size_kb: 560,
    uploaded_at: '2026-10-24T14:10:00Z',
    uploaded_by: 'Lab Technologist S. Gupta',
    contentSnippet: 'WHO 6th Edition semen analysis: Volume 3.2 mL, Sperm concentration 48 M/mL, Progressive motility 54%, Normal forms 5.5%, Vitality 78%. Normozoospermia.'
  },
  {
    id: 'att-06',
    title: 'Cardiology Referral & 12-Lead ECG Tracing',
    patient_name: 'Nirmala Devi',
    patient_uhid: 'UHID-2026-0318',
    category: 'External Referral Letter & Past History',
    file_name: 'ecg_cardio_referral_devi.pdf',
    file_size_kb: 780,
    uploaded_at: '2026-10-25T09:05:00Z',
    uploaded_by: 'Front Desk Officer A. Das',
    contentSnippet: 'Normal sinus rhythm, HR 74 bpm, no acute ST-T changes. Cleared for elective procedure with cardiac risk stratification Class I.'
  }
];

export const INITIAL_GATEWAY_INTEGRATIONS = [
  {
    id: 'api-sms',
    name: 'Fast2SMS Enterprise DLT Gateway',
    category: 'SMS DLT',
    purpose: 'Transactional SMS for Outpatient appointments, token queues & OTP verification',
    endpoint: 'https://www.fast2sms.com/dev/bulkV2',
    status: 'healthy',
    httpStatus: 200,
    latencyMs: 142,
    lastChecked: '3 minutes ago',
    lastEvent: 'SMS dispatched to +91 98310 44521 (Delivery Receipt OK)',
    authKeyMasked: 'F2SMS_live_••••••••••••••••7a91',
    monthlyQuota: '68,450 / 100,000 credits',
    errorRate: '0.02%',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'F2SMS_live_••••••••••••••••7a91' },
    mockResponse: {
      status: 'success',
      return: true,
      message: ['Message sent successfully'],
      request_id: 'REQ-SMS-9941203',
      delivery_window_sec: 1.2
    }
  },
  {
    id: 'api-whatsapp',
    name: 'Meta WhatsApp Business Cloud API',
    category: 'WhatsApp Cloud',
    purpose: 'Interactive appointment confirmations, digital OPD PDF receipts & discharge notices',
    endpoint: 'https://graph.facebook.com/v19.0/3948210948/messages',
    status: 'healthy',
    httpStatus: 200,
    latencyMs: 185,
    lastChecked: '7 minutes ago',
    lastEvent: 'Template message "appointment_booked_in" acknowledged',
    authKeyMasked: 'EAAG_live_••••••••••••••••3d9e',
    monthlyQuota: '18,200 / 50,000 Tier-2 Tier',
    errorRate: '0.00%',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer EAAG_live_••••••••••••••••3d9e' },
    mockResponse: {
      messaging_product: 'whatsapp',
      contacts: [{ input: '+919830012345', wa_id: '919830012345' }],
      messages: [{ id: 'wamid.HBgLOTE5ODMwMDEyMzQ1FQIAERgSQTcyNzkxNDUyQzU5QUE3Njc5AA==' }]
    }
  },
  {
    id: 'api-pg',
    name: 'Razorpay Healthcare Payment Gateway',
    category: 'Payment Gateway',
    purpose: 'Instant UPI dynamic QR generation at billing counters and debit/credit card processing',
    endpoint: 'https://api.razorpay.com/v1/orders',
    status: 'healthy',
    httpStatus: 200,
    latencyMs: 118,
    lastChecked: '1 minute ago',
    lastEvent: 'Webhook payment.captured (₹1,450 txn #pay_PQ8912) verified',
    authKeyMasked: 'rzp_live_••••••••••••••••9941',
    monthlyQuota: 'Unlimited Commercial Tier',
    errorRate: '0.01%',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic cnpwX2xpdmVf••••••••••••' },
    mockResponse: {
      id: 'order_EKf3Ow6ubTBwmK',
      entity: 'order',
      amount: 145000,
      currency: 'INR',
      status: 'created',
      attempts: 0
    }
  },
  {
    id: 'api-lis',
    name: 'Beckman Coulter & Sysmex HL7 LIS Socket Interface',
    category: 'HL7 / LIS Socket',
    purpose: 'Automated bi-directional hematology & biochemistry result streaming into hospital EMR',
    endpoint: 'tcp://192.168.1.200:5000 (MLLP Protocol)',
    status: 'healthy',
    httpStatus: 200,
    latencyMs: 38,
    lastChecked: 'Live Socket Stream Active',
    lastEvent: 'HL7 ORU^R01 packet ingested for Acc #CBC-2026-981',
    authKeyMasked: 'TLS_Mutual_Cert_RSA2048_Valid_2027',
    monthlyQuota: 'Intranet TCP Stream',
    errorRate: '0.00%',
    headers: { 'Protocol': 'HL7 v2.5 / MLLP', 'Encryption': 'TLS 1.3' },
    mockResponse: {
      socket_status: 'CONNECTED',
      mllp_ack: 'MSH|^~\\&|HMS_LIS|HOSPITAL|ANALYZER|LAB|20261029||ACK^R01|MSG001|P|2.5\rMSA|AA|MSG001\r',
      active_connections: 4
    }
  },
  {
    id: 'api-abdm',
    name: 'Ayushman Bharat Digital Mission (ABDM) Gateway',
    category: 'Government ABDM',
    purpose: 'ABHA address lookup, Aadhaar e-KYC demographic verification & health record linking',
    endpoint: 'https://dev.abdm.gov.in/gateway/v0.5',
    status: 'sandbox',
    httpStatus: 200,
    latencyMs: 320,
    lastChecked: '15 minutes ago',
    lastEvent: 'Health ID verification handshake verified',
    authKeyMasked: 'ABDM_CLIENT_••••••••••••••••4122',
    monthlyQuota: 'Government Gateway (No Quota)',
    errorRate: '0.15%',
    headers: { 'Content-Type': 'application/json', 'X-CM-ID': 'sbx', 'Authorization': 'Bearer eyJhbGciOiJSUzI1Ni...' },
    mockResponse: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      gateway_version: 'v0.5',
      hip_status: 'REGISTERED_ACTIVE'
    }
  },
  {
    id: 'api-tpa',
    name: 'MediAssist & Vidal Health Insurance Switch',
    category: 'Insurance / TPA Switch',
    purpose: 'Cashless pre-authorization claims submission & query settlement tracking',
    endpoint: 'https://switch.mediassist.in/api/v2/preauth',
    status: 'degraded',
    httpStatus: 504,
    latencyMs: 8420,
    lastChecked: '4 minutes ago',
    lastEvent: 'Warning: TPA switch response latency 8,420 ms (Threshold 3,000 ms)',
    authKeyMasked: 'TPA_SEC_••••••••••••••••8819',
    monthlyQuota: 'Unlimited Hospital Contract',
    errorRate: '3.40%',
    headers: { 'Content-Type': 'application/json', 'X-Provider-Code': 'HOSP-WB-771' },
    mockResponse: {
      error: 'upstream_timeout',
      gateway: 'tpa_switch',
      latency_exceeded: true,
      diagnostic_message: 'Gateway latency 8420ms exceeded SLA threshold of 3000ms. Retrying via secondary fallback route.'
    }
  }
];
