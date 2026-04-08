const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fitnessRoutes = require('./routes/fitnessRoutes');
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const foodRoutes = require('./routes/foodRoutes');
const weightRoutes = require('./routes/weightRoutes');
const cardioRoutes = require('./routes/cardioRoutes');
const customFoodRoutes = require('./routes/customFoodRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

// ── Database name MUST be in URI for Atlas M0 clusters ──
const DB_URI = process.env.DB_URI;
if (!DB_URI) {
  console.error('❌ Missing DB_URI in environment. Set DB_URI in backend/.env or in your environment variables.');
  process.exit(1);
}

// ── Connect (or reconnect) helper ──
let connecting = false;
const connectDB = async () => {
  if (connecting || mongoose.connection.readyState === 1) return;
  connecting = true;
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  } finally {
    connecting = false;
  }
};

connectDB(); // Try on boot

// ── Middleware: auto-reconnect before every API request ──
// This ensures any temporary disconnect (cold start, IP change) self-heals
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: '⚠️ Database unavailable. Please go to MongoDB Atlas → Network Access → Add your IP address (or Allow All: 0.0.0.0/0), then try again.'
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/custom-food', customFoodRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/cardio', cardioRoutes);

app.get('/', (req, res) => res.send('Fitness API Server is running ✅'));
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ db: states[mongoose.connection.readyState] ?? 'unknown' });
});

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
