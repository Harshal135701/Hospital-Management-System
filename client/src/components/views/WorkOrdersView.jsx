import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  FileCheck2, 
  PackageCheck, 
  Search, 
  Plus, 
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { WORK_ORDERS } from '../../data/mockData';

export default function WorkOrdersView() {
  const [activeSubTab, setActiveSubTab] = useState('31.5'); // 31.1 Record, 31.2 Requisition, 31.3 Receipt, 31.4 View, 31.5 ORDERS (S4), 31.6 RECEIPTS (S4)
  const [orders, setOrders] = useState(WORK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const handleApprove = (woId) => {
    setOrders(prev =>
      prev.map(o => o.wo_id === woId ? { ...o, status: "Approved & In Progress" } : o)
    );
  };

  const handleConfirm = (woId) => {
    setOrders(prev =>
      prev.map(o => o.wo_id === woId ? { ...o, status: "Confirmed Execution" } : o)
    );
  };

  const handleReject = (woId) => {
    const reason = prompt("Enter Rejection Reason for Work Order:", "Price Variance / Budget Constraint");
    if (reason) {
      setOrders(prev =>
        prev.map(o => o.wo_id === woId ? { ...o, status: `Rejected (${reason})` } : o)
      );
    }
  };

  const orderItems = orders.filter(o => o.action_type === 'ORDER');
  const receiptItems = orders.filter(o => o.action_type === 'RECEIPT');

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono text-xs font-bold">
              MODULE 31.0
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Work Orders, Requisitions & Equipment Receipts
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Biomedical Maintenance, Cleanroom Calibration, Facility Work Orders & Three-Way Approvals
          </p>
        </div>

        <button
          onClick={() => alert("New Work Order Requisition initialized.")}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Work Order (31.1)</span>
        </button>
      </div>

      {/* Sub-Tabs: 31.1 to 31.6 */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('31.1')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '31.1'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          31.1 Record Work Order
        </button>

        <button
          onClick={() => setActiveSubTab('31.2')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '31.2'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          31.2 Record Requisition
        </button>

        <button
          onClick={() => setActiveSubTab('31.3')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '31.3'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          31.3 Record Receipt
        </button>

        <button
          onClick={() => setActiveSubTab('31.4')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeSubTab === '31.4'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          31.4 View Work Orders / Requisitions
        </button>

        <button
          onClick={() => setActiveSubTab('31.5')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '31.5'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>31.5 ORDERS: Approve / Confirm / Rejected</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[10px] font-bold">
            Screenshot 4
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('31.6')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition ${
            activeSubTab === '31.6'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>31.6 RECEIPTS: Approve & Confirm</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[10px] font-bold">
            Screenshot 4
          </span>
        </button>
      </div>

      {/* 31.5 ORDERS: APPROVE WORK ORDERS, CONFIRM, REVIEW REJECTED (Screenshot 4) */}
      {activeSubTab === '31.5' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Work Order ID, Equipment, Department, Vendor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="text-xs text-slate-500">
              Orders Pending Approval: <strong className="text-amber-600 font-bold">{orderItems.filter(o => o.status.includes('Pending')).length}</strong>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Work Order Authorization Workflow (Screenshot 4 - 31.5)</h3>
              <span className="text-xs text-slate-500">Facility Engineering & Biomedical Division</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">WO Number & Date</th>
                    <th className="py-3 px-4">Equipment & Service Type</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Contractor / Vendor</th>
                    <th className="py-3 px-4 text-right">Est. Cost</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {orderItems.map((wo) => (
                    <tr key={wo.wo_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">{wo.wo_id}</span>
                        <span className="text-[10px] text-slate-400">{wo.date}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{wo.equipment}</p>
                        <p className="text-[11px] text-slate-500">{wo.type}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {wo.department}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {wo.vendor}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{wo.estimated_cost.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          wo.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {wo.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          wo.status.includes('Approved') ? 'bg-emerald-100 text-emerald-800' :
                          wo.status.includes('Rejected') ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {wo.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {wo.status.includes('Pending') ? (
                            <>
                              <button
                                onClick={() => handleApprove(wo.wo_id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(wo.wo_id)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleConfirm(wo.wo_id)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
                            >
                              Confirm
                            </button>
                          )}
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

      {/* 31.6 RECEIPTS: APPROVE & CONFIRM (Screenshot 4) */}
      {activeSubTab === '31.6' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Work Order Receipts & Inward Inspection (Screenshot 4 - 31.6)</h3>
              <p className="text-xs text-slate-500">Sign-off on vendor delivery, commissioning test certificates & invoice matching</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">3-Way Match: VERIFIED</span>
          </div>

          <div className="space-y-3">
            {receiptItems.map(rc => (
              <div key={rc.wo_id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-teal-600">{rc.wo_id}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rc.equipment}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-300">{rc.vendor}</span>
                  </div>
                  <p className="text-slate-500 mt-1">Receipt Date: {rc.date} • Verified by Facility Head</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">₹{rc.estimated_cost.toLocaleString()}</span>
                  <button
                    onClick={() => alert(`Receipt ${rc.wo_id} Approved & Ledger Updated!`)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    Confirm Receipt
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
