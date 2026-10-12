import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Landmark, 
  DollarSign, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Printer, 
  TrendingUp 
} from 'lucide-react';

export default function FinanceInsuranceView() {
  const [activeTab, setActiveTab] = useState('mod-7'); // mod-7 Insurance TPA, mod-13 Finance GL

  const claims = [
    { id: "CLM-88102", patient: "Harish Chandra Gupta", uhid: "UHID-2026-004814", payer: "Star Health Insurance", claim_amt: 240000, sanctioned: 240000, copay: 0, status: "Pre-Auth Approved", policy: "SH-COMP-88219" },
    { id: "CLM-88103", patient: "Mohammed Tariq Ansari", uhid: "UHID-2026-004816", payer: "HDFC ERGO Health", claim_amt: 180000, sanctioned: 150000, copay: 30000, status: "Enhancement Requested", policy: "HD-MED-44102" },
    { id: "CLM-88104", patient: "Govind Nair", uhid: "UHID-2026-004818", payer: "ICICI Lombard General", claim_amt: 95000, sanctioned: 0, copay: 0, status: "Initial Query Raised", policy: "IL-TRAUMA-119" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs font-bold">
              MODULE 7.0 & 13.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Insurance TPA Claims, General Ledger & Doctor Payouts
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cashless Pre-Authorization, Enhancement Management, Doctor Revenue Sharing & Balance Sheet MIS
          </p>
        </div>

        <button
          onClick={() => alert("Pre-Authorization Dossier compiled with EMR clinical notes & tariff items.")}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md"
        >
          + Submit Pre-Auth Dossier (7.1)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('mod-7')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-7'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          7. TPA & Cashless Pre-Authorization (7.1 - 7.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-13')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-13'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          13. Chart of Accounts, General Ledger & Doctor Share (13.1 - 13.5)
        </button>
      </div>

      {/* 7. INSURANCE & TPA DESK */}
      {activeTab === 'mod-7' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Cashless Pre-Auth & Enhancement Claims (7.1 - 7.5)</h3>
              <span className="text-xs text-slate-500">IRDAI ROHINI Registry: SYNCHRONIZED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 border-b">
                  <tr>
                    <th className="py-3 px-4">Claim Dossier ID</th>
                    <th className="py-3 px-4">Patient & UHID</th>
                    <th className="py-3 px-4">Insurance TPA Payer</th>
                    <th className="py-3 px-4 text-right">Claim Amount</th>
                    <th className="py-3 px-4 text-right">Sanctioned</th>
                    <th className="py-3 px-4 text-right">Co-Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {claims.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-600 block">{c.id}</span>
                        <span className="font-mono text-[10px] text-slate-400">{c.policy}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{c.patient}</p>
                        <p className="font-mono text-[11px] text-teal-600">{c.uhid}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {c.payer}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium">
                        ₹{c.claim_amt.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        ₹{c.sanctioned.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                        ₹{c.copay.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status.includes('Approved') ? 'bg-emerald-100 text-emerald-800' :
                          c.status.includes('Enhancement') ? 'bg-amber-100 text-amber-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Submitted Enhancement Request for Claim ${c.id} with OT Notes.`)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                        >
                          Request Enhancement (7.2)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 13. FINANCE & GENERAL LEDGER */}
      {activeTab === 'mod-13' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chart of Accounts, Doctor Revenue Share & P&L (13.1 - 13.5)</h3>
              <p className="text-xs text-slate-500">Automated Consultant fee revenue calculation, journal vouchers and bank reconciliation</p>
            </div>
            <button className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
              Export Trial Balance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Total OPD/IPD Revenue (MTD)</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹48,20,000</p>
              <p className="text-[10px] text-slate-400 mt-1">+14% vs previous month</p>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900 text-xs">
              <span className="font-bold text-sky-800 dark:text-sky-300 block">Doctor Share Calculated (13.3)</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹14,50,000</p>
              <p className="text-[10px] text-slate-400 mt-1">Across 18 Empanelled Doctors</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-xs">
              <span className="font-bold text-purple-800 dark:text-purple-300 block">Bank Reconciliation Discrepancy</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0.00</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ 100% Reconciled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
