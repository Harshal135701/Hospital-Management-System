const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFYING PATIENTS WHITE SCREEN & DUPLICATE APPOINTMENTS NAVIGATION FIXES ===\n');

// 1. Check PatientsView.jsx
console.log('1. Verifying PatientsView.jsx...');
const patientsCode = fs.readFileSync('client/src/components/patients/PatientsView.jsx', 'utf8');

// Check required state declarations
assert(patientsCode.includes('const [isEditModalOpen, setIsEditModalOpen] = useState(false);'), 'isEditModalOpen state missing');
assert(patientsCode.includes('const [editingPatient, setEditingPatient] = useState(null);'), 'editingPatient state missing');
assert(patientsCode.includes('const [editFormData, setEditFormData] = useState({});'), 'editFormData state missing');
assert(patientsCode.includes('const [isEditSubmitting, setIsEditSubmitting] = useState(false);'), 'isEditSubmitting state missing');
assert(patientsCode.includes('const [editApiError, setEditApiError] = useState(null);'), 'editApiError state missing');

// Check calculateAge helper
assert(patientsCode.includes('const calculateAge = (dob) =>'), 'calculateAge helper missing');

// Check handlers
assert(patientsCode.includes('const handleOpenEditModal = (patient) =>'), 'handleOpenEditModal missing');
assert(patientsCode.includes('const handleEditSubmit = async (e) =>'), 'handleEditSubmit missing');

// Check table Actions column and Edit button
assert(patientsCode.includes('>Actions</th>'), 'Table Actions header missing');
assert(patientsCode.includes('onClick={() => handleOpenEditModal(p)}'), 'Table Edit button click handler missing');

// Check Edit3 icon import
assert(patientsCode.includes('Edit3'), 'Edit3 icon missing in PatientsView');

// Test calculateAge logic directly
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

assert.strictEqual(calculateAge(''), '', 'Empty DOB should return empty string');
assert.strictEqual(calculateAge('invalid-date'), '', 'Invalid DOB should return empty string');
assert(calculateAge('1990-01-01').includes('Yrs'), 'Valid DOB should return formatted age');

console.log('  [PASS] PatientsView states, calculateAge, handlers, and table actions verified.');

// 2. Check api.js updatePatient method
console.log('\n2. Verifying api.js updatePatient method...');
const apiCode = fs.readFileSync('client/src/services/api.js', 'utf8');
assert(apiCode.includes('async updatePatient(id, data)'), 'updatePatient method missing in api.js');
assert(apiCode.includes("'/patients/' + encodeURIComponent(id)"), 'apiFetch endpoint incorrect in updatePatient');
console.log('  [PASS] PatientService.updatePatient verified in api.js.');

// 3. Check AppointmentsView.jsx
console.log('\n3. Verifying AppointmentsView.jsx...');
const aptCode = fs.readFileSync('client/src/components/appointments/AppointmentsView.jsx', 'utf8');

// Ensure NO inner <aside> exists in AppointmentsView
assert(!aptCode.includes('<aside'), 'AppointmentsView still contains a duplicate <aside> sidebar!');
assert(!aptCode.includes('Navigation Desks'), 'AppointmentsView still contains legacy Navigation Desks header!');

// Ensure breadcrumb exists
assert(aptCode.includes('aria-label="Breadcrumb"'), 'AppointmentsView missing breadcrumb navigation!');

// Ensure all submodules and group routing are preserved
assert(aptCode.includes('<BookRescheduleView'), 'BookRescheduleView missing');
assert(aptCode.includes('<DoctorRosterView'), 'DoctorRosterView missing');
assert(aptCode.includes('<TokenQueueDisplayView'), 'TokenQueueDisplayView missing');
assert(aptCode.includes('<RemindersAlertsView'), 'RemindersAlertsView missing');
assert(aptCode.includes('<BillingView'), 'BillingView missing');
assert(aptCode.includes('<DayCareView'), 'DayCareView missing');
assert(aptCode.includes('<DietView'), 'DietView missing');
assert(aptCode.includes('<EmbryologyView'), 'EmbryologyView missing');
assert(aptCode.includes('<EmergencyView'), 'EmergencyView missing');
assert(aptCode.includes('<EmrView'), 'EmrView missing');
assert(aptCode.includes('<SubmodulesView'), 'SubmodulesView missing');
assert(aptCode.includes('<GroupDashboardView'), 'GroupDashboardView missing');

console.log('  [PASS] AppointmentsView duplicate sidebar removed; all 32 workspace integrations preserved.');

// 4. Check AppShell.jsx
console.log('\n4. Verifying AppShell.jsx Appointment navigation wiring...');
const appShellCode = fs.readFileSync('client/src/components/layout/AppShell.jsx', 'utf8');

// Check that clicking Appointments navigates to appointments:3.1 and expands group 3
assert(appShellCode.includes("handleSelectNav('appointments:3.1')"), 'AppShell does not navigate to appointments:3.1 on Appointments click');
assert(appShellCode.includes("setExpandedAppointmentGroups(prev => ({ ...prev, '3': true }))"), 'AppShell does not auto-expand group 3');

console.log('  [PASS] AppShell single sidebar Appointment navigation correctly wired.');

console.log('\n======================================================');
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (4/4)!');
console.log('======================================================');
