const { z } = require("zod");

const createSessionSchema = z.object({
  cabin: z.string().min(1, "Cabin room is required"),
  specialty: z.string().min(1, "Specialty is required"),
  doctor: z.string().min(1, "Doctor name is required"),
  shift: z.string().default("Morning (09:00 - 13:00)"),
  tokenCapacity: z.coerce.number().min(1).max(200).default(30),
  fee: z.coerce.number().min(0).default(800),
  roomId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
});

const checkInSchema = z.object({
  appointmentId: z.string().optional(),
  uhid: z.string().min(1, "UHID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  age: z.coerce.number().min(0).max(130).default(30),
  gender: z.string().default("Female"),
  phone: z.string().min(1, "Phone number is required"),
  doctor: z.string().min(1, "Doctor is required"),
  specialty: z.string().min(1, "Specialty is required"),
  cabin: z.string().min(1, "Cabin is required"),
  category: z.string().default("General"),
  fee: z.string().default("₹800 (Paid - UPI)"),
  appointmentDate: z.string().optional(),
  slotTime: z.string().optional(),
});

const prioritySchema = z.object({
  appointmentId: z.string().optional(),
  tokenNo: z.string().optional(),
  isPriority: z.boolean().default(true),
  category: z.string().default("Emergency / STAT"),
  notes: z.string().optional(),
  cabin: z.string().optional(),
});

const followUpSchema = z.object({
  uhid: z.string().min(1, "UHID is required"),
  patientName: z.string().min(1, "Patient name is required"),
  doctor: z.string().min(1, "Doctor is required"),
  timeframe: z.string().min(1, "Timeframe is required"), // e.g. "Follow up in 2 weeks"
  dueDate: z.string().min(1, "Scheduled review date is required"),
  channels: z.object({
    whatsapp: z.boolean().default(true),
    sms: z.boolean().default(true),
    ivrCall: z.boolean().default(false),
  }).default({ whatsapp: true, sms: true, ivrCall: false }),
  instructions: z.string().default("General consultation review."),
});

const reminderSchema = z.object({
  channel: z.enum(["sms", "whatsapp", "both"]).default("both"),
  templateType: z.string().default("follow_up_recall"),
});

module.exports = {
  createSessionSchema,
  checkInSchema,
  prioritySchema,
  followUpSchema,
  reminderSchema,
};
