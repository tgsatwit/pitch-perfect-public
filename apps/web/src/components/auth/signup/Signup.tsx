import { useEffect, useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import Link from "next/link";
import { buttonVariants } from "../../ui/button";
import { UserAuthForm } from "./user-auth-form-signup";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

export interface SignupWithEmailInput {
  email: string;
  password: string;
}

function SignupContent() {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "true") {
      setIsError(true);
      // Remove the error parameter from the URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("error");
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        { scroll: false }
      );
    }
  }, [searchParams, router]);

  const onSignupWithEmail = async (
    input: SignupWithEmailInput
  ): Promise<void> => {
    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      // Ensure email and password are defined
      if (!input.email || !input.password) {
        throw new Error("Email and password are required");
      }
      
      // Handle signup directly with Firebase instead of using server action
      const userCredential = await signUp(input.email, input.password);
      
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Redirect to the callback endpoint with the ID token
      window.location.href = `/auth/callback?idToken=${idToken}`;
    } catch (error: any) {
      console.error("Signup error:", error);
      setIsError(true);
      setErrorMessage(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupWithOauth = async (
    provider: "google" | "github"
  ): Promise<void> => {
    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      let userCredential;
      if (provider === "google") {
        userCredential = await signInWithGoogle();
      } else {
        userCredential = await signInWithGithub();
      }
      
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Redirect to the callback endpoint with the ID token
      window.location.href = `/auth/callback?idToken=${idToken}`;
    } catch (error: any) {
      console.error("OAuth authentication error:", error);
      setIsError(true);
      setErrorMessage(`Failed to sign up with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/auth/login"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute md:flex hidden right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex gap-1 items-center text-lg font-medium">
          <NextImage
            src="/lc_logo.jpg"
            width={36}
            height={36}
            alt="LangChain Logo"
            className="rounded-full"
          />
          Open Canvas
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "md:hidden flex"
              )}
            >
              Login
            </Link>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <UserAuthForm
            onSignupWithEmail={onSignupWithEmail}
            onSignupWithOauth={onSignupWithOauth}
            isLoading={isLoading}
          />
          {isError && (
            <p className="text-red-500 text-sm text-center">
              {errorMessage || "There was an error creating your account. Please try again."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
