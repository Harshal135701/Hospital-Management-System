import React, { useState } from 'react';
import { 
  Pill, 
  Store, 
  Package, 
  ShoppingCart, 
  Wrench, 
  Utensils, 
  Archive, 
  Barcode, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { PHARMACY_ITEMS } from '../../data/mockData';

export default function SupplyChainView() {
  const [activeTab, setActiveTab] = useState('mod-25'); // mod-25 Pharmacy, mod-28 Retail POS, mod-16 Store, mod-26 Purchase, mod-14 Assets, mod-9 Dietary, mod-20 MRD
  const [drugs, setDrugs] = useState(PHARMACY_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrugs = drugs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.salt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono text-xs font-bold">
              SUPPLY CHAIN & LOGISTICS
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Pharmacy, Inventory Stores, Procurement & Facilities
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            FIFO Batch & Expiry Formulary, Central Store Requisitions, Purchase Orders, Biomedical Assets & MRD
          </p>
        </div>

        <button
          onClick={() => alert("Pharmacy Reorder Indent Generated & sent to Central Purchase.")}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md"
        >
          + Create Purchase Indent (26.1)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('mod-25')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-25'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          25. Pharmacy & FIFO Formulary (25.1 - 25.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-28')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-28'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          28. Retail Pharmacy POS Counter (28.1 - 28.4)
        </button>

        <button
          onClick={() => setActiveTab('mod-16')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-16'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          16. Inventory & Central Store (16.1 - 16.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-26')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-26'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          26. Procurement & Purchase (26.1 - 26.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-14')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-14'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          14. Biomedical Engineering (14.1 - 14.5)
        </button>

        <button
          onClick={() => setActiveTab('mod-9')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-9'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          9. Dietary & Kitchen (9.1 - 9.4)
        </button>

        <button
          onClick={() => setActiveTab('mod-20')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'mod-20'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          20. MRD Archival (20.1 - 20.4)
        </button>
      </div>

      {/* 25. PHARMACY & FIFO FORMULARY */}
      {activeTab === 'mod-25' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Medicine Name, Active Salt Molecule, Batch No..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
              />
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">FIFO ENFORCEMENT: ACTIVE</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 border-b">
                  <tr>
                    <th className="py-3 px-4">Item Code & Name</th>
                    <th className="py-3 px-4">Active Salt Information</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Stock Packs</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredDrugs.map(drug => (
                    <tr key={drug.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-amber-600 block">{drug.id}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{drug.name}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {drug.salt}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {drug.batch}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {drug.expiry}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 font-mono font-bold text-emerald-700">
                          {drug.stock_packs} Packs
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{drug.unit_price.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Dispense slip logged for ${drug.name}. Stock updated.`)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                        >
                          Dispense (25.1)
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

      {/* 28. RETAIL POS COUNTER */}
      {activeTab === 'mod-28' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Over-The-Counter (OTC) Retail POS (28.1 - 28.4)</h3>
          <p className="text-xs text-slate-500">Fast barcode scanning, GST receipt print, cash/UPI split payment and customer return credit</p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-400">Scan Barcode: [ |||||||||||||| ] Ready</span>
            <span className="font-bold text-emerald-600">POS Cashier #2: ONLINE</span>
          </div>
        </div>
      )}

      {/* 16. INVENTORY & CENTRAL STORE */}
      {activeTab === 'mod-16' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Central Medical Store & Sub-Store Requisitions (16.1 - 16.5)</h3>
          <p className="text-xs text-slate-500">Material Category Master, Department Indents, Stock Issues to Ward/OT and Min/Max Alerts</p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-300">
            Pending Indent: Ward A-12 requested 50 units IV Cannula 20G & 20 units Normal Saline 500ml. Status: Approved for Issue.
          </div>
        </div>
      )}

      {/* 14. BIOMEDICAL ENGINEERING */}
      {activeTab === 'mod-14' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Biomedical Engineering & Equipment Asset Master (14.1 - 14.5)</h3>
          <p className="text-xs text-slate-500">Barcode Tagging, AMC/CMC Service Contracts, Preventive Maintenance and Depreciation Engine</p>
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-xs text-sky-900 dark:text-sky-300">
            Next Preventive Maintenance: Maquet Servo-Air Ventilators (Cardio ICU) scheduled for 15-OCT-2026.
          </div>
        </div>
      )}
    </div>
  );
}
