/**
 * Structured Reporting Templates for Radiologist Authoring
 */
export const REPORT_TEMPLATES = [
  {
    id: 'cxr-normal',
    name: 'Normal Chest Radiograph (PA View)',
    modality_id: 'XR',
    body_part: 'Thorax',
    technique: 'Single posteroanterior (PA) erect projection of the chest obtained at 120 kVp using automatic exposure control (AEC).',
    findings: 'The trachea is midline. Mediastinal and hilar contours are within normal limits. Cardiac silhouette is normal in size with cardiothoracic ratio < 0.50. Lung fields are clear with normal vascularity and bronchovascular branching. No focal consolidation, pneumothorax, or pleural effusion is identified. Both hemidiaphragms have normal contour and sharp costophrenic angles. Visualized thoracic osseous structures and soft tissues are unremarkable.',
    impression: 'Normal posteroanterior chest radiograph. No acute cardiopulmonary disease identified.',
    recommendations: 'No immediate imaging follow-up indicated.'
  },
  {
    id: 'hrct-chest',
    name: 'HRCT Thorax Protocol',
    modality_id: 'CT',
    body_part: 'Chest / Thorax',
    technique: 'High-resolution volumetric helical CT scan of the thorax performed with 1.0 mm slice collimation from lung apices to adrenal glands without intravenous contrast.',
    findings: 'Subpleural and basal predominant reticular opacities noted in bilateral lower lobes. Mild peripheral traction bronchiectasis and ground-glass attenuation. No honeycombing. No mediastinal or axillary lymphadenopathy. Pleural spaces are free of fluid. Visualized upper abdominal organs unremarkable.',
    impression: 'Bilateral basal reticulonodular opacities consistent with early interstitial lung disease (UIP/NSIP pattern). No acute infection or pulmonary mass.',
    recommendations: 'Correlation with pulmonary function tests (DLCO/PFT) and clinical evaluation by pulmonologist.'
  },
  {
    id: 'usg-abdomen',
    name: 'USG Whole Abdomen & Pelvis',
    modality_id: 'USG',
    body_part: 'Abdomen & Pelvis',
    technique: 'Real-time B-mode and color Doppler ultrasonography of the whole abdomen and pelvis utilizing 3.5 MHz curvilinear and 7.5 MHz linear transducers.',
    findings: 'Liver: Normal in size (13.8 cm) with uniform parenchymal echogenicity. No focal lesion or intrahepatic biliary radicle dilatation. Gallbladder: Well-distended with thin, smooth wall (< 3 mm). No intraluminal calculus, sludge, or pericholecystic fluid. Common bile duct measures 4.2 mm (normal). Spleen & Pancreas: Normal size and acoustic architecture. Kidneys: Both kidneys are normal in size, position, and contour with preserved corticomedullary differentiation. No calculus, hydronephrosis, or perinephric collection. Urinary Bladder: Smooth mucosal contour, well-distended. Pre- and post-void volumes unremarkable.',
    impression: 'Normal ultrasound evaluation of whole abdomen and pelvis. No evidence of cholelithiasis, cholecystitis, or nephrolithiasis.',
    recommendations: 'Clinical correlation advised.'
  },
  {
    id: 'mri-brain',
    name: 'MRI Brain Protocol (3.0T)',
    modality_id: 'MRI',
    body_part: 'Brain / Neuro',
    technique: 'Multiplanar multisequence MRI of the brain performed on a 3.0 Tesla magnet including Axial T1, T2, FLAIR, DWI/ADC, coronal T2, and sagittal T1 sequences, followed by post-contrast volumetric T1 MPRAGE.',
    findings: 'Normal signal intensity and gray-white matter differentiation throughout cerebral hemispheres, brainstem, and cerebellum. No acute restricted diffusion on DWI/ADC to suggest acute territorial infarction. Ventricular system, basal cisterns, and cortical sulci are within normal limits for age. No abnormal extra-axial fluid collections or mass effect. Post-contrast images demonstrate normal intracranial enhancement without pathological leptomeningeal or parenchymal enhancement.',
    impression: 'Normal MRI of the brain. No acute infarction, intracranial hemorrhage, space-occupying lesion, or abnormal intracranial enhancement.',
    recommendations: 'Clinical neurology correlation.'
  },
  {
    id: 'mammo-screening',
    name: 'Bilateral Screening Mammography',
    modality_id: 'MAMMO',
    body_part: 'Breast Bilateral',
    technique: 'Standard bilateral digital full-field mammography with mediolateral oblique (MLO) and craniocaudal (CC) views with computer-aided detection (CAD).',
    findings: 'The breasts demonstrate scattered areas of fibroglandular density (ACR Breast Density Category B). No suspicious dominant solid mass, architectural distortion, or clustered pleomorphic microcalcifications. Bilateral retroareolar regions and skin/nipple contours are normal. Bilateral axillae show benign-appearing lymph nodes with radiolucent fatty hila.',
    impression: 'BI-RADS Category 1: Negative. No mammographic evidence of malignancy.',
    recommendations: 'Continue routine annual screening mammography.'
  }
];

