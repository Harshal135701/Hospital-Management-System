/**
 * MedicsPrime Day Care & Ambulatory Surgery Demo Data
 */

export const DAYCARE_PACKAGES = [
  {
    id: 'pkg-01',
    code: 'DC-CATARACT',
    name: 'Cataract Phacoemulsification with Foldable IOL',
    department: 'Ophthalmology',
    durationMinutes: 90,
    basePrice: 28500,
    breakdown: {
      theatreCharge: 8500,
      implantConsumables: 11000,
      surgeonFee: 7000,
      daycareRecovery: 2000
    },
    preOpInstructions: 'Fasting from 06:00 AM. Instill prescribed antibiotic eye drops 2 hours prior to arrival.'
  },
  {
    id: 'pkg-02',
    code: 'DC-ENDOSCOPY',
    name: 'Upper GI Diagnostic Endoscopy & Biopsy',
    department: 'Gastroenterology',
    durationMinutes: 60,
    basePrice: 9500,
    breakdown: {
      theatreCharge: 3500,
      implantConsumables: 2500,
      surgeonFee: 2500,
      daycareRecovery: 1000
    },
    preOpInstructions: 'Strict NPO (no liquids or solid food) for at least 8 hours prior to procedure.'
  },
  {
    id: 'pkg-03',
    code: 'DC-CHEMO-DAY',
    name: 'Chemotherapy Infusion Cycle (Short Protocol)',
    department: 'Medical Oncology',
    durationMinutes: 180,
    basePrice: 16500,
    breakdown: {
      theatreCharge: 1500,
      implantConsumables: 4500,
      surgeonFee: 6500,
      daycareRecovery: 4000
    },
    preOpInstructions: 'CBC and Creatinine test reports must be validated by oncologist prior to drug reconstitution.'
  },
  {
    id: 'pkg-04',
    code: 'DC-HEMODIALYSIS',
    name: 'Maintenance Hemodialysis (4-Hour Session)',
    department: 'Nephrology',
    durationMinutes: 240,
    basePrice: 3200,
    breakdown: {
      theatreCharge: 500,
      implantConsumables: 1500,
      surgeonFee: 600,
      daycareRecovery: 600
    },
    preOpInstructions: 'Weigh in on arrival. Confirm vascular access patency (AV fistula thrill).'
  },
  {
    id: 'pkg-05',
    code: 'DC-ARTHRO-KNEE',
    name: 'Diagnostic Knee Arthroscopy & Meniscal Debridement',
    department: 'Orthopaedics',
    durationMinutes: 120,
    basePrice: 34000,
    breakdown: {
      theatreCharge: 12000,
      implantConsumables: 9500,
      surgeonFee: 9500,
      daycareRecovery: 3000
    },
    preOpInstructions: 'NPO for 6 hours. Pre-op surgical leg scrubbing. Arrange adult escort for home discharge.'
  }
];

export const INITIAL_CHAIRS = [
  { id: 'ch-01', code: 'REC-01', name: 'Recliner Station 01', type: 'recliner', zone: 'Chemotherapy Lounge', status: 'occupied', is_active: true, admissionId: 'adm-101' },
  { id: 'ch-02', code: 'REC-02', name: 'Recliner Station 02', type: 'recliner', zone: 'Chemotherapy Lounge', status: 'available', is_active: true, admissionId: null },
  { id: 'ch-03', code: 'REC-03', name: 'Recliner Station 03', type: 'recliner', zone: 'Chemotherapy Lounge', status: 'reserved', is_active: true, admissionId: 'adm-104' },
  { id: 'ch-04', code: 'REC-04', name: 'Recliner Station 04', type: 'recliner', zone: 'Chemotherapy Lounge', status: 'available', is_active: true, admissionId: null },
  { id: 'ch-05', code: 'DIA-01', name: 'Dialysis Station 01', type: 'dialysis_chair', zone: 'Hemodialysis Suite', status: 'occupied', is_active: true, admissionId: 'adm-102' },
  { id: 'ch-06', code: 'DIA-02', name: 'Dialysis Station 02', type: 'dialysis_chair', zone: 'Hemodialysis Suite', status: 'available', is_active: true, admissionId: null },
  { id: 'ch-07', code: 'DIA-03', name: 'Dialysis Station 03', type: 'dialysis_chair', zone: 'Hemodialysis Suite', status: 'cleaning', is_active: true, admissionId: null },
  { id: 'ch-08', code: 'BED-01', name: 'Day Care Bed 01', type: 'bed', zone: 'Surgical Recovery Bay', status: 'occupied', is_active: true, admissionId: 'adm-103' },
  { id: 'ch-09', code: 'BED-02', name: 'Day Care Bed 02', type: 'bed', zone: 'Surgical Recovery Bay', status: 'available', is_active: true, admissionId: null },
  { id: 'ch-10', code: 'BED-03', name: 'Day Care Bed 03', type: 'bed', zone: 'Surgical Recovery Bay', status: 'cleaning', is_active: true, admissionId: null },
  { id: 'ch-11', code: 'BED-04', name: 'Day Care Bed 04', type: 'bed', zone: 'Surgical Recovery Bay', status: 'reserved', is_active: true, admissionId: 'adm-105' },
  { id: 'ch-12', code: 'BED-05', name: 'Day Care Bed 05', type: 'bed', zone: 'Surgical Recovery Bay', status: 'available', is_active: true, admissionId: null }
];

