// Comprehensive, realistic hospital mock data for Inventory and its 17 operational modules

export const INITIAL_STORE_ITEMS = [
  { id: 'ITM-1001', code: 'MED-IV-01', name: 'Ringer Lactate Infusion 500ml', category: 'Infusion Solutions', unit: 'Bottle', store: 'Main Central Store', currentStock: 450, minLevel: 100, maxLevel: 800, unitCost: 48, status: 'Normal' },
  { id: 'ITM-1002', code: 'SURG-GLV-75', name: 'Sterile Surgical Gloves 7.5', category: 'Surgical Consumables', unit: 'Pair', store: 'OT Sub-Store', currentStock: 85, minLevel: 150, maxLevel: 1000, unitCost: 35, status: 'Low Stock' },
  { id: 'ITM-1003', code: 'MED-INJ-P40', name: 'Pantoprazole 40mg IV Injection', category: 'Gastroenterology', unit: 'Vial', store: 'Main Central Store', currentStock: 320, minLevel: 80, maxLevel: 500, unitCost: 62, status: 'Normal' },
  { id: 'ITM-1004', code: 'DISP-SYR-05', name: 'Disposable Luer Lock Syringe 5ml', category: 'General Consumables', unit: 'Piece', store: 'Ward 3 Sub-Store', currentStock: 25, minLevel: 200, maxLevel: 1500, unitCost: 6.5, status: 'Critical Reorder' },
  { id: 'ITM-1005', code: 'SURG-SUT-20', name: 'Vicryl 2-0 Braided Absorbable Suture', category: 'Sutures & Ligatures', unit: 'Box (12)', store: 'OT Sub-Store', currentStock: 42, minLevel: 20, maxLevel: 100, unitCost: 1450, status: 'Normal' },
  { id: 'ITM-1006', code: 'DIAG-STRP-GL', name: 'Glucometer Test Strips (Blood Glucose)', category: 'Diagnostic Strips', unit: 'Pack (50)', store: 'ICU Sub-Store', currentStock: 14, minLevel: 25, maxLevel: 80, unitCost: 780, status: 'Low Stock' },
  { id: 'ITM-1007', code: 'PPE-MSK-N95', name: 'N95 NIOSH Certified Respirator Mask', category: 'PPE & Infection Control', unit: 'Piece', store: 'Main Central Store', currentStock: 680, minLevel: 200, maxLevel: 2000, unitCost: 45, status: 'Normal' },
  { id: 'ITM-1008', code: 'SURG-CAN-18', name: 'IV Cannula with Injection Port 18G Green', category: 'Vascular Access', unit: 'Piece', store: 'Emergency Floor Store', currentStock: 190, minLevel: 100, maxLevel: 600, unitCost: 28, status: 'Normal' }
];

export const INITIAL_STORE_REQUISITIONS = [
  { id: 'IND-2026-081', indentDate: '2026-10-24', fromDept: 'Emergency Trauma Care', requestedBy: 'Nurse Supervisor Reena Roy', itemsCount: 4, priority: 'Urgent', status: 'Pending Approval', remarks: 'Trauma bay stock depleted post road-traffic mass casualty' },
  { id: 'IND-2026-082', indentDate: '2026-10-23', fromDept: 'Operation Theatre Complex', requestedBy: 'Dr. Sandeep Kulkarni', itemsCount: 6, priority: 'Normal', status: 'Approved', remarks: 'Scheduled elective surgeries weekly replenishment' },
  { id: 'IND-2026-083', indentDate: '2026-10-22', fromDept: 'ICU & Critical Care', requestedBy: 'Staff Nurse Arunima Sen', itemsCount: 3, priority: 'High', status: 'Issued', remarks: 'Infusion fluids and disposable suction catheters' },
  { id: 'IND-2026-084', indentDate: '2026-10-21', fromDept: 'Inpatient Ward 3 (Female)', requestedBy: 'Sister Incharge Mary Kurian', itemsCount: 5, priority: 'Low', status: 'Rejected', remarks: 'Quantity requested exceeded monthly consumption ceiling' }
];

