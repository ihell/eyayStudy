// components/ChatInterface.jsx
'use client';
import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response (nanti kita ganti dengan AI real)
    setTimeout(() => {
      const aiMessage = { 
        role: 'assistant', 
        content: `Halo! Saya AI Tutor Anda. Anda bertanya: "${input}". Bagaimana saya bisa membantu pembelajaran Anda hari ini?` 
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg bg-white">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tanya apa saja ke AI Tutor..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}