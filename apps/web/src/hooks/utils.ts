"use client";

import { Client } from "@langchain/langgraph-sdk";

export const createClient = () => {
  // Dynamically determine API URL based on environment
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    // Auto-detect based on current window location (client-side only)
    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location;
      // Never use localhost in production
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        apiUrl = `${protocol}//${host}/api`;
      } else {
        // Production domain detected
        apiUrl = `${protocol}//${host}/api`;
      }
      console.log(`API URL determined: ${apiUrl} (from window.location: ${protocol}//${host})`);
    } else {
      // Server-side rendering fallback
      apiUrl = process.env.NODE_ENV === 'production' 
        ? "https://pitch.tgsplayground.com/api" 
        : "http://localhost:3000/api";
      console.log(`API URL determined (SSR): ${apiUrl} (NODE_ENV: ${process.env.NODE_ENV})`);
    }
  } else {
    console.log(`API URL from env var: ${apiUrl}`);
  }
  
  return new Client({
    apiUrl,
  });
};
