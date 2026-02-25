const User = require('../Models/user.model');
const Admin = require('../Models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Normalize field names from frontend (handles case variations)
const normalizeUserData = (data) => {
    return {
        Fullname: data.Fullname || data.fullname || `${data.firstname || ''} ${data.lastname || ''}`.trim(),
        Email: data.Email || data.email,
        Password: data.Password || data.password,
        Phone: data.Phone || data.phone
    };
};

async function registerUser(req, res){
    try {
        const { Fullname, Email, Password, Phone } = req.body;

        // Check if MongoDB is connected
        if (!User.db.readyState || User.db.readyState === 0) {
            console.error('registerUser error: MongoDB not connected');
            return res.status(503).json({ 
                success: false, 
                message: 'Database unavailable. Please try again later.' 
            });
        }

    // Validation checks
    if (!Fullname || !Email || !Password || !Phone) {
        return res.status(400).json({
            success: false,
            message: "All fields (Fullname, Email, Password, Phone) are required"
        });
    }

    // Validate Full Name
    if (Fullname.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Full name must be at least 3 characters long"
        });
    }

    // Validate Email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
        });
    }

    // Validate Phone (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(Phone)) {
        return res.status(400).json({
            success: false,
            message: "Phone number must be exactly 10 digits"
        });
    }

    // Validate Password
    if (Password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
        });
    }

    const isUserExist = await User.findOne({
        Email
    });

    if(isUserExist) {
        return res.status(400).json({
            success: false,
            message: "User already exists with this email, Please login"
       });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newuser = await User.create({
        Fullname: Fullname,
        Email: Email,
        Phone: Phone,
        Password: hashedPassword,
        role: 'user'
    });

    const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); //token generated and valid for 7 days

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
       
        return res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
            id: newuser._id,
            Email,
            Fullname,
            Phone,
            role: 'user'
        }
    })
    } catch (err) {
        console.error('registerUser error:', err.message || err);
        
        // Handle MongoDB connection errors
        if (err.message && err.message.includes('connect ECONNREFUSED')) {
            return res.status(503).json({ 
                success: false, 
                message: 'Cannot connect to database. Make sure MongoDB is running.' 
            });
        }
        
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
            message: err.message || 'Server error while registering user' 
        });
    }
}

const loginUser = async (req, res) => {
    try {
        // accept both 'Email'/'email' and 'password'/'Password'
        const rawBody = req.body || {};
        const Email = rawBody.Email || rawBody.email;
        const password = rawBody.password || rawBody.Password;

        // Basic validation
        if (!Email || !password) {
            console.warn('loginUser: missing credentials in request body', { hasBody: !!req.body, keys: Object.keys(req.body || {}) });
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Check if MongoDB is connected
        if (!User.db.readyState || User.db.readyState === 0) {
            console.error('loginUser error: MongoDB not connected');
            return res.status(503).json({ 
                success: false, 
                message: 'Database unavailable. Please try again later.' 
            });
        }

        const user = await User.findOne({ Email: Email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        // Ensure password stored
        if (!user.Password) {
            console.warn(`loginUser warning: user ${Email} has no password in DB`);
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(String(password), String(user.Password));

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('loginUser error: JWT_SECRET is not set in environment');
            return res.status(500).json({ success: false, message: 'Server misconfiguration (missing JWT_SECRET)' });
        }

        // Generate token
        let token;
        try {
            token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        } catch (err) {
            console.error('loginUser jwt.sign error', err);
            return res.status(500).json({ success: false, message: 'Server error creating session token' });
        }

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        return res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                Email: user.Email,
                Fullname: user.Fullname,
            },
        });
    } catch (err) {
        console.error('loginUser error', err && err.stack ? err.stack : err);
        
        // Handle MongoDB connection errors specifically
        if (err.message.includes('connect ECONNREFUSED')) {
            return res.status(503).json({ 
                success: false, 
                message: 'Cannot connect to database. Make sure MongoDB is running.' 
            });
        }
        
        return res.status(500).json({ success: false, message: 'Server error while logging in' });
    }
};

async function getCurrentUser(req, res) {
    try {
        // Check if it's a user or admin authentication
        let currentUser = req.user || req.admin;

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User data retrieved',
            user: {
                id: currentUser._id,
                Email: currentUser.Email,
                Fullname: currentUser.Fullname,
                Phone: currentUser.Phone,
                role: currentUser.role || 'user'
            }
        });
    } catch (err) {
        console.error('getCurrentUser error', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching user'
        });
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        console.error('logout error', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while logging out'
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logout
};
