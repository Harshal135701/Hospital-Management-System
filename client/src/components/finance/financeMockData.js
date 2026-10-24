/**
 * Realistic Hospital Finance & Accounts Mock Data
 * Standardized in INR (₹) for Hospital Management System (HMS)
 */

export const INITIAL_CHART_OF_ACCOUNTS = [
  // 1000 - Current Assets
  {
    code: '1010',
    name: 'Cash in Hand (OPD & IPD Cashier Desks)',
    category: 'asset',
    subType: 'Current Asset',
    balance: 142850,
    normalBalance: 'debit',
    description: 'Physical currency collected across OPD counters and emergency cashier booths.',
    isSystem: true
  },
  {
    code: '1020',
    name: 'HDFC Bank Operational A/c #9104',
    category: 'asset',
    subType: 'Current Asset',
    balance: 4865200,
    normalBalance: 'debit',
    description: 'Main operational checking account for vendor disbursements and doctor payouts.',
    isSystem: true
  },
  {
    code: '1030',
    name: 'SBI Healthcare Escrow A/c #1928',
    category: 'asset',
    subType: 'Current Asset',
    balance: 3218400,
    normalBalance: 'debit',
    description: 'Dedicated government health scheme escrow (Ayushman Bharat, CGHS, ECHS).',
    isSystem: true
  },
  {
    code: '1040',
    name: 'Accounts Receivable - TPA Insurance Claims',
    category: 'asset',
    subType: 'Current Asset',
    balance: 2845000,
    normalBalance: 'debit',
    description: 'Pending cashless pre-auth claim dossiers submitted to Star Health, HDFC Ergo, Medi Assist.',
    isSystem: true
  },
  {
    code: '1050',
    name: 'Accounts Receivable - Corporate & PSUs',
    category: 'asset',
    subType: 'Current Asset',
    balance: 980000,
    normalBalance: 'debit',
    description: 'Credit invoices billed to corporate tie-ups (TCS, Infosys, ONGC, Indian Oil).',
    isSystem: false
  },
  {
    code: '1060',
    name: 'Pharmacy & Surgical Stores Inventory',
    category: 'asset',
    subType: 'Current Asset',
    balance: 1892400,
    normalBalance: 'debit',
    description: 'Valuation of active pharmaceuticals, IV fluids, orthopedic implants, and disposable sutures.',
    isSystem: true
  },

  // 1500 - Fixed & Non-Current Assets
  {
    code: '1510',
    name: 'Hospital Land & Medical Wing Infrastructure',
    category: 'asset',
    subType: 'Fixed Asset',
    balance: 45000000,
    normalBalance: 'debit',
    description: 'Multi-specialty 150-bed clinical facility building and land parcel freehold.',
    isSystem: true
  },
  {
    code: '1520',
    name: 'Biomedical Machinery & Scanners (1.5T MRI / 128-Slice CT)',
    category: 'asset',
    subType: 'Fixed Asset',
    balance: 21500000,
    normalBalance: 'debit',
    description: 'Advanced clinical diagnostic assets including MRI, CT, and color Doppler ultrasound.',
    isSystem: true
  },
  {
    code: '1530',
    name: 'Modular Operation Theatre Instrumentation',
    category: 'asset',
    subType: 'Fixed Asset',
    balance: 6850000,
    normalBalance: 'debit',
    description: 'Karl Storz laparoscopic surgical towers, C-arm fluoroscopy, and anesthesia workstations.',
    isSystem: true
  },
  {
    code: '1540',
    name: 'Accumulated Depreciation - Medical Machinery',
    category: 'asset',
    subType: 'Contra Asset',
    balance: -3820000,
    normalBalance: 'credit',
    description: 'Cumulative written-down value depreciation provision on hospital fixed assets.',
    isSystem: true
  },

  // 2000 - Liabilities
  {
    code: '2010',
    name: 'Trade Payables - Pharmaceutical Vendors',
    category: 'liability',
    subType: 'Current Liability',
    balance: 1640000,
    normalBalance: 'credit',
    description: 'Inward purchase bills payable to Sun Pharma, Cipla, and Abbott Distributors.',
    isSystem: true
  },
  {
    code: '2020',
    name: 'Trade Payables - Surgical Implants & Consumables',
    category: 'liability',
    subType: 'Current Liability',
    balance: 1125000,
    normalBalance: 'credit',
    description: 'Orthopedic joint prosthetics, coronary stents, and surgical disposable supplies.',
    isSystem: true
  },
  {
    code: '2030',
    name: 'Doctor Revenue Share Payable',
    category: 'liability',
    subType: 'Current Liability',
    balance: 2480000,
    normalBalance: 'credit',
    description: 'Calculated clinical revenue share pool due for disbursement to visiting consultants.',
    isSystem: true
  },
  {
    code: '2040',
    name: 'Patient Advance & Caution Deposits',
    category: 'liability',
    subType: 'Current Liability',
    balance: 1450000,
    normalBalance: 'credit',
    description: 'Inpatient admission advance deposits refundable upon final discharge clearance.',
    isSystem: true
  },
  {
    code: '2050',
    name: 'Statutory TDS Payable (Sec 194J & 194C)',
    category: 'liability',
    subType: 'Current Liability',
    balance: 385000,
    normalBalance: 'credit',
    description: 'Withholding tax deducted on doctor professional fees and contractor payments.',
    isSystem: true
  },
  {
    code: '2060',
    name: 'Hospital GST Payable (Input Credit Adjusted)',
    category: 'liability',
    subType: 'Current Liability',
    balance: 242000,
    normalBalance: 'credit',
    description: 'Net GST liabilities on non-exempt hospital services, deluxe suites, and retail OTC sales.',
    isSystem: true
  },
  {
    code: '2510',
    name: 'SBI Medical Infrastructure Term Loan',
    category: 'liability',
    subType: 'Non-Current Liability',
    balance: 18000000,
    normalBalance: 'credit',
    description: 'Long-term 8.25% healthcare expansion borrowing for OT modular upgrade.',
    isSystem: true
  },

  // 3000 - Equity & Reserves
  {
    code: '3010',
    name: 'Hospital Corpus / Promoter Equity',
    category: 'equity',
    subType: 'Equity',
    balance: 35000000,
    normalBalance: 'credit',
    description: 'Founding capital contributed by physician promoters and institutional partners.',
    isSystem: true
  },
  {
    code: '3020',
    name: 'Retained Hospital Earnings & Surpluses',
    category: 'equity',
    subType: 'Equity',
    balance: 23151850,
    normalBalance: 'credit',
    description: 'Cumulative clinical retained operational reserves reinvested into healthcare technology.',
    isSystem: true
  },

  // 4000 - Operating Revenue
  {
    code: '4010',
    name: 'IPD Inpatient & Bed Nursing Revenue',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 6240000,
    normalBalance: 'credit',
    description: 'Revenue from general wards, semi-private, ICU beds, and inpatient nursing care.',
    isSystem: true
  },
  {
    code: '4020',
    name: 'OT Surgical & Anesthesia Fees',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 4890000,
    normalBalance: 'credit',
    description: 'Charges for surgical suite utilization, laparoscopy, and anesthesia monitoring.',
    isSystem: true
  },
  {
    code: '4030',
    name: 'OPD Doctor Consultation Fees',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 2650000,
    normalBalance: 'credit',
    description: 'Outpatient specialist consultation tokens and OPD clinic room billings.',
    isSystem: true
  },
  {
    code: '4040',
    name: 'Diagnostic Laboratory & Pathology Revenue',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 1980000,
    normalBalance: 'credit',
    description: 'Hematology, biochemistry, microbiology, and histopathology test requisitions.',
    isSystem: true
  },
  {
    code: '4050',
    name: 'Radiology, Ultrasound & CT Imaging Revenue',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 2230000,
    normalBalance: 'credit',
    description: 'Imaging billings from MRI, CT, high-resolution sonography, and digital X-rays.',
    isSystem: true
  },
  {
    code: '4060',
    name: 'Pharmacy Medicines & OTC Sales',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 3475000,
    normalBalance: 'credit',
    description: 'Prescription drug dispensing across hospital in-house 24x7 pharmacy counters.',
    isSystem: true
  },
  {
    code: '4070',
    name: 'Emergency Triage & Trauma Casualty Revenue',
    category: 'revenue',
    subType: 'Operating Revenue',
    balance: 1420000,
    normalBalance: 'credit',
    description: 'Level 1-4 triage assessment, trauma bay resuscitation, and emergency bedside care.',
    isSystem: true
  },

  // 5000 - Operating Expenses
  {
    code: '5010',
    name: 'Doctor Consultation & Surgical Share (Professional Fees)',
    category: 'expense',
    subType: 'Direct Expense',
    balance: 4850000,
    normalBalance: 'debit',
    description: 'Contracted revenue share payouts to specialist doctors and visiting surgeons.',
    isSystem: true
  },
  {
    code: '5020',
    name: 'Nursing & Clinical Staff Salaries',
    category: 'expense',
    subType: 'Operating Expense',
    balance: 3120000,
    normalBalance: 'debit',
    description: 'Monthly payroll for registered staff nurses, ward attendants, and OT technicians.',
    isSystem: true
  },
  {
    code: '5030',
    name: 'Surgical Consumables & Implants Consumption',
    category: 'expense',
    subType: 'Direct Expense',
    balance: 2460000,
    normalBalance: 'debit',
    description: 'Cost of surgical drapes, catheters, titanium mesh, orthopedic implants, and gloves.',
    isSystem: true
  },
  {
    code: '5040',
    name: 'Biomedical Equipment Maintenance & AMC/CMC',
    category: 'expense',
    subType: 'Operating Expense',
    balance: 840000,
    normalBalance: 'debit',
    description: 'Annual service contracts with GE, Philips, Siemens, and Olympus for calibration.',
    isSystem: true
  },
  {
    code: '5050',
    name: 'Medical Gases (Liquid Oxygen & Nitrous Oxide)',
    category: 'expense',
    subType: 'Direct Expense',
    balance: 580000,
    normalBalance: 'debit',
    description: 'Bulk cryogenic oxygen refilling and central pipeline medical gas manifold maintenance.',
    isSystem: true
  },
  {
    code: '5060',
    name: 'Hospital Electricity, Water & Backup Power',
    category: 'expense',
    subType: 'Operating Expense',
    balance: 1215000,
    normalBalance: 'debit',
    description: 'High-tension power tariffs and diesel generator fuel for uninterrupted ICU power.',
    isSystem: true
  },
  {
    code: '5070',
    name: 'Housekeeping, Bio-Medical Waste & Laundry',
    category: 'expense',
    subType: 'Operating Expense',
    balance: 490000,
    normalBalance: 'debit',
    description: 'Statutory biomedical color-coded waste incineration and autoclaved linen laundry.',
    isSystem: true
  },
  {
    code: '5080',
    name: 'Bank Gateway & Merchant POS Processing Fees',
    category: 'expense',
    subType: 'Financial Expense',
    balance: 145000,
    normalBalance: 'debit',
    description: 'Payment gateway MDR charges for patient debit card, credit card, and UPI swipes.',
    isSystem: true
  }
];

