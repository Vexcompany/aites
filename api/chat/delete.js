const { verify } = require('../_lib/jwt.js');
const { getUserById, deleteChat, ADMIN_NAMES } = require('../_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.slice(7);
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserById(payload.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { chatId } = req.body;
  if (!chatId) return res.status(400).json({ error: 'chatId diperlukan' });

  const isAdmin = user.isAdmin || ADMIN_NAMES.includes(user.nama);
  const ok = await deleteChat(chatId, isAdmin ? null : payload.userId);

  res.status(200).json({ success: ok });
};
