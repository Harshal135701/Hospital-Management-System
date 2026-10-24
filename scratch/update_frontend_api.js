const fs = require('fs');

let apiCode = fs.readFileSync('client/src/services/api.js', 'utf8');

// 1. Update PatientService
const oldCreatePatient = `  async createPatient(data) {
    if (TokenManager.getToken()) {
      // Authenticated production mode: POST to backend API
      const payload = {
        full_name: data.full_name ? String(data.full_name).trim() : '',
        mobile: data.mobile ? String(data.mobile).trim() : '',
        ...(data.date_of_birth ? { date_of_birth: data.date_of_birth } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.uhid ? { uhid: String(data.uhid).trim() } : {})
      };
      const res = await apiFetch('/patients', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res?.data || res;
    }`;

const newCreatePatient = `  async checkDuplicates(params) {
    if (!TokenManager.getToken()) return { isDuplicate: false, duplicates: [] };
    try {
      const res = await apiFetch('/patients/check-duplicates', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return res?.data || { isDuplicate: false, duplicates: [] };
    } catch {
      return { isDuplicate: false, duplicates: [] };
    }
  },

  async updatePatient(id, data) {
    if (!TokenManager.getToken()) return { success: true, data };
    const res = await apiFetch(\`/patients/\${encodeURIComponent(id)}\`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res?.data || res;
  },

  async createPatient(data) {
    if (TokenManager.getToken()) {
      // Authenticated production mode: POST to backend API with complete demographic payload
      const payload = {
        full_name: data.full_name ? String(data.full_name).trim() : '',
        mobile: data.mobile ? String(data.mobile).trim() : '',
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || 'other',
        uhid: data.uhid ? String(data.uhid).trim() : undefined,
        alt_mobile: data.alt_mobile ? String(data.alt_mobile).trim() : null,
        email: data.email ? String(data.email).trim() : null,
        address: data.address ? String(data.address).trim() : null,
        city: data.city ? String(data.city).trim() : null,
        district: data.district ? String(data.district).trim() : null,
        state: data.state ? String(data.state).trim() : null,
        pin_code: data.pin_code ? String(data.pin_code).trim() : null,
        emergency_name: data.emergency_name ? String(data.emergency_name).trim() : null,
        emergency_relationship: data.emergency_relationship ? String(data.emergency_relationship).trim() : null,
        emergency_phone: data.emergency_phone ? String(data.emergency_phone).trim() : null,
        blood_group: data.blood_group || null,
        rh_factor: data.rh_factor || null,
        allergies: data.allergies || null,
        high_risk: Boolean(data.high_risk)
      };
      const res = await apiFetch('/patients', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res?.data || res;
    }`;

apiCode = apiCode.replace(oldCreatePatient, newCreatePatient);

// 2. Update DepartmentService
const oldDept = `export const DepartmentService = {
  async getDepartments() {
    if (!TokenManager.getToken()) {
      return [];
    }
    const res = await apiFetch('/departments');
    return res?.data || res || [];
  }
};`;

