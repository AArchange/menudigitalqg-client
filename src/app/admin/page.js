"use client";

import { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import QRCodeModal from '@/components/QRCodeModal';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Dit à Next.js de ne pas pré-générer cette page

function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Plat de résistance');
  const [message, setMessage] = useState('');
  const [dishes, setDishes] = useState([]);
  const [editingDishId, setEditingDishId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const userInfoString = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (!userInfoString) {
      router.push('/login');
      return {};
    }
    const userInfo = JSON.parse(userInfoString);
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo.token}`,
    };
  }, [router]);

  const fetchDishes = useCallback(async () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('userInfo')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dishes`, { headers: getAuthHeaders() });
      if (response.status === 401) {
        localStorage.removeItem('userInfo');
        router.push('/login');
        throw new Error('Session expirée, veuillez vous reconnecter.');
      }
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des plats.');
      }
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    if (user) {
      fetchDishes();
    }
  }, [user, fetchDishes]);
  
  const resetForm = () => { setName(''); setDescription(''); setPrice(''); setCategory('Plat de résistance'); setEditingDishId(null); setMessage(''); };
  
  const handleEdit = (dish) => { setEditingDishId(dish._id); setName(dish.name); setDescription(dish.description); setPrice(dish.price); setCategory(dish.category); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const handleLogout = () => { localStorage.removeItem('userInfo'); router.push('/login'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dishData = { name, description, price: Number(price), category };
    const url = editingDishId ? `${process.env.NEXT_PUBLIC_API_URL}/api/dishes/${editingDishId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/dishes`;
    const method = editingDishId ? 'PUT' : 'POST';
    setMessage(editingDishId ? 'Mise à jour...' : 'Ajout...');
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(dishData) });
      const result = await response.json();
      if (response.ok) { setMessage(`✅ Plat "${result.name}" ${editingDishId ? 'mis à jour' : 'ajouté'} !`); resetForm(); fetchDishes(); setTimeout(() => setMessage(''), 3000); } 
      else { throw new Error(result.message); }
    } catch (error) { setMessage(`❌ Erreur : ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async (dishId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dishes/${dishId}`, { method: 'DELETE', headers: getAuthHeaders() });
        const data = await response.json();
        if (response.ok) { setMessage(`✅ ${data.message}`); fetchDishes(); setTimeout(() => setMessage(''), 3000); } 
        else { throw new Error(data.message); }
      } catch (error) { setMessage(`❌ Erreur : ${error.message}`); }
    }
  };

  const handleToggleAvailable = async (dishId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dishes/${dishId}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
      if (response.ok) { fetchDishes(); } else { throw new Error('Erreur de statut'); }
    } catch (error) { setMessage(`❌ Erreur : ${error.message}`); }
  };
  
  const getCategoryIcon = (category) => {
    const icons = { 'Plat de résistance': '🍽️', 'Entrée': '🥗', 'Dessert': '🍰', 'Boisson': '🥤' };
    return icons[category] || '🍽️';
  };

  const getCategoryColor = (category) => {
    const colors = { 'Plat de résistance': 'bg-orange-100 text-orange-800', 'Entrée': 'bg-green-100 text-green-800', 'Dessert': 'bg-pink-100 text-pink-800', 'Boisson': 'bg-blue-100 text-blue-800' };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  const menuUrl = user ? (typeof window !== 'undefined' ? `${window.location.origin}/menu/${user.restaurantSlug}` : '') : '';

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && <QRCodeModal url={menuUrl} onClose={() => setIsModalOpen(false)} />}
      <style jsx global>{`
        .dot { transform: translateX(0); transition: transform 0.3s ease-in-out; }
        input:checked ~ .dot { transform: translateX(calc(100% - 2px)); }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {user.restaurantName}
              </h1>
              <p className="text-gray-600 mt-2">Gérez votre menu en toute simplicité</p>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group bg-gradient-to-r from-gray-700 to-black hover:from-black hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span className="text-2xl group-hover:animate-pulse">📱</span>
                  <span>Voir mon QR Code</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Déconnexion
                </button>
            </div>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 sticky top-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-gray-800">{editingDishId ? '✏️ Modifier le plat' : '➕ Nouveau plat'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group"><label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">🏷️ Nom du plat</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/70 backdrop-blur-sm" placeholder="Ex: Poulet braisé aux légumes" required /></div>
                  <div className="group"><label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">📝 Description</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/70 backdrop-blur-sm min-h-[100px] resize-none" placeholder="Décrivez votre plat délicieux..."/></div>
                  <div className="group"><label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">💰 Prix (FCFA)</label><input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/70 backdrop-blur-sm" placeholder="2500" required /></div>
                  <div className="group"><label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">🗂️ Catégorie</label><select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 bg-white/70 backdrop-blur-sm"><option value="Plat de résistance">🍽️ Plat de résistance</option><option value="Entrée">🥗 Entrée</option><option value="Dessert">🍰 Dessert</option><option value="Boisson">🥤 Boisson</option></select></div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                    <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2">{isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Traitement...</span></>) : (<><span>{editingDishId ? '📝' : '➕'}</span><span>{editingDishId ? 'Mettre à jour' : 'Ajouter le plat'}</span></>)}</button>
                    {editingDishId && (<button type="button" onClick={resetForm} className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"><span>❌</span><span>Annuler</span></button>)}
                  </div>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6"><div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div><h2 className="text-3xl font-bold text-gray-800">📋 Menu Actuel</h2><div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">{dishes.length} plat{dishes.length > 1 ? 's' : ''}</div></div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                {dishes.length > 0 ? (
                  <div className="space-y-4">
                    {dishes.map((dish, index) => (
                      <div key={dish._id} className={`group bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm border-2 border-gray-100 hover:border-indigo-200 rounded-xl p-6 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${!dish.isAvailable ? 'opacity-40' : ''}`} style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                          <div className="flex-1 mb-4 sm:mb-0">
                            <div className="flex items-center space-x-3 mb-2"><span className="text-2xl">{getCategoryIcon(dish.category)}</span><h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{dish.name}</h3><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(dish.category)}`}>{dish.category}</span></div>
                            <p className="text-gray-600 mb-3 leading-relaxed">{dish.description || "Aucune description disponible"}</p>
                            <div className="flex items-center space-x-2"><span className="text-2xl font-bold text-green-600">{dish.price}</span><span className="text-sm text-gray-500 font-semibold">FCFA</span></div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-0 sm:ml-6">
                            <label htmlFor={`toggle-${dish._id}`} className="flex items-center cursor-pointer" title={dish.isAvailable ? 'Disponible' : 'Épuisé'}><div className="relative"><input type="checkbox" id={`toggle-${dish._id}`} className="sr-only" checked={dish.isAvailable} onChange={() => handleToggleAvailable(dish._id)} /><div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${dish.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div><div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div></div></label>
                            <button onClick={() => handleEdit(dish)} className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"><span>✏️</span><span>Modifier</span></button>
                            <button onClick={() => handleDelete(dish._id)} className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-500 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"><span>🗑️</span><span>Supprimer</span></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (<div className="text-center py-12"><div className="text-6xl mb-4">🍽️</div><p className="text-xl text-gray-500 font-semibold mb-2">Aucun plat dans le menu</p><p className="text-gray-400">Commencez par ajouter votre premier plat !</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{` @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out; }`}</style>
    </>
  );
}

export default withAuth(AdminPage);