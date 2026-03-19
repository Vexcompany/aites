const { verify } = require('./_lib/jwt.js');
const { getUserById, getAllChats, getAllUsers, ADMIN_NAMES } = require('./_lib/db.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.slice(7);
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserById(payload.userId);
  const isAdmin = user?.isAdmin || ADMIN_NAMES.includes(user?.nama);
  if (!isAdmin) return res.status(403).json({ error: 'Akses ditolak. Hanya admin.' });

  const [chats, users] = await Promise.all([getAllChats(200), getAllUsers(200)]);

  // Statistik per model
  const modelStats = chats.reduce((acc, c) => {
    acc[c.model] = (acc[c.model] || 0) + 1;
    return acc;
  }, {});

  // Statistik per user
  const userStats = chats.reduce((acc, c) => {
    if (!acc[c.userId]) acc[c.userId] = { name: c.userName, gen: c.userGen, count: 0 };
    acc[c.userId].count++;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    stats: {
      totalChats: chats.length,
      totalUsers: users.length,
      modelStats,
      userStats
    },
    chats,
    users
  });
};
