"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function MenuPage() {
  const params = useParams();
  const [dishes, setDishes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const restaurantName = params.slug 
    ? params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Menu';

  const getCategoryIcon = (category) => {
    const icons = { 'Plat de résistance': '🍽️', 'Entrée': '🥗', 'Dessert': '🍰', 'Boisson': '🥤' };
    return icons[category] || '🍽️';
  };

  const getCategoryGradient = (category) => {
    const gradients = { 'Plat de résistance': 'from-orange-500 to-red-500', 'Entrée': 'from-green-500 to-emerald-500', 'Dessert': 'from-pink-500 to-rose-500', 'Boisson': 'from-blue-500 to-cyan-500' };
    return gradients[category] || 'from-gray-500 to-slate-500';
  };

  const getCategoryBg = (category) => {
    const backgrounds = { 'Plat de résistance': 'from-orange-50 to-red-50', 'Entrée': 'from-green-50 to-emerald-50', 'Dessert': 'from-pink-50 to-rose-50', 'Boisson': 'from-blue-50 to-cyan-50' };
    return backgrounds[category] || 'from-gray-50 to-slate-50';
  };

  useEffect(() => {
    const fetchDishes = async () => {
      if (!params.slug) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dishes/menu/${params.slug}`);
        
        if (!response.ok) {
          throw new Error('Ce restaurant n\'a pas été trouvé ou son menu n\'est pas disponible.');
        }
        const data = await response.json();

        const grouped = data.reduce((acc, dish) => {
          const category = dish.category;
          if (!acc[category]) { acc[category] = []; }
          acc[category].push(dish);
          return acc;
        }, {});
        
        setDishes(grouped);
        if (Object.keys(grouped).length > 0) {
          setSelectedCategory(Object.keys(grouped)[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative"><div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div><div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-pink-600 rounded-full animate-spin animate-reverse mx-auto"></div></div>
          <h2 className="text-2xl font-bold text-white mb-2">Préparation du menu...</h2>
          <p className="text-purple-200 animate-pulse">Nos chefs préparent votre expérience culinaire</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oups ! Menu non trouvé</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <a href="/" className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">🏠 Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div><div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div></div>

      <header className="relative z-10 bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-6 py-8"><div className="text-center"><div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 shadow-lg"><span className="text-2xl">🍴</span></div><h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 tracking-tight">{restaurantName}</h1><div className="flex items-center justify-center space-x-2 mb-4"><div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div><p className="text-gray-300 text-lg font-medium">Menu Gastronomique</p><div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-500"></div></div><div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto"></div></div></div>
      </header>

      {Object.keys(dishes).length > 0 && (
        <nav className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/5 sticky top-0">
          <div className="container mx-auto px-4 py-4"><div className="flex flex-wrap justify-center gap-2">{Object.keys(dishes).map((category) => (<button key={category} onClick={() => setSelectedCategory(category)} className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${selectedCategory === category ? `bg-gradient-to-r ${getCategoryGradient(category)} text-white shadow-lg` : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'}`}><span className="text-xl">{getCategoryIcon(category)}</span><span>{category}</span><span className="bg-white/20 px-2 py-1 rounded-full text-xs">{dishes[category].length}</span></button>))}</div></div>
        </nav>
      )}

      <main className="relative z-10 container mx-auto p-4 md:p-8 pb-20">
        {Object.keys(dishes).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(dishes).filter(([category]) => !selectedCategory || category === selectedCategory).map(([category, items]) => (
              <section key={category} className="space-y-6">
                <div className="text-center mb-8"><div className={`inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${getCategoryBg(category)} rounded-2xl shadow-xl border border-white/20`}><span className="text-4xl">{getCategoryIcon(category)}</span><h2 className={`text-3xl font-bold bg-gradient-to-r ${getCategoryGradient(category)} bg-clip-text text-transparent`}>{category}</h2></div></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((dish, index) => (
                    <div key={dish._id} className={`group bg-gradient-to-br ${getCategoryBg(category)} backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 ${!dish.isAvailable ? 'opacity-40 saturate-50' : ''}`} style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex items-start justify-between mb-4"><div className="flex-1"><div className="flex items-center space-x-2 mb-2"><div className={`w-3 h-3 bg-gradient-to-r ${getCategoryGradient(category)} rounded-full`}></div><h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{dish.name}</h3></div>{dish.description && (<p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors">{dish.description}</p>)}</div></div>
                      <div className="flex items-center justify-between">
                        <div className={`px-4 py-2 bg-gradient-to-r ${getCategoryGradient(category)} text-white rounded-xl shadow-lg`}><span className="text-2xl font-bold">{dish.price}</span><span className="text-sm ml-1">FCFA</span></div>
                        {!dish.isAvailable && (<div className="px-3 py-1 bg-red-600/80 backdrop-blur-sm border border-white/20 text-white rounded-lg text-sm font-semibold">Épuisé</div>)}
                        <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{getCategoryIcon(category)}</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-3xl"></div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (<div className="text-center py-20"><div className="text-8xl mb-6 animate-bounce">🍽️</div><h2 className="text-3xl font-bold text-white mb-4">Menu en préparation</h2><p className="text-gray-400 text-lg">Ce restaurant n'a pas encore publié son menu.</p></div>)}
      </main>
      
      <footer className="relative z-10 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-xl border-t border-white/10"><div className="container mx-auto px-6 py-8"><div className="text-center"><div className="flex items-center justify-center space-x-2 mb-4"><div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div><p className="text-gray-300 font-medium">Menu propulsé par</p><div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-500"></div></div><div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MenuDigitalQG</div><p className="text-gray-500 text-sm mt-2">L'avenir de la restauration digitale</p></div></div></footer>

      <style jsx>{` @keyframes reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } .animate-reverse { animation: reverse 1s linear infinite; } .animation-delay-500 { animation-delay: 0.5s; } .backdrop-blur-xl { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }`}</style>
    </div>
  );
}