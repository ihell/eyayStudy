// components/QuizGenerator.jsx - NO AUTH
'use client';
import { useState } from 'react';
import { aiService } from '../app/lib/aiService';

export default function QuizGenerator() {
  const [subject, setSubject] = useState('matematika');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quiz, setQuiz] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    
    setGenerating(true);
    try {
      const generatedQuiz = await aiService.generateQuiz(subject, topic, difficulty);
      setQuiz(generatedQuiz);
    } catch (error) {
      console.error('Quiz generation error:', error);
      setQuiz(`Quiz ${subject} - ${topic}:\n\n1. [Contoh] Apa yang dimaksud dengan ${topic}?\na) Opsi A\nb) Opsi B\nc) Opsi C\nd) Opsi D\nJawaban: a\n\n💡 Tips: Coba gunakan fitur chat AI di atas untuk penjelasan lebih detail!`);
    }
    setGenerating(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🎯</span> Generator Quiz Otomatis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="matematika">Matematika</option>
            <option value="fisika">Fisika</option>
            <option value="kimia">Kimia</option>
            <option value="biologi">Biologi</option>
            <option value="bahasa indonesia">Bahasa Indonesia</option>
            <option value="bahasa inggris">Bahasa Inggris</option>
            <option value="sejarah">Sejarah</option>
            <option value="geografi">Geografi</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Topik Spesifik</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="contoh: persamaan kuadrat, fotosintesis..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tingkat Kesulitan</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={generateQuiz}
        disabled={generating || !topic.trim()}
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed w-full mb-4 transition-colors font-semibold"
      >
        {generating ? '🔄 Generating Quiz...' : '🚀 Generate Quiz'}
      </button>
      
      {quiz && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-3 text-blue-600">📝 Quiz Generated:</h4>
          <div className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
            {quiz}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 Gunakan fitur chat di atas untuk penjelasan jawaban!
          </div>
        </div>
      )}
    </div>
  );
}