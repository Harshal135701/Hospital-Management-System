/**
 * MedicsPrime EMR & Clinical Records Demo Data, Drug Formulary & ICD-10 Lexicon
 */

export const HOSPITAL_FORMULARY = [
  {
    id: 'med-01',
    name: 'Paracetamol (Acetaminophen)',
    brand: 'Dolo / Calpol',
    formulation: 'Tablet',
    strength: '650 mg',
    category: 'Analgesic / Antipyretic',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'TID (Thrice Daily)',
    defaultDuration: '5 Days',
    foodInstruction: 'After meals'
  },
  {
    id: 'med-02',
    name: 'Amoxicillin + Potassium Clavulanate',
    brand: 'Augmentin / Clavam',
    formulation: 'Tablet',
    strength: '625 mg',
    category: 'Antibiotic (Beta-lactam)',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'BD (Twice Daily)',
    defaultDuration: '7 Days',
    foodInstruction: 'With food'
  },
  {
    id: 'med-03',
    name: 'Pantoprazole Sodium',
    brand: 'Pan-40 / Pantocid',
    formulation: 'Tablet',
    strength: '40 mg',
    category: 'Proton Pump Inhibitor (PPI)',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'OD (Once Daily)',
    defaultDuration: '14 Days',
    foodInstruction: 'Before breakfast'
  },
  {
    id: 'med-04',
    name: 'Metformin Hydrochloride',
    brand: 'Glycomet / Glucophage',
    formulation: 'Tablet (SR)',
    strength: '500 mg',
    category: 'Oral Antidiabetic (Biguanide)',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'BD (Twice Daily)',
    defaultDuration: '30 Days',
    foodInstruction: 'After meals'
  },
  {
    id: 'med-05',
    name: 'Atorvastatin Calcium',
    brand: 'Atorva / Lipitor',
    formulation: 'Tablet',
    strength: '20 mg',
    category: 'Lipid Lowering (Statin)',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'HS (At Bedtime)',
    defaultDuration: '30 Days',
    foodInstruction: 'At night'
  },
  {
    id: 'med-06',
    name: 'Ondansetron Hydrochloride',
    brand: 'Emeset / Zofran',
    formulation: 'Tablet / Orally Disintegrating',
    strength: '4 mg',
    category: 'Antiemetic (5-HT3 Antagonist)',
    defaultDosage: '1 Tablet',
    defaultFrequency: 'PRN (As Needed)',
    defaultDuration: '3 Days',
    foodInstruction: '30 min before food'
  },
  {
    id: 'med-07',
    name: 'Ceftriaxone Sodium',
    brand: 'Monocef',
    formulation: 'IV Infusion / Injection',
    strength: '1 g',
    category: 'Cephalosporin Antibiotic (3rd Gen)',
    defaultDosage: '1 Vial IV',
    defaultFrequency: 'BD (Twice Daily)',
    defaultDuration: '5 Days',
    foodInstruction: 'IV slow push over 30 min'
  },
  {
    id: 'med-08',
    name: 'Salbutamol (Albuterol) Inhaler',
    brand: 'Asthalin Inhaler',
    formulation: 'Metered Dose Inhaler (MDI)',
    strength: '100 mcg/puff',
    category: 'Bronchodilator (Beta-2 Agonist)',
    defaultDosage: '2 Puffs',
    defaultFrequency: 'PRN (As Needed)',
    defaultDuration: '30 Days',
    foodInstruction: 'Inhalation via spacer'
  }
];

export const ICD10_LEXICON = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine & Metabolic' },
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'M54.5', description: 'Low back pain, unspecified', category: 'Musculoskeletal' },
  { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', category: 'Gastrointestinal' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory' },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal' },
  { code: 'R10.9', description: 'Abdominal pain, unspecified', category: 'Symptoms & Signs' },
  { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Infectious Diseases' }
];

