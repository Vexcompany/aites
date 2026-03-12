const axios = require('axios');

const GEMINI_API_URL = "https://aliyun.zaiwen.top/message_gemini";

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, model = 'gemini-pro' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const validModels = ['gemini-pro', 'gemini-1.5', 'gemini-flash'];
    const selectedModel = validModels.includes(model) ? model : 'gemini-pro';

    const payload = {
      model: selectedModel,
      message: [
        {
          role: "system",
          content: `You are an AI assistant who can help users, your name is ${selectedModel}. Created by Pagaska AI`
        },
        {
          role: "user",
          content: message
        }
      ]
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PagaskaAI/1.0",
        "Accept": "application/json, text/plain, */*"
      },
      timeout: 25000, // 25 detik
      responseType: 'text' // Terima sebagai text
    });

    let aiReply = response.data;
    
    // Kalau response adalah object, convert ke string
    if (typeof aiReply === 'object') {
      aiReply = aiReply.content || aiReply.message || aiReply.response || aiReply.text || JSON.stringify(aiReply);
    }

    aiReply = String(aiReply).trim();

    if (!aiReply) {
      throw new Error('Empty response');
    }

    res.status(200).json({
      success: true,
      response: aiReply,
      model: selectedModel,
      engine: 'Gemini'
    });
    
  } catch (error) {
    console.error('Gemini Error:', error.message);
    
    let errorMsg = 'Failed to get response';
    if (error.code === 'ECONNABORTED') {
      errorMsg = 'Request timeout - API took too long';
    } else if (error.response) {
      errorMsg = `API Error: ${error.response.status}`;
    } else if (error.request) {
      errorMsg = 'No response from API';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMsg,
      details: error.message
    });
  }
};
