
exports.up = (pgm) => {
  pgm.createTable("appointment_blood_requests", {
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
      onDelete: "SET NULL",
    },
    requested_by_doctor_id: {
      type: "uuid",
      references: "doctors",
      onDelete: "SET NULL",
    },
    blood_group: {
      type: "varchar(5)",
      notNull: true,
    },
    component_type: {
      type: "varchar(30)",
      notNull: true,
      default: "whole_blood",
    },
    units_requested: {
      type: "integer",
      notNull: true,
      default: 1,
    },
    urgency: {
      type: "varchar(20)",
      notNull: true,
      default: "routine",
    },
    clinical_indication: {
      type: "text",
      notNull: true,
    },
    required_by: {
      type: "timestamptz",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "pending",
    },
    notes: {
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

  pgm.addConstraint("appointment_blood_requests", "blood_request_group_check", {
    check: "blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')",
  });

  pgm.addConstraint("appointment_blood_requests", "blood_request_component_check", {
    check: "component_type IN ('whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate')",
  });

  pgm.addConstraint("appointment_blood_requests", "blood_request_units_check", {
    check: "units_requested > 0",
  });

  pgm.addConstraint("appointment_blood_requests", "blood_request_urgency_check", {
    check: "urgency IN ('routine', 'urgent', 'emergency')",
  });

  pgm.addConstraint("appointment_blood_requests", "blood_request_status_check", {
    check: "status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled', 'fulfilled')",
  });

  pgm.createIndex("appointment_blood_requests", "patient_id");
  pgm.createIndex("appointment_blood_requests", "appointment_id");
  pgm.createIndex("appointment_blood_requests", ["status", "created_at"]);
};

exports.down = (pgm) => {
  pgm.dropTable("appointment_blood_requests");
};