export const INITIAL_STORE_ISSUES = [
  { id: 'ISS-2026-104', issueDate: '2026-10-24', indentRef: 'IND-2026-082', toDept: 'Operation Theatre Complex', issuedBy: 'Store Officer B. Ramesh', totalItems: 6, issuedQty: 180, gatePassNumber: 'GP-9921', status: 'Dispatched' },
  { id: 'ISS-2026-103', issueDate: '2026-10-23', indentRef: 'IND-2026-083', toDept: 'ICU & Critical Care', issuedBy: 'Store Keeper Anand Mohan', totalItems: 3, issuedQty: 95, gatePassNumber: 'GP-9918', status: 'Received & Verified' },
  { id: 'ISS-2026-102', issueDate: '2026-10-21', indentRef: 'IND-2026-079', toDept: 'Day Care Oncology', issuedBy: 'Store Officer B. Ramesh', totalItems: 2, issuedQty: 50, gatePassNumber: 'GP-9904', status: 'Received & Verified' }
];

export const INITIAL_STOCK_AUDIT = [
  { id: 'AUD-01', itemCode: 'MED-IV-01', itemName: 'Ringer Lactate Infusion 500ml', systemStock: 450, physicalCount: 446, variance: -4, valueVariance: -192, reason: 'Broken during shelf stacking', auditor: 'Auditor P. K. Ghosh', auditDate: '2026-10-23', status: 'Under Review' },
  { id: 'AUD-02', itemCode: 'SURG-GLV-75', itemName: 'Sterile Surgical Gloves 7.5', systemStock: 85, physicalCount: 85, variance: 0, valueVariance: 0, reason: 'Zero variance', auditor: 'Auditor P. K. Ghosh', auditDate: '2026-10-23', status: 'Reconciled' },
  { id: 'AUD-03', itemCode: 'MED-INJ-P40', itemName: 'Pantoprazole 40mg IV Injection', systemStock: 320, physicalCount: 318, variance: -2, valueVariance: -124, reason: 'Unrecorded ward emergency draw', auditor: 'Lead Auditor Swati Deshmukh', auditDate: '2026-10-22', status: 'Under Review' },
  { id: 'AUD-04', itemCode: 'DISP-SYR-05', itemName: 'Disposable Luer Lock Syringe 5ml', systemStock: 25, physicalCount: 20, variance: -5, valueVariance: -32.5, reason: 'Discarded due to damaged packaging', auditor: 'Lead Auditor Swati Deshmukh', auditDate: '2026-10-22', status: 'Approved Adjustment' }
];

// Inpatient & Bed Management Mock
export const INITIAL_BEDS = [
  { id: 'BED-101', ward: 'General Ward - Male', floor: 'Floor 1', type: 'General', patientName: 'Rameshwar Teli', uhid: 'UHID-2026-0412', admittingDoc: 'Dr. Arindam Mitra', status: 'Occupied', cleaningStatus: 'Clean', admissionDate: '2026-10-20' },
  { id: 'BED-102', ward: 'General Ward - Male', floor: 'Floor 1', type: 'General', patientName: '', uhid: '', admittingDoc: '', status: 'Available', cleaningStatus: 'Clean', admissionDate: '' },
  { id: 'BED-103', ward: 'General Ward - Male', floor: 'Floor 1', type: 'General', patientName: 'Sanjay Deshmukh', uhid: 'UHID-2026-0518', admittingDoc: 'Dr. Sunita Rao', status: 'Occupied', cleaningStatus: 'Clean', admissionDate: '2026-10-22' },
  { id: 'BED-104', ward: 'General Ward - Male', floor: 'Floor 1', type: 'General', patientName: '', uhid: '', admittingDoc: '', status: 'Under Maintenance', cleaningStatus: 'Dirty', admissionDate: '' },
  { id: 'BED-201', ward: 'Special Private Room', floor: 'Floor 2', type: 'Private AC', patientName: 'Ananya Mukherjee', uhid: 'UHID-2026-0681', admittingDoc: 'Dr. Ananya Sharma', status: 'Occupied', cleaningStatus: 'Clean', admissionDate: '2026-10-21' },
  { id: 'BED-202', ward: 'Special Private Room', floor: 'Floor 2', type: 'Private AC', patientName: '', uhid: '', admittingDoc: '', status: 'Available', cleaningStatus: 'Needs Sanitization', admissionDate: '' },
  { id: 'BED-ICU-01', ward: 'Intensive Care Unit (ICU)', floor: 'Floor 3', type: 'ICU Critical', patientName: 'Gurdeep Singh', uhid: 'UHID-2026-0711', admittingDoc: 'Dr. Pradeep K. Sharma', status: 'Occupied', cleaningStatus: 'Clean', admissionDate: '2026-10-23' },
  { id: 'BED-ICU-02', ward: 'Intensive Care Unit (ICU)', floor: 'Floor 3', type: 'ICU Critical', patientName: '', uhid: '', admittingDoc: '', status: 'Available', cleaningStatus: 'Clean', admissionDate: '' }
];

