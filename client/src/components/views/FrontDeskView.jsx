import React, { useState } from 'react';
import { 
  UserPlus, 
  CreditCard, 
  Search, 
  Printer, 
  Plus, 
  Calendar, 
  CheckCircle, 
  UserCheck, 
  Building,
  QrCode
} from 'lucide-react';
import { PATIENTS } from '../../data/mockData';

export default function FrontDeskView({ onOpenPrintCard, onOpenBookModal }) {
  const [activeTab, setActiveTab] = useState('mod-24'); // mod-24 Registration, mod-22 OPD Clinic Desk
  const [patients, setPatients] = useState(PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    full_name: "",
    mobile: "+91 ",
    date_of_birth: "1990-01-01",
    gender: "Male",
    blood_group: "B+",
    address: "Mumbai",
    emergency_contact: "Family - 9800000000",
    allergies: "None reported",
    national_id: "AADHAAR: **** **** 1234"
  });

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    const created = {
      id: `pat-${Date.now()}`,
      uhid: `UHID-2026-00${Math.floor(Math.random() * 8000) + 1000}`,
      ...newPatient
    };
    setPatients([created, ...patients]);
    setShowNewPatientModal(false);
    onOpenPrintCard(created);
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs font-bold">
              MODULE 24.0 & 22.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Patient Registration, UHID Smart Card & OPD Clinic Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Universal Health ID (UHID) Generation, Barcode Smart Card Issuance, Visit Check-in & Encounter Routing
          </p>
        </div>

        <button
          onClick={() => setShowNewPatientModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Patient Registration (24.1)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('mod-24')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-24'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          24. Patient Registration & UHID Generation (24.1 - 24.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-22')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-22'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          22. OPD Clinic Desk & Visit Encounters (22.1 - 22.5)
        </button>
      </div>

      {/* 24. PATIENT REGISTRATION & UHID */}
      {activeTab === 'mod-24' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Patient Name, UHID, Mobile Number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
              />
            </div>
            <span className="text-xs text-slate-500">
              Unique Master Patient Index (MPI): <strong className="text-blue-600">{patients.length} Registered</strong>
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 border-b">
                  <tr>
                    <th className="py-3 px-4">UHID Identifier</th>
                    <th className="py-3 px-4">Patient Name & Demographics</th>
                    <th className="py-3 px-4">Mobile & Identity</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Known Allergies</th>
                    <th className="py-3 px-4 text-right">Smart Card & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredPatients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{p.uhid}</span>
                        <span className="text-[10px] text-slate-400">NABH Identity</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{p.full_name}</p>
                        <p className="text-[11px] text-slate-500">{p.gender} • Born: {p.date_of_birth}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        <p>{p.mobile}</p>
                        <span className="text-[10px] text-slate-400">{p.national_id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 font-bold text-rose-700 dark:text-rose-300 text-[10px]">
                          {p.blood_group}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-rose-600">
                        {p.allergies}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenPrintCard(p)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-1"
                          >
                            <Printer className="w-3.5 h-3.5 text-teal-400" />
                            <span>Print Card (24.2)</span>
                          </button>
                          <button
                            onClick={onOpenBookModal}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                          >
                            New Visit (24.3)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 22. OPD CLINIC DESK */}
      {activeTab === 'mod-22' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">OPD Clinic Desk & Patient Arrival (22.1 - 22.5)</h3>
          <p className="text-xs text-slate-500">Live Arrival Check-in, Consultation Queue Coordination & Visit Slip Printout</p>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex justify-between items-center">
            <span>Morning OPD Shift: 5 active clinics running. Reception desk token validation online.</span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
            >
              Print OPD Visit Slip (22.4)
            </button>
          </div>
        </div>
      )}

      {/* New Patient Registration Modal (24.1) */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="bg-blue-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">New Patient Registration & UHID (24.1)</h3>
              <button onClick={() => setShowNewPatientModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRegisterPatient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Verma"
                  value={newPatient.full_name}
                  onChange={e => setNewPatient({ ...newPatient, full_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={newPatient.mobile}
                    onChange={e => setNewPatient({ ...newPatient, mobile: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.date_of_birth}
                    onChange={e => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Blood Group</label>
                  <select
                    value={newPatient.blood_group}
                    onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="A+">A+ Positive</option>
                    <option value="A-">A- Negative</option>
                    <option value="B+">B+ Positive</option>
                    <option value="B-">B- Negative</option>
                    <option value="O+">O+ Positive</option>
                    <option value="O-">O- Negative</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="AB-">AB- Negative</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowNewPatientModal(false)} className="px-4 py-2 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
                  Generate UHID & Print Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
