const repository = require("./nursing.repository");

const NursingService = {
  // 21.1 Ward Nursing Workstation
  async getDashboard() {
    return await repository.getDashboard();
  },

  async getPatients(wing) {
    return await repository.getPatients(wing);
  },

  async getPatientById(id) {
    const patient = await repository.getPatientById(id);
    if (!patient) {
      throw new Error(`Patient with identifier '${id}' not found in active ward census.`);
    }
    return patient;
  },

  // 21.2 Vitals & Intake-Output Charting
  async getVitals(patientId) {
    return await repository.getVitals(patientId);
  },

  async recordVitals(data) {
    return await repository.recordVitals(data);
  },

  async getIntakeOutput(patientId) {
    return await repository.getIntakeOutput(patientId);
  },

  async recordIntakeOutput(data) {
    return await repository.recordIntakeOutput(data);
  },

  // 21.3 Medication Administration Record (MAR)
  async getMar(patientId) {
    return await repository.getMar(patientId);
  },

  async administerMedication(data) {
    return await repository.administerMedication(data);
  },

  async withholdMedication(data) {
    if (!data.withheldReason || data.withheldReason.trim().length < 3) {
      throw new Error("A clear clinical reason must be provided when withholding a scheduled medication dose.");
    }
    return await repository.withholdMedication(data);
  },

  // 21.4 Doctor Order Execution
  async getDoctorOrders(patientId) {
    return await repository.getDoctorOrders(patientId);
  },

  async executeDoctorOrder(data) {
    return await repository.executeDoctorOrder(data);
  },

  // 21.5 Shift Handover Notes
  async getHandovers(wing) {
    return await repository.getHandovers(wing);
  },

  async createHandover(data) {
    return await repository.createHandover(data);
  },

  async acceptHandover(id, data) {
    if (!data.incomingNurseSignature || data.incomingNurseSignature.trim().length < 2) {
      throw new Error("Incoming nurse electronic signature is required to accept shift handover.");
    }
    return await repository.acceptHandover(id, data);
  }
};

module.exports = NursingService;
