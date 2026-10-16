const repository = require("./department.repository");

const getDepartments = async (req, res, next) => {
  try {
    const departments = await repository.findAllActive();
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
};
