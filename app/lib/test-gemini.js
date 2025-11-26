// lib/test-gemini.js
export async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  
  try {
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
      return { success: false, error: 'API key not configured' };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Halo! Jelaskan hukum newton pertama dalam 1 kalimat.'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100
        }
      })
    });

    console.log('📊 Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: `API Error: ${response.status}`, details: errorData };
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    return { 
      success: true, 
      response: data.candidates[0].content.parts[0].text 
    };
    
  } catch (error) {
    console.error('💥 Fetch Error:', error);
    return { success: false, error: error.message };
  }
}