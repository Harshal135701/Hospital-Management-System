const pool = require("../../config/db");

const createBill = async (client, billData) => {
  const {
    billNumber,
    patientId,
    appointmentId,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    notes,
  } = billData;

  const result = await client.query(
    `INSERT INTO bills (
       bill_number, patient_id, appointment_id, bill_type,
       status, subtotal, discount_amount, tax_amount,
       total_amount, notes
     )
     VALUES ($1, $2, $3, 'opd', 'issued', $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      billNumber,
      patientId,
      appointmentId || null,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes || null,
    ]
  );

  return result.rows[0];
};

const createBillItem = async (client, billId, item) => {
  const result = await client.query(
    `INSERT INTO bill_items (
       bill_id, description, category, quantity,
       unit_price, line_total
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      billId,
      item.description,
      item.category,
      item.quantity,
      item.unitPrice,
      item.lineTotal,
    ]
  );

  return result.rows[0];
};

const createPayment = async (client, paymentData) => {
  const result = await client.query(
    `INSERT INTO bill_payments (
       receipt_number, bill_id, amount,
       payment_method, transaction_reference
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      paymentData.receiptNumber,
      paymentData.billId,
      paymentData.amount,
      paymentData.paymentMethod,
      paymentData.transactionReference || null,
    ]
  );

  return result.rows[0];
};

const updateBillPayment = async (client, billId, amountPaid, totalAmount) => {
  const status = amountPaid >= totalAmount ? "paid" : "partially_paid";

  const result = await client.query(
    `UPDATE bills
     SET amount_paid = $1, status = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [amountPaid, status, billId]
  );

  return result.rows[0];
};

const findPatient = async (client, patientId) => {
  const result = await client.query(
    "SELECT id, uhid, full_name, mobile FROM patients WHERE id = $1",
    [patientId]
  );

  return result.rows[0] || null;
};

const findAppointment = async (client, appointmentId) => {
  const result = await client.query(
    "SELECT id, patient_id, status FROM appointments WHERE id = $1",
    [appointmentId]
  );

  return result.rows[0] || null;
};

const findBillById = async (billId) => {
  const result = await pool.query(
    `SELECT b.*, p.uhid, p.full_name, p.mobile
     FROM bills b
     JOIN patients p ON p.id = b.patient_id
     WHERE b.id = $1 AND b.bill_type = 'opd'`,
    [billId]
  );

  return result.rows[0] || null;
};

const listBills = async ({ patientId, status, limit = 20, offset = 0 }) => {
  const conditions = ["b.bill_type = 'opd'"];
  const values = [];

  if (patientId) {
    values.push(patientId);
    conditions.push(`b.patient_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`b.status = $${values.length}`);
  }

  values.push(limit);
  const limitPosition = values.length;

  values.push(offset);
  const offsetPosition = values.length;

  const result = await pool.query(
    `SELECT b.*, p.uhid, p.full_name
     FROM bills b
     JOIN patients p ON p.id = b.patient_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY b.created_at DESC
     LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
    values
  );

  return result.rows;
};

module.exports = {
  createBill,
  createBillItem,
  createPayment,
  updateBillPayment,
  findPatient,
  findAppointment,
  findBillById,
  listBills,
};