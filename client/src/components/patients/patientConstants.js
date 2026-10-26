import {
  UserPlus,
  Tag,
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react';

/**
 * Module 24 — Patient / Visit Management Submodules
 * Exact 5 submodules matching hospital administration requirements.
 */
export const PATIENT_SUBMODULES = [
  {
    id: '24.1',
    routeId: 'patients:24.1',
    label: '24.1 New Patient Registration',
    shortLabel: 'New Registration',
    icon: UserPlus,
    badge: 'Registration',
    description: 'Demographics, government ID (Aadhaar/ABHA), emergency contacts, and live duplicate detection'
  },
  {
    id: '24.2',
    routeId: 'patients:24.2',
    label: '24.2 UHID Generation & Smart Card Print',
    shortLabel: 'UHID & Smart Card',
    icon: Tag,
    badge: 'UHID Card',
    description: 'Unique health identification assignment, digital barcode generation, and smart card printing'
  },
  {
    id: '24.3',
    routeId: 'patients:24.3',
    label: '24.3 Create New Visit / Encounter',
    shortLabel: 'New Visit / Encounter',
    icon: Calendar,
    badge: 'Encounters',
    description: 'OPD, Emergency, Day Care, or Inpatient encounter generation with department and doctor routing'
  },
  {
    id: '24.4',
    routeId: 'patients:24.4',
    label: '24.4 Patient Search & Record Merge',
    shortLabel: 'Search & Merge',
    icon: Search,
    badge: 'Search & Merge',
    description: 'Master patient index search, side-by-side duplicate comparison, and safe record merge governance'
  },
  {
    id: '24.5',
    routeId: 'patients:24.5',
    label: '24.5 Demographic & Identity Updates',
    shortLabel: 'Demographic Updates',
    icon: RefreshCw,
    badge: 'Updates',
    description: 'Patient info maintenance, address revisions, change audit log, and identity verification'
  }
];

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
];

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / Transgender' }
];

export const MARITAL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Other'
];

export const GOV_ID_TYPES = [
  'Aadhaar Card (UIDAI)',
  'ABHA ID (Ayushman Bharat)',
  'PAN Card',
  'Voter ID (EPIC)',
  'Passport',
  'Driving License',
  'Other Government Photo ID'
];

export const VISIT_TYPES = [
  { value: 'OPD', label: 'OPD (Outpatient Consultation)', badgeVariant: 'teal' },
  { value: 'EMERGENCY', label: 'Emergency & Trauma Triage', badgeVariant: 'danger' },
  { value: 'DAYCARE', label: 'Day Care Short-Stay Procedure', badgeVariant: 'indigo' },
  { value: 'IPD', label: 'Inpatient (IPD) Ward Admission', badgeVariant: 'purple' },
  { value: 'FOLLOW_UP', label: 'Follow-Up Review Consultation', badgeVariant: 'warning' }
];

export const PRIORITY_LEVELS = [
  { value: 'NORMAL', label: 'Normal (Standard Queue)' },
  { value: 'URGENT', label: 'Urgent (Priority Consultation)' },
  { value: 'EMERGENCY', label: 'Emergency (Immediate Level 1 Attention)' }
];

export const REFERRAL_SOURCES = [
  'Self Walk-in',
  'General Physician / Family Doctor',
  'Internal Specialty Referral',
  'Emergency Ambulance Service',
  'Corporate / TPA Empanelled Partner',
  'Community Health Camp / Outreach'
];

export const MERGE_REASONS = [
  'Duplicate Registration Created at Reception Desk',
  'Typo in Patient Name / Mobile Number on Admission',
  'Family Member Registration Consolidation',
  'ABHA Health ID Linkage Duplicate Record',
  'Insurance / Cashless Policy Matching Correction'
];

export const DEMOGRAPHIC_CHANGE_REASONS = [
  'Typo Correction in Patient Name or Date of Birth',
  'Legal Name Change (Marriage / Gazette Notification)',
  'Primary Mobile Number Porting / Contact Update',
  'Residential Address Relocation',
  'Emergency Contact Person or Phone Revision',
  'Government Identity Document Re-Verification'
];

