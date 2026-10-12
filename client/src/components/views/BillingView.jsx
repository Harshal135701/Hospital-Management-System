import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  DollarSign, 
  RotateCcw, 
  Wallet, 
  Printer, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { REFUNDS, PATIENTS } from '../../data/mockData';

export default function BillingView() {
  const [activeSubTab, setActiveSubTab] = useState('4.5'); // 4.1 POS, 4.2 Interim, 4.3 Discharge Final, 4.4 Deposit, 4.5 Refunds (Screenshot 1), 4.6 Day-End
  const [refundsList, setRefundsList] = useState(REFUNDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRefundModal, setShowNewRefundModal] = useState(false);
  const [newRefund, setNewRefund] = useState({
    patient_name: "Aarav Shantaram Sharma",
    uhid: "UHID-2026-004812",
    bill_no: "INV-OPD-99304",
    original_amount: 2500,
    refund_amount: 500,
    reason: "Physiotherapy session deferred",
    mode: "UPI / Bank Transfer"
  });

  const handleApproveRefund = (refundNo) => {
    setRefundsList(refunds =>
      refunds.map(r => r.refund_no === refundNo ? { ...r, status: "Approved" } : r)
    );
  };

  const handleAddRefund = (e) => {
    e.preventDefault();
    const created = {
      refund_no: `RF-2026-00${Math.floor(Math.random() * 900) + 100}`,
      ...newRefund,
      status: "Processing",
      cashier: "Anjali Saxena (C-04)",
      requested_at: new Date().toLocaleString(),
      approved_by: "Pending CFO Approval"
    };
    setRefundsList([created, ...refundsList]);
    setShowNewRefundModal(false);
  };

  const filteredRefunds = refundsList.filter(r =>
    r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.refund_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs font-bold">
              MODULE 4.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Revenue, Billing & Cashier Desk
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            OPD Point-of-Sale, IPD Running Bills, Deposit Escrow, Refunds Reconciliation & Shift Settlement
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewRefundModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Refund Request (4.5)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: 4.1 to 4.6 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('4.1')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '4.1'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          4.1 OPD Billing POS
        </button>

        <button
          onClick={() => setActiveSubTab('4.2')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '4.2'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          4.2 IPD Running / Interim Bill
        </button>

        <button
          onClick={() => setActiveSubTab('4.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '4.3'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          4.3 Discharge Final Bill
        </button>

        <button
          onClick={() => setActiveSubTab('4.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '4.4'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          4.4 Advance Deposit Collection
        </button>

        <button
          onClick={() => setActiveSubTab('4.5')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '4.5'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>4.5 My Refunds</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold">
            Screenshot 1
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('4.6')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '4.6'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          4.6 Day-End Cashier Settlement
        </button>
      </div>

      {/* 4.5 MY REFUNDS VIEW (Matches Screenshot 1) */}
      {activeSubTab === '4.5' && (
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Total Refunds Requested</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹11,200</p>
              <span className="text-[10px] text-teal-600 font-semibold">3 Active Cases</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Approved & Processed</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹2,700</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Credited to Patient Mode</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Pending Audit Clearance</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹8,500</p>
              <span className="text-[10px] text-amber-600 font-semibold">Excess IPD Deposit</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-slate-500 text-xs font-medium">Active Settlement Cashier</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-2">Anjali Saxena</p>
              <span className="text-[10px] text-slate-400">Terminal Counter C-04</span>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Refund No, UHID, Patient, Bill No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>

          {/* Screenshot 1 My Refunds Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Refund No & Date</th>
                    <th className="py-3 px-4">Patient & UHID</th>
                    <th className="py-3 px-4">Original Bill</th>
                    <th className="py-3 px-4 text-right">Original Amt</th>
                    <th className="py-3 px-4 text-right">Refund Amt</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRefunds.map((ref) => (
                    <tr key={ref.refund_no} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">{ref.refund_no}</span>
                        <span className="text-[10px] text-slate-400">{ref.requested_at}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{ref.patient_name}</p>
                        <p className="font-mono text-[11px] text-teal-600 dark:text-teal-400">{ref.uhid}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-sky-600 dark:text-sky-400">{ref.bill_no}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                        ₹{ref.original_amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400 text-sm">
                        ₹{ref.refund_amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="truncate text-xs text-slate-600 dark:text-slate-400" title={ref.reason}>
                          {ref.reason}
                        </p>
                        <span className="text-[10px] text-slate-400 block">By: {ref.cashier}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {ref.mode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ref.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : ref.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}>
                          {ref.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {ref.status === 'Processing' ? (
                          <button
                            onClick={() => handleApproveRefund(ref.refund_no)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">Settled</span>
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

      {/* 4.1 OPD POS & 4.2 - 4.6 other submodules */}
      {activeSubTab === '4.1' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">OPD Billing Point-of-Sale Counter (4.1)</h3>
              <p className="text-xs text-slate-500">Fast tariff itemization, doctor fee collection, lab tests billing and instant receipt</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">POS Session: ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Tariff Line Items</span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Consultation Fee - Dr. Arvind Rathore</p>
                      <p className="text-[10px] text-slate-400">Cardiology Dept • Standard OPD</p>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">₹1,500.00</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">12-Lead Resting Electrocardiogram (ECG)</p>
                      <p className="text-[10px] text-slate-400">Diagnostic Tariff CODE-ECG-102</p>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">₹450.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold uppercase">PAYMENT SUMMARY</span>
                <div className="space-y-2 mt-4 text-xs border-b border-slate-800 pb-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>₹1,950.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (0% Healthcare):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-base pt-2">
                    <span>Net Payable:</span>
                    <span>₹1,950.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => alert("Payment Collected successfully! Receipt INV-OPD-99320 Generated.")}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider"
                >
                  Collect Cash / UPI & Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 IPD Interim Running Bill */}
      {activeSubTab === '4.2' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">IPD Running & Interim Bill Tracker (4.2)</h3>
          <p className="text-xs text-slate-500">Real-time daily charges: bed occupancy, doctor visits, consumables, pharmacy and OT ledger</p>
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
            Running bill auto-sync is actively computing nightly room tariff and nursing administration charges.
          </div>
        </div>
      )}

      {/* New Refund Modal */}
      {showNewRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">New Refund Voucher Request (4.5)</h3>
              <button onClick={() => setShowNewRefundModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddRefund} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 uppercase">Patient</label>
                <select
                  value={newRefund.patient_name}
                  onChange={e => setNewRefund({ ...newRefund, patient_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                >
                  {PATIENTS.map(p => (
                    <option key={p.id} value={p.full_name}>{p.full_name} ({p.uhid})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Original Bill No</label>
                  <input
                    type="text"
                    value={newRefund.bill_no}
                    onChange={e => setNewRefund({ ...newRefund, bill_no: e.target.value })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 uppercase">Refund Amount (₹)</label>
                  <input
                    type="number"
                    value={newRefund.refund_amount}
                    onChange={e => setNewRefund({ ...newRefund, refund_amount: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl mt-1 text-xs font-bold text-rose-600"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 uppercase">Refund Justification / Reason</label>
                <input
                  type="text"
                  value={newRefund.reason}
                  onChange={e => setNewRefund({ ...newRefund, reason: e.target.value })}
                  className="w-full p-2.5 border rounded-xl mt-1 text-xs"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewRefundModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
