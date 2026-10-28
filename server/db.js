import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb) return cachedDb;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  try {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db('kd_supermarket');
    console.log('✅ Connected to MongoDB Atlas (kd_supermarket)');
    return cachedDb;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
