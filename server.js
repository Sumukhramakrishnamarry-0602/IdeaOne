const path = require('path');
const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'ideaone';
const collectionName = process.env.MONGODB_COLLECTION || 'contacts';

if (!mongoUri) {
  console.error('Missing MONGODB_URI environment variable. Set it in a .env file or in your shell.');
  process.exit(1);
}

const client = new MongoClient(mongoUri, {
  serverApi: '1',
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let collection;

async function startDb() {
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);
  console.log(`Connected to MongoDB database "${dbName}" and collection "${collectionName}".`);
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  try {
    const payload = req.body;

    if (payload._gotcha) {
      return res.status(400).json({ error: 'Spam detected.' });
    }

    const requiredFields = ['first_name', 'last_name', 'email', 'interest', 'message'];
    for (const field of requiredFields) {
      if (!payload[field] || !String(payload[field]).trim()) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
    }

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
    console.error('Error saving contact form:', error);
    return res.status(500).json({ error: 'Unable to save form submission.' });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'), err => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

startDb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
