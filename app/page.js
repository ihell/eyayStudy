// app/page.js
import ChatInterface from '../components/ChatInterFace';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🤖 AI Study Buddy
          </h1>
          <p className="text-gray-600">Tutor AI 24/7 untuk pelajar Indonesia</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Selamat Datang di Masa Depan Belajar!
          </h2>
          <p className="text-gray-600 text-lg">
            Tanya apa saja tentang pelajaran sekolah - Matematika, Fisika, Bahasa, dll.
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">Personalized Learning</h3>
            <p className="text-gray-600">Materi disesuaikan dengan level kamu</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">📚</div>
            <h3 className="font-semibold mb-2">Multi-Subject</h3>
            <p className="text-gray-600">Semua pelajaran sekolah tersedia</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-2xl mb-4">🎮</div>
            <h3 className="font-semibold mb-2">Interactive Quiz</h3>
            <p className="text-gray-600">Latihan soal dengan instant feedback</p>
          </div>
        </div>
      </main>
    </div>
  );
}