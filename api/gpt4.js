module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, userId = 'anonymous' } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const d = new Date();
    const jam = d.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta" });
    const hari = d.toLocaleDateString('id', { weekday: 'long' });
    const tgl = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' });

    const logic = `You are AgungDevX AI, a helpful assistant. Current date: ${tgl}, time: ${jam}, day: ${hari}. Respond in the same language as the user's query.`;

    const response = await fetch("https://chateverywhere.app/api/chat/", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        model: {
          id: "gpt-4",
          name: "GPT-4",
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: "gpt-4"
        },
        messages: [{ role: "user", content: message }],
        prompt: logic,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    const data = await response.text();

    if (!data) {
      throw new Error('Empty response from GPT-4');
    }

    res.status(200).json({
      success: true,
      response: data,
      engine: 'GPT-4',
      model: 'gpt-4',
      metadata: { date: tgl, time: jam }
    });
    
  } catch (error) {
    console.error('GPT-4 Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get response from GPT-4'
    });
  }
};
