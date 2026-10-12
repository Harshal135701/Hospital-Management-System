import React, { useState, useEffect } from 'react';
import { X, Volume2, Monitor, ArrowRight, Bell, Sparkles } from 'lucide-react';

export default function QueueDisplayModal({ isOpen, onClose, appointments }) {
  if (!isOpen) return null;

  const [activeCall, setActiveCall] = useState({
    token: 1,
    patient: "Aarav Shantaram Sharma",
    room: "OPD-101",
    doctor: "Dr. Arvind Rathore",
    dept: "Cardiology"
  });

  const [isChiming, setIsChiming] = useState(false);

  const playChime = () => {
    setIsChiming(true);
    // Simple Web Audio API Synthesizer Chime for hospital waiting room call
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('AudioContext not allowed or supported', e);
    }
    setTimeout(() => setIsChiming(false), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-3 sm:p-6 text-white overflow-hidden">
      <div className="w-full h-full flex flex-col justify-between max-w-7xl">
        {/* Top TV Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xl">
              +
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>AURA OUTPATIENT CLINICS QUEUE</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  LIVE DISPLAY
                </span>
              </h2>
              <p className="text-xs text-slate-400">Cardiology, Neurology & Orthopaedics Wing • 3rd Floor</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={playChime}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                isChiming ? 'bg-amber-500 text-slate-950 scale-105' : 'bg-slate-800 hover:bg-slate-700 text-teal-300'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isChiming ? 'Chiming...' : 'Test Audio Chime'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Attention Banner: NOW SERVING */}
        <div className="my-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Huge Calling Display */}
          <div className="lg:col-span-2 bg-gradient-to-br from-sky-950 via-slate-900 to-teal-950 rounded-3xl p-8 border-2 border-sky-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold tracking-widest uppercase flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>NOW CALLING / PROCEED TO ROOM</span>
              </span>
              <span className="font-mono text-xs text-slate-400">TOKEN QUEUE BROADCAST</span>
            </div>

            <div className="my-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-teal-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-xl border-4 border-teal-300">
                  <span className="text-xs uppercase font-extrabold tracking-wider">TOKEN</span>
                  <span className="text-6xl sm:text-7xl font-mono leading-none">{String(activeCall.token).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{activeCall.patient}</h3>
                  <p className="text-sky-300 font-semibold text-base mt-1">{activeCall.doctor}</p>
                  <p className="text-slate-400 text-xs">{activeCall.dept} Speciality</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-700/80 text-center min-w-[160px]">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CONSULTATION ROOM</p>
                <p className="text-3xl font-black text-amber-400 font-mono mt-1">{activeCall.room}</p>
                <p className="text-[11px] text-teal-400 mt-1">Door 1A • Green Light</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span>Please keep your UHID Smart Card or Barcode Slip ready for clinical verification.</span>
              <span className="text-sky-400 font-semibold">Token Announcement: 10:45 AM</span>
            </div>
          </div>

          {/* Next Tokens Up List */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Next Tokens in Waiting Room</h4>
                <span className="text-xs text-teal-400 font-mono">3 Waiting</span>
              </div>
              <div className="space-y-3">
                {appointments.slice(1, 4).map((apt, idx) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setActiveCall({
                        token: apt.token_number,
                        patient: apt.patient_name,
                        room: apt.room_number,
                        doctor: apt.doctor_name,
                        dept: apt.department_name
                      });
                      playChime();
                    }}
                    className="p-3.5 bg-slate-950/80 hover:bg-slate-800 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-300 font-mono font-bold flex items-center justify-center text-sm border border-slate-700">
                        #{String(apt.token_number).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{apt.patient_name}</p>
                        <p className="text-[11px] text-slate-400">{apt.doctor_name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-950/50 px-2 py-1 rounded-md border border-amber-800/50">
                      {apt.room_number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">Click any patient queue card above to call next token with chime.</p>
            </div>
          </div>
        </div>

        {/* Ticker / Running News Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase text-[10px]">ANNOUNCEMENT</span>
            <span>Emergency pharmacy counter is located at Ground Floor Lobby • Blood Bank 24x7 emergency crossmatching active.</span>
          </div>
          <div className="font-mono text-teal-400 font-semibold">
            {new Date().toLocaleTimeString()} • 12-OCT-2026
          </div>
        </div>
      </div>
    </div>
  );
}
