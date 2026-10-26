import {
  Pill,
  BookOpen,
  Clock,
  RotateCcw,
  Boxes
} from 'lucide-react';

/**
 * Module 25 — Pharmacy Management Submodules
 * Exactly 5 submodules preserving exact names and numbering.
 */
export const PHARMACY_SUBMODULES = [
  {
    id: '25.1',
    routeId: 'pharmacy:25.1',
    label: 'Prescription Dispensing (OPD & IPD)',
    shortLabel: 'Prescription Dispensing',
    icon: Pill,
    badge: 'Dispensing',
    description: 'Outpatient and inpatient electronic prescription queue, FIFO batch allocation, allergy checks, and invoice generation'
  },
  {
    id: '25.2',
    routeId: 'pharmacy:25.2',
    label: 'Medicine Master & Salt Information',
    shortLabel: 'Medicine Master',
    icon: BookOpen,
    badge: 'Formulary',
    description: 'Standardized drug formulary, generic salt composition, therapeutic classes, dosage routes, and regulatory schedules'
  },
  {
    id: '25.3',
    routeId: 'pharmacy:25.3',
    label: 'FIFO Batch & Expiry Management',
    shortLabel: 'FIFO & Expiry',
    icon: Clock,
    badge: 'FIFO Audit',
    description: 'First-In-First-Out batch ledger, remaining shelf-life countdown, critical near-expiry alerts, and quarantine controls'
  },
  {
    id: '25.4',
    routeId: 'pharmacy:25.4',
    label: 'IPD Unused Medicine Return & Credit',
    shortLabel: 'IPD Returns & Credit',
    icon: RotateCcw,
    badge: 'Returns',
    description: 'Inpatient unused medication return verification, sealed blister quality checks, credit note issuance, and restock routing'
  },
  {
    id: '25.5',
    routeId: 'pharmacy:25.5',
    label: 'Pharmacy Stock Indents & Reorder Alerts',
    shortLabel: 'Indents & Alerts',
    icon: Boxes,
    badge: 'Reorder',
    description: 'Internal ward and OT satellite pharmacy replenishment requisitions, stockout alarms, and auto-calculated reorder points'
  }
];

export const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Syrup / Suspension',
  'IV Infusion / Injection',
  'Ointment / Gel',
  'Eye / Ear Drops',
  'Inhaler / Respules',
  'Suppository'
];

export const ADMINISTRATION_ROUTES = [
  'Oral (PO)',
  'Intravenous (IV)',
  'Intramuscular (IM)',
  'Subcutaneous (SC)',
  'Topical',
  'Inhalation',
  'Ophthalmic',
  'Sublingual'
];

export const DRUG_SCHEDULES = [
  { value: 'OTC', label: 'Over-The-Counter (OTC)', color: 'teal' },
  { value: 'SCHEDULE_H', label: 'Schedule H (Prescription Required)', color: 'warning' },
  { value: 'SCHEDULE_H1', label: 'Schedule H1 (High-Risk Antibiotic / Monitor)', color: 'danger' },
  { value: 'SCHEDULE_X', label: 'Schedule X (Strict Narcotic / Controlled Substance)', color: 'purple' }
];

export const STORAGE_CONDITIONS = [
  'Room Temperature (15°C - 25°C)',
  'Cold Storage (2°C - 8°C / Refrigerator)',
  'Cool & Dry Place (< 20°C)',
  'Protect from Direct Light'
];

export const RETURN_CONDITIONS = [
  { value: 'SEALED_INTACT', label: 'Unopened & Intact Blister/Vial (Eligible for Restock)', eligible: true },
  { value: 'COLD_CHAIN_OK', label: 'Cold-Chain Unbroken & Verified (Eligible for Restock)', eligible: true },
  { value: 'OPENED_PARTIAL', label: 'Opened Strip / Cut Foil (Non-Restockable / Discard)', eligible: false },
  { value: 'DAMAGED_EXPIRED', label: 'Damaged Packaging / Contaminated (Quarantine Write-Off)', eligible: false }
];

