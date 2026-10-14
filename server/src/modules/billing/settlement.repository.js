
const pool = require("../../config/db");

const getDayEndSummary = async (businessDate) => {
  const result = await pool.query(
    `WITH transactions AS (
       SELECT
         payment_method,
         amount AS collected_amount,
         0::numeric AS refunded_amount
       FROM bill_payments
       WHERE status = 'completed'
         AND created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND created_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')

       UNION ALL

       SELECT
         payment_method,
         amount AS collected_amount,
         0::numeric AS refunded_amount
       FROM advance_deposits
       WHERE status = 'collected'
         AND created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND created_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')

       UNION ALL

       SELECT
         payment_method,
         0::numeric AS collected_amount,
         amount AS refunded_amount
       FROM refunds
       WHERE status = 'processed'
         AND processed_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND processed_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')
     )
     SELECT
       payment_method,
       COALESCE(SUM(collected_amount), 0) AS total_collected,
       COALESCE(SUM(refunded_amount), 0) AS total_refunded,
       COALESCE(SUM(collected_amount - refunded_amount), 0) AS net_amount
     FROM transactions
     GROUP BY payment_method
     ORDER BY payment_method`,
    [businessDate]
  );

  const totals = result.rows.reduce(
    (summary, row) => ({
      totalCollected: summary.totalCollected + Number(row.total_collected),
      totalRefunded: summary.totalRefunded + Number(row.total_refunded),
      netAmount: summary.netAmount + Number(row.net_amount),
    }),
    {
      totalCollected: 0,
      totalRefunded: 0,
      netAmount: 0,
    }
  );

  return {
    businessDate,
    paymentMethods: result.rows,
    totals,
  };
};


const getSettlementFigures = async (businessDate) => {
  const result = await pool.query(
    `WITH transactions AS (
       SELECT
         payment_method,
         amount AS collected_amount,
         0::numeric AS refunded_amount
       FROM bill_payments
       WHERE status = 'completed'
         AND created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND created_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')

       UNION ALL

       SELECT
         payment_method,
         amount,
         0::numeric
       FROM advance_deposits
       WHERE status = 'collected'
         AND created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND created_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')

       UNION ALL

       SELECT
         payment_method,
         0::numeric,
         amount
       FROM refunds
       WHERE status = 'processed'
         AND processed_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Kolkata')
         AND processed_at < (($1::date + 1)::timestamp AT TIME ZONE 'Asia/Kolkata')
     )
     SELECT
       COALESCE(SUM(collected_amount), 0) AS total_collected,
       COALESCE(SUM(refunded_amount), 0) AS total_refunded,
       COALESCE(SUM(collected_amount) FILTER (
         WHERE payment_method = 'cash'
       ), 0) AS cash_collected,
       COALESCE(SUM(refunded_amount) FILTER (
         WHERE payment_method = 'cash'
       ), 0) AS cash_refunded
     FROM transactions`,
    [businessDate]
  );

  return result.rows[0];
};

const createSettlement = async (data) => {
  const result = await pool.query(
    `INSERT INTO cashier_settlements (
       settlement_number,
       business_date,
       cashier_name,
       opening_cash,
       expected_cash,
       counted_cash,
       cash_variance,
       total_collected,
       total_refunded,
       net_amount,
       notes,
       status
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'closed'
     )
     RETURNING *`,
    [
      data.settlementNumber,
      data.businessDate,
      data.cashierName,
      data.openingCash,
      data.expectedCash,
      data.countedCash,
      data.cashVariance,
      data.totalCollected,
      data.totalRefunded,
      data.netAmount,
      data.notes || null,
    ]
  );

  return result.rows[0];
};


module.exports = {
  getDayEndSummary,
  getSettlementFigures,
  createSettlement,
};
