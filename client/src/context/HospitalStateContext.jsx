import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'medicsprime_hms_demo_v1';
const QUARANTINE_KEY = 'medicsprime_hms_demo_v1_quarantine';
const STORAGE_VERSION = 1;

// ============================================================================
// DEFAULT REALISTIC SEED DATA (Used when storage is empty or reset)
// ============================================================================

export const DEFAULT_PATIENTS = [
  {
    id: 'p-001',
    uhid: 'UHID-2026-0814',
    full_name: 'Devika Sengupta',
    date_of_birth: '1988-04-12',
    gender: 'female',
    blood_group: 'B',
    rh_factor: 'positive',
    mobile: '9830122410',
    alt_mobile: '9831044521',
    email: 'devika.sengupta@example.com',
    address: 'Flat 4B, Greenfield Residency, EM Bypass',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pin_code: '700107',
    emergency_name: 'Rahul Sengupta',
    emergency_relationship: 'Spouse',
    emergency_phone: '9831044521',
    allergies: 'Penicillin (mild cutaneous rash)',
    high_risk: false,
    created_at: '2026-02-14T09:30:00Z'
  },
  {
    id: 'p-002',
    uhid: 'UHID-2026-0922',
    full_name: 'Rajesh Narayan Verma',
    date_of_birth: '1974-11-23',
    gender: 'male',
    blood_group: 'O',
    rh_factor: 'positive',
    mobile: '9433088204',
    alt_mobile: '',
    email: 'rajesh.verma@example.com',
    address: '14/2 Lake Gardens, Near Circular Lake',
    city: 'Kolkata',
    district: 'South 24 Parganas',
    state: 'West Bengal',
    pin_code: '700045',
    emergency_name: 'Sunita Verma',
    emergency_relationship: 'Spouse',
    emergency_phone: '9433088205',
    allergies: 'None known',
    high_risk: true,
    created_at: '2026-02-15T11:15:00Z'
  },
  {
    id: 'p-003',
    uhid: 'UHID-2026-1045',
    full_name: 'Amina Khatun',
    date_of_birth: '1995-07-08',
    gender: 'female',
    blood_group: 'AB',
    rh_factor: 'positive',
    mobile: '9123456789',
    alt_mobile: '',
    email: 'amina.k@example.com',
    address: '77 Park Circus Lane',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pin_code: '700017',
    emergency_name: 'Farooq Khatun',
    emergency_relationship: 'Parent',
    emergency_phone: '9123456788',
    allergies: 'NSAIDs (gastric bronchospasm)',
    high_risk: false,
    created_at: '2026-02-18T14:00:00Z'
  },
  {
    id: 'p-004',
    uhid: 'UHID-2026-1180',
    full_name: 'Vikramaditya Bose',
    date_of_birth: '1962-09-30',
    gender: 'male',
    blood_group: 'A',
    rh_factor: 'negative',
    mobile: '9876543210',
    alt_mobile: '9876543211',
    email: 'v.bose@example.com',
    address: '8 Ballygunge Circular Road, Apt 3A',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pin_code: '700019',
    emergency_name: 'Sarmistha Bose',
    emergency_relationship: 'Spouse',
    emergency_phone: '9876543212',
    allergies: 'Sulfa Drugs',
    high_risk: true,
    created_at: '2026-03-01T10:45:00Z'
  },
  {
    id: 'p-005',
    uhid: 'UHID-2026-0640',
    full_name: 'Aniruddha Sen',
    date_of_birth: '1958-03-14',
    gender: 'male',
    blood_group: 'B',
    rh_factor: 'positive',
    mobile: '9831102938',
    alt_mobile: '',
    email: 'asen@example.com',
    address: '12 Dover Lane, 2nd Floor',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pin_code: '700029',
    emergency_name: 'Tanushree Sen',
    emergency_relationship: 'Child',
    emergency_phone: '9831102939',
    allergies: 'None',
    high_risk: true,
    created_at: '2026-03-10T08:20:00Z'
  }
];

export const DEFAULT_DEPARTMENTS = [
  { id: 'dept-cardio', name: 'Cardiology & Cath Lab', code: 'CRD', floor: '1st Floor, Block A', head: 'Dr. Arindam Mitra', status: 'active' },
  { id: 'dept-haem', name: 'Haematology & Transfusion', code: 'HAEM', floor: '2nd Floor, Block B', head: 'Dr. Ananya Sharma', status: 'active' },
  { id: 'dept-ortho', name: 'Orthopaedics & Joint Care', code: 'ORT', floor: '1st Floor, Block A', head: 'Dr. Pradeep K. Sharma', status: 'active' },
  { id: 'dept-med', name: 'General Internal Medicine', code: 'MED', floor: 'Ground Floor, Block A', head: 'Dr. Sunita Rao', status: 'active' },
  { id: 'dept-ivf', name: 'Reproductive Medicine & IVF', code: 'IVF', floor: '3rd Floor, Diagnostic Wing', head: 'Dr. Priya Nair', status: 'active' },
  { id: 'dept-surg', name: 'General & Laparoscopic Surgery', code: 'SURG', floor: '2nd Floor, Block A', head: 'Dr. Amitabh Roy', status: 'active' },
  { id: 'dept-emrg', name: 'Emergency & Trauma Center', code: 'EMR', floor: 'Ground Floor, Red Bay', head: 'Dr. Sneha Paul', status: 'active' }
];

