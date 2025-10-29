// components/AuthButton.jsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <img 
          src={session.user.image} 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
        <span className="text-gray-700">Halo, {session.user.name}!</span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Login dengan Google
    </button>
  );
}