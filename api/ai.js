// ============================================================
//  Unified AI Handler - Pagaska AI
//  Semua model dalam 1 serverless function (hemat Vercel limit)
// ============================================================

const crypto = require('crypto');

// ========== PAGASKA AI SYSTEM PROMPT ==========
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

ATURAN PENTING:
1. Selalu jawab dalam Bahasa Indonesia
2. Kamu BUKAN ChatGPT, Claude, atau AI lain — kamu adalah AI Pagaska
3. Jika data spesifik tidak tersedia, arahkan ke pengurus
4. Hari ini: ${tgl}, pukul ${jam} WIB`.trim();
}

// ========== HELPER: luminai.my.id wrapper ==========
async function luminaiPost(content, cName, cID) {
  const res = await fetch('https://luminai.my.id/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ content, ...(cName && { cName }), ...(cID && { cID }) }),
    signal: AbortSignal.timeout(30000)
  });
  const data = await res.json();
  if (!data.result) throw new Error('No result from luminai');
  return data.result;
}

// ========== MODEL HANDLERS ==========

// 1. Pagaska AI (GPT-4 via chateverywhere)
async function handlePagaska(message) {
  const res = await fetch('https://chateverywhere.app/api/chat/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
    },
    body: JSON.stringify({
      model: { id: 'gpt-4', name: 'GPT-4', maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: 'gpt-4' },
      messages: [{ role: 'user', content: message }],
      prompt: buildPagaskaSystemPrompt(),
      temperature: 0.6
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const text = await res.text();
  if (!text?.trim()) throw new Error('Tidak ada respons dari AI');
  return { response: text.trim(), engine: 'Pagaska AI (GPT-4)' };
}

// 2. GPT-4 via chateverywhere
async function handleGpt4(message) {
  const d = new Date();
  const jam = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta' });
  const hari = d.toLocaleDateString('id', { weekday: 'long' });
  const tgl = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' });
  const res = await fetch('https://chateverywhere.app/api/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify({
      model: { id: 'gpt-4', name: 'GPT-4', maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: 'gpt-4' },
      messages: [{ role: 'user', content: message }],
      prompt: `You are AgungDevX AI, a helpful assistant. Current date: ${tgl}, time: ${jam}, day: ${hari}. Respond in the same language as the user's query.`,
      temperature: 0.5
    })
  });
  if (!res.ok) throw new Error(`GPT-4 error: ${res.status}`);
  const text = await res.text();
  return { response: text, engine: 'GPT-4', model: 'gpt-4' };
}

// 3. Gita AI
async function handleGita(message) {
  const res = await fetch(`https://gitagpt.org/api/ask/gita?q=${encodeURIComponent(message)}&email=null&locale=en`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://gitagpt.org/', 'Origin': 'https://gitagpt.org' }
  });
  if (!res.ok) throw new Error(`GitaGPT error: ${res.status}`);
  const data = await res.json();
  if (!data.response) throw new Error('No response from GitaGPT');
  return { response: data.response, engine: 'GitaGPT', spiritual_guide: 'Lord Krishna / Gita AI' };
}

// 4. Unlimited AI
async function handleUnlimited(message) {
  const chatId = 'e6d80bed-6b42-4ea0-a5ac-01d4e9175ee1';
  const requestData = [{
    chatId,
    messages: [
      { id: crypto.randomUUID(), role: 'user', content: message, parts: [{ type: 'text', text: message }], createdAt: '$D' + new Date().toISOString() },
      { id: crypto.randomUUID(), role: 'assistant', content: '', parts: [{ type: 'text', text: '' }], createdAt: '$D' + new Date().toISOString() }
    ],
    selectedChatModel: 'chat-model-reasoning', selectedCharacter: null, selectedStory: null
  }];
  const res = await fetch(`https://app.unlimitedai.chat/chat/${chatId}`, {
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
  const text = await res.text();
  let responseText = '';
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('"diff"')) continue;
    try {
      const match = trimmed.match(/^(\d+):(.+)$/);
      if (match) { const d = JSON.parse(match[2]); if (d.diff?.[1]) responseText += d.diff[1]; }
    } catch { continue; }
  }
  return { response: responseText || 'Tidak ada respons', engine: 'Unlimited AI' };
}

