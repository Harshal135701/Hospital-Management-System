const { z } = require("zod");

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

const checkInSchema = z.object({
  appointmentId: uuidSchema,
});

const callNextSchema = z.object({
  doctorId: uuidSchema,
  roomId: uuidSchema.optional().nullable(),
  date: z.string().regex(dateRegex).optional(),
});

const completeConsultationSchema = z.object({
  notes: z.string().max(1000).optional().nullable(),
});

const queueQuerySchema = z.object({
  date: z.string().regex(dateRegex).optional(),
  departmentId: uuidSchema.optional(),
});

const setPrioritySchema = z.object({
  isPriority: z.boolean(),
  notes: z.string().max(255).optional().nullable(),
});

module.exports = {
  checkInSchema,
  callNextSchema,
  completeConsultationSchema,
  queueQuerySchema,
  setPrioritySchema,
};
