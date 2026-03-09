const { findUserByCredentials } = require('../_lib/db.js');
const { sign } = require('../_lib/jwt.js');

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // PERBAIKAN: Parse body dengan aman
        let body = req.body;
        
        // Jika body belum di-parse (Vercel kadang tidak auto-parse)
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid JSON body' });
            }
        }
        
        const { nama, jabatan, generasi } = body || {};
        
        console.log('Login attempt:', { nama, jabatan, generasi });
        
        if (!nama || !jabatan || !generasi) {
            return res.status(400).json({ 
                success: false, 
                error: 'Data tidak lengkap. Harap isi nama, jabatan, dan pilih generasi.' 
            });
        }

        const user = findUserByCredentials(nama, jabatan, generasi);
        
        if (!user) {
            console.log('User not found:', { nama, jabatan, generasi });
            return res.status(401).json({ 
                success: false, 
                error: 'Data tidak ditemukan. Pastikan nama dan jabatan sesuai dengan data generasi.' 
            });
        }

        const token = sign({ 
            userId: user.id, 
            nama: user.nama,
            generasi: user.generasi,
            tipe: user.tipe 
        });

        console.log('Login success:', user.nama);
        
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
        res.status(500).json({ 
            success: false, 
            error: 'Server error: ' + (error.message || 'Unknown error')
        });
    }
};
