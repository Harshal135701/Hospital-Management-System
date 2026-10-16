/**
 * Clinical Workspace Demonstration & Mock Dataset
 *
 * NOTICE:
 * This file provides isolated demonstration data for the Module 6 Clinicals
 * frontend workspace (OPD Queue, Demonstration Diagnostic Catalog, and Initial Patient Records).
 * No live backend transactions or persistent database mutations are performed.
 */

export const DEMO_DIAGNOSTIC_CATALOG = [
  // Hematology
  {
    id: 'lab-hem-001',
    code: 'CBC-DIFF',
    name: 'Complete Blood Count (CBC) with Automated Differential',
    category: 'Hematology',
    department: 'Central Pathology Laboratory',
    turnaroundTime: '2 Hours',
    specimen: 'EDTA Whole Blood (Lavender top)',
    description: 'Hemoglobin, Hematocrit, RBC, Platelet count, WBC and differential'
  },
  {
    id: 'lab-hem-002',
    code: 'PT-INR',
    name: 'Prothrombin Time (PT) and International Normalized Ratio (INR)',
    category: 'Hematology',
    department: 'Central Pathology Laboratory',
    turnaroundTime: '1 Hour',
    specimen: 'Citrated Plasma (Light Blue top)',
    description: 'Assessment of extrinsic coagulation pathway and anticoagulant monitoring'
  },
  {
    id: 'lab-hem-003',
    code: 'ESR-WINT',
    name: 'Erythrocyte Sedimentation Rate (ESR - Westergren)',
    category: 'Hematology',
    department: 'Central Pathology Laboratory',
    turnaroundTime: '2 Hours',
    specimen: 'EDTA Whole Blood',
    description: 'Non-specific marker for systemic inflammatory response'
  },

  // Biochemistry & Renal/Hepatic
  {
    id: 'lab-bio-001',
    code: 'CMP-KFT',
    name: 'Kidney Function Test (KFT / Renal Profile)',
    category: 'Biochemistry',
    department: 'Clinical Biochemistry Laboratory',
    turnaroundTime: '3 Hours',
    specimen: 'Serum (SST Gold top)',
    description: 'Blood Urea Nitrogen (BUN), Serum Creatinine, eGFR, Uric Acid'
  },
  {
    id: 'lab-bio-002',
    code: 'LFT-PANEL',
    name: 'Liver Function Tests (LFT Complete Panel)',
    category: 'Biochemistry',
    department: 'Clinical Biochemistry Laboratory',
    turnaroundTime: '3 Hours',
    specimen: 'Serum (SST Gold top)',
    description: 'Total & Direct Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein, Albumin'
  },
  {
    id: 'lab-bio-003',
    code: 'LIPID-FULL',
    name: 'Comprehensive Fasting Lipid Profile',
    category: 'Biochemistry',
    department: 'Clinical Biochemistry Laboratory',
    turnaroundTime: '4 Hours',
    specimen: 'Serum (SST Gold top) - 12h Fasting',
    description: 'Total Cholesterol, HDL, LDL, VLDL, Serum Triglycerides'
  },
  {
    id: 'lab-bio-004',
    code: 'ELEC-SRM',
    name: 'Serum Electrolytes (Na+, K+, Cl-, HCO3-)',
    category: 'Biochemistry',
    department: 'Emergency & Stat Biochemistry',
    turnaroundTime: '45 Minutes',
    specimen: 'Heparinized Plasma / Serum',
    description: 'Ion-selective electrode quantification for electrolyte balance'
  },
  {
    id: 'lab-bio-005',
    code: 'HBA1C-HPLC',
    name: 'Glycated Hemoglobin (HbA1c by HPLC)',
    category: 'Biochemistry',
    department: 'Clinical Biochemistry Laboratory',
    turnaroundTime: '3 Hours',
    specimen: 'EDTA Whole Blood',
    description: 'Estimated average glucose over preceding 90 days'
  },
  {
    id: 'lab-bio-006',
    code: 'TROP-I-HS',
    name: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)',
    category: 'Biochemistry',
    department: 'Emergency & Stat Biochemistry',
    turnaroundTime: '30 Minutes',
    specimen: 'Serum / Lithium Heparin Plasma',
    description: 'Stat biomarker for myocardial injury and acute coronary syndrome'
  },

  // Blood Bank & Transfusion Medicine
  {
    id: 'lab-bb-001',
    code: 'BB-GRP-XM',
    name: 'ABO / Rh Blood Grouping & Crossmatch Compatibility',
    category: 'Blood Bank',
    department: 'Transfusion Medicine Department',
    turnaroundTime: '1.5 Hours',
    specimen: 'EDTA Plain Tube (Pink top) + Clot activator',
    description: 'Forward/reverse grouping, antibody screen, and serological crossmatch'
  },
  {
    id: 'lab-bb-002',
    code: 'BB-TTI-PANEL',
    name: 'Transfusion Transmissible Infections (TTI) Serology Panel',
    category: 'Blood Bank',
    department: 'Transfusion Medicine Department',
    turnaroundTime: '4 Hours',
    specimen: 'Serum (Plain Red top)',
    description: 'ELISA/CLIA screening for HIV-1/2, HBsAg, HCV, Syphilis, and Malaria'
  },

  // Diagnostic Radiology & Imaging
  {
    id: 'rad-img-001',
    code: 'CXR-PA',
    name: 'Chest X-Ray (PA View, Digital Radiography)',
    category: 'Radiology',
    department: 'Diagnostic Imaging Center',
    turnaroundTime: '1 Hour',
    specimen: 'Non-invasive Imaging',
    description: 'Evaluation of lung parenchyma, cardiothoracic ratio, and pleural spaces'
  },
  {
    id: 'rad-img-002',
    code: 'USG-ABD-PEL',
    name: 'Ultrasound Whole Abdomen & Pelvis',
    category: 'Radiology',
    department: 'Diagnostic Ultrasound Suite',
    turnaroundTime: '2 Hours',
    specimen: 'Non-invasive Sonography (Full bladder)',
    description: 'High-resolution sonography of liver, gallbladder, pancreas, spleen, kidneys, bladder'
  },
  {
    id: 'rad-img-003',
    code: 'CT-HEAD-NC',
    name: 'Non-Contrast Computed Tomography (NCCT) Brain / Head',
    category: 'Radiology',
    department: 'Advanced CT/MRI Center',
    turnaroundTime: '1 Hour',
    specimen: 'Axial helical tomography',
    description: 'Rule out acute intracranial hemorrhage, mass effect, or structural infarction'
  },
  {
    id: 'rad-img-004',
    code: 'MRI-LSPINE',
    name: 'Magnetic Resonance Imaging (MRI) Lumbar Spine (Non-Contrast)',
    category: 'Radiology',
    department: 'Advanced CT/MRI Center',
    turnaroundTime: '4 Hours',
    specimen: 'High-field 3T Magnetic Resonance',
    description: 'Evaluation of intervertebral discs, thecal sac, nerve roots, and canal stenosis'
  },

  // Cardiology Interventions
  {
    id: 'card-001',
    code: 'ECG-12L',
    name: '12-Lead Electrocardiogram (Resting ECG)',
    category: 'Cardiology',
    department: 'Non-Invasive Cardiology Lab',
    turnaroundTime: '20 Minutes',
    specimen: 'Electrophysiological Tracing',
    description: 'Standard 12-lead cardiac rhythm, axis, conduction and repolarization analysis'
  },
  {
    id: 'card-002',
    code: 'ECHO-2D-DOP',
    name: '2D Transthoracic Echocardiography with Color Doppler',
    category: 'Cardiology',
    department: 'Non-Invasive Cardiology Lab',
    turnaroundTime: '2 Hours',
    specimen: 'Ultrasound Examination',
    description: 'Ejection fraction (LVEF), regional wall motion, valvular morphology, chamber dimensions'
  }
];

