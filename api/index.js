// api/index.js - Vercel backend entry
const mongoose = require("mongoose");
const app = require("../App");

let isConnected = false; // Prevent multiple DB connections in serverless

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ DB connection successful");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res); // Pass request to Express
};
