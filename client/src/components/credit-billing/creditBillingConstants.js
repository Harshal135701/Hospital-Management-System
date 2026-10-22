import {
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  IndianRupee,
  Landmark,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2
} from 'lucide-react';

export const CREDIT_BILLING_SUBMODULES = [
  {
    id: '7.1',
    number: '7.1',
    title: '7.1 TPA & Insurance Pre-Authorization',
    shortTitle: 'Pre-Authorization',
    badge: 'Pre-Auth',
    icon: ShieldCheck,
    description: 'Cashless treatment approvals, IRDAI pre-auth forms, policy validation, query resolution & initial approvals'
  },
  {
    id: '7.2',
    number: '7.2',
    title: '7.2 Enhancement Request Management',
    shortTitle: 'Enhancement Requests',
    badge: 'Enhancements',
    icon: TrendingUp,
    description: 'Mid-stay hospital bill tracking vs approved limits, clinical justification & additional cashless enhancement approvals'
  },
  {
    id: '7.3',
    number: '7.3',
    title: '7.3 Claim Dossier Compilation & Submission',
    shortTitle: 'Claim Dossier & Filing',
    badge: 'Claims',
    icon: FileSpreadsheet,
    description: 'Discharge claim dossiers, 8-point mandatory IRDAI checklist, courier/portal dispatch tracking & acknowledgments'
  },
  {
    id: '7.4',
    number: '7.4',
    title: '7.4 Co-Payment & Deductible Collection',
    shortTitle: 'Co-Pay & Deductibles',
    badge: 'Patient Share',
    icon: IndianRupee,
    description: 'Patient responsibility calculations, non-payable deductions, advance adjustments & gate-pass clearance receipts'
  },
  {
    id: '7.5',
    number: '7.5',
    title: '7.5 TPA Reconciliation & Payment Posting',
    shortTitle: 'TPA Reconciliation',
    badge: 'Reconciliation',
    icon: Landmark,
    description: 'Bank remittance UTR posting, TDS deductions, disallowance reason categorization, bad debt write-offs & aging buckets'
  }
];

export const TPA_INSURERS_LIST = [
  { id: 'tpa-star', name: 'Star Health & Allied Insurance', type: 'Standalone Health Insurer', tollFree: '1800-425-2255', portal: 'starhealth.in/cashless' },
  { id: 'tpa-mediassist', name: 'MediAssist India TPA Pvt Ltd', type: 'Third Party Administrator', tollFree: '1800-425-9449', portal: 'mediassisttpa.in' },
  { id: 'tpa-vidal', name: 'Vidal Health Insurance TPA Pvt Ltd', type: 'Third Party Administrator', tollFree: '1800-425-8885', portal: 'vidalhealthtpa.com' },
  { id: 'tpa-icici', name: 'ICICI Lombard General Insurance', type: 'General Insurer (In-house TPA)', tollFree: '1800-2666', portal: 'icicilombard.com/health' },
  { id: 'tpa-hdfc', name: 'HDFC ERGO General Insurance', type: 'General Insurer (In-house TPA)', tollFree: '022-6234-6234', portal: 'hdfcergo.com/claims' },
  { id: 'tpa-care', name: 'Care Health Insurance (Religare)', type: 'Standalone Health Insurer', tollFree: '1800-102-4488', portal: 'careinsurance.com' },
  { id: 'tpa-fhpl', name: 'Family Health Plan Insurance TPA (FHPL)', type: 'Third Party Administrator', tollFree: '1800-425-4033', portal: 'fhpl.net' },
  { id: 'tpa-nivabupa', name: 'Niva Bupa Health Insurance (Max Bupa)', type: 'Standalone Health Insurer', tollFree: '1860-500-8888', portal: 'nivabupa.com' },
  { id: 'tpa-bajaj', name: 'Bajaj Allianz General Insurance', type: 'General Insurer (HAT TPA)', tollFree: '1800-209-5858', portal: 'bajajallianz.com' },
  { id: 'tpa-mdindia', name: 'MDIndia Health Insurance TPA Pvt Ltd', type: 'Third Party Administrator', tollFree: '1800-233-1166', portal: 'mdindiaonline.com' },
  { id: 'tpa-paramount', name: 'Paramount Health Services & Insurance TPA', type: 'Third Party Administrator', tollFree: '1800-22-6655', portal: 'paramounttpa.com' },
  { id: 'tpa-heritage', name: 'Heritage Health Insurance TPA Pvt Ltd', type: 'Third Party Administrator', tollFree: '1800-345-3477', portal: 'heritagehealthtpa.com' }
];