export const DEFAULT_DOCTORS = [
  {
    id: 'doc-01',
    name: 'Dr. Arindam Mitra',
    code: 'DOC-CRD-01',
    prefix: 'D1',
    department_id: 'dept-cardio',
    department_name: 'Cardiology & Cath Lab',
    specialty: 'Interventional Cardiology & Electrophysiology',
    qualification: 'MD, DM (Cardiology), FACC',
    council_reg: 'WBMC-54210',
    default_fee: 800,
    followup_fee: 400,
    room_number: 'Chamber 102, Block A',
    slot_duration_minutes: 15,
    max_daily_patients: 25,
    shifts: ['morning', 'evening'],
    leaves: [],
    status: 'available'
  },
  {
    id: 'doc-02',
    name: 'Dr. Ananya Sharma',
    code: 'DOC-TRF-02',
    prefix: 'D2',
    department_id: 'dept-haem',
    department_name: 'Haematology & Transfusion',
    specialty: 'Clinical Haematology & Transfusion Medicine',
    qualification: 'MD (Pathology), DNB (Haematology)',
    council_reg: 'WBMC-59812',
    default_fee: 700,
    followup_fee: 350,
    room_number: 'Room 204, OPD Block B',
    slot_duration_minutes: 20,
    max_daily_patients: 20,
    shifts: ['morning'],
    leaves: [],
    status: 'available'
  },
  {
    id: 'doc-03',
    name: 'Dr. Pradeep K. Sharma',
    code: 'DOC-ORT-03',
    prefix: 'D3',
    department_id: 'dept-ortho',
    department_name: 'Orthopaedics & Joint Care',
    specialty: 'Joint Replacement & Arthroscopy',
    qualification: 'MS (Orthopaedics), M.Ch (UK)',
    council_reg: 'WBMC-48110',
    default_fee: 600,
    followup_fee: 300,
    room_number: 'Chamber 105, Block A',
    slot_duration_minutes: 15,
    max_daily_patients: 30,
    shifts: ['evening'],
    leaves: [],
    status: 'available'
  },
  {
    id: 'doc-04',
    name: 'Dr. Sunita Rao',
    code: 'DOC-MED-04',
    prefix: 'D4',
    department_id: 'dept-med',
    department_name: 'General Internal Medicine',
    specialty: 'Internal Medicine, Metabolic & Geriatric Care',
    qualification: 'MD (General Medicine)',
    council_reg: 'WBMC-61240',
    default_fee: 500,
    followup_fee: 250,
    room_number: 'Chamber 108, Block A',
    slot_duration_minutes: 15,
    max_daily_patients: 35,
    shifts: ['morning'],
    leaves: [],
    status: 'available'
  },
  {
    id: 'doc-05',
    name: 'Dr. Meenakshi Sundaram',
    code: 'DOC-HAEM-05',
    prefix: 'D5',
    department_id: 'dept-haem',
    department_name: 'Haematology & Transfusion',
    specialty: 'Bone Marrow Transplant & Coagulation',
    qualification: 'MD, FRCPath (Haem)',
    council_reg: 'WBMC-49015',
    default_fee: 750,
    followup_fee: 350,
    room_number: 'Room 206, Block B',
    slot_duration_minutes: 20,
    max_daily_patients: 15,
    shifts: ['evening'],
    leaves: [],
    status: 'available'
  },
  {
    id: 'doc-06',
    name: 'Dr. Priya Nair',
    code: 'DOC-IVF-06',
    prefix: 'D6',
    department_id: 'dept-ivf',
    department_name: 'Reproductive Medicine & IVF',
    specialty: 'Clinical Embryology & Assisted Reproduction',
    qualification: 'MS (OBGYN), Fellowship in Reproductive Medicine',
    council_reg: 'WBMC-62310',
    default_fee: 900,
    followup_fee: 450,
    room_number: 'Chamber 303, Diagnostic Wing',
    slot_duration_minutes: 20,
    max_daily_patients: 18,
    shifts: ['morning'],
    leaves: [],
    status: 'available'
  }
];

export const DEFAULT_ROOM_TARIFFS = [
  { id: 'tariff-icu', code: 'ICU', name: 'Intensive Care Unit (ICU Bed)', daily_rate: 5000, category: 'Critical Care', active: true },
  { id: 'tariff-gen', code: 'GEN', name: 'General Ward Bed', daily_rate: 2000, category: 'Standard Inpatient', active: true },
  { id: 'tariff-deluxe', code: 'DLX', name: 'Private Deluxe Room', daily_rate: 3500, category: 'Private Single', active: true },
  { id: 'tariff-semi', code: 'SEMI', name: 'Semi-Private Sharing (2-Bed)', daily_rate: 2500, category: 'Twin Sharing', active: true },
  { id: 'tariff-daycare', code: 'DC', name: 'Day-Care Ambulatory Pod', daily_rate: 1500, category: 'Day Stay', active: true }
];

export const DEFAULT_ROOM_BILLING_POLICY = {
  policy_id: 'POLICY_MIDNIGHT',
  policy_name: 'Calendar Day with Midnight Census & Checkout Grace',
  checkout_cutoff_hour: 12, // 12:00 PM noon checkout
  late_checkout_half_day_hour: 18, // 18:00 PM
  same_day_short_stay_threshold_hours: 4.0, // <4.0 hrs -> 0.5 factor
  same_day_short_stay_factor: 0.5,
  same_day_standard_stay_factor: 1.0,
  transfer_day_rule: 'MIDNIGHT_LOCATION' // Location at 23:59:59 determines transfer day tariff
};

export const DEFAULT_SERVICES_CATALOG = [
  { id: 'srv-01', code: 'SRV-CONS-01', name: 'General Doctor Consultation', category: 'Consultation', price: 500, tax_rate: 0, active: true },
  { id: 'srv-02', code: 'SRV-CONS-02', name: 'Specialist Consultation Fee', category: 'Consultation', price: 800, tax_rate: 0, active: true },
  { id: 'srv-03', code: 'SRV-CONS-03', name: 'Super-Specialist Consultation', category: 'Consultation', price: 1000, tax_rate: 0, active: true },
  { id: 'srv-04', code: 'SRV-LAB-CBC', name: 'Complete Blood Count (CBC with ESR)', category: 'Laboratory', price: 450, tax_rate: 0, active: true },
  { id: 'srv-05', code: 'SRV-LAB-LIP', name: 'Lipid Profile Screen', category: 'Laboratory', price: 750, tax_rate: 0, active: true },
  { id: 'srv-06', code: 'SRV-LAB-GLU', name: 'Fasting & PP Blood Glucose', category: 'Laboratory', price: 180, tax_rate: 0, active: true },
  { id: 'srv-07', code: 'SRV-LAB-LFT', name: 'Liver Function Test (LFT Panel)', category: 'Laboratory', price: 850, tax_rate: 0, active: true },
  { id: 'srv-08', code: 'SRV-DIA-ECG', name: '12-Lead Electrocardiogram (ECG)', category: 'Diagnostics', price: 350, tax_rate: 0, active: true },
  { id: 'srv-09', code: 'SRV-DIA-USG', name: 'Whole Abdomen Ultrasound (USG)', category: 'Diagnostics', price: 1400, tax_rate: 0, active: true },
  { id: 'srv-10', code: 'SRV-DIA-ECHO', name: '2D Echocardiography with Color Doppler', category: 'Diagnostics', price: 2200, tax_rate: 0, active: true }
];

