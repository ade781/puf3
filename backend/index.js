const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./database');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const gameRoutes = require('./routes/gameRoutes');
const musicRoutes = require('./routes/musicRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/music', musicRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: '💜 Romantic Quiz API for Fika!' });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

module.exports = app;
