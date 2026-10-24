
import {
  Package,
  ClipboardList,
  Wrench,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';

export const FIXED_ASSET_SUBMODULES = [
  { id: '14.1', label: 'Asset Master & Barcode Tagging', icon: Package },
  { id: '14.2', label: 'AMC / CMC Contracts & Warranties', icon: ClipboardList },
  { id: '14.3', label: 'Preventive Maintenance Scheduling', icon: Wrench },
  { id: '14.4', label: 'Breakdown Reporting & Work Ticket', icon: AlertTriangle },
  { id: '14.5', label: 'Asset Depreciation Calculation', icon: TrendingDown },
];

export const ASSET_STATUSES = [
  'Active',
  'Under Maintenance',
  'Breakdown',
  'Retired',
];

export const ASSET_CATEGORIES = [
  'Medical Equipment',
  'IT Equipment',
  'Furniture',
  'Electrical Equipment',
  'Facility Equipment',
];

export const ASSET_DEPARTMENTS = [
  'Radiology',
  'ICU',
  'Emergency',
  'Laboratory',
  'Operation Theatre',
  'General Ward',
  'Administration',
  'Pharmacy',
];

export const ASSET_STORAGE_KEY = 'medicsprime_fixed_assets_v1';