export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: 'jv-101',
    voucherNo: 'JV-2026-0091',
    date: '2026-10-23',
    accountCode: '5010',
    accountName: 'Doctor Consultation & Surgical Share',
    debit: 415000,
    credit: 0,
    narration: 'Provision for September consultant revenue share payable to Dr. Priya Sharma & Dr. Arun Sundaram'
  },
  {
    id: 'jv-102',
    voucherNo: 'JV-2026-0091',
    date: '2026-10-23',
    accountCode: '2030',
    accountName: 'Doctor Revenue Share Payable',
    debit: 0,
    credit: 373500,
    narration: 'Net payable credited to doctors pending bank disbursement'
  },
  {
    id: 'jv-103',
    voucherNo: 'JV-2026-0091',
    date: '2026-10-23',
    accountCode: '2050',
    accountName: 'Statutory TDS Payable (Sec 194J & 194C)',
    debit: 0,
    credit: 41500,
    narration: '10% TDS withholding deducted under Income Tax Sec 194J'
  },
  {
    id: 'jv-104',
    voucherNo: 'JV-2026-0092',
    date: '2026-10-22',
    accountCode: '1020',
    accountName: 'HDFC Bank Operational A/c #9104',
    debit: 785000,
    credit: 0,
    narration: 'Star Health TPA bulk cashless batch claim settlement received directly in bank'
  },
  {
    id: 'jv-105',
    voucherNo: 'JV-2026-0092',
    date: '2026-10-22',
    accountCode: '1040',
    accountName: 'Accounts Receivable - TPA Insurance Claims',
    debit: 0,
    credit: 785000,
    narration: 'Settlement credited against cleared TPA inpatient claim dossiers'
  },
  {
    id: 'jv-106',
    voucherNo: 'JV-2026-0093',
    date: '2026-10-21',
    accountCode: '2010',
    accountName: 'Trade Payables - Pharmaceutical Vendors',
    debit: 345000,
    credit: 0,
    narration: 'Payment voucher PV-2026-0841 disbursed to Sun Pharma Distributors'
  },
  {
    id: 'jv-107',
    voucherNo: 'JV-2026-0093',
    date: '2026-10-21',
    accountCode: '1020',
    accountName: 'HDFC Bank Operational A/c #9104',
    debit: 0,
    credit: 345000,
    narration: 'RTGS transfer ref #HDFCR5202610219401 cleared'
  },
  {
    id: 'jv-108',
    voucherNo: 'JV-2026-0094',
    date: '2026-10-20',
    accountCode: '1020',
    accountName: 'HDFC Bank Operational A/c #9104',
    debit: 210000,
    credit: 0,
    narration: 'Contra entry: Cash collected at OPD counters deposited to bank'
  },
  {
    id: 'jv-109',
    voucherNo: 'JV-2026-0094',
    date: '2026-10-20',
    accountCode: '1010',
    accountName: 'Cash in Hand (OPD & IPD Cashier Desks)',
    debit: 0,
    credit: 210000,
    narration: 'Cash deposit slip #CD-8812 verified by Head Cashier'
  },
  {
    id: 'jv-110',
    voucherNo: 'JV-2026-0095',
    date: '2026-10-19',
    accountCode: '5050',
    accountName: 'Medical Gases (Liquid Oxygen & Nitrous Oxide)',
    debit: 185000,
    credit: 0,
    narration: 'Bulk cryogenic medical liquid oxygen refilled by Linde India'
  },
  {
    id: 'jv-111',
    voucherNo: 'JV-2026-0095',
    date: '2026-10-19',
    accountCode: '1020',
    accountName: 'HDFC Bank Operational A/c #9104',
    debit: 0,
    credit: 185000,
    narration: 'NEFT transfer ref #HDFCN5202610198124'
  }
];

