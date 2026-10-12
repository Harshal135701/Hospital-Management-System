import React from 'react';
import { X, Printer, ShieldCheck, Heart, QrCode } from 'lucide-react';

export default function PrintCardModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">UHID Patient Smart Health Card</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Container */}
        <div className="p-6 bg-slate-100 flex flex-col items-center">
          <div className="w-full bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-sky-500/30 relative overflow-hidden">
            {/* Hologram / watermark effect */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start border-b border-sky-800/60 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-900 text-sm">
                  +
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-sky-300">AURA HEALTHCARE ENTERPRISE</h4>
                  <p className="text-[10px] text-slate-400">NABH & JCI ACCREDITED • UHID SMART CARD</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                ACTIVE
              </span>
            </div>

            {/* Middle details */}
            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="col-span-1 flex flex-col items-center justify-center bg-white/5 rounded-xl p-2 border border-white/10">
                <div className="w-16 h-16 rounded-lg bg-sky-800/40 border border-sky-400/40 flex items-center justify-center text-sky-200 font-bold text-xl">
                  {patient.full_name?.charAt(0) || 'P'}
                </div>
                <span className="mt-1 text-[10px] font-bold text-teal-300 uppercase">BLOOD: {patient.blood_group}</span>
              </div>

              <div className="col-span-2 space-y-1.5 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">PATIENT FULL NAME</p>
                  <p className="font-bold text-white text-sm truncate">{patient.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">UHID NUMBER</span>
                    <strong className="text-teal-400 font-mono">{patient.uhid}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">GENDER / DOB</span>
                    <span>{patient.gender} • {patient.date_of_birth}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">EMERGENCY CONTACT</span>
                  <span className="text-slate-200 text-[11px] truncate block">{patient.emergency_contact}</span>
                </div>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="mt-3 pt-3 border-t border-sky-800/60 flex items-center justify-between">
              <div className="space-y-0.5">
                {/* Simulated SVG Barcode */}
                <div className="h-7 w-40 flex items-center space-x-[2px] bg-white p-1 rounded">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-900"
                      style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px' }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-widest">{patient.uhid}</p>
              </div>

              <div className="text-right">
                <div className="w-9 h-9 bg-white p-1 rounded-md ml-auto flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center text-[7px] text-white font-bold">
                    QR
                  </div>
                </div>
                <span className="text-[8px] text-slate-400">EMR Scan-In</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Standard ISO/IEC 7810 PVC Badge Size • High Precision Barcode
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Smart Badge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
