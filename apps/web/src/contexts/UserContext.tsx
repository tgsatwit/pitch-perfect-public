"use client";

// This is a compatibility layer for legacy code that uses UserContext
// It now delegates to the AuthContext which uses Firebase Auth

import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "./AuthContext";
import {
  createContext,
  ReactNode,
  useContext,
} from "react";

// Wrapper to keep API compatibility
type User = {
  id: string;
  email: string | null;
  email_verified: boolean;
  [key: string]: any;
};

type UserContentType = {
  getUser: () => Promise<User | undefined>;
  user: User | undefined;
  loading: boolean;
};

const UserContext = createContext<UserContentType | undefined>(undefined);

// Convert Firebase User to a format compatible with the old Supabase User
function convertFirebaseUser(firebaseUser: FirebaseUser | null): User | undefined {

  
  if (!firebaseUser) return undefined;
  
  const convertedUser = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    email_verified: firebaseUser.emailVerified,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
  
  
  return convertedUser;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, loading } = useAuth();
  
  
  const user = convertFirebaseUser(firebaseUser);
  
  async function getUser() {
    // This just returns the current user, as Firebase Auth already handles
    // the session management via the AuthContext
    return user;
  }

  const contextValue: UserContentType = {
    getUser,
    user,
    loading,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
