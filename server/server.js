/* Placeholders for now */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

console.log('Starting CalTrack backend...');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ message: 'CalTrack backend is running!' });
});

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully!');

    app.listen(process.env.PORT || 5000, () => {
      console.log('CalTrack server is running on port 5000');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();