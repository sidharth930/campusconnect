const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("FATAL: process.env.MONGO_URI is not defined in environment variables!");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("MongoDB initial connection error:", err.message);
  }
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Waiting for reconnection...");
});

module.exports = connectDB;

