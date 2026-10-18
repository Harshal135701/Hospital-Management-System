const pool = require("../../config/db");

// 15.1 Hospital & Branch Master
async function createHospital(data) {
  const {
    code,
    name,
    registration_number,
    gstin,
    pan_number,
    phone,
    email,
    address,
  } = data;

  const result = await pool.query(
    `INSERT INTO enterprise_hospitals (
      code,
      name,
      registration_number,
      gstin,
      pan_number,
      phone,
      email,
      address
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      code,
      name,
      registration_number || null,
      gstin || null,
      pan_number || null,
      phone || null,
      email || null,
      address || null,
    ]
  );
  return result.rows[0];
}

async function getHospitals() {
  const query = `
    SELECT 
      eh.*,
      COALESCE(
        json_agg(eb.*) FILTER (WHERE eb.id IS NOT NULL),
        '[]'
      ) AS branches
    FROM enterprise_hospitals eh
    LEFT JOIN enterprise_branches eb ON eb.hospital_id = eh.id
    GROUP BY eh.id
    ORDER BY eh.created_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function createBranch(hospitalId, data) {
  const {
    branch_code,
    branch_name,
    city,
    state,
    address,
    contact_number,
    is_headquarters = false,
  } = data;

  const result = await pool.query(
    `INSERT INTO enterprise_branches (
      hospital_id,
      branch_code,
      branch_name,
      city,
      state,
      address,
      contact_number,
      is_headquarters
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      hospitalId,
      branch_code,
      branch_name,
      city || null,
      state || null,
      address || null,
      contact_number || null,
      is_headquarters,
    ]
  );
  return result.rows[0];
}

async function getBranches(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.hospital_id) {
    values.push(filters.hospital_id);
    conditions.push(`hospital_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM enterprise_branches ${whereClause} ORDER BY branch_name ASC`;
  const result = await pool.query(query, values);
  return result.rows;
}

// 15.2 Department & Clinic Hierarchy
async function createClinic(data) {
  const {
    branch_id,
    department_id,
    clinic_name,
    floor_wing,
    head_doctor_id,
    clinic_type = "OPD",
  } = data;

  const result = await pool.query(
    `INSERT INTO enterprise_clinics (
      branch_id,
      department_id,
      clinic_name,
      floor_wing,
      head_doctor_id,
      clinic_type
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      branch_id || null,
      department_id,
      clinic_name,
      floor_wing || null,
      head_doctor_id || null,
      clinic_type,
    ]
  );
  return result.rows[0];
}

async function getClinics(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.department_id) {
    values.push(filters.department_id);
    conditions.push(`ec.department_id = $${values.length}`);
  }
  if (filters.branch_id) {
    values.push(filters.branch_id);
    conditions.push(`ec.branch_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT 
      ec.*,
      dep.name AS department_name,
      eb.branch_name,
      d.full_name AS head_doctor_name
    FROM enterprise_clinics ec
    JOIN departments dep ON dep.id = ec.department_id
    LEFT JOIN enterprise_branches eb ON eb.id = ec.branch_id
    LEFT JOIN doctors d ON d.id = ec.head_doctor_id
    ${whereClause}
    ORDER BY ec.clinic_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getFullHierarchy() {
  const [hospitals, departments, clinics, doctors] = await Promise.all([
    pool.query(`SELECT * FROM enterprise_hospitals WHERE is_active = true`),
    pool.query(`SELECT * FROM departments WHERE is_active = true`),
    pool.query(`SELECT * FROM enterprise_clinics WHERE is_active = true`),
    pool.query(`SELECT id, employee_code, full_name, department_id, is_active FROM doctors WHERE is_active = true`),
  ]);

  return {
    hospitals: hospitals.rows,
    departments: departments.rows,
    clinics: clinics.rows,
    doctors: doctors.rows,
  };
}

// 15.3 Doctor & Consultant Master
async function createDoctor(data) {
  const { employee_code, full_name, mobile, department_id, room_id, is_active = true } = data;
  const result = await pool.query(
    `INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [employee_code, full_name, mobile, department_id, room_id || null, is_active]
  );
  return result.rows[0];
}

async function getDoctors(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.department_id) {
    values.push(filters.department_id);
    conditions.push(`d.department_id = $${values.length}`);
  }
  if (filters.is_active !== undefined) {
    values.push(filters.is_active === "true" || filters.is_active === true);
    conditions.push(`d.is_active = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT d.*, dep.name AS department_name, dep.code AS department_code, r.room_number
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    ${whereClause}
    ORDER BY d.full_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getDoctorById(id) {
  const query = `
    SELECT d.*, dep.name AS department_name, dep.code AS department_code, r.room_number
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE d.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateDoctor(id, data) {
  const { full_name, mobile, department_id, room_id, is_active } = data;
  const result = await pool.query(
    `UPDATE doctors
     SET 
       full_name = COALESCE($2, full_name),
       mobile = COALESCE($3, mobile),
       department_id = COALESCE($4, department_id),
       room_id = COALESCE($5, room_id),
       is_active = COALESCE($6, is_active)
     WHERE id = $1
     RETURNING *`,
    [id, full_name, mobile, department_id, room_id, is_active]
  );
  return result.rows[0] || null;
}

// 15.4 Service Catalog & Tariff Master
async function createService(data) {
  const {
    service_code,
    service_name,
    category,
    standard_rate,
    tax_percent = 0,
    is_package = false,
  } = data;

  const result = await pool.query(
    `INSERT INTO enterprise_services (
      service_code,
      service_name,
      category,
      standard_rate,
      tax_percent,
      is_package
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [service_code, service_name, category, standard_rate, tax_percent, is_package]
  );
  return result.rows[0];
}

async function getServices(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.category) {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }
  if (filters.is_active !== undefined) {
    values.push(filters.is_active === "true" || filters.is_active === true);
    conditions.push(`is_active = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM enterprise_services ${whereClause} ORDER BY category, service_name ASC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateService(id, data) {
  const { service_name, category, standard_rate, tax_percent, is_active } = data;
  const result = await pool.query(
    `UPDATE enterprise_services
     SET 
       service_name = COALESCE($2, service_name),
       category = COALESCE($3, category),
       standard_rate = COALESCE($4, standard_rate),
       tax_percent = COALESCE($5, tax_percent),
       is_active = COALESCE($6, is_active)
     WHERE id = $1
     RETURNING *`,
    [id, service_name, category, standard_rate, tax_percent, is_active]
  );
  return result.rows[0] || null;
}

// 15.5 Corporate Tariff Rate Contracts
async function createCorporateTariff(data) {
  const {
    corporate_name,
    policy_code,
    service_id,
    agreed_rate,
    discount_percent = 0,
    start_date,
    end_date,
  } = data;

  const result = await pool.query(
    `INSERT INTO enterprise_corporate_tariffs (
      corporate_name,
      policy_code,
      service_id,
      agreed_rate,
      discount_percent,
      start_date,
      end_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      corporate_name,
      policy_code || null,
      service_id,
      agreed_rate,
      discount_percent,
      start_date || new Date(),
      end_date,
    ]
  );
  return result.rows[0];
}

async function getCorporateTariffs(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.corporate_name) {
    values.push(`%${filters.corporate_name}%`);
    conditions.push(`ect.corporate_name ILIKE $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT 
      ect.*,
      es.service_name,
      es.service_code,
      es.standard_rate
    FROM enterprise_corporate_tariffs ect
    JOIN enterprise_services es ON es.id = ect.service_id
    ${whereClause}
    ORDER BY ect.corporate_name, es.service_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateCorporateTariff(id, data) {
  const { agreed_rate, discount_percent, end_date, is_active } = data;
  const result = await pool.query(
    `UPDATE enterprise_corporate_tariffs
     SET 
       agreed_rate = COALESCE($2, agreed_rate),
       discount_percent = COALESCE($3, discount_percent),
       end_date = COALESCE($4, end_date),
       is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING *`,
    [id, agreed_rate, discount_percent, end_date, is_active]
  );
  return result.rows[0] || null;
}

module.exports = {
  createHospital,
  getHospitals,
  createBranch,
  getBranches,
  createClinic,
  getClinics,
  getFullHierarchy,
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  createService,
  getServices,
  updateService,
  createCorporateTariff,
  getCorporateTariffs,
  updateCorporateTariff,
};
