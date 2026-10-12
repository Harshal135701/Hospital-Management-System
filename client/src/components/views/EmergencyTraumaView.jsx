import React, { useState } from 'react';
import { 
  Activity, 
  Scissors, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Bed, 
  Plus, 
  Printer 
} from 'lucide-react';
import { EMERGENCY_TRIAGE } from '../../data/mockData';

export default function EmergencyTraumaView() {
  const [activeTab, setActiveTab] = useState('mod-11'); // mod-11 Emergency, mod-23 OT, mod-8 Day Care
  const [triageList, setTriageList] = useState(EMERGENCY_TRIAGE);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono text-xs font-bold">
              MODULE 11.0 & 23.0 & 8.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Trauma, OT Surgical Suites & Day Care
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            24x7 Triage Levels 1 to 4, Medico-Legal (MLC) Registry, Modular OT Scheduling & PAC Recovery
          </p>
        </div>

        <button
          onClick={() => alert("Emergency Crash Bay Level 1 Call dispatched to On-Call Trauma Team.")}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md animate-pulse"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>STAT Level-1 Trauma Call (11.1)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('mod-11')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-11'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          11. Emergency & Triage Assessment (11.1 - 11.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-23')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-23'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          23. Operation Theatre (OT) & PAC (23.1 - 23.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-8')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-8'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          8. Day Care & Short Stay (8.1 - 8.4)
        </button>
      </div>

      {/* 11. EMERGENCY & TRIAGE BOARD */}
      {activeTab === 'mod-11' && (
        <div className="space-y-4">
          {/* Triage Priority Levels Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-300 text-xs">
              <span className="font-extrabold text-rose-700 block">LEVEL 1: RESUSCITATION</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Immediate (0 min wait). Cardiac arrest, major trauma, airway loss.</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-300 text-xs">
              <span className="font-extrabold text-orange-700 block">LEVEL 2: EMERGENT</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">&lt; 15 mins. Acute coronary syndrome, severe stroke, asthma.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 text-xs">
              <span className="font-extrabold text-amber-700 block">LEVEL 3: URGENT</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">&lt; 30 mins. Moderate fractures, severe abdominal pain.</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 text-xs">
              <span className="font-extrabold text-emerald-700 block">LEVEL 4: LESS URGENT</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">&lt; 60 mins. Minor lacerations, simple viral fevers.</p>
            </div>
          </div>

          {/* Triage Case Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Emergency Bay Registry & MLC Cases (11.1 - 11.5)</h3>
              <span className="text-xs font-mono text-rose-600 font-bold">ER DOCTOR IN-CHARGE: Dr. Vikram Seth</span>
            </div>

            <div className="space-y-3">
              {triageList.map(t => (
                <div key={t.triage_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{t.triage_id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.level.includes('Level 1') ? 'bg-rose-600 text-white animate-pulse' :
                        t.level.includes('Level 2') ? 'bg-orange-500 text-white' :
                        t.level.includes('Level 3') ? 'bg-amber-100 text-amber-900' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        {t.level}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{t.patient}</span>
                      <span className="font-mono text-slate-400 text-[11px]">({t.uhid})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Chief: {t.chief}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span>Bay: <strong className="text-slate-800 dark:text-slate-200">{t.bay}</strong></span>
                      <span>Arrived: {t.arrival}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg">
                      {t.status}
                    </span>
                    <button
                      onClick={() => alert(`Rapid Disposition triggered for ${t.patient} -> Direct ICU / OT Transfer.`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                    >
                      Rapid Disposition (11.5)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 23. OPERATION THEATRE (OT) & PAC */}
      {activeTab === 'mod-23' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Operation Theatre (OT) Complex & WHO Safety Checklist (23.1 - 23.5)</h3>
              <p className="text-xs text-slate-500">Pre-Anesthesia Checkup (PAC), Surgical Time-Out, Intra-Op Charting & PACU</p>
            </div>
            <button className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
              + Schedule OT Slot (23.1)
            </button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-3 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="text-slate-900 dark:text-white">OT Suite #1 • Open Reduction Internal Fixation (ORIF)</span>
              <span className="text-emerald-600">IN PROGRESS (Stage: Skin Incision)</span>
            </div>
            <p className="text-slate-500">Patient: Mohammed Tariq Ansari • Surgeon: Dr. Rajesh Kulkarni • Anesthetist: Dr. N. Rao (Spinal + Epidural)</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-[11px]">
              <div>PAC Status: <strong className="text-emerald-600">Fit Grade ASA-II</strong></div>
              <div>WHO Checklist: <strong className="text-emerald-600">Time-Out Completed</strong></div>
              <div>PACU Recovery Bed: <strong className="text-slate-800 dark:text-slate-200">Reserved PACU-03</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* 8. DAY CARE */}
      {activeTab === 'mod-8' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Day Care Admission & Short-Stay Unit (8.1 - 8.4)</h3>
          <p className="text-xs text-slate-500">Chemotherapy infusions, Hemodialysis chairs, Cataract surgeries & Same-Day discharge summary</p>
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-300">
            Day Care Chair Suite 4: Pooja Ramesh Patel • Laparoscopy Observation • Discharge planned at 18:00.
          </div>
        </div>
      )}
    </div>
  );
}
