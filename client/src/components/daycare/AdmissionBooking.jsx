import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Plus,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  IndianRupee,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import { DAYCARE_PACKAGES } from './daycareDemoData';
import { formatINR, formatDateIN, formatDateTimeIN } from '../../utils/formatters';

export function AdmissionBooking({
  admissions,
  patients,
  doctors,
  onSelectAdmission,
  onCreateAdmission,
  onUpdateStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(DAYCARE_PACKAGES[0]);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [procedureDate, setProcedureDate] = useState(new Date().toISOString().slice(0, 10));
  const [plannedDuration, setPlannedDuration] = useState(120);
  const [customInstructions, setCustomInstructions] = useState('');

  // Patient Quick Search in Modal
  const [patientSearch, setPatientSearch] = useState('');

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return patients.filter(p =>
      (p.full_name || p.name || '').toLowerCase().includes(q) ||
      (p.uhid || '').toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const matchesSearch =
        (adm.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adm.patient_uhid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adm.procedure_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adm.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || adm.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [admissions, searchTerm, statusFilter]);

  const handleOpenBookModal = () => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
    setIsBookModalOpen(true);
  };

  const handlePackageChange = (e) => {
    const pkg = DAYCARE_PACKAGES.find(p => p.id === e.target.value);
    if (pkg) {
      setSelectedPackage(pkg);
      setPlannedDuration(pkg.durationMinutes);
      setCustomInstructions(pkg.preOpInstructions);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId)) || {
      id: selectedPatientId,
      full_name: 'Walk-in Day Care Patient',
      uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: 'Unspecified',
      date_of_birth: '1985-01-01'
    };
    const doctorObj = doctors.find(d => String(d.id) === String(selectedDoctorId)) || {
      id: selectedDoctorId,
      full_name: 'Attending Day Care Consultant'
    };

    const newAdmission = {
      patient_id: patientObj.id,
      patient_name: patientObj.full_name || patientObj.name,
      patient_uhid: patientObj.uhid,
      patient_gender: patientObj.gender || 'Not specified',
      patient_age: patientObj.age || 45,
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name || doctorObj.name,
      procedure_name: selectedPackage.name,
      procedure_date: procedureDate,
      planned_duration_minutes: Number(plannedDuration),
      pre_op_instructions: customInstructions || selectedPackage.preOpInstructions,
      status: 'booked',
      total_package_cost: selectedPackage.basePrice,
      billing_cleared: false
    };

    onCreateAdmission(newAdmission);
    setIsBookModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return <Badge variant="info">Booked</Badge>;
      case 'admitted':
        return <Badge variant="teal">Admitted</Badge>;
      case 'in_procedure':
        return <Badge variant="warning">In Procedure</Badge>;
      case 'recovering':
        return <Badge variant="teal">Recovering</Badge>;
      case 'discharged':
        return <Badge variant="success">Discharged</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by UHID, patient name, procedure or admission #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem',
              color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Statuses ({admissions.length})</option>
            <option value="booked">Booked</option>
            <option value="admitted">Admitted</option>
            <option value="in_procedure">In Procedure</option>
            <option value="recovering">Recovering</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenBookModal}
        >
          Book Day Care Episode
        </Button>
      </div>

      {/* Active Admissions Schedule Table */}
      <Card
        title={`Day Care Admissions & Procedure Schedule (${filteredAdmissions.length})`}
        subtitle="Live registry of ambulatory procedures, assigned stations, and recovery state."
      >
        {filteredAdmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.92rem' }}>No Day Care admissions found</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try adjusting your search criteria or register a new ambulatory procedure episode.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Episode #</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Patient Details</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Procedure & Consultant</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Station / Chair</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Date & Duration</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Package Cost</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(adm => (
                  <tr
                    key={adm.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background-color 0.12s ease'
                    }}
                    className="hover-row"
                  >
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                      {adm.admission_number || adm.id}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{adm.patient_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {adm.patient_uhid} • {adm.patient_gender}, {adm.patient_age}y
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{adm.procedure_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={11} /> {adm.doctor_name || 'Attending Surgeon'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {adm.chair_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', fontSize: '0.76rem', fontWeight: '600' }}>
                          <Layers size={12} /> {adm.chair_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>Unallocated</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{formatDateIN(adm.procedure_date)}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {adm.planned_duration_minutes || 120} min
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {formatINR(adm.total_package_cost || 0)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: adm.billing_cleared ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {adm.billing_cleared ? '✓ Cleared' : '• Bill Pending'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(adm.status)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectAdmission(adm)}
                          title="Open monitoring / clinical details"
                        >
                          Details
                        </Button>
                        {adm.status === 'booked' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onUpdateStatus(adm.id, 'admitted')}
                          >
                            Admit
                          </Button>
                        )}
                        {adm.status === 'admitted' && (
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => onUpdateStatus(adm.id, 'in_procedure')}
                          >
                            Start
                          </Button>
                        )}
                        {adm.status === 'in_procedure' && (
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={() => onUpdateStatus(adm.id, 'recovering')}
                          >
                            Recovery
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

      {/* Booking Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Register Day Care Ambulatory Episode"
        subtitle="Book an outpatient procedure slot, associate patient, and assign surgical package."
        maxWidth="640px"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient Selection */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
              Select Patient *
            </label>
            <input
              type="text"
              placeholder="Search patient by name or UHID..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                marginBottom: '8px',
                fontSize: '0.84rem'
              }}
            />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.name} ({p.uhid}) - {p.gender}, {p.age || 'Adult'}
                </option>
              ))}
            </select>
          </div>

          {/* Procedure Package */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
              Surgical / Day Care Package *
            </label>
            <select
              value={selectedPackage.id}
              onChange={handlePackageChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            >
              {DAYCARE_PACKAGES.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.department}) - {formatINR(pkg.basePrice)}
                </option>
              ))}
            </select>
          </div>

          {/* Package Breakdown Box */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(8, 127, 140, 0.2)',
              fontSize: '0.8rem'
            }}
          >
            <div style={{ fontWeight: '600', color: 'var(--color-primary-teal)', marginBottom: '6px' }}>
              Package Cost Breakdown: {formatINR(selectedPackage.basePrice)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', color: 'var(--color-text-secondary)' }}>
              <div>• Theatre: {formatINR(selectedPackage.breakdown.theatreCharge)}</div>
              <div>• Consumables: {formatINR(selectedPackage.breakdown.implantConsumables)}</div>
              <div>• Surgeon Fee: {formatINR(selectedPackage.breakdown.surgeonFee)}</div>
              <div>• Day Care Lounge: {formatINR(selectedPackage.breakdown.daycareRecovery)}</div>
            </div>
          </div>

          {/* Consultant & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
                Attending Consultant *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">-- Choose Consultant --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name || d.name} ({d.specialty || d.department || 'Consultant'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
                Procedure Date *
              </label>
              <input
                type="date"
                value={procedureDate}
                onChange={(e) => setProcedureDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Duration & Pre-op Instructions */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
                Duration (min)
              </label>
              <input
                type="number"
                value={plannedDuration}
                onChange={(e) => setPlannedDuration(e.target.value)}
                min="30"
                step="15"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px', display: 'block' }}>
                Pre-Op Clinical Instructions
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Fasting guidelines, reports required..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Confirm Admission
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
