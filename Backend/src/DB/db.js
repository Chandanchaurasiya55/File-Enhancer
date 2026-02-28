const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
    });
    console.log('MongoDB Connected Successfully ✅');
  } catch (error) {
    console.error('MongoDB Connection Failed ❌', error.message);
    console.error('Full Error:', error);
  }
};

module.exports = connectDB;



