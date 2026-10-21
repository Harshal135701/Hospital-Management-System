
const { z } = require("zod");

const closeSettlementSchema = z.object({
  businessDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Business date must be in YYYY-MM-DD format"),

  cashierName: z
    .string()
    .trim()
    .min(2, "Cashier name must contain at least 2 characters")
    .max(100, "Cashier name cannot exceed 100 characters"),

  openingCash: z
    .number()
    .finite()
    .min(0, "Opening cash cannot be negative")
    .max(100000000, "Opening cash exceeds the allowed limit"),

  countedCash: z
    .number()
    .finite()
    .min(0, "Counted cash cannot be negative")
    .max(100000000, "Counted cash exceeds the allowed limit"),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),
});

module.exports = {
  closeSettlementSchema,
};
