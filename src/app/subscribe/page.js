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

  // === VERSION AMÉLIORÉE ET ROBUSTE POUR CHARGER LE SCRIPT KKIAPAY ===
  useEffect(() => {
    // Si la fonction kkiapay existe déjà (navigation rapide entre pages), on ne refait rien.
    if (typeof window.kkiapay === 'function') {
        console.log('✅ Kkiapay est déjà initialisé.');
        setKkiapayReady(true);
        return;
    }

    // Sécurité: Si un script Kkiapay est déjà en train de charger, on ne l'ajoute pas une deuxième fois.
    if (document.getElementById('kkiapay-script')) {
        console.log('⏳ Le script Kkiapay est déjà en cours de chargement.');
        return;
    }

    // --- Approche moderne avec les événements `onload` et `onerror` ---
    
    // 1. Création de l'élément script
    const script = document.createElement('script');
    script.id = 'kkiapay-script';
    script.src = "https://cdn.kkiapay.me/k.js";
    script.async = true;

    // 2. Gestionnaire de succès (le script est chargé)
    const handleLoad = () => {
        clearTimeout(timeoutId); // Annuler le timeout de sécurité
        if (typeof window.kkiapay === 'function') {
            console.log('🎉 Kkiapay est prêt ! (via onload)');
            setKkiapayReady(true);
        } else {
            console.error('❌ Le script Kkiapay a été chargé mais `window.kkiapay` est introuvable.');
            setMessage('Une erreur inattendue est survenue avec le service de paiement.');
        }
    };

    // 3. Gestionnaire d'échec (le script n'a pas pu charger : réseau, bloqueur de pub...)
    const handleError = () => {
        clearTimeout(timeoutId); // Annuler le timeout de sécurité
        console.error('❌ Échec du chargement du script Kkiapay (via onerror).');
        setMessage('Impossible de charger le service de paiement. Vérifiez votre connexion internet et désactivez les bloqueurs de scripts.');
    };

    // 4. Timer de sécurité (au cas où ni 'load' ni 'error' ne se déclencheraient)
    const timeoutId = setTimeout(() => {
        // Nettoyer les listeners pour éviter qu'ils se déclenchent après le timeout
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
        console.error('❌ Timeout : Le script Kkiapay n\'a pas répondu après 10 secondes.');
        setMessage('Erreur critique du service de paiement. Veuillez rafraîchir la page.');
    }, 10000);

    // 5. Attacher les gestionnaires d'événements AU SCRIPT
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // 6. Ajouter le script à la page pour démarrer le chargement
    document.body.appendChild(script);

    // 7. Fonction de nettoyage (très importante pour éviter les fuites de mémoire)
    // S'exécute quand le composant est "démonté" (changement de page)
    return () => {
        console.log('Nettoyage du useEffect pour Kkiapay.');
        clearTimeout(timeoutId);
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
    };
  }, []); // Le tableau vide [] est crucial, on ne lance ça qu'une seule fois au montage du composant.
  // =====================================================================

  const plans = {
    mensuel: { name: 'Abonnement Mensuel', amount: 3000, duration: 30, description: 'par mois' },
    annuel: { name: 'Abonnement Annuel', amount: 30000, duration: 365, description: 'par an (Économisez 2 mois !)' },
  };

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
        key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX_ENABLED === 'true',
        email: user.email,
        callback: handlePaymentSuccess,
        onClose: () => { 
          setMessage(''); 
          setPaymentLoading(false); 
        }
      });
    } else {
      setMessage("Le service de paiement n'est pas prêt. Veuillez patienter ou rafraîchir.");
      console.error("Tentative d'ouverture du widget Kkiapay alors qu'il n'est pas prêt. State:", { kkiapayReady, userExists: !!user });
    }
  };

  if (loading || !user) {
    return ( <div className="min-h-screen flex items-center justify-center">Chargement...</div> );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 font-semibold mb-6 block">&larr; Retour au Dashboard</Link>
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Passez au niveau supérieur</h1>
          <p className="text-center text-gray-600 mb-8">Choisissez un plan pour débloquer toutes les fonctionnalités.</p>
          <div className="flex justify-center mb-8 bg-gray-100 rounded-full p-1">
            <button onClick={() => setSelectedPlan('mensuel')} className={`w-1/2 py-2 font-semibold rounded-full transition-all duration-300 ${selectedPlan === 'mensuel' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600'}`}>Mensuel</button>
            <button onClick={() => setSelectedPlan('annuel')} className={`w-1/2 py-2 font-semibold rounded-full transition-all duration-300 ${selectedPlan === 'annuel' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600'}`}>Annuel</button>
          </div>
          <div className="border-2 border-indigo-600 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-gray-800">{plans[selectedPlan].name}</h2>
            <p className="text-5xl font-extrabold text-indigo-600 my-4">{plans[selectedPlan].amount} <span className="text-xl font-medium text-gray-700">FCFA</span></p>
            <p className="text-gray-500">{plans[selectedPlan].description}</p>
          </div>
          {message && <p className={`mt-6 text-center font-semibold ${message.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>{message}</p>}
          <div className="mt-8">
            <button
              onClick={openKkiapayWidget}
              disabled={!kkiapayReady || paymentLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-orange-400 hover:to-yellow-400 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {paymentLoading ? ( <><div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div><span>Vérification...</span></>
              ) : !kkiapayReady ? ( <span>Chargement du paiement...</span>
              ) : ( <span>Payer avec Kkiapay</span> )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}