/**
 * Fallback baseline studies if backend API is cold
 */
export const INITIAL_FALLBACK_STUDIES = [
  {
    id: 'rad-seed-01',
    accession_number: 'ACC-2026-XR001',
    patient_id: 'demo-pt-01',
    patient_uhid: 'UHID-2026-0001',
    patient_name: 'Anita Sharma',
    patient_gender: 'Female',
    patient_dob: '1984-06-15',
    patient_mobile: '9876543210',
    modality_id: 'XR',
    modality_name: 'Digital Radiography (X-Ray)',
    modality_room: 'Radio Suite 1',
    study_description: 'Chest X-Ray (PA View Digital)',
    body_part: 'Thorax / Chest',
    clinical_indication: 'Persistent productive cough for 2 weeks, low-grade pyrexia. Rule out pneumonia or consolidation.',
    ordering_doctor_name: 'Dr. Robert House',
    ordering_doctor_code: 'DOC101',
    scheduled_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    performed_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    priority: 'routine',
    status: 'completed',
    technologist_name: 'Tech Rajesh Sharma',
    pacs_study_uid: '1.2.840.113619.2.55.3.2831172836.721',
    series_count: 1,
    instances_count: 2,
    is_demo: true,
    report_id: 'rep-01',
    report_status: 'verified',
    report_findings: 'Lungs are well-expanded with normal bronchovascular markings. No focal consolidation, pleural effusion, or pneumothorax.',
    report_impression: 'No acute cardiopulmonary disease. Clear lung fields.',
    report_critical_alert: false,
    report_verified_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    radiologist_name: 'Dr. Lisa Cuddy'
  },
  {
    id: 'rad-seed-02',
    accession_number: 'ACC-2026-CT002',
    patient_id: 'demo-pt-02',
    patient_uhid: 'UHID-2026-0002',
    patient_name: 'Vikram Joshi',
    patient_gender: 'Male',
    patient_dob: '1976-11-20',
    patient_mobile: '9876543211',
    modality_id: 'CT',
    modality_name: 'Computed Tomography (CT 128-Slice)',
    modality_room: 'CT Gantry Suite A',
    study_description: 'HRCT Thorax (Chest High Resolution)',
    body_part: 'Thorax / Pulmonary',
    clinical_indication: 'Suspected interstitial lung disease (ILD), dyspnea on exertion, bilateral basal crepitations.',
    ordering_doctor_name: 'Dr. Robert House',
    ordering_doctor_code: 'DOC101',
    scheduled_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    performed_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    priority: 'urgent',
    status: 'completed',
    technologist_name: 'Tech Sneha Nair',
    pacs_study_uid: '1.2.840.113619.2.55.3.9876543210.842',
    series_count: 3,
    instances_count: 184,
    is_demo: true,
    report_id: 'rep-02',
    report_status: 'draft',
    report_findings: 'Subpleural and basal predominant reticular opacities noted in bilateral lower lobes with traction bronchiectasis.',
    report_impression: 'Early Usual Interstitial Pneumonia (UIP) / NSIP pattern. No acute consolidation.',
    report_critical_alert: false,
    report_verified_at: null,
    radiologist_name: null
  },
  {
    id: 'rad-seed-03',
    accession_number: 'ACC-2026-MR003',
    patient_id: 'demo-pt-03',
    patient_uhid: 'UHID-2026-0003',
    patient_name: 'Sunita Rao',
    patient_gender: 'Female',
    patient_dob: '1992-04-08',
    patient_mobile: '9876543212',
    modality_id: 'MRI',
    modality_name: 'Magnetic Resonance Imaging (MRI 3.0T)',
    modality_room: 'Supercon Suite B',
    study_description: 'MRI Brain with Contrast (3.0T)',
    body_part: 'Neuro / Brain',
    clinical_indication: 'Severe acute onset thunderclap headache, episodic blurring of vision. Rule out vascular anomaly.',
    ordering_doctor_name: 'Dr. Alexander Fleming',
    ordering_doctor_code: 'DOC-5324',
    scheduled_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    performed_at: null,
    priority: 'stat',
    status: 'in_progress',
    technologist_name: 'Tech Arun Kumar',
    pacs_study_uid: '1.2.840.113619.2.55.3.1122334455.901',
    series_count: 6,
    instances_count: 0,
    is_demo: true,
    report_id: null,
    report_status: null
  },
  {
    id: 'rad-seed-04',
    accession_number: 'ACC-2026-US004',
    patient_id: 'demo-pt-04',
    patient_uhid: 'UHID-2026-0004',
    patient_name: 'Rohan Mehra',
    patient_gender: 'Male',
    patient_dob: '1989-08-25',
    patient_mobile: '9876543213',
    modality_id: 'USG',
    modality_name: 'Ultrasound & Color Doppler (USG)',
    modality_room: 'USG Room 2',
    study_description: 'USG Whole Abdomen & Pelvis',
    body_part: 'Abdomen & Pelvis',
    clinical_indication: 'Right upper quadrant post-prandial colic pain radiating to back. Rule out cholelithiasis.',
    ordering_doctor_name: 'Dr. Arindam Mitra',
    ordering_doctor_code: 'DOC-TR-01',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    performed_at: null,
    priority: 'urgent',
    status: 'arrived',
    technologist_name: 'Sonographer Dr. Kavita V',
    pacs_study_uid: '1.2.840.113619.2.55.3.5544332211.312',
    series_count: 2,
    instances_count: 0,
    is_demo: true,
    report_id: null,
    report_status: null
  },
  {
    id: 'rad-seed-05',
    accession_number: 'ACC-2026-MG005',
    patient_id: 'demo-pt-05',
    patient_uhid: 'UHID-2026-0005',
    patient_name: 'Geeta Deshmukh',
    patient_gender: 'Female',
    patient_dob: '1972-02-14',
    patient_mobile: '9876543214',
    modality_id: 'MAMMO',
    modality_name: 'Digital Full-Field Mammography',
    modality_room: 'Women Health Bay',
    study_description: 'Bilateral Digital Screening Mammography',
    body_part: 'Breast Bilateral',
    clinical_indication: 'Annual routine breast cancer screening. Age 52, family history of breast malignancy.',
    ordering_doctor_name: 'Dr. Gregory House',
    ordering_doctor_code: 'DOC-1792294330975',
    scheduled_at: new Date(Date.now() + 3600000 * 5).toISOString(),
    performed_at: null,
    priority: 'routine',
    status: 'scheduled',
    technologist_name: 'Tech Preeti S',
    pacs_study_uid: '1.2.840.113619.2.55.3.6677889900.115',
    series_count: 4,
    instances_count: 0,
    is_demo: true,
    report_id: null,
    report_status: null
  }
];

