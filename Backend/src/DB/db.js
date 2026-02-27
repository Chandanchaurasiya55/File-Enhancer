// const mongoose = require('mongoose');

// let isConnected = false;

// const connectDB = async () => {
//     try {
//         const mongoURI = process.env.MONGODB_URI;

//         await mongoose.connect(mongoURI, {
//             serverSelectionTimeoutMS: 5000,
//             retryWrites: true,
//         });
        
//         console.log('✅ MongoDB connected successfully');
//         isConnected = true;
//     } catch (err) {
//         console.error('❌ MongoDB connection failed:', err);
//         isConnected = false;
//     }
// };

// // Check if database is connected
// const isDBConnected = () => {
//     return isConnected && mongoose.connection.readyState === 1;
// };

// module.exports = connectDB;
// module.exports.isDBConnected = isDBConnected;




const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
