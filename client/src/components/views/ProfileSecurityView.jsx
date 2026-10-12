import React, { useState } from 'react';
import { 
  User, 
  KeyRound, 
  Building2, 
  ShieldCheck, 
  Palette, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Briefcase,
  Lock
} from 'lucide-react';
import { HOSPITAL_BRANCHES } from '../../data/mockData';

export default function ProfileSecurityView({ 
  currentBranch, 
  onSelectBranch, 
  currentRole, 
  onSelectRole,
  darkMode,
  onToggleDarkMode 
}) {
  const [activeSubTab, setActiveSubTab] = useState('30.1'); // 30.1 Profile (S4), 30.2 Password, 30.3 Branch, 30.4 Role, 30.5 Preferences
  const [profile, setProfile] = useState({
    name: "Dr. Arvind Rathore",
    emp_id: "EMP-MED-0101",
    designation: "Chief Medical Officer & HOD Cardiology",
    department: "Cardiology & Interventional Cath Lab",
    email: "arvind.rathore@aurahospitals.com",
    mobile: "+91 98200 11223",
    medical_council_reg: "MCI / MMC-1998-04-1849",
    specialization: "DM (Cardiology), FACC (USA), FSCAI",
    two_factor_auth: true
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-mono text-xs font-bold">
              MODULE 30.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              User Profile, Credentials & Persona Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Doctor Profile Identity, Two-Factor Authentication, Multi-Branch Affiliation & UI Preferences
          </p>
        </div>

        {savedMessage && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Master Updated!</span>
          </span>
        )}
      </div>

      {/* Sub-Tabs: 30.1 to 30.5 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('30.1')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '30.1'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>30.1 Manage Profile</span>
          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded text-[10px] font-bold">
            Screenshot 4
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('30.2')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '30.2'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          30.2 Change Password & Security
        </button>

        <button
          onClick={() => setActiveSubTab('30.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '30.3'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          30.3 Switch Active Branch
        </button>

        <button
          onClick={() => setActiveSubTab('30.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '30.4'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          30.4 Switch Active Role
        </button>

        <button
          onClick={() => setActiveSubTab('30.5')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '30.5'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          30.5 User UI Preferences & Theme
        </button>
      </div>

      {/* 30.1 MANAGE PROFILE (Screenshot 4) */}
      {activeSubTab === '30.1' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                AR
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{profile.name}</h3>
                <p className="text-xs text-slate-500">{profile.designation}</p>
                <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold block mt-0.5">
                  ID: {profile.emp_id} • Reg: {profile.medical_council_reg}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Clinician</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Direct Mobile Contact</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  disabled
                  className="w-full p-2.5 border rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Credentials & Fellowships</label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save Changes (30.1)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 30.3 SWITCH BRANCH & 30.4 SWITCH ROLE */}
      {activeSubTab === '30.3' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Hospital Branch Affiliation (30.3)</h3>
          <p className="text-xs text-slate-500">Switch current session context across multispecialty enterprise campuses</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {HOSPITAL_BRANCHES.map(b => (
              <div
                key={b.id}
                onClick={() => onSelectBranch(b)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  currentBranch.id === b.id
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-xs font-bold text-teal-600">{b.code}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{b.branch_name}</h4>
                <p className="text-xs text-slate-500 mt-1">{b.city}</p>
                {currentBranch.id === b.id && (
                  <span className="mt-3 text-[10px] text-teal-700 font-bold block">✓ CURRENT ACTIVE BRANCH</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 30.5 THEME & UI PREFERENCES */}
      {activeSubTab === '30.5' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical UI Preferences & Theme (30.5)</h3>
          <p className="text-xs text-slate-500">Customize color modes for emergency wards, high-contrast tables and audio notifications</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Dark / Night Shift Clinical Mode</p>
              <p className="text-slate-500 text-[11px]">Recommended for Radiology reporting suites and emergency night duty</p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
            >
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
