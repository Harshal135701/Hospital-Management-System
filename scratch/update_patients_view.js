const fs = require('fs');

let code = fs.readFileSync('client/src/components/patients/PatientsView.jsx', 'utf8');

// 1. Add Edit icon to imports if not present
if (!code.includes('Edit3,')) {
  code = code.replace("  ArrowRight\n} from 'lucide-react';", "  ArrowRight,\n  Edit3,\n  FileEdit\n} from 'lucide-react';");
  code = code.replace("  ArrowRight\r\n} from 'lucide-react';", "  ArrowRight,\r\n  Edit3,\r\n  FileEdit\r\n} from 'lucide-react';");
}

// 2. Add Edit state and age helper
const stateInsertionPoint = "  const [confirmedIdentityForNameDob, setConfirmedIdentityForNameDob] = useState(null);";
const editStateCode = `  const [confirmedIdentityForNameDob, setConfirmedIdentityForNameDob] = useState(null);

  // Edit Patient State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editApiError, setEditApiError] = useState(null);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? \`\${age} Yrs\` : '';
  };`;

code = code.replace(stateInsertionPoint, editStateCode);

// 3. Update initialFormState to include all demographic fields
const oldInitialForm = `  const initialFormState = {
    fullName: '',
    dob: '',
    gender: 'female',
    mobile: '',
    bloodGroup: 'B',
    rhFactor: 'positive',
    emergencyName: '',
    emergencyPhone: '',
    address: ''
  };`;

const newInitialForm = `  const initialFormState = {
    fullName: '',
    dob: '',
    gender: 'female',
    mobile: '',
    altMobile: '',
    email: '',
    bloodGroup: 'B',
    rhFactor: 'positive',
    address: '',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pinCode: '700001',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    allergies: 'None recorded',
    highRisk: false
  };`;

code = code.replace(oldInitialForm, newInitialForm);

// 4. Update live payload in handleRegisterSubmit
const oldLivePayload = `        const payload = {
          full_name: formData.fullName.trim(),
          mobile: normalizedMobile,
          ...(formData.dob ? { date_of_birth: formData.dob } : {}),
          gender: formData.gender
        };`;

const newLivePayload = `        const payload = {
          full_name: formData.fullName.trim(),
          mobile: normalizedMobile,
          date_of_birth: formData.dob || null,
          gender: formData.gender,
          alt_mobile: formData.altMobile ? formData.altMobile.trim() : null,
          email: formData.email ? formData.email.trim() : null,
          address: formData.address ? formData.address.trim() : null,
          city: formData.city ? formData.city.trim() : null,
          district: formData.district ? formData.district.trim() : null,
          state: formData.state ? formData.state.trim() : null,
          pin_code: formData.pinCode ? formData.pinCode.trim() : null,
          emergency_name: formData.emergencyName ? formData.emergencyName.trim() : null,
          emergency_relationship: formData.emergencyRelationship ? formData.emergencyRelationship.trim() : null,
          emergency_phone: formData.emergencyPhone ? formData.emergencyPhone.trim() : null,
          blood_group: formData.bloodGroup || null,
          rh_factor: formData.rhFactor || null,
          allergies: formData.allergies ? formData.allergies.trim() : 'None recorded',
          high_risk: Boolean(formData.highRisk)
        };`;

code = code.replace(oldLivePayload, newLivePayload);

// 5. Update demo newPatient in handleRegisterSubmit
const oldDemoPatient = `        const newPatient = {
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
        };`;

const newDemoPatient = `        const newPatient = {
          id: nextId,
          uhid: demoUhid,
          full_name: formData.fullName.trim(),
          date_of_birth: formData.dob || null,
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          rh_factor: formData.rhFactor,
          mobile: normalizedMobile,
          alt_mobile: formData.altMobile ? formData.altMobile.trim() : '',
          email: formData.email ? formData.email.trim() : '',
          address: formData.address.trim(),
          city: formData.city || 'Kolkata',
          district: formData.district || 'Kolkata',
          state: formData.state || 'West Bengal',
          pin_code: formData.pinCode || '700001',
          emergency_name: formData.emergencyName.trim(),
          emergency_relationship: formData.emergencyRelationship || 'Spouse',
          emergency_phone: formData.emergencyPhone.trim(),
          allergies: formData.allergies ? formData.allergies.trim() : 'None recorded',
          high_risk: Boolean(formData.highRisk),
          created_at: new Date().toISOString()
        };`;

code = code.replace(oldDemoPatient, newDemoPatient);

