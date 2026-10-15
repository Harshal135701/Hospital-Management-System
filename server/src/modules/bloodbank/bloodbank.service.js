const bloodBankRepository = require('./bloodbank.repository');
const patientRepository = require('../patients/patient.repository');
const authRepository = require('../auth/auth.repository');
const { verifyPassword } = require('../auth/auth.utils');
const ApiError = require('../../utils/ApiError');

class BloodBankService {
  // Helper for generating sequential/random clinical identifiers
  _generateCode(prefix) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  }

  // =========================================================================
  // 5.1 DONORS & SCREENINGS
  // =========================================================================

  async getDonors(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllDonors({
      search: query?.search,
      status: query?.status,
      bloodGroup: query?.blood_group,
      limit,
      offset
    });
  }

  async getDonorById(id) {
    const donor = await bloodBankRepository.findDonorById(id);
    if (!donor) throw ApiError.notFound(`Donor with ID '${id}' not found`);
    return donor;
  }

  async createDonor(data) {
    const donorCode = data.donor_code || this._generateCode('DNR');
    return await bloodBankRepository.createDonor({
      ...data,
      donor_code: donorCode
    });
  }

  async createScreening(data) {
    const donor = await bloodBankRepository.findDonorById(data.donor_id);
    if (!donor) throw ApiError.notFound(`Donor with ID '${data.donor_id}' not found`);

    const screeningNumber = this._generateCode('SCR');
    const hb = parseFloat(data.hemoglobin_g_dl);
    const wt = parseFloat(data.weight_kg);

    // Clinical eligibility rules
    let finalEligibility = data.eligibility_status;
    let finalReason = data.deferral_reason;

    if (!data.consent_obtained) {
      finalEligibility = 'rejected';
      finalReason = 'Donor informed consent was not provided';
    } else if (data.questionnaire_answers?.high_risk_behavior) {
      finalEligibility = 'permanently_deferred';
      finalReason = 'High-risk clinical exposure or behavior reported on questionnaire';
    } else if (data.questionnaire_answers?.recent_illness) {
      finalEligibility = 'temporarily_deferred';
      finalReason = 'Recent illness or fever reported within 14 days';
    } else if (hb < 12.5) {
      finalEligibility = 'temporarily_deferred';
      finalReason = `Hemoglobin (${hb} g/dL) is below the minimum safe threshold (12.5 g/dL)`;
    } else if (wt < 45.0) {
      finalEligibility = 'temporarily_deferred';
      finalReason = `Body weight (${wt} kg) is below the minimum safe threshold (45.0 kg)`;
    }

    return await bloodBankRepository.withTransaction(async (client) => {
      const screening = await bloodBankRepository.createScreening({
        ...data,
        screening_number: screeningNumber,
        eligibility_status: finalEligibility,
        deferral_reason: finalReason
      }, client);

      // Update donor status based on screening outcome
      let donorStatus = 'active';
      if (finalEligibility === 'temporarily_deferred') donorStatus = 'temporarily_deferred';
      else if (finalEligibility === 'permanently_deferred') donorStatus = 'permanently_deferred';
      else if (finalEligibility === 'rejected') donorStatus = 'inactive';

      await bloodBankRepository.updateDonor(donor.id, {
        donor_status: donorStatus,
        permanent_deferral_reason: finalEligibility === 'permanently_deferred' ? finalReason : null
      }, client);

      return screening;
    });
  }

  // =========================================================================
  // 5.2 BAG COLLECTION & PHLEBOTOMY
  // =========================================================================

  async getDonations(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllDonations({ limit, offset });
  }

  async createDonation(data) {
    const donor = await bloodBankRepository.findDonorById(data.donor_id);
    if (!donor) throw ApiError.notFound(`Donor with ID '${data.donor_id}' not found`);

    const screening = await bloodBankRepository.findScreeningById(data.screening_id);
    if (!screening) throw ApiError.notFound(`Screening record with ID '${data.screening_id}' not found`);

    if (screening.donor_id !== donor.id) {
      throw ApiError.badRequest('Screening record does not match the specified donor');
    }

    if (screening.eligibility_status !== 'approved') {
      throw ApiError.badRequest(`Cannot collect blood from donor with screening status: ${screening.eligibility_status}`);
    }

    const donationNumber = this._generateCode('BLD');
    const bagBarcode = data.primary_bag_barcode || `BB-${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    return await bloodBankRepository.withTransaction(async (client) => {
      const donation = await bloodBankRepository.createDonation({
        ...data,
        donation_number: donationNumber,
        primary_bag_barcode: bagBarcode
      }, client);

      // Increment donor total donations and update last donation date
      await bloodBankRepository.updateDonor(donor.id, {
        total_donations: (donor.total_donations || 0) + 1,
        last_donation_date: new Date().toISOString().split('T')[0]
      }, client);

      return donation;
    });
  }

  // =========================================================================
  // 5.3 COMPONENTS & INVENTORY
  // =========================================================================

  async getComponents(query) {
    const limit = parseInt(query?.limit, 10) || 100;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllComponents({
      status: query?.status,
      type: query?.type,
      bloodGroup: query?.blood_group,
      search: query?.search,
      limit,
      offset
    });
  }

  async createComponents(data) {
    const donation = await bloodBankRepository.findDonationById(data.parent_donation_id);
    if (!donation) throw ApiError.notFound(`Donation with ID '${data.parent_donation_id}' not found`);

    const created = [];
    for (const comp of data.components) {
      // Default shelf lives & temperatures if not provided
      let minTemp = comp.storage_min_temp_c;
      let maxTemp = comp.storage_max_temp_c;
      let reqAgitator = comp.requires_agitator || false;
      let expiresAt = comp.expires_at;

      if (!expiresAt) {
        const now = new Date();
        if (comp.component_type === 'prbc') {
          now.setDate(now.getDate() + 42); // 42 days for PRBC
          minTemp = minTemp ?? 2.0;
          maxTemp = maxTemp ?? 6.0;
        } else if (comp.component_type === 'ffp') {
          now.setDate(now.getDate() + 365); // 1 year for FFP
          minTemp = minTemp ?? -40.0;
          maxTemp = maxTemp ?? -30.0;
        } else if (comp.component_type === 'platelets') {
          now.setDate(now.getDate() + 5); // 5 days for platelets
          minTemp = minTemp ?? 20.0;
          maxTemp = maxTemp ?? 24.0;
          reqAgitator = true;
        } else {
          now.setDate(now.getDate() + 35);
          minTemp = minTemp ?? 2.0;
          maxTemp = maxTemp ?? 6.0;
        }
        expiresAt = now.toISOString();
      }

      const res = await bloodBankRepository.createComponent({
        ...comp,
        parent_donation_id: donation.id,
        abo_group: comp.abo_group || donation.blood_group,
        rh_factor: comp.rh_factor || donation.rh_factor,
        storage_min_temp_c: minTemp,
        storage_max_temp_c: maxTemp,
        requires_agitator: reqAgitator,
        expires_at: expiresAt,
        status: 'quarantined'
      });
      created.push(res);
    }

    return created;
  }

  // =========================================================================
  // 5.4 SEROLOGY & SAFE RELEASE
  // =========================================================================

  async getSerologyWorkbench() {
    return await bloodBankRepository.getSerologyWorkbench();
  }

  async recordGroupingVerification(data) {
    const donation = await bloodBankRepository.findDonationById(data.donation_id);
    if (!donation) throw ApiError.notFound(`Donation with ID '${data.donation_id}' not found`);

    return await bloodBankRepository.createGroupingVerification(data);
  }

  async recordSerologyTest(data) {
    const donation = await bloodBankRepository.findDonationById(data.donation_id);
    if (!donation) throw ApiError.notFound(`Donation with ID '${data.donation_id}' not found`);

    return await bloodBankRepository.createSerologyTest(data);
  }

  async authorizeSafeRelease(data) {
    const donation = await bloodBankRepository.findDonationById(data.donation_id);
    if (!donation) throw ApiError.notFound(`Donation with ID '${data.donation_id}' not found`);

    if (data.release_decision === 'approved_for_release') {
      if (!data.all_tti_non_reactive || !data.dual_grouping_verified) {
        throw ApiError.badRequest(
          'Safe release approval strictly requires both all_tti_non_reactive=true and dual_grouping_verified=true'
        );
      }
    }

    const auth = await bloodBankRepository.createReleaseAuthorization(data);

    // If approved, transition all quarantined components to safe_for_release
    if (data.release_decision === 'approved_for_release') {
      const components = await bloodBankRepository.findAllComponents({ limit: 100 });
      const donationComponents = components.filter(c => c.parent_donation_id === donation.id && c.status === 'quarantined');

      for (const comp of donationComponents) {
        await bloodBankRepository.updateComponentStatus(comp.id, 'safe_for_release', {
          actionType: 'safe_release_approved',
          performedByName: data.authorized_by_name,
          reason: 'All 5 TTI tests non-reactive & dual grouping concurred',
          referenceTable: 'blood_release_authorizations',
          referenceId: auth.id
        });
      }
    }

    return auth;
  }

  // =========================================================================
  // 5.5 REQUISITIONS & CROSSMATCHING
  // =========================================================================

  async getRequisitions(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllRequisitions({
      status: query?.status,
      urgency: query?.urgency,
      search: query?.search,
      limit,
      offset
    });
  }

  async createRequisition(data) {
    let patientId = data.patient_id;

    if (!patientId && data.patient_uhid) {
      const patient = await patientRepository.findByUhid(data.patient_uhid);
      if (!patient) throw ApiError.notFound(`Patient with UHID '${data.patient_uhid}' not found in patient registry`);
      patientId = patient.id;
    } else if (patientId) {
      const patient = await patientRepository.findById(patientId);
      if (!patient) throw ApiError.notFound(`Patient with ID '${patientId}' not found in patient registry`);
    }

    if (!patientId) {
      throw ApiError.badRequest('Either patient_id or patient_uhid is required to create a blood requisition');
    }

    const requisitionNumber = this._generateCode('REQ');
    return await bloodBankRepository.createRequisition({
      ...data,
      patient_id: patientId,
      requisition_number: requisitionNumber
    });
  }

  async recordCrossmatch(data) {
    const requisition = await bloodBankRepository.findRequisitionById(data.requisition_id);
    if (!requisition) throw ApiError.notFound(`Requisition with ID '${data.requisition_id}' not found`);

    const component = await bloodBankRepository.findComponentById(data.component_id);
    if (!component) throw ApiError.notFound(`Component with ID '${data.component_id}' not found`);

    return await bloodBankRepository.createCrossmatch({
      ...data,
      patient_id: requisition.patient_id
    });
  }

  // =========================================================================
  // RESERVATIONS
  // =========================================================================

  async reserveComponent(data) {
    if (data.crossmatch_id) {
      const crossmatch = await bloodBankRepository.findCrossmatchById(data.crossmatch_id);
      if (!crossmatch) {
        throw ApiError.notFound(`Crossmatch with ID '${data.crossmatch_id}' not found`);
      }
      if (crossmatch.compatibility_result !== 'compatible') {
        throw ApiError.badRequest(`Cannot reserve unit: Crossmatch result is '${crossmatch.compatibility_result}'. Only compatible units may be reserved.`);
      }
      const crossmatchAgeHours = crossmatch.tested_at ? (Date.now() - new Date(crossmatch.tested_at).getTime()) / (1000 * 3600) : 0;
      if (crossmatchAgeHours > 72 || (crossmatch.expires_at && new Date(crossmatch.expires_at) < new Date())) {
        throw ApiError.badRequest('Cannot reserve unit: Crossmatch has expired (>72h). Pre-transfusion testing must be repeated.');
      }
    }
    return await bloodBankRepository.withTransaction(async (client) => {
      return await bloodBankRepository.createReservation(data, client);
    });
  }

  async cancelReservation(data) {
    return await bloodBankRepository.withTransaction(async (client) => {
      return await bloodBankRepository.cancelReservation(data, client);
    });
  }

  // =========================================================================
  // 5.6 ISSUE & HANDOVER
  // =========================================================================

  async getIssues(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllIssues({
      requisitionId: query?.requisition_id,
      patientId: query?.patient_id,
      limit,
      offset
    });
  }

  async issueBloodUnit(data) {
    const requisition = await bloodBankRepository.findRequisitionById(data.requisition_id);
    if (!requisition) throw ApiError.notFound(`Requisition with ID '${data.requisition_id}' not found`);

    const component = await bloodBankRepository.findComponentById(data.component_id);
    if (!component) throw ApiError.notFound(`Component with ID '${data.component_id}' not found`);

    // Safety Gate Validation:
    if (!data.is_emergency_unmatched) {
      // Routine issue requires an unexpired compatible crossmatch!
      if (!data.crossmatch_id) {
        throw ApiError.badRequest('Routine blood unit issue strictly requires a verified compatible crossmatch ID');
      }
      const crossmatch = await bloodBankRepository.findCrossmatchById(data.crossmatch_id);
      if (!crossmatch) {
        throw ApiError.notFound(`Crossmatch with ID '${data.crossmatch_id}' not found`);
      }
      if (crossmatch.compatibility_result !== 'compatible') {
        throw ApiError.badRequest(`Cannot issue unit: Crossmatch result is '${crossmatch.compatibility_result}'. Incompatible or unverified units must never be issued.`);
      }
      const crossmatchAgeHours = crossmatch.tested_at ? (Date.now() - new Date(crossmatch.tested_at).getTime()) / (1000 * 3600) : 0;
      if (crossmatchAgeHours > 72 || (crossmatch.expires_at && new Date(crossmatch.expires_at) < new Date())) {
        throw ApiError.badRequest('Cannot issue unit: Crossmatch has expired (>72h). Pre-transfusion testing must be repeated.');
      }
      if (crossmatch.patient_id !== requisition.patient_id || crossmatch.component_id !== component.id) {
        throw ApiError.badRequest('Crossmatch patient or component does not match the issue request');
      }
    } else {
      // Emergency uncrossed release
      if (requisition.urgency !== 'stat_emergency') {
        throw ApiError.badRequest('Emergency uncrossed blood release is strictly restricted to requisitions with stat_emergency urgency');
      }
      if (!data.emergency_clinical_justification || data.emergency_clinical_justification.trim().length < 5) {
        throw ApiError.badRequest('Emergency release requires documented clinical justification');
      }

      const clinicianCode = data.emergency_authorizer_code;
      const clinicianPin = data.emergency_authorizer_pin;

      if (!clinicianCode) {
        throw ApiError.badRequest('Emergency uncrossed blood release strictly requires an authorizing clinician employee code');
      }
      if (!clinicianPin) {
        throw ApiError.badRequest('Emergency uncrossed blood release strictly requires the authorizing clinician Emergency Release PIN');
      }

      const doctorInfo = await authRepository.findDoctorWithStaff(clinicianCode);
      if (!doctorInfo || !doctorInfo.doctor_active) {
        throw ApiError.forbidden(`Clinician credential verification failed for '${clinicianCode}'. Clinician must be an active hospital doctor.`);
      }

      if (doctorInfo.pin_locked_until && new Date(doctorInfo.pin_locked_until) > new Date()) {
        const minutesRemaining = Math.ceil((new Date(doctorInfo.pin_locked_until).getTime() - Date.now()) / 60000);
        throw ApiError.forbidden(`Clinician emergency authorization is temporarily locked due to excessive failed PIN attempts. Try again in ${minutesRemaining} minute(s).`);
      }

      if (!doctorInfo.emergency_pin_hash) {
        throw ApiError.forbidden(`Clinician '${clinicianCode}' does not have an active emergency release PIN configured.`);
      }

      const isPinValid = verifyPassword(String(clinicianPin), doctorInfo.emergency_pin_hash);
      if (!isPinValid) {
        const attempts = (doctorInfo.failed_pin_attempts || 0) + 1;
        const lockUntil = attempts >= 3
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
          : null;
        if (doctorInfo.staff_id) {
          await authRepository.updateFailedPin(doctorInfo.staff_id, attempts, lockUntil);
        }
        if (attempts >= 3) {
          throw ApiError.forbidden('Clinician emergency authorization is temporarily locked due to excessive failed PIN attempts. Please try again in 15 minutes.');
        }
        throw ApiError.forbidden('Invalid clinician emergency authorization PIN');
      }

      if (doctorInfo.failed_pin_attempts > 0 || doctorInfo.pin_locked_until) {
        if (doctorInfo.staff_id) {
          await authRepository.resetFailedPin(doctorInfo.staff_id);
        }
      }

      data.emergency_authorized_by_doctor_id = doctorInfo.doctor_id;
      data.emergency_authorized_by_name = doctorInfo.doctor_name;
      data.emergency_authorizer_name = doctorInfo.doctor_name;
    }

    const issueSlipNumber = this._generateCode('ISS');

    return await bloodBankRepository.withTransaction(async (client) => {
      return await bloodBankRepository.createIssue({
        ...data,
        issue_slip_number: issueSlipNumber
      }, client);
    });
  }

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  async getAuditLogs(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAuditLogs({
      componentId: query?.component_id,
      actionType: query?.action_type,
      limit,
      offset
    });
  }

  // =========================================================================
  // STORAGE TEMPERATURE LOGS
  // =========================================================================

  async getStorageTemperatureLogs(query) {
    const limit = parseInt(query?.limit, 10) || 50;
    const offset = parseInt(query?.offset, 10) || 0;
    return await bloodBankRepository.findAllStorageTemperatureLogs({
      storageUnitCode: query?.storage_unit_code,
      storageUnitType: query?.storage_unit_type,
      alertOnly: query?.alert_only,
      limit,
      offset
    });
  }

  async recordStorageTemperatureLog(data) {
    return await bloodBankRepository.createStorageTemperatureLog(data);
  }
}

module.exports = new BloodBankService();
