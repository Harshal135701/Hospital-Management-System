import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  RotateCcw,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../common/UIPrimitives';
import {
  BLOOD_GROUPS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  GOV_ID_TYPES,
  calculateAge,
  estimateDobFromAge,
  normalizePhone
} from '../patientConstants';
import { PatientService, TokenManager } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export function NewRegistrationDesk({
  patients = [],
  onPatientCreated,
  onNavigateSubtab,
  onSelectExistingPatient
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Form Fields State
  const initialFormState = {
    fullName: '',
    dob: '',
    ageInput: '',
    gender: 'female',
    bloodGroup: 'Unknown',
    maritalStatus: 'Single',
    // Contact
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pinCode: '',
    country: 'India',
    // Identity & Admin
    existingUhid: '',
    govIdType: 'Aadhaar Card (UIDAI)',
    govIdNumber: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    guardianName: '',
    guardianRelationship: 'Father',
    // Flags
    allergies: '',
    highRisk: false,
    allowSharedMobile: false
  };

  const [form, setForm] = useState(initialFormState);

  // Handle DOB change -> update ageInput
  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    setForm(prev => ({
      ...prev,
      dob: dobVal,
      ageInput: dobVal ? (calculateAge(dobVal).replace(/\D/g, '') || '') : ''
    }));
  };

  // Handle Age change -> estimate DOB
  const handleAgeChange = (e) => {
    const ageVal = e.target.value;
    setForm(prev => ({
      ...prev,
      ageInput: ageVal,
      dob: ageVal ? estimateDobFromAge(ageVal) : prev.dob
    }));
  };

  // Live duplicate detection
  const detectedDuplicate = useMemo(() => {
    const norm = normalizePhone(form.mobile);
    const trimmedName = form.fullName.trim().toLowerCase();
    const dob = form.dob;

    if (!norm && !trimmedName) return null;

    for (const p of patients) {
      const pNorm = normalizePhone(p.mobile);
      const pName = (p.full_name || '').trim().toLowerCase();
      const pDob = p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '';

      // Exact match: mobile + name
      if (norm && norm.length === 10 && norm === pNorm && trimmedName && trimmedName === pName) {
        return { type: 'EXACT_MATCH', patient: p, message: `Exact patient identity match found: ${p.full_name} (${p.uhid}).` };
      }

      // Strong match: name + date of birth
      if (trimmedName && trimmedName.length >= 4 && trimmedName === pName && dob && dob === pDob) {
        return { type: 'DOB_MATCH', patient: p, message: `Patient with matching Name and Date of Birth is already registered under ${p.uhid}.` };
      }

      // Shared mobile match: same 10-digit phone
      if (norm && norm.length === 10 && norm === pNorm) {
        return { type: 'SHARED_MOBILE', patient: p, message: `Mobile ${norm} is registered to existing patient: ${p.full_name} (${p.uhid}). If this is a family member, please check the family consent box below.` };
      }
    }
    return null;
  }, [form.mobile, form.fullName, form.dob, patients]);

  const validateForm = () => {
    if (!form.fullName || form.fullName.trim().length < 2) {
      setFormError('Patient full legal name is required (minimum 2 characters).');
      return false;
    }
    const normMobile = normalizePhone(form.mobile);
    if (!normMobile || normMobile.length !== 10) {
      setFormError('A valid 10-digit primary mobile number is mandatory.');
      return false;
    }
    if (detectedDuplicate?.type === 'EXACT_MATCH') {
      setFormError(`Cannot register duplicate record. Patient is already registered under UHID ${detectedDuplicate.patient.uhid}.`);
      return false;
    }
    if (detectedDuplicate?.type === 'SHARED_MOBILE' && !form.allowSharedMobile) {
      setFormError('This mobile number belongs to an existing patient record. Please check "Confirm as separate family member" to proceed.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleRegister = async (createVisitAfter = false) => {
    if (!validateForm()) return;
    setSubmitting(true);
    setFormError(null);

    const normMobile = normalizePhone(form.mobile);
    const payload = {
      full_name: form.fullName.trim(),
      date_of_birth: form.dob || null,
      gender: form.gender,
      blood_group: form.bloodGroup === 'Unknown' ? null : form.bloodGroup,
      marital_status: form.maritalStatus,
      mobile: normMobile,
      alt_mobile: form.altMobile ? normalizePhone(form.altMobile) : null,
      email: form.email ? form.email.trim() : null,
      address: form.address ? form.address.trim() : null,
      city: form.city ? form.city.trim() : null,
      district: form.district ? form.district.trim() : null,
      state: form.state ? form.state.trim() : null,
      pin_code: form.pinCode ? form.pinCode.trim() : null,
      country: form.country || 'India',
      uhid: form.existingUhid ? form.existingUhid.trim() : undefined,
      gov_id_type: form.govIdType,
      gov_id_number: form.govIdNumber ? form.govIdNumber.trim() : null,
      emergency_name: form.emergencyName ? form.emergencyName.trim() : null,
      emergency_relationship: form.emergencyRelationship,
      emergency_phone: form.emergencyPhone ? normalizePhone(form.emergencyPhone) : null,
      guardian_name: form.guardianName ? form.guardianName.trim() : null,
      guardian_relationship: form.guardianRelationship,
      allergies: form.allergies ? form.allergies.trim() : null,
      high_risk: form.highRisk,
      allow_shared_mobile: form.allowSharedMobile
    };

    try {
      let createdPatient = null;
      if (TokenManager.getToken()) {
        const res = await PatientService.createPatient(payload);
        createdPatient = res?.data || res;
      } else {
        // Safe local UHID generation
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const assignedUhid = form.existingUhid || `UHID-${year}-${rand}`;
        createdPatient = {
          id: `p-${Date.now()}`,
          uhid: assignedUhid,
          ...payload,
          created_at: new Date().toISOString()
        };
      }

      if (onPatientCreated) {
        onPatientCreated(createdPatient);
      }

      setSuccessInfo({
        patient: createdPatient,
        uhid: createdPatient.uhid,
        name: createdPatient.full_name
      });

      if (createVisitAfter && onNavigateSubtab) {
        setTimeout(() => {
          onNavigateSubtab('24.3', { selectedPatient: createdPatient });
        }, 300);
      } else {
        setForm(initialFormState);
      }
    } catch (err) {
      console.error('[RegistrationDesk] Create patient failed:', err);
      setFormError(err.message || 'Failed to register patient record. Please verify fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialFormState);
    setFormError(null);
    setSuccessInfo(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Success Notification Banner */}
      {successInfo && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="#16A34A" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#14532D' }}>
                Patient Successfully Registered
              </div>
              <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
                Permanent Electronic Health Record established for <strong>{successInfo.name}</strong> with UHID: <strong style={{ fontFamily: 'monospace' }}>{successInfo.uhid}</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => onNavigateSubtab && onNavigateSubtab('24.2', { patientUhid: successInfo.uhid })}
            >
              Print Smart Card
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Calendar}
              onClick={() => onNavigateSubtab && onNavigateSubtab('24.3', { selectedPatient: successInfo.patient })}
            >
              Create New Visit
            </Button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {formError && (
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
          <span>{formError}</span>
        </div>
      )}

      {/* Live Duplicate Alert Banner */}
      {detectedDuplicate && (
        <div
          style={{
            backgroundColor: detectedDuplicate.type === 'EXACT_MATCH' ? '#FEF2F2' : '#FFFBEB',
            border: `1.5px solid ${detectedDuplicate.type === 'EXACT_MATCH' ? '#F87171' : '#FDE68A'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color={detectedDuplicate.type === 'EXACT_MATCH' ? '#DC2626' : '#D97706'} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: detectedDuplicate.type === 'EXACT_MATCH' ? '#991B1B' : '#92400E' }}>
                {detectedDuplicate.type === 'EXACT_MATCH' ? 'Duplicate Identity Detected' : 'Potential Match / Shared Mobile Found'}
              </div>
              <div style={{ fontSize: '0.78rem', color: detectedDuplicate.type === 'EXACT_MATCH' ? '#B91C1C' : '#B45309' }}>
                {detectedDuplicate.message}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={UserCheck}
            onClick={() => onSelectExistingPatient && onSelectExistingPatient(detectedDuplicate.patient)}
          >
            Open Existing Record ({detectedDuplicate.patient.uhid})
          </Button>
        </div>
      )}

      <Card
        title="24.1 New Patient Registration Desk"
        subtitle="Complete the clinical intake and identity verification to generate a unique permanent hospital UHID"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* SECTION A: Patient Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '14px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>A</span>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                Patient Legal Identity & Demographics
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <Input
                label="Full Legal Name *"
                placeholder="e.g. Ananya Mukherjee"
                value={form.fullName}
                onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />

              <Input
                label="Date of Birth (YYYY-MM-DD)"
                type="date"
                value={form.dob}
                onChange={handleDobChange}
              />

              <Input
                label="Age (Years)"
                type="number"
                placeholder="Auto-calculated or enter"
                value={form.ageInput}
                onChange={handleAgeChange}
              />

              <Select
                label="Sex / Gender *"
                value={form.gender}
                onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                options={GENDER_OPTIONS}
              />

              <Select
                label="Blood Group"
                value={form.bloodGroup}
                onChange={(e) => setForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
              />

              <Select
                label="Marital Status"
                value={form.maritalStatus}
                onChange={(e) => setForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
                options={MARITAL_STATUS_OPTIONS.map(ms => ({ value: ms, label: ms }))}
              />
            </div>
          </div>

          {/* SECTION B: Contact Information */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '14px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>B</span>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                Contact & Residential Address
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <Input
                  label="Primary Mobile Number *"
                  placeholder="10-digit mobile (e.g. 9830122410)"
                  value={form.mobile}
                  onChange={(e) => setForm(prev => ({ ...prev, mobile: e.target.value }))}
                  maxLength={15}
                  required
                />
                {detectedDuplicate?.type === 'SHARED_MOBILE' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.allowSharedMobile}
                      onChange={(e) => setForm(prev => ({ ...prev, allowSharedMobile: e.target.checked }))}
                    />
                    <span>Confirm as separate family member sharing this phone</span>
                  </label>
                )}
              </div>

              <Input
                label="Alternate Contact Number"
                placeholder="Optional secondary phone"
                value={form.altMobile}
                onChange={(e) => setForm(prev => ({ ...prev, altMobile: e.target.value }))}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. patient@example.com"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              />

              <Input
                label="Street Address / House No."
                placeholder="Flat / House / Lane / Locality"
                value={form.address}
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              />

              <Input
                label="City / Town"
                value={form.city}
                onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
              />

              <Input
                label="District"
                value={form.district}
                onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value }))}
              />

              <Input
                label="State"
                value={form.state}
                onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))}
              />

              <Input
                label="Postal PIN Code"
                placeholder="6-digit PIN code"
                value={form.pinCode}
                onChange={(e) => setForm(prev => ({ ...prev, pinCode: e.target.value }))}
                maxLength={8}
              />
            </div>
          </div>

          {/* SECTION C: Identity & Administrative Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '14px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary-teal)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>C</span>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                Government Identity, Emergency Contact & Attendants
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <Input
                label="Existing UHID (If re-registering)"
                placeholder="Leave blank for automatic generation"
                value={form.existingUhid}
                onChange={(e) => setForm(prev => ({ ...prev, existingUhid: e.target.value }))}
              />

              <Select
                label="Government Identity Document Type"
                value={form.govIdType}
                onChange={(e) => setForm(prev => ({ ...prev, govIdType: e.target.value }))}
                options={GOV_ID_TYPES.map(g => ({ value: g, label: g }))}
              />

              <Input
                label="Government ID / ABHA Number"
                placeholder="Enter document reference number"
                value={form.govIdNumber}
                onChange={(e) => setForm(prev => ({ ...prev, govIdNumber: e.target.value }))}
              />

              <Input
                label="Emergency Contact Name"
                placeholder="Primary relative / attendant"
                value={form.emergencyName}
                onChange={(e) => setForm(prev => ({ ...prev, emergencyName: e.target.value }))}
              />

              <Input
                label="Emergency Relationship"
                placeholder="e.g. Spouse / Father / Daughter"
                value={form.emergencyRelationship}
                onChange={(e) => setForm(prev => ({ ...prev, emergencyRelationship: e.target.value }))}
              />

              <Input
                label="Emergency Phone"
                placeholder="Emergency contact mobile"
                value={form.emergencyPhone}
                onChange={(e) => setForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
              />

              <Input
                label="Known Drug Allergies"
                placeholder="e.g. Penicillin, NSAIDs, Sulfa (or Nil)"
                value={form.allergies}
                onChange={(e) => setForm(prev => ({ ...prev, allergies: e.target.value }))}
              />

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: form.highRisk ? '#DC2626' : 'var(--color-text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={form.highRisk}
                    onChange={(e) => setForm(prev => ({ ...prev, highRisk: e.target.checked }))}
                  />
                  <span>Flag as High-Risk Patient (Cardiac / Dialysis / Polytrauma)</span>
                </label>
              </div>
            </div>

            {/* Staff Attribution Footer */}
            <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>Registering Officer: <strong>{user?.name || user?.username || 'Staff Receptionist (Super Admin)'}</strong></div>
              <div>Registration Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={submitting}
            >
              Reset Form
            </Button>

            <Button
              variant="primary"
              icon={UserPlus}
              loading={submitting}
              onClick={() => handleRegister(false)}
            >
              Save Patient Record
            </Button>

            <Button
              variant="teal"
              icon={ArrowRight}
              loading={submitting}
              onClick={() => handleRegister(true)}
            >
              Save & Create Visit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
