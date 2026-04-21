const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true },
  building: String,
  floor: Number,
  type: {
    type: String,
    enum: ['amphi', 'salle_td', 'salle_tp', 'laboratoire', 'salle_informatique', 'salle_conference'],
    required: true
  },
  capacity: { type: Number, required: true, min: 1 },
  equipment: {
    hasProjector: { type: Boolean, default: false },
    hasAC: { type: Boolean, default: false },
    hasWhiteboard: { type: Boolean, default: true },
    hasComputers: { type: Boolean, default: false },
    numberOfComputers: { type: Number, default: 0 }
  },
  isAvailable: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

RoomSchema.index({ code: 1 });
RoomSchema.index({ type: 1, isAvailable: 1 });

module.exports = mongoose.model('Room', RoomSchema);