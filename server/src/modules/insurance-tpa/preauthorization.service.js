const pool = require("../../config/db");
const repository = require("./preauthorization.repository");

const VALID_STATUSES = [
  "pending",
  "submitted",
  "approved",
  "partially_approved",
  "rejected",
  "cancelled",
];

function httpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

async function validatePatient(patient_id) {
  if (!patient_id) {
    throw httpError("Patient ID is required", 400);
  }

  const result = await pool.query(
    "SELECT id FROM patients WHERE id = $1",
    [patient_id]
  );

  if (!result.rows[0]) {
    throw httpError("Patient not found", 404);
  }
}

async function validateAppointment(appointment_id, patient_id) {
  if (!appointment_id) return;

  const result = await pool.query(
    "SELECT id, patient_id FROM appointments WHERE id = $1",
    [appointment_id]
  );

  const appointment = result.rows[0];

  if (!appointment) {
    throw httpError("Appointment not found", 404);
  }

  if (appointment.patient_id !== patient_id) {
    throw httpError(
      "Appointment does not belong to the specified patient",
      400
    );
  }
}

function validateCreateData(data) {
  for (const field of [
    "insurance_provider",
    "policy_number",
    "clinical_justification",
  ]) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      throw httpError(`${field} is required`, 400);
    }
  }

  const amount = Number(data.requested_amount);

  if (
    data.requested_amount === undefined ||
    data.requested_amount === null ||
    data.requested_amount === "" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw httpError(
      "Requested amount must be a positive number",
      400
    );
  }

  if (
    data.tpa_name !== undefined &&
    data.tpa_name !== null &&
    typeof data.tpa_name !== "string"
  ) {
    throw httpError("TPA name must be text", 400);
  }
}

async function createPreauthorization(data) {
  validateCreateData(data);

  await validatePatient(data.patient_id);
  await validateAppointment(data.appointment_id, data.patient_id);

  return repository.createPreauthorization({
    ...data,
    requested_amount: Number(data.requested_amount),
  });
}

async function getPreauthorizationById(id) {
  if (!id) {
    throw httpError("Pre-authorization ID is required", 400);
  }

  const record = await repository.getPreauthorizationById(id);

  if (!record) {
    throw httpError("Pre-authorization request not found", 404);
  }

  return record;
}

async function getPreauthorizations(filters) {
  if (
    filters.status &&
    !VALID_STATUSES.includes(filters.status)
  ) {
    throw httpError("Invalid pre-authorization status", 400);
  }

  if (filters.patient_id) {
    await validatePatient(filters.patient_id);
  }

  return repository.getPreauthorizations(filters);
}

async function submitPreauthorization(id) {
  const record = await getPreauthorizationById(id);

  if (record.status !== "pending") {
    throw httpError(
      "Only pending requests can be submitted",
      400
    );
  }

  return repository.markPreauthorizationSubmitted(id);
}

async function recordDecision(id, data) {
  const record = await getPreauthorizationById(id);

  if (record.status !== "submitted") {
    throw httpError(
      "Only submitted requests can receive an insurer decision",
      400
    );
  }

  const { status, approved_amount, rejection_reason } = data;

  if (
    !["approved", "partially_approved", "rejected"].includes(status)
  ) {
    throw httpError(
      "Decision must be approved, partially_approved, or rejected",
      400
    );
  }

  let amount = null;

  if (status === "approved" || status === "partially_approved") {
    amount = Number(approved_amount);

    if (
      approved_amount === undefined ||
      approved_amount === null ||
      approved_amount === "" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > Number(record.requested_amount)
    ) {
      throw httpError(
        "Approved amount must be between zero and the requested amount",
        400
      );
    }

    if (status === "approved" && amount !== Number(record.requested_amount)) {
      throw httpError(
        "Fully approved amount must equal the requested amount",
        400
      );
    }

    if (
      status === "partially_approved" &&
      (amount <= 0 || amount >= Number(record.requested_amount))
    ) {
      throw httpError(
        "Partially approved amount must be greater than zero and less than the requested amount",
        400
      );
    }
  } else if (
    typeof rejection_reason !== "string" ||
    !rejection_reason.trim()
  ) {
    throw httpError(
      "Rejection reason is required when rejecting a request",
      400
    );
  }

  return repository.updatePreauthorizationDecision(
    id,
    status,
    amount,
    status === "rejected" ? rejection_reason.trim() : null
  );
}

module.exports = {
  createPreauthorization,
  getPreauthorizationById,
  getPreauthorizations,
  submitPreauthorization,
  recordDecision,
};