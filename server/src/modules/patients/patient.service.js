const patientRepository = require('./patient.repository');
const ApiError = require('../../utils/ApiError');

class PatientService {
  async getAllPatients(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await patientRepository.findAll({ search: query?.search, limit, offset });
  }

  async getPatientByUhid(uhid) {
    const patient = await patientRepository.findByUhid(uhid);
    if (!patient) {
      throw ApiError.notFound(`Patient with UHID '${uhid}' not found`);
    }
    return patient;
  }

  async getPatientById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw ApiError.notFound(`Patient with ID '${id}' not found`);
    }
    return patient;
  }

  async createPatient(data) {
    // Generate UHID if not provided: UHID-YYYY-XXXX
    let uhid = data.uhid;
    if (!uhid) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      uhid = `UHID-${year}-${rand}`;
    }

    const existing = await patientRepository.findByUhid(uhid);
    if (existing) {
      throw ApiError.conflict(`Patient with UHID '${uhid}' already exists`);
    }

    return await patientRepository.create({
      uhid,
      full_name: data.full_name,
      mobile: data.mobile,
      date_of_birth: data.date_of_birth,
      gender: data.gender
    });
  }
}

module.exports = new PatientService();
