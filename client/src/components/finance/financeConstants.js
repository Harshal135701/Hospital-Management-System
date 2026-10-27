import {
  Landmark,
  Receipt,
  Award,
  Building2,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';

export const FINANCE_SUBMODULES = [
  {
    id: '13.1',
    code: '13.1',
    label: 'Chart of Accounts & General Ledger',
    shortLabel: 'Chart of Accounts & GL',
    icon: Landmark,
    badge: 'General Ledger',
    description: 'Double-entry hospital bookkeeping, multi-level account hierarchy, journal voucher postings, and real-time ledger balances.'
  },
  {
    id: '13.2',
    code: '13.2',
    label: 'Debit / Credit Payment Vouchers',
    shortLabel: 'Debit / Credit Vouchers',
    icon: Receipt,
    badge: 'Payment Vouchers',
    description: 'Accounts payable vendor disbursements, patient refund debit vouchers, corporate TPA receipt credits, and counter cash contra vouchers.'
  },
  {
    id: '13.3',
    code: '13.3',
    label: 'Doctor Payout & Revenue Share Calculation',
    shortLabel: 'Doctor Payouts & Share',
    icon: Award,
    badge: 'Doctor Payout',
    description: 'Consultant revenue splits on OPD consultations, IPD ward visits, OT surgeries, and diagnostic imaging with statutory 10% TDS (Sec 194J).'
  },
  {
    id: '13.4',
    code: '13.4',
    label: 'Bank Reconciliation',
    shortLabel: 'Bank Reconciliation',
    icon: Building2,
    badge: 'Bank Reconciliation',
    description: 'Automated bank passbook to hospital ledger balancing, unpresented cheques tracking, direct insurance credits, and variance reconciliation.'
  },
  {
    id: '13.5',
    code: '13.5',
    label: 'Profit & Loss / Balance Sheet Reporting',
    shortLabel: 'P&L / Balance Sheet',
    icon: BarChart3,
    badge: 'Financial Statements',
    description: 'Executive clinical P&L statements, department profit margins, balance sheet asset/liability verification, and hospital EBITDA reporting.'
  }
];

export const ACCOUNT_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'asset', label: 'Assets (1000s)', color: 'teal' },
  { id: 'liability', label: 'Liabilities (2000s)', color: 'warning' },
  { id: 'equity', label: 'Equity & Reserves (3000s)', color: 'info' },
  { id: 'revenue', label: 'Operating Revenue (4000s)', color: 'success' },
  { id: 'expense', label: 'Operating Expenses (5000s)', color: 'danger' }
];

export const VOUCHER_TYPES = [
  { id: 'all', label: 'All Voucher Types' },
  { id: 'payment', label: 'Payment Voucher (Debit)', prefix: 'PV' },
  { id: 'receipt', label: 'Receipt Voucher (Credit)', prefix: 'RV' },
  { id: 'contra', label: 'Contra Voucher (Cash/Bank)', prefix: 'CV' },
  { id: 'journal', label: 'Journal Voucher (JV)', prefix: 'JV' }
];

export const PAYMENT_MODES = [
  { value: 'neft_rtgs', label: 'NEFT / RTGS Bank Transfer' },
  { value: 'cheque', label: 'Bank Cheque' },
  { value: 'upi_pos', label: 'Hospital UPI / POS Gateway' },
  { value: 'net_banking', label: 'Corporate Net Banking' },
  { value: 'cash', label: 'Cashier Counter Cash' }
];

export const VOUCHER_STATUSES = {
  paid: { label: 'Paid / Cleared', variant: 'success', icon: CheckCircle2 },
  approved: { label: 'Approved', variant: 'teal', icon: CheckCircle2 },
  pending: { label: 'Pending Verification', variant: 'warning', icon: Clock },
  draft: { label: 'Draft', variant: 'gray', icon: FileText },
  cancelled: { label: 'Cancelled / Void', variant: 'danger', icon: XCircle }
};

export const DOCTOR_PAYOUT_STATUSES = {
  disbursed: { label: 'Disbursed / Paid', variant: 'success' },
  calculated: { label: 'Calculated / Approved', variant: 'teal' },
  pending: { label: 'Pending Calculation', variant: 'warning' }
};

export const HOSPITAL_BANK_ACCOUNTS = [
  {
    id: 'hdfc_oper',
    bankName: 'HDFC Bank',
    accountNumber: '50200018829104',
    accountType: 'Operational Current A/c',
    branch: 'Fort Medical Branch, Mumbai',
    ifsc: 'HDFC0000060',
    glCode: '1020'
  },
  {
    id: 'sbi_escrow',
    bankName: 'State Bank of India',
    accountNumber: '38910471928',
    accountType: 'Healthcare Escrow & Grants A/c',
    branch: 'Campus Medical Enclave Branch',
    ifsc: 'SBIN0001234',
    glCode: '1030'
  },
  {
    id: 'icici_tpa',
    bankName: 'ICICI Bank',
    accountNumber: '002105019842',
    accountType: 'TPA & Corporate Collections A/c',
    branch: 'Central Health Tower Branch',
    ifsc: 'ICIC0000021',
    glCode: '1040'
  }
];

export const REPORT_PERIODS = [
  { id: 'fy2627_ytd', label: 'FY 2026-27 (Year to Date: Apr - Oct 2026)' },
  { id: 'q3_2026', label: 'Q3 FY 2026-27 (Oct - Dec 2026)' },
  { id: 'cur_month', label: 'Current Month (October 2026)' },
  { id: 'prev_month', label: 'Previous Month (September 2026)' }
];
