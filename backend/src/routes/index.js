const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const messageRoutes = require('./message.routes');
const quizRoutes = require('./quiz.routes');

router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/quizzes', quizRoutes);

module.exports = router; 