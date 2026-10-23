const fs = require('fs');

let code = fs.readFileSync('client/src/components/appointments/BookRescheduleView.jsx', 'utf8');

// 1. Add Register Patient Modal state inside BookRescheduleView
const stateAnchor = "  const [bookingModalError, setBookingModalError] = useState(null);";
const newStates = `  const [bookingModalError, setBookingModalError] = useState(null);

  // Quick Register Patient inside Booking Modal
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [quickPatientForm, setQuickPatientForm] = useState({
    fullName: '',
    mobile: '',
    dob: '',
    gender: 'female'
  });
  const [isRegisteringQuickPatient, setIsRegisteringQuickPatient] = useState(false);
  const [quickRegisterError, setQuickRegisterError] = useState(null);`;

code = code.replace(stateAnchor, newStates);

// 2. Add handleQuickRegisterSubmit
const submitAnchor = "  const handleBookSubmit = async (e) => {";
const quickRegisterHandler = `  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    setQuickRegisterError(null);
    if (!quickPatientForm.fullName.trim() || !quickPatientForm.mobile.trim()) {
      setQuickRegisterError('Patient full name and mobile number are required.');
      return;
    }
    let cleanMobile = quickPatientForm.mobile.replace(/[\\s\\-()]/g, '');
    if (cleanMobile.startsWith('+91')) cleanMobile = cleanMobile.slice(3);
    else if (cleanMobile.startsWith('0') && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

    if (!/^[6-9]\\d{9}$/.test(cleanMobile)) {
      setQuickRegisterError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsRegisteringQuickPatient(true);
    try {
      const res = await PatientService.createPatient({
        full_name: quickPatientForm.fullName.trim(),
        mobile: cleanMobile,
        date_of_birth: quickPatientForm.dob || null,
        gender: quickPatientForm.gender
      });
      const created = res?.data || res;
      if (!created || !created.id) throw new Error('Could not create patient record.');

      setSelectedPatient(created);
      setBookForm(prev => ({ ...prev, patientId: created.id }));
      setIsQuickRegisterOpen(false);
      setQuickPatientForm({ fullName: '', mobile: '', dob: '', gender: 'female' });
      setSuccessBanner(\`Patient \${created.full_name} (\${created.uhid}) registered and selected for consultation.\`);
    } catch (err) {
      setQuickRegisterError(err.message || 'Failed to register patient.');
    } finally {
      setIsRegisteringQuickPatient(false);
    }
  };

  const selectedDoctorObj = doctorsList.find(d => String(d.id) === String(bookForm.doctorId));
  const activeConsultationFee = selectedDoctorObj?.consultation_fee !== undefined && selectedDoctorObj?.consultation_fee !== null
    ? Number(selectedDoctorObj.consultation_fee)
    : 500;
`;

code = code.replace(submitAnchor, quickRegisterHandler + '\r\n' + submitAnchor);

// 3. Update payload in handleBookSubmit to include consultationFee
const oldPayload = `      const payload = {
        patientId: bookForm.patientId,
        doctorId: bookForm.doctorId,
        departmentId: bookForm.departmentId,
        appointmentDate: bookForm.appointmentDate,
        startTime: bookForm.startTime,
        visitType: bookForm.visitType,
        notes: bookForm.notes || null,
        isPriority: Boolean(bookForm.isPriority),
        roomId: bookForm.roomId || null,
      };`;

const newPayload = `      const payload = {
        patientId: bookForm.patientId,
        doctorId: bookForm.doctorId,
        departmentId: bookForm.departmentId,
        appointmentDate: bookForm.appointmentDate,
        startTime: bookForm.startTime,
        visitType: bookForm.visitType,
        notes: bookForm.notes || null,
        isPriority: Boolean(bookForm.isPriority),
        roomId: bookForm.roomId || null,
        consultationFee: activeConsultationFee,
      };`;

code = code.replace(oldPayload, newPayload);

// 4. In Step 1: Patient Search, add the "+ Register New Patient" button
const searchInputTarget = `                  <Input
                    placeholder="Search by Patient Name, UHID, or Mobile..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    icon={Search}
                  />`;

const searchInputWithButton = `                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        placeholder="Search by Patient Name, UHID, or Mobile..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        icon={Search}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      icon={Plus}
                      onClick={() => {
                        setQuickRegisterError(null);
                        setIsQuickRegisterOpen(true);
                      }}
                    >
                      New Patient
                    </Button>
                  </div>`;

code = code.replace(searchInputTarget, searchInputWithButton);

// 5. Update Doctor dropdown option labels to show specialty and fee
const oldDocOptions = `...doctorsList.map(doc => ({ value: doc.id, label: doc.full_name || doc.name }))`;
const newDocOptions = `...doctorsList.map(doc => ({
                  value: doc.id,
                  label: \`\${doc.full_name || doc.name}\${doc.specialty ? ' (' + doc.specialty + ')' : ''} - \${formatINR(doc.consultation_fee ? Number(doc.consultation_fee) : 500)}\`
                }))`;

code = code.replace(oldDocOptions, newDocOptions);

// 6. Update OPD Fee display at the bottom of modal
const oldFeeDisplay = `OPD Fee: {formatINR(800)}`;
const newFeeDisplay = `Doctor OPD Fee: {formatINR(activeConsultationFee)}`;

code = code.replace(oldFeeDisplay, newFeeDisplay);

// 7. Append Quick Register Modal
const quickRegisterModal = `
      {/* Quick Register Patient Modal */}
      {isQuickRegisterOpen && (
        <Modal
          isOpen={isQuickRegisterOpen}
          onClose={() => setIsQuickRegisterOpen(false)}
          title="Register New Patient"
          subtitle="Quickly establish an outpatient record and return to slot booking."
          maxWidth="500px"
        >
          <form onSubmit={handleQuickRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {quickRegisterError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FDE8E8',
                  borderRadius: 'var(--radius-md)',
                  color: '#9B1C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{quickRegisterError}</span>
              </div>
            )}

            <Input
              label="Patient Full Name"
              required
              placeholder="e.g. Radhika Sharma"
              value={quickPatientForm.fullName}
              onChange={(e) => setQuickPatientForm({ ...quickPatientForm, fullName: e.target.value })}
            />

            <Input
              label="Primary Mobile Number"
              required
              placeholder="+91 98765 43210"
              value={quickPatientForm.mobile}
              onChange={(e) => setQuickPatientForm({ ...quickPatientForm, mobile: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Date of Birth"
                type="date"
                value={quickPatientForm.dob}
                onChange={(e) => setQuickPatientForm({ ...quickPatientForm, dob: e.target.value })}
              />

              <Select
                label="Gender"
                required
                value={quickPatientForm.gender}
                onChange={(e) => setQuickPatientForm({ ...quickPatientForm, gender: e.target.value })}
                options={[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsQuickRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isRegisteringQuickPatient} icon={CheckCircle2}>
                {isRegisteringQuickPatient ? 'Saving...' : 'Create & Select Patient'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
`;

code = code.replace("    </div>\n  );\n}", quickRegisterModal + "\n    </div>\n  );\n}");
code = code.replace("    </div>\r\n  );\r\n}", quickRegisterModal + "\r\n    </div>\r\n  );\r\n}");

fs.writeFileSync('client/src/components/appointments/BookRescheduleView.jsx', code, 'utf8');
console.log('Successfully updated BookRescheduleView.jsx!');