export const RETURN_REASONS = [
  'Discontinued by Treating Consultant',
  'Patient Discharged from Inpatient Care',
  'Dosage Reduced by Physician',
  'Adverse Drug Event / Allergy Observed',
  'Switched to Alternative Molecule'
];

/**
 * Baseline Medicine Master Catalog
 */
export const INITIAL_MEDICINE_CATALOG = [
  {
    id: 'MED-101',
    code: 'DRUG-AUG-625',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    saltComposition: 'Amoxicillin Trihydrate 500mg + Potassium Clavulanate 125mg IP',
    dosageForm: 'Tablet',
    strength: '625mg',
    route: 'Oral (PO)',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    packSize: '10 Tablets / Strip',
    schedule: 'SCHEDULE_H',
    storage: 'Cool & Dry Place (< 20°C)',
    hsnCode: '300410',
    gstRate: 12,
    mrp: 215.50,
    unitRate: 172.40,
    status: 'Active',
    reorderLevel: 200,
    minStock: 100,
    maxStock: 800
  },
  {
    id: 'MED-102',
    code: 'DRUG-AZI-500',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    saltComposition: 'Azithromycin Dihydrate 500mg IP',
    dosageForm: 'Tablet',
    strength: '500mg',
    route: 'Oral (PO)',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    packSize: '5 Tablets / Strip',
    schedule: 'SCHEDULE_H1',
    storage: 'Room Temperature (15°C - 25°C)',
    hsnCode: '300420',
    gstRate: 12,
    mrp: 124.00,
    unitRate: 98.00,
    status: 'Active',
    reorderLevel: 150,
    minStock: 80,
    maxStock: 500
  },
  {
    id: 'MED-103',
    code: 'DRUG-DOL-650',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    saltComposition: 'Paracetamol 650mg IP',
    dosageForm: 'Tablet',
    strength: '650mg',
    route: 'Oral (PO)',
    manufacturer: 'Micro Labs Limited',
    packSize: '15 Tablets / Strip',
    schedule: 'OTC',
    storage: 'Room Temperature (15°C - 25°C)',
    hsnCode: '300490',
    gstRate: 12,
    mrp: 34.00,
    unitRate: 24.50,
    status: 'Active',
    reorderLevel: 500,
    minStock: 300,
    maxStock: 2500
  },
  {
    id: 'MED-104',
    code: 'DRUG-MER-1000',
    brandName: 'Meronem 1g IV',
    genericName: 'Meropenem',
    saltComposition: 'Meropenem Trihydrate 1000mg with Sodium Carbonate IP',
    dosageForm: 'IV Infusion / Injection',
    strength: '1g',
    route: 'Intravenous (IV)',
    manufacturer: 'AstraZeneca Pharma India',
    packSize: '1 Vial with SWFI Ampoule',
    schedule: 'SCHEDULE_H1',
    storage: 'Room Temperature (15°C - 25°C)',
    hsnCode: '300420',
    gstRate: 12,
    mrp: 1850.00,
    unitRate: 1420.00,
    status: 'Active',
    reorderLevel: 50,
    minStock: 20,
    maxStock: 150
  },
  {
    id: 'MED-105',
    code: 'DRUG-PAN-40',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole',
    saltComposition: 'Pantoprazole Sodium Gastro-resistant 40mg IP',
    dosageForm: 'Tablet',
    strength: '40mg',
    route: 'Oral (PO)',
    manufacturer: 'Sun Pharmaceutical Industries',
    packSize: '15 Tablets / Strip',
    schedule: 'SCHEDULE_H',
    storage: 'Room Temperature (15°C - 25°C)',
    hsnCode: '300490',
    gstRate: 12,
    mrp: 148.00,
    unitRate: 110.00,
    status: 'Active',
    reorderLevel: 250,
    minStock: 150,
    maxStock: 1000
  },
  {
    id: 'MED-106',
    code: 'DRUG-OND-04',
    brandName: 'Emeset 4mg IV',
    genericName: 'Ondansetron',
    saltComposition: 'Ondansetron Hydrochloride 2mg/ml (2ml Ampoule)',
    dosageForm: 'IV Infusion / Injection',
    strength: '4mg / 2ml',
    route: 'Intravenous (IV)',
    manufacturer: 'Cipla Limited',
    packSize: '1 Ampoule (2ml)',
    schedule: 'SCHEDULE_H',
    storage: 'Protect from Direct Light',
    hsnCode: '300490',
    gstRate: 12,
    mrp: 42.50,
    unitRate: 31.00,
    status: 'Active',
    reorderLevel: 100,
    minStock: 50,
    maxStock: 400
  },
  {
    id: 'MED-107',
    code: 'DRUG-TEL-40',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    saltComposition: 'Telmisartan 40mg IP',
    dosageForm: 'Tablet',
    strength: '40mg',
    route: 'Oral (PO)',
    manufacturer: 'Glenmark Pharmaceuticals Ltd',
    packSize: '30 Tablets / Pack',
    schedule: 'SCHEDULE_H',
    storage: 'Cool & Dry Place (< 20°C)',
    hsnCode: '300490',
    gstRate: 12,
    mrp: 230.00,
    unitRate: 180.00,
    status: 'Active',
    reorderLevel: 120,
    minStock: 60,
    maxStock: 600
  },
  {
    id: 'MED-108',
    code: 'DRUG-TRA-50',
    brandName: 'Tramazac 50mg',
    genericName: 'Tramadol Hydrochloride',
    saltComposition: 'Tramadol Hydrochloride 50mg IP',
    dosageForm: 'Capsule',
    strength: '50mg',
    route: 'Oral (PO)',
    manufacturer: 'Zydus Lifesciences',
    packSize: '10 Capsules / Strip',
    schedule: 'SCHEDULE_X',
    storage: 'Room Temperature (15°C - 25°C)',
    hsnCode: '300490',
    gstRate: 12,
    mrp: 85.00,
    unitRate: 64.00,
    status: 'Active',
    reorderLevel: 80,
    minStock: 30,
    maxStock: 300
  }
];

