"use client";

import { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState('');
  const [logo, setLogo] = useState('');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const userInfoString = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (!userInfoString) { router.push('/login'); return {}; }
    const userInfo = JSON.parse(userInfoString);
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` };
  }, [router]);

  useEffect(() => {
    if (user) {
      setRestaurantName(user.restaurantName);
      // Pour charger les infos existantes, il faudrait une route GET /profile
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, { headers: getAuthHeaders() });
          if (!response.ok) throw new Error('Impossible de charger les données du profil.');
          const data = await response.json();
          setLogo(data.logo || '');
          setThemeColor(data.themeColor || '#4f46e5');
        } catch (error) {
          setMessage(`❌ Erreur: ${error.message}`);
        }
      };
      fetchProfile();
    }
  }, [user, getAuthHeaders]);

  const uploadLogoHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'menu_digital_preset'); // REMPLACE avec ton nom de preset
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dwaghs8g4/image/upload`, { // REMPLACE dwaghs8g4 par ton Cloud Name
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setLogo(data.secure_url);
        setMessage('✅ Logo téléversé avec succès !');
      } else { throw new Error(data.error.message); }
    } catch (error) {
      setMessage(`❌ Erreur d'upload : ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Mise à jour du profil...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantName, logo, themeColor }),
      });
      const data = await response.json();
      if (response.ok) {
        // Mettre à jour le localStorage avec les nouvelles infos
        localStorage.setItem('userInfo', JSON.stringify(data));
        setMessage('✅ Profil mis à jour avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessage(`❌ Erreur : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            &larr; Retour au Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
            Paramètres du Restaurant
          </h1>
          <p className="text-gray-600 mt-2">Personnalisez l&apos;apparence de votre menu public.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-md animate-fade-in ${
            message.includes('✅') ? 'bg-green-100 text-green-800 border-l-4 border-green-400' :
            message.includes('❌') ? 'bg-red-100 text-red-800 border-l-4 border-red-400' :
            'bg-blue-100 text-blue-800 border-l-4 border-blue-400'
          }`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl mx-auto">
            <div className="group">
              <label htmlFor="restaurantName" className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Nom du Restaurant</label>
              <input 
                type="text" 
                id="restaurantName" 
                value={restaurantName} 
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300" 
                required 
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🎨 Couleur du Thème</label>
              <div className="flex items-center space-x-4">
                <input 
                  type="color" 
                  id="themeColor" 
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-16 h-10 p-1 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <input 
                  type="text" 
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 font-mono"
                  placeholder="#4f46e5"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Cette couleur sera utilisée pour les titres et les boutons de votre menu public.</p>
            </div>

            <div className="group">
              <label htmlFor="logo-file" className="block text-sm font-semibold text-gray-700 mb-2">🖼️ Logo du Restaurant</label>
              {logo && (
                <div className="mb-4 p-4 border-2 border-dashed rounded-xl inline-block">
                  <Image src={logo} alt="Aperçu du logo" width={128} height={128} className="rounded-lg object-contain" />
                </div>
              )}
              <input 
                type="file" 
                id="logo-file"
                onChange={uploadLogoHandler}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              {uploading && <div className="mt-2 text-sm text-gray-500">Téléversement du logo...</div>}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading || uploading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Enregistrement...</span></>
                ) : (
                  <span>💾 Enregistrer les modifications</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}