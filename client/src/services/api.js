/**
 * Central API Client and Typed Data Services
 * Integrates with existing backend /api endpoints and provides explicit demo-labeled mock adapters.
 */

const API_BASE = '/api';

// Reusable fetch wrapper
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || `Request failed with status ${res.status}`);
      err.details = data.details || data.errors;
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    console.warn(`[API] Error for ${endpoint}:`, err.message);
    throw err;
  }
}


/* ==========================================================================
   PATIENTS & APPOINTMENTS SERVICES (Preserves existing schema)
   ========================================================================== */

export const PatientService = {
  async getPatients() {
    const remote = await apiFetch('/patients');
    if (remote && remote.data) return { data: remote.data, isMock: false };
    
    // Explicitly labeled mock fallback matching database schema
    return {
      isMock: true,
      data: [
        {
          id: 'p-001',
          uhid: 'UHID-2026-0814',
          full_name: 'Devika Sengupta',
          date_of_birth: '1988-04-12',
          gender: 'female',
          blood_group: 'B',
          rh_factor: 'positive',
          mobile: '+91 98301 22410',
          created_at: '2026-02-14T09:30:00Z'
        },
        {
          id: 'p-002',
          uhid: 'UHID-2026-0922',
          full_name: 'Rajesh Narayan Verma',
          date_of_birth: '1974-11-23',
          gender: 'male',
          blood_group: 'O',
          rh_factor: 'positive',
          mobile: '+91 94330 88204',
          created_at: '2026-02-15T11:15:00Z'
        },
        {
          id: 'p-003',
          uhid: 'UHID-2026-1045',
          full_name: 'Amina Khatun',
          date_of_birth: '1995-07-08',
          gender: 'female',
          blood_group: 'AB',
          rh_factor: 'positive',
          mobile: '+91 91234 56789',
          created_at: '2026-02-18T14:00:00Z'
        },
        {
          id: 'p-004',
          uhid: 'UHID-2026-1180',
          full_name: 'Vikramaditya Bose',
          date_of_birth: '1962-09-30',
          gender: 'male',
          blood_group: 'A',
          rh_factor: 'negative',
          mobile: '+91 98765 43210',
          created_at: '2026-03-01T10:45:00Z'
        }
      ]
    };
  }
};

export const AppointmentService = {
  async getAppointments() {
    const remote = await apiFetch('/appointments');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'apt-101',
          appointment_number: 'APT-2026-0491',
          patient_name: 'Devika Sengupta',
          patient_uhid: 'UHID-2026-0814',
          doctor_name: 'Dr. Arindam Mitra',
          department_name: 'Cardiology',
          appointment_date: '2026-10-12',
          start_time: '10:00 AM',
          status: 'confirmed',
          visit_type: 'follow_up'
        },
        {
          id: 'apt-102',
          appointment_number: 'APT-2026-0492',
          patient_name: 'Rajesh Narayan Verma',
          patient_uhid: 'UHID-2026-0922',
          doctor_name: 'Dr. Sunita Rao',
          department_name: 'General Medicine',
          appointment_date: '2026-10-12',
          start_time: '10:30 AM',
          status: 'in_consultation',
          visit_type: 'first_visit'
        },
        {
          id: 'apt-103',
          appointment_number: 'APT-2026-0493',
          patient_name: 'Vikramaditya Bose',
          patient_uhid: 'UHID-2026-1180',
          doctor_name: 'Dr. Pradeep K. Sharma',
          department_name: 'Orthopaedics',
          appointment_date: '2026-10-12',
          start_time: '11:15 AM',
          status: 'confirmed',
          visit_type: 'follow_up'
        },
        {
          id: 'apt-104',
          appointment_number: 'APT-2026-0494',
          patient_name: 'Amina Khatun',
          patient_uhid: 'UHID-2026-1045',
          doctor_name: 'Dr. Meenakshi Sundaram',
          department_name: 'Haematology & Transfusion',
          appointment_date: '2026-10-12',
          start_time: '01:30 PM',
          status: 'confirmed',
          visit_type: 'first_visit'
        }
      ]
    };
  }
};

/* ==========================================================================
   CLINICAL STAFF & INPATIENT WARDS SERVICES
   ========================================================================== */