export const INITIAL_QUEUE_PATIENTS = [
  {
    id: 'enc-2026-001',
    uhid: 'UHID-2026-0842',
    appointment_number: 'APT-2026-0914',
    patient_name: 'Eleanor Vance',
    age: 48,
    gender: 'Female',
    blood_group: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    appointment_time: '09:30 AM',
    department: 'Cardiology',
    doctor_name: 'Dr. Priya Sharma',
    status: 'in_consultation', // 'waiting' | 'in_consultation' | 'completed'
    chief_complaint: 'Exertional substernal chest tightness radiating to left shoulder over past 2 weeks',
    vitals: {
      systolic: '138',
      diastolic: '88',
      heartRate: '82',
      respiratoryRate: '18',
      temperature: '37.1',
      tempUnit: 'C',
      spo2: '97',
      height: '162',
      weight: '68',
      cvs: 'Regular rhythm, normal S1 and S2. No audible murmurs, rubs, or gallops.',
      rs: 'Bilateral vesicular breath sounds clear to auscultation. No wheezes or crackles.',
      abdomen: 'Soft, non-distended, non-tender. Bowel sounds normal.',
      cns: 'Alert, fully oriented x 3. Cranial nerves grossly intact. Normal gait.'
    },
    history: {
      presentingComplaint: 'Substernal chest tightness precipitated by stair climbing, relieved within 5 minutes of rest.',
      onsetDuration: 'Onset 14 days ago; 3-4 episodes weekly.',
      severity: 'Moderate',
      aggravatingFactors: 'Brisk walking, stair climbing, cold weather, heavy meals.',
      relievingFactors: 'Complete rest, slow deep breathing.',
      medicalHistory: 'Primary hypertension for 6 years. Borderline hyperlipidemia.',
      surgicalHistory: 'Laparoscopic cholecystectomy (2019, uneventful recovery).',
      familyHistory: 'Father sustained myocardial infarction at age 54. Mother has Type 2 diabetes mellitus.',
      currentMedications: 'Amlodipine 5mg OD, Atorvastatin 20mg HS.',
      allergies: 'Penicillin (urticarial rash, angioedema); Sulfa antibiotics (maculopapular rash).'
    },
    consultationDesk: {
      summary: '48-year-old female presenting with typical exertional angina pectoris symptoms, CCS Class II. Vital signs stable with mild borderline systolic hypertension.',
      examination: 'Mild bilateral pedal edema (trace). S1, S2 audible, no S3/S4. Bilateral lung bases clear.',
      impression: 'Stable Angina Pectoris (suspected coronary artery disease); Essential Hypertension Stage 1.'
    },
    orders: [
      {
        id: 'ord-101',
        testId: 'card-001',
        testCode: 'ECG-12L',
        testName: '12-Lead Electrocardiogram (Resting ECG)',
        category: 'Cardiology',
        priority: 'Routine',
        indication: 'Evaluate exertional chest pain; baseline ST-T wave morphology',
        instructions: 'Perform resting 12-lead ECG in supine position before stress testing',
        status: 'Submitted',
        orderedAt: 'Today, 09:40 AM'
      },
      {
        id: 'ord-102',
        testId: 'lab-bio-003',
        testCode: 'LIPID-FULL',
        testName: 'Comprehensive Fasting Lipid Profile',
        category: 'Biochemistry',
        priority: 'Routine',
        indication: 'Cardiovascular risk stratification',
        instructions: 'Fasting specimen required next morning',
        status: 'Draft',
        orderedAt: 'Today, 09:44 AM'
      }
    ],
    notes: [
      {
        id: 'note-001',
        author: 'Dr. Priya Sharma (Cardiology Consultant)',
        timestamp: '16 Oct 2026, 09:45 AM',
        status: 'Finalized',
        subjective: 'Patient reports exertional chest pressure for 2 weeks. Relieved by resting within minutes. Denies diaphoresis, syncope, or orthopnea.',
        objective: 'BP: 138/88 mmHg, HR: 82 bpm, SpO2: 97% on room air, BMI: 25.9 kg/m². Normal heart sounds S1 S2. Lungs clear.',
        assessment: 'Stable Angina Pectoris (CCS Class II). Stage 1 Essential Hypertension.',
        plan: '1. Ordered 12-lead resting ECG and fasting lipid panel.\n2. Prescribed Tab Nitroglycerin 0.5mg sublingual PRN for acute chest discomfort.\n3. Continue Amlodipine 5mg OD.\n4. Scheduled for 2D Transthoracic Echocardiogram next week.'
      }
    ]
  },
  {
    id: 'enc-2026-002',
    uhid: 'UHID-2026-1190',
    appointment_number: 'APT-2026-0922',
    patient_name: 'Rajesh Kulkarni',
    age: 56,
    gender: 'Male',
    blood_group: 'B+',
    allergies: ['None known'],
    appointment_time: '10:00 AM',
    department: 'Internal Medicine',
    doctor_name: 'Dr. Rajesh Iyer',
    status: 'waiting',
    chief_complaint: 'Persistent dry cough and evening low-grade fever with unquantified weight loss over 3 weeks',
    vitals: {
      systolic: '124',
      diastolic: '78',
      heartRate: '92',
      respiratoryRate: '20',
      temperature: '38.2',
      tempUnit: 'C',
      spo2: '95',
      height: '174',
      weight: '64',
      cvs: 'Tachycardic, regular rhythm. Normal heart sounds, no murmur.',
      rs: 'Decreased breath sounds right mid-zone with fine inspiratory end-crepitations.',
      abdomen: 'Soft, non-tender. Liver and spleen non-palpable.',
      cns: 'Conscious, oriented, no focal neurologic deficit.'
    },
    history: {
      presentingComplaint: 'Low-grade fever predominantly in evenings accompanied by dry hacking cough and night sweats.',
      onsetDuration: '3 weeks gradual onset, worsening fatigue.',
      severity: 'Moderate',
      aggravatingFactors: 'Cold exposure, lying supine.',
      relievingFactors: 'Oral antipyretic provides transient relief.',
      medicalHistory: 'Type 2 Diabetes Mellitus for 8 years on Metformin 1000mg BD. Non-smoker.',
      surgicalHistory: 'None reported.',
      familyHistory: 'No chronic respiratory illnesses in immediate family.',
      currentMedications: 'Metformin 1000mg BD, Multivitamin once daily.',
      allergies: 'No known drug or environmental allergies.'
    },
    consultationDesk: {
      summary: '56-year-old diabetic male with subacute febrile respiratory illness. Right mid-zone lung findings warrant diagnostic imaging and sputum evaluation.',
      examination: 'Mild pallor present. Right mid-zone bronchial breathing with fine crackles.',
      impression: 'Community-Acquired Pneumonia vs Pulmonary Kochs; Type 2 Diabetes Mellitus.'
    },
    orders: [
      {
        id: 'ord-201',
        testId: 'rad-img-001',
        testCode: 'CXR-PA',
        testName: 'Chest X-Ray (PA View, Digital Radiography)',
        category: 'Radiology',
        priority: 'Urgent',
        indication: 'Right mid-zone crepitations with 3-week febrile cough',
        instructions: 'Erect PA view; evaluate right middle lobe consolidation or cavity',
        status: 'Submitted',
        orderedAt: 'Today, 10:05 AM'
      },
      {
        id: 'ord-202',
        testId: 'lab-hem-001',
        testCode: 'CBC-DIFF',
        testName: 'Complete Blood Count (CBC) with Automated Differential',
        category: 'Hematology',
        priority: 'Urgent',
        indication: 'Infective leukocytosis screening',
        instructions: 'Stat phlebotomy collection',
        status: 'Submitted',
        orderedAt: 'Today, 10:06 AM'
      }
    ],
    notes: []
  },
  {
    id: 'enc-2026-003',
    uhid: 'UHID-2026-0418',
    appointment_number: 'APT-2026-0870',
    patient_name: 'Fatima Al-Mansoor',
    age: 34,
    gender: 'Female',
    blood_group: 'A+',
    allergies: ['Ciprofloxacin'],
    appointment_time: '08:45 AM',
    department: 'General Surgery',
    doctor_name: 'Dr. Vikramaditya',
    status: 'completed',
    chief_complaint: 'Right lower quadrant abdominal soreness, post-operative suture removal follow-up',
    vitals: {
      systolic: '116',
      diastolic: '74',
      heartRate: '72',
      respiratoryRate: '16',
      temperature: '36.8',
      tempUnit: 'C',
      spo2: '99',
      height: '158',
      weight: '55',
      cvs: 'Normal heart sounds, regular rate and rhythm.',
      rs: 'Bilateral vesicular breath sounds clear, equal.',
      abdomen: 'Laparoscopy port sites clean and dry. No erythema, discharge, or localized tenderness.',
      cns: 'Fully conscious, ambulatory, neurologically intact.'
    },
    history: {
      presentingComplaint: 'Routine day-10 post-operative review following laparoscopic appendectomy.',
      onsetDuration: 'Procedure completed 10 days ago.',
      severity: 'Mild',
      aggravatingFactors: 'Strenuous bending or lifting.',
      relievingFactors: 'Abdominal binder, rest.',
      medicalHistory: 'No prior chronic conditions.',
      surgicalHistory: 'Laparoscopic Appendectomy (Day 10 post-op).',
      familyHistory: 'Non-contributory.',
      currentMedications: 'Paracetamol 650mg SOS for mild discomfort.',
      allergies: 'Ciprofloxacin (severe nausea and facial flush).'
    },
    consultationDesk: {
      summary: 'Post-operative follow-up day 10. Port wounds healed primarily. No signs of infection or intra-abdominal complication.',
      examination: 'All 3 port incisions clean, non-tender. Normal bowel sounds.',
      impression: 'Uneventful recovery following laparoscopic appendectomy.'
    },
    orders: [],
    notes: [
      {
        id: 'note-301',
        author: 'Dr. Vikramaditya (Senior General Surgeon)',
        timestamp: '16 Oct 2026, 09:15 AM',
        status: 'Finalized',
        subjective: 'Patient reports minimal residual soreness at umbilical port. Eating normal diet and passing normal stools.',
        objective: 'Vitals: BP 116/74, HR 72, Afebrile, SpO2 99%. Incisions clean, dry, without induration.',
        assessment: 'Post-laparoscopic appendectomy Day 10 - healing well.',
        plan: '1. Suture removal completed cleanly.\n2. May resume light non-strenuous physical activities.\n3. Discharged from acute surgical follow-up.'
      }
    ]
  },
  {
    id: 'enc-2026-004',
    uhid: 'UHID-2026-2305',
    appointment_number: 'APT-2026-0935',
    patient_name: 'Aarav Nair',
    age: 29,
    gender: 'Male',
    blood_group: 'AB+',
    allergies: ['Latex'],
    appointment_time: '10:45 AM',
    department: 'Orthopedics',
    doctor_name: 'Dr. Ananya Roy',
    status: 'waiting',
    chief_complaint: 'Acute left ankle twist while playing football yesterday; unable to bear full weight',
    vitals: {
      systolic: '122',
      diastolic: '80',
      heartRate: '78',
      respiratoryRate: '16',
      temperature: '36.9',
      tempUnit: 'C',
      spo2: '98',
      height: '180',
      weight: '76',
      cvs: 'Regular rhythm, no murmurs.',
      rs: 'Lungs clear bilaterally.',
      abdomen: 'Soft, benign.',
      cns: 'Intact distal neurovascular examination in left lower extremity.'
    },
    history: {
      presentingComplaint: 'Inversion injury of left ankle approximately 24 hours ago.',
      onsetDuration: 'Acute onset yesterday evening.',
      severity: 'Moderate',
      aggravatingFactors: 'Weight bearing, plantar flexion.',
      relievingFactors: 'Ice pack elevation, crepe bandage.',
      medicalHistory: 'Nil significant.',
      surgicalHistory: 'None.',
      familyHistory: 'Non-contributory.',
      currentMedications: 'Ibuprofen 400mg taken twice with meals.',
      allergies: 'Latex (contact dermatitis).'
    },
    consultationDesk: {
      summary: '29-year-old active male with acute inversion ankle sprain. Ottawa Ankle Rules positive for lateral malleolar tenderness.',
      examination: 'Significant edema and ecchymosis over anterior talofibular ligament (ATFL). Dorsalis pedis pulse palpable 2+.',
      impression: 'Grade II Ankle Sprain (Lateral Ligament Complex); rule out avulsion fracture.'
    },
    orders: [],
    notes: []
  }
];

