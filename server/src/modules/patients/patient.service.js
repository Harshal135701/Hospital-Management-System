const patientRepository = require('./patient.repository');
const ApiError = require('../../utils/ApiError');

const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
};

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

  async checkDuplicates({ mobile, full_name, date_of_birth }) {
    const normMobile = normalizePhone(mobile);
    const existing = await patientRepository.findByMobile(normMobile);

    const strongMatch = existing.find(p =>
      p.full_name.toLowerCase().trim() === (full_name || '').toLowerCase().trim() &&
      String(p.date_of_birth || '').slice(0, 10) === String(date_of_birth || '').slice(0, 10)
    );

    return {
      hasExactMatch: Boolean(strongMatch),
      exactMatch: strongMatch || null,
      hasSharedMobile: existing.length > 0 && !strongMatch,
      familyMembers: existing.filter(p => p.id !== strongMatch?.id)
    };
  }

  async createPatient(data) {
    const normMobile = normalizePhone(data.mobile);
    if (!normMobile || normMobile.length !== 10) {
      throw ApiError.badRequest('Valid 10-digit primary mobile number is mandatory.');
    }

    if (!data.full_name || data.full_name.trim().length < 2) {
      throw ApiError.badRequest('Patient full name is required (minimum 2 characters).');
    }

    // Check duplicate identity
    const dupCheck = await this.checkDuplicates({
      mobile: normMobile,
      full_name: data.full_name,
      date_of_birth: data.date_of_birth
    });

    if (dupCheck.hasExactMatch) {
      throw ApiError.conflict(
        `Patient "${dupCheck.exactMatch.full_name}" is already registered under UHID ${dupCheck.exactMatch.uhid}.`
      );
    }

    // If shared mobile and no explicit confirmation provided
    if (dupCheck.hasSharedMobile && !data.allow_shared_mobile && !data.confirm_family_member) {
      throw ApiError.conflict(
        `Mobile ${normMobile} is registered to existing patient(s): ${dupCheck.familyMembers.map(f => `${f.full_name} (${f.uhid})`).join(', ')}. Please confirm registration as a separate family member.`
      );
    }

    // Generate UHID if not provided: UHID-YYYY-XXXX
    let uhid = data.uhid;
    if (!uhid) {
      const year = new Date().getFullYear();
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 10) {
        attempts++;
        const rand = Math.floor(1000 + Math.random() * 9000);
        const candidate = `UHID-${year}-${rand}`;
        const existing = await patientRepository.findByUhid(candidate);
        if (!existing) {
          uhid = candidate;
          unique = true;
        }
      }
      if (!uhid) {
        uhid = `UHID-${year}-${Date.now().toString().slice(-4)}`;
      }
    } else {
      const existing = await patientRepository.findByUhid(uhid);
      if (existing) {
        throw ApiError.conflict(`Patient with UHID '${uhid}' already exists.`);
      }
    }

    return await patientRepository.create({
      uhid,
      full_name: data.full_name.trim(),
      mobile: normMobile,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      alt_mobile: data.alt_mobile ? normalizePhone(data.alt_mobile) : null,
      email: data.email ? data.email.trim() : null,
      address: data.address ? data.address.trim() : null,
      city: data.city ? data.city.trim() : null,
      district: data.district ? data.district.trim() : null,
      state: data.state ? data.state.trim() : null,
      pin_code: data.pin_code ? data.pin_code.trim() : null,
      emergency_name: data.emergency_name ? data.emergency_name.trim() : null,
      emergency_relationship: data.emergency_relationship ? data.emergency_relationship.trim() : null,
      emergency_phone: data.emergency_phone ? normalizePhone(data.emergency_phone) : null,
      blood_group: data.blood_group || null,
      rh_factor: data.rh_factor || null,
      allergies: data.allergies ? data.allergies.trim() : null,
      high_risk: Boolean(data.high_risk)
    });
  }

  async updatePatient(id, data) {
    const existing = await patientRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Patient with ID '${id}' not found`);
    }

    let normMobile = existing.mobile;
    if (data.mobile) {
      normMobile = normalizePhone(data.mobile);
      if (!normMobile || normMobile.length !== 10) {
        throw ApiError.badRequest('Valid 10-digit primary mobile number is mandatory.');
      }
    }

    return await patientRepository.update(id, {
      full_name: data.full_name ? data.full_name.trim() : existing.full_name,
      mobile: normMobile,
      date_of_birth: data.date_of_birth || existing.date_of_birth,
      gender: data.gender || existing.gender,
      alt_mobile: data.alt_mobile !== undefined ? (data.alt_mobile ? normalizePhone(data.alt_mobile) : null) : existing.alt_mobile,
      email: data.email !== undefined ? (data.email ? data.email.trim() : null) : existing.email,
      address: data.address !== undefined ? (data.address ? data.address.trim() : null) : existing.address,
      city: data.city !== undefined ? (data.city ? data.city.trim() : null) : existing.city,
      district: data.district !== undefined ? (data.district ? data.district.trim() : null) : existing.district,
      state: data.state !== undefined ? (data.state ? data.state.trim() : null) : existing.state,
      pin_code: data.pin_code !== undefined ? (data.pin_code ? data.pin_code.trim() : null) : existing.pin_code,
      emergency_name: data.emergency_name !== undefined ? (data.emergency_name ? data.emergency_name.trim() : null) : existing.emergency_name,
      emergency_relationship: data.emergency_relationship !== undefined ? (data.emergency_relationship ? data.emergency_relationship.trim() : null) : existing.emergency_relationship,
      emergency_phone: data.emergency_phone !== undefined ? (data.emergency_phone ? normalizePhone(data.emergency_phone) : null) : existing.emergency_phone,
      blood_group: data.blood_group !== undefined ? data.blood_group : existing.blood_group,
      rh_factor: data.rh_factor !== undefined ? data.rh_factor : existing.rh_factor,
      allergies: data.allergies !== undefined ? (data.allergies ? data.allergies.trim() : null) : existing.allergies,
      high_risk: data.high_risk !== undefined ? Boolean(data.high_risk) : existing.high_risk
    });
  }
}

module.exports = new PatientService();
