const patientService = require('./patient.service');

class PatientController {
  async getPatients(req, res, next) {
    try {
      const patients = await patientService.getAllPatients(req.query);
      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (err) {
      next(err);
    }
  }

  async getPatientByUhid(req, res, next) {
    try {
      const patient = await patientService.getPatientByUhid(req.params.uhid);
      res.status(200).json({
        success: true,
        data: patient
      });
    } catch (err) {
      next(err);
    }
  }

  async createPatient(req, res, next) {
    try {
      const newPatient = await patientService.createPatient(req.body);
      res.status(201).json({
        success: true,
        data: newPatient
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PatientController();
