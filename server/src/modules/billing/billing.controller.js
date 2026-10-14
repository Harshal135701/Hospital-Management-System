const billingService = require("./billing.service");
const {
  createOpdBillSchema,
  listBillsSchema,
  uuidSchema,
} = require("./billing.validation");
const ApiError = require("../../utils/ApiError");

const createOpdBill = async (req, res, next) => {
  try {
    const validation = createOpdBillSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    const result = await billingService.createOpdBill(validation.data);

    return res.status(201).json({
      success: true,
      message: "OPD bill created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOpdBill = async (req, res, next) => {
  try {
    const validation = uuidSchema.safeParse(req.params.id);

    if (!validation.success) {
      throw new ApiError(400, "Invalid bill ID");
    }

    const bill = await billingService.getOpdBill(validation.data);

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

const getOpdBills = async (req, res, next) => {
  try {
    const validation = listBillsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues.map((issue) => issue.message).join(", ")
      );
    }

    const bills = await billingService.getOpdBills(validation.data);

    return res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOpdBill,
  getOpdBill,
  getOpdBills,
};