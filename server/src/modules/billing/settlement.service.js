
const ApiError = require("../../utils/ApiError");
const settlementRepository = require("./settlement.repository");
const { closeSettlementSchema } = require("./settlement.validation");

const validateBusinessDate = (businessDate) => {
  if (
    typeof businessDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(businessDate)
  ) {
    throw new ApiError(400, "Business date must be in YYYY-MM-DD format");
  }

  const parsedDate = new Date(`${businessDate}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== businessDate
  ) {
    throw new ApiError(400, "Invalid business date");
  }
};

const getDayEndSummary = async (businessDate) => {
  validateBusinessDate(businessDate);

  return settlementRepository.getDayEndSummary(businessDate);
};

const closeSettlement = async (data) => {
  const validation = closeSettlementSchema.safeParse(data);

  if (!validation.success) {
    throw new ApiError(400, validation.error.issues[0].message);
  }

  const {
    businessDate,
    cashierName,
    openingCash,
    countedCash,
    notes,
  } = validation.data;

  validateBusinessDate(businessDate);

  const figures = await settlementRepository.getSettlementFigures(
    businessDate
  );

  const totalCollected = Number(figures.total_collected);
  const totalRefunded = Number(figures.total_refunded);
  const cashCollected = Number(figures.cash_collected);
  const cashRefunded = Number(figures.cash_refunded);

  const expectedCash = openingCash + cashCollected - cashRefunded;
  const cashVariance = countedCash - expectedCash;
  const netAmount = totalCollected - totalRefunded;

  const settlementNumber =
    `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return settlementRepository.createSettlement({
    settlementNumber,
    businessDate,
    cashierName,
    openingCash,
    expectedCash,
    countedCash,
    cashVariance,
    totalCollected,
    totalRefunded,
    netAmount,
    notes,
  });
};

module.exports = {
  getDayEndSummary,
  closeSettlement,
};
