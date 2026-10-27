import { User, Key, Building2, Shield, Sliders } from 'lucide-react';

export const USER_SUBMODULES = [
  {
    id: '30.1',
    label: 'Manage Profile',
    icon: User,
    badge: 'KMC-74912',
    description: 'Personal demographics, clinical credentials, digital signature stamp, and emergency contacts.',
    subsubmodules: [
      { id: '30.1.1', label: 'Personal & Professional Profile' },
      { id: '30.1.2', label: 'Digital Signature & Seal' },
      { id: '30.1.3', label: 'Emergency Contact & Next of Kin' }
    ]
  },
  {
    id: '30.2',
    label: 'Change Password & Security',
    icon: Key,
    badge: '2FA Enforced',
    description: 'Credential rotation, password strength policy, TOTP two-factor authentication, and active trusted devices.',
    subsubmodules: [
      { id: '30.2.1', label: 'Password Reset & Expiry Policy' },
      { id: '30.2.2', label: 'Two-Factor Authentication (2FA)' },
      { id: '30.2.3', label: 'Active Trusted Devices & Tokens' }
    ]
  },
  {
    id: '30.3',
    label: 'Switch Active Hospital Branch',
    icon: Building2,
    badge: '4 Campuses',
    description: 'Multi-campus federation: switch active operational branch, review localized store allocations, and audit logs.',
    subsubmodules: [
      { id: '30.3.1', label: 'Active Campus Selection' },
      { id: '30.3.2', label: 'Department & Ward Accessibility' },
      { id: '30.3.3', label: 'Branch Switch Audit Log' }
    ]
  },
  {
    id: '30.4',
    label: 'Switch Active Role',
    icon: Shield,
    badge: '3 Assigned',
    description: 'Persona switcher: toggle between Consultant, Head of Department, and On-Call Specialist privileges.',
    subsubmodules: [
      { id: '30.4.1', label: 'Multi-Role Persona Switcher' },
      { id: '30.4.2', label: 'Temporary Delegated Authority' },
      { id: '30.4.3', label: 'Role Privilege Matrix Inspector' }
    ]
  },
  {
    id: '30.5',
    label: 'User UI Preferences & Theme',
    icon: Sliders,
    badge: 'Workspace',
    description: 'Custom UI density, clinical high-contrast palette, default startup workspace module, and notification audio.',
    subsubmodules: [
      { id: '30.5.1', label: 'Visual Theme & Display Density' },
      { id: '30.5.2', label: 'Startup Workspace & Default Module' },
      { id: '30.5.3', label: 'Notification Chimes & Sound Alerts' }
    ]
  }
];

export const INITIAL_USER_PROFILE = {
  employeeId: 'EMP-2024-8841',
  fullName: 'Dr. Ramesh Narayan Rao',
  kannadaName: 'ಡಾ. ರಮೇಶ್ ನಾರಾಯಣ ರಾವ್',
  designation: 'Senior Consultant Interventional Cardiologist',
  department: 'Cardiology & Cath Lab',
  councilRegNo: 'KMC-Karnataka-74912',
  email: 'dr.ramesh.rao@sarjihospitals.com',
  mobile: '+91 98450 12345',
  workstationExtension: 'Ext: 4410',
  cabinNumber: 'OPD Cabin #12 (Super Speciality Block)',
  qualification: 'MBBS, MD (Gen Med), DM (Cardiology), FACC',
  joiningDate: '12-Jan-2018',
  bloodGroup: 'O+ve',
  digitalSignatureUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60',
  signaturePinSet: true,
  emergencyContact: {
    name: 'Mrs. Sunita Rao',
    relation: 'Spouse',
    mobile: '+91 98450 67890',
    alternateMobile: '+91 8182 224455',
    residentialAddress: 'No. 42, Kuvempu Road, Jayanagar, Shivamogga - 577201'
  }
};

