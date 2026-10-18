const repository = require("./doctor.repository");
const ApiError = require("../../utils/ApiError");

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const getDoctors = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    if (departmentId && !uuidRegex.test(departmentId)) {
      throw ApiError.badRequest("Invalid departmentId UUID format");
    }
    const doctors = await repository.findAllActive({ departmentId: departmentId || null });
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
};
