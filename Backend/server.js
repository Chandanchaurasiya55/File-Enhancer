const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const connectDB = require('./src/DB/db');
const { cleanupOldFiles } = require('./src/Controller/video.controller');
const { cleanupConvertedFiles } = require('./src/Controller/formate.controller');


const PORT = process.env.PORT || 3000;

// Connect to database and start server
(async () => {
    try {
        console.log('\n🔄 Starting server...');
        await connectDB();
    } catch (err) {
        console.error('Failed to connect to database:', err.message);
    }

    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        // console.log(`📤 Upload & Compress: POST http://localhost:${PORT}/api/video/compress`);
        // console.log(`📊 Status Check: GET http://localhost:${PORT}/api/video/status/:jobId`);
        // console.log(`⬇️   Download: GET http://localhost:${PORT}/api/video/download/:jobId`);
        // console.log(`🔑 User Login: POST http://localhost:${PORT}/api/auth/user/login`);
        // console.log(`👤 User Signup: POST http://localhost:${PORT}/api/auth/user/signup\n`);
    });

    // Auto cleanup old files every 30 minutes
    setInterval(cleanupOldFiles, 30 * 60 * 1000);
    setInterval(cleanupConvertedFiles, 30 * 60 * 1000);
    console.log('🧹 Cleanup scheduler started (every 30 minutes)');
})();
