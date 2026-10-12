import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Bed, 
  DollarSign, 
  Activity, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { APPOINTMENTS, REFUNDS, PATIENTS, DOCTORS, IP_ADMISSIONS } from '../../data/mockData';

export default function ExecutiveAnalyticsView() {
  const [activeTab, setActiveTab] = useState('32.3'); // 32.1 Analytics, 32.2 Data Export, 32.3 KPI Widgets, 32.4 Tabular Export
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const exportToCSV = (dataType) => {
    let csvContent = "";
    let filename = "";

    if (dataType === 'APPOINTMENTS') {
      filename = "hospital_appointments_export.csv";
      csvContent = "Token,Patient Name,UHID,Doctor,Department,Date,Time,Status,Amount\n" +
        APPOINTMENTS.map(a => `${a.token_number},"${a.patient_name}",${a.uhid},"${a.doctor_name}",${a.department_name},${a.appointment_date},${a.start_time},${a.status},${a.amount}`).join("\n");
    } else if (dataType === 'REFUNDS') {
      filename = "hospital_refunds_export.csv";
      csvContent = "Refund No,Patient,UHID,Bill No,Original Amount,Refund Amount,Status,Mode,Reason\n" +
        REFUNDS.map(r => `${r.refund_no},"${r.patient_name}",${r.uhid},${r.bill_no},${r.original_amount},${r.refund_amount},${r.status},${r.mode},"${r.reason}"`).join("\n");
    } else {
      filename = "hospital_inpatient_admissions_export.csv";
      csvContent = "IP No,Patient,UHID,Admitted On,Ward Bed,Consultant,Running Bill,Advance Paid,Balance Due\n" +
        IP_ADMISSIONS.map(adm => `${adm.ip_no},"${adm.patient_name}",${adm.uhid},"${adm.admitted_on}","${adm.ward_bed}","${adm.consultant}",${adm.running_bill},${adm.advance_paid},${adm.balance_due}`).join("\n");
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Successfully exported ${filename}`);
    setTimeout(() => setDownloadSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-mono text-xs font-bold">
              MODULE 32.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Analytics, KPI Dashboards & MIS Data Exports
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Census, Bed Occupancy Ratio (BOR), Average Length of Stay (ALOS) & Institutional Data Engine
          </p>
        </div>

        {downloadSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('32.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === '32.3'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          32.3 Executive KPI Dashboard Widgets
        </button>

        <button
          onClick={() => setActiveTab('32.1')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === '32.1'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          32.1 Enterprise Analytics (Billing, Inventory, System)
        </button>

        <button
          onClick={() => setActiveTab('32.2')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === '32.2'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          32.2 Data Export Engine (Billing & Clinical)
        </button>

        <button
          onClick={() => setActiveTab('32.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === '32.4'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          32.4 Tabular Data Export (CSV / Excel)
        </button>
      </div>

      {/* 32.3 EXECUTIVE KPI WIDGETS */}
      {activeTab === '32.3' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Bed Occupancy Ratio (BOR)</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">88.4%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88.4%' }} />
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">+3.2% vs NABH Target 85%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Average Length of Stay (ALOS)</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">3.6 Days</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '60%' }} />
              </div>
              <p className="text-[10px] text-sky-600 font-semibold">Acute Care Clinical Benchmark</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Daily Outpatient Footfall</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">412 Patients</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-[10px] text-purple-600 font-semibold">10 Clinical Specialties</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Average Patient Wait Time</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">16.5 Mins</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '45%' }} />
              </div>
              <p className="text-[10px] text-teal-600 font-semibold">-4 mins improvement via Queue System</p>
            </div>
          </div>

          {/* Department Performance Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Specialty Contribution & Inpatient Volume (32.1)</h3>
            <div className="space-y-3 text-xs">
              {[
                { name: "Cardiology & Cath Lab", share: "34%", volume: "142 Patients", rev: "₹24,50,000" },
                { name: "Orthopaedics & Joint Replacements", share: "24%", volume: "98 Patients", rev: "₹18,20,000" },
                { name: "Emergency & Trauma Center", share: "20%", volume: "115 Patients", rev: "₹12,40,000" },
                { name: "Obstetrics, Gynaecology & IVF", share: "14%", volume: "56 Patients", rev: "₹9,80,000" },
                { name: "Neurology & Neurosurgery", share: "8%", volume: "32 Patients", rev: "₹6,40,000" }
              ].map((dep, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                  <div className="min-w-[200px]">
                    <span className="font-bold text-slate-900 dark:text-white block">{dep.name}</span>
                    <span className="text-[10px] text-slate-400">{dep.volume}</span>
                  </div>
                  <div className="flex-1 max-w-xs mx-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-2 rounded-full" style={{ width: dep.share }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{dep.rev}</span>
                    <span className="text-[10px] text-teal-600 block">{dep.share} Revenue Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 32.4 TABULAR DATA EXPORT (EXCEL / CSV) */}
      {(activeTab === '32.4' || activeTab === '32.2' || activeTab === '32.1') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tabular Data Export Engine (32.4 & 32.2)</h3>
              <p className="text-xs text-slate-500">Generate sanitized, compliant CSV spreadsheets for external statutory audits and analytics</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">CSV & EXCEL ENGINE READY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Outpatient Appointments Dataset</span>
              <p className="text-xs text-slate-500">Includes tokens, patient names, UHID, consultant, time slots and payment status.</p>
              <button
                onClick={() => exportToCSV('APPOINTMENTS')}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Appointments CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Cashier Refunds Ledger (4.5 / 32.2)</span>
              <p className="text-xs text-slate-500">Full audit trail of refund vouchers, authorization status, cashier IDs and payment modes.</p>
              <button
                onClick={() => exportToCSV('REFUNDS')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Refunds CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white block">Inpatient Admissions (17.2 / 32.2)</span>
              <p className="text-xs text-slate-500">Current active ward beds, diagnosis, running bills, advances and balance due.</p>
              <button
                onClick={() => exportToCSV('ADMISSIONS')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Admissions CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
