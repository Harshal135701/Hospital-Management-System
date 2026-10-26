import {
  Calendar,
  Stethoscope,
  CheckSquare,
  FileEdit,
  Bed
} from 'lucide-react';

export {
  OT_MODULE_GROUPS,
  ALL_OT_MODULES,
  ALL_OT_SUBMODULES,
  findOtGroupById,
  findOtGroupBySubmoduleId,
  findOtSubmoduleById
} from './otManifest';

export const OT_SUBMODULES = [
  {
    id: '23.1',
    routeId: 'ot:23.1',
    code: '23.1',
    label: '23.1 OT Slot Scheduling & Theatre Roster',
    shortLabel: 'Slot Scheduling & Roster',
    icon: Calendar,
    badge: 'Roster',
    description: 'Operating theatre suite slot allocations, chief surgical consultants, anesthetists, and elective schedules.'
  },
  {
    id: '23.2',
    routeId: 'ot:23.2',
    code: '23.2',
    label: '23.2 Pre-Anesthesia Checkup (PAC)',
    shortLabel: 'Pre-Anesthesia PAC',
    icon: Stethoscope,
    badge: 'PAC',
    description: 'Airway assessment (Mallampati score), ASA Physical Status grading, NPO fasting compliance, and pre-op clearance.'
  },
  {
    id: '23.3',
    routeId: 'ot:23.3',
    code: '23.3',
    label: '23.3 WHO Surgical Safety Checklist',
    shortLabel: 'WHO Safety Checklist',
    icon: CheckSquare,
    badge: 'WHO',
    description: 'Perioperative safety sign-in, intra-operative surgical time-out, and post-op sign-out with scrub nurse verification.'
  },
  {
    id: '23.4',
    routeId: 'ot:23.4',
    code: '23.4',
    label: '23.4 Intra-Operative Anesthesia & Surgical Notes',
    shortLabel: 'Intra-Op Notes',
    icon: FileEdit,
    badge: 'Intra-Op',
    description: 'Surgical incision findings, estimated blood loss (EBL), implant lot/barcode tracking, and sponge/instrument count.'
  },
  {
    id: '23.5',
    routeId: 'ot:23.5',
    code: '23.5',
    label: '23.5 Post-Anesthesia Care Unit (PACU) Recovery',
    shortLabel: 'PACU Recovery',
    icon: Bed,
    badge: 'PACU',
    description: 'Modified Aldrete Recovery Score (0-10), vital sign stability, and post-op ward transfer authorization.'
  }
];

