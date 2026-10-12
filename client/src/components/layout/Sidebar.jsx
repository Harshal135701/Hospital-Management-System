import React, { useState } from 'react';
import {
  Calendar,
  CreditCard,
  Droplet,
  Stethoscope,
  ShieldAlert,
  Clock,
  Utensils,
  Baby,
  Activity,
  FileText,
  Landmark,
  Wrench,
  Building2,
  Package,
  Bed,
  FlaskConical,
  Archive,
  UserCheck,
  LayoutDashboard,
  Scissors,
  UserPlus,
  Pill,
  ShoppingCart,
  Scan,
  Store,
  Settings,
  User,
  ClipboardList,
  BarChart3,
  Search,
  ChevronRight
} from 'lucide-react';

export const MODULE_GROUPS = [
  {
    group: "1. Outpatient & Front Desk",
    items: [
      { id: "mod-24", num: "24", name: "Patient Registration & UHID", icon: UserPlus, badge: "Front Desk" },
      { id: "mod-3", num: "3", name: "Appointments & Queue", icon: Calendar, badge: "OPD Roster" },
      { id: "mod-22", num: "22", name: "OPD Clinic Desk & Visits", icon: LayoutDashboard, badge: "Live Desk" },
    ]
  },
  {
    group: "2. Clinical Care & EMR",
    items: [
      { id: "mod-6", num: "6", name: "Doctor Consultation & CPOE", icon: Stethoscope, badge: "Clinical" },
      { id: "mod-12", num: "12", name: "EMR Lifetime Timeline & Rx", icon: FileText, badge: "ICD-10" },
      { id: "mod-21", num: "21", name: "Ward Nursing Workstation & MAR", icon: UserCheck, badge: "Inpatient Care" },
    ]
  },
  {
    group: "3. Inpatient, Emergency & OT",
    items: [
      { id: "mod-17", num: "17", name: "IPD Admissions & Bed Matrix", icon: Bed, badge: "Bed Board" },
      { id: "mod-11", num: "11", name: "Emergency & Trauma (Triage 1-4)", icon: Activity, badge: "24x7 ER" },
      { id: "mod-23", num: "23", name: "Operation Theatre (OT) & PAC", icon: Scissors, badge: "Surgical" },
      { id: "mod-8", num: "8", name: "Day Care & Short Stay", icon: Clock, badge: "Ambulatory" },
    ]
  },
  {
    group: "4. Diagnostics & Blood Bank",
    items: [
      { id: "mod-19", num: "19", name: "Laboratory Information (LIS)", icon: FlaskConical, badge: "Panic Alert" },
      { id: "mod-27", num: "27", name: "Radiology & DICOM PACS", icon: Scan, badge: "3.0 Viewer" },
      { id: "mod-5", num: "5", name: "Blood Bank & Crossmatch", icon: Droplet, badge: "Serology" },
      { id: "mod-10", num: "10 & 18", name: "IVF & Embryology Suite", icon: Baby, badge: "ART Lab" },
    ]
  },
  {
    group: "5. Revenue Cycle & Cashier",
    items: [
      { id: "mod-4", num: "4", name: "OPD/IPD Billing & Refunds", icon: CreditCard, badge: "POS Desk" },
      { id: "mod-7", num: "7", name: "TPA & Insurance Pre-Auth", icon: ShieldAlert, badge: "Claims" },
      { id: "mod-28", num: "28", name: "Retail Pharmacy POS Counter", icon: Store, badge: "OTC Billing" },
      { id: "mod-13", num: "13", name: "Finance & General Ledger", icon: Landmark, badge: "P&L / Audit" },
    ]
  },
  {
    group: "6. Supply Chain & Facilities",
    items: [
      { id: "mod-25", num: "25", name: "Pharmacy & FIFO Formulary", icon: Pill, badge: "Batch Expiry" },
      { id: "mod-16", num: "16", name: "Inventory & Central Store", icon: Package, badge: "Indents" },
      { id: "mod-26", num: "26", name: "Procurement & Purchase PO", icon: ShoppingCart, badge: "GRN" },
      { id: "mod-31", num: "31", name: "Work Orders & Maintenance", icon: ClipboardList, badge: "Approvals" },
      { id: "mod-14", num: "14", name: "Biomedical Engineering Assets", icon: Wrench, badge: "AMC / Tickets" },
      { id: "mod-9", num: "9", name: "Dietary & Meal Production", icon: Utensils, badge: "Kitchen" },
      { id: "mod-20", num: "20", name: "MRD & Physical File Archival", icon: Archive, badge: "Legal" },
    ]
  },
  {
    group: "7. Governance & Analytics",
    items: [
      { id: "mod-15", num: "15", name: "Hospital & Core Masters", icon: Building2, badge: "HQ Master" },
      { id: "mod-29", num: "29", name: "System Admin & RBAC Audit", icon: Settings, badge: "Sessions" },
      { id: "mod-30", num: "30", name: "User Profile & Security", icon: User, badge: "Account" },
      { id: "mod-32", num: "32", name: "Executive MIS & Analytics", icon: BarChart3, badge: "KPI Data" },
    ]
  }
];

export default function Sidebar({ activeModule, onSelectModule }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = MODULE_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.num.includes(searchTerm) ||
      group.group.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none transition-colors">
      {/* Module Quick Filter Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Quick Jump (e.g. 4.5, Bed, LIS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {filteredGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.group}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-sm shadow-sky-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400'}`} />
                      <div className="truncate text-left">
                        <span className="font-mono text-[11px] opacity-75 mr-1.5">{item.num}.</span>
                        <span>{item.name.split(' & ')[0]}</span>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/60 group-hover:text-sky-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status / Enterprise Build Stamp */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">HMS Production</span>
          <span className="block text-[9px] text-slate-400">Node + PostgreSQL Schema</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
      </div>
    </aside>
  );
}
