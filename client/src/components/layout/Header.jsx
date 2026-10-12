import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Bell, 
  Search, 
  ShieldAlert, 
  Tv, 
  Sun, 
  Moon, 
  ChevronDown, 
  Check, 
  Volume2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { HOSPITAL_BRANCHES } from '../../data/mockData';

export default function Header({ 
  currentBranch, 
  onSelectBranch, 
  currentRole, 
  onSelectRole, 
  onOpenQueueDisplay, 
  onOpenBookAppointment,
  onSearchClick,
  darkMode,
  onToggleDarkMode
}) {
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  const roles = [
    { id: 'cmo', title: 'Chief Medical Officer (CMO)', badge: 'Full Clinical & Ops' },
    { id: 'doctor', title: 'Consulting Physician / Surgeon', badge: 'OPD, IPD, CPOE' },
    { id: 'nurse', title: 'Head Nursing Station In-Charge', badge: 'MAR, Vitals, Bed' },
    { id: 'cashier', title: 'Revenue & Billing Cashier Desk', badge: 'POS, Interim, Refunds' },
    { id: 'pharmacy', title: 'Pharmacy & Central Store Head', badge: 'Dispense, FIFO, Indents' },
    { id: 'admin', title: 'Enterprise System Administrator', badge: 'RBAC, Audit, Masters' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Code Blue / Red Emergency Broadcast Banner (Toggled by clinical button) */}
      {emergencyAlertActive && (
        <div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>CODE BLUE RESUSCITATION BROADCAST: Ward A-12 Bed 04 • Crash Team Dispatched</span>
          </div>
          <button 
            onClick={() => setEmergencyAlertActive(false)}
            className="text-white/80 hover:text-white underline text-[11px]"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <span className="text-xl font-black">+</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">AURA ENTERPRISE HMS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                  NABH v5.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Integrated Hospital Information & EMR Suite</p>
            </div>
          </div>

          {/* Center Quick Search (UHID / Doctor / Invoice) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div 
              onClick={onSearchClick}
              className="w-full flex items-center bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer transition shadow-xs"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <span className="flex-1">Search UHID, Patient Name, Invoice, Doctor...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Controls: Branch, Role, Emergency Alert, Queue Display, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Branch Switcher (Screenshot 2 & 30.3) */}
            <div className="relative">
              <button
                onClick={() => { setShowBranchMenu(!showBranchMenu); setShowRoleMenu(false); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="max-w-[110px] truncate">{currentBranch.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showBranchMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                    Switch Active Hospital Campus (30.3)
                  </div>
                  {HOSPITAL_BRANCHES.map(br => (
                    <button
                      key={br.id}
                      onClick={() => {
                        onSelectBranch(br);
                        setShowBranchMenu(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-start justify-between transition"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{br.code} • {br.city}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{br.branch_name}</p>
                      </div>
                      {currentBranch.id === br.id && <Check className="w-4 h-4 text-sky-600 mt-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Role Switcher (Screenshot 4 & 30.4) */}
            <div className="relative">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowBranchMenu(false); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">{currentRole.title.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                    Switch Active Role & Persona (30.4)
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRole(r);
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start justify-between transition"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{r.title}</p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400">{r.badge}</p>
                      </div>
                      {currentRole.id === r.id && <Check className="w-4 h-4 text-teal-600 mt-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Waiting Room TV Display Toggle (Module 3.3) */}
            <button
              onClick={onOpenQueueDisplay}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition"
              title="Launch Token Queue TV Waiting Display (3.3)"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Quick Book Appointment CTA */}
            <button
              onClick={onOpenBookAppointment}
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book OPD (3.1)</span>
            </button>

            {/* Emergency Code Trigger */}
            <button
              onClick={() => setEmergencyAlertActive(!emergencyAlertActive)}
              className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl transition border border-rose-200/60 dark:border-rose-900/60"
              title="Broadcast Emergency Code Blue Alert"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Clinical Night Shift Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