export const INITIAL_IPD_ADMISSIONS = [
  { id: 'IPD-2026-091', uhid: 'UHID-2026-0412', patientName: 'Rameshwar Teli', age: 48, gender: 'Male', bedNumber: 'BED-101', ward: 'General Ward - Male', doctor: 'Dr. Arindam Mitra', diagnosis: 'Acute Bacterial Pneumonia', admitDate: '2026-10-20', los: 4, depositPaid: 25000, runningBill: 34500, status: 'Active' },
  { id: 'IPD-2026-092', uhid: 'UHID-2026-0518', patientName: 'Sanjay Deshmukh', age: 54, gender: 'Male', bedNumber: 'BED-103', ward: 'General Ward - Male', doctor: 'Dr. Sunita Rao', diagnosis: 'Uncontrolled Type 2 DM with Foot Ulcer', admitDate: '2026-10-22', los: 2, depositPaid: 20000, runningBill: 18400, status: 'Active' },
  { id: 'IPD-2026-093', uhid: 'UHID-2026-0681', patientName: 'Ananya Mukherjee', age: 34, gender: 'Female', bedNumber: 'BED-201', ward: 'Special Private Room', doctor: 'Dr. Ananya Sharma', diagnosis: 'Post-Lap Cholecystectomy Day 2', admitDate: '2026-10-21', los: 3, depositPaid: 50000, runningBill: 62000, status: 'Discharge Initiated' },
  { id: 'IPD-2026-094', uhid: 'UHID-2026-0711', patientName: 'Gurdeep Singh', age: 62, gender: 'Male', bedNumber: 'BED-ICU-01', ward: 'Intensive Care Unit (ICU)', doctor: 'Dr. Pradeep K. Sharma', diagnosis: 'Septic Shock post Perforated Appendix', admitDate: '2026-10-23', los: 1, depositPaid: 80000, runningBill: 95600, status: 'Active' }
];

// IVF & Fertility Mock Data
export const INITIAL_IVF_CYCLES = [
  { id: 'IVF-CYC-101', coupleId: 'CPL-2026-018', femalePartner: 'Pooja Bhatt (31)', malePartner: 'Rohan Bhatt (34)', protocol: 'Antagonist Protocol (GnRH)', stimulationDay: 'Day 9', triggerDate: '2026-10-26 21:30', oocytesExpected: 14, status: 'Active Stimulation' },
  { id: 'IVF-CYC-102', coupleId: 'CPL-2026-022', femalePartner: 'Sunita Joshi (35)', malePartner: 'Mahesh Joshi (37)', protocol: 'Long Agonist Protocol', stimulationDay: 'Day 12', triggerDate: '2026-10-24 22:00', oocytesExpected: 18, status: 'Trigger Scheduled' },
  { id: 'IVF-CYC-103', coupleId: 'CPL-2026-009', femalePartner: 'Farzana Parveen (29)', malePartner: 'Tariq Parveen (32)', protocol: 'Mild Stimulation / Mini IVF', stimulationDay: 'Completed', triggerDate: '2026-10-15', oocytesExpected: 8, status: 'Positive Beta-hCG (Clinical Pregnancy)' }
];

