import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Save
} from 'lucide-react';
import { Card, Button, Input, Select, Modal } from '../../common/UIPrimitives';
import {
  BLOOD_GROUPS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  DEMOGRAPHIC_CHANGE_REASONS,
  calculateAge,
  estimateDobFromAge,
  normalizePhone
} from '../patientConstants';
import { PatientService, TokenManager } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export function DemographicUpdatesDesk({
  patients = [],
  onPatientUpdated
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(patients[0] || null);
  const [changeReason, setChangeReason] = useState(DEMOGRAPHIC_CHANGE_REASONS[0]);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    ageInput: '',
    gender: 'female',
    bloodGroup: 'Unknown',
    maritalStatus: 'Single',
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    allergies: '',
    highRisk: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Synchronize form when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      const dobStr = selectedPatient.date_of_birth ? String(selectedPatient.date_of_birth).slice(0, 10) : '';
      setFormData({
        fullName: selectedPatient.full_name || '',
        dob: dobStr,
        ageInput: dobStr ? (calculateAge(dobStr).replace(/\D/g, '') || '') : '',
        gender: selectedPatient.gender || 'female',
        bloodGroup: selectedPatient.blood_group || 'Unknown',
        maritalStatus: selectedPatient.marital_status || 'Single',
        mobile: selectedPatient.mobile || '',
        altMobile: selectedPatient.alt_mobile || '',
        email: selectedPatient.email || '',
        address: selectedPatient.address || '',
        city: selectedPatient.city || '',
        district: selectedPatient.district || '',
        state: selectedPatient.state || '',
        pinCode: selectedPatient.pin_code || '',
        emergencyName: selectedPatient.emergency_name || '',
        emergencyRelationship: selectedPatient.emergency_relationship || 'Spouse',
        emergencyPhone: selectedPatient.emergency_phone || '',
        allergies: selectedPatient.allergies || '',
        highRisk: Boolean(selectedPatient.high_risk)
      });
      setErrorMessage(null);
      setSuccessToast(null);
    }
  }, [selectedPatient]);

  // Search options
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p =>
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uhid && p.uhid.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q))
    ).slice(0, 10);
  }, [patients, searchQuery]);

  // Handle DOB change -> calculate age
  const handleDobChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      dob: val,
      ageInput: val ? (calculateAge(val).replace(/\D/g, '') || '') : ''
    }));
  };

  // Handle Age change -> calculate DOB
  const handleAgeChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      ageInput: val,
      dob: val ? estimateDobFromAge(val) : prev.dob
    }));
  };

  // Detect modified fields for audit comparison
  const changedFields = useMemo(() => {
    if (!selectedPatient) return [];
    const diffs = [];

    if (formData.fullName.trim() !== (selectedPatient.full_name || '').trim()) {
      diffs.push({ label: 'Legal Full Name', original: selectedPatient.full_name, updated: formData.fullName.trim() });
    }
    const origDob = selectedPatient.date_of_birth ? String(selectedPatient.date_of_birth).slice(0, 10) : '';
    if (formData.dob !== origDob) {
      diffs.push({ label: 'Date of Birth', original: origDob || '—', updated: formData.dob || '—' });
    }
    if (formData.gender !== (selectedPatient.gender || 'female')) {
      diffs.push({ label: 'Sex / Gender', original: selectedPatient.gender || '—', updated: formData.gender });
    }
    const origMobile = normalizePhone(selectedPatient.mobile);
    const newMobile = normalizePhone(formData.mobile);
    if (newMobile !== origMobile) {
      diffs.push({ label: 'Primary Mobile', original: origMobile || '—', updated: newMobile || '—' });
    }
    if ((formData.bloodGroup || 'Unknown') !== (selectedPatient.blood_group || 'Unknown')) {
      diffs.push({ label: 'Blood Group', original: selectedPatient.blood_group || 'Unknown', updated: formData.bloodGroup });
    }
    if (formData.address.trim() !== (selectedPatient.address || '').trim()) {
      diffs.push({ label: 'Address', original: selectedPatient.address || '—', updated: formData.address.trim() });
    }
    if (formData.city.trim() !== (selectedPatient.city || '').trim()) {
      diffs.push({ label: 'City', original: selectedPatient.city || '—', updated: formData.city.trim() });
    }
    if (formData.emergencyPhone.trim() !== (selectedPatient.emergency_phone || '').trim()) {
      diffs.push({ label: 'Emergency Contact Phone', original: selectedPatient.emergency_phone || '—', updated: formData.emergencyPhone.trim() });
    }

    return diffs;
  }, [formData, selectedPatient]);

  const handleInitiateSave = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage('Patient full legal name is required (minimum 2 characters).');
      return;
    }
    const norm = normalizePhone(formData.mobile);
    if (!norm || norm.length !== 10) {
      setErrorMessage('A valid 10-digit primary mobile number is mandatory.');
      return;
    }
    if (changedFields.length === 0) {
      setErrorMessage('No demographic fields were modified.');
      return;
    }

    setErrorMessage(null);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteSave = async () => {
    setIsConfirmModalOpen(false);
    setSubmitting(true);
    setErrorMessage(null);

    const normMobile = normalizePhone(formData.mobile);
    const updatedRecord = {
      ...selectedPatient,
      full_name: formData.fullName.trim(),
      date_of_birth: formData.dob || null,
      gender: formData.gender,
      blood_group: formData.bloodGroup === 'Unknown' ? null : formData.bloodGroup,
      marital_status: formData.maritalStatus,
      mobile: normMobile,
      alt_mobile: formData.altMobile ? normalizePhone(formData.altMobile) : null,
      email: formData.email ? formData.email.trim() : null,
      address: formData.address ? formData.address.trim() : null,
      city: formData.city ? formData.city.trim() : null,
      district: formData.district ? formData.district.trim() : null,
      state: formData.state ? formData.state.trim() : null,
      pin_code: formData.pinCode ? formData.pinCode.trim() : null,
      emergency_name: formData.emergencyName ? formData.emergencyName.trim() : null,
      emergency_relationship: formData.emergencyRelationship,
      emergency_phone: formData.emergencyPhone ? normalizePhone(formData.emergencyPhone) : null,
      allergies: formData.allergies ? formData.allergies.trim() : null,
      high_risk: formData.highRisk,
      last_updated_at: new Date().toISOString(),
      last_updated_by: user?.name || user?.username || 'Staff Receptionist'
    };

    try {
      if (TokenManager.getToken()) {
        await PatientService.updatePatient(selectedPatient.id, updatedRecord);
      }

      if (onPatientUpdated) {
        onPatientUpdated(updatedRecord);
      }

      setSelectedPatient(updatedRecord);
      setSuccessToast(`Demographic parameters updated successfully for ${updatedRecord.full_name} (${updatedRecord.uhid}).`);
    } catch (err) {
      console.error('[DemographicUpdatesDesk] Update failed:', err);
      setErrorMessage(err.message || 'Failed to update patient demographic parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Alert */}
      {successToast && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#166534',
            fontSize: '0.84rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#16A34A" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: '700' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#991B1B',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} color="#DC2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Lookup Header */}
      <Card
        title="24.5 Demographic & Identity Updates Desk"
        subtitle="Search and select patient to correct personal details, contact coordinates, and identity parameters"
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search patient by UHID, Full Name, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Quick Patient Select Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {filteredPatients.map(p => {
            const isSel = selectedPatient?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPatient(p);
                  setSearchQuery(p.uhid);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSel ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSel ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.full_name} ({p.uhid})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Editable Form & Audit Comparison Grid */}
      {selectedPatient && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Left Column: Editable Fields */}
          <Card
            title={`Edit Demographics — ${selectedPatient.full_name}`}
            subtitle={`Permanent UHID: ${selectedPatient.uhid} • Registered: ${selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : 'Active Record'}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Input
                  label="Legal Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={handleDobChange}
                />

                <Input
                  label="Age (Years)"
                  type="number"
                  value={formData.ageInput}
                  onChange={handleAgeChange}
                />

                <Select
                  label="Sex / Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  options={GENDER_OPTIONS}
                />

                <Select
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                />

                <Select
                  label="Marital Status"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  options={MARITAL_STATUS_OPTIONS.map(ms => ({ value: ms, label: ms }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Input
                  label="Primary Mobile *"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  required
                />

                <Input
                  label="Alternate Mobile"
                  value={formData.altMobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, altMobile: e.target.value }))}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />

                <Input
                  label="Street Address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />

                <Input
                  label="City / Town"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />

                <Input
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyName: e.target.value }))}
                />

                <Input
                  label="Emergency Phone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                />
              </div>

              <Select
                label="Mandatory Reason for Demographic Revision *"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                options={DEMOGRAPHIC_CHANGE_REASONS.map(r => ({ value: r, label: r }))}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button
                  variant="primary"
                  icon={Save}
                  loading={submitting}
                  disabled={changedFields.length === 0}
                  onClick={handleInitiateSave}
                >
                  Save Demographic Corrections
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Column: Live Audit Diff Inspector */}
          <Card
            title="Real-Time Audit Inspector"
            subtitle="Comparing existing permanent EHR values with proposed modifications"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Modifying Officer:</span>
                <strong>{user?.name || user?.username || 'Staff Receptionist'}</strong>
              </div>

              {changedFields.length === 0 ? (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <UserCheck size={28} color="var(--color-text-muted)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div>No fields modified yet. Edit values on the left to inspect the audit comparison.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    {changedFields.length} Field(s) Pending Correction:
                  </div>

                  {changedFields.map((field, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ fontWeight: '700', color: '#92400E', fontSize: '0.80rem' }}>
                        {field.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                        <span style={{ color: '#DC2626', textDecoration: 'line-through' }}>{field.original}</span>
                        <span>→</span>
                        <span style={{ color: '#16A34A', fontWeight: '700' }}>{field.updated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Patient Record Identity Update"
          subtitle={`UHID: ${selectedPatient?.uhid} • ${changedFields.length} modified parameter(s)`}
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE' }}>
              <strong>Reason for Update:</strong> {changeReason}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              Identity updates are logged in the patient electronic health audit ledger. Are you sure you wish to apply these corrections?
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
              <Button variant="primary" icon={Save} onClick={handleExecuteSave}>
                Confirm & Update EHR
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
