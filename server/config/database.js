import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load .env file in development
dotenv.config();

const connectDB = async () => {
  try {
    // Prefer environment variable, fall back to a local MongoDB instance
    // Set MONGODB_URI in your environment or in a .env file in the server folder.
    // Example .env (see .env.example added to repo):
    // MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/onduty?retryWrites=true&w=majority
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onduty';

    const conn = await mongoose.connect(MONGODB_URI, {
      // Use recommended options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message || error);
    // Do not exit in development — throw so caller can handle it if desired
    process.exit(1);
  }
};

export default connectDB;
