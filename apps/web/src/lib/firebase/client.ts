"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBU3Xp5s5qN7Yye7BlSsr7uQXzTAj3Pixc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pitch-perfect-ai-25.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pitch-perfect-ai-25",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pitch-perfect-ai-25.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "61410776637",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:61410776637:web:fe90c8d5990294fbfd7c54"
};

// Initialize Firebase
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);

// Helper function to get the current user
export const getCurrentUser = () => {
  return auth.currentUser;
}; 