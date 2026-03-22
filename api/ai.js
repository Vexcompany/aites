// ============================================================
//  Unified AI Handler - Pagaska AI
//  Menggabungkan semua model dalam 1 serverless function
//  Hemat limit Vercel: 1 fungsi menggantikan banyak endpoint
// ============================================================

const crypto = require('crypto');

// ========== PAGASKA AI ==========
const PAGASKA_DATA = {
  tahunBerdiri: "TAHUN_BERDIRI",
  motto: "MOTTO_ORGANISASI",
  visi: "VISI_ORGANISASI",
  misi: "MISI_ORGANISASI",
  sejarah: "TULIS_SEJARAH_SINGKAT_DI_SINI",
  strukturOrganisasi: "Pembina: [Nama] | Ketua: [Nama] | Sekretaris: [Nama] | Bendahara: [Nama]",
  prestasi: "TULIS_PRESTASI_DI_SINI",
  kegiatanRutin: "Latihan rutin [hari] pukul [jam], Upacara bendera setiap Senin, LKBB",
  kontak: "Instagram: @pagaska_ | Tiktok: @gala.taksaka1"
};

function buildPagaskaSystemPrompt() {
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

// ========== MODEL HANDLERS ==========

async function handlePagaska(message) {
  const response = await fetch('https://chateverywhere.app/api/chat/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    },
    body: JSON.stringify({
      model: { id: 'gpt-4', name: 'GPT-4', maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: 'gpt-4' },
      messages: [{ role: 'user', content: message }],
      prompt: buildPagaskaSystemPrompt(),
      temperature: 0.6
    })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const text = await response.text();
  if (!text || !text.trim()) throw new Error('Tidak ada respons dari AI');
  return { response: text.trim(), engine: 'Pagaska AI (GPT-4)' };
}

async function handleGpt4(message) {
  const d = new Date();
  const jam = d.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta" });
  const hari = d.toLocaleDateString('id', { weekday: 'long' });
  const tgl = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' });
  const logic = `You are AgungDevX AI, a helpful assistant. Current date: ${tgl}, time: ${jam}, day: ${hari}. Respond in the same language as the user's query.`;
  const response = await fetch("https://chateverywhere.app/api/chat/", {
    method: 'POST',
    headers: { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    body: JSON.stringify({
      model: { id: "gpt-4", name: "GPT-4", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" },
      messages: [{ role: "user", content: message }],
      prompt: logic,
      temperature: 0.5
    })
  });
  if (!response.ok) throw new Error(`GPT-4 API error: ${response.status}`);
  const data = await response.text();
  if (!data) throw new Error('Empty response from GPT-4');
  return { response: data, engine: 'GPT-4', model: 'gpt-4' };
}

async function handleGita(message) {
  const response = await fetch(`https://gitagpt.org/api/ask/gita?q=${encodeURIComponent(message)}&email=null&locale=en`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://gitagpt.org/',
      'Origin': 'https://gitagpt.org'
    }
  });
  if (!response.ok) throw new Error(`GitaGPT API error: ${response.status}`);
  const data = await response.json();
  if (!data.response) throw new Error('No response from GitaGPT');
  return { response: data.response, question: data.question, engine: 'GitaGPT', spiritual_guide: 'Lord Krishna / Gita AI' };
}

async function handleUnlimited(message) {
  const chatId = "e6d80bed-6b42-4ea0-a5ac-01d4e9175ee1";
  const requestData = [{
    chatId,
    messages: [
      { id: crypto.randomUUID(), role: "user", content: message, parts: [{ type: "text", text: message }], createdAt: "$D" + new Date().toISOString() },
      { id: crypto.randomUUID(), role: "assistant", content: "", parts: [{ type: "text", text: "" }], createdAt: "$D" + new Date().toISOString() }
    ],
    selectedChatModel: "chat-model-reasoning",
    selectedCharacter: null,
    selectedStory: null
  }];
  const response = await fetch(`https://app.unlimitedai.chat/chat/${chatId}`, {
    method: 'POST',
    headers: {
      'Accept': 'text/x-component',
      'Next-Action': '40713570958bf1accf30e8d3ddb17e7948e6c379fa',
      'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      'Content-Type': 'application/json',
      'Origin': 'https://app.unlimitedai.chat',
      'Referer': `https://app.unlimitedai.chat/chat/${chatId}`
    },
    body: JSON.stringify(requestData)
  });
  const text = await response.text();
  let responseText = '';
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('"diff"')) continue;
    try {
      const match = trimmed.match(/^(\d+):(.+)$/);
      if (match) {
        const data = JSON.parse(match[2]);
        if (data.diff && data.diff[1]) responseText += data.diff[1];
      }
    } catch (e) { continue; }
  }
  return { response: responseText || "Tidak ada respons", engine: 'Unlimited AI' };
}

async function handleSonnet(message) {
  // Claude Sonnet via DashX API
  const url = `https://api.dashx.dpdns.org/api/AI/sonnet?text=${encodeURIComponent(message)}&key=${process.env.DHX_KEY || ''}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) throw new Error('Gagal mendapatkan respons dari Sonnet API');
  return { response: data.data.result, engine: 'Claude Sonnet 4.6' };
}

// ========== MAIN HANDLER ==========

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, model = 'pagaska' } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

  try {
    let result;
    switch (model) {
      case 'pagaska':   result = await handlePagaska(message); break;
      case 'gpt4':      result = await handleGpt4(message); break;
      case 'gita':      result = await handleGita(message); break;
      case 'unlimited': result = await handleUnlimited(message); break;
      case 'sonnet':    result = await handleSonnet(message); break;
      default: return res.status(400).json({ success: false, error: `Model '${model}' tidak dikenal` });
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(`[AI:${model}] Error:`, error);
    res.status(500).json({ success: false, error: error.message || 'AI sedang tidak dapat dihubungi' });
  }
};
