
const { z } = require("zod");

const uuidSchema = z.string().uuid("Invalid UUID");

const collectDepositSchema = z.object({
  admissionId: uuidSchema,
  amount: z.coerce
    .number()
    .positive("Deposit amount must be greater than zero")
    .finite()
    .max(100000000, "Deposit amount is too large"),
  paymentMethod: z.enum([
    "cash",
    "card",
    "upi",
    "bank_transfer",
    "cheque",
  ]),
  transactionReference: z
    .string()
    .trim()
    .max(100, "Transaction reference is too long")
    .optional()
    .nullable(),
});

const admissionIdParamsSchema = z.object({
  admissionId: uuidSchema,
});

const depositIdParamsSchema = z.object({
  depositId: uuidSchema,
});

module.exports = {
  collectDepositSchema,
  admissionIdParamsSchema,
  depositIdParamsSchema,
};
