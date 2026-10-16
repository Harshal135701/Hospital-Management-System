/**
 * Documented Institutional Staff Personas for Local Development & Testing.
 * Configured in server/seeds/seed-dev-staff.js and verified in server/migrations/1791800000000_staff-accounts-and-rbac.js.
 * Development passwords are strictly restricted to local development/demo environments.
 */
export const IS_DEV_MODE = Boolean(
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.DEV
    : (typeof process !== 'undefined' ? process.env?.NODE_ENV !== 'production' : true)
);

const DEV_PASSWORDS = IS_DEV_MODE
  ? {
      blood_bank_officer: 'BBO#Secure2026!',
      lab_technician: 'Tech#Pass2026!',
      phlebotomist: 'Phleb#Pass2026!',
      clinician_doctor: 'Doc#Pass2026!',
      receptionist: 'Recept#Pass2026!',
      super_admin: 'Admin#Pass2026!'
    }
  : {};

export const PRESET_PERSONAS = [
  {
    role: 'blood_bank_officer',
    title: 'Blood Bank Officer',
    email: 'bbo@hospital.test',
    password: DEV_PASSWORDS.blood_bank_officer || '',
    badge: 'Dual-Gate Authority'
  },
  {
    role: 'lab_technician',
    title: 'Lab Technician',
    email: 'tech@hospital.test',
    password: DEV_PASSWORDS.lab_technician || '',
    badge: 'Serology & Processing'
  },
  {
    role: 'phlebotomist',
    title: 'Phlebotomist',
    email: 'phleb@hospital.test',
    password: DEV_PASSWORDS.phlebotomist || '',
    badge: 'Donor & Collection'
  },
  {
    role: 'clinician_doctor',
    title: 'Clinician / Doctor',
    email: 'doctor@hospital.test',
    password: DEV_PASSWORDS.clinician_doctor || '',
    badge: 'Requisitions & PIN Release'
  },
  {
    role: 'receptionist',
    title: 'Receptionist',
    email: 'reception@hospital.test',
    password: DEV_PASSWORDS.receptionist || '',
    badge: 'Patient Registry'
  },
  {
    role: 'super_admin',
    title: 'Super Admin',
    email: 'admin@hospital.test',
    password: DEV_PASSWORDS.super_admin || '',
    badge: 'System Admin'
  }
];
