const { z } = require("zod");

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

const bloodGroupEnum = z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
  errorMap: () => ({ message: "blood_group must be one of A+, A-, B+, B-, AB+, AB-, O+, O-" })
});

const componentTypeEnum = z.enum([
  "whole_blood", "red_cells", "platelets", "plasma", "cryoprecipitate",
  "prbc", "ffp", "cryo_poor_plasma"
]);

const urgencyEnum = z.enum(["routine", "urgent", "emergency", "stat_emergency"]);

const createBloodRequestSchema = z.object({
  patient_id: uuidSchema.optional(),
  patientId: uuidSchema.optional(),
  appointment_id: uuidSchema.optional().nullable(),
  appointmentId: uuidSchema.optional().nullable(),
  requested_by_doctor_id: uuidSchema.optional().nullable(),
  requestedByDoctorId: uuidSchema.optional().nullable(),
  blood_group: bloodGroupEnum.optional(),
  bloodGroup: bloodGroupEnum.optional(),
  component_type: componentTypeEnum.optional().default("whole_blood"),
  componentType: componentTypeEnum.optional(),
  units_requested: z.coerce.number().int().min(1).max(50).optional().default(1),
  unitsRequested: z.coerce.number().int().min(1).max(50).optional(),
  urgency: urgencyEnum.optional().default("routine"),
  clinical_indication: z.string().min(3).max(1000).optional(),
  clinicalIndication: z.string().min(3).max(1000).optional(),
  required_by: z.string().optional().nullable(),
  requiredBy: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => data.patient_id || data.patientId,
  { message: "Patient ID is required (patient_id or patientId)" }
).refine(
  (data) => data.blood_group || data.bloodGroup,
  { message: "Blood group is required (blood_group or bloodGroup)" }
).refine(
  (data) => data.clinical_indication || data.clinicalIndication,
  { message: "Clinical indication is required" }
);

const updateBloodRequestStatusSchema = z.object({
  status: z.enum([
    "pending",
    "under_review",
    "approved",
    "rejected",
    "cancelled",
    "fulfilled",
  ], {
    errorMap: () => ({ message: "Invalid blood request status" })
  }),
  notes: z.string().max(1000).optional().nullable(),
});

const getBloodRequestsQuerySchema = z.object({
  patient_id: uuidSchema.optional(),
  appointment_id: uuidSchema.optional(),
  status: z.enum([
    "pending", "under_review", "approved", "rejected", "cancelled", "fulfilled"
  ]).optional(),
});

module.exports = {
  createBloodRequestSchema,
  updateBloodRequestStatusSchema,
  getBloodRequestsQuerySchema,
};
