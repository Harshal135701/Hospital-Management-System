export const WORK_ORDER_SUBMODULES = [
  {
    id: '31.1',
    label: 'Record Work Order',
    badge: 'New WO',
    description: 'Log new breakdown tickets, asset tagging, fault severity, clinical downtime, and bio-med dispatch.',
    subsubmodules: [
      { id: '31.1.1', label: 'Breakdown / Maintenance Ticket Creation' },
      { id: '31.1.2', label: 'Asset Master Barcode Lookup' },
      { id: '31.1.3', label: 'Isolation & Safety Protocols' }
    ]
  },
  {
    id: '31.2',
    label: 'Record Work Order Requisition',
    badge: 'Parts Indent',
    description: 'Indent spare parts, OEM manufacturer engineering requisition, calibration gas, and external technician quotes.',
    subsubmodules: [
      { id: '31.2.1', label: 'Spare Parts & Store Indent' },
      { id: '31.2.2', label: 'External Vendor Service Requisition' },
      { id: '31.2.3', label: 'Consumables & Calibration Gas Requisition' }
    ]
  },
  {
    id: '31.3',
    label: 'Record Work Order Receipt',
    badge: 'Completion',
    description: 'Record technician work completion, labor hours, scrap handover, and vendor invoice attachment.',
    subsubmodules: [
      { id: '31.3.1', label: 'Service Completion Entry' },
      { id: '31.3.2', label: 'Replaced Spare Parts & Scrap Handover' },
      { id: '31.3.3', label: 'External Invoice & Service Sheet Attachment' }
    ]
  },
  {
    id: '31.4',
    label: 'View Work Orders / Requisitions / Receipts',
    badge: 'Registers',
    description: 'Master registers, equipment uptime telemetry, cost history, and lifecycle audit registers.',
    subsubmodules: [
      { id: '31.4.1', label: 'Work Order Master Register' },
      { id: '31.4.2', label: 'Spare Parts Requisition Register' },
      { id: '31.4.3', label: 'Service Receipt Register' }
    ]
  },
  {
    id: '31.5',
    label: 'ORDERS: Work Order Approval Workflow',
    badge: 'Approval',
    description: 'Biomedical supervisor approvals, purchase budget release, vendor dispatch confirmation, and rejected review.',
    subsubmodules: [
      { id: '31.5.1', label: 'Supervisor Approval Queue' },
      { id: '31.5.2', label: 'Dispatch & Vendor Confirmation' },
      { id: '31.5.3', label: 'Review Rejected Orders & Revision Desk' }
    ]
  },
  {
    id: '31.6',
    label: 'RECEIPTS: Work Order Receipt Approval Workflow',
    badge: 'Sign-off',
    description: 'Electrical safety analyzer testing, biomedical calibration sign-off, and asset census return to active inventory.',
    subsubmodules: [
      { id: '31.6.1', label: 'Calibration & Electrical Safety Verification' },
      { id: '31.6.2', label: 'Final Supervisor & Head Acceptance' },
      { id: '31.6.3', label: 'Asset Status Restoration & Census Return' }
    ]
  }
];

export const INITIAL_WORK_ORDERS = [
  {
    id: 'WO-2026-0814',
    assetId: 'AST-RAD-044',
    assetName: 'GE Definium 646 HD Digital X-Ray',
    department: 'Radiology & Imaging (Suite 1)',
    faultType: 'Collimator & Sensor Malfunction',
    description: 'Collimator lamp failure and X-Ray tube thermal sensor intermittent trip during high-kV chest exposures.',
    severity: 'High',
    requestedBy: 'Mr. Chethan (Chief Radiographer)',
    createdAt: '2026-10-27 09:15 AM',
    status: 'Pending Approval',
    estimatedCost: 32500,
    technicianAssigned: 'Kiran Shenoy (Bio-Med Engineer)'
  },
  {
    id: 'WO-2026-0815',
    assetId: 'AST-CICU-012',
    assetName: 'Mindray BeneView T8 Multi-Para Monitor',
    department: 'Cardiac ICU (Bed 4)',
    faultType: 'Sensor Leak & Lead Noise',
    description: 'ECG Lead II exhibits severe 50Hz interference; NIBP cuff pressure fails leak-rate test.',
    severity: 'Urgent',
    requestedBy: 'Sister Philomena (ICU In-Charge)',
    createdAt: '2026-10-27 08:30 AM',
    status: 'Approved',
    estimatedCost: 8200,
    technicianAssigned: 'Praveen K. (Bio-Med Resident)'
  },
  {
    id: 'WO-2026-0816',
    assetId: 'AST-OT-003',
    assetName: 'Dräger Fabius GS Premium Workstation',
    department: 'Operation Theatre #3 (General Surgery)',
    faultType: 'Calibration Drift & O2 Sensor Expired',
    description: 'O2 fuel cell sensor calibration error (>3% variance); expiratory flow cassette requires autoclaved overhaul.',
    severity: 'Critical',
    requestedBy: 'Dr. Srinivas (Chief Anesthesiologist)',
    createdAt: '2026-10-26 18:40 PM',
    status: 'In-Progress',
    estimatedCost: 45000,
    technicianAssigned: 'OEM Dräger Medical Engineer'
  },
  {
    id: 'WO-2026-0817',
    assetId: 'AST-LAB-019',
    assetName: 'Beckman Coulter AU480 Clinical Chemistry Analyzer',
    department: 'LIS Central Biochemistry',
    faultType: 'Photometer Lamp Degradation',
    description: 'Lamp voltage reached 11.2V limit; calibration drift on alkaline phosphatase chemistry.',
    severity: 'Medium',
    requestedBy: 'Dr. Savitha (Chief Pathologist)',
    createdAt: '2026-10-26 11:20 AM',
    status: 'Completed',
    estimatedCost: 18000,
    technicianAssigned: 'Kiran Shenoy (Bio-Med Engineer)'
  }
];