// 5. Claude Sonnet (via DashX)
async function handleSonnet(message) {
  const url = `https://api.dashx.dpdns.org/api/AI/sonnet?text=${encodeURIComponent(message)}&key=${process.env.DHX_KEY || ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error('Gagal dari Sonnet API');
  return { response: data.data.result, engine: 'Claude Sonnet 4.6' };
}

// 6. Gemini Flash Lite (via proxy)
async function handleGeminiLite(message) {
  const res = await fetch('https://us-central1-infinite-chain-295909.cloudfunctions.net/gemini-proxy-staging-v1', {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site'
    },
    body: JSON.stringify({
      model: 'gemini-2.0-flash-lite',
      contents: [{ parts: [{ text: message }] }]
    }),
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`Gemini Lite error: ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || data?.candidates?.[0]?.content;
  if (!text) throw new Error('No response from Gemini');
  return { response: typeof text === 'string' ? text : JSON.stringify(text), engine: 'Gemini 2.0 Flash Lite' };
}

// 7. LuminAI
async function handleLuminai(message) {
  const result = await luminaiPost(message);
  return { response: result, engine: 'LuminAI' };
}

// 8. BlackboxAI
async function handleBlackbox(message) {
  const result = await luminaiPost(message, undefined, 'blackboxai');
  return { response: result, engine: 'BlackboxAI' };
}

// 9. Llama 3.3 70B (via deepinfra)
async function handleLlama(message) {
  const res = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Deepinfra-Source': 'web-page',
      'accept': 'text/event-stream',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://deepinfra.com/chat'
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond in the same language as the user.' },
        { role: 'user', content: message }
      ],
      stream: false
    }),
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`Llama error: ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from Llama');
  return { response: text, engine: 'Llama 3.3 70B' };
}

// 10. Mistral 7B
async function handleMistral(message) {
  const result = await luminaiPost(message, 'Mistral-(7B)-Instruct-v0.2', 'mistralai/Mistral-7B-Instruct-v0.2');
  return { response: result, engine: 'Mistral 7B Instruct' };
}

// 11. DeepSeek 67B
async function handleDeepseek(message) {
  const result = await luminaiPost(message, 'DeepSeek-LLM-Chat-(67B)', 'deepseek-ai/deepseek-llm-67b-chat');
  return { response: result, engine: 'DeepSeek LLM 67B' };
}

// 12. Qwen QwQ 32B
async function handleQwen(message) {
  const result = await luminaiPost(message, 'Qwen-QwQ-32B-Preview', 'Qwen/QwQ-32B-Preview');
  return { response: result, engine: 'Qwen QwQ 32B' };
}

// 13. Muslim AI
async function handleMuslimAI(message) {
  const searchRes = await fetch('https://www.muslimai.io/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://www.muslimai.io/'
    },
    body: JSON.stringify({ query: message }),
    signal: AbortSignal.timeout(30000)
  });
  const ayatData = await searchRes.json();
  const content = ayatData?.[0]?.content;
  if (!content) throw new Error('No data from MuslimAI search');

  const prompt = `Use the following passages to answer the query in Indonesian, ensuring clarity and understanding, as a world-class expert in the Quran. Do not mention that you were provided any passages in your answer: ${message}\n\n${content}`;
  const answerRes = await fetch('https://www.muslimai.io/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.muslimai.io/' },
    body: JSON.stringify({ prompt }),
    signal: AbortSignal.timeout(30000)
  });
  const jawaban = await answerRes.json();
  if (!jawaban) throw new Error('No answer from MuslimAI');
  return { response: typeof jawaban === 'string' ? jawaban : JSON.stringify(jawaban), engine: 'Muslim AI' };
}

// 14. Bible AI
async function handleBibleAI(message) {
  const res = await fetch(`https://api.bibleai.io/v1/chat?q=${encodeURIComponent(message)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://bibleai.io/' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`BibleAI error: ${res.status}`);
  const data = await res.json();
  const response = data?.response || data?.answer || data?.text || data?.result;
  if (!response) throw new Error('No response from BibleAI');
  return { response, engine: 'Bible AI' };
}

// ========== MAIN HANDLER ==========

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, model = 'pagaska' } = req.body || {};
  if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

  const handlers = {
    pagaska:    handlePagaska,
    gpt4:       handleGpt4,
    gita:       handleGita,
    unlimited:  handleUnlimited,
    sonnet:     handleSonnet,
    gemini:     handleGeminiLite,
    luminai:    handleLuminai,
    blackbox:   handleBlackbox,
    llama:      handleLlama,
    mistral:    handleMistral,
    deepseek:   handleDeepseek,
    qwen:       handleQwen,
    muslimai:   handleMuslimAI,
    bibleai:    handleBibleAI,
  };

  const handler_fn = handlers[model];
  if (!handler_fn) {
    return res.status(400).json({ success: false, error: `Model '${model}' tidak dikenal. Model tersedia: ${Object.keys(handlers).join(', ')}` });
  }

  try {
    const result = await handler_fn(message);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error(`[AI:${model}] Error:`, error.message);
    res.status(500).json({ success: false, error: error.message || 'AI sedang tidak dapat dihubungi' });
  }
};
