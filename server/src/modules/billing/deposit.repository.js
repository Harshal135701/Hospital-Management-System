
const pool = require("../../config/db");

const findAdmission = async (client, admissionId) => {
  const result = await client.query(
    `SELECT id, patient_id, status
     FROM admissions
     WHERE id = $1
     FOR UPDATE`,
    [admissionId]
  );

  return result.rows[0] || null;
};

const createDeposit = async (client, data) => {
  const result = await client.query(
    `INSERT INTO advance_deposits (
       receipt_number,
       admission_id,
       patient_id,
       amount,
       payment_method,
       transaction_reference,
       status
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'collected')
     RETURNING *`,
    [
      data.receiptNumber,
      data.admissionId,
      data.patientId,
      data.amount,
      data.paymentMethod,
      data.transactionReference || null,
    ]
  );

  return result.rows[0];
};

const findDepositsByAdmission = async (admissionId) => {
  const result = await pool.query(
    `SELECT
       d.id,
       d.receipt_number,
       d.admission_id,
       d.patient_id,
       d.amount,
       d.payment_method,
       d.transaction_reference,
       d.status,
       d.created_at,
       COALESCE(a.adjusted_amount, 0) AS adjusted_amount,
       COALESCE(r.refunded_amount, 0) AS refunded_amount,
       GREATEST(
         d.amount
         - COALESCE(a.adjusted_amount, 0)
         - COALESCE(r.refunded_amount, 0),
         0
       ) AS remaining_amount
     FROM advance_deposits d
     LEFT JOIN (
       SELECT deposit_id, SUM(amount) AS adjusted_amount
       FROM deposit_adjustments
       GROUP BY deposit_id
     ) a ON a.deposit_id = d.id
     LEFT JOIN (
       SELECT advance_deposit_id, SUM(amount) AS refunded_amount
       FROM refunds
       WHERE status = 'processed'
         AND advance_deposit_id IS NOT NULL
       GROUP BY advance_deposit_id
     ) r ON r.advance_deposit_id = d.id
     WHERE d.admission_id = $1
     ORDER BY d.created_at DESC`,
    [admissionId]
  );

  return result.rows;
};

const findDepositById = async (depositId) => {
  const result = await pool.query(
    `SELECT
       d.id,
       d.receipt_number,
       d.admission_id,
       d.patient_id,
       d.amount,
       d.payment_method,
       d.transaction_reference,
       d.status,
       d.created_at,
       COALESCE(a.adjusted_amount, 0) AS adjusted_amount,
       COALESCE(r.refunded_amount, 0) AS refunded_amount,
       GREATEST(
         d.amount
         - COALESCE(a.adjusted_amount, 0)
         - COALESCE(r.refunded_amount, 0),
         0
       ) AS remaining_amount
     FROM advance_deposits d
     LEFT JOIN (
       SELECT deposit_id, SUM(amount) AS adjusted_amount
       FROM deposit_adjustments
       GROUP BY deposit_id
     ) a ON a.deposit_id = d.id
     LEFT JOIN (
       SELECT advance_deposit_id, SUM(amount) AS refunded_amount
       FROM refunds
       WHERE status = 'processed'
         AND advance_deposit_id IS NOT NULL
       GROUP BY advance_deposit_id
     ) r ON r.advance_deposit_id = d.id
     WHERE d.id = $1`,
    [depositId]
  );

  return result.rows[0] || null;
};

module.exports = {
  findAdmission,
  createDeposit,
  findDepositsByAdmission,
  findDepositById,
};
