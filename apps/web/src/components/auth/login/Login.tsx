"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PasswordInput } from "../../ui/password-input";
import { Icons } from "../../ui/icons";

export interface LoginWithEmailInput {
  email: string;
  password: string;
}

function LoginContent() {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logIn } = useAuth();

  useEffect(() => {
    if (!searchParams) return;
    
    const error = searchParams.get("error");
    if (error === "true") {
      setIsError(true);
      // Remove the error parameter from the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        { scroll: false }
      );
    }
  }, [searchParams, router]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || !email || !password) return;

    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      // Handle login directly with Firebase
      const userCredential = await logIn(email, password);
      
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Redirect to the callback endpoint with the ID token
      window.location.href = `/auth/callback?idToken=${idToken}`;
    } catch (error: any) {
      console.error("Login error:", error);
      setIsError(true);
      setErrorMessage(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* App Logo/Name */}
          <div className="text-center mb-8">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 font-sora text-3xl font-bold mb-2">
              <span className="italic font-bold">Pitch</span>
              <span className="font-medium">Perfect</span>
            </h1>
            <p className="text-slate-600 text-sm">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!showPasswordField && e.target.value.length > 0) {
                    setShowPasswordField(true);
                  }
                }}
                disabled={isLoading}
                className="mt-1 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showPasswordField ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  {errorMessage || "Failed to sign in. Please check your credentials and try again."}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 shadow-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
