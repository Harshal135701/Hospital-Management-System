
const pool = require("../../config/db");
const repository = require("./ipd-billing.repository");
const ApiError = require("../../utils/ApiError");

const generateNumber = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createInterimBill = async (data) => {
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
        "Interim billing is allowed only for currently admitted patients"
      );
    }

    if (data.periodStart < admission.admission_date.toISOString().slice(0, 10)) {
      throw new ApiError(
        400,
        "Billing period cannot start before the admission date"
      );
    }

    if (data.periodEnd < data.periodStart) {
      throw new ApiError(
        400,
        "Billing period end cannot be before its start"
      );
    }

    const subtotalCents = data.items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitPrice) ||
        quantity <= 0 ||
        unitPrice < 0
      ) {
        throw new ApiError(400, "Invalid item quantity or unit price");
      }

      return sum + Math.round(quantity * unitPrice * 100);
    }, 0);

    const subtotal = subtotalCents / 100;
    const discountAmount = Number(data.discountAmount || 0);
    const taxAmount = Number(data.taxAmount || 0);

    if (
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(taxAmount) ||
      discountAmount < 0 ||
      taxAmount < 0 ||
      Math.round(discountAmount * 100) > subtotalCents
    ) {
      throw new ApiError(400, "Invalid discount or tax amount");
    }

    const totalCents =
      subtotalCents -
      Math.round(discountAmount * 100) +
      Math.round(taxAmount * 100);

    const totalAmount = totalCents / 100;

    const bill = await repository.createInterimBill(client, {
      billNumber: generateNumber("IPD-INT"),
      patientId: admission.patient_id,
      admissionId: admission.id,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes: data.notes,
    });

    const savedItems = [];

    for (const item of data.items) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const lineTotal =
        Math.round(quantity * unitPrice * 100) / 100;

      const savedItem = await repository.createBillItem(
        client,
        bill.id,
        {
          ...item,
          quantity,
          unitPrice,
          lineTotal,
        }
      );

      savedItems.push(savedItem);
    }

    const interimRecord = await repository.createInterimRecord(client, {
      billId: bill.id,
      admissionId: admission.id,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
    });

    await client.query("COMMIT");

    return {
      bill,
      items: savedItems,
      interimRecord,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getInterimBill = async (billId) => {
  const bill = await repository.findInterimBill(billId);

  if (!bill) {
    throw new ApiError(404, "IPD interim bill not found");
  }

  return bill;
};

module.exports = {
  createInterimBill,
  getInterimBill,
};
