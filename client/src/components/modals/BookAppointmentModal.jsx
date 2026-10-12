import React, { useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEPARTMENTS, DOCTORS, PATIENTS } from '../../data/mockData';

export default function BookAppointmentModal({ isOpen, onClose, onBookSuccess }) {
  if (!isOpen) return null;

  const [selectedDept, setSelectedDept] = useState('dept-1');
  const [selectedDoctor, setSelectedDoctor] = useState('doc-1');
  const [selectedPatient, setSelectedPatient] = useState('pat-1');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-12');
  const [timeSlot, setTimeSlot] = useState('11:30 - 11:45 AM');
  const [visitType, setVisitType] = useState('first_visit');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [priority, setPriority] = useState('Standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDoctors = DOCTORS.filter(d => d.department_id === selectedDept);
  const activeDoc = DOCTORS.find(d => d.id === selectedDoctor) || filteredDoctors[0];
  const activePat = PATIENTS.find(p => p.id === selectedPatient);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newAppointment = {
        id: `apt-${Date.now()}`,
        patient_id: activePat.id,
        patient_name: activePat.full_name,
        uhid: activePat.uhid,
        mobile: activePat.mobile,
        doctor_id: activeDoc.id,
        doctor_name: activeDoc.full_name,
        department_id: selectedDept,
        department_name: activeDoc.department_name,
        room_number: activeDoc.room_number,
        appointment_date: appointmentDate,
        start_time: timeSlot.split(' - ')[0],
        end_time: timeSlot.split(' - ')[1]?.replace(' AM', '').replace(' PM', '') || '11:45',
        visit_type: visitType,
        token_number: Math.floor(Math.random() * 20) + 6,
        status: 'booked',
        chief_complaint: chiefComplaint || 'Routine medical evaluation',
        priority,
        payment_status: 'Paid',
        amount: activeDoc.fee
      };
      onBookSuccess(newAppointment);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Book / Reschedule OPD Appointment</h3>
              <p className="text-xs text-sky-100">Module 3.1 • Doctor Roster & Token Assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Patient Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Patient (UHID Lookup)</span>
              <span className="text-sky-600 font-normal normal-case">NABH Compliant Identity</span>
            </label>
            <div className="relative">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              >
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.uhid} — {p.full_name} ({p.gender}, {p.mobile})
                  </option>
                ))}
              </select>
            </div>
            {activePat && (
              <div className="mt-1.5 p-2.5 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                <span>Blood: <strong className="text-slate-800">{activePat.blood_group}</strong> | Allergies: <strong className="text-rose-600">{activePat.allergies}</strong></span>
                <span className="text-sky-700 font-semibold">{activePat.emergency_contact.split(' - ')[0]}</span>
              </div>
            )}
          </div>

          {/* Department & Doctor Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Clinical Department</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  const firstDoc = DOCTORS.find(d => d.department_id === e.target.value);
                  if (firstDoc) setSelectedDoctor(firstDoc.id);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Doctor / Consultant</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
              >
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name} ({doc.room_number}) • ₹{doc.fee}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Shift Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="09:30 - 09:45 AM">09:30 - 09:45 AM (Morning)</option>
                <option value="10:00 - 10:15 AM">10:00 - 10:15 AM (Morning)</option>
                <option value="10:30 - 10:45 AM">10:30 - 10:45 AM (Morning)</option>
                <option value="11:30 - 11:45 AM">11:30 - 11:45 AM (Morning)</option>
                <option value="04:30 - 04:45 PM">04:30 - 04:45 PM (Evening)</option>
                <option value="05:15 - 05:30 PM">05:15 - 05:30 PM (Evening)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Visit Type</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="first_visit">First Visit (New)</option>
                <option value="follow_up">Follow Up (Repeat)</option>
                <option value="emergency">Emergency Walk-in</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Chief Complaints / Clinical Notes</label>
            <input
              type="text"
              placeholder="e.g., Shortness of breath, dizziness, post-op review"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Consultation Fee & Token Summary Card */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                T-06
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-semibold">Allocated Consultation Room</p>
                <p className="text-sm font-bold text-slate-800">{activeDoc?.room_number || 'OPD-101'} • Floor: 3rd Wing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Tariff Fee</p>
              <p className="text-lg font-extrabold text-emerald-700">₹{activeDoc?.fee || 1500}</p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Issue Token</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
