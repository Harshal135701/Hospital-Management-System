const pool = require("../../config/db");
const repository = require("./billing.repository");
const ApiError = require("../../utils/ApiError");

const generateNumber = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createOpdBill = async (data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const patient = await repository.findPatient(client, data.patientId);

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    if (data.appointmentId) {
      const appointment = await repository.findAppointment(
        client,
        data.appointmentId
      );

      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }

      if (appointment.patient_id !== data.patientId) {
        throw new ApiError(400, "Appointment does not belong to this patient");
      }

      if (["cancelled", "no_show"].includes(appointment.status)) {
        throw new ApiError(400, "Cannot bill a cancelled or missed appointment");
      }
    }

    let subtotal = 0;

    const items = data.items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
      subtotal += lineTotal;

      return { ...item, quantity, unitPrice, lineTotal };
    });

    subtotal = Math.round(subtotal * 100) / 100;

    const discountAmount = Number(data.discountAmount || 0);
    const taxAmount = Number(data.taxAmount || 0);

    if (
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(taxAmount) ||
      discountAmount < 0 ||
      taxAmount < 0 ||
      discountAmount > subtotal
    ) {
      throw new ApiError(400, "Invalid discount or tax amount");
    }

    const totalAmount =
      Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

    const bill = await repository.createBill(client, {
      billNumber: generateNumber("OPD"),
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes: data.notes,
    });

    for (const item of items) {
      await repository.createBillItem(client, bill.id, item);
    }

    let payment = null;

    if (data.payment) {
      const paymentAmount = Number(data.payment.amount);

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0 ||
        paymentAmount > totalAmount
      ) {
        throw new ApiError(400, "Invalid payment amount");
      }

      payment = await repository.createPayment(client, {
        receiptNumber: generateNumber("RCT"),
        billId: bill.id,
        amount: paymentAmount,
        paymentMethod: data.payment.paymentMethod,
        transactionReference: data.payment.transactionReference,
      });

      await repository.updateBillPayment(
        client,
        bill.id,
        paymentAmount,
        totalAmount
      );
    }

    await client.query("COMMIT");

    return {
      bill: {
        ...bill,
        amount_paid: payment ? payment.amount : "0.00",
        status: payment
          ? Number(payment.amount) >= totalAmount
            ? "paid"
            : "partially_paid"
          : "issued",
      },
      items,
      payment,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getOpdBill = async (billId) => {
  const bill = await repository.findBillById(billId);

  if (!bill) {
    throw new ApiError(404, "OPD bill not found");
  }

  return bill;
};

const getOpdBills = async (filters) => {
  const limit = Number(filters.limit ?? 20);
  const offset = Number(filters.offset ?? 0);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  return repository.listBills({
    patientId: filters.patientId,
    status: filters.status,
    limit,
    offset,
  });
};

module.exports = {
  createOpdBill,
  getOpdBill,
  getOpdBills,
};