export const INITIAL_PRESCRIPTIONS = [
  {
    id: 'rx-01',
    rx_number: 'RX-2026-0814',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    doctor_name: 'Dr. Sunita Rao',
    doctor_qualification: 'MD (Internal Medicine)',
    department: 'General Medicine',
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    status: 'active',
    is_dispensed: false,
    items: [
      {
        id: 'rxi-01',
        medication_name: 'Amoxicillin + Potassium Clavulanate (Augmentin)',
        formulation: 'Tablet',
        strength: '625 mg',
        dosage: '1 Tablet',
        frequency: 'BD (Twice Daily)',
        duration: '7 Days',
        food_instruction: 'With food',
        total_quantity: 14,
        instructions: 'Complete entire 7-day course. Do not skip doses.'
      },
      {
        id: 'rxi-02',
        medication_name: 'Pantoprazole Sodium (Pan-40)',
        formulation: 'Tablet',
        strength: '40 mg',
        dosage: '1 Tablet',
        frequency: 'OD (Once Daily)',
        duration: '10 Days',
        food_instruction: 'Before breakfast',
        total_quantity: 10,
        instructions: 'Take 30 minutes before morning meal with plain water.'
      },
      {
        id: 'rxi-03',
        medication_name: 'Paracetamol (Dolo)',
        formulation: 'Tablet',
        strength: '650 mg',
        dosage: '1 Tablet',
        frequency: 'PRN (As Needed for fever > 100°F)',
        duration: '5 Days',
        food_instruction: 'After food',
        total_quantity: 10,
        instructions: 'Max 3 tablets in 24 hours. Maintain 6-hour gap.'
      }
    ],
    doctor_notes: 'Hydrate well with 2.5L fluids daily. Review in OPD after 7 days.'
  },
  {
    id: 'rx-02',
    rx_number: 'RX-2026-0922',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    doctor_name: 'Dr. Arindam Mitra',
    doctor_qualification: 'DM (Cardiology)',
    department: 'Cardiology',
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    status: 'dispensed',
    is_dispensed: true,
    items: [
      {
        id: 'rxi-04',
        medication_name: 'Metformin Hydrochloride (Glycomet SR)',
        formulation: 'Tablet (SR)',
        strength: '500 mg',
        dosage: '1 Tablet',
        frequency: 'BD (Twice Daily)',
        duration: '30 Days',
        food_instruction: 'After meals',
        total_quantity: 60,
        instructions: 'Monitor fasting blood glucose bi-weekly.'
      },
      {
        id: 'rxi-05',
        medication_name: 'Atorvastatin Calcium (Atorva)',
        formulation: 'Tablet',
        strength: '20 mg',
        dosage: '1 Tablet',
        frequency: 'HS (At Bedtime)',
        duration: '30 Days',
        food_instruction: 'At night',
        total_quantity: 30,
        instructions: 'Take at night after dinner.'
      }
    ],
    doctor_notes: 'Strict low salt (<2g/day) cardiac diet. Regular morning walking.'
  }
];

export const INITIAL_DIAGNOSES = [
  {
    id: 'diag-01',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    icd10_code: 'I10',
    description: 'Essential (primary) hypertension',
    type: 'Primary',
    status: 'active',
    onset_date: '2024-03-12',
    notes: 'Well controlled on single agent therapy.',
    diagnosed_by: 'Dr. Sunita Rao'
  },
  {
    id: 'diag-02',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    icd10_code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    type: 'Secondary',
    status: 'active',
    onset_date: '2025-01-20',
    notes: 'HbA1c 7.2%. On oral hypoglycemic agents.',
    diagnosed_by: 'Dr. Sunita Rao'
  },
  {
    id: 'diag-03',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    icd10_code: 'N18.5',
    description: 'Chronic kidney disease, stage 5 (ESRD)',
    type: 'Primary',
    status: 'active',
    onset_date: '2023-08-14',
    notes: 'On maintenance hemodialysis twice weekly via left radiocephalic AV fistula.',
    diagnosed_by: 'Dr. Arindam Mitra'
  }
];

export const INITIAL_TIMELINE_EVENTS = [
  {
    id: 'tl-01',
    patient_id: 'p-01',
    event_type: 'CONSULTATION',
    title: 'Outpatient General Medicine Consultation',
    department: 'General Medicine',
    clinician: 'Dr. Sunita Rao',
    timestamp: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    badgeVariant: 'teal',
    summary: 'Patient presented with low-grade fever, sore throat and dry cough for 3 days. Chest clear on auscultation. Vitals: BP 124/82, HR 78, SpO2 99%.',
    metadata: {
      prescriptionNumber: 'RX-2026-0814',
      primaryDiagnosis: 'J06.9 Acute upper respiratory infection'
    }
  },
  {
    id: 'tl-02',
    patient_id: 'p-01',
    event_type: 'LABORATORY',
    title: 'Diagnostic Blood Pathology: CBC & CRP',
    department: 'Pathology & Haematology',
    clinician: 'Dr. Meenakshi Sundaram',
    timestamp: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    badgeVariant: 'info',
    summary: 'Hemoglobin: 13.8 g/dL • TLC: 8,400 /uL • Platelets: 2.45 Lakhs • CRP: 6.2 mg/L (Mild elevation).',
    metadata: {
      reportId: 'LAB-2026-9921',
      status: 'Pathologist Verified'
    }
  },
  {
    id: 'tl-03',
    patient_id: 'p-01',
    event_type: 'DAYCARE',
    title: 'Day Care Ambulatory Infusion Protocol',
    department: 'Medical Oncology Day Care',
    clinician: 'Dr. Sunita Rao',
    timestamp: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    badgeVariant: 'warning',
    summary: 'Station REC-01 Chemotherapy cycle completed uneventfully. Vitals stable throughout 3-hour stay. Aldrete recovery score: 10/10.',
    metadata: {
      episodeNumber: 'DCA-2026-0041',
      dischargeCondition: 'Stable for Home Discharge'
    }
  },
  {
    id: 'tl-04',
    patient_id: 'p-01',
    event_type: 'DOCUMENT',
    title: 'Clinical Document Upload: Previous ECG & Echo Report',
    department: 'Cardiology Records',
    clinician: 'Uploaded by Staff Nurse',
    timestamp: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
    badgeVariant: 'gray',
    summary: 'Transthoracic 2D Echocardiogram: LVEF 60%, normal chamber dimensions, trace mitral regurgitation.',
    metadata: {
      fileName: 'echo_report_2026.pdf',
      category: 'Diagnostic Radiology / Imaging'
    }
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-01',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    title: '2D Echocardiography & Color Doppler Report',
    category: 'Diagnostic Lab / Imaging',
    file_name: '2d_echo_rajesh_mukherjee.pdf',
    file_size_kb: 1420,
    uploaded_at: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
    uploaded_by: 'Staff Nurse Sunita Das',
    notes: 'Echo performed prior to initiation of systemic chemotherapy protocol.'
  },
  {
    id: 'doc-02',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    title: 'Day Care Ambulatory Discharge Summary',
    category: 'Discharge Summary',
    file_name: 'daycare_discharge_dca0041.pdf',
    file_size_kb: 480,
    uploaded_at: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    uploaded_by: 'Dr. Sunita Rao',
    notes: 'Signed clinical discharge slip for ambulatory chemotherapy cycle.'
  },
  {
    id: 'doc-03',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    title: 'Renal Function Test & Electrolyte Panel',
    category: 'Laboratory Report',
    file_name: 'rft_electrolytes_priyanka.pdf',
    file_size_kb: 320,
    uploaded_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    uploaded_by: 'Diagnostic Lab Workbench',
    notes: 'Pre-dialysis biochemistry: Serum Creatinine 5.8 mg/dL, Potassium 5.1 mEq/L.'
  }
];