/**
 * Baseline FIFO Batches with Expiry Dates
 */
export const INITIAL_BATCH_INVENTORY = [
  {
    id: 'BATCH-001',
    medicineId: 'MED-101',
    medicineCode: 'DRUG-AUG-625',
    medicineName: 'Augmentin 625 Duo',
    batchNo: 'AG-9821',
    supplier: 'Apollo Medisurg Supplies LLP',
    grnNumber: 'GRN-2025-0812',
    receivedDate: '2025-08-14',
    expiryDate: '2027-04-30',
    receivedQty: 500,
    availableQty: 320,
    reservedQty: 20,
    mrp: 215.50,
    unitRate: 172.40,
    rackLocation: 'Rack A-01 (Oral Antibiotics)',
    status: 'Active (FIFO Primary)'
  },
  {
    id: 'BATCH-002',
    medicineId: 'MED-101',
    medicineCode: 'DRUG-AUG-625',
    medicineName: 'Augmentin 625 Duo',
    batchNo: 'AG-9904',
    supplier: 'Apollo Medisurg Supplies LLP',
    grnNumber: 'GRN-2025-1104',
    receivedDate: '2025-11-04',
    expiryDate: '2027-09-30',
    receivedQty: 400,
    availableQty: 400,
    reservedQty: 0,
    mrp: 215.50,
    unitRate: 172.40,
    rackLocation: 'Rack A-01 (Oral Antibiotics)',
    status: 'Active (FIFO Secondary)'
  },
  {
    id: 'BATCH-003',
    medicineId: 'MED-102',
    medicineCode: 'DRUG-AZI-500',
    medicineName: 'Azithral 500',
    batchNo: 'AZ-4410',
    supplier: 'Medtech Healthcare Logistics',
    grnNumber: 'GRN-2025-0310',
    receivedDate: '2025-03-10',
    expiryDate: '2026-11-15',
    receivedQty: 250,
    availableQty: 45,
    reservedQty: 5,
    mrp: 124.00,
    unitRate: 98.00,
    rackLocation: 'Rack A-03',
    status: 'Near Expiry Alert'
  },
  {
    id: 'BATCH-004',
    medicineId: 'MED-103',
    medicineCode: 'DRUG-DOL-650',
    medicineName: 'Dolo 650',
    batchNo: 'DL-7782',
    supplier: 'Sarji Central Medical Warehouse',
    grnNumber: 'GRN-2025-0901',
    receivedDate: '2025-09-01',
    expiryDate: '2028-02-28',
    receivedQty: 3000,
    availableQty: 1840,
    reservedQty: 60,
    mrp: 34.00,
    unitRate: 24.50,
    rackLocation: 'Rack B-01 (Analgesics)',
    status: 'Active (FIFO Primary)'
  },
  {
    id: 'BATCH-005',
    medicineId: 'MED-104',
    medicineCode: 'DRUG-MER-1000',
    medicineName: 'Meronem 1g IV',
    batchNo: 'MR-2109',
    supplier: 'AstraZeneca India Direct',
    grnNumber: 'GRN-2025-0720',
    receivedDate: '2025-07-20',
    expiryDate: '2027-08-31',
    receivedQty: 80,
    availableQty: 38,
    reservedQty: 4,
    mrp: 1850.00,
    unitRate: 1420.00,
    rackLocation: 'Cold Lock-Box C-02',
    status: 'Active (FIFO Primary)'
  },
  {
    id: 'BATCH-006',
    medicineId: 'MED-105',
    medicineCode: 'DRUG-PAN-40',
    medicineName: 'Pantocid 40',
    batchNo: 'PT-1102',
    supplier: 'Sun Pharma Distribution',
    grnNumber: 'GRN-2025-1011',
    receivedDate: '2025-10-11',
    expiryDate: '2027-10-31',
    receivedQty: 600,
    availableQty: 520,
    reservedQty: 15,
    mrp: 148.00,
    unitRate: 110.00,
    rackLocation: 'Rack D-02 (Antacids)',
    status: 'Active (FIFO Primary)'
  },
  {
    id: 'BATCH-007',
    medicineId: 'MED-106',
    medicineCode: 'DRUG-OND-04',
    medicineName: 'Emeset 4mg IV',
    batchNo: 'EM-8821',
    supplier: 'Cipla Therapeutics Distribution',
    grnNumber: 'GRN-2025-0418',
    receivedDate: '2025-04-18',
    expiryDate: '2026-11-05',
    receivedQty: 150,
    availableQty: 12,
    reservedQty: 0,
    mrp: 42.50,
    unitRate: 31.00,
    rackLocation: 'Rack D-04 (Antiemetics)',
    status: 'Near Expiry Alert'
  },
  {
    id: 'BATCH-008',
    medicineId: 'MED-108',
    medicineCode: 'DRUG-TRA-50',
    medicineName: 'Tramazac 50mg',
    batchNo: 'TR-0914',
    supplier: 'Zydus Lifesciences Direct',
    grnNumber: 'GRN-2025-0601',
    receivedDate: '2025-06-01',
    expiryDate: '2026-09-30',
    receivedQty: 100,
    availableQty: 0,
    reservedQty: 0,
    mrp: 85.00,
    unitRate: 64.00,
    rackLocation: 'Narcotic Vault (Safe 1)',
    status: 'Expired - Quarantined'
  }
];

