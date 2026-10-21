/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

exports.up = (pgm) => {
  pgm.createTable("insurance_enhancement_requests", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    preauthorization_id: {
      type: "uuid",
      notNull: true,
      references: "insurance_preauthorizations",
      onDelete: "RESTRICT",
    },
    previous_approved_amount: {
      type: "numeric(12,2)",
      notNull: true,
    },
    requested_additional_amount: {
      type: "numeric(12,2)",
      notNull: true,
    },
    revised_requested_amount: {
      type: "numeric(12,2)",
      notNull: true,
    },
    reason: {
      type: "text",
      notNull: true,
    },
    supporting_details: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },
    status: {
      type: "varchar(30)",
      notNull: true,
      default: "pending",
    },
    approved_additional_amount: {
      type: "numeric(12,2)",
    },
    rejection_reason: {
      type: "text",
    },
    submitted_at: {
      type: "timestamptz",
    },
    decision_at: {
      type: "timestamptz",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });

  pgm.addConstraint(
    "insurance_enhancement_requests",
    "enhancement_amounts_positive",
    `CHECK (
      previous_approved_amount >= 0
      AND requested_additional_amount > 0
      AND revised_requested_amount =
        previous_approved_amount + requested_additional_amount
    )`
  );

  pgm.addConstraint(
    "insurance_enhancement_requests",
    "enhancement_approved_amount_valid",
    `CHECK (
      approved_additional_amount IS NULL
      OR (
        approved_additional_amount >= 0
        AND approved_additional_amount <= requested_additional_amount
      )
    )`
  );

  pgm.addConstraint(
    "insurance_enhancement_requests",
    "enhancement_status_valid",
    "CHECK (status IN ('pending', 'submitted', 'approved', 'partially_approved', 'rejected', 'cancelled'))"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("insurance_enhancement_requests");
};