export const ClinicalStaffService = {
  async getStaff() {
    const remote = await apiFetch('/doctors');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'doc-01',
          name: 'Dr. Ananya Sharma',
          role: 'Senior Consultant & Lead',
          specialty: 'Transfusion & Internal Medicine',
          department: 'Haematology & Blood Bank',
          qualification: 'MD (Transfusion Medicine), FICP',
          room: 'Room 204, OPD Block B',
          shift: '08:00 – 16:00',
          status: 'available',
          active_patients_today: 14,
          phone: '+91 98300 44101',
          imageKey: 'femaleDoctor'
        },
        {
          id: 'doc-02',
          name: 'Dr. Arindam Mitra',
          role: 'Chief Cardiologist',
          specialty: 'Interventional Cardiology',
          department: 'Cardiology & Cath Lab',
          qualification: 'DM (Cardiology), FACC',
          room: 'Room 102, Cath Block A',
          shift: '09:00 – 17:00',
          status: 'in_consultation',
          active_patients_today: 22,
          phone: '+91 98311 55202',
          imageKey: 'doctorWithStethoscope'
        },
        {
          id: 'doc-03',
          name: 'Dr. Pradeep K. Sharma',
          role: 'Senior Orthopaedic Surgeon',
          specialty: 'Trauma & Joint Replacement',
          department: 'Orthopaedics & Trauma',
          qualification: 'MS (Ortho), MCh',
          room: 'OT Complex 3',
          shift: '08:00 – 18:00',
          status: 'in_surgery',
          active_patients_today: 9,
          phone: '+91 98402 77303',
          imageKey: 'surgeonStaff'
        },
        {
          id: 'doc-04',
          name: 'Dr. Sunita Rao',
          role: 'Consultant Physician',
          specialty: 'General Medicine & Diabetology',
          department: 'Outpatient Medicine',
          qualification: 'MD (Gen Med)',
          room: 'Room 201, OPD Block B',
          shift: '10:00 – 18:00',
          status: 'available',
          active_patients_today: 18,
          phone: '+91 97422 88404',
          imageKey: 'doctorConsultation'
        },
        {
          id: 'doc-05',
          name: 'Dr. Meenakshi Sundaram',
          role: 'Blood Bank Officer',
          specialty: 'Immunohematology & Apheresis',
          department: 'Transfusion Medicine',
          qualification: 'MD (Pathology), DCP',
          room: 'Blood Bank Clinical Lab',
          shift: '08:00 – 16:00',
          status: 'available',
          active_patients_today: 12,
          phone: '+91 98315 99505',
          imageKey: 'doctorMaleScrubs'
        },
        {
          id: 'stf-06',
          name: 'Sister Savitri Devi',
          role: 'Nursing Supervisor',
          specialty: 'Critical Care & Phlebotomy',
          department: 'Inpatient Nursing & Blood Bank',
          qualification: 'B.Sc Nursing, BLS',
          room: 'Central Nursing Station 2',
          shift: '07:00 – 15:00',
          status: 'on_duty',
          active_patients_today: 34,
          phone: '+91 98320 11606',
          imageKey: 'nurseCare'
        }
      ]
    };
  }
};

