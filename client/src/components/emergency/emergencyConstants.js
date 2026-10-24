import {
  Siren,
  ShieldAlert,
  Bed,
  Activity,
  ArrowRightCircle,
  AlertTriangle,
  Clock,
  HeartPulse,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Building2,
  FileCheck
} from 'lucide-react';

export const EMERGENCY_SUBMODULES = [
  {
    id: '11.1',
    code: '11.1',
    label: '11.1 Triage Assessment (Level 1 to 4)',
    shortLabel: 'Triage Assessment',
    icon: Siren,
    badge: 'Triage',
    description: 'Rapid ESI triage assessment, vitals stratification, GCS scoring, and acuity allocation.'
  },
  {
    id: '11.2',
    code: '11.2',
    label: '11.2 Medico-Legal Case (MLC) Registry',
    shortLabel: 'MLC Registry',
    icon: ShieldAlert,
    badge: 'MLC',
    description: 'Police intimations, RTA/assault documentation, injury charting, and legal registers.'
  },
  {
    id: '11.3',
    code: '11.3',
    label: '11.3 Emergency Bay & Bed Allocation',
    shortLabel: 'Bay & Bed Allocation',
    icon: Bed,
    badge: 'Bays',
    description: 'Red resuscitation, yellow acute monitoring, green ambulatory, and isolation bed management.'
  },
  {
    id: '11.4',
    code: '11.4',
    label: '11.4 Trauma Clinical Charting',
    shortLabel: 'Trauma Charting',
    icon: Activity,
    badge: 'Trauma',
    description: 'Primary ABCDE survey, FAST sonography findings, Revised Trauma Score (RTS), and resuscitation logs.'
  },
  {
    id: '11.5',
    code: '11.5',
    label: '11.5 Rapid Disposition (ICU/OT/Ward/Discharge)',
    shortLabel: 'Rapid Disposition',
    icon: ArrowRightCircle,
    badge: 'Disposition',
    description: 'Fast-track clinical disposition to Cath Lab, ICU, Emergency OT, Inpatient Ward, or discharge.'
  }
];

export const TRIAGE_LEVELS = {
  1: {
    level: 1,
    name: 'Level 1: Resuscitation',
    shortName: 'Level 1 - Critical',
    category: 'Immediate Resuscitation',
    targetTime: 'Immediate (0 min)',
    badgeColor: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#991B1B',
    clinicalDescription: 'Cardiac/respiratory arrest, severe shock, unresponsive (GCS < 8), major trauma with compromised airway.'
  },
  2: {
    level: 2,
    name: 'Level 2: Emergent',
    shortName: 'Level 2 - Emergent',
    category: 'High Acuity / Emergent',
    targetTime: '< 10 minutes',
    badgeColor: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    textColor: '#9A3412',
    clinicalDescription: 'Acute chest pain (suspected STEMI), acute stroke symptoms, severe respiratory distress, acute altered mental state.'
  },
  3: {
    level: 3,
    name: 'Level 3: Urgent',
    shortName: 'Level 3 - Urgent',
    category: 'Moderate Acuity / Urgent',
    targetTime: '< 30 minutes',
    badgeColor: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    clinicalDescription: 'Stable vitals but requiring 2+ diagnostic resources (severe abdominal pain, moderate asthma, fractures, renal colic).'
  },
  4: {
    level: 4,
    name: 'Level 4: Semi-Urgent',
    shortName: 'Level 4 - Semi-Urgent',
    category: 'Low Acuity / Semi-Urgent',
    targetTime: '< 60 minutes',
    badgeColor: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    textColor: '#166534',
    clinicalDescription: 'Minor laceration, sprain, uncomplicated urinary tract infection, mild allergic reaction, ambulatory patients.'
  }
};

export const BAY_ZONES = {
  RED: {
    code: 'RED',
    name: 'Zone Red — Resuscitation',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    description: 'Level 1 critical trauma, cardiac arrests, acute respiratory failure. Telemetry & crash carts.'
  },
  YELLOW: {
    code: 'YELLOW',
    name: 'Zone Yellow — Acute Care',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    description: 'Level 2-3 acute monitored cases, chest pain, stroke, sepsis, acute abdomen.'
  },
  GREEN: {
    code: 'GREEN',
    name: 'Zone Green — Ambulatory & Observation',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    description: 'Level 3-4 minor procedures, IV hydration, nebulization, stable observation.'
  },
  BLUE: {
    code: 'BLUE',
    name: 'Zone Blue — Isolation & Decontamination',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    description: 'Negative pressure, suspected infectious diseases, chemical/toxic decontamination.'
  }
};

export const MLC_CASE_TYPES = [
  'Road Traffic Accident (RTA)',
  'Physical Assault / Battery',
  'Suspected Poisoning / Chemical Ingestion',
  'Thermal / Electrical Burns',
  'Industrial / Workplace Injury',
  'Fall from Height (Suspicious)',
  'Gunshot / Penetrating Weapon Wound',
  'Snake Bite / Venomous Envenomation',
  'Attempted Suicide / Self-Harm',
  'Brought In Dead (BID) / Suspicious Death'
];

export const DISPOSITION_DESTINATIONS = [
  { id: 'icu', label: 'ICU / Critical Care Unit (MICU / SICU / CCU)', type: 'inpatient_critical' },
  { id: 'ot', label: 'Emergency Operating Theatre (OT)', type: 'surgical' },
  { id: 'cath_lab', label: 'Emergency Cardiac Cath Lab (Primary PCI)', type: 'interventional' },
  { id: 'inpatient_ward', label: 'Inpatient Ward (General / Step-Down / Private)', type: 'inpatient' },
  { id: 'discharge', label: 'Discharge Home (Prescriptions & OPD Follow-up)', type: 'discharge' },
  { id: 'lama', label: 'Left Against Medical Advice (LAMA) / DOR', type: 'irregular' },
  { id: 'tertiary_transfer', label: 'Tertiary Care Center Transfer (ALS Ambulance)', type: 'transfer' }
];

export const ARRIVAL_MODES = [
  { id: 'ambulance', label: 'Ambulance (108 / Hospital Fleet)' },
  { id: 'walk_in', label: 'Walk-in (Self / Relative)' },
  { id: 'wheelchair', label: 'Wheelchair / ER Triage Porters' },
  { id: 'police', label: 'Police Escort / Custodial Transfer' }
];
