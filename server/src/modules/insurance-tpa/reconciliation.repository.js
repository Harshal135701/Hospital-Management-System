const pool = require("../../config/db");

async function createReconciliation(data) {
  const query = `
    INSERT INTO insurance_reconciliations (
      claim_dossier_id,
      bill_id,
      claim_amount,
      expected_amount,
      received_amount,
      discrepancy_amount,
      status,
      notes
    )
    VALUES ($1, $2, $3, $4, 0, 0, 'pending', $5)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    data.claim_dossier_id,
    data.bill_id,
    data.claim_amount,
    data.expected_amount,
    data.notes || null,
  ]);

  return rows[0];
}

async function findAll(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.bill_id) {
    values.push(filters.bill_id);
    conditions.push(`bill_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const { rows } = await pool.query(
    `SELECT * FROM insurance_reconciliations
     ${where}
     ORDER BY created_at DESC`,
    values
  );

  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT r.*, c.claim_number, c.status AS claim_status,
            b.bill_number, b.total_amount, b.amount_paid
     FROM insurance_reconciliations r
     JOIN insurance_claim_dossiers c ON c.id = r.claim_dossier_id
     JOIN bills b ON b.id = r.bill_id
     WHERE r.id = $1`,
    [id]
  );

  return rows[0] || null;
}

async function postPayment(id, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT r.*, c.status AS claim_status
       FROM insurance_reconciliations r
       JOIN insurance_claim_dossiers c ON c.id = r.claim_dossier_id
       WHERE r.id = $1
       FOR UPDATE OF r`,
      [id]
    );

    if (!result.rows.length) {
      const error = new Error("Reconciliation not found");
      error.statusCode = 404;
      throw error;
    }

    const reconciliation = result.rows[0];

    if (reconciliation.claim_status !== "accepted") {
      const error = new Error(
        "Only accepted claims can receive insurer payments"
      );
      error.statusCode = 400;
      throw error;
    }

    const amount = Number(data.amount);
    const expected = Number(reconciliation.expected_amount);
    const received = Number(reconciliation.received_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      const error = new Error("Payment amount must be greater than zero");
      error.statusCode = 400;
      throw error;
    }

    const newReceived = Math.round((received + amount) * 100) / 100;

    if (newReceived > expected) {
      const error = new Error(
        "Payment exceeds the outstanding expected amount"
      );
      error.statusCode = 400;
      throw error;
    }

    const billResult = await client.query(
      `SELECT id, total_amount, amount_paid
       FROM bills
       WHERE id = $1
       FOR UPDATE`,
      [reconciliation.bill_id]
    );

    if (!billResult.rows.length) {
      const error = new Error("Associated bill not found");
      error.statusCode = 404;
      throw error;
    }

    const bill = billResult.rows[0];
    const newBillPaid =
      Math.round((Number(bill.amount_paid) + amount) * 100) / 100;

    if (newBillPaid > Number(bill.total_amount)) {
      const error = new Error(
        "Payment exceeds the outstanding bill balance"
      );
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `INSERT INTO insurance_payment_postings (
        reconciliation_id,
        amount,
        payment_reference,
        payment_method,
        payment_date,
        notes
      )
      VALUES (
        $1, $2, $3, $4,
        COALESCE($5::timestamptz, NOW()),
        $6
      )`,
      [
        id,
        amount,
        data.payment_reference,
        data.payment_method || "bank_transfer",
        data.payment_date || null,
        data.notes || null,
      ]
    );

    const remaining =
      Math.round((expected - newReceived) * 100) / 100;

    const status = remaining === 0 ? "settled" : "partially_paid";

    // Outstanding balance is not automatically a confirmed discrepancy.
    const discrepancyAmount = 0;

    await client.query(
      `UPDATE insurance_reconciliations
       SET received_amount = $1,
           discrepancy_amount = $2,
           status = $3::varchar,
           reconciled_at = CASE
             WHEN $3::varchar = 'settled' THEN NOW()
             ELSE NULL
           END,
           updated_at = NOW()
       WHERE id = $4`,
      [newReceived, discrepancyAmount, status, id]
    );

    await client.query(
      `UPDATE bills
       SET amount_paid = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [newBillPaid, reconciliation.bill_id]
    );

    await client.query("COMMIT");

    return await findById(id);
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      error.statusCode = 409;
      error.message = "Payment reference already exists";
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createReconciliation,
  findAll,
  findById,
  postPayment,
};