"use client";

import { useEffect, useState } from "react";
import { redirect, RedirectType } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function SignupSuccess() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user && user.emailVerified) {
      return;
    }
    
    const startTime = Date.now();
    const checkDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
    const interval = 4000; // 4 seconds

    const checkEmailVerification = async () => {
      if (user) {
        // Reload the user to check if email has been verified
        await user.reload();
        
        if (user.emailVerified) {
          setIsChecking(false);
          return;
        }
      }
      
      if (Date.now() - startTime >= checkDuration) {
        setIsChecking(false);
      }
    };

    const intervalId = setInterval(checkEmailVerification, interval);

    // Initial check
    checkEmailVerification();

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (user && user.emailVerified) {
      redirect("/", RedirectType.push);
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Successfully Signed Up!</h1>
        <p className="text-gray-600 mb-4">
          Please check your email for a verification link. Once you verify your email,
          you will be redirected to Open Canvas.
        </p>
        <p className="text-sm text-gray-500">
          If you don&apos;t see the email, please check your spam folder.
        </p>
        {isChecking && (
          <p className="text-sm text-blue-500 mt-4">
            Waiting for email verification...
          </p>
        )}
      </div>
    </div>
  );
}
