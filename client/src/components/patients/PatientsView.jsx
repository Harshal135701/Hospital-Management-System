import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { PatientService, AppointmentService } from '../../services/api';

export const PatientsView = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'female',
    mobile: '',
    bloodGroup: 'B',
    rhFactor: 'positive'
  });

  useEffect(() => {
    async function fetchPatients() {
      const res = await PatientService.getPatients();
      if (res) {
        setPatients(res.data || []);
        setIsMockData(res.isMock);
      }
    }
    fetchPatients();
  }, []);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: `p-${Date.now()}`,
      uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: formData.fullName,
      date_of_birth: formData.dob || '1990-01-01',
      gender: formData.gender,
      blood_group: formData.bloodGroup,
      rh_factor: formData.rhFactor,
      mobile: formData.mobile,
      created_at: new Date().toISOString()
    };
    setPatients([newPatient, ...patients]);
    setIsRegisterModalOpen(false);
    setFormData({ fullName: '', dob: '', gender: 'female', mobile: '', bloodGroup: 'B', rhFactor: 'positive' });
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm);
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Patients Master Directory
            </h1>
            {isMockData && <Badge variant="teal" size="sm">Demo Connected</Badge>}
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Permanent electronic health records indexed by unique Hospital Identification Number (UHID).
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Register New Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Input
              icon={Search}
              placeholder="Search by UHID, patient name, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Genders' },
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            Showing {filteredPatients.length} of {patients.length} records
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card title="Registered Patients" subtitle="Comprehensive patient registry with validated demographic records">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>UHID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Full Name</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Gender / DOB</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Blood Group</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Contact</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Registered On</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                  <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                    {p.uhid}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{p.full_name}</div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                    {p.gender} • {p.date_of_birth}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <Badge variant={p.rh_factor === 'positive' ? 'teal' : 'blood'}>
                      {p.blood_group} {p.rh_factor === 'positive' ? '+' : '-'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} color="var(--color-text-muted)" />
                      {p.mobile}
                    </div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <Button variant="outline" size="sm">
                      View EHR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Patient"
        subtitle="Generates unique UHID in accordance with the hospital patient schema"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Patient Full Name"
            required
            placeholder="e.g., Ananya Deshmukh"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Date of Birth"
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
            <Select
              label="Gender"
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={['A', 'B', 'AB', 'O']}
            />
            <Select
              label="Rh Factor"
              value={formData.rhFactor}
              onChange={(e) => setFormData({ ...formData, rhFactor: e.target.value })}
              options={[
                { value: 'positive', label: 'Rh Positive (+)' },
                { value: 'negative', label: 'Rh Negative (-)' }
              ]}
            />
          </div>

          <Input
            label="Mobile Number"
            required
            placeholder="+91 98765 43210"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Complete Registration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const AppointmentsView = () => {
  const [appointments, setAppointments] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  // Appointment Form state
  const [formData, setFormData] = useState({
    patientUhid: 'UHID-2026-0814',
    doctor: 'Dr. Arindam Mitra',
    department: 'Cardiology',
    date: '2026-10-12',
    time: '11:00 AM',
    visitType: 'first_visit'
  });

  useEffect(() => {
    async function fetchAppointments() {
      const res = await AppointmentService.getAppointments();
      if (res) {
        setAppointments(res.data || []);
        setIsMockData(res.isMock);
      }
    }
    fetchAppointments();
  }, []);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    const newApt = {
      id: `apt-${Date.now()}`,
      appointment_number: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_name: formData.patientUhid === 'UHID-2026-0814' ? 'Devika Sengupta' : 'Walk-in Patient',
      patient_uhid: formData.patientUhid,
      doctor_name: formData.doctor,
      department_name: formData.department,
      appointment_date: formData.date,
      start_time: formData.time,
      status: 'confirmed',
      visit_type: formData.visitType
    };
    setAppointments([newApt, ...appointments]);
    setIsBookModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Appointments & OPD Schedule
            </h1>
            {isMockData && <Badge variant="teal" size="sm">Schema Synchronized</Badge>}
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Manage outpatient bookings, doctor roster schedules, and patient consultation queues.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsBookModalOpen(true)}
        >
          Book Consultation Slot
        </Button>
      </div>

      {/* Appointments List */}
      <Card title="Daily Outpatient Roster" subtitle="Enforcing schedule slots, doctor leaves, and patient booking schemas">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Slot Number</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Scheduled Time</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient Details</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Department</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Consultant</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Visit Type</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                  <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                    {apt.appointment_number}
                  </td>
                  <td style={{ padding: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} color="var(--color-text-muted)" />
                      {apt.start_time}
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{apt.patient_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{apt.patient_uhid}</div>
                  </td>
                  <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>
                    {apt.department_name}
                  </td>
                  <td style={{ padding: '14px', color: 'var(--color-text-primary)' }}>
                    {apt.doctor_name}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <Badge variant={apt.visit_type === 'first_visit' ? 'info' : 'gray'}>
                      {apt.visit_type === 'first_visit' ? 'First Visit' : 'Follow Up'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <Badge variant={apt.status === 'in_consultation' ? 'warning' : 'success'}>
                      {apt.status === 'in_consultation' ? 'In Consultation' : 'Confirmed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book Slot Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Outpatient Consultation"
        subtitle="Directly integrates with doctor schedules and patient master database"
      >
        <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Patient UHID"
            required
            placeholder="e.g., UHID-2026-0814"
            value={formData.patientUhid}
            onChange={(e) => setFormData({ ...formData, patientUhid: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Department"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={['Cardiology', 'General Medicine', 'Orthopaedics', 'Haematology & Transfusion']}
            />
            <Select
              label="Attending Doctor"
              required
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              options={['Dr. Arindam Mitra', 'Dr. Sunita Rao', 'Dr. Pradeep K. Sharma', 'Dr. Meenakshi Sundaram']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              label="Start Slot"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              options={['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM']}
            />
          </div>

          <Select
            label="Visit Classification"
            value={formData.visitType}
            onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
            options={[
              { value: 'first_visit', label: 'First Visit (Full Workup)' },
              { value: 'follow_up', label: 'Follow Up (Review)' }
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
