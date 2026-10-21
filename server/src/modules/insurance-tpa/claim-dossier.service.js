const pool = require("../../config/db");
const repository = require("./claim-dossier.repository");

const VALID_STATUSES = [
  "draft",
  "compiled",
  "submitted",
  "accepted",
  "rejected",
  "cancelled",
];

function httpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

async function createClaimDossier(data) {
  const {
    preauthorization_id,
    bill_id,
    claim_amount,
    documents = [],
  } = data;

  if (!preauthorization_id || !bill_id) {
    throw httpError("Pre-authorization ID and bill ID are required", 400);
  }

  const amount = Number(claim_amount);

  if (
    claim_amount === undefined ||
    claim_amount === null ||
    claim_amount === "" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw httpError("Claim amount must be a positive number", 400);
  }

  if (!Array.isArray(documents)) {
    throw httpError("Documents must be an array", 400);
  }

  const preauthResult = await pool.query(
    `SELECT id, patient_id, status, approved_amount
     FROM insurance_preauthorizations
     WHERE id = $1`,
    [preauthorization_id]
  );

  const preauth = preauthResult.rows[0];

  if (!preauth) {
    throw httpError("Pre-authorization not found", 404);
  }

  if (preauth.status !== "approved") {
    throw httpError("Claim requires an approved pre-authorization", 400);
  }

  if (Number(preauth.approved_amount) <= 0) {
    throw httpError("Pre-authorization has no approved amount", 400);
  }

  const billResult = await pool.query(
    `SELECT id, patient_id, total_amount
     FROM bills
     WHERE id = $1`,
    [bill_id]
  );

  const bill = billResult.rows[0];

  if (!bill) {
    throw httpError("Bill not found", 404);
  }

  if (bill.patient_id !== preauth.patient_id) {
    throw httpError(
      "Bill and pre-authorization must belong to the same patient",
      400
    );
  }

  if (amount > Number(bill.total_amount)) {
    throw httpError("Claim amount cannot exceed the bill total", 400);
  }

  if (amount > Number(preauth.approved_amount)) {
    throw httpError(
      "Claim amount cannot exceed the approved insurance amount",
      400
    );
  }

  return repository.createClaimDossier({
    preauthorization_id,
    bill_id,
    claim_amount: amount,
    documents,
  });
}

async function getClaimDossierById(id) {
  if (!id) {
    throw httpError("Claim dossier ID is required", 400);
  }

  const dossier = await repository.getClaimDossierById(id);

  if (!dossier) {
    throw httpError("Claim dossier not found", 404);
  }

  return dossier;
}

async function getClaimDossiers(filters = {}) {
  if (filters.status && !VALID_STATUSES.includes(filters.status)) {
    throw httpError("Invalid claim dossier status", 400);
  }

  return repository.getClaimDossiers(filters);
}

async function compileClaimDossier(id, data = {}) {
  const dossier = await getClaimDossierById(id);

  if (dossier.status !== "draft") {
    throw httpError("Only draft claim dossiers can be compiled", 400);
  }

  const documents =
    data.documents === undefined ? dossier.documents : data.documents;

  if (!Array.isArray(documents)) {
    throw httpError("Documents must be an array", 400);
  }

  if (documents.length === 0) {
    throw httpError("At least one supporting document is required", 400);
  }

  for (const document of documents) {
    if (
      !document ||
      typeof document !== "object" ||
      Array.isArray(document) ||
      typeof document.name !== "string" ||
      !document.name.trim() ||
      typeof document.type !== "string" ||
      !document.type.trim()
    ) {
      throw httpError(
        "Each document must contain a non-empty name and type",
        400
      );
    }
  }

  const claimNumber =
    dossier.claim_number || `CLM-${Date.now()}-${id.slice(0, 8)}`;

  const updated = await repository.updateClaimDossier(id, {
    claim_number: claimNumber,
    documents,
    status: "compiled",
    compiled_at: new Date().toISOString(),
  });

  return updated;
}

async function submitClaimDossier(id, data = {}) {
  const dossier = await getClaimDossierById(id);

  if (dossier.status !== "compiled") {
    throw httpError("Only compiled claim dossiers can be submitted", 400);
  }

  if (
    typeof data.tpa_reference_number !== "string" ||
    !data.tpa_reference_number.trim()
  ) {
    throw httpError("TPA reference number is required", 400);
  }

  const updated = await repository.updateClaimDossier(id, {
    status: "submitted",
    tpa_reference_number: data.tpa_reference_number.trim(),
    submission_notes:
      typeof data.submission_notes === "string"
        ? data.submission_notes.trim()
        : null,
    submitted_at: new Date().toISOString(),
  });

  return updated;
}

async function recordClaimDecision(id, data) {
  const dossier = await getClaimDossierById(id);

  if (dossier.status !== "submitted") {
    throw httpError(
      "Only submitted claim dossiers can receive a decision",
      400
    );
  }

  if (!["accepted", "rejected"].includes(data.status)) {
    throw httpError("Decision must be accepted or rejected", 400);
  }

  if (
    data.status === "rejected" &&
    (typeof data.rejection_reason !== "string" ||
      !data.rejection_reason.trim())
  ) {
    throw httpError("Rejection reason is required", 400);
  }

  return repository.updateClaimDossier(id, {
    status: data.status,
    rejection_reason:
      data.status === "rejected" ? data.rejection_reason.trim() : null,
    decision_at: new Date().toISOString(),
  });
}

module.exports = {
  createClaimDossier,
  getClaimDossierById,
  getClaimDossiers,
  compileClaimDossier,
  submitClaimDossier,
  recordClaimDecision,
};