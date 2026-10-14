
const pool = require("../../config/db");
const repository = require("./discharge-billing.repository");
const ApiError = require("../../utils/ApiError");

const generateNumber = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const toCents = (value) => Math.round(Number(value) * 100);
const toAmount = (cents) => (cents / 100).toFixed(2);

const createDischargeBill = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const admission = await repository.findAdmission(
      client,
      data.admissionId
    );

    if (!admission) {
      throw new ApiError(404, "Admission not found");
    }

    if (admission.status !== "admitted") {
      throw new ApiError(
        400,
        "Final bill can only be generated for an admitted patient"
      );
    }

    const existingFinalBill = await client.query(
      `SELECT id
       FROM bills
       WHERE admission_id = $1
         AND bill_type = 'ipd_final'
       LIMIT 1`,
      [data.admissionId]
    );

    if (existingFinalBill.rows.length > 0) {
      throw new ApiError(
        409,
        "A final bill already exists for this admission"
      );
    }

    const interimBills = await repository.getInterimBills(
      client,
      data.admissionId
    );

    const deposits = await repository.getCollectedDeposits(
      client,
      data.admissionId
    );

    const interimTotalCents = interimBills.reduce(
      (sum, bill) => sum + toCents(bill.total_amount),
      0
    );

    const interimPaidCents = interimBills.reduce(
      (sum, bill) => sum + toCents(bill.amount_paid),
      0
    );

    const interimOutstandingCents = Math.max(
      0,
      interimTotalCents - interimPaidCents
    );

    const finalItems = data.items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const lineTotalCents = Math.round(quantity * unitPrice * 100);

      return {
        ...item,
        quantity,
        unitPrice,
        lineTotalCents,
        lineTotal: lineTotalCents / 100,
      };
    });

    const finalChargesCents = finalItems.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0
    );

    const discountCents = toCents(data.discountAmount || 0);
    const taxCents = toCents(data.taxAmount || 0);

    if (
      discountCents < 0 ||
      taxCents < 0 ||
      discountCents > finalChargesCents
    ) {
      throw new ApiError(400, "Invalid discount or tax amount");
    }

    // The final bill contains only additional discharge charges.
    const finalTotalCents =
      finalChargesCents - discountCents + taxCents;

    const availableDepositCents = deposits.reduce(
      (sum, deposit) => {
        const remaining =
          toCents(deposit.amount) -
          toCents(deposit.adjusted_amount);

        return sum + Math.max(0, remaining);
      },
      0
    );

    // Overall outstanding amount across interim and final bills.
    const totalDueCents =
      interimOutstandingCents + finalTotalCents;

    const advanceAdjustedCents = Math.min(
      availableDepositCents,
      totalDueCents
    );

    const refundDueCents = Math.max(
      0,
      availableDepositCents - totalDueCents
    );

    const balanceDueCents = Math.max(
      0,
      totalDueCents - availableDepositCents
    );

    const bill = await repository.createFinalBill(client, {
      billNumber: generateNumber("IPD-FIN"),
      patientId: admission.patient_id,
      admissionId: admission.id,
      subtotal: toAmount(finalChargesCents),
      discountAmount: toAmount(discountCents),
      taxAmount: toAmount(taxCents),
      totalAmount: toAmount(finalTotalCents),
      notes: data.notes,
    });

    const savedItems = [];

    for (const item of finalItems) {
      const savedItem = await repository.createBillItem(
        client,
        bill.id,
        {
          ...item,
          lineTotal: item.lineTotal,
        }
      );

      savedItems.push(savedItem);
    }

    const dischargeRecord = await repository.createDischargeRecord(
      client,
      {
        billId: bill.id,
        admissionId: admission.id,
        grossAmount: toAmount(totalDueCents),
        advanceAdjusted: toAmount(advanceAdjustedCents),
        refundDue: toAmount(refundDueCents),
        balanceDue: toAmount(balanceDueCents),
      }
    );

    // Track the remaining available amount for each deposit.
    const depositBalances = new Map(
      deposits.map((deposit) => [
        deposit.id,
        Math.max(
          0,
          toCents(deposit.amount) -
            toCents(deposit.adjusted_amount)
        ),
      ])
    );

    let allocatedCents = 0;

    const applyDepositsToBill = async (billId, dueCents) => {
      let remainingDueCents = dueCents;

      for (const deposit of deposits) {
        if (remainingDueCents <= 0) break;

        const availableCents =
          depositBalances.get(deposit.id) || 0;

        const adjustmentCents = Math.min(
          availableCents,
          remainingDueCents
        );

        if (adjustmentCents <= 0) continue;

        await repository.createDepositAdjustment(
          client,
          deposit.id,
          billId,
          toAmount(adjustmentCents)
        );

        depositBalances.set(
          deposit.id,
          availableCents - adjustmentCents
        );

        await repository.updateDepositStatus(
          client,
          deposit.id
        );

        remainingDueCents -= adjustmentCents;
        allocatedCents += adjustmentCents;
      }
    };

    // Apply deposits to outstanding interim bills first.
    for (const interimBill of interimBills) {
      const outstandingCents = Math.max(
        0,
        toCents(interimBill.total_amount) -
          toCents(interimBill.amount_paid)
      );

      await applyDepositsToBill(
        interimBill.id,
        outstandingCents
      );
    }

    // Apply any remaining deposits to the final bill.
    await applyDepositsToBill(
      bill.id,
      finalTotalCents
    );

    if (allocatedCents !== advanceAdjustedCents) {
      throw new ApiError(
        500,
        "Advance deposit adjustment could not be reconciled"
      );
    }

    const dischargedAdmission = await repository.finalizeAdmission(
      client,
      admission.id
    );

    await client.query("COMMIT");

    return {
      bill,
      items: savedItems,
      dischargeSummary: {
        interimBillTotal: toAmount(interimTotalCents),
        interimAmountPaid: toAmount(interimPaidCents),
        interimOutstanding: toAmount(interimOutstandingCents),
        finalCharges: toAmount(finalTotalCents),
        grossAmount: toAmount(totalDueCents),
        advanceAdjusted: toAmount(advanceAdjustedCents),
        refundDue: toAmount(refundDueCents),
        balanceDue: toAmount(balanceDueCents),
      },
      dischargeRecord,
      admission: dischargedAdmission,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getDischargeBill = async (billId) => {
  const bill = await repository.findFinalBill(billId);

  if (!bill) {
    throw new ApiError(404, "Discharge final bill not found");
  }

  return bill;
};

module.exports = {
  createDischargeBill,
  getDischargeBill,
};
