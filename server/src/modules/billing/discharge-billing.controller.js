
const service = require("./discharge-billing.service");
const {
  createDischargeBillSchema,
  uuidSchema,
} = require("./discharge-billing.validation");
const ApiError = require("../../utils/ApiError");

const createDischargeBill = async (req, res, next) => {
  try {
    const validation = createDischargeBillSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    const result = await service.createDischargeBill(validation.data);

    return res.status(201).json({
      success: true,
      message: "Discharge final bill created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDischargeBill = async (req, res, next) => {
  try {
    const validation = uuidSchema.safeParse(req.params.id);

    if (!validation.success) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await service.getDischargeBill(validation.data);

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDischargeBill,
  getDischargeBill,
};
