"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { logOut } = useAuth();
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    async function signOut() {
      try {
        // Sign out from Firebase client
        await logOut();
        
        // Call the server action to clear the session cookie
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to sign out');
        }
        
        router.push("/auth/login");
      } catch (error) {
        console.error('Sign out error:', error);
        setErrorOccurred(true);
      }
    }
    signOut();
  }, [logOut, router]);

  return (
    <>
      {errorOccurred ? (
        <div>
          <h1>Sign out error</h1>
          <p>
            There was an error signing out. Please refresh the page to try
            again.
          </p>
        </div>
      ) : (
        <p>Signing out...</p>
      )}
    </>
  );
}
