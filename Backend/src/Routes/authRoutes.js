const express = require('express');
const router = express.Router();
const {
    userSignup,
    userLogin,
    adminSignup,
    adminLogin,
    getCurrentUser,
    logout
} = require('../Controller/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// User Routes
router.post('/user/signup', userSignup);
router.post('/user/login', userLogin);

// Admin Routes
router.post('/admin/signup', adminSignup);
router.post('/admin/login', adminLogin);

// Protected Routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;
