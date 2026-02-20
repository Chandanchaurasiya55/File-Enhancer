const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.warn('⚠️  MONGODB_URI not configured');
            isConnected = false;
            return;
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
        });
        
        console.log('✅ MongoDB connected successfully');
        isConnected = true;
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.warn('⚠️  Hint: Make sure MongoDB is running on localhost:27017');
        isConnected = false;
    }
};

// Check if database is connected
const isDBConnected = () => {
    return isConnected && mongoose.connection.readyState === 1;
};

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
