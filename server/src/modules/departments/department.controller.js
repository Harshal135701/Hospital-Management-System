const repository = require("./department.repository");
const ApiError = require("../../utils/ApiError");

const getDepartments = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true' || req.query.all === 'true';
    const search = req.query.search || '';
    const departments = includeInactive || search
      ? await repository.findAll({ search, includeInactive })
      : await repository.findAllActive();

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await repository.findById(req.params.id);
    if (!department) {
      throw ApiError.notFound("Department not found");
    }
    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, is_active } = req.body;
    if (!name || name.trim().length < 2) {
      throw ApiError.badRequest("Department name is required (minimum 2 characters).");
    }
    if (!code || code.trim().length < 2) {
      throw ApiError.badRequest("Department code is required (e.g. CARD, PED).");
    }

    const existing = await repository.findByCode(code.trim());
    if (existing) {
      throw ApiError.conflict(`Department with code '${code.trim().toUpperCase()}' already exists.`);
    }

    const newDep = await repository.create({
      name: name.trim(),
      code: code.trim(),
      description: description ? description.trim() : null,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      data: newDep,
      message: `Department '${newDep.name}' created successfully.`
    });
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;

    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Department not found.");
    }

    if (code) {
      const codeCheck = await repository.findByCode(code.trim(), id);
      if (codeCheck) {
        throw ApiError.conflict(`Department code '${code.trim().toUpperCase()}' is already used by another department.`);
      }
    }

    const updated = await repository.update(id, {
      name: name ? name.trim() : undefined,
      code: code ? code.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Department '${updated.name}' updated successfully.`
    });
  } catch (err) {
    next(err);
  }
};

const toggleDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Department not found.");
    }

    const updated = await repository.update(id, {
      is_active: !existing.is_active
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Department '${updated.name}' is now ${updated.is_active ? 'active' : 'inactive'}.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus
};
