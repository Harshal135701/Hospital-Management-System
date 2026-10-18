import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Droplet,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  AppointmentService,
  AppointmentBloodRequestService,
  PatientService,
  DepartmentService,
  ClinicalStaffService,
  TokenManager
} from '../../services/api';
import { SubmoduleScrollbarNav } from './SubmoduleScrollbarNav';
import { SubmodulesView } from './SubmodulesView';
import { SUBMODULES } from './submoduleRegistry';
import { useAuth } from '../../context/AuthContext';
export function AppointmentsView({ initialSubtab, onNavigate }) {
  const { user, isAuthenticated, openLoginModal } = useAuth();

  // Submodule navigation state (supports '3.1' through '15.5')
  const [activeSubmodule, setActiveSubmodule] = useState(initialSubtab || '3.1');

  useEffect(() => {
    if (initialSubtab) {
      setActiveSubmodule(initialSubtab);
    }
  }, [initialSubtab]);

  // State
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'blood_requests'
  const [appointments, setAppointments] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Filter state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isBloodRequestModalOpen, setIsBloodRequestModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Booking Form State
  const [bookForm, setBookForm] = useState({
    patientId: '',
    doctorId: '',
    departmentId: '',
    appointmentDate: new Date().toISOString().slice(0, 10),
    startTime: '',
    visitType: 'first_visit',
    notes: '',
    isPriority: false,
    roomId: null,
  });

  // Booking Modal Auxiliary State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [patientSearchError, setPatientSearchError] = useState(null);

  const [departmentsList, setDepartmentsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const [availableSlotsData, setAvailableSlotsData] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  const [bookingModalError, setBookingModalError] = useState(null);

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: new Date().toISOString().slice(0, 10),
    startTime: '11:00',
    reason: '',
  });

  // Cancel Form State
  const [cancelReason, setCancelReason] = useState('Patient requested cancellation');

  // Blood Request Form State
  const [bloodReqForm, setBloodReqForm] = useState({
    patientId: '',
    patientName: '',
    patientUhid: '',
    appointmentId: '',
    appointmentNumber: '',
    bloodGroup: 'O+',
    componentType: 'whole_blood',
    unitsRequested: 1,
    urgency: 'routine',
    clinicalIndication: '',
    requiredBy: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!TokenManager.getToken()) {
      setIsLoading(false);
      setAppointments([]);
      setBloodRequests([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (activeTab === 'appointments') {
        const filters = {};
        if (selectedDate) filters.date = selectedDate;
        if (statusFilter) filters.status = statusFilter;
        const data = await AppointmentService.getAppointments(filters);
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        const data = await AppointmentBloodRequestService.getBloodRequests();
        setBloodRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (err.status === 401) {
        setErrorMessage('Authentication required to view appointments. Please sign in with your staff account.');
      } else if (err.status === 403) {
        setErrorMessage('Access denied. Your current staff role is not authorized to view this resource.');
      } else {
        setErrorMessage(err.message || 'Failed to retrieve appointments from PostgreSQL database.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedDate, statusFilter]);

  // Initial Data Fetch
  useEffect(() => {
    loadData();
  }, [loadData, isAuthenticated]);

  const loadBookingMetadata = async () => {
    setIsLoadingMetadata(true);
    try {
      const [deptRes, docRes] = await Promise.all([
        DepartmentService.getDepartments(),
        ClinicalStaffService.getStaff()
      ]);
      setDepartmentsList(Array.isArray(deptRes) ? deptRes : []);
      setDoctorsList(Array.isArray(docRes?.data) ? docRes.data : Array.isArray(docRes) ? docRes : []);
    } catch (err) {
      console.warn('[AppointmentsView] Metadata load failed:', err.message);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleOpenBookModal = () => {
    setBookForm({
      patientId: '',
      doctorId: '',
      departmentId: '',
      appointmentDate: new Date().toISOString().slice(0, 10),
      startTime: '',
      visitType: 'first_visit',
      notes: '',
      isPriority: false,
      roomId: null,
    });
    setSelectedPatient(null);
    setPatientSearchQuery('');
    setPatientSearchResults([]);
    setBookingModalError(null);
    setAvailableSlotsData(null);
    setSlotError(null);
    setIsBookModalOpen(true);
    loadBookingMetadata();
  };

  const handleDepartmentChange = async (deptId) => {
    setBookForm(prev => ({ ...prev, departmentId: deptId, doctorId: '', startTime: '', roomId: null }));
    setAvailableSlotsData(null);
    setSlotError(null);
    try {
      const docRes = await ClinicalStaffService.getStaff(deptId || null);
      setDoctorsList(Array.isArray(docRes?.data) ? docRes.data : Array.isArray(docRes) ? docRes : []);
    } catch (err) {
      console.warn('[AppointmentsView] Filtered staff load failed:', err.message);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setIsLoadingSlots(true);
    setSlotError(null);
    try {
      const res = await AppointmentService.getAvailableSlots(doctorId, date, 15);
      setAvailableSlotsData(res);
      setBookForm(prev => {
        if (!res.slots || !res.slots.some(s => s.startTime === prev.startTime && s.available)) {
          return { ...prev, startTime: '' };
        }
        return prev;
      });
    } catch (err) {
      setSlotError(err.message || 'Failed to fetch doctor available slots.');
      setAvailableSlotsData(null);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Debounced Patient Search Effect
  useEffect(() => {
    if (!isBookModalOpen || selectedPatient) return;
    const q = patientSearchQuery.trim();
    if (q.length < 2) {
      setPatientSearchResults([]);
      setIsSearchingPatients(false);
      return;
    }

    setIsSearchingPatients(true);
    setPatientSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const results = await PatientService.searchPatients(q);
        setPatientSearchResults(Array.isArray(results) ? results : []);
      } catch (err) {
        setPatientSearchError(err.message || 'Error searching patient directory.');
        setPatientSearchResults([]);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearchQuery, isBookModalOpen, selectedPatient]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.patientId || !bookForm.doctorId || !bookForm.departmentId || !bookForm.startTime) {
      setBookingModalError('Please select patient, department, doctor, and an available time slot.');
      return;
    }
    setIsSubmitting(true);
    setBookingModalError(null);
    try {
      const payload = {
        patientId: bookForm.patientId,
        doctorId: bookForm.doctorId,
        departmentId: bookForm.departmentId,
        appointmentDate: bookForm.appointmentDate,
        startTime: bookForm.startTime,
        visitType: bookForm.visitType,
        notes: bookForm.notes ? bookForm.notes.trim() : null,
        isPriority: Boolean(bookForm.isPriority),
        roomId: bookForm.roomId || null,
      };

      const res = await AppointmentService.createAppointment(payload);
      setIsBookModalOpen(false);
      const aptNum = res.data?.appointment_number || res.appointment_number || 'New';
      const tokenNum = res.data?.token_number || res.token_number || '';
      setSuccessBanner(`Appointment ${aptNum} booked successfully! Assigned Outpatient Queue Token #${tokenNum}.`);
      loadData();
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already booked'))) {
        setBookingModalError('The requested time slot was just booked by another user. Please select another slot.');
        fetchAvailableSlots(bookForm.doctorId, bookForm.appointmentDate);
      } else {
        setBookingModalError(err.message || 'Failed to complete appointment booking.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Order Blood Modal for an appointment
  const handleOpenBloodModal = (apt) => {
    setSelectedAppointment(apt);
    setBloodReqForm({
      patientId: apt.patient_id,
      patientName: apt.patient_name || 'Patient',
      patientUhid: apt.patient_uhid || 'UHID',
      appointmentId: apt.id,
      appointmentNumber: apt.appointment_number,
      bloodGroup: 'O+',
      componentType: 'whole_blood',
      unitsRequested: 1,
      urgency: 'routine',
      clinicalIndication: `Pre-operative reserve for outpatient consultation ${apt.appointment_number}`,
      requiredBy: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: '',
    });
    setIsBloodRequestModalOpen(true);
  };

  // Submit Blood Request
  const handleBloodRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        patientId: bloodReqForm.patientId,
        appointmentId: bloodReqForm.appointmentId,
        bloodGroup: bloodReqForm.bloodGroup,
        componentType: bloodReqForm.componentType,
        unitsRequested: parseInt(bloodReqForm.unitsRequested, 10),
        urgency: bloodReqForm.urgency,
        clinicalIndication: bloodReqForm.clinicalIndication,
        requiredBy: bloodReqForm.requiredBy ? new Date(bloodReqForm.requiredBy).toISOString() : null,
        notes: bloodReqForm.notes || null,
      };

      const res = await AppointmentBloodRequestService.createBloodRequest(payload);
      setIsBloodRequestModalOpen(false);
      setSuccessBanner(
        `Blood requisition successfully ordered for ${bloodReqForm.patientName}! Formal Blood Bank Requisition: ${res.data?.blood_requisition?.requisition_number || 'Linked'}`
      );
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit appointment blood request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await AppointmentService.rescheduleAppointment(selectedAppointment.id, rescheduleForm);
      setIsRescheduleModalOpen(false);
      setSuccessBanner(`Appointment ${selectedAppointment.appointment_number} rescheduled successfully.`);
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reschedule appointment slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Cancel
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await AppointmentService.cancelAppointment(selectedAppointment.id, cancelReason);
      setIsCancelModalOpen(false);
      setSuccessBanner(`Appointment ${selectedAppointment.appointment_number} has been cancelled.`);
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Transition (Check In / Arrived / Waiting)
  const handleUpdateStatus = async (apt, newStatus, reason = null) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await AppointmentService.updateAppointmentStatus(apt.id, newStatus, { reason });
      setSuccessBanner(`Appointment ${apt.appointment_number} marked as ${newStatus.replace('_', ' ')}.`);
      loadData();
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage(`Status conflict: ${err.message}. Refreshed with latest data.`);
        loadData();
      } else {
        setErrorMessage(err.message || `Failed to update status to ${newStatus}.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Badge Colors
  const getStatusBadge = (status) => {
    const map = {
      booked: 'teal',
      arrived: 'warning',
      waiting: 'warning',
      in_consultation: 'purple',
      completed: 'success',
      cancelled: 'danger',
      no_show: 'neutral',
      pending: 'warning',
      under_review: 'purple',
      approved: 'success',
      fulfilled: 'teal',
      rejected: 'danger',
    };
    return <Badge variant={map[status] || 'neutral'} size="sm">{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const isClinicianOrAdmin = user && ['clinician_doctor', 'blood_bank_officer', 'super_admin'].includes(user.role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 52 Submodules Horizontal Scrollbar Ribbon */}
      <SubmoduleScrollbarNav
        activeSubmoduleId={activeSubmodule}
        onSelectSubmodule={(id) => {
          setActiveSubmodule(id);
          if (onNavigate) {
            onNavigate(`appointments:${id}`);
          }
        }}
      />

      {activeSubmodule !== '3.1' ? (
        <SubmodulesView
          submodule={
            SUBMODULES.find((s) => s.id === activeSubmodule) || SUBMODULES[0]
          }
          onBack={() => setActiveSubmodule('3.1')}
          onNavigateSubmodule={(id) => {
            setActiveSubmodule(id);
            if (onNavigate) {
              onNavigate(`appointments:${id}`);
            }
          }}
        />
      ) : (
        <>
          {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Appointments & Outpatient Consultation Desk
            </h1>
            <Badge variant="teal" size="sm">PostgreSQL Backed</Badge>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage clinical consultation schedules, patient queue tokens, and appointment-linked blood requisitions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadData}
          >
            Refresh
          </Button>
          {!isAuthenticated ? (
            <Button
              variant="primary"
              icon={Lock}
              onClick={() => openLoginModal('Please sign in to book or manage appointments.')}
            >
              Sign In to Book
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenBookModal}
            >
              Book New Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-success-bg, #DEF7EC)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-success-border, #BCF0DA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--color-success, #03543F)',
          fontSize: 'var(--font-size-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-error-bg, #FDE8E8)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-error-border, #F8B4B4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--color-error, #9B1C1C)',
          fontSize: 'var(--font-size-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>Retry</Button>
        </div>
      )}

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--color-border)', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '10px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'appointments' ? '2.5px solid var(--color-primary-teal)' : 'none',
            color: activeTab === 'appointments' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'appointments' ? '600' : '500',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={16} />
          <span>Consultation Schedule</span>
          <Badge variant={activeTab === 'appointments' ? 'teal' : 'neutral'} size="sm">
            {appointments.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('blood_requests')}
          style={{
            padding: '10px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'blood_requests' ? '2.5px solid var(--color-primary-teal)' : 'none',
            color: activeTab === 'blood_requests' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'blood_requests' ? '600' : '500',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Droplet size={16} color="var(--color-accent-coral, #EF8354)" />
          <span>Appointment Blood Requests</span>
          <Badge variant={activeTab === 'blood_requests' ? 'teal' : 'neutral'} size="sm">
            {bloodRequests.length}
          </Badge>
        </button>
      </div>

      {/* TAB 1: Appointments List */}
      {activeTab === 'appointments' && (
        <Card
          title="Outpatient Consultation Roster"
          subtitle="Real-time appointment schedule with doctor allocation, status, and blood request ordering"
        >
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                Date:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)'
                }}
              >
                <option value="">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="arrived">Arrived</option>
                <option value="waiting">Waiting</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Loading appointments from PostgreSQL...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: '500' }}>No appointments found for the selected criteria.</p>
              <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                Use "Book New Appointment" to schedule an outpatient consultation.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Slot Number</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>UHID</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Department</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Doctor</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                        {apt.appointment_number}
                        {apt.token_number && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                            Token #{apt.token_number}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--color-text-muted)" />
                          <span>{String(apt.start_time).slice(0, 5)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '500' }}>
                        {apt.patient_name}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                        {apt.patient_uhid}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {apt.department_name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {apt.doctor_name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getStatusBadge(apt.status)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Order Blood Button for Clinicians / BBO */}
                          {isClinicianOrAdmin && apt.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Droplet}
                              onClick={() => handleOpenBloodModal(apt)}
                              style={{ borderColor: 'var(--color-accent-coral, #EF8354)', color: '#C05621' }}
                            >
                              Order Blood
                            </Button>
                          )}

                          {apt.status === 'booked' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={CheckCircle2}
                                onClick={() => handleUpdateStatus(apt, 'arrived')}
                                style={{ borderColor: 'var(--color-primary-teal)', color: 'var(--color-primary-teal)' }}
                              >
                                Check In
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setRescheduleForm({
                                    appointmentDate: apt.appointment_date,
                                    startTime: String(apt.start_time).slice(0, 5),
                                    reason: '',
                                  });
                                  setIsRescheduleModalOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(apt);
                                  setIsCancelModalOpen(true);
                                }}
                                style={{ color: 'var(--color-error)' }}
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {apt.status === 'arrived' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(apt, 'waiting')}
                            >
                              To Waiting
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: Appointment Blood Requests List */}
      {activeTab === 'blood_requests' && (
        <Card
          title="Appointment-Linked Blood Requisitions"
          subtitle="Outpatient blood orders transactionally linked to formal Blood Bank requisitions"
        >
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Loading appointment blood requests...
            </div>
          ) : bloodRequests.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Droplet size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: '500' }}>No appointment blood requests recorded yet.</p>
              <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                Select an appointment from the Consultation Schedule and click "Order Blood" to initiate a requisition.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Request ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient Details</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Appointment</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Blood Group</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Component & Units</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Urgency</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Blood Bank Requisition</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Request Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {req.id.slice(0, 8)}...
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '600' }}>{req.patient_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{req.patient_uhid}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--color-primary-teal)', fontWeight: '500' }}>
                        {req.appointment_number || 'Direct Order'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant="teal" size="sm">{req.blood_group}</Badge>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: '600' }}>{req.units_requested}x </span>
                        <span>{req.component_type.replace('_', ' ').toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant={req.urgency === 'emergency' || req.urgency === 'stat_emergency' ? 'danger' : 'neutral'} size="sm">
                          {req.urgency.toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-secondary-teal)' }}>
                        {req.requisition_number || 'Linked to Blood Bank'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getStatusBadge(req.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
        </>
      )}

      {/* MODAL 1: Order Blood Requisition for Appointment */}
      <Modal
        isOpen={isBloodRequestModalOpen}
        onClose={() => setIsBloodRequestModalOpen(false)}
        maxWidth="600px"
        title="Order Blood Requisition for Outpatient Appointment"
        subtitle={`Linking blood order directly to appointment ${bloodReqForm.appointmentNumber} and patient ${bloodReqForm.patientName}`}
      >
        <form onSubmit={handleBloodRequestSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-bg-pale-aqua, #E6F6F8)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(8, 127, 140, 0.2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-primary-teal)'
          }}>
            <strong>Patient UHID:</strong> {bloodReqForm.patientUhid} | <strong>Appointment:</strong> {bloodReqForm.appointmentNumber}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Blood Group & Rh"
              required
              value={bloodReqForm.bloodGroup}
              onChange={(e) => setBloodReqForm({ ...bloodReqForm, bloodGroup: e.target.value })}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
            />

            <Select
              label="Blood Component"
              required
              value={bloodReqForm.componentType}
              onChange={(e) => setBloodReqForm({ ...bloodReqForm, componentType: e.target.value })}
              options={[
                { value: 'whole_blood', label: 'Whole Blood' },
                { value: 'red_cells', label: 'Packed Red Blood Cells (PRBC)' },
                { value: 'plasma', label: 'Fresh Frozen Plasma (FFP)' },
                { value: 'platelets', label: 'Platelet Concentrate' },
                { value: 'cryoprecipitate', label: 'Cryoprecipitate' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Units Requested"
              type="number"
              min="1"
              max="20"
              required
              value={bloodReqForm.unitsRequested}
              onChange={(e) => setBloodReqForm({ ...bloodReqForm, unitsRequested: e.target.value })}
            />

            <Select
              label="Clinical Urgency"
              required
              value={bloodReqForm.urgency}
              onChange={(e) => setBloodReqForm({ ...bloodReqForm, urgency: e.target.value })}
              options={[
                { value: 'routine', label: 'Routine (Elective)' },
                { value: 'urgent', label: 'Urgent (Within 4 hours)' },
                { value: 'emergency', label: 'STAT / Emergency (Immediate)' },
              ]}
            />
          </div>

          <Input
            label="Clinical Indication / Pre-op Diagnosis"
            required
            placeholder="e.g. Elective arthroplasty pre-op reserve; acute severe anemia"
            value={bloodReqForm.clinicalIndication}
            onChange={(e) => setBloodReqForm({ ...bloodReqForm, clinicalIndication: e.target.value })}
          />

          <Input
            label="Required By Date & Time"
            type="datetime-local"
            value={bloodReqForm.requiredBy}
            onChange={(e) => setBloodReqForm({ ...bloodReqForm, requiredBy: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsBloodRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={Droplet}
            >
              Submit Blood Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Reschedule Appointment */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        maxWidth="500px"
        title="Reschedule Consultation Slot"
        subtitle={`Updating date & time for ${selectedAppointment?.appointment_number}`}
      >
        <form onSubmit={handleRescheduleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="New Date"
            type="date"
            required
            value={rescheduleForm.appointmentDate}
            onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })}
          />
          <Input
            label="New Start Slot (24-hour HH:mm)"
            type="time"
            required
            value={rescheduleForm.startTime}
            onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
          />
          <Input
            label="Reason for Reschedule"
            placeholder="e.g. Patient requested morning slot; physician rescheduled"
            value={rescheduleForm.reason}
            onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsRescheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Cancel Appointment */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        maxWidth="500px"
        title="Cancel Appointment"
        subtitle={`Are you sure you want to cancel ${selectedAppointment?.appointment_number}?`}
      >
        <form onSubmit={handleCancelSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Documented Cancellation Reason"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button type="submit" variant="danger" loading={isSubmitting}>
              Cancel Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Book New Outpatient Appointment */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        maxWidth="620px"
        title="Schedule Outpatient Consultation"
        subtitle="Live PostgreSQL-integrated patient lookup, doctor rosters, and slot reservation"
      >
        <form onSubmit={handleBookSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {bookingModalError && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-error-bg, #FDE8E8)',
              border: '1px solid var(--color-error-border, #F8B4B4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error, #9B1C1C)',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              <span>{bookingModalError}</span>
            </div>
          )}

          {/* Section 1: Patient Search & Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Patient <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>

            {selectedPatient ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--color-bg-pale-aqua, #E6F6F8)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.3)'
              }}>
                <div>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-teal)', marginRight: '8px' }}>
                    {selectedPatient.full_name}
                  </span>
                  <Badge variant="teal" size="sm">{selectedPatient.uhid}</Badge>
                  {selectedPatient.mobile && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                      📱 {selectedPatient.mobile}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setBookForm(prev => ({ ...prev, patientId: '' }));
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Input
                  placeholder="Search patient by Name, UHID, or Mobile..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  icon={Search}
                  autoFocus
                />
                {isSearchingPatients && (
                  <div style={{ position: 'absolute', right: '12px', top: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Searching...
                  </div>
                )}
                {patientSearchError && (
                  <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
                    {patientSearchError}
                  </div>
                )}
                {patientSearchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}>
                    {patientSearchResults.map((pat) => (
                      <div
                        key={pat.id}
                        onClick={() => {
                          setSelectedPatient(pat);
                          setBookForm(prev => ({ ...prev, patientId: pat.id }));
                          setPatientSearchResults([]);
                          setPatientSearchQuery('');
                        }}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 'var(--font-size-sm)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua, #E6F6F8)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                      >
                        <div>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{pat.full_name}</span>
                          <span style={{ marginLeft: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            {pat.mobile ? `· ${pat.mobile}` : ''}
                          </span>
                        </div>
                        <Badge variant="teal" size="sm">{pat.uhid}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {patientSearchQuery.trim().length >= 2 && !isSearchingPatients && patientSearchResults.length === 0 && (
                  <div style={{ marginTop: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    No matching patients found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Department & Doctor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Department"
              required
              value={bookForm.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              options={[
                { value: '', label: isLoadingMetadata ? 'Loading departments...' : '-- Select Department --' },
                ...departmentsList.map(d => ({ value: d.id, label: d.name }))
              ]}
            />

            <Select
              label="Attending Doctor"
              required
              disabled={!bookForm.departmentId}
              value={bookForm.doctorId}
              onChange={(e) => {
                const docId = e.target.value;
                const docObj = doctorsList.find(d => d.id === docId);
                setBookForm(prev => ({
                  ...prev,
                  doctorId: docId,
                  roomId: docObj ? (docObj.room_id || null) : null
                }));
                if (docId && bookForm.appointmentDate) {
                  fetchAvailableSlots(docId, bookForm.appointmentDate);
                }
              }}
              options={[
                { value: '', label: !bookForm.departmentId ? '-- Choose department first --' : '-- Select Doctor --' },
                ...doctorsList.map(d => ({
                  value: d.id,
                  label: `${d.full_name || d.name}${d.room_number || d.room ? ` (${d.room_number || d.room})` : ''}`
                }))
              ]}
            />
          </div>

          {/* Section 3: Date & Slot Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Input
              label="Appointment Date"
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={bookForm.appointmentDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setBookForm(prev => ({ ...prev, appointmentDate: newDate, startTime: '' }));
                if (bookForm.doctorId && newDate) {
                  fetchAvailableSlots(bookForm.doctorId, newDate);
                }
              }}
            />

            {/* Slots Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Available Time Slot <span style={{ color: 'var(--color-error)' }}>*</span>
                </span>
                {isLoadingSlots && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-teal)' }}>
                    Checking server slots...
                  </span>
                )}
              </div>

              {!bookForm.doctorId ? (
                <div style={{ padding: '12px', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Please select a doctor to view consultation schedule slots.
                </div>
              ) : isLoadingSlots ? (
                <div style={{ padding: '12px', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Calculating real-time doctor availability from PostgreSQL...
                </div>
              ) : slotError ? (
                <div style={{ padding: '10px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
                  {slotError}
                </div>
              ) : availableSlotsData?.onLeave ? (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-warning-bg, #FEF08A)',
                  border: '1px solid var(--color-warning-border, #FDE047)',
                  borderRadius: 'var(--radius-md)',
                  color: '#854D0E',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>Doctor is on approved leave on this date: <strong>{availableSlotsData.leaveReason || 'On Leave'}</strong>. No slots available.</span>
                </div>
              ) : availableSlotsData?.slots && availableSlotsData.slots.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <span>Total Slots: {availableSlotsData.totalSlots}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--color-success, #03543F)', fontWeight: '600' }}>Available: {availableSlotsData.availableSlots}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Booked: {availableSlotsData.bookedSlots}</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                    gap: '8px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {availableSlotsData.slots.map((slot, idx) => {
                      const isSelected = bookForm.startTime === slot.startTime;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setBookForm(prev => ({ ...prev, startTime: slot.startTime }))}
                          style={{
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected
                              ? '2px solid var(--color-primary-teal)'
                              : slot.available
                              ? '1px solid var(--color-border)'
                              : '1px solid #E5E7EB',
                            backgroundColor: isSelected
                              ? 'var(--color-primary-teal)'
                              : slot.available
                              ? '#FFFFFF'
                              : '#F3F4F6',
                            color: isSelected
                              ? '#FFFFFF'
                              : slot.available
                              ? 'var(--color-text-primary)'
                              : '#9CA3AF',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: isSelected ? '700' : '500',
                            cursor: slot.available ? 'pointer' : 'not-allowed',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>{slot.startTime}</div>
                          {!slot.available && (
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Booked</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', backgroundColor: '#F8F9FA', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No consultation slots configured for this date.
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Visit Type & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
            <Select
              label="Visit Type"
              required
              value={bookForm.visitType}
              onChange={(e) => setBookForm({ ...bookForm, visitType: e.target.value })}
              options={[
                { value: 'first_visit', label: 'First Visit (OPD)' },
                { value: 'follow_up', label: 'Follow Up Consultation' }
              ]}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
              <input
                id="isPriorityCheck"
                type="checkbox"
                checked={bookForm.isPriority}
                onChange={(e) => setBookForm({ ...bookForm, isPriority: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="isPriorityCheck" style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                Priority Consultation
              </label>
            </div>
          </div>

          {/* Section 5: Clinical Notes */}
          <Input
            label="Presenting Complaint / Reason for Visit"
            placeholder="e.g. Follow-up for hypertension review, acute joint swelling..."
            value={bookForm.notes}
            onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
          />

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <Button variant="ghost" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!bookForm.patientId || !bookForm.departmentId || !bookForm.doctorId || !bookForm.startTime || isSubmitting}
              icon={Plus}
            >
              Confirm Consultation Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AppointmentsView;
