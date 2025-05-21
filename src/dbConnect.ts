import mongoose from "mongoose";

// Define the cached connection type
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to include mongoose caching
declare global {
  var mongoose: CachedMongoose | undefined;
}

// Retrieve environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

// Log for debugging
console.log("MONGODB_URI:", MONGODB_URI);
console.log("DB_NAME:", DB_NAME);

// Validate environment variables
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

if (!DB_NAME) {
  throw new Error("DB_NAME environment variable is not defined");
}

// Type assertion is safe due to validation above
const validatedMONGODB_URI: string = MONGODB_URI;
const validatedDB_NAME: string = DB_NAME;

// Use globalThis to persist across hot reloads (Next.js-friendly)
let cached: CachedMongoose = (globalThis as any).mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  (globalThis as any).mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("✅ Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: validatedDB_NAME,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    console.log(
      `🔌 Connecting to MongoDB at ${validatedMONGODB_URI} with dbName: ${validatedDB_NAME}`
    );

    cached.promise = mongoose
      .connect(validatedMONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected successfully");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: unknown) {
    cached.promise = null;

    const err =
      error instanceof Error
        ? error
        : new Error("Unknown MongoDB connection error");

    console.error("❌ MongoDB connection error:", err.message);
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }

  // Monitor connection state
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
    cached.conn = null;
    cached.promise = null;
  });

  return cached.conn;
}

export default dbConnect;