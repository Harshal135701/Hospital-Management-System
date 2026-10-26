/**
 * MedicsPrime Diet & Nutrition Demo Data & Clinical Taxonomy
 */

export const DIET_CATEGORIES = [
  { id: 'REGULAR', code: 'REG', name: 'Regular / Normal Diet', description: 'Standard balanced hospital nutritional diet.', color: '#0A4174' },
  { id: 'DIABETIC', code: 'DM', name: 'Diabetic / Low Glycemic Index', description: 'Controlled complex carbohydrates, high soluble fibre, zero refined sugar.', color: '#0284C7' },
  { id: 'PUREED', code: 'PUR', name: 'Soft / Pureed Mechanical', description: 'Blended texture for dysphagia, post-oral surgery, or poor dentition.', color: '#8B5CF6' },
  { id: 'CLEAR_LIQUID', code: 'CLQ', name: 'Clear Liquid Diet', description: 'Broth, clear juices, electrolyte water. Strictly no solid residues.', color: '#D97706' },
  { id: 'NPO', code: 'NPO', name: 'NPO (Nil Per Os - Strict Fasting)', description: 'Nothing by mouth. Pre-operative or acute GI bleed / bowel obstruction.', color: '#DC2626' },
  { id: 'RENAL', code: 'REN', name: 'Renal Diet (Low K / Na / Phos)', description: 'Restricted potassium, low sodium, controlled phosphorus, and regulated protein.', color: '#EA580C' },
  { id: 'CARDIAC', code: 'CARD', name: 'Cardiac Diet (Low Sodium & Saturated Fat)', description: '<2g sodium/day, lean protein, high soluble fiber, heart healthy.', color: '#E11D48' },
  { id: 'HIGH_PROTEIN', code: 'HIPRO', name: 'High Protein Recovery Diet', description: 'Post-trauma, burn recovery, oncological wound healing (1.5–2.0g/kg/day).', color: '#16A34A' }
];

export const ALLERGY_OPTIONS = [
  'Peanuts',
  'Gluten / Celiac',
  'Lactose / Dairy',
  'Shellfish & Seafood',
  'Soy & Soybeans',
  'Eggs',
  'Tree Nuts (Walnuts, Almonds)',
  'Citrus Fruits',
  'Artificial Sweeteners'
];

