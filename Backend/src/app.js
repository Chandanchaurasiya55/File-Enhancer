const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./Routes/auth.route');
const videoRoutes = require('./Routes/video.route');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the File-Enhancer API');
});

app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);

// Global error handling middleware - catches all errors and returns JSON
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Set response type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Handle multer errors specifically
    if (err.field === 'video') {
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + (err.message || 'Invalid file format or size')
        });
    }
    
    // Handle all other errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error occurred'
    });
});

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found: ' + req.method + ' ' + req.path
    });
});

module.exports = app;