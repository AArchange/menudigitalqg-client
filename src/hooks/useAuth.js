// client/src/hooks/useAuth.js
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      router.replace('/login');
    }
    setLoading(false);
  }, [router]);

  return { user, loading };
};

export default useAuth;