const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');
const Admin = require('../Models/admin.model');

// Middleware to authenticate either a user or admin using JWT token
async function authenticateUserOrAdmin(req, res, next) {
    try {
        // Try to read token from Authorization header (Bearer) first
        let token = null;
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // Fallback: cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token && req.cookies && req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find as User first
        let user = await User.findById(decoded.id).select('-Password');
        if (user) {
            req.user = user;
            return next();
        }

        // Try to find as Admin
        let admin = await Admin.findById(decoded.id).select('-Password');
        if (admin) {
            req.admin = admin;
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'User not found'
        });
    } catch (err) {
        console.error('authenticateUserOrAdmin error:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

module.exports = authenticateUserOrAdmin;
