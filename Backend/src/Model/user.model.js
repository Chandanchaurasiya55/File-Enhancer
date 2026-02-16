const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  Password: {
    type: String,
    minlength: 8,
    required: true
  },
  Phone: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;