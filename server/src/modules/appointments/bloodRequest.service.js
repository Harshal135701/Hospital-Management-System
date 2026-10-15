
const repository = require("./bloodRequest.repository");

const ALLOWED_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "cancelled",
  "fulfilled",
];

const STATUS_TRANSITIONS = {
  pending: ["under_review", "rejected", "cancelled"],
  under_review: ["approved", "rejected", "cancelled"],
  approved: ["fulfilled", "cancelled"],
  rejected: [],
  cancelled: [],
  fulfilled: [],
};

async function createBloodRequest(data) {
  if (!data.patient_id) {
    throw Object.assign(new Error("Patient ID is required"), {
      statusCode: 400,
    });
  }

  if (!data.blood_group || !data.clinical_indication) {
    throw Object.assign(
      new Error("Blood group and clinical indication are required"),
      { statusCode: 400 }
    );
  }

  return repository.createBloodRequest(data);
}

async function getBloodRequests(filters) {
  if (filters.status && !ALLOWED_STATUSES.includes(filters.status)) {
    throw Object.assign(new Error("Invalid request status"), {
      statusCode: 400,
    });
  }

  return repository.getBloodRequests(filters);
}

async function getBloodRequestById(id) {
  const request = await repository.getBloodRequestById(id);

  if (!request) {
    throw Object.assign(new Error("Blood request not found"), {
      statusCode: 404,
    });
  }

  return request;
}

async function updateBloodRequestStatus(id, status, notes) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw Object.assign(new Error("Invalid request status"), {
      statusCode: 400,
    });
  }

  const existing = await getBloodRequestById(id);
  const allowedNextStatuses = STATUS_TRANSITIONS[existing.status] || [];

  if (!allowedNextStatuses.includes(status)) {
    throw Object.assign(
      new Error(`Cannot change status from ${existing.status} to ${status}`),
      { statusCode: 400 }
    );
  }

  return repository.updateBloodRequestStatus(id, status, notes);
}

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};