/**
 * High-definition anatomical slice simulation profiles for Zero-Footprint Viewer
 */
export const DICOM_SLICES_DATABASE = {
  XR: [
    {
      sliceIndex: 1,
      totalSlices: 1,
      view: 'Posteroanterior (PA) Erect',
      kvp: 120,
      mas: 3.2,
      thickness: 'Standard 2D Radiograph',
      windowWidth: 350,
      windowCenter: 40,
      description: 'PA Chest View demonstrating normal thoracic cage, bronchovascular branching, heart size, and clear costophrenic angles.'
    }
  ],
  CT: [
    {
      sliceIndex: 1,
      totalSlices: 5,
      view: 'Axial - Apical Thorax (T1-T2)',
      kvp: 120,
      mas: 180,
      thickness: '1.0 mm Slice',
      windowWidth: 1500,
      windowCenter: -600,
      description: 'Lung Apices: Normal bilateral apical pulmonary architecture. Trachea midline. Supraclavicular lymph node basins clear.'
    },
    {
      sliceIndex: 2,
      totalSlices: 5,
      view: 'Axial - Aortic Arch Level (T4)',
      kvp: 120,
      mas: 180,
      thickness: '1.0 mm Slice',
      windowWidth: 1500,
      windowCenter: -600,
      description: 'Aortic Arch & Carina: Normal caliber aortic arch, main pulmonary artery, right and left principal bronchi patent.'
    },
    {
      sliceIndex: 3,
      totalSlices: 5,
      view: 'Axial - Mid Cardiac Level (T7)',
      kvp: 120,
      mas: 180,
      thickness: '1.0 mm Slice',
      windowWidth: 1500,
      windowCenter: -600,
      description: 'Four-Chamber Cardiac Level: Normal cardiac chambers, ventricular septum intact, bilateral lower lobe bronchi.'
    },
    {
      sliceIndex: 4,
      totalSlices: 5,
      view: 'Axial - Basal Lung Parenchyma (T10)',
      kvp: 120,
      mas: 180,
      thickness: '1.0 mm Slice',
      windowWidth: 1500,
      windowCenter: -600,
      description: 'Basal Segments: Subpleural fine reticular opacities without honeycombing in posterior lower lobes.'
    },
    {
      sliceIndex: 5,
      totalSlices: 5,
      view: 'Axial - Diaphragm & Adrenal Level (T12-L1)',
      kvp: 120,
      mas: 180,
      thickness: '1.0 mm Slice',
      windowWidth: 400,
      windowCenter: 40,
      description: 'Lower Thorax & Upper Abdomen: Clear posterior diaphragmatic recesses. Bilateral adrenal limbs normal.'
    }
  ],
  MRI: [
    {
      sliceIndex: 1,
      totalSlices: 4,
      view: 'Axial T2 - Centrum Semiovale',
      kvp: null,
      mas: null,
      thickness: '4.0 mm 3.0T FSE',
      windowWidth: 120,
      windowCenter: 60,
      description: 'Centrum Semiovale: Symmetrical white matter without demyelinating plaques, edema, or microhemorrhage.'
    },
    {
      sliceIndex: 2,
      totalSlices: 4,
      view: 'Axial T2 - Lateral Ventricles & Basal Ganglia',
      kvp: null,
      mas: null,
      thickness: '4.0 mm 3.0T FSE',
      windowWidth: 120,
      windowCenter: 60,
      description: 'Basal Ganglia: Caudate heads, lentiform nuclei, and internal capsules symmetrical with normal signal.'
    },
    {
      sliceIndex: 3,
      totalSlices: 4,
      view: 'Axial FLAIR - Midbrain & Temporal Lobes',
      kvp: null,
      mas: null,
      thickness: '4.0 mm 3.0T FLAIR',
      windowWidth: 140,
      windowCenter: 70,
      description: 'Midbrain & Hippocampi: Normal hippocampal volume without signal abnormality. Sylvian fissures clear.'
    },
    {
      sliceIndex: 4,
      totalSlices: 4,
      view: 'Coronal T2 - Posterior Fossa & Cerebellum',
      kvp: null,
      mas: null,
      thickness: '4.0 mm 3.0T FSE',
      windowWidth: 120,
      windowCenter: 60,
      description: 'Posterior Fossa: Fourth ventricle midline, normal cerebellar folia, brainstem architecture intact.'
    }
  ],
  USG: [
    {
      sliceIndex: 1,
      totalSlices: 3,
      view: 'Subcostal Oblique - Liver & Gallbladder',
      kvp: null,
      mas: null,
      thickness: '3.5 MHz Acoustic Window',
      windowWidth: 255,
      windowCenter: 128,
      description: 'Right Upper Quadrant: Longitudinal acoustic window of gallbladder showing thin hyperechoic wall without acoustic shadowing.'
    },
    {
      sliceIndex: 2,
      totalSlices: 3,
      view: 'Transverse Epigastrium - Pancreas & Splenic Vein',
      kvp: null,
      mas: null,
      thickness: '3.5 MHz Acoustic Window',
      windowWidth: 255,
      windowCenter: 128,
      description: 'Epigastric Transverse: Normal pancreatic parenchyma anterior to the splenic vein. Main pancreatic duct non-dilated.'
    },
    {
      sliceIndex: 3,
      totalSlices: 3,
      view: 'Longitudinal Flank - Right Kidney',
      kvp: null,
      mas: null,
      thickness: '3.5 MHz Acoustic Window',
      windowWidth: 255,
      windowCenter: 128,
      description: 'Right Renal Bed: Bipolar length 10.4 cm, normal cortical echogenicity less than liver, clear central echo complex.'
    }
  ],
  MAMMO: [
    {
      sliceIndex: 1,
      totalSlices: 2,
      view: 'Right Mediolateral Oblique (R-MLO)',
      kvp: 28,
      mas: 75,
      thickness: 'Digital Full-Field Projection',
      windowWidth: 4000,
      windowCenter: 2000,
      description: 'Right MLO Projection: Pectoralis major muscle extends to nipple level. Fibroglandular density Category B without mass.'
    },
    {
      sliceIndex: 2,
      totalSlices: 2,
      view: 'Left Mediolateral Oblique (L-MLO)',
      kvp: 28,
      mas: 75,
      thickness: 'Digital Full-Field Projection',
      windowWidth: 4000,
      windowCenter: 2000,
      description: 'Left MLO Projection: Symmetrical fibroglandular distribution. No architectural distortion or pleomorphic microcalcifications.'
    }
  ]
};
