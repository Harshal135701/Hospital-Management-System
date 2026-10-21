/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

exports.up = (pgm) => {
  pgm.createTable("insurance_preauthorizations", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    patient_id: {
      type: "uuid",
      notNull: true,
      references: "patients",
      onDelete: "RESTRICT",
    },
    appointment_id: {
      type: "uuid",
      references: "appointments",
      onDelete: "RESTRICT",
    },
    insurance_provider: {
      type: "varchar(150)",
      notNull: true,
    },
    tpa_name: {
      type: "varchar(150)",
    },
    policy_number: {
      type: "varchar(100)",
      notNull: true,
    },
    preauth_number: {
      type: "varchar(100)",
      unique: true,
    },
    requested_amount: {
      type: "numeric(12,2)",
      notNull: true,
    },
    approved_amount: {
      type: "numeric(12,2)",
    },
    status: {
      type: "varchar(30)",
      notNull: true,
      default: "pending",
    },
    clinical_justification: {
      type: "text",
      notNull: true,
    },
    submitted_at: {
      type: "timestamptz",
    },
    decision_at: {
      type: "timestamptz",
    },
    rejection_reason: {
      type: "text",
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
    "insurance_preauthorizations",
    "insurance_preauthorizations_requested_amount_positive",
    "CHECK (requested_amount > 0)"
  );

  pgm.addConstraint(
    "insurance_preauthorizations",
    "insurance_preauthorizations_approved_amount_nonnegative",
    "CHECK (approved_amount IS NULL OR approved_amount >= 0)"
  );

  pgm.addConstraint(
    "insurance_preauthorizations",
    "insurance_preauthorizations_status_valid",
    "CHECK (status IN ('pending', 'submitted', 'approved', 'partially_approved', 'rejected', 'cancelled'))"
  );

  pgm.addConstraint(
    "insurance_preauthorizations",
    "insurance_preauthorizations_approval_amount_valid",
    "CHECK (approved_amount IS NULL OR approved_amount <= requested_amount)"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("insurance_preauthorizations");
};