// 6. Add Edit Patient Handler
const editHandlerCode = `
  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      fullName: patient.full_name || '',
      dob: patient.date_of_birth ? String(patient.date_of_birth).slice(0, 10) : '',
      gender: patient.gender || 'female',
      mobile: patient.mobile || '',
      altMobile: patient.alt_mobile || '',
      email: patient.email || '',
      bloodGroup: patient.blood_group || 'B',
      rhFactor: patient.rh_factor || 'positive',
      address: patient.address || '',
      city: patient.city || 'Kolkata',
      district: patient.district || 'Kolkata',
      state: patient.state || 'West Bengal',
      pinCode: patient.pin_code || '700001',
      emergencyName: patient.emergency_name || '',
      emergencyRelationship: patient.emergency_relationship || 'Spouse',
      emergencyPhone: patient.emergency_phone || '',
      allergies: patient.allergies || 'None recorded',
      highRisk: Boolean(patient.high_risk)
    });
    setEditApiError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    setIsEditSubmitting(true);
    setEditApiError(null);

    try {
      let cleanMobile = (editFormData.mobile || '').replace(/[\\s\\-()]/g, '');
      if (cleanMobile.startsWith('+91')) cleanMobile = cleanMobile.slice(3);
      else if (cleanMobile.startsWith('0') && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

      const updatePayload = {
        full_name: editFormData.fullName.trim(),
        mobile: cleanMobile,
        date_of_birth: editFormData.dob || null,
        gender: editFormData.gender,
        alt_mobile: editFormData.altMobile ? editFormData.altMobile.trim() : null,
        email: editFormData.email ? editFormData.email.trim() : null,
        address: editFormData.address ? editFormData.address.trim() : null,
        city: editFormData.city ? editFormData.city.trim() : null,
        district: editFormData.district ? editFormData.district.trim() : null,
        state: editFormData.state ? editFormData.state.trim() : null,
        pin_code: editFormData.pinCode ? editFormData.pinCode.trim() : null,
        emergency_name: editFormData.emergencyName ? editFormData.emergencyName.trim() : null,
        emergency_relationship: editFormData.emergencyRelationship ? editFormData.emergencyRelationship.trim() : null,
        emergency_phone: editFormData.emergencyPhone ? editFormData.emergencyPhone.trim() : null,
        blood_group: editFormData.bloodGroup || null,
        rh_factor: editFormData.rhFactor || null,
        allergies: editFormData.allergies ? editFormData.allergies.trim() : 'None recorded',
        high_risk: Boolean(editFormData.highRisk)
      };

      if (TokenManager.getToken()) {
        await PatientService.updatePatient(editingPatient.id, updatePayload);
        setLivePatients(prev => prev.map(p => p.id === editingPatient.id ? { ...p, ...updatePayload } : p));
      } else {
        updatePatients(prev => (Array.isArray(prev) ? prev : []).map(p => p.id === editingPatient.id ? { ...p, ...updatePayload } : p));
      }

      setIsEditModalOpen(false);
      setToastMessage(\`Patient \${editingPatient.full_name} (\${editingPatient.uhid}) updated successfully.\`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setEditApiError(err.message || 'Failed to update patient details.');
    } finally {
      setIsEditSubmitting(false);
    }
  };
`;

code = code.replace("  const handleCopyUhid = (uhid) => {", editHandlerCode + "\r\n  const handleCopyUhid = (uhid) => {");

// 7. Update Table Header to include Actions
code = code.replace(
  `<th style={{ padding: '10px 14px', fontWeight: '600' }}>Registered On</th>`,
  `<th style={{ padding: '10px 14px', fontWeight: '600' }}>Registered On</th>\r\n                <th style={{ padding: '10px 14px', fontWeight: '600', textAlign: 'center' }}>Actions</th>`
);

// 8. Update Table Row to include Actions button
code = code.replace(
  `<td style={{ padding: '14px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {p.created_at ? formatDateIN(p.created_at) : '-'}
                      </td>
                    </tr>`,
  `<td style={{ padding: '14px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {p.created_at ? formatDateIN(p.created_at) : '-'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit3}
                          onClick={() => handleOpenEditModal(p)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>`
);

// 9. Update colSpan in empty table state from 6 to 7
code = code.replace('<td colSpan={6}', '<td colSpan={7}');

fs.writeFileSync('client/src/components/patients/PatientsView.jsx', code, 'utf8');
console.log('Successfully updated PatientsView.jsx with Edit Patient and full demographics!');
