
const settlementService = require("./settlement.service");

const getDayEndSummary = async (req, res, next) => {
  try {
    const summary = await settlementService.getDayEndSummary(
      req.query.date
    );

    return res.status(200).json({
      success: true,
      message: "Day-end settlement summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const closeSettlement = async (req, res, next) => {
  try {
    const settlement = await settlementService.closeSettlement(req.body);

    return res.status(201).json({
      success: true,
      message: "Cashier settlement closed successfully",
      data: settlement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDayEndSummary,
  closeSettlement,
};
