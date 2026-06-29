const { createClient } = require('@supabase/supabase-js');

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase service role key is not set. Contact form submission cannot be stored.');
      res.status(500).json({ error: 'Supabase is not configured for server-side writes.' });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        handle,
        company,
        interest,
        message,
        whatsapp_ok: whatsappOk,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      res.status(500).json({
        error: error.message || 'Something went wrong while saving your message.',
        details: error
      });
      return;
    }

    res.status(200).json({ success: true, stored: true, data });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    res.status(500).json({ error: error.message || 'Something went wrong while saving your message.' });
  }
};
