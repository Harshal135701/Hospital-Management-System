
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

// Monetary arithmetic helper using integer minor units (paisa) to prevent IEEE-754 floating-point drift
const toMinorUnits = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100);
const fromMinorUnits = (minor) => Number((minor / 100).toFixed(2));

  const totalCollectedMinor = toMinorUnits(figures.total_collected);
  const totalRefundedMinor = toMinorUnits(figures.total_refunded);
  const cashCollectedMinor = toMinorUnits(figures.cash_collected);
  const cashRefundedMinor = toMinorUnits(figures.cash_refunded);

  const openingCashMinor = toMinorUnits(openingCash);
  const countedCashMinor = toMinorUnits(countedCash);

  const expectedCashMinor = openingCashMinor + cashCollectedMinor - cashRefundedMinor;
  const cashVarianceMinor = countedCashMinor - expectedCashMinor;
  const netAmountMinor = totalCollectedMinor - totalRefundedMinor;

  const totalCollected = fromMinorUnits(totalCollectedMinor);
  const totalRefunded = fromMinorUnits(totalRefundedMinor);
  const openingCashVal = fromMinorUnits(openingCashMinor);
  const countedCashVal = fromMinorUnits(countedCashMinor);
  const expectedCash = fromMinorUnits(expectedCashMinor);
  const cashVariance = fromMinorUnits(cashVarianceMinor);
  const netAmount = fromMinorUnits(netAmountMinor);

  const settlementNumber =
    `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return settlementRepository.createSettlement({
    settlementNumber,
    businessDate,
    cashierName,
    openingCash: openingCashVal,
    expectedCash,
    countedCash: countedCashVal,
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
