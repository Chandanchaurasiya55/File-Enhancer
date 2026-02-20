const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [3, "Full name must be at least 3 characters"]
  },
  Email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  Password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"]
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