// Laboratory Mock Data
export const INITIAL_LAB_REQUISITIONS = [
  { id: 'LAB-REQ-401', uhid: 'UHID-2026-0412', patientName: 'Rameshwar Teli', testName: 'Complete Blood Count (CBC) + ESR', sampleType: 'EDTA Whole Blood', barcode: 'BC-991204', orderingDoctor: 'Dr. Arindam Mitra', status: 'Sample Collected', priority: 'Routine', panicAlert: false },
  { id: 'LAB-REQ-402', uhid: 'UHID-2026-0711', patientName: 'Gurdeep Singh', testName: 'Arterial Blood Gas (ABG) + Serum Lactate', sampleType: 'Heparinized Arterial Blood', barcode: 'BC-991205', orderingDoctor: 'Dr. Pradeep K. Sharma', status: 'Result Entered', priority: 'STAT', panicAlert: true },
  { id: 'LAB-REQ-403', uhid: 'UHID-2026-0518', patientName: 'Sanjay Deshmukh', testName: 'HbA1c & Fasting Lipid Profile', sampleType: 'Fluoride / Serum Clot Activator', barcode: 'BC-991206', orderingDoctor: 'Dr. Sunita Rao', status: 'Authorized & Released', priority: 'Routine', panicAlert: false },
  { id: 'LAB-REQ-404', uhid: 'UHID-2026-0814', patientName: 'Devika Sengupta', testName: 'Beta-hCG Quantitative Serum', sampleType: 'Serum Clot Activator', barcode: 'BC-991207', orderingDoctor: 'Dr. Ananya Sharma', status: 'Processing on Roche Cobas', priority: 'Urgent', panicAlert: false }
];

// Medical Records & HIM Mock Data
export const INITIAL_HIM_FILES = [
  { id: 'MRD-FL-801', uhid: 'UHID-2026-0412', patientName: 'Rameshwar Teli', icd10: 'J18.9 (Pneumonia, unspecified organism)', cptCode: '99223 (Initial Hospital Inpatient Care)', rackLocation: 'Compactor Bay C / Shelf 4', checkoutStatus: 'Available in Archives', borrower: 'None', returnDueDate: '-' },
  { id: 'MRD-FL-802', uhid: 'UHID-2026-0681', patientName: 'Ananya Mukherjee', icd10: 'K80.20 (Calculus of gallbladder without cholecystitis)', cptCode: '47562 (Laparoscopic cholecystectomy)', rackLocation: 'Compactor Bay A / Shelf 2', checkoutStatus: 'Checked Out', borrower: 'TPA Claims Desk (Officer Nidhi)', returnDueDate: '2026-10-27' },
  { id: 'MRD-FL-803', uhid: 'UHID-2026-0210', patientName: 'Kavita Rathore', icd10: 'O80 (Single spontaneous delivery)', cptCode: '59400 (Routine obstetric care including delivery)', rackLocation: 'Compactor Bay B / Shelf 1', checkoutStatus: 'Available in Archives', borrower: 'None', returnDueDate: '-' }
];

// Ward Nursing Mock Data
export const INITIAL_NURSING_VITALS = [
  { id: 'VIT-101', bedNumber: 'BED-101', patientName: 'Rameshwar Teli', time: '08:00 AM', bp: '124/82 mmHg', pulse: 78, temp: '98.6 °F', spo2: '97% on Room Air', respRate: 18, urineOutput: '450 ml', ivFluidIntake: '500 ml RL', nurse: 'Staff Nurse Reena Roy' },
  { id: 'VIT-102', bedNumber: 'BED-103', patientName: 'Sanjay Deshmukh', time: '08:00 AM', bp: '138/88 mmHg', pulse: 84, temp: '99.1 °F', spo2: '98% on Room Air', respRate: 20, urineOutput: '300 ml', ivFluidIntake: '250 ml NS', nurse: 'Staff Nurse Reena Roy' },
  { id: 'VIT-103', bedNumber: 'BED-ICU-01', patientName: 'Gurdeep Singh', time: '08:00 AM', bp: '98/62 mmHg (on Norad)', pulse: 104, temp: '100.4 °F', spo2: '94% on 4L O2', respRate: 24, urineOutput: '110 ml', ivFluidIntake: '700 ml Isolyt-P', nurse: 'Critical Care Nurse Priya' }
];