export const INITIAL_VOUCHERS = [
  {
    id: 'vch-1',
    voucherNo: 'PV-2026-0841',
    type: 'payment',
    date: '2026-10-23',
    entityName: 'Sun Pharma Distributors Ltd.',
    department: 'Pharmacy & Surgical Stores',
    accountCode: '2010',
    accountName: 'Trade Payables - Pharmaceutical Vendors',
    amount: 345000,
    tdsAmount: 0,
    netAmount: 345000,
    paymentMode: 'neft_rtgs',
    referenceNo: 'RTGS/HDFCR5202610219401',
    status: 'paid',
    authorizedBy: 'Dr. Alok Verma (Medical Director)',
    narration: 'Bulk purchase of critical antibiotics, anesthesia induction agents, and cardiac emergency ampoules.'
  },
  {
    id: 'vch-2',
    voucherNo: 'PV-2026-0842',
    type: 'payment',
    date: '2026-10-23',
    entityName: 'Dr. Priya Sharma (Consultant IVF)',
    department: 'Reproductive Medicine / IVF',
    accountCode: '2030',
    accountName: 'Doctor Revenue Share Payable',
    amount: 415000,
    tdsAmount: 41500,
    netAmount: 373500,
    paymentMode: 'neft_rtgs',
    referenceNo: 'NEFT/HDFCN5202610237719',
    status: 'paid',
    authorizedBy: 'CFO Office / Accounts',
    narration: 'Consultant share for 38 Oocyte Retrievas and Embryo Transfers completed in September 2026.'
  },
  {
    id: 'vch-3',
    voucherNo: 'PV-2026-0843',
    type: 'payment',
    date: '2026-10-22',
    entityName: 'Linde India Industrial & Medical Gases',
    department: 'Engineering & Maintenance',
    accountCode: '5050',
    accountName: 'Medical Gases (Liquid Oxygen)',
    amount: 185000,
    tdsAmount: 3700,
    netAmount: 181300,
    paymentMode: 'neft_rtgs',
    referenceNo: 'NEFT/HDFCN5202610224190',
    status: 'approved',
    authorizedBy: 'Facility General Manager',
    narration: 'Refill of 6,000 Liter cryogenic liquid medical oxygen vacuum insulated tank.'
  },
  {
    id: 'vch-4',
    voucherNo: 'PV-2026-0844',
    type: 'payment',
    date: '2026-10-22',
    entityName: 'GE Healthcare South Asia Ltd.',
    department: 'Radiology & Imaging',
    accountCode: '5040',
    accountName: 'Biomedical Equipment Maintenance & AMC',
    amount: 260000,
    tdsAmount: 5200,
    netAmount: 254800,
    paymentMode: 'cheque',
    referenceNo: 'CHQ #004812 (HDFC)',
    status: 'pending',
    authorizedBy: 'Biomedical Lead Officer',
    narration: 'Comprehensive AMC installment for 128-slice CT Optima scanner including tube warranty.'
  },
  {
    id: 'vch-5',
    voucherNo: 'RV-2026-0419',
    type: 'receipt',
    date: '2026-10-22',
    entityName: 'Star Health & Allied Insurance TPA',
    department: 'Corporate TPA Billing',
    accountCode: '1040',
    accountName: 'Accounts Receivable - TPA Claims',
    amount: 785000,
    tdsAmount: 0,
    netAmount: 785000,
    paymentMode: 'neft_rtgs',
    referenceNo: 'UTR/CMS9202610228834',
    status: 'paid',
    authorizedBy: 'TPA Desk Supervisor',
    narration: 'Batch electronic settlement for 14 inpatient cashless claims discharged in Sep-Oct.'
  },
  {
    id: 'vch-6',
    voucherNo: 'RV-2026-0420',
    type: 'receipt',
    date: '2026-10-21',
    entityName: 'HDFC ERGO General Insurance Co.',
    department: 'Corporate TPA Billing',
    accountCode: '1040',
    accountName: 'Accounts Receivable - TPA Claims',
    amount: 420000,
    tdsAmount: 0,
    netAmount: 420000,
    paymentMode: 'neft_rtgs',
    referenceNo: 'UTR/HDFCTPA2026102199',
    status: 'paid',
    authorizedBy: 'Chief Billing Officer',
    narration: 'Cashless pre-auth claim clearance for cardiac and orthopedic inpatient packages.'
  },
  {
    id: 'vch-7',
    voucherNo: 'CV-2026-0112',
    type: 'contra',
    date: '2026-10-21',
    entityName: 'Hospital Central Cash Office',
    department: 'Accounts & Cashiers',
    accountCode: '1020',
    accountName: 'HDFC Bank Operational A/c #9104',
    amount: 210000,
    tdsAmount: 0,
    netAmount: 210000,
    paymentMode: 'cash',
    referenceNo: 'DEPOSIT SLIP #CD-8812',
    status: 'paid',
    authorizedBy: 'Head Cashier',
    narration: 'Cash collection remittance from 4 OPD counters deposited into HDFC main checking branch.'
  },
  {
    id: 'vch-8',
    voucherNo: 'PV-2026-0845',
    type: 'payment',
    date: '2026-10-20',
    entityName: 'Synergy Waste Solutions Pvt. Ltd.',
    department: 'Hospital Infection Control',
    accountCode: '5070',
    accountName: 'Housekeeping, Bio-Medical Waste & Laundry',
    amount: 72500,
    tdsAmount: 1450,
    netAmount: 71050,
    paymentMode: 'upi_pos',
    referenceNo: 'UPI/629019284102',
    status: 'approved',
    authorizedBy: 'Infection Control Officer',
    narration: 'October charges for collection, barcode tracking, and incineration of red/yellow bio-waste.'
  },
  {
    id: 'vch-9',
    voucherNo: 'RV-2026-0421',
    type: 'receipt',
    date: '2026-10-19',
    entityName: 'Apollo Municipal Health Department',
    department: 'Administration',
    accountCode: '1030',
    accountName: 'SBI Healthcare Escrow A/c #1928',
    amount: 350000,
    tdsAmount: 0,
    netAmount: 350000,
    paymentMode: 'neft_rtgs',
    referenceNo: 'RBI/GOV920261019001',
    status: 'paid',
    authorizedBy: 'Medical Superintendent',
    narration: 'Reimbursement for institutional immunization drives and pediatric health camps.'
  },
  {
    id: 'vch-10',
    voucherNo: 'PV-2026-0846',
    type: 'payment',
    date: '2026-10-19',
    entityName: 'Ethicon EndoSurgery (Johnson & Johnson)',
    department: 'Operation Theatre',
    accountCode: '2020',
    accountName: 'Trade Payables - Surgical Implants & Consumables',
    amount: 195000,
    tdsAmount: 0,
    netAmount: 195000,
    paymentMode: 'neft_rtgs',
    referenceNo: 'NEFT/HDFCN5202610191244',
    status: 'pending',
    authorizedBy: 'OT In-Charge Sister',
    narration: 'Procurement of harmonic scalpel shears, titanium vascular clips, and endoscopic staplers.'
  }
];

