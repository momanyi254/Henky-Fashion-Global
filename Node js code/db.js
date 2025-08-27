const mongoose = require('mongoose');

const uri = "mongodb+srv://momanyihenry4:momanyi@node1.torjizn.mongodb.net/node1?retryWrites=true&w=majority&appName=node1";

async function connectToDB() {
  try {
    // Connect to MongoDB using Mongoose 
    await mongoose.connect(uri);

    console.log("Successfully connected to MongoDB with Mongoose!");

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn("Mongoose disconnected!");
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Stop app if DB fails
  }
}

module.exports = { connectToDB };
