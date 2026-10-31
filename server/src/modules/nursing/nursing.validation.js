const { z } = require("zod");

const createVitalsSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  temperature: z.union([z.number(), z.string()]).transform(v => Number(v)),
  pulse: z.union([z.number(), z.string()]).transform(v => Number(v)),
  bloodPressureSystolic: z.union([z.number(), z.string()]).transform(v => Number(v)),
  bloodPressureDiastolic: z.union([z.number(), z.string()]).transform(v => Number(v)),
  respiratoryRate: z.union([z.number(), z.string()]).transform(v => Number(v)),
  spO2: z.union([z.number(), z.string()]).transform(v => Number(v)),
  painScore: z.union([z.number(), z.string()]).transform(v => Number(v)).refine(v => v >= 0 && v <= 10, "Pain score must be between 0 and 10"),
  notes: z.string().optional().default(""),
  recordedBy: z.string().optional().default("Staff Nurse on Duty")
});

const createIntakeOutputSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  shift: z.string().optional().default("Day Shift (08:00 - 16:00)"),
  intakeOral: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  intakeIv: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  intakeEnteral: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  outputUrine: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  outputDrain: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  outputVomitus: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  notes: z.string().optional().default(""),
  recordedBy: z.string().optional().default("Staff Nurse on Duty")
});

const administerMedicationSchema = z.object({
  marId: z.string().min(1, "MAR ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  barcodeVerified: z.boolean().optional().default(true),
  administeredBy: z.string().optional().default("Staff Nurse on Duty"),
  notes: z.string().optional().default("")
});

const withholdMedicationSchema = z.object({
  marId: z.string().min(1, "MAR ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  withheldReason: z.string().min(3, "Clinical reason is mandatory for withholding medication"),
  withheldBy: z.string().optional().default("Staff Nurse on Duty"),
  notes: z.string().optional().default("")
});

const executeDoctorOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  completedBy: z.string().optional().default("Staff Nurse on Duty"),
  notes: z.string().optional().default(""),
  executionDetails: z.string().optional().default("Procedure executed as per clinical protocol")
});

const createShiftHandoverSchema = z.object({
  wing: z.string().min(1, "Ward wing is required"),
  shiftType: z.string().min(1, "Shift type is required"),
  outgoingNurse: z.string().min(1, "Outgoing nurse name is required"),
  incomingNurse: z.string().min(1, "Incoming nurse name is required"),
  sbarSituation: z.string().min(5, "SBAR Situation is required"),
  sbarBackground: z.string().min(5, "SBAR Background is required"),
  sbarAssessment: z.string().min(5, "SBAR Assessment is required"),
  sbarRecommendation: z.string().min(5, "SBAR Recommendation is required"),
  abnormalVitalsSummary: z.string().optional().default(""),
  pendingOrdersSummary: z.string().optional().default(""),
  highRiskPatientsSummary: z.string().optional().default("")
});

const acceptShiftHandoverSchema = z.object({
  incomingNurseSignature: z.string().min(2, "Incoming nurse signature is required"),
  handoverNotes: z.string().optional().default("")
});

module.exports = {
  createVitalsSchema,
  createIntakeOutputSchema,
  administerMedicationSchema,
  withholdMedicationSchema,
  executeDoctorOrderSchema,
  createShiftHandoverSchema,
  acceptShiftHandoverSchema
};
