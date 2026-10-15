const pool = require("../../config/db");

const createResponsibility = async (data) => {
  const query = `
    INSERT INTO insurance_patient_responsibilities (
      bill_id,
      preauthorization_id,
      responsibility_type,
      calculated_amount,
      notes
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    data.bill_id,
    data.preauthorization_id || null,
    data.responsibility_type,
    data.calculated_amount,
    data.notes || null,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getResponsibilityById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM insurance_patient_responsibilities WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
};

const getResponsibilities = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.bill_id) {
    values.push(filters.bill_id);
    conditions.push(`bill_id = $${values.length}`);
  }

  if (filters.preauthorization_id) {
    values.push(filters.preauthorization_id);
    conditions.push(`preauthorization_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const { rows } = await pool.query(
    `SELECT * FROM insurance_patient_responsibilities
     ${whereClause}
     ORDER BY created_at DESC`,
    values
  );

  return rows;
};

const collectPayment = async (id, amount, paymentMethod) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT *
       FROM insurance_patient_responsibilities
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (!rows.length) {
      const error = new Error("Patient responsibility record not found");
      error.statusCode = 404;
      throw error;
    }

    const record = rows[0];

    if (record.status === "cancelled") {
      const error = new Error("Cannot collect payment for a cancelled record");
      error.statusCode = 400;
      throw error;
    }

    const remaining =
      Number(record.calculated_amount) - Number(record.collected_amount);

    if (amount > remaining) {
      const error = new Error(
        "Payment amount exceeds the outstanding responsibility"
      );
      error.statusCode = 400;
      throw error;
    }

    const billResult = await client.query(
      `SELECT id, total_amount, amount_paid
       FROM bills
       WHERE id = $1
       FOR UPDATE`,
      [record.bill_id]
    );

    if (!billResult.rows.length) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    const bill = billResult.rows[0];
    const outstandingBill =
      Number(bill.total_amount) - Number(bill.amount_paid);

    if (amount > outstandingBill) {
      const error = new Error(
        "Payment amount exceeds the outstanding bill balance"
      );
      error.statusCode = 400;
      throw error;
    }

    const newCollectedAmount =
      Number(record.collected_amount) + amount;

    const newStatus =
      newCollectedAmount === Number(record.calculated_amount)
        ? "paid"
        : "partially_paid";

    const receiptNumber = `INS-${Date.now()}-${id.slice(0, 8)}`;

    await client.query(
      `INSERT INTO bill_payments (
        receipt_number,
        bill_id,
        amount,
        payment_method,
        status
      )
      VALUES ($1, $2, $3, $4, 'completed')`,
      [receiptNumber, record.bill_id, amount, paymentMethod]
    );

    const { rows: updatedRows } = await client.query(
      `UPDATE insurance_patient_responsibilities
       SET collected_amount = $2,
           status = $3,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, newCollectedAmount, newStatus]
    );

    await client.query(
      `UPDATE bills
       SET amount_paid = amount_paid + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [record.bill_id, amount]
    );

    await client.query("COMMIT");

    return {
      ...updatedRows[0],
      receipt_number: receiptNumber,
      payment_method: paymentMethod,
      payment_amount: amount.toFixed(2),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createResponsibility,
  getResponsibilityById,
  getResponsibilities,
  collectPayment,
};