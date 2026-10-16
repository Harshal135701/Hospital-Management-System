/**
 * Central API Client and Typed Data Services
 * Integrates with existing backend /api endpoints and provides explicit demo-labeled mock adapters.
 */

const API_BASE = '/api';

const TOKEN_STORAGE_KEY = 'medicsprime_auth_token';
let currentAuthToken = null;

if (typeof window !== 'undefined' && window.sessionStorage) {
  try {
    currentAuthToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.warn('[Auth] sessionStorage inaccessible');
  }
}

export const TokenManager = {
  getToken() {
    if (!currentAuthToken && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        currentAuthToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      } catch (e) {}
    }
    return currentAuthToken;
  },
  setToken(token) {
    currentAuthToken = token;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        if (token) {
          window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (e) {
        console.warn('[Auth] Failed to set token in sessionStorage');
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:state-change', { detail: { token } }));
    }
  },
  clearToken() {
    this.setToken(null);
  }
};

const MOCK_PATIENTS = [
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
];

// Reusable fetch wrapper with automatic Authorization header
async function apiFetch(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = TokenManager.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        const hadToken = Boolean(token);
        TokenManager.clearToken();
        // Only broadcast auth:unauthorized to trigger the login prompt if the client
        // actually sent a token that was rejected (session expired / revoked).
        // Never trigger login prompt on background unauthenticated requests.
        if (typeof window !== 'undefined' && hadToken) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized', {
            detail: {
              endpoint,
              code: data.code,
              message: 'Your staff session has expired or was revoked. Please sign in again.'
            }
          }));
        }
      }
      const err = new Error(data.message || `Request failed with status ${res.status}`);
      err.code = data.code;
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
    if (!TokenManager.getToken()) {
      return { isMock: true, data: MOCK_PATIENTS };
    }
    try {
      const remote = await apiFetch('/patients');
      if (remote && remote.data) return { data: remote.data, isMock: false };
    } catch (err) {
      console.warn('[PatientService] Live patient fetch failed, falling back to census mock:', err.message);
    }
    return { isMock: true, data: MOCK_PATIENTS };
  },

  async getPatientByUhid(uhid) {
    if (!TokenManager.getToken()) {
      const found = MOCK_PATIENTS.find(p => p.uhid.toLowerCase() === String(uhid).toLowerCase());
      if (found) return found;
      return null;
    }
    try {
      const remote = await apiFetch(`/patients/${encodeURIComponent(uhid)}`);
      return remote?.data || remote;
    } catch (err) {
      const found = MOCK_PATIENTS.find(p => p.uhid.toLowerCase() === String(uhid).toLowerCase());
      if (found) return found;
      throw err;
    }
  },

  async searchPatients(query) {
    if (!query || !query.trim()) {
      return [];
    }
    if (!TokenManager.getToken()) {
      const q = query.trim().toLowerCase();
      return MOCK_PATIENTS.filter(p =>
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.mobile && p.mobile.includes(q))
      );
    }
    // Strict contract: GET /api/patients?search=...
    const res = await apiFetch(`/patients?search=${encodeURIComponent(query.trim())}`);
    return res?.data || res || [];
  }
};

export const AppointmentService = {
  async getAppointments(filters = {}) {
    if (!TokenManager.getToken()) {
      return [];
    }
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.status) params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await apiFetch(`/appointments${qs}`);
      return res?.data || res || [];
    } catch (err) {
      console.warn('[AppointmentService] Fetch failed:', err.message);
      return [];
    }
  },

  async getAppointmentById(id) {
    const res = await apiFetch(`/appointments/${encodeURIComponent(id)}`);
    return res?.data || res;
  },

  async createAppointment(data) {
    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res?.data || res;
  },

  async rescheduleAppointment(id, data) {
    const res = await apiFetch(`/appointments/${encodeURIComponent(id)}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res?.data || res;
  },

  async cancelAppointment(id, reason) {
    const res = await apiFetch(`/appointments/${encodeURIComponent(id)}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return res?.data || res;
  },

  async updateAppointmentStatus(id, status, details = {}) {
    const res = await apiFetch(`/appointments/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        cancellation_reason: details.cancellation_reason || details.reason || null,
        notes: details.notes || null,
      })
    });
    return res?.data || res;
  },

  async getAvailableSlots(doctorId, date, duration = 15) {
    const res = await apiFetch(
      `/appointments/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}&duration=${duration}`
    );
    return res?.data || res;
  },

  async getPatientHistory(patientId) {
    const res = await apiFetch(`/appointments/patient/${encodeURIComponent(patientId)}`);
    return res?.data || res || [];
  }
};

export const AppointmentBloodRequestService = {
  async getBloodRequests(params = {}) {
    if (!TokenManager.getToken()) {
      return [];
    }
    const query = new URLSearchParams();
    if (params.patient_id) query.append('patient_id', params.patient_id);
    if (params.appointment_id) query.append('appointment_id', params.appointment_id);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    try {
      const res = await apiFetch(`/blood-requests${qs}`);
      return res?.data || res || [];
    } catch (err) {
      console.warn('[AppointmentBloodRequestService] Fetch failed:', err.message);
      return [];
    }
  },

  async getBloodRequestById(id) {
    const res = await apiFetch(`/blood-requests/${encodeURIComponent(id)}`);
    return res?.data || res;
  },

  async createBloodRequest(data) {
    const res = await apiFetch('/blood-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res?.data || res;
  },

  async updateBloodRequestStatus(id, status, notes) {
    const res = await apiFetch(`/blood-requests/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    return res?.data || res;
  }
};

