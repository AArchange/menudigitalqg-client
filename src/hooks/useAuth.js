"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Pour connaître la page actuelle

  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      setUser(userInfo);

      // --- NOUVELLE LOGIQUE D'ABONNEMENT ---
      const isSubscriptionActive = userInfo.subscriptionStatus === 'actif';
      const subscriptionExpires = userInfo.subscriptionExpiresAt ? new Date(userInfo.subscriptionExpiresAt) : null;
      const isExpired = subscriptionExpires && subscriptionExpires < new Date();

      // Si l'abonnement n'est pas actif OU a expiré,
      // et que l'utilisateur n'est PAS déjà sur la page d'abonnement...
      if ((!isSubscriptionActive || isExpired) && pathname !== '/subscribe') {
        router.replace('/subscribe'); // ...on le redirige !
      }
    } else {
      // Si pas d'infos utilisateur et qu'on n'est ni sur login ni register
      if (pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      }
    }
    setLoading(false);
  }, [router, pathname]); // pathname est une dépendance

  return { user, loading };
};

export default useAuth;