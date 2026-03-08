const axios = require('axios');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, characterId = "6472508d-5763-415d-8d8e-db48c7fbd05a", conversationId = null } = req.body;
  
  try {
    const response = await axios.post('https://prod.nd-api.com/chat', {
      conversation_id: conversationId,
      character_id: characterId,
      language: "id",
      inference_model: "default",
      inference_settings: {
        max_new_tokens: 180,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 90
      },
      autopilot: false,
      continue_chat: false,
      message: message
    }, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Guest-UserId': crypto.randomUUID(),
        'X-App-Id': 'pixelchat'
      },
      timeout: 30000
    });
    
    res.status(200).json({
      success: true,
      message: response.data.message,
      engine: response.data.engine,
      conversation_id: response.data.conversation_id
    });
  } catch (error) {
    console.error('Pixel Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
