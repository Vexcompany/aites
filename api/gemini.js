const GEMINI_API_URL = "https://aliyun.zaiwen.top/message_gemini";

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, model = 'gemini-pro' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Validasi model
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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PagaskaAI/1.0",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiReply = await response.text();
    
    if (!aiReply) {
      throw new Error('No response from Gemini API');
    }

    res.status(200).json({
      success: true,
      response: aiReply,
      model: selectedModel,
      engine: 'Gemini'
    });
    
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get response from Gemini'
    });
  }
};