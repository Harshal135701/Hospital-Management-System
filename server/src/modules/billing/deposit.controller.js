
const service = require("./deposit.service");
const {
  collectDepositSchema,
  admissionIdParamsSchema,
  depositIdParamsSchema,
} = require("./deposit.validation");
const ApiError = require("../../utils/ApiError");

const collectDeposit = async (req, res, next) => {
  try {
    const validation = collectDepositSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues[0].message
      );
    }

    const deposit = await service.collectDeposit(validation.data);

    res.status(201).json({
      success: true,
      message: "Advance deposit collected successfully",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

const getDepositsByAdmission = async (req, res, next) => {
  try {
    const validation = admissionIdParamsSchema.safeParse(req.params);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues[0].message
      );
    }

    const data = await service.getDepositsByAdmission(
      validation.data.admissionId
    );

    res.status(200).json({
      success: true,
      message: "Advance deposits retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getDepositById = async (req, res, next) => {
  try {
    const validation = depositIdParamsSchema.safeParse(req.params);

    if (!validation.success) {
      throw new ApiError(
        400,
        validation.error.issues[0].message
      );
    }

    const deposit = await service.getDepositById(
      validation.data.depositId
    );

    res.status(200).json({
      success: true,
      message: "Advance deposit retrieved successfully",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  collectDeposit,
  getDepositsByAdmission,
  getDepositById,
};
