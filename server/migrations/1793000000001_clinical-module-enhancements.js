/**
 * Clinical Module Enhancements Migration
 *
 * Adds dedicated columns for Consultation Desk observations,
 * systemic vitals/exam findings, detailed symptom onset/severity/surgical history,
 * order catalog master table, and progress notes lifecycle status/signing.
 */

exports.up = (pgm) => {
  // 1. Consultation Desk observations
  pgm.addColumns("consultation_encounters", {
    summary: { type: "text" },
    examination: { type: "text" },
    impression: { type: "text" },
    chief_complaint: { type: "text" },
  });

  // 2. Systemic physical examination findings & biometrics
  pgm.addColumns("vitals_records", {
    cvs: { type: "text" },
    rs: { type: "text" },
    abdomen: { type: "text" },
    cns: { type: "text" },
    bmi: { type: "numeric(5,2)" },
    temp_unit: { type: "varchar(5)", default: "C" },
  });

  // 3. Chief complaints & Clinical history attributes
  pgm.addColumns("clinical_histories", {
    onset_duration: { type: "text" },
    severity: { type: "varchar(50)" },
    aggravating_factors: { type: "text" },
    relieving_factors: { type: "text" },
    past_surgical_history: { type: "text" },
  });

  // 4. Provider Orders: support 'submitted' status and create diagnostic order catalog
  pgm.dropConstraint("provider_orders", "provider_order_status_check", { ifExists: true });
  pgm.addConstraint("provider_orders", "provider_order_status_check", {
    check: "status IN ('draft', 'placed', 'submitted', 'in_progress', 'completed', 'cancelled')",
  });

  pgm.createTable("clinical_order_catalog", {
    id: { type: "varchar(50)", primaryKey: true },
    code: { type: "varchar(50)", notNull: true, unique: true },
    name: { type: "varchar(200)", notNull: true },
    category: { type: "varchar(50)", notNull: true },
    department: { type: "varchar(100)", notNull: true },
    order_type: { type: "varchar(20)", notNull: true, default: "laboratory" },
    specimen: { type: "varchar(100)" },
    turnaround_time: { type: "varchar(100)" },
    description: { type: "text" },
    is_active: { type: "boolean", notNull: true, default: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("NOW()") },
  });

  pgm.addConstraint("clinical_order_catalog", "order_catalog_type_check", {
    check: "order_type IN ('medication', 'laboratory', 'imaging', 'procedure')",
  });

  pgm.createIndex("clinical_order_catalog", "category");
  pgm.createIndex("clinical_order_catalog", "is_active");

  // Seed default catalog items
  const catalogItems = [
    ['t-cbc', 'HEM-CBC-01', 'Complete Blood Count (CBC)', 'Hematology', 'Hematology Lab', 'laboratory', 'Whole Blood (EDTA)', '2 Hours', 'Includes Hb, TLC, DLC, Platelets, RBC indices'],
    ['t-esr', 'HEM-ESR-02', 'Erythrocyte Sedimentation Rate (ESR)', 'Hematology', 'Hematology Lab', 'laboratory', 'Whole Blood (Citrate)', '1 Hour', 'Westergren method marker of systemic inflammation'],
    ['t-coag', 'HEM-COAG-03', 'Coagulation Profile (PT/INR, aPTT)', 'Hematology', 'Hematology Lab', 'laboratory', 'Citrated Plasma', '3 Hours', 'Prothrombin time and activated partial thromboplastin time'],
    ['t-lft', 'BIO-LFT-01', 'Liver Function Panel (LFT)', 'Biochemistry', 'Clinical Biochemistry', 'laboratory', 'Serum (Gel Separator)', '4 Hours', 'Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein'],
    ['t-kft', 'BIO-KFT-02', 'Renal Function Panel (KFT / RFT)', 'Biochemistry', 'Clinical Biochemistry', 'laboratory', 'Serum (Gel Separator)', '3 Hours', 'Blood Urea, Serum Creatinine, Uric Acid, Electrolytes'],
    ['t-lipid', 'BIO-LIP-03', 'Lipid Profile (Fasting)', 'Biochemistry', 'Clinical Biochemistry', 'laboratory', 'Serum (Fasting 12h)', '4 Hours', 'Total Cholesterol, HDL, LDL, VLDL, Triglycerides'],
    ['t-hba1c', 'BIO-GLU-04', 'HbA1c & Fasting Plasma Glucose', 'Biochemistry', 'Clinical Biochemistry', 'laboratory', 'Whole Blood (EDTA) + Fluoride', '3 Hours', 'Glycated hemoglobin percentage and plasma glucose level'],
    ['t-trop', 'BIO-CAR-05', 'High-Sensitivity Troponin-I (hs-cTnI)', 'Biochemistry', 'Clinical Biochemistry', 'laboratory', 'Heparin Plasma', '45 Mins', 'Quantitative emergency cardiac biomarker for myocardial injury'],
    ['t-bg', 'BB-GRP-01', 'Blood Grouping & Rh Typing (Gel Card)', 'Blood Bank', 'Blood Bank Service', 'laboratory', 'Whole Blood (EDTA)', '1 Hour', 'Forward and reverse ABO blood grouping with Rh(D) confirmation'],
    ['t-xm', 'BB-XM-02', 'Crossmatch & Antibody Screen', 'Blood Bank', 'Blood Bank Service', 'laboratory', 'Serum + Donor Segment', '2 Hours', 'Antiglobulin crossmatching for transfusion safety'],
    ['t-cxr', 'RAD-CXR-01', 'Chest X-Ray (PA View Digital)', 'Radiology', 'Diagnostic Radiology', 'imaging', 'Non-invasive', '1 Hour', 'High-resolution digital radiograph of thoracic cavity'],
    ['t-ecg', 'CAR-ECG-01', '12-Lead Electrocardiogram (ECG)', 'Cardiology', 'Cardiology Diagnostics', 'procedure', 'Surface Electrodes', '30 Mins', 'Standard 12-lead diagnostic resting rhythm and ischemia evaluation'],
    ['t-echo', 'CAR-ECHO-02', '2D Transthoracic Echocardiography', 'Cardiology', 'Cardiology Diagnostics', 'procedure', 'Ultrasound Acoustic Window', '2 Hours', 'Transthoracic color doppler ventricular function and valvular evaluation'],
    ['t-usg-abd', 'RAD-USG-02', 'USG Whole Abdomen & Pelvis', 'Radiology', 'Diagnostic Radiology', 'imaging', 'Full Bladder Acoustic Window', '2 Hours', 'Real-time ultrasound evaluation of hepato-biliary, renal and pelvic organs'],
    ['t-ct-chest', 'RAD-CT-03', 'HRCT Thorax (Chest)', 'Radiology', 'Diagnostic Radiology', 'imaging', 'Low-dose helical CT', '3 Hours', 'High-resolution computed tomography of lungs and mediastinum'],
  ];

  for (const item of catalogItems) {
    pgm.sql(
      `INSERT INTO clinical_order_catalog (
         id, code, name, category, department, order_type, specimen, turnaround_time, description, is_active
       ) VALUES (
         '${item[0]}', '${item[1]}', '${item[2].replace(/'/g, "''")}', '${item[3]}', '${item[4]}', '${item[5]}',
         '${item[6].replace(/'/g, "''")}', '${item[7]}', '${item[8].replace(/'/g, "''")}', true
       ) ON CONFLICT (code) DO NOTHING`
    );
  }

  // 5. Clinical Progress Notes: status, signed_at, relaxed assessment/plan for drafts
  pgm.alterColumn("clinical_progress_notes", "assessment", { notNull: false });
  pgm.alterColumn("clinical_progress_notes", "plan", { notNull: false });

  pgm.addColumns("clinical_progress_notes", {
    status: { type: "varchar(20)", notNull: true, default: "finalized" },
    signed_at: { type: "timestamptz" },
    amended_from_note_id: {
      type: "uuid",
      references: "clinical_progress_notes",
      onDelete: "SET NULL",
    },
    amendment_reason: { type: "text" },
  });

  pgm.addConstraint("clinical_progress_notes", "progress_note_status_check", {
    check: "status IN ('draft', 'finalized', 'amended')",
  });

  pgm.createIndex("clinical_progress_notes", "status");
};

exports.down = (pgm) => {
  pgm.dropConstraint("clinical_progress_notes", "progress_note_status_check", { ifExists: true });
  pgm.dropColumns("clinical_progress_notes", [
    "status",
    "signed_at",
    "amended_from_note_id",
    "amendment_reason",
  ]);

  pgm.dropTable("clinical_order_catalog", { ifExists: true });

  pgm.dropConstraint("provider_orders", "provider_order_status_check", { ifExists: true });
  pgm.addConstraint("provider_orders", "provider_order_status_check", {
    check: "status IN ('draft', 'placed', 'in_progress', 'completed', 'cancelled')",
  });

  pgm.dropColumns("clinical_histories", [
    "onset_duration",
    "severity",
    "aggravating_factors",
    "relieving_factors",
    "past_surgical_history",
  ]);

  pgm.dropColumns("vitals_records", [
    "cvs",
    "rs",
    "abdomen",
    "cns",
    "bmi",
    "temp_unit",
  ]);

  pgm.dropColumns("consultation_encounters", [
    "summary",
    "examination",
    "impression",
    "chief_complaint",
  ]);
};
