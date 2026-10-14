
const pool = require("../../config/db");

const findDepositForUpdate = async (client, depositId) => {
  const result = await client.query(
    `SELECT id, patient_id, amount, status
     FROM advance_deposits
     WHERE id = $1
     FOR UPDATE`,
    [depositId]
  );
  return result.rows[0] || null;
};

const findBillPaymentForUpdate = async (client, paymentId) => {
  const result = await client.query(
    `SELECT id, bill_id, amount, payment_method
     FROM bill_payments
     WHERE id = $1
     FOR UPDATE`,
    [paymentId]
  );
  return result.rows[0] || null;
};

const getDepositRefundTotals = async (client, depositId) => {
  const result = await client.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (
         WHERE status IN ('requested', 'approved', 'processed')
       ), 0) AS reserved_amount,
       COALESCE(SUM(amount) FILTER (
         WHERE status = 'processed'
       ), 0) AS processed_amount
     FROM refunds
     WHERE advance_deposit_id = $1`,
    [depositId]
  );
  return result.rows[0];
};

const getBillPaymentRefundTotals = async (client, paymentId) => {
  const result = await client.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (
         WHERE status IN ('requested', 'approved', 'processed')
       ), 0) AS reserved_amount,
       COALESCE(SUM(amount) FILTER (
         WHERE status = 'processed'
       ), 0) AS processed_amount
     FROM refunds
     WHERE bill_payment_id = $1`,
    [paymentId]
  );
  return result.rows[0];
};

const createRefund = async (client, data) => {
  const result = await client.query(
    `INSERT INTO refunds (
       refund_number,
       patient_id,
       bill_payment_id,
       advance_deposit_id,
       amount,
       reason,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'requested')
     RETURNING *`,
    [
      data.refundNumber,
      data.patientId,
      data.billPaymentId || null,
      data.advanceDepositId || null,
      data.amount,
      data.reason,
    ]
  );
  return result.rows[0];
};

const findRefundById = async (refundId) => {
  const result = await pool.query(
    `SELECT *
     FROM refunds
     WHERE id = $1`,
    [refundId]
  );
  return result.rows[0] || null;
};

const findRefunds = async (filters = {}) => {
  const values = [];
  let whereClause = "";

  if (filters.status) {
    values.push(filters.status);
    whereClause = `WHERE status = $${values.length}`;
  }

  const result = await pool.query(
    `SELECT *
     FROM refunds
     ${whereClause}
     ORDER BY requested_at DESC`,
    values
  );
  return result.rows;
};


const updateRefundStatus = async (
  client,
  refundId,
  status,
  paymentMethod,
  transactionReference
) => {
  const result = await client.query(
    `UPDATE refunds
     SET status = $2::varchar,
         payment_method = COALESCE($3::varchar, payment_method),
         transaction_reference = COALESCE($4::varchar, transaction_reference),
         processed_at = CASE
           WHEN $2::varchar IN ('processed', 'failed', 'rejected')
             THEN NOW()
           ELSE processed_at
         END
     WHERE id = $1::uuid
     RETURNING *`,
    [refundId, status, paymentMethod || null, transactionReference || null]
  );

  return result.rows[0] || null;
};


module.exports = {
  findDepositForUpdate,
  findBillPaymentForUpdate,
  getDepositRefundTotals,
  getBillPaymentRefundTotals,
  createRefund,
  findRefundById,
  findRefunds,
  updateRefundStatus,
};