export const INITIAL_REQUISITIONS = [
  {
    id: 'REQ-WO-901',
    woId: 'WO-2026-0814',
    itemCode: 'SP-GE-COL-24V',
    itemName: 'GE Collimator Halogen Lamp 24V / 150W',
    category: 'Bio-Medical Optical Spares',
    quantity: 2,
    unitPrice: 4500,
    totalPrice: 9000,
    sourceStore: 'Central Engineering Store #1',
    indentStatus: 'Approved & Dispatched',
    requestedDate: '2026-10-27 09:40'
  },
  {
    id: 'REQ-WO-902',
    woId: 'WO-2026-0816',
    itemCode: 'SP-DRG-O2-685',
    itemName: 'Dräger Medical O2 Fuel Cell Capsule (6850645)',
    category: 'Critical Anaesthesia Consumables',
    quantity: 1,
    unitPrice: 28500,
    totalPrice: 28500,
    sourceStore: 'Direct OEM Procurement',
    indentStatus: 'Awaiting PO Approval',
    requestedDate: '2026-10-26 19:15'
  }
];

export const INITIAL_RECEIPTS = [
  {
    id: 'REC-WO-501',
    woId: 'WO-2026-0815',
    assetName: 'Mindray BeneView T8 Multi-Para Monitor',
    technician: 'Praveen K. (Bio-Med)',
    downtimeHours: 3.5,
    sparesCost: 4200,
    laborCost: 1500,
    totalCost: 5700,
    electricalSafetyPassed: true,
    calibrationStatus: 'Calibrated & Certified',
    completionDate: '2026-10-27 12:45 PM',
    status: 'Approved'
  },
  {
    id: 'REC-WO-502',
    woId: 'WO-2026-0817',
    assetName: 'Beckman Coulter AU480 Biochemistry',
    technician: 'Kiran Shenoy (Bio-Med)',
    downtimeHours: 2.0,
    sparesCost: 16000,
    laborCost: 2000,
    totalCost: 18000,
    electricalSafetyPassed: true,
    calibrationStatus: 'Calibrated & Certified',
    completionDate: '2026-10-26 16:30 PM',
    status: 'Approved'
  }
];

export const HOSPITAL_ASSETS = [
  { id: 'AST-RAD-044', name: 'GE Definium 646 HD Digital X-Ray', dept: 'Radiology', serial: 'SN-GE-9941-X', warranty: 'CMC Active (Wipro GE)' },
  { id: 'AST-CICU-012', name: 'Mindray BeneView T8 Multi-Para Monitor', dept: 'Cardiac ICU', serial: 'SN-MR-7721-M', warranty: 'AMC Active' },
  { id: 'AST-OT-003', name: 'Dräger Fabius GS Premium Workstation', dept: 'Operation Theatre #3', serial: 'SN-DR-3312-A', warranty: 'Comprehensive CMC' },
  { id: 'AST-LAB-019', name: 'Beckman Coulter AU480 Analyzer', dept: 'Central Laboratory', serial: 'SN-BC-4418-L', warranty: 'Reagent Rental CMC' },
  { id: 'AST-ER-007', name: 'Zoll R Series Defibrillator / Pacer', dept: 'Emergency Dept', serial: 'SN-ZL-1123-D', warranty: 'AMC Active' }
];
