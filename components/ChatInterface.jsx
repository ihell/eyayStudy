'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { chatService } from '@/lib/chatService';

export default function ChatInterface() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? session?.user?.email ?? null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const aiTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = chatService.subscribeToMessages(
      userId,
      (firebaseMessages) => {
        const formattedMessages = firebaseMessages.map((msg) => {
          let ts = msg.timestamp;
          // if firebase timestamp-like object
          if (ts && typeof ts.toDate === 'function') ts = ts.toDate();
          // fallback if already a number
          if (typeof ts === 'number') ts = new Date(ts);
          return {
            id: msg.id ?? `${msg.role}-${msg.timestamp ?? Math.random()}`,
            role: msg.role,
            content: msg.message,
            timestamp: ts ?? null,
          };
        });
        setMessages(formattedMessages);
      }
    );

    return () => {
      // cleanup unsubscribe if function
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userId]);

  // auto scroll to bottom when messages change
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      // clear pending timeout on unmount
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  const sendMessage = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!input.trim() || !userId) return;

    setLoading(true);
    const text = input.trim();
    setInput('');

    try {
      await chatService.sendMessage(userId, text, 'user');

      aiTimeoutRef.current = setTimeout(async () => {
        const aiResponse = `Halo! Saya AI Tutor Anda. Anda bertanya: "${text}". 
        
Saya bisa membantu Anda dengan:
• Matematika (aljabar, geometri, kalkulus)
• Fisika (mekanika, listrik, termodinamika)  
• Kimia (stoikiometri, reaksi kimia)
• Bahasa Indonesia & Inggris
• Sejarah & Geografi

Mata pelajaran apa yang ingin Anda pelajari?`;

        try {
          await chatService.saveAIResponse(userId, aiResponse);
        } catch (err) {
          console.error('Error saving AI response:', err);
        } finally {
          setLoading(false);
        }
      }, 1200);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      <div ref={containerRef} className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">👋</div>
            <p>Halo! Saya AI Tutor Anda. Tanya apa saja tentang pelajaran sekolah!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        {!session ? (
          <div className="text-center text-gray-500">Silakan login untuk chat dengan AI Tutor</div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
              placeholder="Tanya tentang pelajaran sekolah..."
              className="flex-1 p-2 border rounded-lg"
              disabled={loading}
              aria-label="Pesan"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '...' : 'Kirim'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}