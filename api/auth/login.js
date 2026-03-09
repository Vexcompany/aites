const { findUserByCredentials } = require('../_lib/db.js');
const { sign } = require('../_lib/jwt.js');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { nama, jabatan, generasi } = req.body;
    
    if (!nama || !jabatan || !generasi) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const user = findUserByCredentials(nama, jabatan, generasi);
    
    if (!user) {
      return res.status(401).json({ error: 'Data tidak ditemukan atau tidak sesuai' });
    }

    const token = sign({ 
      userId: user.id, 
      nama: user.nama,
      generasi: user.generasi,
      tipe: user.tipe 
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        nama: user.nama,
        jabatan: user.jabatan,
        generasi: user.generasi,
        tipe: user.tipe
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};
