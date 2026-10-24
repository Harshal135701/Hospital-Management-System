const fs = require('fs');

// 1. Update DoctorsView.jsx
let docCode = fs.readFileSync('client/src/components/doctors/DoctorsView.jsx', 'utf8');

docCode = docCode.replace(
  "import { Card, Button, Badge, Input, Select, SafeImage } from '../common/UIPrimitives';",
  "import { Card, Button, Badge, Input, Select, SafeImage, Modal } from '../common/UIPrimitives';\r\nimport { DoctorAdminService, DepartmentService, TokenManager } from '../../services/api';\r\nimport { formatINR } from '../../utils/formatters';"
);

docCode = docCode.replace(
  "  ArrowLeft\n} from 'lucide-react';",
  "  ArrowLeft,\n  Plus,\n  Edit3,\n  IndianRupee\n} from 'lucide-react';"
);
docCode = docCode.replace(
  "  ArrowLeft\r\n} from 'lucide-react';",
  "  ArrowLeft,\r\n  Plus,\r\n  Edit3,\r\n  IndianRupee\r\n} from 'lucide-react';"
);

const docStateAnchor = "  const [isMock, setIsMock] = useState(false);";
const docNewStates = `  const [isMock, setIsMock] = useState(false);
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
  const [docModalError, setDocModalError] = useState(null);`;

docCode = docCode.replace(docStateAnchor, docNewStates);

const docLoadAnchor = "  useEffect(() => {\r\n    async function loadStaff() {";
const docLoadAnchorLf = "  useEffect(() => {\n    async function loadStaff() {";
const deptLoader = `  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await DepartmentService.getDepartments();
        if (Array.isArray(depts)) setDepartmentsList(depts);
      } catch {}
    }
    loadDepts();
  }, []);
`;

if (docCode.includes(docLoadAnchor)) {
  docCode = docCode.replace(docLoadAnchor, deptLoader + '\r\n' + docLoadAnchor);
} else {
  docCode = docCode.replace(docLoadAnchorLf, deptLoader + '\n' + docLoadAnchorLf);
}

// Add Doctor Handlers
const docHandlerCode = `
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
          id: \`doc-\${Date.now()}\`,
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
      setSuccessBanner(\`Doctor \${payload.full_name} added to hospital faculty.\`);
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
      setSuccessBanner(\`Doctor \${payload.full_name} updated successfully.\`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setDocModalError(err.message || 'Failed to update doctor.');
    } finally {
      setIsSubmittingDoc(false);
    }
  };
`;

docCode = docCode.replace("  const departments = ['all',", docHandlerCode + "\r\n  const departments = ['all',");

// Add button in header
const headerRightAnchor = `{onBack && (
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Dashboard
          </Button>
        )}`;

const newHeaderRight = `<div style={{ display: 'flex', gap: '10px' }}>
          {onBack && (
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setDoctorForm({
                fullName: '',
                employeeCode: \`DOC-\${Math.floor(100 + Math.random() * 900)}\`,
                departmentId: departmentsList[0]?.id || '',
                specialty: '',
                consultationFee: 500,
                qualifications: 'MBBS, MD',
                experienceYears: 5
              });
              setDocModalError(null);
              setIsAddDoctorOpen(true);
            }}
          >
            + Add Doctor
          </Button>
        </div>`;

docCode = docCode.replace(headerRightAnchor, newHeaderRight);

// Add consultation fee badge on card and Edit button
const cardDepartmentAnchor = `<div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  {staff.department}
                </div>`;

const newCardDepartment = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    {staff.department}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                    Fee: {formatINR(staff.consultation_fee ? Number(staff.consultation_fee) : 500)}
                  </div>
                </div>`;

docCode = docCode.replace(cardDepartmentAnchor, newCardDepartment);

// Add Edit Doctor button in Card footer
const cardFooterAnchor = `<div style={{ display: 'flex', gap: '8px' }}>`;
const newCardFooterButtons = `<div style={{ display: 'flex', gap: '8px' }}>
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
                  </Button>`;

docCode = docCode.replace(cardFooterAnchor, newCardFooterButtons);

// Append Doctor Modals
const docModalsHtml = `
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
          subtitle={\`Updating details for \${editingDoctor.name}\`}
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
`;

docCode = docCode.replace("    </div>\n  );\n};", docModalsHtml + "\n    </div>\n  );\n};");
docCode = docCode.replace("    </div>\r\n  );\r\n};", docModalsHtml + "\r\n    </div>\r\n  );\r\n};");

fs.writeFileSync('client/src/components/doctors/DoctorsView.jsx', docCode, 'utf8');
console.log('Successfully updated DoctorsView.jsx!');
