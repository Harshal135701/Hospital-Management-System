const repository = require("./enterprise.repository");
const ApiError = require("../../utils/ApiError");

// 15.1 Hospital & Branch Master
async function createHospital(data) {
  if (!data.name) throw ApiError.badRequest("Hospital name is required");
  if (!data.code) {
    data.code = `HOSP-${Date.now().toString(36).toUpperCase()}`;
  }
  return repository.createHospital(data);
}

async function getHospitals() {
  return repository.getHospitals();
}

async function createBranch(hospitalId, data) {
  if (!data.branch_name) throw ApiError.badRequest("branch_name is required");
  if (!data.branch_code) {
    data.branch_code = `BR-${Date.now().toString(36).toUpperCase()}`;
  }
  return repository.createBranch(hospitalId, data);
}

async function getBranches(filters) {
  return repository.getBranches(filters);
}

// 15.2 Department & Clinic Hierarchy
async function createClinic(data) {
  if (!data.department_id || !data.clinic_name) {
    throw ApiError.badRequest("department_id and clinic_name are required");
  }
  return repository.createClinic(data);
}

async function getClinics(filters) {
  return repository.getClinics(filters);
}

async function getFullHierarchy() {
  return repository.getFullHierarchy();
}

// 15.3 Doctor & Consultant Master
async function createDoctor(data) {
  if (!data.full_name || !data.mobile || !data.department_id) {
    throw ApiError.badRequest("full_name, mobile, and department_id are required");
  }
  if (!data.employee_code) {
    data.employee_code = `DOC-${Date.now().toString(36).toUpperCase()}`;
  }
  return repository.createDoctor(data);
}

async function getDoctors(filters) {
  return repository.getDoctors(filters);
}

async function getDoctorById(id) {
  const doc = await repository.getDoctorById(id);
  if (!doc) throw ApiError.notFound("Doctor not found");
  return doc;
}

async function updateDoctor(id, data) {
  const doc = await repository.updateDoctor(id, data);
  if (!doc) throw ApiError.notFound("Doctor not found");
  return doc;
}

// 15.4 Service Catalog & Tariff Master
async function createService(data) {
  if (!data.service_name || !data.category || data.standard_rate === undefined) {
    throw ApiError.badRequest("service_name, category, and standard_rate are required");
  }
  if (!data.service_code) {
    data.service_code = `SRV-${Date.now().toString(36).toUpperCase()}`;
  }
  return repository.createService(data);
}

async function getServices(filters) {
  return repository.getServices(filters);
}

async function updateService(id, data) {
  const service = await repository.updateService(id, data);
  if (!service) throw ApiError.notFound("Enterprise service not found");
  return service;
}

// 15.5 Corporate Tariff Rate Contracts
async function createCorporateTariff(data) {
  if (!data.corporate_name || !data.service_id || data.agreed_rate === undefined || !data.end_date) {
    throw ApiError.badRequest("corporate_name, service_id, agreed_rate, and end_date are required");
  }
  return repository.createCorporateTariff(data);
}

async function getCorporateTariffs(filters) {
  return repository.getCorporateTariffs(filters);
}

async function updateCorporateTariff(id, data) {
  const tariff = await repository.updateCorporateTariff(id, data);
  if (!tariff) throw ApiError.notFound("Corporate tariff contract not found");
  return tariff;
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
