
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;
let database;

const connectDB = async () => {
  try {
    if (!uri || !dbName) {
      throw new Error("Database configuration is missing");
    }

    client = new MongoClient(uri);
    await client.connect();

    database = client.db(dbName);

    console.log("MongoDB connected successfully!");

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database;
};

export default connectDB;