export const INITIAL_ENCOUNTERS = [
  {
    id: 'enc-01',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    doctor_name: 'Dr. Sunita Rao',
    doctor_qualification: 'MD (Internal Medicine)',
    department: 'General Medicine',
    department_name: 'General Medicine',
    appointment_date: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    status: 'completed',
    chief_complaint: 'Fever for 3 days with throat irritation and mild productive cough.',
    diagnosis: 'J06.9 Acute upper respiratory infection, unspecified',
    notes: 'Throat hyperemic, no tonsillar exudates. Lungs clear. Advised oral hydration and symptomatic antipyretics.',
    vitals: {
      pulse: 78,
      systolic_bp: 124,
      diastolic_bp: 82,
      spo2: 99,
      temperature: 99.4,
      respiratory_rate: 18
    },
    prescriptions: [
      {
        medication_name: 'Amoxicillin + Clavulanate (Augmentin 625mg)',
        dosage: '1 Tab',
        frequency: 'BD',
        duration: '7 Days',
        instructions: 'After food'
      },
      {
        medication_name: 'Paracetamol (Dolo 650mg)',
        dosage: '1 Tab',
        frequency: 'PRN',
        duration: '5 Days',
        instructions: 'SOS fever'
      }
    ]
  },
  {
    id: 'enc-02',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    doctor_name: 'Dr. Vikram Seth',
    doctor_qualification: 'MS (General Surgery)',
    department: 'Day Care Surgery',
    department_name: 'Day Care Surgery',
    appointment_date: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    status: 'completed',
    chief_complaint: 'Day Care Ambulatory procedure check and infusion monitoring.',
    diagnosis: 'Z51.11 Encounter for antineoplastic chemotherapy',
    notes: 'Pre-medication administered. Tolerated protocol without hypersensitivity reaction. Aldrete score 10.',
    vitals: {
      pulse: 74,
      systolic_bp: 120,
      diastolic_bp: 80,
      spo2: 98,
      temperature: 98.6,
      respiratory_rate: 16
    },
    prescriptions: [
      {
        medication_name: 'Ondansetron 4mg',
        dosage: '1 Tab',
        frequency: 'PRN',
        duration: '3 Days',
        instructions: 'Before meals'
      }
    ]
  },
  {
    id: 'enc-03',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    doctor_name: 'Dr. Arindam Mitra',
    doctor_qualification: 'DM (Cardiology)',
    department: 'Cardiology',
    department_name: 'Cardiology',
    appointment_date: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    status: 'completed',
    chief_complaint: 'Routine follow-up for chronic hypertension and metabolic evaluation.',
    diagnosis: 'I10 Essential (primary) hypertension',
    notes: 'Blood pressure currently 132/84 mmHg. Recommended reduction in dietary sodium and continued daily exercise.',
    vitals: {
      pulse: 82,
      systolic_bp: 132,
      diastolic_bp: 84,
      spo2: 97,
      temperature: 98.4,
      respiratory_rate: 17
    },
    prescriptions: [
      {
        medication_name: 'Metformin Hydrochloride (500mg)',
        dosage: '1 Tab',
        frequency: 'BD',
        duration: '30 Days',
        instructions: 'After meals'
      },
      {
        medication_name: 'Atorvastatin (20mg)',
        dosage: '1 Tab',
        frequency: 'HS',
        duration: '30 Days',
        instructions: 'Bedtime'
      }
    ]
  }
];
