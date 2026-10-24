
exports.up = (pgm) => {
  // 6.1 Doctor Consultation Desk
  pgm.createTable("consultation_encounters", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    appointment_id: {
      type: "uuid",
      notNull: true,
      unique: true,
      references: "appointments",
      onDelete: "RESTRICT",
    },
    patient_id: {
      type: "uuid",
      notNull: true,
      references: "patients",
      onDelete: "RESTRICT",
    },
    doctor_id: {
      type: "uuid",
      notNull: true,
      references: "doctors",
      onDelete: "RESTRICT",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "in_progress",
    },
    started_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
    completed_at: {
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

  pgm.addConstraint("consultation_encounters", "consultation_status_check", {
    check: "status IN ('in_progress', 'completed', 'cancelled')",
  });

  pgm.addConstraint("consultation_encounters", "consultation_completion_check", {
    check: "(status = 'completed' AND completed_at IS NOT NULL) OR (status <> 'completed' AND completed_at IS NULL)",
  });

  pgm.createIndex("consultation_encounters", "patient_id");
  pgm.createIndex("consultation_encounters", "doctor_id");
  pgm.createIndex("consultation_encounters", "status");

  // 6.2 Vitals Recording & Physical Examination
  pgm.createTable("vitals_records", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    encounter_id: {
      type: "uuid",
      notNull: true,
      references: "consultation_encounters",
      onDelete: "RESTRICT",
    },
    systolic_bp: { type: "integer" },
    diastolic_bp: { type: "integer" },
    pulse_rate: { type: "integer" },
    temperature_c: { type: "numeric(4,1)" },
    respiratory_rate: { type: "integer" },
    oxygen_saturation: { type: "numeric(5,2)" },
    height_cm: { type: "numeric(6,2)" },
    weight_kg: { type: "numeric(6,2)" },
    examination_findings: { type: "text" },
    recorded_by: {
      type: "uuid",
      references: "doctors",
      onDelete: "SET NULL",
    },
    recorded_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });

  pgm.addConstraint("vitals_records", "vitals_bp_check", {
    check: "(systolic_bp IS NULL OR systolic_bp > 0) AND (diastolic_bp IS NULL OR diastolic_bp > 0)",
  });
  pgm.addConstraint("vitals_records", "vitals_pulse_check", {
    check: "pulse_rate IS NULL OR pulse_rate > 0",
  });
  pgm.addConstraint("vitals_records", "vitals_temperature_check", {
    check: "temperature_c IS NULL OR temperature_c > 0",
  });
  pgm.addConstraint("vitals_records", "vitals_respiration_check", {
    check: "respiratory_rate IS NULL OR respiratory_rate > 0",
  });
  pgm.addConstraint("vitals_records", "vitals_oxygen_check", {
    check: "oxygen_saturation IS NULL OR (oxygen_saturation >= 0 AND oxygen_saturation <= 100)",
  });
  pgm.addConstraint("vitals_records", "vitals_height_check", {
    check: "height_cm IS NULL OR height_cm > 0",
  });
  pgm.addConstraint("vitals_records", "vitals_weight_check", {
    check: "weight_kg IS NULL OR weight_kg > 0",
  });

  pgm.createIndex("vitals_records", ["encounter_id", "recorded_at"]);

  // 6.3 Chief Complaints & Clinical History
  pgm.createTable("clinical_histories", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    encounter_id: {
      type: "uuid",
      notNull: true,
      unique: true,
      references: "consultation_encounters",
      onDelete: "RESTRICT",
    },
    chief_complaints: {
      type: "text",
      notNull: true,
    },
    history_of_present_illness: { type: "text" },
    past_medical_history: { type: "text" },
    medication_history: { type: "text" },
    allergy_history: { type: "text" },
    family_history: { type: "text" },
    social_history: { type: "text" },
    review_of_systems: { type: "text" },
    recorded_at: {
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

  // 6.4 Computerized Provider Order Entry (CPOE)
  pgm.createTable("provider_orders", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    encounter_id: {
      type: "uuid",
      notNull: true,
      references: "consultation_encounters",
      onDelete: "RESTRICT",
    },
    order_type: {
      type: "varchar(20)",
      notNull: true,
    },
    order_name: {
      type: "varchar(200)",
      notNull: true,
    },
    instructions: { type: "text" },
    priority: {
      type: "varchar(20)",
      notNull: true,
      default: "routine",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "draft",
    },
    order_details: { type: "jsonb" },
    ordered_by: {
      type: "uuid",
      notNull: true,
      references: "doctors",
      onDelete: "RESTRICT",
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

  pgm.addConstraint("provider_orders", "provider_order_type_check", {
    check: "order_type IN ('medication', 'laboratory', 'imaging', 'procedure')",
  });
  pgm.addConstraint("provider_orders", "provider_order_priority_check", {
    check: "priority IN ('routine', 'urgent', 'stat')",
  });
  pgm.addConstraint("provider_orders", "provider_order_status_check", {
    check: "status IN ('draft', 'placed', 'in_progress', 'completed', 'cancelled')",
  });

  pgm.createIndex("provider_orders", ["encounter_id", "created_at"]);
  pgm.createIndex("provider_orders", "status");

  // 6.5 Clinical Progress Notes
  pgm.createTable("clinical_progress_notes", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    encounter_id: {
      type: "uuid",
      notNull: true,
      references: "consultation_encounters",
      onDelete: "RESTRICT",
    },
    note_type: {
      type: "varchar(20)",
      notNull: true,
      default: "progress",
    },
    subjective: { type: "text" },
    objective: { type: "text" },
    assessment: {
      type: "text",
      notNull: true,
    },
    plan: {
      type: "text",
      notNull: true,
    },
    follow_up_instructions: { type: "text" },
    author_doctor_id: {
      type: "uuid",
      notNull: true,
      references: "doctors",
      onDelete: "RESTRICT",
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

  pgm.addConstraint("clinical_progress_notes", "progress_note_type_check", {
    check: "note_type IN ('initial', 'progress', 'follow_up')",
  });

  pgm.createIndex("clinical_progress_notes", ["encounter_id", "created_at"]);
};

exports.down = (pgm) => {
  pgm.dropTable("clinical_progress_notes");
  pgm.dropTable("provider_orders");
  pgm.dropTable("clinical_histories");
  pgm.dropTable("vitals_records");
  pgm.dropTable("consultation_encounters");
};
