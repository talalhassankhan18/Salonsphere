import mongoose from "mongoose";

// Define the cached connection type
interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global object to include mongoose caching
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose | undefined;
}

// Retrieve environment variables
const MONGODB_URI = process.env.MONGODB_URI as string | undefined;
const DB_NAME = process.env.DB_NAME as string | undefined;

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

// Initialize cached connection
const cached: CachedMongoose = global.mongoose ?? { conn: null, promise: null };

// Assign to global to persist across hot reloads in development
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // Return cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // If no promise exists, create a new connection promise
  if (!cached.promise) {
    const opts = {
      dbName: validatedDB_NAME,
      bufferCommands: false, // Disable buffering for failed commands
      maxPoolSize: 10, // Maximum number of socket connections
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket inactivity
      connectTimeoutMS: 10000, // Timeout for initial connection
      heartbeatFrequencyMS: 10000, // Frequency of server monitoring
    };

    console.log(`Connecting to MongoDB (dbName: ${validatedDB_NAME})`);
    cached.promise = mongoose
      .connect(validatedMONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        return mongooseInstance;
      });

    // Register monitoring listeners once per connection attempt, not on
    // every dbConnect() call (which would leak listeners after reconnects).
    mongoose.connection.once("disconnected", () => {
      console.warn("MongoDB disconnected");
      cached.conn = null;
      cached.promise = null;
    });
    mongoose.connection.once("error", (err) => {
      console.error("MongoDB connection error:", err.message);
      cached.conn = null;
      cached.promise = null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: unknown) {
    // Reset promise on failure to allow retries
    cached.promise = null;
    const err =
      error instanceof Error
        ? error
        : new Error("Unknown MongoDB connection error");
    console.error("MongoDB connection error:", err.message);
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }

  return cached.conn;
}

export default dbConnect;
