const repository = require("./reconciliation.repository");
const pool = require("../../config/db");

const VALID_STATUSES = [
  "pending",
  "partially_paid",
  "settled",
  "discrepancy",
];

const VALID_PAYMENT_METHODS = [
  "bank_transfer",
  "neft",
  "rtgs",
  "imps",
  "other",
];

function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function positiveAmount(value, field) {
  const amount = Number(value);
  if (value === undefined || value === null || value === "" ||
      !Number.isFinite(amount) || amount <= 0) {
    fail(`${field} must be greater than zero`);
  }
  return Math.round(amount * 100) / 100;
}

async function createReconciliation(data = {}) {
  if (!isUuid(data.claim_dossier_id)) {
    fail("A valid claim_dossier_id is required");
  }

  const claimResult = await pool.query(
    `SELECT c.id, c.bill_id, c.claim_amount, c.status,
            c.preauthorization_id, p.approved_amount
     FROM insurance_claim_dossiers c
     JOIN insurance_preauthorizations p ON p.id = c.preauthorization_id
     WHERE c.id = $1`,
    [data.claim_dossier_id]
  );

  if (!claimResult.rows.length) {
    fail("Claim dossier not found", 404);
  }

  const claim = claimResult.rows[0];

  if (claim.status !== "accepted") {
    fail("Only accepted claims can be reconciled");
  }

  if (data.bill_id && data.bill_id !== claim.bill_id) {
    fail("bill_id does not match the claim dossier");
  }

  const billResult = await pool.query(
    `SELECT id, total_amount
     FROM bills WHERE id = $1`,
    [claim.bill_id]
  );

  if (!billResult.rows.length) {
    fail("Associated bill not found", 404);
  }

  const claimAmount = Number(claim.claim_amount);
  const expectedAmount = data.expected_amount === undefined
    ? claimAmount
    : positiveAmount(data.expected_amount, "expected_amount");

  if (expectedAmount > claimAmount) {
    fail("expected_amount cannot exceed the claim amount");
  }

  if (expectedAmount > Number(billResult.rows[0].total_amount)) {
    fail("expected_amount cannot exceed the bill total");
  }

  if (claim.approved_amount !== null &&
      expectedAmount > Number(claim.approved_amount)) {
    fail("expected_amount cannot exceed the approved preauthorization amount");
  }

  try {
    return await repository.createReconciliation({
      claim_dossier_id: claim.id,
      bill_id: claim.bill_id,
      claim_amount: claimAmount,
      expected_amount: expectedAmount,
      notes: data.notes,
    });
  } catch (error) {
    if (error.code === "23505") {
      fail("A reconciliation already exists for this claim", 409);
    }
    throw error;
  }
}

async function getReconciliations(filters = {}) {
  if (filters.bill_id && !isUuid(filters.bill_id)) {
    fail("Invalid bill_id");
  }

  if (filters.status && !VALID_STATUSES.includes(filters.status)) {
    fail("Invalid reconciliation status");
  }

  return repository.findAll(filters);
}

async function getReconciliationById(id) {
  if (!isUuid(id)) fail("Invalid reconciliation ID");

  const record = await repository.findById(id);
  if (!record) fail("Reconciliation not found", 404);

  return record;
}

async function postPayment(id, data = {}) {
  if (!isUuid(id)) fail("Invalid reconciliation ID");

  const amount = positiveAmount(data.amount, "amount");
  const paymentReference = typeof data.payment_reference === "string"
    ? data.payment_reference.trim()
    : "";

  if (!paymentReference || paymentReference.length > 150) {
    fail("payment_reference is required and must be at most 150 characters");
  }

  const paymentMethod = data.payment_method || "bank_transfer";

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    fail("payment_method must be bank_transfer, neft, rtgs, imps or other");
  }

  if (data.payment_date && Number.isNaN(Date.parse(data.payment_date))) {
    fail("payment_date must be a valid date");
  }

  return repository.postPayment(id, {
    amount,
    payment_reference: paymentReference,
    payment_method: paymentMethod,
    payment_date: data.payment_date,
    notes: data.notes,
  });
}

module.exports = {
  createReconciliation,
  getReconciliations,
  getReconciliationById,
  postPayment,
};