const { MongoClient } = require('mongodb');

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
      console.warn('MONGODB_URI is not set. Contact form submission accepted but not stored.');
      res.status(200).json({ success: true, stored: false });
      return;
    }

    const client = new MongoClient(uri);
    try {
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

      res.status(200).json({ success: true, stored: true });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Contact form submission failed:', error);
    res.status(500).json({ error: 'Something went wrong while saving your message.' });
  }
};
