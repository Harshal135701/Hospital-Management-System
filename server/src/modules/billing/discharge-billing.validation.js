
const { z } = require("zod");
const { uuidSchema } = require("./billing.validation");

const dischargeItemSchema = z.object({
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
  serviceDate: z.string().date().optional(),
});

const createDischargeBillSchema = z.object({
  admissionId: uuidSchema,
  items: z.array(dischargeItemSchema).min(1).max(100),
  discountAmount: z.coerce.number().finite().min(0).optional(),
  taxAmount: z.coerce.number().finite().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
});

module.exports = {
  createDischargeBillSchema,
  uuidSchema,
};
