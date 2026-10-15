/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.createTable('insurance_reconciliations', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        claim_dossier_id: {
            type: 'uuid',
            notNull: true,
            unique: true,
            references: 'insurance_claim_dossiers',
            onDelete: 'RESTRICT',
        },
        bill_id: {
            type: 'uuid',
            notNull: true,
            references: 'bills',
            onDelete: 'RESTRICT',
        },
        claim_amount: {
            type: 'numeric(12,2)',
            notNull: true,
            check: 'claim_amount > 0',
        },
        expected_amount: {
            type: 'numeric(12,2)',
            notNull: true,
            check: 'expected_amount >= 0',
        },
        received_amount: {
            type: 'numeric(12,2)',
            notNull: true,
            default: 0,
            check: 'received_amount >= 0 AND received_amount <= expected_amount',
        },
        discrepancy_amount: {
            type: 'numeric(12,2)',
            notNull: true,
            default: 0,
            check: 'discrepancy_amount >= 0',
        },
        status: {
            type: 'varchar(30)',
            notNull: true,
            default: 'pending',
            check: "status IN ('pending', 'partially_paid', 'settled', 'discrepancy')",
        },
        notes: { type: 'text' },
        reconciled_at: { type: 'timestamptz' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    pgm.createTable('insurance_payment_postings', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        reconciliation_id: {
            type: 'uuid',
            notNull: true,
            references: 'insurance_reconciliations',
            onDelete: 'RESTRICT',
        },
        amount: {
            type: 'numeric(12,2)',
            notNull: true,
            check: 'amount > 0',
        },
        payment_reference: {
            type: 'varchar(150)',
            notNull: true,
            unique: true,
        },
        payment_method: {
            type: 'varchar(30)',
            notNull: true,
            default: 'bank_transfer',
            check: "payment_method IN ('bank_transfer', 'neft', 'rtgs', 'imps', 'other')",
        },
        payment_date: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        notes: { type: 'text' },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    pgm.createIndex('insurance_payment_postings', 'reconciliation_id');
    pgm.createIndex('insurance_reconciliations', 'bill_id');
    pgm.createIndex('insurance_reconciliations', 'status');
};

exports.down = (pgm) => {
    pgm.dropTable('insurance_payment_postings');
    pgm.dropTable('insurance_reconciliations');
};