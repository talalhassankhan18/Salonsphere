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

// Read + validate env lazily, at connect time. Doing it at module load made
// `next build` crash on any host without these vars set (Next imports every
// route while collecting page data), and the env is only needed to connect.
function getDbConfig(): { uri: string; dbName: string } {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  if (!dbName) throw new Error("DB_NAME environment variable is not defined");
  return { uri, dbName };
}

// The driver's Atlas hint ("...an IP that isn't whitelisted") is printed for
// *any* server-selection failure against a .mongodb.net host, so pull out the
// per-server errors (e.g. "SSL alert number 80" = IP not allowlisted, vs a
// timeout) to make /api/health and the 503 bodies actually diagnostic.
function describeServerErrors(error: unknown): string {
  const reason = (error as { reason?: { servers?: Map<string, { error?: { message?: string } | null }> } })
    ?.reason;
  if (!reason?.servers) return "";
  const parts: string[] = [];
  for (const [address, desc] of reason.servers) {
    const msg = desc?.error?.message;
    if (msg) parts.push(`${address}: ${msg.split("\n")[0].slice(0, 160)}`);
  }
  return parts.length ? ` [${parts.join("; ")}]` : "";
}

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
    const { uri, dbName } = getDbConfig();
    const opts = {
      dbName,
      bufferCommands: false, // Disable buffering for failed commands
      maxPoolSize: 10, // Maximum number of socket connections
      // Dev: fail fast (3 s) so a stopped local mongod shows an error state
      // instead of hanging every request. Prod: a serverless cold start has
      // to do SRV lookup + TLS to three Atlas shards, so allow 5 s.
      serverSelectionTimeoutMS: process.env.NODE_ENV === "production" ? 5000 : 3000,
      socketTimeoutMS: 45000, // Timeout for socket inactivity
      connectTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000, // Frequency of server monitoring
      family: 4, // mongod binds 127.0.0.1 only; skip the doomed ::1 attempt
    };

    console.log(`Connecting to MongoDB (dbName: ${dbName})`);
    cached.promise = mongoose
      .connect(uri, opts)
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
    throw new Error(`Failed to connect to MongoDB: ${err.message}${describeServerErrors(error)}`);
  }

  return cached.conn;
}

export default dbConnect;