export const HOSPITAL_BRANCHES = [
  {
    id: 'SARJI-HQ-01',
    name: 'Sarji Super Speciality Hospital (Main Campus)',
    kannadaName: 'ಸರ್ಜಿ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ (ಮುಖ್ಯ ಆವರಣ)',
    code: 'SSSH-SHIV',
    city: 'Shivamogga',
    address: 'Near Rotary Blood Bank, B.H. Road, Shivamogga, Karnataka 577201',
    totalBeds: 350,
    activeIcuBeds: 48,
    isCurrent: true,
    tag: 'Tertiary Care & Trauma Level 1',
    departmentsCount: 32,
    doctorsOnDuty: 44
  },
  {
    id: 'SARJI-MCH-02',
    name: 'Sarji Mother & Child Hospital',
    kannadaName: 'ಸರ್ಜಿ ತಾಯಿ ಮತ್ತು ಮಕ್ಕಳ ಆಸ್ಪತ್ರೆ',
    code: 'SMCH-SHIV',
    city: 'Shivamogga',
    address: 'Gopala Gowda Extension, Shivamogga, Karnataka 577205',
    totalBeds: 150,
    activeIcuBeds: 24,
    isCurrent: false,
    tag: 'OBGYN, Neonatology & NICU Level 3',
    departmentsCount: 14,
    doctorsOnDuty: 18
  },
  {
    id: 'SARJI-CITY-03',
    name: 'Sarji City Clinic & Diagnostic Center',
    kannadaName: 'ಸರ್ಜಿ ಸಿಟಿ ಕ್ಲಿನಿಕ್ ಮತ್ತು ಡಯಾಗ್ನೋಸ್ಟಿಕ್',
    code: 'SCDC-SHIV',
    city: 'Shivamogga',
    address: 'Gandhi Bazar, Old City Center, Shivamogga 577202',
    totalBeds: 25,
    activeIcuBeds: 4,
    isCurrent: false,
    tag: 'Day Care, High-Throughput OPD & LIS',
    departmentsCount: 8,
    doctorsOnDuty: 9
  },
  {
    id: 'SARJI-BHADRA-04',
    name: 'Sarji Multi-Speciality Annex',
    kannadaName: 'ಸರ್ಜಿ ಮಲ್ಟಿ-ಸ್ಪೆಷಾಲಿಟಿ ಶಾಖೆ',
    code: 'SMSA-BHAD',
    city: 'Bhadravathi',
    address: 'B.H. Bypass Road, Paper Town, Bhadravathi 577302',
    totalBeds: 80,
    activeIcuBeds: 12,
    isCurrent: false,
    tag: 'Secondary Trauma & General Surgery',
    departmentsCount: 12,
    doctorsOnDuty: 11
  }
];

export const ASSIGNED_ROLES = [
  {
    id: 'ROLE-CONSULTANT',
    name: 'Senior Consultant Physician',
    department: 'Cardiology Desk',
    scope: 'Clinical OP, IP Rounds, CPOE Orders, Cath Lab Interventions',
    isCurrent: true,
    securityLevel: 'Clinical Tier-1',
    validUntil: '31-Dec-2026'
  },
  {
    id: 'ROLE-HOD',
    name: 'Acting Head of Department (HOD)',
    department: 'Cardiovascular Sciences',
    scope: 'Clinical Governance, Peer Review, Department Indent Approvals, Duty Rosters',
    isCurrent: false,
    securityLevel: 'Department Executive',
    validUntil: '30-Jun-2026'
  },
  {
    id: 'ROLE-EMERGENCY',
    name: 'Code Blue / Acute STEMI Specialist',
    department: 'Emergency & Critical Care',
    scope: 'Immediate ER Triage Overrides, Rapid OT Admissions, Blood Bank STAT Release',
    isCurrent: false,
    securityLevel: 'Critical Override Tier',
    validUntil: '31-Dec-2026'
  }
];

export const TRUSTED_DEVICES = [
  {
    id: 'DEV-901',
    deviceType: 'Hospital Workstation PC',
    name: 'OPD-Cabin12-DellOptiplex',
    ipAddress: '10.20.14.88',
    location: 'Sarji Main Campus - 1st Floor OPD',
    browser: 'Chrome 122 (Windows 11 Enterprise)',
    lastActive: 'Active Now',
    isCurrentSession: true
  },
  {
    id: 'DEV-902',
    deviceType: 'Clinical Tablet',
    name: 'Samsung Galaxy Tab S9 (Ward Rounds)',
    ipAddress: '10.20.40.112',
    location: 'Cath Lab & Cardiac ICU',
    browser: 'MedicsPrime App v2.4 (Android)',
    lastActive: 'Today at 09:15 AM',
    isCurrentSession: false
  },
  {
    id: 'DEV-903',
    deviceType: 'Personal Mobile',
    name: 'iPhone 15 Pro (Doctor Companion)',
    ipAddress: '122.171.18.9',
    location: 'Shivamogga (External 5G)',
    browser: 'Safari Mobile 17.3',
    lastActive: 'Yesterday at 11:42 PM',
    isCurrentSession: false
  }
];