/**
 * Standard hospital departments fallback
 */
export const FALLBACK_DEPARTMENTS = [
  { id: 'dept-01', name: 'Cardiology' },
  { id: 'dept-02', name: 'Orthopedics' },
  { id: 'dept-03', name: 'General Medicine' },
  { id: 'dept-04', name: 'Pediatrics' },
  { id: 'dept-05', name: 'Dermatology' },
  { id: 'dept-06', name: 'Neurology' },
  { id: 'dept-07', name: 'Gynecology & Obstetrics' },
  { id: 'dept-08', name: 'General Surgery' },
  { id: 'dept-09', name: 'Emergency & Trauma' }
];

/**
 * Standard hospital doctors fallback
 */
export const FALLBACK_DOCTORS = [
  { id: 'doc-01', full_name: 'Dr. Ananya Mehta', department_id: 'dept-01', specialty: 'Cardiologist', room: 'Consultation Room 101' },
  { id: 'doc-02', full_name: 'Dr. Rahul Kulkarni', department_id: 'dept-01', specialty: 'Interventional Cardiology', room: 'Room 102' },
  { id: 'doc-03', full_name: 'Dr. Vikram Patil', department_id: 'dept-02', specialty: 'Orthopedic Surgeon', room: 'Room 204' },
  { id: 'doc-04', full_name: 'Dr. Neha Shah', department_id: 'dept-02', specialty: 'Joint Replacement Specialist', room: 'Room 205' },
  { id: 'doc-05', full_name: 'Dr. Amit Joshi', department_id: 'dept-03', specialty: 'Senior Consultant Physician', room: 'Room 105' },
  { id: 'doc-06', full_name: 'Dr. Pooja Deshmukh', department_id: 'dept-03', specialty: 'General Physician', room: 'Room 106' },
  { id: 'doc-07', full_name: 'Dr. Snehal More', department_id: 'dept-04', specialty: 'Pediatrician', room: 'Child Health Clinic 3' },
  { id: 'doc-08', full_name: 'Dr. Karan Singh', department_id: 'dept-05', specialty: 'Dermatologist', room: 'Room 302' },
  { id: 'doc-09', full_name: 'Dr. Rohan Gupta', department_id: 'dept-06', specialty: 'Neurologist', room: 'Neuro Clinic 401' },
  { id: 'doc-10', full_name: 'Dr. Rajesh Borse', department_id: 'dept-08', specialty: 'Senior General & Laparoscopic Surgeon', room: 'Surgical OPD 1' }
];

/**
 * Accurately calculate age in years (and months if infant) from Date of Birth
 */
export function calculateAge(dob) {
  if (!dob) return '';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (years <= 0) {
    return `${Math.max(0, months)} Mths`;
  }
  return `${years} Yrs`;
}

/**
 * Estimate approximate Date of Birth given age in years
 */
export function estimateDobFromAge(ageYears) {
  const num = parseInt(ageYears, 10);
  if (isNaN(num) || num < 0 || num > 130) return '';
  const year = new Date().getFullYear() - num;
  return `${year}-01-01`;
}

/**
 * Normalizes 10-digit mobile number by stripping non-digit characters
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Formats 10-digit mobile number with standard Indian spacing: +91 XXXXX XXXXX
 */
export function formatPhoneIN(mobile) {
  const norm = normalizePhone(mobile);
  if (norm.length === 10) {
    return `+91 ${norm.slice(0, 5)} ${norm.slice(5)}`;
  }
  return mobile || '—';
}

/**
 * Masks Government ID for display privacy (e.g. Aadhaar: XXXX-XXXX-1234)
 */
export function maskGovId(idValue) {
  if (!idValue) return '';
  const clean = String(idValue).replace(/\s/g, '');
  if (clean.length >= 8) {
    const visible = clean.slice(-4);
    return `XXXX-XXXX-${visible}`;
  }
  return clean;
}
