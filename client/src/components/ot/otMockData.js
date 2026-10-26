/**
 * Realistic Hospital-Grade Operation Theatre Sample Data
 * Aligned with Sarji Hospital Surgical Services Protocols
 */

export const INITIAL_OT_CASES = [
  {
    id: 'OT-CASE-2026-101',
    patientId: 'pat-0812',
    patientName: 'Ananya Mukherjee',
    patientUhid: 'UHID-2026-0812',
    age: 44,
    gender: 'Female',
    diagnosis: 'Symptomatic Cholelithiasis with Chronic Cholecystitis',
    procedureName: 'Laparoscopic Cholecystectomy with Cholangiogram',
    surgeryType: 'Elective',
    theatreId: 'theatre-1',
    theatreName: 'Major OT 1 (General & Laparoscopy)',
    leadSurgeon: 'Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Sunita Rao',
    scrubNurse: 'Nurse Preeti Shinde',
    timeSlot: '08:30 – 10:30',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    // PAC Status
    pacStatus: 'Cleared (ASA Class II)',
    asaGrade: 'ASA Class II',
    mallampatiClass: 'Class I',
    npoStatus: '8 Hours Verified (Strict NPO)',
    airwayAssessment: 'Normal thyromental distance, full neck mobility, no dentition issues',
    cardiacClearance: 'ECG Normal Sinus, 2D Echo LVEF 60%',
    crossmatchUnits: '2 Units PRBC Reserved',
    
    // WHO Checklist
    whoChecklistStatus: 'Completed (All 3 Phases)',
    whoChecklist: {
      signInDone: true,
      timeOutDone: true,
      signOutDone: true,
      patientConfirmed: true,
      siteMarked: true,
      anesthesiaSafetyCheck: true,
      oximeterFunctioning: true,
      allergyChecked: true,
      airwayAssessed: true,
      bloodLossRiskAssessed: true,
      teamIntroduced: true,
      antibioticGiven: true, // Cefuroxime 1.5g IV at 08:05
      countsVerified: true,
      specimensLabeled: true
    },
    
    // Intra-op details
    anesthesiaType: 'General Anesthesia (Endotracheal Tube #7.0)',
    estimatedBloodLoss: '45 ml',
    incisionTime: '08:45',
    closureTime: '10:15',
    implantsUsed: 'None (Lap Clips: Ethicon Ligaclip LT-300 Titanium)',
    spongeCountVerified: true,
    instrumentCountVerified: true,
    surgicalNotes: 'Pneumoperitoneum created with Veress needle at Palmer point. Gallbladder distended with multiple calculi. Calot triangle dissected cleanly, cystic duct and cystic artery double-clipped and divided. Specimen extracted in endobag. Hemostasis secured. No subhepatic drain required.',
    
    // PACU Recovery
    status: 'in_surgery', // in_surgery | in_pacu | discharged_ward | scheduled
    pacuBay: 'PACU Bay 1',
    aldreteScore: 0,
    pacuStatus: 'Awaiting Surgical Closure'
  },
  {
    id: 'OT-CASE-2026-102',
    patientId: 'pat-0924',
    patientName: 'Rameshwar Patil',
    patientUhid: 'UHID-2026-0924',
    age: 68,
    gender: 'Male',
    diagnosis: 'Severe Primary Osteoarthritis Left Knee (Grade IV Kellgren-Lawrence)',
    procedureName: 'Total Knee Arthroplasty Left (Robotic Assisted)',
    surgeryType: 'Elective',
    theatreId: 'theatre-2',
    theatreName: 'Major OT 2 (Orthopaedics & Joint Replacement)',
    leadSurgeon: 'Dr. Pradeep K. Sharma',
    anesthetist: 'Dr. Rajiv Menon',
    scrubNurse: 'Nurse Anita Deshmukh',
    timeSlot: '09:00 – 12:00',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    pacStatus: 'Cleared (ASA Class II)',
    asaGrade: 'ASA Class II',
    mallampatiClass: 'Class II',
    npoStatus: '10 Hours Verified',
    airwayAssessment: 'Adequate mouth opening, slight dental attrition',
    cardiacClearance: 'Cleared by Cardiology on Tab Metoprolol',
    crossmatchUnits: '2 Units PRBC Typed & Screened',
    
    whoChecklistStatus: 'Completed (All 3 Phases)',
    whoChecklist: {
      signInDone: true,
      timeOutDone: true,
      signOutDone: true,
      patientConfirmed: true,
      siteMarked: true, // Left Knee clearly initialed
      anesthesiaSafetyCheck: true,
      oximeterFunctioning: true,
      allergyChecked: true,
      airwayAssessed: true,
      bloodLossRiskAssessed: true,
      teamIntroduced: true,
      antibioticGiven: true, // Vancomycin 1g IV infused
      countsVerified: true,
      specimensLabeled: true
    },
    
    anesthesiaType: 'Combined Spinal-Epidural (Bupivacaine 0.5% Heavy 3.0 ml + Adjuvant)',
    estimatedBloodLoss: '160 ml',
    incisionTime: '09:20',
    closureTime: '11:45',
    implantsUsed: 'Stryker Triathlon CoCr Femoral Size 4, Tibial Tray Size 3, X3 Poly Insert 9mm (Lot #STR-9941)',
    spongeCountVerified: true,
    instrumentCountVerified: true,
    surgicalNotes: 'Standard medial parapatellar arthrotomy under pneumatic thigh tourniquet (250 mmHg, 62 mins). Minimal bone resections performed according to robotic navigational coordinates. Trial components tested with optimal medial-lateral stability. Original components cemented with Palacos antibiotic cement. Pulse lavage performed. Negative suction drain 10F placed.',
    
    status: 'in_pacu',
    pacuBay: 'PACU Bay 3',
    aldreteScore: 9, // Motor: 2, Respiration: 2, Circulation: 2, Consciousness: 2, SpO2: 1
    pacuStatus: 'Recovering in PACU — Aldrete 9/10, stable vitals, warm peripheries'
  },
  {
    id: 'OT-CASE-2026-103',
    patientId: 'pat-1102',
    patientName: 'Vikram Joshi',
    patientUhid: 'UHID-2026-1102',
    age: 56,
    gender: 'Male',
    diagnosis: 'Subacute Subdural Hematoma Right Frontoparietal',
    procedureName: 'Right Frontoparietal Burr Hole & Evacuation',
    surgeryType: 'Urgent',
    theatreId: 'theatre-3',
    theatreName: 'Major OT 3 (Neuro & Vascular Surgery)',
    leadSurgeon: 'Dr. Harish Bahl',
    anesthetist: 'Dr. Sunita Rao',
    scrubNurse: 'Nurse Kavita Jadhav',
    timeSlot: '11:30 – 13:30',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    pacStatus: 'High Risk Cleared (ASA Class III)',
    asaGrade: 'ASA Class III',
    mallampatiClass: 'Class II',
    npoStatus: '6 Hours Verified',
    airwayAssessment: 'Controlled airway, short neck, video laryngoscope prepared',
    cardiacClearance: 'ECG shows LVH, cleared with hemodynamic invasive monitoring',
    crossmatchUnits: '4 Units PRBC Crossmatched & Available',
    
    whoChecklistStatus: 'Phase 1 Sign-in Completed',
    whoChecklist: {
      signInDone: true,
      timeOutDone: false,
      signOutDone: false,
      patientConfirmed: true,
      siteMarked: true,
      anesthesiaSafetyCheck: true,
      oximeterFunctioning: true,
      allergyChecked: true,
      airwayAssessed: true,
      bloodLossRiskAssessed: true,
      teamIntroduced: false,
      antibioticGiven: false,
      countsVerified: false,
      specimensLabeled: false
    },
    
    anesthesiaType: 'General Anesthesia with Arterial Line & EtCO2 Monitoring',
    estimatedBloodLoss: 'Pending Incision',
    incisionTime: 'Pending',
    closureTime: 'Pending',
    implantsUsed: 'Subdural Subgaleal Closed Drain System',
    spongeCountVerified: false,
    instrumentCountVerified: false,
    surgicalNotes: 'Patient wheeled into induction bay. Pre-oxygenation underway. Arterial line cannulated on left radial artery. Surgical positioner set with Mayfield skull clamp.',
    
    status: 'pre_op_ready',
    pacuBay: 'Reserved PACU Bay 2',
    aldreteScore: 0,
    pacuStatus: 'Pre-operative induction'
  },
  {
    id: 'OT-CASE-2026-104',
    patientId: 'pat-1240',
    patientName: 'Sumantha Banerjee',
    patientUhid: 'UHID-2026-1240',
    age: 38,
    gender: 'Female',
    diagnosis: 'Right Inguinal Indirect Reducible Hernia',
    procedureName: 'Laparoscopic TEP Right Inguinal Hernia Mesh Repair',
    surgeryType: 'Elective Day Care',
    theatreId: 'theatre-4',
    theatreName: 'Minor OT 4 (Day Care & Endoscopy)',
    leadSurgeon: 'Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Ananya Mukherjee',
    scrubNurse: 'Nurse Sneha Kadam',
    timeSlot: '13:30 – 15:30',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    pacStatus: 'Cleared (ASA Class I)',
    asaGrade: 'ASA Class I',
    mallampatiClass: 'Class I',
    npoStatus: 'Verified (Nil by mouth since 06:00)',
    airwayAssessment: 'Mallampati Class I, no airway predictors',
    cardiacClearance: 'Baseline vitals normal, non-smoker',
    crossmatchUnits: 'Blood Group O+ve Typed',
    
    whoChecklistStatus: 'Pending Sign-in',
    whoChecklist: {
      signInDone: false,
      timeOutDone: false,
      signOutDone: false,
      patientConfirmed: false,
      siteMarked: true,
      anesthesiaSafetyCheck: false,
      oximeterFunctioning: false,
      allergyChecked: false,
      airwayAssessed: false,
      bloodLossRiskAssessed: false,
      teamIntroduced: false,
      antibioticGiven: false,
      countsVerified: false,
      specimensLabeled: false
    },
    
    anesthesiaType: 'General Anesthesia with Laryngeal Mask Airway (LMA)',
    estimatedBloodLoss: 'Scheduled',
    incisionTime: 'Scheduled',
    closureTime: 'Scheduled',
    implantsUsed: 'Bard 3DMax Anatomical Polypropylene Mesh 10.3x15.7cm',
    spongeCountVerified: false,
    instrumentCountVerified: false,
    surgicalNotes: 'Patient currently in Day Care holding area. Baseline pre-op orders executed.',
    
    status: 'scheduled',
    pacuBay: 'Day Care Bed 4',
    aldreteScore: 0,
    pacuStatus: 'Scheduled afternoon elective'
  },
  {
    id: 'OT-CASE-2026-105',
    patientId: 'pat-1390',
    patientName: 'Kunal Sharma',
    patientUhid: 'UHID-2026-1390',
    age: 29,
    gender: 'Male',
    diagnosis: 'Acute Perforated Gangrenous Appendicitis with Localized Peritonitis',
    procedureName: 'Emergency Laparoscopic Appendectomy & Peritoneal Wash',
    surgeryType: 'Emergency Level 1',
    theatreId: 'theatre-5',
    theatreName: 'Emergency OT Suite 5 (Trauma 24x7)',
    leadSurgeon: 'Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Rajiv Menon',
    scrubNurse: 'Emergency OT Flying Squad',
    timeSlot: '15:00 – 17:00',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    pacStatus: 'Emergency Clearance (ASA Class III E)',
    asaGrade: 'ASA Class III E',
    mallampatiClass: 'Class II',
    npoStatus: '4 Hours NPO (Rapid Sequence Induction Planned)',
    airwayAssessment: 'RSI planned with cricoid pressure',
    cardiacClearance: 'Tachycardia HR 112/min secondary to sepsis/fever, resuscitated with crystalloids',
    crossmatchUnits: '2 Units PRBC Crossmatched',
    
    whoChecklistStatus: 'Emergency Protocol Initiated',
    whoChecklist: {
      signInDone: true,
      timeOutDone: false,
      signOutDone: false,
      patientConfirmed: true,
      siteMarked: true,
      anesthesiaSafetyCheck: true,
      oximeterFunctioning: true,
      allergyChecked: true,
      airwayAssessed: true,
      bloodLossRiskAssessed: true,
      teamIntroduced: false,
      antibioticGiven: true, // Piperacillin-Tazobactam 4.5g IV
      countsVerified: false,
      specimensLabeled: false
    },
    
    anesthesiaType: 'Rapid Sequence General Anesthesia with Suxamethonium & Propofol',
    estimatedBloodLoss: '80 ml',
    incisionTime: 'Emergency Standby',
    closureTime: 'Emergency Standby',
    implantsUsed: 'Endoloop PDS II Suture, 16F Abdominal Drain',
    spongeCountVerified: false,
    instrumentCountVerified: false,
    surgicalNotes: 'Patient transferred directly from Emergency Bay Red Zone with acute surgical abdomen. IV fluids and triple antibiotics running.',
    
    status: 'scheduled',
    pacuBay: 'Surgical ICU Bed 2',
    aldreteScore: 0,
    pacuStatus: 'Emergency surgical list'
  },
  {
    id: 'OT-CASE-2026-100',
    patientId: 'pat-0711',
    patientName: 'Geeta Nair',
    patientUhid: 'UHID-2026-0711',
    age: 52,
    gender: 'Female',
    diagnosis: 'Severe Dysfunctional Uterine Bleeding (Multiple Uterine Fibroids)',
    procedureName: 'Total Laparoscopic Hysterectomy with Bilateral Salpingectomy',
    surgeryType: 'Elective',
    theatreId: 'theatre-1',
    theatreName: 'Major OT 1 (General & Laparoscopy)',
    leadSurgeon: 'Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Sunita Rao',
    scrubNurse: 'Nurse Preeti Shinde',
    timeSlot: '06:30 – 08:15',
    scheduledDate: new Date().toISOString().split('T')[0],
    
    pacStatus: 'Cleared (ASA Class II)',
    asaGrade: 'ASA Class II',
    mallampatiClass: 'Class I',
    npoStatus: '8 Hours Verified',
    airwayAssessment: 'Normal airway',
    cardiacClearance: 'Cleared',
    crossmatchUnits: '2 Units PRBC',
    
    whoChecklistStatus: 'Completed (All 3 Phases)',
    whoChecklist: {
      signInDone: true,
      timeOutDone: true,
      signOutDone: true,
      patientConfirmed: true,
      siteMarked: true,
      anesthesiaSafetyCheck: true,
      oximeterFunctioning: true,
      allergyChecked: true,
      airwayAssessed: true,
      bloodLossRiskAssessed: true,
      teamIntroduced: true,
      antibioticGiven: true,
      countsVerified: true,
      specimensLabeled: true
    },
    
    anesthesiaType: 'General Anesthesia',
    estimatedBloodLoss: '110 ml',
    incisionTime: '06:45',
    closureTime: '08:10',
    implantsUsed: 'None',
    spongeCountVerified: true,
    instrumentCountVerified: true,
    surgicalNotes: 'Uneventful TLH. Uterus 14-week size removed vaginally with intact capsule. Hemostasis complete. Vault closed with 1-0 Vicryl.',
    
    status: 'discharged_ward',
    pacuBay: 'Transferred to Gynaecology Ward 204',
    aldreteScore: 10,
    pacuStatus: 'Successfully transferred to Post-Op Inpatient Ward'
  }
];

