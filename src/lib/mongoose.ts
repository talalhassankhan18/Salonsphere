import mongoose from "mongoose";

// Ensure MONGODB_URI exists (throws at runtime if missing)
const MONGODB_URI = process.env.MONGODB_URI!;

declare global {
  var __mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Initialize global mongoose connection storage
globalThis.__mongoose = globalThis.__mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (globalThis.__mongoose.conn) return globalThis.__mongoose.conn;

  if (!globalThis.__mongoose.promise) {
    globalThis.__mongoose.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongoose) => mongoose.connection)
      .catch((err) => {
        globalThis.__mongoose.promise = null; // Reset promise if connection fails
        throw err;
      });
  }

  globalThis.__mongoose.conn = await globalThis.__mongoose.promise;
  return globalThis.__mongoose.conn;
}

export default dbConnect;
