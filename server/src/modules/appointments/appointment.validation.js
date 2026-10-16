const { z } = require("zod");

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

const createAppointmentSchema = z.object({
  patientId: uuidSchema,
  doctorId: uuidSchema,
  departmentId: uuidSchema,
  appointmentDate: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(timeRegex, "Start time must be HH:mm (24-hour format)"),
  visitType: z.enum(["first_visit", "follow_up"], {
    errorMap: () => ({ message: "visitType must be 'first_visit' or 'follow_up'" }),
  }),
  roomId: uuidSchema.optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isPriority: z.boolean().optional().default(false),
});

const rescheduleSchema = z.object({
  appointmentDate: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  startTime: z.string().regex(timeRegex, "Start time must be HH:mm (24-hour format)"),
  roomId: uuidSchema.optional().nullable(),
  reason: z.string().max(255).optional().nullable(),
});

const cancelSchema = z.object({
  reason: z.string().max(255).optional().default("Cancelled by user"),
});

const getSlotsQuerySchema = z.object({
  doctorId: uuidSchema,
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  duration: z.coerce.number().int().min(5).max(120).default(15),
});

const listAppointmentsQuerySchema = z.object({
  date: z.string().regex(dateRegex).optional(),
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
  doctorId: uuidSchema.optional(),
  departmentId: uuidSchema.optional(),
  patientId: uuidSchema.optional(),
  status: z.enum([
    "booked", "arrived", "waiting", "in_consultation", "completed", "cancelled", "no_show"
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createAppointmentSchema,
  rescheduleSchema,
  cancelSchema,
  getSlotsQuerySchema,
  listAppointmentsQuerySchema,
};

const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "arrived",
    "waiting",
    "in_consultation",
    "completed",
    "cancelled",
    "no_show",
  ]),
  cancellation_reason: z.string().max(255).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

module.exports = {
  createAppointmentSchema,
  rescheduleSchema,
  cancelSchema,
  getSlotsQuerySchema,
  listAppointmentsQuerySchema,
  updateAppointmentStatusSchema,
};
