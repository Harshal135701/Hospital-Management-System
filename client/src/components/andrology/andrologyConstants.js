import {
  FlaskConical,
  Snowflake,
  Flame,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck
} from 'lucide-react';

export const ANDROLOGY_SUBMODULES = [
  {
    id: '1.1',
    number: '1.1',
    title: '1.1 Semen Analysis Entry',
    shortTitle: 'Semen Analysis',
    badge: 'Diagnostic',
    icon: FlaskConical,
    description: 'WHO 6th Edition macroscopic & microscopic semen evaluation, automated motility indexing, strict morphology & diagnostic validation'
  },
  {
    id: '1.2',
    number: '1.2',
    title: '1.2 Cryopreservation / Semen Freezing',
    shortTitle: 'Cryopreservation',
    badge: 'Cryo-Bank',
    icon: Snowflake,
    description: 'Specimen vitrification & controlled-rate freezing, unique straw barcoding, liquid nitrogen tank & canister coordinate allocation'
  },
  {
    id: '1.3',
    number: '1.3',
    title: '1.3 Sample Thaw & Usage',
    shortTitle: 'Sample Thaw & Usage',
    badge: 'Traceability',
    icon: Flame,
    description: 'Consent-verified aliquot retrieval, rapid thaw protocol execution, post-thaw survival assessment & procedure deduction'
  },
  {
    id: '1.4',
    number: '1.4',
    title: '1.4 Donor Registry',
    shortTitle: 'Donor Registry',
    badge: 'Registry & ART',
    icon: Users,
    description: 'Identity-masked donor registry, 180-day serology quarantine release, ART regulation compliance & compensation disbursement ledger'
  }
];

// Status configurations matching Credit Billing style (Badge variant + Icon)
export const SEMEN_ANALYSIS_STATUS_CONFIG = {
  'In Analysis': { label: 'In Analysis', variant: 'info', icon: Clock },
  'Draft Saved': { label: 'Draft Saved', variant: 'gray', icon: Clock },
  'Under Review': { label: 'Under Review', variant: 'warning', icon: AlertTriangle },
  'Verified': { label: 'Verified', variant: 'teal', icon: CheckCircle2 },
  'Finalized': { label: 'Finalized', variant: 'success', icon: ShieldCheck }
};

export const CRYO_STATUS_CONFIG = {
  'Stored': { label: 'Stored in LN2', variant: 'success', icon: Snowflake },
  'Partially Thawed': { label: 'Partially Thawed', variant: 'warning', icon: Flame },
  'Depleted': { label: 'All Aliquots Used', variant: 'gray', icon: XCircle },
  'Quarantined': { label: 'Quarantined', variant: 'danger', icon: AlertTriangle }
};

export const THAW_STATUS_CONFIG = {
  'Utilized Successfully': { label: 'Utilized Successfully', variant: 'success', icon: CheckCircle2 },
  'Partially Used': { label: 'Partially Used', variant: 'teal', icon: Flame },
  'In Procedure': { label: 'In Procedure', variant: 'info', icon: Clock },
  'Discarded / Non-Viable': { label: 'Discarded / Non-Viable', variant: 'danger', icon: XCircle }
};

export const DONOR_STATUS_CONFIG = {
  'Active': { label: 'Active & Available', variant: 'success', icon: CheckCircle2 },
  'Cleared & Released': { label: 'Cleared & Released', variant: 'success', icon: ShieldCheck },
  'Under 180-Day Quarantine': { label: '180-Day Quarantine', variant: 'warning', icon: Clock },
  'Quarantined (Retest Due)': { label: 'Quarantine Retest Due', variant: 'danger', icon: AlertTriangle },
  'Inactive / Retired': { label: 'Inactive / Retired', variant: 'gray', icon: XCircle }
};

// WHO 6th Edition Reference Limits Defaults (2021)
export const WHO_6TH_EDITION_STANDARDS = {
  volume_ml_min: 1.4,
  ph_min: 7.2,
  concentration_m_per_ml_min: 16.0,
  total_count_m_min: 39.0,
  progressive_motility_pct_min: 30.0,
  total_motility_pct_min: 42.0,
  normal_morphology_pct_min: 4.0,
  vitality_pct_min: 54.0,
  round_cells_m_per_ml_max: 1.0
};

