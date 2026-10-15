const service = require("./responsibility.service");

const createResponsibility = async (req, res, next) => {
  try {
    const data = await service.createResponsibility(req.body);

    res.status(201).json({
      success: true,
      message: "Patient responsibility created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getResponsibilities = async (req, res, next) => {
  try {
    const data = await service.getResponsibilities(req.query);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getResponsibilityById = async (req, res, next) => {
  try {
    const data = await service.getResponsibilityById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const collectPayment = async (req, res, next) => {
  try {
    const data = await service.collectPayment(
      req.params.id,
      req.body.amount,
      req.body.payment_method
    );

    res.status(200).json({
      success: true,
      message: "Patient responsibility payment collected successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResponsibility,
  getResponsibilities,
  getResponsibilityById,
  collectPayment,
};