export const InpatientWardService = {
  async getWards() {
    const remote = await apiFetch('/wards');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'ward-01',
          name: 'Intensive Care Unit (ICU)',
          wing: 'Block A, 2nd Floor',
          total_beds: 16,
          occupied_beds: 12,
          available_beds: 4,
          nurse_lead: 'Sister Savitri Devi',
          category: 'Critical Care',
          target_temp: '21°C',
          imageKey: 'hospitalWardBed',
          beds: [
            { id: 'b-101', number: 'ICU-01', status: 'occupied', patient: 'Devika Sengupta (UHID-2026-0814)', telemetry: 'HR: 82 • SpO2: 98%' },
            { id: 'b-102', number: 'ICU-02', status: 'occupied', patient: 'Aniruddha Sen (UHID-2026-0640)', telemetry: 'HR: 76 • SpO2: 99%' },
            { id: 'b-103', number: 'ICU-03', status: 'available', patient: null, telemetry: 'Sanitized' },
            { id: 'b-104', number: 'ICU-04', status: 'available', patient: null, telemetry: 'Sanitized' }
          ]
        },
        {
          id: 'ward-02',
          name: 'Cardiothoracic Post-Op Ward',
          wing: 'Block A, 3rd Floor',
          total_beds: 24,
          occupied_beds: 19,
          available_beds: 5,
          nurse_lead: 'Sister P. Varma',
          category: 'Post-Surgical Care',
          target_temp: '22°C',
          imageKey: 'hospitalRoomPrivate',
          beds: [
            { id: 'b-201', number: 'CT-201', status: 'occupied', patient: 'Meera Mukherjee (UHID-2026-0772)', telemetry: 'Post-CABG Day 2' },
            { id: 'b-202', number: 'CT-202', status: 'reserved', patient: 'Vikramaditya Bose (Pre-Op)', telemetry: 'Reserved for Admission' },
            { id: 'b-203', number: 'CT-203', status: 'available', patient: null, telemetry: 'Sanitized' },
            { id: 'b-204', number: 'CT-204', status: 'maintenance', patient: null, telemetry: 'Bio-Cleaning in Progress' }
          ]
        },
        {
          id: 'ward-03',
          name: 'General Medical Inpatient Ward B',
          wing: 'Block B, 1st Floor',
          total_beds: 45,
          occupied_beds: 35,
          available_beds: 10,
          nurse_lead: 'Staff Nurse R. Thomas',
          category: 'General Inpatient',
          target_temp: '23°C',
          imageKey: 'modernClinic',
          beds: [
            { id: 'b-301', number: 'GEN-301', status: 'occupied', patient: 'Rajesh Narayan Verma', telemetry: 'Routine Observation' },
            { id: 'b-302', number: 'GEN-302', status: 'available', patient: null, telemetry: 'Sanitized' },
            { id: 'b-303', number: 'GEN-303', status: 'occupied', patient: 'Amina Khatun', telemetry: 'IV Antibiotic Day 3' },
            { id: 'b-304', number: 'GEN-304', status: 'available', patient: null, telemetry: 'Sanitized' }
          ]
        },
        {
          id: 'ward-04',
          name: 'Emergency Observation & Triage Bay',
          wing: 'Block C, Ground Floor',
          total_beds: 25,
          occupied_beds: 18,
          available_beds: 7,
          nurse_lead: 'Charge Nurse K. Nair',
          category: 'Emergency Triage',
          target_temp: '22°C',
          imageKey: 'ambulanceEmergency',
          beds: [
            { id: 'b-401', number: 'ER-01', status: 'occupied', patient: 'Stat Trauma 1', telemetry: 'Vital Monitoring Active' },
            { id: 'b-402', number: 'ER-02', status: 'available', patient: null, telemetry: 'Ready for Stat Admission' },
            { id: 'b-403', number: 'ER-03', status: 'available', patient: null, telemetry: 'Ready for Stat Admission' },
            { id: 'b-404', number: 'ER-04', status: 'occupied', patient: 'Chest Pain Triage', telemetry: 'ECG Pending' }
          ]
        }
      ]
    };
  }
};

/* ==========================================================================
   BLOOD BANK SERVICES (Mirrors exact database schema)
   ========================================================================== */

