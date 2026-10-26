import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  UserCheck,
  UserPlus,
  X,
  ShieldAlert,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { PatientService, TokenManager } from '../../services/api';
import { useHospitalState } from '../../context/HospitalStateContext';
import { formatDateIN } from '../../utils/formatters';

export const PatientsView = () => {
  const { patients: contextPatients, updatePatients } = useHospitalState();
  const [livePatients, setLivePatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMockData, setIsMockData] = useState(!TokenManager.getToken());
  const [highlightedPatientId, setHighlightedPatientId] = useState(null);

  // Edit Patient State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editApiError, setEditApiError] = useState(null);

  // Age calculation helper
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? `${age} Yrs` : '';
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setEditApiError(null);
    setEditFormData({
      fullName: patient.full_name || '',
      dob: patient.date_of_birth ? String(patient.date_of_birth).slice(0, 10) : '',
      gender: patient.gender || 'female',
      bloodGroup: patient.blood_group || 'B',
      rhFactor: patient.rh_factor || 'positive',
      mobile: patient.mobile || '',
      altMobile: patient.alt_mobile || '',
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || '',
      district: patient.district || '',
      state: patient.state || '',
      pinCode: patient.pin_code || '',
      emergencyName: patient.emergency_name || '',
      emergencyRelationship: patient.emergency_relationship || 'Spouse',
      emergencyPhone: patient.emergency_phone || '',
      allergies: patient.allergies || '',
      highRisk: Boolean(patient.high_risk)
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    setEditApiError(null);

    const trimmedName = (editFormData.fullName || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      setEditApiError('Patient full name is required (minimum 2 characters).');
      return;
    }

    let cleanMobile = (editFormData.mobile || '').replace(/[\s\-()]/g, '');
    if (cleanMobile.startsWith('+91')) cleanMobile = cleanMobile.slice(3);
    else if (cleanMobile.startsWith('0') && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setEditApiError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const payload = {
      full_name: trimmedName,
      date_of_birth: editFormData.dob || null,
      gender: editFormData.gender,
      blood_group: editFormData.bloodGroup,
      rh_factor: editFormData.rhFactor,
      mobile: cleanMobile,
      alt_mobile: editFormData.altMobile ? editFormData.altMobile.trim() : null,
      email: editFormData.email ? editFormData.email.trim() : null,
      address: editFormData.address ? editFormData.address.trim() : null,
      city: editFormData.city ? editFormData.city.trim() : null,
      district: editFormData.district ? editFormData.district.trim() : null,
      state: editFormData.state ? editFormData.state.trim() : null,
      pin_code: editFormData.pinCode ? editFormData.pinCode.trim() : null,
      emergency_name: editFormData.emergencyName ? editFormData.emergencyName.trim() : null,
      emergency_relationship: editFormData.emergencyRelationship || null,
      emergency_phone: editFormData.emergencyPhone ? editFormData.emergencyPhone.trim() : null,
      allergies: editFormData.allergies ? editFormData.allergies.trim() : null,
      high_risk: Boolean(editFormData.highRisk)
    };

    setIsEditSubmitting(true);
    try {
      if (TokenManager.getToken()) {
        const res = await PatientService.updatePatient(editingPatient.id, payload);
        const updated = res?.data || res;
        setLivePatients((prev) =>
          prev.map((p) => (p.id === editingPatient.id ? { ...p, ...payload, ...updated } : p))
        );
      } else {
        updatePatients((prev) =>
          (Array.isArray(prev) ? prev : []).map((p) =>
            p.id === editingPatient.id ? { ...p, ...payload } : p
          )
        );
      }
      setIsEditModalOpen(false);
      setEditingPatient(null);
      setToastMessage(`Patient record updated successfully: ${trimmedName} (${editingPatient.uhid})`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('[PatientsView] Update patient error:', err);
      setEditApiError(err.message || 'Failed to update patient demographic record.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Success and Toast Notification State
  const [successNotification, setSuccessNotification] = useState(null);
  const [copiedUhid, setCopiedUhid] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const initialFormState = {
    fullName: '',
    dob: '',
    gender: 'female',
    mobile: '',
    bloodGroup: 'B',
    rhFactor: 'positive',
    emergencyName: '',
    emergencyPhone: '',
    address: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Track acknowledged duplicate values to invalidate stale acknowledgments when fields change
  const [confirmedPhoneForFamily, setConfirmedPhoneForFamily] = useState(null);
  const [confirmedIdentityForNameDob, setConfirmedIdentityForNameDob] = useState(null);

  // Determine active patient data source: Live backend vs. Persisted Demo Context
  const isLive = Boolean(TokenManager.getToken());
  const activePatients = isLive ? livePatients : (contextPatients || []);

  useEffect(() => {
    let isMounted = true;
    async function fetchPatients() {
      if (TokenManager.getToken()) {
        try {
          const res = await PatientService.getPatients();
          if (isMounted && res) {
            setLivePatients(res.data || []);
            setIsMockData(Boolean(res.isMock));
          }
        } catch (err) {
          console.warn('[PatientsView] Live patient fetch failed:', err.message);
          if (isMounted) {
            setIsMockData(true);
          }
        }
      } else {
        if (isMounted) {
          setIsMockData(true);
        }
      }
    }
    fetchPatients();
    return () => {
      isMounted = false;
    };
  }, [isLive]);

  // Client-side input validation
  const validateForm = (data) => {
    const errors = {};
    const trimmedName = (data.fullName || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = 'Patient full name is required (minimum 2 characters).';
    } else if (trimmedName.length > 150) {
      errors.fullName = `Full name cannot exceed 150 characters (current: ${trimmedName.length}).`;
    }

    // Sanitize mobile: allow spaces, hyphens, and optional +91 or leading 0
    let cleanMobile = (data.mobile || '').replace(/[\s\-()]/g, '');
    if (cleanMobile.startsWith('+91')) {
      cleanMobile = cleanMobile.slice(3);
    } else if (cleanMobile.startsWith('0') && cleanMobile.length === 11) {
      cleanMobile = cleanMobile.slice(1);
    }

    if (!cleanMobile) {
      errors.mobile = 'Mobile contact number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number (e.g. 9830122410 or +91 98301 22410).';
    }

    if (data.dob) {
      const d = new Date(data.dob);
      if (isNaN(d.getTime())) {
        errors.dob = 'Please enter a valid date of birth.';
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (d > today) {
          errors.dob = 'Date of birth cannot be in the future.';
        } else if (d < new Date('1900-01-01')) {
          errors.dob = 'Date of birth is outside plausible clinical range (within last 125 years).';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      normalizedMobile: cleanMobile
    };
  };

  // Real-time Duplicate Detection against active patient directory
  const { matchedByPhone, matchedByNameDob, cleanMobile, cleanName, cleanDob } = useMemo(() => {
    let rawMobile = (formData.mobile || '').replace(/[\s\-()]/g, '');
    if (rawMobile.startsWith('+91')) rawMobile = rawMobile.slice(3);
    else if (rawMobile.startsWith('0') && rawMobile.length === 11) rawMobile = rawMobile.slice(1);

    const name = (formData.fullName || '').trim().toLowerCase();
    const dob = formData.dob || '';

    let phoneMatches = [];
    if (rawMobile.length === 10) {
      phoneMatches = activePatients.filter((p) => {
        let pMobile = (p.mobile || '').replace(/[\s\-()]/g, '');
        if (pMobile.startsWith('+91')) pMobile = pMobile.slice(3);
        else if (pMobile.startsWith('0') && pMobile.length === 11) pMobile = pMobile.slice(1);
        return pMobile === rawMobile;
      });
    }

    let nameDobMatches = [];
    if (name.length >= 2 && dob) {
      nameDobMatches = activePatients.filter((p) => {
        const pName = (p.full_name || '').trim().toLowerCase();
        const pDob = p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '';
        return pName === name && pDob === dob;
      });
    }

    return {
      matchedByPhone: phoneMatches,
      matchedByNameDob: nameDobMatches,
      cleanMobile: rawMobile,
      cleanName: name,
      cleanDob: dob
    };
  }, [formData.mobile, formData.fullName, formData.dob, activePatients]);

  // Duplicate acknowledgment states
  const hasPhoneDuplicate = matchedByPhone.length > 0 && matchedByNameDob.length === 0;
  const isFamilyAcknowledged = hasPhoneDuplicate && confirmedPhoneForFamily === cleanMobile && cleanMobile.length === 10;

  const hasNameDobDuplicate = matchedByNameDob.length > 0;
  const isNameDobAcknowledged = hasNameDobDuplicate && confirmedIdentityForNameDob === `${cleanName}|${cleanDob}` && cleanName.length >= 2 && Boolean(cleanDob);

  // Both UI button and submit handler check this identical condition
  const isBlockedByDuplicate = (hasPhoneDuplicate && !isFamilyAcknowledged) || (hasNameDobDuplicate && !isNameDobAcknowledged);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setApiError(null);
    setConfirmedPhoneForFamily(null);
    setConfirmedIdentityForNameDob(null);
  };

  const handleSelectExistingPatient = (existingPatient) => {
    setIsRegisterModalOpen(false);
    resetForm();
    setSearchTerm(existingPatient.uhid);
    setHighlightedPatientId(existingPatient.id);
    setToastMessage(`Selected existing patient: ${existingPatient.full_name} (${existingPatient.uhid})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const { isValid, errors, normalizedMobile } = validateForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    // Guard 1: Name + DOB duplicate must be explicitly confirmed
    if (hasNameDobDuplicate && !isNameDobAcknowledged) {
      setApiError('Please verify the matching patient record above before creating a new duplicate identity.');
      return;
    }

    // Guard 2: Mobile duplicate must be explicitly acknowledged as a separate family member
    if (hasPhoneDuplicate && !isFamilyAcknowledged) {
      setApiError('This mobile contact number is already registered to an existing patient. Please click "Register as Separate Family Member" to acknowledge, or select the existing patient record.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (TokenManager.getToken()) {
        // Authenticated live backend mode: POST /api/patients
        const payload = {
          full_name: formData.fullName.trim(),
          mobile: normalizedMobile,
          ...(formData.dob ? { date_of_birth: formData.dob } : {}),
          gender: formData.gender
        };

        const res = await PatientService.createPatient(payload);
        const createdPatient = res?.data || res;
        if (!createdPatient || !createdPatient.id) {
          throw new Error('Hospital server did not return a valid patient identifier.');
        }

        setLivePatients((prev) => [createdPatient, ...prev]);
        setSuccessNotification({
          uhid: createdPatient.uhid,
          name: createdPatient.full_name,
          id: createdPatient.id
        });
        setIsRegisterModalOpen(false);
        resetForm();
      } else {
        // Unauthenticated demo mode: Persist to HospitalStateContext (medicsprime_hms_demo_v1)
        const existingUhids = new Set(activePatients.map((p) => p.uhid));
        let demoUhid = '';
        do {
          const rand = Math.floor(1000 + Math.random() * 9000);
          demoUhid = `UHID-${new Date().getFullYear()}-${rand}`;
        } while (existingUhids.has(demoUhid));

        const maxIdNum = activePatients.reduce((max, p) => {
          const match = String(p.id).match(/^p-(\d+)$/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        const nextId = `p-${String(Math.max(maxIdNum + 1, 14)).padStart(3, '0')}`;

        const newPatient = {
          id: nextId,
          uhid: demoUhid,
          full_name: formData.fullName.trim(),
          date_of_birth: formData.dob || null,
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          rh_factor: formData.rhFactor,
          mobile: normalizedMobile,
          alt_mobile: '',
          email: '',
          address: formData.address.trim(),
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          pin_code: '700001',
          emergency_name: formData.emergencyName.trim(),
          emergency_relationship: '',
          emergency_phone: formData.emergencyPhone.trim(),
          allergies: 'None recorded',
          high_risk: false,
          created_at: new Date().toISOString()
        };

        updatePatients((prev) => [newPatient, ...(Array.isArray(prev) ? prev : [])]);
        setSuccessNotification({
          uhid: newPatient.uhid,
          name: newPatient.full_name,
          id: newPatient.id
        });
        setIsRegisterModalOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error('[PatientsView] Registration error:', err);
      setApiError(err.message || 'Failed to complete patient registration. Please check server connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUhid = (uhid) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(uhid).then(() => {
        setCopiedUhid(true);
        setTimeout(() => setCopiedUhid(false), 2500);
      });
    }
  };

  // Filter patients for display
  const filteredPatients = activePatients.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uhid && p.uhid.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q));
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#166534',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="#16a34a" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {successNotification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={24} color="#16A34A" />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', color: '#14532D' }}>
                Patient Successfully Registered
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: '#166534', marginTop: '2px' }}>
                Permanent Electronic Health Record established for <strong>{successNotification.name}</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                fontWeight: '700',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-primary-teal)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #BBF7D0'
              }}
            >
              {successNotification.uhid}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={copiedUhid ? Check : Copy}
              onClick={() => handleCopyUhid(successNotification.uhid)}
            >
              {copiedUhid ? 'Copied' : 'Copy UHID'}
            </Button>
            <button
              onClick={() => setSuccessNotification(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4B5563',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
              Patients Master Directory
            </h1>
            {isMockData ? (
              <Badge variant="teal" size="sm">Demo Persisted (v1)</Badge>
            ) : (
              <Badge variant="success" size="sm">PostgreSQL Live</Badge>
            )}
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: 0 }}>
            Permanent electronic health records indexed by unique Hospital Identification Number (UHID).
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            resetForm();
            setIsRegisterModalOpen(true);
          }}
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

          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          )}

          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            Showing {filteredPatients.length} of {activePatients.length} records
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
                <th style={{ padding: '10px 14px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                    No registered patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const isHighlighted = p.id === highlightedPatientId;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        fontSize: 'var(--font-size-sm)',
                        backgroundColor: isHighlighted ? 'rgba(8, 127, 140, 0.08)' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                        {p.uhid}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{p.full_name}</div>
                        {p.address && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {p.address}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                        {p.gender || 'Not specified'} • {p.date_of_birth ? formatDateIN(p.date_of_birth) : 'DOB not provided'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {p.blood_group ? (
                          <Badge variant={p.rh_factor === 'positive' ? 'teal' : 'blood'}>
                            {p.blood_group} {p.rh_factor === 'positive' ? '+' : '-'}
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Pending Lab</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--color-text-muted)" />
                          {p.mobile}
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {p.created_at ? formatDateIN(p.created_at) : '-'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit3}
                          onClick={() => handleOpenEditModal(p)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsRegisterModalOpen(false);
            resetForm();
          }
        }}
        title="Register New Patient"
        subtitle="Generates permanent UHID and establishes clinical demographic record"
        maxWidth="640px"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Server / Validation Alert Banner */}
          {apiError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{apiError}</div>
            </div>
          )}

          {/* DUPLICATE WARNING 1: Name + DOB Match (Strong Identity Warning) */}
          {matchedByNameDob.length > 0 && (
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: '700', fontSize: 'var(--font-size-sm)' }}>
                <ShieldAlert size={18} color="#d97706" />
                <span>Potential Identity Match Detected</span>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#78350F', lineHeight: '1.45' }}>
                An existing patient record matches both the full name and date of birth:
                <strong> {matchedByNameDob[0].full_name}</strong> ({matchedByNameDob[0].uhid}, born {formatDateIN(matchedByNameDob[0].date_of_birth)}).
                While a shared name and birth date strongly suggests an existing registration, it is not definitive identity proof.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={UserCheck}
                  type="button"
                  onClick={() => handleSelectExistingPatient(matchedByNameDob[0])}
                >
                  Use Existing Patient Record ({matchedByNameDob[0].uhid})
                </Button>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: '#92400E', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isNameDobAcknowledged}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfirmedIdentityForNameDob(`${cleanName}|${cleanDob}`);
                        if (apiError) setApiError(null);
                      } else {
                        setConfirmedIdentityForNameDob(null);
                      }
                    }}
                  />
                  <span>Confirm as different person & proceed</span>
                </label>
              </div>
            </div>
          )}

          {/* DUPLICATE WARNING 2: Phone Match (Soft Household Warning) */}
          {hasPhoneDuplicate && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #93C5FD',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: '700', fontSize: 'var(--font-size-sm)' }}>
                <Phone size={16} color="#2563eb" />
                <span>Shared Household Contact Number</span>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#1E3A8A', lineHeight: '1.45' }}>
                This mobile number is already associated with <strong>{matchedByPhone.length} registered patient(s)</strong>:{' '}
                {matchedByPhone.map((p) => `${p.full_name} (${p.uhid})`).join(', ')}.
                Family members and dependents frequently share a primary contact number.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={UserCheck}
                  type="button"
                  onClick={() => handleSelectExistingPatient(matchedByPhone[0])}
                >
                  Select Existing Patient ({matchedByPhone[0].uhid})
                </Button>

                <Button
                  variant={isFamilyAcknowledged ? 'soft' : 'outline'}
                  size="sm"
                  icon={isFamilyAcknowledged ? Check : UserPlus}
                  type="button"
                  onClick={() => {
                    setConfirmedPhoneForFamily(cleanMobile);
                    if (apiError) setApiError(null);
                  }}
                >
                  {isFamilyAcknowledged ? 'Family Member Acknowledged' : 'Register as Separate Family Member'}
                </Button>
              </div>
            </div>
          )}

          {/* Patient Demographic Form Fields */}
          <Input
            label="Patient Full Name"
            required
            placeholder="e.g. Ananya Deshmukh"
            value={formData.fullName}
            error={formErrors.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value });
              if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: null });
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Date of Birth
                </label>
                {formData.dob && calculateAge(formData.dob) && (
                  <Badge variant="teal" size="sm">Age: {calculateAge(formData.dob)}</Badge>
                )}
              </div>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => {
                  setFormData({ ...formData, dob: e.target.value });
                  if (formErrors.dob) setFormErrors({ ...formErrors, dob: null });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: formErrors.dob ? '1.5px solid var(--color-error)' : '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              {formErrors.dob && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                  {formErrors.dob}
                </div>
              )}
            </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
            <Input
              label="Primary Mobile Number"
              required
              placeholder="+91 98765 43210"
              value={formData.mobile}
              error={formErrors.mobile}
              helperText="10-digit primary contact"
              onChange={(e) => {
                setFormData({ ...formData, mobile: e.target.value });
                if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: null });
              }}
            />

            <Input
              label="Alternate Mobile (Optional)"
              placeholder="e.g. 9831099887"
              value={formData.altMobile}
              helperText="Secondary contact"
              onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            helperText="For digital consultation receipts and investigation lab reports"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
            <Input
              label="Emergency Contact Name"
              placeholder="e.g. Rahul Deshmukh"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />

            <Select
              label="Relationship"
              value={formData.emergencyRelationship}
              onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              options={[
                { value: 'Spouse', label: 'Spouse' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Child', label: 'Child / Dependent' },
                { value: 'Sibling', label: 'Sibling' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            <Input
              label="Emergency Phone"
              placeholder="e.g. 9831044521"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
            <Input
              label="Known Drug Allergies / Alerts"
              placeholder="e.g. Penicillin, Sulfa drugs, None"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />

            <div style={{ paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input
                  type="checkbox"
                  checked={formData.highRisk}
                  onChange={(e) => setFormData({ ...formData, highRisk: e.target.checked })}
                />
                <span style={{ fontWeight: '600', color: formData.highRisk ? '#DC2626' : 'var(--color-text-primary)' }}>
                  Mark as High Risk
                </span>
              </label>
            </div>
          </div>

          <Input
            label="Residential Address"
            placeholder="Flat / House, Street, Area / Locality"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => {
                setIsRegisterModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || isBlockedByDuplicate}
              icon={UserPlus}
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!isEditSubmitting) {
            setIsEditModalOpen(false);
            setEditingPatient(null);
          }
        }}
        title="Edit Patient Demographic Details"
        subtitle={editingPatient ? `Updating record for ${editingPatient.full_name} (${editingPatient.uhid})` : 'Update Patient'}
        maxWidth="680px"
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {editApiError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>{editApiError}</div>
            </div>
          )}

          <Input
            label="Patient Full Name"
            required
            value={editFormData.fullName || ''}
            onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Date of Birth
                </label>
                {editFormData.dob && calculateAge(editFormData.dob) && (
                  <Badge variant="teal" size="sm">Age: {calculateAge(editFormData.dob)}</Badge>
                )}
              </div>
              <input
                type="date"
                value={editFormData.dob || ''}
                onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <Select
              label="Gender"
              required
              value={editFormData.gender || 'female'}
              onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
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
              value={editFormData.bloodGroup || 'B'}
              onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
              options={['A', 'B', 'AB', 'O']}
            />

            <Select
              label="Rh Factor"
              value={editFormData.rhFactor || 'positive'}
              onChange={(e) => setEditFormData({ ...editFormData, rhFactor: e.target.value })}
              options={[
                { value: 'positive', label: 'Rh Positive (+)' },
                { value: 'negative', label: 'Rh Negative (-)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Primary Mobile Number"
              required
              value={editFormData.mobile || ''}
              onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
            />

            <Input
              label="Alternate Mobile"
              value={editFormData.altMobile || ''}
              onChange={(e) => setEditFormData({ ...editFormData, altMobile: e.target.value })}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={editFormData.email || ''}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
          />

          <Input
            label="Residential Address"
            value={editFormData.address || ''}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="City"
              value={editFormData.city || ''}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
            />
            <Input
              label="District"
              value={editFormData.district || ''}
              onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
            />
            <Input
              label="State"
              value={editFormData.state || ''}
              onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={editFormData.pinCode || ''}
              onChange={(e) => setEditFormData({ ...editFormData, pinCode: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Emergency Contact Name"
              value={editFormData.emergencyName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyName: e.target.value })}
            />

            <Select
              label="Relationship"
              value={editFormData.emergencyRelationship || 'Spouse'}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyRelationship: e.target.value })}
              options={[
                { value: 'Spouse', label: 'Spouse' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Child', label: 'Child / Dependent' },
                { value: 'Sibling', label: 'Sibling' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            <Input
              label="Emergency Phone"
              value={editFormData.emergencyPhone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
            <Input
              label="Known Allergies"
              value={editFormData.allergies || ''}
              onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
            />

            <div style={{ paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editFormData.highRisk)}
                  onChange={(e) => setEditFormData({ ...editFormData, highRisk: e.target.checked })}
                />
                <span style={{ fontWeight: '600', color: editFormData.highRisk ? '#DC2626' : 'var(--color-text-primary)' }}>
                  Mark as High Risk
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              variant="ghost"
              disabled={isEditSubmitting}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPatient(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              loading={isEditSubmitting}
              icon={Check}
            >
              {isEditSubmitting ? 'Saving...' : 'Save Patient Changes'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