export const DEFAULT_INPATIENT_ADMISSIONS = [
  {
    id: 'adm-001',
    admission_number: 'ADM-2026-0048',
    patient_id: 'p-005',
    patient_name: 'Aniruddha Sen',
    patient_uhid: 'UHID-2026-0640',
    admission_date: '2026-10-15T10:15:00',
    discharge_date: null,
    current_ward: 'General Ward Bed 08',
    current_ward_code: 'GEN',
    status: 'admitted',
    admitting_doctor: 'Dr. Arindam Mitra',
    diagnosis: 'Acute Coronary Syndrome post-PCI monitoring',
    stays: [
      {
        id: 'stay-01',
        ward_code: 'ICU',
        ward_name: 'Intensive Care Unit (ICU Bed 02)',
        daily_rate: 5000,
        start_time: '2026-10-15T10:15:00',
        end_time: '2026-10-18T14:30:00'
      },
      {
        id: 'stay-02',
        ward_code: 'GEN',
        ward_name: 'General Ward Bed 08',
        daily_rate: 2000,
        start_time: '2026-10-18T14:30:00',
        end_time: null
      }
    ],
    itemized_charges: [
      { id: 'chg-01', description: 'Daily Doctor ICU Rounds (3 visits)', category: 'Doctor Visits', price: 1200, qty: 3, total: 3600, date: '2026-10-17' },
      { id: 'chg-02', description: 'Daily General Ward Rounds (5 visits)', category: 'Doctor Visits', price: 800, qty: 5, total: 4000, date: '2026-10-22' },
      { id: 'chg-03', description: 'Post-PCI Monitoring Infusions & Pharmacy', category: 'Pharmacy', price: 14200, qty: 1, total: 14200, date: '2026-10-19' },
      { id: 'chg-04', description: 'Bedside Blood Gas Analysis & Cardiac Enzymes', category: 'Laboratory', price: 6200, qty: 1, total: 6200, date: '2026-10-16' }
    ]
  }
];

export const DEFAULT_SEMEN_ANALYSIS_LIMITS = {
  standard_name: 'WHO 6th Edition (2021)',
  volume_ml_min: 1.4,
  ph_min: 7.2,
  concentration_m_per_ml_min: 16.0,
  total_count_m_min: 39.0,
  progressive_motility_pct_min: 30,
  total_motility_pct_min: 42,
  normal_morphology_pct_min: 4.0,
  vitality_pct_min: 54,
  round_cells_m_per_ml_max: 1.0
};

