import { retryWithBackoff } from './utils';
import { cacheService } from './cache';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  console.warn('DEEPSEEK_API_KEY not set. AI calls will fallback to local responses.');
}

const fetchWithTimeout = async (url, opts = {}, ms = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

export const aiService = {
  async generateTutorResponse(userMessage, conversationHistory = []) {
    // cache
    try {
      const key = cacheService.generateKey(userMessage);
      const cached = cacheService.get(key);
      if (cached) return cached;
    } catch (_) {}

    // prefer server-side only
    if (!API_KEY) {
      return this.getLocalResponse(userMessage);
    }

    const systemPrompt = `Anda adalah tutor AI untuk pelajar Indonesia. Jawab dengan bahasa Indonesia sederhana, jelas, beri contoh singkat, maksimal 150 kata. Langsung ke inti.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.filter(Boolean).slice(-3).map(m => ({ role: m.role, content: m.content || m.message || '' })),
      { role: 'user', content: userMessage }
    ];

    try {
      const call = async () => {
        const res = await fetchWithTimeout(DEEPSEEK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            max_tokens: 300,
            temperature: 0.7,
            stream: false
          })
        }, 10000);

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`DeepSeek ${res.status}: ${text}`);
        }

        const data = await res.json().catch(() => null);
        // normalize possible shapes
        let aiText = null;
        if (!data) throw new Error('Empty response');
        if (data.choices?.[0]?.message?.content) aiText = data.choices[0].message.content;
        else if (data.choices?.[0]?.text) aiText = data.choices[0].text;
        else if (typeof data.text === 'string') aiText = data.text;

        if (!aiText) throw new Error('Unexpected response format');

        return aiText;
      };

      const aiResponse = await retryWithBackoff(call, { retries: 3, factor: 1.5, minDelay: 500 });

      // cache best-effort
      try {
        const key = cacheService.generateKey(userMessage);
        cacheService.set(key, aiResponse);
      } catch (e) {
        console.warn('cache set failed', e.message);
      }

      return aiResponse;
    } catch (err) {
      console.error('AI call failed:', err.message || err);
      return this.getLocalResponse(userMessage);
    }
  },

  getLocalResponse(question = '') {
    const q = (question || '').toLowerCase();
    if (q.includes('newton')) {
      return `Hukum Newton Pertama (Inersia): benda mempertahankan keadaan geraknya kecuali ada gaya luar. Contoh: saat mobil berhenti mendadak, badan terdorong ke depan.`;
    }
    if (q.includes('fotosintesis')) {
      return `Fotosintesis: tanaman ubah CO₂ + H₂O + cahaya → glukosa + O₂. Daun + klorofil + sinar matahari menghasilkan makanan.`;
    }
    // generic
    return `Hai! Saya AI Tutor. Untuk "${question}" — jelaskan topik spesifik agar saya bisa bantu lebih tepat.`;
  },

  async generateQuiz(subject, topic, difficulty = 'medium') {
    try {
      const prompt = `Buatkan 3 soal ${subject} tentang ${topic} untuk tingkat ${difficulty} (SMP/SMA).

FORMAT YANG DIINGINKAN:
1. [Pertanyaan jelas]
a) Opsi A
b) Opsi B
c) Opsi C  
d) Opsi D
Jawaban: [huruf jawaban benar]

Hanya output soal dalam format di atas, tanpa penjelasan tambahan.`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackQuiz(subject, topic);

    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz(subject, topic);
    }
  },

  getFallbackQuiz(subject, topic) {
    return `Soal ${subject} - ${topic}:

1. Apa yang dimaksud dengan ${topic}?
a) Konsep A
b) Konsep B  
c) Konsep C
d) Konsep D
Jawaban: a

2. Contoh penerapan ${topic} dalam kehidupan sehari-hari?
a) Situasi A
b) Situasi B
c) Situasi C
d) Situasi D
Jawaban: b

3. Manfaat mempelajari ${topic}?
a) Manfaat A
b) Manfaat B
c) Manfaat C  
d) Manfaat D
Jawaban: c`;
  }
};