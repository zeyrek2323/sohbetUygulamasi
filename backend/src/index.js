const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const setupWebSocket = require('./websocket');

// Import routes
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const questionRoutes = require('./routes/question.routes');
const messageRoutes = require('./routes/message.routes');
const quizRoutes = require('./routes/quiz.routes');

// Environment variables configuration

dotenv.config();

// Express app initialization
const app = express();
const server = http.createServer(app);

// WebSocket sunucusunu kur
setupWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/sohbet-uygulamasi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quizzes', quizRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sohbet Uygulamasi API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}); 