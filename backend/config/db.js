import mongoose from "mongoose";

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    ""
  );
}

export async function connectDatabase() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured in backend/.env"
    );
  }

  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return mongoose.connection;
  }

  const connection =
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

  console.log(
    "[CityPulse] MongoDB connected"
  );

  return connection;
}

export async function connectDB() {
  return connectDatabase();
}

export async function connectMongoDB() {
  return connectDatabase();
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

export async function closeDB() {
  return disconnectDatabase();
}

export function getDatabaseConnection() {
  return mongoose.connection;
}

export const db =
  mongoose.connection;

export default connectDatabase;
