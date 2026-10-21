const repository = require("./responsibility.repository");
const pool = require("../../config/db");

const VALID_TYPES = ["co_payment", "deductible"];
const VALID_STATUSES = ["pending", "partially_paid", "paid", "cancelled"];

const createResponsibility = async (data) => {
  const {
    bill_id,
    preauthorization_id,
    responsibility_type,
    calculated_amount,
    notes,
  } = data;

  if (!bill_id || !responsibility_type || calculated_amount === undefined) {
    const error = new Error(
      "bill_id, responsibility_type and calculated_amount are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (!VALID_TYPES.includes(responsibility_type)) {
    const error = new Error(
      "responsibility_type must be co_payment or deductible"
    );
    error.statusCode = 400;
    throw error;
  }

  const amount = Number(calculated_amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("calculated_amount must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const billResult = await pool.query(
    `SELECT id, patient_id, total_amount
     FROM bills
     WHERE id = $1`,
    [bill_id]
  );

  if (!billResult.rows.length) {
    const error = new Error("Bill not found");
    error.statusCode = 404;
    throw error;
  }

  if (preauthorization_id) {
    const preauthResult = await pool.query(
      `SELECT id, patient_id, status
       FROM insurance_preauthorizations
       WHERE id = $1`,
      [preauthorization_id]
    );

    if (!preauthResult.rows.length) {
      const error = new Error("Preauthorization not found");
      error.statusCode = 404;
      throw error;
    }

    const preauth = preauthResult.rows[0];

    if (preauth.patient_id !== billResult.rows[0].patient_id) {
      const error = new Error(
        "Bill and preauthorization must belong to the same patient"
      );
      error.statusCode = 400;
      throw error;
    }

    if (preauth.status !== "approved") {
      const error = new Error(
        "Preauthorization must be approved before recording patient responsibility"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  if (amount > Number(billResult.rows[0].total_amount)) {
    const error = new Error(
      "Patient responsibility cannot exceed the bill total"
    );
    error.statusCode = 400;
    throw error;
  }

  return repository.createResponsibility({
    bill_id,
    preauthorization_id,
    responsibility_type,
    calculated_amount: amount,
    notes,
  });
};

const getResponsibilityById = async (id) => {
  const record = await repository.getResponsibilityById(id);

  if (!record) {
    const error = new Error("Patient responsibility record not found");
    error.statusCode = 404;
    throw error;
  }

  return record;
};

const getResponsibilities = async (filters) => {
  if (filters.status && !VALID_STATUSES.includes(filters.status)) {
    const error = new Error("Invalid responsibility status");
    error.statusCode = 400;
    throw error;
  }

  return repository.getResponsibilities(filters);
};

const collectPayment = async (id, amount, paymentMethod) => {
  const paymentAmount = Number(amount);

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    const error = new Error("Payment amount must be greater than zero");
    error.statusCode = 400;
    throw error;
  }

  const validPaymentMethods = [
    "cash",
    "upi",
    "card",
    "bank_transfer",
    "other",
  ];

  if (!validPaymentMethods.includes(paymentMethod)) {
    const error = new Error(
      "payment_method must be cash, upi, card, bank_transfer or other"
    );
    error.statusCode = 400;
    throw error;
  }

  return repository.collectPayment(id, paymentAmount, paymentMethod);
};

module.exports = {
  createResponsibility,
  getResponsibilityById,
  getResponsibilities,
  collectPayment,
};