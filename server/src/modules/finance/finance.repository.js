const pool = require("../../config/db");

// 13.1 Chart of Accounts & General Ledger
async function createAccount(data) {
  const { account_code, account_name, account_type, parent_id, currency = "INR" } = data;
  const result = await pool.query(
    `INSERT INTO finance_chart_of_accounts (account_code, account_name, account_type, parent_id, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [account_code, account_name, account_type, parent_id || null, currency]
  );
  return result.rows[0];
}

async function getAccounts(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.account_type) {
    values.push(filters.account_type);
    conditions.push(`account_type = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM finance_chart_of_accounts ${whereClause} ORDER BY account_code ASC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function createJournalEntry(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      entry_number,
      entry_date,
      reference_number,
      narration,
      total_amount,
      lines = [],
      created_by,
    } = data;

    const entryRes = await client.query(
      `INSERT INTO finance_journal_entries (
        entry_number,
        entry_date,
        reference_number,
        narration,
        total_amount,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        entry_number,
        entry_date || new Date(),
        reference_number || null,
        narration || null,
        total_amount,
        created_by || null,
      ]
    );

    const entry = entryRes.rows[0];
    const insertedLines = [];

    for (const line of lines) {
      const lineRes = await client.query(
        `INSERT INTO finance_journal_lines (
          journal_entry_id,
          account_id,
          debit,
          credit,
          line_narration
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          entry.id,
          line.account_id,
          line.debit || 0,
          line.credit || 0,
          line.line_narration || null,
        ]
      );
      insertedLines.push(lineRes.rows[0]);
    }

    await client.query("COMMIT");
    entry.lines = insertedLines;
    return entry;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getJournalEntries(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`fje.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT
      fje.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', fjl.id,
            'account_id', fjl.account_id,
            'account_name', fca.account_name,
            'account_code', fca.account_code,
            'debit', fjl.debit,
            'credit', fjl.credit,
            'line_narration', fjl.line_narration
          )
        ) FILTER (WHERE fjl.id IS NOT NULL),
        '[]'
      ) AS lines
    FROM finance_journal_entries fje
    LEFT JOIN finance_journal_lines fjl ON fjl.journal_entry_id = fje.id
    LEFT JOIN finance_chart_of_accounts fca ON fca.id = fjl.account_id
    ${whereClause}
    GROUP BY fje.id
    ORDER BY fje.entry_date DESC, fje.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

// 13.2 Debit / Credit Payment Vouchers
async function createVoucher(data) {
  const {
    voucher_number,
    voucher_type,
    voucher_date,
    payee_name,
    payment_mode = "bank",
    amount,
    account_id,
    reference_document,
    status = "approved",
    approved_by,
    remarks,
  } = data;

  const result = await pool.query(
    `INSERT INTO finance_payment_vouchers (
      voucher_number,
      voucher_type,
      voucher_date,
      payee_name,
      payment_mode,
      amount,
      account_id,
      reference_document,
      status,
      approved_by,
      remarks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      voucher_number,
      voucher_type,
      voucher_date || new Date(),
      payee_name,
      payment_mode,
      amount,
      account_id || null,
      reference_document || null,
      status,
      approved_by || null,
      remarks || null,
    ]
  );
  return result.rows[0];
}

