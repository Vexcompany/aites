const { verify } = require('../_lib/jwt.js');
const { getUserChats } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.slice(7);
  const payload = verify(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const chats = getUserChats(payload.userId);
  res.status(200).json({ success: true, chats });
};