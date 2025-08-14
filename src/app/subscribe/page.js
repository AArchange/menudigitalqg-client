"use client";

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SubscribePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('mensuel');
  const [kkiapayReady, setKkiapayReady] = useState(false); // NOUVEL ÉTAT
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState('');

  const plans = {
    mensuel: { name: 'Abonnement Mensuel', amount: 3000, duration: 30, description: 'par mois' },
    annuel: { name: 'Abonnement Annuel', amount: 30000, duration: 365, description: 'par an (Économisez 2 mois !)' },
  };

  const getAuthHeaders = () => { /* ... (identique) ... */ };
  const handlePaymentSuccess = async (response) => { /* ... (identique) ... */ };

  const openKkiapayWidget = () => {
    if (kkiapayReady && user) {
      window.kkiapay.open({
        amount: plans[selectedPlan].amount,
        key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX_ENABLED === 'true',
        email: user.email,
        callback: handlePaymentSuccess,
        onClose: () => setMessage(''),
      });
    } else {
      setMessage("Le service de paiement n'a pas pu charger. Veuillez rafraîchir la page.");
    }
  };

  if (loading || !user) { /* ... (identique) ... */ }
  
  return (
    <>
      <Script 
        src="https://cdn.kkiapay.me/k.js" 
        onReady={() => {
          // onLoad est parfois capricieux, onReady est plus fiable
          console.log('Script Kkiapay chargé !');
          setKkiapayReady(true);
        }}
        onError={(e) => {
          console.error('Erreur de chargement du script Kkiapay', e);
          setMessage('Impossible de charger le service de paiement.');
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          {/* ... (Header et sélecteur de plan identiques) ... */}
          
          <div className="mt-8">
            <button
              onClick={openKkiapayWidget}
              disabled={!kkiapayReady || paymentLoading} // On désactive si kkiapay n'est pas prêt
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-orange-400 hover:to-yellow-400 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {paymentLoading ? (
                <><div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div><span>Vérification...</span></>
              ) : !kkiapayReady ? (
                <span>Chargement du paiement...</span>
              ) : (
                <span>Payer avec Kkiapay</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}