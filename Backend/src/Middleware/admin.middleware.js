const jwt = require('jsonwebtoken');
const Admin = require('../Models/admin.model');

// Middleware to authenticate an admin using JWT token
async function authenticateAdmin(req, res, next) {
  try {
    // Try to read token from Authorization header (Bearer) first
    let token = null;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback: cookies (if cookie-parser is used)
    if (!token && req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-Password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if user is admin
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.admin = admin; // attach admin to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token'
    });
  }
}

module.exports = authenticateAdmin;
