const repository = require("./donor-compensation.repository");
const ApiError = require("../../utils/ApiError");

const getCompensations = async (req, res, next) => {
  try {
    const { donorCode } = req.query;
    const records = donorCode
      ? await repository.findByDonorCode(donorCode)
      : await repository.findAll();

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

const createCompensation = async (req, res, next) => {
  try {
    const {
      donor_id,
      donor_code,
      donor_category,
      amount,
      payment_method,
      transaction_reference,
      status,
      notes,
      approved_by
    } = req.body;

    if (!donor_code) {
      throw ApiError.badRequest("Donor code/identifier is required.");
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      throw ApiError.badRequest("Disbursement amount must be a positive number.");
    }

    if (transaction_reference) {
      const duplicateTxn = await repository.findByTxnRef(transaction_reference);
      if (duplicateTxn) {
        throw ApiError.conflict(`Transaction reference '${transaction_reference}' has already been processed.`);
      }
    }

    const compNumber = `DCOMP-${Date.now().toString().slice(-6)}`;
    const record = await repository.create({
      compensation_number: compNumber,
      donor_id: donor_id || donor_code,
      donor_code,
      donor_category: donor_category || 'Sperm Donor',
      amount: amt,
      payment_method: payment_method || 'neft',
      transaction_reference,
      status: status || 'processed',
      notes,
      approved_by: approved_by || 'Chief Medical Officer',
      processed_by: req.user ? req.user.username : 'Accounts Cashier'
    });

    res.status(201).json({
      success: true,
      data: record,
      message: `Donor compensation ${compNumber} of ₹${amt} disbursed successfully.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompensations,
  createCompensation
};
