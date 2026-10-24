import {
  Activity,
  Egg,
  Dna,
  Microscope,
  Syringe,
  Snowflake,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export const EMBRYOLOGY_SUBMODULES = [
  {
    id: 'overview',
    number: '10.0',
    title: 'Embryology Overview Dashboard',
    shortTitle: 'Overview',
    badge: 'Dashboard',
    icon: Activity,
    description: 'Central operational monitoring of oocyte retrievals, fertilization rates, embryo culture incubators & cryo inventory'
  },
  {
    id: '10.1',
    number: '10.1',
    title: 'Oocyte Retrieval (OPU) Recording',
    shortTitle: 'Oocyte Retrieval (OPU)',
    badge: 'OPU',
    icon: Egg,
    description: 'Follicular aspiration dish logs, total oocyte counts, MII/MI/GV maturity classifications & dish traceability'
  },
  {
    id: '10.2',
    number: '10.2',
    title: 'Fertilization (Conventional IVF / ICSI)',
    shortTitle: 'Fertilization (IVF / ICSI)',
    badge: 'Fertilization',
    icon: Dna,
    description: 'Insemination protocols, ICSI microinjections, 16-18h pronuclear (2PN) assessments & fertilization rates'
  },
  {
    id: '10.3',
    number: '10.3',
    title: 'Embryo Morphological Grading',
    shortTitle: 'Embryo Grading',
    badge: 'Grading',
    icon: Microscope,
    description: 'Day 3 cleavage evaluations and Day 5/6 Gardner blastocyst expansion, ICM, and trophectoderm criteria'
  },
  {
    id: '10.4',
    number: '10.4',
    title: 'Embryo Transfer (ET) Protocol',
    shortTitle: 'Embryo Transfer (ET)',
    badge: 'Transfer',
    icon: Syringe,
    description: 'Fresh & frozen ET scheduling, catheter tracking, ultrasound guidance, endometrial thickness & luteal regimens'
  },
  {
    id: '10.5',
    number: '10.5',
    title: 'Embryo Cryostorage Management',
    shortTitle: 'Embryo Cryostorage',
    badge: 'Cryo-Bank',
    icon: Snowflake,
    description: 'Traceable liquid nitrogen storage matrix, vitrification straws, canister coordinates, consent expiry & thawing logs'
  }
];

export const OOCYTE_MATURITY_STAGES = [
  { code: 'MII', name: 'Metaphase II (Mature)', description: 'First polar body extruded; optimal for ICSI microinjection', color: '#087F8C' },
  { code: 'MI', name: 'Metaphase I (Intermediate)', description: 'No polar body, no germinal vesicle; immature', color: '#C68A27' },
  { code: 'GV', name: 'Germinal Vesicle (Immature)', description: 'Prominent nuclear membrane; prophase I arrest', color: '#C94C55' },
  { code: 'DEG', name: 'Degenerated / Atretic', description: 'Vacuolated, dark or fractured zona pellucida', color: '#8E9F9F' }
];

export const FERTILIZATION_METHODS = [
  { value: 'ICSI', label: 'ICSI — Intracytoplasmic Sperm Injection', recommendedFor: 'Severe male factor, previous fertilization failure' },
  { value: 'Conventional_IVF', label: 'Conventional IVF — Standard Insemination', recommendedFor: 'Normozoospermia, tubal or unexplained factor' },
  { value: 'PICSI', label: 'PICSI — Physiological Hyaluronan Bound ICSI', recommendedFor: 'High sperm DNA fragmentation' },
  { value: 'Split_IVF_ICSI', label: 'Split IVF / ICSI (50% IVF, 50% ICSI)', recommendedFor: 'Borderline semen parameters, diagnostic cycle' }
];

export const PRONUCLEAR_STAGES = [
  { code: '2PN', label: 'Normal 2PN (Two Pronuclei + 2 Polar Bodies)', status: 'normal', color: '#21856B' },
  { code: '1PN', label: 'Abnormal 1PN (Single Pronucleus)', status: 'abnormal', color: '#C68A27' },
  { code: '3PN', label: 'Abnormal Multi-PN (Triploid / Polyspermic)', status: 'abnormal', color: '#C94C55' },
  { code: '0PN', label: 'Unfertilized (No Pronuclei Visible)', status: 'unfertilized', color: '#8E9F9F' },
  { code: 'DEG', label: 'Degenerated Post-Injection', status: 'degenerated', color: '#991B1B' }
];

export const GARDNER_EXPANSION_STAGES = [
  { value: '1', label: '1 - Early Blastocyst (Blastocoel < half volume)' },
  { value: '2', label: '2 - Blastocyst (Blastocoel ≥ half volume)' },
  { value: '3', label: '3 - Full Blastocyst (Blastocoel completely fills embryo)' },
  { value: '4', label: '4 - Expanded Blastocyst (Zona thinning, enlarged cavity)' },
  { value: '5', label: '5 - Hatching Blastocyst (Trophectoderm herniating)' },
  { value: '6', label: '6 - Hatched Blastocyst (Completely escaped from zona)' }
];

export const GARDNER_ICM_GRADES = [
  { value: 'A', label: 'A - Many cells, tightly packed cohesive inner cell mass' },
  { value: 'B', label: 'B - Several cells, loosely grouped inner cell mass' },
  { value: 'C', label: 'C - Very few cells present in inner cell mass' }
];

export const GARDNER_TE_GRADES = [
  { value: 'A', label: 'A - Many cells forming continuous cohesive epithelium' },
  { value: 'B', label: 'B - Moderate number of cells forming loose epithelium' },
  { value: 'C', label: 'C - Very few large cells forming sparse epithelium' }
];

export const EMBRYO_STATUSES = {
  viable: { label: 'Viable / Culturing', variant: 'info', color: '#4388C7' },
  selected_for_et: { label: 'Selected for Transfer', variant: 'teal', color: '#087F8C' },
  transferred: { label: 'Transferred (ET)', variant: 'success', color: '#21856B' },
  frozen: { label: 'Cryopreserved (LN2)', variant: 'teal', color: '#087F8C' },
  arrested: { label: 'Development Arrested', variant: 'gray', color: '#8E9F9F' },
  discarded: { label: 'Discarded (Non-Viable)', variant: 'danger', color: '#C94C55' }
};

export const CRYOSTORAGE_TANKS = [
  { id: 'Tank-1', name: 'CryoVessel MVE Tank 1 (Auto-fill LN2)', facility: 'IVF Cleanroom Cryo-Bank A', temp: '-196°C' },
  { id: 'Tank-2', name: 'CryoVessel MVE Tank 2 (Manual LN2)', facility: 'IVF Cleanroom Cryo-Bank A', temp: '-196°C' },
  { id: 'Tank-3', name: 'Taylor-Wharton Vapor Shipper Tank 3', facility: 'IVF Secondary Bank B', temp: '-196°C' }
];

export const GOBLET_COLORS = ['Blue', 'Yellow', 'Green', 'Red', 'White', 'Purple', 'Orange'];
