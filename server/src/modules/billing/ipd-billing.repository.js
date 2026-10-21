
const pool = require("../../config/db");

const findAdmission = async (client, admissionId) => {
  const result = await client.query(
    `SELECT id, admission_number, patient_id, attending_doctor_id,
            room_id, admission_date, discharge_date, status
     FROM admissions
     WHERE id = $1
     FOR UPDATE`,
    [admissionId]
  );

  return result.rows[0] || null;
};

const createInterimBill = async (client, data) => {
  const result = await client.query(
    `INSERT INTO bills (
       bill_number, patient_id, admission_id, bill_type,
       status, subtotal, discount_amount, tax_amount,
       total_amount, notes
     )
     VALUES ($1, $2, $3, 'ipd_interim', 'issued', $4, $5, $6, $7, $8)
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

const createInterimRecord = async (client, data) => {
  const result = await client.query(
    `INSERT INTO interim_bills (
       bill_id, admission_id, period_start, period_end
     )
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.billId,
      data.admissionId,
      data.periodStart,
      data.periodEnd,
    ]
  );

  return result.rows[0];
};

const findInterimBill = async (billId) => {
  const billResult = await pool.query(
    `SELECT b.*, p.uhid, p.full_name, p.mobile,
            a.admission_number, ib.period_start, ib.period_end,
            ib.generated_at
     FROM bills b
     JOIN patients p ON p.id = b.patient_id
     JOIN admissions a ON a.id = b.admission_id
     JOIN interim_bills ib ON ib.bill_id = b.id
     WHERE b.id = $1 AND b.bill_type = 'ipd_interim'`,
    [billId]
  );

  if (!billResult.rows[0]) return null;

  const itemsResult = await pool.query(
    `SELECT id, description, category, quantity, unit_price,
            line_total, service_date
     FROM bill_items
     WHERE bill_id = $1
     ORDER BY created_at ASC`,
    [billId]
  );

  return {
    ...billResult.rows[0],
    items: itemsResult.rows,
  };
};

module.exports = {
  findAdmission,
  createInterimBill,
  createBillItem,
  createInterimRecord,
  findInterimBill,
};
