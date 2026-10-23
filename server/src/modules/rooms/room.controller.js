const repository = require("./room.repository");
const ApiError = require("../../utils/ApiError");

const getRooms = async (req, res, next) => {
  try {
    const { roomType, departmentId, search } = req.query;
    const includeInactive = req.query.includeInactive === 'true' || req.query.all === 'true';
    const rooms = await repository.findAll({ roomType, departmentId, search, includeInactive });
    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (err) {
    next(err);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const room = await repository.findById(req.params.id);
    if (!room) {
      throw ApiError.notFound("Room not found.");
    }
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (err) {
    next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { room_number, name, floor, room_type, department_id, capacity, daily_tariff, is_active } = req.body;
    if (!room_number || !room_number.trim()) {
      throw ApiError.badRequest("Room number/identifier is required.");
    }

    const existing = await repository.findByRoomNumber(room_number.trim());
    if (existing) {
      throw ApiError.conflict(`Room with identifier '${room_number.trim()}' already exists.`);
    }

    const room = await repository.create({
      room_number,
      name,
      floor,
      room_type,
      department_id,
      capacity,
      daily_tariff,
      is_active
    });

    res.status(201).json({
      success: true,
      data: room,
      message: `Room '${room.room_number}' created successfully.`
    });
  } catch (err) {
    next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { room_number, name, floor, room_type, department_id, capacity, daily_tariff, is_active } = req.body;

    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Room not found.");
    }

    if (room_number) {
      const conflict = await repository.findByRoomNumber(room_number.trim(), id);
      if (conflict) {
        throw ApiError.conflict(`Room identifier '${room_number.trim()}' is already used by another room.`);
      }
    }

    const updated = await repository.update(id, {
      room_number,
      name,
      floor,
      room_type,
      department_id,
      capacity,
      daily_tariff,
      is_active
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: `Room '${updated.room_number}' updated successfully.`
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom
};
