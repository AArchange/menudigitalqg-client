"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Connexion en cours...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        router.push('/admin');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Connexion Admin</h1>
          <p className="text-purple-200 mt-2">Accédez à votre tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-purple-200 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-300 transition-all duration-300 bg-white/20 text-white placeholder-purple-200" placeholder="votre@email.com" required />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-purple-200 mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-300 transition-all duration-300 bg-white/20 text-white placeholder-purple-200" placeholder="••••••••" required />
          </div>
          
          {message && <p className="text-red-300 text-center bg-red-500/30 p-3 rounded-lg">{message}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-pink-500 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2">
            {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>) : (<span>Se connecter</span>)}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-purple-200">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold text-white hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}