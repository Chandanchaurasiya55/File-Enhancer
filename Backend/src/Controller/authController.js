const User = require('../Models/User');
const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');

// Utility function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// User Sign Up
const userSignup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, firstname, lastname } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword || !firstname || !lastname) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            firstname,
            lastname
        });

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error in user signup'
        });
    }
};

// User Login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and select password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Compare password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error in user login'
        });
    }
};

// Admin Sign Up
const adminSignup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, firstname, lastname, adminSecret } = req.body;

        // Check admin secret key
        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin registration code'
            });
        }

        // Validation
        if (!username || !email || !password || !confirmPassword || !firstname || !lastname) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { username }]
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: existingAdmin.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new admin
        const admin = await Admin.create({
            username,
            email,
            password,
            firstname,
            lastname
        });

        // Generate token
        const token = generateToken(admin._id, admin.role);

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            user: admin.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error in admin signup'
        });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin and select password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Compare password
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate token
        const token = generateToken(admin._id, admin.role);

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token,
            user: admin.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error in admin login'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const { id, role } = req.user;

        let user;
        if (role === 'user') {
            user = await User.findById(id);
        } else {
            user = await Admin.findById(id);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching user'
        });
    }
};

// Logout (primarily for frontend to clear token)
const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

module.exports = {
    userSignup,
    userLogin,
    adminSignup,
    adminLogin,
    getCurrentUser,
    logout
};
