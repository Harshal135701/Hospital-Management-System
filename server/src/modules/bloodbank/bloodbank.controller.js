const bloodBankService = require('./bloodbank.service');
const {
  createDonorSchema,
  createScreeningSchema,
  createDonationSchema,
  createComponentsSchema,
  createGroupingSchema,
  createSerologyTestSchema,
  createReleaseAuthSchema,
  createRequisitionSchema,
  createCrossmatchSchema,
  createReservationSchema,
  cancelReservationSchema,
  createIssueSchema
} = require('./bloodbank.validation');

class BloodBankController {
  // 5.1 Donors & Screenings
  async getDonors(req, res, next) {
    try {
      const data = await bloodBankService.getDonors(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getDonorById(req, res, next) {
    try {
      const data = await bloodBankService.getDonorById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createDonor(req, res, next) {
    try {
      const validated = createDonorSchema.parse(req.body);
      const data = await bloodBankService.createDonor(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createScreening(req, res, next) {
    try {
      const validated = createScreeningSchema.parse(req.body);
      const data = await bloodBankService.createScreening(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // 5.2 Collections
  async getDonations(req, res, next) {
    try {
      const data = await bloodBankService.getDonations(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createDonation(req, res, next) {
    try {
      const validated = createDonationSchema.parse(req.body);
      const data = await bloodBankService.createDonation(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // 5.3 Components
  async getComponents(req, res, next) {
    try {
      const data = await bloodBankService.getComponents(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createComponents(req, res, next) {
    try {
      const validated = createComponentsSchema.parse(req.body);
      const data = await bloodBankService.createComponents(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // 5.4 Serology
  async getSerologyWorkbench(req, res, next) {
    try {
      const data = await bloodBankService.getSerologyWorkbench();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async recordGroupingVerification(req, res, next) {
    try {
      const validated = createGroupingSchema.parse(req.body);
      const data = await bloodBankService.recordGroupingVerification(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async recordSerologyTest(req, res, next) {
    try {
      const validated = createSerologyTestSchema.parse(req.body);
      const data = await bloodBankService.recordSerologyTest(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async authorizeSafeRelease(req, res, next) {
    try {
      const validated = createReleaseAuthSchema.parse(req.body);
      const data = await bloodBankService.authorizeSafeRelease(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // 5.5 Requisitions & Crossmatching
  async getRequisitions(req, res, next) {
    try {
      const data = await bloodBankService.getRequisitions(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createRequisition(req, res, next) {
    try {
      const validated = createRequisitionSchema.parse(req.body);
      const data = await bloodBankService.createRequisition(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async recordCrossmatch(req, res, next) {
    try {
      const validated = createCrossmatchSchema.parse(req.body);
      const data = await bloodBankService.recordCrossmatch(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // Reservations
  async reserveComponent(req, res, next) {
    try {
      const validated = createReservationSchema.parse(req.body);
      const data = await bloodBankService.reserveComponent(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async cancelReservation(req, res, next) {
    try {
      const validated = cancelReservationSchema.parse(req.body);
      const data = await bloodBankService.cancelReservation(validated);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // 5.6 Issues
  async getIssues(req, res, next) {
    try {
      const data = await bloodBankService.getIssues(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async issueBloodUnit(req, res, next) {
    try {
      const validated = createIssueSchema.parse(req.body);
      const data = await bloodBankService.issueBloodUnit(validated);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // Audit Logs
  async getAuditLogs(req, res, next) {
    try {
      const data = await bloodBankService.getAuditLogs(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BloodBankController();
