const axios = require('axios');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, mode = "flash" } = req.body;
  
  try {
    // Get nonce
    const nonceRes = await axios.get('https://chat-deep.ai', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const nonceMatch = nonceRes.data.match(/"nonce":"([a-f0-9]+)"/);
    if (!nonceMatch) throw new Error('NONCE_NOT_FOUND');
    
    const payload = new URLSearchParams({
      action: 'deepseek_chat',
      message: message,
      model: mode === "think" ? "deepseek-chat" : "deepseek-reasoner",
      nonce: nonceMatch[1],
      save_conversation: '0',
      session_only: '1'
    });

    const response = await axios.post('https://chat-deep.ai/wp-admin/admin-ajax.php', payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://chat-deep.ai',
        'Referer': 'https://chat-deep.ai/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000
    });

    const rawContent = response.data?.data?.response || response.data?.response || "";
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
    
    res.status(200).json({
      success: true,
      think: mode === "think" ? (thinkMatch ? thinkMatch[1].trim() : null) : null,
      response: rawContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim()
    });
    
  } catch (error) {
    console.error('DeepSeek Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