// Initial State Blueprint
export const INITIAL_HOSPITAL_STATE = {
  version: STORAGE_VERSION,
  patients: DEFAULT_PATIENTS,
  departments: DEFAULT_DEPARTMENTS,
  doctors: DEFAULT_DOCTORS,
  roomTariffs: DEFAULT_ROOM_TARIFFS,
  roomBillingPolicy: DEFAULT_ROOM_BILLING_POLICY,
  servicesCatalog: DEFAULT_SERVICES_CATALOG,
  semenAnalysisLimits: DEFAULT_SEMEN_ANALYSIS_LIMITS,
  appointments: [
    {
      id: 'apt-001',
      appointment_number: 'APT-2026-0891',
      patient_id: 'p-001',
      patient_name: 'Devika Sengupta',
      patient_uhid: 'UHID-2026-0814',
      doctor_id: 'doc-01',
      doctor_name: 'Dr. Arindam Mitra',
      doctor_prefix: 'D1',
      department_name: 'Cardiology & Cath Lab',
      appointment_date: new Date().toISOString().slice(0, 10),
      start_time: '10:00',
      visit_type: 'first_visit',
      fee: 800,
      fee_overridden: false,
      override_reason: null,
      advance_paid: 400,
      advance_receipt: 'TXN-APT-0101',
      status: 'booked',
      token_number: null,
      token_display: null,
      notes: 'Initial evaluation for palpitations'
    },
    {
      id: 'apt-002',
      appointment_number: 'APT-2026-0892',
      patient_id: 'p-002',
      patient_name: 'Rajesh Narayan Verma',
      patient_uhid: 'UHID-2026-0922',
      doctor_id: 'doc-02',
      doctor_name: 'Dr. Ananya Sharma',
      doctor_prefix: 'D2',
      department_name: 'Haematology & Transfusion',
      appointment_date: new Date().toISOString().slice(0, 10),
      start_time: '10:30',
      visit_type: 'follow_up',
      fee: 700,
      fee_overridden: false,
      override_reason: null,
      advance_paid: 0,
      advance_receipt: null,
      status: 'booked',
      token_number: null,
      token_display: null,
      notes: 'Review of CBC and iron panel'
    }
  ],
  queueTokens: [
    {
      id: 'tok-001',
      token_number: 1,
      token_display: 'D1-001',
      doctor_id: 'doc-01',
      doctor_name: 'Dr. Arindam Mitra',
      appointment_id: 'apt-prev-01',
      patient_id: 'p-004',
      patient_name: 'Vikramaditya Bose',
      patient_uhid: 'UHID-2026-1180',
      queue_date: new Date().toISOString().slice(0, 10),
      status: 'completed',
      called_at: '09:30 AM',
      completed_at: '09:48 AM',
      is_priority: false
    }
  ],
  notifications: [
    {
      id: 'notif-001',
      appointment_id: 'apt-001',
      patient_name: 'Devika Sengupta',
      recipient_mobile: '9830122410',
      channel: 'whatsapp',
      event_type: 'booking_confirmation',
      message_content: 'Dear Devika, your appointment with Dr. Arindam Mitra (Cardiology) is confirmed for today at 10:00 AM in Chamber 102, Block A. Please check in at reception on arrival. Apex Central Hospital.',
      scheduled_at: new Date(Date.now() - 3600000).toISOString(),
      sent_at: new Date(Date.now() - 3500000).toISOString(),
      status: 'delivered',
      simulated: true
    }
  ],
  bills: [
    {
      id: 'b-001',
      bill_number: 'OPD-2026-0914',
      bill_type: 'OPD',
      patient_id: 'p-001',
      patient_name: 'Devika Sengupta',
      patient_uhid: 'UHID-2026-0814',
      appointment_id: 'apt-001',
      items: [
        { id: 'it-01', name: 'Specialist Consultation Fee', price: 800, qty: 1, discount: 0, tax_rate: 0, total: 800 },
        { id: 'it-02', name: '12-Lead Electrocardiogram (ECG)', price: 350, qty: 1, discount: 0, tax_rate: 0, total: 350 },
        { id: 'it-03', name: 'Complete Blood Count (CBC with ESR)', price: 450, qty: 1, discount: 150, tax_rate: 0, total: 300 }
      ],
      gross_amount: 1600,
      discounts_total: 150,
      taxes_total: 0,
      total_amount: 1450,
      applied_advance_credit: 400,
      applied_deposit_credit: 0,
      net_balance_due: 1050,
      payments_collected: 1050,
      remaining_balance: 0,
      status: 'paid',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  payments: [
    {
      id: 'pay-001',
      receipt_number: 'RCP-2026-0410',
      bill_id: 'b-001',
      patient_id: 'p-001',
      amount: 1050,
      payment_mode: 'UPI',
      txn_ref: 'UPI-REF-2026-9041',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      cashier_id: 'CSH-01',
      status: 'valid'
    }
  ],
  deposits: [
    {
      id: 'dep-001',
      receipt_number: 'DEP-2026-0210',
      patient_id: 'p-004',
      patient_name: 'Vikramaditya Bose',
      patient_uhid: 'UHID-2026-1180',
      admission_id: null,
      original_amount: 25000,
      allocated_amount: 0,
      balance_remaining: 25000,
      payment_mode: 'Credit Card',
      txn_ref: 'CC-TXN-9014',
      purpose: 'Planned Surgery Advance',
      status: 'unutilized',
      created_at: '2026-10-22T09:40:00Z'
    }
  ],
  refunds: [
    {
      id: 'ref-001',
      refund_number: 'REF-2026-0012',
      bill_id: 'b-prev',
      payment_id: 'pay-prev',
      patient_id: 'p-002',
      patient_name: 'Rajesh Narayan Verma',
      patient_uhid: 'UHID-2026-0922',
      original_payment_amount: 800,
      refund_amount: 800,
      reason: 'Duplicate consultation charge paid online during portal timeout',
      status: 'completed',
      reversal_txn_ref: 'SIM-REV-9012',
      created_at: '2026-10-21T14:15:00Z'
    }
  ],
  cashierSettlements: [],
  inpatientAdmissions: DEFAULT_INPATIENT_ADMISSIONS,
  semenAnalyses: [
    {
      id: 'sa-001',
      accession_no: 'SA-2026-0481',
      barcode: 'SA20260481',
      patient_id: 'p-001',
      patient_name: 'Devika Sengupta',
      patient_uhid: 'UHID-2026-0814',
      collection_date: '2026-10-22T09:15:00',
      receipt_date: '2026-10-22T09:30:00',
      collection_method: 'Masturbation on-site (Private Room 3)',
      abstinence_days: 4,
      technician: 'Dr. Priya Nair (Lead Embryologist)',
      volume: 3.2,
      concentration: 48,
      total_count: 153.6,
      progressive_motility: 52,
      non_progressive_motility: 14,
      immotile: 34,
      normal_morphology: 7,
      vitality: 78,
      status: 'finalized',
      comments: 'WHO 6th Edition Normozoospermia pattern. Suitable for IVF/ICSI cycles.',
      amendments: []
    }
  ],
  cryoSpecimens: [
    {
      id: 'cryo-001',
      container_id: 'CRYO-STR-2026-091',
      barcode: 'CRYO091',
      patient_id: 'p-001',
      patient_name: 'Rahul & Devika Sengupta',
      patient_uhid: 'UHID-2026-0814',
      category: 'Autologous Patient Sperm',
      freeze_date: '2026-10-15T11:30:00',
      protocol: 'Standard Slow Freezing',
      cryoprotectant: 'Irvine Scientific SpermFreeze',
      aliquots_stored: 4,
      aliquots_remaining: 3,
      storage_location: {
        tank: 'Tank Alpha (LN2 -196°C)',
        canister: 'Canister 02',
        cane: 'Cane 08',
        goblet: 'Yellow Goblet 10mm',
        straw_ids: ['ST-26-901', 'ST-26-902', 'ST-26-903', 'ST-26-904']
      },
      consent_status: 'Verified (Signed e-Consent valid till 2031)',
      status: 'stored'
    }
  ],
  thawRecords: [
    {
      id: 'thaw-001',
      specimen_id: 'cryo-001',
      container_id: 'CRYO-STR-2026-091',
      straws_thawed: 1,
      thaw_date: '2026-10-20T10:00:00',
      indication: 'OPU Cycle ICSI Insemination (Cycle #IVF-2026-015)',
      operator: 'Dr. Priya Nair',
      consent_verified: true,
      recovery_rate: 72
    }
  ],
  donors: [
    {
      id: 'dnr-001',
      donor_code: 'DONOR-SP-042',
      category: 'Sperm Donor',
      age: 27,
      blood_group: 'B+ (Positive)',
      education: 'Graduate / Professional',
      physical_traits: 'Height: 176 cm, Eyes: Black, Skin: Fair',
      quarantine_status: 'Under 180-Day Quarantine',
      consent_status: 'Signed ART Bank Agreement',
      inventory_vials: 6,
      storage_location: 'Tank Beta / Canister 02',
      status: 'quarantined',
      authorized_payment_amount: 5000,
      payment_status: 'approved_pending_payout'
    }
  ],
  donorPayments: []
};

// ============================================================================
// STORAGE VALIDATION & RECOVERY HELPERS
// ============================================================================

/**
 * Validates that stored state is an object matching the schema structure
 * and containing all required collection keys and expected types.
 */
export function validateHospitalState(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, reason: 'Root state payload must be a non-null object' };
  }

  if (typeof data.version !== 'number') {
    return { isValid: false, reason: 'Missing or non-numeric schema version' };
  }

  if (data.version !== STORAGE_VERSION) {
    return {
      isValid: false,
      reason: `Incompatible schema version: found v${data.version}, expected v${STORAGE_VERSION}`
    };
  }

  const requiredArrayKeys = [
    'patients',
    'departments',
    'doctors',
    'roomTariffs',
    'servicesCatalog',
    'appointments',
    'queueTokens',
    'notifications',
    'bills',
    'payments',
    'deposits',
    'refunds',
    'cashierSettlements',
    'inpatientAdmissions',
    'semenAnalyses',
    'cryoSpecimens',
    'thawRecords',
    'donors',
    'donorPayments'
  ];

  for (const key of requiredArrayKeys) {
    if (!Array.isArray(data[key])) {
      return { isValid: false, reason: `Missing or invalid array collection: '${key}'` };
    }
  }

  if (!data.roomBillingPolicy || typeof data.roomBillingPolicy !== 'object' || Array.isArray(data.roomBillingPolicy)) {
    return { isValid: false, reason: "Missing or invalid object collection: 'roomBillingPolicy'" };
  }

  if (data.semenAnalysisLimits && (typeof data.semenAnalysisLimits !== 'object' || Array.isArray(data.semenAnalysisLimits))) {
    return { isValid: false, reason: "Invalid object collection: 'semenAnalysisLimits'" };
  }

  return { isValid: true };
}

