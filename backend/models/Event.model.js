const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['conference', 'soutenance', 'reunion', 'ceremony', 'sport', 'cultural', 'autre'],
    default: 'autre'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Audience
  isPublic: { type: Boolean, default: true },
  targetRoles: [String],
  targetPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  // Participants
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: Number,
  registrationRequired: { type: Boolean, default: false },
  registrationDeadline: Date,
  // Médias
  imageUrl: String,
  attachments: [{ name: String, url: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

EventSchema.index({ startDate: 1 });
EventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', EventSchema);