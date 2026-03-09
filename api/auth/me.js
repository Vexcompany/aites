const { verify } = require('../_lib/jwt.js');
const { users } = require('../_lib/db.js');

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

  const user = users.get(payload.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      nama: user.nama,
      jabatan: user.jabatan,
      generasi: user.generasi,
      tipe: user.tipe
    }
  });
};