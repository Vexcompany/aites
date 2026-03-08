import axios from 'axios';
import { handleCors } from './_utils/cors.js';

export default async function handler(req, res) {
  handleCors(res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, mode = "flash" } = req.body;
  
  const BASE_URL = 'https://chat-deep.ai';
  const ENDPOINT = 'https://chat-deep.ai/wp-admin/admin-ajax.php';

  try {
    // Fetch nonce
    const nonceRes = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const nonceMatch = nonceRes.data.match(/"nonce":"([a-f0-9]+)"/);
    if (!nonceMatch) throw new Error('NONCE_NOT_FOUND');
    const nonce = nonceMatch[1];

    const model = mode === "think" ? "deepseek-chat" : "deepseek-reasoner";
    
    const payload = new URLSearchParams({
      action: 'deepseek_chat',
      message: message,
      model: model,
      nonce: nonce,
      save_conversation: '0',
      session_only: '1'
    });

    const response = await axios.post(ENDPOINT, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000
    });

    const rawContent = response.data?.data?.response || response.data?.response || "";
    
    // Parse thinking process
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
    const think = thinkMatch ? thinkMatch[1].trim() : null;
    const cleanResponse = rawContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();

    res.status(200).json({
      success: true,
      think: mode === "think" ? think : null,
      response: cleanResponse,
      raw: rawContent
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}