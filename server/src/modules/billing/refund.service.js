
const pool = require("../../config/db");
const repository = require("./refund.repository");
const ApiError = require("../../utils/ApiError");

const generateRefundNumber = () =>
  `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const toCents = (value) => Math.round(Number(value) * 100);
const toAmount = (cents) => (cents / 100).toFixed(2);

const requestRefund = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let patientId;
    let sourceAmount;
    let totals;

    if (data.advanceDepositId) {
      const deposit = await repository.findDepositForUpdate(
        client,
        data.advanceDepositId
      );

      if (!deposit) throw new ApiError(404, "Advance deposit not found");

      patientId = deposit.patient_id;
      sourceAmount = deposit.amount;

      totals = await repository.getDepositRefundTotals(
        client,
        deposit.id
      );
    } else {
      const payment = await repository.findBillPaymentForUpdate(
        client,
        data.billPaymentId
      );

      if (!payment) throw new ApiError(404, "Bill payment not found");

      const billResult = await client.query(
        `SELECT patient_id FROM bills WHERE id = $1`,
        [payment.bill_id]
      );

      if (!billResult.rows[0]) {
        throw new ApiError(404, "Bill associated with payment not found");
      }

      patientId = billResult.rows[0].patient_id;
      sourceAmount = payment.amount;

      totals = await repository.getBillPaymentRefundTotals(
        client,
        payment.id
      );
    }

    const requestedCents = toCents(data.amount);
    const sourceCents = toCents(sourceAmount);
    const reservedCents = toCents(totals.reserved_amount);
    const availableCents = sourceCents - reservedCents;

    if (requestedCents > availableCents) {
      throw new ApiError(
        400,
        `Refund exceeds refundable balance of ${toAmount(Math.max(0, availableCents))}`
      );
    }

    const refund = await repository.createRefund(client, {
      refundNumber: generateRefundNumber(),
      patientId,
      billPaymentId: data.billPaymentId,
      advanceDepositId: data.advanceDepositId,
      amount: toAmount(requestedCents),
      reason: data.reason.trim(),
    });

    await client.query("COMMIT");
    return refund;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getRefundById = async (refundId) => {
  const refund = await repository.findRefundById(refundId);
  if (!refund) throw new ApiError(404, "Refund not found");
  return refund;
};

const listRefunds = async (status) => {
  return repository.findRefunds({ status });
};

const updateRefundStatus = async (refundId, data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT * FROM refunds WHERE id = $1 FOR UPDATE`,
      [refundId]
    );

    const refund = existing.rows[0];
    if (!refund) throw new ApiError(404, "Refund not found");

    const transitions = {
      requested: ["approved", "rejected"],
      approved: ["processed", "failed"],
      rejected: [],
      processed: [],
      failed: [],
    };

    if (!transitions[refund.status]?.includes(data.status)) {
      throw new ApiError(
        400,
        `Cannot change refund status from ${refund.status} to ${data.status}`
      );
    }

    if (
      data.status === "processed" &&
      !data.paymentMethod &&
      !refund.payment_method
    ) {
      throw new ApiError(
        400,
        "Payment method is required to process a refund"
      );
    }

    const updated = await repository.updateRefundStatus(
      client,
      refundId,
      data.status,
      data.paymentMethod,
      data.transactionReference
    );

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  requestRefund,
  getRefundById,
  listRefunds,
  updateRefundStatus,
};
