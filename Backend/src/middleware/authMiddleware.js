const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from headers
        const token = req.headers.authorization?.split(' ')[1]
            || req.cookies?.token
            || req.headers['x-auth-token'];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please authenticate.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Middleware for admin role check
const adminMiddleware = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required'
        });
    }
    next();
};

// Middleware for user role check
const userMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: User access required'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    userMiddleware
};
