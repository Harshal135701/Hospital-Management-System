const pool = require("../../config/db");
const repository = require("./enhancement.repository");

const VALID_STATUSES = [
    "pending",
    "submitted",
    "approved",
    "partially_approved",
    "rejected",
    "cancelled",
];

function httpError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
}

async function getPreauthorization(id) {
    if (!id) {
        throw httpError("Pre-authorization ID is required", 400);
    }

    const result = await pool.query(
        `SELECT id, status, requested_amount, approved_amount
     FROM insurance_preauthorizations
     WHERE id = $1`,
        [id]
    );

    const record = result.rows[0];

    if (!record) {
        throw httpError("Pre-authorization not found", 404);
    }

    if (record.status !== "approved") {
        throw httpError(
            "Enhancement requests require an approved pre-authorization",
            400
        );
    }

    if (record.approved_amount === null) {
        throw httpError(
            "Pre-authorization has no approved amount",
            400
        );
    }

    return record;
}

function validateCreateData(data) {
    if (
        typeof data.reason !== "string" ||
        !data.reason.trim()
    ) {
        throw httpError("Enhancement reason is required", 400);
    }

    const amount = Number(data.requested_additional_amount);

    if (
        data.requested_additional_amount === undefined ||
        data.requested_additional_amount === null ||
        data.requested_additional_amount === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw httpError(
            "Requested additional amount must be a positive number",
            400
        );
    }

    if (
        data.supporting_details !== undefined &&
        (
            data.supporting_details === null ||
            typeof data.supporting_details !== "object" ||
            Array.isArray(data.supporting_details)
        )
    ) {
        throw httpError(
            "Supporting details must be a JSON object",
            400
        );
    }
}

async function createEnhancementRequest(data) {
    validateCreateData(data);

    const preauthorization = await getPreauthorization(
        data.preauthorization_id
    );

    const previousAmount = Number(preauthorization.approved_amount);
    const additionalAmount = Number(data.requested_additional_amount);

    return repository.createEnhancementRequest({
        preauthorization_id: preauthorization.id,
        previous_approved_amount: previousAmount,
        requested_additional_amount: additionalAmount,
        revised_requested_amount: previousAmount + additionalAmount,
        reason: data.reason.trim(),
        supporting_details: data.supporting_details ?? {},
    });
}

async function getEnhancementRequestById(id) {
    if (!id) {
        throw httpError("Enhancement request ID is required", 400);
    }

    const record = await repository.getEnhancementRequestById(id);

    if (!record) {
        throw httpError("Enhancement request not found", 404);
    }

    return record;
}

async function getEnhancementRequests(filters) {
    if (
        filters.status &&
        !VALID_STATUSES.includes(filters.status)
    ) {
        throw httpError("Invalid enhancement request status", 400);
    }

    if (filters.preauthorization_id) {
        const result = await pool.query(
            "SELECT id FROM insurance_preauthorizations WHERE id = $1",
            [filters.preauthorization_id]
        );

        if (!result.rows[0]) {
            throw httpError("Pre-authorization not found", 404);
        }
    }

    return repository.getEnhancementRequests(filters);
}

async function submitEnhancementRequest(id) {
    const record = await getEnhancementRequestById(id);

    if (record.status !== "pending") {
        throw httpError(
            "Only pending enhancement requests can be submitted",
            400
        );
    }

    return repository.markEnhancementSubmitted(id);
}

async function recordEnhancementDecision(id, data) {
    const record = await getEnhancementRequestById(id);

    if (record.status !== "submitted") {
        throw httpError(
            "Only submitted enhancement requests can receive a decision",
            400
        );
    }

    const { status, approved_additional_amount, rejection_reason } = data;

    if (
        !["approved", "partially_approved", "rejected"].includes(status)
    ) {
        throw httpError(
            "Decision must be approved, partially_approved, or rejected",
            400
        );
    }

    let amount = null;

    if (status === "approved" || status === "partially_approved") {
        amount = Number(approved_additional_amount);

        if (
            approved_additional_amount === undefined ||
            approved_additional_amount === null ||
            approved_additional_amount === "" ||
            !Number.isFinite(amount) ||
            amount < 0 ||
            amount > Number(record.requested_additional_amount)
        ) {
            throw httpError(
                "Approved additional amount must be between zero and the requested additional amount",
                400
            );
        }

        if (
            status === "approved" &&
            amount !== Number(record.requested_additional_amount)
        ) {
            throw httpError(
                "Fully approved enhancement amount must equal the requested additional amount",
                400
            );
        }

        if (
            status === "partially_approved" &&
            (amount <= 0 || amount >= Number(record.requested_additional_amount))
        ) {
            throw httpError(
                "Partially approved amount must be greater than zero and less than the requested amount",
                400
            );
        }
    } else if (
        typeof rejection_reason !== "string" ||
        !rejection_reason.trim()
    ) {
        throw httpError(
            "Rejection reason is required",
            400
        );
    }

    // Keep the enhancement decision and parent authorization update atomic.
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const decision = await client.query(
            `UPDATE insurance_enhancement_requests
       SET status = $2,
           approved_additional_amount = $3,
           rejection_reason = $4,
           decision_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND status = 'submitted'
       RETURNING *`,
            [
                id,
                status,
                amount,
                status === "rejected" ? rejection_reason.trim() : null,
            ]
        );

        if (!decision.rows[0]) {
            throw httpError(
                "Enhancement request is no longer submitted",
                409
            );
        }

        if (amount !== null && amount > 0) {
            const revisedApprovedAmount =
                Number(record.previous_approved_amount) + amount;

            const parentUpdate = await client.query(
                `UPDATE insurance_preauthorizations
SET requested_amount = requested_amount + $2 - approved_amount,
    approved_amount = $2,
    updated_at = NOW()
WHERE id = $1
  AND status = 'approved'
  AND approved_amount = $3
RETURNING id`,
                [
                    record.preauthorization_id,
                    revisedApprovedAmount,
                    record.previous_approved_amount
                ]
            );

            if (!parentUpdate.rows[0]) {
                throw httpError(
                    "Parent pre-authorization is no longer approved",
                    409
                );
            }
        }

        await client.query("COMMIT");
        return decision.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    createEnhancementRequest,
    getEnhancementRequestById,
    getEnhancementRequests,
    submitEnhancementRequest,
    recordEnhancementDecision,
};