async function getVouchers(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.voucher_type) {
    values.push(filters.voucher_type);
    conditions.push(`fpv.voucher_type = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`fpv.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT fpv.*, fca.account_name, fca.account_code
    FROM finance_payment_vouchers fpv
    LEFT JOIN finance_chart_of_accounts fca ON fca.id = fpv.account_id
    ${whereClause}
    ORDER BY fpv.voucher_date DESC, fpv.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateVoucherStatus(id, status) {
  const result = await pool.query(
    `UPDATE finance_payment_vouchers SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] || null;
}

// 13.3 Doctor Payout & Revenue Share Calculation
async function createDoctorPayout(data) {
  const {
    payout_batch_number,
    doctor_id,
    period_start,
    period_end,
    opd_consultation_revenue = 0,
    opd_share_percent = 70,
    ipd_surgery_revenue = 0,
    ipd_share_percent = 60,
    diagnostic_revenue = 0,
    diagnostic_share_percent = 10,
    gross_payable,
    tds_deduction = 0,
    other_deductions = 0,
    net_payout,
    status = "calculated",
  } = data;

  const result = await pool.query(
    `INSERT INTO finance_doctor_payouts (
      payout_batch_number,
      doctor_id,
      period_start,
      period_end,
      opd_consultation_revenue,
      opd_share_percent,
      ipd_surgery_revenue,
      ipd_share_percent,
      diagnostic_revenue,
      diagnostic_share_percent,
      gross_payable,
      tds_deduction,
      other_deductions,
      net_payout,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      payout_batch_number,
      doctor_id,
      period_start,
      period_end,
      opd_consultation_revenue,
      opd_share_percent,
      ipd_surgery_revenue,
      ipd_share_percent,
      diagnostic_revenue,
      diagnostic_share_percent,
      gross_payable,
      tds_deduction,
      other_deductions,
      net_payout,
      status,
    ]
  );
  return result.rows[0];
}

async function getDoctorPayouts(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.doctor_id) {
    values.push(filters.doctor_id);
    conditions.push(`fdp.doctor_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`fdp.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT fdp.*, d.full_name AS doctor_name, d.employee_code
    FROM finance_doctor_payouts fdp
    JOIN doctors d ON d.id = fdp.doctor_id
    ${whereClause}
    ORDER BY fdp.created_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function markDoctorPayoutPaid(id) {
  const result = await pool.query(
    `UPDATE finance_doctor_payouts
     SET status = 'paid', paid_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

// 13.4 Bank Reconciliation
async function createBankReconciliation(data) {
  const {
    reconciliation_number,
    bank_account_id,
    statement_date,
    statement_balance,
    ledger_balance,
    difference_amount = 0,
    matched_items_count = 0,
    status = "unreconciled",
    reconciled_by,
    remarks,
  } = data;

  const reconciledAt = status === "reconciled" ? new Date() : null;

  const result = await pool.query(
    `INSERT INTO finance_bank_reconciliations (
      reconciliation_number,
      bank_account_id,
      statement_date,
      statement_balance,
      ledger_balance,
      difference_amount,
      matched_items_count,
      status,
      reconciled_by,
      reconciled_at,
      remarks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      reconciliation_number,
      bank_account_id,
      statement_date,
      statement_balance,
      ledger_balance,
      difference_amount,
      matched_items_count,
      status,
      reconciled_by || null,
      reconciledAt,
      remarks || null,
    ]
  );
  return result.rows[0];
}

async function getBankReconciliations() {
  const query = `
    SELECT fbr.*, fca.account_name, fca.account_code
    FROM finance_bank_reconciliations fbr
    JOIN finance_chart_of_accounts fca ON fca.id = fbr.bank_account_id
    ORDER BY fbr.statement_date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function updateBankReconciliationStatus(id, status, reconciled_by) {
  const result = await pool.query(
    `UPDATE finance_bank_reconciliations
     SET status = $2, reconciled_by = COALESCE($3, reconciled_by),
         reconciled_at = CASE WHEN $2 = 'reconciled' THEN NOW() ELSE reconciled_at END
     WHERE id = $1
     RETURNING *`,
    [id, status, reconciled_by || null]
  );
  return result.rows[0] || null;
}

// 13.5 Profit & Loss / Balance Sheet Reporting
async function getProfitAndLoss(startDate, endDate) {
  const query = `
    SELECT
      fca.account_type,
      fca.account_code,
      fca.account_name,
      COALESCE(SUM(fjl.credit) - SUM(fjl.debit), 0) AS balance
    FROM finance_chart_of_accounts fca
    LEFT JOIN finance_journal_lines fjl ON fjl.account_id = fca.id
    LEFT JOIN finance_journal_entries fje ON fje.id = fjl.journal_entry_id
    WHERE fca.account_type IN ('Revenue', 'Expense')
      ${startDate ? "AND fje.entry_date >= '" + startDate + "'" : ""}
      ${endDate ? "AND fje.entry_date <= '" + endDate + "'" : ""}
    GROUP BY fca.account_type, fca.account_code, fca.account_name
    ORDER BY fca.account_type, fca.account_code
  `;
  const result = await pool.query(query);
  const revenueItems = result.rows.filter((r) => r.account_type === "Revenue");
  const expenseItems = result.rows.filter((r) => r.account_type === "Expense");

  const totalRevenue = revenueItems.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const totalExpense = expenseItems.reduce((acc, curr) => acc - Number(curr.balance), 0); // debits minus credits for expenses
  const netSurplus = totalRevenue - totalExpense;

  return {
    revenue: revenueItems,
    expenses: expenseItems,
    totalRevenue,
    totalExpense,
    netSurplus,
  };
}

async function getBalanceSheet() {
  const query = `
    SELECT
      fca.account_type,
      fca.account_code,
      fca.account_name,
      CASE
        WHEN fca.account_type = 'Asset' THEN COALESCE(SUM(fjl.debit) - SUM(fjl.credit), 0)
        ELSE COALESCE(SUM(fjl.credit) - SUM(fjl.debit), 0)
      END AS balance
    FROM finance_chart_of_accounts fca
    LEFT JOIN finance_journal_lines fjl ON fjl.account_id = fca.id
    WHERE fca.account_type IN ('Asset', 'Liability', 'Equity')
    GROUP BY fca.account_type, fca.account_code, fca.account_name
    ORDER BY fca.account_type, fca.account_code
  `;
  const result = await pool.query(query);
  const assets = result.rows.filter((r) => r.account_type === "Asset");
  const liabilities = result.rows.filter((r) => r.account_type === "Liability");
  const equity = result.rows.filter((r) => r.account_type === "Equity");

  const totalAssets = assets.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const totalEquity = equity.reduce((acc, curr) => acc + Number(curr.balance), 0);

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
  };
}

module.exports = {
  createAccount,
  getAccounts,
  createJournalEntry,
  getJournalEntries,
  createVoucher,
  getVouchers,
  updateVoucherStatus,
  createDoctorPayout,
  getDoctorPayouts,
  markDoctorPayoutPaid,
  createBankReconciliation,
  getBankReconciliations,
  updateBankReconciliationStatus,
  getProfitAndLoss,
  getBalanceSheet,
};
