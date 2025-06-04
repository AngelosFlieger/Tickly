const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true }, // ✅ Added City Field
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  type: { type: String, enum: ['music', 'entertainment', 'sport', 'other'], required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price_min: { type: Number, required: true },
  price_max: { type: Number, required: true },
  price: { type: Number, required: true },
  seat_num: { type: Number, required: true },
  seats_left: { type: Number, required: true },
  ticket_sales_revenue: { type: Number, default: 0 },
  status: { type: String, default: 'running' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
