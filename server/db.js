import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URIS = [
  process.env.MONGODB_URI,
  'mongodb://siddhukumar2006_db_user:ZYHMgeL2KTYsv6RY@ac-mpbenhj-shard-00-00.xbxhty6.mongodb.net:27017,ac-mpbenhj-shard-00-01.xbxhty6.mongodb.net:27017,ac-mpbenhj-shard-00-02.xbxhty6.mongodb.net:27017/kd_supermarket?ssl=true&replicaSet=atlas-115vxy-shard-0&authSource=admin&retryWrites=true&w=majority',
  'mongodb+srv://siddhukumar2006_db_user:ZYHMgeL2KTYsv6RY@kdmart.xbxhty6.mongodb.net/kd_supermarket?retryWrites=true&w=majority&appName=kdmart'
].filter(Boolean);

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb) return cachedDb;

  let lastError = null;
  for (const uri of MONGODB_URIS) {
    try {
      const client = new MongoClient(uri, {
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
      lastError = err;
      console.warn('⚠️ MongoDB connection attempt failed, trying fallback...', err.message);
    }
  }

  throw lastError || new Error('Could not connect to MongoDB Atlas');
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
