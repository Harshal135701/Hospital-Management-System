const repo = require("./bloodRequest.repository");
const ApiError = require("../../utils/ApiError");

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

const COMPONENT_MAP = {
  whole_blood: "whole_blood",
  red_cells: "prbc",
  prbc: "prbc",
  plasma: "ffp",
  ffp: "ffp",
  platelets: "platelets",
  cryoprecipitate: "cryoprecipitate",
  cryo_poor_plasma: "cryo_poor_plasma",
};

const URGENCY_MAP = {
  routine: "routine",
  urgent: "urgent",
  emergency: "stat_emergency",
  stat_emergency: "stat_emergency",
};

function parseBloodGroup(bg) {
  if (!bg || typeof bg !== "string") {
    throw ApiError.badRequest("Invalid blood group format");
  }
  const clean = bg.trim().toUpperCase();
  const rhPositive = clean.endsWith("+");
  const rhNegative = clean.endsWith("-");

  if (!rhPositive && !rhNegative) {
    throw ApiError.badRequest("Blood group must specify Rh factor (+ or -)");
  }

  const group = clean.slice(0, -1);
  if (!["A", "B", "AB", "O"].includes(group)) {
    throw ApiError.badRequest(`Invalid ABO group: ${group}`);
  }

  return {
    patientBloodGroup: group,
    patientRhFactor: rhPositive ? "positive" : "negative",
  };
}

async function createBloodRequest(data, currentUser = {}) {
  const patientId = data.patientId || data.patient_id;
  const appointmentId = data.appointmentId || data.appointment_id || null;
  const rawBloodGroup = data.bloodGroup || data.blood_group;
  const rawComponentType = data.componentType || data.component_type || "whole_blood";
  const unitsRequested = parseInt(data.unitsRequested || data.units_requested || 1, 10);
  const urgency = data.urgency || "routine";
  const clinicalIndication = data.clinicalIndication || data.clinical_indication;
  const requiredBy = data.requiredBy || data.required_by || null;
  const notes = data.notes || null;

  if (!patientId) {
    throw ApiError.badRequest("Patient ID is required");
  }
  if (!rawBloodGroup) {
    throw ApiError.badRequest("Blood group is required");
  }
  if (!clinicalIndication || clinicalIndication.trim().length < 3) {
    throw ApiError.badRequest("Clinical indication must be at least 3 characters");
  }
  if (unitsRequested <= 0 || unitsRequested > 50) {
    throw ApiError.badRequest("Units requested must be between 1 and 50");
  }

  // 1. Verify Patient
  const patient = await repo.findPatientById(patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  // 2. Doctor Identity Enforcement:
  // Derive doctor linkage directly from server-side authenticated user record
  let doctorId = null;
  let requesterName = currentUser.full_name || "Prescribing Clinician";

  if (currentUser.role === "clinician_doctor") {
    if (!currentUser.doctor_id) {
      throw ApiError.forbidden("Your clinician account is not linked to a registered doctor record");
    }
    doctorId = currentUser.doctor_id;
  } else if (["blood_bank_officer", "super_admin"].includes(currentUser.role)) {
    doctorId = data.requestedByDoctorId || data.requested_by_doctor_id || currentUser.doctor_id || null;
  } else {
    throw ApiError.forbidden("Only clinicians and blood bank officers may create blood requests");
  }

  if (doctorId) {
    const doctor = await repo.findDoctorById(doctorId);
    if (!doctor) {
      throw ApiError.notFound("Designated requesting doctor not found or inactive");
    }
    requesterName = doctor.full_name;
  }

  // 3. Verify Appointment if linked
  let departmentId = null;
  if (appointmentId) {
    const appointment = await repo.findAppointmentById(appointmentId);
    if (!appointment) {
      throw ApiError.notFound("Linked appointment not found");
    }
    if (appointment.patient_id !== patientId) {
      throw ApiError.badRequest("Appointment does not belong to the specified patient");
    }
    if (["cancelled", "no_show"].includes(appointment.status)) {
      throw ApiError.badRequest(`Cannot order blood request for a ${appointment.status} appointment`);
    }
    departmentId = appointment.department_id;
  }

  // 4. Parse blood typing & mapped properties
  const { patientBloodGroup, patientRhFactor } = parseBloodGroup(rawBloodGroup);
  const canonicalComponent = COMPONENT_MAP[rawComponentType] || "whole_blood";
  const canonicalUrgency = URGENCY_MAP[urgency] || "routine";

  // 5. Transaction: Create appointment blood request & bridge to blood_requisitions
  const client = await repo.pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Bridge: Create formal blood bank requisition
    const requisition = await repo.createBloodRequisitionWithClient(
      {
        patientId,
        departmentId,
        doctorId,
        requesterName,
        urgency: canonicalUrgency,
        requestedComponent: canonicalComponent,
        unitsRequested,
        patientBloodGroup,
        patientRhFactor,
        clinicalIndication: `[Appointment Request${appointmentId ? ` (APT: ${appointmentId.slice(0, 8)})` : ""}] ${clinicalIndication}`,
        requiredBy,
      },
      client
    );

    // Create the appointment blood request record with reference to blood_requisition
    const bloodRequest = await repo.createBloodRequestWithClient(
      {
        patientId,
        appointmentId,
        requestedByDoctorId: doctorId,
        bloodRequisitionId: requisition.id,
        bloodGroup: rawBloodGroup,
        componentType: rawComponentType,
        unitsRequested,
        urgency,
        clinicalIndication,
        requiredBy,
        notes,
      },
      client
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      ...bloodRequest,
      blood_requisition: requisition,
    };
  } catch (err) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    throw err;
  } finally {
    client.release();
  }
}

async function getBloodRequests(filters) {
  if (filters.status && !ALLOWED_STATUSES.includes(filters.status)) {
    throw ApiError.badRequest(`Invalid request status: ${filters.status}`);
  }
  return repo.getBloodRequests(filters);
}

async function getBloodRequestById(id) {
  const request = await repo.getBloodRequestById(id);
  if (!request) {
    throw ApiError.notFound("Blood request not found");
  }
  return request;
}

async function updateBloodRequestStatus(id, status, notes, currentUser = {}) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw ApiError.badRequest(`Invalid request status: ${status}`);
  }

  const existing = await getBloodRequestById(id);
  const allowedNextStatuses = STATUS_TRANSITIONS[existing.status] || [];

  if (!allowedNextStatuses.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition status from '${existing.status}' to '${status}'. Allowed: [${allowedNextStatuses.join(", ")}]`
    );
  }

  const updated = await repo.updateBloodRequestStatus(id, status, notes);

  // If status is cancelled, also sync with blood_requisitions
  if (status === "cancelled" && existing.blood_requisition_id) {
    await repo.pool.query(
      `UPDATE blood_requisitions SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [existing.blood_requisition_id]
    );
  }

  return updated;
}

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};
