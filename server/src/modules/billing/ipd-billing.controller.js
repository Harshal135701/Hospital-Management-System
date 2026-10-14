
const service = require("./ipd-billing.service");
const {
  createInterimBillSchema,
  uuidSchema,
} = require("./ipd-billing.validation");
const ApiError = require("../../utils/ApiError");

const createInterimBill = async (req, res, next) => {
  try {
    const validation = createInterimBillSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    const result = await service.createInterimBill(validation.data);

    return res.status(201).json({
      success: true,
      message: "IPD interim bill created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInterimBill = async (req, res, next) => {
  try {
    const validation = uuidSchema.safeParse(req.params.id);

    if (!validation.success) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await service.getInterimBill(validation.data);

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterimBill,
  getInterimBill,
};
