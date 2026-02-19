const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;