export const INITIAL_DOCTORS_REVENUE_SHARE = [
  {
    id: 'doc-1',
    name: 'Dr. Priya Sharma',
    department: 'Reproductive Medicine / IVF',
    designation: 'Senior Consultant & HOD',
    casesCount: { opd: 142, procedures: 38 },
    opdShareRate: 70,
    procedureShareRate: 65,
    totalBillings: 1840000,
    doctorGrossShare: 1225000,
    hospitalRetained: 615000,
    tdsRate: 10,
    tdsAmount: 122500,
    netPayout: 1102500,
    status: 'disbursed',
    paidDate: '2026-10-23',
    voucherRef: 'PV-2026-0842',
    bankAccount: 'HDFC Bank A/c 50100294102914, IFSC: HDFC0000060',
    panNumber: 'AAAPS4821K',
    cases: [
      { id: 'c-101', patient: 'Ananya Deshmukh', uhid: 'UHID-2026-4412', date: '2026-10-04', service: 'ICSI Egg Retrieval Protocol', billAmount: 75000, sharePct: 65, doctorAmount: 48750 },
      { id: 'c-102', patient: 'Meera Sengupta', uhid: 'UHID-2026-4489', date: '2026-10-07', service: 'Blastocyst Embryo Transfer', billAmount: 55000, sharePct: 65, doctorAmount: 35750 },
      { id: 'c-103', patient: 'Pooja Agarwal', uhid: 'UHID-2026-4510', date: '2026-10-11', service: 'IVF Stimulation & USG Tracking', billAmount: 22000, sharePct: 70, doctorAmount: 15400 },
      { id: 'c-104', patient: 'Ritu Varma', uhid: 'UHID-2026-4560', date: '2026-10-15', service: 'Fertility Specialist Consultation', billAmount: 1800, sharePct: 70, doctorAmount: 1260 },
      { id: 'c-105', patient: 'Sunita Joshi', uhid: 'UHID-2026-4612', date: '2026-10-18', service: 'Oocyte Cryopreservation Batch', billAmount: 60000, sharePct: 65, doctorAmount: 39000 }
    ]
  },
  {
    id: 'doc-2',
    name: 'Dr. Arun Sundaram',
    department: 'General & Laparoscopic Surgery',
    designation: 'Chief Surgical Consultant',
    casesCount: { opd: 98, procedures: 24 },
    opdShareRate: 65,
    procedureShareRate: 60,
    totalBillings: 2280000,
    doctorGrossShare: 1395000,
    hospitalRetained: 885000,
    tdsRate: 10,
    tdsAmount: 139500,
    netPayout: 1255500,
    status: 'calculated',
    paidDate: null,
    voucherRef: null,
    bankAccount: 'ICICI Bank A/c 001201948211, IFSC: ICIC0000012',
    panNumber: 'ABTPS9120M',
    cases: [
      { id: 'c-201', patient: 'Rameshwar Patil', uhid: 'UHID-2026-3910', date: '2026-10-03', service: 'Laparoscopic Cholecystectomy', billAmount: 95000, sharePct: 60, doctorAmount: 57000 },
      { id: 'c-202', patient: 'Vikram Sethi', uhid: 'UHID-2026-4102', date: '2026-10-08', service: 'Inguinal Hernia Mesh Repair', billAmount: 70000, sharePct: 60, doctorAmount: 42000 },
      { id: 'c-203', patient: 'Gaurav Kulkarni', uhid: 'UHID-2026-4221', date: '2026-10-14', service: 'Emergency Appendectomy OT', billAmount: 85000, sharePct: 60, doctorAmount: 51000 },
      { id: 'c-204', patient: 'Sunil Rao', uhid: 'UHID-2026-4309', date: '2026-10-19', service: 'Post-Surgical Review & Dressing', billAmount: 1500, sharePct: 65, doctorAmount: 975 }
    ]
  },
  {
    id: 'doc-3',
    name: 'Dr. Rajesh Kumar',
    department: 'Emergency & Trauma Care',
    designation: 'HOD Emergency Medicine',
    casesCount: { opd: 185, procedures: 14 },
    opdShareRate: 60,
    procedureShareRate: 55,
    totalBillings: 960000,
    doctorGrossShare: 576000,
    hospitalRetained: 384000,
    tdsRate: 10,
    tdsAmount: 57600,
    netPayout: 518400,
    status: 'calculated',
    paidDate: null,
    voucherRef: null,
    bankAccount: 'State Bank of India A/c 30194829104, IFSC: SBIN0004120',
    panNumber: 'BKRPR7712E',
    cases: [
      { id: 'c-301', patient: 'Deepak Tawde', uhid: 'UHID-2026-4550', date: '2026-10-05', service: 'Level 1 Polytrauma Resuscitation', billAmount: 35000, sharePct: 55, doctorAmount: 19250 },
      { id: 'c-302', patient: 'Farhan Khan', uhid: 'UHID-2026-4610', date: '2026-10-10', service: 'Acute Cardiac Stabilization & Defibrillation', billAmount: 42000, sharePct: 55, doctorAmount: 23100 },
      { id: 'c-303', patient: 'Sanjay Shinde', uhid: 'UHID-2026-4678', date: '2026-10-16', service: 'Casualty MLC Medicolegal Consultation', billAmount: 2500, sharePct: 60, doctorAmount: 1500 }
    ]
  },
  {
    id: 'doc-4',
    name: 'Dr. Sneha Kulkarni',
    department: 'Obstetrics & Gynecology',
    designation: 'Senior Consultant OBGYN',
    casesCount: { opd: 120, procedures: 16 },
    opdShareRate: 70,
    procedureShareRate: 65,
    totalBillings: 1420000,
    doctorGrossShare: 935000,
    hospitalRetained: 485000,
    tdsRate: 10,
    tdsAmount: 93500,
    netPayout: 841500,
    status: 'pending',
    paidDate: null,
    voucherRef: null,
    bankAccount: 'Axis Bank A/c 91201004819201, IFSC: UTIB0000140',
    panNumber: 'AGSPK3309Q',
    cases: [
      { id: 'c-401', patient: 'Kavita Jadhav', uhid: 'UHID-2026-4430', date: '2026-10-06', service: 'Cesarean Section (LSCS) Delivery', billAmount: 78000, sharePct: 65, doctorAmount: 50700 },
      { id: 'c-402', patient: 'Neha Merchant', uhid: 'UHID-2026-4521', date: '2026-10-12', service: 'High-Risk Antenatal Care Package', billAmount: 15000, sharePct: 70, doctorAmount: 10500 },
      { id: 'c-403', patient: 'Shalini Gupta', uhid: 'UHID-2026-4620', date: '2026-10-17', service: 'Diagnostic Hysteroscopy Procedure', billAmount: 32000, sharePct: 65, doctorAmount: 20800 }
    ]
  },
  {
    id: 'doc-5',
    name: 'Dr. Vikramaditya Rathore',
    department: 'Radiology & Imaging',
    designation: 'Consultant Radiologist',
    casesCount: { opd: 310, procedures: 42 },
    opdShareRate: 40,
    procedureShareRate: 50,
    totalBillings: 1250000,
    doctorGrossShare: 510000,
    hospitalRetained: 740000,
    tdsRate: 10,
    tdsAmount: 51000,
    netPayout: 459000,
    status: 'pending',
    paidDate: null,
    voucherRef: null,
    bankAccount: 'HDFC Bank A/c 50100381029412, IFSC: HDFC0000060',
    panNumber: 'AVRPR5519L',
    cases: [
      { id: 'c-501', patient: 'Anand More', uhid: 'UHID-2026-4490', date: '2026-10-09', service: 'Brain & Spine MRI Protocol Review', billAmount: 9500, sharePct: 40, doctorAmount: 3800 },
      { id: 'c-502', patient: 'Laxmi Nair', uhid: 'UHID-2026-4530', date: '2026-10-13', service: 'Triple Phase Contrast CT Abdomen', billAmount: 11000, sharePct: 40, doctorAmount: 4400 },
      { id: 'c-503', patient: 'Tanvi Shah', uhid: 'UHID-2026-4640', date: '2026-10-19', service: 'USG Guided Tru-cut Liver Biopsy', billAmount: 18000, sharePct: 50, doctorAmount: 9000 }
    ]
  },
  {
    id: 'doc-6',
    name: 'Dr. Ananya Mukherjee',
    department: 'Pediatrics & Neonatology',
    designation: 'Consultant Pediatrician',
    casesCount: { opd: 156, procedures: 8 },
    opdShareRate: 70,
    procedureShareRate: 60,
    totalBillings: 840000,
    doctorGrossShare: 545000,
    hospitalRetained: 295000,
    tdsRate: 10,
    tdsAmount: 54500,
    netPayout: 490500,
    status: 'pending',
    paidDate: null,
    voucherRef: null,
    bankAccount: 'Kotak Mahindra Bank A/c 481920412, IFSC: KKBK0000120',
    panNumber: 'AAMPM2019N',
    cases: [
      { id: 'c-601', patient: 'Baby of Swati', uhid: 'UHID-2026-4501', date: '2026-10-07', service: 'NICU Level 3 Neonatal Care (4 Days)', billAmount: 48000, sharePct: 60, doctorAmount: 28800 },
      { id: 'c-602', patient: 'Aarav Choudhury', uhid: 'UHID-2026-4589', date: '2026-10-14', service: 'Pediatric Asthma Emergency Care', billAmount: 12000, sharePct: 60, doctorAmount: 7200 },
      { id: 'c-603', patient: 'Diya Sen', uhid: 'UHID-2026-4660', date: '2026-10-20', service: 'Pediatric Development Assessment', billAmount: 2000, sharePct: 70, doctorAmount: 1400 }
    ]
  }
];