// OPD Mock Data
export const INITIAL_OPD_QUEUE = [
  { id: 'OPD-TOK-01', tokenNumber: 'T-101', uhid: 'UHID-2026-0814', patientName: 'Devika Sengupta', age: 29, gender: 'Female', doctor: 'Dr. Arindam Mitra', department: 'General Medicine', status: 'In Consultation', arrivalTime: '08:45 AM', visitSlipPrinted: true },
  { id: 'OPD-TOK-02', tokenNumber: 'T-102', uhid: 'UHID-2026-0922', patientName: 'Rajesh Verma', age: 44, gender: 'Male', doctor: 'Dr. Arindam Mitra', department: 'General Medicine', status: 'Waiting (Next)', arrivalTime: '09:05 AM', visitSlipPrinted: true },
  { id: 'OPD-TOK-03', tokenNumber: 'T-103', uhid: 'UHID-2026-1045', patientName: 'Amina Khatun', age: 36, gender: 'Female', doctor: 'Dr. Ananya Sharma', department: 'Obstetrics & Gynaecology', status: 'Vitals Recorded', arrivalTime: '09:15 AM', visitSlipPrinted: true },
  { id: 'OPD-TOK-04', tokenNumber: 'T-104', uhid: 'UHID-2026-1180', patientName: 'Vikramaditya Bose', age: 52, gender: 'Male', doctor: 'Dr. Pradeep K. Sharma', department: 'Cardiology', status: 'Waiting', arrivalTime: '09:20 AM', visitSlipPrinted: false }
];

// Operation Theatre Mock Data
export const INITIAL_OT_SCHEDULE = [
  { id: 'OT-SLOT-01', theatre: 'Major OT 1 (Laparoscopy Suite)', surgeryName: 'Laparoscopic Inguinal Hernia Mesh Repair', surgeon: 'Dr. Sandeep Kulkarni', anesthetist: 'Dr. Rajiv Menon', pacStatus: 'Cleared (ASA Grade II)', whoChecklistStatus: 'Sign-in Done', time: '09:00 AM - 11:30 AM', status: 'In Progress' },
  { id: 'OT-SLOT-02', theatre: 'Major OT 2 (Ortho / Joint Replacement)', surgeryName: 'Total Knee Arthroplasty (TKR) Left', surgeon: 'Dr. Harish Bahl', anesthetist: 'Dr. Smita Deshmukh', pacStatus: 'Cleared (ASA Grade II)', whoChecklistStatus: 'Pending Time-Out', time: '11:45 AM - 02:00 PM', status: 'Scheduled' },
  { id: 'OT-SLOT-03', theatre: 'Emergency OT Suite', surgeryName: 'Emergency Exploratory Laparotomy', surgeon: 'Dr. Sandeep Kulkarni', anesthetist: 'Dr. Rajiv Menon', pacStatus: 'Emergency High Risk', whoChecklistStatus: 'Completed (Sign-out)', time: '06:00 AM - 08:30 AM', status: 'In PACU Recovery' }
];

// Patient Registration Mock Data
export const INITIAL_PATIENT_RECORDS = [
  { id: 'PAT-01', uhid: 'UHID-2026-0814', fullName: 'Devika Sengupta', age: 29, gender: 'Female', phone: '+91 98301 24567', aadhaar: 'XXXX-XXXX-4512', address: 'B-402, Green Glen Heights, Salt Lake, Kolkata', bloodGroup: 'B positive', regDate: '2026-10-18', emergencyContact: 'S. Sengupta (Spouse) - 98301 24568' },
  { id: 'PAT-02', uhid: 'UHID-2026-0922', fullName: 'Rajesh Verma', age: 44, gender: 'Male', phone: '+91 94250 88219', aadhaar: 'XXXX-XXXX-8921', address: 'Plot 18, Gomti Nagar Extension, Lucknow', bloodGroup: 'O positive', regDate: '2026-10-19', emergencyContact: 'Sunita Verma (Wife) - 94250 88220' },
  { id: 'PAT-03', uhid: 'UHID-2026-1045', fullName: 'Amina Khatun', age: 36, gender: 'Female', phone: '+91 98112 34091', aadhaar: 'XXXX-XXXX-6610', address: 'House 88, Zakir Nagar, Okhla, New Delhi', bloodGroup: 'A positive', regDate: '2026-10-21', emergencyContact: 'Mohd. Salim (Brother) - 98112 34099' }
];