/**
 * Baseline Prescription Queue (OPD & IPD)
 */
export const INITIAL_PRESCRIPTIONS_QUEUE = [
  {
    id: 'RX-2026-0811',
    prescriptionNo: 'RX-2026-0811',
    encounterNo: 'ENC-2026-0814',
    patientUhid: 'UHID-2026-0814',
    patientName: 'Devika Sengupta',
    patientAge: '38 Yrs',
    gender: 'female',
    visitType: 'OPD Outpatient',
    department: 'General Medicine',
    doctor: 'Dr. Amit Joshi',
    prescribedAt: '2026-10-26 09:30 AM',
    allergyWarning: 'Penicillin (Mild cutaneous rash)',
    status: 'Pending Dispensing',
    items: [
      {
        id: 'RXI-1',
        medicineId: 'MED-105',
        medicineName: 'Pantocid 40',
        strength: '40mg',
        dosageForm: 'Tablet',
        route: 'Oral (PO)',
        frequency: 'OD (Once Daily before breakfast)',
        duration: '15 Days',
        prescribedQty: 15,
        dispensedQty: 0,
        unitPrice: 9.86,
        allocatedBatch: 'PT-1102',
        batchStock: 520,
        batchExpiry: '2027-10'
      },
      {
        id: 'RXI-2',
        medicineId: 'MED-103',
        medicineName: 'Dolo 650',
        strength: '650mg',
        dosageForm: 'Tablet',
        route: 'Oral (PO)',
        frequency: 'TDS (Thrice Daily after food)',
        duration: '5 Days',
        prescribedQty: 15,
        dispensedQty: 0,
        unitPrice: 2.26,
        allocatedBatch: 'DL-7782',
        batchStock: 1840,
        batchExpiry: '2028-02'
      }
    ]
  },
  {
    id: 'RX-2026-0812',
    prescriptionNo: 'RX-2026-0812',
    encounterNo: 'ENC-2026-0922',
    patientUhid: 'UHID-2026-0922',
    patientName: 'Rajesh Narayan Verma',
    patientAge: '51 Yrs',
    gender: 'male',
    visitType: 'IPD Inpatient',
    wardBed: 'Male Medical Ward - Bed 104',
    department: 'Cardiology',
    doctor: 'Dr. Ananya Mehta',
    prescribedAt: '2026-10-26 10:15 AM',
    allergyWarning: 'No Known Drug Allergies (NKDA)',
    status: 'Pending Dispensing',
    items: [
      {
        id: 'RXI-3',
        medicineId: 'MED-107',
        medicineName: 'Telma 40',
        strength: '40mg',
        dosageForm: 'Tablet',
        route: 'Oral (PO)',
        frequency: 'OD (Morning)',
        duration: '30 Days',
        prescribedQty: 30,
        dispensedQty: 0,
        unitPrice: 7.66,
        allocatedBatch: 'TL-5512',
        batchStock: 120,
        batchExpiry: '2027-11'
      },
      {
        id: 'RXI-4',
        medicineId: 'MED-101',
        medicineName: 'Augmentin 625 Duo',
        strength: '625mg',
        dosageForm: 'Tablet',
        route: 'Oral (PO)',
        frequency: 'BD (Twice daily)',
        duration: '5 Days',
        prescribedQty: 10,
        dispensedQty: 0,
        unitPrice: 21.55,
        allocatedBatch: 'AG-9821',
        batchStock: 320,
        batchExpiry: '2027-04'
      }
    ]
  },
  {
    id: 'RX-2026-0813',
    prescriptionNo: 'RX-2026-0813',
    encounterNo: 'ENC-2026-1045',
    patientUhid: 'UHID-2026-1045',
    patientName: 'Amina Khatun',
    patientAge: '31 Yrs',
    gender: 'female',
    visitType: 'Emergency Triage',
    wardBed: 'Emergency Bay 02',
    department: 'Emergency & Trauma',
    doctor: 'Dr. Rajesh Borse',
    prescribedAt: '2026-10-26 11:00 AM',
    allergyWarning: 'No Known Drug Allergies (NKDA)',
    status: 'Pending Dispensing',
    items: [
      {
        id: 'RXI-5',
        medicineId: 'MED-104',
        medicineName: 'Meronem 1g IV',
        strength: '1g',
        dosageForm: 'IV Infusion / Injection',
        route: 'Intravenous (IV)',
        frequency: 'TDS (Every 8 hours in 100ml NS)',
        duration: '3 Days',
        prescribedQty: 9,
        dispensedQty: 0,
        unitPrice: 1850.00,
        allocatedBatch: 'MR-2109',
        batchStock: 38,
        batchExpiry: '2027-08'
      },
      {
        id: 'RXI-6',
        medicineId: 'MED-106',
        medicineName: 'Emeset 4mg IV',
        strength: '4mg / 2ml',
        dosageForm: 'IV Infusion / Injection',
        route: 'Intravenous (IV)',
        frequency: 'SOS (Slow IV push for nausea)',
        duration: '2 Days',
        prescribedQty: 4,
        dispensedQty: 0,
        unitPrice: 42.50,
        allocatedBatch: 'EM-8821',
        batchStock: 12,
        batchExpiry: '2026-11'
      }
    ]
  }
];

