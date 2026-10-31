const service = require("./nursing.service");
const {
  createVitalsSchema,
  createIntakeOutputSchema,
  administerMedicationSchema,
  withholdMedicationSchema,
  executeDoctorOrderSchema,
  createShiftHandoverSchema,
  acceptShiftHandoverSchema
} = require("./nursing.validation");

const NursingController = {
  // 21.1 Ward Nursing Workstation
  async getDashboard(req, res, next) {
    try {
      const data = await service.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getPatients(req, res, next) {
    try {
      const { wing } = req.query;
      const data = await service.getPatients(wing);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getPatientById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await service.getPatientById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // 21.2 Vitals & Intake-Output Charting
  async getVitals(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = await service.getVitals(patientId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async recordVitals(req, res, next) {
    try {
      const validated = createVitalsSchema.parse(req.body);
      const data = await service.recordVitals(validated);
      res.status(201).json({ success: true, data, message: "Bedside vitals recorded successfully" });
    } catch (err) {
      next(err);
    }
  },

  async getIntakeOutput(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = await service.getIntakeOutput(patientId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async recordIntakeOutput(req, res, next) {
    try {
      const validated = createIntakeOutputSchema.parse(req.body);
      const data = await service.recordIntakeOutput(validated);
      res.status(201).json({ success: true, data, message: "Fluid intake/output charted successfully" });
    } catch (err) {
      next(err);
    }
  },

  // 21.3 Medication Administration Record (MAR)
  async getMar(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = await service.getMar(patientId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async administerMedication(req, res, next) {
    try {
      const validated = administerMedicationSchema.parse(req.body);
      const data = await service.administerMedication(validated);
      res.status(200).json({ success: true, data, message: "Medication administration recorded" });
    } catch (err) {
      next(err);
    }
  },

  async withholdMedication(req, res, next) {
    try {
      const validated = withholdMedicationSchema.parse(req.body);
      const data = await service.withholdMedication(validated);
      res.status(200).json({ success: true, data, message: "Medication withhold documented with clinical rationale" });
    } catch (err) {
      next(err);
    }
  },

  // 21.4 Doctor Order Execution
  async getDoctorOrders(req, res, next) {
    try {
      const { patientId } = req.params;
      const data = await service.getDoctorOrders(patientId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async executeDoctorOrder(req, res, next) {
    try {
      const validated = executeDoctorOrderSchema.parse(req.body);
      const data = await service.executeDoctorOrder(validated);
      res.status(200).json({ success: true, data, message: "Doctor order completed and signed off" });
    } catch (err) {
      next(err);
    }
  },

  // 21.5 Shift Handover Notes
  async getHandovers(req, res, next) {
    try {
      const { wing } = req.query;
      const data = await service.getHandovers(wing);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createHandover(req, res, next) {
    try {
      const validated = createShiftHandoverSchema.parse(req.body);
      const data = await service.createHandover(validated);
      res.status(201).json({ success: true, data, message: "Shift handover documentation compiled and submitted" });
    } catch (err) {
      next(err);
    }
  },

  async acceptHandover(req, res, next) {
    try {
      const { id } = req.params;
      const validated = acceptShiftHandoverSchema.parse(req.body);
      const data = await service.acceptHandover(id, validated);
      res.status(200).json({ success: true, data, message: "Incoming shift handover accepted with electronic signature" });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = NursingController;