// Pharmacy Mock Data
export const INITIAL_PHARMACY_BATCHES = [
  { id: 'PHARM-B-01', drugName: 'Augmentin 625mg (Amoxycillin + Clavulanic Acid)', salt: 'Amoxicillin 500mg + Potassium Clavulanate 125mg', batchNo: 'AG-9821', expiryDate: '2027-04', stockQty: 480, mfc: 'GSK India Ltd', mrp: 215.50, unitRate: 172.40, status: 'Active (FIFO Primary)' },
  { id: 'PHARM-B-02', drugName: 'Azithromycin 500mg Tablet', salt: 'Azithromycin Dihydrate 500mg', batchNo: 'AZ-4410', expiryDate: '2026-12', stockQty: 95, mfc: 'Cipla Therapeutics', mrp: 120.00, unitRate: 94.00, status: 'Near Expiry Alert' },
  { id: 'PHARM-B-03', drugName: 'Paracetamol 650mg (Dolo)', salt: 'Paracetamol 650mg IP', batchNo: 'DL-7782', expiryDate: '2028-02', stockQty: 1800, mfc: 'Micro Labs', mrp: 34.00, unitRate: 24.50, status: 'Active (FIFO Primary)' },
  { id: 'PHARM-B-04', drugName: 'Meropenem 1g IV Injection', salt: 'Meropenem Trihydrate 1g with Sodium Carbonate', batchNo: 'MR-2109', expiryDate: '2027-08', stockQty: 42, mfc: 'AstraZeneca', mrp: 1850.00, unitRate: 1420.00, status: 'High-Value Antibiotic' }
];

// Purchase & Procurement Mock Data
export const INITIAL_PURCHASE_ORDERS = [
  { id: 'PO-2026-044', poDate: '2026-10-22', vendorName: 'Apollo Medisurg Supplies LLP', rfqRef: 'RFQ-2026-031', totalAmount: 184500, deliveryDueDate: '2026-10-30', approvedBy: 'Medical Director Dr. K. N. Sen', status: 'Approved & Dispatched', paymentTerms: 'Net 30 Days' },
  { id: 'PO-2026-045', poDate: '2026-10-23', vendorName: 'Medtronic India Diagnostic Div', rfqRef: 'RFQ-2026-033', totalAmount: 420000, deliveryDueDate: '2026-11-05', approvedBy: 'Finance Head S. Bhattacharya', status: 'Pending Approval', paymentTerms: '10% Advance, 90% against GRN' },
  { id: 'PO-2026-046', poDate: '2026-10-20', vendorName: 'B. Braun Medical India Pvt Ltd', rfqRef: 'RFQ-2026-028', totalAmount: 92800, deliveryDueDate: '2026-10-26', approvedBy: 'Medical Director Dr. K. N. Sen', status: 'GRN Inward Accepted', paymentTerms: 'Immediate RTGS' }
];

// Radiology Studies Mock Data
export const INITIAL_RADIOLOGY_STUDIES = [
  { id: 'RAD-ST-101', accessionNumber: 'ACC-88201', uhid: 'UHID-2026-0412', patientName: 'Rameshwar Teli', modality: 'Digital X-Ray', bodyPart: 'Chest PA View', studyDate: '2026-10-24 10:15', status: 'Reported & Verified', radiologist: 'Dr. Rajiv Menon (MD Radiodiagnosis)', dicomImagesCount: 4, pacsStatus: 'Online Archival Tier 1' },
  { id: 'RAD-ST-102', accessionNumber: 'ACC-88202', uhid: 'UHID-2026-0711', patientName: 'Gurdeep Singh', modality: 'CT Multi-Slice', bodyPart: 'Contrast Abdomen & Pelvis', studyDate: '2026-10-23 16:30', status: 'Report Authoring', radiologist: 'Dr. Rajiv Menon', dicomImagesCount: 320, pacsStatus: 'Online Archival Tier 1' },
  { id: 'RAD-ST-103', accessionNumber: 'ACC-88203', uhid: 'UHID-2026-0922', patientName: 'Rajesh Verma', modality: 'MRI 1.5 Tesla', bodyPart: 'Lumbar Spine with Screening', studyDate: '2026-10-24 11:45', status: 'Acquired on MWL', radiologist: 'Dr. Shweta Rastogi', dicomImagesCount: 180, pacsStatus: 'Online Archival Tier 1' }
];

// Retail OTC POS Items
export const INITIAL_RETAIL_CATALOG = [
  { id: 'OTC-01', barcode: '890103001', name: 'Digital Infrared Thermometer', price: 950, gst: 12, category: 'Medical Device', stock: 45 },
  { id: 'OTC-02', barcode: '890103002', name: 'Digital Finger Pulse Oximeter OLED', price: 1100, gst: 12, category: 'Medical Device', stock: 60 },
  { id: 'OTC-03', barcode: '890103003', name: 'Vicks VapoRub 50g Relief Ointment', price: 145, gst: 5, category: 'OTC Remedy', stock: 120 },
  { id: 'OTC-04', barcode: '890103004', name: 'Volini Pain Relief Gel 75g', price: 220, gst: 12, category: 'Topical Pain', stock: 80 },
  { id: 'OTC-05', barcode: '890103005', name: 'Electral ORS Sachets Box of 10', price: 215, gst: 5, category: 'Electrolyte Balance', stock: 200 }
];

