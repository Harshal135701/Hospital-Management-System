
/**
 * Billing schema migration.
 * Supports an existing database where these tables were created manually
 * and a fresh database where they do not exist yet.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS admissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admission_number VARCHAR(40) NOT NULL UNIQUE,
      patient_id UUID NOT NULL REFERENCES patients(id),
      attending_doctor_id UUID REFERENCES doctors(id),
      room_id UUID REFERENCES rooms(id),
      admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      discharge_date TIMESTAMPTZ,
      status VARCHAR(20) NOT NULL DEFAULT 'admitted'
        CHECK (status IN ('admitted', 'discharged', 'cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (
        discharge_date IS NULL OR discharge_date >= admission_date
      )
    );

    CREATE INDEX IF NOT EXISTS idx_admissions_patient
      ON admissions(patient_id);

    CREATE TABLE IF NOT EXISTS bills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bill_number VARCHAR(40) NOT NULL UNIQUE,
      patient_id UUID NOT NULL REFERENCES patients(id),
      appointment_id UUID REFERENCES appointments(id),
      admission_id UUID REFERENCES admissions(id),
      bill_type VARCHAR(20) NOT NULL
        CHECK (bill_type IN ('opd', 'ipd_interim', 'ipd_final')),
      status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN (
          'draft', 'issued', 'partially_paid', 'paid', 'cancelled'
        )),
      subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
      discount_amount NUMERIC NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0 AND discount_amount <= subtotal),
      tax_amount NUMERIC NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
      total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
      amount_paid NUMERIC NOT NULL DEFAULT 0
        CHECK (amount_paid >= 0 AND amount_paid <= total_amount),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (
        (bill_type = 'opd' AND admission_id IS NULL)
        OR
        (bill_type IN ('ipd_interim', 'ipd_final')
          AND admission_id IS NOT NULL)
      )
    );

    CREATE INDEX IF NOT EXISTS idx_bills_admission
      ON bills(admission_id);

    CREATE INDEX IF NOT EXISTS idx_bills_patient
      ON bills(patient_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS bill_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bill_id UUID NOT NULL REFERENCES bills(id),
      description VARCHAR(200) NOT NULL,
      category VARCHAR(30) NOT NULL CHECK (category IN (
        'consultation', 'procedure', 'lab', 'radiology',
        'pharmacy', 'room', 'nursing', 'other'
      )),
      quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity > 0),
      unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
      line_total NUMERIC NOT NULL CHECK (line_total >= 0),
      service_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bill_items_bill
      ON bill_items(bill_id);

    CREATE TABLE IF NOT EXISTS bill_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      receipt_number VARCHAR(40) NOT NULL UNIQUE,
      bill_id UUID NOT NULL REFERENCES bills(id),
      amount NUMERIC NOT NULL CHECK (amount > 0),
      payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN (
          'cash', 'upi', 'card', 'bank_transfer', 'other'
        )),
      transaction_reference VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('completed', 'failed', 'reversed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bill_payments_bill
      ON bill_payments(bill_id);

    CREATE TABLE IF NOT EXISTS interim_bills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bill_id UUID NOT NULL UNIQUE REFERENCES bills(id),
      admission_id UUID NOT NULL REFERENCES admissions(id),
      period_start TIMESTAMPTZ NOT NULL,
      period_end TIMESTAMPTZ NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (period_end >= period_start)
    );

    CREATE TABLE IF NOT EXISTS discharge_bills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bill_id UUID NOT NULL UNIQUE REFERENCES bills(id),
      admission_id UUID NOT NULL UNIQUE REFERENCES admissions(id),
      gross_amount NUMERIC NOT NULL CHECK (gross_amount >= 0),
      advance_adjusted NUMERIC NOT NULL DEFAULT 0
        CHECK (advance_adjusted >= 0),
      refund_due NUMERIC NOT NULL DEFAULT 0 CHECK (refund_due >= 0),
      balance_due NUMERIC NOT NULL DEFAULT 0 CHECK (balance_due >= 0),
      finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS advance_deposits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      receipt_number VARCHAR(40) NOT NULL UNIQUE,
      admission_id UUID NOT NULL REFERENCES admissions(id),
      patient_id UUID NOT NULL REFERENCES patients(id),
      amount NUMERIC NOT NULL CHECK (amount > 0),
      payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN (
          'cash', 'upi', 'card', 'bank_transfer', 'other'
        )),
      transaction_reference VARCHAR(100),
      status VARCHAR(25) NOT NULL DEFAULT 'collected'
        CHECK (status IN (
          'collected', 'partially_adjusted', 'adjusted',
          'partially_refunded', 'refunded'
        )),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_advance_deposits_admission
      ON advance_deposits(admission_id);

    CREATE TABLE IF NOT EXISTS deposit_adjustments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deposit_id UUID NOT NULL REFERENCES advance_deposits(id),
      bill_id UUID NOT NULL REFERENCES bills(id),
      amount NUMERIC NOT NULL CHECK (amount > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (deposit_id, bill_id)
    );

    CREATE INDEX IF NOT EXISTS idx_deposit_adjustments_bill
      ON deposit_adjustments(bill_id);

    CREATE TABLE IF NOT EXISTS refunds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      refund_number VARCHAR(40) NOT NULL UNIQUE,
      patient_id UUID NOT NULL REFERENCES patients(id),
      bill_payment_id UUID REFERENCES bill_payments(id),
      advance_deposit_id UUID REFERENCES advance_deposits(id),
      amount NUMERIC NOT NULL CHECK (amount > 0),
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'requested'
        CHECK (status IN (
          'requested', 'approved', 'rejected', 'processed', 'failed'
        )),
      payment_method VARCHAR(20)
        CHECK (payment_method IS NULL OR payment_method IN (
          'cash', 'upi', 'card', 'bank_transfer', 'other'
        )),
      transaction_reference VARCHAR(100),
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ,
      CHECK (
        (bill_payment_id IS NOT NULL AND advance_deposit_id IS NULL)
        OR
        (bill_payment_id IS NULL AND advance_deposit_id IS NOT NULL)
      )
    );

    CREATE INDEX IF NOT EXISTS idx_refunds_patient
      ON refunds(patient_id, requested_at DESC);

    CREATE INDEX IF NOT EXISTS idx_refunds_status
      ON refunds(status, requested_at DESC);

    CREATE TABLE IF NOT EXISTS cashier_settlements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      settlement_number VARCHAR(50) NOT NULL UNIQUE,
      business_date DATE NOT NULL,
      cashier_name VARCHAR(100) NOT NULL,
      opening_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
      expected_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
      counted_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
      cash_variance NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_refunded NUMERIC(12,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'closed'
        CHECK (status = 'closed'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (
        opening_cash >= 0 AND expected_cash >= 0
        AND counted_cash >= 0 AND total_collected >= 0
        AND total_refunded >= 0
      ),
      CHECK (cash_variance = counted_cash - expected_cash)
    );

    /*
     * Existing installations may have multiple test settlements for a day.
     * Do not delete or silently discard financial records. Add the unique
     * business-date index only when existing data permits it.
     */
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM cashier_settlements
        GROUP BY business_date
        HAVING COUNT(*) > 1
      ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS
          uq_cashier_settlements_business_date
          ON cashier_settlements(business_date);
      END IF;
    END
    $$;
  `);
};

export const down = (pgm) => {
  throw new Error(
    "Rollback disabled: billing tables may contain existing financial records."
  );
};
