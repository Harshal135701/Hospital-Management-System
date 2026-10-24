const repository = require("./doctor.repository");
const ApiError = require("../../utils/ApiError");

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const getDoctors = async (req, res, next) => {
  try {
    const { departmentId, search } = req.query;
    const includeInactive = req.query.includeInactive === 'true' || req.query.all === 'true';

    if (departmentId && !uuidRegex.test(departmentId)) {
      throw ApiError.badRequest("Invalid departmentId UUID format");
    }

    const doctors = includeInactive || search
      ? await repository.findAll({ search, departmentId: departmentId || null, includeInactive })
      : await repository.findAllActive({ departmentId: departmentId || null });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await repository.findById(req.params.id);
    if (!doctor) {
      throw ApiError.notFound("Doctor not found.");
    }
    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const {
      employee_code,
      full_name,
      mobile,
      department_id,
      room_id,
      specialty,
      consultation_fee,
      experience_years,
      qualifications,
      is_active
    } = req.body;

    if (!full_name || full_name.trim().length < 2) {
      throw ApiError.badRequest("Doctor full name is required.");
    }
    if (!employee_code || !employee_code.trim()) {
      throw ApiError.badRequest("Employee code is required.");
    }
    if (!department_id || !uuidRegex.test(department_id)) {
      throw ApiError.badRequest("Valid department ID is required.");
    }

    const existing = await repository.findByEmployeeCode(employee_code.trim());
    if (existing) {
      throw ApiError.conflict(`Doctor with employee code '${employee_code.trim().toUpperCase()}' already exists.`);
    }

    const doctor = await repository.create({
      employee_code,
      full_name,
      mobile,
      department_id,
      room_id: room_id && uuidRegex.test(room_id) ? room_id : null,
      specialty,
      consultation_fee: parseFloat(consultation_fee) || 500,
      experience_years: parseInt(experience_years, 10) || 0,
      qualifications,
      is_active
    });

    res.status(201).json({
      success: true,
      data: doctor,
      message: `Doctor '${doctor.full_name}' created successfully.`
    });
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      employee_code,
      full_name,
      mobile,
      department_id,
      room_id,
      specialty,
      consultation_fee,
      experience_years,
      qualifications,
      is_active
    } = req.body;

    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Doctor not found.");
    }

    if (employee_code) {
      const conflict = await repository.findByEmployeeCode(employee_code.trim(), id);
      if (conflict) {
        throw ApiError.conflict(`Employee code '${employee_code.trim().toUpperCase()}' is already used by another doctor.`);
      }
    }

    const updated = await repository.update(id, {
      employee_code,
      full_name,
      mobile,
      department_id,
      room_id: room_id !== undefined ? (room_id && uuidRegex.test(room_id) ? room_id : null) : undefined,
      specialty,
      consultation_fee: consultation_fee !== undefined ? parseFloat(consultation_fee) : undefined,
      experience_years: experience_years !== undefined ? parseInt(experience_years, 10) : undefined,
      qualifications,
      is_active
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Doctor '${updated.full_name}' updated successfully.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
};