// System Admin & Audit Mock
export const INITIAL_USER_SESSIONS = [
  { id: 'SESS-901', username: 'dr.arindam', name: 'Dr. Arindam Mitra', role: 'Consultant Physician', ip: '192.168.1.42', terminal: 'OPD Clinic Desk 3', loginTime: '2026-10-25 08:30 AM', status: 'Active' },
  { id: 'SESS-902', username: 'nurse.reena', name: 'Reena Roy', role: 'Staff Nurse Senior', ip: '192.168.1.88', terminal: 'Ward 1 Nursing Station', loginTime: '2026-10-25 07:45 AM', status: 'Active' },
  { id: 'SESS-903', username: 'cashier.amit', name: 'Amitabh Sen', role: 'Billing Cashier', ip: '192.168.1.15', terminal: 'Counter 2 POS Terminal', loginTime: '2026-10-25 08:15 AM', status: 'Active' },
  { id: 'SESS-904', username: 'admin.super', name: 'System Administrator', role: 'Super Admin', ip: '192.168.1.10', terminal: 'Server Room Console', loginTime: '2026-10-25 06:00 AM', status: 'Active' }
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'LOG-4401', timestamp: '2026-10-25 09:22:14', user: 'nurse.reena', module: 'Ward Nursing', event: 'MEDICATION_ADMINISTERED', details: 'Inj Pantoprazole 40mg given to UHID-2026-0412', status: 'Verified' },
  { id: 'LOG-4402', timestamp: '2026-10-25 09:18:02', user: 'dr.arindam', module: 'OPD Clinic', event: 'PRESCRIPTION_GENERATED', details: 'Rx generated for patient UHID-2026-0814', status: 'Verified' },
  { id: 'LOG-4403', timestamp: '2026-10-25 09:05:40', user: 'cashier.amit', module: 'Billing POS', event: 'RECEIPT_COLLECTED', details: 'Collected Rs 1,450 cash for Bill #REC-2026-9921', status: 'Verified' },
  { id: 'LOG-4404', timestamp: '2026-10-25 08:44:11', user: 'admin.super', module: 'RBAC Setup', event: 'PERMISSION_OVERRIDE', details: 'Granted Emergency Override privilege to Dr. Rajiv Menon', status: 'Security Flag' }
];

// Work Orders Mock
export const INITIAL_WORK_ORDERS = [
  { id: 'WO-2026-012', title: 'OT 1 Air Handling Unit (AHU) Hepa Filter Replacement', department: 'Biomedical & Engineering', priority: 'High', contractor: 'BlueStar CleanAir Services', estimatedCost: 38000, targetDate: '2026-10-28', status: 'Approved', approvalLevel: 'Final Engineering Head' },
  { id: 'WO-2026-013', title: 'Cath Lab Uninterruptible Power Supply (UPS) Battery Bank Audit', department: 'Electrical Services', priority: 'Urgent', contractor: 'Schneider Electric APC', estimatedCost: 65000, targetDate: '2026-10-26', status: 'In Execution', approvalLevel: 'Executive Director' },
  { id: 'WO-2026-014', title: 'Inpatient Ward 2 Plumbing and Bedhead Oxygen Pressure Valve Overhaul', department: 'Maintenance', priority: 'Medium', contractor: 'Hospital In-house Crew', estimatedCost: 14500, targetDate: '2026-10-31', status: 'Requisition Recorded', approvalLevel: 'Pending Supervisor' },
  { id: 'WO-2026-015', title: 'Dialysis Reverse Osmosis (RO) Plant Quarterly Membrane Descaling', department: 'Nephrology Engineering', priority: 'High', contractor: 'Aquafresh Industrial Systems', estimatedCost: 28000, targetDate: '2026-10-24', status: 'Receipt Confirmed & Closed', approvalLevel: 'Medical Superintendent' }
];
