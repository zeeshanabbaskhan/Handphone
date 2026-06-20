const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!process.env.Mongo_Url) {
    throw new Error('Mongo_Url is not configured');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.Mongo_Url, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).then((mongooseInstance) => {
      console.log('Connected to MongoDB');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
