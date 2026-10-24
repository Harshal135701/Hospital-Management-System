const pool = require("../../config/db");

const findAll = async (client = pool) => {
  const query = `
    SELECT id, compensation_number, donor_id, donor_code, donor_category,
           amount, payment_method, transaction_reference, status, notes,
           approved_by, processed_by, created_at
    FROM donor_compensations
    ORDER BY created_at DESC
  `;
  const res = await client.query(query);
  return res.rows;
};

const findByDonorCode = async (donorCode, client = pool) => {
  const query = `
    SELECT id, compensation_number, donor_id, donor_code, donor_category,
           amount, payment_method, transaction_reference, status, notes,
           approved_by, processed_by, created_at
    FROM donor_compensations
    WHERE donor_code = $1
    ORDER BY created_at DESC
  `;
  const res = await client.query(query, [donorCode]);
  return res.rows;
};

const findByTxnRef = async (txnRef, client = pool) => {
  if (!txnRef) return null;
  const query = `
    SELECT id, compensation_number, transaction_reference
    FROM donor_compensations
    WHERE LOWER(transaction_reference) = LOWER($1)
  `;
  const res = await client.query(query, [txnRef.trim()]);
  return res.rows[0] || null;
};

const create = async (data, client = pool) => {
  const query = `
    INSERT INTO donor_compensations (
      compensation_number, donor_id, donor_code, donor_category,
      amount, payment_method, transaction_reference, status, notes,
      approved_by, processed_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const values = [
    data.compensation_number,
    data.donor_id,
    data.donor_code,
    data.donor_category || 'Sperm Donor',
    parseFloat(data.amount),
    data.payment_method || 'neft',
    data.transaction_reference ? data.transaction_reference.trim() : null,
    data.status || 'processed',
    data.notes ? data.notes.trim() : null,
    data.approved_by || 'Chief Medical Officer',
    data.processed_by || 'Accounts Cashier'
  ];
  const res = await client.query(query, values);
  return res.rows[0];
};

module.exports = {
  findAll,
  findByDonorCode,
  findByTxnRef,
  create
};
