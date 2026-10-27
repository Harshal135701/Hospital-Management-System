import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Search,
  Filter,
  User,
  AlertCircle,
  X,
  Phone,
  Stethoscope,
  ClipboardList,
  UserPlus,
  CalendarClock,
  Ban,
  Check,
} from 'lucide-react';

import { AppointmentBloodRequestService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const APPOINTMENTS_KEY = 'hms_demo_appointments';
const PATIENTS_KEY = 'hms_demo_patients';

const DEPARTMENTS = [
  { id: 'dept-01', name: 'Cardiology' },
  { id: 'dept-02', name: 'Orthopedics' },
  { id: 'dept-03', name: 'General Medicine' },
  { id: 'dept-04', name: 'Pediatrics' },
  { id: 'dept-05', name: 'Dermatology' },
  { id: 'dept-06', name: 'Neurology' },
  { id: 'dept-07', name: 'Gynecology' },
  { id: 'dept-08', name: 'General Surgery' },
];

const DOCTORS = [
  { id: 'doc-01', full_name: 'Dr. Ananya Mehta', department_id: 'dept-01' },
  { id: 'doc-02', full_name: 'Dr. Rahul Kulkarni', department_id: 'dept-01' },
  { id: 'doc-03', full_name: 'Dr. Vikram Patil', department_id: 'dept-02' },
  { id: 'doc-04', full_name: 'Dr. Neha Shah', department_id: 'dept-02' },
  { id: 'doc-05', full_name: 'Dr. Amit Joshi', department_id: 'dept-03' },
  { id: 'doc-06', full_name: 'Dr. Pooja Deshmukh', department_id: 'dept-03' },
  { id: 'doc-07', full_name: 'Dr. Snehal More', department_id: 'dept-04' },
  { id: 'doc-08', full_name: 'Dr. Karan Singh', department_id: 'dept-05' },
  { id: 'doc-09', full_name: 'Dr. Rohan Gupta', department_id: 'dept-06' },
  { id: 'doc-10', full_name: 'Dr. Priya Nair', department_id: 'dept-07' },
  { id: 'doc-11', full_name: 'Dr. Sagar Pawar', department_id: 'dept-08' },
];

const SAMPLE_PATIENTS = [
  { id: 'pat-001', full_name: 'Rahul Sharma', uhid: 'UHID-1001', mobile: '9876543210', gender: 'Male' },
  { id: 'pat-002', full_name: 'Priya Patil', uhid: 'UHID-1002', mobile: '9876543211', gender: 'Female' },
  { id: 'pat-003', full_name: 'Amit Deshmukh', uhid: 'UHID-1003', mobile: '9876543212', gender: 'Male' },
  { id: 'pat-004', full_name: 'Sneha Kulkarni', uhid: 'UHID-1004', mobile: '9876543213', gender: 'Female' },
  { id: 'pat-005', full_name: 'Vivek Jadhav', uhid: 'UHID-1005', mobile: '9876543214', gender: 'Male' },
  { id: 'pat-006', full_name: 'Pooja Shinde', uhid: 'UHID-1006', mobile: '9876543215', gender: 'Female' },
  { id: 'pat-007', full_name: 'Sanket Pawar', uhid: 'UHID-1007', mobile: '9876543216', gender: 'Male' },
  { id: 'pat-008', full_name: 'Neha Joshi', uhid: 'UHID-1008', mobile: '9876543217', gender: 'Female' },
];

const ACTIVE_STATUSES = ['booked', 'arrived', 'waiting', 'in_consultation'];

const STATUS_LABELS = {
  booked: 'Booked',
  arrived: 'Arrived',
  waiting: 'Waiting',
  in_consultation: 'In consultation',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

const STATUS_COLORS = {
  booked: '#49769F',
  arrived: '#5267b8',
  waiting: '#b7791f',
  in_consultation: '#0f766e',
  completed: '#21865b',
  cancelled: '#b42318',
  no_show: '#718096',
};

const todayISO = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key} to localStorage:`, error);
  }
};

const normalizeMobile = (value = '') => {
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '—';
  const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const makeSlots = () => {
  const slots = [];
  const ranges = [
    [9 * 60, 12 * 60],
    [14 * 60, 16 * 60 + 30],
  ];

  ranges.forEach(([start, end]) => {
    for (let minute = start; minute < end; minute += 15) {
      const hours = String(Math.floor(minute / 60)).padStart(2, '0');
      const mins = String(minute % 60).padStart(2, '0');
      slots.push(`${hours}:${mins}`);
    }
  });

  return slots;
};

const ALL_SLOTS = makeSlots();

const initialBookForm = {
  patientId: '',
  departmentId: '',
  doctorId: '',
  appointmentDate: todayISO(),
  startTime: '',
  visitType: 'Consultation',
  consultationFee: '500',
  notes: '',
  isPriority: false,
};

const initialPatientForm = {
  fullName: '',
  mobile: '',
  dob: '',
  gender: 'Male',
};

const initialRescheduleForm = {
  appointmentDate: todayISO(),
  startTime: '',
  reason: '',
};

const initialBloodForm = {
  patientId: '',
  bloodGroup: 'O+',
  units: '1',
  urgency: 'Routine',
  notes: '',
};

const styles = {
  page: {
    padding: '24px',
    color: 'var(--color-text-primary, #163b40)',
    background: 'var(--color-bg-pale-aqua, #f3faf9)',
    minHeight: '100%',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '22px',
  },
  title: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 750,
    letterSpacing: '-0.6px',
    color: 'var(--color-text-primary, #163b40)',
  },
  subtitle: {
    margin: '7px 0 0',
    color: 'var(--color-text-secondary, #648184)',
    fontSize: '14px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md, 9px)',
    border: '1px solid var(--color-border, #cfe3e1)',
    background: '#fff',
    color: 'var(--color-text-primary, #23484b)',
    fontSize: '13px',
    fontWeight: 650,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  primaryButton: {
    background: 'var(--color-primary-teal, #fff)',
    color: '#fff',
    border: '1px solid var(--color-primary-teal, #49769F)',
  },
  dangerButton: {
    background: '#fff',
    color: '#b42318',
    border: '1px solid #f3c7c4',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  statCard: {
    background: '#fff',
    border: '1px solid var(--color-border-subtle, #deecea)',
    borderRadius: 'var(--radius-lg, 13px)',
    padding: '17px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--color-text-secondary, #648184)',
    fontWeight: 600,
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '27px',
    fontWeight: 750,
    lineHeight: 1.1,
    color: 'var(--color-text-primary, #163b40)',
  },
  panel: {
    background: '#fff',
    border: '1px solid var(--color-border-subtle, #deecea)',
    borderRadius: 'var(--radius-lg, 13px)',
    overflow: 'hidden',
    marginBottom: '18px',
  },
  panelHeader: {
    padding: '17px 18px',
    borderBottom: '1px solid var(--color-border-subtle, #deecea)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  panelTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 750,
    color: 'var(--color-text-primary, #163b40)',
  },
  filters: {
    padding: '15px 18px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    borderBottom: '1px solid var(--color-border-subtle, #deecea)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  label: {
    fontSize: '12px',
    fontWeight: 650,
    color: 'var(--color-text-secondary, #49696c)',
  },
  input: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    border: '1px solid var(--color-border, #cfe3e1)',
    borderRadius: 'var(--radius-sm, 8px)',
    padding: '10px 11px',
    background: '#fff',
    color: 'var(--color-text-primary, #163b40)',
    fontSize: '13px',
    outlineColor: 'var(--color-primary-teal, #fff)',
  },
  textarea: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    border: '1px solid var(--color-border, #cfe3e1)',
    borderRadius: 'var(--radius-sm, 8px)',
    padding: '10px 11px',
    background: '#fff',
    color: 'var(--color-text-primary, #163b40)',
    fontSize: '13px',
    minHeight: '82px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outlineColor: 'var(--color-primary-teal, #fff)',
  },
  tableWrap: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    minWidth: '950px',
    textAlign: 'left',
  },
  th: {
    background: 'var(--color-bg-pale-aqua, #f3faf9)',
    color: 'var(--color-text-secondary, #648184)',
    fontSize: '11px',
    fontWeight: 750,
    textTransform: 'uppercase',
    letterSpacing: '0.45px',
    padding: '12px 14px',
    borderBottom: '1px solid var(--color-border-subtle, #deecea)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 14px',
    borderBottom: '1px solid var(--color-border-subtle, #e5efee)',
    fontSize: '12px',
    color: 'var(--color-text-primary, #345457)',
    verticalAlign: 'middle',
  },
  muted: {
    color: 'var(--color-text-secondary, #648184)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(13, 45, 48, 0.52)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px',
  },
  modal: {
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: 'var(--radius-xl, 15px)',
    boxShadow: '0 24px 80px rgba(13, 45, 48, 0.22)',
  },
  modalHeader: {
    padding: '19px 21px',
    borderBottom: '1px solid var(--color-border-subtle, #deecea)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  modalBody: {
    padding: '20px 21px',
  },
  modalFooter: {
    padding: '15px 21px',
    borderTop: '1px solid var(--color-border-subtle, #deecea)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  banner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    padding: '12px 14px',
    borderRadius: '9px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  empty: {
    padding: '42px 20px',
    textAlign: 'center',
    color: 'var(--color-text-secondary, #648184)',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(94px, 1fr))',
    gap: '8px',
    marginTop: '8px',
  },
  slot: {
    padding: '9px 6px',
    border: '1px solid var(--color-border, #cfe3e1)',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    background: '#fff',
    color: 'var(--color-text-primary, #345457)',
  },
};

function Field({ label, children, style }) {
  return (
    <div style={{ ...styles.field, ...style }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#475569';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 8px',
        borderRadius: '20px',
        color,
        background: `${color}14`,
        fontSize: '11px',
        fontWeight: 750,
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status] || status || 'Unknown'}
    </span>
  );
}

function ModalShell({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      style={styles.modalOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750 }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal" style={{ ...styles.button, padding: '7px' }}>
            <X size={18} />
          </button>
        </div>
        <div style={styles.modalBody}>{children}</div>
        {footer && <div style={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

export default function BookRescheduleView() {
  const authContext = useAuth();
  const user = authContext?.user;

  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState(() =>
    readStorage(APPOINTMENTS_KEY, [])
  );
  const [localPatients, setLocalPatients] = useState(() =>
    readStorage(PATIENTS_KEY, SAMPLE_PATIENTS)
  );
  const [departments] = useState(DEPARTMENTS);
  const [doctors] = useState(DOCTORS);
  const [bloodRequests, setBloodRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  const [showBookModal, setShowBookModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBloodModal, setShowBloodModal] = useState(false);

  const [bookForm, setBookForm] = useState(initialBookForm);
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [rescheduleForm, setRescheduleForm] = useState(initialRescheduleForm);
  const [cancelReason, setCancelReason] = useState('');
  const [bloodForm, setBloodForm] = useState(initialBloodForm);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    writeStorage(APPOINTMENTS_KEY, appointments);
  }, [appointments]);

  useEffect(() => {
    writeStorage(PATIENTS_KEY, localPatients);
  }, [localPatients]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const notifySuccess = useCallback((message) => {
    setError('');
    setSuccess(message);
  }, []);

  const notifyError = useCallback((message) => {
    setSuccess('');
    setError(message);
  }, []);

  const loadData = useCallback(async () => {
    // Appointment records are intentionally local-only for the frontend demo.
    if (activeTab === 'appointments') {
      setLoading(false);
      setError('');
      return;
    }

    if (activeTab === 'blood_requests') {
      setLoading(true);
      setError('');

      try {
        const response = await AppointmentBloodRequestService.getBloodRequests();
        const rows = Array.isArray(response)
          ? response
          : response?.data ?? response?.bloodRequests ?? response?.blood_requests ?? [];

        setBloodRequests(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error('Unable to load blood requests:', err);
        setBloodRequests([]);
        setError(err?.response?.data?.message || err?.message || 'Unable to load blood requests.');
      } finally {
        setLoading(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(''), 4500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const departmentById = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department])),
    [departments]
  );

  const doctorById = useMemo(
    () => Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor])),
    [doctors]
  );

  const patientById = useMemo(
    () => Object.fromEntries(localPatients.map((patient) => [patient.id, patient])),
    [localPatients]
  );

  const filteredDoctors = useMemo(() => {
    if (!bookForm.departmentId) return doctors;
    return doctors.filter((doctor) => doctor.department_id === bookForm.departmentId);
  }, [bookForm.departmentId, doctors]);

  const filteredPatientsForSelect = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return localPatients;

    return localPatients.filter((patient) =>
      [patient.full_name, patient.uhid, patient.mobile]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [localPatients, patientSearch]);

  const filteredAppointments = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();

    return appointments
      .filter((appointment) => !selectedDate || appointment.appointment_date === selectedDate)
      .filter((appointment) => statusFilter === 'all' || appointment.status === statusFilter)
      .filter((appointment) =>
        departmentFilter === 'all' || appointment.department_id === departmentFilter
      )
      .filter((appointment) => {
        if (!query) return true;
        return [
          appointment.appointment_number,
          appointment.patient_name,
          appointment.patient_uhid,
          appointment.doctor_name,
          appointment.department_name,
          appointment.token_number,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const timeCompare = String(a.start_time || '').localeCompare(String(b.start_time || ''));
        if (timeCompare !== 0) return timeCompare;
        return String(a.token_number || '').localeCompare(String(b.token_number || ''), undefined, {
          numeric: true,
        });
      });
  }, [appointments, selectedDate, statusFilter, departmentFilter, searchFilter]);

  const todayAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.appointment_date === todayISO()),
    [appointments]
  );

  const activeToday = todayAppointments.filter((appointment) =>
    ACTIVE_STATUSES.includes(appointment.status)
  );

  const bookedToday = todayAppointments.filter((appointment) => appointment.status === 'booked');
  const completedToday = todayAppointments.filter((appointment) => appointment.status === 'completed');

  const getSlotAvailability = useCallback(
    (doctorId, date, time, ignoredAppointmentId = null) => {
      if (!doctorId || !date || !time) return true;

      return !appointments.some((appointment) => {
        if (appointment.id === ignoredAppointmentId) return false;
        if (!ACTIVE_STATUSES.includes(appointment.status)) return false;

        return (
          appointment.doctor_id === doctorId &&
          appointment.appointment_date === date &&
          String(appointment.start_time || '').slice(0, 5) === time
        );
      });
    },
    [appointments]
  );

  const availableSlots = useMemo(() => {
    if (!bookForm.doctorId || !bookForm.appointmentDate) return [];

    return ALL_SLOTS.map((time) => ({
      time,
      available: getSlotAvailability(bookForm.doctorId, bookForm.appointmentDate, time),
    }));
  }, [bookForm.doctorId, bookForm.appointmentDate, getSlotAvailability]);

  const rescheduleSlots = useMemo(() => {
    if (!selectedAppointment || !rescheduleForm.appointmentDate) return [];

    return ALL_SLOTS.map((time) => ({
      time,
      available: getSlotAvailability(
        selectedAppointment.doctor_id,
        rescheduleForm.appointmentDate,
        time,
        selectedAppointment.id
      ),
    }));
  }, [selectedAppointment, rescheduleForm.appointmentDate, getSlotAvailability]);

  const openBookModal = () => {
    clearMessages();
    setSelectedPatient(null);
    setPatientSearch('');
    setBookForm({ ...initialBookForm, appointmentDate: selectedDate || todayISO() });
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setSelectedPatient(null);
    setPatientSearch('');
    setBookForm(initialBookForm);
  };

  const handleBookSubmit = (event) => {
    event.preventDefault();
    clearMessages();

    if (!bookForm.patientId) {
      notifyError('Please select a patient.');
      return;
    }
    if (!bookForm.departmentId) {
      notifyError('Please select a department.');
      return;
    }
    if (!bookForm.doctorId) {
      notifyError('Please select a doctor.');
      return;
    }
    if (!bookForm.appointmentDate || !bookForm.startTime) {
      notifyError('Please select an appointment date and time slot.');
      return;
    }
    if (bookForm.appointmentDate < todayISO()) {
      notifyError('Appointments cannot be booked for a past date.');
      return;
    }
    if (!getSlotAvailability(bookForm.doctorId, bookForm.appointmentDate, bookForm.startTime)) {
      notifyError('This doctor already has an active appointment at that time. Please choose another slot.');
      return;
    }

    const patient = patientById[bookForm.patientId];
    const doctor = doctorById[bookForm.doctorId];
    const department = departmentById[bookForm.departmentId];

    if (!patient || !doctor || !department) {
      notifyError('Some selected details are invalid. Please select the patient, department, and doctor again.');
      return;
    }

    const sameDayAppointments = appointments.filter(
      (appointment) =>
        appointment.appointment_date === bookForm.appointmentDate &&
        appointment.status !== 'cancelled'
    );

    const sequence = sameDayAppointments.length + 1;
    const dateCode = bookForm.appointmentDate.replaceAll('-', '');
    const appointmentNumber = `APT-${dateCode}-${String(sequence).padStart(4, '0')}`;

    const doctorDayAppointments = appointments.filter(
      (appointment) =>
        appointment.doctor_id === bookForm.doctorId &&
        appointment.appointment_date === bookForm.appointmentDate &&
        ACTIVE_STATUSES.includes(appointment.status)
    );

    const numericTokens = doctorDayAppointments
      .map((appointment) => Number(appointment.token_number))
      .filter(Number.isFinite);

    const tokenNumber = String(Math.max(0, ...numericTokens) + 1).padStart(3, '0');

    const appointment = {
      id: `local-${Date.now()}`,
      appointment_number: appointmentNumber,
      token_number: tokenNumber,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_uhid: patient.uhid || '',
      patient_mobile: patient.mobile || '',
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      department_id: department.id,
      department_name: department.name,
      appointment_date: bookForm.appointmentDate,
      start_time: bookForm.startTime,
      visit_type: bookForm.visitType,
      notes: bookForm.notes.trim(),
      is_priority: Boolean(bookForm.isPriority),
      room_id: null,
      consultation_fee: Number(bookForm.consultationFee) || 0,
      status: 'booked',
      created_at: new Date().toISOString(),
      created_by: user?.id || user?.full_name || 'demo-user',
    };

    setAppointments((current) => [...current, appointment]);
    setSelectedDate(bookForm.appointmentDate);
    setStatusFilter('all');
    setDepartmentFilter('all');
    setSearchFilter('');
    closeBookModal();
    notifySuccess(`Appointment ${appointmentNumber} booked successfully. Token: ${tokenNumber}.`);
  };

  const handleQuickRegisterSubmit = (event) => {
    event.preventDefault();
    clearMessages();

    const fullName = patientForm.fullName.trim().replace(/\s+/g, ' ');
    const mobile = normalizeMobile(patientForm.mobile);

    if (fullName.length < 2) {
      notifyError('Please enter the patient’s full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      notifyError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (localPatients.some((patient) => normalizeMobile(patient.mobile) === mobile)) {
      notifyError('A patient with this mobile number already exists.');
      return;
    }

    const maxUhid = localPatients.reduce((max, patient) => {
      const number = Number(String(patient.uhid || '').replace(/\D/g, ''));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 1000);

    const patient = {
      id: `pat-${Date.now()}`,
      uhid: `UHID-${String(maxUhid + 1).padStart(4, '0')}`,
      full_name: fullName,
      mobile,
      dob: patientForm.dob || '',
      gender: patientForm.gender,
      created_at: new Date().toISOString(),
    };

    setLocalPatients((current) => [...current, patient]);
    setSelectedPatient(patient);
    setBookForm((current) => ({ ...current, patientId: patient.id }));
    setPatientForm(initialPatientForm);
    setShowPatientModal(false);
    setPatientSearch('');
    notifySuccess(`Patient registered successfully. UHID: ${patient.uhid}.`);
  };

  const openRescheduleModal = (appointment) => {
    clearMessages();
    setSelectedAppointment(appointment);
    setRescheduleForm({
      appointmentDate: appointment.appointment_date || todayISO(),
      startTime: String(appointment.start_time || '').slice(0, 5),
      reason: '',
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = (event) => {
    event.preventDefault();
    clearMessages();

    if (!selectedAppointment) return;
    if (!rescheduleForm.appointmentDate || !rescheduleForm.startTime) {
      notifyError('Please select a new date and time.');
      return;
    }
    if (rescheduleForm.appointmentDate < todayISO()) {
      notifyError('Appointments cannot be rescheduled to a past date.');
      return;
    }
    if (
      !getSlotAvailability(
        selectedAppointment.doctor_id,
        rescheduleForm.appointmentDate,
        rescheduleForm.startTime,
        selectedAppointment.id
      )
    ) {
      notifyError('The selected slot is already occupied. Please choose another slot.');
      return;
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? {
              ...appointment,
              appointment_date: rescheduleForm.appointmentDate,
              start_time: rescheduleForm.startTime,
              reschedule_reason: rescheduleForm.reason.trim(),
              updated_at: new Date().toISOString(),
              status: 'booked',
            }
          : appointment
      )
    );

    setSelectedDate(rescheduleForm.appointmentDate);
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    notifySuccess(`Appointment ${selectedAppointment.appointment_number} rescheduled successfully.`);
  };

  const openCancelModal = (appointment) => {
    clearMessages();
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelSubmit = (event) => {
    event.preventDefault();
    clearMessages();

    if (!selectedAppointment) return;
    if (!cancelReason.trim()) {
      notifyError('Please enter a cancellation reason.');
      return;
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? {
              ...appointment,
              status: 'cancelled',
              cancellation_reason: cancelReason.trim(),
              cancelled_at: new Date().toISOString(),
            }
          : appointment
      )
    );

    const number = selectedAppointment.appointment_number;
    setShowCancelModal(false);
    setSelectedAppointment(null);
    setCancelReason('');
    notifySuccess(`Appointment ${number} cancelled.`);
  };

  const handleUpdateStatus = (appointment, nextStatus) => {
    clearMessages();

    const allowedTransitions = {
      booked: ['arrived', 'cancelled', 'no_show'],
      arrived: ['waiting', 'cancelled', 'no_show'],
      waiting: ['in_consultation', 'cancelled', 'no_show'],
      in_consultation: ['completed'],
    };

    if (!(allowedTransitions[appointment.status] || []).includes(nextStatus)) {
      notifyError('That status change is not allowed.');
      return;
    }

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id
          ? { ...item, status: nextStatus, updated_at: new Date().toISOString() }
          : item
      )
    );

    notifySuccess(
      `${appointment.appointment_number} status updated to ${STATUS_LABELS[nextStatus] || nextStatus}.`
    );
  };

  const handleBloodRequestSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!bloodForm.patientId) {
      notifyError('Please select a patient.');
      return;
    }

    const units = Number(bloodForm.units);
    if (!Number.isInteger(units) || units < 1 || units > 20) {
      notifyError('Units must be a whole number between 1 and 20.');
      return;
    }

    const patient = patientById[bloodForm.patientId];
    if (!patient) {
      notifyError('Selected patient could not be found.');
      return;
    }

    const payload = {
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_uhid: patient.uhid,
      blood_group: bloodForm.bloodGroup,
      units,
      urgency: bloodForm.urgency,
      notes: bloodForm.notes.trim(),
    };

    try {
      setLoading(true);
      await AppointmentBloodRequestService.createBloodRequest(payload);
      setShowBloodModal(false);
      setBloodForm(initialBloodForm);
      notifySuccess('Blood request submitted successfully.');
      setActiveTab('blood_requests');
    } catch (err) {
      console.error('Unable to create blood request:', err);
      notifyError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to submit the blood request. Please check the server and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openBloodModal = () => {
    clearMessages();
    setBloodForm(initialBloodForm);
    setShowBloodModal(true);
  };

  const renderAppointmentActions = (appointment) => {
    const actions = [];

    if (appointment.status === 'booked') {
      actions.push(
        <button
          key="arrived"
          type="button"
          style={styles.button}
          onClick={() => handleUpdateStatus(appointment, 'arrived')}
          title="Mark patient as arrived"
        >
          <Check size={14} /> Arrived
        </button>
      );
    }

    if (appointment.status === 'arrived') {
      actions.push(
        <button
          key="waiting"
          type="button"
          style={styles.button}
          onClick={() => handleUpdateStatus(appointment, 'waiting')}
        >
          <Clock size={14} /> Waiting
        </button>
      );
    }

    if (appointment.status === 'waiting') {
      actions.push(
        <button
          key="consult"
          type="button"
          style={styles.button}
          onClick={() => handleUpdateStatus(appointment, 'in_consultation')}
        >
          <Stethoscope size={14} /> Consult
        </button>
      );
    }

    if (appointment.status === 'in_consultation') {
      actions.push(
        <button
          key="complete"
          type="button"
          style={{ ...styles.button, color: '#15803d', borderColor: '#bbf7d0' }}
          onClick={() => handleUpdateStatus(appointment, 'completed')}
        >
          <CheckCircle2 size={14} /> Complete
        </button>
      );
    }

    if (ACTIVE_STATUSES.includes(appointment.status)) {
      actions.push(
        <button
          key="reschedule"
          type="button"
          style={styles.button}
          onClick={() => openRescheduleModal(appointment)}
          title="Reschedule appointment"
        >
          <CalendarClock size={14} />
        </button>
      );
      actions.push(
        <button
          key="cancel"
          type="button"
          style={{ ...styles.button, color: '#b91c1c', borderColor: '#fecaca' }}
          onClick={() => openCancelModal(appointment)}
          title="Cancel appointment"
        >
          <Ban size={14} />
        </button>
      );
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minWidth: '145px' }}>
        {actions.length ? actions : <span style={styles.muted}>No actions</span>}
      </div>
    );
  };

  const isClinicianOrAdmin =
    user &&
    ['clinician_doctor', 'blood_bank_officer', 'super_admin'].includes(user.role);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Appointments</h1>
          <p style={styles.subtitle}>
            Book visits, manage doctor schedules, and track patient queues.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
          <button type="button" style={styles.button} onClick={openBloodModal}>
            <Droplet size={16} /> Blood Request
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={openBookModal}
          >
            <Plus size={17} /> Book Appointment
          </button>
        </div>
      </div>

      {success && (
        <div
          role="status"
          style={{
            ...styles.banner,
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          }}
        >
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            style={{ marginLeft: 'auto', border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}
            aria-label="Dismiss success message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            ...styles.banner,
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ marginLeft: 'auto', border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}
            aria-label="Dismiss error message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div>
            <div style={styles.statLabel}>Today's appointments</div>
            <div style={styles.statValue}>{todayAppointments.length}</div>
          </div>
          <div style={{ background: '#eff6ff', color: '#2563eb', borderRadius: '10px', padding: '11px' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div>
            <div style={styles.statLabel}>Active queue</div>
            <div style={styles.statValue}>{activeToday.length}</div>
          </div>
          <div style={{ background: '#f5f3ff', color: '#7c3aed', borderRadius: '10px', padding: '11px' }}>
            <Clock size={22} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div>
            <div style={styles.statLabel}>Awaiting arrival</div>
            <div style={styles.statValue}>{bookedToday.length}</div>
          </div>
          <div style={{ background: '#fff7ed', color: '#c2410c', borderRadius: '10px', padding: '11px' }}>
            <User size={22} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div>
            <div style={styles.statLabel}>Completed today</div>
            <div style={styles.statValue}>{completedToday.length}</div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#15803d', borderRadius: '10px', padding: '11px' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Appointment Management</h2>
            <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>
              {activeTab === 'appointments'
                ? 'Manage bookings and patient flow for the selected date.'
                : 'Blood requests loaded from the hospital service.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('appointments');
                clearMessages();
              }}
              style={{
                ...styles.button,
                ...(activeTab === 'appointments'
                  ? { background: '#49769F', color: '#fff', borderColor: '#49769F' }
                  : {}),
              }}
            >
              <Calendar size={15} /> Appointments
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('blood_requests');
                clearMessages();
              }}
              style={{
                ...styles.button,
                ...(activeTab === 'blood_requests'
                  ? { background: '#49769F', color: '#fff', borderColor: '#49769F' }
                  : {}),
              }}
            >
              <Droplet size={15} /> Blood Requests
            </button>
          </div>
        </div>

        {activeTab === 'appointments' ? (
          <>
            <div style={styles.filters}>
              <Field label="Appointment date">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  style={styles.input}
                />
              </Field>

              <Field label="Search">
                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', top: '12px', left: '10px' }}
                  />
                  <input
                    value={searchFilter}
                    onChange={(event) => setSearchFilter(event.target.value)}
                    placeholder="Patient, UHID, doctor, token..."
                    style={{ ...styles.input, paddingLeft: '32px' }}
                  />
                </div>
              </Field>

              <Field label="Department">
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                  style={styles.input}
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Appointment status">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={styles.input}
                >
                  <option value="all">All statuses</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  style={{ ...styles.button, width: '100%' }}
                  onClick={() => {
                    setSelectedDate(todayISO());
                    setStatusFilter('all');
                    setDepartmentFilter('all');
                    setSearchFilter('');
                  }}
                >
                  <Filter size={15} /> Reset filters
                </button>
              </div>
            </div>

            <div style={styles.panelHeader}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing <strong style={{ color: '#172033' }}>{filteredAppointments.length}</strong> appointment(s)
                {selectedDate ? ` for ${formatDate(selectedDate)}` : ''}
              </span>
              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setAppointments(readStorage(APPOINTMENTS_KEY, []));
                  setLocalPatients(readStorage(PATIENTS_KEY, SAMPLE_PATIENTS));
                  notifySuccess('Local appointment and patient data refreshed.');
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {filteredAppointments.length === 0 ? (
              <div style={styles.empty}>
                <Calendar size={34} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#334155' }}>
                  No appointments found
                </h3>
                <p style={{ margin: '0 auto 17px', fontSize: '13px', maxWidth: '380px' }}>
                  There are no appointments matching these filters. Book a new appointment or change the selected date.
                </p>
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={openBookModal}
                >
                  <Plus size={15} /> Book Appointment
                </button>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Token / Appointment</th>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Doctor / Department</th>
                      <th style={styles.th}>Date & Time</th>
                      <th style={styles.th}>Visit</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 800, color: '#49769F', fontSize: '13px' }}>
                            Token {appointment.token_number || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {appointment.appointment_number || '—'}
                          </div>
                          {appointment.is_priority && (
                            <span style={{ display: 'inline-block', marginTop: '5px', color: '#b45309', fontWeight: 750, fontSize: '10px' }}>
                              Priority
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 750, color: '#172033' }}>
                            {appointment.patient_name || 'Unknown patient'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {appointment.patient_uhid || 'No UHID'}
                          </div>
                          {appointment.patient_mobile && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                              {appointment.patient_mobile}
                            </div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 650, color: '#172033' }}>
                            {appointment.doctor_name || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {appointment.department_name || '—'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div>{formatDate(appointment.appointment_date)}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            <Clock size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                            {formatTime(appointment.start_time)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div>{appointment.visit_type || 'Consultation'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            ₹{Number(appointment.consultation_fee || 0).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td style={styles.td}>{renderAppointmentActions(appointment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={styles.panelHeader}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {bloodRequests.length} blood request(s)
              </div>
              <button
                type="button"
                style={styles.button}
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw size={14} /> {loading ? 'Loading...' : 'Refresh requests'}
              </button>
            </div>

            {loading ? (
              <div style={styles.empty}>Loading blood requests...</div>
            ) : bloodRequests.length === 0 ? (
              <div style={styles.empty}>
                <Droplet size={34} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#334155' }}>
                  No blood requests to display
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px' }}>
                  Create a blood request to send it to the hospital service.
                </p>
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onClick={openBloodModal}
                >
                  <Droplet size={15} /> New blood request
                </button>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={{ ...styles.table, minWidth: '750px' }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Request</th>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Blood group</th>
                      <th style={styles.th}>Units</th>
                      <th style={styles.th}>Urgency</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodRequests.map((request, index) => (
                      <tr key={request.id || request.request_id || index}>
                        <td style={styles.td}>
                          {request.request_number || request.request_id || request.id || `Request ${index + 1}`}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 650 }}>
                            {request.patient_name || patientById[request.patient_id]?.full_name || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {request.patient_uhid || patientById[request.patient_id]?.uhid || ''}
                          </div>
                        </td>
                        <td style={styles.td}>{request.blood_group || request.bloodGroup || '—'}</td>
                        <td style={styles.td}>{request.units ?? request.units_required ?? '—'}</td>
                        <td style={styles.td}>{request.urgency || 'Routine'}</td>
                        <td style={styles.td}>
                          <StatusBadge status={String(request.status || 'pending').toLowerCase()} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '11px', padding: '0 2px' }}>
        <AlertTriangle size={14} />
        <span>
          Demo note: appointment and patient records are stored in this browser. Blood requests use the configured hospital API.
        </span>
      </div>

      {showBookModal && (
        <ModalShell
          title="Book appointment"
          subtitle="Select the patient, doctor, date, and an available time slot."
          onClose={closeBookModal}
          footer={
            <>
              <button type="button" style={styles.button} onClick={closeBookModal}>
                Cancel
              </button>
              <button
                type="submit"
                form="book-appointment-form"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <CheckCircle2 size={15} /> Confirm booking
              </button>
            </>
          }
        >
          <form id="book-appointment-form" onSubmit={handleBookSubmit}>
            <div style={styles.formGrid}>
              <Field label="Patient *" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={patientSearch}
                    onChange={(event) => setPatientSearch(event.target.value)}
                    placeholder="Search patient by name, UHID, or mobile"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    style={styles.button}
                    onClick={() => {
                      setPatientForm(initialPatientForm);
                      setShowPatientModal(true);
                    }}
                    title="Register a new patient"
                  >
                    <UserPlus size={15} /> New
                  </button>
                </div>
                <select
                  value={bookForm.patientId}
                  onChange={(event) => {
                    const patient = patientById[event.target.value] || null;
                    setSelectedPatient(patient);
                    setBookForm((current) => ({ ...current, patientId: event.target.value }));
                  }}
                  style={styles.input}
                  required
                >
                  <option value="">Select a patient</option>
                  {filteredPatientsForSelect.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} — {patient.uhid || 'No UHID'} — {patient.mobile || 'No mobile'}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <span style={{ color: '#64748b', fontSize: '11px' }}>
                    Selected: {selectedPatient.full_name} · {selectedPatient.uhid}
                  </span>
                )}
              </Field>

              <Field label="Department *">
                <select
                  value={bookForm.departmentId}
                  onChange={(event) =>
                    setBookForm((current) => ({
                      ...current,
                      departmentId: event.target.value,
                      doctorId: '',
                      startTime: '',
                    }))
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Doctor *">
                <select
                  value={bookForm.doctorId}
                  onChange={(event) =>
                    setBookForm((current) => ({
                      ...current,
                      doctorId: event.target.value,
                      startTime: '',
                    }))
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select doctor</option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Appointment date *">
                <input
                  type="date"
                  min={todayISO()}
                  value={bookForm.appointmentDate}
                  onChange={(event) =>
                    setBookForm((current) => ({
                      ...current,
                      appointmentDate: event.target.value,
                      startTime: '',
                    }))
                  }
                  style={styles.input}
                  required
                />
              </Field>

              <Field label="Visit type">
                <select
                  value={bookForm.visitType}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, visitType: event.target.value }))
                  }
                  style={styles.input}
                >
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Review</option>
                  <option>Emergency</option>
                </select>
              </Field>

              <Field label="Consultation fee (₹)">
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={bookForm.consultationFee}
                  onChange={(event) =>
                    setBookForm((current) => ({
                      ...current,
                      consultationFee: event.target.value,
                    }))
                  }
                  style={styles.input}
                />
              </Field>

              <Field label="Notes" style={{ gridColumn: '1 / -1' }}>
                <textarea
                  value={bookForm.notes}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  style={styles.textarea}
                  maxLength={1000}
                  placeholder="Reason for visit or relevant booking notes"
                />
              </Field>
            </div>

            <div style={{ marginTop: '19px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 750 }}>Available time slots *</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    15-minute slots · Morning and afternoon sessions
                  </div>
                </div>
                {bookForm.startTime && (
                  <span style={{ fontSize: '12px', color: '#49769F', fontWeight: 750 }}>
                    Selected: {formatTime(bookForm.startTime)}
                  </span>
                )}
              </div>

              {!bookForm.doctorId || !bookForm.appointmentDate ? (
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                  Choose a department, doctor, and date to see available slots.
                </p>
              ) : (
                <div style={styles.slotGrid}>
                  {availableSlots.map(({ time, available }) => {
                    const selected = bookForm.startTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        onClick={() =>
                          setBookForm((current) => ({ ...current, startTime: time }))
                        }
                        style={{
                          ...styles.slot,
                          ...(selected
                            ? { background: '#49769F', borderColor: '#49769F', color: '#fff', fontWeight: 750 }
                            : {}),
                          ...(!available
                            ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', textDecoration: 'line-through' }
                            : {}),
                        }}
                        title={available ? `Select ${formatTime(time)}` : 'Already booked'}
                      >
                        {formatTime(time)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '18px', fontSize: '13px', color: '#334155' }}>
              <input
                type="checkbox"
                checked={bookForm.isPriority}
                onChange={(event) =>
                  setBookForm((current) => ({ ...current, isPriority: event.target.checked }))
                }
              />
              Mark as priority appointment
            </label>
          </form>
        </ModalShell>
      )}

      {showPatientModal && (
        <ModalShell
          title="Quick patient registration"
          subtitle="Register a patient locally and select them for this appointment."
          onClose={() => setShowPatientModal(false)}
          footer={
            <>
              <button type="button" style={styles.button} onClick={() => setShowPatientModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                form="quick-register-form"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <UserPlus size={15} /> Register patient
              </button>
            </>
          }
        >
          <form id="quick-register-form" onSubmit={handleQuickRegisterSubmit}>
            <div style={styles.formGrid}>
              <Field label="Full name *" style={{ gridColumn: '1 / -1' }}>
                <input
                  value={patientForm.fullName}
                  onChange={(event) =>
                    setPatientForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  style={styles.input}
                  placeholder="Enter patient's full name"
                  maxLength={100}
                  required
                />
              </Field>

              <Field label="Mobile number *">
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={15}
                    color="#94a3b8"
                    style={{ position: 'absolute', top: '12px', left: '10px' }}
                  />
                  <input
                    type="tel"
                    value={patientForm.mobile}
                    onChange={(event) =>
                      setPatientForm((current) => ({ ...current, mobile: event.target.value }))
                    }
                    style={{ ...styles.input, paddingLeft: '32px' }}
                    placeholder="10-digit mobile"
                    maxLength={15}
                    required
                  />
                </div>
              </Field>

              <Field label="Date of birth">
                <input
                  type="date"
                  max={todayISO()}
                  value={patientForm.dob}
                  onChange={(event) =>
                    setPatientForm((current) => ({ ...current, dob: event.target.value }))
                  }
                  style={styles.input}
                />
              </Field>

              <Field label="Gender">
                <select
                  value={patientForm.gender}
                  onChange={(event) =>
                    setPatientForm((current) => ({ ...current, gender: event.target.value }))
                  }
                  style={styles.input}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
            </div>
          </form>
        </ModalShell>
      )}

      {showRescheduleModal && selectedAppointment && (
        <ModalShell
          title="Reschedule appointment"
          subtitle={`${selectedAppointment.appointment_number} · ${selectedAppointment.patient_name}`}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          footer={
            <>
              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Keep current booking
              </button>
              <button
                type="submit"
                form="reschedule-form"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <CalendarClock size={15} /> Confirm reschedule
              </button>
            </>
          }
        >
          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '9px', marginBottom: '17px', fontSize: '12px', color: '#475569' }}>
            Current booking: <strong>{formatDate(selectedAppointment.appointment_date)}</strong> at{' '}
            <strong>{formatTime(selectedAppointment.start_time)}</strong> with{' '}
            <strong>{selectedAppointment.doctor_name}</strong>.
          </div>

          <form id="reschedule-form" onSubmit={handleRescheduleSubmit}>
            <div style={styles.formGrid}>
              <Field label="New appointment date *">
                <input
                  type="date"
                  min={todayISO()}
                  value={rescheduleForm.appointmentDate}
                  onChange={(event) =>
                    setRescheduleForm((current) => ({
                      ...current,
                      appointmentDate: event.target.value,
                      startTime: '',
                    }))
                  }
                  style={styles.input}
                  required
                />
              </Field>

              <Field label="Reason for rescheduling">
                <input
                  value={rescheduleForm.reason}
                  onChange={(event) =>
                    setRescheduleForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  style={styles.input}
                  maxLength={300}
                  placeholder="Reason (optional)"
                />
              </Field>
            </div>

            <div style={{ marginTop: '17px', fontSize: '13px', fontWeight: 750 }}>
              Select a new time *
            </div>
            <div style={styles.slotGrid}>
              {rescheduleSlots.map(({ time, available }) => {
                const selected = rescheduleForm.startTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={!available}
                    onClick={() =>
                      setRescheduleForm((current) => ({ ...current, startTime: time }))
                    }
                    style={{
                      ...styles.slot,
                      ...(selected
                        ? { background: '#49769F', borderColor: '#49769F', color: '#fff', fontWeight: 750 }
                        : {}),
                      ...(!available
                        ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', textDecoration: 'line-through' }
                        : {}),
                    }}
                    title={available ? `Select ${formatTime(time)}` : 'Already booked'}
                  >
                    {formatTime(time)}
                  </button>
                );
              })}
            </div>
          </form>
        </ModalShell>
      )}

      {showCancelModal && selectedAppointment && (
        <ModalShell
          title="Cancel appointment"
          subtitle={`${selectedAppointment.appointment_number} · ${selectedAppointment.patient_name}`}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          footer={
            <>
              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Go back
              </button>
              <button
                type="submit"
                form="cancel-form"
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                <Ban size={15} /> Confirm cancellation
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '10px', background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa', padding: '12px', borderRadius: '9px', marginBottom: '16px', fontSize: '12px' }}>
            <AlertTriangle size={17} style={{ flexShrink: 0 }} />
            <span>This will mark the appointment as cancelled. The record will remain in the appointment history.</span>
          </div>

          <form id="cancel-form" onSubmit={handleCancelSubmit}>
            <Field label="Cancellation reason *">
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                style={styles.textarea}
                placeholder="Enter the reason for cancellation"
                maxLength={500}
                required
              />
            </Field>
          </form>
        </ModalShell>
      )}

      {showBloodModal && (
        <ModalShell
          title="Create blood request"
          subtitle="Submit a blood request through the configured hospital API."
          onClose={() => setShowBloodModal(false)}
          footer={
            <>
              <button type="button" style={styles.button} onClick={() => setShowBloodModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                form="blood-request-form"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <Droplet size={15} /> {loading ? 'Submitting...' : 'Submit request'}
              </button>
            </>
          }
        >
          <form id="blood-request-form" onSubmit={handleBloodRequestSubmit}>
            <div style={styles.formGrid}>
              <Field label="Patient *" style={{ gridColumn: '1 / -1' }}>
                <select
                  value={bloodForm.patientId}
                  onChange={(event) =>
                    setBloodForm((current) => ({ ...current, patientId: event.target.value }))
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select patient</option>
                  {localPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name} — {patient.uhid}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Blood group *">
                <select
                  value={bloodForm.bloodGroup}
                  onChange={(event) =>
                    setBloodForm((current) => ({ ...current, bloodGroup: event.target.value }))
                  }
                  style={styles.input}
                  required
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </Field>

              <Field label="Units required *">
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={bloodForm.units}
                  onChange={(event) =>
                    setBloodForm((current) => ({ ...current, units: event.target.value }))
                  }
                  style={styles.input}
                  required
                />
              </Field>

              <Field label="Urgency *">
                <select
                  value={bloodForm.urgency}
                  onChange={(event) =>
                    setBloodForm((current) => ({ ...current, urgency: event.target.value }))
                  }
                  style={styles.input}
                >
                  <option>Routine</option>
                  <option>Urgent</option>
                  <option>Emergency</option>
                </select>
              </Field>

              <Field label="Clinical notes" style={{ gridColumn: '1 / -1' }}>
                <textarea
                  value={bloodForm.notes}
                  onChange={(event) =>
                    setBloodForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  style={styles.textarea}
                  maxLength={1000}
                  placeholder="Add relevant request details"
                />
              </Field>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}

export { BookRescheduleView };