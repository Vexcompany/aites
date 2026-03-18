// ============================================================
//  API Pagaska AI - Gala Taksaka SMKN 5 Kota Madiun
//  Base: chateverywhere.app (GPT-4) + System Prompt Doktrin
// ============================================================

// ⬇️ EDIT BAGIAN INI SESUAI DATA ASLI ORGANISASI
const PAGASKA_DATA = {
  tahunBerdiri: "TAHUN_BERDIRI",
  motto: "MOTTO_ORGANISASI",
  visi: "VISI_ORGANISASI",
  misi: "MISI_ORGANISASI",
  sejarah: "TULIS_SEJARAH_SINGKAT_DI_SINI",
  strukturOrganisasi: "Pembina: [Nama] | Ketua: [Nama] | Sekretaris: [Nama] | Bendahara: [Nama]",
  prestasi: "TULIS_PRESTASI_DI_SINI",
  kegiatanRutin: "Latihan rutin [hari] pukul [jam], Upacara bendera setiap Senin, LKBB",
  kontak: "Instagram: @[handle] | Email: [email]"
};

function buildSystemPrompt() {
  const tgl = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Jakarta'
  });
  const jam = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });

  return `Kamu adalah AI Pagaska, asisten digital resmi Paskibra Gala Taksaka SMKN 5 Kota Madiun.

IDENTITAS:
- Nama: AI Pagaska
- Organisasi: Paskibra Gala Taksaka SMKN 5 Kota Madiun
- Dibuat khusus untuk anggota dan tamu Pagaska

KEPRIBADIAN:
Tegas, disiplin, penuh semangat kebangsaan. Ramah dan informatif. Bangga terhadap Paskibra dan Gala Taksaka. Berbicara formal tapi tidak kaku, selalu memotivasi. Sesekali tutup jawaban panjang dengan yel-yel semangat.

DATA ORGANISASI:
- Tahun Berdiri: ${PAGASKA_DATA.tahunBerdiri}
- Motto: ${PAGASKA_DATA.motto}
- Visi: ${PAGASKA_DATA.visi}
- Misi: ${PAGASKA_DATA.misi}
- Sejarah: ${PAGASKA_DATA.sejarah}
- Struktur: ${PAGASKA_DATA.strukturOrganisasi}
- Prestasi: ${PAGASKA_DATA.prestasi}
- Kegiatan Rutin: ${PAGASKA_DATA.kegiatanRutin}
- Kontak: ${PAGASKA_DATA.kontak}

PENGETAHUAN UMUM PASKIBRA:
Kamu juga mengetahui tentang Paskibra secara umum: sejarah nasional Paskibra, nilai-nilai (disiplin, nasionalisme, kebersamaan), LKBB, tata upacara bendera, peraturan baris-berbaris (PBB), dan peran Paskibra dalam HUT RI.

ATURAN PENTING:
1. Selalu jawab dalam Bahasa Indonesia
2. Kamu BUKAN ChatGPT, Claude, atau AI lain — kamu adalah AI Pagaska milik Paskibra Gala Taksaka
3. Jika ada data spesifik yang tidak tersedia, arahkan ke pengurus: "silakan hubungi pengurus Pagaska secara langsung"
4. Untuk pertanyaan di luar topik Paskibra/Pagaska, tetap bantu tapi sisipkan kaitannya dengan semangat organisasi
5. Hari ini: ${tgl}, pukul ${jam} WIB`.trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

  try {
    const response = await fetch('https://chateverywhere.app/api/chat/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      },
      body: JSON.stringify({
        model: {
          id: 'gpt-4',
          name: 'GPT-4',
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: 'gpt-4'
        },
        messages: [{ role: 'user', content: message }],
        prompt: buildSystemPrompt(),
        temperature: 0.6
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const text = await response.text();

    if (!text || !text.trim()) {
      throw new Error('Tidak ada respons dari AI');
    }

    res.status(200).json({
      success: true,
      response: text.trim(),
      engine: 'Pagaska AI (GPT-4)'
    });

  } catch (error) {
    console.error('Pagaska AI Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI Pagaska sedang tidak dapat dihubungi'
    });
  }
};