export const OT_THEATRES = [
  {
    id: 'theatre-1',
    code: 'OT-1',
    name: 'Major OT 1 (General & Laparoscopy)',
    specialty: 'General, Minimal Access & Bariatric Surgery',
    status: 'in_surgery',
    currentSurgery: 'Laparoscopic Cholecystectomy',
    patientName: 'Ananya Mukherjee (UHID-2026-0812)',
    surgeon: 'Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Sunita Rao',
    scrubNurse: 'Nurse Preeti Shinde',
    startTime: '08:30',
    estimatedEnd: '10:30',
    equipment: 'Karl Storz 4K Laparoscopy Tower, Valleylab Cautery, Dräger Primus Anesthesia Station',
    hvac: 'Laminar Flow Clean Class 100 • 20.2°C • 48% RH'
  },
  {
    id: 'theatre-2',
    code: 'OT-2',
    name: 'Major OT 2 (Orthopaedics & Joint Replacement)',
    specialty: 'Arthroplasty, Trauma & Spine Surgery',
    status: 'in_surgery',
    currentSurgery: 'Total Knee Arthroplasty (Left)',
    patientName: 'Rameshwar Patil (UHID-2026-0924)',
    surgeon: 'Dr. Pradeep K. Sharma',
    anesthetist: 'Dr. Rajiv Menon',
    scrubNurse: 'Nurse Anita Deshmukh',
    startTime: '09:00',
    estimatedEnd: '12:00',
    equipment: 'Stryker Navigation Robot, GE C-Arm Fluoroscopy, Maquet Dual LED Surgical Lights',
    hvac: 'Ultra-Clean Laminar Flow Class 10 • 19.5°C • 45% RH'
  },
  {
    id: 'theatre-3',
    code: 'OT-3',
    name: 'Major OT 3 (Neuro & Vascular Surgery)',
    specialty: 'Neurosurgery, Cranial & Peripheral Vascular',
    status: 'turnover',
    currentSurgery: 'Scheduled: Craniotomy for SDH Evacuation (11:30)',
    patientName: 'Next: Vikram Joshi (UHID-2026-1102)',
    surgeon: 'Dr. Harish Bahl',
    anesthetist: 'Dr. Sunita Rao',
    scrubNurse: 'Nurse Kavita Jadhav',
    startTime: 'Turnover Cleaning',
    estimatedEnd: 'Ready in 15 mins',
    equipment: 'Carl Zeiss OPMI Vario Microscope, Medtronic StealthStation, Mayfield Skull Clamp',
    hvac: 'HEPA Positive Pressure • 20.0°C • 50% RH'
  },
  {
    id: 'theatre-4',
    code: 'OT-4',
    name: 'Minor OT 4 (Day Care & Endoscopy)',
    specialty: 'Day Care Surgery, Cystoscopy & Plastics',
    status: 'available',
    currentSurgery: 'None — Suite Sanitized & Available',
    patientName: '—',
    surgeon: 'On Call: Dr. Sandeep Kulkarni',
    anesthetist: 'Dr. Ananya Mukherjee',
    scrubNurse: 'Nurse Sneha Kadam',
    startTime: 'Ready',
    estimatedEnd: 'Elective queue open',
    equipment: 'Olympus Gastro-Endoscopy Stack, Covidien Force FX Electrosurgical Unit',
    hvac: 'Air Handling Unit 4 • 21.5°C • 52% RH'
  },
  {
    id: 'theatre-5',
    code: 'OT-5',
    name: 'Emergency OT Suite 5 (Trauma 24x7)',
    specialty: 'Polytrauma, Acute Abdomen & Emergency OB/GYN',
    status: 'available',
    currentSurgery: 'Rapid Emergency Standby',
    patientName: 'Reserved for Level 1/2 Trauma Intake',
    surgeon: 'ER Trauma Team On-Duty',
    anesthetist: 'Dr. Rajiv Menon',
    scrubNurse: 'Emergency OT Flying Squad',
    startTime: '24x7 Ready',
    estimatedEnd: 'Crash Cart & Rapid Infuser Primed',
    equipment: 'Belmont Rapid Blood Infuser, Mindray A7 Anesthesia Workstation, Trauma Crash Carts',
    hvac: 'Dedicated Emergency HEPA Unit • 19.8°C • 47% RH'
  }
];

export const SURGERY_STATUS_BADGES = {
  scheduled: { label: 'Scheduled', variant: 'neutral', color: '#6B7280', bg: '#F3F4F6' },
  pre_op_ready: { label: 'Pre-Op Ready', variant: 'teal', color: '#0D9488', bg: '#CCFBF1' },
  in_surgery: { label: 'In Surgery', variant: 'warning', color: '#D97706', bg: '#FEF3C7' },
  in_pacu: { label: 'In PACU Recovery', variant: 'teal', color: '#2563EB', bg: '#EFF6FF' },
  discharged_ward: { label: 'Transferred to Ward', variant: 'success', color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled / Postponed', variant: 'error', color: '#DC2626', bg: '#FEE2E2' }
};

export const PAC_STATUS_BADGES = {
  cleared_asa_1: { label: 'ASA Class I — Cleared', color: '#16A34A', bg: '#DCFCE7' },
  cleared_asa_2: { label: 'ASA Class II — Cleared', color: '#16A34A', bg: '#DCFCE7' },
  cleared_asa_3: { label: 'ASA Class III — High Risk Cleared', color: '#D97706', bg: '#FEF3C7' },
  pending_investigations: { label: 'Pending Labs / Echo', color: '#EA580C', bg: '#FFEDD5' },
  withheld: { label: 'Unfit / Postponed', color: '#DC2626', bg: '#FEE2E2' }
};
