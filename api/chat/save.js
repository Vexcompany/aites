const { verify } = require('../_lib/jwt.js');
const { saveChat } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.slice(7);
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { messages, model } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'Messages kosong' });

  const chat = await saveChat(payload.userId, messages, model || 'unknown');
  res.status(200).json({ success: true, chat });
};