export const DepartmentService = {
  async getDepartments() {
    if (!TokenManager.getToken()) {
      return [];
    }
    const res = await apiFetch('/departments');
    return res?.data || res || [];
  }
};

/* ==========================================================================
   CLINICAL STAFF & INPATIENT WARDS SERVICES
   ========================================================================== */

export const ClinicalStaffService = {
  async getStaff(departmentId = null) {
    if (!TokenManager.getToken()) {
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
            phone: '+91 98322 66303',
            imageKey: 'surgeonStaff'
          },
          {
            id: 'doc-04',
            name: 'Dr. Sunita Rao',
            role: 'Lead General Physician',
            specialty: 'Internal Medicine & Critical Care',
            department: 'General Medicine',
            qualification: 'MD (General Medicine)',
            room: 'Room 105, OPD Block A',
            shift: '10:00 – 18:00',
            status: 'available',
            active_patients_today: 18,
            phone: '+91 98333 77404',
            imageKey: 'femaleDoctor'
          },
          {
            id: 'doc-05',
            name: 'Dr. Meenakshi Sundaram',
            role: 'Consultant Haematologist',
            specialty: 'Transfusion Medicine & Immunohematology',
            department: 'Haematology & Blood Bank',
            qualification: 'MD, DNB (Haematology)',
            room: 'Blood Bank Block, Rm 12',
            shift: '09:00 – 17:00',
            status: 'on_duty',
            active_patients_today: 7,
            phone: '+91 98344 88505',
            imageKey: 'doctorWithStethoscope'
          }
        ]
      };
    }

    const qs = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
    const remote = await apiFetch(`/doctors${qs}`);
    if (remote && remote.data) return { data: remote.data, isMock: false };
    return { data: remote || [], isMock: false };
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
  async getDonors(query = '') {
    const remote = await apiFetch(`/blood-bank/donors${query ? '?' + query : ''}`);
    return { data: remote?.data || [], isMock: false };
  },

  async getDonorById(id) {
    const remote = await apiFetch(`/blood-bank/donors/${id}`);
    return { data: remote?.data || null, isMock: false };
  },

  // 5.2 Collections
  async getCollections(query = '') {
    const remote = await apiFetch(`/blood-bank/donations${query ? '?' + query : ''}`);
    return { data: remote?.data || [], isMock: false };
  },

  // 5.3 Component Inventory
  async getComponents(query = '') {
    if (!TokenManager.getToken()) {
      return { data: [], isMock: true };
    }
    try {
      const remote = await apiFetch(`/blood-bank/components${query ? '?' + query : ''}`);
      return { data: remote?.data || [], isMock: false };
    } catch (err) {
      console.warn('[BloodBankService] getComponents fetch failed:', err.message);
      return { data: [], isMock: true };
    }
  },

  // 5.4 Serology & Safe Release
  async getSerologyWorkbench() {
    const remote = await apiFetch('/blood-bank/serology-workbench');
    return { data: remote?.data || [], isMock: false };
  },

  // 5.5 Requisitions & Crossmatching
  async getRequisitions(query = '') {
    const remote = await apiFetch(`/blood-bank/requisitions${query ? '?' + query : ''}`);
    return { data: remote?.data || [], isMock: false };
  },

  // 5.6 Issue & Handover
  async getIssues(query = '') {
    const remote = await apiFetch(`/blood-bank/issues${query ? '?' + query : ''}`);
    return { data: remote?.data || [], isMock: false };
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
  },

  async getStorageTemperatureLogs(query = '') {
    const remote = await apiFetch(`/blood-bank/storage-temperature-logs${query ? '?' + query : ''}`);
    return { data: remote?.data || [], isMock: false };
  },

  async recordStorageTemperatureLog(logData) {
    return await apiFetch('/blood-bank/storage-temperature-logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  }
};

/* ==========================================================================
   AUTHENTICATION & SESSION SERVICES
   ========================================================================== */

export const AuthService = {
  async login(email, password) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res?.data?.token) {
      TokenManager.setToken(res.data.token);
      if (typeof window !== 'undefined' && window.sessionStorage && res.data.user) {
        try {
          window.sessionStorage.setItem('medicsprime_auth_user', JSON.stringify(res.data.user));
        } catch (e) {}
      }
    }
    return res.data;
  },

  async logout() {
    try {
      if (TokenManager.getToken()) {
        await apiFetch('/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      console.warn('[Auth] Logout API call failed:', e.message);
    } finally {
      TokenManager.clearToken();
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.removeItem('medicsprime_auth_user');
        } catch (e) {}
      }
    }
  },

  getUser() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const u = window.sessionStorage.getItem('medicsprime_auth_user');
        return u ? JSON.parse(u) : null;
      } catch (e) {}
    }
    return null;
  },

  async getCurrentUser() {
    const res = await apiFetch('/auth/me');
    if (res?.data && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem('medicsprime_auth_user', JSON.stringify(res.data));
      } catch (e) {}
    }
    return res?.data;
  },

  async changePassword(current_password, new_password) {
    return await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
  },

  isAuthenticated() {
    return !!TokenManager.getToken();
  }
};

