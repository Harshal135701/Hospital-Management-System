
import {
  Building2,
  Network,
  Stethoscope,
  ClipboardList,
  Handshake,
} from 'lucide-react';

export const GENERAL_SUBMODULES = [
  {
    id: '15.1',
    code: '15.1',
    label: 'Hospital & Branch Master',
    shortLabel: 'Hospital & Branches',
    icon: Building2,
    badge: 'Organization',
    description:
      'Manage hospital organizations, branch locations, registration details, and operational status.',
  },
  {
    id: '15.2',
    code: '15.2',
    label: 'Department & Clinic Hierarchy',
    shortLabel: 'Departments & Clinics',
    icon: Network,
    badge: 'Clinical Structure',
    description:
      'Organize hospital departments, clinics, sub-clinics, and their branch relationships.',
  },
  {
    id: '15.3',
    code: '15.3',
    label: 'Doctor & Consultant Master',
    shortLabel: 'Doctors & Consultants',
    icon: Stethoscope,
    badge: 'Medical Staff',
    description:
      'Maintain consultant profiles, specializations, registrations, department assignments, and availability.',
  },
  {
    id: '15.4',
    code: '15.4',
    label: 'Service Catalog & Tariff Master',
    shortLabel: 'Service Catalog & Tariffs',
    icon: ClipboardList,
    badge: 'Service Pricing',
    description:
      'Manage hospital service codes, categories, departments, standard rates, and service availability.',
  },
  {
    id: '15.5',
    code: '15.5',
    label: 'Corporate Tariff Rate Contracts',
    shortLabel: 'Corporate Contracts',
    icon: Handshake,
    badge: 'Corporate Agreements',
    description:
      'Manage corporate agreements, negotiated service rates, contract periods, and approval status.',
  },
];

export const GENERAL_STORAGE_KEY = 'medicsprime_general_state_v1';

export const GENERAL_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const BRANCH_TYPES = [
  { value: 'main_hospital', label: 'Main Hospital' },
  { value: 'branch_hospital', label: 'Branch Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic_centre', label: 'Diagnostic Centre' },
];

export const DEPARTMENT_TYPES = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'support', label: 'Support Services' },
];

export const SERVICE_CATEGORIES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'bed', label: 'Bed / Room' },
  { value: 'other', label: 'Other' },
];

export const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
];
