'use client';
import { useState, useEffect } from 'react';
import { chatService } from '../app/lib/chatService';
import { aiService } from '../app/lib/aiService';

// Fixed demo user ID
const DEMO_USER_ID = 'demo-user-123';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔗 Connecting to chat service...');
    const unsubscribe = chatService.subscribeToMessages(DEMO_USER_ID, (newMessages) => {
      console.log('📨 New messages:', newMessages);
      setMessages(newMessages);
    });

    return () => {
      try { unsubscribe && unsubscribe(); } catch (_) {}
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    
    try {
      console.log('👤 User message:', input);
      
      // Save user message
      await chatService.sendMessage(DEMO_USER_ID, input, 'user');
      
      // Get AI response
      console.log('🤖 Calling AI service...');
      const aiResponse = await aiService.generateTutorResponse(input, messages);
      console.log('✅ AI Response:', aiResponse);
      
      // Save AI response
      await chatService.saveAIResponse(DEMO_USER_ID, aiResponse);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // Fallback response
      const fallbackResponse = `Hai! Untuk pertanyaan "${input}", saya AI Tutor siap membantu! 
      
Sementara sistem sedang optimalisasi, Anda bisa:
1. 📚 Buka buku pelajaran terkait
2. 🎥 Cari video pembelajaran di YouTube
3. 👥 Diskusi dengan guru atau teman

Atau coba tanya lagi dalam beberapa menit! 😊`;
      
      try { await chatService.saveAIResponse(DEMO_USER_ID, fallbackResponse); } catch (_) {}
    }

    setLoading(false);
    setInput('');
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white shadow-sm">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-lg font-semibold mb-2">AI Study Buddy</p>
            <p className="text-sm">Tutor AI 24/7 untuk pelajar Indonesia</p>
            <div className="mt-4 text-xs text-gray-400">
              Contoh: "Jelaskan hukum Newton pertama" atau "Apa itu fotosintesis?"
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800 border'
              }`}>
                <div className="whitespace-pre-wrap">{msg.message ?? msg.content ?? ''}</div>
                <div className="text-xs mt-1 opacity-70">
                  {msg.role === 'user' ? 'Anda' : 'AI Tutor'}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-100 border">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">AI Tutor sedang menulis jawaban...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ketik pertanyaan tentang pelajaran sekolah..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold min-w-20"
          >
            {loading ? '...' : 'Tanya'}
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          💡 Gratis • No Login Required • AI Powered
        </div>
      </div>
    </div>
  );
}