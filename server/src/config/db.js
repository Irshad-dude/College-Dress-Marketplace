const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGO_URI from environment variables.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 8.x but set explicitly for clarity
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server found
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
