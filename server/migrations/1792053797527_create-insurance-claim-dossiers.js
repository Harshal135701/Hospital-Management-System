exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE insurance_claim_dossiers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      preauthorization_id UUID NOT NULL
        REFERENCES insurance_preauthorizations(id) ON DELETE RESTRICT,

      bill_id UUID NOT NULL
        REFERENCES bills(id) ON DELETE RESTRICT,

      claim_number VARCHAR(100) UNIQUE,

      claim_amount NUMERIC(12,2) NOT NULL
        CHECK (claim_amount > 0),

      documents JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(documents) = 'array'),

      status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN (
          'draft',
          'compiled',
          'submitted',
          'accepted',
          'rejected',
          'cancelled'
        )),

      tpa_reference_number VARCHAR(150),
      submission_notes TEXT,
      rejection_reason TEXT,
      compiled_at TIMESTAMPTZ,
      submitted_at TIMESTAMPTZ,
      decision_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_claim_dossiers_preauthorization
      ON insurance_claim_dossiers(preauthorization_id);

    CREATE INDEX idx_claim_dossiers_bill
      ON insurance_claim_dossiers(bill_id);

    CREATE INDEX idx_claim_dossiers_status
      ON insurance_claim_dossiers(status);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS insurance_claim_dossiers;
  `);
};