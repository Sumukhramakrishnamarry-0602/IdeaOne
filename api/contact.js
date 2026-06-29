const { MongoClient } = require('mongodb');

<<<<<<< Updated upstream
const dbName = process.env.MONGODB_DB || 'ideaone';
const collectionName = process.env.MONGODB_COLLECTION || 'contacts';

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

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

module.exports = async function handler(req, res) {
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
=======
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const firstName = (body.first_name || '').toString().trim();
    const lastName = (body.last_name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const handle = (body.handle || '').toString().trim();
    const company = (body.company || '').toString().trim();
    const interest = (body.interest || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const whatsappOk = (body.whatsapp_ok || '').toString().trim();

    if (!firstName || !lastName || !email || !interest || !message) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ error: 'Contact form is not configured yet.' });
      return;
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'ideaone');
    const collection = db.collection('contact_submissions');

    await collection.insertOne({
      first_name: firstName,
      last_name: lastName,
      email,
      handle,
      company,
      interest,
      message,
      whatsapp_ok: whatsappOk,
      created_at: new Date()
    });

    await client.close();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    res.status(500).json({ error: 'Something went wrong while saving your message.' });
>>>>>>> Stashed changes
  }
};