/**
 * Baseline IPD Medicine Returns
 */
export const INITIAL_IPD_RETURNS = [
  {
    id: 'RET-2026-012',
    creditNoteNo: 'CRN-2026-012',
    patientUhid: 'UHID-2026-0922',
    patientName: 'Rajesh Narayan Verma',
    wardBed: 'Male Medical Ward - Bed 104',
    ipdAdmissionNo: 'IPD-2026-0418',
    medicineName: 'Meronem 1g IV',
    batchNo: 'MR-2109',
    issuedQty: 6,
    returnedQty: 3,
    unitPrice: 1850.00,
    totalCredit: 5550.00,
    returnCondition: 'SEALED_INTACT',
    returnReason: 'Discontinued by Treating Consultant',
    status: 'Approved & Credited',
    inspectedBy: 'Chief Pharmacist R. Roy',
    date: '2026-10-25 04:30 PM'
  },
  {
    id: 'RET-2026-013',
    creditNoteNo: 'CRN-2026-013',
    patientUhid: 'UHID-2026-1180',
    patientName: 'Vikramaditya Bose',
    wardBed: 'ICU High Dependency Unit - Bed 03',
    ipdAdmissionNo: 'IPD-2026-0391',
    medicineName: 'Pantocid 40',
    batchNo: 'PT-1102',
    issuedQty: 20,
    returnedQty: 10,
    unitPrice: 9.86,
    totalCredit: 98.60,
    returnCondition: 'SEALED_INTACT',
    returnReason: 'Patient Discharged from Inpatient Care',
    status: 'Pending Verification',
    inspectedBy: 'Staff Pharmacist A. Sen',
    date: '2026-10-26 10:45 AM'
  }
];