/**
 * Non-destructive quarantine writer.
 * Preserves existing incidents, converts malformed/non-array legacy data into preserved
 * incidents without discarding, deduplicates identical payloads, and reports confirmation.
 */
function saveQuarantineIncident(incident) {
  if (typeof window === 'undefined') {
    return { success: false, items: [incident], error: 'Window object is unavailable' };
  }

  let existingIncidents = [];
  try {
    const oldRaw = window.localStorage.getItem(QUARANTINE_KEY);
    if (oldRaw) {
      try {
        const parsed = JSON.parse(oldRaw);
        if (Array.isArray(parsed)) {
          existingIncidents = parsed;
        } else {
          // If valid JSON but not an array, preserve it as a legacy incident
          existingIncidents = [
            {
              incidentId: `Q-LEGACY-${Date.now()}`,
              timestamp: new Date().toISOString(),
              errorType: 'LEGACY_NON_ARRAY_QUARANTINE',
              rawPayload: oldRaw
            }
          ];
        }
      } catch (parseErr) {
        // If malformed quarantine JSON, preserve raw text as an incident
        existingIncidents = [
          {
            incidentId: `Q-MALFORMED-QUARANTINE-${Date.now()}`,
            timestamp: new Date().toISOString(),
            errorType: 'PREVIOUS_QUARANTINE_PARSE_ERROR',
            parseError: parseErr.message,
            rawPayload: oldRaw
          }
        ];
      }
    }
  } catch (readErr) {
    console.warn('[HospitalState] Failed to read quarantine storage:', readErr);
    return {
      success: false,
      items: existingIncidents,
      error: readErr.message || 'Failed to read quarantine storage'
    };
  }

  // Deduplicate: avoid recording duplicate incidents for identical payload and errorType
  const isDuplicate = existingIncidents.some(
    item => item.rawPayload === incident.rawPayload && item.errorType === incident.errorType
  );

  const updatedIncidents = isDuplicate
    ? existingIncidents
    : [incident, ...existingIncidents];

  try {
    window.localStorage.setItem(QUARANTINE_KEY, JSON.stringify(updatedIncidents));
    return {
      success: true,
      items: updatedIncidents
    };
  } catch (writeErr) {
    console.error('[HospitalState] Failed to write quarantine storage:', writeErr);
    return {
      success: false,
      items: updatedIncidents,
      error: writeErr.message || 'Write error'
    };
  }
}

/**
 * Initial storage evaluator. Runs once synchronously on mount.
 * NEVER overwrites malformed or incompatible primary key during recovery.
 */
