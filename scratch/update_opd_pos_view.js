const fs = require('fs');

let code = fs.readFileSync('client/src/components/billing/operations/OpdBillingPosView.jsx', 'utf8');

// 1. Add PatientService, ClinicalStaffService, OperationsQueueService imports
code = code.replace(
  "import { BillingOpsService } from '../../../services/api';",
  "import { BillingOpsService, PatientService, ClinicalStaffService, OperationsQueueService } from '../../../services/api';"
);

// 2. Add Patient & Doctor selection states
const stateAnchor = "  const [patientData, setPatientData] = useState({";
const newPosStates = `  // Patient Search State
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Doctors State
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const [patientData, setPatientData] = useState({`;

code = code.replace(stateAnchor, newPosStates);

// 3. Add doctor loading and patient search effects
const effectAnchor = "  // Load live bills from API if present";
const newEffects = `  // Load doctors for consultation fee selection
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await ClinicalStaffService.getStaff();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDoctorsList(list);
        if (list.length > 0) setSelectedDoctorId(list[0].id);
      } catch {
        //
      }
    }
    loadDoctors();
  }, []);

  // Debounced Patient Search
  useEffect(() => {
    if (!patientQuery.trim() || patientQuery.trim().length < 2) {
      setPatientResults([]);
      setIsSearchingPatient(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPatient(true);
      try {
        const results = await PatientService.searchPatients(patientQuery.trim());
        setPatientResults(Array.isArray(results) ? results : []);
      } catch {
        setPatientResults([]);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientQuery]);

  const handleSelectPatient = (p) => {
    setPatientData({
      id: p.id,
      name: p.full_name,
      uhid: p.uhid,
      phone: p.mobile || 'N/A',
      ageGender: \`\${p.gender || 'General'} \${p.date_of_birth ? '• ' + String(p.date_of_birth).slice(0, 10) : ''}\`,
      category: 'General OPD',
      doctor: patientData.doctor
    });
    setPatientQuery('');
    setPatientResults([]);
  };

  const handleAddDoctorFee = (docId) => {
    const doc = doctorsList.find(d => String(d.id) === String(docId));
    if (!doc) return;
    const fee = doc.consultation_fee ? Number(doc.consultation_fee) : 500;
    const docName = doc.full_name || doc.name;
    setPatientData(prev => ({ ...prev, doctor: \`Dr. \${docName} (\${doc.specialty || doc.department || 'Consultant'})\` }));

    setCartItems(prev => {
      const filtered = prev.filter(i => !i.id.startsWith('srv-doc-'));
      return [
        {
          id: \`srv-doc-\${doc.id}\`,
          name: \`Consultation Fee - Dr. \${docName}\`,
          price: fee,
          qty: 1,
          discount: 0,
          taxRate: 0,
          total: fee
        },
        ...filtered
      ];
    });
  };
`;

code = code.replace(effectAnchor, newEffects + '\r\n' + effectAnchor);

// 4. Update handleCreateInvoiceSubmit to trigger post-payment SMS notification
const invoiceSubmitAnchor = "    setBills(prev => [newBill, ...prev]);";
const notifCode = `    // Trigger post-payment SMS confirmation safely
    try {
      if (patientData.phone && patientData.phone !== 'N/A') {
        OperationsQueueService.scheduleEvent(
          newBill.id,
          'booking_confirmation',
          ['sms']
        ).catch(() => {});
      }
    } catch {
      //
    }
`;

code = code.replace(invoiceSubmitAnchor, notifCode + '\r\n' + invoiceSubmitAnchor);

// 5. Update patient details card in JSX to include patient search input and doctor select button
const oldPatientCardHeader = `<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--color-primary-teal)" />
                <span style={{ fontWeight: '700', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  Patient Demographic & Consultation Details
                </span>
              </div>
              <Badge variant="teal" size="sm">Active Outpatient</Badge>
            </div>`;

const newPatientCardHeader = `<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--color-primary-teal)" />
                  <span style={{ fontWeight: '700', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                    Patient Demographic & Consultation Details
                  </span>
                </div>
                <Badge variant="teal" size="sm">Active Outpatient</Badge>
              </div>

              {/* Patient Live Search */}
              <div style={{ position: 'relative' }}>
                <Input
                  placeholder="Search patient by Name, UHID, or Mobile to bill..."
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  icon={Search}
                />
                {isSearchingPatient && (
                  <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Searching...
                  </span>
                )}
                {patientResults.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 25,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-dropdown)',
                      maxHeight: '160px',
                      overflowY: 'auto',
                      marginTop: '4px'
                    }}
                  >
                    {patientResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.82rem' }}>{p.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                            {p.uhid} • {p.mobile || 'N/A'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>Select →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Fee Shortcut */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Add Doctor Fee:</span>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.78rem',
                    flex: 1
                  }}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctorsList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.name} ({d.specialty || d.department}) - {formatINR(d.consultation_fee ? Number(d.consultation_fee) : 500)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selectedDoctorId}
                  onClick={() => handleAddDoctorFee(selectedDoctorId)}
                >
                  + Add Fee
                </Button>
              </div>
            </div>`;

code = code.replace(oldPatientCardHeader, newPatientCardHeader);

fs.writeFileSync('client/src/components/billing/operations/OpdBillingPosView.jsx', code, 'utf8');
console.log('Successfully updated OpdBillingPosView.jsx!');
