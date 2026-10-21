const { z } = require("zod");

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID");

// Recurring Doctor Schedule
const createScheduleSchema = z.object({
  doctorId: uuidSchema,
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  shiftType: z.enum(["morning", "evening"]),
  startTime: z.string().regex(timeRegex, "Start time must be HH:mm"),
  endTime: z.string().regex(timeRegex, "End time must be HH:mm"),
  maxPatients: z.coerce.number().int().min(1).default(30),
  effectiveFrom: z.string().regex(dateRegex).optional(),
  effectiveUntil: z.string().regex(dateRegex).optional().nullable(),
  roomId: uuidSchema.optional().nullable(),
  isActive: z.boolean().optional().default(true),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

const updateScheduleSchema = z.object({
  shiftType: z.enum(["morning", "evening"]).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  maxPatients: z.coerce.number().int().min(1).optional(),
  effectiveUntil: z.string().regex(dateRegex).optional().nullable(),
  roomId: uuidSchema.optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.startTime && data.endTime) return data.endTime > data.startTime;
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Doctor Leaves
const applyLeaveSchema = z.object({
  doctorId: uuidSchema,
  startDate: z.string().regex(dateRegex, "startDate must be YYYY-MM-DD"),
  endDate: z.string().regex(dateRegex, "endDate must be YYYY-MM-DD"),
  reason: z.string().max(500).optional().default("Personal leave"),
}).refine(data => data.endDate >= data.startDate, {
  message: "endDate must be greater than or equal to startDate",
  path: ["endDate"],
});

const reviewLeaveSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewedBy: uuidSchema.optional().nullable(),
});

// Daily Rosters
const createRosterSchema = z.object({
  doctorId: uuidSchema,
  rosterDate: z.string().regex(dateRegex, "rosterDate must be YYYY-MM-DD"),
  shiftType: z.enum(["morning", "evening", "on_call"]),
  startTime: z.string().regex(timeRegex, "Start time must be HH:mm"),
  endTime: z.string().regex(timeRegex, "End time must be HH:mm"),
  roomId: uuidSchema.optional().nullable(),
  maxPatients: z.coerce.number().int().min(1).default(30),
  status: z.enum(["draft", "published"]).default("draft"),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

const updateRosterSchema = z.object({
  shiftType: z.enum(["morning", "evening", "on_call"]).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  roomId: uuidSchema.optional().nullable(),
  maxPatients: z.coerce.number().int().min(1).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

const generateRosterSchema = z.object({
  startDate: z.string().regex(dateRegex, "startDate must be YYYY-MM-DD"),
  endDate: z.string().regex(dateRegex, "endDate must be YYYY-MM-DD"),
  doctorId: uuidSchema.optional(),
  departmentId: uuidSchema.optional(),
  autoPublish: z.boolean().optional().default(false),
}).refine(data => data.endDate >= data.startDate, {
  message: "endDate must be greater than or equal to startDate",
  path: ["endDate"],
});

const bulkPublishSchema = z.object({
  startDate: z.string().regex(dateRegex),
  endDate: z.string().regex(dateRegex),
  doctorId: uuidSchema.optional(),
  departmentId: uuidSchema.optional(),
});

module.exports = {
  createScheduleSchema,
  updateScheduleSchema,
  applyLeaveSchema,
  reviewLeaveSchema,
  createRosterSchema,
  updateRosterSchema,
  generateRosterSchema,
  bulkPublishSchema,
};
