require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// CORS middleware configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // standard react-vite development ports
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // Support larger Base64 profiles photo uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup WebSockets using Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach socket server to express application context
app.set('io', io);

// Log socket connections
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

const bootstrap = async () => {
  // 1. Connect to DB first to resolve mock/real state
  await connectDB();

  // 2. Import routes (which load models internally)
  const authRoutes = require('./routes/authRoutes');
  const volunteerRoutes = require('./routes/volunteerRoutes');
  const eventRoutes = require('./routes/eventRoutes');
  const attendanceRoutes = require('./routes/attendanceRoutes');
  const certificateRoutes = require('./routes/certificateRoutes');
  const reportRoutes = require('./routes/reportRoutes');

  // 3. API Routes mounting
  app.use('/api/auth', authRoutes);
  app.use('/api/volunteers', volunteerRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/reports', reportRoutes);

  // Root Endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'NayePankh Volunteer Management API is running...' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
  });

  const PORT = process.env.PORT || 5001;

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

bootstrap();
