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

    console.log('Gemini request:', { model: selectedModel, message: message.substring(0, 50) });

    // Gunakan native fetch dengan timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25 detik timeout

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "PagaskaAI/1.0",
          "Accept": "application/json, text/plain, */*"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('Gemini response status:', response.status);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      // Baca sebagai text dulu (bukan langsung json)
      const responseText = await response.text();
      console.log('Raw response length:', responseText.length);
      console.log('Raw response preview:', responseText.substring(0, 200));

      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from API');
      }

      // Coba parse sebagai JSON, kalau gagal gunakan sebagai plain text
      let aiReply;
      try {
        const jsonData = JSON.parse(responseText);
        // Kalau JSON, ekstrak content
        aiReply = jsonData.content || jsonData.message || jsonData.response || jsonData.text || JSON.stringify(jsonData);
      } catch (e) {
        // Bukan JSON, gunakan sebagai plain text
        aiReply = responseText;
      }

      // Bersihkan response
      aiReply = aiReply.trim();

      if (!aiReply) {
        throw new Error('No valid response content');
      }

      res.status(200).json({
        success: true,
        response: aiReply,
        model: selectedModel,
        engine: 'Gemini'
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - API took too long to respond');
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get response from Gemini',
      details: error.stack
    });
  }
};