// Clinical Dropdown Options
export const COLLECTION_METHODS = [
  'Masturbation on-site (Private Room 3)',
  'Masturbation on-site (Private Room 1)',
  'Home Collection (Delivered within 45 min at 37°C)',
  'PESA (Percutaneous Epididymal Sperm Aspiration)',
  'TESA (Testicular Sperm Aspiration)',
  'Micro-TESE (Microsurgical Testicular Extraction)',
  'Retrograde Ejaculation Post-Wash'
];

export const SAMPLE_COMPLETENESS_OPTIONS = [
  'Complete ejaculate collected',
  'First portion lost during collection',
  'Last portion lost during collection',
  'Volume uncertain / Spilled'
];

export const LIQUEFACTION_OPTIONS = [
  'Complete (<30 min)',
  'Normal (30–60 min)',
  'Delayed (>60 min)',
  'Incomplete / Persistent Gel',
  'Immediate (Surgical Aspirate)'
];

export const VISCOSITY_OPTIONS = [
  'Normal',
  'Slightly Increased (<2 cm thread)',
  'Highly Increased (>2 cm thread)',
  'Watery / Very Low'
];

export const APPEARANCE_OPTIONS = [
  'Normal grey-opalescent',
  'Translucent / Watery',
  'Amber / Dirty Brown (Delayed abstinence)',
  'Pink / Reddish (Hematospermia suspicion)',
  'Yellowish / Pyospermia suspicion',
  'Clear fluid with cellular pellet'
];

export const AGGLUTINATION_OPTIONS = [
  'None',
  'Grade 1: Isolated head-to-head (<10 sperm/clump)',
  'Grade 2: Moderate head-to-head / tail-to-tail',
  'Grade 3: Severe tangled masses (>50 sperm/clump)',
  'Non-specific cellular aggregation'
];

export const DIAGNOSTIC_IMPRESSIONS = [
  'Normozoospermia',
  'Oligozoospermia',
  'Asthenozoospermia',
  'Teratozoospermia',
  'Oligoasthenozoospermia (OA)',
  'Asthenoteratozoospermia (AT)',
  'Oligoteratozoospermia (OT)',
  'Oligoasthenoteratozoospermia (OAT)',
  'Azoospermia (Non-obstructive suspicion)',
  'Azoospermia (Obstructive suspicion)',
  'Necrozoospermia',
  'Leukocytospermia',
  'Hematospermia',
  'Surgical Epididymal Recovery (PESA)',
  'Surgical Testicular Recovery (TESA/TESE)'
];

export const CRYO_PROTOCOLS = [
  'Standard Slow Freezing (Planer Controlled Rate -1°C/min to -80°C)',
  'Rapid Vitrification (Direct LN2 plunge in sealed straws)',
  'Controlled Rate Freezing (Automated CryoChamber)',
  'Liquid Nitrogen Vapor Phase Equilibration (Static)'
];

export const CRYOPROTECTANTS = [
  'Irvine Scientific SpermFreeze (1:1 Glycerol/HEPES)',
  'CryoBioSystem SpermFreeze G-EY',
  'Origio Medi-Cult Sperm Freezing Media',
  'Test-Yolk Buffer (TYB with Gentamicin)'
];

export const LN2_STORAGE_TANKS = [
  { id: 'tank-alpha', name: 'Tank Alpha (LN2 -196°C Auto-Fill)', location: 'Main Cryo-Bank Room A', capacity: '1,200 Straws' },
  { id: 'tank-beta', name: 'Tank Beta (LN2 Donor Vault)', location: 'Secure Donor Repository Room B', capacity: '1,800 Straws' },
  { id: 'tank-gamma', name: 'Tank Gamma (Quarantine Facility)', location: 'Bio-Safety Level 2 Cryo-Suite', capacity: '600 Straws' }
];

export const THAW_PROTOCOLS = [
  'Rapid Thaw 37°C water bath 5 min followed by Sil-Select gradient wash',
  'Room temperature air thaw 30s + 37°C water bath 2 min + Density Gradient',
  'Slow step-wise dilution with SpermCare wash medium (37°C)',
  'Direct Swim-up Sperm Preparation from Pellet'
];

export const THAW_INDICATIONS = [
  'OPU Cycle ICSI Insemination',
  'Conventional IVF Insemination',
  'Intrauterine Insemination (IUI - Partner)',
  'Intrauterine Insemination (IUI - Donor)',
  'Pre-Cycle Diagnostic Thaw Survival Recovery Test',
  'Inter-Clinic Courier Transfer'
];

export const DONOR_CATEGORIES = [
  'Sperm Donor',
  'Oocyte Donor',
  'Surrogate / Host'
];
