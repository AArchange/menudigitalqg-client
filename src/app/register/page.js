"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [restaurantName, setRestaurantName] = useState('');
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
    setMessage('Création du compte...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, email, password }),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Rejoignez-nous</h1>
          <p className="text-teal-200 mt-2">Créez le menu digital de votre restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-teal-200 mb-2">Nom du Restaurant</label>
            <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-300 transition-all duration-300 bg-white/20 text-white placeholder-teal-200" placeholder="Ex: Le Bon Goût" required />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-teal-200 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-300 transition-all duration-300 bg-white/20 text-white placeholder-teal-200" placeholder="votre@email.com" required />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-teal-200 mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-white/30 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-300 transition-all duration-300 bg-white/20 text-white placeholder-teal-200" placeholder="••••••••" required />
          </div>
          
          {message && <p className="text-red-300 text-center bg-red-500/30 p-3 rounded-lg">{message}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-teal-500 to-green-600 hover:from-green-500 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2">
            {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>) : (<span>Créer mon compte</span>)}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-teal-200">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}