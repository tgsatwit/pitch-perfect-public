"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useVerifyAuth(redirectTo = '/auth/login') {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if we have a user from the client-side context
        if (user) {
          setVerified(true);
          setLoading(false);
          return;
        }

        // If not, check with the server
        const response = await fetch('/api/auth/verify');
        const data = await response.json();

        if (data.valid) {
          setVerified(true);
        } else {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [user, router, redirectTo]);

  return { verified, loading };
} 