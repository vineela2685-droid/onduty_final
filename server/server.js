import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './config/database.js';
import userRoutes from './routes/users.js';
import requestRoutes from './routes/requests.js';
import User from './models/User.js'; // <-- add .js extension

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);

// Create user endpoint
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get users endpoint
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to On-Duty Pro API!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});
