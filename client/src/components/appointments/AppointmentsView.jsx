import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Droplet,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  Filter,
  XCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { AppointmentService, AppointmentBloodRequestService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function AppointmentsView() {
  const { user, isAuthenticated, openLoginModal } = useAuth();

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
    startTime: '10:00',
    visitType: 'first_visit',
    notes: '',
    isPriority: false,
  });

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

  // Initial Data Fetch
  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate, statusFilter]);

  async function loadData() {
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
  }

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
              onClick={() => setIsBookModalOpen(true)}
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
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
    </div>
  );
}

export default AppointmentsView;
