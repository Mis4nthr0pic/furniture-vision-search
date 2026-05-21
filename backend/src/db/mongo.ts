import { MongoClient, type Db } from "mongodb";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(config.mongodbUri);
  await client.connect();
  db = client.db("catalog");
  logger.info("Connected to MongoDB catalog");
  return db;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info("Disconnected from MongoDB");
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error("MongoDB not connected");
  }
  return db;
}
