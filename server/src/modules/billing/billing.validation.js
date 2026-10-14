const { z } = require("zod");

const uuidSchema = z.string().uuid();

const paymentSchema = z.object({
  amount: z.coerce.number().finite().positive(),
  paymentMethod: z.enum([
    "cash",
    "upi",
    "card",
    "bank_transfer",
    "other",
  ]),
  transactionReference: z.string().trim().max(100).optional(),
});

const billItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  category: z.enum([
    "consultation",
    "procedure",
    "lab",
    "radiology",
    "pharmacy",
    "room",
    "nursing",
    "other",
  ]),
  quantity: z.coerce.number().finite().positive().max(10000),
  unitPrice: z.coerce.number().finite().min(0).max(100000000),
});

const createOpdBillSchema = z.object({
  patientId: uuidSchema,
  appointmentId: uuidSchema.optional(),
  items: z.array(billItemSchema).min(1).max(100),
  discountAmount: z.coerce.number().finite().min(0).optional(),
  taxAmount: z.coerce.number().finite().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
  payment: paymentSchema.optional(),
});

const listBillsSchema = z.object({
  patientId: uuidSchema.optional(),
  status: z.enum([
    "draft",
    "issued",
    "partially_paid",
    "paid",
    "cancelled",
  ]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

module.exports = {
  createOpdBillSchema,
  listBillsSchema,
  uuidSchema,
};