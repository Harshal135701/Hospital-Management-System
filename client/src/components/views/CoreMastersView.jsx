import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  UserCheck, 
  Tags, 
  FileCheck, 
  Plus, 
  Search, 
  Printer, 
  MapPin, 
  Phone, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { HOSPITAL_BRANCHES, DEPARTMENTS, DOCTORS } from '../../data/mockData';

export default function CoreMastersView() {
  const [activeSubTab, setActiveSubTab] = useState('15.1'); // 15.1 Branch Master (Screenshot 2), 15.2 Department Hierarchy, 15.3 Doctor Master, 15.4 Tariff Master, 15.5 Corporate Contracts
  const [branches, setBranches] = useState(HOSPITAL_BRANCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    code: 'AHC-DEL',
    branch_name: 'Aura North Campus Superspecialty Hospital',
    city: 'New Delhi, NCR',
    address: 'Sector 62, Institutional Area, Noida - 201309',
    total_beds: 300,
    icu_beds: 50,
    ot_suites: 8,
    contact: '+91 11 4988 2200',
    nabh_status: 'NABH Pre-Accreditation Stage 2',
    status: 'Planned / Q1 Launch'
  });

  const handleCreateBranch = (e) => {
    e.preventDefault();
    setBranches([...branches, { id: `br-${Date.now()}`, ...newBranch }]);
    setShowAddBranch(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-xs font-bold">
              MODULE 15.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Master & Enterprise Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-Branch Enterprise Topology, Departmental Hierarchy, Consultant Registry & Tariff Engine
          </p>
        </div>

        <button
          onClick={() => setShowAddBranch(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hospital Branch (15.1)</span>
        </button>
      </div>

      {/* Sub-Tabs: 15.1 to 15.5 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('15.1')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '15.1'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>15.1 Hospital & Branch Master</span>
          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded text-[10px] font-bold">
            Screenshot 2
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('15.2')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '15.2'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          15.2 Department & Clinic Hierarchy
        </button>

        <button
          onClick={() => setActiveSubTab('15.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '15.3'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          15.3 Doctor & Consultant Master
        </button>

        <button
          onClick={() => setActiveSubTab('15.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '15.4'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          15.4 Service Catalog & Tariff Master
        </button>

        <button
          onClick={() => setActiveSubTab('15.5')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '15.5'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          15.5 Corporate Tariff Rate Contracts
        </button>
      </div>

      {/* 15.1 HOSPITAL & BRANCH MASTER (Matches Screenshot 2) */}
      {activeSubTab === '15.1' && (
        <div className="space-y-4">
          {/* Branch Top Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Registered Hospital Campuses</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{branches.length} Branches</p>
              <span className="text-[10px] text-indigo-600 font-semibold">1 Flagship HQ • 2 Multispecialty</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Total Enterprise Bed Capacity</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">770 Beds</p>
              <span className="text-[10px] text-emerald-600 font-semibold">140 Critical Care ICU Beds</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Major OT Complex Suites</span>
              <p className="text-2xl font-black text-sky-600 mt-1">22 Modular OTs</p>
              <span className="text-[10px] text-sky-600 font-semibold">Class 100 Laminar Cleanrooms</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Accreditation Standards</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">NABH 5th Ed. & JCI Ready</p>
              <span className="text-[10px] text-purple-600 font-semibold">ISO 9001:2015 Certified</span>
            </div>
          </div>

          {/* Screenshot 2 Branch Master Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Hospital Branches & Entities (15.1)</h3>
              <span className="text-xs text-slate-500">Enterprise Tenant ID: ENT-AURA-IND-01</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Branch Code</th>
                    <th className="py-3 px-4">Campus Name & Address</th>
                    <th className="py-3 px-4">City / Region</th>
                    <th className="py-3 px-4 text-center">Beds (Total / ICU / OT)</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">NABH Status</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {branches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{b.code}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{b.branch_name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{b.address}</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {b.city}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {b.total_beds} / {b.icu_beds} / {b.ot_suites}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {b.contact}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                          {b.nabh_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 15.2 Department & Clinic Hierarchy */}
      {activeSubTab === '15.2' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Department & Clinical Hierarchy (15.2)</h3>
          <p className="text-xs text-slate-500">Clinical, Diagnostic and Administrative departments aligned with PostgreSQL schema</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {DEPARTMENTS.map(d => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{d.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Active</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{d.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
                  <span>HOD: <strong>{d.head}</strong></span>
                  <span>{d.floor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Register New Hospital Campus (15.1)</h3>
              <button onClick={() => setShowAddBranch(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateBranch} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Branch Code</label>
                  <input
                    type="text"
                    value={newBranch.code}
                    onChange={e => setNewBranch({ ...newBranch, code: e.target.value })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase">City / State</label>
                  <input
                    type="text"
                    value={newBranch.city}
                    onChange={e => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 uppercase">Campus Full Name</label>
                <input
                  type="text"
                  value={newBranch.branch_name}
                  onChange={e => setNewBranch({ ...newBranch, branch_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl mt-1 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 uppercase">Address</label>
                <input
                  type="text"
                  value={newBranch.address}
                  onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Total Beds</label>
                  <input
                    type="number"
                    value={newBranch.total_beds}
                    onChange={e => setNewBranch({ ...newBranch, total_beds: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase">ICU Beds</label>
                  <input
                    type="number"
                    value={newBranch.icu_beds}
                    onChange={e => setNewBranch({ ...newBranch, icu_beds: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase">OT Suites</label>
                  <input
                    type="number"
                    value={newBranch.ot_suites}
                    onChange={e => setNewBranch({ ...newBranch, ot_suites: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddBranch(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  Save Campus Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
