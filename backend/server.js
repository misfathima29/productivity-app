const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const moodRoutes = require('./routes/moodRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const app = express();

// Connect to Database
connectDB(); 

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Serve static files from public folder
app.use(express.static('public'));

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/test', testRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
// API Home
app.get('/', (req, res) => {
  res.json({ 
    message: 'Productivity Hub API is running!',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Disconnected ✗',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      notes: '/api/notes'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus];
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbStatusText,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}`);
  console.log(`🌍 Dashboard: http://localhost:${PORT}/index.html`);
});