export const PREAUTH_STATUS_CONFIG = {
  pending: { label: 'Draft / Pending', variant: 'gray', icon: Clock },
  submitted: { label: 'Submitted to TPA', variant: 'info', icon: Clock },
  queries_raised: { label: 'Query Raised by TPA', variant: 'warning', icon: HelpCircle },
  approved: { label: 'Cashless Approved', variant: 'success', icon: CheckCircle2 },
  partially_approved: { label: 'Partially Approved', variant: 'teal', icon: CheckCircle2 },
  rejected: { label: 'Cashless Denied', variant: 'danger', icon: XCircle },
  cancelled: { label: 'Request Cancelled', variant: 'gray', icon: XCircle }
};

export const ENHANCEMENT_STATUS_CONFIG = {
  draft: { label: 'Draft Request', variant: 'gray', icon: Clock },
  requested: { label: 'Submitted to TPA', variant: 'info', icon: Clock },
  under_review: { label: 'Under Medical Audit', variant: 'warning', icon: Clock },
  approved: { label: 'Enhancement Approved', variant: 'success', icon: CheckCircle2 },
  partially_approved: { label: 'Partial Approved', variant: 'teal', icon: CheckCircle2 },
  rejected: { label: 'Enhancement Denied', variant: 'danger', icon: XCircle }
};

export const CLAIM_DOSSIER_STATUS_CONFIG = {
  in_compilation: { label: 'In Compilation', variant: 'gray', icon: Clock },
  ready_for_dispatch: { label: 'Ready for Dispatch', variant: 'teal', icon: CheckCircle2 },
  dispatched: { label: 'Dispatched to TPA', variant: 'info', icon: Clock },
  acknowledged: { label: 'Acknowledged by TPA', variant: 'warning', icon: CheckCircle2 },
  settled: { label: 'Claim Settled', variant: 'success', icon: CheckCircle2 }
};

export const RESPONSIBILITY_STATUS_CONFIG = {
  pending: { label: 'Pending Collection', variant: 'warning', icon: Clock },
  partially_collected: { label: 'Partially Collected', variant: 'teal', icon: Clock },
  collected: { label: 'Fully Paid & Cleared', variant: 'success', icon: CheckCircle2 },
  waived: { label: 'Hospital Discount / Waived', variant: 'gray', icon: CheckCircle2 }
};

export const MANDATORY_DOSSIER_DOCUMENTS = [
  { id: 'doc-final-bill', code: 'BILL_01', name: 'Itemized Final Hospital Bill (Signed & Stamped)', mandatory: true, category: 'Billing' },
  { id: 'doc-discharge-summary', code: 'SUMM_02', name: 'Clinical Discharge Summary with Operative Findings', mandatory: true, category: 'Clinical' },
  { id: 'doc-pharmacy-bills', code: 'PHARM_03', name: 'Itemized Pharmacy Dispensation Invoices', mandatory: true, category: 'Pharmacy' },
  { id: 'doc-investigations', code: 'LAB_04', name: 'Pathology & Radiology Diagnostic Reports', mandatory: true, category: 'Diagnostics' },
  { id: 'doc-implant-invoice', code: 'IMP_05', name: 'Implant / Stent Outer Box Barcode Stickers & Invoices', mandatory: false, category: 'Surgical' },
  { id: 'doc-ot-notes', code: 'OT_06', name: 'Operation Theatre & Anesthesia Intra-Op Record', mandatory: false, category: 'Surgical' },
  { id: 'doc-preauth-letter', code: 'AUTH_07', name: 'Pre-Authorization & Enhancement Approval Letters', mandatory: true, category: 'Insurance' },
  { id: 'doc-claim-form', code: 'FORM_08', name: 'Signed IRDAI Claim Form (Part A & Part B)', mandatory: true, category: 'Insurance' }
];

export const DISALLOWANCE_CATEGORIES = [
  { id: 'consumables', label: 'Non-Admissible Consumables (Gloves, Apron, Cotton, Thermometer)' },
  { id: 'room_diff', label: 'Room Rent / ICU Tariff Difference beyond Capped Limit' },
  { id: 'mou_discount', label: 'Hospital Negotiated Tariff Discount as per TPA MoU' },
  { id: 'package_capping', label: 'Surgical Package Rate Capping Excess' },
  { id: 'medical_audit', label: 'Medical Auditor Disallowance (Unwarranted Investigation)' },
  { id: 'query_delay', label: 'Late Submission / Query Resolution Penalty' }
];