export const BloodBankService = {
  // 5.1 Donors & Screenings
  async getDonors() {
    const remote = await apiFetch('/blood-bank/donors');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'don-01',
          donor_code: 'DNR-2026-0041',
          full_name: 'Rahul Debnath',
          gender: 'male',
          date_of_birth: '1992-06-15',
          blood_group: 'O',
          rh_factor: 'positive',
          mobile: '+91 98311 55667',
          donor_status: 'active',
          total_donations: 4,
          last_donation_date: '2026-06-10',
          last_screening: {
            eligibility_status: 'approved',
            hemoglobin_g_dl: 14.2,
            weight_kg: 68.5,
            blood_pressure: '120/80',
            pulse_bpm: 72,
            consent_obtained: true
          }
        },
        {
          id: 'don-02',
          donor_code: 'DNR-2026-0042',
          full_name: 'Priyanka Banerjee',
          gender: 'female',
          date_of_birth: '1996-03-21',
          blood_group: 'A',
          rh_factor: 'positive',
          mobile: '+91 98402 77112',
          donor_status: 'temporarily_deferred',
          total_donations: 2,
          last_donation_date: '2026-08-01',
          last_screening: {
            eligibility_status: 'temporarily_deferred',
            hemoglobin_g_dl: 11.4, // Below 12.5 threshold!
            weight_kg: 52.0,
            blood_pressure: '110/70',
            pulse_bpm: 78,
            deferral_reason: 'Low hemoglobin (11.4 g/dL; requirement is >= 12.5 g/dL)',
            deferred_until: '2026-11-15'
          }
        },
        {
          id: 'don-03',
          donor_code: 'DNR-2026-0043',
          full_name: 'Kavita Murthy',
          gender: 'female',
          date_of_birth: '1990-12-04',
          blood_group: 'B',
          rh_factor: 'negative',
          mobile: '+91 97422 33445',
          donor_status: 'active',
          total_donations: 5,
          last_donation_date: '2026-05-18',
          last_screening: {
            eligibility_status: 'approved',
            hemoglobin_g_dl: 13.0,
            weight_kg: 61.0,
            blood_pressure: '122/82',
            pulse_bpm: 74,
            consent_obtained: true
          }
        }
      ]
    };
  },

  // 5.2 Collections
  async getCollections() {
    const remote = await apiFetch('/blood-bank/donations');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'col-01',
          donation_number: 'BLD-2026-0189',
          donor_name: 'Rahul Debnath',
          donor_code: 'DNR-2026-0041',
          primary_bag_barcode: 'BB-98745612301',
          bag_type: 'triple',
          volume_ml: 450,
          collection_status: 'completed',
          phlebotomist_name: 'Nurse Savitri Devi',
          collection_started_at: '2026-10-12T08:30:00Z',
          components_separated: ['PRBC-8812', 'FFP-8813', 'PLT-8814']
        },
        {
          id: 'col-02',
          donation_number: 'BLD-2026-0190',
          donor_name: 'Kavita Murthy',
          donor_code: 'DNR-2026-0043',
          primary_bag_barcode: 'BB-98745612302',
          bag_type: 'double',
          volume_ml: 350,
          collection_status: 'completed',
          phlebotomist_name: 'Nurse Savitri Devi',
          collection_started_at: '2026-10-12T09:15:00Z',
          components_separated: ['PRBC-8815', 'FFP-8816']
        }
      ]
    };
  },

  // 5.3 Component Inventory
  async getComponents() {
    const remote = await apiFetch('/blood-bank/components');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'cmp-01',
          component_barcode: 'PRBC-2026-0914',
          component_type: 'prbc',
          abo_group: 'O',
          rh_factor: 'positive',
          volume_ml: 280,
          status: 'safe_for_release',
          storage_location: 'Refrig-01 (Shelf A)',
          storage_min_temp_c: 2.0,
          storage_max_temp_c: 6.0,
          current_temp_c: 3.8,
          expires_at: '2026-11-16T12:00:00Z'
        },
        {
          id: 'cmp-02',
          component_barcode: 'FFP-2026-0915',
          component_type: 'ffp',
          abo_group: 'O',
          rh_factor: 'positive',
          volume_ml: 220,
          status: 'safe_for_release',
          storage_location: 'DeepFreezer-02 (Bin 3)',
          storage_min_temp_c: -40.0,
          storage_max_temp_c: -30.0,
          current_temp_c: -34.5,
          expires_at: '2027-10-12T12:00:00Z'
        },
        {
          id: 'cmp-03',
          component_barcode: 'PLT-2026-0916',
          component_type: 'platelets',
          abo_group: 'O',
          rh_factor: 'positive',
          volume_ml: 65,
          status: 'reserved',
          storage_location: 'Agitator-01',
          storage_min_temp_c: 20.0,
          storage_max_temp_c: 24.0,
          current_temp_c: 22.1,
          requires_agitator: true,
          expires_at: '2026-10-17T12:00:00Z'
        },
        {
          id: 'cmp-04',
          component_barcode: 'PRBC-2026-0920',
          component_type: 'prbc',
          abo_group: 'B',
          rh_factor: 'negative',
          volume_ml: 290,
          status: 'quarantined',
          storage_location: 'Quarantine-Cold-01',
          storage_min_temp_c: 2.0,
          storage_max_temp_c: 6.0,
          current_temp_c: 4.1,
          expires_at: '2026-11-18T12:00:00Z'
        }
      ]
    };
  },

  // 5.4 Serology & Safe Release
  async getSerologyWorkbench() {
    const remote = await apiFetch('/blood-bank/serology-workbench');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          donation_id: 'col-01',
          donation_number: 'BLD-2026-0189',
          donor_name: 'Rahul Debnath',
          blood_group_claimed: 'O+',
          dual_grouping: {
            technician1: 'Tech Anirban Das',
            technician2: 'Tech Sourav Paul',
            concur: true,
            verified: true,
            determined_group: 'O Positive'
          },
          tti_tests: [
            { name: 'HIV 1 & 2', result: 'non_reactive', method: 'ELISA / 4th Gen' },
            { name: 'Hepatitis B (HBsAg)', result: 'non_reactive', method: 'ELISA' },
            { name: 'Hepatitis C (HCV)', result: 'non_reactive', method: 'ELISA' },
            { name: 'Syphilis (VDRL/RPR)', result: 'non_reactive', method: 'Flocculation' },
            { name: 'Malaria', result: 'non_reactive', method: 'Antigen Card' }
          ],
          release_authorization: {
            status: 'approved_for_release',
            authorized_by: 'Dr. Meenakshi Sundaram (Blood Bank Officer)',
            authorized_at: '2026-10-12T11:00:00Z',
            dual_grouping_verified: true,
            all_tti_non_reactive: true
          }
        },
        {
          donation_id: 'col-02',
          donation_number: 'BLD-2026-0190',
          donor_name: 'Kavita Murthy',
          blood_group_claimed: 'B-',
          dual_grouping: {
            technician1: 'Tech Anirban Das',
            technician2: 'Tech Sourav Paul',
            concur: true,
            verified: true,
            determined_group: 'B Negative'
          },
          tti_tests: [
            { name: 'HIV 1 & 2', result: 'non_reactive', method: 'ELISA' },
            { name: 'Hepatitis B (HBsAg)', result: 'non_reactive', method: 'ELISA' },
            { name: 'Hepatitis C (HCV)', result: 'non_reactive', method: 'ELISA' },
            { name: 'Syphilis (VDRL/RPR)', result: 'testing_pending', method: 'Pending' },
            { name: 'Malaria', result: 'non_reactive', method: 'Antigen Card' }
          ],
          release_authorization: {
            status: 'quarantined',
            notes: 'Awaiting Syphilis test completion; all 5 mandatory TTI markers required'
          }
        }
      ]
    };
  },

  // 5.5 Requisitions & Crossmatching
  async getRequisitions() {
    const remote = await apiFetch('/blood-bank/requisitions');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'req-01',
          requisition_number: 'REQ-2026-0310',
          patient_name: 'Devika Sengupta',
          patient_uhid: 'UHID-2026-0814',
          patient_blood_group: 'B+',
          requested_component: 'prbc',
          units_requested: 2,
          units_reserved: 1,
          units_issued: 0,
          urgency: 'urgent',
          clinical_indication: 'Severe anemia secondary to surgical intervention',
          status: 'partially_fulfilled',
          crossmatch: {
            crossmatch_id: 'XM-2026-0901',
            component_barcode: 'PRBC-2026-0899',
            major_result: 'compatible',
            compatibility: 'compatible',
            technique: 'Gel Card (AHG)',
            tested_at: '2026-10-12T09:45:00Z',
            is_expired: false,
            unit_blood_group: 'B Positive'
          }
        },
        {
          id: 'req-02',
          requisition_number: 'REQ-2026-0311',
          patient_name: 'Vikramaditya Bose',
          patient_uhid: 'UHID-2026-1180',
          patient_blood_group: 'A-',
          requested_component: 'prbc',
          units_requested: 1,
          units_reserved: 0,
          units_issued: 0,
          urgency: 'routine',
          clinical_indication: 'Total Knee Replacement pre-op reserve',
          status: 'sample_received',
          crossmatch: null
        }
      ]
    };
  },

  // 5.6 Issue & Handover
  async getIssues() {
    const remote = await apiFetch('/blood-bank/issues');
    if (remote && remote.data) return { data: remote.data, isMock: false };

    return {
      isMock: true,
      data: [
        {
          id: 'iss-01',
          issue_number: 'ISS-2026-0088',
          requisition_number: 'REQ-2026-0305',
          patient_name: 'Meera Mukherjee',
          patient_uhid: 'UHID-2026-0772',
          ward_name: 'Cardiothoracic OT 2',
          component_barcode: 'PRBC-2026-0710',
          component_type: 'prbc',
          blood_group: 'O Positive',
          crossmatch_status: 'compatible',
          issued_at: '2026-10-12T10:15:00Z',
          dispatched_by: 'Tech Anirban Das',
          received_by: 'Staff Nurse R. Thomas (OT)',
          cold_chain_carrier_id: 'BOX-CTOT-04',
          dispatch_temp_c: 4.2,
          handover_status: 'dispatched',
          verification_checklist: {
            patient_id_verified: true,
            blood_group_matched: true,
            expiry_date_verified: true,
            visual_inspection_clear: true,
            transport_box_chilled: true
          }
        },
        {
          id: 'iss-02',
          issue_number: 'ISS-2026-0089',
          requisition_number: 'REQ-2026-0306',
          patient_name: 'Aniruddha Sen',
          patient_uhid: 'UHID-2026-0640',
          ward_name: 'Emergency Resuscitation 1',
          component_barcode: 'FFP-2026-0520',
          component_type: 'ffp',
          blood_group: 'A Positive',
          crossmatch_status: 'compatible',
          issued_at: '2026-10-12T08:50:00Z',
          dispatched_by: 'Tech Sourav Paul',
          received_by: 'Dr. K. Nair (Trauma Fellow)',
          cold_chain_carrier_id: 'BOX-EMERG-02',
          dispatch_temp_c: 3.8,
          handover_status: 'transfusion_started',
          verification_checklist: {
            patient_id_verified: true,
            blood_group_matched: true,
            expiry_date_verified: true,
            visual_inspection_clear: true,
            transport_box_chilled: true
          }
        }
      ]
    };
  },

  // 5.7 Blood Bank Mutations
  async createDonor(donorData) {
    return await apiFetch('/blood-bank/donors', {
      method: 'POST',
      body: JSON.stringify(donorData)
    });
  },

  async recordScreening(screeningData) {
    return await apiFetch('/blood-bank/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData)
    });
  },

  async createCollection(collectionData) {
    return await apiFetch('/blood-bank/donations', {
      method: 'POST',
      body: JSON.stringify(collectionData)
    });
  },

  async createComponents(componentData) {
    return await apiFetch('/blood-bank/components', {
      method: 'POST',
      body: JSON.stringify(componentData)
    });
  },

  async recordGrouping(groupingData) {
    return await apiFetch('/blood-bank/grouping-verifications', {
      method: 'POST',
      body: JSON.stringify(groupingData)
    });
  },

  async recordSerologyTest(testData) {
    return await apiFetch('/blood-bank/serology-tests', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  },

  async authorizeSafeRelease(authData) {
    return await apiFetch('/blood-bank/release-authorizations', {
      method: 'POST',
      body: JSON.stringify(authData)
    });
  },

  async createRequisition(reqData) {
    return await apiFetch('/blood-bank/requisitions', {
      method: 'POST',
      body: JSON.stringify(reqData)
    });
  },

  async recordCrossmatch(xmData) {
    return await apiFetch('/blood-bank/crossmatches', {
      method: 'POST',
      body: JSON.stringify(xmData)
    });
  },

  async reserveComponent(reservationData) {
    return await apiFetch('/blood-bank/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  },

  async cancelReservation(cancellationData) {
    return await apiFetch('/blood-bank/reservations/cancel', {
      method: 'POST',
      body: JSON.stringify(cancellationData)
    });
  },

  async issueBlood(issueData) {
    return await apiFetch('/blood-bank/issues', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  },

  async getAuditLogs(query = '') {
    const remote = await apiFetch(`/blood-bank/audit-logs${query ? '?' + query : ''}`);
    if (remote && remote.data) return { data: remote.data, isMock: false };
    return { data: [], isMock: false };
  }
};

