const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  ip: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

module.exports = mongoose.model('Address', AddressSchema);
