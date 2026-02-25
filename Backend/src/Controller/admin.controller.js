const Admin = require('../Models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Normalize admin field names from frontend
const normalizeAdminData = (data) => {
  return {
    Fullname: data.Fullname || data.fullname || `${data.firstname || ''} ${data.lastname || ''}`.trim(),
    Email: data.Email || data.email,
    Password: data.Password || data.password
  };
};

async function registerAdmin(req, res) {
  try {
    const normalizedData = normalizeAdminData(req.body);
    const { Fullname, Email, Password } = normalizedData;

    // Basic validation
    if (!Fullname || !Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Fullname, Email and Password are required'
      });
    }

    // Validate Fullname
    if (Fullname.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate Password length
    if (Password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if any admin already exists (ONLY ONE ADMIN ALLOWED)
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Admin already exists. Only one admin is allowed. Please login with existing credentials."
      });
    }

    // Check if email is already used
    const isAdminExist = await Admin.findOne({ Email: Email.toLowerCase() });
    if (isAdminExist) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email. Please login"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create admin
    const newAdmin = await Admin.create({
      Fullname: Fullname.trim(),
      Email: Email.toLowerCase(),
      Password: hashedPassword,
      role: 'admin'
    });

    // Ensure JWT secret is present
    if (!process.env.JWT_SECRET) {
      console.error('registerAdmin error: JWT_SECRET is not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration (missing JWT_SECRET)'
      });
    }

    // Generate token
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user: {
        id: newAdmin._id,
        Email: newAdmin.Email,
        Fullname: newAdmin.Fullname,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('registerAdmin error:', err.message || err);
    
    // Handle MongoDB validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }
    
    return res.status(500).json({
      success: false,
      message: err.message || "Server error while registering admin"
    });
  }
}

async function loginAdmin(req, res) {
  try {
    const normalizedData = normalizeAdminData(req.body);
    const { Email, Password } = normalizedData;

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required'
      });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ Email: Email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    // Verify password
    if (typeof Password !== 'string' || Password.trim().length === 0) {
      console.warn(`loginAdmin warning: invalid password input for Email=${Email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid Email or Password'
      });
    }

    const isPasswordValid = await bcrypt.compare(Password, admin.Password);
    if (!isPasswordValid) {
      console.warn(`loginAdmin warning: authentication failed for Email=${Email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    // Ensure JWT secret is present
    if (!process.env.JWT_SECRET) {
      console.error('loginAdmin error: JWT_SECRET is not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration (missing JWT_SECRET)'
      });
    }

    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      user: {
        id: admin._id,
        Email: admin.Email,
        Fullname: admin.Fullname,
        role: admin.role || 'admin'
      }
    });
  } catch (err) {
    console.error('loginAdmin error:', err);
    return res.status(500).json({
      success: false,
      message: "Server error while logging in admin"
    });
  }
}

async function checkAdminExists(req, res) {
  try {
    const adminCount = await Admin.countDocuments();
    return res.status(200).json({
      success: true,
      exists: adminCount > 0,
      message: adminCount > 0 ? "Admin already exists" : "No admin found"
    });
  } catch (err) {
    console.error('checkAdminExists error:', err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  checkAdminExists
};
