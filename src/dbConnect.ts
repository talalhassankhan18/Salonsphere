import mongoose, { ConnectOptions } from 'mongoose';

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedMongoose;
}

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;
const DB_NAME = process.env.DB_NAME as string | undefined;

// Validate environment variables
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

if (!DB_NAME) {
  throw new Error('DB_NAME environment variable is not defined');
}

// Type assertion is safe here because we validated above
const validatedMONGODB_URI: string = MONGODB_URI;
const validatedDB_NAME: string = DB_NAME;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      dbName: validatedDB_NAME,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log(`Connecting to MongoDB at ${validatedMONGODB_URI} with dbName: ${validatedDB_NAME}`);
    cached.promise = mongoose.connect(validatedMONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    const err = error as Error; // Type assertion for catch block
    console.error('MongoDB connection error:', err.message);
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }

  return cached.conn;
}

export default dbConnect;