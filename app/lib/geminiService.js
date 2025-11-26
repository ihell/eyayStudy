export const geminiService = {
  async generateTutorResponse(userMessage, conversationHistory = []) {
    try {
      console.log('🤖 Gemini Service called:', userMessage);
      
      const prompt = this.buildPrompt(userMessage, conversationHistory);
      const response = await this.callGeminiAPI(prompt);
      
      console.log('✅ Gemini Response:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  },

  buildPrompt(userMessage, conversationHistory) {
    const context = conversationHistory
      .slice(-4)
      .map(msg => `${msg.role === 'user' ? 'Siswa' : 'Tutor'}: ${msg.content}`)
      .join('\n');

    return `Anda adalah AI Tutor yang sabar dan ramah untuk pelajar Indonesia (SMP/SMA).

TUGAS:
1. Jawab pertanyaan dengan BAHASA INDONESIA sederhana
2. Berikan penjelasan singkat (maksimal 150 kata)
3. Gunakan contoh dari kehidupan sehari-hari
4. Tetap positif dan mendukung
5. Langsung ke inti jawaban

KONTEKS PERCAKAPAN SEBELUMNYA:
${context}

PERTANYAAN SISWA: ${userMessage}

JAWABAN TUTOR:`;
  },

  async callGeminiAPI(prompt) {
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    console.log('📡 Gemini API Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API Error Details:', errorData);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Gemini API Response:', data);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid Gemini response format');
    }
  },

  getFallbackResponse(question) {
    console.log('🔄 Using fallback response for:', question);
    
    const q = question.toLowerCase();
    
    // Smart fallback responses
    if (q.includes('newton')) {
      return `Hukum Newton Pertama (Hukum Inersia) 🌟

Benda akan mempertahankan keadaan geraknya:
• Benda diam tetap diam
• Benda bergerak tetap bergerak lurus beraturan

Kecuali ada gaya luar yang bekerja!

🎯 Contoh sehari-hari:
- Saat mobil berhenti mendadak, badan terdorong ke depan
- Gelas di atas kertas tetap diam ketika kertas ditarik cepat

💡 Filosofi: Benda punya sifat "malas" untuk berubah!`;
    }

    if (q.includes('fotosintesis')) {
      return `Fotosintesis 🌿 - Proses tanaman membuat makanan

🔬 Rumus: 
6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂

📌 Tahapan:
1. Daun ambil karbon dioksida (CO₂) dari udara
2. Akar ambil air (H₂O) dari tanah
3. Klorofil tangkap energi matahari
4. Hasilkan glukosa (makanan) + oksigen (O₂)

💡 Fakta keren: Tanaman menghasilkan oksigen yang kita hirup!`;
    }

    if (q.includes('pythagoras')) {
      return `Teorema Pythagoras 📐

a² + b² = c²

Dimana:
• c = sisi miring (terpanjang)
• a, b = sisi siku-siku

🔢 Contoh praktis:
Segitiga 3-4-5:
3² + 4² = 9 + 16 = 25
√25 = 5 → sisi miring

🎯 Gunakan untuk: Arsitektur, konstruksi, matematika!`;
    }

    if (q.includes('gravitasi')) {
      return `Gravitasi 🌍 - Gaya tarik misterius

• Bumi menarik semua benda ke pusatnya
• Mengapa apel jatuh? Gravitasi!
• Bulan mengelilingi Bumi karena gravitasi

📏 Rumus: F = G × (m₁ × m₂) / r²

💡 Penemu: Isaac Newton (legenda!)`;
    }

    if (q.includes('sel')) {
      return `Sel 🧬 - Unit terkecil kehidupan

🔬 Jenis sel:
• Sel Hewan: fleksibel, tidak ada dinding sel
• Sel Tumbuhan: kaku, ada dinding sel & kloroplas

📊 Organel penting:
- Nukleus: "otak" sel
- Mitokondria: "pembangkit listrik"
- Kloroplas: "pabrik makanan" (hanya di tumbuhan)

💡 Fakta: Tubuh manusia punya ~37 triliun sel!`;
    }

    // Default response
    return `Hai! Saya AI Tutor siap membantu! 📚

Untuk "${question}", mari belajar bersama:

🎯 **Konsep Inti:** [Pokok bahasan]
💡 **Contoh Nyata:** [Aplikasi praktis]  
📖 **Tips Belajar:** [Cara memahami]

Punya pertanyaan lain? Tanya saja! Saya di sini untuk membantu! 😊`;
  },

  async generateQuiz(subject, topic, difficulty = 'medium') {
    try {
      const prompt = `Buatkan 3 soal ${subject} tentang ${topic} untuk tingkat ${difficulty} (SMP/SMA).

FORMAT YANG DIINGINKAN:
1. [Pertanyaan jelas dan spesifik]
a) Opsi A
b) Opsi B
c) Opsi C
d) Opsi D
Jawaban: [huruf jawaban benar]

Hanya output soal dalam format di atas, tanpa penjelasan tambahan.`;

      const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Quiz API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid quiz response format');
      }

    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz(subject, topic);
    }
  },

  getFallbackQuiz(subject, topic) {
    return `Quiz ${subject} - ${topic} 📝

1. Apa pengertian dasar dari ${topic}?
a) Konsep fundamental A
b) Konsep fundamental B  
c) Konsep fundamental C
d) Konsep fundamental D
Jawaban: a

2. Manakah contoh penerapan ${topic} dalam kehidupan sehari-hari?
a) Contoh situasi A
b) Contoh situasi B
c) Contoh situasi C
d) Contoh situasi D
Jawaban: b

3. Mengapa mempelajari ${topic} penting?
a) Alasan penting A
b) Alasan penting B
c) Alasan penting C
d) Alasan penting D
Jawaban: c

💡 Tips: Gunakan fitur chat untuk penjelasan detail setiap soal!`;
  }
};