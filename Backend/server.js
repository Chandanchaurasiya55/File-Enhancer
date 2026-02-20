const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const connectDB = require('./src/DB/db');

const PORT = process.env.PORT || 3300;

// Connect to database and start server
(async () => {
    try {
        console.log('\n🔄 Starting server...');
        console.log(`📍 PORT: ${PORT}`);
        console.log(`📦 MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not set'}`);
        console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not set'}`);
        
        await connectDB();
    } catch (err) {
        console.error('Failed to connect to database:', err.message);
    }

    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📤 Upload & Compress: POST http://localhost:${PORT}/api/video/compress`);
        console.log(`🔑 User Login: POST http://localhost:${PORT}/api/auth/user/login`);
        console.log(`👤 User Signup: POST http://localhost:${PORT}/api/auth/user/signup\n`);
    });
})();
