
const service = require("./bloodRequest.service");

async function createBloodRequest(req, res, next) {
  try {
    const request = await service.createBloodRequest(req.body);

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

async function getBloodRequests(req, res, next) {
  try {
    const requests = await service.getBloodRequests({
      patient_id: req.query.patient_id,
      status: req.query.status,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}

async function getBloodRequestById(req, res, next) {
  try {
    const request = await service.getBloodRequestById(req.params.id);

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

async function updateBloodRequestStatus(req, res, next) {
  try {
    const { status, notes } = req.body;

    const request = await service.updateBloodRequestStatus(
      req.params.id,
      status,
      notes
    );

    res.status(200).json({
      success: true,
      message: "Blood request status updated successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};
