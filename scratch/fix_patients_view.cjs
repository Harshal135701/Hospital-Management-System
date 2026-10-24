const fs = require('fs');

let content = fs.readFileSync('client/src/components/patients/PatientsView.jsx', 'utf8');

// 1. Add Edit3 to imports
if (!content.includes('Edit3')) {
  content = content.replace(/ArrowRight\r?\n\}/, 'ArrowRight,\r\n  Edit3\r\n}');
}

// 2. Add Edit state declarations and calculateAge
const targetState = '  const [highlightedPatientId, setHighlightedPatientId] = useState(null);';
const addState = `  const [highlightedPatientId, setHighlightedPatientId] = useState(null);

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
    return age >= 0 ? \`\${age} Yrs\` : '';
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

    let cleanMobile = (editFormData.mobile || '').replace(/[\\s\\-()]/g, '');
    if (cleanMobile.startsWith('+91')) cleanMobile = cleanMobile.slice(3);
    else if (cleanMobile.startsWith('0') && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

    if (!cleanMobile || !/^[6-9]\\d{9}$/.test(cleanMobile)) {
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
      setToastMessage(\`Patient record updated successfully: \${trimmedName} (\${editingPatient.uhid})\`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('[PatientsView] Update patient error:', err);
      setEditApiError(err.message || 'Failed to update patient demographic record.');
    } finally {
      setIsEditSubmitting(false);
    }
  };`;

if (!content.includes('const [isEditModalOpen, setIsEditModalOpen]')) {
  content = content.replace(targetState, addState.replace(/\n/g, '\r\n'));
}

// 3. Add Actions column to table
if (!content.includes('>Actions</th>')) {
  content = content.replace(
    /<th style=\{\{ padding: '10px 14px', fontWeight: '600' \}\}>Registered On<\/th>/,
    `<th style={{ padding: '10px 14px', fontWeight: '600' }}>Registered On</th>\r\n                <th style={{ padding: '10px 14px', fontWeight: '600', textAlign: 'right' }}>Actions</th>`
  );

  // Empty row colspan 6 -> 7
  content = content.replace('colSpan={6}', 'colSpan={7}');

  // Add Edit button to row
  const rowPattern = /(<td style=\{\{ padding: '14px', color: 'var\(--color-text-muted\)', fontSize: 'var\(--font-size-xs\)' \}\}>\r?\n\s+\{p\.created_at \? formatDateIN\(p\.created_at\) : '-'\}(?:[\s\S]*?)<\/td>)/;
  content = content.replace(
    rowPattern,
    `$1\r\n                      <td style={{ padding: '14px', textAlign: 'right' }}>\r\n                        <Button\r\n                          variant="outline"\r\n                          size="sm"\r\n                          icon={Edit3}\r\n                          onClick={() => handleOpenEditModal(p)}\r\n                        >\r\n                          Edit\r\n                        </Button>\r\n                      </td>`
  );
}

fs.writeFileSync('client/src/components/patients/PatientsView.jsx', content, 'utf8');
console.log('Successfully updated PatientsView.jsx!');
