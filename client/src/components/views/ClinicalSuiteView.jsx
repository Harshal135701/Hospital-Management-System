import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  UserCheck, 
  Activity, 
  Pill, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Heart, 
  Plus, 
  Printer, 
  Search,
  Sparkles
} from 'lucide-react';
import { PATIENTS, DOCTORS, APPOINTMENTS } from '../../data/mockData';

export default function ClinicalSuiteView() {
  const [activeModuleTab, setActiveModuleTab] = useState('mod-6'); // mod-6 Doctor Desk, mod-12 EMR & Rx, mod-21 Nursing MAR
  const [activePat, setActivePat] = useState(PATIENTS[0]);
  const [vitals, setVitals] = useState({
    bp: "128/84 mmHg",
    pulse: "76 bpm",
    spo2: "98%",
    temp: "98.4 °F",
    rr: "16 /min",
    bmi: "24.2"
  });
  const [activeRx, setActiveRx] = useState([
    { drug: "Tab. Atorvastatin 40mg", dosage: "0-0-1 (Night)", duration: "30 Days", route: "Oral", instructions: "After Dinner (Lipid Lowering)" },
    { drug: "Tab. Ticagrelor 90mg", dosage: "1-0-1 (Twice Daily)", duration: "30 Days", route: "Oral", instructions: "With Water (Antiplatelet)" },
    { drug: "Tab. Metoprolol XL 25mg", dosage: "1-0-0 (Morning)", duration: "30 Days", route: "Oral", instructions: "Early morning with food" },
  ]);
  const [newDrug, setNewDrug] = useState({ drug: "", dosage: "1-0-1", duration: "14 Days", instructions: "" });
  const [interactionAlert, setInteractionAlert] = useState(null);

  const addMedication = (e) => {
    e.preventDefault();
    if (!newDrug.drug) return;
    if (newDrug.drug.toLowerCase().includes('aspirin') && activeRx.some(r => r.drug.includes('Ticagrelor'))) {
      setInteractionAlert("CPOE WARNING: Dual Antiplatelet Therapy (DAPT) protocol triggered. Monitor bleeding risk.");
    } else {
      setInteractionAlert(null);
    }
    setActiveRx([...activeRx, { ...newDrug, route: "Oral" }]);
    setNewDrug({ drug: "", dosage: "1-0-1", duration: "14 Days", instructions: "" });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-mono text-xs font-bold">
              MODULE 6.0 & 12.0 & 21.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Clinical Care, E-Prescription Studio & Inpatient MAR
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Doctor Consultation Desk, CPOE Order Entry, Longitudinal EMR Timeline & Medication Administration
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={activePat.id}
            onChange={(e) => setActivePat(PATIENTS.find(p => p.id === e.target.value))}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
          >
            {PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.full_name} ({p.uhid})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveModuleTab('mod-6')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeModuleTab === 'mod-6'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          6. Doctor Consultation Desk & CPOE (6.1 - 6.5)
        </button>

        <button
          onClick={() => setActiveModuleTab('mod-12')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeModuleTab === 'mod-12'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          12. Longitudinal EMR Timeline & Rx Studio (12.1 - 12.5)
        </button>

        <button
          onClick={() => setActiveModuleTab('mod-21')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeModuleTab === 'mod-21'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          21. Ward Nursing Workstation & MAR (21.1 - 21.5)
        </button>
      </div>

      {/* Patient Banner */}
      <div className="p-4 bg-gradient-to-r from-teal-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-teal-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {activePat.full_name[0]}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">{activePat.full_name}</span>
              <span className="font-mono text-[11px] text-teal-700 dark:text-teal-300 font-bold">{activePat.uhid}</span>
            </div>
            <p className="text-slate-500">{activePat.gender} • DOB: {activePat.date_of_birth} • Blood: <strong className="text-slate-800 dark:text-slate-200">{activePat.blood_group}</strong></p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Known Allergies</span>
            <p className="font-bold text-rose-600">{activePat.allergies}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Treating Doctor</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">Dr. Arvind Rathore</p>
          </div>
        </div>
      </div>

      {/* MODULE 6: DOCTOR CONSULTATION DESK */}
      {activeModuleTab === 'mod-6' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vitals Recording (6.2) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500 vital-pulse" />
              <span>Vitals & Physical Exam (6.2)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Blood Pressure</span>
                <p className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1">{vitals.bp}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Pulse Rate</span>
                <p className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1">{vitals.pulse}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Oxygen Saturation</span>
                <p className="font-mono font-bold text-base text-teal-600 mt-1">{vitals.spo2}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Temperature</span>
                <p className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1">{vitals.temp}</p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">Systemic Examination Findings</label>
              <textarea
                rows={3}
                defaultValue="CVS: S1 S2 heard, no murmurs. RS: Bilateral vesicular breath sounds clear. P/A: Soft, non-tender."
                className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Chief Complaints & Clinical History (6.3) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <span>Chief Complaints & History (6.3)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chief Complaints</label>
                <input
                  type="text"
                  defaultValue="Exertional dyspnea & retrosternal tightness for 3 days"
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">History of Present Illness (HPI)</label>
                <textarea
                  rows={3}
                  defaultValue="58M hypertensive on Telmisartan 40mg. Reports NYHA Class II dyspnea, relieved with rest. No orthopnea."
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ICD-10 / SNOMED CT Diagnostic Coding (12.3)</label>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900 font-mono text-[11px] text-sky-800 dark:text-sky-300">
                  I25.10 - Atherosclerotic heart disease of native coronary artery
                </div>
              </div>
            </div>
          </div>

          {/* CPOE Orders & Progress Notes (6.4 & 6.5) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>CPOE Orders & Progress Notes (6.4 & 6.5)</span>
              </h3>

              <div className="space-y-2 mt-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Pending CPOE Investigations:</span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>1. High Sensitivity Troponin-I</span>
                    <span className="text-rose-600 font-bold">STAT Lab</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>2. 2D Transthoracic Echocardiogram</span>
                    <span className="text-sky-600 font-bold">Echo Cath</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>3. Lipid Profile Direct</span>
                    <span className="text-slate-500">Routine</span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Daily SOAP Progress Note (6.5)</label>
                  <textarea
                    rows={3}
                    defaultValue="Patient clinically stable. Hemodynamics maintained. Plan for elective coronary angiogram if biomarkers positive."
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Consultation Note Signed and synchronized to Longitudinal EMR Timeline (12.1).")}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Sign & Save Consultation Note
            </button>
          </div>
        </div>
      )}

      {/* MODULE 12: E-PRESCRIPTION STUDIO */}
      {activeModuleTab === 'mod-12' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">E-Prescription (Rx) Studio & Safety Screening (12.2)</h3>
              <p className="text-xs text-slate-500">Automated allergy alerts, drug-drug interaction checker and formulary batch linking</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Rx Slip</span>
            </button>
          </div>

          {interactionAlert && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{interactionAlert}</span>
            </div>
          )}

          {/* Add Drug Bar */}
          <form onSubmit={addMedication} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Medication Name / Salt</label>
              <input
                type="text"
                placeholder="e.g. Tab. Aspirin 75mg, Tab. Pantoprazole 40mg"
                value={newDrug.drug}
                onChange={e => setNewDrug({ ...newDrug, drug: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dosage Frequency</label>
              <select
                value={newDrug.dosage}
                onChange={e => setNewDrug({ ...newDrug, dosage: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="1-0-0">1-0-0 (Morning OD)</option>
                <option value="0-0-1">0-0-1 (Night OD)</option>
                <option value="1-0-1">1-0-1 (BD Twice Daily)</option>
                <option value="1-1-1">1-1-1 (TDS Thrice Daily)</option>
                <option value="SOS">SOS (When Required)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
              >
                + Add To Rx
              </button>
            </div>
          </form>

          {/* Rx Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="py-2.5 px-3">Medication Name</th>
                  <th className="py-2.5 px-3">Dosage Regimen</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions & Food Advice</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeRx.map((rx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {rx.drug}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-teal-600">
                      {rx.dosage}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {rx.duration}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {rx.instructions || 'As advised by doctor'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveRx(activeRx.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 21: WARD NURSING MAR */}
      {activeModuleTab === 'mod-21' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Medication Administration Record (MAR) (21.3)</h3>
              <p className="text-xs text-slate-500">Nursing workstation barcode administration check, doses given and shift handover</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">SHIFT: MORNING (07:00 - 15:00)</span>
          </div>

          <div className="space-y-3">
            {activeRx.map((rx, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rx.drug}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{rx.dosage} • {rx.instructions}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    08:00 AM DOSE GIVEN
                  </span>
                  <button
                    onClick={() => alert(`Dose for ${rx.drug} administered by Nurse Sister Mary.`)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                  >
                    Log 14:00 Dose
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
