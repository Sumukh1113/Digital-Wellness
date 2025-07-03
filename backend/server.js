require('dotenv').config(); // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // ✅ required to serve static files

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve frontend static files (React build)
app.use(express.static(path.join(__dirname, 'build')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitalwellness', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/predictions', require('./routes/predictions'));

// ✅ Catch-all: for React routing (serves index.html if no API matched)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('screen-time-update', (data) => {
    socket.broadcast.emit('live-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
