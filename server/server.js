/* Placeholders for now */
const userRoutes = require("./routes/userRoutes");
const savedFoodRoutes = require("./routes/savedFoodRoutes");
const goalRoutes = require("./routes/goalRoutes");
const path = require("path");
const dailyRecordRoutes = require("./routes/dailyRecordRoutes");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

/*Temporarily*/
console.log("Clerk environment check:", {
  publishableKeyLoaded: Boolean(process.env.CLERK_PUBLISHABLE_KEY),
  secretKeyLoaded: Boolean(process.env.CLERK_SECRET_KEY),
});

const { clerkMiddleware } = require("@clerk/express");
const mealRoutes = require("./routes/mealRoutes");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

console.log('Starting CalTrack backend...');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use(
  clerkMiddleware({
    authorizedParties: ["http://localhost:5173"],
    debug: true,
  })
);
app.get("/debug/auth", (req, res) => {
  const { getAuth } = require("@clerk/express");
  const auth = getAuth(req);

  res.json({
    authenticated: Boolean(auth.userId),
    sessionPresent: Boolean(auth.sessionId),
    tokenType: auth.tokenType ?? null,
    clerkStatus: res.getHeader("x-clerk-auth-status") ?? null,
    clerkReason: res.getHeader("x-clerk-auth-reason") ?? null,
  });
});
app.use("/api/meals", mealRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/saved-foods", savedFoodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/daily-records", dailyRecordRoutes);

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