/**
 * Standard reference ranges and warning evaluations for vital signs
 */
export const evaluateVitalRange = (field, value, tempUnit = 'C') => {
  if (value === '' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return { type: 'error', message: 'Invalid numeric value' };

  switch (field) {
    case 'systolic':
      if (num < 70) return { type: 'danger', message: 'Severe Hypotension (< 70 mmHg)' };
      if (num < 90) return { type: 'warning', message: 'Low / Hypotensive (< 90 mmHg)' };
      if (num > 180) return { type: 'danger', message: 'Hypertensive Crisis (> 180 mmHg)' };
      if (num > 140) return { type: 'warning', message: 'Elevated / Stage 2 HTN (> 140 mmHg)' };
      if (num > 120) return { type: 'info', message: 'Pre-hypertensive (121-139 mmHg)' };
      return { type: 'success', message: 'Normal Systolic (90-120 mmHg)' };

    case 'diastolic':
      if (num < 40) return { type: 'danger', message: 'Critical Low (< 40 mmHg)' };
      if (num < 60) return { type: 'warning', message: 'Low Diastolic (< 60 mmHg)' };
      if (num > 120) return { type: 'danger', message: 'Hypertensive Crisis (> 120 mmHg)' };
      if (num > 90) return { type: 'warning', message: 'High Diastolic (> 90 mmHg)' };
      return { type: 'success', message: 'Normal Diastolic (60-85 mmHg)' };

    case 'heartRate':
      if (num < 45) return { type: 'danger', message: 'Critical Bradycardia (< 45 bpm)' };
      if (num < 60) return { type: 'warning', message: 'Bradycardia (< 60 bpm)' };
      if (num > 140) return { type: 'danger', message: 'Severe Tachycardia (> 140 bpm)' };
      if (num > 100) return { type: 'warning', message: 'Tachycardia (> 100 bpm)' };
      return { type: 'success', message: 'Normal Heart Rate (60-100 bpm)' };

    case 'respiratoryRate':
      if (num < 8) return { type: 'danger', message: 'Critical Bradypnea (< 8 bpm)' };
      if (num < 12) return { type: 'warning', message: 'Low Respiration (< 12 bpm)' };
      if (num > 30) return { type: 'danger', message: 'Severe Tachypnea (> 30 bpm)' };
      if (num > 20) return { type: 'warning', message: 'Tachypnea (> 20 bpm)' };
      return { type: 'success', message: 'Normal Respiration (12-20 bpm)' };

    case 'temperature':
      if (tempUnit === 'C') {
        if (num < 35.0) return { type: 'danger', message: 'Hypothermia (< 35.0 °C)' };
        if (num > 39.5) return { type: 'danger', message: 'High Fever / Hyperpyrexia (> 39.5 °C)' };
        if (num > 37.8) return { type: 'warning', message: 'Febrile / Low Fever (> 37.8 °C)' };
        return { type: 'success', message: 'Normal Temperature (36.5 - 37.5 °C)' };
      } else {
        if (num < 95.0) return { type: 'danger', message: 'Hypothermia (< 95.0 °F)' };
        if (num > 103.0) return { type: 'danger', message: 'High Fever (> 103.0 °F)' };
        if (num > 100.4) return { type: 'warning', message: 'Febrile (> 100.4 °F)' };
        return { type: 'success', message: 'Normal Temperature (97.7 - 99.5 °F)' };
      }

    case 'spo2':
      if (num < 90) return { type: 'danger', message: 'Severe Hypoxia (< 90% SpO₂)' };
      if (num < 95) return { type: 'warning', message: 'Borderline Hypoxemia (< 95%)' };
      if (num > 100) return { type: 'error', message: 'Invalid SpO₂ (> 100%)' };
      return { type: 'success', message: 'Normal Oxygen Saturation (95-100%)' };

    default:
      return null;
  }
};

/**
 * Calculates Body Mass Index (BMI) and categorizes clinical status
 */
export const calculateBMI = (heightCm, weightKg) => {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;

  const heightM = h / 100;
  const bmiVal = (w / (heightM * heightM)).toFixed(1);
  const num = parseFloat(bmiVal);

  if (num < 18.5) {
    return { value: bmiVal, category: 'Underweight', variant: 'warning', description: 'BMI < 18.5 kg/m²' };
  } else if (num < 25.0) {
    return { value: bmiVal, category: 'Normal Weight', variant: 'success', description: 'BMI 18.5 – 24.9 kg/m²' };
  } else if (num < 30.0) {
    return { value: bmiVal, category: 'Overweight', variant: 'warning', description: 'BMI 25.0 – 29.9 kg/m²' };
  } else if (num < 35.0) {
    return { value: bmiVal, category: 'Obesity Class I', variant: 'danger', description: 'BMI 30.0 – 34.9 kg/m²' };
  } else {
    return { value: bmiVal, category: 'Obesity Class II/III', variant: 'danger', description: 'BMI ≥ 35.0 kg/m²' };
  }
};
