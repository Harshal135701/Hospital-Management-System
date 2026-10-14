
const { z } = require("zod");

const uuidSchema = z.string().uuid("Invalid UUID");

const requestRefundSchema = z
  .object({
    advanceDepositId: uuidSchema.optional(),
    billPaymentId: uuidSchema.optional(),
    amount: z.coerce
      .number()
      .positive("Refund amount must be greater than zero")
      .finite()
      .max(100000000, "Refund amount is too large"),
    reason: z
      .string()
      .trim()
      .min(3, "Refund reason must contain at least 3 characters")
      .max(500, "Refund reason cannot exceed 500 characters"),
  })
  .refine(
    (data) =>
      Boolean(data.advanceDepositId) !== Boolean(data.billPaymentId),
    {
      message:
        "Provide exactly one of advanceDepositId or billPaymentId",
    }
  );

const refundIdParamsSchema = z.object({
  refundId: uuidSchema,
});

const listRefundsQuerySchema = z.object({
  status: z
    .enum(["requested", "approved", "rejected", "processed", "failed"])
    .optional(),
});

const updateRefundStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "processed", "failed"]),
  paymentMethod: z
    .enum(["cash", "upi", "card", "bank_transfer", "other"])
    .optional(),
  transactionReference: z
    .string()
    .trim()
    .max(100, "Transaction reference cannot exceed 100 characters")
    .optional(),
});

module.exports = {
  requestRefundSchema,
  refundIdParamsSchema,
  listRefundsQuerySchema,
  updateRefundStatusSchema,
};
