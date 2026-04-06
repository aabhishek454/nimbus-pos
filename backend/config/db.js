const mongoose = require('mongoose');

/**
 * Cached connection for serverless environments (Vercel).
 * In serverless, each invocation may cold-start the module.
 * We cache the connection promise so subsequent invocations
 * reuse the existing connection instead of creating new ones.
 */
let cached = global._mongooseConnection;

if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    // If we already have a ready connection, return it
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // If a connection attempt is already in progress, wait for it
    if (!cached.promise) {
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            console.error('FATAL: MONGO_URI environment variable is not set!');
            throw new Error('MONGO_URI environment variable is not set');
        }

        console.log('MongoDB: Initiating connection...');

        cached.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false,       // Disable buffering — fail fast instead of waiting 10s
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then((mongooseInstance) => {
            console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
            cached.conn = mongooseInstance;
            return mongooseInstance;
        }).catch((error) => {
            console.error(`MongoDB Connection Error: ${error.message}`);
            cached.promise = null;  // Reset so next invocation retries
            throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;
