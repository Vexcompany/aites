const { verify } = require('../_lib/jwt.js');
const { saveChat } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.slice(7);
  const payload = verify(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { messages } = req.body;
  const chat = saveChat(payload.userId, messages);
  
  res.status(200).json({ success: true, chat });
};