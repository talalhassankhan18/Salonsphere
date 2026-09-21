import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local or production environment variables."
  );
}

/**
 * Global interface augmentation for Mongoose connection caching.
 * In development and serverless environments (e.g. Vercel), module reloading
 * can trigger new database connections on every invocation. Caching the
 * connection on the globalThis/global object preserves the connection pool.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB Atlas using Mongoose with connection pooling and caching.
 * Returns the active Mongoose instance.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName: "SalonSphere",
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections per serverless container
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