export const DEMO_OT_SURGEONS = [
  { id: 'surg-1', name: 'Dr. Sandeep Kulkarni', specialty: 'General, Laparoscopic & GI Surgery', department: 'General Surgery' },
  { id: 'surg-2', name: 'Dr. Pradeep K. Sharma', specialty: 'Orthopaedics, Joint Replacement & Trauma', department: 'Orthopaedics' },
  { id: 'surg-3', name: 'Dr. Harish Bahl', specialty: 'Neurosurgery & Spine Surgery', department: 'Neurosurgery' },
  { id: 'surg-4', name: 'Dr. Ananya Mukherjee', specialty: 'Obstetrics & Gynaecological Surgery', department: 'OB/GYN' },
  { id: 'surg-5', name: 'Dr. Rajiv Menon', specialty: 'Urology & Renal Transplant', department: 'Urology' }
];

export const DEMO_OT_ANESTHETISTS = [
  { id: 'anes-1', name: 'Dr. Sunita Rao', specialty: 'Chief of Anesthesiology & Critical Care' },
  { id: 'anes-2', name: 'Dr. Rajiv Menon', specialty: 'Consultant Neuro & Cardiac Anesthetist' },
  { id: 'anes-3', name: 'Dr. Ananya Mukherjee', specialty: 'Consultant Pediatric & General Anesthesia' }
];
