exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE insurance_patient_responsibilities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      bill_id UUID NOT NULL
        REFERENCES bills(id) ON DELETE RESTRICT,

      preauthorization_id UUID
        REFERENCES insurance_preauthorizations(id) ON DELETE RESTRICT,

      responsibility_type VARCHAR(20) NOT NULL
        CHECK (responsibility_type IN ('co_payment', 'deductible')),

      calculated_amount NUMERIC(12,2) NOT NULL
        CHECK (calculated_amount > 0),

      collected_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (
          collected_amount >= 0
          AND collected_amount <= calculated_amount
        ),

      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'partially_paid', 'paid', 'cancelled')),

      notes TEXT,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CHECK (
        (status = 'pending' AND collected_amount = 0)
        OR
        (status = 'partially_paid'
          AND collected_amount > 0
          AND collected_amount < calculated_amount)
        OR
        (status = 'paid' AND collected_amount = calculated_amount)
        OR
        status = 'cancelled'
      )
    );

    CREATE INDEX idx_patient_responsibilities_bill
      ON insurance_patient_responsibilities(bill_id);

    CREATE INDEX idx_patient_responsibilities_preauth
      ON insurance_patient_responsibilities(preauthorization_id);

    CREATE INDEX idx_patient_responsibilities_status
      ON insurance_patient_responsibilities(status);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS insurance_patient_responsibilities;
  `);
};