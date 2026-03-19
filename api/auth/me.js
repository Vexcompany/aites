const { verify } = require('../_lib/jwt.js');
const { getUserById } = require('../_lib/db.js');

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

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      nama: user.nama,
      jabatan: user.jabatan,
      generasi: user.generasi,
      tipe: user.tipe,
      isAdmin: user.isAdmin || false
    }
  });
};
