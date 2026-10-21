
const pool = require("../../config/db");
const repository = require("./deposit.repository");
const ApiError = require("../../utils/ApiError");

const generateReceiptNumber = () =>
  `ADV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const collectDeposit = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const admission = await repository.findAdmission(
      client,
      data.admissionId
    );

    if (!admission) {
      throw new ApiError(404, "Admission not found");
    }

    if (admission.status !== "admitted") {
      throw new ApiError(
        400,
        "Deposits can only be collected for admitted patients"
      );
    }

    const deposit = await repository.createDeposit(client, {
      receiptNumber: generateReceiptNumber(),
      admissionId: admission.id,
      patientId: admission.patient_id,
      amount: Number(data.amount).toFixed(2),
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
    });

    await client.query("COMMIT");

    return {
      ...deposit,
      adjusted_amount: "0.00",
      remaining_amount: Number(deposit.amount).toFixed(2),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getDepositsByAdmission = async (admissionId) => {
  const admission = await pool.query(
    `SELECT id
     FROM admissions
     WHERE id = $1`,
    [admissionId]
  );

  if (!admission.rows[0]) {
    throw new ApiError(404, "Admission not found");
  }

  const deposits = await repository.findDepositsByAdmission(admissionId);

  return {
    deposits,
    summary: deposits.reduce(
      (summary, deposit) => {
        summary.totalDeposited += Number(deposit.amount);
        summary.totalAdjusted += Number(deposit.adjusted_amount);
        summary.remainingBalance += Number(deposit.remaining_amount);
        return summary;
      },
      {
        totalDeposited: 0,
        totalAdjusted: 0,
        remainingBalance: 0,
      }
    ),
  };
};

const getDepositById = async (depositId) => {
  const deposit = await repository.findDepositById(depositId);

  if (!deposit) {
    throw new ApiError(404, "Advance deposit not found");
  }

  return deposit;
};

module.exports = {
  collectDeposit,
  getDepositsByAdmission,
  getDepositById,
};