export const INITIAL_ASSESSMENTS = [
  {
    id: 'ass-01',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    patient_age: 52,
    patient_gender: 'Male',
    height_cm: 172,
    weight_kg: 74,
    bmi: 25.0,
    bmi_category: 'Overweight',
    swallowing_risk: 'Normal',
    allergies: ['Shellfish & Seafood'],
    daily_calories_target: 1950,
    daily_protein_target_g: 80,
    daily_fluid_target_ml: 2200,
    clinical_notes: 'Chemotherapy day care patient. Maintain high protein to prevent sarcopenia. Avoid spicy or acidic foods during cycle.',
    assessed_by: 'Dietitian Shilpa Nambiar, RD',
    assessed_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'ass-02',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    patient_age: 44,
    patient_gender: 'Female',
    height_cm: 158,
    weight_kg: 64,
    bmi: 25.6,
    bmi_category: 'Overweight',
    swallowing_risk: 'Normal',
    allergies: ['Lactose / Dairy'],
    daily_calories_target: 1650,
    daily_protein_target_g: 70,
    daily_fluid_target_ml: 1200, // Fluid restricted for dialysis
    clinical_notes: 'ESRD on maintenance hemodialysis. Strict fluid restriction to 1.2 L/day. Low potassium and low phosphate mandatory.',
    assessed_by: 'Dietitian Shilpa Nambiar, RD',
    assessed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'ass-03',
    patient_id: 'p-03',
    patient_name: 'Amitabh Sen',
    patient_uhid: 'UHID-2026-0348',
    patient_age: 63,
    patient_gender: 'Male',
    height_cm: 168,
    weight_kg: 68,
    bmi: 24.1,
    bmi_category: 'Normal weight',
    swallowing_risk: 'Mild Dysphagia',
    allergies: ['None reported'],
    daily_calories_target: 1800,
    daily_protein_target_g: 65,
    daily_fluid_target_ml: 2000,
    clinical_notes: 'Elderly patient post-cataract surgery. Mild chewing difficulty; recommends soft pureed food on post-op day 1.',
    assessed_by: 'Dietitian Shilpa Nambiar, RD',
    assessed_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_DIET_ORDERS = [
  {
    id: 'ord-01',
    patient_id: 'p-01',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    ward_bed: 'Day Care Bed 01',
    diet_category: 'HIGH_PROTEIN',
    diet_category_name: 'High Protein Recovery Diet',
    meal_instructions: 'Warm bland soup, boiled eggs or paneer, zero raw vegetables or unpeeled fruit.',
    restrictions: 'No shellfish, no hot chilies.',
    is_npo: false,
    effective_start: new Date().toISOString(),
    ordered_by: 'Dr. Sunita Rao',
    status: 'active'
  },
  {
    id: 'ord-02',
    patient_id: 'p-02',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    ward_bed: 'Dialysis Station 01',
    diet_category: 'RENAL',
    diet_category_name: 'Renal Diet (Low K / Na / Phos)',
    meal_instructions: 'Strict 1.2L fluid quota. Leached vegetables, low phosphorus dal, white rice.',
    restrictions: 'No citrus, no bananas, no coconut water, no milk.',
    is_npo: false,
    effective_start: new Date().toISOString(),
    ordered_by: 'Dr. Arindam Mitra',
    status: 'active'
  },
  {
    id: 'ord-03',
    patient_id: 'p-04',
    patient_name: 'Sunil Karmakar',
    patient_uhid: 'UHID-2026-0412',
    ward_bed: 'ICU Bed 03',
    diet_category: 'NPO',
    diet_category_name: 'NPO (Nil Per Os - Strict Fasting)',
    meal_instructions: 'PATIENT SCHEDULED FOR EMERGENCY LAPAROTOMY AT 16:00. STRICT NPO.',
    restrictions: 'DO NOT SERVE WATER, ICE CHIPS OR MEDICINES WITH ORAL FLUIDS.',
    is_npo: true,
    effective_start: new Date().toISOString(),
    ordered_by: 'Dr. Pradeep K. Sharma',
    status: 'active'
  },
  {
    id: 'ord-04',
    patient_id: 'p-03',
    patient_name: 'Amitabh Sen',
    patient_uhid: 'UHID-2026-0348',
    ward_bed: 'Day Care Bed 02',
    diet_category: 'PUREED',
    diet_category_name: 'Soft / Pureed Mechanical',
    meal_instructions: 'Mashed khichdi, strained vegetable puree, soft custard.',
    restrictions: 'No hard nuts or tough solids.',
    is_npo: false,
    effective_start: new Date().toISOString(),
    ordered_by: 'Dr. Pradeep K. Sharma',
    status: 'active'
  }
];

export const INITIAL_KITCHEN_BATCHES = [
  {
    id: 'bat-01',
    batch_number: 'KB-2026-LUNCH',
    meal_shift: 'Lunch',
    shift_time: '12:30 PM',
    status: 'Ready for Plating',
    diet_summary: {
      REGULAR: 34,
      DIABETIC: 18,
      PUREED: 9,
      CLEAR_LIQUID: 4,
      NPO: 6,
      RENAL: 7,
      CARDIAC: 11,
      HIGH_PROTEIN: 12
    },
    total_trays: 95,
    chef_lead: 'Master Chef Sanjoy Roy',
    inspected_by_dietitian: true
  },
  {
    id: 'bat-02',
    batch_number: 'KB-2026-DINNER',
    meal_shift: 'Dinner',
    shift_time: '07:30 PM',
    status: 'In Preparation',
    diet_summary: {
      REGULAR: 32,
      DIABETIC: 17,
      PUREED: 9,
      CLEAR_LIQUID: 3,
      NPO: 7,
      RENAL: 7,
      CARDIAC: 10,
      HIGH_PROTEIN: 11
    },
    total_trays: 89,
    chef_lead: 'Master Chef Sanjoy Roy',
    inspected_by_dietitian: false
  }
];

export const INITIAL_WARD_DELIVERIES = [
  {
    id: 'del-01',
    tray_barcode: 'TRAY-0104-L',
    patient_name: 'Rajesh Mukherjee',
    patient_uhid: 'UHID-2026-0104',
    ward: 'Day Care Lounge',
    bed: 'Station REC-01',
    meal_type: 'Lunch',
    diet_code: 'HIPRO',
    diet_name: 'High Protein Recovery',
    status: 'delivered',
    dispatched_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    temperature_c: '64.2°C',
    handover_nurse: 'Staff Nurse Sunita Das',
    notes: 'Delivered warm. Patient consumed 80% portion.'
  },
  {
    id: 'del-02',
    tray_barcode: 'TRAY-0219-L',
    patient_name: 'Priyanka Das',
    patient_uhid: 'UHID-2026-0219',
    ward: 'Dialysis Suite',
    bed: 'Station DIA-01',
    meal_type: 'Lunch',
    diet_code: 'REN',
    diet_name: 'Renal (Low K/Na)',
    status: 'in_transit',
    dispatched_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    delivered_at: null,
    temperature_c: '65.8°C',
    handover_nurse: 'In transit via Food Cart B',
    notes: 'Double checked fluid allowance: strictly 200 mL soup only.'
  },
  {
    id: 'del-03',
    tray_barcode: 'TRAY-0412-L',
    patient_name: 'Sunil Karmakar',
    patient_uhid: 'UHID-2026-0412',
    ward: 'ICU Block A',
    bed: 'Bed ICU-03',
    meal_type: 'Lunch',
    diet_code: 'NPO',
    diet_name: 'NPO (Fasting)',
    status: 'exception_returned',
    dispatched_at: null,
    delivered_at: null,
    temperature_c: 'N/A',
    handover_nurse: 'Kitchen Hold',
    notes: 'TRAY BLOCKED AT KITCHEN CHECKPOINT: Patient marked NPO by surgeon for 16:00 emergency surgery.'
  },
  {
    id: 'del-04',
    tray_barcode: 'TRAY-0348-L',
    patient_name: 'Amitabh Sen',
    patient_uhid: 'UHID-2026-0348',
    ward: 'Surgical Recovery Bay',
    bed: 'Bed BED-01',
    meal_type: 'Lunch',
    diet_code: 'PUR',
    diet_name: 'Soft Pureed',
    status: 'delivered',
    dispatched_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    delivered_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    temperature_c: '62.0°C',
    handover_nurse: 'Staff Nurse Bhaswati Ray',
    notes: 'Consumed smoothly without coughing or reflux.'
  }
];
