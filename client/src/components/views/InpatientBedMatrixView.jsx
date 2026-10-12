import React, { useState } from 'react';
import { 
  Bed, 
  UserCheck, 
  Activity, 
  ArrowRightLeft, 
  Stethoscope, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { IP_ADMISSIONS, BEDS_MATRIX, PATIENTS, DOCTORS, ROOMS } from '../../data/mockData';

export default function InpatientBedMatrixView() {
  const [activeSubTab, setActiveSubTab] = useState('17.2'); // 17.1 Desk, 17.2 Admissions (Screenshot 1), 17.3 Bed Matrix, 17.4 Transfer, 17.5 Rounds, 17.6 Discharge
  const [admissionsList, setAdmissionsList] = useState(IP_ADMISSIONS);
  const [bedsList, setBedsList] = useState(BEDS_MATRIX);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBedForTransfer, setSelectedBedForTransfer] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetBed, setTargetBed] = useState('B-WRD-103');

  const filteredAdmissions = admissionsList.filter(adm =>
    adm.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.ip_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.ward_bed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecuteTransfer = () => {
    alert(`Bed Transfer confirmed! Transferred ${selectedBedForTransfer?.patient} to ${targetBed}. Transit vitals logged.`);
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-mono text-xs font-bold">
              MODULE 17.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Inpatient Department (IPD) & Live Bed Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Admissions Registry, Ward Bed Matrix, Clinical Rounds & Discharge Clearance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('17.3')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Bed className="w-4 h-4 text-teal-400" />
            <span>Live Bed Matrix (17.3)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: 17.1 to 17.6 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('17.1')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '17.1'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          17.1 Admission Desk & Form
        </button>

        <button
          onClick={() => setActiveSubTab('17.2')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '17.2'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>17.2 My IP Admissions Dashboard</span>
          <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded text-[10px] font-bold">
            Screenshot 1
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('17.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '17.3'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          17.3 Live Bed Matrix / Bed Board
        </button>

        <button
          onClick={() => setActiveSubTab('17.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '17.4'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          17.4 Bed Transfer Management
        </button>

        <button
          onClick={() => setActiveSubTab('17.5')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '17.5'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          17.5 Inpatient Daily Rounds
        </button>

        <button
          onClick={() => setActiveSubTab('17.6')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '17.6'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          17.6 Discharge Process & Summary
        </button>
      </div>

      {/* 17.2 MY IP ADMISSIONS DASHBOARD (Matches Screenshot 1) */}
      {activeSubTab === '17.2' && (
        <div className="space-y-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Currently Admitted Patients</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">3 Patients</p>
              <span className="text-[10px] text-sky-600 font-semibold">1 CCU • 1 General • 1 Suite</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Total Running Incurred Charges</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹2,88,100</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Live Real-time Ledger</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Escrow Advances Deposited</span>
              <p className="text-2xl font-black text-sky-600 mt-1">₹1,20,000</p>
              <span className="text-[10px] text-slate-400">Security deposits received</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Net Outstanding Balance Due</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹1,68,100</p>
              <span className="text-[10px] text-amber-600 font-semibold">Pre-Auth & Self-Pay Due</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Admitted Patient, UHID, IP No, Ward Bed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing active admitted cases in current branch
            </span>
          </div>

          {/* Screenshot 1 Admissions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">IP No & Admitted On</th>
                    <th className="py-3 px-4">Patient & UHID</th>
                    <th className="py-3 px-4">Ward & Allocated Bed</th>
                    <th className="py-3 px-4">Treating Consultant</th>
                    <th className="py-3 px-4">Provisional Diagnosis</th>
                    <th className="py-3 px-4">Insurance / Payer</th>
                    <th className="py-3 px-4 text-right">Running Bill</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredAdmissions.map((adm) => (
                    <tr key={adm.ip_no} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">{adm.ip_no}</span>
                        <span className="text-[10px] text-slate-400">{adm.admitted_on}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{adm.patient_name}</p>
                        <p className="font-mono text-[11px] text-teal-600 dark:text-teal-400">{adm.uhid}</p>
                        <p className="text-[10px] text-slate-400">{adm.age_gender}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 block max-w-fit">
                          {adm.ward_bed}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{adm.consultant}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="truncate text-xs text-slate-600 dark:text-slate-400" title={adm.diagnosis}>
                          {adm.diagnosis}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-[180px]">
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate" title={adm.insurance_tpa}>
                          {adm.insurance_tpa}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                        ₹{adm.running_bill.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        ₹{adm.balance_due.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {adm.status}
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

      {/* 17.3 LIVE BED MATRIX / BED BOARD */}
      {activeSubTab === '17.3' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Bed Matrix & Ward Board (17.3)</h3>
              <p className="text-xs text-slate-500">Visual ICU, General Ward and Deluxe Suite occupancy with continuous telemetry stream</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span>Occupied (5)</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Available (3)</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Sanitizing (1)</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span>Reserved (1)</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-3">
            {bedsList.map((bed) => {
              const isOccupied = bed.status === 'Occupied';
              const isAvailable = bed.status === 'Available';
              return (
                <div
                  key={bed.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOccupied
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : isAvailable
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{bed.number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOccupied ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      isAvailable ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {bed.status}
                    </span>
                  </div>

                  <div className="py-2.5 space-y-1.5 text-xs">
                    <p className="text-[11px] text-slate-400 font-semibold">{bed.ward}</p>
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {isOccupied ? bed.patient : 'Vacant Bed Slot'}
                    </p>
                    {isOccupied && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <Heart className="w-3 h-3 text-rose-500 vital-pulse" />
                            <span>HR:</span>
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{bed.monitor_hr} bpm</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">BP:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{bed.monitor_bp}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">SPO2:</span>
                          <span className="font-mono font-bold text-teal-600">{bed.monitor_spo2}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOccupied && (
                    <button
                      onClick={() => {
                        setSelectedBedForTransfer(bed);
                        setShowTransferModal(true);
                      }}
                      className="w-full mt-2 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1 shadow-xs"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                      <span>Transfer Bed (17.4)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bed Transfer Modal (17.4) */}
      {showTransferModal && selectedBedForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
            <div className="bg-sky-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Transfer Inpatient Bed (17.4)</h3>
              <button onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Bed & Patient</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">{selectedBedForTransfer.patient}</p>
                <p className="text-slate-500">{selectedBedForTransfer.ward} • {selectedBedForTransfer.number}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Target Vacant Bed</label>
                <select
                  value={targetBed}
                  onChange={e => setTargetBed(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="B-WRD-103">General Male Ward • Bed M-103 (Available)</option>
                  <option value="B-PVT-402">Deluxe Private Suite • PVT-402 (Available)</option>
                  <option value="B-ICU-04">Cardio ICU • ICU-04 (Available)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Transfer Rationale</label>
                <input
                  type="text"
                  defaultValue="Post-intervention stabilization, step-down to floor"
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button onClick={handleExecuteTransfer} className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold">
                  Confirm Bed Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
