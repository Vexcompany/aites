import axios from 'axios';
import { handleCors } from './_utils/cors.js';

export default async function handler(req, res) {
  handleCors(res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, characterId = "6472508d-5763-415d-8d8e-db48c7fbd05a", conversationId = null } = req.body;
  
  const url = 'https://prod.nd-api.com/chat';
  
  const requestData = {
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
  };

  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Guest-UserId': crypto.randomUUID(),
    'X-App-Id': 'pixelchat'
  };

  try {
    const response = await axios.post(url, requestData, { headers, timeout: 30000 });
    
    res.status(200).json({
      success: true,
      message: response.data.message,
      engine: response.data.engine,
      conversation_id: response.data.conversation_id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}