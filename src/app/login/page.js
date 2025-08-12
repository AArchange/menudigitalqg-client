"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion à votre Dashboard</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-gray-700">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          {message && <p className="text-red-500 text-center">{message}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Se connecter</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Pas encore de compte ? <Link href="/register" className="text-blue-500 hover:underline">Inscrivez-vous</Link>
        </p>
      </div>
    </div>
  );
}