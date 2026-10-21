
const pool = require("../../config/db");

const findAdmission = async (client, admissionId) => {
  const result = await client.query(
    `SELECT id, admission_number, patient_id, status,
            admission_date, discharge_date
     FROM admissions
     WHERE id = $1
     FOR UPDATE`,
    [admissionId]
  );

  return result.rows[0] || null;
};

const getInterimBills = async (client, admissionId) => {
  const result = await client.query(
    `SELECT id, total_amount, amount_paid, status
     FROM bills
     WHERE admission_id = $1
       AND bill_type = 'ipd_interim'
       AND status <> 'cancelled'
     ORDER BY created_at
     FOR UPDATE`,
    [admissionId]
  );

  return result.rows;
};


const getCollectedDeposits = async (client, admissionId) => {
  const result = await client.query(
    `SELECT
       d.id,
       d.receipt_number,
       d.amount,
       COALESCE(
         (
           SELECT SUM(da.amount)
           FROM deposit_adjustments da
           WHERE da.deposit_id = d.id
         ),
         0
       ) AS adjusted_amount
     FROM advance_deposits d
     WHERE d.admission_id = $1
       AND d.status <> 'refunded'
     ORDER BY d.created_at
     FOR UPDATE`,
    [admissionId]
  );

  return result.rows;
};


const createFinalBill = async (client, data) => {
  const result = await client.query(
    `INSERT INTO bills (
       bill_number, patient_id, admission_id, bill_type,
       status, subtotal, discount_amount, tax_amount,
       total_amount, amount_paid, notes
     )
     VALUES ($1, $2, $3, 'ipd_final', 'issued', $4, $5, $6, $7, 0, $8)
     RETURNING *`,
    [
      data.billNumber,
      data.patientId,
      data.admissionId,
      data.subtotal,
      data.discountAmount,
      data.taxAmount,
      data.totalAmount,
      data.notes || null,
    ]
  );

  return result.rows[0];
};

const createBillItem = async (client, billId, item) => {
  const result = await client.query(
    `INSERT INTO bill_items (
       bill_id, description, category, quantity,
       unit_price, line_total, service_date
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      billId,
      item.description,
      item.category,
      item.quantity,
      item.unitPrice,
      item.lineTotal,
      item.serviceDate || null,
    ]
  );

  return result.rows[0];
};

const createDischargeRecord = async (client, data) => {
  const result = await client.query(
    `INSERT INTO discharge_bills (
       bill_id, admission_id, gross_amount,
       advance_adjusted, refund_due, balance_due
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.billId,
      data.admissionId,
      data.grossAmount,
      data.advanceAdjusted,
      data.refundDue,
      data.balanceDue,
    ]
  );

  return result.rows[0];
};


const createDepositAdjustment = async (
  client,
  depositId,
  billId,
  amount
) => {
  const result = await client.query(
    `INSERT INTO deposit_adjustments (deposit_id, bill_id, amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (deposit_id, bill_id)
     DO UPDATE SET amount = deposit_adjustments.amount + EXCLUDED.amount
     RETURNING *`,
    [depositId, billId, amount]
  );

  return result.rows[0];
};

const updateDepositStatus = async (client, depositId) => {
  const result = await client.query(
    `UPDATE advance_deposits d
     SET status = CASE
       WHEN COALESCE(
         (SELECT SUM(da.amount)
          FROM deposit_adjustments da
          WHERE da.deposit_id = d.id),
         0
       ) >= d.amount THEN 'adjusted'
       WHEN COALESCE(
         (SELECT SUM(da.amount)
          FROM deposit_adjustments da
          WHERE da.deposit_id = d.id),
         0
       ) > 0 THEN 'partially_adjusted'
       ELSE 'collected'
     END
     WHERE d.id = $1
     RETURNING id, amount, status`,
    [depositId]
  );

  return result.rows[0] || null;
};


const finalizeAdmission = async (client, admissionId) => {
  const result = await client.query(
    `UPDATE admissions
     SET status = 'discharged',
         discharge_date = CURRENT_DATE
     WHERE id = $1
     RETURNING *`,
    [admissionId]
  );

  return result.rows[0];
};

const findFinalBill = async (billId) => {
  const billResult = await pool.query(
    `SELECT b.*, p.uhid, p.full_name, p.mobile,
            a.admission_number, db.gross_amount,
            db.advance_adjusted, db.refund_due,
            db.balance_due, db.finalized_at
     FROM bills b
     JOIN patients p ON p.id = b.patient_id
     JOIN admissions a ON a.id = b.admission_id
     JOIN discharge_bills db ON db.bill_id = b.id
     WHERE b.id = $1 AND b.bill_type = 'ipd_final'`,
    [billId]
  );

  if (!billResult.rows[0]) return null;

  const itemsResult = await pool.query(
    `SELECT id, description, category, quantity,
            unit_price, line_total, service_date
     FROM bill_items
     WHERE bill_id = $1
     ORDER BY created_at`,
    [billId]
  );

  return {
    ...billResult.rows[0],
    items: itemsResult.rows,
  };
};

module.exports = {
  findAdmission,
  getInterimBills,
  getCollectedDeposits,
  createFinalBill,
  createBillItem,
  createDischargeRecord,
  finalizeAdmission,
  findFinalBill,
  updateDepositStatus,
  createDepositAdjustment,
};
