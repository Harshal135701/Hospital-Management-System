import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Stethoscope,
  Clock,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowLeft,
  Plus,
  Edit3,
  IndianRupee
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, SafeImage, Modal } from '../common/UIPrimitives';
import { DoctorAdminService, DepartmentService, TokenManager } from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { ClinicalStaffService } from '../../services/api';
import { HEALTHCARE_IMAGES, CLINICAL_FALLBACK_SVG } from '../../assets/images';

export const DoctorsView = ({ onBack, onNavigate }) => {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isMock, setIsMock] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Doctor Admin Modals State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    employeeCode: '',
    departmentId: '',
    specialty: '',
    consultationFee: 500,
    qualifications: 'MBBS, MD',
    experienceYears: 5
  });
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [docModalError, setDocModalError] = useState(null);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await DepartmentService.getDepartments();
        if (Array.isArray(depts)) setDepartmentsList(depts);
      } catch {}
    }
    loadDepts();
  }, []);

  useEffect(() => {
    async function loadStaff() {
      const res = await ClinicalStaffService.getStaff();
      if (res) {
        setStaffList(res.data || []);
        if (res.isMock) setIsMock(true);
      }
    }
    loadStaff();
  }, []);


  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.fullName.trim() || !doctorForm.employeeCode.trim()) {
      setDocModalError('Full name and employee code are required.');
      return;
    }
    setIsSubmittingDoc(true);
    setDocModalError(null);

    try {
      const payload = {
        full_name: doctorForm.fullName.trim(),
        employee_code: doctorForm.employeeCode.trim().toUpperCase(),
        department_id: doctorForm.departmentId || (departmentsList[0]?.id || null),
        specialty: doctorForm.specialty.trim() || 'General Specialist',
        consultation_fee: parseFloat(doctorForm.consultationFee) || 500,
        qualifications: doctorForm.qualifications.trim(),
        experience_years: parseInt(doctorForm.experienceYears) || 0
      };

      if (TokenManager.getToken()) {
        const res = await DoctorAdminService.createDoctor(payload);
        const created = res?.data || res;
        setStaffList(prev => [
          {
            id: created.id,
            name: created.full_name,
            role: 'Consultant',
            department: departmentsList.find(d => d.id === created.department_id)?.name || 'General',
            specialty: created.specialty,
            qualification: created.qualifications,
            room: 'Chamber 101',
            shift: '08:00 - 16:00',
            status: 'available',
            consultation_fee: created.consultation_fee,
            active_patients_today: 0,
            imageKey: 'doctorConsultation'
          },
          ...prev
        ]);
      } else {
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: payload.full_name,
          role: 'Consultant',
          department: departmentsList.find(d => d.id === payload.department_id)?.name || 'General',
          specialty: payload.specialty,
          qualification: payload.qualifications,
          room: 'Chamber 101',
          shift: '08:00 - 16:00',
          status: 'available',
          consultation_fee: payload.consultation_fee,
          active_patients_today: 0,
          imageKey: 'doctorConsultation'
        };
        setStaffList(prev => [newDoc, ...prev]);
      }

      setIsAddDoctorOpen(false);
      setSuccessBanner(`Doctor ${payload.full_name} added to hospital faculty.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setDocModalError(err.message || 'Failed to register doctor.');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleEditDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setIsSubmittingDoc(true);
    setDocModalError(null);

    try {
      const payload = {
        full_name: doctorForm.fullName.trim(),
        specialty: doctorForm.specialty.trim(),
        consultation_fee: parseFloat(doctorForm.consultationFee) || 500,
        qualifications: doctorForm.qualifications.trim(),
        experience_years: parseInt(doctorForm.experienceYears) || 0
      };

      if (TokenManager.getToken()) {
        await DoctorAdminService.updateDoctor(editingDoctor.id, payload);
      }

      setStaffList(prev =>
        prev.map(s =>
          s.id === editingDoctor.id
            ? { ...s, name: payload.full_name, specialty: payload.specialty, consultation_fee: payload.consultation_fee, qualification: payload.qualifications }
            : s
        )
      );

      setIsEditDoctorOpen(false);
      setEditingDoctor(null);
      setSuccessBanner(`Doctor ${payload.full_name} updated successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setDocModalError(err.message || 'Failed to update doctor.');
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const departments = ['all', ...new Set(staffList.map((s) => s.department))];

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || staff.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="sm">● Available in OPD</Badge>;
      case 'in_consultation':
        return <Badge variant="warning" size="sm">● In Consultation</Badge>;
      case 'in_surgery':
        return <Badge variant="danger" size="sm">● In OT Surgery</Badge>;
      case 'on_duty':
        return <Badge variant="teal" size="sm">● On Active Duty</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header and Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
              Hospital Personnel & Faculty Directory
            </span>
            {isMock && <Badge variant="teal" size="sm">Roster Synced (Demo Active)</Badge>}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '4px 0 2px 0' }}>
            Clinical Staff & Attending Doctors
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Live roster of certified specialists, attending physicians, and nursing supervisors across departments.
          </p>
        </div>

        {onBack && (
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Quick Summary Telemetry Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Total Registered Staff
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
            {staffList.length} Consultants
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            All credentials verified by Medical Council
          </div>
        </div>

        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Active on Duty Now
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '2px' }}>
            {staffList.filter((s) => s.status !== 'offline').length} On Floor
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Shift: 08:00 – 16:00 (Morning Shift A)
          </div>
        </div>

        <div style={{ padding: '16px 18px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
            Patients Attended Today
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>
            109 Consultations
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Across OPD Block B, Cath Lab, and Wards
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '14px', alignItems: 'center' }}>
          <Input
            placeholder="Search doctors by name, qualification, or clinical specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={departments.map((d) => ({
              value: d,
              label: d === 'all' ? 'All Departments' : d
            }))}
          />
        </div>
      </Card>

      {/* Staff Cards Grid with Authentic Clinical Photography */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {filteredStaff.map((staff) => {
          const photo = HEALTHCARE_IMAGES[staff.imageKey] || HEALTHCARE_IMAGES.doctorConsultation;
          return (
            <div
              key={staff.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-card)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Top row: Doctor Photo + Identity */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <SafeImage
                  src={photo}
                  fallbackSrc={CLINICAL_FALLBACK_SVG}
                  alt={staff.name}
                  style={{
                    width: '74px',
                    height: '74px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-subtle)',
                    border: '2px solid #FFFFFF'
                  }}
                  borderRadius="var(--radius-md)"
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      {staff.role}
                    </span>
                    {getStatusBadge(staff.status)}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '2px 0 0 0' }}>
                    {staff.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {staff.qualification}
                  </div>
                </div>
              </div>

              {/* Department & Specialty Tag */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(73, 118, 159, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                  <Stethoscope size={14} />
                  <span>{staff.specialty}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  {staff.department}
                </div>
              </div>

              {/* Duty Location & Telemetry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building size={13} color="var(--color-text-muted)" />
                  <span>{staff.room}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="var(--color-text-muted)" />
                  <span>{staff.shift}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Today: <strong>{staff.active_patients_today}</strong> consults
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setEditingDoctor(staff);
                      setDoctorForm({
                        fullName: staff.name,
                        employeeCode: staff.employee_code || 'DOC-01',
                        departmentId: '',
                        specialty: staff.specialty,
                        consultationFee: staff.consultation_fee ? Number(staff.consultation_fee) : 500,
                        qualifications: staff.qualification,
                        experienceYears: staff.experience_years || 5
                      });
                      setDocModalError(null);
                      setIsEditDoctorOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  {onNavigate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('appointments')}
                    >
                      Book Slot
                    </Button>
                  )}
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => alert(`Calling duty intercom for ${staff.name}: ${staff.phone}`)}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorOpen && (
        <Modal
          isOpen={isAddDoctorOpen}
          onClose={() => setIsAddDoctorOpen(false)}
          title="Register Attending Doctor / Specialist"
          subtitle="Add clinician to hospital directory and outpatient consultation schedules"
          maxWidth="560px"
        >
          <form onSubmit={handleAddDoctorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {docModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {docModalError}
              </div>
            )}

            <Input
              label="Doctor Full Name"
              required
              placeholder="e.g. Dr. Rajesh K. Gupta"
              value={doctorForm.fullName}
              onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
              <Input
                label="Employee / Reg Code"
                required
                value={doctorForm.employeeCode}
                onChange={(e) => setDoctorForm({ ...doctorForm, employeeCode: e.target.value })}
              />

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Department
                </label>
                <select
                  value={doctorForm.departmentId}
                  onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <Input
                label="Clinical Specialty"
                required
                placeholder="e.g. Interventional Cardiology"
                value={doctorForm.specialty}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
              />

              <Input
                label="OPD Consultation Fee (₹)"
                type="number"
                min="0"
                required
                value={doctorForm.consultationFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
              <Input
                label="Medical Qualifications"
                placeholder="e.g. MBBS, MD, DM, FRCP"
                value={doctorForm.qualifications}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
              />

              <Input
                label="Experience (Years)"
                type="number"
                min="0"
                value={doctorForm.experienceYears}
                onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAddDoctorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingDoc} icon={CheckCircle2}>
                Save Doctor
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Doctor Modal */}
      {isEditDoctorOpen && editingDoctor && (
        <Modal
          isOpen={isEditDoctorOpen}
          onClose={() => setIsEditDoctorOpen(false)}
          title="Edit Doctor Credentials & Tariff"
          subtitle={`Updating details for ${editingDoctor.name}`}
          maxWidth="560px"
        >
          <form onSubmit={handleEditDoctorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {docModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {docModalError}
              </div>
            )}

            <Input
              label="Doctor Full Name"
              required
              value={doctorForm.fullName}
              onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <Input
                label="Clinical Specialty"
                required
                value={doctorForm.specialty}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
              />

              <Input
                label="OPD Consultation Fee (₹)"
                type="number"
                min="0"
                required
                value={doctorForm.consultationFee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
              />
            </div>

            <Input
              label="Medical Qualifications"
              value={doctorForm.qualifications}
              onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsEditDoctorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingDoc} icon={CheckCircle2}>
                Update Doctor
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
