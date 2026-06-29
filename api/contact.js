const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ideaone';
const collectionName = process.env.MONGODB_COLLECTION || 'contacts';

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const payload = req.body || {};
    if (payload._gotcha) {
      return res.status(400).json({ error: 'Spam detected.' });
    }

    const requiredFields = ['first_name', 'last_name', 'email', 'interest', 'message'];
    for (const field of requiredFields) {
      if (!payload[field] || !String(payload[field]).trim()) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName);

    const doc = {
      first_name: String(payload.first_name).trim(),
      last_name: String(payload.last_name).trim(),
      email: String(payload.email).trim(),
      handle: String(payload.handle || '').trim(),
      company: String(payload.company || '').trim(),
      interest: String(payload.interest).trim(),
      message: String(payload.message).trim(),
      whatsapp_ok: payload.whatsapp_ok === 'yes' ? 'yes' : 'no',
      _replyto: String(payload._replyto || '').trim(),
      submitted_at: new Date().toISOString()
    };

    await collection.insertOne(doc);
    return res.status(201).json({ success: true, message: 'Contact form saved.' });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Unable to save form submission.' });
  }
};
