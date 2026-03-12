module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const GITA_API_URL = 'https://gitagpt.org/api/ask/gita';
    
    const response = await fetch(`${GITA_API_URL}?q=${encodeURIComponent(message)}&email=null&locale=en`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://gitagpt.org/',
        'Origin': 'https://gitagpt.org'
      }
    });

    if (!response.ok) {
      throw new Error(`GitaGPT API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.response) {
      throw new Error('No response from GitaGPT');
    }

    res.status(200).json({
      success: true,
      response: data.response,
      question: data.question,
      id: data.id,
      engine: 'GitaGPT',
      spiritual_guide: 'Lord Krishna / Gita AI'
    });
    
  } catch (error) {
    console.error('GitaGPT Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get response from GitaGPT'
    });
  }
};