export const INITIAL_BANK_RECONCILIATION = {
  hdfc_oper: {
    accountId: 'hdfc_oper',
    bankName: 'HDFC Bank',
    accountNumber: '50200018829104',
    statementDate: '2026-10-23',
    bookBalance: 4865200,
    statementBalance: 5124400,
    transactions: [
      {
        id: 'tx-1',
        date: '2026-10-22',
        ref: 'UTR/CMS9202610228834',
        description: 'Star Health TPA bulk cashless settlement',
        type: 'credit',
        amount: 785000,
        status: 'matched',
        bookMatched: true
      },
      {
        id: 'tx-2',
        date: '2026-10-21',
        ref: 'RTGS/HDFCR5202610219401',
        description: 'Vendor payment: Sun Pharma Distributors',
        type: 'debit',
        amount: 345000,
        status: 'matched',
        bookMatched: true
      },
      {
        id: 'tx-3',
        date: '2026-10-20',
        ref: 'DEP/CD-8812',
        description: 'Cashier cash deposit slip',
        type: 'credit',
        amount: 210000,
        status: 'matched',
        bookMatched: true
      },
      {
        id: 'tx-4',
        date: '2026-10-22',
        ref: 'CHQ/004812',
        description: 'GE Healthcare CT AMC cheque issued (Unpresented)',
        type: 'debit',
        amount: 260000,
        status: 'unpresented_cheque',
        bookMatched: false
      },
      {
        id: 'tx-5',
        date: '2026-10-23',
        ref: 'NEFT/DIRECT/MAXBUPA',
        description: 'Max Bupa TPA direct claim credit (Not yet posted in cashbook)',
        type: 'credit',
        amount: 520000,
        status: 'direct_bank_credit',
        bookMatched: false
      },
      {
        id: 'tx-6',
        date: '2026-10-23',
        ref: 'CHRG/POS-MDR-OCT',
        description: 'Hospital card swipe POS monthly gateway terminal fee',
        type: 'debit',
        amount: 800,
        status: 'bank_charges',
        bookMatched: false
      }
    ]
  },
  sbi_escrow: {
    accountId: 'sbi_escrow',
    bankName: 'State Bank of India',
    accountNumber: '38910471928',
    statementDate: '2026-10-23',
    bookBalance: 3218400,
    statementBalance: 3218400,
    transactions: [
      {
        id: 'tx-sbi-1',
        date: '2026-10-19',
        ref: 'RBI/GOV920261019001',
        description: 'National Health Mission Immunization Grant',
        type: 'credit',
        amount: 350000,
        status: 'matched',
        bookMatched: true
      },
      {
        id: 'tx-sbi-2',
        date: '2026-10-15',
        ref: 'NEFT/AYUSHMAN/CLAIM',
        description: 'AB-PMJAY Golden Card Package Reimbursement',
        type: 'credit',
        amount: 490000,
        status: 'matched',
        bookMatched: true
      }
    ]
  },
  icici_tpa: {
    accountId: 'icici_tpa',
    bankName: 'ICICI Bank',
    accountNumber: '002105019842',
    statementDate: '2026-10-23',
    bookBalance: 1485000,
    statementBalance: 1610000,
    transactions: [
      {
        id: 'tx-ici-1',
        date: '2026-10-21',
        ref: 'UTR/HDFCTPA2026102199',
        description: 'HDFC ERGO General Insurance Co. settlement',
        type: 'credit',
        amount: 420000,
        status: 'matched',
        bookMatched: true
      },
      {
        id: 'tx-ici-2',
        date: '2026-10-23',
        ref: 'CMS/RELIANCE-HEALTH',
        description: 'Reliance General Insurance direct credit (Pending post)',
        type: 'credit',
        amount: 125000,
        status: 'direct_bank_credit',
        bookMatched: false
      }
    ]
  }
};