function initializeHospitalStorage() {
  if (typeof window === 'undefined') {
    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: false,
      storageWarning: null,
      quarantineData: []
    };
  }

  // Safe storage availability probe
  let storageAccessible = false;
  try {
    const probeKey = '__medicsprime_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    storageAccessible = true;
  } catch {
    storageAccessible = false;
  }

  if (!storageAccessible) {
    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: false,
      storageWarning: {
        type: 'STORAGE_UNAVAILABLE',
        message: 'Browser local storage is disabled or inaccessible in this environment. Operating in memory-only mode; data will not persist across reloads.',
        incidentId: null,
        quarantineConfirmed: false
      },
      quarantineData: []
    };
  }

  // Read existing quarantine log
  let initialQuarantine = [];
  let quarantineReadError = null;
  let quarantineParseWarning = null;
  try {
    const qRaw = window.localStorage.getItem(QUARANTINE_KEY);
    if (qRaw) {
      try {
        const parsedQ = JSON.parse(qRaw);
        if (Array.isArray(parsedQ)) {
          initialQuarantine = parsedQ;
        } else {
          // If valid JSON but not an array, preserve it as a legacy incident
          quarantineParseWarning = 'legacy non-array payload';
          initialQuarantine = [
            {
              incidentId: `Q-LEGACY-${Date.now()}`,
              timestamp: new Date().toISOString(),
              errorType: 'LEGACY_NON_ARRAY_QUARANTINE',
              rawPayload: qRaw
            }
          ];
        }
      } catch (parseErr) {
        // If malformed quarantine JSON, preserve raw text as an incident
        quarantineParseWarning = parseErr.message;
        initialQuarantine = [
          {
            incidentId: `Q-MALFORMED-QUARANTINE-${Date.now()}`,
            timestamp: new Date().toISOString(),
            errorType: 'PREVIOUS_QUARANTINE_PARSE_ERROR',
            parseError: parseErr.message,
            rawPayload: qRaw
          }
        ];
      }
    }
  } catch (readErr) {
    console.warn('[HospitalState] Failed to read quarantine storage on init:', readErr);
    quarantineReadError = readErr.message || 'Access error';
    initialQuarantine = [
      {
        incidentId: `Q-READ-ERROR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        errorType: 'QUARANTINE_STORAGE_READ_ERROR',
        parseError: readErr.message || 'Quarantine storage read failed',
        rawPayload: '[UNREADABLE: LocalStorage read threw exception]'
      }
    ];
  }

  // Read primary storage key
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: false,
      storageWarning: {
        type: 'STORAGE_READ_ERROR',
        message: `Failed to read from local storage: ${err.message || 'Access error'}. Loaded default demo data into memory.`,
        incidentId: null,
        quarantineConfirmed: false
      },
      quarantineData: initialQuarantine
    };
  }

  // Case 1: Genuinely absent key (normal first run)
  if (raw === null) {
    let writeSuccess = false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HOSPITAL_STATE));
      writeSuccess = true;
    } catch {
      writeSuccess = false;
    }

    let warning = null;
    if (!writeSuccess) {
      warning = {
        type: 'INITIAL_WRITE_FAILED',
        message: 'Could not write initial demo data to storage. Running in memory-only mode.',
        incidentId: null,
        quarantineConfirmed: false
      };
    } else if (quarantineReadError) {
      warning = {
        type: 'QUARANTINE_READ_ERROR',
        message: `Quarantine storage could not be read: ${quarantineReadError}. Default demo data initialized in memory.`,
        incidentId: null,
        quarantineConfirmed: false
      };
    } else if (quarantineParseWarning) {
      warning = {
        type: 'QUARANTINE_CORRUPTED',
        message: `Quarantine storage contains malformed or unparsed data (${quarantineParseWarning}). Preserved in quarantine inspection list.`,
        incidentId: initialQuarantine[0]?.incidentId || null,
        quarantineConfirmed: true
      };
    }

    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: writeSuccess,
      storageWarning: warning,
      quarantineData: initialQuarantine
    };
  }

  // Case 2: Parse raw payload
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (syntaxErr) {
    console.warn('[HospitalState] Malformed JSON in localStorage. Preserving raw key and recording quarantine.');
    const incident = {
      incidentId: `Q-SYNTAX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      errorType: 'MALFORMED_JSON_SYNTAX',
      parseError: syntaxErr.message,
      rawPayload: raw
    };

    const qResult = saveQuarantineIncident(incident);
    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: false, // Ineligible for persistence: MUST NOT overwrite corrupted primary key!
      storageWarning: {
        type: 'MALFORMED_JSON_SYNTAX',
        message: qResult.success
          ? 'Stored prototype demo data contains malformed JSON syntax. Clean seed state loaded into memory; raw payload preserved in storage and quarantine.'
          : 'Stored prototype demo data contains malformed JSON syntax. Clean seed state loaded into memory; raw payload preserved in primary key, but quarantine write could not be confirmed.',
        incidentId: incident.incidentId,
        quarantineConfirmed: qResult.success
      },
      quarantineData: qResult.items
    };
  }

  // Case 3: Validate schema version and collections
  const validation = validateHospitalState(parsed);
  if (!validation.isValid) {
    console.warn(`[HospitalState] Incompatible schema or structure: ${validation.reason}. Preserving raw key and recording quarantine.`);
    const incident = {
      incidentId: `Q-SCHEMA-${Date.now()}`,
      timestamp: new Date().toISOString(),
      errorType: 'INCOMPATIBLE_SCHEMA',
      validationError: validation.reason,
      versionFound: parsed?.version,
      rawPayload: raw
    };

    const qResult = saveQuarantineIncident(incident);
    return {
      state: INITIAL_HOSPITAL_STATE,
      isPersistenceEligible: false, // Ineligible for persistence: MUST NOT overwrite incompatible primary key!
      storageWarning: {
        type: 'INCOMPATIBLE_SCHEMA',
        message: qResult.success
          ? `Stored demo data schema is incompatible (${validation.reason}). Clean seed state loaded into memory; raw payload preserved in storage and quarantine.`
          : `Stored demo data schema is incompatible (${validation.reason}). Clean seed state loaded into memory; raw payload preserved in primary key, but quarantine write could not be confirmed (${qResult.error || 'write error'}).`,
        incidentId: incident.incidentId,
        quarantineConfirmed: qResult.success
      },
      quarantineData: qResult.items
    };
  }

  // Case 4: Perfectly valid stored state
  let warningForCase4 = null;
  if (quarantineReadError) {
    warningForCase4 = {
      type: 'QUARANTINE_READ_ERROR',
      message: `Quarantine storage could not be read: ${quarantineReadError}. Active demo data loaded, but quarantine records could not be inspected.`,
      incidentId: null,
      quarantineConfirmed: false
    };
  } else if (quarantineParseWarning) {
    warningForCase4 = {
      type: 'QUARANTINE_CORRUPTED',
      message: `Quarantine storage contains malformed or unparsed data (${quarantineParseWarning}). Preserved in quarantine inspection list.`,
      incidentId: initialQuarantine[0]?.incidentId || null,
      quarantineConfirmed: true
    };
  }

  return {
    state: parsed,
    isPersistenceEligible: true,
    storageWarning: warningForCase4,
    quarantineData: initialQuarantine
  };
}

// ============================================================================
// CONTEXT CREATION & PROVIDER
// ============================================================================

const HospitalStateContext = createContext(null);

