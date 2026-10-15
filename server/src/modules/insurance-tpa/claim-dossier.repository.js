const pool = require("../../config/db");

async function createClaimDossier(data) {
  const result = await pool.query(
    `INSERT INTO insurance_claim_dossiers (
      preauthorization_id,
      bill_id,
      claim_amount,
      documents
    )
    VALUES ($1, $2, $3, $4::jsonb)
    RETURNING *`,
    [
      data.preauthorization_id,
      data.bill_id,
      data.claim_amount,
      JSON.stringify(data.documents ?? []),
    ]
  );

  return result.rows[0];
}

async function getClaimDossierById(id) {
  const result = await pool.query(
    `SELECT * FROM insurance_claim_dossiers
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function getClaimDossiers(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.preauthorization_id) {
    values.push(filters.preauthorization_id);
    conditions.push(`preauthorization_id = $${values.length}`);
  }

  if (filters.bill_id) {
    values.push(filters.bill_id);
    conditions.push(`bill_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT * FROM insurance_claim_dossiers
     ${whereClause}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows;
}

async function updateClaimDossier(id, fields) {
  const result = await pool.query(
    `UPDATE insurance_claim_dossiers
     SET claim_number = COALESCE($2, claim_number),
         documents = COALESCE($3::jsonb, documents),
         status = COALESCE($4, status),
         tpa_reference_number = COALESCE($5, tpa_reference_number),
         submission_notes = COALESCE($6, submission_notes),
         rejection_reason = COALESCE($7, rejection_reason),
         compiled_at = COALESCE($8, compiled_at),
         submitted_at = COALESCE($9, submitted_at),
         decision_at = COALESCE($10, decision_at),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      fields.claim_number ?? null,
      fields.documents === undefined
        ? null
        : JSON.stringify(fields.documents),
      fields.status ?? null,
      fields.tpa_reference_number ?? null,
      fields.submission_notes ?? null,
      fields.rejection_reason ?? null,
      fields.compiled_at ?? null,
      fields.submitted_at ?? null,
      fields.decision_at ?? null,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  createClaimDossier,
  getClaimDossierById,
  getClaimDossiers,
  updateClaimDossier,
};