const newDept = `export const DepartmentService = {
  async getDepartments() {
    if (!TokenManager.getToken()) {
      return [];
    }
    const res = await apiFetch('/departments');
    return res?.data || res || [];
  },
  async createDepartment(data) {
    const res = await apiFetch('/departments', { method: 'POST', body: JSON.stringify(data) });
    return res?.data || res;
  },
  async updateDepartment(id, data) {
    const res = await apiFetch(\`/departments/\${encodeURIComponent(id)}\`, { method: 'PUT', body: JSON.stringify(data) });
    return res?.data || res;
  },
  async toggleStatus(id, isActive) {
    const res = await apiFetch(\`/departments/\${encodeURIComponent(id)}/status\`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
    return res?.data || res;
  }
};

export const RoomService = {
  async getRooms(departmentId = null) {
    if (!TokenManager.getToken()) return [];
    const qs = departmentId ? \`?department_id=\${encodeURIComponent(departmentId)}\` : '';
    const res = await apiFetch(\`/rooms\${qs}\`);
    return res?.data || [];
  },
  async createRoom(data) {
    const res = await apiFetch('/rooms', { method: 'POST', body: JSON.stringify(data) });
    return res?.data || res;
  },
  async updateRoom(id, data) {
    const res = await apiFetch(\`/rooms/\${encodeURIComponent(id)}\`, { method: 'PUT', body: JSON.stringify(data) });
    return res?.data || res;
  }
};

export const DoctorAdminService = {
  async getDoctors(departmentId = null) {
    if (!TokenManager.getToken()) return [];
    const qs = departmentId ? \`?department_id=\${encodeURIComponent(departmentId)}\` : '';
    const res = await apiFetch(\`/doctors\${qs}\`);
    return res?.data || [];
  },
  async createDoctor(data) {
    const res = await apiFetch('/doctors', { method: 'POST', body: JSON.stringify(data) });
    return res?.data || res;
  },
  async updateDoctor(id, data) {
    const res = await apiFetch(\`/doctors/\${encodeURIComponent(id)}\`, { method: 'PUT', body: JSON.stringify(data) });
    return res?.data || res;
  }
};`;

apiCode = apiCode.replace(oldDept, newDept);

// 3. Update BillingOpsService with donor compensations
const oldSettlement = `  async closeSettlement(data) {
    return this.createSettlement(data);
  }
};`;

const newSettlement = `  async closeSettlement(data) {
    return this.createSettlement(data);
  },
  async getDonorCompensations(donorCode = null) {
    try {
      const qs = donorCode ? \`?donorCode=\${encodeURIComponent(donorCode)}\` : '';
      const res = await apiFetch(\`/billing/donor-compensations\${qs}\`);
      return res?.data || [];
    } catch {
      return [];
    }
  },
  async disburseDonorCompensation(data) {
    const res = await apiFetch('/billing/donor-compensations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res?.data || res;
  }
};`;

apiCode = apiCode.replace(oldSettlement, newSettlement);

// 4. Update OperationsQueueService with batch reminders
const oldNotif = `  async cancelPendingNotifications(appointmentId) {
    const res = await apiFetch(\`/notifications/appointments/\${encodeURIComponent(appointmentId)}/cancel-pending\`, { method: 'PATCH' });
    return res;
  }
};`;

const newNotif = `  async cancelPendingNotifications(appointmentId) {
    const res = await apiFetch(\`/notifications/appointments/\${encodeURIComponent(appointmentId)}/cancel-pending\`, { method: 'PATCH' });
    return res;
  },
  async getAppointmentsByDate(date) {
    try {
      const res = await apiFetch(\`/notifications/appointments-by-date?date=\${encodeURIComponent(date)}\`);
      return res?.data || [];
    } catch {
      return [];
    }
  },
  async sendRemindersForDate(date, appointmentIds = null) {
    const res = await apiFetch('/notifications/batch-reminders', {
      method: 'POST',
      body: JSON.stringify({ date, appointmentIds })
    });
    return res?.data || res;
  }
};

export const NotificationService = {
  getNotifications: (params) => OperationsQueueService.getNotifications(params),
  getAppointmentsByDate: (date) => OperationsQueueService.getAppointmentsByDate(date),
  sendRemindersForDate: (date, appointmentIds) => OperationsQueueService.sendRemindersForDate(date, appointmentIds),
  sendNotification: (id) => OperationsQueueService.sendNotification(id),
  scheduleReminders: (appointmentId) => OperationsQueueService.scheduleReminders(appointmentId),
  scheduleEvent: (appointmentId, eventType, channels, scheduledAt) => OperationsQueueService.scheduleEvent(appointmentId, eventType, channels, scheduledAt),
  cancelPendingNotifications: (appointmentId) => OperationsQueueService.cancelPendingNotifications(appointmentId)
};`;

apiCode = apiCode.replace(oldNotif, newNotif);

fs.writeFileSync('client/src/services/api.js', apiCode, 'utf8');
console.log('Successfully updated client/src/services/api.js');
