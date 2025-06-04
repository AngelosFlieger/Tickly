const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  email: { type: String, required: true },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  booking_date: { type: Date, default: Date.now },
  userGender: { type: String },
  userAge: { type: Number },
  userCity: { type: String },
  quantity: { type: Number, default: 1 }, 
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' } 
});

module.exports = mongoose.model('Ticket', TicketSchema);
