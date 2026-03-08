import axios from 'axios';
import { handleCors } from './_utils/cors.js';

export default async function handler(req, res) {
  handleCors(res);
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, chatId = "e6d80bed-6b42-4ea0-a5ac-01d4e9175ee1" } = req.body;
  
  const url = `https://app.unlimitedai.chat/chat/${chatId}`;
  
  const requestData = [{
    chatId: chatId,
    messages: [{
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      parts: [{ type: "text", text: message }],
      createdAt: "$D" + new Date().toISOString()
    }, {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      parts: [{ type: "text", text: "" }],
      createdAt: "$D" + new Date().toISOString()
    }],
    selectedChatModel: "chat-model-reasoning",
    selectedCharacter: null,
    selectedStory: null
  }];

  const headers = {
    'Accept': 'text/x-component',
    'Next-Action': '40713570958bf1accf30e8d3ddb17e7948e6c379fa',
    'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
    'Content-Type': 'application/json',
    'Origin': 'https://app.unlimitedai.chat',
    'Referer': `https://app.unlimitedai.chat/chat/${chatId}`
  };

  try {
    const response = await axios.post(url, requestData, { 
      headers,
      timeout: 30000,
      responseType: 'text' // Penting: ambil sebagai text, bukan json
    });
    
    // Parse NDJSON (newline delimited JSON)
    let responseText = '';
    const lines = response.data.toString().split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Cari line yang mengandung "diff"
      if (trimmed.includes('"diff"')) {
        try {
          // Extract JSON dari line (format: 1:{"diff":[0,"text"]})
          const jsonMatch = trimmed.match(/\d+:(.+)/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            if (data.diff && Array.isArray(data.diff) && data.diff[1]) {
              responseText += data.diff[1];
            }
          }
        } catch (e) {
          console.log('Parse line error:', e.message, 'Line:', trimmed.substring(0, 100));
          continue;
        }
      }
    }
    
    if (!responseText) {
      // Fallback: coba cari pattern lain
      console.log('Full response preview:', response.data.substring(0, 500));
      throw new Error('Tidak dapat mengekstrak respons dari AI');
    }
    
    res.status(200).json({ success: true, response: responseText });
    
  } catch (error) {
    console.error('Unlimited AI Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data preview:', error.response.data?.toString().substring(0, 500));
    }
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data?.toString().substring(0, 200)
    });
  }
}
