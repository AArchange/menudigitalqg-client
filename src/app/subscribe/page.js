"use client";

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SubscribePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('mensuel');
  const [kkiapayReady, setKkiapayReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. UTILISATION DE VOTRE STRUCTURE DE PLANS ORIGINALE (elle est correcte)
  const plans = {
    mensuel: { name: 'Abonnement Mensuel', amount: 3000, description: 'par mois' },
    annuel: { name: 'Abonnement Annuel', amount: 30000, description: 'par an (Économisez 2 mois !)' },
  };

  // 2. LOGIQUE DE CHARGEMENT DU SCRIPT ROBUSTE (comme nous l'avions debuggé)
 useEffect(() => {
    // Le script est maintenant chargé par layout.js.
    // Nous avons juste besoin de vérifier périodiquement quand il est prêt.
    const checkKkiapayReady = setInterval(() => {
      if (typeof window.kkiapay === 'function') {
        console.log('🎉 Kkiapay est prêt ! (chargé via le layout)');
        setKkiapayReady(true);
        clearInterval(checkKkiapayReady); // On arrête de vérifier une fois que c'est bon
      }
    }, 100); // On vérifie toutes les 100ms

    // Sécurité : si ça ne marche pas après 10s, on abandonne
    const timeout = setTimeout(() => {
        clearInterval(checkKkiapayReady);
        if (!kkiapayReady) { // Vérifier si kkiapayReady est toujours false
             setMessage("Le service de paiement n'a pas pu démarrer. Veuillez rafraîchir.");
        }
    }, 10000);

    // Fonction de nettoyage pour éviter les fuites de mémoire
    return () => {
        clearInterval(checkKkiapayReady);
        clearTimeout(timeout);
    };
  }, [kkiapayReady]); // On ajoute kkiapayReady ici pour stopper le timeout si l'état change

  // 3. VOS FONCTIONS DE PAIEMENT ORIGINALES (elles sont correctes)
  const getAuthHeaders = () => {
    const userInfoString = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (!userInfoString) { 
      router.push('/login'); 
      return {}; 
    }
    const userInfo = JSON.parse(userInfoString);
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` };
  };

  const handlePaymentSuccess = async (response) => {
    setPaymentLoading(true);
    setMessage('Vérification du paiement en cours...');
    try {
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactionId: response.transactionId, planKey: selectedPlan }),
      });
      const data = await verifyResponse.json();
      if (verifyResponse.ok) {
        alert('Abonnement activé avec succès ! Vous allez être redirigé.');
        const updatedUserInfo = { ...JSON.parse(localStorage.getItem('userInfo')), ...data.user };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        router.push('/admin');
      } else { 
        throw new Error(data.message || 'La vérification du paiement a échoué.'); 
      }
    } catch (error) { 
      setMessage(`❌ Erreur: ${error.message}`); 
    } 
    finally { 
      setPaymentLoading(false); 
    }
  };
  
  const openKkiapayWidget = () => {
    if (kkiapayReady && user && typeof window.kkiapay === 'function') {
      setPaymentLoading(true);
      setMessage('');
      window.kkiapay.open({
        amount: plans[selectedPlan].amount,
        key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY, // Utilisation de la variable d'environnement
        sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX_ENABLED === 'true',
        email: user.email,
        callback: handlePaymentSuccess, // LA MÉTHODE CORRECTE pour les SPA
        onClose: () => { 
          setMessage(''); 
          setPaymentLoading(false); 
        }
      });
    } else {
      setMessage("Le service de paiement n'est pas prêt. Veuillez patienter ou rafraîchir.");
    }
  };

  if (loading || !user) {
    return ( <div className="min-h-screen flex items-center justify-center">Chargement...</div> );
  }

  // 4. L'INTERFACE UTILISATEUR AMÉLIORÉE (inspirée du code de Claude)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Retour au Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Passez au niveau supérieur
          </h1>
          <p className="text-gray-600">
            Choisissez un plan pour débloquer toutes les fonctionnalités.
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
          <button
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${selectedPlan === 'mensuel' ? 'bg-indigo-600 text-white shadow' : 'text-gray-700'}`}
            onClick={() => setSelectedPlan('mensuel')}>
            Mensuel
          </button>
          <button
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${selectedPlan === 'annuel' ? 'bg-indigo-600 text-white shadow' : 'text-gray-700'}`}
            onClick={() => setSelectedPlan('annuel')}>
            Annuel
          </button>
        </div>

        <div className="border-2 border-indigo-500 rounded-lg p-6 mb-6 text-center">
          <h3 className="text-xl font-semibold mb-4">{plans[selectedPlan].name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-indigo-600">{plans[selectedPlan].amount.toLocaleString()}</span>
            <span className="text-gray-600 ml-2">FCFA</span>
          </div>
          <p className="text-gray-600">{plans[selectedPlan].description}</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('❌') || message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {message}
          </div>
        )}
        
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${kkiapayReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${kkiapayReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            {kkiapayReady ? 'Service de paiement prêt' : 'Chargement du paiement...'}
          </div>
        </div>

        <button
          onClick={openKkiapayWidget}
          disabled={!kkiapayReady || paymentLoading}
          className="w-full py-3 px-6 rounded-lg font-semibold transition-all text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
          {paymentLoading ? 'Traitement...' : `Payer avec Kkiapay`}
        </button>
      </div>
    </div>
  );
}