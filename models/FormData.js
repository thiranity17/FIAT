const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  studentName: String,
  fatherName: String,
  email: String,
  phone: String,
  address: String,
  service: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FormData', formDataSchema);