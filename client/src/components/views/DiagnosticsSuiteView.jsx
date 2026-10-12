import React, { useState } from 'react';
import { 
  FlaskConical, 
  Scan, 
  Droplet, 
  Baby, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Eye, 
  Printer, 
  Layers, 
  ShieldAlert,
  TestTube2
} from 'lucide-react';
import { LAB_ORDERS, RADIOLOGY_STUDIES, BLOOD_BANK_INVENTORY } from '../../data/mockData';

export default function DiagnosticsSuiteView({ onOpenDicomViewer }) {
  const [activeTab, setActiveTab] = useState('mod-19'); // mod-19 LIS, mod-27 Radiology, mod-5 Blood Bank, mod-10 IVF
  const [labOrders, setLabOrders] = useState(LAB_ORDERS);
  const [radiologyList, setRadiologyList] = useState(RADIOLOGY_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState(RADIOLOGY_STUDIES[0]);

  const verifyLabOrder = (reqNo) => {
    setLabOrders(prev =>
      prev.map(o => o.req_no === reqNo ? { ...o, status: "Verified & Authorized", flagged: false } : o)
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono text-xs font-bold">
              MODULE 19.0 & 27.0 & 5.0 & 10.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Diagnostics, DICOM PACS, Blood Bank & ART Embryology
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pathology Laboratory Information System (LIS), Modality DICOM PACS, Blood Component Bank & IVF Lab
          </p>
        </div>

        <button
          onClick={() => onOpenDicomViewer(selectedStudy)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md"
        >
          <Scan className="w-4 h-4" />
          <span>Open Web DICOM Viewer (27.3)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('mod-19')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-19'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          19. Pathology & LIS Panic Alerts (19.1 - 19.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-27')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-27'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          27. Radiology & DICOM PACS (27.1 - 27.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-5')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-5'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          5. Blood Bank & Cross Match (5.1 - 5.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-10')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-10'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          10 & 18. IVF & ART Embryology Suite
        </button>
      </div>

      {/* 19. LIS PATHOLOGY & PANIC VALUES */}
      {activeTab === 'mod-19' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
              <div>
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  PANIC VALUE CRITICAL ALERT (19.4)
                </p>
                <p className="text-rose-700 dark:text-rose-300 text-[11px]">
                  Troponin-I for Aarav S. Sharma is 0.082 ng/mL (Reference &lt; 0.014 ng/mL). Urgent cardiologist notification dispatched.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px]">
              CRITICAL FLAG ACTIVE
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Central Laboratory Orders & Analyzer Worklist (19.1 - 19.5)</h3>
              <span className="text-xs text-slate-500">Roche Cobas & Sysmex Interfacing: ONLINE</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Req No & Barcode</th>
                    <th className="py-3 px-4">Patient & UHID</th>
                    <th className="py-3 px-4">Test Investigation</th>
                    <th className="py-3 px-4">Result Value</th>
                    <th className="py-3 px-4">Biological Reference</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Pathologist Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {labOrders.map(lab => (
                    <tr key={lab.req_no} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400 block">{lab.req_no}</span>
                        <span className="font-mono text-[10px] text-slate-400">{lab.sample_barcode}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{lab.patient}</p>
                        <p className="font-mono text-[11px] text-teal-600">{lab.uhid}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {lab.test_name}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span className={lab.flagged ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-white'}>
                          {lab.value}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {lab.normal_range}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          lab.status.includes('Panic') ? 'bg-rose-100 text-rose-800' :
                          lab.status.includes('Elevated') ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {lab.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {lab.status.includes('Verified') ? (
                          <span className="text-emerald-600 font-bold text-[11px]">✓ Authorized</span>
                        ) : (
                          <button
                            onClick={() => verifyLabOrder(lab.req_no)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                          >
                            Verify & Authorize
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 27. RADIOLOGY & DICOM PACS */}
      {activeTab === 'mod-27' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">DICOM Studies & Modality Worklist (27.1 - 27.5)</h3>
                <p className="text-xs text-slate-500">128-Slice CT, 3T MRI & Digital X-Ray Archival (PACS Store)</p>
              </div>
              <span className="text-xs font-mono text-teal-600 font-bold">PACS Gateway: CONNECTED</span>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {radiologyList.map(st => (
                <div key={st.accession_no} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-purple-600">{st.accession_no}</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">{st.modality}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.patient}</h4>
                    <p className="text-xs text-slate-500">{st.uhid} • {st.study_date}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{st.findings}</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-400">{st.images_count} Slices</span>
                    <button
                      onClick={() => {
                        setSelectedStudy(st);
                        onOpenDicomViewer(st);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>View DICOM</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BLOOD BANK */}
      {activeTab === 'mod-5' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Blood Bank Component Inventory & Serology (5.1 - 5.5)</h3>
              <p className="text-xs text-slate-500">PRBC, Fresh Frozen Plasma, Platelet Concentrates & Safe Release Testing</p>
            </div>
            <button className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs">
              + Donor Registration (5.1)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {BLOOD_BANK_INVENTORY.map((bb, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-rose-600">{bb.group}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    bb.status.includes('Critical') ? 'bg-rose-100 text-rose-800' :
                    bb.status.includes('Low') ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {bb.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div>PRBC: <strong className="text-slate-800 dark:text-slate-200">{bb.prbc_units} Units</strong></div>
                  <div>FFP: <strong className="text-slate-800 dark:text-slate-200">{bb.ffp_units} Units</strong></div>
                  <div>Platelets: <strong className="text-slate-800 dark:text-slate-200">{bb.platelets} Units</strong></div>
                  <div>Cryo: <strong className="text-slate-800 dark:text-slate-200">{bb.cryo} Units</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10 & 18 IVF EMBRYOLOGY */}
      {activeTab === 'mod-10' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">IVF & Assisted Reproductive Technology (ART) Lab (10.1 - 10.5 & 18.1 - 18.5)</h3>
          <p className="text-xs text-slate-500">Oocyte Retrieval, ICSI Micromanipulation, Morphological Grading, Embryo Transfer & Liquid Nitrogen Cryostorage</p>
          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-300">
            Active Cycle: Patient Pooja R. Patel • Cycle ID: IVF-2026-081 • OPU Count: 14 MII Oocytes • Cryo Tank #2 Slot B-14 (Liquid N2 -196°C).
          </div>
        </div>
      )}
    </div>
  );
}
