const Room = require('../models/Room.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

exports.getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 100, type, isAvailable } = req.query;
    const filter = {};
    if (type)        filter.type        = type;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    const total = await Room.countDocuments(filter);
    const rooms = await Room.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(Number(limit));
    return paginatedResponse(res, rooms, total, page, limit);
  } catch (err) { return errorResponse(res, err.message); }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return errorResponse(res, 'Salle introuvable', 404);
    return successResponse(res, room);
  } catch (err) { return errorResponse(res, err.message); }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return successResponse(res, room, 'Salle créée', 201);
  } catch (err) { return errorResponse(res, err.message); }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return errorResponse(res, 'Salle introuvable', 404);
    return successResponse(res, room, 'Salle mise à jour');
  } catch (err) { return errorResponse(res, err.message); }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Salle supprimée');
  } catch (err) { return errorResponse(res, err.message); }
};