export const INITIAL_PL_STATEMENT = {
  revenues: [
    { title: 'Inpatient Department (IPD) & Bed Nursing', amount: 6240000, prevAmount: 5780000, code: '4010' },
    { title: 'Modular Operation Theatre (OT) Surgical Fees', amount: 4890000, prevAmount: 4450000, code: '4020' },
    { title: 'Outpatient (OPD) Specialist Consultations', amount: 2650000, prevAmount: 2510000, code: '4030' },
    { title: 'Diagnostic Laboratory & Pathology Services', amount: 1980000, prevAmount: 1820000, code: '4040' },
    { title: 'Radiology, MRI, CT & Sonography Imaging', amount: 2230000, prevAmount: 2100000, code: '4050' },
    { title: 'Hospital 24x7 In-House Pharmacy Sales', amount: 3475000, prevAmount: 3190000, code: '4060' },
    { title: 'Emergency Triage & Casualty Resuscitation', amount: 1420000, prevAmount: 1290000, code: '4070' }
  ],
  directCosts: [
    { title: 'Doctor Consultation & Surgical Revenue Shares', amount: 4850000, prevAmount: 4320000, code: '5010' },
    { title: 'Surgical Consumables, Sutures & Orthopedic Implants', amount: 2460000, prevAmount: 2280000, code: '5030' },
    { title: 'Pharmaceutical Active Stock Consumption', amount: 1920000, prevAmount: 1780000, code: '1060-adj' },
    { title: 'Medical Cryogenic Gases (Oxygen & Nitrous Oxide)', amount: 580000, prevAmount: 510000, code: '5050' },
    { title: 'Blood Bank Testing Reagents & Donor Serology Kits', amount: 390000, prevAmount: 360000, code: '5090' }
  ],
  indirectExpenses: [
    { title: 'Nursing & Clinical Paramedical Staff Payroll', amount: 3120000, prevAmount: 3050000, code: '5020' },
    { title: 'Biomedical Equipment Maintenance & AMC/CMC Contracts', amount: 840000, prevAmount: 820000, code: '5040' },
    { title: 'Hospital Electricity, High-Tension HVAC & Power', amount: 1215000, prevAmount: 1180000, code: '5060' },
    { title: 'Housekeeping, Bio-Medical Waste & Linen Laundry', amount: 490000, prevAmount: 475000, code: '5070' },
    { title: 'Bank Merchant POS & Insurance Gateway Fees', amount: 145000, prevAmount: 138000, code: '5080' },
    { title: 'Hospital NABH Quality Accreditation & Statutory Dues', amount: 210000, prevAmount: 195000, code: '5110' }
  ],
  fixedDepreciation: 580000
};