export const INITIAL_ADMISSIONS = [
  {
    id: 'adm-101',
    admission_number: 'DCA-2026-0041',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    patient_gender: 'Male',
    patient_age: 52,
    doctor_id: 'doc-04',
    doctor_name: 'Dr. Sunita Rao',
    chair_id: 'ch-01',
    chair_name: 'Recliner Station 01',
    procedure_name: 'Chemotherapy Infusion Cycle (Short Protocol)',
    procedure_date: new Date().toISOString().slice(0, 10),
    planned_duration_minutes: 180,
    status: 'recovering',
    admitted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    discharged_at: null,
    billing_cleared: true,
    total_package_cost: 16500,
    monitoring_records: [
      {
        id: 'mon-01',
        monitored_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        pulse_rate: 76,
        systolic_bp: 122,
        diastolic_bp: 78,
        oxygen_saturation: 99,
        respiratory_rate: 16,
        temperature: '36.7',
        anesthesia_type: 'Sedation / Local',
        sedation_score: 'Awake & Cooperative (RASS 0)',
        adverse_events: 'None reported',
        surgical_checklist_signed: true,
        notes: 'Pre-medication antiemetic Ondansetron 8mg IV given. Infusion started at 50 mL/hr.'
      },
      {
        id: 'mon-02',
        monitored_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        pulse_rate: 80,
        systolic_bp: 126,
        diastolic_bp: 82,
        oxygen_saturation: 98,
        respiratory_rate: 17,
        temperature: '36.8',
        anesthesia_type: 'Sedation / Local',
        sedation_score: 'Awake & Cooperative (RASS 0)',
        adverse_events: 'Mild warmth sensation, resolved spontaneously',
        surgical_checklist_signed: true,
        notes: 'Infusion completed. Flushed with Normal Saline. Vital signs stable.'
      }
    ],
    discharge_summary: {
      aldrete_score: 10,
      padss_score: 9,
      recovery_observations: 'Patient ambulatory, tolerating oral fluids without nausea. Vital signs within normal baseline.',
      discharge_condition: 'Stable for Home Discharge',
      home_medications: 'Tab Ondansetron 8mg PRN for nausea. Hydration 2.5L daily.',
      follow_up_date: new Date(Date.now() + 7 * 86400 * 1000).toISOString().slice(0, 10),
      consultant_approved: true,
      approved_by: 'Dr. Sunita Rao',
      approved_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'adm-102',
    admission_number: 'DCA-2026-0042',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    patient_gender: 'Female',
    patient_age: 44,
    doctor_id: 'doc-02',
    doctor_name: 'Dr. Arindam Mitra',
    chair_id: 'ch-05',
    chair_name: 'Dialysis Station 01',
    procedure_name: 'Maintenance Hemodialysis (4-Hour Session)',
    procedure_date: new Date().toISOString().slice(0, 10),
    planned_duration_minutes: 240,
    status: 'in_procedure',
    admitted_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    discharged_at: null,
    billing_cleared: true,
    total_package_cost: 3200,
    monitoring_records: [
      {
        id: 'mon-03',
        monitored_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        pulse_rate: 82,
        systolic_bp: 138,
        diastolic_bp: 88,
        oxygen_saturation: 97,
        respiratory_rate: 18,
        temperature: '36.9',
        anesthesia_type: 'None',
        sedation_score: 'Alert',
        adverse_events: 'None',
        surgical_checklist_signed: true,
        notes: 'Pre-dialysis weight 64.2 kg. Target ultrafiltration 2.1L. Blood flow rate 250 mL/min.'
      }
    ],
    discharge_summary: null
  },
  {
    id: 'adm-103',
    admission_number: 'DCA-2026-0043',
    patient_id: 'p-03',
    patient_name: 'Amitabh Sen',
    patient_uhid: 'UHID-2026-0348',
    patient_gender: 'Male',
    patient_age: 63,
    doctor_id: 'doc-03',
    doctor_name: 'Dr. Pradeep K. Sharma',
    chair_id: 'ch-08',
    chair_name: 'Day Care Bed 01',
    procedure_name: 'Cataract Phacoemulsification with Foldable IOL',
    procedure_date: new Date().toISOString().slice(0, 10),
    planned_duration_minutes: 90,
    status: 'recovering',
    admitted_at: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    discharged_at: null,
    billing_cleared: false,
    total_package_cost: 28500,
    monitoring_records: [
      {
        id: 'mon-04',
        monitored_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        pulse_rate: 72,
        systolic_bp: 130,
        diastolic_bp: 84,
        oxygen_saturation: 99,
        respiratory_rate: 15,
        temperature: '36.6',
        anesthesia_type: 'Peribulbar Block / Topical',
        sedation_score: 'Awake',
        adverse_events: 'None',
        surgical_checklist_signed: true,
        notes: 'Procedure uneventful. Eye patch secure. Resting comfortably in recovery bed.'
      }
    ],
    discharge_summary: {
      aldrete_score: 9,
      padss_score: 9,
      recovery_observations: 'Post-cataract phaco recovery satisfactory. No ocular pain or hyphema.',
      discharge_condition: 'Stable for Home Discharge',
      home_medications: 'Moxifloxacin eye drops 1 drop QID. Prednisolone acetate drops 1 drop QID. Protective eye shield at night.',
      follow_up_date: new Date(Date.now() + 1 * 86400 * 1000).toISOString().slice(0, 10),
      consultant_approved: false,
      approved_by: null,
      approved_at: null
    }
  }
];
