// dbConnect.ts
import mongoose from "mongoose";

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      };
    }
  }
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const DB_NAME = process.env.DB_NAME ?? '';
const PORT = process.env.PORT ?? '';

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const fullUri = `${MONGODB_URI}:${PORT}/${DB_NAME}`; // Full URI including port and database name

async function dbConnect() {
  if (global.mongoose.conn) {
    console.log("Reusing existing MongoDB connection");
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    };

    global.mongoose.promise = mongoose
      .connect(fullUri, opts) // Use the full URI
      .then((mongoose) => {
        console.log("New MongoDB connection established");
        return mongoose.connection;
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB", error);
        global.mongoose.promise = null; // Reset the promise so future calls can try again
        throw error;
      });
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (error) {
    console.error("Error waiting for MongoDB connection", error);
    throw error;
  }

  return global.mongoose.conn;
}

export default dbConnect;