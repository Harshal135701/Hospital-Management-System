
const service = require("./refund.service");
const ApiError = require("../../utils/ApiError");

const {
  requestRefundSchema,
  refundIdParamsSchema,
  listRefundsQuerySchema,
  updateRefundStatusSchema,
} = require("./refund.validation");

const requestRefund = async (req, res, next) => {
  try {
    const validation = requestRefundSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(400, validation.error.issues[0].message);
    }

    const refund = await service.requestRefund(validation.data);

    res.status(201).json({
      success: true,
      message: "Refund request created successfully",
      data: refund,
    });
  } catch (error) {
    next(error);
  }
};

const getRefundById = async (req, res, next) => {
  try {
    const validation = refundIdParamsSchema.safeParse(req.params);

    if (!validation.success) {
      throw new ApiError(400, validation.error.issues[0].message);
    }

    const refund = await service.getRefundById(validation.data.refundId);

    res.status(200).json({
      success: true,
      message: "Refund retrieved successfully",
      data: refund,
    });
  } catch (error) {
    next(error);
  }
};

const listRefunds = async (req, res, next) => {
  try {
    const validation = listRefundsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ApiError(400, validation.error.issues[0].message);
    }

    const refunds = await service.listRefunds(validation.data.status);

    res.status(200).json({
      success: true,
      message: "Refunds retrieved successfully",
      data: refunds,
    });
  } catch (error) {
    next(error);
  }
};

const updateRefundStatus = async (req, res, next) => {
  try {
    const paramsValidation = refundIdParamsSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      throw new ApiError(400, paramsValidation.error.issues[0].message);
    }

    const bodyValidation = updateRefundStatusSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      throw new ApiError(400, bodyValidation.error.issues[0].message);
    }

    const refund = await service.updateRefundStatus(
      paramsValidation.data.refundId,
      bodyValidation.data
    );

    res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: refund,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestRefund,
  getRefundById,
  listRefunds,
  updateRefundStatus,
};