export function HospitalStateProvider({ children }) {
  // Synchronous initialization once on component creation
  const [initResult] = useState(() => initializeHospitalStorage());

  const [state, setState] = useState(initResult.state);
  const [isPersistenceEligible, setIsPersistenceEligible] = useState(initResult.isPersistenceEligible);
  const [storageWarning, setStorageWarning] = useState(initResult.storageWarning);
  const [quarantineData, setQuarantineData] = useState(initResult.quarantineData);

  // Sync state changes to localStorage ONLY when persistence is explicitly eligible
  useEffect(() => {
    if (!isPersistenceEligible) return;
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[HospitalState] Failed to persist state to localStorage:', e);
      // Immediately pause automatic persistence to avoid repeated write failures or render loops
      setIsPersistenceEligible(false);
      setStorageWarning({
        type: 'PERSISTENCE_FAILED',
        message: `Failed to persist state updates to local storage: ${e.message || 'Write error'}. Changes remain active in memory. Automatic persistence is paused until reset or retried.`,
        incidentId: null,
        quarantineConfirmed: false
      });
    }
  }, [state, isPersistenceEligible]);

  // Explicit persistence retry action
  const retryPersistence = useCallback(() => {
    // Refuse retry if current warning indicates preserved corrupted or incompatible storage.
    // Reset Demo Data remains the exclusive intentional recovery path.
    if (storageWarning && (storageWarning.type === 'MALFORMED_JSON_SYNTAX' || storageWarning.type === 'INCOMPATIBLE_SCHEMA')) {
      return {
        success: false,
        error: 'Cannot retry persistence while corrupted or incompatible storage is preserved. Please use Reset Demo Data to reinitialize clean storage.'
      };
    }

    if (typeof window === 'undefined' || !window.localStorage) {
      setStorageWarning({
        type: 'STORAGE_UNAVAILABLE',
        message: 'Browser local storage is not available in this environment.',
        incidentId: null,
        quarantineConfirmed: false
      });
      return { success: false, error: 'Storage unavailable' };
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setIsPersistenceEligible(true);
      setStorageWarning(null);
      return { success: true };
    } catch (err) {
      console.warn('[HospitalState] Retry persistence failed:', err);
      setIsPersistenceEligible(false);
      setStorageWarning({
        type: 'PERSISTENCE_FAILED',
        message: `Persistence retry failed: ${err.message || 'Write error'}. Changes remain active in memory.`,
        incidentId: null,
        quarantineConfirmed: false
      });
      return { success: false, error: err.message || 'Write error' };
    }
  }, [state, storageWarning]);

  // ============================================================================
  // SCOPED RESET ACTION (FAILURE-SAFE WITH BEST-EFFORT ROLLBACK)
  // Strictly resets ONLY medicsprime_hms_demo_v1 and its quarantine key.
  // ============================================================================
  const resetDemoData = useCallback(() => {
    // 1. Validate localStorage accessibility before modifying anything
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: 'Browser local storage is not available in this environment.'
      };
    }

    // Writability probe test
    try {
      const probeKey = '__medicsprime_probe__';
      window.localStorage.setItem(probeKey, '1');
      window.localStorage.removeItem(probeKey);
    } catch (probeErr) {
      return {
        success: false,
        error: `Local storage is not writable: ${probeErr.message || 'Write permission denied'}`
      };
    }

    // 2. Prepare and serialize the initial seed BEFORE modifying storage
    let serializedSeed;
    try {
      serializedSeed = JSON.stringify(INITIAL_HOSPITAL_STATE);
      const parsedSeedCheck = JSON.parse(serializedSeed);
      const valCheck = validateHospitalState(parsedSeedCheck);
      if (!valCheck.isValid) {
        throw new Error(`Seed validation check failed: ${valCheck.reason}`);
      }
    } catch (prepErr) {
      return {
        success: false,
        error: `Failed to prepare clean seed data: ${prepErr.message}`
      };
    }

    // 3. Preserve existing primary and quarantine values for best-effort rollback
    let prevPrimary = null;
    let prevQuarantine = null;
    try {
      prevPrimary = window.localStorage.getItem(STORAGE_KEY);
      prevQuarantine = window.localStorage.getItem(QUARANTINE_KEY);
    } catch (readErr) {
      return {
        success: false,
        error: `Failed to backup existing storage prior to reset: ${readErr.message}`
      };
    }

    // 4. Perform scoped reset with best-effort rollback on failure
    let rollbackNeeded = true;
    try {
      // Step A: Write the verified serialized seed to primary demo key
      window.localStorage.setItem(STORAGE_KEY, serializedSeed);

      // Step B: Remove quarantine key if it existed
      if (prevQuarantine !== null) {
        window.localStorage.removeItem(QUARANTINE_KEY);
      }

      // Step C: Verify written primary seed is present and passes full validation
      const verifyRaw = window.localStorage.getItem(STORAGE_KEY);
      if (!verifyRaw) {
        throw new Error('Primary storage key was not retained after write.');
      }
      const verifyParsed = JSON.parse(verifyRaw);
      const verifyVal = validateHospitalState(verifyParsed);
      if (!verifyVal.isValid) {
        throw new Error(`Verification of reset seed failed: ${verifyVal.reason}`);
      }

      // Success: update React state, clear warnings/quarantine, and enable persistence
      setState(INITIAL_HOSPITAL_STATE);
      setIsPersistenceEligible(true);
      setStorageWarning(null);
      setQuarantineData([]);
      return { success: true };
    } catch (writeErr) {
      console.error('[HospitalState] Reset demo data failed during storage operations:', writeErr);

      // Best-effort rollback
      let rollbackError = null;
      if (rollbackNeeded) {
        try {
          if (prevPrimary !== null) {
            window.localStorage.setItem(STORAGE_KEY, prevPrimary);
          } else {
            window.localStorage.removeItem(STORAGE_KEY);
          }
          if (prevQuarantine !== null) {
            window.localStorage.setItem(QUARANTINE_KEY, prevQuarantine);
          } else {
            window.localStorage.removeItem(QUARANTINE_KEY);
          }
        } catch (rbErr) {
          console.error('[HospitalState] Critical: Rollback also failed after reset failure:', rbErr);
          rollbackError = rbErr;
        }
      }

      // Retain current in-memory state and recovery warning, and report error honestly
      return {
        success: false,
        error: rollbackError
          ? `Reset failed: ${writeErr.message}. Best-effort rollback also failed: ${rollbackError.message}.`
          : `Reset failed: ${writeErr.message}. Previous storage values were restored via best-effort rollback.`
      };
    }
  }, []);

  const dismissStorageWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);

  // ============================================================================
  // STATE MUTATION HELPERS
  // ============================================================================
  const updatePatients = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      patients: typeof updater === 'function' ? updater(prev.patients) : updater
    }));
  }, []);

  const updateAppointments = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      appointments: typeof updater === 'function' ? updater(prev.appointments) : updater
    }));
  }, []);

  const updateQueueTokens = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      queueTokens: typeof updater === 'function' ? updater(prev.queueTokens) : updater
    }));
  }, []);

  const updateNotifications = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      notifications: typeof updater === 'function' ? updater(prev.notifications) : updater
    }));
  }, []);

  const updateBills = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      bills: typeof updater === 'function' ? updater(prev.bills) : updater
    }));
  }, []);

  const updatePayments = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      payments: typeof updater === 'function' ? updater(prev.payments) : updater
    }));
  }, []);

  const updateDeposits = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      deposits: typeof updater === 'function' ? updater(prev.deposits) : updater
    }));
  }, []);

  const updateRefunds = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      refunds: typeof updater === 'function' ? updater(prev.refunds) : updater
    }));
  }, []);

  const updateCashierSettlements = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      cashierSettlements: typeof updater === 'function' ? updater(prev.cashierSettlements) : updater
    }));
  }, []);

  const updateDoctors = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      doctors: typeof updater === 'function' ? updater(prev.doctors) : updater
    }));
  }, []);

  const updateDepartments = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      departments: typeof updater === 'function' ? updater(prev.departments) : updater
    }));
  }, []);

  const updateRoomTariffs = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      roomTariffs: typeof updater === 'function' ? updater(prev.roomTariffs) : updater
    }));
  }, []);

  const updateRoomBillingPolicy = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      roomBillingPolicy: typeof updater === 'function' ? updater(prev.roomBillingPolicy) : updater
    }));
  }, []);

  const updateInpatientAdmissions = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      inpatientAdmissions: typeof updater === 'function' ? updater(prev.inpatientAdmissions) : updater
    }));
  }, []);

  const updateSemenAnalyses = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      semenAnalyses: typeof updater === 'function' ? updater(prev.semenAnalyses) : updater
    }));
  }, []);

  const updateCryoSpecimens = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      cryoSpecimens: typeof updater === 'function' ? updater(prev.cryoSpecimens) : updater
    }));
  }, []);

  const updateThawRecords = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      thawRecords: typeof updater === 'function' ? updater(prev.thawRecords) : updater
    }));
  }, []);

  const updateDonors = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      donors: typeof updater === 'function' ? updater(prev.donors) : updater
    }));
  }, []);

  const updateDonorPayments = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      donorPayments: typeof updater === 'function' ? updater(prev.donorPayments) : updater
    }));
  }, []);

  const updateSemenAnalysisLimits = useCallback((updater) => {
    setState(prev => ({
      ...prev,
      semenAnalysisLimits: typeof updater === 'function' ? updater(prev.semenAnalysisLimits || DEFAULT_SEMEN_ANALYSIS_LIMITS) : updater
    }));
  }, []);

  const contextValue = useMemo(() => ({
    // Collections
    patients: state.patients,
    departments: state.departments,
    doctors: state.doctors,
    roomTariffs: state.roomTariffs,
    roomBillingPolicy: state.roomBillingPolicy,
    servicesCatalog: state.servicesCatalog,
    semenAnalysisLimits: state.semenAnalysisLimits || DEFAULT_SEMEN_ANALYSIS_LIMITS,
    appointments: state.appointments,
    queueTokens: state.queueTokens,
    notifications: state.notifications,
    bills: state.bills,
    payments: state.payments,
    deposits: state.deposits,
    refunds: state.refunds,
    cashierSettlements: state.cashierSettlements,
    inpatientAdmissions: state.inpatientAdmissions,
    semenAnalyses: state.semenAnalyses,
    cryoSpecimens: state.cryoSpecimens,
    thawRecords: state.thawRecords,
    donors: state.donors,
    donorPayments: state.donorPayments,

    // Mutation Setters
    updatePatients,
    updateAppointments,
    updateQueueTokens,
    updateNotifications,
    updateBills,
    updatePayments,
    updateDeposits,
    updateRefunds,
    updateCashierSettlements,
    updateDoctors,
    updateDepartments,
    updateRoomTariffs,
    updateRoomBillingPolicy,
    updateInpatientAdmissions,
    updateSemenAnalyses,
    updateSemenAnalysisLimits,
    updateCryoSpecimens,
    updateThawRecords,
    updateDonors,
    updateDonorPayments,

    // Storage Management
    storageWarning,
    quarantineData,
    isPersistenceEligible,
    resetDemoData,
    retryPersistence,
    dismissStorageWarning
  }), [
    state,
    storageWarning,
    quarantineData,
    isPersistenceEligible,
    updatePatients,
    updateAppointments,
    updateQueueTokens,
    updateNotifications,
    updateBills,
    updatePayments,
    updateDeposits,
    updateRefunds,
    updateCashierSettlements,
    updateDoctors,
    updateDepartments,
    updateRoomTariffs,
    updateRoomBillingPolicy,
    updateInpatientAdmissions,
    updateSemenAnalyses,
    updateSemenAnalysisLimits,
    updateCryoSpecimens,
    updateThawRecords,
    updateDonors,
    updateDonorPayments,
    resetDemoData,
    retryPersistence,
    dismissStorageWarning
  ]);

  return (
    <HospitalStateContext.Provider value={contextValue}>
      {children}
    </HospitalStateContext.Provider>
  );
}

export function useHospitalState() {
  const context = useContext(HospitalStateContext);
  if (!context) {
    throw new Error('useHospitalState must be used within a HospitalStateProvider');
  }
  return context;
}
