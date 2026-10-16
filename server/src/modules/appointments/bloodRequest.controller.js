
const service = require("./bloodRequest.service");
const validation = require("./bloodRequest.validation");

async function createBloodRequest(req, res, next) {
  try {
    const validated = validation.createBloodRequestSchema.parse(req.body);
    const request = await service.createBloodRequest(validated, req.user);

    res.status(201).json({
      success: true,
      message: "Blood request created and linked to blood bank requisition successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

async function getBloodRequests(req, res, next) {
  try {
    const filters = validation.getBloodRequestsQuerySchema.parse(req.query);
    const requests = await service.getBloodRequests(filters);

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
    const validated = validation.updateBloodRequestStatusSchema.parse(req.body);

    const request = await service.updateBloodRequestStatus(
      req.params.id,
      validated.status,
      validated.notes,
      req.user
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
