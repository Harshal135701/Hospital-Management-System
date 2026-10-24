const fs = require('fs');

let apiCode = fs.readFileSync('client/src/services/api.js', 'utf8');

// Normalize line endings to \n for matching, or match with regex
const deptRegex = /export const DepartmentService = \{[\s\S]*?async getDepartments\(\) \{[\s\S]*?return res\?\.data \|\| res \|\| \[\];\s*\}\s*\};/;

const newDeptAndServices = `export const DepartmentService = {
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

apiCode = apiCode.replace(deptRegex, newDeptAndServices);

fs.writeFileSync('client/src/services/api.js', apiCode, 'utf8');
console.log('Successfully updated DepartmentService, RoomService, DoctorAdminService in api.js');
