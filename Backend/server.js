const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const connectDB = require('./src/DB/db');
const { cleanupOldFiles } = require('./src/Controller/video.controller');
const { cleanupConvertedFiles } = require('./src/Controller/formate.controller');


const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB();


app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    // Auto cleanup old files every 30 minutes
    setInterval(cleanupOldFiles, 30 * 60 * 1000);
    setInterval(cleanupConvertedFiles, 30 * 60 * 1000);
    console.log('🧹 Cleanup scheduler started (every 30 minutes)');
});


module.exports = app; // Export app for testing purposes
