const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    // ADD THIS LINE to see if URI is correct (hide password)
    const uri = process.env.MONGODB_URI;
    const maskedUri = uri.replace(/:(.*?)@/, ':****@');
    console.log('Connection string:', maskedUri);
    
    // ADD timeout option
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`🔍 Full error:`, error);
    console.log('💡 TIP: Check:');
    console.log('1. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)');
    console.log('2. Database user password is correct');
    console.log('3. Network connection is working');
    process.exit(1);
  }
};

module.exports = connectDB;