/**
 * Baseline Stock Indents
 */
export const INITIAL_STOCK_INDENTS = [
  {
    id: 'IND-2026-081',
    indentNumber: 'IND-2026-081',
    requestingStore: 'Emergency Satellite Pharmacy',
    fulfillingStore: 'Central Hospital Warehouse Pharmacy',
    urgency: 'HIGH',
    requestedBy: 'Sister In-charge Priya Sharma',
    requestedAt: '2026-10-26 08:30 AM',
    status: 'Approved (Pending Dispatch)',
    itemsCount: 4,
    items: [
      { medicineName: 'Dolo 650', requestedQty: 300, approvedQty: 300, unit: 'Tablets' },
      { medicineName: 'Emeset 4mg IV', requestedQty: 50, approvedQty: 50, unit: 'Ampoules' },
      { medicineName: 'Meronem 1g IV', requestedQty: 15, approvedQty: 15, unit: 'Vials' },
      { medicineName: 'Pantocid 40', requestedQty: 100, approvedQty: 100, unit: 'Tablets' }
    ]
  },
  {
    id: 'IND-2026-082',
    indentNumber: 'IND-2026-082',
    requestingStore: 'Operation Theatre Pharmacy Sub-Store',
    fulfillingStore: 'Central Hospital Warehouse Pharmacy',
    urgency: 'NORMAL',
    requestedBy: 'OT Head Nurse Rekha Das',
    requestedAt: '2026-10-26 09:15 AM',
    status: 'Submitted',
    itemsCount: 2,
    items: [
      { medicineName: 'Tramazac 50mg', requestedQty: 40, approvedQty: 40, unit: 'Capsules' },
      { medicineName: 'Augmentin 625 Duo', requestedQty: 80, approvedQty: 80, unit: 'Tablets' }
    ]
  }
];
