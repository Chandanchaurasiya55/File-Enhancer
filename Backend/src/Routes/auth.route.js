const express = require('express');
const authController = require('../Controller/auth.controller');
const adminController = require('../Controller/admin.controller');
const authenticateUser = require('../Middleware/auth.middleware');
const authenticateAdmin = require('../Middleware/admin.middleware');
const authenticateUserOrAdmin = require('../Middleware/unified.middleware');

const router = express.Router();

// ============== USER AUTH ROUTES ==============
router.post('/user/signup', authController.registerUser);
router.post('/user/login', authController.loginUser);

// ============== ADMIN AUTH ROUTES ==============
router.post('/admin/signup', adminController.registerAdmin);
router.post('/admin/login', adminController.loginAdmin);
router.get('/admin/check', adminController.checkAdminExists);

// ============== PROTECTED ROUTES ==============
router.get('/me', authenticateUserOrAdmin, authController.getCurrentUser);
router.post('/logout', authenticateUserOrAdmin, authController.logout);

module.exports = router;
