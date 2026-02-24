const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./Routes/auth.route');
const videoRoutes = require('./Routes/video.route');
const imgRoutes = require('./Routes/img.routes');
const formatRoutes = require('./Routes/format.route');
const errorHandler = require('./Middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Serve enhanced images statically
app.use('/enhanced', express.static(path.join(__dirname, 'uploads/enhanced')));
// Serve converted documents so the frontend can download them
app.use('/converted', express.static(path.join(__dirname, '..', 'converted')));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the File-Enhancer API');
});

app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/image', imgRoutes);
app.use('/api/format', formatRoutes);

// Global error handling middleware - catches all errors and returns JSON
app.use(errorHandler);

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found: ' + req.method + ' ' + req.path
    });
});

module.exports = app;