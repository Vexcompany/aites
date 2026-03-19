const { verify } = require('../_lib/jwt.js');
const { getUserById, getUserChats, getAllChats, ADMIN_NAMES } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.slice(7);
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserById(payload.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Admin dapat semua chat, user biasa hanya milik sendiri
  const isAdmin = user.isAdmin || ADMIN_NAMES.includes(user.nama);
  const all = req.query.all === '1';

  let chats;
  if (isAdmin && all) {
    chats = await getAllChats(200);
  } else {
    chats = await getUserChats(payload.userId, 50);
  }

  res.status(200).json({ success: true, chats, isAdmin });
};
